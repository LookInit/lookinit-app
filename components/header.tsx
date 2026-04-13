'use client';

import { useEffect, useState } from 'react';
import { Sidebar as SidebarIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { UserAvatar } from './UserAvatar';
import { Sidebar } from './Sidebar';

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasMessages, setHasMessages] = useState(false);

  // Use the auth hook instead of managing state locally
  const { user, loading } = useAuth();

  const handleSelectHistoryQuery = (query: string) => {
    window.dispatchEvent(new CustomEvent('set-search-query', {
      detail: { query }
    }));
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Listen for messages changes
    const handleMessagesChange = (event: CustomEvent) => {
      setHasMessages(event.detail.hasMessages);
    };

    document.addEventListener('messagesChanged', handleMessagesChange as EventListener);
    return () => document.removeEventListener('messagesChanged', handleMessagesChange as EventListener);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide header if there are messages
      if (hasMessages) {
        if (currentScrollY < lastScrollY || currentScrollY < 10) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        }
      } else {
        setIsVisible(true); // Always show when no messages
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hasMessages]);

  return (
    <>
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onSelectHistoryQuery={handleSelectHistoryQuery} 
      />

      {/* Header */}
      <header className={`sticky top-0 z-[500] flex items-center justify-between w-full px-4 h-12 shrink-0 backdrop-blur-md bg-[--surface]/80 border-b border-[--card-border] ${isVisible ? 'header-visible' : 'header-hidden'}`}>
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-[--text-muted] hover:text-[--text-primary] hover:bg-[--card-hover] transition-colors"
        >
          <SidebarIcon size={20} />
        </button>

        {/* Logo — centered */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <a href="https://lookinit.com/" rel="noopener" target="_blank">
            <img src="/bg.png"  alt="Lookinit" className="h-12 w-auto dark:hidden" />
            <img src="/bgw.png" alt="Lookinit" className="hidden dark:block h-12 w-auto" />
          </a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-7 h-7 rounded-full bg-[--card-hover] animate-pulse" />
          ) : user ? (
            <button
              onClick={toggleSidebar}
              className="focus:outline-none rounded-full ring-2 ring-transparent hover:ring-[--card-border] transition-all"
              aria-label="Open menu"
            >
              <UserAvatar user={user} size={30} />
            </button>
          ) : (
            <Link
              href="/signin"
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-[--card-border] text-[--text-primary] hover:bg-[--card-hover] transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
