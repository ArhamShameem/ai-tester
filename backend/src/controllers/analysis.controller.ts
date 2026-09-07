import { Request, Response, NextFunction } from "express";
import { AnalyzerService } from "../services/browser/analyzer.service";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

export const analyzeProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;

    const analysis = await AnalyzerService.analyzeProject(
      req.user!.id,
      projectId
    );

    return res.status(200).json({
      analysis
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;

    // Verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.id
      }
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const latest = await prisma.applicationAnalysis.findFirst({
      where: {
        projectId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      analysis: latest?.data || null
    });
  } catch (error) {
    next(error);
  }
};
