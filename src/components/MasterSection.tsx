"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookText,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  GitBranch,
  Search,
} from "lucide-react";

type MasterTab = "Ledger" | "Item" | "Rule List";

interface LedgerRow {
  id: number;
  srNo: number;
  name: string;
  under: string;
  gstNo: string;
  integratedTax: string;
  status: "Saved" | "Draft";
}

interface ItemRow {
  id: number;
  srNo: number;
  name: string;
  category: string;
  description: string;
  units: string;
  applicableDate: string;
  value: string;
  taxRate: string;
  hsn: string;
  status: "Saved" | "Draft";
}

interface RuleRow {
  id: number;
  srNo: number;
  companyName: string;
  bankName: string;
  totalRules: number;
}

interface RuleDetail {
  id: number;
  srNo: number;
  rule: string;
  description: string;
  from: string;
  to: string;
  ledger: string;
  type: string;
}

const MASTER_TABS: MasterTab[] = ["Ledger", "Item", "Rule List"];

const TAB_TO_SLUG: Record<MasterTab, string> = {
  Ledger: "ledger",
  Item: "item",
  "Rule List": "rule-list",
};

const SLUG_TO_TAB: Record<string, MasterTab> = {
  ledger: "Ledger",
  item: "Item",
  "rule-list": "Rule List",
};

const LEDGER_SEED: Omit<LedgerRow, "id" | "srNo">[] = [
  {
    name: "1 MAGNOLIA LANE",
    under: "Sundry Creditors",
    gstNo: "07ABTPC1768M1Z4",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "AISHWARYA AALESH AVLANI",
    under: "Capital Account",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "ALDIVO CREATIVE PRODUCTS PVT.LTD",
    under: "Sundry Creditors",
    gstNo: "07AAOCA8714E1ZL",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "AMP Fitness LLP",
    under: "Sundry Creditors",
    gstNo: "27ABGFA3922Q1Z2",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "ANEESH ASHIT SHETH",
    under: "Capital Account",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Accounting Expenses",
    under: "Indirect Expenses",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Acquisory India Consulting Pvt Ltd",
    under: "Sundry Creditors",
    gstNo: "27AAICA6372N1Z4",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Adani Electricity Mumbai Ltd",
    under: "Indirect Expenses",
    gstNo: "27AAACA4798L1ZF",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Adhiraj Patel Loan - 12% Annually",
    under: "Unsecured Loans",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Adhiraj Patel Share Capital",
    under: "Capital Account",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Advertisment & Marketing Expenses",
    under: "Events & Marketing Expense",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Alibaba.Com",
    under: "Sundry Creditors",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Amazon",
    under: "Sundry Creditors",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Amazon Seller Services Private Limited",
    under: "Sundry Creditors",
    gstNo: "29AAICA3918J1ZE",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Anusha Sudhanshu Kala",
    under: "Sundry Creditors",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Anushree Vaza",
    under: "Sundry Creditors",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Apple - USB Adapter",
    under: "Fixed Assets",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Apple India Private Limited",
    under: "Sundry Creditors",
    gstNo: "29AABCA1906H1ZY",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Ashmita Mangharam",
    under: "Sundry Creditors",
    gstNo: "-",
    integratedTax: "-",
    status: "Saved",
  },
  {
    name: "Aves Products Private Limited",
    under: "Sundry Creditors",
    gstNo: "06AAVCA5575G1Z7",
    integratedTax: "-",
    status: "Saved",
  },
];

const LEDGER_ROWS: LedgerRow[] = Array.from({ length: 181 }, (_, index) => {
  const seed = LEDGER_SEED[index % LEDGER_SEED.length];
  const cycle = Math.floor(index / LEDGER_SEED.length);

  return {
    id: index + 1,
    srNo: index + 1,
    name: cycle === 0 ? seed.name : `${seed.name} ${cycle + 1}`,
    under: seed.under,
    gstNo: seed.gstNo,
    integratedTax: seed.integratedTax,
    status: seed.status,
  };
});

const ITEM_ROWS: ItemRow[] = [
  {
    id: 1,
    srNo: 1,
    name: "Products",
    category: "Not Applicable",
    description: "-",
    units: "Nos",
    applicableDate: "01/04/2025",
    value: "-",
    taxRate: "-",
    hsn: "-",
    status: "Saved",
  },
  {
    id: 2,
    srNo: 2,
    name: "Purchase of Punch2.0 Smart",
    category: "Not Applicable",
    description: "-",
    units: "Not Applicable",
    applicableDate: "01/04/2025",
    value: "-",
    taxRate: "-",
    hsn: "-",
    status: "Saved",
  },
];

const RULE_ROWS: RuleRow[] = [
  {
    id: 1,
    srNo: 1,
    companyName: "PAARIJAAT PERSONAL CARE PRIVATE LIMITED (100000)",
    bankName: "HDFC",
    totalRules: 11,
  },
];

