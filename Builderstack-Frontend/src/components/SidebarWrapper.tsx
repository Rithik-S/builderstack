'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function SidebarWrapper() {
  const pathname = usePathname();
  if (pathname === '/tools' || pathname.startsWith('/tools/')) return null;
  return <Sidebar />;
}
