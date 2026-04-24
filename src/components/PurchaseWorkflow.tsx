'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  MoreVertical,
  Save,
  ArrowLeft,
  Check,
  Info,
  Globe,
  Settings,
  Plus,
  Filter,
  Calendar,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  X,
  AlertTriangle,
  PlusCircle,
  FileText,
  ChevronFirst,
  ChevronLast,
} from 'lucide-react';

type Screen =
  | 'purchase-table'
  | 'field-mapping'
  | 'gst-mapping'
  | 'ledger-mapping'
  | 'purchase-transactions';

interface PurchaseWorkflowProps {
  onBack?: () => void;
  /** When provided, renders only that specific screen (router-driven mode) */
  screen?: Screen;
  /** Router-driven next action */
  onNext?: () => void;
  /** Enable router-based navigation for the sales table file clicks */
  useRouter?: boolean;
}

interface PurchaseFile {
  id: number;
  fileName: string;
  type: string;
  statementDate: string;
  syncedDate: string;
  total: number;
  pending: string | number;
  saved: number | string;
  synced: number | string;
}

interface MappedField {
  id: string;
  sheetHeader: string;
  tallyField: string;
  sampleData: string;
}

interface UnmappedField {
  id: string;
  sheetHeader: string;
  sampleData: string;
}


interface LedgerMapping {
  id: number;
  ledgerName: string;
  ledgerType: string;
}

interface PurchaseTransaction {
  id: number;
  date: string;
  refNo: string;
  voucherType: string;
  partyName: string;
  partyLedger: string;
  gstin: string;
  placeOfSupply: string;
  itemCode: string;
  itemName: string;
  itemLedger: string;
  itemNarration: string;
  quantity: number;
  rate: number;
  amount: number;
  purchaseLedger: string;
  inputSGST: number;
  inputCGST: number;
  inputIGST: number;
  narration: string;
  totalAmount: number;
}

const tallyFieldOptions = [
  'Reference No',
  'Date',
  'Quantity',
  'Name of Item',
  'Purchase ledger',
  'Rate',
  'Party A/C Name',
  'Item Narration',
  'GSTIN/UIN',
  'Voucher Type',
  'Place of Supply',
  'Item Amount',
  'Discount',
  'Godown',
  'Batch Name',
  'Batch Expiry',
  'Batch Mfg Date',
  'Narration',
];

const initialMappedFields: MappedField[] = [
  { id: 'm1', sheetHeader: 'Invoice Number', tallyField: 'Reference No', sampleData: 'IN-1237 , IN-1241 , IN-1253 ...' },
  { id: 'm2', sheetHeader: 'Invoice Date', tallyField: 'Date', sampleData: '02/05/2026 , 02/07/2026 , 02/09/2026 ...' },
  { id: 'm3', sheetHeader: 'Quantity', tallyField: 'Quantity', sampleData: '1 , 1 , 1 ...' },
  { id: 'm4', sheetHeader: 'Hsn/sac', tallyField: 'Name of Item', sampleData: '9608 , 84779000 , 39269099 ...' },
  { id: 'm5', sheetHeader: 'Cgst Tax', tallyField: 'Purchase ledger', sampleData: '0 , 0 , 0 ...' },
  { id: 'm6', sheetHeader: 'Sgst Tax', tallyField: 'Rate', sampleData: '0 , 0 , 0 ...' },
  { id: 'm7', sheetHeader: 'Utgst Tax', tallyField: 'Party A/C Name', sampleData: '0 , 0 , 0 ...' },
  { id: 'm8', sheetHeader: 'Igst Tax', tallyField: 'Item Narration', sampleData: '152.39 , 45.61 , 45.46 ...' },
  { id: 'm9', sheetHeader: 'Customer Bill To Gstid', tallyField: 'GSTIN/UIN', sampleData: '29BAQPS0274P1ZP , 08AAACF8368D1ZK , 07AABCB8144N1ZE ...' },
];

const initialUnmappedFields: UnmappedField[] = [
  { id: 'u1', sheetHeader: 'Invoice Amount', sampleData: '999 , 299 , 283.1 ...' },
  { id: 'u2', sheetHeader: 'Tax Exclusive Gross', sampleData: '846.61 , 253.39 , 239.91 ...' },
  { id: 'u3', sheetHeader: 'Total Tax Amount', sampleData: '152.39 , 45.61 , 43.19 ...' },
  { id: 'u4', sheetHeader: 'Principal Amount', sampleData: '999 , 299 , 298 ...' },
  { id: 'u5', sheetHeader: 'Principal Amount Basis', sampleData: '846.61 , 253.39 , 252.54 ...' },
];

const csvColumnOptions = [
  'order-id',
  'date',
  'settlement-id',
  'type',
  'description',
  'product-sales',
  'shipping-credits',
  'gift-wrap-credits',
  'promotional-rebates',
  'selling-fees',
  'fba-fees',
  'other-transaction-fees',
  'other',
  'total',
];

const ledgerTypeOptions = [
  'Sundry Debtors',
  'Sundry Creditors',
  'Purchase Account',
  'Purchase Account',
  'Bank Accounts',
  'Cash',
  'Duties & Taxes',
  'Direct Expenses',
  'Indirect Expenses',
];

const samplePurchaseFiles: PurchaseFile[] = [
  {
    id: 1,
    fileName: 'Shopify Sales.xlsx',
    type: 'Item Invoice',
    statementDate: '- - -',
    syncedDate: '-',
    total: 102,
    pending: '-',
    saved: 102,
    synced: 0,
  },
  {
    id: 2,
    fileName: 'MTR_B2B-FEBRUARY-2026-AAJQ3K54TZ6MM.csv',
    type: 'Item Invoice',
    statementDate: '-',
    syncedDate: '-',
    total: 6,
    pending: '-',
    saved: '-',
    synced: '-',
  },
];

const sampleLedgerMappings: LedgerMapping[] = [
  { id: 1, ledgerName: 'Sundry Debtors', ledgerType: 'Sundry Debtors' },
  { id: 2, ledgerName: 'Purchase Account', ledgerType: 'Purchase Account' },
  { id: 3, ledgerName: 'Output IGST', ledgerType: 'Duties & Taxes' },
  { id: 4, ledgerName: 'Output CGST', ledgerType: 'Duties & Taxes' },
  { id: 5, ledgerName: 'Output SGST', ledgerType: 'Duties & Taxes' },
];

const samplePurchaseTransactions: PurchaseTransaction[] = [
  {
    id: 1,
    date: '02/05/2026',
    refNo: 'IN-1237',
    voucherType: 'Purchase',
    partyName: '',
    partyLedger: '',
    gstin: '29BAQPS0274P1ZP',
    placeOfSupply: 'Gujarat',
    itemCode: '9608',
    itemName: '',
    itemLedger: '',
    itemNarration: '',
    quantity: 1,
    rate: 0,
    amount: 152.39,
    purchaseLedger: '',
    inputSGST: 0,
    inputCGST: 0,
    inputIGST: 0,
    narration: '',
    totalAmount: 0,
  },
  {
    id: 2,
    date: '02/07/2026',
    refNo: 'IN-1241',
    voucherType: 'Purchase',
    partyName: '',
    partyLedger: '',
    gstin: '08AAACF8368D1ZK',
    placeOfSupply: 'Gujarat',
    itemCode: '84779000',
    itemName: '',
    itemLedger: '',
    itemNarration: '',
    quantity: 1,
    rate: 0,
    amount: 45.61,
    purchaseLedger: '',
    inputSGST: 0,
    inputCGST: 0,
    inputIGST: 0,
    narration: '',
    totalAmount: 0,
  },
  {
    id: 3,
    date: '02/09/2026',
    refNo: 'IN-1253',
    voucherType: 'Purchase',
    partyName: '',
    partyLedger: '',
    gstin: '07AABCB8144N1ZE',
    placeOfSupply: 'Gujarat',
    itemCode: '39269099',
    itemName: '',
    itemLedger: '',
    itemNarration: '',
    quantity: 1,
    rate: 0,
    amount: 45.46,
    purchaseLedger: '',
    inputSGST: 0,
    inputCGST: 0,
    inputIGST: 0,
    narration: '',
    totalAmount: 0,
  },
  {
    id: 4,
    date: '02/10/2026',
    refNo: 'IN-1255',
    voucherType: 'Purchase',
    partyName: '',
    partyLedger: '',
    gstin: '29AAPCM9179E1ZP',
    placeOfSupply: 'Gujarat',
    itemCode: '9608',
    itemName: '',
    itemLedger: '',
    itemNarration: '',
    quantity: 1,
    rate: 0,
    amount: 152.39,
    purchaseLedger: '',
    inputSGST: 0,
    inputCGST: 0,
    inputIGST: 0,
    narration: '',
    totalAmount: 0,
  },
  {
    id: 5,
    date: '02/11/2026',
    refNo: 'IN-1261',
    voucherType: 'Purchase',
    partyName: '',
    partyLedger: '',
    gstin: '33AAJCM6293R1ZM',
    placeOfSupply: 'Gujarat',
    itemCode: '84779000',
    itemName: '',
    itemLedger: '',
    itemNarration: '',
    quantity: 1,
    rate: 0,
    amount: 68.49,
    purchaseLedger: '',
    inputSGST: 0,
    inputCGST: 0,
    inputIGST: 0,
    narration: '',
    totalAmount: 0,
  },
  {
    id: 6,
    date: '15/02/2026',
    refNo: 'IN-1281',
    voucherType: 'Purchase',
    partyName: '',
    partyLedger: '',
    gstin: '07AAQCM2193P1ZN',
    placeOfSupply: 'Gujarat',
    itemCode: '3918',
    itemName: '',
    itemLedger: '',
    itemNarration: '',
    quantity: 1,
    rate: 0,
    amount: 198,
    purchaseLedger: '',
    inputSGST: 0,
    inputCGST: 0,
    inputIGST: 0,
    narration: '',
    totalAmount: 0,
  },
];