const RULE_DETAILS: Record<number, RuleDetail[]> = {
  1: [
    {
      id: 1,
      srNo: 1,
      rule: "Auto",
      description: "TELE",
      from: "0",
      to: "0",
      ledger: "Telephone Expenses",
      type: "-",
    },
    {
      id: 2,
      srNo: 2,
      rule: "Auto",
      description: "please",
      from: "0",
      to: "0",
      ledger: "Please See Advertising Pvt. Ltd",
      type: "-",
    },
    {
      id: 3,
      srNo: 3,
      rule: "Auto",
      description: "tarin",
      from: "0",
      to: "0",
      ledger: "Tarini Naidu",
      type: "-",
    },
    {
      id: 4,
      srNo: 4,
      rule: "Auto",
      description: "zoho",
      from: "0",
      to: "0",
      ledger: "ZOHO Corporation Private Limited",
      type: "-",
    },
    {
      id: 5,
      srNo: 5,
      rule: "Auto",
      description: "googl",
      from: "0",
      to: "0",
      ledger: "Google India Private Limited",
      type: "-",
    },
    {
      id: 6,
      srNo: 6,
      rule: "Auto",
      description: "onsglo",
      from: "0",
      to: "0",
      ledger: "ONS GLOBAL COMPLIANCES SERVICES",
      type: "-",
    },
    {
      id: 7,
      srNo: 7,
      rule: "Auto",
      description: "RAZORP",
      from: "0",
      to: "0",
      ledger: "Razorpay",
      type: "-",
    },
    {
      id: 8,
      srNo: 8,
      rule: "Auto",
      description: "god",
      from: "0",
      to: "0",
      ledger: "GODADDY",
      type: "-",
    },
    {
      id: 9,
      srNo: 9,
      rule: "Auto",
      description: "link",
      from: "0",
      to: "0",
      ledger: "LinkedIn Singapore Pte Ltd",
      type: "-",
    },
    {
      id: 10,
      srNo: 10,
      rule: "Auto",
      description: "inter",
      from: "0",
      to: "0",
      ledger: "Software & Technology Expenses",
      type: "-",
    },
    {
      id: 11,
      srNo: 11,
      rule: "Auto",
      description: "paya",
      from: "0",
      to: "0",
      ledger: "Payal Savla Designs",
      type: "-",
    },
  ],
};

const TAB_META = {
  Ledger: {
    icon: BookText,
    accent: "bg-indigo-100 text-indigo-700",
    description:
      "Manage ledgers mapped for sync and review master records before sending to Tally.",
  },
  Item: {
    icon: Box,
    accent: "bg-amber-100 text-amber-700",
    description:
      "Review stock item masters, units, tax settings, and saved item definitions.",
  },
  "Rule List": {
    icon: GitBranch,
    accent: "bg-emerald-100 text-emerald-700",
    description:
      "Track company banking rules and audit how many automated rules are active.",
  },
} satisfies Record<
  MasterTab,
  {
    icon: typeof BookText;
    accent: string;
    description: string;
  }
>;

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}

