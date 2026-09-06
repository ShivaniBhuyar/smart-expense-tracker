import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User as UserIcon, Menu, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-header)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Left side: Hamburger collapse toggler */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar} 
          style={{ 
            background: 'var(--bg-darker)', 
            border: '1px solid var(--border-color)', 
            color: 'var(--text-primary)', 
            cursor: 'pointer', 
            display: 'flex',
            alignItems: 'center',
            padding: 8,
            borderRadius: 'var(--border-radius-sm)',
            transition: 'var(--transition)'
          }}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </motion.button>
      </div>

      {/* Right side: theme toggle, notification bell, profile dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        
        {/* Modern Theme Switcher Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-darker)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 'var(--border-radius-sm)',
            transition: 'var(--transition)'
          }}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun size={18} color="var(--warning)" />
          ) : (
            <Moon size={18} color="var(--primary)" />
          )}
        </motion.button>

        {/* Notification Bell Icon */}
        <div style={{ position: 'relative' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              background: 'var(--bg-darker)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              display: 'flex',
              padding: 8,
              borderRadius: 'var(--border-radius-sm)',
              position: 'relative' 
            }}
            title="Notifications"
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--primary)',
              borderRadius: '50%',
              boxShadow: '0 0 10px var(--primary)'
            }} />
          </motion.button>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

        {/* User Profile Menu Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--border-radius-sm)',
              transition: 'var(--transition)'
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #a5b4fc 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px var(--primary-glow)',
              border: '2px solid var(--bg-card)'
            }}>
              {getInitials(user?.fullName)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="mobile-hide">
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {user?.fullName || 'User'}
              </span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                {user?.email}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '230px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color-light)',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.fullName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)' }}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
