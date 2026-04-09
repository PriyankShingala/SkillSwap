import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import { MOCK_USERS } from '../data/users';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionMessage, setConnectionMessage] = useState(null);
  const navigate = useNavigate();

  // Get current logged-in user's id so we don't show them their own card
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Merge real registered users from localStorage with mock users
  const realUsers = JSON.parse(localStorage.getItem('users') || '[]')
    .filter(u => u.id !== currentUser.id)  // hide self
    .map(u => ({ ...u, isRealUser: true }));

  // Combine: real registered users first, then mocks (no duplicates by id)
  const realUserEmails = realUsers.map(u => u.email);
  const mockUsers = MOCK_USERS.filter(u => !realUserEmails.includes(u.email));
  const allUsers = [...realUsers, ...mockUsers];

  const filteredUsers = allUsers.filter(user => {
    const term = searchTerm.toLowerCase();
    const matchesName = user.name.toLowerCase().includes(term);
    const offeredSkills = user.skillsOffered || [];
    const wantedSkills = user.skillsWanted || [];
    const matchesOffered = offeredSkills.some(skill => skill.toLowerCase().includes(term));
    const matchesWanted = wantedSkills.some(skill => skill.toLowerCase().includes(term));
    return matchesName || matchesOffered || matchesWanted;
  });

  const handleConnect = (user) => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/login');
      return;
    }

    // Get existing requests
    const existingRequests = JSON.parse(localStorage.getItem('skillSwapRequests') || '[]');
    
    // Check if a request already exists between these users
    const alreadyConnected = existingRequests.some(
      req => req.senderId === currentUser.id && req.receiverId === user.id
    );

    if (alreadyConnected) {
      setConnectionMessage(`You've already sent a request to ${user.name}!`);
    } else {
      // Create new request
      const newRequest = {
        id: Date.now(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: user.id,
        skillWanted: user.skillsOffered[0] || 'Any skill', // Taking the first skill for this demo
        skillOffered: currentUser.skillsOffered[0] || 'Any skill',
        status: 'pending',
        time: 'Just now'
      };

      const updatedRequests = [...existingRequests, newRequest];
      localStorage.setItem('skillSwapRequests', JSON.stringify(updatedRequests));

      setConnectionMessage(`Connection request sent to ${user.name}!`);
    }

    setTimeout(() => setConnectionMessage(null), 3000);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Explore Skills</h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Find students who have the skills you want to learn, and who want to learn what you have to offer.
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
          <Search size={20} />
        </div>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Search for skills, topics, or people..." 
          style={{ paddingLeft: '3rem', paddingRight: '1rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {connectionMessage && (
        <div className="animate-fade-in" style={{ 
          backgroundColor: 'var(--color-success)', color: 'white', padding: '1rem', 
          borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          {connectionMessage}
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard key={user.id} user={user} onConnect={handleConnect} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
            No users found matching "{searchTerm}". Try another term!
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
