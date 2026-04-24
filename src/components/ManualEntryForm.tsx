'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  Plus,
  X,
  ArrowLeft,
  PlusCircle,
  Trash2,
  Calendar,
} from 'lucide-react';

// ─── Manual entry form data ───
const VOUCHER_TYPES_SALES = ['Sales', 'Sales Return'];
const VOUCHER_TYPES_PURCHASE = ['Purchase', 'Purchase Return'];
const PARTY_NAMES = [
  'Mascot Spin Control India Pvt Ltd',
  'Meals and Entertainment',
  'Middle Media Solutions',
  'MR ARJUN PURKAYASTHA',
  'Mr. A KEMPAPPA',
  'MIGUEL GLOBAL COUTURE',
  'SVA COUTURE PRIVATE LIMITED',
  'Burgeon Law LLP',
];
const SALES_LEDGER_OPTIONS = ['Sales Ledger', 'Sales Account', 'Local Sales', 'Interstate Sales', 'Export Sales'];
const PURCHASE_LEDGER_OPTIONS = ['Purchase Ledger', 'Purchase Account', 'Local Purchase', 'Interstate Purchase'];
const ITEM_NAMES = ['Bridal Kurta Set', 'Purchase of Punch2.0 Smart', 'Cotton Fabric Roll', 'Silk Thread Bundle', 'Embroidery Kit'];
const LEDGER_NAMES = ['Freight & Packing', 'Discount Allowed', 'Bank Charges', 'Loading & Unloading', 'Insurance'];
const TAX_LEDGER_NAMES = ['Output IGST 18%', 'Output CGST 9%', 'Output SGST 9%', 'Input IGST 18%', 'Input CGST 9%', 'Input SGST 9%'];

// Configuration modal options – Left column
const CONFIG_LEFT = [
  { label: 'Voucher Date', checked: true, disabled: true },
  { label: 'Reference Date', checked: false },
  { label: 'Reference No', checked: false },
  { label: 'Voucher No', checked: true, disabled: true },
  { label: 'Voucher Type', checked: true, disabled: true },
  { label: 'Party A/C Name', checked: true, disabled: true },
];
// Configuration modal options – Left expandable sections
const CONFIG_LEFT_SECTIONS = [
  { label: 'Dispatch Details', checked: false },
  { label: 'Order Details', checked: false },
  { label: 'Export Details', checked: false },
];
// Configuration modal options – Right column (non-expandable items after Party Details)
const CONFIG_RIGHT_AFTER = [
  { label: 'Cost Center/Classes', checked: false },
  { label: 'Particulars', checked: true, disabled: true },
  { label: 'Description', checked: false },
  { label: 'Amount', checked: true, disabled: true },
  { label: 'Total Amount', checked: true, disabled: true },
  { label: 'Narration', checked: true },
];
// Party Details sub-options (shown when expanded)
const CONFIG_PARTY_DETAILS = [
  { label: 'Buyer (Bill to)', checked: false },
  { label: 'Mailing Name(Buyer)', checked: false },
  { label: 'Address(Buyer)', checked: false },
  { label: 'State(Buyer)', checked: false },
  { label: 'Pincode(Buyer)', checked: false },
  { label: 'GSTIN/UIN', checked: true },
  { label: 'Consignee (Ship to)', checked: false },
  { label: 'Mailing Name(Consignee)', checked: false },
  { label: 'Consignee GSTIN/UIN', checked: false },
  { label: 'Address(Consignee)', checked: false },
  { label: 'State(Consignee)', checked: false },
  { label: 'Pincode(Consignee)', checked: false },
  { label: 'Place of Supply', checked: true },
];

type AdditionalDetailsTabKey = 'dispatch' | 'order' | 'export' | 'party';

const ADDITIONAL_DETAILS_TABS: { key: AdditionalDetailsTabKey; label: string }[] = [
  { key: 'dispatch', label: 'Dispatch Details' },
  { key: 'order', label: 'Order Details' },
  { key: 'export', label: 'Export Details' },
  { key: 'party', label: 'Party Details' },
];

const PLACE_OF_SUPPLY_OPTIONS = [
  'Andaman & Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Other Territory',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Foreign Country',
];

