import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, Eye, EyeOff, Wallet, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const { register, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'transparent', width: '0%' };
    if (pass.length < 6) return { label: 'Weak (min 6 chars)', color: 'var(--danger)', width: '33%' };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { label: 'Strong', color: 'var(--success)', width: '100%' };
    }
    return { label: 'Medium', color: 'var(--warning)', width: '66%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setErr(msg);
      toast.error(msg);
      return;
    }

    try {
      await register(fullName, email, password);
      toast.success('Registration successful! Welcome to SmartExpense. 🚀');
      navigate('/dashboard');
    } catch (error) {
      setErr(error.message);
      toast.error(error.message || 'Registration failed.');
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
      {/* Left Branding Column */}
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
          bottom: '20%',
          right: '20%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
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

        {/* Highlight content */}
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '40px', margin: '40px 0' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: '#6ee7b7', marginBottom: '16px' }}>
              <Sparkles size={12} />
              <span>SAVINGS & BUDGETS INTUITIVELY</span>
            </div>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', letterSpacing: '-0.04em', marginBottom: '16px' }}>
              Start building your financial freedom today.
            </h1>
            <p style={{ fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Join users tracking, budgeting, and locking target savings milestones in one centralized dashboard.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#ffffff' }}>
              <div style={{ padding: 8, background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: 'var(--success)', display: 'flex' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>Instant categorizations & auto calculations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#ffffff' }}>
              <div style={{ padding: 8, background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: 'var(--success)', display: 'flex' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>Interactive progress gauges for goals</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#ffffff' }}>
              <div style={{ padding: 8, background: 'rgba(99, 102, 241, 0.15)', borderRadius: '8px', color: 'var(--primary)', display: 'flex' }}>
                <ShieldCheck size={18} />
              </div>
              <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>Encrypted and isolated account database security</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{ zIndex: 2, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>© 2026 SmartExpense Inc.</span>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border-color-light)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> SECURE STORAGE</span>
        </div>
      </motion.div>

      {/* Right Register Form Column */}
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
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Create an Account</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Register your workspace to commence balance logging
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
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                placeholder="Shivani Sharma"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="shivani@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
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
                  autoComplete="new-password"
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
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ width: '100%', height: '4px', background: 'var(--bg-darker)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: strength.width, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.725rem', color: strength.color, display: 'block', marginTop: '4px', fontWeight: 600 }}>
                    Complexity: {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: 'var(--border-radius-sm)', fontWeight: 700 }} 
              disabled={loading}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Registering Account...' : 'Create Account'}</span>
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
