import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Eye, EyeOff, Wallet, TrendingUp, ShieldCheck, PieChart, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const { login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await login(email, password);
      toast.success('Welcome back! Login successful. 👋');
      navigate('/dashboard');
    } catch (error) {
      setErr(error.message);
      toast.error(error.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      background: 'var(--bg-dark)',
      color: 'var(--text-primary)',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Left Branding / Fintech Visual Column */}
      <motion.div 
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          flex: 1.1,
          background: 'linear-gradient(135deg, #090e1c 0%, #0f172a 100%)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="mobile-hide"
      >
        {/* Subtle grid pattern & glow backgrounds */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.4,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        {/* Branding Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px var(--primary-glow)'
          }}>
            <Wallet size={20} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
            SmartExpense
          </span>
        </div>

        {/* Floating Interactive Visual Showcase Card */}
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '40px', margin: '40px 0' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '16px' }}>
              <Sparkles size={12} />
              <span>PREMIUM FINANCE PLATFORM</span>
            </div>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', letterSpacing: '-0.04em', marginBottom: '16px' }}>
              Take absolute control of your capital.
            </h1>
            <p style={{ fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A unified operating system to track allocations, establish dynamic budgets, and monitor savings goals with precision.
            </p>
          </div>

          {/* Glowing Mockup Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
              maxWidth: '380px'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NET BALANCE</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 14px' }}>$42,850.00</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>INCOME</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>+$8,400.00</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SPENT</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--danger)' }}>-$3,150.00</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Info */}
        <div style={{ zIndex: 2, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>© 2026 SmartExpense Inc.</span>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border-color-light)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> SECURE JWT ENGINE</span>
        </div>
      </motion.div>

      {/* Right Login Form Column */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Enter your credentials to access your financial desk
            </p>
          </div>

          {err && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                padding: '12px 16px', 
                borderRadius: 'var(--border-radius-sm)', 
                background: 'var(--danger-light)', 
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: 'var(--danger)', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                marginBottom: '20px' 
              }}
            >
              {err}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  style={{ paddingRight: '42px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: 'var(--border-radius-sm)', fontWeight: 700 }} 
              disabled={loading}
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            New to SmartExpense?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
