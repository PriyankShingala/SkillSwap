import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import { MOCK_USERS } from '../data/users';
import { handleConnect as createConversation } from '../services/ChatService';

const CATEGORIES = ['Programming', 'Design', 'Music', 'Language', 'Marketing', 'Finance', 'Food', 'Fitness'];
const AVAILABILITIES = ['Mornings', 'Afternoons', 'Evenings', 'Weekdays', 'Weekends', 'Flexible'];

const CATEGORY_MAP = {
  Programming: ['react', 'javascript', 'node.js', 'python', 'machine learning', 'data analysis', 'sql', 'swift', 'react native'],
  Design: ['ui design', 'figma', 'sketch', 'ui/ux design', 'photoshop', 'lightroom', 'photography'],
  Music: ['guitar', 'music theory'],
  Language: ['hindi', 'english'],
  Marketing: ['digital marketing', 'seo', 'copywriting', 'marketing'],
  Finance: ['accounting', 'excel', 'personal finance'],
  Food: ['cooking', 'baking'],
  Fitness: ['yoga', 'fitness training', 'nutrition']
};

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
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
    
    // Search Term Match
    const matchesSearch = matchesName || 
      offeredSkills.some(skill => skill.toLowerCase().includes(term)) || 
      wantedSkills.some(skill => skill.toLowerCase().includes(term));

    // Category Filter Match
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => {
      const skillsInCat = CATEGORY_MAP[cat] || [];
      return offeredSkills.some(skill => skillsInCat.includes(skill.toLowerCase())) || 
             wantedSkills.some(skill => skillsInCat.includes(skill.toLowerCase()));
    });

    // Availability Filter Match
    const matchesAvailability = selectedAvailabilities.length === 0 || 
      (user.availability && selectedAvailabilities.includes(user.availability));

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleAvailability = (avail) => {
    setSelectedAvailabilities(prev => 
      prev.includes(avail) ? prev.filter(a => a !== avail) : [...prev, avail]
    );
  };

  const handleConnect = async (user) => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/login');
      return;
    }

    setConnectionMessage(`Connecting you with ${user.name}...`);
    
    try {
      const conversation = await createConversation(currentUser, user);
      if (conversation && conversation.id) {
        navigate(`/chat/${conversation.id}`, { state: { targetUser: user } });
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionMessage(`Failed to connect with ${user.name}.`);
      setTimeout(() => setConnectionMessage(null), 3000);
    }
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
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
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
          <button 
            className="btn btn-outline" 
            style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.5rem', flexShrink: 0 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} style={{ marginRight: '0.5rem' }} />
            Filters
            {(selectedCategories.length > 0 || selectedAvailabilities.length > 0) && (
              <span style={{ 
                background: 'var(--color-primary)', color: 'white', borderRadius: '50%', 
                width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', 
                justifyContent: 'center', fontSize: '0.75rem', marginLeft: '0.5rem',
                fontWeight: 'bold'
              }}>
                {selectedCategories.length + selectedAvailabilities.length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="card animate-fade-in" style={{ padding: '1.5rem', textAlign: 'left', marginTop: '0.5rem', position: 'absolute', width: '100%', zIndex: 50, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-text-primary)' }}>Search Filters</h3>
              {(selectedCategories.length > 0 || selectedAvailabilities.length > 0) && (
                <button 
                  onClick={() => { setSelectedCategories([]); setSelectedAvailabilities([]); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Reset all
                </button>
              )}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="input-label" style={{ marginBottom: '0.75rem' }}>Skill Categories</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`badge ${selectedCategories.includes(cat) ? 'badge-purple' : 'badge-gray'}`}
                    style={{ cursor: 'pointer', border: selectedCategories.includes(cat) ? '1px solid var(--color-secondary)' : '1px solid transparent', transition: 'all 0.2s' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="input-label" style={{ marginBottom: '0.75rem' }}>Time Availability</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {AVAILABILITIES.map(avail => (
                  <button
                    key={avail}
                    onClick={() => toggleAvailability(avail)}
                    className={`badge ${selectedAvailabilities.includes(avail) ? 'badge-blue' : 'badge-gray'}`}
                    style={{ cursor: 'pointer', border: selectedAvailabilities.includes(avail) ? '1px solid #3b82f6' : '1px solid transparent', transition: 'all 0.2s' }}
                  >
                    {avail}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
