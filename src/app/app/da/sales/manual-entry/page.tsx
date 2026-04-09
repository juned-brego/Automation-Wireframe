'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ManualEntryForm from '@/components/ManualEntryForm';

function ManualEntryContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') || 'Sales') as 'Sales' | 'Sales Return' | 'Purchase' | 'Purchase Return';
  return <ManualEntryForm type={type} />;
}

export default function ManualEntryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <ManualEntryContent />
    </Suspense>
  );
}
