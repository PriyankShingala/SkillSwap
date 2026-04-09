const getDb = () => JSON.parse(localStorage.getItem('app_notifications')) || [];
const setDb = (val) => localStorage.setItem('app_notifications', JSON.stringify(val));

/**
 * Get notifications for a specific user.
 */
export const getNotifications = (userId) => {
  const allNotifications = getDb();
  return allNotifications.filter(n => n.recipientId === userId).reverse();
};

/**
 * Add a new notification
 * @param {Object} data - { recipientId, type, content, link, senderName }
 */
export const addNotification = (data) => {
  const notifications = getDb();
  
  const newNotification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...data,
    isRead: false,
    timestamp: new Date().toISOString(),
  };

  notifications.push(newNotification);
  setDb(notifications);
  
  return newNotification;
};

/**
 * Mark a specific notification as read
 */
export const markAsRead = (notificationId) => {
  const notifications = getDb();
  const idx = notifications.findIndex(n => n.id === notificationId);
  if (idx !== -1) {
    notifications[idx].isRead = true;
    setDb(notifications);
  }
};

/**
 * Mark all notifications for a user as read
 */
export const markAllAsRead = (userId) => {
  const notifications = getDb();
  let changed = false;
  notifications.forEach(n => {
    if (n.recipientId === userId && !n.isRead) {
      n.isRead = true;
      changed = true;
    }
  });
  
  if (changed) {
    setDb(notifications);
  }
};
