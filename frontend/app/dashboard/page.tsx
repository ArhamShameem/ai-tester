"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/auth-context";
import { AuthGuard } from "../../components/auth/auth-guard";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert } from "../../components/ui/alert";
import { AnimatedGrid } from "../../components/ui/animated-grid";
import { ProjectCard } from "../../components/projects/project-card";
import { CreateProjectModal } from "../../components/projects/create-project-modal";
import { DeleteProjectDialog } from "../../components/projects/delete-project-dialog";
import { projectApi, api, ApiClientError } from "../../lib/api";
import { Project } from "../../types/project";
import {
  Plus,
  FolderGit2,
  CheckCircle2,
  Activity,
  RefreshCw
} from "lucide-react";

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
    <div className="relative min-h-[calc(100vh-6.5rem)] bg-[#f8faf7] text-slate-900 p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Animated Technical Background Grid */}
      <AnimatedGrid />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Welcome & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e5ebe3]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Projects Dashboard
              </h1>
              <Badge variant="teal">Agentic QA</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Logged in as <span className="text-[#2e633f] font-semibold">{user?.name}</span> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={() => fetchProjects()}
              isLoading={isLoading}
              className="border-[#dce3da] text-slate-700 hover:text-slate-900 bg-white shadow-2xs"
              title="Refresh projects list"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#2e633f] hover:bg-[#234e32] text-white shadow-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Project
            </Button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <Alert variant="success" className="animate-in fade-in">
            {feedbackMessage}
          </Alert>
        )}

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-[#dce3da] bg-white p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">
                Total Projects
              </span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                {isLoadingProjects ? "..." : projects.length}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#eef4ed] border border-[#d0dfcc] flex items-center justify-center text-[#2e633f]">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </Card>

          <Card className="border-[#dce3da] bg-white p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">
                Total Test Cases
              </span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                {isLoadingProjects ? "..." : totalTestCases}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#eef4ed] border border-[#d0dfcc] flex items-center justify-center text-[#2e633f]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </Card>

          <Card className="border-[#dce3da] bg-white p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">
                Backend API
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2e633f] animate-pulse" />
                <span className="text-xs font-mono text-slate-700 font-medium">
                  {healthStatus === "ok" ? "Port 4000 Connected" : "Connecting..."}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkBackendHealth}
              disabled={isCheckingHealth}
              className="text-xs text-slate-500 hover:text-slate-900 p-2"
              title="Refresh Health"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? "animate-spin" : ""}`} />
            </Button>
          </Card>
        </div>

        {/* Projects Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Configured Target Projects
            </h2>
            <span className="text-xs text-slate-500">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          {/* Loading State */}
          {isLoadingProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-48 rounded-2xl bg-white border border-[#dce3da] animate-pulse p-6 space-y-4 shadow-xs"
                >
                  <div className="h-6 w-3/4 bg-slate-100 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                  <div className="h-12 bg-slate-50 rounded" />
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
            <Card className="border-[#dce3da] bg-white border-dashed shadow-xs">
              <CardContent className="p-12 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eef4ed] border border-[#d0dfcc] flex items-center justify-center text-[#2e633f] shadow-xs">
                  <FolderGit2 className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    No Testing Projects Yet
                  </h3>
                  <p className="text-sm text-slate-500">
                    Add your first target application URL to start analyzing web components and generating automated Playwright test suites.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#2e633f] hover:bg-[#234e32] text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create First Project
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
