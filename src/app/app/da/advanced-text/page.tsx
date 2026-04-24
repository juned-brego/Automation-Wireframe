'use client';

import { Suspense } from 'react';
import AdvancedTextSection from '@/components/AdvancedTextSection';

export default function AdvancedTextPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
      <AdvancedTextSection />
    </Suspense>
  );
}
