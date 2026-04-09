import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import { MOCK_USERS } from '../data/users';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
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
  const [realUsers, setRealUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  // 🔥 Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const users = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          if (currentUser && data.uid === currentUser.uid) return;

          users.push({
            ...data,
            id: data.uid,
            isRealUser: true
          });
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

  // 🔥 Merge real + mock users
  const realEmails = realUsers.map(u => u.email);
  const mockUsers = MOCK_USERS.filter(u => !realEmails.includes(u.email));
  const allUsers = [...realUsers, ...mockUsers];

  // 🔍 Filter logic
  const filteredUsers = allUsers.filter(user => {
    const term = searchTerm.toLowerCase();

    const matchesName = user.name?.toLowerCase().includes(term);
    const offeredSkills = user.skillsOffered || [];
    const wantedSkills = user.skillsWanted || [];

    const matchesSearch =
      matchesName ||
      offeredSkills.some(s => s.toLowerCase().includes(term)) ||
      wantedSkills.some(s => s.toLowerCase().includes(term));

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some(cat => {
        const skills = CATEGORY_MAP[cat] || [];
        return (
          offeredSkills.some(s => skills.includes(s.toLowerCase())) ||
          wantedSkills.some(s => skills.includes(s.toLowerCase()))
        );
      });

    const matchesAvailability =
      selectedAvailabilities.length === 0 ||
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

  // 🔥 CONNECT LOGIC (final hybrid)
  const handleConnect = async (user) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setConnectionMessage(`Connecting you with ${user.name}...`);

    try {
      const q = query(
        collection(db, 'requests'),
        where('senderId', '==', currentUser.uid),
        where('receiverId', '==', user.id)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setConnectionMessage(`You've already sent a request to ${user.name}!`);
      } else {
        await addDoc(collection(db, 'requests'), {
          senderId: currentUser.uid,
          senderName: userData?.name || currentUser.displayName || 'Unknown',
          receiverId: user.id,
          receiverName: user.name,
          skillWanted: user.skillsOffered?.[0] || 'Any',
          skillOffered: userData?.skillsOffered?.[0] || 'Any',
          status: 'pending',
          createdAt: serverTimestamp()
        });

        // ⚡ instant chat (hackathon advantage)
        const convo = await createConversation(currentUser.uid, user.id);

        if (convo?.id) {
          navigate(`/chat/${convo.id}`, {
            state: { targetUser: user }
          });
        }

        setConnectionMessage(`Connected with ${user.name}!`);
      }
    } catch (err) {
      console.error(err);
      setConnectionMessage("Something went wrong.");
    }

    setTimeout(() => setConnectionMessage(null), 3000);
  };

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="container">
      {/* search + filters UI stays same */}

      {connectionMessage && <div>{connectionMessage}</div>}

      <div className="grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <UserCard key={user.id} user={user} onConnect={handleConnect} />
          ))
        ) : (
          <div>No users found</div>
        )}
      </div>
    </div>
  );
};

export default Explore;