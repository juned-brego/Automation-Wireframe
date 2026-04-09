'use client';

import React from 'react';
import {
  Plus,
  Bell,
  RefreshCw,
  ChevronDown,
  Clock,
  Download,
  Upload,
  Youtube,
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
  onUploadClick,
}: TopBarProps) {
  const tabIcon = TAB_ICONS[activeTab] || { icon: Grid3x3, color: 'from-blue-500 to-indigo-600' };
  const IconComponent = tabIcon.icon;

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
          <button className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </button>
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
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
              Download Sample
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          {showMergeDocument && (
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
              Merge Document
            </button>
          )}
          {showMergeDocument && (
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <Clock className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {(showMergeDocument || !showDownloadSample) && (
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="p-2 hover:bg-gray-100 rounded transition-colors">
            <Youtube className="w-5 h-5 text-red-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded transition-colors">
            <Grid3x3 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
