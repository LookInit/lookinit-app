'use client';

import { useSearchHistory } from '@/lib/hooks/useSearchHistory';
import { NotePencil, X, UserCircle, SignOut, Crown, Sun, Moon, Monitor } from '@phosphor-icons/react';
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
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Recent
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshHistory}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3b3e41]"
            title="Refresh"
          >
            <IconRefresh size={13} />
          </button>
          <button
            onClick={() => window.confirm('Clear all history?') && clearAllHistory()}
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#3b3e41]"
            title="Clear all"
          >
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      {/* Scrollable history items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {history.map((item) => (
          <div
            key={item.id}
            className="group flex items-start justify-between gap-1 px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#3b3e41] cursor-pointer"
            onClick={() => { onSelectQuery(item.query); onClose(); }}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate leading-snug flex-1">
              {item.query}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 flex-shrink-0 mt-0.5"
            >
              <IconTrash size={13} />
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
      <div className={`fixed top-0 left-0 h-full w-60 dark:bg-[#1e1f20] bg-white border-r border-gray-200 dark:border-gray-800 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-250 ease-in-out z-[1000] flex flex-col`}>

        {/* Top nav */}
        <div className="flex-shrink-0 px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 pl-1">lookinit</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3b3e41]"
            >
              <X size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <a
            href="./"
            className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3b3e41] font-medium"
          >
            <NotePencil size={18} /> New Chat
          </a>

          {user && (
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3b3e41]"
            >
              <UserCircle size={18} /> My Account
            </Link>
          )}

          <a
            href="https://lookinit.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-indigo-500 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-[#3b3e41] font-medium"
          >
            <Crown size={18} /> Upgrade to Pro
          </a>
        </div>

        <div className="mx-3 h-px bg-gray-200 dark:bg-gray-800 flex-shrink-0" />

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
          <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-[#2a2b2c]">
            {([
              { value: 'light', icon: <Sun size={14} />, label: 'Light' },
              { value: 'dark',  icon: <Moon size={14} />, label: 'Dark'  },
              { value: 'system',icon: <Monitor size={14} />, label: 'Auto'  },
            ] as const).map(({ value, icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${theme === value
                    ? 'bg-white dark:bg-[#3b3e41] text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
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
            <div className="mx-3 h-px bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
            <div className="flex-shrink-0 px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#3b3e41] flex-shrink-0"
                  title="Sign out"
                >
                  <SignOut size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[999]" onClick={onClose} />
      )}
    </>
  );
}
