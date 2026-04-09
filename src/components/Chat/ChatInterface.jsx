import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Calendar, CheckCircle, Video, Plus, Smile, MessageSquare } from 'lucide-react';
import { getMessages, sendMessage, proposeMeeting, acceptMeeting } from '../../services/ChatService';

const ChatInterface = ({ currentUser, targetUser }) => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposedTime, setProposedTime] = useState('');

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const loadMessages = async () => {
    const msgs = await getMessages(conversationId);
    setMessages([...msgs]);
  };

  const handleSendMessage = async (e, forcedMessage = null) => {
    if (e) e.preventDefault();
    const content = forcedMessage || newMessage;
    if (!content.trim()) return;
    
    await sendMessage(conversationId, {
      senderId: currentUser.id,
      type: 'text',
      content: content
    });
    if (!forcedMessage) setNewMessage('');
    loadMessages();
  };

  const handleProposeMeeting = async () => {
    if (!proposedTime) return;
    await proposeMeeting(conversationId, currentUser.id, proposedTime);
    setShowProposeModal(false);
    setProposedTime('');
    loadMessages();
  };

  const handleAcceptMeeting = async (proposalId) => {
    const userEmails = [currentUser.email, targetUser.email]; 
    await acceptMeeting(conversationId, proposalId, userEmails, currentUser.id);
    loadMessages();
  };

  const handleSayHi = () => {
    handleSendMessage(null, "Hi there! I'd love to connect.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#0F172A', color: '#F8FAFC' }}>
      {/* Chat Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#A78BFA' }}>
              {targetUser?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3B82F6', border: '2px solid #0F172A' }}></div>
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.2rem 0' }}>{targetUser?.name || 'User'}</h2>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>Negotiate a skill exchange with {targetUser?.name || 'this user'}.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowProposeModal(!showProposeModal)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem', fontWeight: 500, color: '#fff', backgroundColor: '#8B5CF6', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8B5CF6'}
        >
          <Calendar size={16} />
          Propose Meet
        </button>
      </div>

      {/* Propose Modal Slider */}
      {showProposeModal && (
        <div style={{ padding: '1rem 2rem', backgroundColor: '#1E1B4B', borderBottom: '1px solid #2E1065', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="datetime-local" 
            value={proposedTime}
            onChange={(e) => setProposedTime(e.target.value)}
            style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #4C1D95', backgroundColor: '#0B1120', color: '#F8FAFC', outline: 'none' }}
          />
          <button 
            onClick={handleProposeMeeting}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#8B5CF6', color: '#fff', borderRadius: '0.5rem', border: 'none', fontWeight: 500, cursor: 'pointer' }}
          >
            Send Proposal
          </button>
        </div>
      )}

      {/* Chat Messages Body */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', backgroundColor: '#1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', marginBottom: '1.5rem' }}>
              <MessageSquare size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#F8FAFC' }}>No messages yet.</h3>
            <p style={{ color: '#94A3B8', maxWidth: '400px', margin: '0 0 2rem 0', lineHeight: 1.5 }}>
              Start the conversation with {targetUser?.name || 'this person'} to explore new skills and grow together.
            </p>
            <button 
              onClick={handleSayHi}
              style={{ padding: '0.75rem 2rem', backgroundColor: 'transparent', color: '#A78BFA', border: '1px solid #8B5CF6', borderRadius: '2rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.15)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1E1B4B'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Say hi!
            </button>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', maxWidth: '75%', alignSelf: isMe ? 'flex-end' : 'flex-start', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  padding: '1rem 1.2rem', 
                  borderRadius: '1rem', 
                  backgroundColor: isMe ? '#8B5CF6' : '#1E293B', 
                  color: '#F8FAFC',
                  borderBottomRightRadius: isMe ? '0.25rem' : '1rem',
                  borderBottomLeftRadius: isMe ? '1rem' : '0.25rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {msg.type === 'text' && (
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{msg.content}</p>
                  )}
                  {msg.type === 'proposal' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: isMe ? '#EAE5FF' : '#A78BFA' }}>
                        <Calendar size={16} />
                        <span>Proposed Meeting</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>{new Date(msg.timeSlot).toLocaleString()}</p>
                      
                      {msg.status === 'pending' && !isMe && (
                        <button 
                          onClick={() => handleAcceptMeeting(msg.id)}
                          style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', backgroundColor: '#10B981', color: '#fff', fontSize: '0.9rem', fontWeight: 500, borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>
                      )}
                      {msg.status === 'pending' && isMe && (
                        <p style={{ fontSize: '0.8rem', opacity: 0.8, fontStyle: 'italic', margin: '0.5rem 0 0 0' }}>Awaiting response...</p>
                      )}
                      {msg.status === 'accepted' && msg.meetLink && (
                        <div style={{ marginTop: '1rem' }}>
                          <a 
                            href={msg.meetLink} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600, borderRadius: '0.5rem', textDecoration: 'none', transition: 'all 0.2s', backgroundColor: isMe ? '#ffffff' : '#8B5CF6', color: isMe ? '#8B5CF6' : '#ffffff' }}
                          >
                            <Video size={16} />
                            Join SkillSwap Session
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem', margin: isMe ? '0.5rem 0.5rem 0 0' : '0.5rem 0 0 0.5rem' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #1E293B', backgroundColor: '#0B1120' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#1E293B', padding: '0.5rem 0.5rem 0.5rem 1rem', borderRadius: '3rem', border: '1px solid #334155' }}>
          <button type="button" style={{ background: 'none', border: 'none', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.25rem' }}>
            <Plus size={20} />
          </button>
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#F8FAFC', outline: 'none', padding: '0.5rem', fontSize: '0.95rem' }}
          />
          <button type="button" style={{ background: 'none', border: 'none', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.25rem' }}>
            <Smile size={20} />
          </button>
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: newMessage.trim() ? '#8B5CF6' : '#1E293B', color: newMessage.trim() ? '#fff' : '#64748B', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default', transition: 'background-color 0.2s', paddingRight: '2px' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
