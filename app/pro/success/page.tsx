'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Spinner } from '@phosphor-icons/react';
import { useToast } from '@/components/ui/use-toast';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') ?? null;
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function verifySession() {
      if (!sessionId) { setVerifying(false); return; }
      try {
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setVerified(true);
        } else {
          toast({ title: 'Verification failed', description: data.error || 'Could not verify subscription.', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Error', description: 'Could not verify subscription.', variant: 'destructive' });
      } finally {
        setVerifying(false);
      }
    }
    verifySession();
  }, [sessionId, toast]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)] px-4">
      <div className="w-full max-w-sm bg-[--card-bg] border border-[--card-border] rounded-2xl p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        {verifying ? (
          <>
            <Spinner size={36} className="text-[--text-muted] animate-spin mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-[--text-primary] mb-1">Verifying payment…</h1>
            <p className="text-sm text-[--text-muted]">Hang tight, confirming your subscription.</p>
          </>
        ) : verified ? (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <CheckCircle size={28} weight="fill" className="text-emerald-400" />
            </div>
            <h1 className="text-xl font-semibold text-[--text-primary] mb-2">You're all set!</h1>
            <p className="text-sm text-[--text-muted] mb-7">
              Your subscription is active. Enjoy unlimited searches.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[--text-primary] text-[--surface] text-sm font-medium hover:opacity-85 transition-opacity"
              >
                Start searching <ArrowRight size={15} />
              </button>
              <button
                onClick={() => window.location.href = '/account'}
                className="w-full px-4 py-2.5 rounded-xl border border-[--card-border] text-sm text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors"
              >
                View account
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-[--text-primary] mb-2">Verification failed</h1>
            <p className="text-sm text-[--text-muted] mb-7">
              We couldn't confirm your subscription. Contact support if you were charged.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2.5 rounded-xl border border-[--card-border] text-sm text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors"
            >
              Return home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
