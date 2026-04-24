"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileText, RefreshCcw } from "lucide-react";

type AdvancedTextForm = {
  quarter: string;
  salesExpensesForecastFormula: string;
  gpaOpForecastFormula: string;
  expenseIncrease: string;
  taxRegimeAndRates: string;
};

type CompanyOption = {
  id: string;
  name: string;
  shortName: string;
  period: string;
};

const INITIAL_FORM: AdvancedTextForm = {
  quarter: "",
  salesExpensesForecastFormula: "",
  gpaOpForecastFormula: "",
  expenseIncrease: "",
  taxRegimeAndRates: "",
};

const QUARTER_OPTIONS = [
  "1st Quarter",
  "2nd Quarter",
  "3rd Quarter",
  "4th Quarter",
];

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

export default function AdvancedTextSection() {
  const [isSynced, setIsSynced] = useState(false);
  const [syncedAt, setSyncedAt] = useState("");
  const [form, setForm] = useState<AdvancedTextForm>(INITIAL_FORM);
  const [showDownload, setShowDownload] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Sync first to unlock the Advanced Text form.",
  );
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption>(
    COMPANY_OPTIONS[0],
  );
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  const requiredFieldsCount = 5;
  const filledFieldsCount = Object.values(form).filter(
    (value) => value.trim().length > 0,
  ).length;
  const readyToSubmit = isSynced && filledFieldsCount === requiredFieldsCount;

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

  const handleSync = () => {
    const now = new Date();
    const formatted = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setIsSynced(true);
    setSyncedAt(formatted);
    setStatusMessage(
      "Sync completed. You can now enter formulas and generate advanced text.",
    );
  };

  const handleChange =
    (field: keyof AdvancedTextForm) =>
    (
      event: React.ChangeEvent<
        HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
      >,
    ) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSynced) {
      setStatusMessage("Please sync first before filling the form.");
      return;
    }

    setShowDownload(true);
    setStatusMessage("Advanced Text is ready. Use the download button below.");
  };

  const handleDownload = () => {
    const rows = [
      ["Advanced Text"],
      ["Company", selectedCompany.name],
      ["Period", selectedCompany.period],
      ["Quarter", form.quarter],
      ["Synced At", syncedAt || "Not available"],
      [],
      ["Field", "Value"],
      ["sale/expenses forecast formula", form.salesExpensesForecastFormula],
      ["GPA/OP forecast formula", form.gpaOpForecastFormula],
      ["expense absolute/percentage increase", form.expenseIncrease],
      ["text regime and rates", form.taxRegimeAndRates],
    ];

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const worksheet = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; width: 760px; }
            td { border: 1px solid #d9e2ef; padding: 10px 12px; font-size: 12pt; vertical-align: top; }
            .title { background: #1d4ed8; color: #ffffff; font-size: 16pt; font-weight: 700; }
            .label { background: #eff6ff; color: #1e3a8a; font-weight: 700; width: 260px; }
            .header { background: #dbeafe; color: #172554; font-weight: 700; }
            .value { color: #111827; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <table>
            ${rows
              .map((row, rowIndex) => {
                if (row.length === 0) {
                  return '<tr><td colspan="2"></td></tr>';
                }

                if (rowIndex === 0) {
                  return `<tr><td colspan="2" class="title">${escapeHtml(row[0])}</td></tr>`;
                }

                if (rowIndex === 6) {
                  return `<tr><td class="header">${escapeHtml(row[0])}</td><td class="header">${escapeHtml(row[1])}</td></tr>`;
                }

                return `<tr><td class="label">${escapeHtml(row[0])}</td><td class="value">${escapeHtml(row[1] || "")}</td></tr>`;
              })
              .join("")}
          </table>
        </body>
      </html>`;

    const blob = new Blob([worksheet], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "advanced-text.xls";
    link.click();
    URL.revokeObjectURL(url);
  };

  const formDisabled = !isSynced;

  return (
    <div className="flex h-full flex-col bg-[#f5f7fb]">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <FileText size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Advanced Text</h1>
          </div>
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
        <div className="mx-auto max-w-[1380px] space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.95fr)]">
            <section className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Formula Builder
                  </p>
                  <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                    Advanced Text Setup
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-500">
                    Select the quarter, then keep the logic concise and
                    operator-friendly. All fields are required before download.
                  </p>
                </div>

                <div className="flex flex-wrap items-start justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSync}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    <RefreshCcw size={16} />
                    Sync
                  </button>

                  <div
                    className={`max-w-[310px] rounded-2xl border px-4 py-3 ${
                      isSynced
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <p
                      className={`text-[12px] font-semibold ${isSynced ? "text-emerald-700" : "text-blue-700"}`}
                    >
                      {statusMessage}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {syncedAt || "Waiting for sync"}
                    </p>
                  </div>
                </div>
              </div>

              <form className="mt-7 space-y-6" onSubmit={handleSubmit}>
                <label className="block max-w-[360px]">
                  <span className="mb-3 block text-[15px] font-semibold leading-6 text-slate-800">
                    Select Quarter
                  </span>
                  <div className="relative">
                    <select
                      value={form.quarter}
                      onChange={handleChange("quarter")}
                      disabled={formDisabled}
                      className="h-12 w-full appearance-none rounded-[20px] border border-slate-300 bg-white px-4 pr-12 text-[15px] text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">Select quarter</option>
                      {QUARTER_OPTIONS.map((quarter) => (
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

                <label className="block">
                  <span className="mb-3 block text-[15px] font-semibold leading-6 text-slate-800">
                    1. sale/expenses forecast formula
                  </span>
                  <textarea
                    value={form.salesExpensesForecastFormula}
                    onChange={handleChange("salesExpensesForecastFormula")}
                    disabled={formDisabled}
                    rows={4}
                    placeholder="Enter the formula or logic for sales and expense forecast"
                    className="w-full rounded-[22px] border border-slate-300 bg-white px-4 py-3.5 text-[15px] leading-6 text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-3 block text-[15px] font-semibold leading-6 text-slate-800">
                    2. GPA/OP forecast formula
                  </span>
                  <textarea
                    value={form.gpaOpForecastFormula}
                    onChange={handleChange("gpaOpForecastFormula")}
                    disabled={formDisabled}
                    rows={4}
                    placeholder="Enter the formula or logic for GPA / OP forecast"
                    className="w-full rounded-[22px] border border-slate-300 bg-white px-4 py-3.5 text-[15px] leading-6 text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-3 flex min-h-[3rem] items-end text-[15px] font-semibold leading-6 text-slate-800">
                      3. expense absolute/percentage increase
                    </span>
                    <input
                      value={form.expenseIncrease}
                      onChange={handleChange("expenseIncrease")}
                      disabled={formDisabled}
                      placeholder="Ex: 8% or 125000 absolute increase"
                      className="h-12 w-full rounded-[20px] border border-slate-300 bg-white px-4 text-[15px] text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 flex min-h-[3rem] items-end text-[15px] font-semibold leading-6 text-slate-800">
                      4. text regime and rates
                    </span>
                    <input
                      value={form.taxRegimeAndRates}
                      onChange={handleChange("taxRegimeAndRates")}
                      disabled={formDisabled}
                      placeholder="Ex: new regime with FY 2026-27 rates"
                      className="h-12 w-full rounded-[20px] border border-slate-300 bg-white px-4 text-[15px] text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[14px] leading-6 text-slate-500">
                    {isSynced
                      ? "The form is unlocked. Select a quarter, complete all four fields, and submit to generate the advanced text."
                      : "Sync is required before any formula values can be entered."}
                  </p>
                  <button
                    type="submit"
                    disabled={!readyToSubmit}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </section>

            <section className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Flow
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    "Click Sync before entering any formula values.",
                    "Select the quarter and fill all four Advanced Text input fields.",
                    "Submit to generate the Advanced Text output.",
                    "Use the download action to export the Excel file.",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-4 rounded-[22px] border border-slate-100 bg-slate-50 px-5 py-4 transition-colors duration-200 hover:bg-blue-50/70"
                    >
                      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[13px] font-semibold text-white">
                        {index + 1}
                      </span>
                      <p className="text-[15px] leading-7 text-slate-600">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <div className="border-b border-slate-100 px-7 py-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Output
                  </p>
                  <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                    Advanced Text Download
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-500">
                    Once the form is submitted, the generated advanced text will
                    be available here as a downloadable Excel file.
                  </p>
                </div>

                <div className="p-7">
                  {showDownload ? (
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-[26px] bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-6 py-5 text-base font-semibold text-white shadow-[0_18px_35px_rgba(37,99,235,0.28)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_40px_rgba(37,99,235,0.32)]"
                    >
                      <Download size={20} />
                      Download Advanced Text Excel
                    </button>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center">
                      <p className="text-[15px] font-medium leading-6 text-slate-500">
                        Submit the form to unlock the Advanced Text download
                        button.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 grid gap-3">
                    {[
                      {
                        label: "Download State",
                        value: showDownload ? "Ready" : "Locked",
                      },
                      { label: "Format", value: "Excel (.xls)" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {item.label}
                        </span>
                        <span className="text-[14px] font-semibold text-slate-700">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
