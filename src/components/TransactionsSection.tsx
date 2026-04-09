'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Plus,
  Upload,
  Image as ImageIcon,
  Share2,
  Trash2,
  ArrowUpDown,
  Filter,
  FileUp,
  X,
  ArrowLeft,
  PlusCircle,
  Smile,
  Trash,
  Calendar,
} from 'lucide-react';

// ─── Types ───
interface TransactionRow {
  id: number;
  srNo: number;
  date: string;
  voucherType: string;
  invoiceNo: string;
  partyName: string;
  totalAmount: number;
  syncStatus: string;
}

// ─── Sample Data ───
const salesData: TransactionRow[] = [
  { id: 1, srNo: 1, date: '2026-03-20', voucherType: 'Sales', invoiceNo: 'AdiSkt-RCT-2526-002771', partyName: 'Mr. A KEMPAPPA', totalAmount: 0, syncStatus: 'Draft' },
];

const purchaseData: TransactionRow[] = [
  { id: 1, srNo: 1, date: '2026-01-28', voucherType: 'Purchase', invoiceNo: 'BL/2025-28/637', partyName: 'Burgeon Law LLP', totalAmount: 0, syncStatus: 'Draft' },
];

// ─── Voucher Form Data ───
const ACCOUNT_OPTIONS = [
  'Cash',
  'HDFC BANK Ltd - 999001088220060',
  'ICICI Bank - 002105500890',
  'State Bank of India - 38706325498',
  'Axis Bank - 917020043065279',
  'Kotak Mahindra Bank - 4811558498',
  'Punjab National Bank - 0108000100565892',
  'Bank of Baroda - 33720100005142',
  'Yes Bank - 004194600000711',
  'IndusInd Bank - 201001507653',
];

const PARTICULARS_OPTIONS = [
  'Sundry Creditors',
  'Sundry Debtors',
  'Bank Accounts',
  'Cash',
  'Sales Account',
  'Purchase Account',
  'Bank Charges',
  'Software & Technology Expenses',
  'Razorpay',
  'Loan Account',
  'Capital Account',
  'Indirect Expenses',
  'Direct Expenses',
  'Duties & Taxes',
  'Secured Loans',
  'Unsecured Loans',
  'Rent & Lease',
  'Salary & Wages',
  'Office Expenses',
  'Travelling Expenses',
  'Telephone Expenses',
  'Electricity Charges',
  'Professional Fees',
  'Audit Fees',
  'Legal & Professional Charges',
  'Repairs & Maintenance',
  'Printing & Stationery',
  'Postage & Courier',
  'Insurance',
  'Advertisement',
];

interface ParticularsRow {
  id: number;
  particulars: string;
  amount: string;
}

// ─── Tab Config ───
const TXN_TABS = ['Sales', 'Purchase', 'Payment', 'Receipt', 'Contra'] as const;
type TxnTab = typeof TXN_TABS[number];
const SALES_INVOICE_SRC = '/wireframes/sales-invoice/index.html';

interface TabConfig {
  variant: 'table' | 'workflow';
  title: string;
  createOptions?: string[];
  workflowSteps?: { title: string; desc: string }[];
}

const TAB_CONFIG: Record<TxnTab, TabConfig> = {
  Sales: {
    variant: 'table',
    title: 'Sales',
    createOptions: ['Sales', 'Sales Return'],
  },
  Purchase: {
    variant: 'table',
    title: 'Purchase',
    createOptions: ['Purchase', 'Purchase Return'],
  },
  Payment: {
    variant: 'workflow',
    title: 'Payment',
    workflowSteps: [
      { title: 'Upload', desc: 'Click on the Payment button to create the Payment' },
      { title: 'Map the sheet data', desc: 'Map the data with Tally fields' },
      { title: 'Save Transaction', desc: 'Select the ledger, other details and click on the save button' },
      { title: 'Send to Tally', desc: 'Click on save button to save the Payment' },
    ],
  },
  Receipt: {
    variant: 'workflow',
    title: 'Receipt',
    workflowSteps: [
      { title: 'Upload', desc: 'Click on the Receipt button to create the Receipt' },
      { title: 'Map the sheet data', desc: 'Map the data with Tally fields' },
      { title: 'Save Transaction', desc: 'Select the ledger, other details and click on the save button' },
      { title: 'Send to Tally', desc: 'Click on save button to save the Receipt' },
    ],
  },
  Contra: {
    variant: 'workflow',
    title: 'Contra',
    workflowSteps: [
      { title: 'Upload', desc: 'Click on the Contra button to create the Contra' },
      { title: 'Map the sheet data', desc: 'Map the data with Tally fields' },
      { title: 'Save Transaction', desc: 'Select the ledger, other details and click on the save button' },
      { title: 'Send to Tally', desc: 'Click on save button to save the Contra' },
    ],
  },
};

