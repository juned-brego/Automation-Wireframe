"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  FileText,
  RefreshCcw,
  Send,
} from "lucide-react";

type CompanyOption = {
  id: string;
  name: string;
  shortName: string;
  period: string;
};

type TdsSectionSummary = {
  id: string;
  section: string;
  nature: string;
  vendors: number;
  grossAmount: number;
  tdsAmount: number;
  paidCount: number;
  pendingCount: number;
};

type TdsVendorRow = {
  id: number;
  section: string;
  vendorName: string;
  pan: string;
  natureOfService: string;
  taxableAmount: number;
  rate: number;
  deductionDate: string;
  tdsAmount: number;
  paid: boolean;
  challanStatus: string;
};

const COMPANY_OPTIONS: CompanyOption[] = [
  {
    id: "paarijaat",
    name: "PAARIJAAT PERSONAL CARE PRIVATE LIMITED (100000)",
    shortName: "PAARIJAAT PERSONAL CARE PRIV...",
    period: "01/04/2026 - 31/03/2027",
  },
  {
    id: "sva-couture",
    name: "SVA COUTURE PRIVATE LIMITED (100001)",
    shortName: "SVA COUTURE PRIVATE LIMITED",
    period: "01/04/2026 - 31/03/2027",
  },
  {
    id: "burgeon-law",
    name: "BURGEON LAW LLP (100002)",
    shortName: "BURGEON LAW LLP",
    period: "01/04/2026 - 31/03/2027",
  },
  {
    id: "brego-group",
    name: "BREGO GROUP PRIVATE LIMITED (100003)",
    shortName: "BREGO GROUP PRIVATE LIMITED",
    period: "01/04/2026 - 31/03/2027",
  },
];

const QUARTERS = [
  "Q1 FY 2026-27",
  "Q2 FY 2026-27",
  "Q3 FY 2026-27",
  "Q4 FY 2026-27",
];

const INITIAL_SECTION_SUMMARY: TdsSectionSummary[] = [
  {
    id: "194c",
    section: "194C",
    nature: "Contractor payments",
    vendors: 4,
    grossAmount: 1845000,
    tdsAmount: 36900,
    paidCount: 2,
    pendingCount: 2,
  },
  {
    id: "194j",
    section: "194J",
    nature: "Professional fees",
    vendors: 3,
    grossAmount: 960000,
    tdsAmount: 96000,
    paidCount: 1,
    pendingCount: 2,
  },
  {
    id: "194h",
    section: "194H",
    nature: "Commission and brokerage",
    vendors: 2,
    grossAmount: 420000,
    tdsAmount: 21000,
    paidCount: 1,
    pendingCount: 1,
  },
  {
    id: "194i",
    section: "194I",
    nature: "Rent",
    vendors: 1,
    grossAmount: 360000,
    tdsAmount: 36000,
    paidCount: 0,
    pendingCount: 1,
  },
];

