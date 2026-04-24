"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Check,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Layers3,
} from "lucide-react";

type CompanyOption = {
  id: string;
  name: string;
  shortName: string;
  period: string;
};

type MisSectionId =
  | "dashboard"
  | "sales"
  | "expenses"
  | "cash-flow"
  | "creditors"
  | "debtors"
  | "pl-bs";

type MisSection = {
  id: MisSectionId;
  label: string;
  sheetName: string;
  description: string;
};

type MisMonth = {
  key: string;
  label: string;
  excelLabel: string;
};

type SheetRow = (string | number)[];

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

const MIS_SECTIONS: MisSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    sheetName: "Dashboard",
    description: "Executive KPI summary with monthly movement.",
  },
  {
    id: "sales",
    label: "Sales",
    sheetName: "Sales",
    description: "Gross sales, GST, returns, discounts, and net sales.",
  },
  {
    id: "expenses",
    label: "Expenses",
    sheetName: "Expenses",
    description: "Expense breakup following the attached MIS format.",
  },
  {
    id: "cash-flow",
    label: "Cash Flow",
    sheetName: "Cash Flow",
    description: "Monthly inflow, outflow, and closing bank balance.",
  },
  {
    id: "creditors",
    label: "Creditors",
    sheetName: "Creditors",
    description: "Creditor balances and aging-style monthly summary.",
  },
  {
    id: "debtors",
    label: "Debtors",
    sheetName: "Debtors",
    description: "Debtor balances and collection movement.",
  },
  {
    id: "pl-bs",
    label: "Profit and Loss and Balance Sheet",
    sheetName: "P&L and BS",
    description: "Combined P&L and Balance Sheet MIS section.",
  },
];

const FY_MONTHS: MisMonth[] = [
  { key: "2026-04", label: "Apr 2026", excelLabel: "April'2026" },
  { key: "2026-05", label: "May 2026", excelLabel: "May'2026" },
  { key: "2026-06", label: "Jun 2026", excelLabel: "June'2026" },
  { key: "2026-07", label: "Jul 2026", excelLabel: "July'2026" },
  { key: "2026-08", label: "Aug 2026", excelLabel: "Aug'2026" },
  { key: "2026-09", label: "Sep 2026", excelLabel: "Sept'2026" },
  { key: "2026-10", label: "Oct 2026", excelLabel: "Oct'2026" },
  { key: "2026-11", label: "Nov 2026", excelLabel: "Nov'2026" },
  { key: "2026-12", label: "Dec 2026", excelLabel: "Dec'2026" },
  { key: "2027-01", label: "Jan 2027", excelLabel: "Jan'2027" },
  { key: "2027-02", label: "Feb 2027", excelLabel: "Feb'2027" },
  { key: "2027-03", label: "Mar 2027", excelLabel: "March'2027" },
];

const monthlySeries = (months: MisMonth[], base: number, step: number) =>
  months.map((_, index) => base + index * step + (index % 3) * step * 0.4);

const formatCurrency = (value: number) =>
  `Rs ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value)}`;

