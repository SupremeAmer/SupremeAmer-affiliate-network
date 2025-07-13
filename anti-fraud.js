/**
 * SupremeAmer Anti-Fraud Cloud Function for Appwrite
 * 
 * This Node.js function enforces:
 * - One account per IP/device (freezes or bans on multi-account)
 * - Handles ban/freeze/unban logic
 * - Can be used as a pre-registration or pre-login hook, or called manually
 * 
 * Environment variables required:
 * - APPWRITE_API_KEY (Appwrite API key with DB permissions)
 * - APPWRITE_PROJECT_ID
 * - DB_ID (Database ID)
 * - USERS_COLL (Users Collection ID)
 * - BAN_FINE_BNB (fine in BNB, e.g., 0.0004)
 * 
 * Trigger: HTTP (POST), expects { userId, ip, deviceId, action }
 *   action: "register", "login", "unban"
 */

const sdk = require("node-appwrite");

module.exports = async function (req, res) {
  // Config
  const {
    APPWRITE_API_KEY,
    APPWRITE_PROJECT_ID,
    DB_ID,
    USERS_COLL,
    BAN_FINE_BNB
  } = process.env;

  if (!APPWRITE_API_KEY || !APPWRITE_PROJECT_ID || !DB_ID || !USERS_COLL) {
    return res.json({ error: "Missing env vars" }, 500);
  }

  // Parse body
  let { userId, ip, deviceId, action, paidFine } = req.body;
  if (!userId || !ip || !deviceId || !action) {
    return res.json({ error: "Missing required params" }, 400);
  }

  const client = new sdk.Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const db = new sdk.Databases(client);

  // Helper: update user status
  async function updateUserStatus(uId, status, extra = {}) {
    return db.updateDocument(DB_ID, USERS_COLL, uId, { status, ...extra });
  }

  // Fetch all users from this IP or device
  let query = [
    sdk.Query.or([
      sdk.Query.equal('registrationIp', ip),
      sdk.Query.equal('lastLoginIp', ip),
      sdk.Query.equal('deviceId', deviceId)
    ])
  ];
  let users = await db.listDocuments(DB_ID, USERS_COLL, query);

  // Find main user
  let mainUser = users.documents.find(u => u.$id === userId);

  // Action: Register/Login (enforce anti-fraud)
  if (action === "register" || action === "login") {
    if (!mainUser) return res.json({ error: "User not found" }, 404);

    // If user already banned, deny
    if (mainUser.status === "banned") {
      return res.json({
        status: "banned",
        message: "Your account is banned due to multiple accounts from the same IP/device.",
        unbanFineBNB: BAN_FINE_BNB
      }, 403);
    }

    // If user is frozen
    if (mainUser.status === "frozen" && new Date(mainUser.frozenUntil) > new Date()) {
      return res.json({
        status: "frozen",
        message: "Your account is frozen for 24 hours due to multi-account. Try again later or pay fine to unban.",
        unbanFineBNB: BAN_FINE_BNB
      }, 403);
    }

    // Check if >1 active users on this IP/device
    let activeCount = users.documents.filter(u => ["active", undefined, null].includes(u.status)).length;
    if (activeCount > 1) {
      // Freeze all but oldest, ban newest
      let sorted = users.documents.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
      let oldest = sorted[0];
      for (let i = 1; i < sorted.length; ++i) {
        let u = sorted[i];
        if (u.$id === mainUser.$id) {
          await updateUserStatus(u.$id, "banned", { bannedReason: "Multi-account from same IP/device" });
        } else {
          await updateUserStatus(u.$id, "frozen", { frozenUntil: new Date(Date.now() + 24*60*60*1000).toISOString() });
        }
      }
      return res.json({
        status: "banned",
        message: "Account banned due to multiple accounts from same IP/device.",
        unbanFineBNB: BAN_FINE_BNB
      }, 403);
    }
    // If not banned/frozen, allow
    return res.json({ status: "active", message: "OK" }, 200);
  }

  // Action: Unban (user paid fine)
  if (action === "unban") {
    if (!mainUser) return res.json({ error: "User not found" }, 404);
    if (mainUser.status !== "banned" && mainUser.status !== "frozen") {
      return res.json({ status: "active", message: "Already active." }, 200);
    }
    // Check payment (in production, verify on-chain payment via BNB tx)
    if (!paidFine) {
      return res.json({ error: "Fine payment required" }, 402);
    }
    // Unban
    await updateUserStatus(mainUser.$id, "active", { frozenUntil: null, bannedReason: null });
    return res.json({ status: "active", message: "Account restored after fine." }, 200);
  }

  // Fallback
  res.json({ error: "Unknown action" }, 400);
};