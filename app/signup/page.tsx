'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  // If already signed in, redirect to home
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.replace('/');
    });
    return () => unsubscribe();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'An account with this email already exists' :
        err.code === 'auth/weak-password' ? 'Password must be at least 6 characters' :
        err.code === 'auth/invalid-email' ? 'Invalid email address' :
        err.message || 'Sign up failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setGoogleLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      zIndex: 9999,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '26px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
            }}>
              lookinit
            </span>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginTop: '8px' }}>
            Create your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 0 80px rgba(0,0,0,0.4)',
        }}>
          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              opacity: googleLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '16px',
              transition: 'background 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            {googleLoading ? 'Signing up...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)',
              }} />
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px 14px 12px 40px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)',
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 6 characters)"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px 40px 12px 40px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Creating account...' : (
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center', fontSize: '13px',
            color: 'rgba(255,255,255,0.35)', marginTop: '24px',
          }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '24px' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>
            ← Back to search
          </Link>
        </p>
      </div>
    </div>
  );
}
