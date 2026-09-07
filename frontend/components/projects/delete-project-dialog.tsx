"use client";

import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";
import { projectApi, ApiClientError } from "../../lib/api";
import { Project } from "../../types/project";

export interface DeleteProjectDialogProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onDeleted: (projectId: string) => void;
}

export function DeleteProjectDialog({
  isOpen,
  project,
  onClose,
  onDeleted
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!project) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await projectApi.deleteProject(project.id);
      onDeleted(project.id);
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to delete project"
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project"
      description="This action cannot be undone."
      maxWidth="sm"
    >
      {errorMessage && (
        <Alert variant="error" className="mb-4">
          {errorMessage}
        </Alert>
      )}

      <div className="space-y-3 text-sm text-slate-300">
        <p>
          Are you sure you want to permanently delete{" "}
          <strong className="text-white font-semibold">{project.name}</strong>?
        </p>
        <p className="text-xs text-slate-400 bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg leading-relaxed">
          All associated Playwright test cases, execution traces, and historical run logs belonging to this project will be permanently purged.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          size="md"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          Delete Project
        </Button>
      </div>
    </Modal>
  );
}
