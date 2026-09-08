"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TestRun, TestResult, FailureAnalysis } from "../../types/test-run";
import { testRunApi, API_BASE_URL } from "../../lib/api";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Alert } from "../ui/alert";
import { getStatusBadge } from "./test-run-list";

interface TestRunDetailProps {
  runId: string;
  onBack?: () => void;
}

export function TestRunDetail({ runId, onBack }: TestRunDetailProps) {
  const [run, setRun] = useState<TestRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [expandedRawJson, setExpandedRawJson] = useState<Record<string, boolean>>({});

  const fetchRun = useCallback(async () => {
    try {
      const data = await testRunApi.getTestRun(runId);
      setRun(data.testRun);
      setError(null);
      return data.testRun;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load test run details");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [runId]);

  // Initial fetch + polling while PENDING or RUNNING
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    const poll = async () => {
      const currentRun = await fetchRun();
      if (
        currentRun &&
        (currentRun.status === "PENDING" || currentRun.status === "RUNNING")
      ) {
        timerId = setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [fetchRun]);

  const toggleRawJson = (resultId: string) => {
    setExpandedRawJson((prev) => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

  const getFullScreenshotUrl = (pathOrUrl: string) => {
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      return pathOrUrl;
    }
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
    const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return `${backendOrigin}${cleanPath}`;
  };

  if (isLoading && !run) {
    return (
      <div className="space-y-6">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-900">
            ← Back to Runs List
          </Button>
        )}
        <div className="h-32 bg-white border border-[#dce3da] rounded-2xl p-6 shadow-xs animate-pulse" />
        <div className="h-64 bg-white border border-[#dce3da] rounded-2xl p-6 shadow-xs animate-pulse" />
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="space-y-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-900">
            ← Back to Runs List
          </Button>
        )}
        <Alert variant="error" title="Failed to Load Test Run">
          {error || "Run not found"}
        </Alert>
      </div>
    );
  }

  const summary = run.summary;
  const isLive = run.status === "PENDING" || run.status === "RUNNING";
  const durationSec = summary?.durationMs
    ? (summary.durationMs / 1000).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            ← Back to Runs List
          </Button>
        )}
        {isLive && (
          <span className="text-xs text-[#2e633f] flex items-center gap-2 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2e633f] animate-ping" />
            Live polling execution status...
          </span>
        )}
      </div>

      {/* Overview Banner */}
      <div className="bg-white border border-[#dce3da] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 font-mono truncate">
                Run #{run.id}
              </h2>
              {getStatusBadge(run.status)}
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 min-w-0 max-w-full">
              <span className="shrink-0 font-medium">Target:</span>
              <span
                className="text-[#2e633f] font-mono break-all line-clamp-1 max-w-xl inline-block bg-[#f1f5ef] px-2 py-0.5 rounded border border-[#dce3da]"
                title={run.project?.url}
              >
                {run.project?.url || "N/A"}
              </span>
              <span className="shrink-0">•</span>
              <span className="shrink-0">Created {new Date(run.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-[#f8faf7] border border-[#e2e8e0] rounded-xl p-3">
            <div className="text-2xs font-semibold uppercase text-slate-500">
              Total Tests
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {summary?.total ?? 0}
            </div>
          </div>
          <div className="bg-[#f0f7ef] border border-[#cbe2ca] rounded-xl p-3">
            <div className="text-2xs font-semibold uppercase text-emerald-700">
              Passed
            </div>
            <div className="text-xl font-bold text-emerald-700 mt-1">
              {summary?.passed ?? 0}
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
            <div className="text-2xs font-semibold uppercase text-rose-700">
              Failed
            </div>
            <div className="text-xl font-bold text-rose-700 mt-1">
              {summary?.failed ?? 0}
            </div>
          </div>
          <div className="bg-[#f8faf7] border border-[#e2e8e0] rounded-xl p-3">
            <div className="text-2xs font-semibold uppercase text-slate-500">
              Skipped
            </div>
            <div className="text-xl font-bold text-slate-600 mt-1">
              {summary?.skipped ?? 0}
            </div>
          </div>
          <div className="bg-[#f1f7ef] border border-[#cbe2ca] rounded-xl p-3 col-span-2 sm:col-span-1">
            <div className="text-2xs font-semibold uppercase text-[#234e32]">
              Duration
            </div>
            <div className="text-xl font-bold text-[#234e32] font-mono mt-1">
              {durationSec}s
            </div>
          </div>
        </div>
      </div>

      {/* Individual Test Results */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          Individual Test Results ({run.results?.length ?? 0})
        </h3>

        {(!run.results || run.results.length === 0) && (
          <Card className="border-[#dce3da] bg-white p-8 text-center text-slate-500 text-sm shadow-xs rounded-2xl">
            {isLive
              ? "Browser engine is preparing test session. Results will appear as tests complete..."
              : "No test results recorded for this run."}
          </Card>
        )}

        {run.results?.map((result, idx) => {
          const isPassed = result.status === "PASSED";
          const isFailed = result.status === "FAILED";
          const analysis = result.failureAnalysis as FailureAnalysis | undefined;

          return (
            <Card
              key={result.id}
              className={`border transition-all duration-150 rounded-2xl shadow-xs ${
                isFailed
                  ? "border-rose-300 bg-rose-50/20"
                  : isPassed
                  ? "border-[#dce3da] bg-white hover:border-[#b8c7b4]"
                  : "border-[#dce3da] bg-white"
              }`}
            >
              <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                        #{idx + 1}
                      </span>
                      <CardTitle className="text-base text-slate-900 font-bold break-words [overflow-wrap:anywhere]">
                        {result.testCase?.title || `Test Case ${result.testCaseId}`}
                      </CardTitle>
                    </div>
                    {result.testCase?.description && (
                      <p className="text-xs text-slate-600 leading-relaxed break-words [overflow-wrap:anywhere]">
                        {result.testCase.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {result.duration !== null && (
                      <span className="text-2xs font-mono text-slate-500">
                        {result.duration}ms
                      </span>
                    )}
                    {isPassed && <Badge variant="emerald">PASSED</Badge>}
                    {isFailed && <Badge variant="rose">FAILED</Badge>}
                    {!isPassed && !isFailed && (
                      <Badge variant="slate">{result.status}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                {/* Expected Result */}
                {result.testCase?.expectedResult && (
                  <div className="text-xs text-slate-600 break-words [overflow-wrap:anywhere]">
                    <strong className="text-slate-800">Expected: </strong>
                    <span className="italic">{result.testCase.expectedResult}</span>
                  </div>
                )}

                {/* Failure Error Trace */}
                {isFailed && result.error && (
                  <div className="space-y-1.5">
                    <div className="text-2xs font-semibold uppercase tracking-wider text-rose-600">
                      Playwright Error Trace
                    </div>
                    <pre className="bg-[#fef2f2] border border-rose-200 rounded-xl p-3 text-xs font-mono text-rose-800 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-w-full">
                      {result.error}
                    </pre>
                  </div>
                )}

                {/* Screenshot Preview */}
                {result.screenshot && (
                  <div className="space-y-2">
                    <div className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                      Failure Screenshot Artifact
                    </div>
                    <div className="relative inline-block border border-[#dce3da] rounded-xl overflow-hidden group shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getFullScreenshotUrl(result.screenshot)}
                        alt="Test Failure Snapshot"
                        className="max-h-48 rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() =>
                          setSelectedScreenshot(getFullScreenshotUrl(result.screenshot!))
                        }
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                        <span className="text-xs font-semibold text-white bg-slate-900/90 px-3 py-1.5 rounded-lg shadow">
                          Click to expand
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Failure Analysis Card */}
                {isFailed && analysis && (
                  <div className="bg-[#fffdf5] border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                      <div className="flex items-center gap-2">
                        <svg
                          width={16}
                          height={16}
                          className="w-4 h-4 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <h4 className="text-sm font-bold text-amber-900">
                          AI Failure Diagnosis
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {analysis.source && (
                          <Badge
                            variant="slate"
                            className="text-2xs font-mono bg-amber-100 text-amber-800 border-amber-200"
                          >
                            Engine: {analysis.source}
                          </Badge>
                        )}
                        <Badge variant="amber" className="text-2xs font-mono">
                          {Math.round(analysis.confidence * 100)}% Confidence
                        </Badge>
                      </div>
                    </div>

                    {/* Likely Root Cause */}
                    <div className="space-y-1">
                      <div className="text-2xs font-semibold uppercase tracking-wider text-amber-800">
                        Likely Root Cause
                      </div>
                      <div className="text-sm font-semibold text-slate-900 break-words [overflow-wrap:anywhere]">
                        {analysis.rootCause}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1">
                      <div className="text-2xs font-semibold uppercase tracking-wider text-amber-800">
                        Explanation
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed break-words [overflow-wrap:anywhere]">
                        {analysis.explanation}
                      </p>
                    </div>

                    {/* Suggested Fix */}
                    <div className="space-y-1 bg-white/90 border border-amber-200 rounded-xl p-3">
                      <div className="text-2xs font-semibold uppercase tracking-wider text-amber-800">
                        Suggested Fix
                      </div>
                      <p className="text-xs text-slate-800 font-mono leading-relaxed break-words [overflow-wrap:anywhere]">
                        {analysis.suggestedFix}
                      </p>
                    </div>

                    {/* Disclaimer & Raw JSON toggle */}
                    <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
                      <span>
                        Diagnostic hypothesis generated from Playwright execution telemetry.
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRawJson(result.id)}
                        className="text-[#2e633f] font-medium hover:underline ml-2"
                      >
                        {expandedRawJson[result.id]
                          ? "Hide raw analysis"
                          : "View raw AI response"}
                      </button>
                    </div>

                    {expandedRawJson[result.id] && (
                      <pre className="bg-white border border-[#dce3da] rounded-xl p-3 text-2xs font-mono text-slate-700 overflow-x-auto">
                        {JSON.stringify(analysis, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {/* AI Analyzing placeholder if failed but analysis still running */}
                {isFailed && !analysis && (
                  <div className="bg-[#f8faf7] border border-[#e2e8e0] rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#2e633f]/30 border-t-[#2e633f] animate-spin shrink-0" />
                    <span>AI failure analysis is currently processing...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expanded Screenshot Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-white border border-[#dce3da] rounded-2xl overflow-hidden shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedScreenshot}
              alt="Expanded Failure Snapshot"
              className="w-full h-auto object-contain max-h-[85vh]"
            />
            <div className="p-3 bg-[#f8faf7] border-t border-[#e2e8e0] text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedScreenshot(null)}
                className="border-[#dce3da] bg-white text-slate-700 hover:text-slate-900"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
