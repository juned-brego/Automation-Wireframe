'use client';

import { Suspense } from 'react';
import TransactionsSection from '@/components/TransactionsSection';

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <TransactionsSection />
    </Suspense>
  );
}
