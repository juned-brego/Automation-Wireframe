'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  Plus,
  Save,
  Info,
  ArrowUpDown,
  Filter,
  ChevronDown,
  Trash2,
  PlusCircle,
  X,
} from 'lucide-react';

interface Transaction {
  id: number;
  srNo: number;
  date: string;
  description: string;
  type: 'Payment' | 'Receipt';
  amount: number;
  suggestedLedger: string;
  suggestedLedgerIcon: boolean;
  ledger: string;
}

interface LedgerEntry {
  ledger: string;
  amount: string;
}

const initialTransactions: Transaction[] = [
  { id: 1, srNo: 1, date: '01/04/2025', description: 'NEFT-UTIBOCCH274-C344440104251 42509--SMPL37704H944484-SHREE MARUTIINTEGRATEDLOGISTICSLIMITE D', type: 'Payment', amount: 21138, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 2, srNo: 2, date: '01/04/2025', description: 'NEFT-BKID0006660-C226110104251S3 B4D--666020100003047-FLYHOLIDAY DREAMEFTINAUELAAAACIAENTHPVTLTD', type: 'Payment', amount: 39875, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 3, srNo: 3, date: '01/04/2025', description: 'FT-HDFC0000004-C232380104251S3 B4D--50100304245367-QURESHMUNIR ML', type: 'Payment', amount: 15000, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 4, srNo: 4, date: '01/04/2025', description: 'IBILPAYDR-HDFCYC-463918xxxxxx7 034', type: 'Payment', amount: 40000, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 5, srNo: 5, date: '02/04/2025', description: 'NEFTCR-UTIB0001506-RAZORPAYSOF TWAREPRIVATELIMITED-NODALACCO UNT-SVACOUTUREPRIVATELIMITED-U', type: 'Receipt', amount: 41670.72, suggestedLedger: 'Razorpay', suggestedLedgerIcon: true, ledger: '' },
  { id: 6, srNo: 6, date: '02/04/2025', description: '054219300008266-TPT-LOANRETURN- PARASIDINATHIMODI', type: 'Payment', amount: 530000, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 7, srNo: 7, date: '02/04/2025', description: 'IBILPAYDR-HDFCVI-437548xxxxxx51 34', type: 'Payment', amount: 190080, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 8, srNo: 8, date: '02/04/2025', description: '054219300008266-TPT-DRMARCH25-P ARASIDINANATHIMODI', type: 'Payment', amount: 70000, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 9, srNo: 9, date: '02/04/2025', description: '054210000083021-TPT-DRMARCH2025 --SONAMPMODI', type: 'Payment', amount: 78000, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 10, srNo: 10, date: '02/04/2025', description: 'CASHDEPOSITBY-PRAMOD-FORT', type: 'Receipt', amount: 348570, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 11, srNo: 11, date: '02/04/2025', description: 'NEFTCR-ICIC0000393-ICICIBANKMOD ALACIRRIBAMAAVIENJESLTD-SVACOU TUREPRIVATELIMITED-ICICN22025040 248435759', type: 'Receipt', amount: 34273.53, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 12, srNo: 12, date: '03/04/2025', description: 'NEFTCR-CITI0000000-PAYPALIPAYMEN', type: 'Receipt', amount: 21992.3, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 13, srNo: 13, date: '03/04/2025', description: 'NEFT-IBRN651847-C44068020425117 KNET--CRSB200001001-05SAIENTERP', type: 'Payment', amount: 1210, suggestedLedger: 'Software & Technology Expenses', suggestedLedgerIcon: true, ledger: '' },
  { id: 14, srNo: 14, date: '03/04/2025', description: 'NEFT-BARB0BACKBA-C44D010042451 TRXN--CRSYNWBOBKPA-SELFFINLTD', type: 'Payment', amount: 11082, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 15, srNo: 15, date: '03/04/2025', description: '411174431TERMINALLCARG0SETTLCLSD APRD', type: 'Receipt', amount: 65655.98, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 16, srNo: 16, date: '03/04/2025', description: 'SELF-CHQPAD-KAMALALMLIS', type: 'Payment', amount: 30000, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 17, srNo: 17, date: '03/04/2025', description: 'NEFTCR-SCBL0036001-AMERICANEXP BNREGSBANKNVY900-RAZVIITIBERVIT', type: 'Receipt', amount: 83680.85, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 18, srNo: 18, date: '03/04/2025', description: '411174431TERMINALLCARG0SETTLLKAD0 NEFTCR-SCBL003600I-STDCHRTRDAP', type: 'Receipt', amount: 290265, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 19, srNo: 19, date: '04/04/2025', description: 'FT-SVA-S920220S008529-PSLRETAILP', type: 'Receipt', amount: 150928, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
  { id: 20, srNo: 20, date: '05/04/2025', description: 'FT-HDFC0000004-C94113050425I173 PAYMT-RAVTNS...', type: 'Payment', amount: 15000, suggestedLedger: '', suggestedLedgerIcon: false, ledger: '' },
];

const LEDGER_OPTIONS = [
  'Select Ledger',
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
];

interface TransactionsPageProps {
  onBack: () => void;
  fileName?: string;
  totalCount?: number;
}

export default function TransactionsPage({ onBack, fileName = '63358723.pdf', totalCount = 2415 }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [descSearch, setDescSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [suggestedSearch, setSuggestedSearch] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createLedgerOpen, setCreateLedgerOpen] = useState(false);
  const [viewLedgerOpen, setViewLedgerOpen] = useState(false);
  const [createdLedgers, setCreatedLedgers] = useState<{ name: string; type: string }[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [autoFilterOn, setAutoFilterOn] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedLedger, setSelectedLedger] = useState('');
  const [hideTallySynced, setHideTallySynced] = useState(false);
  const [hideSavedRecords, setHideSavedRecords] = useState(false);
  const [hideBlankRecords, setHideBlankRecords] = useState(false);
  const [hideUnsavedRecords, setHideUnsavedRecords] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Add Ledger popup state
  const [addLedgerPopupRow, setAddLedgerPopupRow] = useState<number | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([{ ledger: '', amount: '' }]);

  // Create Ledger form states
  const [ledgerForm, setLedgerForm] = useState({
    gstin: '',
    name: '',
    ledgerType: 'Sundry Creditors',
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
    openingBalance: '',
    drCr: 'Cr.',
    tradeNameSelected: true,
  });

  const settingsRef = useRef<HTMLDivElement>(null);
  const addLedgerRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
      if (addLedgerRef.current && !addLedgerRef.current.contains(event.target as Node)) {
        setAddLedgerPopupRow(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle select all (only visible/filtered rows)
  const toggleAll = (checked: boolean) => {
    const filtered = getFilteredAndSorted();
    setSelectedRows(checked ? new Set(filtered.map(t => t.id)) : new Set());
  };

  const toggleRow = (id: number) => {
    const s = new Set(selectedRows);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedRows(s);
  };

  // Update row type
  const updateRowType = (id: number, newType: 'Payment' | 'Receipt') => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, type: newType } : t));
  };

  // Update row ledger
  const updateRowLedger = (id: number, newLedger: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ledger: newLedger } : t));
  };

  // Delete row
  const deleteRow = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setSelectedRows(prev => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  };

  // Sorting handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter + Sort logic
  const getFilteredAndSorted = (): Transaction[] => {
    let data = [...transactions];

    // Description search
    if (descSearch) {
      data = data.filter(t => t.description.toLowerCase().includes(descSearch.toLowerCase()));
    }
    // Type search
    if (typeSearch) {
      data = data.filter(t => t.type.toLowerCase().includes(typeSearch.toLowerCase()));
    }
    // Amount range
    if (amountFrom) {
      const from = parseFloat(amountFrom);
      if (!isNaN(from)) data = data.filter(t => t.amount >= from);
    }
    if (amountTo) {
      const to = parseFloat(amountTo);
      if (!isNaN(to)) data = data.filter(t => t.amount <= to);
    }
    // Suggested ledger search
    if (suggestedSearch) {
      data = data.filter(t => t.suggestedLedger.toLowerCase().includes(suggestedSearch.toLowerCase()));
    }
    // Ledger search
    if (ledgerSearch) {
      data = data.filter(t => t.ledger.toLowerCase().includes(ledgerSearch.toLowerCase()));
    }
    // Filter bar: Transaction Type
    if (selectedType) {
      data = data.filter(t => t.type === selectedType);
    }
    // Filter bar: Ledger
    if (selectedLedger) {
      data = data.filter(t => t.ledger === selectedLedger);
    }

    // Sorting
    if (sortColumn) {
      data.sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';
        switch (sortColumn) {
          case 'srNo': valA = a.srNo; valB = b.srNo; break;
          case 'date': valA = a.date; valB = b.date; break;
          case 'description': valA = a.description.toLowerCase(); valB = b.description.toLowerCase(); break;
          case 'type': valA = a.type; valB = b.type; break;
          case 'amount': valA = a.amount; valB = b.amount; break;
          case 'suggestedLedger': valA = a.suggestedLedger.toLowerCase(); valB = b.suggestedLedger.toLowerCase(); break;
          case 'ledger': valA = a.ledger.toLowerCase(); valB = b.ledger.toLowerCase(); break;
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  };

  const filteredData = getFilteredAndSorted();

  // Add Ledger popup handlers
  const openAddLedgerPopup = (rowId: number) => {
    setAddLedgerPopupRow(rowId);
    setLedgerEntries([{ ledger: '', amount: '' }]);
  };

  const getPopupRow = (): Transaction | undefined => {
    return transactions.find(t => t.id === addLedgerPopupRow);
  };

  const getTotalAllocated = (): number => {
    return ledgerEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  };

  const getRemainingAmount = (): number => {
    const row = getPopupRow();
    if (!row) return 0;
    return Math.round((row.amount - getTotalAllocated()) * 100) / 100;
  };

  const addLedgerEntry = () => {
    setLedgerEntries(prev => [...prev, { ledger: '', amount: '' }]);
  };

  const updateLedgerEntry = (index: number, field: 'ledger' | 'amount', value: string) => {
    setLedgerEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const removeLedgerEntry = (index: number) => {
    setLedgerEntries(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllLedgerEntries = () => {
    setLedgerEntries([{ ledger: '', amount: '' }]);
  };

  const saveLedgerEntries = () => {
    // Only allow save when remaining amount is 0
    if (getRemainingAmount() !== 0) return;
    if (addLedgerPopupRow !== null && ledgerEntries.length > 0 && ledgerEntries[0].ledger) {
      updateRowLedger(addLedgerPopupRow, ledgerEntries.map(e => e.ledger).filter(Boolean).join(', '));
    }
    setAddLedgerPopupRow(null);
  };

  // Column header with sort icon helper
  const SortHeader = ({ column, label, align }: { column: string; label: string; align?: string }) => (
    <span
      className={`flex items-center gap-1 cursor-pointer select-none ${align === 'right' ? 'justify-end' : ''}`}
      onClick={() => handleSort(column)}
    >
      {label}
      <ArrowUpDown size={10} className={`${sortColumn === column ? 'text-blue-500' : 'text-gray-400'}`} />
    </span>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="border-b border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-indigo-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">Transactions</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-500 text-white">
                  {totalCount}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Transactions extracted from your file.</p>
            </div>
          </div>

          {/* Right: Company + Bank + Buttons */}
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-[12px] text-gray-500">Company Name: <span className="text-indigo-600 font-medium">PAARIJAAT PERSONAL...</span></p>
              <p className="text-[12px] text-gray-500">Bank: <span className="font-semibold text-gray-800">HDFC</span></p>
            </div>

            {/* Settings dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50"
              >
                <Settings size={14} /> Settings
              </button>
              {settingsOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-20">
                  <button className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                    Transaction Details
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                    Create Rule
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                    Rule List
                  </button>
                  <div className="w-full px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100">
                    <span>Create Auto Filter</span>
                    {/* Proper toggle switch */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAutoFilterOn(!autoFilterOn);
                      }}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoFilterOn ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                          autoFilterOn ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50">
                    Configuration
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setCreateLedgerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50"
            >
              <Plus size={14} /> Create Ledger
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[12px] font-medium rounded">
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        {/* Second row: Send To Tally + YouTube + Collapse */}
        <div className="flex items-center justify-end gap-2 mt-2">
          <button className="px-3 py-1 border-2 border-indigo-600 text-indigo-600 text-[11px] font-bold rounded hover:bg-indigo-50">
            Send To <span className="italic">Tally</span>
          </button>
          <button className="w-7 h-7 bg-red-600 rounded flex items-center justify-center hover:bg-red-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
              <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" fill="#dc2626"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Filters Row ── */}
      <div className="border-b border-gray-200 px-5 py-2.5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-gray-700">Bulk Operations</span>
              <Info size={13} className="text-gray-400" />
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-600">Transaction Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-[11px] border border-gray-300 rounded px-2 py-1 text-gray-600 bg-white"
              >
                <option value="">Select Type</option>
                <option value="Payment">Payment</option>
                <option value="Receipt">Receipt</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-600">Ledger:</span>
              <select
                value={selectedLedger}
                onChange={(e) => setSelectedLedger(e.target.value)}
                className="text-[11px] border border-gray-300 rounded px-2 py-1 text-gray-600 bg-white"
              >
                <option value="">Select Ledger</option>
                {LEDGER_OPTIONS.filter(l => l !== 'Select Ledger').map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: General Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-gray-700">General Filters</span>
              <Info size={13} className="text-gray-400" />
            </div>
            <label className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5"
                checked={hideTallySynced}
                onChange={(e) => setHideTallySynced(e.target.checked)}
              /> Hide Tally Synced Records
            </label>
            <label className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5"
                checked={hideSavedRecords}
                onChange={(e) => setHideSavedRecords(e.target.checked)}
              /> Saved Records
            </label>
            <label className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5"
                checked={hideBlankRecords}
                onChange={(e) => setHideBlankRecords(e.target.checked)}
              /> Blank Records
            </label>
            <label className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5"
                checked={hideUnsavedRecords}
                onChange={(e) => setHideUnsavedRecords(e.target.checked)}
              /> Unsaved Records
            </label>
          </div>

          {/* Right: Date + Totals */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-600">Date:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[120px] text-[11px] border border-gray-300 rounded px-2 py-1 text-gray-600"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[120px] text-[11px] border border-gray-300 rounded px-2 py-1 text-gray-600"
              />
            </div>
            <div className="text-[11px]">
              <span className="text-red-500 font-medium">Debit: 7,64,36,833.26</span>
              {' '}
              <span className="text-green-600 font-medium">Credit: 7,73,75,837.61</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="sticky top-0 z-10 bg-white">
            {/* Column headers */}
            <tr className="border-b border-gray-200">
              <th className="px-2 py-2 text-left w-8 border-r border-gray-200">
                <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer"
                  checked={filteredData.length > 0 && selectedRows.size === filteredData.length}
                  onChange={e => toggleAll(e.target.checked)} />
              </th>
              <th className="px-2 py-2 text-left text-gray-500 font-semibold text-[11px] w-14 border-r border-gray-200">
                <SortHeader column="srNo" label="Sr. No." />
              </th>
              <th className="px-2 py-2 text-left text-gray-500 font-semibold text-[11px] w-20 border-r border-gray-200">
                <SortHeader column="date" label="Date" />
              </th>
              <th className="px-2 py-2 text-left text-gray-500 font-semibold text-[11px] w-56 border-r border-gray-200">
                <span className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('description')}>
                  Description <Filter size={10} className="text-gray-400" /> <ArrowUpDown size={10} className={`${sortColumn === 'description' ? 'text-blue-500' : 'text-gray-400'}`} />
                </span>
              </th>
              <th className="px-2 py-2 text-left text-gray-500 font-semibold text-[11px] w-24 border-r border-gray-200">
                <SortHeader column="type" label="Type" />
              </th>
              <th className="px-2 py-2 text-right text-gray-500 font-semibold text-[11px] w-28 border-r border-gray-200">
                <span className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => handleSort('amount')}>
                  Amount <Filter size={10} className="text-gray-400" /> <ArrowUpDown size={10} className={`${sortColumn === 'amount' ? 'text-blue-500' : 'text-gray-400'}`} />
                </span>
              </th>
              <th className="px-2 py-2 text-left text-gray-500 font-semibold text-[11px] w-52 border-r border-gray-200">
                <span className="flex items-center gap-1">Suggested Ledger <Info size={10} className="text-blue-400" /></span>
              </th>
              <th className="px-2 py-2 text-left text-gray-500 font-semibold text-[11px] w-44 border-r border-gray-200">
                <SortHeader column="ledger" label="Ledger" />
              </th>
              <th className="px-2 py-2 text-center text-gray-500 font-semibold text-[11px] w-24">Action</th>
            </tr>

            {/* Search/filter row */}
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="px-2 py-1.5 border-r border-gray-200"></td>
              <td className="px-2 py-1.5 border-r border-gray-200"></td>
              <td className="px-2 py-1.5 border-r border-gray-200"></td>
              <td className="px-2 py-1.5 border-r border-gray-200">
                <input
                  type="text"
                  placeholder="Search"
                  value={descSearch}
                  onChange={e => setDescSearch(e.target.value)}
                  className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-blue-400"
                />
              </td>
              <td className="px-2 py-1.5 border-r border-gray-200">
                <input
                  type="text"
                  placeholder="Search"
                  value={typeSearch}
                  onChange={e => setTypeSearch(e.target.value)}
                  className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-blue-400"
                />
              </td>
              <td className="px-2 py-1.5 border-r border-gray-200">
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="From"
                    value={amountFrom}
                    onChange={(e) => setAmountFrom(e.target.value)}
                    className="w-1/2 text-[11px] border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="To"
                    value={amountTo}
                    onChange={(e) => setAmountTo(e.target.value)}
                    className="w-1/2 text-[11px] border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </td>
              <td className="px-2 py-1.5 border-r border-gray-200">
                <input
                  type="text"
                  placeholder="Search"
                  value={suggestedSearch}
                  onChange={e => setSuggestedSearch(e.target.value)}
                  className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-blue-400"
                />
              </td>
              <td className="px-2 py-1.5 border-r border-gray-200">
                <input
                  type="text"
                  placeholder="Search"
                  value={ledgerSearch}
                  onChange={e => setLedgerSearch(e.target.value)}
                  className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-blue-400"
                />
              </td>
              <td className="px-2 py-1.5"></td>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                {/* Checkbox */}
                <td className="px-2 py-2 border-r border-gray-200">
                  <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer"
                    checked={selectedRows.has(row.id)} onChange={() => toggleRow(row.id)} />
                </td>

                {/* Sr No */}
                <td className="px-2 py-2 text-gray-700 text-[12px] border-r border-gray-200">{row.srNo}</td>

                {/* Date */}
                <td className="px-2 py-2 text-gray-700 text-[12px] whitespace-nowrap border-r border-gray-200">{row.date}</td>

                {/* Description */}
                <td className="px-2 py-2 text-gray-700 text-[11px] leading-tight max-w-[220px] border-r border-gray-200">
                  <div className="line-clamp-3">{row.description}</div>
                </td>

                {/* Type - Working dropdown */}
                <td className="px-2 py-2 border-r border-gray-200">
                  <select
                    value={row.type}
                    onChange={(e) => updateRowType(row.id, e.target.value as 'Payment' | 'Receipt')}
                    className={`text-[11px] font-medium border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer focus:outline-none focus:border-blue-400 ${
                      row.type === 'Payment' ? 'text-blue-600' : 'text-red-500'
                    }`}
                  >
                    <option value="Payment">Payment</option>
                    <option value="Receipt">Receipt</option>
                  </select>
                </td>

                {/* Amount */}
                <td className="px-2 py-2 text-right text-gray-800 text-[12px] font-medium tabular-nums border-r border-gray-200">
                  {row.amount.toLocaleString('en-IN', { minimumFractionDigits: row.amount % 1 !== 0 ? 2 : 0 })}
                </td>

                {/* Suggested Ledger */}
                <td className="px-2 py-2 border-r border-gray-200">
                  {row.suggestedLedger && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-600">{row.suggestedLedger}</span>
                      {row.suggestedLedgerIcon && (
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Info size={10} />
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Ledger dropdown - with actual options */}
                <td className="px-2 py-2 border-r border-gray-200">
                  <select
                    value={row.ledger || ''}
                    onChange={(e) => updateRowLedger(row.id, e.target.value)}
                    className={`w-full text-[11px] border border-gray-200 rounded px-2 py-1 bg-white hover:border-gray-400 cursor-pointer focus:outline-none focus:border-blue-400 ${
                      row.ledger ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    <option value="">Select Ledger</option>
                    {LEDGER_OPTIONS.filter(l => l !== 'Select Ledger').map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </td>

                {/* Action - Only Plus and Delete */}
                <td className="px-2 py-2">
                  <div className="flex items-center justify-center gap-2 relative">
                    <button
                      onClick={() => openAddLedgerPopup(row.id)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Add Ledger"
                    >
                      <PlusCircle size={16} />
                    </button>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Add Ledger Popup */}
                    {addLedgerPopupRow === row.id && (
                      <div
                        ref={addLedgerRef}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
                        onClick={() => setAddLedgerPopupRow(null)}
                      >
                        <div
                          className="bg-white border border-gray-200 rounded-lg shadow-2xl w-[480px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Header: description + close */}
                          <div className="flex items-start justify-between px-4 pt-4 pb-2">
                            <p className="text-[12px] text-gray-700 font-medium leading-snug max-w-[400px] truncate border border-gray-200 rounded px-2 py-1.5 bg-gray-50">
                              {row.description}
                            </p>
                            <button onClick={() => setAddLedgerPopupRow(null)} className="text-gray-400 hover:text-gray-600 ml-2 mt-1">
                              <X size={16} />
                            </button>
                          </div>

                          {/* Total + Remaining */}
                          <div className="flex items-center justify-between px-4 py-2">
                            <p className="text-[12px] text-gray-700">
                              Total Amount = <span className="font-semibold">{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </p>
                            <p className="text-[12px] text-gray-700">
                              Remaining Amount = <span className={`font-bold ${getRemainingAmount() === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {getRemainingAmount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </p>
                          </div>

                          {/* Column labels */}
                          <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                            <span className="flex-1 text-[11px] font-medium text-gray-500">Select Ledger</span>
                            <span className="w-28 text-[11px] font-medium text-gray-500">Amount</span>
                            <span className="w-8"></span>
                          </div>

                          {/* Ledger entries */}
                          <div className="px-4 pb-2 max-h-[200px] overflow-y-auto">
                            {ledgerEntries.map((entry, idx) => (
                              <div key={idx} className="flex items-center gap-2 mb-2">
                                <select
                                  value={entry.ledger}
                                  onChange={(e) => updateLedgerEntry(idx, 'ledger', e.target.value)}
                                  className="flex-1 text-[11px] border border-gray-300 rounded px-2 py-2 text-gray-700 bg-white focus:outline-none focus:border-blue-400"
                                >
                                  <option value="">Please select ledger.</option>
                                  {LEDGER_OPTIONS.filter(l => l !== 'Select Ledger').map(l => (
                                    <option key={l} value={l}>{l}</option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  placeholder="Amount"
                                  value={entry.amount}
                                  onChange={(e) => updateLedgerEntry(idx, 'amount', e.target.value)}
                                  className="w-28 text-[11px] border border-gray-300 rounded px-2 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                                />
                                {/* Blue circle + button to add another row */}
                                <button
                                  onClick={addLedgerEntry}
                                  className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center flex-shrink-0"
                                  title="Add another ledger"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Footer: Remove All | Cancel | Add */}
                          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                            <button
                              onClick={removeAllLedgerEntries}
                              className="px-3 py-1.5 text-[11px] bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                            >
                              Remove All
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setAddLedgerPopupRow(null)}
                                className="px-4 py-1.5 text-[11px] border border-gray-300 rounded text-gray-600 hover:bg-gray-50 font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveLedgerEntries}
                                disabled={getRemainingAmount() !== 0}
                                className={`px-4 py-1.5 text-[11px] rounded font-medium text-white ${
                                  getRemainingAmount() === 0
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-blue-300 cursor-not-allowed'
                                }`}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Create Ledger Modal ── */}
      {createLedgerOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-2xl w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-gray-900">
                Add Ledger For PAARIJAAT PERSONAL CARE PRIVATE LIMITED (100000)
              </h2>
              <button
                onClick={() => setCreateLedgerOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              {/* GSTIN/UIN row */}
              <div className="flex items-end gap-3 mb-5">
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">GSTIN/UIN</label>
                  <input
                    type="text"
                    value={ledgerForm.gstin}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, gstin: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium rounded">
                  Get Data
                </button>
              </div>

              {/* Radio buttons: Trade Name / Business Name */}
              <div className="flex items-center gap-6 mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nameType"
                    checked={ledgerForm.tradeNameSelected}
                    onChange={() => setLedgerForm({ ...ledgerForm, tradeNameSelected: true })}
                    className="w-4 h-4"
                  />
                  <span className="text-[12px] text-gray-700">Trade Name</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nameType"
                    checked={!ledgerForm.tradeNameSelected}
                    onChange={() => setLedgerForm({ ...ledgerForm, tradeNameSelected: false })}
                    className="w-4 h-4"
                  />
                  <span className="text-[12px] text-gray-700">Business Name</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setCreateLedgerOpen(false); setViewLedgerOpen(true); }}
                  className="text-blue-500 text-[11px] font-medium hover:underline"
                >
                  View Ledger
                </button>
              </div>

              {/* Row 1: Name, Ledger Type, Bill by Bill, Inventory */}
              <div className="grid grid-cols-4 gap-4 mb-5">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">
                    <span className="text-red-500">*</span>Name
                  </label>
                  <input
                    type="text"
                    value={ledgerForm.name}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, name: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">
                    <span className="text-red-500">*</span>Ledger Type
                  </label>
                  <select
                    value={ledgerForm.ledgerType}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, ledgerType: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  >
                    <option>Sundry Creditors</option>
                    <option>Sundry Debtors</option>
                    <option>Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Bill by Bill</label>
                  <select
                    value={ledgerForm.billByBill}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, billByBill: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Inventory values are affected</label>
                  <select
                    value={ledgerForm.inventoryAffected}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, inventoryAffected: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Credit Period, Mailing Name, Address 1, Address 2 */}
              <div className="grid grid-cols-4 gap-4 mb-5">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Credit Period (Days)</label>
                  <input
                    type="text"
                    value={ledgerForm.creditPeriod}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, creditPeriod: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Mailing Name</label>
                  <input
                    type="text"
                    value={ledgerForm.mailingName}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, mailingName: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Address 1</label>
                  <input
                    type="text"
                    value={ledgerForm.address1}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, address1: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Address 2</label>
                  <input
                    type="text"
                    value={ledgerForm.address2}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, address2: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 3: Country, State, Pincode, PAN/IT */}
              <div className="grid grid-cols-4 gap-4 mb-5">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={ledgerForm.country}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, country: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  >
                    <option>India</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={ledgerForm.state}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, state: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Select State</option>
                    <option>Maharashtra</option>
                    <option>Gujarat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={ledgerForm.pincode}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, pincode: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">PAN/IT</label>
                  <input
                    type="text"
                    value={ledgerForm.pan}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, pan: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 4: Registration Type, GSTIN/UIN, Opening Balance, Dr./Cr. */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Registration Type</label>
                  <select
                    value={ledgerForm.registrationType}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, registrationType: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  >
                    <option>Regular</option>
                    <option>Composition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">GSTIN/UIN</label>
                  <input
                    type="text"
                    value={ledgerForm.gstin}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, gstin: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Opening Balance</label>
                  <input
                    type="text"
                    value={ledgerForm.openingBalance}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, openingBalance: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">Dr./Cr.</label>
                  <select
                    value={ledgerForm.drCr}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, drCr: e.target.value })}
                    className="w-full text-[12px] border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-400"
                  >
                    <option>Cr.</option>
                    <option>Dr.</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setCreateLedgerOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (ledgerForm.name && ledgerForm.ledgerType) {
                    setCreatedLedgers(prev => [...prev, { name: ledgerForm.name, type: ledgerForm.ledgerType }]);
                    setLedgerForm({ ...ledgerForm, name: '', gstin: '', creditPeriod: '', mailingName: '', address1: '', address2: '', state: '', pincode: '', pan: '', openingBalance: '' });
                    setCreateLedgerOpen(false);
                  }
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-medium rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Ledger Modal ── */}
      {viewLedgerOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-2xl w-11/12 max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setViewLedgerOpen(false); setCreateLedgerOpen(true); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-base font-semibold text-gray-900">View Ledger</h2>
              </div>
              <button
                onClick={() => setViewLedgerOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2.5 px-3 text-gray-600 font-semibold text-[12px]">Name</th>
                    <th className="text-left py-2.5 px-3 text-gray-600 font-semibold text-[12px]">Type</th>
                    <th className="text-left py-2.5 px-3 text-gray-600 font-semibold text-[12px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {createdLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="18" rx="2"/>
                            <line x1="2" y1="8" x2="22" y2="8"/>
                          </svg>
                          <span className="text-[13px]">No data</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    createdLedgers.map((ledger, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-700 text-[12px]">{ledger.name}</td>
                        <td className="py-2.5 px-3 text-gray-700 text-[12px]">{ledger.type}</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => {
                              setCreatedLedgers(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setViewLedgerOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { setViewLedgerOpen(false); setCreateLedgerOpen(true); }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-medium rounded"
              >
                Add Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
