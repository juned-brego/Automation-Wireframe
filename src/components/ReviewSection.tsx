"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Play,
  RefreshCcw,
} from "lucide-react";

type CompanyOption = {
  id: string;
  name: string;
  shortName: string;
  period: string;
};

type ReviewStatus = "fine" | "error";

type ReviewCheckItem = {
  id: string;
  label: string;
  result: ReviewStatus;
  finding: string;
};

type ReviewCheckGroup = {
  id: string;
  title: string;
  summary: string;
  checks: ReviewCheckItem[];
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

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEAR_OPTIONS = ["2024", "2025", "2026", "2027", "2028"];

const REVIEW_CHECK_GROUPS: ReviewCheckGroup[] = [
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
          "Cost of goods sold remains inside the expected monthly tolerance band for the selected review period.",
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
          "Provisions: Make sure expenses are correctly mapped in corresponding months.",
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
    title: "Current Assets & Current Liabilities",
    summary:
      "Liquidity, reconciliation, prepaid expense controls, and liability matching.",
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
      {
        id: "loan-match-current",
        label:
          "Current Liabilities: If any loan balance to be matched with loan statement and interest certificate",
        result: "error",
        finding:
          "One loan ledger still requires matching with the latest statement and interest certificate.",
      },
    ],
  },
];

