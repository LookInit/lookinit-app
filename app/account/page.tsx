'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserAvatar } from '@/components/UserAvatar';
import { Crown, SignOut, ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch('/api/stripe/get-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSubscription(data?.subscription ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      /* ignore */
    } finally {
      setPortalLoading(false);
    }
  };

  const isActive = subscription?.status === 'active';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '32px 16px',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Back */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: 'rgba(128,128,128,0.8)',
          textDecoration: 'none', marginBottom: '32px',
        }}>
          <ArrowLeft size={14} /> Back to search
        </Link>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
            <div style={{
              width: '24px', height: '24px',
              border: '2px solid rgba(128,128,128,0.2)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !user ? (
          <p className="text-center text-gray-500">Not signed in.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Profile card */}
            <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <UserAvatar user={user} size={56} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '16px' }} className="text-gray-900 dark:text-gray-100 truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p style={{ fontSize: '13px', marginTop: '2px' }} className="text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }} className="text-gray-400 dark:text-gray-600">
                    Member since {new Date(user.metadata.creationTime || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription card */}
            <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }} className="text-gray-900 dark:text-gray-100">
                Subscription
              </h2>

              {isActive ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                      background: 'rgba(99,102,241,0.12)', borderRadius: '8px',
                      padding: '6px', display: 'flex',
                    }}>
                      <Crown size={18} style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px' }} className="text-gray-900 dark:text-gray-100 capitalize">
                        {subscription.plan || 'Pro'} plan
                      </p>
                      <p style={{ fontSize: '12px', marginTop: '1px' }} className="text-gray-500">
                        Renews {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span style={{
                      marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
                      background: 'rgba(34,197,94,0.12)', color: '#16a34a',
                      padding: '2px 8px', borderRadius: '100px',
                    }}>
                      Active
                    </span>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full text-sm font-medium py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors disabled:opacity-60"
                  >
                    {portalLoading ? 'Opening portal...' : 'Manage subscription'}
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '13px', marginBottom: '16px' }} className="text-gray-500 dark:text-gray-400">
                    You&apos;re on the free plan — 3 searches per day.
                  </p>
                  <a
                    href="https://lookinit.com/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', borderRadius: '12px',
                      padding: '11px', fontSize: '14px', fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <Crown size={16} /> Upgrade to Pro
                  </a>
                </div>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '11px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid rgba(239,68,68,0.2)',
                background: 'rgba(239,68,68,0.05)', color: '#ef4444',
              }}
            >
              <SignOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
