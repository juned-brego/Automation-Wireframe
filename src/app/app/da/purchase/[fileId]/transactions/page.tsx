'use client';

import { useRouter } from 'next/navigation';
import PurchaseWorkflow from '@/components/PurchaseWorkflow';

export default function PurchaseTransactionsPage() {
  const router = useRouter();

  return (
    <PurchaseWorkflow
      screen="purchase-transactions"
      onBack={() => router.push('/app/da/bulk-upload/purchase')}
    />
  );
}