const ADDITIONAL_DETAILS_FIELDS: Record<
  AdditionalDetailsTabKey,
  { label: string; placeholder: string; kind?: 'date' | 'select' }[]
> = {
  dispatch: [
    { label: 'Delivery Note No(s)', placeholder: 'Select Delivery Note No(s)' },
    { label: 'Invoice date', placeholder: 'Select date', kind: 'date' },
    { label: 'Dispatch Doc No.', placeholder: 'Select Dispatch Doc No.' },
    { label: 'Dispatched through', placeholder: 'Select Dispatched through' },
    { label: 'Destination', placeholder: 'Select Destination' },
    { label: 'Carrier Name/Agent', placeholder: 'Select Carrier Name/Agent' },
    { label: 'Bill of Lading/LR-RR No.', placeholder: 'Select Bill of Lading/LR-RR No.' },
    { label: 'Bill of Lading date', placeholder: 'Select date', kind: 'date' },
  ],
  order: [
    { label: 'Order No(s)', placeholder: 'Select Order No(s)' },
    { label: 'Order date', placeholder: 'Select date', kind: 'date' },
    { label: 'Mode/Terms of Payment', placeholder: 'Select Mode/Terms of Payment' },
    { label: 'Other References', placeholder: 'Select Other References' },
    { label: 'Terms of Delivery', placeholder: 'Select Terms of Delivery' },
  ],
  export: [
    { label: 'Place of Receipt by Shipper', placeholder: 'Select Place of Receipt by Shipper' },
    { label: 'Vessel/Flight/Motor-Vehicle No.', placeholder: 'Select Vessel/Flight/Motor-Vehicle No.' },
    { label: 'Shipping bill date', placeholder: 'Select date', kind: 'date' },
    { label: 'Port of Loading', placeholder: 'Select Port of Loading' },
    { label: 'Port of Discharge', placeholder: 'Select Port of Discharge' },
    { label: 'Shipping Bill No.', placeholder: 'Select Shipping Bill No.' },
    { label: 'Tracking date', placeholder: 'Select date', kind: 'date' },
    { label: 'Port Code', placeholder: 'Select Port Code' },
  ],
  party: [
    { label: 'GSTIN/UIN', placeholder: 'Select GSTIN/UIN' },
    { label: 'Place of Supply', placeholder: 'Select Place of Supply', kind: 'select' },
  ],
};

interface ManualEntryFormProps {
  type: 'Sales' | 'Sales Return' | 'Purchase' | 'Purchase Return';
}

