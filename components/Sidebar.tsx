'use client';

import { useSearchHistory } from '@/lib/hooks/useSearchHistory';
import { NotePencil, X, UserCircle, SignOut, Crown, Sun, Moon, Monitor } from '@phosphor-icons/react';
import Image from 'next/image';
import { IconTrash, IconRefresh } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistoryQuery: (query: string) => void;
}

function HistoryList({ onSelectQuery, onClose }: { onSelectQuery: (q: string) => void; onClose: () => void }) {
  const { history, loading, error, refreshHistory, deleteHistoryItem, clearAllHistory } = useSearchHistory();

  if (loading) {
    return <p className="text-xs text-gray-400 dark:text-gray-500 px-2 py-3">Loading...</p>;
  }

  if (error) {
    return <p className="text-xs text-red-400 px-2 py-3">Failed to load history</p>;
  }

  if (history.length === 0) {
    return <p className="text-xs text-gray-400 dark:text-gray-500 px-2 py-3">No history yet</p>;
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* History header with actions */}
      <div className="flex items-center justify-between px-2 mb-1 flex-shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[--text-muted]">
          Recent
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={refreshHistory}
            className="p-1 rounded-md text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors"
            title="Refresh"
          >
            <IconRefresh size={12} />
          </button>
          <button
            onClick={() => window.confirm('Clear all history?') && clearAllHistory()}
            className="p-1 rounded-md text-[--text-muted] hover:text-red-400 hover:bg-[--card-hover] transition-colors"
            title="Clear all"
          >
            <IconTrash size={12} />
          </button>
        </div>
      </div>

      {/* Scrollable history items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin">
        {history.map((item) => (
          <div
            key={item.id}
            className="group flex items-start justify-between gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[--card-hover] cursor-pointer transition-colors"
            onClick={() => { onSelectQuery(item.query); onClose(); }}
          >
            <p className="text-sm text-[--text-muted] group-hover:text-[--text-primary] truncate leading-snug flex-1 transition-colors">
              {item.query}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-[--text-muted] hover:text-red-400 flex-shrink-0 mt-0.5 transition-colors"
            >
              <IconTrash size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, onClose, onSelectHistoryQuery }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-60 bg-[--surface] border-r border-[--card-border] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out z-[100000] flex flex-col`}>

        {/* Top nav */}
        <div className="flex-shrink-0 px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <a href="/">
              <Image src="/images/bg.png"  alt="Lookinit" width={90} height={28} className="dark:hidden"        style={{ height: '26px', width: 'auto' }} priority />
              <Image src="/images/bgw.png" alt="Lookinit" width={90} height={28} className="hidden dark:block"  style={{ height: '26px', width: 'auto' }} priority />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <a
            href="./"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[--text-primary] hover:bg-[--card-hover] font-medium transition-colors"
          >
            <NotePencil size={16} weight="bold" /> New Chat
          </a>

          {user && (
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors"
            >
              <UserCircle size={16} /> My Account
            </Link>
          )}

          <a
            href="https://lookinit.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-indigo-400 hover:bg-[--card-hover] font-medium transition-colors"
          >
            <Crown size={16} weight="fill" /> Upgrade to Pro
          </a>
        </div>

        <div className="mx-3 h-px bg-[--divider] flex-shrink-0" />

        {/* Search history */}
        {user ? (
          <div className="flex-1 flex flex-col min-h-0 px-3 pt-3 pb-2">
            <HistoryList onSelectQuery={onSelectHistoryQuery} onClose={onClose} />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Theme toggle */}
        <div className="flex-shrink-0 px-3 pb-2">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[--card-hover]">
            {([
              { value: 'light',  icon: <Sun size={13} />,     label: 'Light' },
              { value: 'dark',   icon: <Moon size={13} />,    label: 'Dark'  },
              { value: 'system', icon: <Monitor size={13} />, label: 'Auto'  },
            ] as const).map(({ value, icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all
                  ${theme === value
                    ? 'bg-[--card-bg] text-[--text-primary] shadow-sm border border-[--card-border]'
                    : 'text-[--text-muted] hover:text-[--text-primary]'
                  }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: user info + logout */}
        {user && (
          <>
            <div className="mx-3 h-px bg-[--divider] flex-shrink-0" />
            <div className="flex-shrink-0 px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold flex-shrink-0">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[--text-primary] truncate">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-[11px] text-[--text-muted] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md text-[--text-muted] hover:text-red-400 hover:bg-[--card-hover] flex-shrink-0 transition-colors"
                  title="Sign out"
                >
                  <SignOut size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]" onClick={onClose} />
      )}
    </>
  );
}
