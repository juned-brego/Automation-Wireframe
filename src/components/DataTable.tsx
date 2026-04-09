'use client';

import React, { useState } from 'react';
import {
  Eye,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  MoreVertical,
} from 'lucide-react';

interface BankingTableRow {
  id: string;
  srNo: number;
  fileName: string;
  bankName: string;
  statementDate: string;
  syncedDate: string | null;
  total: number;
  pending: number;
  saved: number;
  synced: number;
  suggestion: number;
  status: 'Complete' | 'Pending' | 'Failed';
}

interface PurchaseTableRow {
  id: string;
  srNo: number;
  fileName: string;
  type: string;
  statementDate: string | null;
  syncedDate: string | null;
  total: number | null;
  pending: string | null;
  saved: string | null;
  synced: string | null;
}

type TableRow = BankingTableRow | PurchaseTableRow;

interface DataTableProps {
  variant: 'banking' | 'purchase';
  data?: TableRow[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCopy?: (id: string) => void;
  onSelectionChange?: (count: number) => void;
}

// Default sample data
const defaultBankingData: BankingTableRow[] = [
  {
    id: '1',
    srNo: 1,
    fileName: '63358723.pdf',
    bankName: 'HDFC',
    statementDate: '01 Apr 2025 - 31 Mar 2026',
    syncedDate: null,
    total: 2415,
    pending: 2415,
    saved: 0,
    synced: 0,
    suggestion: 181,
    status: 'Complete',
  },
  {
    id: '2',
    srNo: 2,
    fileName: 'Acct Statement_2060_30012026_11.29.55.xls',
    bankName: 'HDFC',
    statementDate: '13 Jan 2026 - 29 Jan 2026',
    syncedDate: null,
    total: 37,
    pending: 32,
    saved: 5,
    synced: 0,
    suggestion: 5,
    status: 'Complete',
  },
  {
    id: '3',
    srNo: 3,
    fileName: 'Acct Statement_2060_30012026_11.29.55.xls',
    bankName: 'HDFC',
    statementDate: '13 Jan 2026 - 29 Jan 2026',
    syncedDate: '13 Jan 2026 - 29 Jan 2026',
    total: 37,
    pending: 0,
    saved: 0,
    synced: 37,
    suggestion: 1,
    status: 'Complete',
  },
  {
    id: '4',
    srNo: 4,
    fileName: 'Bank Laani for Upload.xlsx',
    bankName: 'HDFC',
    statementDate: '09 Apr 2025 - 12 Jan 2026',
    syncedDate: '09 Apr 2025 - 12 Jan 2026',
    total: 160,
    pending: 0,
    saved: 0,
    synced: 160,
    suggestion: 0,
    status: 'Complete',
  },
];

const defaultPurchaseData: PurchaseTableRow[] = [
  {
    id: '1',
    srNo: 1,
    fileName: 'DONE - EV VEH - 01.02 TO 28.02.xlsx',
    type: 'Item Invoice',
    statementDate: null,
    syncedDate: null,
    total: 13,
    pending: null,
    saved: null,
    synced: null,
  },
];

const getStatusColor = (status: string) => {
  if (status === 'Complete') return '#10B981';
  if (status === 'Pending') return '#F59E0B';
  if (status === 'Failed') return '#EF4444';
  return '#6B7280';
};

const DataTableHeader: React.FC<{
  variant: 'banking' | 'purchase';
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}> = ({ variant, allSelected, onSelectAll }) => {
  return (
    <thead className="bg-white border-b border-gray-200">
      <tr>
        <th className="px-4 py-3 text-left">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="cursor-pointer w-4 h-4"
          />
        </th>
        <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs">
          Sr.No.
        </th>
        <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs">
          File Name
        </th>

        {variant === 'banking' ? (
          <>
            <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs flex items-center gap-2">
              Bank Name <ArrowUpDown size={14} className="text-gray-400" />
            </th>
            <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs">
              Statement Date
            </th>
            <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs">
              Synced Date
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Total
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Pending
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Saved
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Synced
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Suggestion
            </th>
            <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs flex items-center gap-2">
              Status <Filter size={14} className="text-gray-400" />
            </th>
          </>
        ) : (
          <>
            <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs">
              Type
            </th>
            <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs">
              Statement Date
            </th>
            <th className="px-4 py-3 text-left text-gray-600 font-semibold text-xs">
              Synced Date
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Total
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Pending
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Saved
            </th>
            <th className="px-4 py-3 text-right text-gray-600 font-semibold text-xs">
              Synced
            </th>
          </>
        )}

        <th className="px-4 py-3 text-center text-gray-600 font-semibold text-xs">
          Action
        </th>
      </tr>
    </thead>
  );
};

const BankingTableRow: React.FC<{
  row: BankingTableRow;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
}> = ({ row, selected, onSelect, onView, onDelete, onCopy }) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => onView(row.id)}>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="cursor-pointer w-4 h-4"
        />
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm">{row.srNo}</td>
      <td className="px-4 py-3 text-sm">
        <span className="text-blue-600 hover:text-blue-800 hover:underline font-medium">{row.fileName}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm">{row.bankName}</td>
      <td className="px-4 py-3 text-gray-700 text-sm">{row.statementDate}</td>
      <td className="px-4 py-3 text-gray-700 text-sm">
        {row.syncedDate || '-'}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.total}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.pending}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.saved}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.synced}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.suggestion}
      </td>
      <td className="px-4 py-3 text-sm font-semibold" style={{
        color: getStatusColor(row.status),
      }}>
        {row.status}
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onDelete(row.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const PurchaseTableRow: React.FC<{
  row: PurchaseTableRow;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onView: (id: string) => void;
  onCopy: (id: string) => void;
  onMenu?: (id: string) => void;
}> = ({ row, selected, onSelect, onView, onCopy, onMenu }) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="cursor-pointer w-4 h-4"
        />
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm">{row.srNo}</td>
      <td className="px-4 py-3 text-gray-700 text-sm">{row.fileName}</td>
      <td className="px-4 py-3 text-gray-700 text-sm">{row.type}</td>
      <td className="px-4 py-3 text-gray-700 text-sm">
        {row.statementDate || '-'}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm">
        {row.syncedDate || '-'}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.total || '-'}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.pending || '-'}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.saved || '-'}
      </td>
      <td className="px-4 py-3 text-gray-700 text-sm text-right">
        {row.synced || '-'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onView(row.id)}
            className="text-green-500 hover:text-green-700 transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onCopy(row.id)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="Copy"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => onMenu?.(row.id)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="More options"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems?: number;
}> = ({
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems = 100,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white border-t border-gray-200">
      <div></div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          title="Previous page"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 border border-blue-400 rounded bg-blue-50">
          <span className="text-sm font-medium text-gray-700">
            {currentPage}
          </span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          title="Next page"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-700 bg-white hover:border-gray-300 cursor-pointer"
        >
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>
    </div>
  );
};

