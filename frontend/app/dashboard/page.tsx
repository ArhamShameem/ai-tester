"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/auth-context";
import { AuthGuard } from "../../components/auth/auth-guard";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert } from "../../components/ui/alert";
import { ProjectCard } from "../../components/projects/project-card";
import { CreateProjectModal } from "../../components/projects/create-project-modal";
import { DeleteProjectDialog } from "../../components/projects/delete-project-dialog";
import { projectApi, api, ApiClientError } from "../../lib/api";
import { Project } from "../../types/project";

function DashboardContent() {
  const { user, logout } = useAuth();

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Backend Health check
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const data = await projectApi.getProjects();
      setProjects(data.projects);
    } catch (err) {
      setProjectsError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to load projects from server"
      );
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const checkBackendHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const data = await api.get<{ status: string }>("/health");
      setHealthStatus(data.status);
    } catch {
      setHealthStatus(null);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    checkBackendHealth();
  }, [fetchProjects]);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setFeedbackMessage(`Project "${newProject.name}" created successfully!`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleProjectDeleted = (deletedId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== deletedId));
    setFeedbackMessage("Project removed successfully.");
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const totalTestCases = projects.reduce(
    (acc, p) => acc + (p._count?.testCases ?? 0),
    0
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Projects Dashboard
              </h1>
              <Badge variant="teal">Phase 2</Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Logged in as <span className="text-teal-300 font-semibold">{user?.name}</span> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-md shadow-teal-900/30"
            >
              <svg
                width={16}
                height={16}
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Project
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => logout()}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <Alert variant="success" className="animate-fadeIn">
            {feedbackMessage}
          </Alert>
        )}

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Total Projects
              </span>
              <span className="text-2xl font-extrabold text-white font-mono">
                {isLoadingProjects ? "..." : projects.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400">
              <svg
                width={20}
                height={20}
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Total Test Cases
              </span>
              <span className="text-2xl font-extrabold text-white font-mono">
                {isLoadingProjects ? "..." : totalTestCases}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
              <svg
                width={20}
                height={20}
                className="w-5 h-5"
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
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Backend API
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                <span className="text-xs font-mono text-teal-300">
                  {healthStatus === "ok" ? "Port 4000 Connected" : "Connecting..."}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkBackendHealth}
              disabled={isCheckingHealth}
              className="text-xs text-slate-400"
            >
              Refresh
            </Button>
          </Card>
        </div>

        {/* Projects Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Configured Target Projects
            </h2>
            <span className="text-xs text-slate-400">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          {/* Loading State */}
          {isLoadingProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-48 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse p-6 space-y-4"
                >
                  <div className="h-6 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded" />
                  <div className="h-12 bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoadingProjects && projectsError && (
            <Alert variant="error" title="Failed to Fetch Projects">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
                <span>{projectsError}</span>
                <Button variant="outline" size="sm" onClick={fetchProjects}>
                  Try Again
                </Button>
              </div>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoadingProjects && !projectsError && projects.length === 0 && (
            <Card className="border-slate-800 bg-slate-900/40 border-dashed">
              <CardContent className="p-12 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shadow-md">
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
                    No Testing Projects Yet
                  </h3>
                  <p className="text-sm text-slate-400">
                    Add your first target application URL to start analyzing web components and generating automated Playwright test suites.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    + Create First Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          {!isLoadingProjects && !projectsError && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDeleteClick={(p) => setProjectToDelete(p)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleProjectCreated}
      />

      {/* Delete Project Confirmation Dialog */}
      <DeleteProjectDialog
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onDeleted={handleProjectDeleted}
      />
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
