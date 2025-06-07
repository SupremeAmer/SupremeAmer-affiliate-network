// Node.js backend payout automation for SupremeAmer
require("dotenv").config();
const { Client, Databases } = require("node-appwrite");
const { ethers } = require("ethers");

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT = process.env.APPWRITE_PROJECT;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.DB_ID;
const TX_COLL = process.env.TX_COLL || "transaction_collection";

const ETH_RPC_URL = process.env.ETH_RPC_URL;
const ADMIN_PK = process.env.ADMIN_PK;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_API_KEY);
const databases = new Databases(client);

const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
const wallet = new ethers.Wallet(ADMIN_PK, provider);

async function processCashouts() {
  const txs = await databases.listDocuments(DB_ID, TX_COLL, []);
  for (const tx of txs.documents) {
    if (tx.type !== "cashout-request" || tx.status === "completed" || tx.status === "failed") continue;
    const amount = Math.abs(Number(tx.amount));
    const to = tx.wallet;
    try {
      let txHash;
      if (tx.description.includes("ETH")) {
        const ethTx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount.toString())
        });
        await ethTx.wait();
        txHash = ethTx.hash;
      } else {
        const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);
        const decimals = await contract.decimals();
        const saTx = await contract.transfer(to, ethers.parseUnits(amount.toString(), decimals));
        await saTx.wait();
        txHash = saTx.hash;
      }
      await databases.updateDocument(DB_ID, TX_COLL, tx.$id, {
        status: "completed",
        payoutTx: txHash
      });
      console.log(`Payout completed for ${tx.$id}, Tx: ${txHash}`);
    } catch (err) {
      await databases.updateDocument(DB_ID, TX_COLL, tx.$id, {
        status: "failed",
        error: err.message
      });
      console.log(`Payout failed for ${tx.$id}: ${err.message}`);
    }
  }
}
setInterval(processCashouts, 60 * 1000);
console.log("Admin payout automation started...");