"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronDown,
  Grid3x3,
  Landmark,
  ReceiptText,
  ShoppingCart,
  WalletCards,
} from "lucide-react";

type CompanyOption = {
  id: string;
  name: string;
  shortName: string;
  period: string;
};

type RangeKey = "today" | "last7" | "month" | "last6" | "custom";

type VoucherStats = {
  sales: number;
  purchase: number;
  expenses: number;
  bank: number;
};

type ImportantDate = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  owner: string;
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

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 days" },
  { key: "month", label: "This month" },
  { key: "last6", label: "Last 6 months" },
  { key: "custom", label: "Custom range" },
];

const RANGE_DATA: Record<Exclude<RangeKey, "custom">, VoucherStats> = {
  today: {
    sales: 250,
    purchase: 210,
    expenses: 100,
    bank: 120,
  },
  last7: {
    sales: 1285,
    purchase: 1040,
    expenses: 485,
    bank: 692,
  },
  month: {
    sales: 4320,
    purchase: 3710,
    expenses: 1685,
    bank: 2240,
  },
  last6: {
    sales: 24880,
    purchase: 21140,
    expenses: 9420,
    bank: 13560,
  },
};

const IMPORTANT_DATES: ImportantDate[] = [
  {
    id: "gstr1",
    title: "GSTR-1 filing",
    description: "Outward supply return due for the active GST period.",
    dueDate: "2026-04-27",
    owner: "GST",
  },
  {
    id: "gstr3b",
    title: "GSTR-3B filing",
    description: "Monthly summary return and tax payment checkpoint.",
    dueDate: "2026-04-20",
    owner: "GST",
  },
  {
    id: "tds",
    title: "TDS filing",
    description: "Quarterly TDS data should be prepared and submitted.",
    dueDate: "2026-04-15",
    owner: "TDS",
  },
  {
    id: "review",
    title: "Review due",
    description: "Monthly hygiene review for accounting controls.",
    dueDate: "2026-04-07",
    owner: "Review",
  },
];

const TODAY = new Date("2026-04-24T12:00:00+05:30");

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const formatDisplayDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00+05:30`));

const getDateDistance = (date: string) => {
  const target = new Date(`${date}T00:00:00+05:30`);
  const todayStart = new Date(
    TODAY.getFullYear(),
    TODAY.getMonth(),
    TODAY.getDate(),
  );
  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.round(
    (targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );
};

const getRangeLabel = (
  range: RangeKey,
  customStart: string,
  customEnd: string,
) => {
  if (range === "custom") {
    return `${formatDisplayDate(customStart)} - ${formatDisplayDate(customEnd)}`;
  }

  if (range === "today") return "24 Apr 2026";
  if (range === "last7") return "18 Apr 2026 - 24 Apr 2026";
  if (range === "month") return "01 Apr 2026 - 24 Apr 2026";
  return "01 Nov 2025 - 24 Apr 2026";
};

const getCustomStats = (customStart: string, customEnd: string) => {
  const start = new Date(`${customStart}T00:00:00+05:30`);
  const end = new Date(`${customEnd}T00:00:00+05:30`);
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  return {
    sales: days * 236,
    purchase: days * 198,
    expenses: days * 88,
    bank: days * 116,
  };
};

export default function DashboardSection() {
  const [range, setRange] = useState<RangeKey>("today");
  const [customStart, setCustomStart] = useState("2026-04-01");
  const [customEnd, setCustomEnd] = useState("2026-04-24");
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption>(
    COMPANY_OPTIONS[0],
  );
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
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

  const voucherStats = useMemo(() => {
    if (range === "custom") return getCustomStats(customStart, customEnd);
    return RANGE_DATA[range];
  }, [customEnd, customStart, range]);

  const voucherCards = [
    {
      id: "sales",
      title: "Sales vouchers",
      value: voucherStats.sales,
      label: "Sales punched",
      icon: ReceiptText,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      id: "purchase",
      title: "Purchase vouchers",
      value: voucherStats.purchase,
      label: "Purchase punched",
      icon: ShoppingCart,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      id: "expenses",
      title: "Expense vouchers",
      value: voucherStats.expenses,
      label: "Expenses punched",
      icon: WalletCards,
      color: "from-orange-500 to-amber-500",
      bg: "bg-orange-50",
      text: "text-orange-700",
    },
    {
      id: "bank",
      title: "Bank vouchers",
      value: voucherStats.bank,
      label: "Bank entries punched",
      icon: Landmark,
      color: "from-slate-700 to-slate-950",
      bg: "bg-slate-100",
      text: "text-slate-800",
    },
  ];

  const totalVouchers =
    voucherStats.sales +
    voucherStats.purchase +
    voucherStats.expenses +
    voucherStats.bank;

  return (
    <div className="flex h-full flex-col bg-[#f5f7fb]">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Grid3x3 size={16} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
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
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="p-7">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-blue-600">
                      Daily Voucher Pulse
                    </p>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">
                      Dashboard
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      Track how many vouchers were punched for the selected
                      range. The dashboard opens on today by default and can be
                      changed to weekly, monthly, six-month, or custom views.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-right">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-500">
                      Total vouchers
                    </p>
                    <p className="mt-1 text-3xl font-black text-blue-700">
                      {formatNumber(totalVouchers)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {getRangeLabel(range, customStart, customEnd)}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  {RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setRange(option.key)}
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                        range === option.key
                          ? "border-blue-600 bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {range === "custom" && (
                  <div className="mt-4 grid max-w-xl gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                    <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      From date
                      <input
                        type="date"
                        value={customStart}
                        onChange={(event) => setCustomStart(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none focus:border-blue-500"
                      />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      To date
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(event) => setCustomEnd(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-800 outline-none focus:border-blue-500"
                      />
                    </label>
                  </div>
                )}

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {voucherCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <article
                        key={card.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                      >
                        <div
                          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`}
                        />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-700">
                              {card.title}
                            </p>
                            <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
                              {formatNumber(card.value)}
                            </p>
                          </div>
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg} ${card.text}`}
                          >
                            <Icon size={21} />
                          </div>
                        </div>
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {card.label}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="border-t border-slate-200 bg-slate-950 p-7 text-white xl:border-l xl:border-t-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-blue-300">
                      Important Dates
                    </p>
                    <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                      Filing calendar
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                    <CalendarDays size={21} />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {IMPORTANT_DATES.map((item) => {
                    const distance = getDateDistance(item.dueDate);
                    const isOverdue = distance < 0;
                    const isDueSoon = distance >= 0 && distance <= 5;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-white">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-300">
                              {item.description}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              isOverdue
                                ? "bg-rose-500/15 text-rose-200"
                                : isDueSoon
                                  ? "bg-amber-400/15 text-amber-200"
                                  : "bg-emerald-400/15 text-emerald-200"
                            }`}
                          >
                            {isOverdue
                              ? `${Math.abs(distance)}d overdue`
                              : distance === 0
                                ? "Due today"
                                : `${distance}d left`}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                          <span className="font-semibold text-slate-400">
                            {item.owner}
                          </span>
                          <span className="font-bold text-white">
                            {formatDisplayDate(item.dueDate)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
