import React from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import ChatInterface from '../components/Chat/ChatInterface';
import { MessageSquare, Users, Repeat } from 'lucide-react';
import LogoIcon from '../components/Logo';

const ChatPage = () => {
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const targetUser = location.state?.targetUser;

  if (!currentUser.id) {
    return <Navigate to="/login" />;
  }

  if (!targetUser) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: '#fff', backgroundColor: '#0B1120', height: '100vh' }}>
        <h2>Chat Session Not Found</h2>
        <p>Could not load the user you are trying to chat with.</p>
        <Link to="/explore" style={{ color: '#A78BFA', marginTop: '1rem', display: 'inline-block' }}>Go back to Explore</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0B1120', color: '#F8FAFC', margin: 0, padding: 0, overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navigation Sidebar */}
      <aside style={{ width: '280px', borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1120' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', transform: 'scale(0.8)', transformOrigin: 'left center' }}>
            <LogoIcon isDark={true} />
          </div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, letterSpacing: '0.025em', marginLeft: '-0.5rem' }}>SkillSwap</h1>
        </div>
        
        <div style={{ padding: '1.5rem 1rem' }}>
          <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600, marginBottom: '1rem', paddingLeft: '0.5rem', letterSpacing: '0.05em' }}>The Luminescent Exchange</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: '#1E1B4B', color: '#A78BFA', fontWeight: 500, cursor: 'pointer' }}>
              <MessageSquare size={18} />
              <span>Messages</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: '#94A3B8', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}>
              <Users size={18} />
              <span>Mentors</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: '#94A3B8', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}>
              <Repeat size={18} />
              <span>Active Swaps</span>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A' }}>
        {/* Custom Header Top Navigation */}
        <header style={{ height: '70px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem', backgroundColor: '#0B1120' }}>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Home</Link>
            <Link to="/explore" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Explore</Link>
            <Link to="/profile" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Profile</Link>
            <Link to="/" onClick={() => localStorage.removeItem('isAuthenticated')} style={{ color: '#F8FAFC', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, padding: '0.4rem 1rem', borderRadius: '2rem', border: '1px solid #334155' }}>Logout</Link>
          </nav>
        </header>

        {/* Chat Interface Component */}
        <ChatInterface currentUser={currentUser} targetUser={targetUser} />
      </main>
    </div>
  );
};

export default ChatPage;
