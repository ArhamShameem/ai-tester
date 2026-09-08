"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div className={`border-b border-[#dce3da] ${className}`}>
      <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              type="button"
              className={`group inline-flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-[#2e633f] text-[#2e633f] font-semibold"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-[#c8dac3]"
              }`}
            >
              {tab.icon && (
                <span
                  className={isActive ? "text-[#2e633f]" : "text-slate-400 group-hover:text-slate-600"}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-2xs rounded-full font-mono font-medium ${
                    isActive
                      ? "bg-[#e2ece0] text-[#234e32] border border-[#c8dac3]"
                      : "bg-[#f1f5ef] text-slate-600 border border-[#e2e8e0]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
