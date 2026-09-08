"use client";

import React from "react";
import Link from "next/link";
import { TestRun, TestRunStatus } from "../../types/test-run";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface TestRunListProps {
  projectId: string;
  testRuns: TestRun[];
  isLoading: boolean;
  onRunAll: () => Promise<void>;
  isRunningTests: boolean;
  onSelectRun: (runId: string) => void;
  hasTestCases: boolean;
}

export function getStatusBadge(status: TestRunStatus) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="emerald">COMPLETED</Badge>;
    case "RUNNING":
      return (
        <Badge variant="teal" className="animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          RUNNING
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="amber" className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          QUEUED
        </Badge>
      );
    case "FAILED":
      return <Badge variant="rose">FAILED</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
}

export function TestRunList({
  projectId,
  testRuns,
  isLoading,
  onRunAll,
  isRunningTests,
  onSelectRun,
  hasTestCases
}: TestRunListProps) {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#dce3da] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Execution History
            <Badge variant="emerald">{testRuns.length} Runs</Badge>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Asynchronously executed Playwright suites with AI failure root cause triage.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onRunAll}
          isLoading={isRunningTests}
          disabled={isRunningTests || !hasTestCases}
          className="bg-[#2e633f] hover:bg-[#234e32] text-white shadow-sm font-medium"
        >
          <svg
            width={14}
            height={14}
            className="w-3.5 h-3.5 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {isRunningTests ? "Queueing Run..." : "Run All Tests"}
        </Button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white border border-[#dce3da] rounded-2xl p-4 shadow-xs animate-pulse space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-28 bg-[#e2ece0] rounded" />
                <div className="h-4 w-16 bg-[#e2ece0] rounded" />
              </div>
              <div className="h-3.5 w-64 bg-[#eef3ec] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && testRuns.length === 0 && (
        <Card className="border-[#dce3da] bg-white border-dashed shadow-xs rounded-2xl">
          <CardContent className="p-14 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#e8f1e6] border border-[#c8dac3] flex items-center justify-center text-[#234e32]">
              <svg
                width={24}
                height={24}
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                No Test Runs Executed
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {hasTestCases
                  ? "You have generated test cases ready to execute! Click 'Run All Tests' to dispatch an automated Playwright run."
                  : "Generate test cases first in the 'Test Cases' tab, then trigger an execution."}
              </p>
            </div>
            {hasTestCases && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onRunAll}
                  className="bg-[#2e633f] hover:bg-[#234e32] text-white shadow-sm font-medium"
                >
                  Run All Tests Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Runs List */}
      {!isLoading && testRuns.length > 0 && (
        <div className="space-y-3">
          {testRuns.map((run) => {
            const summary = run.summary;
            const durationSec = summary?.durationMs
              ? (summary.durationMs / 1000).toFixed(1)
              : "0.0";

            return (
              <div
                key={run.id}
                onClick={() => onSelectRun(run.id)}
                className="group cursor-pointer bg-white hover:bg-[#fbfcfb] border border-[#dce3da] hover:border-[#b8c7b4] rounded-2xl p-4 shadow-xs transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-700 font-semibold group-hover:text-[#2e633f] transition-colors">
                      Run #{run.id.slice(-8)}
                    </span>
                    {getStatusBadge(run.status)}
                    <span className="text-2xs text-slate-400">
                      {new Date(run.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {summary && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-600 font-medium">
                        {summary.total} Tests:
                      </span>
                      {summary.passed > 0 && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          ✓ {summary.passed} Passed
                        </span>
                      )}
                      {summary.failed > 0 && (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          ✗ {summary.failed} Failed
                        </span>
                      )}
                      {summary.skipped > 0 && (
                        <span className="text-slate-400 flex items-center gap-1">
                          • {summary.skipped} Skipped
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-mono text-2xs">
                        ⏱ {durationSec}s
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-[#dce3da] bg-white text-slate-700 group-hover:border-[#b8c7b4] group-hover:text-slate-900"
                  >
                    View Details →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
