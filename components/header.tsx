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
      <header className={`sticky top-0 z-[500] flex items-center justify-between w-full px-4 h-14 shrink-0 bg-[#f9f9f9] dark:bg-[#1B1C1D] backdrop-blur-xl ${isVisible ? 'header-visible' : 'header-hidden'}`}>
        {/* Sidebar Toggle Button */}
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-300 hover:dark:bg-[#282a2c] text-black rounded-md">
          <SidebarIcon size={24} className="text-black dark:text-white" />
        </button>

        {/* Logo Section */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <a href="https://lookinit.com/" rel="noopener" target="_blank" className="flex items-center">
            <img src="/bg.png" alt="Lookinit Logo" className="h-16 w-auto sm:h-20 lg:h-24 dark:hidden" />
            <img src="/bgw.png" alt="Lookinit Logo White" className="hidden dark:block h-16 w-auto sm:h-20 lg:h-24" />
          </a>
        </div>

        {/* Login/Signup / Profile Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : user ? (
            <button
              onClick={toggleSidebar}
              className="focus:outline-none rounded-full"
              aria-label="Open menu"
            >
              <UserAvatar user={user} size={34} />
            </button>
          ) : (
            <Link
              href="/signin"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#282a2c] rounded-md transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
