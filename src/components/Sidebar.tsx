'use client';

import React from 'react';
import {
  Home,
  FileText,
  DollarSign,
  Settings,
  MessageCircle,
  CheckSquare,
  HardDrive,
  HelpCircle,
  Grid3x3,
  Upload,
  Link2,
  Table,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export default function Sidebar({ activePage = 'bulk-upload', onNavigate }: SidebarProps) {
  const iconBarItems = [
    { id: 'home', icon: Home, label: 'Home', badge: null },
    { id: 'data-entry', icon: FileText, label: 'Data Entry', badge: null },
    { id: 'gst', icon: DollarSign, label: 'GST', badge: 'BETA' },
    { id: 'chat', icon: MessageCircle, label: 'Chat', badge: 'BETA' },
    { id: 'task', icon: CheckSquare, label: 'Task', badge: 'BETA' },
    { id: 'drive', icon: HardDrive, label: 'Drive', badge: null },
  ];

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Grid3x3 },
    { id: 'bulk-upload', label: 'Bulk Upload', icon: Upload },
    { id: 'transactions', label: 'Transactions', icon: Link2 },
    { id: 'master', label: 'Master', icon: Table },
    { id: 'learn', label: 'Learn More', icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Icon Bar */}
      <div className="w-[50px] bg-[#1E1B4B] flex flex-col items-center py-3 gap-3">
        {/* Logo Area */}
        <div className="flex items-center justify-center w-full mb-1 px-1">
          <img src="/logo-circle.svg" alt="Logo" className="w-9 h-9" />
        </div>

        {/* Icon Buttons */}
        <div className="flex flex-col gap-4">
          {iconBarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'data-entry';

            return (
              <div key={item.id} className="relative group">
                <button
                  className={`p-2 rounded transition-colors relative ${
                    isActive
                      ? 'bg-[#2D2655] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon size={18} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[7px] font-bold px-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Icons */}
        <div className="flex flex-col gap-4 mt-auto">
          <button
            className="p-2 rounded text-gray-400 hover:text-white transition-colors"
            title="Help"
          >
            <HelpCircle size={18} />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold hover:bg-indigo-700 transition-colors"
            title="User Profile"
          >
            J
          </button>
        </div>
      </div>

      {/* Main Sidebar */}
      <div className="w-[140px] bg-white border-r border-gray-200 py-6 px-0">
        <nav className="space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-sm ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
