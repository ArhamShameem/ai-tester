"use client";

import React from "react";
import Link from "next/link";
import { Project } from "../../types/project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface ProjectCardProps {
  project: Project;
  onDeleteClick: (project: Project) => void;
}

export function ProjectCard({ project, onDeleteClick }: ProjectCardProps) {
  const latestRun = project.testRuns?.[0];
  const testCasesCount = project._count?.testCases ?? 0;

  const getStatusBadge = () => {
    if (!latestRun) {
      return (
        <Badge variant="slate" className="text-2xs font-mono">
          No runs yet
        </Badge>
      );
    }

    switch (latestRun.status) {
      case "COMPLETED":
        return <Badge variant="emerald">Passed</Badge>;
      case "FAILED":
        return <Badge variant="rose">Failed</Badge>;
      case "RUNNING":
        return <Badge variant="amber">Running</Badge>;
      case "PENDING":
      default:
        return <Badge variant="teal">Queued</Badge>;
    }
  };

  return (
    <Card className="hover:border-slate-700 transition-all flex flex-col justify-between group">
      <div>
        <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <Link
              href={`/projects/${project.id}`}
              className="block group-hover:text-teal-400 transition-colors"
            >
              <CardTitle className="text-base sm:text-lg font-bold truncate" title={project.name}>
                {project.name}
              </CardTitle>
            </Link>
            <CardDescription className="flex items-center gap-1.5 truncate">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-1 truncate"
                title={project.url}
              >
                <span className="truncate">{project.url}</span>
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
            </CardDescription>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </CardHeader>

        <CardContent className="py-3">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/50 border border-slate-800/80 rounded-lg text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-2xs mb-0.5">
                Test Cases
              </span>
              <span className="font-mono font-bold text-slate-200 text-sm">
                {testCasesCount}
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-2xs mb-0.5">
                Created
              </span>
              <span className="text-slate-300 truncate block">
                {new Date(project.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline" size="sm">
            Open Project
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteClick(project)}
          className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
          title="Delete Project"
        >
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
}
