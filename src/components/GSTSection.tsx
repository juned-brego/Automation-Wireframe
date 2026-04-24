'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  CloudUpload,
  Download,
  ExternalLink,
  FileText,
  Info,
  Link2,
  Lock,
  Mail,
  MoreVertical,
  RefreshCcw,
  Search,
  Send,
  Settings2,
  Share2,
  Smartphone,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';

type GstTab = 'Overview' | 'GSTR1' | 'GSTR2B' | 'GSTR3B' | 'ITC';
type FilingState = 'blocked' | 'filed';
type ReconciliationState = 'Processing' | 'Pending';
type PeriodState = 'Filed' | 'Complete' | 'Processing';
type PeriodReconciledState = 'Pending' | 'Reconciled';
type Gstr1View =
  | 'data-prepare'
  | 'check-invoices'
  | 'push-to-gstn'
  | 'file-gstr1'
  | 'import-data'
  | 'add-invoice'
  | 'add-amendment'
  | 'corrections';
type Gstr3bView = 'summary-data' | 'prepare-file' | 'push-to-gstn' | 'file-gstr-3b' | 'nil-return';
type Gstr3bSectionId = '3.1' | '3.1.1' | '3.2' | '4' | '5' | '5.1' | '6.1';
type Gstr1CheckTab = 'Invoice' | 'Credit / Debit Note' | 'B2CS' | 'Advance Receipt' | 'Export';
type Gstr1CheckColumnKey =
  | 'date'
  | 'invoiceNumber'
  | 'customer'
  | 'gstin'
  | 'taxableAmount'
  | 'totalTax'
  | 'rate'
  | 'totalAmount'
  | 'type'
  | 'status';
type Gstr1DocType =
  | 'B2B'
  | 'B2CS'
  | 'B2C LARGE'
  | 'EXPORT'
  | 'CDNR'
  | 'CDNUR'
  | 'Advanced Received'
  | 'HSN'
  | 'Docs';
type Gstr1AmendmentDocType =
  | 'B2B Amendment'
  | 'B2C Large Amendment'
  | 'Credit / Debit Note (Registered) Amendment'
  | 'Credit / Debit Note (Unregistered) Amendment'
  | 'Export Amendment'
  | 'B2C Others Amendment'
  | 'Advances Received Amendment'
  | 'Adjustment of Advances Amendment'
  | 'Supplies through E-Commerce Amendment'
  | 'Supplies U/s 9(5) Amendment';
type Gstr1CorrectionIssueType = 'gstin' | 'credit-note-linkage' | 'document-gap';
type Gstr1CorrectionStatus = 'open' | 'resolved';
type Gstr1DocumentResolution = 'mark-cancelled' | 'enter-missing-document' | 'ignore-with-reason';
type Gstr1SaveScope = 'draft-master' | 'draft-only';
type Gstr1PushMode = 'without-otp' | 'via-otp';
type Gstr1ImportOption =
  | 'government-excel'
  | 'munim-connector'
  | 'tally-connector'
  | 'json-file'
  | 'copy-paste'
  | 'munim-excel'
  | 'ecommerce-template';
type Gstr3bScenario = 'payment-required' | 'ready-to-file' | 'filed';
type Gstr3bStepState = 'done' | 'current' | 'waiting' | 'manual';
type TransactionStatus =
  | 'Not In Tally'
  | 'Not In Portal'
  | 'Matched'
  | 'Partially-Matched'
  | 'B2C Invoice'
  | 'Ignore';
type MoveDirection =
  | 'Select To Move'
  | 'Forwarded'
  | 'Backward to Previous Month'
  | 'Forward to Next Month';
type ModalKind =
  | 'overview-connect'
  | 'gstr1-get'
  | 'gstr1-upload'
  | 'gstr1-nil-return'
  | 'gstr2b-login'
  | 'gstr3b-download'
  | 'gstr3b-guide'
  | 'share'
  | null;
type Gstr2bIssue = 'Missing In Tally' | 'Amount Mismatch' | 'Party Mismatch';

interface TrackerCell {
  month: string;
  state: FilingState;
  arn?: string;
  filingDate?: string;
  amendmentDate?: string;
  originalDate?: string;
}

interface FilingRow {
  label: string;
  cells: TrackerCell[];
}

interface ReconciliationRow {
  month: string;
  gstrVsBooks: ReconciliationState;
  twoAVsBooks: ReconciliationState;
  twoBVsBooks: ReconciliationState;
}

interface Announcement {
  id: number;
  date: string;
  title: string;
  note: string;
  tag: 'Circular' | 'Notification' | 'Gf';
}

interface PeriodRecord {
  id: string;
  month: string;
  lastSyncDate: string;
  totalInvoice: number;
  reconciled: PeriodReconciledState;
  status: PeriodState;
  locked: boolean;
}

interface TransactionRecord {
  id: string;
  status: TransactionStatus;
  move: MoveDirection;
  gstInvoiceNo: string;
  tallyInvoiceNo: string;
  gstInvoiceDate: string;
  tallyInvoiceDate: string;
  gstPartyName: string;
  tallyPartyName: string;
  gstNo: string;
  tallyNo: string;
  highlightInvoice?: boolean;
  highlightDate?: boolean;
  highlightParty?: boolean;
  highlightNo?: boolean;
}

interface DetailContext {
  periodId: string;
  periodMonth: string;
}

interface Gstr2bOutputRow {
  id: string;
  gstInvoiceNo: string;
  tallyInvoiceNo: string;
  gstAmount: string;
  tallyAmount: string;
  gstPartyName: string;
  tallyPartyName: string;
  issue: Gstr2bIssue;
}

interface TrackerTooltipState {
  cell: TrackerCell;
  left: number;
  top: number;
  placement: 'top' | 'bottom';
}

interface ActionMenuState {
  periodId: string;
  left: number;
  top: number;
  placement: 'top' | 'bottom';
}

interface Gstr3bStep {
  title: string;
  detail: string;
  status: Gstr3bStepState;
  meta: string;
}

interface Gstr3bSummaryCard {
  label: string;
  value: string;
  note: string;
  tone: string;
}

interface Gstr3bOffsetRow {
  bucket: string;
  liability: string;
  itcUsed: string;
  cashUsed: string;
  balance: string;
}

interface Gstr3bAuditItem {
  time: string;
  title: string;
  detail: string;
  tone: string;
}

interface Gstr3bScenarioView {
  statusLabel: string;
  statusTone: string;
  bannerTone: string;
  bannerTitle: string;
  bannerDescription: string;
  summaryCards: Gstr3bSummaryCard[];
  steps: Gstr3bStep[];
  offsetRows: Gstr3bOffsetRow[];
  auditTrail: Gstr3bAuditItem[];
}

interface Gstr1PreviewSection {
  code: string;
  title: string;
  invoices: string;
  taxableValue: string;
  taxValue: string;
  linkedIssueType?: Gstr1CorrectionIssueType;
  status: 'Ready' | 'Needs Review';
}

interface Gstr1ValidationItem {
  issueType: Gstr1CorrectionIssueType;
  title: string;
  detail: string;
  tone: 'amber' | 'blue' | 'emerald';
}

interface Gstr1CustomerMasterRecord {
  customerName: string;
  gstin: string;
  registrationType: string;
  placeOfSupply: string;
  pan: string;
  lastUpdated: string;
}

interface Gstr1LookupPreview {
  tradeName: string;
  businessName: string;
  registrationType: string;
  state: string;
  pan: string;
}

interface Gstr1CorrectionRecord {
  id: string;
  issueType: Gstr1CorrectionIssueType;
  status: Gstr1CorrectionStatus;
  sectionCode: 'B2B' | 'CDNR' | 'DOCS';
  invoiceNo: string;
  invoiceDate: string;
  partyName: string;
  currentGstin: string;
  registrationType: string;
  placeOfSupply: string;
  pan: string;
  taxableValue: string;
  errorReason: string;
  lastUpdated: string;
  notes: string;
  noteNo?: string;
  noteDate?: string;
  originalInvoiceRef?: string;
  expectedInvoiceRef?: string;
  candidateInvoiceRefs?: string[];
  seriesName?: string;
  previousNumber?: string;
  missingNumber?: string;
  nextNumber?: string;
  detectedReason?: string;
  resolutionAction?: Gstr1DocumentResolution;
  resolutionLabel?: string;
  masterUpdated?: boolean;
}

interface Gstr1CorrectionEditorState {
  customerName: string;
  gstin: string;
  registrationType: string;
  placeOfSupply: string;
  pan: string;
  notes: string;
  originalInvoiceRef: string;
  expectedInvoiceRef: string;
  resolutionAction: Gstr1DocumentResolution;
  missingDocumentNo: string;
  resolutionReason: string;
  lookupPreview: Gstr1LookupPreview | null;
}

interface Gstr1PrepareRow {
  code: string;
  title: string;
  documents: string;
  taxableAmount: string;
  igst: string;
  cgst: string;
  sgst: string;
  cess: string;
  taxAmount: string;
  invoiceValue: string;
  editable?: boolean;
  linkedIssueType?: Gstr1CorrectionIssueType;
}

interface Gstr1OtherDetailRow {
  title: string;
  countOfDocuments: string;
  cancelledDocs: string;
  netIssuedDocs: string;
  linkedIssueType?: Gstr1CorrectionIssueType;
}

interface Gstr1InvoiceSectionRow {
  title: string;
  documents: string;
  taxableAmount: string;
  igst: string;
  cgst: string;
  sgst: string;
  cess: string;
  taxAmount: string;
  invoiceValue: string;
  editable?: boolean;
  linkedIssueType?: Gstr1CorrectionIssueType;
}

interface Gstr1CheckedInvoiceRow {
  id: string;
  date: string;
  invoiceNumber: string;
  customer: string;
  gstin: string;
  taxableAmount: string;
  totalTax: string;
  rate: string;
  totalAmount: string;
  type: string;
  status: string;
}

interface Gstr1DraftInvoiceRow {
  id: string;
  sourceCheckRowId?: string;
  sourceCheckTab?: Gstr1CheckTab;
  gstin: string;
  receiverName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: string;
  noteNumber: string;
  noteDate: string;
  noteType: string;
  exportType: string;
  placeOfSupply: string;
  portCode: string;
  shippingBillNumber: string;
  shippingBillDate: string;
  reverseCharge: string;
  applicableTaxRate: string;
  invoiceType: string;
  ecommerceGstin: string;
  rate: string;
  grossAdvanceReceived: string;
  hsnCode: string;
  description: string;
  uqc: string;
  totalQuantity: string;
  totalValue: string;
  integratedTax: string;
  centralTax: string;
  stateTax: string;
  fromSerial: string;
  toSerial: string;
  totalNumber: string;
  cancelledNumber: string;
  netIssued: string;
  taxableValue: string;
  cessAmount: string;
}

interface Gstr1AmendmentDraftRow {
  id: string;
  gstin: string;
  receiverName: string;
  originalInvoiceNumber: string;
  originalInvoiceDate: string;
  revisedInvoiceNumber: string;
  revisedInvoiceDate: string;
  invoiceValue: string;
  noteType: string;
  exportType: string;
  placeOfSupply: string;
  portCode: string;
  shippingBillNumber: string;
  shippingBillDate: string;
  reverseCharge: string;
  applicableTaxRate: string;
  invoiceType: string;
  ecommerceGstin: string;
  rate: string;
  grossAdvanceReceived: string;
  taxableValue: string;
  cessAmount: string;
}

interface Gstr1ImportOptionCard {
  key: Gstr1ImportOption;
  title: string;
  description: string;
  beta?: boolean;
}

interface Gstr1DocColumn {
  key: keyof Gstr1DraftInvoiceRow;
  label: string;
  minWidth?: string;
}

interface Gstr1AmendmentColumn {
  key: keyof Gstr1AmendmentDraftRow;
  label: string;
  minWidth?: string;
}

interface Gstr1CheckColumn {
  key: Gstr1CheckColumnKey;
  label: string;
  filterPlaceholder: string;
}

interface Gstr1PushTableRow {
  title: string;
  toBeUploaded: string;
  uploaded: string;
  href?: string;
}

interface Gstr3bSummaryMetric {
  label: string;
  value: string;
}

interface Gstr3bSummarySection {
  id: Gstr3bSectionId;
  title: string;
  metrics: Gstr3bSummaryMetric[];
}

interface Gstr3bPrepareColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
}

interface Gstr3bPrepareSection {
  id: Gstr3bSectionId;
  title: string;
  description: string;
  columns: Gstr3bPrepareColumn[];
  rows: Record<string, string>[];
  note?: string;
}

interface GstRouteState {
  activeTab: GstTab;
  gstr1View: Gstr1View;
  gstr3bView: Gstr3bView;
  gstr3bSectionId: Gstr3bSectionId;
  gstr1CheckTab: Gstr1CheckTab;
  gstr1IssueType: Gstr1CorrectionIssueType;
  gstr1RecordId: string | null;
  detailPeriodId: string | null;
}

const GST_TABS: GstTab[] = ['Overview', 'GSTR1', 'GSTR2B', 'GSTR3B', 'ITC'];
const GST_BASE_PATH = '/app/da/gst';
const GST_TAB_TO_SEGMENT: Record<GstTab, string> = {
  Overview: 'overview',
  GSTR1: 'gstr1',
  GSTR2B: 'gstr2b',
  GSTR3B: 'gstr3b',
  ITC: 'itc',
};
const GST_SEGMENT_TO_TAB: Record<string, GstTab> = {
  overview: 'Overview',
  gstr1: 'GSTR1',
  gstr2b: 'GSTR2B',
  gstr3b: 'GSTR3B',
  itc: 'ITC',
};
const GSTR1_VIEW_TO_SEGMENT: Record<Gstr1View, string> = {
  'data-prepare': 'data-prepare',
  'check-invoices': 'check-invoices',
  'push-to-gstn': 'push-to-gstn',
  'file-gstr1': 'file-gstr-1',
  'import-data': 'import-data',
  'add-invoice': 'add-invoice',
  'add-amendment': 'add-amendment',
  corrections: 'corrections',
};
const GSTR1_SEGMENT_TO_VIEW: Record<string, Gstr1View> = Object.fromEntries(
  Object.entries(GSTR1_VIEW_TO_SEGMENT).map(([view, segment]) => [segment, view]),
) as Record<string, Gstr1View>;
const GSTR3B_VIEW_TO_SEGMENT: Record<Gstr3bView, string> = {
  'summary-data': 'summary-data',
  'prepare-file': 'prepare-file',
  'push-to-gstn': 'push-to-gstn',
  'file-gstr-3b': 'file-gstr-3b',
  'nil-return': 'nil-return',
};
const GSTR3B_SEGMENT_TO_VIEW: Record<string, Gstr3bView> = Object.fromEntries(
  Object.entries(GSTR3B_VIEW_TO_SEGMENT).map(([view, segment]) => [segment, view]),
) as Record<string, Gstr3bView>;
const GSTR3B_SECTION_TO_SEGMENT: Record<Gstr3bSectionId, string> = {
  '3.1': '3-1',
  '3.1.1': '3-1-1',
  '3.2': '3-2',
  '4': '4',
  '5': '5',
  '5.1': '5-1',
  '6.1': '6-1',
};
const GSTR3B_SEGMENT_TO_SECTION: Record<string, Gstr3bSectionId> = Object.fromEntries(
  Object.entries(GSTR3B_SECTION_TO_SEGMENT).map(([section, segment]) => [segment, section]),
) as Record<string, Gstr3bSectionId>;
const GSTR1_CHECK_TAB_TO_SEGMENT: Record<Gstr1CheckTab, string> = {
  Invoice: 'invoice',
  'Credit / Debit Note': 'credit-debit-note',
  B2CS: 'b2cs',
  'Advance Receipt': 'advance-receipt',
  Export: 'export',
};
const GSTR1_SEGMENT_TO_CHECK_TAB: Record<string, Gstr1CheckTab> = Object.fromEntries(
  Object.entries(GSTR1_CHECK_TAB_TO_SEGMENT).map(([tab, segment]) => [segment, tab]),
) as Record<string, Gstr1CheckTab>;
const GSTR1_ISSUE_TO_SEGMENT: Record<Gstr1CorrectionIssueType, string> = {
  gstin: 'gstin',
  'credit-note-linkage': 'credit-note-linkage',
  'document-gap': 'document-gap',
};
const GSTR1_SEGMENT_TO_ISSUE: Record<string, Gstr1CorrectionIssueType> = Object.fromEntries(
  Object.entries(GSTR1_ISSUE_TO_SEGMENT).map(([issueType, segment]) => [segment, issueType]),
) as Record<string, Gstr1CorrectionIssueType>;
const GST_COMPANY = {
  shortName: 'PAARIJAAT PERSONAL CARE PRIVATE...',
  period: '01/04/2026 - 31/03/2027',
};
const RETURN_MONTHS = ['Apr 23', 'May 23', 'Jun 23', 'Jul 23', 'Aug 23', 'Sep 23', 'Oct 23', 'Nov 23', 'Dec 23', 'Jan 24', 'Feb 24', 'Mar 24'];
const FINANCIAL_YEARS = ['2017-18', '2018-19', '2019-20', '2020-21', '2021-22', '2022-23', '2023-24', '2024-25', '2025-26'];
const MONTH_PICKER_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_FILTERS: TransactionStatus[] = ['Not In Tally', 'Not In Portal', 'Matched', 'Partially-Matched', 'B2C Invoice'];
const STATUS_OPTIONS: TransactionStatus[] = ['Ignore', 'Not In Tally', 'Not In Portal', 'Matched', 'Partially-Matched', 'B2C Invoice'];
const MOVE_OPTIONS: MoveDirection[] = ['Select To Move', 'Backward to Previous Month', 'Forward to Next Month'];

const COMPANY_NAME_FULL = 'Sunit Finvest Private Limited';
const COMPANY_PERIOD = {
  from: '01-05-2023',
  to: '31-05-2023',
};

function formatFiscalMonth(date: string) {
  const [month, year] = date.split(' ');
  return `${month} ${year}`;
}

function parseGstRoute(pathname: string, searchParams: URLSearchParams): GstRouteState {
  const normalizedPath = pathname.startsWith(GST_BASE_PATH) ? pathname.slice(GST_BASE_PATH.length) : pathname;
  const segments = normalizedPath.split('/').filter(Boolean);
  const routeState: GstRouteState = {
    activeTab: 'Overview',
    gstr1View: 'data-prepare',
    gstr3bView: 'summary-data',
    gstr3bSectionId: '3.1',
    gstr1CheckTab: 'Invoice',
    gstr1IssueType: 'gstin',
    gstr1RecordId: null,
    detailPeriodId: null,
  };

  if (segments.length === 0) {
    return routeState;
  }

  const activeTab = GST_SEGMENT_TO_TAB[segments[0]];
  if (!activeTab) {
    return routeState;
  }

  routeState.activeTab = activeTab;

  if (activeTab === 'GSTR3B') {
    routeState.gstr3bView = GSTR3B_SEGMENT_TO_VIEW[segments[1] ?? ''] ?? 'summary-data';
    const section = searchParams.get('section') ?? GSTR3B_SECTION_TO_SEGMENT['3.1'];
    routeState.gstr3bSectionId = GSTR3B_SEGMENT_TO_SECTION[section] ?? '3.1';
    return routeState;
  }

  if (activeTab !== 'GSTR1') {
    return routeState;
  }

  if (segments[1] === 'transactions') {
    routeState.detailPeriodId = searchParams.get('period');
    return routeState;
  }

  routeState.gstr1View = GSTR1_SEGMENT_TO_VIEW[segments[1] ?? ''] ?? 'data-prepare';

  if (routeState.gstr1View === 'check-invoices') {
    const section = searchParams.get('section') ?? GSTR1_CHECK_TAB_TO_SEGMENT.Invoice;
    routeState.gstr1CheckTab = GSTR1_SEGMENT_TO_CHECK_TAB[section] ?? 'Invoice';
  }

  if (routeState.gstr1View === 'corrections') {
    const issue = searchParams.get('issue') ?? GSTR1_ISSUE_TO_SEGMENT.gstin;
    routeState.gstr1IssueType = GSTR1_SEGMENT_TO_ISSUE[issue] ?? 'gstin';
    routeState.gstr1RecordId = searchParams.get('record');
  }

  return routeState;
}

function buildGstHref({
  activeTab,
  gstr1View = 'data-prepare',
  gstr3bView = 'summary-data',
  gstr3bSectionId = '3.1',
  gstr1CheckTab = 'Invoice',
  issueType = 'gstin',
  recordId = null,
  detailPeriodId = null,
}: {
  activeTab: GstTab;
  gstr1View?: Gstr1View;
  gstr3bView?: Gstr3bView;
  gstr3bSectionId?: Gstr3bSectionId;
  gstr1CheckTab?: Gstr1CheckTab;
  issueType?: Gstr1CorrectionIssueType;
  recordId?: string | null;
  detailPeriodId?: string | null;
}) {
  const params = new URLSearchParams();
  let path = `${GST_BASE_PATH}/${GST_TAB_TO_SEGMENT[activeTab]}`;

  if (activeTab === 'GSTR1') {
    if (detailPeriodId) {
      path = `${GST_BASE_PATH}/gstr1/transactions`;
      params.set('period', detailPeriodId);
    } else {
      path = `${GST_BASE_PATH}/gstr1/${GSTR1_VIEW_TO_SEGMENT[gstr1View]}`;

      if (gstr1View === 'check-invoices') {
        params.set('section', GSTR1_CHECK_TAB_TO_SEGMENT[gstr1CheckTab]);
      }

      if (gstr1View === 'corrections') {
        params.set('issue', GSTR1_ISSUE_TO_SEGMENT[issueType]);
        if (recordId) {
          params.set('record', recordId);
        }
      }
    }
  } else if (activeTab === 'GSTR3B') {
    path = `${GST_BASE_PATH}/gstr3b/${GSTR3B_VIEW_TO_SEGMENT[gstr3bView]}`;
    if (gstr3bView === 'prepare-file') {
      params.set('section', GSTR3B_SECTION_TO_SEGMENT[gstr3bSectionId]);
    }
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function formatNumberAmount(value: number) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function createFiledCell(month: string, filingDate: string, amendmentDate: string, originalDate: string): TrackerCell {
  return {
    month,
    state: 'filed',
    arn: `AA070523${month.replace(' ', '')}XZ21`,
    filingDate,
    amendmentDate,
    originalDate,
  };
}

const CONNECTED_TRACKER: FilingRow[] = [
  {
    label: 'GSTR 1',
    cells: [
      createFiledCell('Apr 23', '08-05-2023', '30-05-2023', '12-05-2017'),
      createFiledCell('May 23', '08-06-2023', '30-06-2023', '12-05-2017'),
      createFiledCell('Jun 23', '08-07-2023', '30-07-2023', '12-05-2017'),
      createFiledCell('Jul 23', '08-08-2023', '29-08-2023', '12-05-2017'),
      createFiledCell('Aug 23', '08-09-2023', '29-09-2023', '12-05-2017'),
      createFiledCell('Sep 23', '08-10-2023', '30-10-2023', '12-05-2017'),
      createFiledCell('Oct 23', '08-11-2023', '29-11-2023', '12-05-2017'),
      createFiledCell('Nov 23', '08-12-2023', '29-12-2023', '12-05-2017'),
      createFiledCell('Dec 23', '08-01-2024', '29-01-2024', '12-05-2017'),
      createFiledCell('Jan 24', '08-02-2024', '28-02-2024', '12-05-2017'),
      { month: 'Feb 24', state: 'blocked' },
      { month: 'Mar 24', state: 'blocked' },
    ],
  },
  {
    label: 'GSTR 3B',
    cells: [
      createFiledCell('Apr 23', '20-05-2023', '30-05-2023', '12-05-2017'),
      createFiledCell('May 23', '20-06-2023', '30-06-2023', '12-05-2017'),
      createFiledCell('Jun 23', '20-07-2023', '30-07-2023', '12-05-2017'),
      createFiledCell('Jul 23', '20-08-2023', '29-08-2023', '12-05-2017'),
      createFiledCell('Aug 23', '20-09-2023', '29-09-2023', '12-05-2017'),
      createFiledCell('Sep 23', '20-10-2023', '30-10-2023', '12-05-2017'),
      createFiledCell('Oct 23', '20-11-2023', '29-11-2023', '12-05-2017'),
      createFiledCell('Nov 23', '20-12-2023', '29-12-2023', '12-05-2017'),
      createFiledCell('Dec 23', '20-01-2024', '29-01-2024', '12-05-2017'),
      createFiledCell('Jan 24', '20-02-2024', '28-02-2024', '12-05-2017'),
      { month: 'Feb 24', state: 'blocked' },
      { month: 'Mar 24', state: 'blocked' },
    ],
  },
];

const DISCONNECTED_TRACKER: FilingRow[] = [
  {
    label: 'GSTR 1',
    cells: RETURN_MONTHS.map((month) => ({ month, state: 'blocked' })),
  },
  {
    label: 'GSTR 3B',
    cells: RETURN_MONTHS.map((month) => ({ month, state: 'blocked' })),
  },
];

const RECONCILIATION_ROWS: ReconciliationRow[] = [
  { month: 'Apr 2023', gstrVsBooks: 'Processing', twoAVsBooks: 'Pending', twoBVsBooks: 'Pending' },
  { month: 'May 2023', gstrVsBooks: 'Pending', twoAVsBooks: 'Pending', twoBVsBooks: 'Pending' },
  { month: 'Jun 2023', gstrVsBooks: 'Pending', twoAVsBooks: 'Pending', twoBVsBooks: 'Pending' },
  { month: 'Jul 2023', gstrVsBooks: 'Pending', twoAVsBooks: 'Pending', twoBVsBooks: 'Pending' },
  { month: 'Aug 2023', gstrVsBooks: 'Pending', twoAVsBooks: 'Pending', twoBVsBooks: 'Pending' },
  { month: 'Sep 2023', gstrVsBooks: 'Pending', twoAVsBooks: 'Pending', twoBVsBooks: 'Pending' },
  { month: 'Oct 2023', gstrVsBooks: 'Pending', twoAVsBooks: 'Pending', twoBVsBooks: 'Pending' },
  { month: 'Nov 2023', gstrVsBooks: 'Pending', twoAVsBooks: 'Pending', twoBVsBooks: 'Pending' },
];

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    date: '29/12/2023',
    title: 'Advisory: Date extension for reporting opening balance for ITC reversal',
    note: 'Opening balance changes can still be reported without impacting already synced returns.',
    tag: 'Circular',
  },
  {
    id: 2,
    date: '01/01/2024',
    title: 'Advisory on the functionalities available on the portal for the GTA taxpayers',
    note: 'Portal capabilities for GTA taxpayers have been refreshed for the new filing period.',
    tag: 'Notification',
  },
  {
    id: 3,
    date: '15/01/2024',
    title: 'Advisory on introduction of new Tables 14 & 15 in GSTR-1',
    note: 'New tables are now available for outbound invoice declarations in the active return cycle.',
    tag: 'Gf',
  },
];

const SALES_PURCHASE_DATA = [
  { month: 'Apr 23', sales: 6.4, purchase: 5.9 },
  { month: 'May 23', sales: 7.2, purchase: 6.1 },
  { month: 'Jun 23', sales: 7.8, purchase: 6.7 },
  { month: 'Jul 23', sales: 6.9, purchase: 6.5 },
  { month: 'Aug 23', sales: 8.1, purchase: 7.2 },
];

const LIABILITY_BARS = [
  { label: 'Output Tax', amount: 'Rs 12.84L', width: 82, tone: 'bg-blue-600' },
  { label: 'Input Credit', amount: 'Rs 8.42L', width: 56, tone: 'bg-emerald-500' },
  { label: 'Net Liability', amount: 'Rs 4.42L', width: 31, tone: 'bg-amber-400' },
];

const GSTR2B_OUTPUTS = [
  'Highlight missing invoices in Tally',
  'Highlight amount mismatch',
  'Highlight party to file GST',
];

const GSTR2B_OUTPUT_ROWS: Gstr2bOutputRow[] = [
  {
    id: 'gstr2b-1',
    gstInvoiceNo: 'GST2B/0523/0043',
    tallyInvoiceNo: '-',
    gstAmount: '42,500.00',
    tallyAmount: '-',
    gstPartyName: 'DOQFY INTERNET PRIVATE LIMITED',
    tallyPartyName: '-',
    issue: 'Missing In Tally',
  },
  {
    id: 'gstr2b-2',
    gstInvoiceNo: 'GST2B/0523/0098',
    tallyInvoiceNo: 'PUR/0523/0098',
    gstAmount: '18,960.00',
    tallyAmount: '18,650.00',
    gstPartyName: 'GOOGLE INDIA PRIVATE LIMITED',
    tallyPartyName: 'Google India Private Limited',
    issue: 'Amount Mismatch',
  },
  {
    id: 'gstr2b-3',
    gstInvoiceNo: 'GST2B/0523/0117',
    tallyInvoiceNo: 'PUR/0523/0117',
    gstAmount: '7,800.00',
    tallyAmount: '7,800.00',
    gstPartyName: 'ZOHO CORPORATION PRIVATE LIMITED',
    tallyPartyName: 'Zoho Corp Pvt Ltd',
    issue: 'Party Mismatch',
  },
];

