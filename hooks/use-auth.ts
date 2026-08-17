'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          const response = await fetch('/api/stripe/get-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${idToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const active = data.subscription?.status === 'active';
            setHasSubscription(active);
            setPlan(active ? (data.subscription?.planId || 'basic') : null);
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      } else {
        setHasSubscription(false);
        setPlan(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, hasSubscription, plan, loading };
}