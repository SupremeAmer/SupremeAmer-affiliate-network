const sdk = require("node-appwrite");

module.exports = async function (req, res) {
  // Parse JSON body
  let body;
  try {
    body = JSON.parse(req.bodyRaw || req.body || '{}');
  } catch (e) {
    return res.json({ error: "Invalid JSON" }, 400);
  }

  // Extract required fields
  const { userId, username, email, activityType, activityData } = body;

  // Validate required fields
  if (!userId || !username || !email || !activityType) {
    return res.json({ error: "Missing required fields" }, 400);
  }

  // Initialize Appwrite Server SDK for Functions
  const client = new sdk.Client();
  const databases = new sdk.Databases(client);

  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  try {
    // Write to user_activities collection
    const response = await databases.createDocument(
      "6836edf80037bce20a3e", // Your Database ID
      "user_activities",      // Your Collection ID (change if it's an actual ID string)
      "unique()",             // Auto-generated Document ID
      {
        userId,
        username,
        email,
        activityType,
        activityData: activityData || "",
        timestamp: new Date().toISOString(),
      }
    );
    return res.json({ success: true, document: response });
  } catch (err) {
    return res.json({ error: err.message }, 500);
  }
};
