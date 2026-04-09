'use client';

import { useParams, useRouter } from 'next/navigation';
import PurchaseWorkflow from '@/components/PurchaseWorkflow';

export default function PurchaseFieldMappingPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const router = useRouter();

  return (
    <PurchaseWorkflow
      screen="field-mapping"
      onBack={() => router.push('/app/da/bulk-upload/purchase')}
      onNext={() => router.push(`/app/da/purchase/${fileId}/gst-mapping`)}
    />
  );
}