const GSTR1_ISSUE_ORDER: Gstr1CorrectionIssueType[] = ['gstin', 'credit-note-linkage', 'document-gap'];
const GSTR1_REGISTRATION_TYPES = ['Regular', 'Composition', 'Unregistered', 'Consumer'];
const GSTR1_PLACE_OF_SUPPLY_OPTIONS = ['Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Rajasthan', 'Tamil Nadu'];
const GSTR1_ISSUE_META: Record<
  Gstr1CorrectionIssueType,
  {
    label: string;
    shortLabel: string;
    sectionCode: 'B2B' | 'CDNR' | 'DOCS';
    description: string;
    tone: string;
  }
> = {
  gstin: {
    label: 'Customer GSTIN',
    shortLabel: 'GSTIN',
    sectionCode: 'B2B',
    description: 'Correct GST number, registration type, and place of supply before filing.',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  'credit-note-linkage': {
    label: 'Credit Note Linkage',
    shortLabel: 'Credit Note Linkage',
    sectionCode: 'CDNR',
    description: 'Link every credit note to the original invoice reference expected in CDNR.',
    tone: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  'document-gap': {
    label: 'Document Series Gap',
    shortLabel: 'Document Series Gap',
    sectionCode: 'DOCS',
    description: 'Resolve skipped document numbers by cancelling, entering, or ignoring with reason.',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};
const GSTR1_PREVIEW_SECTION_DEFS: Omit<Gstr1PreviewSection, 'status'>[] = [
  {
    code: 'B2B',
    title: 'Business Invoices',
    invoices: '184',
    taxableValue: 'Rs 10.24L',
    taxValue: 'Rs 1.84L',
    linkedIssueType: 'gstin',
  },
  { code: 'B2CL', title: 'Large B2C Invoices', invoices: '12', taxableValue: 'Rs 1.18L', taxValue: 'Rs 0.21L' },
  { code: 'B2CS', title: 'Small B2C Summary', invoices: '73', taxableValue: 'Rs 2.64L', taxValue: 'Rs 0.48L' },
  {
    code: 'CDNR',
    title: 'Credit / Debit Notes',
    invoices: '9',
    taxableValue: 'Rs 0.36L',
    taxValue: 'Rs 0.06L',
    linkedIssueType: 'credit-note-linkage',
  },
  { code: 'HSN', title: 'HSN Summary', invoices: '26 lines', taxableValue: 'Rs 13.88L', taxValue: 'Cross-check' },
  {
    code: 'DOCS',
    title: 'Document Summary',
    invoices: '4 series',
    taxableValue: 'Serial check',
    taxValue: 'Ready',
    linkedIssueType: 'document-gap',
  },
];
const INITIAL_GSTR1_CORRECTIONS: Gstr1CorrectionRecord[] = [
  {
    id: 'gstr1-gstin-1',
    issueType: 'gstin',
    status: 'open',
    sectionCode: 'B2B',
    invoiceNo: 'INV/23-24/118',
    invoiceDate: '18-05-2023',
    partyName: 'Urban Retail LLP',
    currentGstin: '',
    registrationType: 'Regular',
    placeOfSupply: 'Maharashtra',
    pan: 'AAACU5532B',
    taxableValue: 'Rs 1.18L',
    errorReason: 'GSTIN is missing on this B2B invoice.',
    lastUpdated: '14-04-2026, 11:10 AM',
    notes: 'Customer is registered but GSTIN was not captured during upload.',
  },
  {
    id: 'gstr1-gstin-2',
    issueType: 'gstin',
    status: 'open',
    sectionCode: 'B2B',
    invoiceNo: 'INV/23-24/119',
    invoiceDate: '18-05-2023',
    partyName: 'Urban Retail LLP',
    currentGstin: '27AAACU5532',
    registrationType: 'Regular',
    placeOfSupply: 'Maharashtra',
    pan: 'AAACU5532B',
    taxableValue: 'Rs 0.96L',
    errorReason: 'GSTIN format is incomplete and cannot be pushed to B2B.',
    lastUpdated: '14-04-2026, 11:10 AM',
    notes: 'Same customer appears on multiple invoices in the draft.',
  },
  {
    id: 'gstr1-linkage-1',
    issueType: 'credit-note-linkage',
    status: 'open',
    sectionCode: 'CDNR',
    invoiceNo: 'CN/23-24/009',
    invoiceDate: '22-05-2023',
    partyName: 'Kedar Wellness Private Limited',
    currentGstin: '27AABCK2040P1ZX',
    registrationType: 'Regular',
    placeOfSupply: 'Gujarat',
    pan: 'AABCK2040P',
    taxableValue: 'Rs 0.36L',
    errorReason: 'Original invoice reference is blank, so this note cannot move to CDNR yet.',
    lastUpdated: '14-04-2026, 11:32 AM',
    notes: 'Map the note to the invoice against which the return or discount was raised.',
    noteNo: 'CN/23-24/009',
    noteDate: '22-05-2023',
    originalInvoiceRef: '',
    expectedInvoiceRef: 'INV/23-24/084',
    candidateInvoiceRefs: ['INV/23-24/084', 'INV/23-24/081', 'INV/23-24/079'],
  },
  {
    id: 'gstr1-docs-1',
    issueType: 'document-gap',
    status: 'open',
    sectionCode: 'DOCS',
    invoiceNo: 'INV/23-24/144',
    invoiceDate: '23-05-2023',
    partyName: 'Outward Document Series',
    currentGstin: '',
    registrationType: 'Regular',
    placeOfSupply: 'Maharashtra',
    pan: '',
    taxableValue: 'Serial check',
    errorReason: 'Numbering gap detected in outward invoices. Confirm whether the missing document was cancelled.',
    lastUpdated: '14-04-2026, 12:04 PM',
    notes: 'Series skipped after a manual upload retry.',
    seriesName: 'INV/23-24',
    previousNumber: 'INV/23-24/144',
    missingNumber: 'INV/23-24/145',
    nextNumber: 'INV/23-24/146',
    detectedReason: 'Sequence jumped after manual upload adjustment.',
  },
];
const INITIAL_GSTR1_CUSTOMER_MASTER: Record<string, Gstr1CustomerMasterRecord> = {
  'Urban Retail LLP': {
    customerName: 'Urban Retail LLP',
    gstin: '',
    registrationType: 'Regular',
    placeOfSupply: 'Maharashtra',
    pan: 'AAACU5532B',
    lastUpdated: '14-04-2026, 10:58 AM',
  },
  'Kedar Wellness Private Limited': {
    customerName: 'Kedar Wellness Private Limited',
    gstin: '27AABCK2040P1ZX',
    registrationType: 'Regular',
    placeOfSupply: 'Gujarat',
    pan: 'AABCK2040P',
    lastUpdated: '14-04-2026, 09:42 AM',
  },
};
const GSTR1_DOCUMENT_RESOLUTION_LABELS: Record<Gstr1DocumentResolution, string> = {
  'mark-cancelled': 'Marked as Cancelled',
  'enter-missing-document': 'Missing Document Entered',
  'ignore-with-reason': 'Ignored with Reason',
};
const GSTR1_PERIOD_OPTIONS = ['Mar 2026 (Monthly)', 'Feb 2026 (Monthly)', 'Jan 2026 (Monthly)'];
const GSTR1_CHECK_TABS: Gstr1CheckTab[] = ['Invoice', 'Credit / Debit Note', 'B2CS', 'Advance Receipt', 'Export'];
const GSTR1_DOC_TYPES: Gstr1DocType[] = [
  'B2B',
  'B2CS',
  'B2C LARGE',
  'EXPORT',
  'CDNR',
  'CDNUR',
  'Advanced Received',
  'HSN',
  'Docs',
];
const GSTR1_AMENDMENT_DOC_TYPES: Gstr1AmendmentDocType[] = [
  'B2B Amendment',
  'B2C Large Amendment',
  'Credit / Debit Note (Registered) Amendment',
  'Credit / Debit Note (Unregistered) Amendment',
  'Export Amendment',
  'B2C Others Amendment',
  'Advances Received Amendment',
  'Adjustment of Advances Amendment',
  'Supplies through E-Commerce Amendment',
  'Supplies U/s 9(5) Amendment',
];
const GSTR1_IMPORT_OPTIONS: Gstr1ImportOptionCard[] = [
  {
    key: 'government-excel',
    title: 'Government Excel / CSV',
    description: 'Import data which was prepared using a govt. Excel template.',
  },
  {
    key: 'munim-connector',
    title: 'Munim Connector',
    description: 'Connect Munim for direct import data for return filing.',
  },
  {
    key: 'tally-connector',
    title: 'Tally Connector',
    description: 'Connect to Tally software and Import data for easy Return filing.',
    beta: true,
  },
  {
    key: 'json-file',
    title: 'JSON File',
    description: 'Import data prepared as JSON using Govt utility/Tally',
  },
  {
    key: 'copy-paste',
    title: 'Copy/Paste/Write',
    description: 'Directly copy paste or write your B2B/B2C invoices data.',
  },
  {
    key: 'munim-excel',
    title: 'Munim Excel Template',
    description: 'Fastest way to prepare & import data direct from Munim',
  },
  {
    key: 'ecommerce-template',
    title: 'E-Commerce Excel Template',
    description: 'Import data from your E-Commerce seller template',
    beta: true,
  },
];
const GSTR1_DOC_TYPE_COLUMNS: Record<Gstr1DocType, Gstr1DocColumn[]> = {
  B2B: [
    { key: 'gstin', label: 'GSTIN/UIN Of Recipient' },
    { key: 'receiverName', label: 'Receiver Name' },
    { key: 'invoiceNumber', label: 'Invoice Number' },
    { key: 'invoiceDate', label: 'Invoice Date' },
    { key: 'invoiceValue', label: 'Invoice Value' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'reverseCharge', label: 'Reverse Charge' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'invoiceType', label: 'Invoice Type' },
    { key: 'ecommerceGstin', label: 'E-Commerce GSTIN' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  B2CS: [
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
    { key: 'ecommerceGstin', label: 'E-Commerce GSTIN' },
  ],
  'B2C LARGE': [
    { key: 'invoiceNumber', label: 'Invoice Number' },
    { key: 'invoiceDate', label: 'Invoice Date' },
    { key: 'invoiceValue', label: 'Invoice Value' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
    { key: 'ecommerceGstin', label: 'E-Commerce GSTIN' },
  ],
  EXPORT: [
    { key: 'exportType', label: 'Export Type' },
    { key: 'invoiceNumber', label: 'Invoice Number' },
    { key: 'invoiceDate', label: 'Invoice Date' },
    { key: 'invoiceValue', label: 'Invoice Value' },
    { key: 'portCode', label: 'Port Code' },
    { key: 'shippingBillNumber', label: 'Shipping Bill Number' },
    { key: 'shippingBillDate', label: 'Shipping Bill Date' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  CDNR: [
    { key: 'gstin', label: 'GSTIN/UIN Of Recipient' },
    { key: 'receiverName', label: 'Receiver Name' },
    { key: 'noteNumber', label: 'Note Number' },
    { key: 'noteDate', label: 'Note Date' },
    { key: 'noteType', label: 'Note Type' },
    { key: 'invoiceValue', label: 'Note Value' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  CDNUR: [
    { key: 'noteNumber', label: 'Note Number' },
    { key: 'noteDate', label: 'Note Date' },
    { key: 'noteType', label: 'Note Type' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'invoiceValue', label: 'Note Value' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'Advanced Received': [
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'grossAdvanceReceived', label: 'Gross Advance Received' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  HSN: [
    { key: 'hsnCode', label: 'HSN Code' },
    { key: 'description', label: 'Description' },
    { key: 'uqc', label: 'UQC' },
    { key: 'totalQuantity', label: 'Total Quantity' },
    { key: 'totalValue', label: 'Total Value' },
    { key: 'taxableValue', label: 'Taxable Value' },
    { key: 'integratedTax', label: 'Integrated Tax Amount' },
    { key: 'centralTax', label: 'Central Tax Amount' },
    { key: 'stateTax', label: 'State Tax Amount' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  Docs: [
    { key: 'fromSerial', label: 'From Sr. No.' },
    { key: 'toSerial', label: 'To Sr. No.' },
    { key: 'totalNumber', label: 'Total Number' },
    { key: 'cancelledNumber', label: 'Cancelled' },
    { key: 'netIssued', label: 'Net Issued' },
  ],
};
const GSTR1_AMENDMENT_DOC_TYPE_COLUMNS: Record<Gstr1AmendmentDocType, Gstr1AmendmentColumn[]> = {
  'B2B Amendment': [
    { key: 'gstin', label: 'GSTIN/UIN Of Recipient' },
    { key: 'receiverName', label: 'Receiver Name' },
    { key: 'originalInvoiceNumber', label: 'Original Invoice Number' },
    { key: 'originalInvoiceDate', label: 'Original Invoice Date' },
    { key: 'revisedInvoiceNumber', label: 'Revised Invoice Number' },
    { key: 'revisedInvoiceDate', label: 'Revised Invoice Date' },
    { key: 'invoiceValue', label: 'Invoice Value' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'reverseCharge', label: 'Reverse Charge' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'invoiceType', label: 'Invoice Type' },
    { key: 'ecommerceGstin', label: 'E-Commerce GSTIN' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'B2C Large Amendment': [
    { key: 'originalInvoiceNumber', label: 'Original Invoice Number' },
    { key: 'originalInvoiceDate', label: 'Original Invoice Date' },
    { key: 'revisedInvoiceNumber', label: 'Revised Invoice Number' },
    { key: 'revisedInvoiceDate', label: 'Revised Invoice Date' },
    { key: 'invoiceValue', label: 'Invoice Value' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'ecommerceGstin', label: 'E-Commerce GSTIN' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'Credit / Debit Note (Registered) Amendment': [
    { key: 'gstin', label: 'GSTIN/UIN Of Recipient' },
    { key: 'receiverName', label: 'Receiver Name' },
    { key: 'originalInvoiceNumber', label: 'Original Note Number' },
    { key: 'originalInvoiceDate', label: 'Original Note Date' },
    { key: 'revisedInvoiceNumber', label: 'Revised Note Number' },
    { key: 'revisedInvoiceDate', label: 'Revised Note Date' },
    { key: 'noteType', label: 'Note Type' },
    { key: 'invoiceValue', label: 'Note Value' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'Credit / Debit Note (Unregistered) Amendment': [
    { key: 'originalInvoiceNumber', label: 'Original Note Number' },
    { key: 'originalInvoiceDate', label: 'Original Note Date' },
    { key: 'revisedInvoiceNumber', label: 'Revised Note Number' },
    { key: 'revisedInvoiceDate', label: 'Revised Note Date' },
    { key: 'noteType', label: 'Note Type' },
    { key: 'invoiceValue', label: 'Note Value' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'Export Amendment': [
    { key: 'exportType', label: 'Export Type' },
    { key: 'originalInvoiceNumber', label: 'Original Invoice Number' },
    { key: 'originalInvoiceDate', label: 'Original Invoice Date' },
    { key: 'revisedInvoiceNumber', label: 'Revised Invoice Number' },
    { key: 'revisedInvoiceDate', label: 'Revised Invoice Date' },
    { key: 'invoiceValue', label: 'Invoice Value' },
    { key: 'portCode', label: 'Port Code' },
    { key: 'shippingBillNumber', label: 'Shipping Bill Number' },
    { key: 'shippingBillDate', label: 'Shipping Bill Date' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'B2C Others Amendment': [
    { key: 'originalInvoiceNumber', label: 'Original Invoice Number' },
    { key: 'originalInvoiceDate', label: 'Original Invoice Date' },
    { key: 'revisedInvoiceNumber', label: 'Revised Invoice Number' },
    { key: 'revisedInvoiceDate', label: 'Revised Invoice Date' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'ecommerceGstin', label: 'E-Commerce GSTIN' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'Advances Received Amendment': [
    { key: 'originalInvoiceDate', label: 'Original Receipt Date' },
    { key: 'revisedInvoiceDate', label: 'Revised Receipt Date' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'grossAdvanceReceived', label: 'Gross Advance Received' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'Adjustment of Advances Amendment': [
    { key: 'originalInvoiceDate', label: 'Original Adjustment Date' },
    { key: 'revisedInvoiceDate', label: 'Revised Adjustment Date' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'applicableTaxRate', label: 'Applicable % of Tax Rate' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'grossAdvanceReceived', label: 'Adjusted Advance Amount' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'Supplies through E-Commerce Amendment': [
    { key: 'originalInvoiceNumber', label: 'Original Invoice Number' },
    { key: 'originalInvoiceDate', label: 'Original Invoice Date' },
    { key: 'revisedInvoiceNumber', label: 'Revised Invoice Number' },
    { key: 'revisedInvoiceDate', label: 'Revised Invoice Date' },
    { key: 'ecommerceGstin', label: 'E-Commerce GSTIN' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
  'Supplies U/s 9(5) Amendment': [
    { key: 'originalInvoiceNumber', label: 'Original Invoice Number' },
    { key: 'originalInvoiceDate', label: 'Original Invoice Date' },
    { key: 'revisedInvoiceNumber', label: 'Revised Invoice Number' },
    { key: 'revisedInvoiceDate', label: 'Revised Invoice Date' },
    { key: 'ecommerceGstin', label: 'E-Commerce GSTIN' },
    { key: 'placeOfSupply', label: 'Place Of Supply' },
    { key: 'rate', label: 'Rate (%)' },
    { key: 'taxableValue', label: 'Total Taxable Value' },
    { key: 'cessAmount', label: 'Cess Amount' },
  ],
};
const GSTR1_DOC_TYPE_SUMMARY_LABELS: Partial<Record<Gstr1DocType, { second: string; third?: string; fourth?: string }>> = {
  'Advanced Received': {
    second: 'Total Advanced Received',
    third: undefined,
    fourth: undefined,
  },
  HSN: {
    second: 'Total Value',
    third: 'Taxable Value',
    fourth: 'Tax Components',
  },
  Docs: {
    second: 'Total Number',
    third: 'Cancelled',
    fourth: 'Net Issued',
  },
};
const GSTR1_CHECK_COLUMNS: Gstr1CheckColumn[] = [
  { key: 'date', label: 'Date', filterPlaceholder: 'Filter by Date' },
  { key: 'invoiceNumber', label: 'Invoice Number', filterPlaceholder: 'Filter by Invoice Number' },
  { key: 'customer', label: 'Customer', filterPlaceholder: 'Filter by Customer' },
  { key: 'gstin', label: 'GSTIN', filterPlaceholder: 'Filter by GSTIN' },
  { key: 'taxableAmount', label: 'Taxable Amt (₹)', filterPlaceholder: 'Filter by Taxable Amt' },
  { key: 'totalTax', label: 'Total Tax (₹)', filterPlaceholder: 'Filter by Total Tax' },
  { key: 'rate', label: 'Rate (%)', filterPlaceholder: 'Filter by Rate (%)' },
  { key: 'totalAmount', label: 'Total Amt (₹)', filterPlaceholder: 'Filter by Total Amt' },
  { key: 'type', label: 'Type', filterPlaceholder: 'Filter by Type' },
  { key: 'status', label: 'Status', filterPlaceholder: 'Filter by Status' },
];
const INITIAL_GSTR1_CHECK_COLUMN_FILTERS: Record<Gstr1CheckColumnKey, string> = {
  date: '',
  invoiceNumber: '',
  customer: '',
  gstin: '',
  taxableAmount: '',
  totalTax: '',
  rate: '',
  totalAmount: '',
  type: '',
  status: '',
};
const INITIAL_GSTR1_VISIBLE_CHECK_COLUMNS: Record<Gstr1CheckColumnKey, boolean> = {
  date: true,
  invoiceNumber: true,
  customer: true,
  gstin: true,
  taxableAmount: true,
  totalTax: true,
  rate: true,
  totalAmount: true,
  type: true,
  status: true,
};
const GSTR1_FREQUENT_ROWS: Gstr1PrepareRow[] = [
  {
    code: 'B2B',
    title: 'B2B(4A, 4B, 6B, 6C)',
    documents: '13',
    taxableAmount: '7,61,650.00',
    igst: '38,082.50',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '38,082.50',
    invoiceValue: '7,99,732.50',
    editable: true,
    linkedIssueType: 'gstin',
  },
  {
    code: 'CDNR',
    title: 'Credit/Debit Notes (Registered) (9B)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
    linkedIssueType: 'credit-note-linkage',
  },
  {
    code: 'EXP',
    title: 'Export Invoices (6A)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    code: 'B2CS',
    title: 'B2C Others (7)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
];
const GSTR1_TOTAL_ROW: Gstr1PrepareRow = {
  code: 'TOTAL',
  title: 'Total',
  documents: '-',
  taxableAmount: '7,61,650.00',
  igst: '38,082.50',
  cgst: '0.00',
  sgst: '0.00',
  cess: '0.00',
  taxAmount: '38,082.50',
  invoiceValue: '7,99,732.50',
  editable: false,
};
const GSTR1_HSN_ROWS: Gstr1PrepareRow[] = [
  {
    code: 'HSN',
    title: 'HSN summary of outward supplies (12)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '-',
    editable: false,
  },
  {
    code: 'HSN-B2B',
    title: 'HSN B2B',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '-',
    editable: true,
  },
  {
    code: 'HSN-B2C',
    title: 'HSN B2C',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '-',
    editable: true,
  },
];
const GSTR1_OTHER_DETAIL_ROWS: Gstr1OtherDetailRow[] = [
  {
    title: 'Document Series Summary (13)',
    countOfDocuments: '13',
    cancelledDocs: '0',
    netIssuedDocs: '13',
    linkedIssueType: 'document-gap',
  },
];
const GSTR1_INVOICE_LEVEL_ROWS: Gstr1InvoiceSectionRow[] = [
  {
    title: 'B2B (4A, 4B, 6B, 6C)',
    documents: '13',
    taxableAmount: '7,61,650.00',
    igst: '38,082.50',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '38,082.50',
    invoiceValue: '7,99,732.50',
    editable: true,
    linkedIssueType: 'gstin',
  },
  {
    title: 'Credit/Debit Notes (Registered) (9B)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
    linkedIssueType: 'credit-note-linkage',
  },
  {
    title: 'Export Invoices (6A)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'B2C Others (7)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'HSN summary of outward supplies (12)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '-',
    editable: true,
  },
  {
    title: 'Supplies made through Eco - u/s 52',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'Supplies U/s 9(5)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
];
const GSTR1_AMENDMENT_ROWS: Gstr1InvoiceSectionRow[] = [
  {
    title: 'B2B Amendments (9A)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'B2C Large Amendments (9A)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'Credit/Debit Notes (Registered) Amendments (9C)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'Credit/Debit Notes (Unregistered) Amendments (9C)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'Export Invoices Amendments (9A)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'B2C Others Amendments (10)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'Advances Received (Tax Liability) Amendments (11(2))',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'Adjustment of Advances Amendments (11(2))',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'Supplies made through Eco Amendments - u/s 52',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
  {
    title: 'Amendments Supplies U/s 9(5)',
    documents: '0',
    taxableAmount: '0.00',
    igst: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    cess: '0.00',
    taxAmount: '0.00',
    invoiceValue: '0.00',
    editable: true,
  },
];
const GSTR1_CHECKED_INVOICE_ROWS: Record<Gstr1CheckTab, Gstr1CheckedInvoiceRow[]> = {
  Invoice: [
    { id: 'inv-117', date: '21-03-2026', invoiceNumber: '2025-26/117', customer: 'VIJAY TEX', gstin: '36AACCR2213F2ZU', taxableAmount: '35,600.00', totalTax: '1,780.00', rate: '5.00', totalAmount: '37,380.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-121', date: '28-03-2026', invoiceNumber: '2025-26/121', customer: 'VIJAY TEX', gstin: '36AACCR2213F2ZU', taxableAmount: '27,400.00', totalTax: '1,370.00', rate: '5.00', totalAmount: '28,770.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-120', date: '27-03-2026', invoiceNumber: '2025-26/120', customer: 'VINIT PRINT', gstin: '36AACCR2213F2ZU', taxableAmount: '24,375.00', totalTax: '1,218.75', rate: '5.00', totalAmount: '25,593.75', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-116', date: '20-03-2026', invoiceNumber: '2025-26/116', customer: 'VINIT PRINT', gstin: '36AACCR2213F2ZU', taxableAmount: '1,33,125.00', totalTax: '6,656.25', rate: '5.00', totalAmount: '1,39,781.25', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-118', date: '22-03-2026', invoiceNumber: '2025-26/118', customer: 'VAMAN FEB PVT LTD', gstin: '36AACCR2213F2ZU', taxableAmount: '24,550.00', totalTax: '1,227.50', rate: '5.00', totalAmount: '25,777.50', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-115', date: '19-03-2026', invoiceNumber: '2025-26/115', customer: 'TIRUPATI PRINT', gstin: '36AACCR2213F2ZU', taxableAmount: '81,000.00', totalTax: '4,050.00', rate: '5.00', totalAmount: '85,050.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-123', date: '28-03-2026', invoiceNumber: '2025-26/123', customer: 'TIRUPATI UDHOG', gstin: '36AACCR2213F2ZU', taxableAmount: '38,400.00', totalTax: '1,920.00', rate: '5.00', totalAmount: '40,320.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-122', date: '28-03-2026', invoiceNumber: '2025-26/122', customer: 'VINIT PRINT', gstin: '36AACCR2213F2ZU', taxableAmount: '33,000.00', totalTax: '1,650.00', rate: '5.00', totalAmount: '34,650.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-112', date: '15-03-2026', invoiceNumber: '2025-26/112', customer: 'VINIT PRINT', gstin: '36AACCR2213F2ZU', taxableAmount: '55,600.00', totalTax: '2,780.00', rate: '5.00', totalAmount: '58,380.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-119', date: '25-03-2026', invoiceNumber: '2025-26/119', customer: 'SHREE JAI GANESH PRINTS', gstin: '36AACCR2213F2ZU', taxableAmount: '1,23,200.00', totalTax: '6,160.00', rate: '5.00', totalAmount: '1,29,360.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-114', date: '18-03-2026', invoiceNumber: '2025-26/114', customer: 'SHREE JAI GANESH PRINTS', gstin: '36AACCR2213F2ZU', taxableAmount: '68,000.00', totalTax: '3,400.00', rate: '5.00', totalAmount: '71,400.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-113', date: '17-03-2026', invoiceNumber: '2025-26/113', customer: 'SHREE JAI GANESH PRINTS', gstin: '36AACCR2213F2ZU', taxableAmount: '89,600.00', totalTax: '4,480.00', rate: '5.00', totalAmount: '94,080.00', type: 'B2B', status: 'Pending for Upload.' },
    { id: 'inv-124', date: '28-03-2026', invoiceNumber: '2025-26/124', customer: 'SHREE JAI GANESH PRINTS', gstin: '36AACCR2213F2ZU', taxableAmount: '27,800.00', totalTax: '1,390.00', rate: '5.00', totalAmount: '29,190.00', type: 'B2B', status: 'Pending for Upload.' },
  ],
  'Credit / Debit Note': [
    { id: 'cdnr-1', date: '22-03-2026', invoiceNumber: 'CN/2025-26/009', customer: 'Kedar Wellness Pvt Ltd', gstin: '27AABCK2040P1ZX', taxableAmount: '0.00', totalTax: '0.00', rate: '5.00', totalAmount: '0.00', type: 'CDNR', status: 'Link original invoice before upload.' },
  ],
  B2CS: [
    { id: 'b2cs-1', date: '31-03-2026', invoiceNumber: 'B2CS-MAR', customer: 'Retail Summary', gstin: '-', taxableAmount: '0.00', totalTax: '0.00', rate: '5.00', totalAmount: '0.00', type: 'B2CS', status: 'Pending for Upload.' },
  ],
  'Advance Receipt': [
    { id: 'adv-1', date: '31-03-2026', invoiceNumber: 'ADV-MAR', customer: 'Advance Receipt Bucket', gstin: '-', taxableAmount: '0.00', totalTax: '0.00', rate: '18.00', totalAmount: '0.00', type: 'ADV', status: 'No records available.' },
  ],
  Export: [
    { id: 'exp-1', date: '31-03-2026', invoiceNumber: 'EXP-MAR', customer: 'Export Summary', gstin: '-', taxableAmount: '0.00', totalTax: '0.00', rate: '0.00', totalAmount: '0.00', type: 'EXP', status: 'No records available.' },
  ],
};
const INITIAL_GSTR1_ADD_ROWS: Gstr1DraftInvoiceRow[] = [
  {
    id: 'add-row-1',
    sourceCheckRowId: undefined,
    sourceCheckTab: undefined,
    gstin: '',
    receiverName: '',
    invoiceNumber: '',
    invoiceDate: '',
    invoiceValue: '',
    noteNumber: '',
    noteDate: '',
    noteType: '',
    exportType: '',
    placeOfSupply: '',
    portCode: '',
    shippingBillNumber: '',
    shippingBillDate: '',
    reverseCharge: '',
    applicableTaxRate: 'No',
    invoiceType: 'Regular',
    ecommerceGstin: '',
    rate: '',
    grossAdvanceReceived: '',
    hsnCode: '',
    description: '',
    uqc: '',
    totalQuantity: '',
    totalValue: '',
    integratedTax: '',
    centralTax: '',
    stateTax: '',
    fromSerial: '',
    toSerial: '',
    totalNumber: '',
    cancelledNumber: '',
    netIssued: '',
    taxableValue: '',
    cessAmount: '',
  },
];
const INITIAL_GSTR1_AMENDMENT_ROWS: Gstr1AmendmentDraftRow[] = Array.from({ length: 5 }, (_, index) => ({
  id: `amend-row-${index + 1}`,
  gstin: '',
  receiverName: '',
  originalInvoiceNumber: '',
  originalInvoiceDate: '',
  revisedInvoiceNumber: '',
  revisedInvoiceDate: '',
  invoiceValue: '',
  noteType: '',
  exportType: '',
  placeOfSupply: '',
  portCode: '',
  shippingBillNumber: '',
  shippingBillDate: '',
  reverseCharge: '',
  applicableTaxRate: 'No',
  invoiceType: '',
  ecommerceGstin: '',
  rate: '',
  grossAdvanceReceived: '',
  taxableValue: '',
  cessAmount: '',
}));

function createEmptyGstr1AmendmentRow(id: string): Gstr1AmendmentDraftRow {
  return {
    id,
    gstin: '',
    receiverName: '',
    originalInvoiceNumber: '',
    originalInvoiceDate: '',
    revisedInvoiceNumber: '',
    revisedInvoiceDate: '',
    invoiceValue: '',
    noteType: '',
    exportType: '',
    placeOfSupply: '',
    portCode: '',
    shippingBillNumber: '',
    shippingBillDate: '',
    reverseCharge: '',
    applicableTaxRate: 'No',
    invoiceType: '',
    ecommerceGstin: '',
    rate: '',
    grossAdvanceReceived: '',
    taxableValue: '',
    cessAmount: '',
  };
}

function createEmptyGstr1DraftRow(id: string): Gstr1DraftInvoiceRow {
  return {
    id,
    sourceCheckRowId: undefined,
    sourceCheckTab: undefined,
    gstin: '',
    receiverName: '',
    invoiceNumber: '',
    invoiceDate: '',
    invoiceValue: '',
    noteNumber: '',
    noteDate: '',
    noteType: '',
    exportType: '',
    placeOfSupply: '',
    portCode: '',
    shippingBillNumber: '',
    shippingBillDate: '',
    reverseCharge: '',
    applicableTaxRate: 'No',
    invoiceType: 'Regular',
    ecommerceGstin: '',
    rate: '',
    grossAdvanceReceived: '',
    hsnCode: '',
    description: '',
    uqc: '',
    totalQuantity: '',
    totalValue: '',
    integratedTax: '',
    centralTax: '',
    stateTax: '',
    fromSerial: '',
    toSerial: '',
    totalNumber: '',
    cancelledNumber: '',
    netIssued: '',
    taxableValue: '',
    cessAmount: '',
  };
}

function parseGstr1Amount(value: string) {
  return Number(String(value).replace(/,/g, '').trim()) || 0;
}

function mapCheckedInvoiceRowToDraft(row: Gstr1CheckedInvoiceRow, tab: Gstr1CheckTab, index: number): Gstr1DraftInvoiceRow {
  const taxableValue = parseGstr1Amount(row.taxableAmount);
  const totalAmount = parseGstr1Amount(row.totalAmount);

  return {
    ...createEmptyGstr1DraftRow(`edit-row-${row.id}-${index + 1}`),
    sourceCheckRowId: row.id,
    sourceCheckTab: tab,
    gstin: row.gstin === '-' ? '' : row.gstin,
    receiverName: row.customer === 'Retail Summary' || row.customer === 'Advance Receipt Bucket' || row.customer === 'Export Summary' ? '' : row.customer,
    invoiceNumber: row.invoiceNumber,
    invoiceDate: row.date,
    invoiceValue: totalAmount ? totalAmount.toFixed(2) : '',
    reverseCharge: 'N',
    applicableTaxRate: 'None',
    invoiceType: row.type === 'B2B' ? 'Regular B2B' : row.type,
    rate: row.rate,
    taxableValue: taxableValue ? taxableValue.toFixed(2) : '',
  };
}

function mapDraftInvoiceRowToChecked(row: Gstr1CheckedInvoiceRow, draft: Gstr1DraftInvoiceRow): Gstr1CheckedInvoiceRow {
  const taxableValue = parseGstr1Amount(draft.taxableValue);
  const cessAmount = parseGstr1Amount(draft.cessAmount);
  const taxRate = Number(draft.rate) || 0;
  const totalTax = taxableValue * (taxRate / 100) + cessAmount;
  const totalAmount = parseGstr1Amount(draft.invoiceValue) || taxableValue + totalTax;
  const invoiceType = draft.invoiceType.trim();

  return {
    ...row,
    date: draft.invoiceDate || row.date,
    invoiceNumber: draft.invoiceNumber || row.invoiceNumber,
    customer: draft.receiverName || row.customer,
    gstin: draft.gstin || row.gstin,
    taxableAmount: formatNumberAmount(taxableValue || parseGstr1Amount(row.taxableAmount)),
    totalTax: formatNumberAmount(totalTax || parseGstr1Amount(row.totalTax)),
    rate: draft.rate || row.rate,
    totalAmount: formatNumberAmount(totalAmount || parseGstr1Amount(row.totalAmount)),
    type: invoiceType ? invoiceType.replace(/^Regular\s+/i, '') : row.type,
  };
}

const GSTR3B_SCENARIO_LABELS: Record<Gstr3bScenario, string> = {
  'payment-required': 'Payment Required',
  'ready-to-file': 'Ready to File',
  filed: 'Filed',
};

const GSTR3B_SCENARIO_VIEWS: Record<Gstr3bScenario, Gstr3bScenarioView> = {
  'payment-required': {
    statusLabel: 'Payment Required',
    statusTone: 'bg-amber-50 text-amber-700',
    bannerTone: 'border-amber-200 bg-amber-50',
    bannerTitle: 'Cash ledger is short for this return period.',
    bannerDescription:
      'ITC covers a large part of the liability, but a challan payment is still needed before offset and filing can continue.',
    summaryCards: [
      { label: 'Output Tax', value: 'Rs 12.84L', note: 'Auto-prepared from outward supplies', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
      { label: 'Eligible ITC', value: 'Rs 8.42L', note: 'Available for utilization', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { label: 'Net Liability', value: 'Rs 4.42L', note: 'Payable after ITC set-off', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
      { label: 'Cash Ledger', value: 'Rs 1.86L', note: 'Portal balance currently available', tone: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      { label: 'Payment Gap', value: 'Rs 2.56L', note: 'Needs manual funding on portal', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
    ],
    steps: [
      { title: 'Prepare 3B from books', detail: 'Sales, purchases, and ITC are compiled into the return draft.', status: 'done', meta: 'Prepared automatically' },
      { title: 'Check ITC and cash ledger', detail: 'System checks portal balances before any filing action is attempted.', status: 'done', meta: 'Short by Rs 2.56L' },
      { title: 'Create challan and pay on portal', detail: 'User needs to fund the cash ledger because available balance is insufficient.', status: 'manual', meta: 'Manual payment needed' },
      { title: 'Offset liability', detail: 'Offset stays blocked until the portal cash ledger is refreshed.', status: 'waiting', meta: 'Waiting for payment' },
      { title: 'Authorize and file 3B', detail: 'Filing will proceed only after payment and offset complete successfully.', status: 'waiting', meta: 'OTP / EVC / DSC pending' },
    ],
    offsetRows: [
      { bucket: 'IGST', liability: 'Rs 2.14L', itcUsed: 'Rs 1.10L', cashUsed: 'Rs 1.04L', balance: 'Short by Rs 0.82L' },
      { bucket: 'CGST', liability: 'Rs 1.14L', itcUsed: 'Rs 0.74L', cashUsed: 'Rs 0.40L', balance: 'Short by Rs 0.98L' },
      { bucket: 'SGST', liability: 'Rs 1.14L', itcUsed: 'Rs 0.58L', cashUsed: 'Rs 0.56L', balance: 'Short by Rs 0.76L' },
    ],
    auditTrail: [
      { time: '05:42 PM', title: '3B draft prepared', detail: 'Liability and ITC were computed from synchronized books.', tone: 'bg-blue-500' },
      { time: '05:44 PM', title: 'Cash ledger checked', detail: 'Portal balance found insufficient for final offset.', tone: 'bg-amber-500' },
      { time: '05:45 PM', title: 'Manual funding required', detail: 'Create challan on portal, then refresh ledger.', tone: 'bg-rose-500' },
    ],
  },
  'ready-to-file': {
    statusLabel: 'Ready to File',
    statusTone: 'bg-cyan-50 text-cyan-700',
    bannerTone: 'border-cyan-200 bg-cyan-50',
    bannerTitle: 'Cash ledger is now sufficient for offset.',
    bannerDescription:
      'Portal funding has been completed or buffer balance was already available. The return can proceed to offset and filing.',
    summaryCards: [
      { label: 'Output Tax', value: 'Rs 12.84L', note: 'Auto-prepared from outward supplies', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
      { label: 'Eligible ITC', value: 'Rs 8.42L', note: 'Locked for this filing run', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { label: 'Net Liability', value: 'Rs 4.42L', note: 'Ready for final offset', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
      { label: 'Cash Ledger', value: 'Rs 4.90L', note: 'Updated from portal after payment', tone: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      { label: 'Payment Gap', value: 'Rs 0.00', note: 'No further funding required', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ],
    steps: [
      { title: 'Prepare 3B from books', detail: 'Sales, purchases, and ITC are compiled into the return draft.', status: 'done', meta: 'Prepared automatically' },
      { title: 'Check ITC and cash ledger', detail: 'Ledger refresh confirms enough balance to finish the filing.', status: 'done', meta: 'Portal ledger refreshed' },
      { title: 'Funding branch cleared', detail: 'Challan payment or existing buffer balance has removed the shortfall.', status: 'done', meta: 'Gap resolved' },
      { title: 'Offset liability', detail: 'Ready to consume ITC and cash ledger in the correct utilization order.', status: 'current', meta: 'One click remaining' },
      { title: 'Authorize and file 3B', detail: 'Final filing is queued once offset completes.', status: 'waiting', meta: 'Awaiting authorization' },
    ],
    offsetRows: [
      { bucket: 'IGST', liability: 'Rs 2.14L', itcUsed: 'Rs 1.10L', cashUsed: 'Rs 1.04L', balance: 'Ready' },
      { bucket: 'CGST', liability: 'Rs 1.14L', itcUsed: 'Rs 0.74L', cashUsed: 'Rs 0.40L', balance: 'Ready' },
      { bucket: 'SGST', liability: 'Rs 1.14L', itcUsed: 'Rs 0.58L', cashUsed: 'Rs 0.56L', balance: 'Ready' },
    ],
    auditTrail: [
      { time: '05:42 PM', title: '3B draft prepared', detail: 'Liability and ITC were computed from synchronized books.', tone: 'bg-blue-500' },
      { time: '05:44 PM', title: 'Ledger refresh complete', detail: 'Cash ledger reflects updated funding from portal.', tone: 'bg-cyan-500' },
      { time: '05:46 PM', title: 'Offset unlocked', detail: 'Return is now ready for one-click filing.', tone: 'bg-emerald-500' },
    ],
  },
  filed: {
    statusLabel: 'Filed',
    statusTone: 'bg-emerald-50 text-emerald-700',
    bannerTone: 'border-emerald-200 bg-emerald-50',
    bannerTitle: 'GSTR-3B has been filed successfully.',
    bannerDescription:
      'Liability was offset using ITC and cash ledger, then the return was filed after authorization. Filing acknowledgement is now available.',
    summaryCards: [
      { label: 'Output Tax', value: 'Rs 12.84L', note: 'Frozen in filing acknowledgement', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
      { label: 'Eligible ITC', value: 'Rs 8.42L', note: 'Consumed in final offset', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { label: 'Net Liability', value: 'Rs 4.42L', note: 'Offset complete', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
      { label: 'Cash Ledger', value: 'Rs 0.48L', note: 'Balance remaining after filing', tone: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      { label: 'Filing ARN', value: 'AA0705233B2401', note: 'Generated after authorization', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ],
    steps: [
      { title: 'Prepare 3B from books', detail: 'Sales, purchases, and ITC are compiled into the return draft.', status: 'done', meta: 'Prepared automatically' },
      { title: 'Check ITC and cash ledger', detail: 'Ledger sufficiency was confirmed before final submission.', status: 'done', meta: 'Verified' },
      { title: 'Offset liability', detail: 'ITC and cash ledger were applied in the final computation.', status: 'done', meta: 'Offset successful' },
      { title: 'Authorize return', detail: 'EVC / OTP validation completed successfully.', status: 'done', meta: 'Authorized' },
      { title: 'File GSTR-3B', detail: 'Return is filed and acknowledgement is stored for audit.', status: 'done', meta: 'Filed at 06:14 PM' },
    ],
    offsetRows: [
      { bucket: 'IGST', liability: 'Rs 2.14L', itcUsed: 'Rs 1.10L', cashUsed: 'Rs 1.04L', balance: 'Settled' },
      { bucket: 'CGST', liability: 'Rs 1.14L', itcUsed: 'Rs 0.74L', cashUsed: 'Rs 0.40L', balance: 'Settled' },
      { bucket: 'SGST', liability: 'Rs 1.14L', itcUsed: 'Rs 0.58L', cashUsed: 'Rs 0.56L', balance: 'Settled' },
    ],
    auditTrail: [
      { time: '05:42 PM', title: '3B draft prepared', detail: 'Liability and ITC were computed from synchronized books.', tone: 'bg-blue-500' },
      { time: '05:49 PM', title: 'Offset completed', detail: 'Tax liability settled through ITC and cash ledger.', tone: 'bg-cyan-500' },
      { time: '06:14 PM', title: 'Filed via EVC', detail: 'ARN AA0705233B2401 generated and stored in audit log.', tone: 'bg-emerald-500' },
    ],
  },
};

const GSTR3B_PERIOD_OPTIONS = ['Mar 2026 (Monthly)', 'Feb 2026 (Monthly)', 'Jan 2026 (Monthly)'];
const GSTR3B_STEP_ITEMS: { view: Gstr3bView; label: string; step: string }[] = [
  { view: 'summary-data', label: 'Summary Data', step: '1' },
  { view: 'prepare-file', label: 'Prepare & File', step: '2' },
  { view: 'push-to-gstn', label: 'Push to GSTN', step: '3' },
  { view: 'file-gstr-3b', label: 'File GSTR-3B', step: '4' },
];
const GSTR3B_SUMMARY_SECTIONS: Gstr3bSummarySection[] = [
  {
    id: '3.1',
    title: '3.1 Tax on outward and reverse charge inward supplies',
    metrics: [
      { label: 'IGST', value: '4,18,220.00' },
      { label: 'CGST', value: '2,06,118.00' },
      { label: 'SGST', value: '2,06,118.00' },
      { label: 'CESS', value: '0.00' },
    ],
  },
  {
    id: '3.1.1',
    title: '3.1.1 Supplies notified under section 9(5) of the CGST Act, 2017',
    metrics: [
      { label: 'IGST', value: '0.00' },
      { label: 'CGST', value: '0.00' },
      { label: 'SGST', value: '0.00' },
      { label: 'CESS', value: '0.00' },
    ],
  },
  {
    id: '3.2',
    title: '3.2 Inter-state supplies',
    metrics: [
      { label: 'Taxable Value', value: '12,48,750.00' },
      { label: 'Integrated Tax', value: '2,24,775.00' },
    ],
  },
  {
    id: '4',
    title: '4 Eligible ITC',
    metrics: [
      { label: 'IGST', value: '3,08,420.00' },
      { label: 'CGST', value: '1,86,220.00' },
      { label: 'SGST', value: '1,86,220.00' },
      { label: 'CESS', value: '0.00' },
    ],
  },
  {
    id: '5',
    title: '5 Exempt, nil and Non GST inward supplies',
    metrics: [
      { label: 'Inter-state supplies', value: '84,500.00' },
      { label: 'Intra-state supplies', value: '1,12,400.00' },
    ],
  },
  {
    id: '5.1',
    title: '5.1 Interest and Late fee for previous tax period',
    metrics: [
      { label: 'IGST', value: '0.00' },
      { label: 'CGST', value: '0.00' },
      { label: 'SGST', value: '0.00' },
      { label: 'CESS', value: '0.00' },
    ],
  },
  {
    id: '6.1',
    title: '6.1 Payment of Tax',
    metrics: [
      { label: 'Balance Liability', value: '3,49,596.00' },
      { label: 'Paid through Cash', value: '1,58,940.00' },
      { label: 'Paid through Credit', value: '1,90,656.00' },
    ],
  },
];
const GSTR3B_PREPARE_SECTIONS: Record<Gstr3bSectionId, Gstr3bPrepareSection> = {
  '3.1': {
    id: '3.1',
    title: '3.1 Tax on outward and reverse charge inward supplies',
    description: 'Review outward supply buckets before final offset and filing.',
    columns: [
      { key: 'nature', label: 'Nature of Supplies' },
      { key: 'taxable', label: 'Taxable Value', align: 'right' },
      { key: 'igst', label: 'IGST', align: 'right' },
      { key: 'cgst', label: 'CGST', align: 'right' },
      { key: 'sgst', label: 'SGST', align: 'right' },
      { key: 'cess', label: 'CESS', align: 'right' },
    ],
    rows: [
      { nature: 'Outward taxable supplies (other than zero rated, nil rated and exempted)', taxable: '23,24,500.00', igst: '2,18,220.00', cgst: '1,06,118.00', sgst: '1,06,118.00', cess: '0.00' },
      { nature: 'Outward taxable supplies (zero rated)', taxable: '8,76,200.00', igst: '1,42,000.00', cgst: '0.00', sgst: '0.00', cess: '0.00' },
      { nature: 'Other outward supplies (nil rated, exempted)', taxable: '1,96,900.00', igst: '0.00', cgst: '0.00', sgst: '0.00', cess: '0.00' },
      { nature: 'Inward supplies liable to reverse charge', taxable: '2,14,000.00', igst: '58,000.00', cgst: '1,00,000.00', sgst: '1,00,000.00', cess: '0.00' },
    ],
  },
  '3.1.1': {
    id: '3.1.1',
    title: '3.1.1 Supplies notified under section 9(5) of the CGST Act, 2017',
    description: 'These values stay editable separately from the main outward summary.',
    columns: [
      { key: 'nature', label: 'Nature of Supplies' },
      { key: 'taxable', label: 'Taxable Value', align: 'right' },
      { key: 'igst', label: 'IGST', align: 'right' },
      { key: 'cgst', label: 'CGST', align: 'right' },
      { key: 'sgst', label: 'SGST', align: 'right' },
      { key: 'cess', label: 'CESS', align: 'right' },
    ],
    rows: [
      { nature: 'Electronic commerce operator liable under section 9(5)', taxable: '0.00', igst: '0.00', cgst: '0.00', sgst: '0.00', cess: '0.00' },
      { nature: 'Supplies made through ECO under section 9(5)', taxable: '0.00', igst: '0.00', cgst: '0.00', sgst: '0.00', cess: '0.00' },
    ],
  },
  '3.2': {
    id: '3.2',
    title: '3.2 Inter-state supplies',
    description: 'This is the consumer and unregistered outward interstate break-up that feeds the return summary.',
    columns: [
      { key: 'recipient', label: 'Recipient Type' },
      { key: 'taxable', label: 'Taxable Value', align: 'right' },
      { key: 'igst', label: 'Integrated Tax', align: 'right' },
    ],
    rows: [
      { recipient: 'Unregistered Persons', taxable: '9,82,500.00', igst: '1,76,850.00' },
      { recipient: 'Composition Taxable Persons', taxable: '1,62,800.00', igst: '29,304.00' },
      { recipient: 'UIN Holders', taxable: '1,03,450.00', igst: '18,621.00' },
    ],
  },
  '4': {
    id: '4',
    title: '4 Eligible ITC',
    description: 'Input tax credit stays editable here before it moves to set-off.',
    columns: [
      { key: 'itc', label: 'ITC Bucket' },
      { key: 'igst', label: 'IGST', align: 'right' },
      { key: 'cgst', label: 'CGST', align: 'right' },
      { key: 'sgst', label: 'SGST', align: 'right' },
      { key: 'cess', label: 'CESS', align: 'right' },
    ],
    rows: [
      { itc: 'ITC Available', igst: '3,08,420.00', cgst: '1,96,220.00', sgst: '1,96,220.00', cess: '0.00' },
      { itc: 'ITC Reversed', igst: '18,220.00', cgst: '10,000.00', sgst: '10,000.00', cess: '0.00' },
      { itc: 'Net ITC Available', igst: '2,90,200.00', cgst: '1,86,220.00', sgst: '1,86,220.00', cess: '0.00' },
      { itc: 'Ineligible ITC', igst: '12,800.00', cgst: '6,200.00', sgst: '6,200.00', cess: '0.00' },
    ],
  },
  '5': {
    id: '5',
    title: '5 Exempt, nil and Non GST inward supplies',
    description: 'Exempt inward supplies are tracked separately for disclosure.',
    columns: [
      { key: 'bucket', label: 'Supply Type' },
      { key: 'interState', label: 'Inter-state supplies', align: 'right' },
      { key: 'intraState', label: 'Intra-state supplies', align: 'right' },
    ],
    rows: [
      { bucket: 'From a supplier under composition scheme', interState: '24,500.00', intraState: '48,200.00' },
      { bucket: 'Non GST supply', interState: '32,000.00', intraState: '42,700.00' },
      { bucket: 'Exempt / Nil rated supply', interState: '28,000.00', intraState: '21,500.00' },
    ],
  },
  '5.1': {
    id: '5.1',
    title: '5.1 Interest and Late fee for previous tax period',
    description: 'This section remains editable only if prior period dues need to be carried forward.',
    columns: [
      { key: 'charge', label: 'Charge Type' },
      { key: 'igst', label: 'IGST', align: 'right' },
      { key: 'cgst', label: 'CGST', align: 'right' },
      { key: 'sgst', label: 'SGST', align: 'right' },
      { key: 'cess', label: 'CESS', align: 'right' },
    ],
    rows: [
      { charge: 'Interest', igst: '0.00', cgst: '0.00', sgst: '0.00', cess: '0.00' },
      { charge: 'Late Fee', igst: '0.00', cgst: '0.00', sgst: '0.00', cess: '0.00' },
    ],
  },
  '6.1': {
    id: '6.1',
    title: '6.1 Payment of Tax',
    description: 'This is the critical offset section that decides whether challan funding is required before filing.',
    columns: [
      { key: 'taxHead', label: 'Tax Head' },
      { key: 'taxPayable', label: 'Tax Payable', align: 'right' },
      { key: 'paidThroughItc', label: 'Paid Through ITC', align: 'right' },
      { key: 'paidThroughCash', label: 'Paid Through Cash', align: 'right' },
    ],
    rows: [
      { taxHead: 'Integrated Tax', taxPayable: '4,18,220.00', paidThroughItc: '2,90,200.00', paidThroughCash: '1,28,020.00' },
      { taxHead: 'Central Tax', taxPayable: '2,06,118.00', paidThroughItc: '1,86,220.00', paidThroughCash: '19,898.00' },
      { taxHead: 'State / UT Tax', taxPayable: '2,06,118.00', paidThroughItc: '1,86,220.00', paidThroughCash: '19,898.00' },
      { taxHead: 'CESS', taxPayable: '0.00', paidThroughItc: '0.00', paidThroughCash: '0.00' },
    ],
    note: 'Munim keeps this section front-and-center because the cash-ledger shortfall decides whether filing can continue or must branch into challan payment.',
  },
};
const GSTR3B_PUSH_DOCUMENT_ROWS: Gstr1PushTableRow[] = [
  { title: '3.1 Tax on outward and reverse charge inward supplies', toBeUploaded: '6', uploaded: '0' },
  { title: '3.1.1 Supplies notified under section 9(5) of the CGST Act, 2017', toBeUploaded: '2', uploaded: '0' },
  { title: '3.2 Inter-state supplies', toBeUploaded: '3', uploaded: '0' },
  { title: '4 Eligible ITC', toBeUploaded: '4', uploaded: '0' },
  { title: '5 Exempt, nil and Non GST inward supplies', toBeUploaded: '3', uploaded: '0' },
  { title: '5.1 Interest and Late fee for previous tax period', toBeUploaded: '2', uploaded: '0' },
  { title: '6.1 Payment of Tax', toBeUploaded: '4', uploaded: '0' },
];
const GSTR3B_PUSH_SUMMARY_ROWS: Gstr1PushTableRow[] = [
  { title: 'Output Tax Liability', toBeUploaded: '8,30,456.00', uploaded: '0.00' },
  { title: 'Eligible ITC', toBeUploaded: '6,62,640.00', uploaded: '0.00' },
  { title: 'Net Cash Liability', toBeUploaded: '1,67,816.00', uploaded: '0.00' },
  { title: 'Interest and Late Fee', toBeUploaded: '0.00', uploaded: '0.00' },
];
const GSTR3B_FILE_SUMMARY = [
  { label: 'Output Tax', value: 'Rs 8.30L', note: 'Prepared from books and latest adjustments' },
  { label: 'ITC Utilized', value: 'Rs 6.62L', note: 'Locked at offset stage' },
  { label: 'Cash Paid', value: 'Rs 1.68L', note: 'To be settled through ledger / challan' },
  { label: 'Return Status', value: 'Ready to authorize', note: 'Move forward after GSTN upload succeeds' },
];

const INITIAL_GSTR1_PERIODS: PeriodRecord[] = [
  {
    id: 'may-2023',
    month: 'May 2023',
    lastSyncDate: '28-02-2024',
    totalInvoice: 297,
    reconciled: 'Pending',
    status: 'Filed',
    locked: false,
  },
  {
    id: 'apr-2023',
    month: 'Apr 2023',
    lastSyncDate: '28-02-2024',
    totalInvoice: 208,
    reconciled: 'Pending',
    status: 'Filed',
    locked: false,
  },
];

function makeReferenceNumber(prefix: string, number: number) {
  return `${prefix}/${String(number).padStart(4, '0')}`;
}

function makeDay(index: number) {
  const day = ((index % 28) + 1).toString().padStart(2, '0');
  return `${day}-05-2023`;
}

function makeParty(index: number) {
  const parties = [
    'SHRENIK N. BAMB & ASSOC',
    'RAMAKRISHNA ELECTRONI',
    'KISHAN AGRO BUSINESS C',
    'DOQFY INTERNET PRIVATE',
    'LNG & CO',
    'VERTEX TRENDZ',
    'S M D L AND ASSOCIATES',
    'R J D & CO',
    'DEEPCHAND JADAVCHAND',
    'VAPN & ASSOCIATES',
    'S S RICE PRODUCT',
    'Sapna',
    'TGS FOODZ PRIVATE LIMITE',
    'HINDTECH RESOURCES PRI',
    'MAHENDRA MANILAL SHAH',
    'NISHABEN HITKUMAR S',
  ];

  return parties[index % parties.length];
}

function makeTallyParty(index: number) {
  const parties = [
    'Shrenik N Bamb And Assoca',
    'Ramakrishna electronics & el',
    'Kishan Agro Business Centr',
    'Doqfy Internet Pvt Ltd',
    'LNG And Co',
    'Vertex Trendz',
    'SMDL & Associates',
    'RJD & CO',
    'Deepchand Jadavchand Jain',
    'VAPN & Associates',
    'S3 Solutions Pvt Ltd',
    'Aaradhya Consultant',
    'TGS Foodz Pvt Ltd',
    'HindTech Resources Private',
    'Paras R Shah & Co.',
    'Sneh Accounting',
  ];

  return parties[index % parties.length];
}

function makeGstin(index: number) {
  const letters = ['AAA', 'AAC', 'AAE', 'AAF', 'AAG', 'AAH', 'AAJ', 'AAK', 'AAL', 'AAM'];
  return `27${letters[index % letters.length]}P${(index % 9) + 1}Z${index % 7}`;
}

function createTransactionRecords() {
  const records: TransactionRecord[] = [];
  let sequence = 1;

  const pushRecord = (record: Omit<TransactionRecord, 'id'>) => {
    records.push({
      id: `tx-${sequence}`,
      ...record,
    });
    sequence += 1;
  };

  for (let index = 0; index < 2; index += 1) {
    pushRecord({
      status: 'Not In Tally',
      move: index === 0 ? 'Forwarded' : 'Select To Move',
      gstInvoiceNo: makeReferenceNumber('SF/2324/May', 264 + index),
      tallyInvoiceNo: '-',
      gstInvoiceDate: '29-05-2023',
      tallyInvoiceDate: '-',
      gstPartyName: 'SHUBHAM SANJAY DHAKA',
      tallyPartyName: '-',
      gstNo: `27FWSH${index + 1}Z8`,
      tallyNo: '-',
    });
  }

  for (let index = 0; index < 4; index += 1) {
    pushRecord({
      status: 'Not In Portal',
      move: 'Select To Move',
      gstInvoiceNo: '-',
      tallyInvoiceNo: makeReferenceNumber('SF/2324/May', 43 + index * 16),
      gstInvoiceDate: '-',
      tallyInvoiceDate: makeDay(index + 3),
      gstPartyName: '-',
      tallyPartyName: makeParty(index),
      gstNo: '-',
      tallyNo: makeGstin(index),
    });
  }

  for (let index = 0; index < 63; index += 1) {
    const invoice = makeReferenceNumber('SF/2324/May', index + 1);
    const party = makeParty(index + 7);
    const date = makeDay(index);
    const gstin = makeGstin(index + 4);

    pushRecord({
      status: 'Matched',
      move: 'Select To Move',
      gstInvoiceNo: invoice,
      tallyInvoiceNo: invoice,
      gstInvoiceDate: date,
      tallyInvoiceDate: date,
      gstPartyName: party,
      tallyPartyName: party,
      gstNo: gstin,
      tallyNo: gstin,
    });
  }

  for (let index = 0; index < 82; index += 1) {
    const invoice = makeReferenceNumber('SF/2324/May', index + 5);
    const mismatchedInvoice = makeReferenceNumber('SF/2324/May', index + 5 + (index % 3 === 0 ? 58 : 0));
    const date = makeDay(index);
    const mismatchedDate = makeDay(index + (index % 4 === 0 ? 7 : 0));
    const party = makeParty(index);
    const tallyParty = makeTallyParty(index);
    const gstNo = makeGstin(index + 3);
    const tallyNo = index % 5 === 0 ? makeGstin(index + 17) : gstNo;

    pushRecord({
      status: 'Partially-Matched',
      move: 'Select To Move',
      gstInvoiceNo: invoice,
      tallyInvoiceNo: mismatchedInvoice,
      gstInvoiceDate: date,
      tallyInvoiceDate: mismatchedDate,
      gstPartyName: party,
      tallyPartyName: tallyParty,
      gstNo,
      tallyNo,
      highlightInvoice: invoice !== mismatchedInvoice,
      highlightDate: date !== mismatchedDate,
      highlightParty: party !== tallyParty,
      highlightNo: gstNo !== tallyNo,
    });
  }

  for (let index = 0; index < 146; index += 1) {
    pushRecord({
      status: 'B2C Invoice',
      move: 'Select To Move',
      gstInvoiceNo: '-',
      tallyInvoiceNo: makeReferenceNumber('B2C/2324/May', index + 1),
      gstInvoiceDate: '-',
      tallyInvoiceDate: makeDay(index),
      gstPartyName: 'Walk-in Customer',
      tallyPartyName: `Counter Sale ${String(index + 1).padStart(3, '0')}`,
      gstNo: '-',
      tallyNo: '-',
    });
  }

  return records;
}

function getStatusTone(status: TransactionStatus) {
  if (status === 'Matched') {
    return 'bg-emerald-50 text-emerald-600';
  }

  if (status === 'Partially-Matched') {
    return 'bg-amber-50 text-amber-600';
  }

  if (status === 'B2C Invoice') {
    return 'bg-orange-50 text-orange-500';
  }

  if (status === 'Ignore') {
    return 'bg-amber-50 text-amber-700';
  }

  return 'bg-rose-50 text-rose-500';
}

function canEditTransactionStatus(status: TransactionStatus) {
  return status === 'Not In Tally' || status === 'Not In Portal' || status === 'Partially-Matched';
}

function canMoveTransaction(status: TransactionStatus) {
  return status === 'Not In Tally' || status === 'Not In Portal';
}

function getTransactionStatusOptions(status: TransactionStatus) {
  if (status === 'Not In Tally' || status === 'Not In Portal') {
    return [
      { value: status, label: status },
      { value: 'Ignore' as TransactionStatus, label: 'Ignore' },
    ];
  }

  if (status === 'Partially-Matched') {
    return [
      { value: status, label: status },
      { value: 'Ignore' as TransactionStatus, label: 'Ignore' },
      { value: 'Matched' as TransactionStatus, label: 'Manual Matched' },
    ];
  }

  return [{ value: status, label: status }];
}

function getPeriodStatusTone(status: PeriodState) {
  if (status === 'Filed') {
    return 'bg-emerald-50 text-emerald-600';
  }

  if (status === 'Complete') {
    return 'bg-cyan-50 text-cyan-700';
  }

  return 'bg-blue-50 text-blue-600';
}

function getGstr1SectionTone(status: Gstr1PreviewSection['status']) {
  return status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700';
}

function getGstr1ValidationTone(tone: Gstr1ValidationItem['tone']) {
  if (tone === 'amber') {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }

  if (tone === 'blue') {
    return 'border-blue-200 bg-blue-50 text-blue-800';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-800';
}

function getGstr1CorrectionStatusTone(status: Gstr1CorrectionStatus) {
  return status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
}

function formatGstr1Timestamp() {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date())
    .replace(',', '');
}

function buildGstr1LookupPreview(
  customerName: string,
  gstin: string,
  registrationType: string,
  placeOfSupply: string,
  pan: string,
): Gstr1LookupPreview {
  const suffix = gstin.slice(-3).toUpperCase() || 'GST';

  return {
    tradeName: customerName || `GST Trade ${suffix}`,
    businessName: customerName ? `${customerName} Business` : `GST Business ${suffix}`,
    registrationType: registrationType || 'Regular',
    state: placeOfSupply || 'Maharashtra',
    pan: pan || gstin.slice(2, 12).toUpperCase(),
  };
}

function createGstr1CorrectionEditorState(
  record: Gstr1CorrectionRecord,
  customerMaster?: Gstr1CustomerMasterRecord,
): Gstr1CorrectionEditorState {
  return {
    customerName: record.partyName,
    gstin: record.currentGstin || customerMaster?.gstin || '',
    registrationType: record.registrationType || customerMaster?.registrationType || 'Regular',
    placeOfSupply: record.placeOfSupply || customerMaster?.placeOfSupply || 'Maharashtra',
    pan: record.pan || customerMaster?.pan || '',
    notes: record.notes || '',
    originalInvoiceRef: record.originalInvoiceRef || '',
    expectedInvoiceRef: record.expectedInvoiceRef || '',
    resolutionAction: record.resolutionAction || 'mark-cancelled',
    missingDocumentNo: record.missingNumber || '',
    resolutionReason: record.detectedReason || '',
    lookupPreview:
      record.issueType === 'gstin' && (record.currentGstin || customerMaster?.gstin)
        ? buildGstr1LookupPreview(
            record.partyName,
            record.currentGstin || customerMaster?.gstin || '',
            record.registrationType || customerMaster?.registrationType || 'Regular',
            record.placeOfSupply || customerMaster?.placeOfSupply || 'Maharashtra',
            record.pan || customerMaster?.pan || '',
          )
        : null,
  };
}

function getNextOpenGstr1Correction(
  records: Gstr1CorrectionRecord[],
  currentIssueType: Gstr1CorrectionIssueType,
): Gstr1CorrectionRecord | null {
  const currentIndex = GSTR1_ISSUE_ORDER.indexOf(currentIssueType);
  const orderedIssueTypes = [...GSTR1_ISSUE_ORDER.slice(currentIndex), ...GSTR1_ISSUE_ORDER.slice(0, currentIndex)];

  for (const issueType of orderedIssueTypes) {
    const nextRecord = records.find((record) => record.issueType === issueType && record.status === 'open');

    if (nextRecord) {
      return nextRecord;
    }
  }

  return null;
}

function makeGstr1Arn(period: PeriodRecord, index: number) {
  const compact = period.month.replace(/\s+/g, '').toUpperCase();
  return `AA07GSTR1${compact}${String(index + 1).padStart(2, '0')}`;
}

function getReconciledTone(state: PeriodReconciledState) {
  if (state === 'Reconciled') {
    return 'bg-emerald-50 text-emerald-600';
  }

  return 'bg-amber-50 text-amber-600';
}

function getReconciliationTone(state: ReconciliationState) {
  if (state === 'Processing') {
    return 'bg-blue-50 text-blue-600';
  }

  return 'bg-amber-50 text-amber-600';
}

function getGstr2bIssueTone(issue: Gstr2bIssue) {
  if (issue === 'Missing In Tally') {
    return 'bg-rose-50 text-rose-600';
  }

  if (issue === 'Amount Mismatch') {
    return 'bg-amber-50 text-amber-600';
  }

  return 'bg-sky-50 text-sky-700';
}

function getGstr3bStepTone(status: Gstr3bStepState) {
  if (status === 'done') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (status === 'current') {
    return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  }

  if (status === 'manual') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-slate-50 text-slate-500 border-slate-200';
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function getMonthValueParts(value: string) {
  if (!value) {
    return { year: 2024, monthIndex: 0 };
  }

  const [month, year] = value.split(' ');
  return {
    year: Number(year),
    monthIndex: Math.max(MONTH_PICKER_MONTHS.indexOf(month), 0),
  };
}

function MonthPickerField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const { year: selectedYear, monthIndex: selectedMonthIndex } = getMonthValueParts(value);
  const [open, setOpen] = useState(false);
  const [visibleYear, setVisibleYear] = useState(selectedYear || 2024);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-700 shadow-sm outline-none transition-colors hover:border-blue-300"
      >
        <span className={value ? 'text-slate-700' : 'text-slate-400'}>{value || placeholder}</span>
        <CalendarDays size={16} className="text-slate-400" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[340px] rounded-xl border border-slate-200 bg-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() => setVisibleYear((current) => current - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-base font-semibold text-slate-700">{visibleYear}</span>
            <button
              type="button"
              onClick={() => setVisibleYear((current) => current + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4">
            {MONTH_PICKER_MONTHS.map((month, index) => {
              const isSelected = visibleYear === selectedYear && index === selectedMonthIndex;

              return (
                <button
                  key={`${visibleYear}-${month}`}
                  type="button"
                  onClick={() => {
                    onChange(`${month} ${visibleYear}`);
                    setOpen(false);
                  }}
                  className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
      <div className="w-full max-w-[720px] overflow-visible rounded-xl border border-slate-200 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.55)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-[18px] font-semibold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function GSTSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const routeState = useMemo(
    () => parseGstRoute(pathname, new URLSearchParams(searchParamsString)),
    [pathname, searchParamsString],
  );

  const [activeTab, setActiveTab] = useState<GstTab>(routeState.activeTab);
  const [selectedYear, setSelectedYear] = useState('2023-24');
  const [gstr1DraftPeriod, setGstr1DraftPeriod] = useState('Mar 2026 (Monthly)');
  const [gstr1Year, setGstr1Year] = useState('2025-26');
  const [gstr1SelectedPeriod, setGstr1SelectedPeriod] = useState('Mar 2026 (Monthly)');
  const [gstr1View, setGstr1View] = useState<Gstr1View>(routeState.gstr1View);
  const [gstr3bView, setGstr3bView] = useState<Gstr3bView>(routeState.gstr3bView);
  const [gstr3bSectionId, setGstr3bSectionId] = useState<Gstr3bSectionId>(routeState.gstr3bSectionId);
  const [gstr3bYear, setGstr3bYear] = useState('2025-26');
  const [gstr3bSelectedPeriod, setGstr3bSelectedPeriod] = useState('Mar 2026 (Monthly)');
  const [gstr3bPushMode, setGstr3bPushMode] = useState<Gstr1PushMode>('without-otp');
  const [gstr3bPortalUserName, setGstr3bPortalUserName] = useState('clearjuned');
  const [gstr3bPortalPassword, setGstr3bPortalPassword] = useState('••••••••');
  const [gstr3bPortalFetched, setGstr3bPortalFetched] = useState(false);
  const [gstr3bDraftSaved, setGstr3bDraftSaved] = useState(false);
  const [gstr3bChallanReady, setGstr3bChallanReady] = useState(false);
  const [gstr3bUploadStarted, setGstr3bUploadStarted] = useState(false);
  const [gstr3bFiled, setGstr3bFiled] = useState(false);
  const [gstr1CheckTab, setGstr1CheckTab] = useState<Gstr1CheckTab>(routeState.gstr1CheckTab);
  const [gstr1DocType, setGstr1DocType] = useState<Gstr1DocType>(GSTR1_DOC_TYPES[0]);
  const [gstr1AmendmentDocType, setGstr1AmendmentDocType] = useState<Gstr1AmendmentDocType>(GSTR1_AMENDMENT_DOC_TYPES[0]);
  const [gstr1EntryReturnView, setGstr1EntryReturnView] = useState<'data-prepare' | 'check-invoices'>('data-prepare');
  const [gstr1ImportOption, setGstr1ImportOption] = useState<Gstr1ImportOption>('government-excel');
  const [gstr1PushMode, setGstr1PushMode] = useState<Gstr1PushMode>('without-otp');
  const [gstr1FileMode, setGstr1FileMode] = useState<Gstr1PushMode>('without-otp');
  const [gstr1PortalUsername, setGstr1PortalUsername] = useState('clearjuned');
  const [gstr1AuthorizedPan, setGstr1AuthorizedPan] = useState('Juned Rahim Sayyed');
  const [gstr1CheckRowsByTab, setGstr1CheckRowsByTab] = useState<Record<Gstr1CheckTab, Gstr1CheckedInvoiceRow[]>>(
    () =>
      Object.fromEntries(
        Object.entries(GSTR1_CHECKED_INVOICE_ROWS).map(([tab, rows]) => [tab, rows.map((row) => ({ ...row }))]),
      ) as Record<Gstr1CheckTab, Gstr1CheckedInvoiceRow[]>,
  );
  const [gstr1SelectedCheckRowIds, setGstr1SelectedCheckRowIds] = useState<string[]>([]);
  const [gstr1EntryMode, setGstr1EntryMode] = useState<'add' | 'edit'>('add');
  const [gstr1EditingCheckTab, setGstr1EditingCheckTab] = useState<Gstr1CheckTab | null>(null);
  const [gstr1AddRows, setGstr1AddRows] = useState<Gstr1DraftInvoiceRow[]>(INITIAL_GSTR1_ADD_ROWS);
  const [gstr1AmendmentRows, setGstr1AmendmentRows] = useState<Gstr1AmendmentDraftRow[]>(INITIAL_GSTR1_AMENDMENT_ROWS);
  const [gstr1ColumnSearchVisible, setGstr1ColumnSearchVisible] = useState(false);
  const [gstr1ColumnChooserVisible, setGstr1ColumnChooserVisible] = useState(false);
  const [gstr1CheckColumnFilters, setGstr1CheckColumnFilters] =
    useState<Record<Gstr1CheckColumnKey, string>>(INITIAL_GSTR1_CHECK_COLUMN_FILTERS);
  const [gstr1VisibleCheckColumns, setGstr1VisibleCheckColumns] =
    useState<Record<Gstr1CheckColumnKey, boolean>>(INITIAL_GSTR1_VISIBLE_CHECK_COLUMNS);
  const [gstr1MoreOptionOpen, setGstr1MoreOptionOpen] = useState(false);
  const [gstr1UploadStarted, setGstr1UploadStarted] = useState(false);
  const [gstr1CorrectionRecords, setGstr1CorrectionRecords] = useState<Gstr1CorrectionRecord[]>(INITIAL_GSTR1_CORRECTIONS);
  const [gstr1CustomerMaster, setGstr1CustomerMaster] =
    useState<Record<string, Gstr1CustomerMasterRecord>>(INITIAL_GSTR1_CUSTOMER_MASTER);
  const [gstr1ActiveIssueType, setGstr1ActiveIssueType] = useState<Gstr1CorrectionIssueType>(routeState.gstr1IssueType);
  const [gstr1SelectedCorrectionId, setGstr1SelectedCorrectionId] = useState<string | null>(
    routeState.gstr1RecordId ?? INITIAL_GSTR1_CORRECTIONS[0]?.id ?? null,
  );
  const [gstr1EditorState, setGstr1EditorState] = useState<Gstr1CorrectionEditorState>(() =>
    createGstr1CorrectionEditorState(
      INITIAL_GSTR1_CORRECTIONS[0],
      INITIAL_GSTR1_CUSTOMER_MASTER[INITIAL_GSTR1_CORRECTIONS[0].partyName],
    ),
  );
  const [gstr3bScenario, setGstr3bScenario] = useState<Gstr3bScenario>('payment-required');
  const [gstr3bApprovalMode, setGstr3bApprovalMode] = useState<'EVC' | 'DSC' | 'OTP'>('EVC');
  const [overviewConnected, setOverviewConnected] = useState(true);
  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const [connectGstNumber, setConnectGstNumber] = useState('');
  const [connectUsername, setConnectUsername] = useState('');
  const [gstr1Periods, setGstr1Periods] = useState<PeriodRecord[]>(INITIAL_GSTR1_PERIODS);
  const [gstrMonthValue, setGstrMonthValue] = useState('');
  const [uploadMonthValue, setUploadMonthValue] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [gstr2bGstNumber, setGstr2bGstNumber] = useState('');
  const [gstr2bUsername, setGstr2bUsername] = useState('');
  const [gstr2bPassword, setGstr2bPassword] = useState('');
  const [gstr2bMonthValue, setGstr2bMonthValue] = useState('May 2023');
  const [gstr2bPortalFetched, setGstr2bPortalFetched] = useState(false);
  const [gstr2bTallyFetched, setGstr2bTallyFetched] = useState(false);
  const [gstr2bProcessed, setGstr2bProcessed] = useState(false);
  const [detailContext, setDetailContext] = useState<DetailContext | null>(() => {
    const matchedPeriod = routeState.detailPeriodId
      ? INITIAL_GSTR1_PERIODS.find((period) => period.id === routeState.detailPeriodId) ?? null
      : null;

    return matchedPeriod ? { periodId: matchedPeriod.id, periodMonth: matchedPeriod.month } : null;
  });
  const [selectedFilters, setSelectedFilters] = useState<TransactionStatus[]>(['Not In Tally']);
  const [transactionRecords, setTransactionRecords] = useState<TransactionRecord[]>(createTransactionRecords);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<TransactionStatus | ''>('');
  const [page, setPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [actionMenuState, setActionMenuState] = useState<ActionMenuState | null>(null);
  const [trackerTooltipState, setTrackerTooltipState] = useState<TrackerTooltipState | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');

  const currentRouteHref = useMemo(
    () => (searchParamsString ? `${pathname}?${searchParamsString}` : pathname),
    [pathname, searchParamsString],
  );
  const navigateToGst = ({
    activeTab: nextTab = activeTab,
    gstr1View: nextView = gstr1View,
    gstr3bView: nextGstr3bView = gstr3bView,
    gstr3bSectionId: nextGstr3bSectionId = gstr3bSectionId,
    gstr1CheckTab: nextCheckTab = gstr1CheckTab,
    issueType: nextIssueType = gstr1ActiveIssueType,
    recordId: nextRecordId = gstr1SelectedCorrectionId,
    detailPeriodId = null,
  }: {
    activeTab?: GstTab;
    gstr1View?: Gstr1View;
    gstr3bView?: Gstr3bView;
    gstr3bSectionId?: Gstr3bSectionId;
    gstr1CheckTab?: Gstr1CheckTab;
    issueType?: Gstr1CorrectionIssueType;
    recordId?: string | null;
    detailPeriodId?: string | null;
  }) => {
    const href = buildGstHref({
      activeTab: nextTab,
      gstr1View: nextView,
      gstr3bView: nextGstr3bView,
      gstr3bSectionId: nextGstr3bSectionId,
      gstr1CheckTab: nextCheckTab,
      issueType: nextIssueType,
      recordId: nextRecordId,
      detailPeriodId,
    });

    if (href !== currentRouteHref) {
      router.push(href);
    }
  };

  const activeTracker = overviewConnected ? CONNECTED_TRACKER : DISCONNECTED_TRACKER;
  const auditCount = gstr1Periods.length;
  const filteredTransactions = useMemo(() => {
    if (selectedFilters.length === 0) {
      return transactionRecords;
    }

    return transactionRecords.filter((record) => selectedFilters.includes(record.status));
  }, [selectedFilters, transactionRecords]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / 20));
  const currentPage = Math.min(page, totalPages);
  const visibleTransactions = filteredTransactions.slice((currentPage - 1) * 20, currentPage * 20);
  const gstr2bCanProcess = gstr2bPortalFetched && gstr2bTallyFetched;
  const gstr2bIssueCounts = useMemo(
    () =>
      GSTR2B_OUTPUT_ROWS.reduce(
        (counts, row) => {
          counts[row.issue] += 1;
          return counts;
        },
        {
          'Missing In Tally': 0,
          'Amount Mismatch': 0,
          'Party Mismatch': 0,
        } as Record<Gstr2bIssue, number>,
      ),
    [],
  );
  const gstr1IssueCounts = useMemo(
    () =>
      GSTR1_ISSUE_ORDER.reduce(
        (counts, issueType) => {
          const matching = gstr1CorrectionRecords.filter((record) => record.issueType === issueType);
          counts[issueType] = {
            total: matching.length,
            open: matching.filter((record) => record.status === 'open').length,
            resolved: matching.filter((record) => record.status === 'resolved').length,
          };
          return counts;
        },
        {} as Record<Gstr1CorrectionIssueType, { total: number; open: number; resolved: number }>,
      ),
    [gstr1CorrectionRecords],
  );
  const gstr1PreviewSections = useMemo<Gstr1PreviewSection[]>(
    () =>
      GSTR1_PREVIEW_SECTION_DEFS.map((section) => ({
        ...section,
        status:
          section.linkedIssueType && gstr1IssueCounts[section.linkedIssueType].open > 0
            ? ('Needs Review' as const)
            : ('Ready' as const),
      })),
    [gstr1IssueCounts],
  );
  const gstr1ValidationItems = useMemo(() => {
    const items: Gstr1ValidationItem[] = [];
    const gstinCount = gstr1IssueCounts.gstin.open;
    const creditNoteCount = gstr1IssueCounts['credit-note-linkage'].open;
    const documentGapCount = gstr1IssueCounts['document-gap'].open;

    if (gstinCount > 0) {
      items.push({
        issueType: 'gstin',
        title: `${gstinCount} B2B invoice${gstinCount > 1 ? 's' : ''} need GSTIN correction`,
        detail: 'Customer GSTIN is blank or invalid, so these invoices cannot be pushed into the business invoice section yet.',
        tone: 'amber',
      });
    }

    if (creditNoteCount > 0) {
      items.push({
        issueType: 'credit-note-linkage',
        title: `${creditNoteCount} credit note${creditNoteCount > 1 ? 's need' : ' needs'} original invoice linkage`,
        detail: 'CDNR notes without the correct original invoice reference stay blocked until the linkage is corrected.',
        tone: 'blue',
      });
    }

    if (documentGapCount > 0) {
      items.push({
        issueType: 'document-gap',
        title: `Document series gap${documentGapCount > 1 ? 's' : ''} found in outward invoices`,
        detail: 'The draft found skipped document numbers. Confirm whether the missing document was cancelled, entered later, or should be ignored with reason.',
        tone: 'emerald',
      });
    }

    return items;
  }, [gstr1IssueCounts]);
  const gstr1IssueBuckets = useMemo(
    () =>
      GSTR1_ISSUE_ORDER.map((issueType) => ({
        issueType,
        ...GSTR1_ISSUE_META[issueType],
        ...gstr1IssueCounts[issueType],
      })),
    [gstr1IssueCounts],
  );
  const gstr1FilteredCorrections = useMemo(
    () =>
      [...gstr1CorrectionRecords]
        .filter((record) => record.issueType === gstr1ActiveIssueType)
        .sort((left, right) => Number(left.status === 'resolved') - Number(right.status === 'resolved')),
    [gstr1ActiveIssueType, gstr1CorrectionRecords],
  );
  const gstr1SelectedCorrection = useMemo(
    () => gstr1CorrectionRecords.find((record) => record.id === gstr1SelectedCorrectionId) ?? null,
    [gstr1CorrectionRecords, gstr1SelectedCorrectionId],
  );
  const gstr1SelectedCustomerMaster = useMemo(
    () => (gstr1SelectedCorrection ? gstr1CustomerMaster[gstr1SelectedCorrection.partyName] ?? null : null),
    [gstr1CustomerMaster, gstr1SelectedCorrection],
  );
  const gstr1ResolvedCount = useMemo(
    () => gstr1CorrectionRecords.filter((record) => record.status === 'resolved').length,
    [gstr1CorrectionRecords],
  );
  const gstr1RemainingCount = gstr1CorrectionRecords.length - gstr1ResolvedCount;
  const activeGstr1CheckRows = useMemo(() => gstr1CheckRowsByTab[gstr1CheckTab], [gstr1CheckRowsByTab, gstr1CheckTab]);
  const gstr1AddInvoiceSummary = useMemo(
    () =>
      gstr1AddRows.reduce(
        (totals, row) => {
          const parseAmount = (value: string) => Number(value.replace(/,/g, '')) || 0;
          const taxable = parseAmount(row.taxableValue);
          const rate = Number(row.rate) || 0;
          const cess = parseAmount(row.cessAmount);
          const tax = taxable * (rate / 100);

          totals.documents += row.invoiceNumber || row.receiverName || row.gstin ? 1 : 0;
          totals.taxable += taxable;
          totals.tax += tax + cess;
          totals.invoiceValue += parseAmount(row.invoiceValue) || taxable + tax + cess;
          return totals;
        },
        { documents: 0, taxable: 0, tax: 0, invoiceValue: 0 },
      ),
    [gstr1AddRows],
  );
  const gstr1ActiveDocColumns = useMemo(() => GSTR1_DOC_TYPE_COLUMNS[gstr1DocType], [gstr1DocType]);
  const gstr1ActiveAmendmentColumns = useMemo(
    () => GSTR1_AMENDMENT_DOC_TYPE_COLUMNS[gstr1AmendmentDocType],
    [gstr1AmendmentDocType],
  );
  const gstr1ActiveDocSummary = useMemo(() => {
    const totalAdvanced = gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.grossAdvanceReceived), 0);
    const totalValue = gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.totalValue), 0);
    const totalIntegratedTax = gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.integratedTax), 0);
    const totalCentralTax = gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.centralTax), 0);
    const totalStateTax = gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.stateTax), 0);
    const totalDocs = gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.totalNumber), 0);
    const totalCancelled = gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.cancelledNumber), 0);
    const totalNetIssued = gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.netIssued), 0);

    return {
      totalAdvanced,
      totalValue,
      totalTaxComponents: totalIntegratedTax + totalCentralTax + totalStateTax + gstr1AddRows.reduce((sum, row) => sum + parseGstr1Amount(row.cessAmount), 0),
      totalDocs,
      totalCancelled,
      totalNetIssued,
    };
  }, [gstr1AddRows]);
  const gstr1SelectedCheckRows = useMemo(
    () => activeGstr1CheckRows.filter((row) => gstr1SelectedCheckRowIds.includes(row.id)),
    [activeGstr1CheckRows, gstr1SelectedCheckRowIds],
  );
  const gstr1ActiveVisibleCheckColumns = useMemo(
    () => GSTR1_CHECK_COLUMNS.filter((column) => gstr1VisibleCheckColumns[column.key]),
    [gstr1VisibleCheckColumns],
  );
  const gstr1FilteredCheckRows = useMemo(
    () =>
      activeGstr1CheckRows.filter((row) =>
        GSTR1_CHECK_COLUMNS.every((column) => {
          const filterValue = gstr1CheckColumnFilters[column.key].trim().toLowerCase();

          if (!filterValue) {
            return true;
          }

          return String(row[column.key]).toLowerCase().includes(filterValue);
        }),
      ),
    [activeGstr1CheckRows, gstr1CheckColumnFilters],
  );
  const gstr1DisplayedCheckTotals = useMemo(
    () =>
      gstr1FilteredCheckRows.reduce(
        (totals, row) => {
          totals.transactions += 1;
          totals.taxable += parseGstr1Amount(row.taxableAmount);
          totals.totalTax += parseGstr1Amount(row.totalTax);
          totals.totalAmount += parseGstr1Amount(row.totalAmount);
          return totals;
        },
        {
          transactions: 0,
          taxable: 0,
          totalTax: 0,
          totalAmount: 0,
        },
      ),
    [gstr1FilteredCheckRows],
  );
  const gstr1PushProgressPercent = gstr1UploadStarted ? 100 : 0;
  const gstr1DocumentUploadRows = useMemo<Gstr1PushTableRow[]>(
    () => {
      const invoiceCount = gstr1CheckRowsByTab.Invoice.filter((row) => row.type === 'B2B').length;
      const cdnrCount = gstr1CheckRowsByTab['Credit / Debit Note'].filter((row) => row.type === 'CDNR').length;
      const uploadedValue = (count: number) => (gstr1UploadStarted ? String(count) : '0');

      return [
        {
          title: 'B2B',
          toBeUploaded: String(invoiceCount),
          uploaded: uploadedValue(invoiceCount),
          href:
            invoiceCount > 0
              ? buildGstHref({ activeTab: 'GSTR1', gstr1View: 'check-invoices', gstr1CheckTab: 'Invoice' })
              : undefined,
        },
        { title: 'B2C (Large)', toBeUploaded: '0', uploaded: '0' },
        { title: 'EXPORTS', toBeUploaded: '0', uploaded: '0' },
        {
          title: 'CDNR',
          toBeUploaded: String(cdnrCount),
          uploaded: uploadedValue(cdnrCount),
          href:
            cdnrCount > 0
              ? buildGstHref({ activeTab: 'GSTR1', gstr1View: 'check-invoices', gstr1CheckTab: 'Credit / Debit Note' })
              : undefined,
        },
        { title: 'CDNUR', toBeUploaded: '0', uploaded: '0' },
        { title: 'B2B Amendment', toBeUploaded: '0', uploaded: '0' },
        { title: 'B2C (Large) Amendment', toBeUploaded: '0', uploaded: '0' },
        { title: 'EXPORTS Amendment', toBeUploaded: '0', uploaded: '0' },
        { title: 'CDNR Amendment', toBeUploaded: '0', uploaded: '0' },
        { title: 'CDNUR Amendment', toBeUploaded: '0', uploaded: '0' },
        { title: 'Supplies U/s 9(5)', toBeUploaded: '0', uploaded: '0' },
        { title: 'Supplies U/s 9(5) Amendment', toBeUploaded: '0', uploaded: '0' },
      ];
    },
    [gstr1CheckRowsByTab, gstr1UploadStarted],
  );
  const gstr1SummaryUploadRows = useMemo<Gstr1PushTableRow[]>(
    () => {
      const uploadedAmount = (value: string) => (gstr1UploadStarted ? value : '0.00');
      const b2bSummaryValue = formatNumberAmount(parseGstr1Amount(GSTR1_TOTAL_ROW.taxableAmount));
      const b2cSummaryValue = formatNumberAmount(23758.75);
      const documentSeriesValue = formatNumberAmount(1);

      return [
        { title: 'B2C Others', toBeUploaded: b2cSummaryValue, uploaded: uploadedAmount(b2cSummaryValue) },
        { title: 'Nil Rated Supplies', toBeUploaded: '0.00', uploaded: '0.00' },
        { title: 'Advances Received (Tax Liability)', toBeUploaded: '0.00', uploaded: '0.00' },
        { title: 'Adjustment of Advances', toBeUploaded: '0.00', uploaded: '0.00' },
        {
          title: 'B2B HSN Supplies Summary of Outward Supplies',
          toBeUploaded: b2bSummaryValue,
          uploaded: uploadedAmount(b2bSummaryValue),
          href: buildGstHref({ activeTab: 'GSTR1', gstr1View: 'check-invoices', gstr1CheckTab: 'Invoice' }),
        },
        {
          title: 'B2C HSN Supplies Summary of Outward Supplies',
          toBeUploaded: b2cSummaryValue,
          uploaded: uploadedAmount(b2cSummaryValue),
        },
        {
          title: 'Document Series Summary',
          toBeUploaded: documentSeriesValue,
          uploaded: uploadedAmount(documentSeriesValue),
          href: buildGstHref({ activeTab: 'GSTR1', gstr1View: 'corrections', issueType: 'document-gap' }),
        },
        { title: 'Supplies made through Eco - u/s 52', toBeUploaded: '0.00', uploaded: '0.00' },
        { title: 'Supplies U/s 9(5)', toBeUploaded: '0.00', uploaded: '0.00' },
        { title: 'B2C Others Amendment', toBeUploaded: '0.00', uploaded: '0.00' },
        { title: 'Advances Received (Tax Liability) Amendment', toBeUploaded: '0.00', uploaded: '0.00' },
        { title: 'Supplies made through Eco - u/s 52 Amendment', toBeUploaded: '0.00', uploaded: '0.00' },
        { title: 'Supplies U/s 9(5) Amendment', toBeUploaded: '0.00', uploaded: '0.00' },
        { title: 'Adjustment of Advances Amendment', toBeUploaded: '0.00', uploaded: '0.00' },
      ];
    },
    [gstr1UploadStarted],
  );
  const gstr1AmendmentSummary = useMemo(
    () =>
      gstr1AmendmentRows.reduce(
        (totals, row) => {
          const parseAmount = (value: string) => Number(value.replace(/,/g, '')) || 0;
          const taxable = parseAmount(row.taxableValue);
          const rate = Number(row.rate) || 0;
          const cess = parseAmount(row.cessAmount);
          const tax = taxable * (rate / 100);

          totals.documents += row.revisedInvoiceNumber || row.originalInvoiceNumber ? 1 : 0;
          totals.taxable += taxable;
          totals.tax += tax + cess;
          totals.invoiceValue += parseAmount(row.invoiceValue) || taxable + tax + cess;
          return totals;
        },
        { documents: 0, taxable: 0, tax: 0, invoiceValue: 0 },
      ),
    [gstr1AmendmentRows],
  );
  const gstr1CanSaveDraft = useMemo(
    () => gstr1AddRows.some((row) => row.invoiceNumber || row.receiverName || row.gstin || row.taxableValue),
    [gstr1AddRows],
  );
  const gstr1CanMarkFiled = useMemo(
    () =>
      gstr1SelectedCheckRows.length > 0 &&
      gstr1SelectedCheckRows.every((row) => row.status === 'Uploaded to GSTN.'),
    [gstr1SelectedCheckRows],
  );
  const gstr1CanSaveAmendment = useMemo(
    () => gstr1AmendmentRows.some((row) => row.originalInvoiceNumber || row.revisedInvoiceNumber),
    [gstr1AmendmentRows],
  );
  const gstr1ReviewSectionCodes = useMemo(
    () =>
      gstr1PreviewSections
        .filter((section) => section.status === 'Needs Review')
        .map((section) => section.code)
        .join(', '),
    [gstr1PreviewSections],
  );
  const activeActionPeriod = useMemo(
    () => gstr1Periods.find((period) => period.id === openActionMenu) ?? null,
    [gstr1Periods, openActionMenu],
  );

  useEffect(() => {
    if (activeTab !== routeState.activeTab) {
      setActiveTab(routeState.activeTab);
    }

    if (gstr1View !== routeState.gstr1View) {
      setGstr1View(routeState.gstr1View);
    }

    if (gstr3bView !== routeState.gstr3bView) {
      setGstr3bView(routeState.gstr3bView);
    }

    if (gstr3bSectionId !== routeState.gstr3bSectionId) {
      setGstr3bSectionId(routeState.gstr3bSectionId);
    }

    if (gstr1CheckTab !== routeState.gstr1CheckTab) {
      setGstr1CheckTab(routeState.gstr1CheckTab);
    }

    if (gstr1ActiveIssueType !== routeState.gstr1IssueType) {
      setGstr1ActiveIssueType(routeState.gstr1IssueType);
    }

    if (routeState.gstr1RecordId && routeState.gstr1RecordId !== gstr1SelectedCorrectionId) {
      setGstr1SelectedCorrectionId(routeState.gstr1RecordId);
    }

    if (routeState.detailPeriodId) {
      const matchedPeriod = gstr1Periods.find((period) => period.id === routeState.detailPeriodId) ?? null;

      if (!matchedPeriod) {
        if (detailContext) {
          setDetailContext(null);
        }
      } else if (detailContext?.periodId !== matchedPeriod.id) {
        setDetailContext({ periodId: matchedPeriod.id, periodMonth: matchedPeriod.month });
        setSelectedFilters(['Not In Tally']);
        setSelectedRowIds([]);
        setBulkStatus('');
        setPage(1);
        setOpenActionMenu(null);
        setActionMenuState(null);
      }
    } else if (detailContext) {
      setDetailContext(null);
    }
  }, [
    activeTab,
    detailContext,
    gstr1ActiveIssueType,
    gstr1CheckTab,
    gstr1Periods,
    gstr1SelectedCorrectionId,
    gstr1View,
    gstr3bSectionId,
    gstr3bView,
    routeState,
  ]);

  useEffect(() => {
    if (gstr1FilteredCorrections.length === 0) {
      setGstr1SelectedCorrectionId(null);
      return;
    }

    if (!gstr1SelectedCorrectionId || !gstr1FilteredCorrections.some((record) => record.id === gstr1SelectedCorrectionId)) {
      const preferred = gstr1FilteredCorrections.find((record) => record.status === 'open') ?? gstr1FilteredCorrections[0];
      setGstr1SelectedCorrectionId(preferred.id);
    }
  }, [gstr1FilteredCorrections, gstr1SelectedCorrectionId]);

  useEffect(() => {
    if (!gstr1SelectedCorrection) {
      return;
    }

    setGstr1EditorState(createGstr1CorrectionEditorState(gstr1SelectedCorrection, gstr1SelectedCustomerMaster ?? undefined));
  }, [gstr1SelectedCorrection, gstr1SelectedCustomerMaster]);

  useEffect(() => {
    if (!openActionMenu && !trackerTooltipState) {
      return;
    }

    const handleViewportChange = () => {
      setOpenActionMenu(null);
      setActionMenuState(null);
      setTrackerTooltipState(null);
    };

    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [openActionMenu, trackerTooltipState]);

  useEffect(() => {
    setGstr1SelectedCheckRowIds((current) => current.filter((id) => activeGstr1CheckRows.some((row) => row.id === id)));
  }, [activeGstr1CheckRows]);

  const handleOpenDetail = (period: PeriodRecord) => {
    setDetailContext({ periodId: period.id, periodMonth: period.month });
    setSelectedFilters(['Not In Tally']);
    setSelectedRowIds([]);
    setBulkStatus('');
    setPage(1);
    setStatusMessage('');
    setOpenActionMenu(null);
    setActionMenuState(null);
    navigateToGst({ activeTab: 'GSTR1', detailPeriodId: period.id });
  };

  const handleShowTrackerTooltip = (cell: TrackerCell, event: React.MouseEvent<HTMLDivElement>) => {
    if (cell.state !== 'filed' || !cell.arn) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = 220;
    const tooltipHeight = 116;
    const viewportPadding = 16;
    const canOpenBelow = rect.bottom + 10 + tooltipHeight <= window.innerHeight - viewportPadding;
    const centerX = rect.left + rect.width / 2;

    setTrackerTooltipState({
      cell,
      left: Math.min(
        Math.max(centerX, viewportPadding + tooltipWidth / 2),
        window.innerWidth - viewportPadding - tooltipWidth / 2,
      ),
      top: canOpenBelow ? rect.bottom + 10 : rect.top - 10,
      placement: canOpenBelow ? 'bottom' : 'top',
    });
  };

  const handleHideTrackerTooltip = () => {
    setTrackerTooltipState(null);
  };

  const handleToggleFilter = (filter: TransactionStatus) => {
    setSelectedFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );
    setSelectedRowIds([]);
    setBulkStatus('');
    setPage(1);
  };

  const handleToggleRow = (rowId: string) => {
    setSelectedRowIds((current) =>
      current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId],
    );
  };

  const handleToggleAllVisibleRows = () => {
    const visibleIds = visibleTransactions.map((record) => record.id);
    const allSelected = visibleIds.every((id) => selectedRowIds.includes(id));

    if (allSelected) {
      setSelectedRowIds((current) => current.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedRowIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

  const handleBulkSave = () => {
    if (!bulkStatus || selectedRowIds.length === 0) {
      return;
    }

    setTransactionRecords((current) =>
      current.map((record) =>
        selectedRowIds.includes(record.id)
          ? {
              ...record,
              status: bulkStatus,
            }
          : record,
      ),
    );
    setStatusMessage(`${selectedRowIds.length} transaction${selectedRowIds.length > 1 ? 's were' : ' was'} updated to ${bulkStatus}.`);
    setSelectedRowIds([]);
    setBulkStatus('');
  };

  const handleChangeRowStatus = (rowId: string, status: TransactionStatus) => {
    setTransactionRecords((current) =>
      current.map((record) =>
        record.id === rowId
          ? {
              ...record,
              status,
            }
          : record,
      ),
    );
  };

  const handleChangeMove = (rowId: string, move: MoveDirection) => {
    setTransactionRecords((current) =>
      current.map((record) =>
        record.id === rowId
          ? {
              ...record,
              move,
            }
          : record,
      ),
    );
  };

  const handleOverviewConnect = () => {
    setOverviewConnected(true);
    setOpenModal(null);
    setStatusMessage('GST credentials saved. The overview is now synced with the connected state.');
  };

  const handleGetGstrData = () => {
    if (!gstrMonthValue) {
      return;
    }

    const periodLabel = formatFiscalMonth(gstrMonthValue);
    setGstr1DraftPeriod(periodLabel);
    setGstr1Periods((current) => {
      const existing = current.find((period) => period.month === periodLabel);

      if (existing) {
        return current.map((period) =>
          period.month === periodLabel
            ? {
                ...period,
                totalInvoice: 0,
                status: 'Processing',
              }
            : period,
        );
      }

      return [
        {
          id: `${periodLabel.toLowerCase().replace(/\s+/g, '-')}`,
          month: periodLabel,
          lastSyncDate: '28-02-2024',
          totalInvoice: 0,
          reconciled: 'Pending',
          status: 'Processing',
          locked: false,
        },
        ...current,
      ];
    });

    setOpenModal(null);
    setStatusMessage(`${periodLabel} preview was loaded for GSTR-1 and is now ready for pre-filing review.`);
    setGstrMonthValue('');
  };

  const handleUpload = () => {
    if (!uploadMonthValue) {
      return;
    }

    const periodLabel = formatFiscalMonth(uploadMonthValue);
    setGstr1DraftPeriod(periodLabel);
    setGstr1Periods((current) => {
      const alreadyExists = current.find((period) => period.month === periodLabel);

      if (alreadyExists) {
        return current.map((period) =>
          period.month === periodLabel
            ? {
                ...period,
                totalInvoice: Math.max(period.totalInvoice, 208),
                status: 'Complete',
              }
            : period,
        );
      }

      return [
        {
          id: `${periodLabel.toLowerCase().replace(/\s+/g, '-')}`,
          month: periodLabel,
          lastSyncDate: '28-02-2024',
          totalInvoice: 208,
          reconciled: 'Pending',
          status: 'Complete',
          locked: false,
        },
        ...current,
      ];
    });

    setOpenModal(null);
    setStatusMessage(`${periodLabel} draft preview was updated${uploadFileName ? ` using ${uploadFileName}` : ''}.`);
    setUploadMonthValue('');
    setUploadFileName('');
  };

  const handleOpenGstr1Workbench = (issueType: Gstr1CorrectionIssueType, recordId?: string) => {
    const nextRecord =
      gstr1CorrectionRecords.find((record) => record.id === recordId) ??
      gstr1CorrectionRecords.find((record) => record.issueType === issueType && record.status === 'open') ??
      gstr1CorrectionRecords.find((record) => record.issueType === issueType) ??
      null;

    setActiveTab('GSTR1');
    setGstr1View('corrections');
    setGstr1ActiveIssueType(issueType);
    setGstr1SelectedCorrectionId(nextRecord?.id ?? null);
    setStatusMessage(`${GSTR1_ISSUE_META[issueType].label} corrections opened for ${gstr1DraftPeriod}.`);
    navigateToGst({
      activeTab: 'GSTR1',
      gstr1View: 'corrections',
      issueType,
      recordId: nextRecord?.id ?? null,
    });
  };

  const handleExitGstr1Workbench = () => {
    setGstr1View('data-prepare');
    setStatusMessage('Returned to the GSTR-1 data-prepare screen. Corrections remain synced with the filing draft.');
    navigateToGst({ activeTab: 'GSTR1', gstr1View: 'data-prepare' });
  };

  const handleFetchGstr1BusinessData = () => {
    if (!gstr1EditorState.gstin.trim()) {
      setStatusMessage('Enter a GSTIN before fetching business details.');
      return;
    }

    const preview = buildGstr1LookupPreview(
      gstr1EditorState.customerName || gstr1SelectedCorrection?.partyName || 'GST Customer',
      gstr1EditorState.gstin.trim().toUpperCase(),
      gstr1EditorState.registrationType,
      gstr1EditorState.placeOfSupply,
      gstr1EditorState.pan,
    );

    setGstr1EditorState((current) => ({
      ...current,
      customerName: current.customerName || preview.tradeName,
      registrationType: preview.registrationType,
      placeOfSupply: preview.state,
      pan: current.pan || preview.pan,
      lookupPreview: preview,
    }));
    setStatusMessage(`GSTIN lookup preview loaded for ${preview.tradeName}.`);
  };

  const handleSaveGstr1Correction = (scope: Gstr1SaveScope = 'draft-master', advance = false) => {
    if (!gstr1SelectedCorrection) {
      return;
    }

    const timestamp = formatGstr1Timestamp();
    let nextStatusMessage = '';
    let updatedRecords = gstr1CorrectionRecords;

    if (gstr1SelectedCorrection.issueType === 'gstin') {
      const normalizedGstin = gstr1EditorState.gstin.trim().toUpperCase();

      if (!normalizedGstin) {
        setStatusMessage('GSTIN is required before this customer can move into the B2B section.');
        return;
      }

      updatedRecords = gstr1CorrectionRecords.map((record) =>
        record.issueType === 'gstin' && record.partyName === gstr1SelectedCorrection.partyName
          ? {
              ...record,
              partyName: gstr1EditorState.customerName || record.partyName,
              currentGstin: normalizedGstin,
              registrationType: gstr1EditorState.registrationType,
              placeOfSupply: gstr1EditorState.placeOfSupply,
              pan: gstr1EditorState.pan,
              status: 'resolved',
              errorReason: 'GSTIN corrected. Invoice is ready for B2B filing.',
              lastUpdated: timestamp,
              notes: gstr1EditorState.notes,
              masterUpdated: scope === 'draft-master',
            }
          : record,
      );

      if (scope === 'draft-master') {
        setGstr1CustomerMaster((current) => ({
          ...Object.fromEntries(
            Object.entries(current).filter(([key]) => key !== gstr1SelectedCorrection.partyName),
          ),
          [gstr1EditorState.customerName || gstr1SelectedCorrection.partyName]: {
            customerName: gstr1EditorState.customerName || gstr1SelectedCorrection.partyName,
            gstin: normalizedGstin,
            registrationType: gstr1EditorState.registrationType,
            placeOfSupply: gstr1EditorState.placeOfSupply,
            pan: gstr1EditorState.pan,
            lastUpdated: timestamp,
          },
        }));
      }

      nextStatusMessage =
        scope === 'draft-master'
          ? `${gstr1SelectedCorrection.partyName} GSTIN was corrected in the draft and synced to customer master.`
          : `${gstr1SelectedCorrection.partyName} GSTIN was corrected in the draft without changing customer master.`;
    } else if (gstr1SelectedCorrection.issueType === 'credit-note-linkage') {
      if (!gstr1EditorState.originalInvoiceRef.trim()) {
        setStatusMessage('Select the original invoice reference before saving the CDNR correction.');
        return;
      }

      updatedRecords = gstr1CorrectionRecords.map((record) =>
        record.id === gstr1SelectedCorrection.id
          ? {
              ...record,
              originalInvoiceRef: gstr1EditorState.originalInvoiceRef,
              expectedInvoiceRef: gstr1EditorState.expectedInvoiceRef,
              status: 'resolved',
              errorReason: `Linked to original invoice ${gstr1EditorState.originalInvoiceRef}.`,
              lastUpdated: timestamp,
              notes: gstr1EditorState.notes,
              resolutionLabel: `Linked to ${gstr1EditorState.originalInvoiceRef}`,
            }
          : record,
      );
      nextStatusMessage = `Credit note ${gstr1SelectedCorrection.noteNo} is now linked to ${gstr1EditorState.originalInvoiceRef}.`;
    } else {
      if (
        gstr1EditorState.resolutionAction === 'enter-missing-document' &&
        !gstr1EditorState.missingDocumentNo.trim()
      ) {
        setStatusMessage('Enter the missing document number before saving this series correction.');
        return;
      }

      if (
        gstr1EditorState.resolutionAction === 'ignore-with-reason' &&
        !gstr1EditorState.resolutionReason.trim()
      ) {
        setStatusMessage('Add a reason before ignoring a document gap.');
        return;
      }

      const resolutionLabel =
        gstr1EditorState.resolutionAction === 'enter-missing-document'
          ? `Missing document entered as ${gstr1EditorState.missingDocumentNo.trim()}`
          : gstr1EditorState.resolutionAction === 'ignore-with-reason'
            ? `Ignored: ${gstr1EditorState.resolutionReason.trim()}`
            : GSTR1_DOCUMENT_RESOLUTION_LABELS[gstr1EditorState.resolutionAction];

      updatedRecords = gstr1CorrectionRecords.map((record) =>
        record.id === gstr1SelectedCorrection.id
          ? {
              ...record,
              status: 'resolved',
              lastUpdated: timestamp,
              notes: gstr1EditorState.notes,
              missingNumber:
                gstr1EditorState.resolutionAction === 'enter-missing-document'
                  ? gstr1EditorState.missingDocumentNo.trim()
                  : record.missingNumber,
              detectedReason:
                gstr1EditorState.resolutionAction === 'ignore-with-reason'
                  ? gstr1EditorState.resolutionReason.trim()
                  : record.detectedReason,
              resolutionAction: gstr1EditorState.resolutionAction,
              resolutionLabel,
              errorReason: resolutionLabel,
            }
          : record,
      );
      nextStatusMessage = `Document series gap ${gstr1SelectedCorrection.missingNumber} was resolved.`;
    }

    setGstr1CorrectionRecords(updatedRecords);

    if (!advance) {
      setStatusMessage(nextStatusMessage);
      return;
    }

    const nextRecord = getNextOpenGstr1Correction(updatedRecords, gstr1ActiveIssueType);

    if (!nextRecord) {
      setGstr1View('data-prepare');
      setStatusMessage('All GSTR-1 corrections are resolved. The return is ready for final review.');
      navigateToGst({ activeTab: 'GSTR1', gstr1View: 'data-prepare' });
      return;
    }

    setGstr1ActiveIssueType(nextRecord.issueType);
    setGstr1SelectedCorrectionId(nextRecord.id);
    setStatusMessage(`${nextStatusMessage} Next issue opened for review.`);
    navigateToGst({
      activeTab: 'GSTR1',
      gstr1View: 'corrections',
      issueType: nextRecord.issueType,
      recordId: nextRecord.id,
    });
  };

  const handleSwitchGstr1IssueType = (issueType: Gstr1CorrectionIssueType) => {
    const preferredRecord =
      gstr1CorrectionRecords.find((record) => record.issueType === issueType && record.status === 'open') ??
      gstr1CorrectionRecords.find((record) => record.issueType === issueType) ??
      null;

    setGstr1ActiveIssueType(issueType);
    setGstr1SelectedCorrectionId(preferredRecord?.id ?? null);
    navigateToGst({
      activeTab: 'GSTR1',
      gstr1View: 'corrections',
      issueType,
      recordId: preferredRecord?.id ?? null,
    });
  };

  const handleToggleGstr1CheckRow = (rowId: string) => {
    setGstr1SelectedCheckRowIds((current) =>
      current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId],
    );
  };

  const handleToggleAllGstr1CheckRows = () => {
    if (gstr1FilteredCheckRows.length === 0) {
      return;
    }

    const activeIds = gstr1FilteredCheckRows.map((row) => row.id);
    const allSelected = activeIds.every((id) => gstr1SelectedCheckRowIds.includes(id));

    setGstr1SelectedCheckRowIds(allSelected ? [] : activeIds);
  };

  const handleUpdateGstr1CheckColumnFilter = (column: Gstr1CheckColumnKey, value: string) => {
    setGstr1CheckColumnFilters((current) => ({
      ...current,
      [column]: value,
    }));
  };

  const handleToggleGstr1CheckColumnVisibility = (column: Gstr1CheckColumnKey) => {
    setGstr1VisibleCheckColumns((current) => ({
      ...current,
      [column]: !current[column],
    }));
  };

  const handleSetAllGstr1CheckColumns = (visible: boolean) => {
    setGstr1VisibleCheckColumns(
      Object.fromEntries(GSTR1_CHECK_COLUMNS.map((column) => [column.key, visible])) as Record<Gstr1CheckColumnKey, boolean>,
    );
  };

  const handleOpenGstr1AddInvoice = (source: 'data-prepare' | 'check-invoices') => {
    setGstr1EntryReturnView(source);
    setGstr1EntryMode('add');
    setGstr1EditingCheckTab(null);
    setGstr1AddRows([createEmptyGstr1DraftRow('add-row-1')]);
    setGstr1View('add-invoice');
    setStatusMessage('Opened the Add Invoice screen for direct invoice entry.');
    navigateToGst({ activeTab: 'GSTR1', gstr1View: 'add-invoice' });
  };

  const handleOpenGstr1EditSelected = () => {
    if (gstr1SelectedCheckRows.length === 0) {
      setStatusMessage('Select at least one invoice row before opening edit.');
      return;
    }

    setGstr1EntryReturnView('check-invoices');
    setGstr1EntryMode('edit');
    setGstr1EditingCheckTab(gstr1CheckTab);
    setGstr1AddRows(gstr1SelectedCheckRows.map((row, index) => mapCheckedInvoiceRowToDraft(row, gstr1CheckTab, index)));
    setGstr1View('add-invoice');
    setStatusMessage(`${gstr1SelectedCheckRows.length} selected invoice row${gstr1SelectedCheckRows.length > 1 ? 's were' : ' was'} opened in Edit Invoice.`);
    navigateToGst({ activeTab: 'GSTR1', gstr1View: 'add-invoice' });
  };

  const handleOpenGstr1AddAmendment = () => {
    setGstr1EntryReturnView('check-invoices');
    setGstr1EntryMode('add');
    setGstr1EditingCheckTab(null);
    setGstr1AmendmentDocType('B2B Amendment');
    setGstr1AmendmentRows(INITIAL_GSTR1_AMENDMENT_ROWS);
    setGstr1View('add-amendment');
    setStatusMessage('Opened the Add Amendment Invoice screen.');
    navigateToGst({ activeTab: 'GSTR1', gstr1View: 'add-amendment' });
  };

  const handleReturnFromGstr1Entry = (message?: string) => {
    setGstr1View(gstr1EntryReturnView);
    setGstr1EntryMode('add');
    setGstr1EditingCheckTab(null);
    setStatusMessage(
      message ??
        (gstr1EntryReturnView === 'data-prepare'
          ? 'Returned to the GSTR-1 data-prepare screen.'
          : 'Returned to the GSTR-1 check-invoices screen.'),
    );
    navigateToGst({
      activeTab: 'GSTR1',
      gstr1View: gstr1EntryReturnView,
      gstr1CheckTab: gstr1EntryReturnView === 'check-invoices' ? gstr1CheckTab : 'Invoice',
    });
  };

  const handleOpenGstr1Import = () => {
    setGstr1View('import-data');
    setStatusMessage('Opened import options for GSTR-1 data preparation.');
    navigateToGst({ activeTab: 'GSTR1', gstr1View: 'import-data' });
  };

  const handleSelectGstr1ImportOption = (option: Gstr1ImportOption) => {
    setGstr1ImportOption(option);
    const optionLabel = GSTR1_IMPORT_OPTIONS.find((item) => item.key === option)?.title ?? 'Import option';
    setStatusMessage(`${optionLabel} selected for data import.`);
  };

  const handleOpenGstr1SectionReview = (tab: Gstr1CheckTab) => {
    setGstr1CheckTab(tab);
    setGstr1View('check-invoices');
    setStatusMessage(`${tab} opened in GSTR-1 check invoices.`);
    navigateToGst({ activeTab: 'GSTR1', gstr1View: 'check-invoices', gstr1CheckTab: tab });
  };

  const handleRunGstr1Upload = () => {
    setGstr1UploadStarted(true);
    setStatusMessage(
      gstr1PushMode === 'without-otp'
        ? 'Upload started to GSTN without OTP. Summary actions are now available for preview.'
        : 'Upload via OTP started. Summary actions are now available for preview.',
    );
  };

  const handleGetPanFromPortal = () => {
    setStatusMessage(`Authorized PAN fetched from portal for ${gstr1PortalUsername}.`);
  };

  const handleFileGstr1Return = (mode: 'EVC' | 'DSC') => {
    setStatusMessage(`GSTR-1 filing prepared with ${mode}. OTP verification is required on the live portal.`);
  };

  const handleAddInvoiceRow = () => {
    setGstr1AddRows((current) => [
      ...current,
      createEmptyGstr1DraftRow(`add-row-${current.length + 1}`),
    ]);
  };

  const handleAddAmendmentRow = () => {
    setGstr1AmendmentRows((current) => [
      ...current,
      createEmptyGstr1AmendmentRow(`amend-row-${current.length + 1}`),
    ]);
  };

  const handleUpdateGstr1AddRow = <K extends keyof Gstr1DraftInvoiceRow>(
    rowId: string,
    field: K,
    value: Gstr1DraftInvoiceRow[K],
  ) => {
    setGstr1AddRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const handleSaveGstr1DraftRows = () => {
    if (!gstr1CanSaveDraft) {
      return;
    }

    if (gstr1EntryMode === 'edit' && gstr1EditingCheckTab) {
      const draftsBySourceId = new Map(
        gstr1AddRows
          .filter((row) => row.sourceCheckRowId)
          .map((row) => [row.sourceCheckRowId as string, row]),
      );

      setGstr1CheckRowsByTab((current) => ({
        ...current,
        [gstr1EditingCheckTab]: current[gstr1EditingCheckTab].map((row) => {
          const matchingDraft = draftsBySourceId.get(row.id);
          return matchingDraft ? mapDraftInvoiceRowToChecked(row, matchingDraft) : row;
        }),
      }));
      setGstr1SelectedCheckRowIds([]);
      handleReturnFromGstr1Entry(
        `${draftsBySourceId.size} selected invoice row${draftsBySourceId.size > 1 ? 's were' : ' was'} updated and verified.`,
      );
      return;
    }

    handleReturnFromGstr1Entry('Draft invoice rows saved and verified.');
  };

  const handleUpdateSelectedGstr1RowStatus = (nextStatus: string, successLabel: string) => {
    if (gstr1SelectedCheckRows.length === 0) {
      setStatusMessage('Select at least one invoice row first.');
      return;
    }

    setGstr1CheckRowsByTab((current) => ({
      ...current,
      [gstr1CheckTab]: current[gstr1CheckTab].map((row) =>
        gstr1SelectedCheckRowIds.includes(row.id)
          ? {
              ...row,
              status: nextStatus,
            }
          : row,
      ),
    }));
    setStatusMessage(`${gstr1SelectedCheckRows.length} selected invoice row${gstr1SelectedCheckRows.length > 1 ? 's were' : ' was'} ${successLabel}.`);
    setGstr1SelectedCheckRowIds([]);
  };

  const handleDeleteSelectedGstr1Rows = () => {
    if (gstr1SelectedCheckRows.length === 0) {
      setStatusMessage('Select at least one invoice row before deleting.');
      return;
    }

    const deletedCount = gstr1SelectedCheckRows.length;
    setGstr1CheckRowsByTab((current) => ({
      ...current,
      [gstr1CheckTab]: current[gstr1CheckTab].filter((row) => !gstr1SelectedCheckRowIds.includes(row.id)),
    }));
    setGstr1SelectedCheckRowIds([]);
    setStatusMessage(`${deletedCount} selected invoice row${deletedCount > 1 ? 's were' : ' was'} deleted.`);
  };

  const handleUpdateGstr1AmendmentRow = <K extends keyof Gstr1AmendmentDraftRow>(
    rowId: string,
    field: K,
    value: Gstr1AmendmentDraftRow[K],
  ) => {
    setGstr1AmendmentRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const handleGstr2bPortalFetch = () => {
    if (!gstr2bMonthValue) {
      return;
    }

    setGstr2bPortalFetched(true);
    setGstr2bProcessed(false);
    setOpenModal(null);
    setStatusMessage(`GST portal data fetched for ${gstr2bMonthValue}.`);
  };

  const handleGstr2bTallyFetch = () => {
    setGstr2bTallyFetched(true);
    setGstr2bProcessed(false);
    setStatusMessage(`Tally purchase data fetched for ${gstr2bMonthValue}.`);
  };

  const handleGstr2bProcess = () => {
    if (!gstr2bCanProcess) {
      return;
    }

    setGstr2bProcessed(true);
    setStatusMessage(
      `GST 2B reconciliation processed for ${gstr2bMonthValue}. Missing invoices, amount mismatches, and party mismatches are highlighted below.`,
    );
  };

  const handlePrepareGstr3b = () => {
    setGstr3bDraftSaved(true);
    navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId });
    setStatusMessage('GSTR-3B draft prepared from books. Review section-wise values before moving to GSTN upload.');
  };

  const handleCreateGstr3bChallan = () => {
    setGstr3bChallanReady(true);
    setStatusMessage('Challan generated for Rs 1.68L. Complete payment on the portal, then continue to GSTN upload.');
  };

  const handleRefreshGstr3bLedger = () => {
    setGstr3bPortalFetched(true);
    setStatusMessage('Latest cash ledger, liability, and filing status were refreshed from the GST portal.');
  };

  const handleFileGstr3b = () => {
    setGstr3bFiled(true);
    setOpenModal('gstr3b-guide');
    setStatusMessage(`GSTR-3B filing was initiated via ${gstr3bApprovalMode}. The GST utility guide is now available for the authorization handoff.`);
  };

  const handleOpenGstr3bNilReturn = () => {
    navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'nil-return' });
  };

  const handleOpenGstr3bDownload = () => {
    setOpenModal('gstr3b-download');
  };

  const handleFetchGstr3bPortalData = () => {
    setOpenModal(null);
    setGstr3bPortalFetched(true);
    setStatusMessage(`GSTR-3B summary data downloaded from GST portal for ${gstr3bSelectedPeriod}.`);
  };

  const handleSaveGstr3bDraft = () => {
    setGstr3bDraftSaved(true);
    setStatusMessage(`Section ${gstr3bSectionId} was saved in the 3B draft for ${gstr3bSelectedPeriod}.`);
  };

  const handleProceedToGstr3bPush = () => {
    navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'push-to-gstn', gstr3bSectionId });
    setStatusMessage('Prepared GSTR-3B values are ready to be pushed to GSTN.');
  };

  const handleStartGstr3bUpload = () => {
    setGstr3bUploadStarted(true);
    setStatusMessage(`GSTR-3B upload started via ${gstr3bPushMode === 'without-otp' ? 'Upload without OTP' : 'Upload via OTP'}.`);
  };

  const handleProceedToGstr3bFile = () => {
    navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'file-gstr-3b', gstr3bSectionId });
    setStatusMessage('GSTN upload completed. Review filing controls and authorize the return.');
  };

  const handleRefreshPeriod = (periodId: string) => {
    setGstr1Periods((current) =>
      current.map((period) =>
        period.id === periodId
          ? {
              ...period,
              totalInvoice: period.totalInvoice === 0 ? 297 : period.totalInvoice,
              status: 'Complete',
            }
          : period,
      ),
    );
    setStatusMessage('The selected period was refreshed and completed.');
  };

  const handleToggleLockPeriod = (periodId: string) => {
    setGstr1Periods((current) =>
      current.map((period) =>
        period.id === periodId
          ? {
              ...period,
              locked: !period.locked,
            }
          : period,
      ),
    );
  };

  const handleDeletePeriod = (periodId: string) => {
    setGstr1Periods((current) => current.filter((period) => period.id !== periodId));
    if (detailContext?.periodId === periodId) {
      setDetailContext(null);
      navigateToGst({ activeTab: 'GSTR1', gstr1View: 'data-prepare' });
    }
    setOpenActionMenu(null);
    setActionMenuState(null);
  };

  const handleToggleActionMenu = (periodId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (openActionMenu === periodId) {
      setOpenActionMenu(null);
      setActionMenuState(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 96;
    const viewportPadding = 16;
    const canOpenBelow = rect.bottom + 8 + menuHeight <= window.innerHeight - viewportPadding;

    setOpenActionMenu(periodId);
    setActionMenuState({
      periodId,
      left: Math.min(rect.right, window.innerWidth - viewportPadding),
      top: canOpenBelow ? rect.bottom + 8 : rect.top - 8,
      placement: canOpenBelow ? 'bottom' : 'top',
    });
  };

  const handleSyncOverview = () => {
    setOverviewConnected(true);
    setStatusMessage('GST overview refreshed. Last sync date updated to 28-02-2024.');
  };

  const handleExport = () => {
    downloadCsv(
      'gst-transactions.csv',
      [
        ['Status', 'Move Transactions', 'GST Portal Invoice No', 'Tally Invoice No', 'GST Portal Invoice Date', 'Tally Invoice Date', 'GST Portal Party', 'Tally Party', 'GST Portal GST No', 'Tally GST No'],
        ...filteredTransactions.map((record) => [
          record.status,
          record.move,
          record.gstInvoiceNo,
          record.tallyInvoiceNo,
          record.gstInvoiceDate,
          record.tallyInvoiceDate,
          record.gstPartyName,
          record.tallyPartyName,
          record.gstNo,
          record.tallyNo,
        ]),
      ],
    );
    setStatusMessage('The filtered transaction view was exported.');
  };

  const handleReconcile = () => {
    setStatusMessage('Reconciliation has been queued for the current filtered set.');
  };

  const renderTitleBar = () => (
    <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <FileText size={16} />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900">Audit</h1>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-semibold text-white">
            {auditCount}
          </span>
          <Info size={16} className="text-slate-400" />
        </div>
      </div>

      <button className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-slate-50">
        <div className="text-right">
          <p className="max-w-[240px] truncate text-sm font-medium text-slate-700">{GST_COMPANY.shortName}</p>
          <p className="text-[11px] text-slate-500">{GST_COMPANY.period}</p>
        </div>
        <ChevronDown size={16} className="text-slate-500" />
      </button>
    </div>
  );

  const renderAuditActions = () => {
    if (detailContext) {
      return null;
    }

    return (
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-8">
          {GST_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setDetailContext(null);
                setOpenActionMenu(null);
                if (tab === 'GSTR2B') {
                  setSelectedFilters(['Not In Tally']);
                  setSelectedRowIds([]);
                  setBulkStatus('');
                  setPage(1);
                }
                navigateToGst({
                  activeTab: tab,
                  gstr1View: tab === 'GSTR1' ? 'data-prepare' : undefined,
                  gstr3bView: tab === 'GSTR3B' ? 'summary-data' : undefined,
                });
              }}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 py-2">
          {activeTab === 'Overview' ? (
            <>
              <button
                type="button"
                onClick={() => setOpenModal('overview-connect')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
              >
                <CloudUpload size={18} />
              </button>
              {overviewConnected ? (
                <span className="px-2 text-sm font-semibold text-slate-800">Last Sync Date : 28-02-2024</span>
              ) : null}
              <div className="inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <span className="text-sm text-slate-600">Financial Year:</span>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                    className="appearance-none bg-transparent pr-8 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {FINANCIAL_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncOverview}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <RefreshCcw size={16} />
                Sync
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
              >
                <Settings2 size={18} />
              </button>
            </>
          ) : activeTab === 'GSTR1' ? (
            <>
              <div className="inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <span className="text-sm text-slate-600">Financial Year:</span>
                <div className="relative">
                  <select
                    value={gstr1Year}
                    onChange={(event) => setGstr1Year(event.target.value)}
                    className="appearance-none bg-transparent pr-8 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {FINANCIAL_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <span className="text-sm text-slate-600">Period:</span>
                <div className="relative">
                  <select
                    value={gstr1SelectedPeriod}
                    onChange={(event) => {
                      setGstr1SelectedPeriod(event.target.value);
                      setGstr1DraftPeriod(event.target.value);
                    }}
                    className="appearance-none bg-transparent pr-8 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {GSTR1_PERIOD_OPTIONS.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              {gstr1View === 'corrections' ? (
                <>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                    Correction Workbench
                  </span>
                  <button
                    type="button"
                    onClick={handleExitGstr1Workbench}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <ArrowLeft size={16} />
                    Back to Data Prepare
                  </button>
                </>
              ) : null}
            </>
          ) : activeTab === 'GSTR3B' ? (
            <>
              <div className="inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <span className="text-sm text-slate-600">Financial Year:</span>
                <div className="relative">
                  <select
                    value={gstr3bYear}
                    onChange={(event) => setGstr3bYear(event.target.value)}
                    className="appearance-none bg-transparent pr-8 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {FINANCIAL_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <span className="text-sm text-slate-600">Period:</span>
                <div className="relative">
                  <select
                    value={gstr3bSelectedPeriod}
                    onChange={(event) => setGstr3bSelectedPeriod(event.target.value)}
                    className="appearance-none bg-transparent pr-8 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {GSTR3B_PERIOD_OPTIONS.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
                <span className="text-sm text-slate-600">Financial Year:</span>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                    className="appearance-none bg-transparent pr-8 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {FINANCIAL_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncOverview}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <RefreshCcw size={16} />
                Sync
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderReturnTracker = () => (
    <section className="overflow-visible rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="border-l-[3px] border-blue-500 pl-3 text-[18px] font-semibold text-slate-900">Return Filing Tracker</h2>
      </div>

      <div className="overflow-x-auto overflow-y-visible px-5 py-5">
        <div className="min-w-[1080px]">
          <div className="grid grid-cols-[170px_repeat(12,minmax(64px,1fr))] gap-y-6 text-center text-sm font-medium text-slate-500">
            <div className="text-left">Return Type</div>
            {RETURN_MONTHS.map((month) => (
              <div key={month}>{month}</div>
            ))}

            {activeTracker.map((row) => (
              <React.Fragment key={row.label}>
                <div className="flex items-center text-left text-[15px] font-semibold text-slate-700">{row.label}</div>
                {row.cells.map((cell) => (
                  <div key={`${row.label}-${cell.month}`} className="relative flex justify-center">
                    <div
                      className="relative"
                      onMouseEnter={(event) => handleShowTrackerTooltip(cell, event)}
                      onMouseLeave={handleHideTrackerTooltip}
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                          cell.state === 'filed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {cell.state === 'filed' ? <CheckCircle2 size={20} /> : <CircleSlash size={18} />}
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderReconciliationCard = () => (
    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="border-l-[3px] border-blue-500 pl-3 text-[18px] font-semibold text-slate-900">Reconciliation Status</h2>
      </div>

      <div className="max-h-[420px] overflow-auto px-5 py-4">
        <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              <th className="pb-2">Month</th>
              <th className="pb-2">GSTR vs Books</th>
              <th className="pb-2">2A vs Books</th>
              <th className="pb-2">2B vs Books</th>
            </tr>
          </thead>
          <tbody>
            {RECONCILIATION_ROWS.map((row) => (
              <tr key={row.month} className="rounded-xl bg-slate-50 text-slate-700">
                <td className="rounded-l-xl px-3 py-3 font-medium">{row.month}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold ${getReconciliationTone(row.gstrVsBooks)}`}>
                    {row.gstrVsBooks}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold ${getReconciliationTone(row.twoAVsBooks)}`}>
                    {row.twoAVsBooks}
                  </span>
                </td>
                <td className="rounded-r-xl px-3 py-3">
                  <span className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold ${getReconciliationTone(row.twoBVsBooks)}`}>
                    {row.twoBVsBooks}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderAnnouncementsCard = () => (
    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="border-l-[3px] border-blue-500 pl-3 text-[18px] font-semibold text-slate-900">Announcements</h2>
      </div>

      <div className="space-y-3 px-5 py-4">
        {ANNOUNCEMENTS.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-700">{item.date}</p>
                  <p className="mt-1 max-w-[42ch] text-sm leading-6 text-slate-500">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.note}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${
                    item.tag === 'Circular'
                      ? 'bg-lime-500'
                      : item.tag === 'Notification'
                        ? 'bg-sky-500'
                        : 'bg-amber-500'
                  }`}
                >
                  {item.tag}
                </span>
                <ExternalLink size={16} className="text-blue-500" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderBottomSummary = () => (
    <div>
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="border-l-[3px] border-blue-500 pl-3 text-[18px] font-semibold text-slate-900">Net Tax Liability</h2>
          <span className="text-sm font-medium text-slate-500">(Output- Input)</span>
        </div>
        <div className="space-y-4 px-5 py-5">
          {LIABILITY_BARS.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-800">{item.amount}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full ${item.tone}`} style={{ width: `${item.width}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-5">
      {renderReturnTracker()}
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {renderAnnouncementsCard()}
        {renderBottomSummary()}
      </div>
    </div>
  );

  const renderGstr1Table = () => {
    const stepItems: Array<{ view: Extract<Gstr1View, 'data-prepare' | 'check-invoices' | 'push-to-gstn' | 'file-gstr1'>; label: string; number: string }> = [
      { view: 'data-prepare', label: 'Data Prepare', number: '1' },
      { view: 'check-invoices', label: 'Check Invoices', number: '2' },
      { view: 'push-to-gstn', label: 'Push to GSTN', number: '3' },
      { view: 'file-gstr1', label: 'File GSTR-1', number: '4' },
    ];
    const currentStepIndex = stepItems.findIndex((item) => item.view === gstr1View);

    const renderStepper = () => (
      <div className="flex flex-wrap gap-3">
        {stepItems.map((item, index) => {
          const isActive = gstr1View === item.view;
          const isDone = currentStepIndex > index;

          return (
            <button
              key={item.view}
              type="button"
              onClick={() => navigateToGst({ activeTab: 'GSTR1', gstr1View: item.view })}
              className={`flex min-w-[164px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'border-blue-200 bg-blue-50'
                  : isDone
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {item.number}
              </span>
              <span className="text-sm font-semibold text-slate-700">{item.label}</span>
            </button>
          );
        })}
      </div>
    );

    const renderPrepareValueTable = ({
      title,
      rows,
      showSelectAll = false,
      onEdit,
    }: {
      title: string;
      rows: Gstr1PrepareRow[] | Gstr1InvoiceSectionRow[];
      showSelectAll?: boolean;
      onEdit: (row: Gstr1PrepareRow | Gstr1InvoiceSectionRow) => void;
    }) => (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {showSelectAll ? <th className="px-5 py-4">Select All</th> : null}
                <th className="px-5 py-4">Type of Invoice</th>
                <th className="px-5 py-4">Documents</th>
                <th className="px-5 py-4">Taxable Amount</th>
                <th className="px-5 py-4">IGST</th>
                <th className="px-5 py-4">CGST</th>
                <th className="px-5 py-4">SGST</th>
                <th className="px-5 py-4">CESS</th>
                <th className="px-5 py-4">Tax Amount</th>
                <th className="px-5 py-4">Invoice Value</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.title} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                  {showSelectAll ? (
                    <td className="px-5 py-4">
                      <button type="button" className="flex h-4 w-4 rounded border border-slate-300 bg-white" />
                    </td>
                  ) : null}
                  <td className="px-5 py-4 font-medium text-slate-800">{row.title}</td>
                  <td className="px-5 py-4 text-slate-600">{row.documents}</td>
                  <td className="px-5 py-4 text-slate-600">{row.taxableAmount}</td>
                  <td className="px-5 py-4 text-slate-600">{row.igst}</td>
                  <td className="px-5 py-4 text-slate-600">{row.cgst}</td>
                  <td className="px-5 py-4 text-slate-600">{row.sgst}</td>
                  <td className="px-5 py-4 text-slate-600">{row.cess}</td>
                  <td className="px-5 py-4 text-slate-600">{row.taxAmount}</td>
                  <td className="px-5 py-4 text-slate-600">{row.invoiceValue}</td>
                  <td className="px-5 py-4">
                    {row.editable ? (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        Edit
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );

    const renderDataPrepare = () => (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">GSTR-1 Workflow</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                GSTR-1 Data Prepare | {gstr1SelectedPeriod}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOpenModal('gstr1-nil-return')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                File Nil Return
              </button>
              <button
                type="button"
                onClick={() => handleOpenGstr1AddInvoice('data-prepare')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Add Invoice
              </button>
              <button
                type="button"
                onClick={handleOpenGstr1Import}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Import Your Data
              </button>
            </div>
          </div>
        </section>

        {renderStepper()}

        {renderPrepareValueTable({
          title: 'Frequently used section',
          rows: [...GSTR1_FREQUENT_ROWS, GSTR1_TOTAL_ROW, ...GSTR1_HSN_ROWS],
          onEdit: (row) => {
            if (row.title.includes('Credit/Debit')) {
              handleOpenGstr1SectionReview('Credit / Debit Note');
            } else if (row.title.includes('Export')) {
              handleOpenGstr1SectionReview('Export');
            } else if (row.title.includes('B2C')) {
              handleOpenGstr1SectionReview('B2CS');
            } else {
              handleOpenGstr1SectionReview('Invoice');
            }
          },
        })}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-900">GSTR-1 Other Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Nature Of Document</th>
                  <th className="px-5 py-4">Count of Documents</th>
                  <th className="px-5 py-4">Cancelled Docs</th>
                  <th className="px-5 py-4">Net Issued Docs</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {GSTR1_OTHER_DETAIL_ROWS.map((row) => (
                  <tr key={row.title} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-medium text-slate-800">{row.title}</td>
                    <td className="px-5 py-4 text-slate-600">{row.countOfDocuments}</td>
                    <td className="px-5 py-4 text-slate-600">{row.cancelledDocs}</td>
                    <td className="px-5 py-4 text-slate-600">{row.netIssuedDocs}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleOpenGstr1Workbench('document-gap')}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {renderPrepareValueTable({
          title: 'Invoice level details',
          rows: GSTR1_INVOICE_LEVEL_ROWS,
          showSelectAll: true,
          onEdit: (row) => {
            if (row.title.includes('Credit/Debit')) {
              handleOpenGstr1SectionReview('Credit / Debit Note');
            } else if (row.title.includes('B2C')) {
              handleOpenGstr1SectionReview('B2CS');
            } else if (row.title.includes('Export')) {
              handleOpenGstr1SectionReview('Export');
            } else {
              handleOpenGstr1SectionReview('Invoice');
            }
          },
        })}

        {renderPrepareValueTable({
          title: 'Amendments details',
          rows: GSTR1_AMENDMENT_ROWS,
          showSelectAll: true,
          onEdit: () => handleOpenGstr1AddAmendment(),
        })}

        <button
          type="button"
          onClick={() => setStatusMessage('Guide on Amendments and error message guide opened.')}
          className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Download size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Download Guide on Amendments</h3>
            <p className="mt-1 text-sm text-slate-500">Guide on Amendments and list of error messages with solution</p>
          </div>
        </button>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Previously Filed GSTR-1</h3>
              <p className="mt-1 text-sm text-slate-500">Keep older filed returns visible with ARN and filing date for audit reference.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
              {gstr1Periods.filter((period) => period.status === 'Filed').length} filed earlier
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Sr.No.</th>
                  <th className="px-5 py-4">Return Period</th>
                  <th className="px-5 py-4">Filed On</th>
                  <th className="px-5 py-4">ARN</th>
                  <th className="px-5 py-4">Invoice Count</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {gstr1Periods.map((period, index) => (
                  <tr key={period.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                    <td className="px-5 py-4 text-slate-600">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-slate-800">{period.month}</td>
                    <td className="px-5 py-4 text-slate-600">{period.lastSyncDate}</td>
                    <td className="px-5 py-4 font-medium text-blue-600">{makeGstr1Arn(period, index)}</td>
                    <td className="px-5 py-4 text-slate-600">{period.totalInvoice}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-md px-3 py-1.5 text-xs font-semibold ${getPeriodStatusTone(period.status)}`}>
                        {period.status === 'Complete' ? 'Ready to Review' : period.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigateToGst({ activeTab: 'GSTR1', gstr1View: 'check-invoices', gstr1CheckTab: gstr1CheckTab })}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    );

    const renderCheckInvoices = () => (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">GSTR-1 Workflow</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                GSTR-1 Check Invoices | {gstr1SelectedPeriod}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOpenGstr1AddAmendment}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Add Amendment Invoice
              </button>
              <button
                type="button"
                onClick={() => handleOpenGstr1AddInvoice('check-invoices')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Add Invoice
              </button>
            </div>
          </div>
        </section>

        {renderStepper()}

        <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600">
                {GSTR1_CHECK_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => navigateToGst({ activeTab: 'GSTR1', gstr1View: 'check-invoices', gstr1CheckTab: tab })}
                    className={`border-b-2 pb-2 transition-colors ${
                      gstr1CheckTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGstr1ColumnSearchVisible((current) => !current)}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50"
                  aria-label="Toggle column filters"
                >
                  <Search size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setGstr1ColumnChooserVisible((current) => !current)}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50"
                  aria-label="Show or hide columns"
                >
                  <Settings2 size={16} />
                </button>
                {gstr1ColumnChooserVisible ? (
                  <div className="absolute right-0 top-full z-20 mt-2 w-[280px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Visible Columns</p>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <button type="button" onClick={() => handleSetAllGstr1CheckColumns(false)} className="text-slate-500 hover:text-slate-700">
                          Hide all
                        </button>
                        <button type="button" onClick={() => handleSetAllGstr1CheckColumns(true)} className="text-blue-600 hover:text-blue-700">
                          Show all
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      {GSTR1_CHECK_COLUMNS.map((column) => (
                        <label key={column.key} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={gstr1VisibleCheckColumns[column.key]}
                            onChange={() => handleToggleGstr1CheckColumnVisibility(column.key)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-b border-slate-100 px-5 py-4 md:grid-cols-4 xl:grid-cols-7">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total Transactions</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{gstr1DisplayedCheckTotals.transactions}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Taxable Amount</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹{formatNumberAmount(gstr1DisplayedCheckTotals.taxable)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total IGST</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹{formatNumberAmount(gstr1DisplayedCheckTotals.totalTax)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total SGST</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹0.00</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total CGST</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹0.00</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total CESS</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹0.00</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total Amount</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹{formatNumberAmount(gstr1DisplayedCheckTotals.totalAmount)}</p>
            </div>
          </div>

          <div className="overflow-x-auto px-5 py-5">
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-3 py-4">
                    <button
                      type="button"
                      onClick={handleToggleAllGstr1CheckRows}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                        gstr1FilteredCheckRows.length > 0 && gstr1FilteredCheckRows.every((row) => gstr1SelectedCheckRowIds.includes(row.id))
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-transparent hover:border-blue-400'
                      }`}
                      aria-label="Select all invoice rows"
                    >
                      <Check size={12} />
                    </button>
                  </th>
                  {gstr1ActiveVisibleCheckColumns.map((column) => (
                    <th key={column.key} className="px-3 py-4">
                      {column.label}
                    </th>
                  ))}
                </tr>
                {gstr1ColumnSearchVisible ? (
                  <tr className="border-b border-slate-200 text-[11px] font-normal normal-case tracking-normal text-slate-500">
                    <th className="px-3 py-3"></th>
                    {gstr1ActiveVisibleCheckColumns.map((column) => (
                      <th key={column.key} className="px-3 py-3">
                        <input
                          value={gstr1CheckColumnFilters[column.key]}
                          onChange={(event) => handleUpdateGstr1CheckColumnFilter(column.key, event.target.value)}
                          placeholder={column.filterPlaceholder}
                          className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                        />
                      </th>
                    ))}
                  </tr>
                ) : (
                  <tr className="border-b border-slate-200">
                    <th colSpan={gstr1ActiveVisibleCheckColumns.length + 1}></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {gstr1FilteredCheckRows.length === 0 ? (
                  <tr>
                    <td colSpan={gstr1ActiveVisibleCheckColumns.length + 1} className="px-3 py-10 text-center text-sm text-slate-500">
                      No invoices match the current column filters.
                    </td>
                  </tr>
                ) : (
                  gstr1FilteredCheckRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleToggleGstr1CheckRow(row.id)}
                      className={`cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 ${
                        gstr1SelectedCheckRowIds.includes(row.id) ? 'bg-blue-50/70' : ''
                      }`}
                    >
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleToggleGstr1CheckRow(row.id);
                          }}
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                            gstr1SelectedCheckRowIds.includes(row.id)
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white text-transparent hover:border-blue-400'
                          }`}
                          aria-label={`Select invoice ${row.invoiceNumber}`}
                        >
                          <Check size={12} />
                        </button>
                      </td>
                      {gstr1ActiveVisibleCheckColumns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-3 py-4 ${
                            column.key === 'invoiceNumber' ? 'font-medium text-slate-800' : 'text-slate-600'
                          } ${column.key === 'customer' ? 'text-slate-700' : ''}`}
                        >
                          {row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => navigateToGst({ activeTab: 'GSTR1', gstr1View: 'data-prepare' })}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Previous
            </button>
            <div className="flex flex-wrap items-center justify-center gap-2 px-4">
              <button
                type="button"
                disabled={gstr1SelectedCheckRows.length === 0}
                onClick={handleOpenGstr1EditSelected}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit Selected Items
              </button>
              <button
                type="button"
                disabled={gstr1SelectedCheckRows.length === 0}
                onClick={() => handleUpdateSelectedGstr1RowStatus('Uploaded to GSTN.', 'marked as uploaded')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark as Uploaded
              </button>
              <button
                type="button"
                disabled={gstr1SelectedCheckRows.length === 0}
                onClick={() => handleUpdateSelectedGstr1RowStatus('Pending for Upload.', 'marked as not uploaded')}
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark as Not Uploaded
              </button>
              <button
                type="button"
                disabled={!gstr1CanMarkFiled}
                onClick={() => handleUpdateSelectedGstr1RowStatus('Filed on GST portal.', 'marked as filed')}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark as Filed
              </button>
              <button
                type="button"
                disabled={gstr1SelectedCheckRows.length === 0}
                onClick={handleDeleteSelectedGstr1Rows}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete selected Items
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigateToGst({ activeTab: 'GSTR1', gstr1View: 'push-to-gstn' })}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    );

    const renderPushToGstn = () => {
      const renderPushTable = (title: string, rows: Gstr1PushTableRow[]) => (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <button type="button" className="w-full text-left text-base font-semibold text-slate-900">
              {title}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Type of Invoice</th>
                  <th className="px-4 py-3">To Be Uploaded</th>
                  <th className="px-4 py-3">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.title} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.title}</td>
                    <td className="px-4 py-3">
                      {row.href && row.toBeUploaded !== '0' && row.toBeUploaded !== '0.00' ? (
                        <button
                          type="button"
                          onClick={() => router.push(row.href!)}
                          className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                        >
                          {row.toBeUploaded}
                        </button>
                      ) : (
                        <span className="text-slate-600">{row.toBeUploaded}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.uploaded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );

      return (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">GSTR-1 Workflow</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                  GSTR-1 Push to GSTN | {gstr1SelectedPeriod}
                </h2>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setGstr1MoreOptionOpen((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  More Option
                  <ChevronDown size={16} />
                </button>
                {gstr1MoreOptionOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-2 w-[220px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusMessage('Government summary preview opened.');
                        setGstr1MoreOptionOpen(false);
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Preview Govt Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGstr1UploadStarted(false);
                        setStatusMessage('GSTN upload state was reset.');
                        setGstr1MoreOptionOpen(false);
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Reset GSTN data
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {renderStepper()}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="radio"
                  checked={gstr1PushMode === 'without-otp'}
                  onChange={() => setGstr1PushMode('without-otp')}
                />
                Upload without OTP
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input type="radio" checked={gstr1PushMode === 'via-otp'} onChange={() => setGstr1PushMode('via-otp')} />
                Upload via OTP
              </label>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleRunGstr1Upload}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <CloudUpload size={16} />
                    Upload Data to GSTN
                  </button>
                  <button
                    type="button"
                    disabled={!gstr1UploadStarted}
                    onClick={() => setStatusMessage('Government summary preview opened.')}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Preview Govt Summary
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-start gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[10px] border-slate-200 bg-white text-xl font-semibold text-slate-700">
                    {gstr1PushProgressPercent}%
                  </div>
                  <div className="flex-1 space-y-3 text-sm text-slate-600">
                    {['Connect to GSTN', 'Save Data on GSTN', 'Upload Processed Successfully', 'Summary Generated'].map((step) => (
                      <div key={step} className="flex items-center gap-3">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full ${
                            gstr1UploadStarted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {gstr1UploadStarted ? <Check size={12} /> : <CircleSlash size={12} />}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-slate-900">Want to delete existing data from GSTN?</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={!gstr1UploadStarted}
                    onClick={() => {
                      setGstr1UploadStarted(false);
                      setStatusMessage('GSTN upload state was reset.');
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset GSTN data
                  </button>
                  <button
                    type="button"
                    disabled={!gstr1UploadStarted}
                    onClick={() => setStatusMessage('GSTN summary was re-generated successfully.')}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Re-Generate Summary
                  </button>
                  <button
                    type="button"
                    disabled={!gstr1UploadStarted}
                    onClick={() => navigateToGst({ activeTab: 'GSTR1', gstr1View: 'file-gstr1' })}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                  >
                    Proceed to File
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700">
              <Info size={16} />
              <span>Important Advisory Changes to GSTR-1 / IFF filing process by the Govt. Portal.</span>
            </div>

            <div className="mt-5 space-y-5">
              {renderPushTable('Document level details that would be uploaded to GSTN:', gstr1DocumentUploadRows)}
              {renderPushTable('Summary level details that would be uploaded to GSTN:', gstr1SummaryUploadRows)}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <button type="button" className="w-full text-left text-base font-semibold text-slate-900">
                    Upload History
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Requested Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3">Upload Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstr1UploadStarted ? (
                        <tr className="border-b border-slate-100 last:border-b-0">
                          <td className="px-4 py-4 text-slate-600">15-04-2026 11:38 AM</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Summary Generated
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600">Preview</td>
                          <td className="px-4 py-4 text-slate-600">
                            {gstr1DocumentUploadRows.filter((row) => row.toBeUploaded !== '0').length} sections prepared for GSTN upload
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {gstr1PushMode === 'without-otp' ? 'Upload without OTP' : 'Upload via OTP'}
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                            There are no records to display
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="mt-5 flex justify-start">
              <button
                type="button"
                onClick={() => navigateToGst({ activeTab: 'GSTR1', gstr1View: 'check-invoices', gstr1CheckTab: gstr1CheckTab })}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Previous
              </button>
            </div>
          </section>
        </div>
      );
    };

    const renderFileGstr1 = () => (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">GSTR-1 Workflow</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              GSTR-1 File GSTR-1 | {gstr1SelectedPeriod}
            </h2>
          </div>
        </section>

        {renderStepper()}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="radio"
                checked={gstr1FileMode === 'without-otp'}
                onChange={() => setGstr1FileMode('without-otp')}
              />
              Upload without OTP
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input type="radio" checked={gstr1FileMode === 'via-otp'} onChange={() => setGstr1FileMode('via-otp')} />
              Upload via OTP
            </label>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">GST Portal User name *</label>
              <input
                value={gstr1PortalUsername}
                onChange={(event) => setGstr1PortalUsername(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">GST Authorized PAN *</label>
              <select
                value={gstr1AuthorizedPan}
                onChange={(event) => setGstr1AuthorizedPan(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
              >
                <option>Juned Rahim Sayyed</option>
                <option>Rahim Sayyed</option>
              </select>
            </div>
            <div className="self-end">
              <button
                type="button"
                onClick={handleGetPanFromPortal}
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                Get pan number from portal
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
            <h3 className="text-xl font-semibold text-slate-900">Submit and File GSTR-1 Returns for {gstr1SelectedPeriod}</h3>
            <p className="mt-2 text-sm text-slate-500">You will need a One Time Password (OTP) for this</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!gstr1UploadStarted}
                onClick={() => handleFileGstr1Return('EVC')}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                File with EVC
              </button>
              <button
                type="button"
                disabled={!gstr1UploadStarted}
                onClick={() => handleFileGstr1Return('DSC')}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                File with DSC
              </button>
            </div>
          </div>

          <div className="mt-5 flex justify-start">
            <button
              type="button"
              onClick={() => navigateToGst({ activeTab: 'GSTR1', gstr1View: 'push-to-gstn' })}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Previous
            </button>
          </div>
        </section>
      </div>
    );

    const renderImportData = () => (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">GSTR-1 Workflow</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                Import Data | {gstr1SelectedPeriod}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage('Template selection help opened.')}
              className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              Help for template Selection
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Import Sales Data</h3>
            <p className="mt-2 text-sm text-slate-500">You can choose any option for import your data</p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {GSTR1_IMPORT_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelectGstr1ImportOption(option.key)}
                className={`rounded-2xl border p-5 text-left transition-colors ${
                  gstr1ImportOption === option.key
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-900">{option.title}</h4>
                  {option.beta ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                      Beta
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">{option.description}</p>
              </button>
            ))}
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Coming Soon
              </span>
              <h4 className="mt-4 text-base font-semibold text-slate-900">Custom Excel Template</h4>
              <p className="mt-3 text-sm leading-6 text-slate-500">Import data prepared on your own Excel template</p>
            </div>
          </div>
        </section>
      </div>
    );

    const renderAddInvoicePage = () => (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">GSTR-1 Workflow</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                {gstr1EntryMode === 'edit' ? 'Edit Invoice' : 'Add Invoice'}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">Doc Type :</span>
                <select
                  value={gstr1DocType}
                  onChange={(event) => setGstr1DocType(event.target.value as Gstr1DocType)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                >
                  {GSTR1_DOC_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddInvoiceRow}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                Add Row
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Count of Documents</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{gstr1AddInvoiceSummary.documents}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                {GSTR1_DOC_TYPE_SUMMARY_LABELS[gstr1DocType]?.second ?? 'Taxable Amount'}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                ₹
                {formatNumberAmount(
                  gstr1DocType === 'Advanced Received'
                    ? gstr1ActiveDocSummary.totalAdvanced
                    : gstr1DocType === 'HSN'
                      ? gstr1ActiveDocSummary.totalValue
                      : gstr1DocType === 'Docs'
                        ? gstr1ActiveDocSummary.totalDocs
                        : gstr1AddInvoiceSummary.taxable,
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                {GSTR1_DOC_TYPE_SUMMARY_LABELS[gstr1DocType]?.third ?? 'Tax Amount'}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                ₹
                {formatNumberAmount(
                  gstr1DocType === 'Docs'
                    ? gstr1ActiveDocSummary.totalCancelled
                    : gstr1DocType === 'Advanced Received'
                      ? 0
                      : gstr1DocType === 'HSN'
                        ? gstr1AddInvoiceSummary.taxable
                        : gstr1AddInvoiceSummary.tax,
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                {GSTR1_DOC_TYPE_SUMMARY_LABELS[gstr1DocType]?.fourth ?? 'Invoice Value'}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                ₹
                {formatNumberAmount(
                  gstr1DocType === 'Docs'
                    ? gstr1ActiveDocSummary.totalNetIssued
                    : gstr1DocType === 'Advanced Received'
                      ? 0
                      : gstr1DocType === 'HSN'
                        ? gstr1ActiveDocSummary.totalTaxComponents
                        : gstr1AddInvoiceSummary.invoiceValue,
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1320px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-3 py-4"></th>
                  <th className="px-3 py-4">Sr.No.</th>
                  {gstr1ActiveDocColumns.map((column) => (
                    <th key={column.key} className="px-3 py-4">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gstr1AddRows.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3">
                      <button type="button" className="flex h-4 w-4 rounded border border-slate-300 bg-white" />
                    </td>
                    <td className="px-3 py-3 text-slate-600">{index + 1}</td>
                    {gstr1ActiveDocColumns.map((column) => (
                      <td key={column.key} className="px-3 py-3">
                        <input
                          value={row[column.key]}
                          onChange={(event) => handleUpdateGstr1AddRow(row.id, column.key, event.target.value)}
                          className="h-10 w-full min-w-[120px] rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => handleReturnFromGstr1Entry()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button type="button" disabled className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-400">
              Delete Items
            </button>
            <button
              type="button"
              disabled={!gstr1CanSaveDraft}
              onClick={handleSaveGstr1DraftRows}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save & Verify
            </button>
          </div>
        </section>
      </div>
    );

    const renderAddAmendmentPage = () => (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">GSTR-1 Workflow</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">Add Amendment Invoice</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">Doc Type :</span>
                <select
                  value={gstr1AmendmentDocType}
                  onChange={(event) => setGstr1AmendmentDocType(event.target.value as Gstr1AmendmentDocType)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                >
                  {GSTR1_AMENDMENT_DOC_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddAmendmentRow}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                Add Row
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Count of Documents</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{Math.max(gstr1AmendmentSummary.documents, 5)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Taxable Amount</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹{formatNumberAmount(gstr1AmendmentSummary.taxable)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Tax Amount</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹{formatNumberAmount(gstr1AmendmentSummary.tax)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Invoice Value</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹{formatNumberAmount(gstr1AmendmentSummary.invoiceValue)}</p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1320px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-3 py-4"></th>
                  <th className="px-3 py-4">Sr.No.</th>
                  {gstr1ActiveAmendmentColumns.map((column) => (
                    <th key={column.key} className="px-3 py-4">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gstr1AmendmentRows.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3">
                      <button type="button" className="flex h-4 w-4 rounded border border-slate-300 bg-white" />
                    </td>
                    <td className="px-3 py-3 text-slate-600">{index + 1}</td>
                    {gstr1ActiveAmendmentColumns.map((column) => (
                      <td key={column.key} className="px-3 py-3">
                        <input
                          value={row[column.key]}
                          onChange={(event) => handleUpdateGstr1AmendmentRow(row.id, column.key, event.target.value)}
                          className="h-10 w-full min-w-[120px] rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => handleReturnFromGstr1Entry()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button type="button" disabled className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-400">
              Delete Items
            </button>
            <button
              type="button"
              disabled={!gstr1CanSaveAmendment}
              onClick={() => {
                setStatusMessage('Amendment invoice rows saved and verified.');
                handleReturnFromGstr1Entry();
              }}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save & Verify
            </button>
          </div>
        </section>
      </div>
    );

    switch (gstr1View) {
      case 'check-invoices':
        return renderCheckInvoices();
      case 'push-to-gstn':
        return renderPushToGstn();
      case 'file-gstr1':
        return renderFileGstr1();
      case 'import-data':
        return renderImportData();
      case 'add-invoice':
        return renderAddInvoicePage();
      case 'add-amendment':
        return renderAddAmendmentPage();
      default:
        return renderDataPrepare();
    }
  };

  const renderGstr1Workbench = () => {
    const activeIssueMeta = GSTR1_ISSUE_META[gstr1ActiveIssueType];

    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={handleExitGstr1Workbench}
                className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-blue-600 transition-colors hover:bg-blue-50"
              >
                <ArrowLeft size={22} />
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">GSTR1 Correction Workbench</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">Resolve Filing Blockers Before Submit</h2>
                <p className="mt-3 max-w-[74ch] text-sm leading-7 text-slate-500">
                  This queue lets you correct Customer GSTIN, note linkage, and document-series issues in the same GST
                  draft before filing. GSTIN fixes can update both the draft and the customer master.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Draft Period</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{gstr1DraftPeriod}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Resolved</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{gstr1ResolvedCount}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">Remaining</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{gstr1RemainingCount}</p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveGstr1Correction('draft-master', true)}
                disabled={!gstr1SelectedCorrection}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Save & Next Issue
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Correction Buckets</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Switch between issue groups and review what is still open in each bucket.</p>
              <div className="mt-5 space-y-3">
                {gstr1IssueBuckets.map((bucket) => (
                  <button
                    key={bucket.issueType}
                    type="button"
                    onClick={() => handleSwitchGstr1IssueType(bucket.issueType)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                      gstr1ActiveIssueType === bucket.issueType
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{bucket.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{bucket.description}</p>
                      </div>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${bucket.tone}`}>
                        {bucket.open} open
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>{bucket.resolved} resolved</span>
                      <span>{bucket.total} total</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Update Scope</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                GSTIN corrections should update both the current draft and the customer master by default. Other issue
                types update the filing draft only.
              </p>
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-700">
                Primary save action: <span className="font-semibold">Draft + Customer Master</span>
              </div>
            </section>
          </aside>

          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">{activeIssueMeta.sectionCode}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{activeIssueMeta.label} Queue</h3>
                  <p className="mt-1 text-sm text-slate-500">{activeIssueMeta.description}</p>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${activeIssueMeta.tone}`}>
                  {gstr1IssueCounts[gstr1ActiveIssueType].open} open / {gstr1IssueCounts[gstr1ActiveIssueType].resolved} resolved
                </span>
              </div>

              <div className="overflow-x-auto">
                {gstr1ActiveIssueType === 'gstin' ? (
                  <table className="w-full min-w-[1040px] text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      <tr>
                        <th className="px-5 py-4 text-left">Invoice No.</th>
                        <th className="px-5 py-4 text-left">Invoice Date</th>
                        <th className="px-5 py-4 text-left">Party Name</th>
                        <th className="px-5 py-4 text-left">Current GSTIN</th>
                        <th className="px-5 py-4 text-left">Section</th>
                        <th className="px-5 py-4 text-left">Error Reason</th>
                        <th className="px-5 py-4 text-left">Last Updated</th>
                        <th className="px-5 py-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstr1FilteredCorrections.map((record) => (
                        <tr
                          key={record.id}
                          onClick={() => setGstr1SelectedCorrectionId(record.id)}
                          className={`cursor-pointer border-b border-slate-100 last:border-b-0 ${
                            gstr1SelectedCorrectionId === record.id ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="px-5 py-4 font-medium text-slate-800">{record.invoiceNo}</td>
                          <td className="px-5 py-4 text-slate-600">{record.invoiceDate}</td>
                          <td className="px-5 py-4 text-slate-700">{record.partyName}</td>
                          <td className="px-5 py-4 text-slate-600">{record.currentGstin || 'Missing'}</td>
                          <td className="px-5 py-4 text-slate-600">{record.sectionCode}</td>
                          <td className="px-5 py-4 text-slate-600">{record.errorReason}</td>
                          <td className="px-5 py-4 text-slate-500">{record.lastUpdated}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getGstr1CorrectionStatusTone(record.status)}`}>
                              {record.status === 'resolved' ? 'Resolved' : 'Open'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : gstr1ActiveIssueType === 'credit-note-linkage' ? (
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      <tr>
                        <th className="px-5 py-4 text-left">Note No.</th>
                        <th className="px-5 py-4 text-left">Note Date</th>
                        <th className="px-5 py-4 text-left">Customer</th>
                        <th className="px-5 py-4 text-left">Taxable Value</th>
                        <th className="px-5 py-4 text-left">Current Linked Invoice</th>
                        <th className="px-5 py-4 text-left">Expected Invoice</th>
                        <th className="px-5 py-4 text-left">Last Updated</th>
                        <th className="px-5 py-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstr1FilteredCorrections.map((record) => (
                        <tr
                          key={record.id}
                          onClick={() => setGstr1SelectedCorrectionId(record.id)}
                          className={`cursor-pointer border-b border-slate-100 last:border-b-0 ${
                            gstr1SelectedCorrectionId === record.id ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="px-5 py-4 font-medium text-slate-800">{record.noteNo}</td>
                          <td className="px-5 py-4 text-slate-600">{record.noteDate}</td>
                          <td className="px-5 py-4 text-slate-700">{record.partyName}</td>
                          <td className="px-5 py-4 text-slate-600">{record.taxableValue}</td>
                          <td className="px-5 py-4 text-slate-600">{record.originalInvoiceRef || 'Not linked'}</td>
                          <td className="px-5 py-4 font-medium text-slate-800">{record.expectedInvoiceRef}</td>
                          <td className="px-5 py-4 text-slate-500">{record.lastUpdated}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getGstr1CorrectionStatusTone(record.status)}`}>
                              {record.status === 'resolved' ? 'Resolved' : 'Open'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      <tr>
                        <th className="px-5 py-4 text-left">Series</th>
                        <th className="px-5 py-4 text-left">Previous No.</th>
                        <th className="px-5 py-4 text-left">Missing No.</th>
                        <th className="px-5 py-4 text-left">Next No.</th>
                        <th className="px-5 py-4 text-left">Detected Reason</th>
                        <th className="px-5 py-4 text-left">Resolution</th>
                        <th className="px-5 py-4 text-left">Last Updated</th>
                        <th className="px-5 py-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstr1FilteredCorrections.map((record) => (
                        <tr
                          key={record.id}
                          onClick={() => setGstr1SelectedCorrectionId(record.id)}
                          className={`cursor-pointer border-b border-slate-100 last:border-b-0 ${
                            gstr1SelectedCorrectionId === record.id ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="px-5 py-4 font-medium text-slate-800">{record.seriesName}</td>
                          <td className="px-5 py-4 text-slate-600">{record.previousNumber}</td>
                          <td className="px-5 py-4 text-slate-700">{record.missingNumber}</td>
                          <td className="px-5 py-4 text-slate-600">{record.nextNumber}</td>
                          <td className="px-5 py-4 text-slate-600">{record.detectedReason}</td>
                          <td className="px-5 py-4 text-slate-600">{record.resolutionLabel || 'Pending resolution'}</td>
                          <td className="px-5 py-4 text-slate-500">{record.lastUpdated}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getGstr1CorrectionStatusTone(record.status)}`}>
                              {record.status === 'resolved' ? 'Resolved' : 'Open'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {gstr1SelectedCorrection ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">Correction Editor</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        {gstr1ActiveIssueType === 'gstin'
                          ? gstr1SelectedCorrection.partyName
                          : gstr1ActiveIssueType === 'credit-note-linkage'
                            ? gstr1SelectedCorrection.noteNo
                            : gstr1SelectedCorrection.seriesName}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-500">{gstr1SelectedCorrection.errorReason}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getGstr1CorrectionStatusTone(gstr1SelectedCorrection.status)}`}>
                      {gstr1SelectedCorrection.status === 'resolved' ? 'Resolved' : 'Pending Correction'}
                    </span>
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:grid-cols-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Reference</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{gstr1SelectedCorrection.invoiceNo}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Invoice Date</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{gstr1SelectedCorrection.invoiceDate}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Section</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{gstr1SelectedCorrection.sectionCode}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Last Updated</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{gstr1SelectedCorrection.lastUpdated}</p>
                    </div>
                  </div>

                  {gstr1ActiveIssueType === 'gstin' ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Customer Name</label>
                          <input
                            value={gstr1EditorState.customerName}
                            onChange={(event) => setGstr1EditorState((current) => ({ ...current, customerName: event.target.value }))}
                            className="h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">GST Number / GSTIN</label>
                          <div className="flex gap-3">
                            <input
                              value={gstr1EditorState.gstin}
                              onChange={(event) =>
                                setGstr1EditorState((current) => ({ ...current, gstin: event.target.value.toUpperCase() }))
                              }
                              placeholder="Enter GSTIN/UIN"
                              className="h-12 flex-1 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={handleFetchGstr1BusinessData}
                              className="rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              Get Data
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Registration Type</label>
                          <select
                            value={gstr1EditorState.registrationType}
                            onChange={(event) => setGstr1EditorState((current) => ({ ...current, registrationType: event.target.value }))}
                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                          >
                            {GSTR1_REGISTRATION_TYPES.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">State / Place of Supply</label>
                          <select
                            value={gstr1EditorState.placeOfSupply}
                            onChange={(event) => setGstr1EditorState((current) => ({ ...current, placeOfSupply: event.target.value }))}
                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                          >
                            {GSTR1_PLACE_OF_SUPPLY_OPTIONS.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">PAN</label>
                          <input
                            value={gstr1EditorState.pan}
                            onChange={(event) => setGstr1EditorState((current) => ({ ...current, pan: event.target.value.toUpperCase() }))}
                            placeholder="Enter PAN"
                            className="h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                          />
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Master Record</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {gstr1SelectedCustomerMaster?.gstin || 'No GSTIN stored in master'}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Save to Draft + Master will update this customer for future invoice drafts too.
                          </p>
                        </div>
                      </div>

                      {gstr1EditorState.lookupPreview ? (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">Fetched GST Business Preview</p>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-xs text-slate-500">Trade Name</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{gstr1EditorState.lookupPreview.tradeName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Business Name</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{gstr1EditorState.lookupPreview.businessName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Registration</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{gstr1EditorState.lookupPreview.registrationType}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">State</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{gstr1EditorState.lookupPreview.state}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
                        <textarea
                          value={gstr1EditorState.notes}
                          onChange={(event) => setGstr1EditorState((current) => ({ ...current, notes: event.target.value }))}
                          rows={4}
                          className="w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() => handleSaveGstr1Correction('draft-only')}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Save to Draft Only
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveGstr1Correction('draft-master')}
                          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          Save to Draft + Master
                        </button>
                      </div>
                    </>
                  ) : gstr1ActiveIssueType === 'credit-note-linkage' ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Credit Note Number</label>
                          <input
                            value={gstr1SelectedCorrection.noteNo || ''}
                            readOnly
                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Expected Original Invoice</label>
                          <input
                            value={gstr1EditorState.expectedInvoiceRef}
                            onChange={(event) => setGstr1EditorState((current) => ({ ...current, expectedInvoiceRef: event.target.value }))}
                            className="h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Select Original Invoice from Draft</label>
                          <select
                            value={gstr1EditorState.originalInvoiceRef}
                            onChange={(event) => setGstr1EditorState((current) => ({ ...current, originalInvoiceRef: event.target.value }))}
                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                          >
                            <option value="">Select original invoice</option>
                            {gstr1SelectedCorrection.candidateInvoiceRefs?.map((invoiceRef) => (
                              <option key={invoiceRef} value={invoiceRef}>
                                {invoiceRef}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Linkage Rule</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Use the original invoice that this note reverses, discounts, or corrects. CDNR clears only
                            when the original document reference is mapped correctly.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
                        <textarea
                          value={gstr1EditorState.notes}
                          onChange={(event) => setGstr1EditorState((current) => ({ ...current, notes: event.target.value }))}
                          rows={4}
                          className="w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() => handleSaveGstr1Correction('draft-master')}
                          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          Save Linkage
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-3">
                        {([
                          { value: 'mark-cancelled', label: 'Mark as Cancelled', description: 'Keep the gap but record that the missing number was intentionally cancelled.' },
                          { value: 'enter-missing-document', label: 'Enter Missing Document', description: 'Fill the missing sequence number with the correct document reference.' },
                          { value: 'ignore-with-reason', label: 'Ignore with Reason', description: 'Keep the gap but document why the sequence should remain unmatched.' },
                        ] as Array<{ value: Gstr1DocumentResolution; label: string; description: string }>).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setGstr1EditorState((current) => ({ ...current, resolutionAction: option.value }))}
                            className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                              gstr1EditorState.resolutionAction === option.value
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                            <p className="mt-2 text-xs leading-5 text-slate-500">{option.description}</p>
                          </button>
                        ))}
                      </div>

                      {gstr1EditorState.resolutionAction === 'enter-missing-document' ? (
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Missing Document Number</label>
                          <input
                            value={gstr1EditorState.missingDocumentNo}
                            onChange={(event) => setGstr1EditorState((current) => ({ ...current, missingDocumentNo: event.target.value }))}
                            placeholder="Enter the missing document reference"
                            className="h-12 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                          />
                        </div>
                      ) : null}

                      {gstr1EditorState.resolutionAction === 'ignore-with-reason' ? (
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">Reason for Ignoring Gap</label>
                          <textarea
                            value={gstr1EditorState.resolutionReason}
                            onChange={(event) => setGstr1EditorState((current) => ({ ...current, resolutionReason: event.target.value }))}
                            rows={3}
                            placeholder="Enter the documented reason for keeping the gap"
                            className="w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                          />
                        </div>
                      ) : null}

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
                        <textarea
                          value={gstr1EditorState.notes}
                          onChange={(event) => setGstr1EditorState((current) => ({ ...current, notes: event.target.value }))}
                          rows={4}
                          className="w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() => handleSaveGstr1Correction('draft-master')}
                          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          Save Resolution
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  No correction row is selected for this issue bucket.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderTransactionsTable = ({ onBack }: { onBack: () => void }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-4 border-b border-slate-200 px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 transition-colors hover:bg-blue-50"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-2">
          <FileText size={18} className="text-slate-500" />
          <h2 className="text-[18px] font-semibold text-slate-900">Transactions</h2>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-semibold text-white">
            {filteredTransactions.length}
          </span>
          <Info size={16} className="text-slate-400" />
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-200 px-5 py-5 xl:grid-cols-[1.2fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-slate-800">General Filters</h3>
            <Info size={18} className="text-slate-400" />
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {STATUS_FILTERS.map((filter) => (
              <label key={filter} className="inline-flex items-center gap-3 text-[15px] text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(filter)}
                  onChange={() => handleToggleFilter(filter)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {filter}
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value as TransactionStatus | '')}
                className="h-12 min-w-[280px] appearance-none rounded-lg border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-600 outline-none"
              >
                <option value="">Please Select Status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={handleBulkSave}
              disabled={!bulkStatus || selectedRowIds.length === 0}
              className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
          <div className="space-y-3 text-[15px]">
            <p>
              <span className="font-semibold text-slate-800">Company Name : </span>
              <span className="text-slate-500">{COMPANY_NAME_FULL}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-800">GST No. : </span>
              <span className="text-slate-500">29ABCDE1234F1ZX</span>
            </p>
            <p>
              <span className="font-semibold text-slate-800">From Date : </span>
              <span className="text-slate-500">{COMPANY_PERIOD.from}</span>
              <span className="ml-4 font-semibold text-slate-800">Till Date : </span>
              <span className="text-slate-500">{COMPANY_PERIOD.to}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Download size={18} />
                Export Excel
              </button>
              <button
                type="button"
                onClick={handleReconcile}
                className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Reconcile
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpenModal('share');
                  setShareFeedback('');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Send size={18} />
                Send
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenModal('share');
                  setShareFeedback('');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-hidden">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col style={{ width: '3%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '8.25%' }} />
            <col style={{ width: '8.25%' }} />
            <col style={{ width: '8.25%' }} />
            <col style={{ width: '8.25%' }} />
            <col style={{ width: '8.25%' }} />
            <col style={{ width: '8.25%' }} />
            <col style={{ width: '8.25%' }} />
            <col style={{ width: '8.25%' }} />
          </colgroup>
          <thead className="bg-white">
            <tr className="border-b border-slate-200">
              <th rowSpan={2} className="w-14 px-4 py-3">
                <input
                  type="checkbox"
                  checked={visibleTransactions.length > 0 && visibleTransactions.every((record) => selectedRowIds.includes(record.id))}
                  onChange={handleToggleAllVisibleRows}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th rowSpan={2} className="px-3 py-3 text-[13px] font-semibold text-slate-500">
                Sr.No
              </th>
              <th rowSpan={2} className="px-3 py-3 text-[13px] font-semibold text-slate-500">
                Status
              </th>
              <th rowSpan={2} className="px-3 py-3 text-[13px] font-semibold text-slate-500">
                Move Transactions
              </th>
              <th colSpan={2} className="border-l border-slate-200 px-3 py-3 text-center text-[13px] font-semibold text-slate-500">
                Invoice No
              </th>
              <th colSpan={2} className="border-l border-slate-200 px-3 py-3 text-center text-[13px] font-semibold text-slate-500">
                Invoice Date
              </th>
              <th colSpan={2} className="border-l border-slate-200 px-3 py-3 text-center text-[13px] font-semibold text-slate-500">
                Party Name
              </th>
              <th colSpan={2} className="border-l border-slate-200 px-3 py-3 text-center text-[13px] font-semibold text-slate-500">
                GST No
              </th>
            </tr>
            <tr className="border-b border-slate-200 text-[13px] font-semibold text-slate-500">
              <th className="border-l border-slate-200 px-3 py-3">GST Portal</th>
              <th className="px-3 py-3">Tally</th>
              <th className="border-l border-slate-200 px-3 py-3">GST Portal</th>
              <th className="px-3 py-3">Tally</th>
              <th className="border-l border-slate-200 px-3 py-3">GST Portal</th>
              <th className="px-3 py-3">Tally</th>
              <th className="border-l border-slate-200 px-3 py-3">GST Portal</th>
              <th className="px-3 py-3">Tally</th>
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.map((record, index) => (
              <tr key={record.id} className="border-b border-slate-100 align-top last:border-b-0">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.includes(record.id)}
                    onChange={() => handleToggleRow(record.id)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-3 text-slate-600">{(currentPage - 1) * 20 + index + 1}</td>
                <td className={`px-4 py-3 ${getStatusTone(record.status)}`}>
                  {canEditTransactionStatus(record.status) ? (
                    <div className="relative">
                      <select
                        value={record.status}
                        onChange={(event) => handleChangeRowStatus(record.id, event.target.value as TransactionStatus)}
                        className="w-full appearance-none rounded-lg border border-transparent bg-transparent px-2 py-2 pr-6 font-medium outline-none"
                      >
                        {getTransactionStatusOptions(record.status).map((statusOption) => (
                          <option key={`${record.id}-${statusOption.value}`} value={statusOption.value}>
                            {statusOption.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-current" />
                    </div>
                  ) : (
                    <div className="px-2 py-2 font-medium">{record.status}</div>
                  )}
                </td>
                <td className="px-3 py-3">
                  {canMoveTransaction(record.status) ? (
                    <div className="flex items-center gap-2">
                      <div className="relative min-w-0 flex-1">
                        <select
                          value={record.move}
                          onChange={(event) => handleChangeMove(record.id, event.target.value as MoveDirection)}
                          className={`w-full appearance-none rounded-lg px-3 py-2 pr-8 text-sm outline-none ${
                            record.move === 'Forwarded'
                              ? 'bg-amber-50 font-medium text-amber-600'
                              : 'border border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <option value={record.move}>{record.move}</option>
                          {MOVE_OPTIONS.filter((move) => move !== record.move).map((move) => (
                            <option key={move} value={move}>
                              {move}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      {record.status === 'Not In Portal' ? <Search size={18} className="text-slate-300" /> : null}
                    </div>
                  ) : (
                    <div className="h-10" />
                  )}
                </td>
                <td className={`border-l border-slate-100 px-3 py-3 ${record.highlightInvoice ? 'bg-amber-50/60' : ''}`}>
                  <div className="truncate" title={record.gstInvoiceNo}>{record.gstInvoiceNo}</div>
                </td>
                <td className={`px-3 py-3 ${record.highlightInvoice ? 'bg-amber-50/60' : ''}`}>
                  <div className="truncate" title={record.tallyInvoiceNo}>{record.tallyInvoiceNo}</div>
                </td>
                <td className={`border-l border-slate-100 px-3 py-3 ${record.highlightDate ? 'bg-amber-50/60' : ''}`}>
                  <div className="truncate" title={record.gstInvoiceDate}>{record.gstInvoiceDate}</div>
                </td>
                <td className={`px-3 py-3 ${record.highlightDate ? 'bg-amber-50/60' : ''}`}>
                  <div className="truncate" title={record.tallyInvoiceDate}>{record.tallyInvoiceDate}</div>
                </td>
                <td className={`border-l border-slate-100 px-3 py-3 ${record.highlightParty ? 'bg-amber-50/60' : ''}`}>
                  <div className="truncate" title={record.gstPartyName}>{record.gstPartyName}</div>
                </td>
                <td className={`px-3 py-3 ${record.highlightParty ? 'bg-amber-50/60' : ''}`}>
                  <div className="truncate" title={record.tallyPartyName}>{record.tallyPartyName}</div>
                </td>
                <td className={`border-l border-slate-100 px-3 py-3 ${record.highlightNo ? 'bg-amber-50/60' : ''}`}>
                  <div className="truncate" title={record.gstNo}>{record.gstNo}</div>
                </td>
                <td className={`px-3 py-3 ${record.highlightNo ? 'bg-amber-50/60' : ''}`}>
                  <div className="truncate" title={record.tallyNo}>{record.tallyNo}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
        <div className="text-sm font-semibold text-slate-700">Total : {filteredTransactions.length}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-slate-200 px-2 py-2 text-slate-500"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-600">
            {currentPage}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-lg border border-slate-200 px-2 py-2 text-slate-500"
          >
            <ChevronRight size={16} />
          </button>
          <div className="ml-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">20 / page</div>
        </div>
      </div>
    </div>
  );

  const renderInfoPanel = (title: string, description: string, items: string[]) => (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Current Focus</h3>
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderGstr2BProcess = () => (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">GSTR2B Workflow</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">Portal + Tally Reconciliation</h2>
            <p className="mt-3 max-w-[72ch] text-sm leading-7 text-slate-500">
              `GSTR2B` should start by fetching GST data from the portal after login, then bringing in Tally purchase
              data for the same period. Once both sources are ready, the system runs matching and shows the exception
              table with the exact highlighted output fields.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Active period: <span className="font-semibold text-slate-900">{gstr2bMonthValue}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">Step 1</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">GST Portal Data</h3>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${gstr2bPortalFetched ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {gstr2bPortalFetched ? 'Fetched' : 'Pending'}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            Login with GST portal credentials, fetch GSTR2B purchase data for the selected month, and keep the fetched
            dataset ready for matching.
          </p>
          <button
            type="button"
            onClick={() => setOpenModal('gstr2b-login')}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {gstr2bPortalFetched ? 'Refetch GST Data' : 'Login & Fetch GST Data'}
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">Step 2</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Tally Purchase Data</h3>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${gstr2bTallyFetched ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {gstr2bTallyFetched ? 'Fetched' : 'Pending'}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            Bring purchase vouchers from Tally for the same period so invoice presence, amount, and party can be
            compared against GST portal data.
          </p>
          <button
            type="button"
            onClick={handleGstr2bTallyFetch}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            {gstr2bTallyFetched ? 'Refetch Tally Purchase Data' : 'Fetch Tally Purchase Data'}
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">Step 3</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Run Process</h3>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                gstr2bProcessed
                  ? 'bg-emerald-50 text-emerald-600'
                  : gstr2bCanProcess
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              {gstr2bProcessed ? 'Processed' : gstr2bCanProcess ? 'Ready' : 'Waiting'}
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-500">
            <p>1. Check whether every GST 2B invoice is present in Tally purchases.</p>
            <p>2. Match GST 2B invoice amount against purchase amount.</p>
            <p>3. Highlight party differences for GST filing review.</p>
          </div>
          <button
            type="button"
            onClick={handleGstr2bProcess}
            disabled={!gstr2bCanProcess}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Run Reconciliation
          </button>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Matching Rules</h3>
          <div className="mt-5 space-y-4">
            {[
              'Fetch GST purchase data only after portal login succeeds.',
              'Use Tally purchase data from the same period for comparison.',
              'Run invoice presence check first, then amount match, then party match.',
              'Show the output in a review table with highlighted exception cells.',
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Output Highlights</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600">Missing In Tally</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{gstr2bIssueCounts['Missing In Tally']}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-600">Amount Mismatch</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{gstr2bIssueCounts['Amount Mismatch']}</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">Party Mismatch</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{gstr2bIssueCounts['Party Mismatch']}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
            <p className="text-sm leading-7 text-slate-600">
              The output table below only makes sense after both sources are fetched and the reconciliation process has
              been run. The highlighted cells show exactly where the exception exists.
            </p>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Reconciliation Output</h3>
            <p className="mt-1 text-sm text-slate-500">Missing invoice, amount mismatch, and party mismatch are highlighted in the table.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {gstr2bProcessed ? `Processed for ${gstr2bMonthValue}` : 'Waiting for process'}
          </span>
        </div>

        {gstr2bProcessed ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Sr.No.</th>
                  <th className="px-5 py-4">GST 2B Invoice No</th>
                  <th className="px-5 py-4">Tally Invoice No</th>
                  <th className="px-5 py-4">GST 2B Amount</th>
                  <th className="px-5 py-4">Tally Amount</th>
                  <th className="px-5 py-4">GST 2B Party</th>
                  <th className="px-5 py-4">Tally Party</th>
                  <th className="px-5 py-4">Issue</th>
                </tr>
              </thead>
              <tbody>
                {GSTR2B_OUTPUT_ROWS.map((row, index) => {
                  const missingInTally = row.issue === 'Missing In Tally';
                  const amountMismatch = row.issue === 'Amount Mismatch';
                  const partyMismatch = row.issue === 'Party Mismatch';

                  return (
                    <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-5 py-4 text-slate-600">{index + 1}</td>
                      <td className="px-5 py-4 font-medium text-slate-800">{row.gstInvoiceNo}</td>
                      <td className={`px-5 py-4 ${missingInTally ? 'bg-rose-50 font-medium text-rose-600' : 'text-slate-600'}`}>{row.tallyInvoiceNo}</td>
                      <td className={`px-5 py-4 ${amountMismatch ? 'bg-amber-50 font-medium text-amber-700' : 'text-slate-600'}`}>{row.gstAmount}</td>
                      <td className={`px-5 py-4 ${missingInTally ? 'bg-rose-50 font-medium text-rose-600' : amountMismatch ? 'bg-amber-50 font-medium text-amber-700' : 'text-slate-600'}`}>{row.tallyAmount}</td>
                      <td className={`px-5 py-4 ${partyMismatch ? 'bg-sky-50 font-medium text-sky-700' : 'text-slate-600'}`}>{row.gstPartyName}</td>
                      <td className={`px-5 py-4 ${missingInTally ? 'bg-rose-50 font-medium text-rose-600' : partyMismatch ? 'bg-sky-50 font-medium text-sky-700' : 'text-slate-600'}`}>{row.tallyPartyName}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getGstr2bIssueTone(row.issue)}`}>
                          {row.issue}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-base font-semibold text-slate-800">Fetch both data sources and run the reconciliation process.</p>
            <p className="mt-2 text-sm text-slate-500">
              After that, the output table will show the highlighted missing invoices in Tally, amount mismatches, and
              party mismatches.
            </p>
          </div>
        )}
      </section>
    </div>
  );

  const renderGstr3bProcess = () => {
    const currentStepIndex = GSTR3B_STEP_ITEMS.findIndex((item) => item.view === gstr3bView);
    const activePrepareSection = GSTR3B_PREPARE_SECTIONS[gstr3bSectionId];
    const gstr3bPushDocumentRows = GSTR3B_PUSH_DOCUMENT_ROWS.map((row, index) => ({
      ...row,
      href:
        index === 0
          ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '3.1' })
          : index === 1
            ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '3.1.1' })
            : index === 2
              ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '3.2' })
              : index === 3
                ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '4' })
                : index === 4
                  ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '5' })
                  : index === 5
                    ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '5.1' })
                    : buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '6.1' }),
    }));
    const gstr3bPushSummaryRows = GSTR3B_PUSH_SUMMARY_ROWS.map((row, index) => ({
      ...row,
      href:
        index === 0
          ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '3.1' })
          : index === 1
            ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '4' })
            : index === 2
              ? buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '6.1' })
              : buildGstHref({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: '5.1' }),
    }));

    const renderGstr3bPushTable = (title: string, rows: Gstr1PushTableRow[]) => (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <button type="button" className="w-full text-left text-base font-semibold text-slate-900">
            {title}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Type of Invoice</th>
                <th className="px-4 py-3">To Be Uploaded</th>
                <th className="px-4 py-3">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.title} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-4 font-medium text-slate-700">{row.title}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {row.href && row.toBeUploaded !== '0' && row.toBeUploaded !== '0.00' ? (
                      <button
                        type="button"
                        onClick={() => router.push(row.href!)}
                        className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                      >
                        {row.toBeUploaded}
                      </button>
                    ) : (
                      row.toBeUploaded
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.uploaded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );

    const renderStepper = () => (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {GSTR3B_STEP_ITEMS.map((item, index) => {
            const isActive = gstr3bView === item.view;
            const isCompleted = currentStepIndex > index;

            return (
              <React.Fragment key={item.view}>
                <button
                  type="button"
                  onClick={() => navigateToGst({ activeTab: 'GSTR3B', gstr3bView: item.view, gstr3bSectionId })}
                  className="inline-flex items-center gap-3"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isActive || isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.step}
                  </span>
                  <span className={`text-sm font-semibold ${isActive ? 'text-blue-600' : 'text-slate-600'}`}>{item.label}</span>
                </button>
                {index < GSTR3B_STEP_ITEMS.length - 1 ? <ChevronRight size={16} className="text-slate-300" /> : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );

    const renderPrepareSectionTable = (section: Gstr3bPrepareSection) => (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                {section.columns.map((column) => (
                  <th
                    key={`${section.id}-${column.key}`}
                    className={`px-4 py-3 ${column.align === 'right' ? 'text-right' : ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => (
                <tr key={`${section.id}-${rowIndex}`} className="border-b border-slate-100 last:border-b-0">
                  {section.columns.map((column) => (
                    <td
                      key={`${section.id}-${rowIndex}-${column.key}`}
                      className={`px-4 py-4 ${column.align === 'right' ? 'text-right text-slate-600' : 'text-slate-700'}`}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {section.note ? <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-500">{section.note}</div> : null}
      </section>
    );

    if (gstr3bView === 'nil-return') {
      return (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'summary-data' })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">GSTR-3B - Nil Return {gstr3bSelectedPeriod}</h2>
                <p className="mt-2 text-sm text-slate-500">Submit and file a nil return when there is no liability for the selected period.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Submit and File GSTR-3B Nil Return for {gstr3bSelectedPeriod}</h3>
            <p className="mt-2 text-sm text-slate-500">You will need a One Time Password (OTP) for this.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setOpenModal('gstr3b-guide')}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                File with EVC
              </button>
              <button
                type="button"
                disabled
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-400"
              >
                File with DSC
              </button>
            </div>
          </section>
        </div>
      );
    }

    if (gstr3bView === 'prepare-file') {
      return (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">GSTR-3B - Prepare & File | {gstr3bSelectedPeriod}</h2>
                <p className="mt-3 max-w-[74ch] text-sm leading-7 text-slate-500">
                  Munim keeps section-wise tables editable here before any GSTN push. Payment of tax and challan readiness are handled in the same
                  working surface.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveGstr3bDraft}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleCreateGstr3bChallan}
                  className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  Generate Challan
                </button>
                <button
                  type="button"
                  onClick={handleProceedToGstr3bPush}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Go to Push to GSTN
                </button>
              </div>
            </div>
          </section>

          {renderStepper()}

          <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="px-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Return Sections</h3>
              <div className="mt-3 space-y-2">
                {GSTR3B_SUMMARY_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: section.id })}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      gstr3bSectionId === section.id
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">{section.id}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{section.title}</p>
                  </button>
                ))}
              </div>
            </section>

            <div className="space-y-5">
              {renderPrepareSectionTable(activePrepareSection)}

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">Preparation Status</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Draft Sync</p>
                      <p className="mt-2 font-semibold text-slate-800">{gstr3bDraftSaved ? 'Saved in draft' : 'Changes pending save'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Portal Data</p>
                      <p className="mt-2 font-semibold text-slate-800">{gstr3bPortalFetched ? 'Downloaded from GST portal' : 'Not downloaded yet'}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Payment Branch</p>
                      <p className="mt-2 font-semibold text-slate-800">{gstr3bChallanReady ? 'Challan generated' : 'Cash ledger shortfall still needs challan'}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">Current Filing Gate</h3>
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-800">
                    Cash payment is still required before final filing. Munim surfaces the challan branch directly from the
                    `Prepare & File` stage because tax payment controls live inside section `6.1`.
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Cash Required</p>
                      <p className="mt-2 font-semibold text-slate-800">Rs 1,67,816.00</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Approval Mode</p>
                      <p className="mt-2 font-semibold text-slate-800">{gstr3bApprovalMode}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'summary-data' })}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleProceedToGstr3bPush}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (gstr3bView === 'push-to-gstn') {
      return (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">GSTR-3B Push to GSTN | {gstr3bSelectedPeriod}</h2>
                <p className="mt-3 max-w-[74ch] text-sm leading-7 text-slate-500">
                  The live product uses the same upload decision point here: choose the GSTN upload mode, start the upload,
                  review the upload history, and only then move to final filing.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                More Option
              </button>
            </div>
          </section>

          {renderStepper()}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="radio"
                    checked={gstr3bPushMode === 'without-otp'}
                    onChange={() => setGstr3bPushMode('without-otp')}
                  />
                  Upload without OTP
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="radio"
                    checked={gstr3bPushMode === 'via-otp'}
                    onChange={() => setGstr3bPushMode('via-otp')}
                  />
                  Upload via OTP
                </label>
              </div>

              <div className="grid flex-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleStartGstr3bUpload}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <CloudUpload size={16} />
                      Upload Data to GSTN
                    </button>
                    <button
                      type="button"
                      disabled={!gstr3bUploadStarted}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                    >
                      Preview Govt Summary
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>{gstr3bUploadStarted ? '100%' : '0%'}</span>
                    <span>{gstr3bUploadStarted ? 'Upload processed successfully' : 'Awaiting upload'}</span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {['Connect to GSTN', 'Save 3B Data on GSTN', 'Upload Processed Successfully', 'Ready to File'].map((step) => (
                      <div
                        key={step}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                          gstr3bUploadStarted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Want to delete existing data from GSTN?</h3>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      disabled={!gstr3bUploadStarted}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                    >
                      Reset GSTN data
                    </button>
                    <button
                      type="button"
                      disabled={!gstr3bUploadStarted}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                    >
                      Re-Generate Summary
                    </button>
                    <button
                      type="button"
                      disabled={!gstr3bUploadStarted}
                      onClick={handleProceedToGstr3bFile}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Proceed to File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700">
            <Info size={16} />
            <span>Important advisory updates to GSTR-3B filing and portal-side liability processing should stay visible at this stage.</span>
          </div>

          <div className="space-y-5">
            {renderGstr3bPushTable('Document level details that would be uploaded to GSTN:', gstr3bPushDocumentRows)}
            {renderGstr3bPushTable('Summary level details that would be uploaded to GSTN:', gstr3bPushSummaryRows)}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <button type="button" className="w-full text-left text-base font-semibold text-slate-900">
                  Upload History
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Requested Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Upload Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstr3bUploadStarted ? (
                      <tr className="border-b border-slate-100 last:border-b-0">
                        <td className="px-4 py-4 text-slate-600">20-04-2026 01:18 PM</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Ready to File
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">Preview</td>
                        <td className="px-4 py-4 text-slate-600">7 document buckets + 4 summary values pushed to GSTN</td>
                        <td className="px-4 py-4 text-slate-600">
                          {gstr3bPushMode === 'without-otp' ? 'Upload without OTP' : 'Upload via OTP'}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                          There are no records to display
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId })}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Previous
            </button>
          </div>
        </div>
      );
    }

    if (gstr3bView === 'file-gstr-3b') {
      return (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">GSTR-3B - File Return | {gstr3bSelectedPeriod}</h2>
                <p className="mt-3 max-w-[74ch] text-sm leading-7 text-slate-500">
                  This is the final authorization surface. Filing remains blocked until the GSTN push succeeds and any required challan funding is complete.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleFileGstr3b}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  File with EVC
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-400"
                >
                  File with DSC
                </button>
              </div>
            </div>
          </section>

          {renderStepper()}

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Return Summary</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {GSTR3B_FILE_SUMMARY.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-800">
                {gstr3bFiled
                  ? 'Filing has been initiated. Keep the GST utility / authorization guidance visible until ARN is confirmed.'
                  : 'GSTN upload is complete. Authorize the return through EVC to finish filing.'}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Final Filing Checklist</h3>
              <div className="mt-5 space-y-3">
                {[
                  'Review final liability and offset summary.',
                  'Confirm challan payment is reflected in cash ledger.',
                  'Use EVC / OTP utility path to authorize filing.',
                  'Store ARN and filing acknowledgement for audit.',
                ].map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'push-to-gstn', gstr3bSectionId })}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Previous
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">GSTR-3B - Data Preparation for {gstr3bSelectedPeriod}</h2>
              <p className="mt-3 max-w-[74ch] text-sm leading-7 text-slate-500">
                The live Munim flow starts with section-wise summary tiles. Each return part acts as the entry point into the prepare screen before filing can continue.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleOpenGstr3bNilReturn}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <FileText size={16} />
                File Nil GSTR3B
              </button>
              <button
                type="button"
                onClick={handleOpenGstr3bDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Download From GST Portal
                <Download size={16} />
              </button>
            </div>
          </div>
        </section>

        {renderStepper()}

        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {GSTR3B_SUMMARY_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => navigateToGst({ activeTab: 'GSTR3B', gstr3bView: 'prepare-file', gstr3bSectionId: section.id })}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold leading-6 text-slate-900">{section.title}</h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                  {section.id}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {section.metrics.map((metric) => (
                  <div key={`${section.id}-${metric.label}`} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{metric.label}</span>
                    <span className="font-semibold text-slate-800">{metric.value}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className={`rounded-lg px-4 py-2 text-sm font-medium ${gstr3bPortalFetched ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {gstr3bPortalFetched ? 'Portal data downloaded successfully.' : 'Portal data not downloaded yet.'}
          </div>
          <button
            type="button"
            onClick={handlePrepareGstr3b}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col bg-[#f5f7fb]">
      {renderTitleBar()}
      {renderAuditActions()}

      <div className="flex-1 overflow-auto px-5 py-5 lg:px-7">
        {statusMessage ? (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {statusMessage}
          </div>
        ) : null}

        {detailContext ? (
          renderTransactionsTable({
            onBack: () => navigateToGst({ activeTab: 'GSTR1', gstr1View: 'data-prepare' }),
          })
        ) : activeTab === 'Overview' ? (
          renderOverview()
        ) : activeTab === 'GSTR1' ? (
          gstr1View === 'corrections' ? renderGstr1Workbench() : renderGstr1Table()
        ) : activeTab === 'GSTR2B' ? (
          renderTransactionsTable({
            onBack: () => navigateToGst({ activeTab: 'Overview' }),
          })
        ) : activeTab === 'GSTR3B' ? (
          renderGstr3bProcess()
        ) : (
          renderInfoPanel(
            'ITC Summary',
            'Track eligible credit, identify reversals, and keep the projected net liability visible for the finance team.',
            [
              'Eligible ITC can be grouped by purchase source and sync status.',
              'Reversal-sensitive invoices should be marked before month close.',
              'Net liability should continue to reflect the same FY selection as the rest of GST.',
            ],
          )
        )}
      </div>

      {trackerTooltipState ? (
        <div
          className="pointer-events-none fixed z-[70] w-[220px] rounded-xl bg-slate-900 px-4 py-3 text-left text-sm text-white shadow-xl"
          style={{
            left: trackerTooltipState.left,
            top: trackerTooltipState.top,
            transform:
              trackerTooltipState.placement === 'bottom' ? 'translateX(-50%)' : 'translate(-50%, -100%)',
          }}
        >
          <div
            className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-slate-900 ${
              trackerTooltipState.placement === 'bottom' ? 'top-[-6px]' : 'bottom-[-6px]'
            }`}
          />
          <p>ARN: {trackerTooltipState.cell.arn}</p>
          <p className="mt-2">Date of Filing: {trackerTooltipState.cell.filingDate}</p>
          <p className="mt-1">Amendment Date: {trackerTooltipState.cell.amendmentDate}</p>
          <p className="mt-1">Original Date: {trackerTooltipState.cell.originalDate}</p>
        </div>
      ) : null}

      {openActionMenu && actionMenuState && activeActionPeriod ? (
        <div
          className="fixed inset-0 z-[75]"
          onClick={() => {
            setOpenActionMenu(null);
            setActionMenuState(null);
          }}
        >
          <div
            className="absolute min-w-[180px] rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
            style={{
              left: actionMenuState.left,
              top: actionMenuState.top,
              transform:
                actionMenuState.placement === 'bottom' ? 'translateX(-100%)' : 'translate(-100%, -100%)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                handleOpenDetail(activeActionPeriod);
                setOpenActionMenu(null);
                setActionMenuState(null);
              }}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
            >
              Open Transactions
            </button>
            <button
              type="button"
              onClick={() => {
                handleDeletePeriod(activeActionPeriod.id);
                setOpenActionMenu(null);
                setActionMenuState(null);
              }}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-rose-500 transition-colors hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}

      {openModal === 'overview-connect' ? (
        <ModalShell title="Get GST Data" onClose={() => setOpenModal(null)}>
          <div className="space-y-5 px-5 py-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Enter GST Number</label>
              <input
                value={connectGstNumber}
                onChange={(event) => setConnectGstNumber(event.target.value)}
                placeholder="Enter GST Number"
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">User name</label>
              <input
                value={connectUsername}
                onChange={(event) => setConnectUsername(event.target.value)}
                placeholder="Enter User name"
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOverviewConnect}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Get Data
            </button>
          </div>
        </ModalShell>
      ) : null}

      {openModal === 'gstr1-nil-return' ? (
        <ModalShell title="Delete Confirmation" onClose={() => setOpenModal(null)}>
          <div className="px-5 py-5 text-sm text-slate-600">Are you sure want to delete this data?</div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenModal(null);
                setStatusMessage('Delete confirmation acknowledged for nil return preparation.');
              }}
              className="rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Yes
            </button>
          </div>
        </ModalShell>
      ) : null}

      {openModal === 'gstr1-get' ? (
        <ModalShell title="Get GST Data" onClose={() => setOpenModal(null)}>
          <div className="space-y-5 px-5 py-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Time Duration</label>
              <MonthPickerField value={gstrMonthValue} onChange={setGstrMonthValue} placeholder="Select month" />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGetGstrData}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Get Data
            </button>
          </div>
        </ModalShell>
      ) : null}

      {openModal === 'gstr1-upload' ? (
        <ModalShell title="Upload" onClose={() => setOpenModal(null)}>
          <div className="space-y-5 px-5 py-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Time Duration</label>
              <MonthPickerField value={uploadMonthValue} onChange={setUploadMonthValue} placeholder="Select month" />
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-6 py-10 text-center">
              <CloudUpload size={28} className="text-blue-500" />
              <p className="mt-4 text-sm text-slate-600">Drag and drop a file here or</p>
              <span className="mt-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600">
                Click to upload
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(event) => setUploadFileName(event.target.files?.[0]?.name || '')}
              />
              {uploadFileName ? <p className="mt-4 text-sm font-medium text-slate-700">{uploadFileName}</p> : null}
            </label>

            <div className="rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
              <p className="font-semibold text-slate-700">Notes:</p>
              <ul className="mt-2 space-y-1">
                <li>Upload files in Excel format.</li>
                <li>Please do not upload password-protected Excel files.</li>
                <li>Upload the file just like the GST portal&apos;s sample format.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Upload
            </button>
          </div>
        </ModalShell>
      ) : null}

      {openModal === 'gstr2b-login' ? (
        <ModalShell title="GST Portal Login" onClose={() => setOpenModal(null)}>
          <div className="space-y-5 px-5 py-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Time Duration</label>
              <MonthPickerField value={gstr2bMonthValue} onChange={setGstr2bMonthValue} placeholder="Select month" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">GST Number</label>
              <input
                value={gstr2bGstNumber}
                onChange={(event) => setGstr2bGstNumber(event.target.value)}
                placeholder="Enter GST Number"
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">User Name</label>
              <input
                value={gstr2bUsername}
                onChange={(event) => setGstr2bUsername(event.target.value)}
                placeholder="Enter portal user name"
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={gstr2bPassword}
                onChange={(event) => setGstr2bPassword(event.target.value)}
                placeholder="Enter password"
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGstr2bPortalFetch}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Login & Fetch GST Data
            </button>
          </div>
        </ModalShell>
      ) : null}

      {openModal === 'gstr3b-download' ? (
        <ModalShell title="Download GSTR-3B Data from GST Portal" onClose={() => setOpenModal(null)}>
          <div className="space-y-5 px-5 py-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Return period</p>
              <p className="mt-2">{gstr3bSelectedPeriod}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">GST Portal User Name</label>
              <input
                value={gstr3bPortalUserName}
                onChange={(event) => setGstr3bPortalUserName(event.target.value)}
                placeholder="Enter GST portal user name"
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={gstr3bPortalPassword}
                onChange={(event) => setGstr3bPortalPassword(event.target.value)}
                placeholder="Enter GST portal password"
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {['Summary data', 'Tax liability', 'ITC details', 'Cash ledger'].map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFetchGstr3bPortalData}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Download Data
            </button>
          </div>
        </ModalShell>
      ) : null}

      {openModal === 'gstr3b-guide' ? (
        <ModalShell title="Munim Guide" onClose={() => setOpenModal(null)}>
          <div className="space-y-5 px-5 py-5">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Info size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">GSTIN Portal</h3>
                <p className="mt-1 text-sm text-slate-500">Desktop utility guidance for GST filing / authorization.</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              GST utility&apos;s Desktop application is required to perform this process, and the desktop application only
              supports the Windows operating system. Please try it on a Windows machine.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
            >
              Close
            </button>
            <button
              type="button"
              disabled
              className="rounded-lg bg-blue-100 px-5 py-2.5 text-sm font-semibold text-blue-400"
            >
              Install Now
            </button>
          </div>
        </ModalShell>
      ) : null}

      {openModal === 'share' ? (
        <ModalShell title="Download & Share" onClose={() => setOpenModal(null)}>
          <div className="px-6 py-6">
            <div className="flex justify-center gap-6">
              {[
                { label: 'WhatsApp', icon: Smartphone, action: () => setShareFeedback('WhatsApp share action is ready for this screen.') },
                { label: 'Mail', icon: Mail, action: () => setShareFeedback('Mail share action is ready for this screen.') },
                { label: 'Link', icon: Link2, action: () => setShareFeedback('A shareable link was prepared for the current filtered result.') },
                {
                  label: 'Download',
                  icon: Download,
                  action: () => {
                    handleExport();
                    setShareFeedback('The filtered transactions were downloaded.');
                  },
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="flex flex-col items-center gap-3"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-blue-600 shadow-sm ring-1 ring-slate-200">
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {shareFeedback ? (
              <p className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-center text-sm font-medium text-blue-700">
                {shareFeedback}
              </p>
            ) : null}
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
