import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageCircle } from 'lucide-react';
import { MOCK_USERS } from '../data/users';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Look up in real registered users first, then fall back to mock data
  const realUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const allUsers = [...realUsers, ...MOCK_USERS];
  const user = allUsers.find(u => String(u.id) === String(id));

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>User Not Found</h2>
        <Link to="/explore" className="btn btn-primary">Back to Explore</Link>
      </div>
    );
  }

  const handleConnect = () => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/login');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const existingRequests = JSON.parse(localStorage.getItem('skillSwapRequests') || '[]');
    
    const alreadyConnected = existingRequests.some(
      req => req.senderId === currentUser.id && req.receiverId === user.id
    );

    if (alreadyConnected) {
      alert(`You've already sent a request to ${user.name}!`);
    } else {
      const newRequest = {
        id: Date.now(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: user.id,
        skillWanted: user.skillsOffered[0] || 'Any skill',
        skillOffered: currentUser.skillsOffered[0] || 'Any skill',
        status: 'pending',
        time: 'Just now'
      };

      const updatedRequests = [...existingRequests, newRequest];
      localStorage.setItem('skillSwapRequests', JSON.stringify(updatedRequests));

      alert(`Connection request sent to ${user.name}!`);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/explore" className="flex items-center gap-2" style={{ color: 'var(--color-primary)', fontWeight: '500', display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Back to Explore
        </Link>
      </div>

      <div className="card">
        <div className="flex" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '2rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <div style={{ 
            width: '8rem', height: '8rem', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--color-bg-start)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)', border: '2px solid var(--color-primary)',
            fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem'
          }}>
            {user.name.charAt(0)}
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{user.name}</h2>
          <p className="flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            <Calendar size={16} /> Available: {user.availability}
          </p>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary flex items-center gap-2" onClick={handleConnect}>
               Connect
            </button>
            <button className="btn btn-outline flex items-center gap-2" onClick={() => alert(`Message feature coming soon.`)}>
              <MessageCircle size={18} /> Message
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>About Me</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {user.bio}
          </p>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Can Teach</h3>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {user.skillsOffered.map(skill => (
                  <span key={skill} className="badge badge-purple" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{skill}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Wants to Learn</h3>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {user.skillsWanted.map(skill => (
                  <span key={skill} className="badge badge-blue" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
