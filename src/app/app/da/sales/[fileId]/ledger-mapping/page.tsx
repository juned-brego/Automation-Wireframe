'use client';

import { useParams, useRouter } from 'next/navigation';
import SalesWorkflow from '@/components/SalesWorkflow';

export default function LedgerMappingPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const router = useRouter();

  return (
    <SalesWorkflow
      screen="ledger-mapping"
      onBack={() => router.push(`/app/da/sales/${fileId}/gst-mapping`)}
      onNext={() => router.push(`/app/da/sales/${fileId}/transactions`)}
    />
  );
}
