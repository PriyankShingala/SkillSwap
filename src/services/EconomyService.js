const getDb = (key, defaultVal) => JSON.parse(localStorage.getItem(key)) || defaultVal;
const setDb = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const getWallet = (userId) => {
  const wallets = getDb('economy_wallets', []);
  let wallet = wallets.find(w => w.userId === userId);
  if (!wallet) {
    wallet = { userId, balance: 100 }; // Give new users 100 starting credits for testing
    wallets.push(wallet);
    setDb('economy_wallets', wallets);
  }
  return wallet;
};

export const updateBalance = (userId, role, amount, category) => {
  const wallets = getDb('economy_wallets', []);
  let wallet = wallets.find(w => w.userId === userId);
  
  if (!wallet) {
    wallet = { userId, balance: 100 };
    wallets.push(wallet);
  }

  if (role === 'Learner') {
    if (wallet.balance <= 0 || wallet.balance < amount) {
      throw new Error(`Insufficient credits: ${amount} required`);
    }
    wallet.balance -= amount;
  } else if (role === 'Teacher') {
    wallet.balance += amount;
  }

  const transactions = getDb('economy_transactions', []);
  const transactionLog = {
    transactionId: `txn_${Date.now()}`,
    userId,
    type: role === 'Learner' ? 'Spend' : 'Earn',
    amount,
    category: category || 'General',
    timestamp: new Date().toISOString()
  };
  
  transactions.push(transactionLog);
  
  setDb('economy_wallets', wallets);
  setDb('economy_transactions', transactions);
  
  // Dispatch a custom event so Navbar can update immediately
  window.dispatchEvent(new Event('walletUpdated'));
  return { wallet, transaction: transactionLog };
};
