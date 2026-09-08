"use client";

import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { GenerateTestCasesOptions } from "../../types/test-case";

interface GenerateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: GenerateTestCasesOptions) => Promise<void>;
  isGenerating: boolean;
  existingCount: number;
}

const CONTEXT_PRESETS = [
  {
    label: "Form Validation",
    text: "Verify all interactive form fields, test valid and invalid data entry, and confirm error messages appear on empty submission."
  },
  {
    label: "Navigation & Routes",
    text: "Focus on internal navigation links, navbar items, and verify each route renders the expected view without 404 errors."
  },
  {
    label: "Buttons & CTAs",
    text: "Test primary call-to-action buttons (like 'Get Started', 'Demo', 'Contact') and verify UI responds without uncaught errors."
  },
  {
    label: "Negative Edge-Cases",
    text: "Test boundary conditions, empty required fields, invalid email formatting, and ensure the page prevents invalid actions."
  }
];

const COUNT_PRESETS = [3, 5, 8, 10];

export function GenerateTestModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  existingCount
}: GenerateTestModalProps) {
  const [context, setContext] = useState("");
  const [count, setCount] = useState<number>(5);
  const [replaceExisting, setReplaceExisting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onGenerate({
        context: context.trim() || undefined,
        count,
        replaceExisting
      });
      onClose();
    } catch {
      // Keep modal open if generation fails so user retains their prompt
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setContext((prev) => {
      if (!prev.trim()) return presetText;
      return `${prev.trim()}\n${presetText}`;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isGenerating ? () => {} : onClose}
      title="Generate AI Test Cases"
      description="Configure AI test synthesis parameters and provide optional instructions to steer what is tested."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Testing Focus / Context */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-1.5">
            Testing Context & Focus Area{" "}
            <span className="text-xs font-normal text-slate-400">(Optional)</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">
            Describe what features, user flows, or scenarios the AI should specifically prioritize:
          </p>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={isGenerating}
            rows={3}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-y"
            placeholder="e.g., Focus on the lead capture form. Verify email validation, test empty required fields, and confirm clicking 'Request Demo' works."
          />

          {/* Preset Chips */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Quick Suggestions:</span>
            {CONTEXT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset.text)}
                disabled={isGenerating}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-teal-300 border border-slate-700/60 hover:border-teal-500/40 transition-colors"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Test Cases */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-slate-200">
              Number of Test Cases
            </label>
            <span className="text-xs font-semibold text-teal-400">
              {count} {count === 1 ? "Test Case" : "Test Cases"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {COUNT_PRESETS.map((presetNum) => (
              <button
                key={presetNum}
                type="button"
                onClick={() => setCount(presetNum)}
                disabled={isGenerating}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  count === presetNum
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm shadow-teal-500/10"
                    : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                {presetNum} Tests
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-slate-400">Custom:</span>
              <input
                type="number"
                min={1}
                max={15}
                value={count}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setCount(Math.min(15, Math.max(1, val)));
                }}
                disabled={isGenerating}
                className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {count <= 4
              ? "Fastest generation time (ideal for quick surface checks)."
              : count <= 8
              ? "Balanced coverage (tests multiple forms, routes, and button actions)."
              : "Comprehensive coverage (tests deeper navigation flows and negative edge cases)."}
          </p>
        </div>

        {/* Replace Existing Option */}
        {existingCount > 0 && (
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                disabled={isGenerating}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500/30"
              />
              <div>
                <span className="text-xs font-medium text-slate-200">
                  Replace {existingCount} existing test cases
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  When checked, current test cases will be cleared and replaced with the newly generated suite.
                  Otherwise, new tests will be appended.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isGenerating}
            disabled={isGenerating}
            className="shadow-sm shadow-teal-900/40"
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {isGenerating ? "Synthesizing Tests..." : `Generate ${count} Tests`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
