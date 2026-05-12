'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // These routes manage their own full-screen layout
  const isFullPage = pathname === '/' || pathname.startsWith('/tools') || pathname.startsWith('/suggest');

  if (isFullPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}
