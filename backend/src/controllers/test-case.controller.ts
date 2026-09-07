import { Request, Response, NextFunction } from "express";
import { TestCaseService } from "../services/test-case.service";

export const generateTestCases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;

    const result = await TestCaseService.generateTestCasesForProject(
      req.user!.id,
      projectId
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTestCases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = Array.isArray(req.params.projectId)
      ? req.params.projectId[0]
      : req.params.projectId;

    const testCases = await TestCaseService.getTestCases(
      req.user!.id,
      projectId
    );

    return res.status(200).json({
      testCases
    });
  } catch (error) {
    next(error);
  }
};

export const getTestCaseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const testCaseId = Array.isArray(req.params.testCaseId)
      ? req.params.testCaseId[0]
      : req.params.testCaseId;

    const testCase = await TestCaseService.getTestCaseById(
      req.user!.id,
      testCaseId
    );

    return res.status(200).json({
      testCase
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTestCase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const testCaseId = Array.isArray(req.params.testCaseId)
      ? req.params.testCaseId[0]
      : req.params.testCaseId;

    await TestCaseService.deleteTestCase(req.user!.id, testCaseId);

    return res.status(200).json({
      message: "Test case deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
