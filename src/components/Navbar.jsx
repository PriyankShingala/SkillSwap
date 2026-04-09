import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import LogoIcon from './Logo';
import NotificationDropdown from './NotificationDropdown';
import { getWallet, updateBalance } from '../services/EconomyService'; // Added for testing economy
import { Wallet } from 'lucide-react';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [balance, setBalance] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    if (currentUser.id) {
      const wallet = getWallet(currentUser.id);
      setBalance(wallet.balance);
    }
    
    const handleWalletUpdate = () => {
      if (currentUser.id) {
        const wallet = getWallet(currentUser.id);
        setBalance(wallet.balance);
      }
    };
    
    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
  }, [currentUser.id]);

  useEffect(() => {
    // Check initial state from document element
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

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
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LogoIcon isDark={isDarkMode} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>SkillSwap</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', margin: 0 }}>Learn. Teach. Grow Together</p>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Home</Link>
          <Link to="/explore" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Explore</Link>
          
          <button 
            onClick={toggleTheme} 
            className="flex items-center justify-center"
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-full)', 
              padding: '0.5rem', 
              cursor: 'pointer',
              color: 'var(--color-text-primary)'
            }}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {localStorage.getItem('isAuthenticated') === 'true' ? (
            <div className="flex gap-4 items-center">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-start)', padding: '0.4rem 0.8rem', borderRadius: '1rem', border: '1px solid var(--color-border)', cursor: 'pointer' }} title="SkillSwap Credits">
                <Wallet size={16} color="#10B981" />
                <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{balance}</span>
              </div>
              <NotificationDropdown />
              <Link to="/profile" className="btn btn-outline">Profile</Link>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  localStorage.removeItem('isAuthenticated');
                  localStorage.removeItem('currentUser');
                  window.location.href = '/';
                }}
              >
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
