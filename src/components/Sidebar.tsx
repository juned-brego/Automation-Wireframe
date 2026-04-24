"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Grid3x3,
  Link2,
  LogOut,
  Settings,
  Table,
  Upload,
  UserRound,
} from "lucide-react";

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

const mainMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: Grid3x3 },
  { id: "bulk-upload", label: "Bulk Upload", icon: Upload },
  { id: "transactions", label: "Transactions", icon: Link2 },
  { id: "master", label: "Master", icon: Table },
  { id: "gst", label: "GST", icon: Calculator },
  { id: "review", label: "Review", icon: CheckCircle2 },
  { id: "tds-filing", label: "TDS Filing", icon: FileSpreadsheet },
  { id: "mis-report", label: "MIS Report", icon: FileSpreadsheet },
  { id: "advanced-text", label: "Advanced Text", icon: FileText },
];

export default function Sidebar({
  activePage = "bulk-upload",
  onNavigate,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => {
        setCollapsed(true);
        setProfileMenuOpen(false);
      }}
      className={`flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? "w-[72px]" : "w-[224px]"
      }`}
    >
      <div
        className={`border-b border-slate-100 py-4 transition-all duration-200 ${
          collapsed ? "px-3" : "px-5"
        }`}
      >
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <img
            src={collapsed ? "/logo-circle.svg" : "/logo-full.svg"}
            alt="Brego"
            className={`object-contain transition-all duration-200 ${
              collapsed ? "h-10 w-10" : "h-7 w-auto max-w-[160px]"
            }`}
          />
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p
          className={`overflow-hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-all duration-200 ${
            collapsed ? "max-h-0 opacity-0" : "max-h-8 opacity-100"
          }`}
        >
          Workspace
        </p>
        <div className="space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`group flex w-full items-center rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                } ${collapsed ? "justify-center" : "gap-3"}`}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isActive
                      ? "border-blue-100 bg-white text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 group-hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span
                  className={`overflow-hidden whitespace-nowrap font-medium transition-all duration-200 ${
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div
        ref={profileMenuRef}
        className={`relative border-t border-slate-100 py-4 transition-all duration-200 ${
          collapsed ? "px-3" : "px-4"
        }`}
      >
        {profileMenuOpen && (
          <div className="absolute bottom-[76px] left-3 right-3 z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 text-sm font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)]">
                  JS
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    Juned Sayyed
                  </p>
                  <p className="truncate text-xs font-medium text-slate-500">
                    juned@bregobusiness.com
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <UserRound size={17} className="text-slate-500" />
                Profile
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Settings size={17} className="text-slate-500" />
                Settings
              </button>
            </div>

            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileMenuOpen((current) => !current)}
          className={`group flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 p-2 text-left transition-all hover:border-blue-200 hover:bg-blue-50 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
          title={collapsed ? "Juned Sayyed" : undefined}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 text-sm font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)]">
            JS
          </span>
          <span
            className={`min-w-0 overflow-hidden transition-all duration-200 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <span className="block truncate text-sm font-black text-slate-900">
              Juned Sayyed
            </span>
            <span className="block truncate text-xs font-semibold text-slate-500">
              Account settings
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
