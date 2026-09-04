import {
  User,
  LoginInput,
  RegisterInput,
  AuthResponse,
  ApiErrorPayload,
  ApiFieldError
} from "../types/auth";

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