function DropdownSelect({
  options,
  value,
  onChange,
  placeholder,
  className = '',
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-2 py-1 text-[11px] border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center justify-between"
      >
        <span className="truncate">
          {value || placeholder || 'Select option'}
        </span>
        <ChevronDown size={14} className="ml-1 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="w-full px-2 py-1 text-[11px] text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StepperIndicator({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center gap-4">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index < currentStep ? <Check size={14} /> : index + 1}
          </div>
          <span
            className={`text-[12px] font-medium ${
              index === currentStep ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className="w-6 h-px bg-gray-300 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}

function PurchaseTableScreen({
  onSelectFile,
}: {
  onSelectFile: (fileId: number) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input type="checkbox" className="w-4 h-4" />
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">
                  Sr.No.
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">
                  File Name
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">
                  Statement Date
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">
                  Synced Date
                </th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">
                  Total
                </th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">
                  Pending
                </th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">
                  Saved
                </th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">
                  Synced
                </th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {samplePurchaseFiles.map((file) => (
                <tr
                  key={file.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectFile(file.id)}
                >
                  <td className="px-3 py-2">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="px-3 py-2">{file.id}</td>
                  <td className="px-3 py-2 text-blue-600 font-medium">
                    {file.fileName}
                  </td>
                  <td className="px-3 py-2">{file.type}</td>
                  <td className="px-3 py-2">{file.statementDate}</td>
                  <td className="px-3 py-2">{file.syncedDate}</td>
                  <td className="px-3 py-2 text-right">{file.total}</td>
                  <td className="px-3 py-2 text-right">{file.pending}</td>
                  <td className="px-3 py-2 text-right">{file.saved}</td>
                  <td className="px-3 py-2 text-right">{file.synced}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <Eye size={14} />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <Save size={14} />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] font-medium">{currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <DropdownSelect
            options={['10', '20', '50', '100']}
            value={itemsPerPage.toString()}
            onChange={(val) => setItemsPerPage(parseInt(val))}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}

function FieldDropdown({
  value,
  onChange,
  availableOptions,
  placeholder = 'Select Tally Field',
  showX = false,
  onRemove,
}: {
  value: string;
  onChange: (val: string) => void;
  availableOptions: string[];
  placeholder?: string;
  showX?: boolean;
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 260; // approx max height of dropdown
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        // Open upward
        setDropdownStyle({
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          width: Math.max(rect.width, 224),
        });
      } else {
        // Open downward
        setDropdownStyle({
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(rect.width, 224),
        });
      }
    }
    setOpen(!open);
  };

  const filtered = availableOptions.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <div
        ref={triggerRef}
        className="flex items-center border border-gray-300 rounded bg-white hover:border-gray-400 transition-colors cursor-pointer"
      >
        {showX && value ? (
          <>
            <span className="flex-1 px-3 py-[6px] text-[13px] text-gray-800 truncate">{value}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
              className="px-1 py-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove mapping"
            >
              <X size={15} />
            </button>
            <button
              onClick={handleToggle}
              className="px-1 py-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown size={15} />
            </button>
          </>
        ) : (
          <button
            onClick={handleToggle}
            className="w-full flex items-center justify-between px-3 py-[6px]"
          >
            <span className={`text-[13px] truncate ${value ? 'text-gray-800' : 'text-gray-400'}`}>
              {value || placeholder}
            </span>
            <ChevronDown size={14} className="flex-shrink-0 text-gray-400 ml-2" />
          </button>
        )}
      </div>
      {open && (
        <div
          className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
          style={dropdownStyle}
        >
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-300 rounded bg-white">
              <Search size={13} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fields..."
                className="w-full text-[13px] bg-transparent outline-none text-gray-700"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="w-full px-3 py-2 text-[13px] text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-[13px] text-gray-400">No fields found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldMappingScreen({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const [mappedFields, setMappedFields] = useState<MappedField[]>(initialMappedFields);
  const [unmappedFields, setUnmappedFields] = useState<UnmappedField[]>(initialUnmappedFields);
  const [invoiceType, setInvoiceType] = useState<'accounting' | 'item'>('item');
  const [showInfoDialog, setShowInfoDialog] = useState(true);

  const usedTallyFields = mappedFields.map((f) => f.tallyField);
  const availableTallyFields = tallyFieldOptions.filter(
    (f) => !usedTallyFields.includes(f)
  );

  const handleUnmap = (field: MappedField) => {
    setMappedFields((prev) => prev.filter((f) => f.id !== field.id));
    setUnmappedFields((prev) => [
      ...prev,
      { id: field.id, sheetHeader: field.sheetHeader, sampleData: field.sampleData },
    ]);
  };

  const handleMap = (field: UnmappedField, tallyField: string) => {
    setUnmappedFields((prev) => prev.filter((f) => f.id !== field.id));
    setMappedFields((prev) => [
      ...prev,
      { id: field.id, sheetHeader: field.sheetHeader, tallyField, sampleData: field.sampleData },
    ]);
  };

  const handleChangeTallyField = (fieldId: string, newTallyField: string) => {
    setMappedFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, tallyField: newTallyField } : f))
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-[15px] font-semibold text-gray-900">Map Fields</span>
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[12px] font-bold">1</div>
            <span className="text-[13px] font-medium text-gray-700">Fields Mapping</span>
            <Info size={14} className="text-gray-400" />
          </div>
          <div className="w-32 h-px bg-gray-300 mx-3" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[12px] font-bold">2</div>
            <span className="text-[13px] font-medium text-gray-400">GST Mapping</span>
            <Info size={14} className="text-gray-300" />
          </div>
          <div className="w-32 h-px bg-gray-300 mx-3" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[12px] font-bold">3</div>
            <span className="text-[13px] font-medium text-gray-400">Ledger Mapping</span>
            <Info size={14} className="text-gray-300" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[13px] ${invoiceType === 'accounting' ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>Accounting Invoice</span>
          <button
            onClick={() => setInvoiceType(invoiceType === 'accounting' ? 'item' : 'accounting')}
            className={`relative w-11 h-6 rounded-full transition-colors ${invoiceType === 'item' ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${invoiceType === 'item' ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-[13px] ${invoiceType === 'item' ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>Item Invoice</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
            <Settings size={14} />
            Configuration
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Two Panel Layout */}
      <div className="flex-1 flex gap-0 overflow-hidden bg-white">
        {/* Left Panel — Mapped */}
        <div className="flex-1 flex flex-col border-r border-gray-200 border-l-4 border-l-green-500">
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="text-[15px] font-bold text-gray-900">Mapped</span>
            <span className="bg-blue-600 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center">{mappedFields.length}</span>
            <Info size={14} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-[160px_1fr_1fr] border-y border-gray-200 bg-white px-4 py-2">
            <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Your Sheet Header <Info size={12} className="text-gray-300" /></span>
            <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Tally Fields <Info size={12} className="text-gray-300" /></span>
            <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Your Sheet Data <Info size={12} className="text-gray-300" /></span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mappedFields.map((field) => (
              <div key={field.id} className="grid grid-cols-[160px_1fr_1fr] px-4 py-3 items-center border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="text-[13px] text-gray-700">{field.sheetHeader}</div>
                <div className="pr-4">
                  <FieldDropdown
                    value={field.tallyField}
                    onChange={(val) => handleChangeTallyField(field.id, val)}
                    availableOptions={[field.tallyField, ...availableTallyFields]}
                    showX
                    onRemove={() => handleUnmap(field)}
                  />
                </div>
                <div className="text-[13px] text-gray-500 truncate" title={field.sampleData}>{field.sampleData}</div>
              </div>
            ))}
            {mappedFields.length === 0 && (
              <div className="px-4 py-10 text-center text-[13px] text-gray-400">No mapped fields. Select a Tally field on the right to map it.</div>
            )}
          </div>
        </div>

        {/* Right Panel — Unmapped */}
        <div className="flex-1 flex flex-col border-l-4 border-l-orange-400">
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="text-[15px] font-bold text-gray-900">Unmapped</span>
            <span className="bg-orange-500 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center">{unmappedFields.length}</span>
            <Info size={14} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-[160px_1fr_1fr] border-y border-gray-200 bg-white px-4 py-2">
            <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Your Sheet Header <Info size={12} className="text-gray-300" /></span>
            <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Tally Fields <Info size={12} className="text-gray-300" /></span>
            <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Your Sheet Data <Info size={12} className="text-gray-300" /></span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {unmappedFields.map((field) => (
              <div key={field.id} className="grid grid-cols-[160px_1fr_1fr] px-4 py-3 items-center border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="text-[13px] text-gray-700">{field.sheetHeader}</div>
                <div className="pr-4">
                  <FieldDropdown
                    value=""
                    onChange={(val) => handleMap(field, val)}
                    availableOptions={availableTallyFields}
                    placeholder="Select Tally Field"
                  />
                </div>
                <div className="text-[13px] text-gray-500 truncate" title={field.sampleData}>{field.sampleData}</div>
              </div>
            ))}
            {unmappedFields.length === 0 && (
              <div className="px-4 py-10 text-center text-[13px] text-gray-400">All fields are mapped!</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-5 py-3 flex justify-end">
        <button onClick={onNext} className="px-8 py-2 text-[13px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">Next</button>
      </div>

      {/* Info Dialog */}
      {showInfoDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[420px]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <span className="text-[14px] font-semibold text-gray-900">Field Mapping Information</span>
              <button onClick={() => setShowInfoDialog(false)} className="text-red-500 hover:text-red-600"><X size={18} /></button>
            </div>
            <div className="px-5 py-5">
              <p className="text-[13px] text-gray-600">Fields are automatically selected, but you can make changes if necessary.</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowInfoDialog(false)} className="px-5 py-1.5 text-[13px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700">Ok</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GSTMappingScreen({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const [gstFromExcel, setGstFromExcel] = useState(false);
  const [gstAutoCalc, setGstAutoCalc] = useState(true);
  const [sgstLedger, setSgstLedger] = useState('Input SGST');
  const [cgstLedger, setCgstLedger] = useState('');
  const [igstLedger, setIgstLedger] = useState('');
  const [sgstNarration, setSgstNarration] = useState(false);
  const [cgstNarration, setCgstNarration] = useState(false);
  const [igstNarration, setIgstNarration] = useState(false);
  const [sgstNarrationLedger, setSgstNarrationLedger] = useState('');
  const [cgstNarrationLedger, setCgstNarrationLedger] = useState('');
  const [igstNarrationLedger, setIgstNarrationLedger] = useState('');
  const [allNarration, setAllNarration] = useState(false);
  const [enableRoundOff, setEnableRoundOff] = useState(false);
  const [roundOffLedger, setRoundOffLedger] = useState('');
  const [roundOffMethod, setRoundOffMethod] = useState('');

  // Excel sheet mode: checkboxes per row for SGST/CGST/IGST + narration
  const sheetHeaders = ['Invoice Amount', 'Tax Exclusive Gross', 'Total Tax Amount', 'Principal Amount', 'Principal Amount Basis'];
  const [excelSgst, setExcelSgst] = useState<Record<string, boolean>>({});
  const [excelCgst, setExcelCgst] = useState<Record<string, boolean>>({});
  const [excelIgst, setExcelIgst] = useState<Record<string, boolean>>({});
  const [excelNarration, setExcelNarration] = useState<Record<string, boolean>>({});
  const [excelNarrationLedgers, setExcelNarrationLedgers] = useState<Record<string, string>>({});
  const [excelAllNarration, setExcelAllNarration] = useState(false);

  // Auto Calc = No mode: checkboxes per row for SGST/CGST/IGST amounts
  const [amountSgst, setAmountSgst] = useState<Record<string, boolean>>({});
  const [amountCgst, setAmountCgst] = useState<Record<string, boolean>>({});
  const [amountIgst, setAmountIgst] = useState<Record<string, boolean>>({});

  const ledgerOptions = [
    'Input SGST',
    'Input CGST',
    'Input IGST',
    'Output SGST',
    'Output CGST',
    'Output IGST',
    'GST Payable',
    'GST Receivable',
  ];

  const narrationLedgerOptions = [
    'Narration Ledger 1',
    'Narration Ledger 2',
    'Narration Ledger 3',
    'Custom Narration',
  ];

  const roundOffMethodOptions = [
    'Normal Rounding',
    'Rounding Down',
    'Rounding Up',
    'Banker\'s Rounding',
  ];

  const handleAllNarration = (checked: boolean) => {
    setAllNarration(checked);
    setSgstNarration(checked);
    setCgstNarration(checked);
    setIgstNarration(checked);
  };

  const handleExcelAllNarration = (checked: boolean) => {
    setExcelAllNarration(checked);
    const updated: Record<string, boolean> = {};
    sheetHeaders.forEach((h) => { updated[h] = checked; });
    setExcelNarration(updated);
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-[15px] font-semibold text-gray-900">Map Fields</span>
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-[12px] font-bold"><Check size={14} /></div>
            <span className="text-[13px] font-medium text-gray-700">Fields Mapping</span>
            <Info size={14} className="text-gray-400" />
          </div>
          <div className="w-32 h-px bg-blue-500 mx-3" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[12px] font-bold">2</div>
            <span className="text-[13px] font-medium text-gray-700">GST Mapping</span>
            <Info size={14} className="text-gray-400" />
          </div>
          <div className="w-32 h-px bg-gray-300 mx-3" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[12px] font-bold">3</div>
            <span className="text-[13px] font-medium text-gray-400">Ledger Mapping</span>
            <Info size={14} className="text-gray-300" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[13px] text-gray-500">Accounting Invoice</span>
          <div className="relative w-11 h-6 rounded-full bg-blue-600">
            <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow translate-x-[22px]" />
          </div>
          <span className="text-[13px] text-gray-800 font-medium">Item Invoice</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
            <Settings size={14} />
            Configuration
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white px-5 py-4">
        {/* Toggle Questions Row */}
        <div className="flex items-center gap-6 mb-5">
          {/* GST Ledger from excel sheet? */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-gray-800">GST Ledger from excel sheet?</span>
            <Info size={14} className="text-gray-400" />
            <button
              onClick={() => setGstFromExcel(true)}
              className={`px-4 py-1 text-[12px] font-medium rounded transition-colors ${
                gstFromExcel ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setGstFromExcel(false)}
              className={`px-4 py-1 text-[12px] font-medium rounded transition-colors ${
                !gstFromExcel ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>

          {/* GST Auto Calculation? */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-gray-800">GST Auto Calculation?</span>
            <Info size={14} className="text-gray-400" />
            <button
              onClick={() => setGstAutoCalc(true)}
              className={`px-4 py-1 text-[12px] font-medium rounded transition-colors ${
                gstAutoCalc ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setGstAutoCalc(false)}
              className={`px-4 py-1 text-[12px] font-medium rounded transition-colors ${
                !gstAutoCalc ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* ==================== MODE: GST from Excel = NO ==================== */}
        {!gstFromExcel && (
          <>
            {/* GST Ledger Table with narration */}
            <div className="border border-gray-200 rounded-lg mb-5">
              {/* Table Header */}
              <div className="grid grid-cols-[180px_1fr_auto] bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Tax Ledger <Info size={12} className="text-gray-300" /></span>
                <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">GST Ledger <Info size={12} className="text-gray-300" /></span>
                <label className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 cursor-pointer min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={allNarration}
                    onChange={(e) => handleAllNarration(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300"
                  />
                  GST Narration? <Info size={12} className="text-gray-300" />
                </label>
              </div>

              {/* SGST Row */}
              <div className="grid grid-cols-[180px_1fr_auto] px-4 py-3 items-center border-b border-gray-100">
                <span className="text-[13px] text-red-500 font-medium">*SGST ledger</span>
                <div className="pr-4">
                  <FieldDropdown
                    value={sgstLedger}
                    onChange={setSgstLedger}
                    availableOptions={ledgerOptions}
                    placeholder="Select Ledger"
                    showX={!!sgstLedger}
                    onRemove={() => setSgstLedger('')}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={sgstNarration}
                    onChange={(e) => setSgstNarration(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                  {sgstNarration && (
                    <div className="flex-1">
                      <FieldDropdown
                        value={sgstNarrationLedger}
                        onChange={setSgstNarrationLedger}
                        availableOptions={narrationLedgerOptions}
                        placeholder="Select Ledger"
                        showX={!!sgstNarrationLedger}
                        onRemove={() => setSgstNarrationLedger('')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* CGST Row */}
              <div className="grid grid-cols-[180px_1fr_auto] px-4 py-3 items-center border-b border-gray-100">
                <span className="text-[13px] text-orange-500 font-medium">*CGST ledger</span>
                <div className="pr-4">
                  <FieldDropdown
                    value={cgstLedger}
                    onChange={setCgstLedger}
                    availableOptions={ledgerOptions}
                    placeholder="Select Ledger"
                    showX={!!cgstLedger}
                    onRemove={() => setCgstLedger('')}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={cgstNarration}
                    onChange={(e) => setCgstNarration(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                  {cgstNarration && (
                    <div className="flex-1">
                      <FieldDropdown
                        value={cgstNarrationLedger}
                        onChange={setCgstNarrationLedger}
                        availableOptions={narrationLedgerOptions}
                        placeholder="Select Ledger"
                        showX={!!cgstNarrationLedger}
                        onRemove={() => setCgstNarrationLedger('')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* IGST Row */}
              <div className="grid grid-cols-[180px_1fr_auto] px-4 py-3 items-center">
                <span className="text-[13px] text-green-600 font-medium">*IGST ledger</span>
                <div className="pr-4">
                  <FieldDropdown
                    value={igstLedger}
                    onChange={setIgstLedger}
                    availableOptions={ledgerOptions}
                    placeholder="Select Ledger"
                    showX={!!igstLedger}
                    onRemove={() => setIgstLedger('')}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={igstNarration}
                    onChange={(e) => setIgstNarration(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                  {igstNarration && (
                    <div className="flex-1">
                      <FieldDropdown
                        value={igstNarrationLedger}
                        onChange={setIgstNarrationLedger}
                        availableOptions={narrationLedgerOptions}
                        placeholder="Select Ledger"
                        showX={!!igstNarrationLedger}
                        onRemove={() => setIgstNarrationLedger('')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Auto Calc = No: extra amount mapping table */}
            {!gstAutoCalc && (
              <div className="border border-gray-200 rounded-lg mb-5">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                  <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Your Sheet Header <Info size={12} className="text-gray-300" /></span>
                  <span className="text-[12px] font-medium text-red-500 text-center">*SGST Ledger Amount</span>
                  <span className="text-[12px] font-medium text-orange-500 text-center">*CGST Ledger Amount</span>
                  <span className="text-[12px] font-medium text-green-600 text-center">*IGST Ledger Amount</span>
                </div>
                {sheetHeaders.map((header) => (
                  <div key={header} className="grid grid-cols-[1fr_1fr_1fr_1fr] px-4 py-3 items-center border-b border-gray-100 last:border-b-0">
                    <span className="text-[13px] text-gray-700">{header}</span>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!!amountSgst[header]}
                        onChange={(e) => setAmountSgst((prev) => ({ ...prev, [header]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!!amountCgst[header]}
                        onChange={(e) => setAmountCgst((prev) => ({ ...prev, [header]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!!amountIgst[header]}
                        onChange={(e) => setAmountIgst((prev) => ({ ...prev, [header]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ==================== MODE: GST from Excel = YES ==================== */}
        {gstFromExcel && (
          <div className="border border-gray-200 rounded-lg mb-5">
            <div className={`grid ${excelAllNarration ? 'grid-cols-[1fr_120px_120px_120px_auto]' : 'grid-cols-[1fr_1fr_1fr_1fr_auto]'} bg-gray-50 border-b border-gray-200 px-4 py-2.5`}>
              <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Your Sheet Header <Info size={12} className="text-gray-300" /></span>
              <span className="text-[12px] font-medium text-red-500">*SGST Ledger</span>
              <span className="text-[12px] font-medium text-orange-500">*CGST Ledger</span>
              <span className="text-[12px] font-medium text-green-600">*IGST Ledger</span>
              <label className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 cursor-pointer min-w-[180px]">
                <input
                  type="checkbox"
                  checked={excelAllNarration}
                  onChange={(e) => handleExcelAllNarration(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600"
                />
                Do you want to add Narration?
              </label>
            </div>
            {sheetHeaders.map((header) => (
              <div key={header} className={`grid ${excelAllNarration ? 'grid-cols-[1fr_120px_120px_120px_auto]' : 'grid-cols-[1fr_1fr_1fr_1fr_auto]'} px-4 py-3 items-center border-b border-gray-100 last:border-b-0`}>
                <span className="text-[13px] text-gray-700">{header}</span>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={!!excelSgst[header]}
                    onChange={(e) => setExcelSgst((prev) => ({ ...prev, [header]: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={!!excelCgst[header]}
                    onChange={(e) => setExcelCgst((prev) => ({ ...prev, [header]: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={!!excelIgst[header]}
                    onChange={(e) => setExcelIgst((prev) => ({ ...prev, [header]: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                </div>
                <div className="min-w-[180px]">
                  {excelAllNarration ? (
                    <div className={`${!(excelSgst[header] || excelCgst[header] || excelIgst[header]) ? 'opacity-40 pointer-events-none' : ''}`}>
                      <FieldDropdown
                        value={excelNarrationLedgers[header] || ''}
                        onChange={(val) => setExcelNarrationLedgers((prev) => ({ ...prev, [header]: val }))}
                        availableOptions={narrationLedgerOptions}
                        placeholder="Select Ledger"
                        showX={!!excelNarrationLedgers[header]}
                        onRemove={() => setExcelNarrationLedgers((prev) => ({ ...prev, [header]: '' }))}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!!excelNarration[header]}
                        onChange={(e) => setExcelNarration((prev) => ({ ...prev, [header]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enable Auto Round-Off Section — always visible */}
        <div className="border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableRoundOff}
                onChange={(e) => setEnableRoundOff(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-[14px] font-semibold text-gray-900">Enable Auto Round-Off.</span>
              <Info size={14} className="text-gray-400" />
            </label>
          </div>

          <div className={`grid grid-cols-[180px_1fr_1fr] px-4 py-3 items-center ${!enableRoundOff ? 'opacity-50 pointer-events-none' : ''}`}>
            <span className="text-[13px] text-blue-600 font-medium">Round Off Ledger</span>
            <div className="pr-4">
              <FieldDropdown
                value={roundOffLedger}
                onChange={setRoundOffLedger}
                availableOptions={ledgerOptions}
                placeholder="Select Ledger"
                showX={!!roundOffLedger}
                onRemove={() => setRoundOffLedger('')}
              />
            </div>
            <div>
              <FieldDropdown
                value={roundOffMethod}
                onChange={setRoundOffMethod}
                availableOptions={roundOffMethodOptions}
                placeholder="Select Round Off Method"
                showX={!!roundOffMethod}
                onRemove={() => setRoundOffMethod('')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-5 py-3 flex justify-end gap-2">
        <button
          onClick={onBack}
          className="px-6 py-2 text-[13px] font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-8 py-2 text-[13px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LedgerMappingScreen({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: () => void;
}) {
  // Unmapped sheet headers with sample data for ledger mapping
  const sheetRows = [
    { id: 'l1', header: 'Invoice Amount', sampleData: '999 , 299 , 283.1 ...' },
    { id: 'l2', header: 'Tax Exclusive Gross', sampleData: '846.61 , 253.39 , 239.91 ...' },
    { id: 'l3', header: 'Total Tax Amount', sampleData: '152.39 , 45.61 , 43.19 ...' },
    { id: 'l4', header: 'Principal Amount', sampleData: '999 , 299 , 298 ...' },
    { id: 'l5', header: 'Principal Amount Basis', sampleData: '846.61 , 253.39 , 252.54 ...' },
  ];

  const ledgerSelectOptions = [
    'Sundry Debtors',
    'Sundry Creditors',
    'Purchase Account',
    'Purchase Account',
    'Bank Accounts',
    'Cash',
    'Duties & Taxes',
    'Direct Expenses',
    'Indirect Expenses',
  ];

  const narrationLedgerOptions = [
    'Narration Ledger 1',
    'Narration Ledger 2',
    'Narration Ledger 3',
    'Custom Narration',
  ];

  const [selectedLedgers, setSelectedLedgers] = useState<Record<string, string>>({});
  const [narrationChecked, setNarrationChecked] = useState<Record<string, boolean>>({});
  const [narrationLedgers, setNarrationLedgers] = useState<Record<string, string>>({});
  const [allNarration, setAllNarration] = useState(false);

  const handleAllNarration = (checked: boolean) => {
    setAllNarration(checked);
    const updated: Record<string, boolean> = {};
    sheetRows.forEach((r) => { updated[r.id] = checked; });
    setNarrationChecked(updated);
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Top Header Bar — step 3 active */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-[15px] font-semibold text-gray-900">Map Fields</span>
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-[12px] font-bold"><Check size={14} /></div>
            <span className="text-[13px] font-medium text-gray-700">Fields Mapping</span>
            <Info size={14} className="text-gray-400" />
          </div>
          <div className="w-32 h-px bg-green-500 mx-3" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-[12px] font-bold"><Check size={14} /></div>
            <span className="text-[13px] font-medium text-gray-700">GST Mapping</span>
            <Info size={14} className="text-gray-400" />
          </div>
          <div className="w-32 h-px bg-blue-500 mx-3" />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[12px] font-bold">3</div>
            <span className="text-[13px] font-medium text-gray-700">Ledger Mapping</span>
            <Info size={14} className="text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[13px] text-gray-500">Accounting Invoice</span>
          <div className="relative w-11 h-6 rounded-full bg-blue-600">
            <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow translate-x-[22px]" />
          </div>
          <span className="text-[13px] text-gray-800 font-medium">Item Invoice</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
            <Settings size={14} />
            Configuration
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content — table */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-[180px_1fr_1fr_auto] border-b border-gray-200 px-5 py-2.5 bg-gray-50">
          <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Your Sheet Header <Info size={12} className="text-gray-300" /></span>
          <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">Select Your Ledger <Info size={12} className="text-gray-300" /></span>
          <span className="text-[12px] font-medium text-gray-500">Your Sheet Data</span>
          <label className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5 cursor-pointer min-w-[200px]">
            <input
              type="checkbox"
              checked={allNarration}
              onChange={(e) => handleAllNarration(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600"
            />
            Do you want to add Narration? <Info size={12} className="text-gray-300" />
          </label>
        </div>

        {/* Table Rows */}
        {sheetRows.map((row) => (
          <div key={row.id} className="grid grid-cols-[180px_1fr_1fr_auto] px-5 py-3 items-center border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-[13px] text-gray-700">{row.header}</span>
            <div className="pr-4">
              <FieldDropdown
                value={selectedLedgers[row.id] || ''}
                onChange={(val) => setSelectedLedgers((prev) => ({ ...prev, [row.id]: val }))}
                availableOptions={ledgerSelectOptions}
                placeholder="Select Your Ledger"
                showX={!!selectedLedgers[row.id]}
                onRemove={() => setSelectedLedgers((prev) => ({ ...prev, [row.id]: '' }))}
              />
            </div>
            <span className="text-[13px] text-gray-500 truncate pr-4" title={row.sampleData}>{row.sampleData}</span>
            <div className="flex items-center gap-2 min-w-[200px]">
              <input
                type="checkbox"
                checked={!!narrationChecked[row.id]}
                onChange={(e) => setNarrationChecked((prev) => ({ ...prev, [row.id]: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 accent-blue-600"
              />
              {narrationChecked[row.id] && (
                <div className="flex-1">
                  <FieldDropdown
                    value={narrationLedgers[row.id] || ''}
                    onChange={(val) => setNarrationLedgers((prev) => ({ ...prev, [row.id]: val }))}
                    availableOptions={narrationLedgerOptions}
                    placeholder="Select Ledger"
                    showX={!!narrationLedgers[row.id]}
                    onRemove={() => setNarrationLedgers((prev) => ({ ...prev, [row.id]: '' }))}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-5 py-3 flex justify-end gap-2">
        <button
          onClick={onBack}
          className="px-6 py-2 text-[13px] font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
        >
          Previous
        </button>
        <button
          className="px-6 py-2 text-[13px] font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2 text-[13px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Save & Proceed
        </button>
      </div>
    </div>
  );
}

function PurchaseTransactionsScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [transactions, setTransactions] = useState<PurchaseTransaction[]>(samplePurchaseTransactions);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showWarningDialog, setShowWarningDialog] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showCreateLedger, setShowCreateLedger] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({
    gstin: '',
    name: '',
    ledgerType: 'Sundry Debtors',
    billByBill: 'Yes',
    inventoryAffected: 'No',
    creditPeriod: '',
    mailingName: '',
    address1: '',
    address2: '',
    country: 'India',
    state: '',
    pincode: '',
    pan: '',
    registrationType: 'Regular',
    gstinUin: '',
    openingBalance: '',
    drCr: 'Cr.',
    nameType: 'trade' as 'trade' | 'business',
  });
  const [filters, setFilters] = useState({
    hideTallySynced: false,
    hideSaved: false,
    hideBlank: false,
    hideFailed: false,
    fromDate: '',
    toDate: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    referenceNo: '',
    voucherType: '',
    partyName: '',
    gstin: '',
    placeOfSupply: '',
    itemName: '',
    purchaseLedger: '',
  });
  const [bulkColumn, setBulkColumn] = useState('');
  const infoRef = useRef<HTMLButtonElement>(null);

  const stateOptions = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];
  const ledgerTypeOptions = ['Sundry Debtors','Sundry Creditors','Bank Accounts','Cash','Purchase Account','Purchase Account','Bank Charges','Indirect Expenses','Direct Expenses','Duties & Taxes','Secured Loans','Unsecured Loans','Capital Account'];

  const updateTransaction = (id: number, field: keyof PurchaseTransaction, value: string | number) => {
    setTransactions(transactions.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const allSelected = transactions.length > 0 && selectedRows.size === transactions.length;

  const partyLedgerOptions = ['Sundry Debtors', 'Cash', 'Bank Accounts'];
  const itemOptions = ['Anti Acne Soap', 'De Tan Soap', 'Muscle Relief Soap', 'Neem Soap', 'Aloe Vera Soap'];
  const purchaseLedgerOptions = ['Purchase Account', 'Purchase Return', 'Import Purchase'];
  const placeOfSupplyOptions = ['Gujarat', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Rajasthan'];
  const bulkColumnOptions = ['Party A/C Name', 'Voucher Type', 'Place of Supply', 'Item Name', 'Purchase ledger'];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Warning Dialog */}
      {showWarningDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[480px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-orange-50">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                <span className="text-[14px] font-semibold text-gray-800">Auto Ledger/Item Creation - Missing Ledgers/Items</span>
              </div>
              <button onClick={() => setShowWarningDialog(false)} className="p-1 hover:bg-gray-200 rounded">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="px-5 py-4 text-[13px] text-gray-700 space-y-3">
              <p><span className="font-semibold text-orange-600">1 Ledgers</span> are mismatched. <span className="font-semibold text-orange-600">4 Items</span> are mismatched.</p>
              <p>You can auto-create the missing Ledgers/Items by clicking the <PlusCircle size={14} className="inline text-blue-600" /> icon next to the column header.</p>
              <p className="text-[12px] text-gray-500">This will create the ledgers/items in Tally automatically when you sync.</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowWarningDialog(false)}
                className="px-5 py-2 text-[13px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                OK, Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal (Eye Icon) ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[850px] max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-[15px] font-semibold text-gray-800">Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-red-500" />
              </button>
            </div>
            <div className="px-6 pt-2 pb-0">
              <div className="border-b-2 border-blue-500 inline-block pb-1">
                <span className="text-[13px] font-medium text-blue-600">Original</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto px-6 py-3">
              <table className="w-full text-[11px] border border-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-500"></th>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-700">A</th>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-700">B</th>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-700">C</th>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-700">D</th>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-700">E</th>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-700">F</th>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-700">G</th>
                    <th className="px-3 py-2 text-left border border-gray-200 font-semibold text-gray-700">H</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 bg-blue-50/50">
                    <td className="px-3 py-2 border border-gray-200 text-gray-400 font-medium">1</td>
                    <td className="px-3 py-2 border border-gray-200 font-semibold">Name</td>
                    <td className="px-3 py-2 border border-gray-200 font-semibold">Email</td>
                    <td className="px-3 py-2 border border-gray-200 font-semibold">Financial Status</td>
                    <td className="px-3 py-2 border border-gray-200 font-semibold">Paid at</td>
                    <td className="px-3 py-2 border border-gray-200 font-semibold">Fulfillment Status</td>
                    <td className="px-3 py-2 border border-gray-200 font-semibold">Fulfilled at</td>
                    <td className="px-3 py-2 border border-gray-200 font-semibold">Accepts Marketing</td>
                    <td className="px-3 py-2 border border-gray-200 font-semibold">Currency</td>
                  </tr>
                  {[
                    { row: 2, name: '#1087', email: 'anupriya67891@gmail...', status: 'paid', paid: '2026-02-28 18:02:50 ...', fulfill: 'fulfilled', fulfilledAt: '2026-03-02 17:27:54 ...', marketing: 'no', currency: 'INR' },
                    { row: 3, name: '#1086', email: 'Chait4567@gmail.com', status: 'paid', paid: '2026-02-28 10:10:46 ...', fulfill: 'fulfilled', fulfilledAt: '2026-03-02 17:27:57 ...', marketing: 'yes', currency: 'INR' },
                    { row: 4, name: '#1085', email: 'Sudeshkamble3@gma...', status: 'paid', paid: '2026-02-28 09:45:10 ...', fulfill: 'fulfilled', fulfilledAt: '2026-03-02 17:27:57 ...', marketing: 'yes', currency: 'INR' },
                    { row: 5, name: '#1084', email: 'Adeeprm@gmail.com', status: 'paid', paid: '2026-02-28 09:15:40 ...', fulfill: 'fulfilled', fulfilledAt: '2026-03-02 17:27:51 ...', marketing: 'yes', currency: 'INR' },
                    { row: 6, name: '#1083', email: 'jesaldesai@gmail.com', status: 'paid', paid: '2026-02-28 09:07:19 ...', fulfill: 'fulfilled', fulfilledAt: '2026-03-02 17:27:52 ...', marketing: 'yes', currency: 'INR' },
                    { row: 7, name: '#1082', email: 'tanmaayranjan@gmail...', status: 'paid', paid: '2026-02-28 08:35:31 ...', fulfill: 'fulfilled', fulfilledAt: '2026-03-02 17:27:58 ...', marketing: 'yes', currency: 'INR' },
                    { row: 8, name: '#1081', email: 'arnab_art@hotmail.com', status: 'paid', paid: '2026-02-27 17:33:22 ...', fulfill: 'fulfilled', fulfilledAt: '2026-03-02 17:27:56 ...', marketing: 'yes', currency: 'INR' },
                    { row: 9, name: '#1080', email: 'jainrohan712@gmail.c...', status: 'pending', paid: '', fulfill: 'fulfilled', fulfilledAt: '2026-03-02 17:27:56 ...', marketing: 'yes', currency: 'INR' },
                    { row: 10, name: '#1080', email: 'jainrohan712@gmail.c...', status: '', paid: '', fulfill: '', fulfilledAt: '', marketing: '', currency: 'INR' },
                  ].map((r) => (
                    <tr key={r.row} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 border border-gray-200 text-gray-400 font-medium">{r.row}</td>
                      <td className="px-3 py-2 border border-gray-200">{r.name}</td>
                      <td className="px-3 py-2 border border-gray-200">{r.email}</td>
                      <td className="px-3 py-2 border border-gray-200">{r.status}</td>
                      <td className="px-3 py-2 border border-gray-200 whitespace-nowrap">{r.paid}</td>
                      <td className="px-3 py-2 border border-gray-200">{r.fulfill}</td>
                      <td className="px-3 py-2 border border-gray-200 whitespace-nowrap">{r.fulfilledAt}</td>
                      <td className="px-3 py-2 border border-gray-200">{r.marketing}</td>
                      <td className="px-3 py-2 border border-gray-200">{r.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tally Sync Status Modal (More Info Button) ── */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[700px] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-[15px] font-semibold text-gray-800">Your transactions are in progress</h3>
              <button onClick={() => setShowSyncModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-[13px] text-gray-700 font-medium">We are saving your transactions to Tally, please follow below steps:</p>
              <ul className="text-[13px] text-gray-600 space-y-2 list-disc ml-5">
                <li>Open <strong>Brego TaxOne&apos;s Tally connector app</strong> and <strong>Tally</strong> on your pc/laptop.</li>
                <li>Please make sure that you have selected <strong>company</strong> in Tally for which your are saving data.</li>
              </ul>
              <div className="grid grid-cols-4 gap-0 border border-gray-200 rounded-lg overflow-hidden mt-4">
                <div className="p-4 text-center border-r border-gray-200 bg-gray-50">
                  <p className="text-[12px] text-gray-500 font-medium">Total Saved Invoices</p>
                  <p className="text-[20px] font-bold text-gray-800 mt-1">{transactions.length}</p>
                </div>
                <div className="p-4 text-center border-r border-gray-200 bg-gray-50">
                  <p className="text-[12px] text-gray-500 font-medium">Sync Started</p>
                  <p className="text-[20px] font-bold text-gray-800 mt-1">0</p>
                </div>
                <div className="p-4 text-center border-r border-gray-200 bg-gray-50">
                  <p className="text-[12px] text-gray-500 font-medium">In Progress</p>
                  <p className="text-[20px] font-bold text-gray-800 mt-1">0</p>
                </div>
                <div className="p-4 text-center bg-gray-50">
                  <p className="text-[12px] text-gray-500 font-medium">Synced in Tally</p>
                  <p className="text-[20px] font-bold text-gray-800 mt-1">0</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-5 py-2 text-[13px] font-medium text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors"
              >
                Back to Transactions List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Ledger Modal ── */}
      {showCreateLedger && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[900px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-[15px] font-semibold text-gray-800">
                Add Ledger For <span className="text-gray-600">PAARIJAAT PERSONAL CARE PRIVATE LIMITED (100000)</span>
              </h3>
              <button onClick={() => setShowCreateLedger(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* GSTIN Row */}
              <div className="flex items-end gap-4">
                <div className="flex-1 max-w-[300px]">
                  <label className="block text-[12px] text-gray-600 mb-1">GSTIN/UIN</label>
                  <input
                    type="text"
                    value={ledgerForm.gstin}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, gstin: e.target.value })}
                    placeholder="Enter GSTIN/UIN"
                    className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button className="px-4 py-2 text-[12px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                  Get Data
                </button>
                <div className="flex items-center gap-4 ml-auto">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="nameType" checked={ledgerForm.nameType === 'trade'} onChange={() => setLedgerForm({ ...ledgerForm, nameType: 'trade' })} className="w-3.5 h-3.5 accent-blue-600" />
                    <span className="text-[12px] text-gray-700">Trade Name</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="nameType" checked={ledgerForm.nameType === 'business'} onChange={() => setLedgerForm({ ...ledgerForm, nameType: 'business' })} className="w-3.5 h-3.5 accent-blue-600" />
                    <span className="text-[12px] text-gray-700">Business Name</span>
                  </label>
                  <button className="text-[13px] text-blue-600 font-medium hover:underline">View Ledger</button>
                </div>
              </div>

              {/* Row: Name, Ledger Type, Bill by Bill, Inventory */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1"><span className="text-red-500">*</span>Name</label>
                  <input type="text" value={ledgerForm.name} onChange={(e) => setLedgerForm({ ...ledgerForm, name: e.target.value })} placeholder="Enter Name" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1"><span className="text-red-500">*</span>Ledger Type</label>
                  <select value={ledgerForm.ledgerType} onChange={(e) => setLedgerForm({ ...ledgerForm, ledgerType: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {ledgerTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Bill by Bill</label>
                  <select value={ledgerForm.billByBill} onChange={(e) => setLedgerForm({ ...ledgerForm, billByBill: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Inventory values are affected</label>
                  <select value={ledgerForm.inventoryAffected} onChange={(e) => setLedgerForm({ ...ledgerForm, inventoryAffected: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded bg-white bg-gray-100 focus:outline-none">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Row: Credit Period, Mailing Name, Address 1, Address 2 */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Credit Period(Days)</label>
                  <input type="text" value={ledgerForm.creditPeriod} onChange={(e) => setLedgerForm({ ...ledgerForm, creditPeriod: e.target.value })} placeholder="Enter Credit Period" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Mailing Name</label>
                  <input type="text" value={ledgerForm.mailingName} onChange={(e) => setLedgerForm({ ...ledgerForm, mailingName: e.target.value })} placeholder="Enter Mailing Name" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Address 1</label>
                  <input type="text" value={ledgerForm.address1} onChange={(e) => setLedgerForm({ ...ledgerForm, address1: e.target.value })} placeholder="Enter address" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Address 2</label>
                  <input type="text" value={ledgerForm.address2} onChange={(e) => setLedgerForm({ ...ledgerForm, address2: e.target.value })} placeholder="Enter address" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              {/* Row: Country, State, Pincode, PAN/IT */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Country</label>
                  <select value={ledgerForm.country} onChange={(e) => setLedgerForm({ ...ledgerForm, country: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="India">India</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">State</label>
                  <select value={ledgerForm.state} onChange={(e) => setLedgerForm({ ...ledgerForm, state: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Please select state</option>
                    {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Pincode</label>
                  <input type="text" value={ledgerForm.pincode} onChange={(e) => setLedgerForm({ ...ledgerForm, pincode: e.target.value })} placeholder="Enter pincode" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">PAN/IT</label>
                  <input type="text" value={ledgerForm.pan} onChange={(e) => setLedgerForm({ ...ledgerForm, pan: e.target.value })} placeholder="Enter PAN/IT" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              {/* Row: Registration Type, GSTIN/UIN, Opening Balance, Dr./Cr. */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Registration Type</label>
                  <select value={ledgerForm.registrationType} onChange={(e) => setLedgerForm({ ...ledgerForm, registrationType: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Regular">Regular</option>
                    <option value="Composition">Composition</option>
                    <option value="Unregistered">Unregistered</option>
                    <option value="Consumer">Consumer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">GSTIN/UIN</label>
                  <input type="text" value={ledgerForm.gstinUin} onChange={(e) => setLedgerForm({ ...ledgerForm, gstinUin: e.target.value })} placeholder="" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Opening Balance</label>
                  <input type="text" value={ledgerForm.openingBalance} onChange={(e) => setLedgerForm({ ...ledgerForm, openingBalance: e.target.value })} placeholder="Enter Opening Balance" className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1">Dr./Cr.</label>
                  <select value={ledgerForm.drCr} onChange={(e) => setLedgerForm({ ...ledgerForm, drCr: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Cr.">Cr.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowCreateLedger(false)} className="px-5 py-2 text-[13px] font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button className="px-5 py-2 text-[13px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-white/60 rounded transition-colors">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <FileText size={16} className="text-blue-600" />
          <h2 className="text-[14px] font-semibold text-gray-900">Purchase Transactions</h2>
          <span className="px-2 py-0.5 text-[11px] font-bold text-white bg-orange-500 rounded-full min-w-[24px] text-center">
            {transactions.length}
          </span>
          {/* Eye icon - Preview original file data */}
          <button onClick={() => setShowPreviewModal(true)} className="p-1 hover:bg-white/60 rounded transition-colors" title="Preview original file data">
            <Eye size={15} className="text-gray-500" />
          </button>
          {/* Info icon - Total counts tooltip */}
          <div className="relative">
            <button
              ref={infoRef}
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              className="p-1 hover:bg-white/60 rounded transition-colors"
            >
              <Info size={15} className="text-gray-500" />
            </button>
            {showInfoTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-gray-800 text-white text-[11px] rounded px-3 py-2 whitespace-nowrap z-50 shadow-lg">
                <p>Total Transactions: {transactions.length}</p>
                <p>Total Invoice: {transactions.length}</p>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
              </div>
            )}
          </div>
        </div>
        <div className="text-[12px] text-gray-600">
          Company Name: <span className="text-blue-600 font-semibold">PAARIJAAT PERSONAL CARE PRIVATE LIMITED (100000)</span>
        </div>
      </div>

      {/* Bulk Operations + General Filters + Action Buttons */}
      <div className="px-4 py-2 border-b border-gray-200 space-y-2">
        {/* Row 1: Bulk Ops left, General Filters right */}
        <div className="flex items-start justify-between gap-6">
          {/* Bulk Operations */}
          <div className="flex items-center gap-3 text-[12px]">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">Bulk Operations</span>
              <Info size={13} className="text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Update Bulk Records:</span>
              <div className="relative">
                <select
                  value={bulkColumn}
                  onChange={(e) => setBulkColumn(e.target.value)}
                  className="pl-2 pr-6 py-1 text-[11px] border border-gray-300 rounded bg-white appearance-none cursor-pointer min-w-[130px]"
                >
                  <option value="">Select Column</option>
                  {bulkColumnOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* General Filters */}
          <div className="flex items-center gap-3 text-[12px] flex-wrap">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">General Filters</span>
              <Info size={13} className="text-gray-400" />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={filters.hideTallySynced} onChange={(e) => setFilters({ ...filters, hideTallySynced: e.target.checked })} className="w-3.5 h-3.5 accent-blue-600" />
              <span className="text-gray-600">Hide Tally Synced Records</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={filters.hideSaved} onChange={(e) => setFilters({ ...filters, hideSaved: e.target.checked })} className="w-3.5 h-3.5 accent-blue-600" />
              <span className="text-gray-600">Saved Records</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={filters.hideBlank} onChange={(e) => setFilters({ ...filters, hideBlank: e.target.checked })} className="w-3.5 h-3.5 accent-blue-600" />
              <span className="text-gray-600">Blank Records</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={filters.hideFailed} onChange={(e) => setFilters({ ...filters, hideFailed: e.target.checked })} className="w-3.5 h-3.5 accent-blue-600" />
              <span className="text-gray-600">Failed Records</span>
            </label>
          </div>
        </div>

        {/* Row 2: Date filters left, Action buttons right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-gray-600 font-medium">Date:</span>
            <input
              type="text"
              placeholder="From Date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded text-[11px] w-24 text-gray-500"
            />
            <span className="text-gray-400">→</span>
            <input
              type="text"
              placeholder="To Date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded text-[11px] w-24 text-gray-500"
            />
            <Calendar size={14} className="text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSyncModal(true)}
              className="px-3 py-1.5 text-[11px] font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50 flex items-center gap-1 transition-colors"
              title="Get more data related of transaction status of your document."
            >
              <Info size={13} />
              More Info
            </button>
            <button
              onClick={() => setShowCreateLedger(true)}
              className="px-3 py-1.5 text-[11px] font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50 flex items-center gap-1 transition-colors"
              title="You can directly create a ledger from here and it will reflect in your tally company. [Press Alt + C]"
            >
              <Plus size={13} />
              Create Ledger
            </button>
            <button className="px-3 py-1.5 text-[11px] font-medium text-white bg-orange-500 rounded hover:bg-orange-600 flex items-center gap-1 transition-colors">
              <Check size={13} />
              Save
            </button>
            <button className="px-3 py-1.5 text-[11px] font-medium text-orange-600 border border-orange-300 rounded hover:bg-orange-50 transition-colors">
              Change Mapping
            </button>
            <button className="px-3 py-1.5 text-[11px] font-medium text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors">
              Send To Tally
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Collapse button on right edge */}
      <div className="relative">
        <button className="absolute right-0 top-0 z-20 bg-blue-600 text-white p-1.5 rounded-l-md hover:bg-blue-700 transition-colors">
          <ChevronsLeft size={16} />
        </button>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-[11px] border-collapse">
          {/* Column Headers */}
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              <th className="px-2 py-2 text-left border-r border-gray-200 bg-gray-50 w-[36px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedRows(new Set(transactions.map((t) => t.id)));
                    else setSelectedRows(new Set());
                  }}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap">Sr.No</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap">
                <div className="flex items-center gap-1">Date <Info size={11} className="text-gray-400" /></div>
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[100px]">Reference No</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[100px]">Voucher Type</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[140px]">
                <div className="flex items-center gap-1">
                  Party A/C Name
                  <AlertTriangle size={11} className="text-orange-400" />
                  <button className="hover:bg-blue-100 rounded-full p-0.5"><PlusCircle size={13} className="text-blue-500" /></button>
                </div>
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[130px]">GSTIN/UIN</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[110px]">Place of Supply</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[140px]">
                <div className="flex items-center gap-1">
                  Item Name
                  <AlertTriangle size={11} className="text-orange-400" />
                </div>
              </th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 w-[36px]">
                <button className="hover:bg-blue-100 rounded-full p-0.5"><PlusCircle size={14} className="text-blue-500" /></button>
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[110px]">Item Narration</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[70px]">Quantity</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[70px]">Rate</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[80px]">Amount</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[120px]">
                <div className="flex items-center gap-1">
                  Sales ledger
                  <AlertTriangle size={11} className="text-orange-400" />
                </div>
              </th>
              <th className="px-2 py-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[80px]">Input SGST</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[80px]">Input CGST</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[80px]">Input IGST</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[100px]">Narration</th>
              <th className="px-2 py-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[90px]">Total Amount</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-700 bg-gray-50 whitespace-nowrap w-[60px]">Action</th>
            </tr>
            {/* Search filter row */}
            <tr className="border-b border-gray-200 bg-white">
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200">
                <input type="text" placeholder="Se..." className="w-full px-1.5 py-1 text-[10px] border border-gray-300 rounded bg-white" />
              </th>
              <th className="px-1 py-1 border-r border-gray-200">
                <input type="text" placeholder="Search" value={searchFilters.referenceNo} onChange={(e) => setSearchFilters({ ...searchFilters, referenceNo: e.target.value })} className="w-full px-1.5 py-1 text-[10px] border border-gray-300 rounded bg-white" />
              </th>
              <th className="px-1 py-1 border-r border-gray-200">
                <input type="text" placeholder="Search" value={searchFilters.voucherType} onChange={(e) => setSearchFilters({ ...searchFilters, voucherType: e.target.value })} className="w-full px-1.5 py-1 text-[10px] border border-gray-300 rounded bg-white" />
              </th>
              <th className="px-1 py-1 border-r border-gray-200">
                <input type="text" placeholder="Search" value={searchFilters.partyName} onChange={(e) => setSearchFilters({ ...searchFilters, partyName: e.target.value })} className="w-full px-1.5 py-1 text-[10px] border border-gray-300 rounded bg-white" />
              </th>
              <th className="px-1 py-1 border-r border-gray-200">
                <input type="text" placeholder="Search" value={searchFilters.gstin} onChange={(e) => setSearchFilters({ ...searchFilters, gstin: e.target.value })} className="w-full px-1.5 py-1 text-[10px] border border-gray-300 rounded bg-white" />
              </th>
              <th className="px-1 py-1 border-r border-gray-200">
                <input type="text" placeholder="Search" value={searchFilters.placeOfSupply} onChange={(e) => setSearchFilters({ ...searchFilters, placeOfSupply: e.target.value })} className="w-full px-1.5 py-1 text-[10px] border border-gray-300 rounded bg-white" />
              </th>
              <th className="px-1 py-1 border-r border-gray-200">
                <input type="text" placeholder="Search" value={searchFilters.itemName} onChange={(e) => setSearchFilters({ ...searchFilters, itemName: e.target.value })} className="w-full px-1.5 py-1 text-[10px] border border-gray-300 rounded bg-white" />
              </th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200">
                <input type="text" placeholder="Search" value={searchFilters.purchaseLedger} onChange={(e) => setSearchFilters({ ...searchFilters, purchaseLedger: e.target.value })} className="w-full px-1.5 py-1 text-[10px] border border-gray-300 rounded bg-white" />
              </th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1 border-r border-gray-200"></th>
              <th className="px-1 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-200 hover:bg-blue-50/30 transition-colors">
                <td className="px-2 py-2 border-r border-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(tx.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedRows);
                      if (e.target.checked) newSet.add(tx.id);
                      else newSet.delete(tx.id);
                      setSelectedRows(newSet);
                    }}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                </td>
                <td className="px-2 py-2 text-gray-600 border-r border-gray-100">{tx.id}</td>
                <td className="px-2 py-2 text-gray-700 border-r border-gray-100 whitespace-nowrap">{tx.date}</td>
                <td className="px-2 py-2 border-r border-gray-100 whitespace-nowrap">{tx.refNo}</td>
                <td className="px-2 py-2 border-r border-gray-100">
                  <span className="text-blue-600 font-medium cursor-pointer hover:underline">{tx.voucherType}</span>
                </td>
                <td className="px-2 py-2 border-r border-gray-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-orange-600 text-[10px]">0</span>
                    <div className="relative">
                      <select
                        value={tx.partyLedger}
                        onChange={(e) => updateTransaction(tx.id, 'partyLedger', e.target.value)}
                        className="w-full pl-1.5 pr-5 py-0.5 text-[10px] border border-gray-300 rounded bg-white appearance-none cursor-pointer text-gray-500"
                      >
                        <option value="">Select Ledger</option>
                        {partyLedgerOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 text-gray-700 border-r border-gray-100 text-[10px] whitespace-nowrap">{tx.gstin}</td>
                <td className="px-2 py-2 border-r border-gray-100">
                  <div className="relative">
                    <select
                      value={tx.placeOfSupply}
                      onChange={(e) => updateTransaction(tx.id, 'placeOfSupply', e.target.value)}
                      className="w-full pl-1.5 pr-5 py-0.5 text-[10px] border border-gray-300 rounded bg-white appearance-none cursor-pointer"
                    >
                      {placeOfSupplyOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-2 py-2 border-r border-gray-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-red-600 text-[10px] font-medium">{tx.itemCode}</span>
                    <div className="relative">
                      <select
                        value={tx.itemLedger}
                        onChange={(e) => updateTransaction(tx.id, 'itemLedger', e.target.value)}
                        className="w-full pl-1.5 pr-5 py-0.5 text-[10px] border border-gray-300 rounded bg-white appearance-none cursor-pointer text-gray-500"
                      >
                        <option value="">Select Item</option>
                        {itemOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 border-r border-gray-100 text-center">
                  <button className="p-0.5 hover:bg-gray-100 rounded"><Eye size={13} className="text-gray-400" /></button>
                </td>
                <td className="px-2 py-2 text-gray-600 border-r border-gray-100">{tx.itemNarration}</td>
                <td className="px-2 py-2 text-right text-gray-700 border-r border-gray-100">{tx.quantity}</td>
                <td className="px-2 py-2 text-right text-gray-700 border-r border-gray-100"></td>
                <td className="px-2 py-2 text-right text-gray-700 font-medium border-r border-gray-100">{tx.amount.toFixed(2)}</td>
                <td className="px-2 py-2 border-r border-gray-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-orange-600 text-[10px]">0</span>
                    <div className="relative">
                      <select
                        value={tx.purchaseLedger}
                        onChange={(e) => updateTransaction(tx.id, 'purchaseLedger', e.target.value)}
                        className="w-full pl-1.5 pr-5 py-0.5 text-[10px] border border-gray-300 rounded bg-white appearance-none cursor-pointer text-gray-500"
                      >
                        <option value="">Select Ledger</option>
                        {purchaseLedgerOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 text-right text-gray-500 border-r border-gray-100">0.00</td>
                <td className="px-2 py-2 text-right text-gray-500 border-r border-gray-100">0.00</td>
                <td className="px-2 py-2 text-right text-gray-500 border-r border-gray-100">0.00</td>
                <td className="px-2 py-2 text-gray-500 border-r border-gray-100"></td>
                <td className="px-2 py-2 text-right text-gray-500 border-r border-gray-100">0.00</td>
                <td className="px-2 py-2 text-center">
                  <button className="p-1 hover:bg-red-50 rounded transition-colors">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: Totals Row */}
      <div className="border-t-2 border-gray-300 bg-gray-50">
        <table className="w-full text-[11px]">
          <tbody>
            <tr className="font-semibold text-gray-700">
              <td className="px-2 py-2 w-[36px]"></td>
              <td className="px-2 py-2 text-gray-900">Total</td>
              <td className="px-2 py-2 font-bold">{transactions.length}</td>
              <td className="px-2 py-2"></td>
              <td className="px-2 py-2 font-bold">0</td>
              <td className="px-2 py-2"></td>
              <td className="px-2 py-2 font-bold">0</td>
              <td className="px-2 py-2" colSpan={4}></td>
              <td className="px-2 py-2"></td>
              <td className="px-2 py-2"></td>
              <td className="px-2 py-2 text-right font-bold">{totalAmount.toFixed(2)}</td>
              <td className="px-2 py-2" colSpan={7}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 bg-white px-4 py-1.5 flex items-center justify-end gap-1">
        <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-40" disabled>
          <ChevronFirst size={14} className="text-gray-500" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-40" disabled>
          <ChevronLeft size={14} className="text-gray-500" />
        </button>
        <span className="text-[11px] text-gray-600 px-2">Page <strong>1</strong> of <strong>1</strong></span>
        <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-40" disabled>
          <ChevronRight size={14} className="text-gray-500" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-40" disabled>
          <ChevronLast size={14} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export default function PurchaseWorkflow({ onBack, screen, onNext, useRouter: useRouterNav }: PurchaseWorkflowProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(screen || 'purchase-table');

  // Router-driven mode: render only the specified screen — full height, no padding
  if (screen) {
    return (
      <div className="w-full flex-1 flex flex-col overflow-hidden min-h-0">
        {screen === 'field-mapping' && (
          <FieldMappingScreen
            onBack={onBack || (() => {})}
            onNext={onNext || (() => {})}
          />
        )}
        {screen === 'gst-mapping' && (
          <GSTMappingScreen
            onBack={onBack || (() => {})}
            onNext={onNext || (() => {})}
          />
        )}
        {screen === 'ledger-mapping' && (
          <LedgerMappingScreen
            onBack={onBack || (() => {})}
            onSave={onNext || (() => {})}
          />
        )}
        {screen === 'purchase-transactions' && (
          <PurchaseTransactionsScreen onBack={onBack || (() => {})} />
        )}
      </div>
    );
  }

  // Legacy internal-state mode: purchase-table with file click navigation
  const handleSelectFile = (fileId: number) => {
    if (useRouterNav && typeof window !== 'undefined') {
      // Router mode: navigate to the purchase file field-mapping URL
      window.location.href = `/app/da/purchase/${fileId}/field-mapping`;
      return;
    }
    // Fallback: demo mode with internal state
    setCurrentScreen('field-mapping');
  };

  const handleGoBack = () => {
    if (currentScreen === 'field-mapping') {
      setCurrentScreen('purchase-table');
    } else if (currentScreen === 'gst-mapping') {
      setCurrentScreen('field-mapping');
    } else if (currentScreen === 'ledger-mapping') {
      setCurrentScreen('gst-mapping');
    } else if (currentScreen === 'purchase-transactions') {
      setCurrentScreen('purchase-table');
    }
  };

  // Purchase table gets padded wrapper; workflow screens get full-height wrapper
  if (currentScreen === 'purchase-table') {
    return (
      <div className="w-full bg-gray-100 rounded-lg p-4">
        <PurchaseTableScreen onSelectFile={handleSelectFile} />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden min-h-0">
      {currentScreen === 'field-mapping' && (
        <FieldMappingScreen
          onBack={handleGoBack}
          onNext={() => setCurrentScreen('gst-mapping')}
        />
      )}

      {currentScreen === 'gst-mapping' && (
        <GSTMappingScreen
          onBack={handleGoBack}
          onNext={() => setCurrentScreen('ledger-mapping')}
        />
      )}

      {currentScreen === 'ledger-mapping' && (
        <LedgerMappingScreen
          onBack={handleGoBack}
          onSave={() => setCurrentScreen('purchase-transactions')}
        />
      )}

      {currentScreen === 'purchase-transactions' && (
        <PurchaseTransactionsScreen onBack={() => setCurrentScreen('purchase-table')} />
      )}
    </div>
  );
}
