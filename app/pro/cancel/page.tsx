'use client';

import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft } from '@phosphor-icons/react';

export default function CancelPage() {
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan') ?? 'pro';
  const planName = plan === 'basic' ? 'Basic' : 'Pro';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)] px-4">
      <div className="w-full max-w-sm bg-[--card-bg] border border-[--card-border] rounded-2xl p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
          <XCircle size={28} weight="fill" className="text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-[--text-primary] mb-2">Payment cancelled</h1>
        <p className="text-sm text-[--text-muted] mb-7">
          Your {planName} subscription was not started. No charges were made.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[--text-primary] text-[--surface] text-sm font-medium hover:opacity-85 transition-opacity"
          >
            <ArrowLeft size={15} /> Back to home
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2.5 rounded-xl border border-[--card-border] text-sm text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