const DataTable: React.FC<DataTableProps> = ({
  variant,
  data,
  onView = () => {},
  onDelete = () => {},
  onCopy = () => {},
  onSelectionChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const tableData =
    data ||
    (variant === 'banking' ? defaultBankingData : defaultPurchaseData);

  const paginatedData = tableData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.has(row.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedRows);
      paginatedData.forEach((row) => newSelected.add(row.id));
      setSelectedRows(newSelected);
      onSelectionChange?.(newSelected.size);
    } else {
      const newSelected = new Set(selectedRows);
      paginatedData.forEach((row) => newSelected.delete(row.id));
      setSelectedRows(newSelected);
      onSelectionChange?.(newSelected.size);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(newSelected.size);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <DataTableHeader
            variant={variant}
            allSelected={allSelected}
            onSelectAll={handleSelectAll}
          />
          <tbody>
            {variant === 'banking'
              ? (paginatedData as BankingTableRow[]).map((row) => (
                  <BankingTableRow
                    key={row.id}
                    row={row}
                    selected={selectedRows.has(row.id)}
                    onSelect={(checked) =>
                      handleSelectRow(row.id, checked)
                    }
                    onView={onView}
                    onDelete={onDelete}
                    onCopy={onCopy}
                  />
                ))
              : (paginatedData as PurchaseTableRow[]).map((row) => (
                  <PurchaseTableRow
                    key={row.id}
                    row={row}
                    selected={selectedRows.has(row.id)}
                    onSelect={(checked) =>
                      handleSelectRow(row.id, checked)
                    }
                    onView={onView}
                    onCopy={onCopy}
                  />
                ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={tableData.length}
      />
    </div>
  );
};

export default DataTable;
