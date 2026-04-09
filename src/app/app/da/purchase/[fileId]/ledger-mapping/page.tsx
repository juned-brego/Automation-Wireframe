'use client';

import { useParams, useRouter } from 'next/navigation';
import PurchaseWorkflow from '@/components/PurchaseWorkflow';

export default function PurchaseLedgerMappingPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const router = useRouter();

  return (
    <PurchaseWorkflow
      screen="ledger-mapping"
      onBack={() => router.push(`/app/da/purchase/${fileId}/gst-mapping`)}
      onNext={() => router.push(`/app/da/purchase/${fileId}/transactions`)}
    />
  );
}
