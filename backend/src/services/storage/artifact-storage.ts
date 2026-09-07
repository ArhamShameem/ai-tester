export interface ArtifactStorage {
  saveScreenshot(
    projectId: string,
    testRunId: string,
    testResultId: string,
    buffer: Buffer
  ): Promise<string>;

  getScreenshotPath(
    projectId: string,
    testRunId: string,
    filename: string
  ): Promise<string | null>;
}
