import { addNotification } from './NotificationService';

// Persisted Local Mock Database Helpers
const getDb = (key, defaultVal) => JSON.parse(localStorage.getItem(key)) || defaultVal;
const setDb = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/**
 * Handshake Logic: Triggered when a user clicks 'Connect'.
 * Creates a new entry in the Conversations database table.
 */
export const handleConnect = async (currentUser, targetUser) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const conversations = getDb('chat_conversations', []);
  
  // Check if conversation already exists
  let existingConv = conversations.find(
    (c) => c.participants.includes(currentUser.id) && c.participants.includes(targetUser.id)
  );

  if (existingConv) {
    return existingConv;
  }

  // Create new conversation
  const newConversation = {
    id: `conv_${currentUser.id}_${targetUser.id}`,
    participants: [currentUser.id, targetUser.id],
    participantDetails: [currentUser, targetUser],
    createdAt: new Date().toISOString(),
  };

  conversations.push(newConversation);
  setDb('chat_conversations', conversations);

  const messages = getDb('chat_messages', {});
  messages[newConversation.id] = [];
  setDb('chat_messages', messages);

  return newConversation;
};

export const getMessages = async (conversationId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const messages = getDb('chat_messages', {});
  return messages[conversationId] || [];
};

export const sendMessage = async (conversationId, messageData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const messages = getDb('chat_messages', {});
  
  const newMessage = {
    id: `msg_${Date.now()}`,
    ...messageData,
    timestamp: new Date().toISOString(),
  };
  
  if (!messages[conversationId]) {
    messages[conversationId] = [];
  }
  messages[conversationId].push(newMessage);
  setDb('chat_messages', messages);
  
  // Emit Notification to the recipient
  const conversations = getDb('chat_conversations', []);
  const conv = conversations.find(c => c.id === conversationId);
  if (conv) {
    const recipientId = conv.participants.find(id => id !== messageData.senderId);
    const sender = conv.participantDetails.find(u => u.id === messageData.senderId);
    
    if (recipientId) {
      addNotification({
        recipientId,
        type: messageData.type === 'proposal' ? 'proposal' : 'message',
        content: messageData.type === 'proposal' ? 'proposed a meeting.' : 'sent you a message.',
        link: `/chat/${conversationId}`,
        senderName: sender?.name || 'Someone',
      });
    }
  }
  
  return newMessage;
};

export const proposeMeeting = async (conversationId, senderId, timeSlot) => {
  const proposalMsg = {
    senderId,
    type: 'proposal',
    content: `Proposed a meeting for ${timeSlot}`,
    timeSlot,
    status: 'pending' // pending, accepted, rejected
  };
  return await sendMessage(conversationId, proposalMsg);
};

export const acceptMeeting = async (conversationId, proposalId, userEmails, acceptorId) => {
  // In a real app, this would call the backend createMeeting API endpoint
  // e.g. await fetch('/api/meetings/create', { method: 'POST', body: JSON.stringify({ timeSlot, userEmails }) })
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const messages = getDb('chat_messages', {});
  const chatMsgs = messages[conversationId] || [];
  const proposal = chatMsgs.find(m => m.id === proposalId);
  
  if (proposal) {
    proposal.status = 'accepted';
    proposal.meetLink = `https://meet.google.com/mock-${Math.floor(Math.random() * 100000)}-link`;
    setDb('chat_messages', messages);
    
    // Emit Notification
    const conversations = getDb('chat_conversations', []);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv && acceptorId) {
      const recipientId = conv.participants.find(id => id !== acceptorId);
      const sender = conv.participantDetails.find(u => u.id === acceptorId);
      if (recipientId) {
        addNotification({
          recipientId,
          type: 'accepted',
          content: 'accepted your meeting proposal.',
          link: `/chat/${conversationId}`,
          senderName: sender?.name || 'Someone',
        });
      }
    }
  }
  
  return proposal;
};
