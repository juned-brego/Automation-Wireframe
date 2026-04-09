'use client';

import { useParams, useRouter } from 'next/navigation';
import SalesWorkflow from '@/components/SalesWorkflow';

export default function FieldMappingPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const router = useRouter();

  return (
    <SalesWorkflow
      screen="field-mapping"
      onBack={() => router.push('/app/da/bulk-upload/sales')}
      onNext={() => router.push(`/app/da/sales/${fileId}/gst-mapping`)}
    />
  );
}
