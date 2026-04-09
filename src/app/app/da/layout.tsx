'use client';

import Sidebar from '@/components/Sidebar';
import { useRouter, usePathname } from 'next/navigation';

export default function DaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active page from URL
  const getActivePage = () => {
    if (pathname.startsWith('/app/da/transactions')) return 'transactions';
    if (pathname.startsWith('/app/da/bulk-upload') || pathname.startsWith('/app/da/sales')) return 'bulk-upload';
    return 'bulk-upload';
  };

  const handleNavigate = (page: string) => {
    if (page === 'bulk-upload') {
      router.push('/app/da/bulk-upload/banking');
    } else if (page === 'transactions') {
      router.push('/app/da/transactions');
    }
    // dashboard, master, learn — placeholder for now
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={getActivePage()} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
