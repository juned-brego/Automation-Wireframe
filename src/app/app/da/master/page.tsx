'use client';

import { Suspense } from 'react';
import MasterSection from '@/components/MasterSection';

export default function MasterPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
      <MasterSection />
    </Suspense>
  );
}
