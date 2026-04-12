'use client';

import { useEffect } from 'react';

export default function ProPage() {
  useEffect(() => {
    window.location.replace('https://lookinit.com/pricing');
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a',
    }}>
      <div style={{
        width: '24px', height: '24px',
        border: '2px solid rgba(255,255,255,0.1)',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
