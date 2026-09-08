import {
  User,
  LoginInput,
  RegisterInput,
  AuthResponse,
  ApiErrorPayload,
  ApiFieldError
} from "../types/auth";
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectsResponse,
  ProjectResponse
} from "../types/project";
import {
  AnalysisResponse,
  StructuredAnalysis
} from "../types/analysis";
import {
  GenerateTestCasesResponse,
  GenerateTestCasesOptions,
  TestCasesResponse,
  TestCaseResponse
} from "../types/test-case";
import {
  StartTestRunResponse,
  TestRunsResponse,
  TestRunResponse,
  TestResultsResponse
} from "../types/test-run";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Ensure the base URL cleanly points to /api prefix
export const API_BASE_URL = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/$/, "")}/api`;

export class ApiClientError extends Error {
  public status: number;
  public fieldErrors: Record<string, string>;
  public rawErrors?: ApiFieldError[];

  constructor(status: number, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.rawErrors = errors;

    this.fieldErrors = {};
    if (errors && Array.isArray(errors)) {
      for (const err of errors) {
        if (err.field) {
          this.fieldErrors[err.field] = err.message;
        }
      }
    }
  }
}

/**
 * Core centralized request utility with HttpOnly credentials support
 */
export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "include", // Essential for HttpOnly JWT cookies
      headers
    });
  } catch (err) {
    const errorMsg =
      err instanceof Error
        ? `Network error: ${err.message}`
        : "Failed to connect to the server. Please ensure the backend is running.";
    throw new ApiClientError(0, errorMsg);
  }

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorPayload = data as ApiErrorPayload;
    const generalMessage =
      errorPayload.message ||
      (response.status === 401
        ? "Unauthorized access"
        : `Request failed with status ${response.status}`);

    throw new ApiClientError(
      response.status,
      generalMessage,
      errorPayload.errors
    );
  }

  return data as T;
}

/**
 * Standard API client methods
 */
export const api = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    });
  },

  patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined
    });
  },

  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  }
};

/**
 * Dedicated Auth API methods
 */
export const authApi = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/register", data);
  },

  async login(credentials: LoginInput): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/login", credentials);
  },

  async logout(): Promise<{ message: string }> {
    return api.post<{ message: string }>("/auth/logout");
  },

  async getCurrentUser(): Promise<AuthResponse> {
    return api.get<AuthResponse>("/auth/me");
  }
};

/**
 * Dedicated Project API methods
 */
export const projectApi = {
  async getProjects(): Promise<ProjectsResponse> {
    return api.get<ProjectsResponse>("/projects");
  },

  async getProject(id: string): Promise<ProjectResponse> {
    return api.get<ProjectResponse>(`/projects/${id}`);
  },

  async createProject(data: CreateProjectInput): Promise<ProjectResponse> {
    return api.post<ProjectResponse>("/projects", data);
  },

  async updateProject(
    id: string,
    data: UpdateProjectInput
  ): Promise<ProjectResponse> {
    return api.patch<ProjectResponse>(`/projects/${id}`, data);
  },

  async deleteProject(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/projects/${id}`);
  }
};

/**
 * Dedicated Application Analysis API methods (Playwright)
 */
export const analysisApi = {
  async analyzeProject(projectId: string): Promise<AnalysisResponse> {
    return api.post<AnalysisResponse>(`/projects/${projectId}/analyze`);
  },

  async getLatestAnalysis(
    projectId: string
  ): Promise<{ analysis: StructuredAnalysis | null }> {
    return api.get<{ analysis: StructuredAnalysis | null }>(
      `/projects/${projectId}/analysis`
    );
  }
};

/**
 * Dedicated Test Case Management & AI Generation API
 */
export const testCaseApi = {
  async generateTestCases(
    projectId: string,
    options?: GenerateTestCasesOptions
  ): Promise<GenerateTestCasesResponse> {
    const cleanOptions =
      options && typeof options === "object" && !("nativeEvent" in options) && !("target" in options)
        ? {
            context: typeof options.context === "string" ? options.context : undefined,
            count: typeof options.count === "number" ? options.count : undefined,
            replaceExisting: Boolean(options.replaceExisting)
          }
        : undefined;

    return api.post<GenerateTestCasesResponse>(
      `/projects/${projectId}/test-cases/generate`,
      cleanOptions
    );
  },

  async getTestCases(projectId: string): Promise<TestCasesResponse> {
    return api.get<TestCasesResponse>(`/projects/${projectId}/test-cases`);
  },

  async getTestCase(testCaseId: string): Promise<TestCaseResponse> {
    return api.get<TestCaseResponse>(`/test-cases/${testCaseId}`);
  },

  async deleteTestCase(testCaseId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/test-cases/${testCaseId}`);
  },

  async clearTestCases(
    projectId: string
  ): Promise<{ message: string; deletedCount: number }> {
    return api.delete<{ message: string; deletedCount: number }>(
      `/projects/${projectId}/test-cases`
    );
  }
};

/**
 * Dedicated Test Run & Execution API
 */
export const testRunApi = {
  async startTestRun(projectId: string): Promise<StartTestRunResponse> {
    return api.post<StartTestRunResponse>(`/projects/${projectId}/test-runs`);
  },

  async getTestRuns(projectId: string): Promise<TestRunsResponse> {
    return api.get<TestRunsResponse>(`/projects/${projectId}/test-runs`);
  },

  async getTestRun(testRunId: string): Promise<TestRunResponse> {
    return api.get<TestRunResponse>(`/test-runs/${testRunId}`);
  },

  async getTestResults(testRunId: string): Promise<TestResultsResponse> {
    return api.get<TestResultsResponse>(`/test-runs/${testRunId}/results`);
  }
};
