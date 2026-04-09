import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, Calendar, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../services/NotificationService';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const fetchNotifications = () => {
    if (currentUser.id) {
      const notifs = getNotifications(currentUser.id);
      setNotifications(notifs);
    }
  };

  // Poll for notifications every 3 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
    setIsOpen(false);
    fetchNotifications();
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllAsRead(currentUser.id);
    fetchNotifications();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} className="text-blue-500" />;
      case 'proposal': return <Calendar size={16} className="text-purple-500" />;
      case 'accepted': return <CheckCircle size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          padding: '0.5rem',
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: '#EF4444',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="card"
          style={{
            position: 'absolute',
            top: '120%',
            right: 0,
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
            padding: 0,
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-start)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '0.75rem',
                    backgroundColor: notif.isRead ? 'transparent' : 'var(--color-bg-start)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ marginTop: '0.2rem' }}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                      <strong style={{ fontWeight: 600 }}>{notif.senderName}</strong> {notif.content}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', alignSelf: 'center' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
