'use client';
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const Check = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55530 4.54530 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
      fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
  </svg>
);

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '€5.99',
    features: ['50 searches / day', 'Standard response time', 'All AI models'],
    cta: 'Get Basic',
    accent: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.3)',
    btnBg: 'rgba(99,102,241,0.9)',
    btnHover: '#6366f1',
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€9.99',
    features: ['200 searches / day', 'Priority response time', 'All AI models', 'Early access to new features'],
    cta: 'Get Pro',
    accent: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.4)',
    btnBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    btnHover: '#7c3aed',
    recommended: true,
  },
];

const PaymentPrompt = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to upgrade your plan.',
        variant: 'destructive',
      });
      router.push('/signin');
      return;
    }

    setLoadingPlan(planId);
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          planId,
          source: 'search_limit',
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'No checkout URL returned');
      }
    } catch (error) {
      toast({
        title: 'Checkout failed',
        description: 'Could not start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: '32px',
      marginTop: '16px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '999px',
          padding: '4px 12px',
          marginBottom: '12px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 600, letterSpacing: '0.05em' }}>LIMIT REACHED</span>
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
          You&apos;ve used your free searches
        </h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Upgrade to keep searching — no interruptions, no resets.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        {plans.map(plan => (
          <div
            key={plan.id}
            style={{
              position: 'relative',
              background: plan.accent,
              border: `1px solid ${plan.border}`,
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {plan.recommended && (
              <div style={{
                position: 'absolute',
                top: '-11px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '999px',
                padding: '3px 12px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}>
                RECOMMENDED
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', fontWeight: 500 }}>
                {plan.name}
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>{plan.price}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginLeft: '3px' }}>/month</span>
              </p>
            </div>

            <ul style={{ listStyle: 'none', margin: '0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: '#34d399', flexShrink: 0 }}><Check /></span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loadingPlan !== null}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background: plan.btnBg,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loadingPlan !== null ? 'not-allowed' : 'pointer',
                opacity: loadingPlan !== null && loadingPlan !== plan.id ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loadingPlan === plan.id ? 'Redirecting...' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
        Need more?{' '}
        <a href="/enterprise" style={{ color: 'rgba(165,180,252,0.8)', textDecoration: 'none', fontWeight: 500 }}>
          Talk to us about Enterprise
        </a>
      </p>
    </div>
  );
};

export default PaymentPrompt;
