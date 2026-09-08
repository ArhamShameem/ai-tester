"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/auth-context";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Bot,
  ArrowRight,
  GitBranch,
  ChevronDown,
  User,
  LogOut,
  FolderGit2,
  ShieldCheck
} from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* TestSprite-style Top Announcement Banner */}
      <div className="bg-[#e2ece0] border-b border-[#d0dfcc] text-[#234e32] text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
          <span>The AI Tester Platform now live — <strong>agentic browser automation</strong>.</span>
          <span className="hidden sm:inline-flex items-center gap-1 hover:underline cursor-pointer">
            <GitBranch className="w-3.5 h-3.5 text-[#2e633f]" />  <Link href="https://github.com/ArhamShameem/ai-tester" target="_blank" rel="noopener noreferrer"> Star on GitHub →</Link>
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#e2e8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-slate-900 font-bold text-lg tracking-tight hover:text-[#2e633f] transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#2e633f] flex items-center justify-center text-white shadow-sm shadow-[#2e633f]/20 group-hover:bg-[#234e32] transition-colors">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold tracking-tight text-slate-900">
                AI Tester
              </span>
            </Link>
            <Badge variant="emerald" className="hidden sm:inline-flex text-2xs font-medium">
              Agentic QA
            </Badge>

            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600 pl-4 border-l border-[#e2e8e0]">
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                Projects
              </Link>
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                Test Runs
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">Playwright Core v1.63</span>
            </nav>
          </div>

          {/* Right Navigation & User Controls */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3" ref={dropdownRef}>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex text-xs font-medium text-slate-700 hover:text-[#2e633f] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  Dashboard
                </Link>

                {/* Interactive Profile Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#dce3da] hover:border-[#b8c7b4] bg-[#f8faf7] hover:bg-white transition-all cursor-pointer shadow-2xs group"
                    aria-expanded={isDropdownOpen}
                    aria-label="User menu"
                  >
                    <div
                      className="w-7 h-7 rounded-full bg-[#e8f1e6] border border-[#c8dac3] flex items-center justify-center text-[#234e32] font-bold text-xs"
                    >
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[110px] truncate">
                        {user.name}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:text-slate-600 ${
                        isDropdownOpen ? "rotate-180 text-[#2e633f]" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#dce3da] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                      {/* User Info Header */}
                      <div className="p-3 bg-[#f8faf7] rounded-xl border border-[#e2e8e0] mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#e8f1e6] border border-[#c8dac3] flex items-center justify-center text-[#234e32] font-bold text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-2xs text-slate-500 truncate" title={user.email}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-[#e2e8e0] flex items-center justify-between text-2xs">
                          <span className="text-slate-500">Status</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#2e633f]">
                            <ShieldCheck className="w-3 h-3" /> Active Session
                          </span>
                        </div>
                      </div>

                      {/* Navigation Items */}
                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-[#f1f5ef] rounded-lg transition-colors"
                        >
                          <FolderGit2 className="w-4 h-4 text-[#2e633f]" />
                          Projects Dashboard
                        </Link>
                      </div>

                      <div className="my-1.5 border-t border-[#e5ebe3]" />

                      {/* Sign Out Action */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs bg-[#2e633f] hover:bg-[#255234] text-white shadow-sm font-medium"
                  >
                    Get Started Free
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
