"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";

import { AnimatedGrid } from "../ui/animated-grid";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-[#f8faf7] text-slate-700 overflow-hidden">
        <AnimatedGrid />
        <div className="relative z-10 flex flex-col items-center gap-4 bg-white/85 backdrop-blur-xs px-8 py-7 rounded-2xl border border-[#dce3da] shadow-xs">
          <div className="w-10 h-10 border-3 border-[#2e633f]/20 border-t-[#2e633f] rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold tracking-tight text-slate-800">Authenticating session...</p>
            <p className="text-xs text-slate-500">Verifying secure credentials</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
