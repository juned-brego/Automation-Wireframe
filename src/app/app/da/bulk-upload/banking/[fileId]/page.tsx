'use client';

import { useParams, useRouter } from 'next/navigation';
import TransactionsPage from '@/components/TransactionsPage';

const FILE_MAP: Record<string, { name: string; total: number }> = {
  '1': { name: '63358723.pdf', total: 2415 },
  '2': { name: 'Acct Statement_2060_30012026_11.29.55.xls', total: 37 },
  '3': { name: 'Acct Statement_2060_30012026_11.29.55.xls', total: 37 },
  '4': { name: 'Bank Laani for Upload.xlsx', total: 160 },
};

export default function BankingTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.fileId as string;
  const file = FILE_MAP[fileId] || { name: 'Unknown', total: 0 };

  return (
    <TransactionsPage
      onBack={() => router.push('/app/da/bulk-upload/banking')}
      fileName={file.name}
      totalCount={file.total}
    />
  );
}