function paginateRows<T>(rows: T[], currentPage: number, pageSize: number) {
  const start = (currentPage - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

function getStatusClass(status: "Saved" | "Draft") {
  return status === "Saved"
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
}

export default function MasterSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab =
    SLUG_TO_TAB[searchParams.get("tab") || "ledger"] || "Ledger";

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedUnderFilters, setSelectedUnderFilters] = useState<string[]>(
    [],
  );
  const [isUnderFilterOpen, setIsUnderFilterOpen] = useState(false);
  const underFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery("");
    setCurrentPage(1);
    setSelectedUnderFilters([]);
    setIsUnderFilterOpen(false);
  }, [activeTab]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        underFilterRef.current &&
        !underFilterRef.current.contains(event.target as Node)
      ) {
        setIsUnderFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const underOptions = Array.from(
    new Set(LEDGER_ROWS.map((row) => row.under)),
  ).sort();

  const filteredLedgerRows = LEDGER_ROWS.filter((row) => {
    const matchesSearch = row.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesUnder =
      selectedUnderFilters.length === 0 ||
      selectedUnderFilters.includes(row.under);

    return matchesSearch && matchesUnder;
  });

  const filteredItemRows = ITEM_ROWS.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeRuleDetails = RULE_DETAILS[RULE_ROWS[0]?.id ?? 1] || [];
  const filteredRuleDetails = activeRuleDetails.filter((rule) => {
    const value = searchQuery.toLowerCase();

    return (
      rule.rule.toLowerCase().includes(value) ||
      rule.description.toLowerCase().includes(value) ||
      rule.ledger.toLowerCase().includes(value) ||
      rule.type.toLowerCase().includes(value)
    );
  });

  const filteredCount =
    activeTab === "Ledger"
      ? filteredLedgerRows.length
      : activeTab === "Item"
        ? filteredItemRows.length
        : filteredRuleDetails.length;

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visiblePages = getVisiblePages(currentPage, totalPages);
  const visibleLedgerRows = paginateRows(
    filteredLedgerRows,
    currentPage,
    pageSize,
  );
  const visibleItemRows = paginateRows(filteredItemRows, currentPage, pageSize);
  const visibleRuleDetails = paginateRows(
    filteredRuleDetails,
    currentPage,
    pageSize,
  );
  const meta = TAB_META[activeTab];
  const ActiveIcon = meta.icon;
  const searchPlaceholder =
    activeTab === "Rule List" ? "Search rules" : "Search by Name";

  const setTab = (tab: MasterTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", TAB_TO_SLUG[tab]);
    router.replace(`/app/da/master?${params.toString()}`);
  };

  const toggleUnderFilter = (value: string) => {
    setSelectedUnderFilters((currentFilters) =>
      currentFilters.includes(value)
        ? currentFilters.filter((filterValue) => filterValue !== value)
        : [...currentFilters, value],
    );
    setCurrentPage(1);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.accent}`}
            >
              <ActiveIcon className="h-6 w-6" />
            </div>

            <div className="min-w-[220px]">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">
                  {activeTab}
                </h1>
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {filteredCount}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex max-w-[320px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300">
              <span className="truncate">
                PAARIJAAT PERSONAL CARE PRIVATE LIMITED
              </span>
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {MASTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-sm py-2 md:w-[340px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex-1 overflow-auto">
            {activeTab === "Ledger" && (
              <div className="min-w-[920px]">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      <th className="px-4 py-3">Sr.No.</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">
                        <div
                          ref={underFilterRef}
                          className="relative inline-flex items-center gap-2"
                        >
                          <span>Under</span>
                          <button
                            onClick={() =>
                              setIsUnderFilterOpen((open) => !open)
                            }
                            className={`rounded-md p-1 transition ${
                              selectedUnderFilters.length > 0
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>

                          {isUnderFilterOpen && (
                            <div className="absolute left-0 top-full z-20 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                              <button
                                onClick={() => {
                                  setSelectedUnderFilters([]);
                                  setCurrentPage(1);
                                }}
                                className={`mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                                  selectedUnderFilters.length === 0
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                              >
                                <span>All</span>
                                <span>{LEDGER_ROWS.length}</span>
                              </button>

                              <div className="max-h-72 space-y-1 overflow-auto pr-1">
                                {underOptions.map((option) => {
                                  const checked =
                                    selectedUnderFilters.includes(option);

                                  return (
                                    <label
                                      key={option}
                                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          toggleUnderFilter(option)
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                      />
                                      <span className="flex-1">{option}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3">GST No</th>
                      <th className="px-4 py-3">Integrated Tax</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLedgerRows.map((row) => {
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">{row.srNo}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {row.name}
                          </td>
                          <td className="px-4 py-3">{row.under}</td>
                          <td className="px-4 py-3">{row.gstNo}</td>
                          <td className="px-4 py-3">{row.integratedTax}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "Item" && (
              <div className="min-w-[1100px]">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      <th className="px-4 py-3">Sr.No.</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Units</th>
                      <th className="px-4 py-3">Applicable Date</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Tax Rate</th>
                      <th className="px-4 py-3">HSN</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItemRows.map((row) => {
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">{row.srNo}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {row.name}
                          </td>
                          <td className="px-4 py-3">{row.category}</td>
                          <td className="px-4 py-3">{row.description}</td>
                          <td className="px-4 py-3">{row.units}</td>
                          <td className="px-4 py-3">{row.applicableDate}</td>
                          <td className="px-4 py-3">{row.value}</td>
                          <td className="px-4 py-3">{row.taxRate}</td>
                          <td className="px-4 py-3">{row.hsn}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "Rule List" && (
              <div className="min-w-[980px]">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      <th className="px-4 py-3">Sr. No.</th>
                      <th className="px-4 py-3">Rule</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">From</th>
                      <th className="px-4 py-3">To</th>
                      <th className="px-4 py-3">Ledger</th>
                      <th className="px-4 py-3">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRuleDetails.map((rule) => (
                      <tr
                        key={rule.id}
                        className="border-b border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">{rule.srNo}</td>
                        <td className="px-4 py-3">{rule.rule}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {rule.description}
                        </td>
                        <td className="px-4 py-3">{rule.from}</td>
                        <td className="px-4 py-3">{rule.to}</td>
                        <td className="px-4 py-3">{rule.ledger}</td>
                        <td className="px-4 py-3">{rule.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredCount === 0 && (
              <div className="flex h-[320px] items-center justify-center px-6 text-center">
                <div>
                  <p className="text-base font-medium text-slate-800">
                    No matching records found
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try adjusting the search term or switch to another master
                    tab.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Page Size</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${
                    currentPage === page
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              {totalPages > visiblePages[visiblePages.length - 1] && (
                <span className="px-1 text-sm text-slate-400">...</span>
              )}

              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