export default function ReviewSection() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption>(
    COMPANY_OPTIONS[0],
  );
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [isSynced, setIsSynced] = useState(false);
  const [lastSync, setLastSync] = useState("");
  const [reviewHasRun, setReviewHasRun] = useState(false);
  const [reviewRunAt, setReviewRunAt] = useState("");
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
    setIsSynced(false);
    setLastSync("");
    setReviewHasRun(false);
    setReviewRunAt("");
  }, [selectedMonth, selectedYear]);

  const activeReviewPeriod = `${selectedMonth} ${selectedYear}`;

  const totalChecks = useMemo(
    () =>
      REVIEW_CHECK_GROUPS.reduce((sum, group) => sum + group.checks.length, 0),
    [],
  );
  const totalFineChecks = useMemo(
    () =>
      REVIEW_CHECK_GROUPS.reduce(
        (sum, group) =>
          sum + group.checks.filter((check) => check.result === "fine").length,
        0,
      ),
    [],
  );
  const totalErrorChecks = totalChecks - totalFineChecks;

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
    setReviewHasRun(false);
    setReviewRunAt("");
  };

  const handleRunReview = () => {
    if (!isSynced) {
      return;
    }

    const formatted = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setReviewHasRun(true);
    setReviewRunAt(formatted);
  };

  return (
    <div className="flex h-full flex-col bg-[#f5f7fb]">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <FileText size={16} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Review</h1>
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
              className={`text-slate-500 transition-transform ${
                companyDropdownOpen ? "rotate-180" : ""
              }`}
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
        <div className="mx-auto max-w-[1480px] space-y-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)] xl:items-start">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Review Workspace
                </p>
                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                  Books diagnostic control room
                </h2>
                <p className="mt-3 max-w-[820px] text-[15px] leading-7 text-slate-500">
                  Sync the selected month first, then run the review engine to
                  validate process controls, balance sheet hygiene, aging,
                  provisions, assets, investments, and current account health
                  for that period.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,160px)_auto_auto] md:items-end">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                      Review month
                    </span>
                    <div className="relative">
                      <select
                        value={selectedMonth}
                        onChange={(event) =>
                          setSelectedMonth(event.target.value)
                        }
                        className="h-12 w-full appearance-none rounded-[20px] border border-slate-300 bg-white px-4 pr-12 text-[15px] text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100"
                      >
                        {MONTH_OPTIONS.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-slate-700">
                      Review year
                    </span>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(event) =>
                          setSelectedYear(event.target.value)
                        }
                        className="h-12 w-full appearance-none rounded-[20px] border border-slate-300 bg-white px-4 pr-12 text-[15px] text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100"
                      >
                        {YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>
                            {year}
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
                    Sync
                  </button>

                  <button
                    type="button"
                    onClick={handleRunReview}
                    disabled={!isSynced}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_18px_28px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    <Play size={16} />
                    Run
                  </button>
                </div>

                <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Workflow
                  </p>
                  <p className="mt-2 text-[14px] font-medium text-slate-700">
                    Sync first, then run the review checklist to mark each item
                    as fine or error.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(145deg,_rgba(255,255,255,0.94),_rgba(239,246,255,0.94))] p-5 shadow-[0_18px_34px_rgba(59,130,246,0.08)]">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white px-4 py-4 shadow-[0_10px_18px_rgba(15,23,42,0.05)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Checks
                    </p>
                    <p className="mt-2 text-[22px] font-semibold text-slate-950">
                      {totalChecks}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-500">
                      Fine
                    </p>
                    <p className="mt-2 text-[22px] font-semibold text-emerald-700">
                      {reviewHasRun ? totalFineChecks : 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-rose-50 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
                      Errors
                    </p>
                    <p className="mt-2 text-[22px] font-semibold text-rose-700">
                      {reviewHasRun ? totalErrorChecks : 0}
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-4 rounded-2xl border px-4 py-4 ${
                    !isSynced
                      ? "border-slate-200 bg-slate-50"
                      : reviewHasRun
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <p
                    className={`text-[14px] font-semibold ${
                      !isSynced
                        ? "text-slate-700"
                        : reviewHasRun
                          ? "text-emerald-800"
                          : "text-amber-800"
                    }`}
                  >
                    {!isSynced
                      ? "Waiting for sync"
                      : reviewHasRun
                        ? "Review completed"
                        : "Ready to run"}
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-slate-500">
                    {!isSynced
                      ? "Sync this month before the diagnostic engine can evaluate the checklist."
                      : reviewHasRun
                        ? `${activeReviewPeriod} review completed on ${reviewRunAt}. ${totalErrorChecks} issue${totalErrorChecks === 1 ? "" : "s"} need follow-up.`
                        : `${activeReviewPeriod} synced on ${lastSync}. Run the checklist to evaluate all accounting controls.`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Review Checklist
                </p>
                <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                  Current month validation board
                </h3>
                <p className="mt-2 text-[14px] leading-7 text-slate-500">
                  Every control is shown below with a result state. Run the
                  review after sync to switch items from pending into fine or
                  error.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {activeReviewPeriod}
              </span>
            </div>

            <div className="mt-6 grid gap-4 2xl:grid-cols-2">
              {REVIEW_CHECK_GROUPS.map((group) => (
                <article
                  key={group.id}
                  className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">
                        {group.title}
                      </h4>
                      <p className="mt-1 text-[13px] leading-6 text-slate-500">
                        {group.summary}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {group.checks.length} checks
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {group.checks.map((check) => {
                      const status = reviewHasRun ? check.result : null;

                      return (
                        <div
                          key={check.id}
                          className={`rounded-2xl border px-4 py-4 ${
                            status === "fine"
                              ? "border-emerald-200 bg-emerald-50/70"
                              : status === "error"
                                ? "border-rose-200 bg-rose-50/70"
                                : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-slate-900">
                                {check.label}
                              </p>
                              <p className="mt-1 text-[13px] leading-6 text-slate-500">
                                {reviewHasRun
                                  ? check.finding
                                  : "Pending review run after month-wise sync."}
                              </p>
                            </div>

                            <span
                              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                                status === "fine"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : status === "error"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {status === "fine" ? (
                                <CheckCircle2 size={14} />
                              ) : status === "error" ? (
                                <AlertTriangle size={14} />
                              ) : (
                                <Play size={14} />
                              )}
                              {status === "fine"
                                ? "Fine"
                                : status === "error"
                                  ? "Error"
                                  : "Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
