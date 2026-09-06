import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--border-radius-sm)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '70%', height: '24px', marginBottom: '6px' }} />
        <div className="skeleton" style={{ width: '50%', height: '12px' }} />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 5 }) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><div className="skeleton" style={{ width: '60px', height: '12px' }} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div className="skeleton" style={{ width: c === 0 ? '70%' : '50%', height: '16px' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton" style={{ width: '40%', height: '20px' }} />
      <div className="skeleton" style={{ width: '100%', flex: 1, borderRadius: '8px' }} />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: '50%', height: '20px' }} />
        <div className="skeleton" style={{ width: '20%', height: '16px' }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: '12px' }} />
      <div className="skeleton" style={{ width: '40%', height: '24px', margin: '8px 0' }} />
      <div className="skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px' }} />
    </div>
  );
}
