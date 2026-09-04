"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/auth-context";
import { AuthGuard } from "../../components/auth/auth-guard";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert } from "../../components/ui/alert";
import { api, ApiClientError } from "../../lib/api";

function DashboardContent() {
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Check health on load
  const checkBackendHealth = async () => {
    setIsCheckingHealth(true);
    setHealthError(null);
    try {
      const data = await api.get<{ status: string }>("/health");
      setHealthStatus(data.status);
    } catch (err) {
      setHealthStatus(null);
      setHealthError(
        err instanceof ApiClientError
          ? err.message
          : "Could not reach backend on http://localhost:4000"
      );
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Dashboard
              </h1>
              <Badge variant="teal">Phase 1 Complete</Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back, <span className="text-teal-300 font-semibold">{user?.name}</span>.
              Manage your automated AI testing workflows below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={checkBackendHealth}
              isLoading={isCheckingHealth}
            >
              Test Backend API
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => logout()}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Backend Connection Status Banner */}
        {healthError ? (
          <Alert variant="warning" title="Backend Connection Alert">
            {healthError}. Make sure the Express server is running on port 4000 (`npm run dev` in `backend/`).
          </Alert>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-teal-950/30 border border-teal-800/40 rounded-lg text-xs sm:text-sm text-teal-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
              <span>
                Backend API Connected: <strong className="font-mono">http://localhost:4000</strong> ({healthStatus || "healthy"})
              </span>
            </div>
            <span className="text-slate-400 text-xs hidden sm:inline">
              Session authenticated via HttpOnly Cookie
            </span>
          </div>
        )}

        {/* Top Grid: User Profile & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Account Info */}
          <Card className="md:col-span-1 border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-200">
                Current Session
              </CardTitle>
              <CardDescription>
                Authenticated through secure HttpOnly JWT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/70">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="font-semibold text-slate-100">{user?.name}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">
                    User ID
                  </span>
                  <span className="font-mono text-slate-300 truncate max-w-[170px]" title={user?.id}>
                    {user?.id}
                  </span>
                </div>
                {user?.createdAt && (
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-500 uppercase tracking-wider font-medium">
                      Joined
                    </span>
                    <span className="text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 uppercase tracking-wider font-medium">
                    Auth Strategy
                  </span>
                  <span className="text-teal-400 font-medium">HttpOnly Cookie (credentials: include)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-200">
                Test Projects
              </CardTitle>
              <CardDescription>Target web applications configured</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">0</div>
              <p className="text-xs text-slate-500 mt-2">
                Phase 2 will enable creating and managing target URL testing projects.
              </p>
            </CardContent>
          </Card>

          {/* Test Runs Metric */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-200">
                Playwright Runs
              </CardTitle>
              <CardDescription>Asynchronous automated job executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">0</div>
              <p className="text-xs text-slate-500 mt-2">
                Automated test runs will be scheduled through Redis + BullMQ workers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Phase 2 Preview / Empty State Section */}
        <Card className="border-slate-800 bg-slate-900/40 border-dashed">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-teal-400">
              <svg
                width={28}
                height={28}
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-100">
                Ready for Phase 2: Project Management
              </h3>
              <p className="text-sm text-slate-400">
                Frontend foundation and HttpOnly authentication are fully operational. Next, you can connect project CRUD APIs to create testing targets.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="secondary" size="md" disabled>
                + New Testing Project (Phase 2)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
