"use client";

import React, { useState } from "react";
import { StructuredAnalysis } from "../../types/analysis";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface ApplicationAnalysisViewProps {
  analysis: StructuredAnalysis;
}

export function ApplicationAnalysisView({
  analysis
}: ApplicationAnalysisViewProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyRawJson = () => {
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Target Application Header */}
      <Card className="border-[#dce3da] bg-white shadow-xs rounded-2xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2e633f]" />
                <CardTitle className="text-xl font-bold truncate text-slate-900">
                  {analysis.title || "Untitled Application"}
                </CardTitle>
                <Badge variant="emerald">Crawled</Badge>
              </div>
              <a
                href={analysis.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-[#2e633f] hover:underline bg-[#f1f5ef] px-2 py-0.5 rounded border border-[#dce3da] inline-flex items-center gap-1 max-w-xs sm:max-w-md md:max-w-xl truncate min-w-0"
                title={analysis.url}
              >
                <span className="truncate">{analysis.url}</span>
                <svg
                  width={12}
                  height={12}
                  className="w-3 h-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 shrink-0">
              <span className="block font-medium text-slate-700">Scanned</span>
              <span>{new Date(analysis.scannedAt).toLocaleString()}</span>
            </div>
          </div>
          {analysis.description && (
            <CardDescription className="text-xs text-slate-500 mt-2 break-words [overflow-wrap:anywhere]">
              {analysis.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-2">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl">
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-2xs mb-0.5">
                Routes
              </span>
              <span className="font-mono font-bold text-slate-900 text-lg">
                {analysis.discoveredRoutes.length}
              </span>
            </div>
            <div className="p-3 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl">
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-2xs mb-0.5">
                Buttons
              </span>
              <span className="font-mono font-bold text-slate-900 text-lg">
                {analysis.buttons.length}
              </span>
            </div>
            <div className="p-3 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl">
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-2xs mb-0.5">
                Inputs
              </span>
              <span className="font-mono font-bold text-slate-900 text-lg">
                {analysis.inputs.length}
              </span>
            </div>
            <div className="p-3 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl">
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-2xs mb-0.5">
                Forms
              </span>
              <span className="font-mono font-bold text-slate-900 text-lg">
                {analysis.forms.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discovered Routes */}
      {analysis.discoveredRoutes.length > 0 && (
        <Card className="border-[#dce3da] bg-white shadow-xs rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
              <span>Discovered Internal Routes</span>
              <Badge variant="teal">{analysis.discoveredRoutes.length} paths</Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Internal URLs and navigation paths discovered on the initial page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.discoveredRoutes.map((route, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#f1f5ef] border border-[#dce3da] text-[#234e32] font-mono text-xs break-all max-w-full font-medium"
                  title={route}
                >
                  {route}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive UI Elements Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buttons List */}
        <Card className="border-[#dce3da] bg-white shadow-xs rounded-2xl flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
                <span>Interactive Buttons</span>
                <span className="text-xs text-slate-500 font-mono">
                  {analysis.buttons.length} found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {analysis.buttons.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No buttons found on page</p>
              ) : (
                analysis.buttons.map((btn, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 truncate block">
                        {btn.text || btn.ariaLabel || "Unnamed Button"}
                      </span>
                      {btn.id && (
                        <span className="text-slate-400 font-mono text-2xs block truncate">
                          id=&quot;{btn.id}&quot;
                        </span>
                      )}
                    </div>
                    <Badge variant="slate" className="text-2xs font-mono shrink-0">
                      {btn.type || "button"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>

        {/* Inputs List */}
        <Card className="border-[#dce3da] bg-white shadow-xs rounded-2xl flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
                <span>Input Elements</span>
                <span className="text-xs text-slate-500 font-mono">
                  {analysis.inputs.length} found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {analysis.inputs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No inputs found on page</p>
              ) : (
                analysis.inputs.map((inp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 truncate block">
                        {inp.label || inp.placeholder || inp.name || "Unnamed Input"}
                      </span>
                      <span className="text-slate-400 font-mono text-2xs block truncate">
                        name=&quot;{inp.name || "n/a"}&quot;
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {inp.required && (
                        <Badge variant="rose" className="text-2xs">
                          required
                        </Badge>
                      )}
                      <Badge variant="teal" className="text-2xs font-mono">
                        {inp.type}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>

        {/* Forms List */}
        {analysis.forms.length > 0 && (
          <Card className="border-[#dce3da] bg-white shadow-xs rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
                <span>Forms</span>
                <span className="text-xs text-slate-500 font-mono">
                  {analysis.forms.length} found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {analysis.forms.map((form, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {form.name || form.id || `Form #${idx + 1}`}
                    </span>
                    <Badge variant="slate" className="font-mono text-2xs">
                      {form.method || "POST"}
                    </Badge>
                  </div>
                  {form.action && (
                    <div className="text-slate-500 font-mono text-2xs break-all" title={form.action}>
                      action: {form.action}
                    </div>
                  )}
                  <div className="text-slate-500 text-2xs">
                    Fields ({form.inputsCount}): {form.inputNames.join(", ") || "none detected"}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Headings Structure */}
        {analysis.headings.length > 0 && (
          <Card className="border-[#dce3da] bg-white shadow-xs rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
                <span>Headings Structure</span>
                <span className="text-xs text-slate-500 font-mono">
                  {analysis.headings.length} headings
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {analysis.headings.map((h, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-[#f8faf7] border border-[#e2e8e0] rounded-lg flex items-center gap-2"
                >
                  <span className="px-1.5 py-0.5 rounded bg-[#e2ece0] text-[#234e32] border border-[#c8dac3] font-mono text-2xs font-bold shrink-0">
                    H{h.level}
                  </span>
                  <span className="text-slate-700 truncate">{h.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Visible Text Summary */}
      {analysis.visibleTextSummary && (
        <Card className="border-[#dce3da] bg-white shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Visible Content Summary
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Clean text summary extracted from document body (used for contextual AI prompt engineering)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed font-sans bg-[#f8faf7] p-3.5 rounded-xl border border-[#e2e8e0] line-clamp-4 hover:line-clamp-none transition-all break-words [overflow-wrap:anywhere]">
              {analysis.visibleTextSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Raw JSON */}
      <details className="group border border-[#dce3da] rounded-2xl bg-white shadow-xs overflow-hidden">
        <summary className="p-4 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between select-none list-none">
          <span className="flex items-center gap-2">
            <svg
              width={16}
              height={16}
              className="w-4 h-4 text-[#2e633f] transition-transform group-open:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            Raw Structured Analysis (JSON)
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              copyRawJson();
            }}
            className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {isCopied ? "✓ Copied" : "Copy JSON"}
          </Button>
        </summary>
        <div className="p-4 pt-0">
          <pre className="p-4 rounded-xl bg-[#f8faf7] border border-[#e2e8e0] font-mono text-2xs text-slate-800 overflow-x-auto max-h-96">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}
