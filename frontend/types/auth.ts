export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  message?: string;
  errors?: ApiFieldError[];
}
