"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "../../../components/auth/auth-guard";
import {
  projectApi,
  analysisApi,
  testCaseApi,
  testRunApi,
  ApiClientError
} from "../../../lib/api";
import { Project } from "../../../types/project";
import { StructuredAnalysis } from "../../../types/analysis";
import { TestCase, GenerateTestCasesOptions } from "../../../types/test-case";
import { TestRun } from "../../../types/test-run";
import { Tabs } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Alert } from "../../../components/ui/alert";
import { AnimatedGrid } from "../../../components/ui/animated-grid";
import { DeleteProjectDialog } from "../../../components/projects/delete-project-dialog";
import { ApplicationAnalysisView } from "../../../components/projects/application-analysis-view";
import { TestCaseList } from "../../../components/projects/test-case-list";
import { TestRunList } from "../../../components/projects/test-run-list";
import { TestRunDetail } from "../../../components/projects/test-run-detail";
import { GenerateTestModal } from "../../../components/projects/generate-test-modal";
import { ExternalLink, Sparkles, Play, RefreshCw, Compass } from "lucide-react";

function ProjectDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Playwright Analysis state
  const [analysis, setAnalysis] = useState<StructuredAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);

  // Test Cases state
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoadingTestCases, setIsLoadingTestCases] = useState(true);
  const [isGeneratingTestCases, setIsGeneratingTestCases] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Test Runs state
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isLoadingTestRuns, setIsLoadingTestRuns] = useState(true);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  // Top level feedback alert
  const [testFeedback, setTestFeedback] = useState<{
    text: string;
    variant: "success" | "error";
  } | null>(null);

  // Settings Edit form state
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{
    text: string;
    variant: "success" | "error";
  } | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  // Delete modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectApi.getProject(projectId);
      setProject(data.project);
      setEditName(data.project.name);
      setEditUrl(data.project.url);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setError("Project not found. It may have been deleted or you do not have permission.");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load project details."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchLatestAnalysis = useCallback(async () => {
    setIsLoadingAnalysis(true);
    try {
      const data = await analysisApi.getLatestAnalysis(projectId);
      setAnalysis(data.analysis);
    } catch {
      setAnalysis(null);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [projectId]);

  const fetchTestCases = useCallback(async () => {
    setIsLoadingTestCases(true);
    try {
      const data = await testCaseApi.getTestCases(projectId);
      setTestCases(data.testCases);
    } catch {
      setTestCases([]);
    } finally {
      setIsLoadingTestCases(false);
    }
  }, [projectId]);

  const fetchTestRuns = useCallback(async () => {
    setIsLoadingTestRuns(true);
    try {
      const data = await testRunApi.getTestRuns(projectId);
      setTestRuns(data.testRuns);
    } catch {
      setTestRuns([]);
    } finally {
      setIsLoadingTestRuns(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchLatestAnalysis();
      fetchTestCases();
      fetchTestRuns();
    }
  }, [projectId, fetchProject, fetchLatestAnalysis, fetchTestCases, fetchTestRuns]);

  const handleGenerateTestCases = async (options?: GenerateTestCasesOptions) => {
    setIsGeneratingTestCases(true);
    setTestFeedback(null);
    try {
      const cleanOptions =
        options && typeof options === "object" && !("nativeEvent" in options) && !("target" in options)
          ? {
              context: typeof options.context === "string" ? options.context : undefined,
              count: typeof options.count === "number" ? options.count : undefined,
              replaceExisting: Boolean(options.replaceExisting)
            }
          : undefined;

      const data = await testCaseApi.generateTestCases(projectId, cleanOptions);
      setTestCases(data.testCases);
      setTestFeedback({ text: data.message, variant: "success" });
      setActiveTab("test-cases");
    } catch (err) {
      setTestFeedback({
        text: err instanceof Error ? err.message : "Failed to generate test cases",
        variant: "error"
      });
    } finally {
      setIsGeneratingTestCases(false);
    }
  };

  const handleClearTestSuite = async () => {
    try {
      const data = await testCaseApi.clearTestCases(projectId);
      setTestCases([]);
      setTestFeedback({ text: data.message, variant: "success" });
    } catch (err) {
      setTestFeedback({
        text: err instanceof Error ? err.message : "Failed to clear test suite",
        variant: "error"
      });
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    await testCaseApi.deleteTestCase(testCaseId);
    setTestCases((prev) => prev.filter((c) => c.id !== testCaseId));
  };

  const handleStartTestRun = async () => {
    setIsRunningTests(true);
    setTestFeedback(null);
    try {
      const data = await testRunApi.startTestRun(projectId);
      await fetchTestRuns();
      setSelectedRunId(data.testRun.id);
      setActiveTab("test-runs");
    } catch (err) {
      setTestFeedback({
        text: err instanceof Error ? err.message : "Failed to start test run",
        variant: "error"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const data = await analysisApi.analyzeProject(projectId);
      setAnalysis(data.analysis);
      setActiveTab("overview");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setAnalysisError(err.message);
      } else {
        setAnalysisError(
          err instanceof Error
            ? err.message
            : "Failed to analyze target application"
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFeedback(null);

    const fieldErrors: Record<string, string> = {};
    if (!editName.trim()) {
      fieldErrors.name = "Project name cannot be empty";
    } else if (editName.trim().length < 2) {
      fieldErrors.name = "Project name must be at least 2 characters";
    }

    if (!editUrl.trim()) {
      fieldErrors.url = "Application URL cannot be empty";
    } else {
      try {
        const parsed = new URL(editUrl.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          fieldErrors.url = "URL must start with http:// or https://";
        }
      } catch {
        fieldErrors.url = "Please enter a valid URL (e.g. https://example.com)";
      }
    }

    setEditFieldErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsUpdating(true);
    try {
      const data = await projectApi.updateProject(projectId, {
        name: editName.trim(),
        url: editUrl.trim()
      });
      setProject(data.project);
      setEditFeedback({
        text: "Project settings updated successfully!",
        variant: "success"
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setEditFeedback({ text: err.message, variant: "error" });
        if (err.fieldErrors) setEditFieldErrors(err.fieldErrors);
      } else {
        setEditFeedback({
          text: err instanceof Error ? err.message : "Failed to update project",
          variant: "error"
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProjectDeleted = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-6.5rem)] bg-[#f8faf7] p-4 sm:p-6 lg:p-8 overflow-hidden">
        <AnimatedGrid />
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-32 bg-[#e2ece0] rounded-md animate-pulse" />

          {/* Header Row Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5ebe3]">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="h-8 w-64 bg-[#e2ece0] rounded-lg animate-pulse" />
                <div className="h-5 w-16 bg-[#e2ece0] rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-96 max-w-full bg-[#eef3ec] rounded-md animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-36 bg-[#e2ece0] rounded-xl animate-pulse" />
              <div className="h-9 w-40 bg-[#2e633f]/20 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="h-11 border-b border-[#dce3da] flex gap-4 px-2 items-center">
            <div className="h-6 w-36 bg-[#e2ece0] rounded-md animate-pulse" />
            <div className="h-6 w-24 bg-[#eef3ec] rounded-md animate-pulse" />
            <div className="h-6 w-24 bg-[#eef3ec] rounded-md animate-pulse" />
            <div className="h-6 w-20 bg-[#eef3ec] rounded-md animate-pulse" />
          </div>

          {/* Card Content Skeleton */}
          <div className="bg-white border border-[#dce3da] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-48 bg-[#e2ece0] rounded-md animate-pulse" />
                <div className="h-4 w-72 bg-[#eef3ec] rounded-md animate-pulse" />
              </div>
              <div className="h-8 w-28 bg-[#e2ece0] rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl p-3 space-y-2 animate-pulse">
                  <div className="h-3 w-16 bg-[#e2ece0] rounded" />
                  <div className="h-6 w-12 bg-[#dce3da] rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-14 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl animate-pulse" />
              <div className="h-14 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="relative min-h-[calc(100vh-6.5rem)] bg-[#f8faf7] p-4 sm:p-6 lg:p-8 overflow-hidden">
        <AnimatedGrid />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6 pt-12">
          <Alert variant="error" title="Unable to Open Project">
            {error || "Project could not be found."}
          </Alert>
          <Link href="/dashboard">
            <Button variant="outline" size="md" className="border-[#dce3da] bg-white text-slate-700 hover:text-slate-900">
              ← Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview & Analysis",
      badge: analysis ? "Crawled" : undefined,
      icon: (
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
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      )
    },
    {
      id: "test-cases",
      label: "Test Cases",
      badge: testCases.length,
      icon: (
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
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      )
    },
    {
      id: "test-runs",
      label: "Test Runs",
      badge: testRuns.length,
      icon: (
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
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      )
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
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
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-6.5rem)] bg-[#f8faf7] text-slate-900 p-4 sm:p-6 lg:p-8 overflow-hidden">
      <AnimatedGrid />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#2e633f] transition-colors font-medium mb-3 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Projects
          </Link>

          {/* Project Header Title & URL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5ebe3]">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate max-w-xl" title={project.name}>
                  {project.name}
                </h1>
                <Badge variant="emerald" className="shrink-0 font-medium">Active</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 min-w-0 max-w-full">
                <span className="shrink-0 font-medium">Target:</span>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#2e633f] hover:underline bg-[#f1f5ef] px-2.5 py-0.5 rounded-md border border-[#dce3da] inline-flex items-center gap-1.5 min-w-0 max-w-xs sm:max-w-md md:max-w-xl truncate"
                  title={project.url}
                >
                  <span className="truncate">{project.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <span className="shrink-0">•</span>
                <span className="shrink-0">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant={analysis ? "outline" : "primary"}
                size="md"
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                disabled={isAnalyzing || isGeneratingTestCases}
                className={
                  analysis
                    ? "border-[#dce3da] bg-white text-slate-700 hover:text-slate-900 hover:border-[#b8c7b4] shadow-2xs"
                    : "bg-[#2e633f] hover:bg-[#234e32] text-white shadow-sm font-medium"
                }
              >
                {isAnalyzing ? (
                  "Crawling Target App..."
                ) : (
                  <>
                    <Compass className="w-4 h-4 mr-1.5" />
                    {analysis ? "Re-Analyze Application" : "Analyze Application"}
                  </>
                )}
              </Button>

              {analysis && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsGenerateModalOpen(true)}
                  isLoading={isGeneratingTestCases}
                  disabled={isGeneratingTestCases || isAnalyzing}
                  className="bg-[#2e633f] hover:bg-[#234e32] text-white shadow-sm font-medium"
                >
                  {isGeneratingTestCases ? (
                    "Synthesizing Tests..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Generate Test Cases
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content Sections */}
        <div className="pt-2">
          {/* TAB 1: OVERVIEW & ANALYSIS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Analysis Error Alert */}
              {analysisError && (
                <Alert variant="error" title="Application Analysis Failed">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                    <span>{analysisError}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="border-rose-300 text-rose-800 hover:bg-rose-50"
                    >
                      Retry Analysis
                    </Button>
                  </div>
                </Alert>
              )}

              {/* In-Flight Crawling State */}
              {isAnalyzing && (
                <Card className="border-[#c8dac3] bg-white p-8 text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 mx-auto rounded-full border-3 border-[#2e633f]/20 border-t-[#2e633f] animate-spin" />
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-slate-900">
                      Playwright Inspection In Progress
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">
                      Launching headless Chromium session, resolving <code className="text-[#2e633f] font-mono break-all bg-[#f1f5ef] px-1.5 py-0.5 rounded border border-[#dce3da]">{project.url}</code>, discovering interactive forms, inputs, buttons, and indexing routes. This typically takes 5–15 seconds.
                    </p>
                  </div>
                </Card>
              )}

              {/* Target App Analysis Display */}
              {analysis && !isAnalyzing && (
                <div className="space-y-6">
                  {/* Actionable Next Step Callout */}
                  <div className="bg-[#f2f7f0] border border-[#cbe0c7] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2e633f] text-white text-xs font-bold">
                          ✓
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          Application Telemetry Discovered
                        </h3>
                        <Badge variant="emerald">Crawl Complete</Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Playwright extracted {analysis.buttons?.length ?? 0} buttons, {analysis.inputs?.length ?? 0} inputs, and {analysis.headings?.length ?? 0} headings. Synthesize functional test cases with AI to start testing.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setIsGenerateModalOpen(true)}
                        isLoading={isGeneratingTestCases}
                        disabled={isGeneratingTestCases}
                        className="bg-[#2e633f] hover:bg-[#234e32] text-white shadow-sm font-medium whitespace-nowrap"
                      >
                        {isGeneratingTestCases ? "Generating..." : "Generate Test Cases →"}
                      </Button>
                    </div>
                  </div>

                  <ApplicationAnalysisView analysis={analysis} />
                </div>
              )}

              {/* Ready to Analyze Card (when no analysis has been run yet) */}
              {!analysis && !isAnalyzing && !isLoadingAnalysis && (
                <Card className="border-[#dce3da] bg-white shadow-xs">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-[#2e633f] text-xs font-semibold uppercase tracking-wider mb-1">
                      <span>Phase 3 Engine</span>
                    </div>
                    <CardTitle className="text-xl text-slate-900">
                      Playwright Application Analyzer
                    </CardTitle>
                    <CardDescription className="break-words [overflow-wrap:anywhere] text-slate-500">
                      Automatically inspect and map interactive DOM elements, forms, buttons, inputs, and routes on <code className="text-[#2e633f] font-mono break-all bg-[#f1f5ef] px-1 rounded border border-[#dce3da]">{project.url}</code>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-[#f8faf7] border border-[#e2e8e0] rounded-xl text-xs sm:text-sm text-slate-700 space-y-2">
                      <p>
                        <strong>How it works:</strong> The browser analyzer launches a secure headless Playwright session to crawl the target application, extract structured metadata, discover internal navigation routes, and structure element telemetry for future AI test generation.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 text-2xs font-mono text-slate-600">
                        <span className="bg-white border border-[#dce3da] px-2 py-0.5 rounded">Headings</span>
                        <span className="bg-white border border-[#dce3da] px-2 py-0.5 rounded">Routes</span>
                        <span className="bg-white border border-[#dce3da] px-2 py-0.5 rounded">Forms</span>
                        <span className="bg-white border border-[#dce3da] px-2 py-0.5 rounded">Inputs</span>
                        <span className="bg-white border border-[#dce3da] px-2 py-0.5 rounded">Buttons</span>
                        <span className="bg-white border border-[#dce3da] px-2 py-0.5 rounded">Selects</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleAnalyze}
                        className="bg-[#2e633f] hover:bg-[#234e32] text-white shadow-sm font-medium"
                      >
                        Start Application Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Metadata Details */}
              <Card className="border-[#dce3da] bg-white shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Project Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-[#e5ebe3]">
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">
                      Project ID
                    </span>
                    <span className="font-mono text-slate-700">{project.id}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#e5ebe3]">
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">
                      Created At
                    </span>
                    <span className="text-slate-700">
                      {new Date(project.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 uppercase tracking-wider font-semibold">
                      Last Updated
                    </span>
                    <span className="text-slate-700">
                      {new Date(project.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: TEST CASES */}
          {activeTab === "test-cases" && (
            <div className="space-y-4">
              {testFeedback && (
                <Alert variant={testFeedback.variant}>
                  <div className="flex items-center justify-between">
                    <span>{testFeedback.text}</span>
                    <button
                      onClick={() => setTestFeedback(null)}
                      className="text-xs hover:underline ml-3 opacity-80 hover:opacity-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </Alert>
              )}
              <TestCaseList
                projectId={projectId}
                testCases={testCases}
                isLoading={isLoadingTestCases}
                isGenerating={isGeneratingTestCases}
                hasAnalysis={!!analysis}
                onGenerate={handleGenerateTestCases}
                onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
                onDelete={handleDeleteTestCase}
                onClearSuite={handleClearTestSuite}
                onRunAll={handleStartTestRun}
                isRunningTests={isRunningTests}
              />
            </div>
          )}

          {/* TAB 3: TEST RUNS */}
          {activeTab === "test-runs" && (
            <div className="space-y-4">
              {testFeedback && (
                <Alert variant={testFeedback.variant}>
                  <div className="flex items-center justify-between">
                    <span>{testFeedback.text}</span>
                    <button
                      onClick={() => setTestFeedback(null)}
                      className="text-xs hover:underline ml-3 opacity-80 hover:opacity-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </Alert>
              )}
              {selectedRunId ? (
                <TestRunDetail
                  runId={selectedRunId}
                  onBack={() => {
                    setSelectedRunId(null);
                    fetchTestRuns();
                  }}
                />
              ) : (
                <TestRunList
                  projectId={projectId}
                  testRuns={testRuns}
                  isLoading={isLoadingTestRuns}
                  onRunAll={handleStartTestRun}
                  isRunningTests={isRunningTests}
                  onSelectRun={(runId) => setSelectedRunId(runId)}
                  hasTestCases={testCases.length > 0}
                />
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === "settings" && (
            <div className="max-w-3xl space-y-8">
              {/* Edit Project Settings */}
              <Card className="border-[#dce3da] bg-white shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">Project Configuration</CardTitle>
                  <CardDescription className="text-slate-500">
                    Update the display name or target URL for this testing project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editFeedback && (
                    <Alert
                      variant={editFeedback.variant}
                      className="mb-4"
                    >
                      {editFeedback.text}
                    </Alert>
                  )}

                  <form onSubmit={handleUpdateProject} className="space-y-4">
                    <Input
                      label="Project Name"
                      name="name"
                      value={editName}
                      error={editFieldErrors.name}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        if (editFieldErrors.name) {
                          setEditFieldErrors((prev) => ({ ...prev, name: "" }));
                        }
                      }}
                      disabled={isUpdating}
                    />

                    <Input
                      label="Application URL"
                      name="url"
                      type="url"
                      value={editUrl}
                      error={editFieldErrors.url}
                      onChange={(e) => {
                        setEditUrl(e.target.value);
                        if (editFieldErrors.url) {
                          setEditFieldErrors((prev) => ({ ...prev, url: "" }));
                        }
                      }}
                      disabled={isUpdating}
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isUpdating}
                        className="bg-[#2e633f] hover:bg-[#234e32] text-white font-medium"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-rose-200 bg-rose-50/40 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg text-rose-900">
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-rose-600">
                    Irreversible project operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      Delete this project
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Once deleted, this project and all its associated testing data cannot be recovered.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        isOpen={isDeleteDialogOpen}
        project={project}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={handleProjectDeleted}
      />

      {/* Generate AI Test Cases Modal */}
      <GenerateTestModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateTestCases}
        isGenerating={isGeneratingTestCases}
        existingCount={testCases.length}
      />
    </div>
  );
}

export default function ProjectDetailsPage() {
  return (
    <AuthGuard>
      <ProjectDetailsContent />
    </AuthGuard>
  );
}
