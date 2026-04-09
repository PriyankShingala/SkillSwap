import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { handleConnect } from '../services/ChatService';

const ConnectButton = ({ currentUser, targetUser }) => {
  const navigate = useNavigate();

  const onClickConnect = async () => {
    try {
      // Execute handshake logic
      const conversation = await handleConnect(currentUser, targetUser);
      
      // Navigate the user to the Chat Interface
      if (conversation && conversation.id) {
        navigate(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <button 
      onClick={onClickConnect}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all shadow-md hover:shadow-lg active:scale-95"
    >
      <UserPlus className="w-5 h-5" />
      <span>Connect</span>
    </button>
  );
};

export default ConnectButton;