const escapeHtml = (value: string | number) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getRowsForSection = (
  sectionId: MisSectionId,
  months: MisMonth[],
): SheetRow[] => {
  const header = ["Particulars", ...months.map((month) => month.excelLabel)];
  const sales = monthlySeries(months, 780000, 42000);
  const gst = sales.map((value) => -Math.round(value * 0.09));
  const returns = sales.map(
    (value, index) => -Math.round(value * (0.04 + index * 0.002)),
  );
  const discounts = sales.map((value) => -Math.round(value * 0.025));
  const netSales = sales.map(
    (value, index) =>
      value + gst[index] + returns[index] + discounts[index] + 2500,
  );
  const purchases = monthlySeries(months, 245000, 18000);
  const expenses = monthlySeries(months, 160000, 12500);
  const grossProfit = netSales.map((value, index) => value - purchases[index]);
  const netProfit = grossProfit.map((value, index) => value - expenses[index]);

  if (sectionId === "dashboard") {
    return [
      ["MIS DASHBOARD"],
      ["Company", COMPANY_OPTIONS[0].name],
      [
        "Period",
        `April 2026 to ${months[months.length - 1]?.label ?? "April 2026"}`,
      ],
      [],
      header,
      ["Gross Sales", ...sales],
      ["Net Sales", ...netSales],
      ["Gross Profit", ...grossProfit],
      ["Net Profit", ...netProfit],
      ["Closing Bank Balance", ...monthlySeries(months, 420000, 36000)],
      ["Creditors Closing", ...monthlySeries(months, 620000, 24000)],
      ["Debtors Closing", ...monthlySeries(months, 740000, 28000)],
    ];
  }

  if (sectionId === "sales") {
    return [
      ["SALES MIS"],
      [],
      header,
      ["MRP SALES", ...sales],
      ["(-) GST", ...gst],
      ["(-) Sales Returns", ...returns],
      ["(-) Discounts", ...discounts],
      [
        "(+) Other Income (Shipping income)",
        ...months.map((_, index) => 2500 + index * 300),
      ],
      ["NET SALES", ...netSales],
    ];
  }

  if (sectionId === "expenses") {
    return [
      ["EXPENSE BREAKUP"],
      [],
      header,
      ["Commission Expense", ...monthlySeries(months, 5400, 900)],
      ["Advertising Expenses", ...monthlySeries(months, 145000, 14000)],
      ["Logistics", ...monthlySeries(months, 11800, 1600)],
      ["Payroll and Wages", ...monthlySeries(months, 82000, 4500)],
      ["Rent", ...months.map(() => 55000)],
      ["Professional Fees", ...monthlySeries(months, 24000, 1500)],
      ["TOTAL EXPENSES", ...expenses],
    ];
  }

  if (sectionId === "cash-flow") {
    const opening = monthlySeries(months, 180000, 22000);
    const inflow = netSales.map((value) => Math.round(value * 0.92));
    const outflow = purchases.map((value, index) => value + expenses[index]);
    const closing = opening.map(
      (value, index) => value + inflow[index] - outflow[index],
    );

    return [
      ["CASH FLOW"],
      [],
      header,
      ["Opening Bank Balance", ...opening],
      ["Inflow of Cash", ...inflow],
      ["Outflow of Cash", ...outflow],
      ["Closing Bank Balance", ...closing],
    ];
  }

  if (sectionId === "creditors") {
    return [
      ["CREDITORS"],
      [],
      header,
      ["Opening Creditors", ...monthlySeries(months, 580000, 21000)],
      ["Purchase Booked", ...purchases],
      ["Payments Made", ...monthlySeries(months, -198000, -9000)],
      ["Need Invoice", ...monthlySeries(months, 78000, 4200)],
      ["Payable", ...monthlySeries(months, 435000, 19000)],
      ["Closing Creditors", ...monthlySeries(months, 620000, 24000)],
    ];
  }

  if (sectionId === "debtors") {
    return [
      ["DEBTORS"],
      [],
      header,
      ["Opening Debtors", ...monthlySeries(months, 690000, 26000)],
      ["Sales Raised", ...netSales],
      ["Collections", ...netSales.map((value) => -Math.round(value * 0.86))],
      ["Overdue > 60 Days", ...monthlySeries(months, 92000, 5200)],
      ["Closing Debtors", ...monthlySeries(months, 740000, 28000)],
    ];
  }

  return [
    ["PROFIT AND LOSS STATEMENT"],
    [],
    header,
    ["GROSS SALES", ...sales],
    ["NET SALES", ...netSales],
    ["Total Cost of Goods Sold + Wages", ...purchases],
    ["Gross Margin", ...grossProfit],
    ["Operating Expenses", ...expenses],
    ["NET PROFIT", ...netProfit],
    [],
    ["BALANCE SHEET"],
    [],
    header,
    ["Fixed Assets", ...monthlySeries(months, 980000, -12000)],
    ["Investments", ...monthlySeries(months, 320000, 6000)],
    ["Current Assets", ...monthlySeries(months, 1450000, 43000)],
    ["Current Liabilities", ...monthlySeries(months, 880000, 27000)],
    ["Capital and Reserves", ...monthlySeries(months, 1870000, 19000)],
  ];
};

const buildWorksheetHtml = (sheetName: string, rows: SheetRow[]) => {
  const body = rows
    .map((row, rowIndex) => {
      if (row.length === 0) {
        return `<tr><td colspan="14" class="blank">&nbsp;</td></tr>`;
      }

      const isTitle = row.length === 1;
      const isHeader = rowIndex > 0 && row[0] === "Particulars";

      return `<tr>${row
        .map((cell, cellIndex) => {
          const numeric = typeof cell === "number";
          const className = [
            isTitle ? "title" : "",
            isHeader ? "header" : "",
            numeric ? "number" : "",
            cellIndex === 0 && !isTitle && !isHeader ? "label" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return `<td class="${className}" ${
            isTitle ? 'colspan="14"' : ""
          }>${numeric ? formatCurrency(cell) : escapeHtml(cell)}</td>`;
        })
        .join("")}</tr>`;
    })
    .join("");

  return `<div class="worksheet" data-name="${escapeHtml(sheetName)}"><table>${body}</table></div>`;
};

