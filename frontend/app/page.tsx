"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/auth-context";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { AnimatedGrid } from "../components/ui/animated-grid";
import {
  Sparkles,
  ArrowRight,
  Terminal,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Bot,
  Activity,
  ChevronDown
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-6.5rem)] bg-[#f8faf7] text-slate-900 flex flex-col justify-between overflow-hidden">
      {/* Animated Technical Background Grid */}
      <AnimatedGrid />

      {/* Hero Section */}
      <section className="relative z-10 py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">

          {/* Headline matching TestSprite Editorial Style */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif tracking-tight text-slate-900 leading-[1.12]">
              Agentic Testing for <br />
              <span className="text-[#2e633f] not-italic font-sans font-extrabold">
                Every Change You Ship.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              You changed the code — did anything break? AI Tester writes the end-to-end tests you never get to, runs them on your live app, and tells you exactly what broke.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isLoading ? (
              <div className="h-11 w-44 bg-slate-200 animate-pulse rounded-xl" />
            ) : isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-[#2e633f] hover:bg-[#255234] text-white shadow-sm font-medium py-3.5 px-8 rounded-xl"
                >
                  Open Dashboard ({user?.name})
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-[#2e633f] hover:bg-[#255234] text-white shadow-sm font-medium py-3.5 px-8 rounded-xl"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto py-3.5 px-7 rounded-xl flex items-center justify-center gap-2 border-[#2e633f]/30 text-[#234e32] bg-white hover:bg-[#f2f6f0]"
                  >
                    Working in a Terminal or IDE?
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* TestSprite Copilot & CLI Interactive Telemetry Showcase Card */}
          <div className="pt-8 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[#dce3da] bg-white shadow-lg shadow-[#2e633f]/5 overflow-hidden text-left">
              {/* Card Tabs Bar */}
              <div className="bg-[#f0f4ee] px-5 py-3 border-b border-[#dce3da] flex items-center justify-between">
                <div className="flex items-center gap-6 text-xs font-semibold">
                  <span className="text-[#234e32] flex items-center gap-1.5 cursor-pointer">
                    <Bot className="w-4 h-4 text-[#2e633f]" />
                    Copilot
                  </span>
                  <span className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    CLI
                  </span>
                  <span className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer hidden sm:inline-flex">
                    <Activity className="w-4 h-4 text-slate-400" />
                    Root Cause Triage
                  </span>
                </div>
                <Badge variant="emerald" className="text-2xs font-mono">
                  Live Telemetry
                </Badge>
              </div>

              {/* Code & Assertion Preview */}
              <div className="p-5 font-mono text-xs space-y-3 bg-[#fbfcfb]">
                <div className="text-slate-500 flex items-center justify-between pb-2 border-b border-[#e5ebe3]">
                  <span>$ agy test --url=https://your-app.com --ai=ollama</span>
                  <span className="text-2xs text-[#2e633f] font-bold">● RUNNING</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#2e633f] shrink-0" />
                    <span>Headless Chromium session launched (PID 18420)</span>
                    <span className="ml-auto text-slate-400 text-2xs">24ms</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#2e633f] shrink-0" />
                    <span>Indexed application DOM: 18 buttons, 7 inputs, 4 routes</span>
                    <span className="ml-auto text-slate-400 text-2xs">82ms</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#2e633f] shrink-0" />
                    <span>Synthesized 5 end-to-end user journeys with Ollama Qwen3:4b</span>
                    <span className="ml-auto text-slate-400 text-2xs">1.2s</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#eef5ed] text-[#234e32] p-2.5 rounded-xl border border-[#cfe2cd] font-semibold">
                    <Sparkles className="w-4 h-4 text-[#2e633f] shrink-0" />
                    <span>All 5 test suites passed with zero flaky selectors</span>
                    <span className="ml-auto font-mono text-xs text-[#2e633f]">100% Pass</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="relative z-10 border-t border-[#e2e8e0] bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Built for Modern Engineering Teams
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
              Production-ready testing architecture with strict isolation, zero flaky selectors, and cloud persistence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-[#dce3da] bg-[#fbfcfb] p-6 space-y-3 shadow-xs hover:border-[#2e633f]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eef4ed] border border-[#d0dfcc] flex items-center justify-center text-[#2e633f] font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">App Analyzer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Playwright scans application DOM, inputs, forms, and routes into clean structured telemetry.
              </p>
            </Card>

            <Card className="border-[#dce3da] bg-[#fbfcfb] p-6 space-y-3 shadow-xs hover:border-[#2e633f]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eef4ed] border border-[#d0dfcc] flex items-center justify-center text-[#2e633f] font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Local AI Generation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ollama / local LLMs generate rigorous functional test cases validated strictly against Zod schemas.
              </p>
            </Card>

            <Card className="border-[#dce3da] bg-[#fbfcfb] p-6 space-y-3 shadow-xs hover:border-[#2e633f]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eef4ed] border border-[#d0dfcc] flex items-center justify-center text-[#2e633f] font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Controlled Execution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Actions execute through safe deterministic Playwright runners without dangerous runtime evals.
              </p>
            </Card>

            <Card className="border-[#dce3da] bg-[#fbfcfb] p-6 space-y-3 shadow-xs hover:border-[#2e633f]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eef4ed] border border-[#d0dfcc] flex items-center justify-center text-[#2e633f] font-bold text-sm">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base">Root Cause Triage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                AI diagnostic engine pinpoints root failure causes, inspects Supabase trace screenshots, and provides fixes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#e2e8e0] bg-[#f8faf7] py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>AI Tester Platform • Agentic Browser Testing Engine</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Next.js 15</span>
            <span>•</span>
            <span>Express</span>
            <span>•</span>
            <span>Playwright Core</span>
            <span>•</span>
            <span>Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
