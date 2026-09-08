import React, { useState } from "react";
import { TestCase, TestStep, TestActionType, GenerateTestCasesOptions } from "../../types/test-case";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Alert } from "../ui/alert";
import { Modal } from "../ui/modal";

interface TestCaseListProps {
  projectId: string;
  testCases: TestCase[];
  isLoading: boolean;
  isGenerating: boolean;
  hasAnalysis: boolean;
  onGenerate: (options?: GenerateTestCasesOptions) => Promise<void>;
  onOpenGenerateModal?: () => void;
  onDelete: (testCaseId: string) => Promise<void>;
  onClearSuite?: () => Promise<void>;
  onRunAll: () => Promise<void>;
  isRunningTests: boolean;
}

function getActionBadgeVariant(
  action: TestActionType
): "teal" | "slate" | "emerald" | "amber" | "rose" {
  switch (action) {
    case "navigate":
      return "teal";
    case "click":
      return "emerald";
    case "fill":
      return "slate";
    case "select":
    case "check":
    case "uncheck":
      return "teal";
    case "assertVisible":
    case "assertText":
    case "assertURL":
      return "amber";
    default:
      return "slate";
  }
}

export function TestCaseList({
  projectId,
  testCases,
  isLoading,
  isGenerating,
  hasAnalysis,
  onGenerate,
  onOpenGenerateModal,
  onDelete,
  onClearSuite,
  onRunAll,
  isRunningTests
}: TestCaseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<TestCase | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!caseToDelete) return;
    setDeletingId(caseToDelete.id);
    setErrorMsg(null);
    try {
      await onDelete(caseToDelete.id);
      setCaseToDelete(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete test case");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmClearSuite = async () => {
    if (!onClearSuite) return;
    setIsClearing(true);
    setErrorMsg(null);
    try {
      await onClearSuite();
      setIsClearModalOpen(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to clear test suite");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Functional Test Suite
            <Badge variant="teal">{testCases.length} Tests</Badge>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict, deterministic Playwright test cases generated from crawled application semantics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {testCases.length > 0 && onClearSuite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsClearModalOpen(true)}
              disabled={isGenerating || isRunningTests || isClearing}
              className="text-slate-400 hover:text-rose-400 text-xs"
            >
              Clear Suite
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenGenerateModal || (() => onGenerate())}
            isLoading={isGenerating}
            disabled={isGenerating || isRunningTests}
            title={!hasAnalysis ? "Application must be analyzed first" : undefined}
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
            {isGenerating
              ? "Synthesizing Tests..."
              : testCases.length > 0
              ? "Generate Tests..."
              : "Generate Test Cases"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onRunAll}
            isLoading={isRunningTests}
            disabled={isRunningTests || testCases.length === 0}
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {isRunningTests ? "Starting Run..." : "Run All Tests"}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="error" title="Error">
          {errorMsg}
        </Alert>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-slate-900/60 border border-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Generating Indicator Card */}
      {isGenerating && (
        <Card className="border-teal-800/80 bg-teal-950/20 p-8 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-teal-500/30 border-t-teal-400 animate-spin" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-teal-200">
              Synthesizing Structured Test Suite
            </h3>
            <p className="text-xs text-slate-400">
              Querying AI engine with target application telemetry, discovering interaction paths, and enforcing strict Zod validation schema.
            </p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isGenerating && testCases.length === 0 && (
        <Card className="border-slate-800 bg-slate-900/40 border-dashed">
          <CardContent className="p-16 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                No Test Cases Generated Yet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {hasAnalysis
                  ? "Your application analysis is ready! Click 'Generate Test Cases' above to create automated functional tests."
                  : "First crawl the target application in the 'Overview & Analysis' tab, then click 'Generate Test Cases'."}
              </p>
            </div>
            {hasAnalysis && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenGenerateModal || (() => onGenerate())}
                  isLoading={isGenerating}
                >
                  Generate Test Cases Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Cases Grid */}
      {!isLoading && testCases.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {testCases.map((tc, index) => {
            const steps = (tc.steps as TestStep[]) || [];

            return (
              <Card
                key={tc.id}
                className="border-slate-800 bg-slate-900/60 hover:border-slate-700/80 transition-all duration-150"
              >
                <CardHeader className="pb-3 pt-4 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                          #{index + 1}
                        </span>
                        <CardTitle className="text-base text-slate-100 break-words [overflow-wrap:anywhere]">
                          {tc.title}
                        </CardTitle>
                      </div>
                      {tc.description && (
                        <p className="text-xs text-slate-400 leading-relaxed break-words [overflow-wrap:anywhere]">
                          {tc.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCaseToDelete(tc)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-950/20 shrink-0 h-8 px-2"
                      title="Delete test case"
                    >
                      <svg
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-4 pt-0 space-y-3">
                  {/* Steps List */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-2">
                    <div className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                      Sequential Execution Steps ({steps.length})
                    </div>
                    <div className="space-y-1.5">
                      {steps.map((step, stepIdx) => (
                        <div
                          key={stepIdx}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs font-mono text-slate-300 min-w-0"
                        >
                          <span className="text-slate-500 text-2xs w-4 shrink-0">
                            {stepIdx + 1}.
                          </span>
                          <Badge
                            variant={getActionBadgeVariant(step.action)}
                            className="text-2xs px-1.5 py-0 uppercase shrink-0"
                          >
                            {step.action}
                          </Badge>
                          <span
                            className="text-teal-300 truncate max-w-xs sm:max-w-md min-w-0"
                            title={step.target}
                          >
                            &quot;{step.target}&quot;
                          </span>
                          {step.value && (
                            <span
                              className="text-slate-400 truncate max-w-xs min-w-0"
                              title={step.value}
                            >
                              → &quot;{step.value}&quot;
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expected Result */}
                  <div className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400 shrink-0">
                      Expected:
                    </span>
                    <span className="text-slate-300 italic break-words [overflow-wrap:anywhere]">
                      {tc.expectedResult}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!caseToDelete}
        onClose={() => setCaseToDelete(null)}
        title="Delete Test Case"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCaseToDelete(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              isLoading={!!deletingId}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to permanently delete{" "}
          <strong className="text-white">&quot;{caseToDelete?.title}&quot;</strong>?
          This will also remove any associated historical results.
        </p>
      </Modal>

      {/* Clear Suite Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Entire Test Suite"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearModalOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmClearSuite}
              isLoading={isClearing}
            >
              Clear All Tests
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to delete all{" "}
          <strong className="text-white">{testCases.length} test cases</strong> in this project?
          This will reset your functional test suite and cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
