import React, { useState } from 'react';
import { X, Calendar, Clock, Video, FileText } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const ScheduleModal = ({ isOpen, onClose, request, senderName }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    meetingLink: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(startTime.getTime() + parseInt(formData.duration) * 60000);

      const requestRef = doc(db, 'requests', request.id);
      await updateDoc(requestRef, {
        schedule: {
          title: `SkillSwap: ${request.skillWanted} with ${senderName}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          meetingLink: formData.meetingLink,
          description: formData.description,
          status: 'scheduled'
        }
      });

      alert('Class scheduled successfully!');
      onClose();
    } catch (err) {
      console.error("Error scheduling class:", err);
      alert('Failed to schedule class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
          <X size={24} />
        </button>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={24} color="var(--color-primary)" /> Schedule Class session
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          Setting up a session for <strong>{request.skillWanted}</strong> with <strong>{senderName}</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label flex items-center gap-1"><Calendar size={14} /> Date</label>
              <input 
                type="date" 
                className="input-field" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label flex items-center gap-1"><Clock size={14} /> Time</label>
              <input 
                type="time" 
                className="input-field" 
                required 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label className="input-label">Duration (minutes)</label>
            <select 
              className="input-field"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label className="input-label flex items-center gap-1"><Video size={14} /> Zoho Meeting / Online Link</label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://meeting.zoho.com/..." 
              value={formData.meetingLink}
              onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label flex items-center gap-1"><FileText size={14} /> Notes for Student</label>
            <textarea 
              className="input-field" 
              rows="3" 
              placeholder="What should the student prepare?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
            {loading ? 'Scheduling...' : 'Confirm Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
