import { Request, Response, NextFunction } from "express";
import { TestRunService } from "../services/test-run.service";
import { StorageService } from "../services/storage/storage.service";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

export const startTestRun = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;

    const result = await TestRunService.startTestRun(req.user!.id, projectId);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTestRuns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;

    const testRuns = await TestRunService.getTestRunsForProject(
      req.user!.id,
      projectId
    );
    return res.status(200).json({ testRuns });
  } catch (error) {
    next(error);
  }
};

export const getTestRunById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const testRunId = Array.isArray(req.params.testRunId)
      ? req.params.testRunId[0]
      : req.params.testRunId;

    const testRun = await TestRunService.getTestRunById(
      req.user!.id,
      testRunId
    );
    return res.status(200).json({ testRun });
  } catch (error) {
    next(error);
  }
};

export const getTestResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const testRunId = Array.isArray(req.params.testRunId)
      ? req.params.testRunId[0]
      : req.params.testRunId;

    const results = await TestRunService.getTestResults(
      req.user!.id,
      testRunId
    );
    return res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

export const getArtifact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;
    const testRunId = Array.isArray(req.params.testRunId)
      ? req.params.testRunId[0]
      : req.params.testRunId;
    const filename = Array.isArray(req.params.filename)
      ? req.params.filename[0]
      : req.params.filename;

    // Verify ownership of the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.id
      }
    });

    if (!project) {
      throw new AppError("Artifact not found or unauthorized", 404);
    }

    const storage = StorageService.getStorage();
    const filePath = await storage.getScreenshotPath(
      projectId,
      testRunId,
      filename
    );

    if (!filePath) {
      throw new AppError("Artifact file not found", 404);
    }

    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
