'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import DataTable from '@/components/DataTable';
import UploadWorkflow from '@/components/UploadWorkflow';
import SalesWorkflow from '@/components/SalesWorkflow';
import PurchaseWorkflow from '@/components/PurchaseWorkflow';
import { X, Upload, FileUp, ChevronDown, XCircle, FileSpreadsheet, FileText, ScanLine } from 'lucide-react';

const TABS = [
  'Banking',
  'Sales',
  'Sales-Return',
  'Purchase',
  'Purchase-Return',
  'Journal',
  'Ledger',
  'Items',
];

const TAB_SLUG_MAP: Record<string, string> = {
  banking: 'Banking',
  sales: 'Sales',
  'sales-return': 'Sales-Return',
  purchase: 'Purchase',
  'purchase-return': 'Purchase-Return',
  journal: 'Journal',
  ledger: 'Ledger',
  items: 'Items',
};

const TAB_TO_SLUG: Record<string, string> = {
  Banking: 'banking',
  Sales: 'sales',
  'Sales-Return': 'sales-return',
  Purchase: 'purchase',
  'Purchase-Return': 'purchase-return',
  Journal: 'journal',
  Ledger: 'ledger',
  Items: 'items',
};

const TAB_CONFIG: Record<
  string,
  {
    variant: 'table' | 'upload' | 'sales' | 'purchase';
    tableVariant?: 'banking' | 'purchase';
    uploadType?: string;
    title: string;
    badgeCount?: number;
    showMergeDocument?: boolean;
    showDownloadSample?: boolean;
  }
> = {
  Banking: {
    variant: 'table',
    tableVariant: 'banking',
    title: 'Banking',
    badgeCount: 4,
    showMergeDocument: true,
    showDownloadSample: false,
  },
  Sales: {
    variant: 'sales',
    title: 'Sales (Excel)',
    badgeCount: 2,
    showMergeDocument: false,
    showDownloadSample: true,
  },
  'Sales-Return': {
    variant: 'upload',
    uploadType: 'sales return excel',
    title: 'Sales Return (Excel)',
    showMergeDocument: false,
    showDownloadSample: true,
  },
  Purchase: {
    variant: 'purchase',
    tableVariant: 'purchase',
    title: 'Purchase (Excel)',
    badgeCount: 1,
    showMergeDocument: false,
    showDownloadSample: true,
  },
  'Purchase-Return': {
    variant: 'upload',
    uploadType: 'purchase return excel',
    title: 'Purchase Return (Excel)',
    showMergeDocument: false,
    showDownloadSample: true,
  },
  Journal: {
    variant: 'upload',
    uploadType: 'journal',
    title: 'Journal (Excel)',
    showMergeDocument: false,
    showDownloadSample: true,
  },
  Ledger: {
    variant: 'upload',
    uploadType: 'ledger',
    title: 'Ledger Excel',
    showMergeDocument: false,
    showDownloadSample: false,
  },
  Items: {
    variant: 'upload',
    uploadType: 'item',
    title: 'Item Excel',
    showMergeDocument: false,
    showDownloadSample: false,
  },
};

