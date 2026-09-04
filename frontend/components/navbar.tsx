"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/auth-context";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-100 font-bold text-lg tracking-tight hover:text-teal-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-900/30">
              <svg
                width={16}
                height={16}
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span>AI Tester</span>
          </Link>
          <Badge variant="teal" className="hidden sm:inline-flex">
            Dev Preview
          </Badge>
        </div>

        {/* Right side navigation & user section */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded-md" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-slate-300 hover:text-white transition-colors font-medium px-2 py-1"
              >
                Dashboard
              </Link>

              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                <div
                  className="w-8 h-8 rounded-full bg-teal-900/80 border border-teal-700/60 flex items-center justify-center text-teal-200 font-bold text-xs"
                  title={user.email}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-slate-200 truncate max-w-[140px]">
                    {user.name}
                  </div>
                  <div className="text-slate-500 truncate max-w-[140px]">
                    {user.email}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
