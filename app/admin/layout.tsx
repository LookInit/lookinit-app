'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AdminSidebar } from '@/components/Admin/Sidebar';
import { AdminHeader } from '@/components/Admin/Header';
import { MobileSidebar } from '@/components/Admin/MobileSidebar';
import { ThemeProvider } from 'next-themes';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/check', {
        headers: { authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        router.push('/login');
        return;
      }
      setIsAuthenticated(true);
    });
    return () => unsubscribe();
  }, [router]);

  if (!isAuthenticated) {
    return null; // Render nothing until authentication is verified
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <head>
        <link rel="canonical" href="https://www.lookinit.com/admin" />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Admin Dashboard",
            "url": "https://www.lookinit.com/admin",
            "description": "Admin dashboard for managing Lookinit content and analytics."
          })}
        </script>
      </head>
      <div className="relative flex h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <MobileSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminHeader />
          
          <main className="relative flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 transition-colors">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}