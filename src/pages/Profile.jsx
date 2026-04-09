import React, { useState, useEffect } from 'react';
import { User, Settings, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const Profile = () => {
  const { currentUser, userData: contextUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    availability: 'Flexible',
    skillsOffered: [],
    skillsWanted: []
  });

  useEffect(() => {
    if (contextUserData) {
      setProfileData(contextUserData);
    }
  }, [contextUserData]);

  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      if (!currentUser) throw new Error('No user logged in');
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: profileData.name,
        bio: profileData.bio,
        availability: profileData.availability,
        skillsOffered: profileData.skillsOffered,
        skillsWanted: profileData.skillsWanted
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (type) => {
    if (type === 'offered' && newSkillOffered.trim()) {
      if (!profileData.skillsOffered.includes(newSkillOffered.trim())) {
        setProfileData({
          ...profileData,
          skillsOffered: [...profileData.skillsOffered, newSkillOffered.trim()]
        });
      }
      setNewSkillOffered('');
    } else if (type === 'wanted' && newSkillWanted.trim()) {
      if (!profileData.skillsWanted.includes(newSkillWanted.trim())) {
        setProfileData({
          ...profileData,
          skillsWanted: [...profileData.skillsWanted, newSkillWanted.trim()]
        });
      }
      setNewSkillWanted('');
    }
  };

  const removeSkill = (type, skillToRemove) => {
    if (type === 'offered') {
      setProfileData({
        ...profileData,
        skillsOffered: profileData.skillsOffered.filter(skill => skill !== skillToRemove)
      });
    } else {
      setProfileData({
        ...profileData,
        skillsWanted: profileData.skillsWanted.filter(skill => skill !== skillToRemove)
      });
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>My Profile</h2>
        {!isEditing ? (
          <button className="btn btn-outline flex items-center gap-2" onClick={() => setIsEditing(true)}>
            <Settings size={18} /> Edit Profile
          </button>
        ) : (
          <button 
            className="btn btn-primary flex items-center gap-2" 
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-6" style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ 
            width: '6rem', height: '6rem', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--color-bg-start)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)', border: '2px solid var(--color-primary)'
          }}>
            <User size={48} />
          </div>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                />
              </div>
            ) : (
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{profileData.name}</h3>
            )}
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{profileData.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            
            {/* Bio & Availability */}
            <div>
              <div className="input-group">
                <label className="input-label">Bio</label>
                {isEditing ? (
                  <textarea 
                    className="input-field" 
                    rows="4"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  />
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)' }}>{profileData.bio}</p>
                )}
              </div>
              <div className="input-group mt-4">
                <label className="input-label">Availability</label>
                {isEditing ? (
                  <select 
                    className="input-field"
                    value={profileData.availability}
                    onChange={(e) => setProfileData({...profileData, availability: e.target.value})}
                  >
                    <option value="Weekends">Weekends</option>
                    <option value="Evenings">Evenings</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                ) : (
                  <span className="badge badge-gray">{profileData.availability}</span>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="input-group">
                <label className="input-label">Skills Offered</label>
                <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {profileData.skillsOffered.map(skill => (
                    <span key={skill} className="badge badge-purple flex items-center gap-1">
                      {skill}
                      {isEditing && (
                        <button type="button" onClick={() => removeSkill('offered', skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Add a skill you can teach..." 
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('offered'))}
                    />
                    <button type="button" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => addSkill('offered')}>Add</button>
                  </div>
                )}
              </div>

              <div className="input-group" style={{ marginTop: '1.5rem' }}>
                <label className="input-label">Skills Wanted</label>
                <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {profileData.skillsWanted.map(skill => (
                    <span key={skill} className="badge badge-blue flex items-center gap-1">
                      {skill}
                      {isEditing && (
                        <button type="button" onClick={() => removeSkill('wanted', skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}>
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Add a skill you want to learn..." 
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                      value={newSkillWanted}
                      onChange={(e) => setNewSkillWanted(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('wanted'))}
                    />
                    <button type="button" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => addSkill('wanted')}>Add</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
