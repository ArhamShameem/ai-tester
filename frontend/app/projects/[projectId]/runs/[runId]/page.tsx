"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "../../../../../components/auth/auth-guard";
import { TestRunDetail } from "../../../../../components/projects/test-run-detail";

function RunDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const runId = params.runId as string;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