const INITIAL_VENDOR_ROWS: TdsVendorRow[] = [
  {
    id: 1,
    section: "194C",
    vendorName: "Metro Build Services",
    pan: "AAGFM5821Q",
    natureOfService: "Contractor services",
    taxableAmount: 520000,
    rate: 2,
    deductionDate: "12/04/2026",
    tdsAmount: 10400,
    paid: true,
    challanStatus: "Ready",
  },
  {
    id: 2,
    section: "194C",
    vendorName: "Aaradhya Facility Works",
    pan: "AAQFA8012L",
    natureOfService: "Maintenance contract",
    taxableAmount: 435000,
    rate: 2,
    deductionDate: "18/04/2026",
    tdsAmount: 8700,
    paid: false,
    challanStatus: "Pending payment",
  },
  {
    id: 3,
    section: "194C",
    vendorName: "Vertex Trendz",
    pan: "AAFFV4507K",
    natureOfService: "Job work",
    taxableAmount: 390000,
    rate: 2,
    deductionDate: "24/04/2026",
    tdsAmount: 7800,
    paid: true,
    challanStatus: "Ready",
  },
  {
    id: 4,
    section: "194C",
    vendorName: "S3 Solutions Pvt Ltd",
    pan: "AALCS3220J",
    natureOfService: "Contract support",
    taxableAmount: 500000,
    rate: 2,
    deductionDate: "29/04/2026",
    tdsAmount: 10000,
    paid: false,
    challanStatus: "Pending payment",
  },
  {
    id: 5,
    section: "194J",
    vendorName: "Burgeon Law LLP",
    pan: "AAKFB7081R",
    natureOfService: "Legal and professional",
    taxableAmount: 460000,
    rate: 10,
    deductionDate: "08/05/2026",
    tdsAmount: 46000,
    paid: false,
    challanStatus: "Pending payment",
  },
  {
    id: 6,
    section: "194J",
    vendorName: "Tax Heaven Consulting",
    pan: "AAJFT2290E",
    natureOfService: "Tax advisory",
    taxableAmount: 300000,
    rate: 10,
    deductionDate: "14/05/2026",
    tdsAmount: 30000,
    paid: true,
    challanStatus: "Ready",
  },
  {
    id: 7,
    section: "194J",
    vendorName: "Sneh Accounting",
    pan: "AWGPS2221P",
    natureOfService: "Accounting services",
    taxableAmount: 200000,
    rate: 10,
    deductionDate: "22/05/2026",
    tdsAmount: 20000,
    paid: false,
    challanStatus: "Pending payment",
  },
  {
    id: 8,
    section: "194H",
    vendorName: "Priyanka Surana",
    pan: "AVHPS3365D",
    natureOfService: "Sales commission",
    taxableAmount: 240000,
    rate: 5,
    deductionDate: "30/05/2026",
    tdsAmount: 12000,
    paid: true,
    challanStatus: "Ready",
  },
  {
    id: 9,
    section: "194H",
    vendorName: "Mahendra Shah & Co.",
    pan: "AAAFM4820F",
    natureOfService: "Brokerage",
    taxableAmount: 180000,
    rate: 5,
    deductionDate: "07/06/2026",
    tdsAmount: 9000,
    paid: false,
    challanStatus: "Pending payment",
  },
  {
    id: 10,
    section: "194I",
    vendorName: "Welcome Consultancy",
    pan: "AABFW7202N",
    natureOfService: "Office rent",
    taxableAmount: 360000,
    rate: 10,
    deductionDate: "10/06/2026",
    tdsAmount: 36000,
    paid: false,
    challanStatus: "Pending payment",
  },
];

