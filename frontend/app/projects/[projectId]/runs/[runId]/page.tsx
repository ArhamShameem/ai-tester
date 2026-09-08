"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "../../../../../components/auth/auth-guard";
import { TestRunDetail } from "../../../../../components/projects/test-run-detail";

import { AnimatedGrid } from "../../../../../components/ui/animated-grid";

function RunDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const runId = params.runId as string;

  return (
    <div className="relative min-h-[calc(100vh-6.5rem)] bg-[#f8faf7] text-slate-900 p-4 sm:p-6 lg:p-8 overflow-hidden">
      <AnimatedGrid />
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <TestRunDetail
          runId={runId}
          onBack={() => router.push(`/projects/${projectId}`)}
        />
      </div>
    </div>
  );
}

export default function RunDetailsPage() {
  return (
    <AuthGuard>
      <RunDetailsPageContent />
    </AuthGuard>
  );
}
