import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Wallet } from 'lucide-react';

import LogoIcon from './Logo';
import NotificationDropdown from './NotificationDropdown';

import { getWallet } from '../services/EconomyService';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [balance, setBalance] = useState(0);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 🌙 Theme setup
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  // 💰 Wallet logic
  useEffect(() => {
    if (currentUser?.uid) {
      const wallet = getWallet(currentUser.uid);
      setBalance(wallet.balance);
    }

    const handleWalletUpdate = () => {
      if (currentUser?.uid) {
        const wallet = getWallet(currentUser.uid);
        setBalance(wallet.balance);
      }
    };

    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
  }, [currentUser?.uid]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container flex items-center justify-between" style={{ height: '70px' }}>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <LogoIcon isDark={isDarkMode} />
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>
              SkillSwap
            </h1>
            <p style={{ fontSize: '0.7rem', margin: 0, color: 'var(--color-text-secondary)' }}>
              Learn. Teach. Grow Together
            </p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '999px',
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth Section */}
          {currentUser ? (
            <div className="flex gap-4 items-center">
              
              {/* Wallet */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--color-bg-start)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--color-border)'
                }}
                title="SkillSwap Credits"
              >
                <Wallet size={16} color="#10B981" />
                <span style={{ fontWeight: 'bold' }}>{balance}</span>
              </div>

              <NotificationDropdown />

              <Link to="/profile" className="btn btn-outline">Profile</Link>
              <button className="btn btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;