export default function MISReportSection() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption>(
    COMPANY_OPTIONS[0],
  );
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<MisSectionId[]>(
    MIS_SECTIONS.map((section) => section.id),
  );
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

  const visibleMonths = useMemo(() => FY_MONTHS, []);

  const allSelected = selectedSections.length === MIS_SECTIONS.length;
  const downloadReady = selectedSections.length > 0;

  const toggleSection = (sectionId: MisSectionId) => {
    setSelectedSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId],
    );
  };

  const toggleAllSections = () => {
    setSelectedSections(
      allSelected ? [] : MIS_SECTIONS.map((section) => section.id),
    );
  };

  const handleDownload = () => {
    if (!downloadReady) return;

    const selected = MIS_SECTIONS.filter((section) =>
      selectedSections.includes(section.id),
    );

    const worksheetXml = selected
      .map(
        (section) => `
          <x:ExcelWorksheet>
            <x:Name>${escapeHtml(section.sheetName)}</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
          </x:ExcelWorksheet>`,
      )
      .join("");

    const worksheets = selected
      .map((section) =>
        buildWorksheetHtml(
          section.sheetName,
          getRowsForSection(section.id, visibleMonths),
        ),
      )
      .join("");

    const workbook = `<!doctype html>
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <!--[if gte mso 9]><xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>${worksheetXml}</x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml><![endif]-->
          <style>
            body { font-family: Calibri, Arial, sans-serif; }
            .worksheet { mso-element: worksheet; page-break-after: always; }
            table { border-collapse: collapse; margin-bottom: 24px; }
            td { border: 1px solid #d9e2ef; padding: 9px 12px; min-width: 120px; font-size: 11pt; }
            .title { background: #1d4ed8; color: #ffffff; font-size: 16pt; font-weight: 700; text-align: left; }
            .header { background: #dbeafe; color: #172554; font-weight: 700; text-align: center; }
            .label { background: #f8fafc; color: #111827; font-weight: 700; min-width: 240px; }
            .number { text-align: right; mso-number-format: "\\0022₹\\0022\\ #,##0"; }
            .blank { border: none; height: 10px; }
          </style>
        </head>
        <body>${worksheets}</body>
      </html>`;

    const blob = new Blob([workbook], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mis-report-fy-2026-27.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col bg-[#f5f7fb]">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <FileSpreadsheet size={16} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">MIS Report</h1>
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

      <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f5f7fb_24%,_#f5f7fb_100%)] px-5 py-6 lg:px-7">
        <div className="mx-auto max-w-[1480px] space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-blue-600">
                  MIS Builder
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">
                  Select sections and download Excel
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Choose the MIS sections to include. The downloaded Excel will
                  contain only the selected tabs, with month-wise columns from
                  April to the selected report month.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!downloadReady}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black transition-all ${
                  downloadReady
                    ? "bg-blue-600 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)] hover:bg-blue-700"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                <Download size={18} />
                Download MIS Excel
              </button>
            </div>

            <div className="mt-7">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                      Option 2
                    </p>
                    <h3 className="mt-2 text-lg font-black text-slate-950">
                      Section-wise Excel tabs
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Select one section for one tab, or select all to download
                      the complete MIS workbook.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleAllSections}
                    className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    {allSelected ? "Clear all" : "Select all"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {MIS_SECTIONS.map((section) => {
              const selected = selectedSections.includes(section.id);

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`flex min-h-[132px] items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                    selected
                      ? "border-blue-200 bg-white shadow-[0_16px_36px_rgba(37,99,235,0.10)]"
                      : "border-slate-200 bg-white/70 hover:border-blue-200 hover:bg-white"
                  }`}
                >
                  <span
                    className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    {selected ? <Check size={17} /> : <Layers3 size={17} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-black text-slate-950">
                      {section.label}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">
                      {section.description}
                    </span>
                    <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      Tab: {section.sheetName}
                    </span>
                  </span>
                </button>
              );
            })}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-blue-600">
                  Workbook Preview
                </p>
                <h3 className="mt-2 text-xl font-black text-slate-950">
                  {selectedSections.length} tabs selected
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                <BarChart3 size={18} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-700">
                  {visibleMonths.length} month columns
                </span>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Excel tab</th>
                    <th className="px-4 py-3">Months visible</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MIS_SECTIONS.map((section) => {
                    const selected = selectedSections.includes(section.id);

                    return (
                      <tr key={section.id} className="bg-white">
                        <td className="px-4 py-4 font-bold text-slate-900">
                          {section.label}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {section.sheetName}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          Apr 2026 -{" "}
                          {visibleMonths[visibleMonths.length - 1]?.label}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              selected
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {selected ? "Included" : "Not included"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
