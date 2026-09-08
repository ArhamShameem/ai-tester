"use client";

import React from "react";
import Link from "next/link";
import { Project } from "../../types/project";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Trash2, ExternalLink, ArrowRight } from "lucide-react";

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
    <Card className="border-[#dce3da] hover:border-[#2e633f]/50 hover:shadow-md transition-all flex flex-col justify-between group bg-white">
      <div>
        <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <Link
              href={`/projects/${project.id}`}
              className="block group-hover:text-[#2e633f] transition-colors"
            >
              <CardTitle
                className="text-base sm:text-lg font-bold truncate text-slate-900"
                title={project.name}
              >
                {project.name}
              </CardTitle>
            </Link>
            <CardDescription className="flex items-center gap-1.5 truncate">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-[#2e633f] transition-colors flex items-center gap-1 truncate"
                title={project.url}
              >
                <span className="truncate">{project.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </CardDescription>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </CardHeader>

        <CardContent className="py-2 sm:py-3">
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#f6f9f4] border border-[#e2e8e0] rounded-xl text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-2xs mb-0.5">
                Test Cases
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {testCasesCount}
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-semibold block text-2xs mb-0.5">
                Created
              </span>
              <span className="text-slate-600 truncate block">
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

      <CardFooter className="pt-3 border-t border-[#e5ebe3] flex items-center justify-between">
        <Link href={`/projects/${project.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-slate-700 hover:text-[#2e633f] hover:border-[#2e633f]/40"
          >
            Open Project
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteClick(project)}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          title="Delete Project"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
