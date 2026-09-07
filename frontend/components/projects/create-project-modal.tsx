"use client";

import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";
import { projectApi } from "../../lib/api";
import { ApiClientError } from "../../lib/api";
import { Project } from "../../types/project";

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName("");
    setUrl("");
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Project name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Project name must be at least 2 characters";
    }

    if (!url.trim()) {
      errors.url = "Target application URL is required";
    } else {
      try {
        const parsed = new URL(url.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          errors.url = "URL must start with http:// or https://";
        }
      } catch {
        errors.url = "Please enter a valid URL (e.g. https://my-app.com)";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await projectApi.createProject({
        name: name.trim(),
        url: url.trim()
      });
      resetForm();
      onCreated(response.project);
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to create project. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Testing Project"
      description="Add a target web application URL to generate and execute automated Playwright test suites."
    >
      {errorMessage && (
        <Alert variant="error" className="mb-4" title="Creation Failed">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          placeholder="e.g. E-Commerce Checkout Flow"
          value={name}
          error={fieldErrors.name}
          helperText="A descriptive title to identify this target application"
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) {
              setFieldErrors((prev) => ({ ...prev, name: "" }));
            }
          }}
          disabled={isSubmitting}
          autoFocus
        />

        <Input
          label="Application URL"
          name="url"
          placeholder="https://example.com"
          type="url"
          value={url}
          error={fieldErrors.url}
          helperText="The public or local web address to crawl and test with Playwright"
          onChange={(e) => {
            setUrl(e.target.value);
            if (fieldErrors.url) {
              setFieldErrors((prev) => ({ ...prev, url: "" }));
            }
          }}
          disabled={isSubmitting}
        />

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
