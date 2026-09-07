export type TestRunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface ProjectTestRun {
  id: string;
  status: TestRunStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface ProjectCount {
  testCases: number;
  testRuns: number;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: ProjectCount;
  testRuns?: ProjectTestRun[];
}

export interface CreateProjectInput {
  name: string;
  url: string;
}

export interface UpdateProjectInput {
  name?: string;
  url?: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface ProjectResponse {
  project: Project;
}
