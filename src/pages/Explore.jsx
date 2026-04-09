import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import { MOCK_USERS } from '../data/users';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [realUsers, setRealUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionMessage, setConnectionMessage] = useState(null);
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (currentUser && data.uid === currentUser.uid) return; // filter self
          users.push({ ...data, id: data.uid, isRealUser: true });
        });
        setRealUsers(users);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleConnect = async (user) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      // Check if a request already exists between these users in Firestore
      const q = query(
        collection(db, 'requests'), 
        where('senderId', '==', currentUser.uid),
        where('receiverId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setConnectionMessage(`You've already sent a request to ${user.name}!`);
      } else {
        // Create new request in Firestore
        await addDoc(collection(db, 'requests'), {
          senderId: currentUser.uid,
          senderName: userData?.name || currentUser.displayName || 'Unknown User',
          receiverId: user.uid,
          receiverName: user.name,
          skillWanted: user.skillsOffered?.[0] || 'Any skill',
          skillOffered: userData?.skillsOffered?.[0] || 'Any skill',
          status: 'pending',
          createdAt: serverTimestamp()
        });

        setConnectionMessage(`Connection request sent to ${user.name}!`);
      }
    } catch (err) {
      console.error("Error sending connection request:", err);
      setConnectionMessage("Failed to send request. Please try again.");
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