// ─── Component ───
export default function TransactionsSection() {
  const [activeTab, setActiveTab] = useState<TxnTab>('Sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeInvoiceId, setActiveInvoiceId] = useState<number | null>(null);

  // Create voucher form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formAccount, setFormAccount] = useState('');
  const [formAccountSearch, setFormAccountSearch] = useState('');
  const [formAccountOpen, setFormAccountOpen] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formParticularsRows, setFormParticularsRows] = useState<ParticularsRow[]>([
    { id: 1, particulars: '', amount: '' },
  ]);
  const [formNarration, setFormNarration] = useState('');
  const [activeParticularsDropdown, setActiveParticularsDropdown] = useState<number | null>(null);
  const [particularsSearch, setParticularsSearch] = useState('');

  const createRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const particularsDropdownRef = useRef<HTMLDivElement>(null);

  const config = TAB_CONFIG[activeTab];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setCreateDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setFormAccountOpen(false);
      }
      if (particularsDropdownRef.current && !particularsDropdownRef.current.contains(event.target as Node)) {
        setActiveParticularsDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const syncInvoiceStateFromHistory = () => {
      const id = Number(window.history.state?.salesInvoiceId);

      if (Number.isFinite(id) && id > 0) {
        setActiveInvoiceId(id);
        setActiveTab('Sales');
        return;
      }

      setActiveInvoiceId(null);
    };

    const handleInvoiceMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'close-sales-invoice') {
        if (window.history.state?.salesInvoiceId) {
          window.history.back();
        } else {
          setActiveInvoiceId(null);
        }
      }
    };

    syncInvoiceStateFromHistory();
    window.addEventListener('popstate', syncInvoiceStateFromHistory);
    window.addEventListener('message', handleInvoiceMessage);

    return () => {
      window.removeEventListener('popstate', syncInvoiceStateFromHistory);
      window.removeEventListener('message', handleInvoiceMessage);
    };
  }, []);

  // Form helpers
  const formTotal = formParticularsRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

  const addParticularsRow = () => {
    const newId = formParticularsRows.length > 0 ? Math.max(...formParticularsRows.map(r => r.id)) + 1 : 1;
    setFormParticularsRows([...formParticularsRows, { id: newId, particulars: '', amount: '' }]);
  };

  const removeParticularsRow = (id: number) => {
    if (formParticularsRows.length > 1) {
      setFormParticularsRows(formParticularsRows.filter(r => r.id !== id));
    }
  };

  const updateParticularsRow = (id: number, field: 'particulars' | 'amount', value: string) => {
    setFormParticularsRows(formParticularsRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const resetForm = () => {
    setFormAccount('');
    setFormAccountSearch('');
    setFormDate('');
    setFormParticularsRows([{ id: 1, particulars: '', amount: '' }]);
    setFormNarration('');
    setShowCreateForm(false);
  };

  const filteredAccountOptions = ACCOUNT_OPTIONS.filter(opt =>
    opt.toLowerCase().includes(formAccountSearch.toLowerCase())
  );

  const filteredParticularsOptions = PARTICULARS_OPTIONS.filter(opt =>
    opt.toLowerCase().includes(particularsSearch.toLowerCase())
  );

  // Get data for current tab
  const getTableData = (): TransactionRow[] => {
    if (activeTab === 'Sales') return salesData;
    if (activeTab === 'Purchase') return purchaseData;
    return [];
  };

  const filteredData = getTableData().filter((row) =>
    searchQuery
      ? row.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.voucherType.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // ─── Create Voucher Form View ───
  const openSalesInvoice = (rowId: number) => {
    setActiveTab('Sales');
    setActiveInvoiceId(rowId);
    window.history.pushState(
      { ...(window.history.state ?? {}), salesInvoiceId: rowId },
      '',
      window.location.href,
    );
  };

  if (activeInvoiceId !== null) {
    return (
      <div className="h-full bg-slate-100">
        <iframe
          title="Sales invoice wireframe"
          src={SALES_INVOICE_SRC}
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="h-[50px] border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-base font-bold text-gray-900">Add {config.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">PAARIJAAT PERSONAL CARE PRIVATE...</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="max-w-[650px] mx-auto">
            {/* Form Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              {/* Row 1: Account + Date */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Account */}
                <div ref={accountDropdownRef} className="relative">
                  <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">
                    <span className="text-red-500">*</span>Account
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Account"
                      value={formAccountOpen ? formAccountSearch : formAccount}
                      onChange={(e) => {
                        setFormAccountSearch(e.target.value);
                        setFormAccountOpen(true);
                      }}
                      onFocus={() => {
                        setFormAccountOpen(true);
                        setFormAccountSearch(formAccount);
                      }}
                      className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 pr-8"
                    />
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                      onClick={() => setFormAccountOpen(!formAccountOpen)}
                    />
                  </div>
                  {formAccountOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-[200px] overflow-auto">
                      {filteredAccountOptions.length > 0 ? (
                        filteredAccountOptions.map((opt) => (
                          <button
                            key={opt}
                            className="w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              setFormAccount(opt);
                              setFormAccountSearch(opt);
                              setFormAccountOpen(false);
                            }}
                          >
                            {opt}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-[12px] text-gray-400">No results found</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">
                    <span className="text-red-500">*</span> Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Date"
                      value={formDate}
                      onFocus={(e) => { e.target.type = 'date'; }}
                      onBlur={(e) => { if (!formDate) e.target.type = 'text'; }}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 pr-8"
                    />
                    <Calendar
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Particulars Rows */}
              {formParticularsRows.map((row, idx) => (
                <div key={row.id} className="grid grid-cols-2 gap-6 mb-3">
                  {/* Particulars */}
                  <div ref={activeParticularsDropdown === row.id ? particularsDropdownRef : undefined} className="relative">
                    <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">
                      <span className="text-red-500">*</span>Particulars
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select Particulars"
                        value={activeParticularsDropdown === row.id ? particularsSearch : row.particulars}
                        onChange={(e) => {
                          setParticularsSearch(e.target.value);
                          setActiveParticularsDropdown(row.id);
                        }}
                        onFocus={() => {
                          setActiveParticularsDropdown(row.id);
                          setParticularsSearch(row.particulars);
                        }}
                        className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 pr-8"
                      />
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                        onClick={() => setActiveParticularsDropdown(activeParticularsDropdown === row.id ? null : row.id)}
                      />
                    </div>
                    {activeParticularsDropdown === row.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-[200px] overflow-auto">
                        {filteredParticularsOptions.length > 0 ? (
                          filteredParticularsOptions.map((opt) => (
                            <button
                              key={opt}
                              className="w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-blue-50 transition-colors"
                              onClick={() => {
                                updateParticularsRow(row.id, 'particulars', opt);
                                setActiveParticularsDropdown(null);
                                setParticularsSearch('');
                              }}
                            >
                              {opt}
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-2 text-[12px] text-gray-400">No results found</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">
                      <span className="text-red-500">*</span>Amount
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter Amount"
                        value={row.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            updateParticularsRow(row.id, 'amount', val);
                          }
                        }}
                        className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                      />
                      {formParticularsRows.length > 1 && (
                        <button
                          onClick={() => removeParticularsRow(row.id)}
                          className="text-red-400 hover:text-red-600 flex-shrink-0"
                        >
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add row + Total */}
              <div className="flex items-center justify-between mt-2 mb-6 pt-2 border-t border-gray-100">
                <button
                  onClick={addParticularsRow}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <PlusCircle size={20} />
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-semibold text-gray-800">Total</span>
                  <span className="text-[13px] font-bold text-gray-900 min-w-[60px] text-right">
                    {formTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <button className="text-blue-500 hover:text-blue-700">
                  <Smile size={20} />
                </button>
              </div>

              {/* Narration */}
              <div className="mb-4">
                <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">Narration</label>
                <textarea
                  placeholder="Enter Narration"
                  value={formNarration}
                  onChange={(e) => setFormNarration(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 resize-y"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-200">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-600 text-[13px] font-medium rounded hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ─── Header Bar ─── */}
      <div className="h-[50px] border-b border-gray-200 px-6 flex items-center justify-between bg-white">
        {/* Left: Title + Search */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Transactions</h1>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search from..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 w-[220px] text-[12px] border border-gray-300 rounded text-gray-600 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Right: Company info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">PAARIJAAT PERSONAL CARE PRIVATE...</p>
            <p className="text-[11px] text-gray-500">01/04/2026 - 31/03/2027</p>
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
      </div>

      {/* ─── Tab Bar ─── */}
      <div className="border-b border-gray-200 px-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-8">
          {TXN_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCreateDropdownOpen(false); }}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-indigo-500 border-indigo-500'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          {config.variant === 'table' && (
            <>
              {/* Upload Image button */}
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[12px] font-medium rounded transition-colors"
              >
                <ImageIcon size={14} />
                Upload Image
                <ChevronDown size={12} />
              </button>

              {/* Create Bill dropdown */}
              <div className="relative" ref={createRef}>
                <button
                  onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
                >
                  <Plus size={14} />
                  Create Bill
                  <ChevronDown size={12} />
                </button>
                {createDropdownOpen && config.createOptions && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-20">
                    {config.createOptions.map((opt) => (
                      <button
                        key={opt}
                        className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setCreateDropdownOpen(false)}
                      >
                        <Plus size={12} className="text-gray-400" />
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {config.variant === 'workflow' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
            >
              <Plus size={14} />
              Create
            </button>
          )}

          {/* YouTube + Grid */}
          <button className="w-7 h-7 bg-red-600 rounded flex items-center justify-center hover:bg-red-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
              <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" fill="#dc2626" />
            </svg>
          </button>
          <button className="w-7 h-7 border border-blue-500 rounded flex items-center justify-center hover:bg-blue-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="flex-1 overflow-auto bg-white">
        {config.variant === 'table' ? (
          /* ── Table View (Sales / Purchase) ── */
          <div>
            <table className="w-full border-collapse text-[12px]">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left w-8">
                    <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" />
                  </th>
                  <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px]">
                    <span className="flex items-center gap-1">Sr.No. <Filter size={10} className="text-gray-400" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px]">
                    <span className="flex items-center gap-1">Date <Filter size={10} className="text-gray-400" /> <ArrowUpDown size={10} className="text-gray-400" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px]">
                    <span className="flex items-center gap-1">Voucher Type <Filter size={10} className="text-gray-400" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px]">
                    <span className="flex items-center gap-1">Invoice No. <ArrowUpDown size={10} className="text-gray-400" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px]">Party Name</th>
                  <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px]">Total Amount</th>
                  <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px]">
                    <span className="flex items-center gap-1">Sync Status <Filter size={10} className="text-gray-400" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-center text-gray-500 font-semibold text-[11px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 transition-colors ${
                      activeTab === 'Sales'
                        ? 'cursor-pointer hover:bg-blue-50/30'
                        : 'hover:bg-blue-50/30'
                    }`}
                    onClick={() => {
                      if (activeTab === 'Sales') {
                        openSalesInvoice(row.id);
                      }
                    }}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 cursor-pointer"
                        onClick={(event) => event.stopPropagation()}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded bg-green-100 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
                        </span>
                        {row.srNo}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.date}</td>
                    <td className="px-3 py-2.5 text-gray-700">{row.voucherType}</td>
                    <td className="px-3 py-2.5 text-gray-700">{row.invoiceNo}</td>
                    <td className="px-3 py-2.5 text-gray-700">{row.partyName}</td>
                    <td className="px-3 py-2.5 text-gray-700">{row.totalAmount}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-medium ${
                        row.syncStatus === 'Draft' ? 'text-orange-500' : 'text-green-600'
                      }`}>
                        {row.syncStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div
                        className="flex items-center justify-center gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button className="text-gray-400 hover:text-gray-600"><Share2 size={14} /></button>
                        <button className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-gray-400 text-[13px]">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Workflow View (Payment / Receipt / Contra) ── */
          <div className="flex flex-col items-center py-8 px-6">
            <p className="text-[13px] text-blue-600 font-medium mb-8">
              Please follow below the steps to create a {config.title}
            </p>

            {/* YouTube Video Placeholder */}
            <div className="w-[500px] h-[200px] bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mb-8 relative overflow-hidden">
              <div className="text-center text-white">
                <p className="text-[11px] opacity-80 mb-1">Brego Business</p>
                <p className="text-lg font-bold">{config.title} Voucher Creation</p>
                <p className="text-sm">Step by Step Tutorial</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-10 bg-red-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="10,8 16,12 10,16" /></svg>
                </div>
              </div>
            </div>

            {/* Stepper */}
            {config.workflowSteps && (
              <div className="w-full max-w-[900px]">
                {/* Step numbers with connecting line */}
                <div className="relative flex items-center justify-between mb-4">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 -translate-y-1/2" />
                  {config.workflowSteps.map((_, idx) => (
                    <div key={idx} className="relative z-10 w-8 h-8 rounded-full bg-blue-500 text-white text-[13px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                  ))}
                </div>

                {/* Step cards */}
                <div className="grid grid-cols-4 gap-4">
                  {config.workflowSteps.map((step, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 text-center">
                      <h4 className="text-[13px] font-semibold text-gray-800 mb-1">{step.title}</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {idx === 0 ? (
                          <>
                            <a href="#" className="text-blue-500 underline">Click on the {config.title}</a> button to create the {config.title}
                          </>
                        ) : (
                          step.desc
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer doc link */}
            <div className="flex items-center gap-2 mt-10">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <span className="text-[10px] text-gray-500">BB</span>
              </div>
              <p className="text-[12px] text-gray-600">
                If you want to read documentation: <a href="#" className="text-blue-500 underline">Click here</a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Upload Image Modal ─── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[460px]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Upload {config.title}</h2>
              <button onClick={() => { setUploadModalOpen(false); setUploadedFile(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Drag & Drop */}
            <div className="px-6 pt-5 pb-3">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-blue-400 bg-blue-50' : uploadedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) setUploadedFile(f); }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileUp className="w-6 h-6 text-blue-500" />
                  </div>
                  {uploadedFile ? (
                    <div>
                      <p className="text-[13px] font-medium text-gray-800">{uploadedFile.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <p className="text-[13px] text-gray-500">Drag and drop a file here or</p>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 text-[12px] text-gray-700 font-medium rounded hover:bg-gray-100"
                  >
                    <Upload size={14} />
                    Click to upload Image/PDF
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedFile(f); }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="px-6 pb-4">
              <p className="text-[12px] font-semibold text-gray-700 mb-1.5">Notes:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-600">
                <li>Please make sure you can upload 10 invoices at a time.</li>
                <li>Please make sure the file size must not exceed 5MB.</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={() => { setUploadModalOpen(false); setUploadedFile(null); }}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { setUploadModalOpen(false); setUploadedFile(null); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}