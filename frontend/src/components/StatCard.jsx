import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCountUp from './AnimatedCountUp';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color = 'var(--primary)', subtitle, prefix = '$', trendValue = 0 }) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
  
  const hasTrend = trendValue !== 0;
  const isPositiveTrend = trendValue > 0;

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '16px',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `${color}12`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `1px solid ${color}25`,
          boxShadow: `0 4px 12px ${color}10`
        }}>
          {Icon && <Icon size={22} />}
        </div>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', letterSpacing: '-0.03em' }}>
            <AnimatedCountUp value={numericValue} prefix={prefix} />
          </div>
          {subtitle && <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{subtitle}</span>}
        </div>
      </div>

      {hasTrend && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '2px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '99px',
            background: isPositiveTrend ? 'var(--success-light)' : 'var(--danger-light)',
            color: isPositiveTrend ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${isPositiveTrend ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}`
          }}>
            {isPositiveTrend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isPositiveTrend ? '+' : ''}{trendValue.toFixed(1)}%</span>
          </div>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>MoM</span>
        </div>
      )}
    </motion.div>
  );
}