export default function ManualEntryForm({ type }: ManualEntryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromTab = searchParams.get('from') || (type.includes('Purchase') ? 'Purchase' : 'Sales');
  const [isItemInvoice, setIsItemInvoice] = useState(true);

  // Manual entry interactive state
  const [meVoucherType, setMeVoucherType] = useState('');
  const [meVoucherTypeOpen, setMeVoucherTypeOpen] = useState(false);
  const [mePartyName, setMePartyName] = useState('');
  const [mePartyNameOpen, setMePartyNameOpen] = useState(false);
  const [meSalesLedger, setMeSalesLedger] = useState('');
  const [meSalesLedgerOpen, setMeSalesLedgerOpen] = useState(false);
  const [meShowAddParticular, setMeShowAddParticular] = useState(false);
  const [meAddParticularSource, setMeAddParticularSource] = useState<'party' | 'ledger'>('party');
  const [meShowConfigModal, setMeShowConfigModal] = useState(false);
  const [meShowStockCreation, setMeShowStockCreation] = useState(false);
  const [meShowViewItems, setMeShowViewItems] = useState(false);
  const [meConfigPartyExpanded, setMeConfigPartyExpanded] = useState(false);
  const [meShowAdditionalDetails, setMeShowAdditionalDetails] = useState(false);
  const [meAdditionalDetailsTab, setMeAdditionalDetailsTab] = useState<AdditionalDetailsTabKey>('dispatch');

  // Item Details rows
  const [meItemRows, setMeItemRows] = useState([{ id: 1, name: '', qty: '', rate: '', amount: '0' }]);

  // Ledger Details rows
  const [meLedgerRows, setMeLedgerRows] = useState([{ id: 1, name: '', amount: '' }]);

  // Tax Ledger Details rows
  const [meTaxLedgerRows, setMeTaxLedgerRows] = useState([
    { id: 1, name: '', description: '', amount: '0' },
    { id: 2, name: '', description: '', amount: '0' },
  ]);

  const [meNarration, setMeNarration] = useState('');

  // Get voucher type options based on current type
  const voucherTypeOptions = meVoucherType.includes('Sales') ? VOUCHER_TYPES_SALES : VOUCHER_TYPES_PURCHASE;
  const isSalesType = type === 'Sales' || type === 'Sales Return';
  const ledgerOptions = isSalesType ? SALES_LEDGER_OPTIONS : PURCHASE_LEDGER_OPTIONS;

  // Reset manual entry form - navigate back to correct tab
  const resetManualEntry = () => {
    router.push(`/app/da/transactions?tab=${fromTab}`);
  };

  // Add/remove row helpers for manual entry
  const addMeItemRow = () => {
    const newId = meItemRows.length > 0 ? Math.max(...meItemRows.map(r => r.id)) + 1 : 1;
    setMeItemRows([...meItemRows, { id: newId, name: '', qty: '', rate: '', amount: '0' }]);
  };
  const removeMeItemRow = (id: number) => {
    if (meItemRows.length > 1) setMeItemRows(meItemRows.filter(r => r.id !== id));
  };

  const addMeLedgerRow = () => {
    const newId = meLedgerRows.length > 0 ? Math.max(...meLedgerRows.map(r => r.id)) + 1 : 1;
    setMeLedgerRows([...meLedgerRows, { id: newId, name: '', amount: '' }]);
  };
  const removeMeLedgerRow = (id: number) => {
    if (meLedgerRows.length > 1) setMeLedgerRows(meLedgerRows.filter(r => r.id !== id));
  };

  const addMeTaxLedgerRow = () => {
    const newId = meTaxLedgerRows.length > 0 ? Math.max(...meTaxLedgerRows.map(r => r.id)) + 1 : 1;
    setMeTaxLedgerRows([...meTaxLedgerRows, { id: newId, name: '', description: '', amount: '0' }]);
  };
  const removeMeTaxLedgerRow = (id: number) => {
    if (meTaxLedgerRows.length > 1) setMeTaxLedgerRows(meTaxLedgerRows.filter(r => r.id !== id));
  };

  const updateMeItemRow = (id: number, field: 'name' | 'qty' | 'rate', value: string) => {
    setMeItemRows(meItemRows.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'qty' || field === 'rate') {
          const qty = parseFloat(field === 'qty' ? value : updated.qty) || 0;
          const rate = parseFloat(field === 'rate' ? value : updated.rate) || 0;
          updated.amount = (qty * rate).toFixed(2);
        }
        return updated;
      }
      return r;
    }));
  };

  const updateMeLedgerRow = (id: number, field: 'name' | 'amount', value: string) => {
    setMeLedgerRows(meLedgerRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const updateMeTaxLedgerRow = (id: number, field: 'name' | 'description' | 'amount', value: string) => {
    setMeTaxLedgerRows(meTaxLedgerRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header bar (sticky top) */}
      <div className="h-[50px] border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => resetManualEntry()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-base font-bold text-gray-900">{isItemInvoice ? 'Item Invoice' : 'Accounting Invoice'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-700 font-medium truncate max-w-[200px]">Company Name: PAARIJAAT PERSONAL...</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-600">Accounting Invoice</span>
              <button
                onClick={() => setIsItemInvoice(!isItemInvoice)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors"
                style={{backgroundColor: isItemInvoice ? '#3b82f6' : '#d1d5db'}}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{transform: isItemInvoice ? 'translateX(1.25rem)' : 'translateX(0.25rem)'}}
                />
              </button>
              <span className="text-[12px] text-gray-600">Item Invoice</span>
            </div>
            <button
              onClick={() => setMeShowConfigModal(true)}
              className="px-3 py-1.5 text-[12px] text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto flex">
        {/* Left column - Form (65%) */}
        <div className="flex-1 px-6 py-6 overflow-auto" style={{width: '65%'}}>
          <div className="max-w-full">
            {/* Row 1: Voucher Type, Voucher No / Supplier Invoice No, Voucher Date */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Voucher Type */}
              <div id="me-voucher-dropdown">
                <label className="text-[11px] font-medium text-gray-500 mb-1.5 block">
                  <span className="text-red-500">*</span> Voucher Type
                </label>
                <div className="relative">
                  <button
                    onClick={() => setMeVoucherTypeOpen(!meVoucherTypeOpen)}
                    className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 text-left flex items-center justify-between"
                  >
                    <span>{meVoucherType || type}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {meVoucherTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-[200px] overflow-auto">
                      {voucherTypeOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setMeVoucherType(opt);
                            setMeVoucherTypeOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-blue-50 ${meVoucherType === opt ? 'bg-blue-100' : ''}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Voucher No */}
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1.5 block">
                  <span className="text-red-500">*</span> Voucher No.
                </label>
                <input
                  type="text"
                  placeholder="Enter Voucher No."
                  className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Voucher Date */}
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1.5 block">
                  <span className="text-red-500">*</span> Voucher Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="09/04/2026"
                    defaultValue="09/04/2026"
                    className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 pr-8"
                  />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Party Name, GST Number */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Party Name */}
              <div id="me-party-dropdown">
                <label className="text-[11px] font-medium text-gray-500 mb-1.5 block">
                  <span className="text-red-500">*</span> {isSalesType ? 'Customer' : 'Supplier'} Name
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setMePartyNameOpen(!mePartyNameOpen)}
                      className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 text-left flex items-center justify-between"
                    >
                      <span>{mePartyName || 'Party A/C Name'}</span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>
                    {mePartyNameOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-[200px] overflow-auto">
                        {PARTY_NAMES.map((name) => (
                          <button
                            key={name}
                            onClick={() => {
                              setMePartyName(name);
                              setMePartyNameOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-blue-50 ${mePartyName === name ? 'bg-blue-100' : ''}`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setMeAddParticularSource('party'); setMeShowAddParticular(true); }}
                    className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 flex-shrink-0"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* GST Number */}
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-1.5 block">GST Number</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter GST Number"
                    className="flex-1 px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => {
                      setMeAdditionalDetailsTab('dispatch');
                      setMeShowAdditionalDetails(true);
                    }}
                    className="px-3 py-1.5 text-[11px] text-gray-600 border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Ledger Selection — Sales/Purchase Ledger only when Item Invoice is ON */}
            {isItemInvoice && (
              <div id="me-ledger-dropdown" className="mb-6">
                <label className="text-[11px] font-medium text-gray-500 mb-1.5 block">
                  <span className="text-red-500">*</span> {isSalesType ? 'Sales' : 'Purchase'} Ledger
                </label>
                <div className="relative">
                  <button
                    onClick={() => setMeSalesLedgerOpen(!meSalesLedgerOpen)}
                    className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 text-left flex items-center justify-between"
                  >
                    <span>{meSalesLedger || (isSalesType ? 'Sales Ledger' : 'Purchase Ledger')}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {meSalesLedgerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-[200px] overflow-auto">
                      {ledgerOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setMeSalesLedger(opt);
                            setMeSalesLedgerOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-blue-50 ${meSalesLedger === opt ? 'bg-blue-100' : ''}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dashed separator */}
            <div className="border-t border-dashed border-gray-200 my-6" />

            {/* Item Details Section (only if Item Invoice is ON) */}
            {isItemInvoice && (
              <>
                <div className="mb-3">
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-3">Item Details</h3>
                </div>
                <div className="mb-6 border border-gray-200 rounded overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 w-12">Sr.No</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500"><span className="text-red-500">*</span> Item Name</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 w-20"><span className="text-red-500">*</span> Qty</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 w-20"><span className="text-red-500">*</span> Rate</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 w-20">Amount</th>
                        <th className="px-3 py-2 text-center text-[11px] font-semibold text-gray-500 w-8">
                          <button onClick={() => setMeShowStockCreation(true)} className="text-blue-500 hover:text-blue-700 flex justify-center w-full">
                            <PlusCircle size={16} />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {meItemRows.map((row, idx) => (
                        <tr key={row.id} className="border-b border-gray-200">
                          <td className="px-3 py-2 text-[12px] text-gray-700">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="Select Item"
                              value={row.name}
                              onChange={(e) => updateMeItemRow(row.id, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                              list={`items-${row.id}`}
                            />
                            <datalist id={`items-${row.id}`}>
                              {ITEM_NAMES.map((item) => (
                                <option key={item} value={item} />
                              ))}
                            </datalist>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={row.qty}
                              onChange={(e) => updateMeItemRow(row.id, 'qty', e.target.value)}
                              className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              placeholder="Rate"
                              value={row.rate}
                              onChange={(e) => updateMeItemRow(row.id, 'rate', e.target.value)}
                              className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.amount}
                              readOnly
                              className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded bg-gray-50"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => removeMeItemRow(row.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-right text-[12px] font-semibold text-gray-700 mb-6">
                  Total: <span className="text-gray-900">₹ {meItemRows.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0).toFixed(2)}</span>
                </div>

                {/* Dashed separator */}
                <div className="border-t border-dashed border-gray-200 my-6" />
              </>
            )}

            {/* Ledger Details Section */}
            <div className="mb-3">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">Ledger Details</h3>
            </div>
            <div className="mb-6 border border-gray-200 rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 w-12">Sr.No</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500">Ledger Name</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 w-20">Amount</th>
                    <th className="px-3 py-2 text-center text-[11px] font-semibold text-gray-500 w-8">
                      <button onClick={() => { setMeAddParticularSource('ledger'); setMeShowAddParticular(true); }} className="text-blue-500 hover:text-blue-700 flex justify-center w-full">
                        <PlusCircle size={16} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {meLedgerRows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-200">
                      <td className="px-3 py-2 text-[12px] text-gray-700">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="Select Ledger"
                          value={row.name}
                          onChange={(e) => updateMeLedgerRow(row.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                          list={`ledgers-${row.id}`}
                        />
                        <datalist id={`ledgers-${row.id}`}>
                          {LEDGER_NAMES.map((ledger) => (
                            <option key={ledger} value={ledger} />
                          ))}
                        </datalist>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={row.amount}
                          onChange={(e) => updateMeLedgerRow(row.id, 'amount', e.target.value)}
                          className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => removeMeLedgerRow(row.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right text-[12px] font-semibold text-gray-700 mb-6">
              Total: <span className="text-gray-900">₹ {meLedgerRows.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0).toFixed(2)}</span>
            </div>

            {/* Dashed separator */}
            <div className="border-t border-dashed border-gray-200 my-6" />

            {/* Tax Ledger Details Section */}
            <div className="mb-3">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">Tax Ledger Details</h3>
            </div>
            <div className="mb-6 border border-gray-200 rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 w-12">Sr.No</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500"><span className="text-red-500">*</span> Ledger Name</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500">Description</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 w-20">Amount</th>
                    <th className="px-3 py-2 text-center text-[11px] font-semibold text-gray-500 w-8">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {meTaxLedgerRows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-200">
                      <td className="px-3 py-2 text-[12px] text-gray-700">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="Select Ledger"
                          value={row.name}
                          onChange={(e) => updateMeTaxLedgerRow(row.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                          list={`tax-ledgers-${row.id}`}
                        />
                        <datalist id={`tax-ledgers-${row.id}`}>
                          {TAX_LEDGER_NAMES.map((ledger) => (
                            <option key={ledger} value={ledger} />
                          ))}
                        </datalist>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="Description"
                          value={row.description}
                          onChange={(e) => updateMeTaxLedgerRow(row.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={row.amount}
                          onChange={(e) => updateMeTaxLedgerRow(row.id, 'amount', e.target.value)}
                          className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => removeMeTaxLedgerRow(row.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addMeTaxLedgerRow} className="text-blue-600 hover:text-blue-700 text-[12px] font-medium mb-4">Add Ledger</button>
            <div className="text-right text-[12px] font-semibold text-gray-700 mb-6">
              Total: <span className="text-gray-900">₹ {meTaxLedgerRows.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0).toFixed(2)}</span>
            </div>

            {/* Dashed separator */}
            <div className="border-t border-dashed border-gray-200 my-6" />

            {/* Narration + Totals */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">Narration</label>
                <textarea
                  placeholder="Enter Narration"
                  rows={4}
                  value={meNarration}
                  onChange={(e) => setMeNarration(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 resize-y"
                />
              </div>
              <div className="flex flex-col justify-center gap-3 text-right">
                <div className="text-[12px]">
                  <span className="text-gray-600">Sub Total: </span>
                  <span className="font-semibold text-gray-900">₹0.00</span>
                </div>
                <div className="text-[12px]">
                  <span className="text-gray-600">Tax Amount: </span>
                  <span className="font-semibold text-gray-900">₹0.00</span>
                </div>
                <div className="text-[13px]">
                  <span className="text-gray-700 font-medium">Total Amount: </span>
                  <span className="font-bold text-gray-900">₹0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Sidebar (35%) */}
        <div className="w-[35%] bg-gray-50 border-l border-gray-200 px-4 py-6 overflow-auto" style={{width: '35%'}}>
          <div className="space-y-4">
            {/* Customer/Supplier Details Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">
                {type === 'Sales' || type === 'Sales Return' ? 'Customer Details' : 'Supplier Details'}
              </h3>
              <div className="space-y-2 text-[12px]">
                <div>
                  <span className="text-gray-500">Name: </span>
                  <span className="text-gray-700 font-medium">-</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone No: </span>
                  <span className="text-gray-700 font-medium">-</span>
                </div>
                <div>
                  <span className="text-gray-500">Email: </span>
                  <span className="text-gray-700 font-medium">-</span>
                </div>
                <div>
                  <span className="text-gray-500">Address: </span>
                  <div className="mt-1">
                    <textarea
                      readOnly
                      value="-"
                      className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded bg-gray-50"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-[12px]">
                <span className="text-gray-500">Outstanding Receivables </span>
                <span className="font-semibold text-gray-900">₹0</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-[12px]">
                <span className="text-gray-500">Credit Days </span>
                <span className="font-semibold text-gray-900">-</span>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-[12px] font-semibold text-gray-700 mb-3">Recent Invoices</h3>
              <p className="text-[11px] text-gray-400 text-center py-6">No Data Found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar (sticky bottom) */}
      <div className="h-[50px] border-t border-gray-200 px-6 flex items-center justify-between bg-white flex-shrink-0">
        <div className="text-[12px] text-red-500 font-medium">
          Total amount can not be less than zero.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetManualEntry}
            className="px-6 py-2 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50"
          >
            Save & Close
          </button>
          <button
            onClick={resetManualEntry}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded"
          >
            Save & Sync
          </button>
        </div>
      </div>

      {/* Add Particular Modal */}
      {meShowAddParticular && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMeShowAddParticular(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-[960px] max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-[14px] font-semibold text-gray-900">
                  {meAddParticularSource === 'ledger' ? 'Add Ledger For' : 'Add Particular For'}&nbsp;&nbsp;{mePartyName || 'PAARIJAAT PERSONAL CARE PRIVATE LIMITED'} (100000)
                </h2>
                <button
                  onClick={() => setMeShowAddParticular(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
                {/* GSTIN/UIN Row */}
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">GSTIN/UIN</label>
                    <input
                      type="text"
                      placeholder="Enter GSTIN/UIN"
                      className="px-3 py-2 text-[12px] border border-blue-400 rounded w-[260px] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button className="mt-5 px-4 py-2 text-[12px] bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                    Get Data
                  </button>
                  <div className="flex items-center gap-4 ml-auto mt-5">
                    <label className="flex items-center gap-1.5 text-[12px] text-gray-700 cursor-pointer">
                      <input type="radio" name="addPartNameType" defaultChecked className="accent-blue-600" />
                      Trade Name
                    </label>
                    <label className="flex items-center gap-1.5 text-[12px] text-gray-700 cursor-pointer">
                      <input type="radio" name="addPartNameType" className="accent-blue-600" />
                      Business Name
                    </label>
                    <button className="text-[12px] text-blue-600 hover:underline font-medium ml-2">
                      View Ledger
                    </button>
                  </div>
                </div>

                {/* Form Grid - 4 columns */}
                <div className="grid grid-cols-4 gap-x-4 gap-y-4">
                  {/* Row 1 */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">
                      <span className="text-red-500">*</span>Name
                    </label>
                    <input type="text" placeholder="Enter Name" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">
                      <span className="text-red-500">*</span>Ledger Type
                    </label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>{isSalesType ? 'Sundry Debtors' : 'Sundry Creditors'}</option>
                      <option>Sundry Debtors</option>
                      <option>Sundry Creditors</option>
                      <option>Bank Accounts</option>
                      <option>Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Bill by Bill</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Inventory values are affected</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Credit Period(Days)</label>
                    <input type="text" placeholder="Enter Credit Period" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Mailing Name</label>
                    <input type="text" placeholder="Enter Mailing Name" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Address 1</label>
                    <input type="text" placeholder="Enter address" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Address 2</label>
                    <input type="text" placeholder="Enter address" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Country</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>India</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>Canada</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">State</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option value="">Please select state</option>
                      <option>Andhra Pradesh</option>
                      <option>Delhi</option>
                      <option>Gujarat</option>
                      <option>Karnataka</option>
                      <option>Maharashtra</option>
                      <option>Rajasthan</option>
                      <option>Tamil Nadu</option>
                      <option>Uttar Pradesh</option>
                      <option>West Bengal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Pincode</label>
                    <input type="text" placeholder="Enter pincode" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">PAN/IT</label>
                    <input type="text" placeholder="Enter PAN/IT" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>

                  {/* Row 4 */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Registration Type</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Regular</option>
                      <option>Composition</option>
                      <option>Unregistered</option>
                      <option>Consumer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">GSTIN/UIN</label>
                    <input type="text" placeholder="Enter GSTIN/UIN" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Opening Balance</label>
                    <input type="text" placeholder="Enter Opening Balance" className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Dr./Cr.</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Cr.</option>
                      <option>Dr.</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setMeShowAddParticular(false)}
                  className="px-5 py-2 text-[12px] text-gray-700 border border-gray-300 rounded hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setMeShowAddParticular(false)}
                  className="px-5 py-2 text-[12px] bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stock Creation Modal */}
      {/* Stock Creation Modal */}
      {meShowStockCreation && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMeShowStockCreation(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-[960px] max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-[14px] font-semibold text-gray-900">
                  Stock creation for&nbsp;&nbsp;{mePartyName || 'PAARIJAAT PERSONAL CARE PRIVATE LIMITED'} (100000)
                </h2>
                <button
                  onClick={() => setMeShowStockCreation(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto px-6 py-5">
                {/* View Items link */}
                <div className="flex justify-end mb-4">
                  <button onClick={() => setMeShowViewItems(true)} className="text-[12px] text-blue-600 hover:underline font-medium">View Items</button>
                </div>

                {/* Form Grid - 4 columns */}
                <div className="grid grid-cols-4 gap-x-4 gap-y-4">
                  {/* Row 1 */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">
                      <span className="text-red-500">*</span>Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Item name"
                      className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Description</label>
                    <input
                      type="text"
                      placeholder="Enter description"
                      className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Under</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Primary</option>
                      <option>Secondary</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Category</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Not Applicable</option>
                      <option>Raw Material</option>
                      <option>Finished Goods</option>
                    </select>
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Select unit</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Not Applicable</option>
                      <option>Nos</option>
                      <option>Pcs</option>
                      <option>Kg</option>
                      <option>Ltr</option>
                      <option>Mtr</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">GST Applicable</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Applicable</option>
                      <option>Not Applicable</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Set/Alter GST</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Type of supply</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Goods</option>
                      <option>Services</option>
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Taxability</label>
                    <select className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 bg-white">
                      <option>Unknown</option>
                      <option>Taxable</option>
                      <option>Nil Rated</option>
                      <option>Exempt</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">
                      <span className="text-red-500">*</span>Applicable date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="09-04-2026"
                        className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 pr-8"
                      />
                      <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">HSN / SAC</label>
                    <input
                      type="text"
                      placeholder="Enter HSN / SAC"
                      className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 mb-1 block">Value</label>
                    <input
                      type="text"
                      placeholder="Enter value"
                      className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setMeShowStockCreation(false)}
                  className="px-5 py-2 text-[12px] text-gray-700 border border-gray-300 rounded hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setMeShowStockCreation(false)}
                  className="px-5 py-2 text-[12px] bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Items Modal (opens on top of Stock Creation) */}
      {meShowViewItems && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => setMeShowViewItems(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-[560px] max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                <button
                  onClick={() => setMeShowViewItems(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-[14px] font-semibold text-gray-900 flex-1">View Items</h2>
                <button
                  onClick={() => setMeShowViewItems(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-[12px] font-semibold text-gray-600">Name</th>
                      <th className="px-6 py-3 text-left text-[12px] font-semibold text-gray-600">Under</th>
                      <th className="px-6 py-3 text-left text-[12px] font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-gray-300">
                            <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M8 20h32" stroke="currentColor" strokeWidth="2" />
                            <path d="M16 28h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span className="text-[13px] text-gray-400">No data</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setMeShowViewItems(false)}
                  className="px-5 py-2 text-[12px] text-gray-700 border border-gray-300 rounded hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setMeShowViewItems(false)}
                  className="px-5 py-2 text-[12px] bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Additional Details Modal */}
      {meShowAdditionalDetails && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMeShowAdditionalDetails(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-[14px] font-semibold text-gray-900">Additional Details</h2>
                <button
                  onClick={() => setMeShowAdditionalDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto px-6 py-5">
                <div className="border-b border-gray-200 mb-5">
                  <div className="flex flex-wrap gap-6 text-[12px] font-semibold">
                    {ADDITIONAL_DETAILS_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setMeAdditionalDetailsTab(tab.key)}
                        className={`border-b-2 pb-2 transition-colors ${
                          meAdditionalDetailsTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {ADDITIONAL_DETAILS_FIELDS[meAdditionalDetailsTab].map((field) => (
                    <div key={`${meAdditionalDetailsTab}-${field.label}`}>
                      <label className="text-[11px] font-medium text-gray-600 mb-1 block">{field.label}</label>
                      {field.kind === 'date' ? (
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400 pr-8"
                          />
                          <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      ) : field.kind === 'select' ? (
                        <div className="relative">
                          <select
                            defaultValue=""
                            className="w-full appearance-none px-3 py-2 text-[12px] border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-400 pr-8 text-gray-600"
                          >
                            <option value="" disabled>{field.placeholder}</option>
                            {PLACE_OF_SUPPLY_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 text-[12px] border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setMeShowAdditionalDetails(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setMeShowAdditionalDetails(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Configuration Modal */}
      {meShowConfigModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMeShowConfigModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-[800px] max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-[14px] font-semibold text-gray-900">Configuration</h2>
                <button
                  onClick={() => setMeShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto px-6 py-5">
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-3">
                    {CONFIG_LEFT.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={opt.checked}
                          disabled={opt.disabled}
                          className={`w-4 h-4 accent-blue-600 ${opt.disabled ? 'opacity-60' : 'cursor-pointer'}`}
                        />
                        <label className={`text-[12px] ${opt.disabled ? 'text-gray-400' : 'text-gray-700'}`}>{opt.label}</label>
                      </div>
                    ))}

                    {/* Expandable sections */}
                    <div className="space-y-2.5">
                      {CONFIG_LEFT_SECTIONS.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked={opt.checked}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                          />
                          <label className="text-[12px] text-gray-700">{opt.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex-1 space-y-2.5">
                    {/* Party Details – expandable */}
                    <div>
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setMeConfigPartyExpanded(!meConfigPartyExpanded)}
                      >
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label className="text-[12px] text-gray-700 flex-1 cursor-pointer">Party Details</label>
                        <ChevronDown
                          size={14}
                          className={`text-gray-400 transition-transform ${meConfigPartyExpanded ? 'rotate-0' : '-rotate-90'}`}
                        />
                      </div>
                      {meConfigPartyExpanded && (
                        <div className="ml-6 mt-2 space-y-2.5">
                          {CONFIG_PARTY_DETAILS.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                defaultChecked={opt.checked}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                              />
                              <label className="text-[12px] text-gray-700">{opt.label}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Remaining right-column options */}
                    {CONFIG_RIGHT_AFTER.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={opt.checked}
                          disabled={opt.disabled}
                          className={`w-4 h-4 accent-blue-600 ${opt.disabled ? 'opacity-60' : 'cursor-pointer'}`}
                        />
                        <label className={`text-[12px] ${opt.disabled ? 'text-gray-400' : 'text-gray-700'}`}>{opt.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setMeShowConfigModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-[12px] font-medium rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setMeShowConfigModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
