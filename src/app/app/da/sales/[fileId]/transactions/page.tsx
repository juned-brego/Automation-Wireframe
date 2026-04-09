'use client';

import { useRouter } from 'next/navigation';
import SalesWorkflow from '@/components/SalesWorkflow';

export default function SalesTransactionsPage() {
  const router = useRouter();

  return (
    <SalesWorkflow
      screen="sales-transactions"
      onBack={() => router.push('/app/da/bulk-upload/sales')}
    />
  );
}
