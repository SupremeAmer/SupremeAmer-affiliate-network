const { ethers } = require('ethers');

async function sendTokens(privateKey, toAddress, amount) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_PROVIDER);
  const wallet = new ethers.Wallet(privateKey, provider);

  const tx = {
    to: toAddress,
    value: ethers.utils.parseEther(amount.toString()),
  };

  try {
    const transaction = await wallet.sendTransaction(tx);
    return transaction.hash;
  } catch (error) {
    throw new Error('Transaction failed: ' + error.message);
  }
}
