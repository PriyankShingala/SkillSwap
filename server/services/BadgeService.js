/**
 * BadgeService.js
 * 
 * Logic for the Automated Badging System.
 * Can be triggered daily via a cron job (e.g., node-cron) or a background worker.
 */

const { getTransactions } = require('./CreditService');

/**
 * Helper Function: Get transactions within a specific date range.
 */
const filterTransactionsByDate = (transactions, startDate, endDate) => {
  return transactions.filter(t => {
    const date = new Date(t.timestamp);
    return date >= startDate && date < endDate;
  });
};

/**
 * Helper Function: Group transactions by user.
 */
const groupByUser = (transactions) => {
  return transactions.reduce((acc, txn) => {
    if (!acc[txn.userId]) acc[txn.userId] = [];
    acc[txn.userId].push(txn);
    return acc;
  }, {});
};

/**
 * checkBadgeEligibility
 * 
 * Analyzes the transaction history to determine who receives badges.
 * 
 * @param {Array} transactions - Provide transaction history (defaults to CreditService.getTransactions())
 * @returns {Object} An object mapping badge names to the winning user IDs or details.
 */
const checkBadgeEligibility = (transactions = getTransactions()) => {
  const now = new Date();
  
  // Calculate Time Periods
  const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  const thisWeekStart = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const lastWeekStart = new Date(thisWeekStart.getTime() - (7 * 24 * 60 * 60 * 1000));

  const results = {
    topDailyLearner: null,
    mostImproved: null,
    categoryMasters: [], // Users who got Category Master
  };

  // 1. Top Daily Learner (Spent the most credits in the last 24 hours)
  const dailyTransactions = filterTransactionsByDate(transactions, last24Hours, now);
  const spentLast24 = {};
  
  dailyTransactions.forEach(t => {
    if (t.type === 'Spend') {
      spentLast24[t.userId] = (spentLast24[t.userId] || 0) + t.amount;
    }
  });

  let maxSpent = 0;
  for (const [userId, spent] of Object.entries(spentLast24)) {
    if (spent > maxSpent) {
      maxSpent = spent;
      results.topDailyLearner = userId;
    }
  }

  // 2. Most Improved (Teaching credits earned this week > last week)
  const earnedThisWeek = {};
  const earnedLastWeek = {};

  const thisWeekTrans = filterTransactionsByDate(transactions, thisWeekStart, now);
  const lastWeekTrans = filterTransactionsByDate(transactions, lastWeekStart, thisWeekStart);

  thisWeekTrans.forEach(t => {
    if (t.type === 'Earn') earnedThisWeek[t.userId] = (earnedThisWeek[t.userId] || 0) + t.amount;
  });
  
  lastWeekTrans.forEach(t => {
    if (t.type === 'Earn') earnedLastWeek[t.userId] = (earnedLastWeek[t.userId] || 0) + t.amount;
  });

  let maxImprovement = 0;
  for (const userId of Object.keys(earnedThisWeek)) {
    const currentEarned = earnedThisWeek[userId];
    const pastEarned = earnedLastWeek[userId] || 0;
    const improvement = currentEarned - pastEarned;

    if (improvement > maxImprovement && improvement > 0) {
      maxImprovement = improvement;
      results.mostImproved = userId;
    }
  }

  // 3. Category Master (70% of earned credits come from teaching a specific category)
  // This evaluates lifetime transactions.
  const userTransactions = groupByUser(transactions);
  
  for (const [userId, userTxns] of Object.entries(userTransactions)) {
    let totalEarned = 0;
    const earnedByCategory = {};

    userTxns.forEach(t => {
      if (t.type === 'Earn') {
        totalEarned += t.amount;
        earnedByCategory[t.category] = (earnedByCategory[t.category] || 0) + t.amount;
      }
    });

    if (totalEarned > 0) {
      // Check if any category meets the 70% threshold
      for (const [category, amountEarned] of Object.entries(earnedByCategory)) {
        const percentage = (amountEarned / totalEarned) * 100;
        if (percentage >= 70) {
          results.categoryMasters.push({ userId, category });
          // Break once they earn a master badge (could support multiple if logic changes)
          break;
        }
      }
    }
  }

  // In a real application, you would now save these badges to the User's database record.
  // e.g., await db.User.update({ badges: ... })

  return results;
};

module.exports = {
  checkBadgeEligibility
};
