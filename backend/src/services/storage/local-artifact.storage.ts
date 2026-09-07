import fs from "fs/promises";
import path from "path";
import { ArtifactStorage } from "./artifact-storage";

export class LocalArtifactStorage implements ArtifactStorage {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), "artifacts");
  }

  /**
   * Sanitizes path segments to prevent directory traversal
   */
  private sanitizeSegment(segment: string): string {
    const clean = segment.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!clean) {
      throw new Error("Invalid storage path segment");
    }
    return clean;
  }

  /**
   * Saves screenshot buffer and returns the relative asset identifier
   */
  async saveScreenshot(
    projectId: string,
    testRunId: string,
    testResultId: string,
    buffer: Buffer
  ): Promise<string> {
    const cleanProject = this.sanitizeSegment(projectId);
    const cleanRun = this.sanitizeSegment(testRunId);
    const cleanResult = this.sanitizeSegment(testResultId);

    const targetDir = path.join(
      this.baseDir,
      "projects",
      cleanProject,
      "runs",
      cleanRun
    );

    await fs.mkdir(targetDir, { recursive: true });

    const filename = `${cleanResult}.png`;
    const targetFile = path.join(targetDir, filename);

    await fs.writeFile(targetFile, buffer);

    // Return reference URL / path that can be retrieved via the API
    return `/api/projects/${cleanProject}/runs/${cleanRun}/artifacts/${filename}`;
  }

  /**
   * Resolves the absolute path to a saved screenshot if it exists
   */
  async getScreenshotPath(
    projectId: string,
    testRunId: string,
    filename: string
  ): Promise<string | null> {
    const cleanProject = this.sanitizeSegment(projectId);
    const cleanRun = this.sanitizeSegment(testRunId);
    const cleanFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "");

    const targetFile = path.join(
      this.baseDir,
      "projects",
      cleanProject,
      "runs",
      cleanRun,
      cleanFilename
    );

    // Guard against directory escape
    const resolved = path.resolve(targetFile);
    if (!resolved.startsWith(path.resolve(this.baseDir))) {
      return null;
    }

    try {
      await fs.access(resolved);
      return resolved;
    } catch {
      return null;
    }
  }
}
