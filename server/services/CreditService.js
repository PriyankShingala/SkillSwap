/**
 * Mock Database Tables
 * In a real production app, these would be replaced with MongoDB models or SQL tables (e.g., Prisma).
 */
let userWallets = [
  {
    userId: 'user_1',
    balance: 50,
  },
  {
    userId: 'user_2',
    balance: 10,
  }
];

let transactionHistory = [];

/**
 * updateBalance
 * Updates a user's credit balance and securely logs the transaction.
 * 
 * @param {string} userId - The ID of the user (e.g., 'user_1')
 * @param {string} role - 'Learner' or 'Teacher'
 * @param {number} amount - The absolute amount of credits to transfer (e.g., 10)
 * @param {string} category - The skill category (e.g., 'Python', 'UI Design')
 * @returns {object} The updated wallet and transaction record.
 */
const updateBalance = async (userId, role, amount, category) => {
  // 1. Fetch user wallet
  let wallet = userWallets.find(w => w.userId === userId);
  
  // If no wallet exists for this mock user, create a default one with 0 balance.
  if (!wallet) {
    wallet = { userId, balance: 0 };
    userWallets.push(wallet);
  }

  // 2. Validation: Prevent joining if balance is insufficient
  if (role === 'Learner') {
    if (wallet.balance <= 0 || wallet.balance < amount) {
      throw new Error(`Insufficient credits. You need ${amount} credits to join this learning session.`);
    }
  }

  // 3. Process Transaction
  let transactionType = '';
  
  if (role === 'Learner') {
    // Deduction
    wallet.balance -= amount;
    transactionType = 'Spend';
  } else if (role === 'Teacher') {
    // Earning
    wallet.balance += amount;
    transactionType = 'Earn';
  } else {
    throw new Error(`Invalid role: ${role}. Expected 'Learner' or 'Teacher'.`);
  }

  // 4. Log Transaction History
  const transactionLog = {
    transactionId: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: userId,
    type: transactionType,       // 'Earn' or 'Spend'
    amount: amount,
    category: category,          // e.g., 'UI Design'
    timestamp: new Date().toISOString()
  };

  transactionHistory.push(transactionLog);

  return {
    message: 'Transaction successful.',
    wallet: wallet,
    transaction: transactionLog
  };
};

/**
 * Helper function to retrieve all transactions.
 */
const getTransactions = () => {
  return transactionHistory;
};

/**
 * Helper function to retrieve a specific user's wallet.
 */
const getWallet = (userId) => {
  return userWallets.find(w => w.userId === userId) || { userId, balance: 0 };
};

module.exports = {
  updateBalance,
  getTransactions,
  getWallet,
  // exporting mock DB purely for testing purposes
  _db: { userWallets, transactionHistory }
};
