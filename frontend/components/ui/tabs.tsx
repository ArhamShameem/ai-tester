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
    <div className={`border-b border-slate-800 ${className}`}>
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
                  ? "border-teal-500 text-teal-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {tab.icon && (
                <span
                  className={isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-400"}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-2xs rounded-full font-mono font-medium ${
                    isActive
                      ? "bg-teal-950 text-teal-300 border border-teal-800"
                      : "bg-slate-800 text-slate-400"
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
