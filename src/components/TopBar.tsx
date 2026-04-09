'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  RefreshCw,
  ChevronDown,
  Info,
  Download,
  Upload,
  Grid3x3,
  Landmark,
  ShoppingCart,
  CornerDownLeft,
  PackageCheck,
  PackageX,
  BookOpen,
  BookText,
  Box,
  type LucideIcon,
} from 'lucide-react';

// Map of tab icons with distinct colors
export const TAB_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  Banking: { icon: Landmark, color: 'from-blue-500 to-blue-700' },
  Sales: { icon: ShoppingCart, color: 'from-green-500 to-green-700' },
  'Sales-Return': { icon: CornerDownLeft, color: 'from-orange-500 to-orange-700' },
  Purchase: { icon: PackageCheck, color: 'from-purple-500 to-purple-700' },
  'Purchase-Return': { icon: PackageX, color: 'from-red-500 to-red-700' },
  Journal: { icon: BookOpen, color: 'from-teal-500 to-teal-700' },
  Ledger: { icon: BookText, color: 'from-indigo-500 to-indigo-700' },
  Items: { icon: Box, color: 'from-amber-500 to-amber-700' },
};

interface TopBarProps {
  title: string;
  badgeCount?: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: string[];
  showMergeDocument?: boolean;
  showDownloadSample?: boolean;
  selectedCount?: number;
  onUploadClick?: () => void;
}

export default function TopBar({
  title,
  badgeCount,
  activeTab,
  onTabChange,
  tabs,
  showMergeDocument = false,
  showDownloadSample = false,
  selectedCount = 0,
  onUploadClick,
}: TopBarProps) {
  const tabIcon = TAB_ICONS[activeTab] || { icon: Grid3x3, color: 'from-blue-500 to-indigo-600' };
  const IconComponent = tabIcon.icon;
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setDownloadDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col bg-white">
      {/* Top Header Bar */}
      <div className="h-[50px] border-b border-gray-200 px-6 flex items-center justify-between">
        {/* Left side: Icon + Title + Badge */}
        <div className="flex items-center gap-3">
          {/* Dynamic icon per tab */}
          <div className={`w-8 h-8 bg-gradient-to-br ${tabIcon.color} rounded flex items-center justify-center`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>

          {/* Title + Badge */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            {badgeCount !== undefined && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                {badgeCount}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Action buttons + Company info */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition-colors">
            <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
              PAARIJAAT PERSONAL CARE PRIVATE...
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-indigo-500 border-indigo-500'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {showDownloadSample && (
            <div className="relative" ref={downloadRef}>
              <button
                onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {downloadDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-20">
                  <button
                    onClick={() => setDownloadDropdownOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-400" />
                    Sample item invoice (with item)
                  </button>
                  <button
                    onClick={() => setDownloadDropdownOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-400" />
                    Accounting invoice (without item)
                  </button>
                </div>
              )}
            </div>
          )}
          {showMergeDocument && (
            <button
              disabled={selectedCount < 2}
              className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-medium rounded transition-colors ${
                selectedCount >= 2
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                  : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              Merge Document
            </button>
          )}
          {showMergeDocument && (
            <div className="relative group">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                <Info className="w-4.5 h-4.5 text-gray-500" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 text-white text-[11px] rounded-lg px-3 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 shadow-lg">
                Select same bank file to merge the transactions into one.
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 rotate-45" />
              </div>
            </div>
          )}
          {(showMergeDocument || !showDownloadSample) && (
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
