import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';

const VerificationBanner = () => {
  const { currentUser, emailVerified, reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!currentUser || emailVerified) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendEmailVerification(currentUser);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#fffbeb', 
      borderBottom: '1px solid #fef3c7', 
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      fontSize: '0.9rem',
      color: '#92400e'
    }}>
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} />
        <span>Your email is not verified. Please check your inbox.</span>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={handleResend} 
          disabled={loading || sent}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#b45309', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5',
            textDecoration: 'underline'
          }}
        >
          {sent ? <span className="flex items-center gap-1"><CheckCircle size={14} /> Sent!</span> : (loading ? 'Sending...' : 'Resend Email')}
        </button>
        <button 
          onClick={reloadUser}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#b45309', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5',
            textDecoration: 'underline'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> I've verified
        </button>
      </div>
    </div>
  );
};

export default VerificationBanner;
