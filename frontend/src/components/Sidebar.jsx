import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ArrowDownRight, ArrowUpRight, PieChart, Target, Tags, Wallet, X, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, isMobile, onCloseMobile }) {
  const { logout } = useAuth();
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/expenses', label: 'Expenses', icon: ArrowDownRight },
    { path: '/incomes', label: 'Incomes', icon: ArrowUpRight },
    { path: '/categories', label: 'Categories', icon: Tags },
    { path: '/budgets', label: 'Budgets', icon: PieChart },
    { path: '/savings-goals', label: 'Savings Goals', icon: Target },
  ];

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Header / Logo */}
      <div style={{ 
        padding: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px var(--primary-glow)'
          }}>
            <Wallet size={18} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            SmartExpense
          </span>
        </div>
        {isMobile && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onCloseMobile}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 4 }}
          >
            <X size={20} />
          </motion.button>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onCloseMobile : undefined}
              style={{ textDecoration: 'none', position: 'relative' }}
            >
              {({ isActive }) => (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 18px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'color 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'var(--primary-light)',
                        borderLeft: '4px solid var(--primary)',
                        borderRadius: 'var(--border-radius-sm)',
                        zIndex: -1
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)', transition: 'color 0.25s ease' }} />
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer Info with Profile Quick Access */}
      <div style={{ 
        padding: '20px 16px', 
        borderTop: '1px solid var(--border-color)', 
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 18px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', paddingLeft: '18px' }}>
          Smart Expense Tracker v1.0
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-overlay"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '260px',
                backgroundColor: 'var(--bg-sidebar)',
                zIndex: 90,
                borderRight: '1px solid var(--border-color)'
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside style={{
      width: isOpen ? '260px' : '0px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: isOpen ? '1px solid var(--border-color)' : 'none',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {sidebarContent}
    </aside>
  );
}
