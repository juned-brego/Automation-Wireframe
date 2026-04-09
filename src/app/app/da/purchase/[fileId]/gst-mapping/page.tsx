'use client';

import { useParams, useRouter } from 'next/navigation';
import PurchaseWorkflow from '@/components/PurchaseWorkflow';

export default function PurchaseGstMappingPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const router = useRouter();

  return (
    <PurchaseWorkflow
      screen="gst-mapping"
      onBack={() => router.push(`/app/da/purchase/${fileId}/field-mapping`)}
      onNext={() => router.push(`/app/da/purchase/${fileId}/ledger-mapping`)}
    />
  );
}