const REVIEW_CHECK_GROUPS = [
  {
    id: "process",
    title: "Process Integrity",
    summary: "Core P&L behavior, posting direction, and volatility control.",
    checks: [
      {
        id: "entries-side",
        label: "Check entries are in correct side",
        result: "fine",
        finding:
          "Debit and credit direction matches the configured ledger mapping across the sampled months.",
      },
      {
        id: "negative-stock",
        label: "Stocks should not be negative",
        result: "error",
        finding:
          "Two stock items drop below zero after timing differences between purchase and issue entries.",
      },
      {
        id: "cogs-volatility",
        label: "Cost of goods sold should not be volatile",
        result: "fine",
        finding:
          "Cost of goods sold remains inside the expected monthly tolerance band for this quarter.",
      },
      {
        id: "rev-exp-ratio",
        label: "Revenue and Expense ratio should not be volatile",
        result: "error",
        finding:
          "The operating expense ratio spikes in one month against the revenue trend and needs review.",
      },
      {
        id: "gp-np-volatility",
        label: "GP & NP should also not be volatile",
        result: "error",
        finding:
          "Gross and net margin movement is outside the expected range in the closing month.",
      },
    ],
  },
  {
    id: "balance-sheet",
    title: "Balance Sheet & Statutory Controls",
    summary:
      "Monthly set-offs, payroll compliance, 26AS controls, and liabilities.",
    checks: [
      {
        id: "gst-setoff",
        label: "GST set off entries month wise",
        result: "fine",
        finding:
          "Month-wise GST set-off entries are present and aligned with the balance sheet schedule.",
      },
      {
        id: "tds-setoff",
        label: "TDS set off entries month wise",
        result: "error",
        finding:
          "One month is missing the expected TDS set-off posting and needs balance sheet alignment.",
      },
      {
        id: "pf-esic",
        label:
          "If PF ESIC applicable then calculation and payments should be matching",
        result: "error",
        finding:
          "PF/ESIC calculation and payment trail do not fully match for one payroll period.",
      },
      {
        id: "26as-match",
        label: "Match TDS, Advance tax or TCS with 26AS",
        result: "fine",
        finding:
          "The extracted tax control balances reconcile with the current 26AS reference set.",
      },
      {
        id: "loan-match",
        label:
          "If any loan balance to be matched with loan statement and interest certificate",
        result: "error",
        finding:
          "One lender balance still needs matching against the latest loan statement and interest certificate.",
      },
    ],
  },
  {
    id: "ageing",
    title: "Creditors & Debtors Aging",
    summary:
      "Working-capital exposure, negative balances, and confirmation review.",
    checks: [
      {
        id: "creditors-high",
        label: "Creditors aging: Check if its not high",
        result: "error",
        finding:
          "The over-90-day creditor bucket is higher than the expected operating threshold.",
      },
      {
        id: "creditors-negative",
        label:
          "Creditors aging: If negative balance check its advance or missed invoice",
        result: "error",
        finding:
          "Negative creditor balances need validation for advances paid or missed purchase invoices.",
      },
      {
        id: "creditors-credit-balance",
        label: "Creditors aging: If credit balance, confirm the balance",
        result: "fine",
        finding:
          "Credit balances match the supporting creditor ledger remarks and confirmations.",
      },
      {
        id: "debtors-high",
        label: "Debtors aging: Check if its not high",
        result: "error",
        finding:
          "Receivable aging is elevated in the older bucket and should be reviewed customer-wise.",
      },
      {
        id: "debtors-negative",
        label:
          "Debtors aging: If negative balance check its advance or missed raising invoice",
        result: "error",
        finding:
          "Negative debtor balances are present and may indicate advances received or missed invoicing.",
      },
    ],
  },
  {
    id: "assets",
    title: "Provisions, Fixed Assets & Investments",
    summary:
      "Month mapping, capitalization, depreciation, and recurring income.",
    checks: [
      {
        id: "provisions",
        label:
          "Provisions: Make sure expenses are correctly mapped in corresponding months",
        result: "error",
        finding:
          "A few month-end provision entries appear to be posted into adjacent months.",
      },
      {
        id: "fixed-asset-qualify",
        label:
          "Fixed Assets: If any assets qualified for fixed asset or to be expense out",
        result: "error",
        finding:
          "Capitalization review flags a few additions that may need expense vs asset reclassification.",
      },
      {
        id: "depreciation",
        label:
          "Fixed Assets: Record depreciation every month/year for all the assets",
        result: "fine",
        finding:
          "Depreciation entries are available for the review period across the active fixed asset register.",
      },
      {
        id: "investment-interest",
        label: "Investments: Record all the Interest on Investment every month",
        result: "error",
        finding:
          "Interest on investment is not recorded for all months in the current review window.",
      },
    ],
  },
  {
    id: "current-assets",
    title: "Current Asset Monitoring",
    summary: "Liquidity, reconciliation, and prepaid expense controls.",
    checks: [
      {
        id: "cash-balance",
        label: "Cash Balance should not be negative",
        result: "fine",
        finding:
          "Cash book closes positive across all reviewed months and no negative pocket is detected.",
      },
      {
        id: "bank-recon",
        label: "Bank recon if applicable",
        result: "error",
        finding:
          "One bank account is still unreconciled for the latest month-end balance.",
      },
      {
        id: "prepaid-expenses",
        label: "Prepaid expenses",
        result: "fine",
        finding:
          "Prepaid expense balances carry forward into the correct month buckets.",
      },
    ],
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function TDSFilingSection() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption>(
    COMPANY_OPTIONS[0],
  );
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(QUARTERS[3]);
  const [isSynced, setIsSynced] = useState(false);
  const [lastSync, setLastSync] = useState("");
  const [vendorRows, setVendorRows] =
    useState<TdsVendorRow[]>(INITIAL_VENDOR_ROWS);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    null,
  );
  const [excelReady, setExcelReady] = useState(false);
  const [portalStatus, setPortalStatus] = useState("Not sent");
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target as Node)
      ) {
        setCompanyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedVendorIds([]);
    setExcelReady(false);
    setPortalStatus("Not sent");
    setExpandedSectionId(null);
  }, [selectedQuarter]);

  const activeQuarter = selectedQuarter;
  const currentSectionSummary = useMemo(
    () =>
      INITIAL_SECTION_SUMMARY.map((section) => {
        const sectionRows = vendorRows.filter(
          (row) => row.section === section.section,
        );
        const paidCount = sectionRows.filter((row) => row.paid).length;

        return {
          ...section,
          paidCount,
          pendingCount: sectionRows.length - paidCount,
        };
      }),
    [vendorRows],
  );
  const displaySections = currentSectionSummary;
  const displayVendors = vendorRows;
  const totalGross = displaySections.reduce(
    (sum, section) => sum + section.grossAmount,
    0,
  );
  const totalTds = displaySections.reduce(
    (sum, section) => sum + section.tdsAmount,
    0,
  );
  const currentVendorIds = displayVendors.map((row) => row.id);
  const selectedVendorCount = selectedVendorIds.filter((id) =>
    currentVendorIds.includes(id),
  ).length;
  const allCurrentVendorsSelected =
    currentVendorIds.length > 0 &&
    currentVendorIds.every((id) => selectedVendorIds.includes(id));
  const canDownloadExcel = isSynced;
  const portalReady = isSynced && selectedVendorCount > 0;

  const handleSync = () => {
    const formatted = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setIsSynced(true);
    setLastSync(formatted);
    setSelectedVendorIds([]);
    setExcelReady(false);
    setPortalStatus("Select one or more vendor rows before sending");
  };

  const handleMarkPaid = (rowId: number) => {
    setVendorRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              paid: !row.paid,
              challanStatus: row.paid ? "Pending payment" : "Ready",
            }
          : row,
      ),
    );
    setExcelReady(false);
    setPortalStatus("Vendor payment status updated");
  };

  const handleToggleVendor = (vendorId: number) => {
    setSelectedVendorIds((currentIds) =>
      currentIds.includes(vendorId)
        ? currentIds.filter((id) => id !== vendorId)
        : [...currentIds, vendorId],
    );
    setPortalStatus("Selection updated");
  };

  const handleToggleSection = (section: string) => {
    const sectionVendorIds = displayVendors
      .filter((row) => row.section === section)
      .map((row) => row.id);
    const sectionFullySelected = sectionVendorIds.every((id) =>
      selectedVendorIds.includes(id),
    );

    setSelectedVendorIds((currentIds) =>
      sectionFullySelected
        ? currentIds.filter((id) => !sectionVendorIds.includes(id))
        : Array.from(new Set([...currentIds, ...sectionVendorIds])),
    );
    setPortalStatus(
      sectionFullySelected
        ? `${section} section cleared`
        : `${section} section selected`,
    );
  };

  const handleToggleAllVendors = () => {
    setSelectedVendorIds(allCurrentVendorsSelected ? [] : currentVendorIds);
    setPortalStatus(
      allCurrentVendorsSelected
        ? "Selection cleared"
        : "All current-quarter vendor rows selected",
    );
  };

  const handleToggleSectionAccordion = (sectionId: string) => {
    setExpandedSectionId((currentId) =>
      currentId === sectionId ? null : sectionId,
    );
  };

  const handleDownloadExcel = () => {
    const escapeHtml = (value: string | number) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const summaryRows = displaySections
      .map(
        (section) => `
          <tr>
            <td>${escapeHtml(section.section)}</td>
            <td>${escapeHtml(section.nature)}</td>
            <td>${section.vendors}</td>
            <td>${section.grossAmount}</td>
            <td>${section.tdsAmount}</td>
            <td>${section.paidCount}</td>
            <td>${section.pendingCount}</td>
          </tr>`,
      )
      .join("");

    const vendorRowsHtml = displayVendors
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.section)}</td>
            <td>${escapeHtml(row.vendorName)}</td>
            <td>${escapeHtml(row.pan)}</td>
            <td>${escapeHtml(row.natureOfService)}</td>
            <td>${row.taxableAmount}</td>
            <td>${row.rate}%</td>
            <td>${escapeHtml(row.deductionDate)}</td>
            <td>${row.tdsAmount}</td>
            <td>${row.paid ? "Paid" : "Pending"}</td>
            <td>${escapeHtml(row.challanStatus)}</td>
          </tr>`,
      )
      .join("");

    const worksheet = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Calibri, Arial, sans-serif; color: #111827; }
            table { border-collapse: collapse; margin-bottom: 24px; min-width: 920px; }
            td, th { border: 1px solid #d9e2ef; padding: 9px 12px; font-size: 11pt; }
            .title { background: #1d4ed8; color: #fff; font-size: 16pt; font-weight: 700; }
            .meta { background: #eff6ff; font-weight: 700; color: #1e3a8a; }
            th { background: #dbeafe; color: #172554; font-weight: 700; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="4" class="title">TDS Filing</td></tr>
            <tr><td class="meta">Company</td><td colspan="3">${escapeHtml(selectedCompany.name)}</td></tr>
            <tr><td class="meta">Quarter</td><td>${escapeHtml(activeQuarter)}</td><td class="meta">Last Sync</td><td>${escapeHtml(lastSync || "Not synced")}</td></tr>
          </table>
          <table>
            <tr><th>Section</th><th>Nature</th><th>Vendors</th><th>Gross Amount</th><th>TDS Amount</th><th>Paid</th><th>Pending</th></tr>
            ${summaryRows}
          </table>
          <table>
            <tr><th>Section</th><th>Vendor</th><th>PAN</th><th>Nature of Service</th><th>Taxable Amount</th><th>Rate</th><th>Date of Deduction</th><th>TDS Amount</th><th>Paid Status</th><th>Challan Status</th></tr>
            ${vendorRowsHtml}
          </table>
        </body>
      </html>`;

    const blob = new Blob([worksheet], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tds-filing-${activeQuarter.toLowerCase().replace(/\s+/g, "-")}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    setExcelReady(true);
  };

  const handleSendToPortal = () => {
    if (!portalReady) {
      return;
    }

    setPortalStatus(
      `${selectedVendorCount} vendor row${selectedVendorCount === 1 ? "" : "s"} sent to TDS portal for ${activeQuarter}`,
    );
  };

  return (
    <div className="flex h-full flex-col bg-[#f5f7fb]">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <FileText size={16} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">TDS Filing</h1>
        </div>

        <div ref={companyDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setCompanyDropdownOpen((current) => !current)}
            className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-slate-50"
          >
            <div className="text-right">
              <p className="max-w-[240px] truncate text-sm font-medium text-slate-700">
                {selectedCompany.shortName}
              </p>
              <p className="text-[11px] text-slate-500">
                {selectedCompany.period}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-500 transition-transform ${companyDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {companyDropdownOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Companies
                </p>
              </div>
              <div className="py-1">
                {COMPANY_OPTIONS.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => {
                      setSelectedCompany(company);
                      setCompanyDropdownOpen(false);
                    }}
                    className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors ${
                      selectedCompany.id === company.id
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`truncate text-[12px] font-medium ${
                          selectedCompany.id === company.id
                            ? "text-blue-700"
                            : "text-slate-800"
                        }`}
                      >
                        {company.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {company.period}
                      </p>
                    </div>
                    {selectedCompany.id === company.id && (
                      <span className="mt-0.5 text-[11px] font-semibold text-blue-600">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#f5f7fb_20%,_#f5f7fb_100%)] px-5 py-6 lg:px-7">
        <div className="mx-auto max-w-[1420px] space-y-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                Quarter Workspace
              </p>
              <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-slate-950">
                TDS Filing Control
              </h2>
              <p className="mt-2 max-w-[760px] text-[15px] leading-7 text-slate-500">
                Sync section-wise TDS data from Tally, review the nested vendor
                rows, run the review checklist, download the Excel pack, then
                select any vendor or full section before sending data to the TDS
                portal.
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
              <label className="block max-w-[360px]">
                <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                  Current quarter
                </span>
                <div className="relative">
                  <select
                    value={selectedQuarter}
                    onChange={(event) => setSelectedQuarter(event.target.value)}
                    className="h-12 w-full appearance-none rounded-[20px] border border-slate-300 bg-white px-4 pr-12 text-[15px] text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100"
                  >
                    {QUARTERS.map((quarter) => (
                      <option key={quarter} value={quarter}>
                        {quarter}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={handleSync}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <RefreshCcw size={16} />
                Sync from Tally
              </button>

              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={!canDownloadExcel}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <Download size={16} />
                Download Excel
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-semibold text-blue-700">
              {isSynced
                ? `${activeQuarter} synced${lastSync ? ` on ${lastSync}` : ""}. Vendor selection and Excel export are now unlocked.`
                : "Sync the current quarter from Tally before selecting vendor rows or downloading Excel."}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Section-wise filing data
                </p>
                <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-slate-950">
                  {activeQuarter}
                </h3>
                <p className="mt-2 text-[14px] text-slate-500">
                  Click a section row to expand vendor-wise details. Select a
                  full section or only the vendor rows you want to send.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-right">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Gross
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-slate-900">
                    {formatCurrency(totalGross)}
                  </p>
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">
                    TDS
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-blue-700">
                    {formatCurrency(totalTds)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        ref={(input) => {
                          if (input) {
                            input.indeterminate =
                              selectedVendorCount > 0 &&
                              !allCurrentVendorsSelected;
                          }
                        }}
                        type="checkbox"
                        checked={allCurrentVendorsSelected}
                        onChange={handleToggleAllVendors}
                        disabled={!isSynced}
                        aria-label="Select all current quarter vendor rows"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Nature</th>
                    <th className="px-4 py-3 text-right">Vendors</th>
                    <th className="px-4 py-3 text-right">Gross amount</th>
                    <th className="px-4 py-3 text-right">TDS</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displaySections.map((section) => {
                    const sectionVendorRows = displayVendors.filter(
                      (row) => row.section === section.section,
                    );
                    const sectionVendorIds = sectionVendorRows.map(
                      (row) => row.id,
                    );
                    const selectedInSectionCount = sectionVendorIds.filter(
                      (id) => selectedVendorIds.includes(id),
                    ).length;
                    const sectionFullySelected =
                      sectionVendorIds.length > 0 &&
                      sectionVendorIds.every((id) =>
                        selectedVendorIds.includes(id),
                      );
                    const sectionPartiallySelected =
                      selectedInSectionCount > 0 && !sectionFullySelected;
                    const sectionExpanded = expandedSectionId === section.id;

                    return (
                      <React.Fragment key={section.id}>
                        <tr
                          onClick={() =>
                            handleToggleSectionAccordion(section.id)
                          }
                          className={`transition-colors ${
                            selectedInSectionCount > 0
                              ? "bg-emerald-50/70"
                              : "bg-white"
                          } cursor-pointer hover:bg-slate-50`}
                        >
                          <td className="px-4 py-4">
                            <input
                              ref={(input) => {
                                if (input) {
                                  input.indeterminate =
                                    sectionPartiallySelected;
                                }
                              }}
                              type="checkbox"
                              checked={sectionFullySelected}
                              onChange={() =>
                                handleToggleSection(section.section)
                              }
                              onClick={(event) => event.stopPropagation()}
                              disabled={!isSynced}
                              aria-label={`Select all ${section.section} vendors for portal filing`}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                                  sectionExpanded
                                    ? "border-blue-200 bg-blue-50 text-blue-600"
                                    : "border-slate-200 bg-white text-slate-400"
                                }`}
                              >
                                <ChevronDown
                                  size={16}
                                  className={`transition-transform duration-200 ${
                                    sectionExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </span>
                              <span>{section.section}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {section.nature}
                          </td>
                          <td className="px-4 py-4 text-right text-slate-600">
                            {section.vendors}
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-slate-900">
                            {formatCurrency(section.grossAmount)}
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-blue-700">
                            {formatCurrency(section.tdsAmount)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                section.pendingCount === 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {section.paidCount}/{section.vendors}
                            </span>
                          </td>
                        </tr>
                        {sectionExpanded && (
                          <tr>
                            <td colSpan={7} className="bg-slate-50/70 p-0">
                              <div className="px-4 py-4">
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                  <table className="w-full text-left text-[13px]">
                                    <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                                      <tr>
                                        <th className="w-10 px-3 py-3"></th>
                                        <th className="px-3 py-3">Vendor</th>
                                        <th className="px-3 py-3">PAN</th>
                                        <th className="px-3 py-3">
                                          Nature of service
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                          Taxable amount
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                          Rate
                                        </th>
                                        <th className="px-3 py-3">
                                          Date of deduction
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                          TDS
                                        </th>
                                        <th className="px-3 py-3">
                                          Paid status
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                          Action
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {sectionVendorRows.map((row) => {
                                        const vendorSelected =
                                          selectedVendorIds.includes(row.id);

                                        return (
                                          <tr
                                            key={row.id}
                                            className={
                                              vendorSelected
                                                ? "bg-emerald-50/60"
                                                : "hover:bg-slate-50"
                                            }
                                          >
                                            <td className="px-3 py-3">
                                              <input
                                                type="checkbox"
                                                checked={vendorSelected}
                                                onChange={() =>
                                                  handleToggleVendor(row.id)
                                                }
                                                disabled={!isSynced}
                                                aria-label={`Select ${row.vendorName} for portal filing`}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                              />
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-slate-900">
                                              {row.vendorName}
                                            </td>
                                            <td className="px-3 py-3 text-slate-600">
                                              {row.pan}
                                            </td>
                                            <td className="px-3 py-3 text-slate-600">
                                              {row.natureOfService ||
                                                "Not maintained in Tally"}
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium text-slate-900">
                                              {formatCurrency(
                                                row.taxableAmount,
                                              )}
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium text-slate-700">
                                              {row.rate}%
                                            </td>
                                            <td className="px-3 py-3 text-slate-600">
                                              {row.deductionDate}
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium text-blue-700">
                                              {formatCurrency(row.tdsAmount)}
                                            </td>
                                            <td className="px-3 py-3">
                                              <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                  row.paid
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-amber-50 text-amber-700"
                                                }`}
                                              >
                                                {row.paid ? "Paid" : "Pending"}
                                              </span>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleMarkPaid(row.id)
                                                }
                                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                              >
                                                {row.paid
                                                  ? "Mark pending"
                                                  : "Mark as paid"}
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-900">
                  {selectedVendorCount}/{displayVendors.length} vendor rows
                  selected
                </p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {isSynced
                    ? "Select any vendor row or full section to send partial data."
                    : "Sync from Tally first, then select vendor rows."}
                </p>
                <p className="mt-1 text-[12px] font-medium text-slate-600">
                  Excel: {excelReady ? "Generated" : "Not generated"} | Portal:{" "}
                  {portalStatus}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendToPortal}
                disabled={!portalReady}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <Send size={16} />
                Send Data to Portal
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
