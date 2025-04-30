async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      alert('Connected wallet: ' + walletAddress);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  } else {
    alert('MetaMask is not installed!');
  }
}

async function withdrawTokens(amount) {
  const minWithdrawal = 500;
  if (amount < minWithdrawal) {
    alert('Error: Minimum withdrawal amount is 500 tokens.');
    return;
  }
  // Perform withdrawal logic here (e.g., contract interaction)
  alert('Withdrawal successful!');
}
