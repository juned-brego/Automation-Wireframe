'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SalesFileRedirect() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.fileId as string;

  useEffect(() => {
    router.replace(`/app/da/sales/${fileId}/field-mapping`);
  }, [fileId, router]);

  return null;
}
