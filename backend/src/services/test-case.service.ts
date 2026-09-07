import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { AIService } from "./ai/ai.service";
import { StructuredAnalysis } from "../types/analysis.types";
import { TestCaseDefinition } from "../types/test-case.types";
import { Prisma } from "@prisma/client";

export class TestCaseService {
  /**
   * Generates test cases via AI based on the latest Playwright analysis,
   * deduplicates against existing tests, and stores them in PostgreSQL.
   */
  static async generateTestCasesForProject(
    userId: string,
    projectId: string
  ) {
    // 1. Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    // 2. Retrieve latest application analysis
    const latestAnalysis = await prisma.applicationAnalysis.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });

    if (!latestAnalysis || !latestAnalysis.data) {
      throw new AppError(
        "Application has not been analyzed yet. Please run application analysis before generating test cases.",
        400
      );
    }

    const structuredAnalysis = latestAnalysis.data as unknown as StructuredAnalysis;

    // 3. Call AI provider
    const aiProvider = AIService.getProvider();
    const { testCases: candidateCases, source } =
      await aiProvider.generateTestCases(structuredAnalysis);

    if (!candidateCases || candidateCases.length === 0) {
      throw new AppError("AI provider did not produce any valid test cases.", 500);
    }

    // 4. Retrieve existing test case titles for deduplication
    const existingCases = await prisma.testCase.findMany({
      where: { projectId },
      select: { title: true }
    });
    const existingTitles = new Set(
      existingCases.map((c) => c.title.toLowerCase().trim())
    );

    // 5. Deduplicate against existing cases and within candidate cases
    const seenCandidateTitles = new Set<string>();
    const casesToInsert: TestCaseDefinition[] = [];

    for (const candidate of candidateCases) {
      const normalized = candidate.title.toLowerCase().trim();
      if (!existingTitles.has(normalized) && !seenCandidateTitles.has(normalized)) {
        seenCandidateTitles.add(normalized);
        casesToInsert.push(candidate);
      }
    }

    if (casesToInsert.length === 0) {
      // If all were duplicates, return the existing ones
      const current = await prisma.testCase.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" }
      });
      return {
        message: `Existing test cases are already up-to-date (${source}).`,
        source,
        testCases: current,
        createdCount: 0
      };
    }

    // 6. Batch create new test cases
    await prisma.$transaction(
      casesToInsert.map((c) =>
        prisma.testCase.create({
          data: {
            projectId,
            title: c.title,
            description: c.description || null,
            steps: c.steps as unknown as Prisma.InputJsonValue,
            expectedResult: c.expectedResult
          }
        })
      )
    );

    // 7. Return all test cases for this project
    const allCases = await prisma.testCase.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });

    return {
      message: `Successfully generated ${casesToInsert.length} new test cases (${source}).`,
      source,
      testCases: allCases,
      createdCount: casesToInsert.length
    };
  }

  /**
   * Lists all test cases for a user-owned project.
   */
  static async getTestCases(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const testCases = await prisma.testCase.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });

    return testCases;
  }

  /**
   * Retrieves a single test case with ownership verification.
   */
  static async getTestCaseById(userId: string, testCaseId: string) {
    const testCase = await prisma.testCase.findFirst({
      where: {
        id: testCaseId,
        project: { userId }
      },
      include: {
        project: {
          select: { id: true, name: true, url: true }
        }
      }
    });

    if (!testCase) {
      throw new AppError("Test case not found", 404);
    }

    return testCase;
  }

  /**
   * Deletes a test case after verifying ownership.
   */
  static async deleteTestCase(userId: string, testCaseId: string) {
    const testCase = await prisma.testCase.findFirst({
      where: {
        id: testCaseId,
        project: { userId }
      }
    });

    if (!testCase) {
      throw new AppError("Test case not found", 404);
    }

    await prisma.testCase.delete({
      where: { id: testCaseId }
    });

    return true;
  }
}
