"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/auth-context";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2">
            <Badge variant="teal">Developer-First Autonomous Testing</Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Powered End-to-End Testing with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-200">
              Playwright &amp; Local LLMs
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Analyze web applications autonomously, generate deterministic Playwright test suites, execute asynchronous runs via BullMQ, and triage failures with intelligent root-cause analysis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isLoading ? (
              <div className="h-11 w-44 bg-slate-800 animate-pulse rounded-lg" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-teal-900/30">
                  Open Dashboard ({user?.name}) →
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full shadow-lg shadow-teal-900/30">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="border-t border-slate-800/80 bg-slate-900/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Built for Modern Engineering Teams
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Production-ready testing architecture with strict isolation and zero arbitrary code execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-800 flex items-center justify-center text-teal-400 font-bold">
                01
              </div>
              <h3 className="font-semibold text-slate-100 text-base">App Analyzer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Playwright scans application DOM, inputs, forms, and routes into clean structured telemetry.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold">
                02
              </div>
              <h3 className="font-semibold text-slate-100 text-base">Local AI Generation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ollama / local LLMs generate rigorous functional test cases validated strictly against Zod schemas.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 font-bold">
                03
              </div>
              <h3 className="font-semibold text-slate-100 text-base">Controlled Execution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Actions execute through safe deterministic Playwright runners without dangerous runtime evals.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 font-bold">
                04
              </div>
              <h3 className="font-semibold text-slate-100 text-base">Root Cause Triage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI diagnostic engine pinpoints root failure causes, inspects trace screenshots, and provides fixes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-850 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        AI Tester Platform • Powered by Next.js, Express, PostgreSQL, Playwright &amp; Ollama
      </footer>
    </div>
  );
}