export default function BulkUploadTabPage() {
  const params = useParams();
  const router = useRouter();
  const tabSlug = (params.tab as string) || 'banking';
  const activeTab = TAB_SLUG_MAP[tabSlug] || 'Banking';
  const config = TAB_CONFIG[activeTab];

  const [selectedCount, setSelectedCount] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: string) => {
    const slug = TAB_TO_SLUG[tab] || tab.toLowerCase();
    router.push(`/app/da/bulk-upload/${slug}`);
  };

  const handleRowClick = (id: string) => {
    if (activeTab === 'Banking') {
      router.push(`/app/da/bulk-upload/banking/${id}`);
    } else if (activeTab === 'Purchase') {
      router.push(`/app/da/purchase/${id}/field-mapping`);
    }
  };

  return (
    <>
      {/* Top Bar with tabs */}
      <TopBar
        title={config.title}
        badgeCount={config.badgeCount}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={TABS}
        showMergeDocument={config.showMergeDocument ?? false}
        showDownloadSample={config.showDownloadSample ?? false}
        selectedCount={selectedCount}
        onUploadClick={() => setUploadModalOpen(true)}
      />

      {/* Content Area */}
      <div className={`flex-1 bg-white ${(config.variant === 'sales' || config.variant === 'purchase') ? 'overflow-hidden flex flex-col' : 'overflow-auto'}`}>
        {config.variant === 'table' ? (
          <DataTable variant={config.tableVariant!} onView={handleRowClick} onSelectionChange={setSelectedCount} />
        ) : config.variant === 'sales' ? (
          <SalesWorkflow onBack={() => handleTabChange('Banking')} useRouter />
        ) : config.variant === 'purchase' ? (
          <PurchaseWorkflow onBack={() => handleTabChange('Banking')} useRouter />
        ) : (
          <UploadWorkflow type={config.uploadType!} />
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && activeTab === 'Banking' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[520px]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Upload banking</h2>
              <button
                onClick={() => { setUploadModalOpen(false); setUploadedFile(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-5 pb-4 space-y-4">
              {/* Select Bank Dropdown */}
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                  <span className="text-red-500">*</span> Select Bank
                </label>
                <div className="relative" ref={bankDropdownRef}>
                  <button
                    onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded text-[13px] text-gray-800 bg-white hover:border-gray-400 transition-colors"
                  >
                    <span>{selectedBank}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {bankDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                      {['HDFC', 'SBI', 'ICICI', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank', 'Bank of Baroda', 'Yes Bank'].map((bank) => (
                        <button
                          key={bank}
                          onClick={() => { setSelectedBank(bank); setBankDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-[12px] hover:bg-blue-50 transition-colors ${
                            selectedBank === bank ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : uploadedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) setUploadedFile(file);
                }}
              >
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileUp className="w-5 h-5 text-blue-500" />
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
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 text-[12px] text-gray-700 font-medium rounded hover:bg-gray-100 transition-colors"
                  >
                    <Upload size={14} />
                    Click to upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx,.csv,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadedFile(file);
                    }}
                  />
                </div>
              </div>

              {/* Notes - Warning Cards */}
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-gray-700">Notes:</p>
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    Please don&apos;t upload Passbook, Share Market statement and Loan statement.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    Please don&apos;t upload password-protected, RTP and TEXT Format files.
                  </p>
                </div>
              </div>

              {/* File Type Info Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg py-3 px-2">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  <p className="text-[12px] font-semibold text-gray-800">Excel</p>
                </div>
                <div className="flex flex-col items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg py-3 px-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <p className="text-[12px] font-semibold text-gray-800">Original PDF</p>
                </div>
                <div className="flex flex-col items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-lg py-3 px-2">
                  <ScanLine className="w-6 h-6 text-purple-600" />
                  <p className="text-[12px] font-semibold text-gray-800">Scanned PDF</p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
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

      {/* Upload Modal - Non-Banking Tabs */}
      {uploadModalOpen && activeTab !== 'Banking' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[480px]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">
                Upload {config.uploadType || activeTab.toLowerCase()}
              </h2>
              <button
                onClick={() => { setUploadModalOpen(false); setUploadedFile(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div className="px-6 pt-5 pb-3">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : uploadedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) setUploadedFile(file);
                }}
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
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 text-[12px] text-gray-700 font-medium rounded hover:bg-gray-100 transition-colors"
                  >
                    <Upload size={14} />
                    Click to upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx,.csv,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadedFile(file);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="px-6 pb-4">
              <p className="text-[12px] font-semibold text-gray-700 mb-1.5">Notes:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-600">
                <li>Please make sure the uploaded excel file does not contain the dot(.) and dollar($) symbol in the column header and other then sales/purchase field do not add anything above header.</li>
                <li>Please make sure the file size must not exceed 30MB.</li>
                <li>Sync the ledger before uploading the file.</li>
                <li>Please don&apos;t upload password protected excel files.</li>
                <li>Date format should be DD/MM/YYYY.</li>
              </ul>
            </div>

            {/* Footer Buttons */}
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
              {activeTab === 'Journal' && (
                <button
                  onClick={() => { setUploadModalOpen(false); setUploadedFile(null); }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded"
                >
                  Upload &amp; Preview
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
