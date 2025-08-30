// API Configuration for both Supabase and Backend Server
export const API_CONFIG = {
  // Backend Server
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  // Supabase (already configured in client.ts)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://yhpafezvxbnaeutbrito.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocGFmZXp2eGJuYWV1dGJyaXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjcxNjksImV4cCI6MjA3MjEwMzE2OX0.caoxG-Jw9MrONflcakDtj1frrJeKKtXPw1UuKQfgJ9c',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Backend Server Endpoints
  AUTH: {
    SIGNUP: `${API_CONFIG.BACKEND_URL}/api/auth/signup`,
    SIGNIN: `${API_CONFIG.BACKEND_URL}/api/auth/signin`,
    SIGNOUT: `${API_CONFIG.BACKEND_URL}/api/auth/signout`,
    PROFILE: `${API_CONFIG.BACKEND_URL}/api/auth/profile`,
    FORGOT_PASSWORD: `${API_CONFIG.BACKEND_URL}/api/auth/forgot-password`,
  },
  REPORTS: {
    LIST: `${API_CONFIG.BACKEND_URL}/api/reports`,
    CREATE: `${API_CONFIG.BACKEND_URL}/api/reports`,
    UPDATE: (id: string) => `${API_CONFIG.BACKEND_URL}/api/reports/${id}`,
    DELETE: (id: string) => `${API_CONFIG.BACKEND_URL}/api/reports/${id}`,
    BY_USER: (userId: string) => `${API_CONFIG.BACKEND_URL}/api/reports/user/${userId}`,
    STATS: `${API_CONFIG.BACKEND_URL}/api/reports/stats/overview`,
  },
  EDUCATION: {
    COURSES: `${API_CONFIG.BACKEND_URL}/api/education/courses`,
    COURSE: (id: string) => `${API_CONFIG.BACKEND_URL}/api/education/courses/${id}`,
    QUIZZES: `${API_CONFIG.BACKEND_URL}/api/education/quizzes`,
    QUIZ: (id: string) => `${API_CONFIG.BACKEND_URL}/api/education/quizzes/${id}`,
    QUIZ_SCORE: (id: string) => `${API_CONFIG.BACKEND_URL}/api/education/quizzes/${id}/score`,
    GUIDES: `${API_CONFIG.BACKEND_URL}/api/education/guides`,
    GUIDE: (id: string) => `${API_CONFIG.BACKEND_URL}/api/education/guides/${id}`,
    PROGRESS: {
      COURSES: `${API_CONFIG.BACKEND_URL}/api/education/progress/courses`,
      COURSE_UPDATE: (courseId: string) => `${API_CONFIG.BACKEND_URL}/api/education/progress/courses/${courseId}`,
      QUIZZES: `${API_CONFIG.BACKEND_URL}/api/education/progress/quizzes`,
    },
  },
  ADMIN: {
    USERS: `${API_CONFIG.BACKEND_URL}/api/admin/users`,
    USER: (userId: string) => `${API_CONFIG.BACKEND_URL}/api/admin/users/${userId}`,
    USER_BAN: (userId: string) => `${API_CONFIG.BACKEND_URL}/api/admin/users/${userId}/ban`,
    REPORTS: `${API_CONFIG.BACKEND_URL}/api/admin/reports`,
    REPORT_STATUS: (id: string) => `${API_CONFIG.BACKEND_URL}/api/admin/reports/${id}/status`,
    ADMIN_APPLICATIONS: `${API_CONFIG.BACKEND_URL}/api/admin/admin-applications`,
    ADMIN_APPLICATION_STATUS: (id: string) => `${API_CONFIG.BACKEND_URL}/api/admin/admin-applications/${id}/status`,
    STATS: {
      OVERVIEW: `${API_CONFIG.BACKEND_URL}/api/admin/stats/overview`,
      USER_ACTIVITY: `${API_CONFIG.BACKEND_URL}/api/admin/stats/user-activity`,
    },
  },
  HEALTH: `${API_CONFIG.BACKEND_URL}/health`,
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Error Types
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(HTTP_STATUS.BAD_REQUEST, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(HTTP_STATUS.UNAUTHORIZED, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(HTTP_STATUS.FORBIDDEN, message);
    this.name = 'AuthorizationError';
  }
}

// Request Configuration
export interface RequestConfig {
  method?: keyof typeof HTTP_METHODS;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
  timeout?: number;
}

// Default Request Configuration
export const DEFAULT_REQUEST_CONFIG: RequestConfig = {
  method: HTTP_METHODS.GET,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
};

// Utility Functions
export const buildUrl = (baseUrl: string, params?: Record<string, string | number>): string => {
  if (!params) return baseUrl;
  
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
};

export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// API Client Class
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_CONFIG.BACKEND_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = HTTP_METHODS.GET,
      headers = {},
      body,
      params,
      timeout = DEFAULT_REQUEST_CONFIG.timeout,
    } = config;

    const url = buildUrl(`${this.baseUrl}${endpoint}`, params);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.statusText,
          await response.text()
        );
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError(
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          'Request timeout'
        );
      }
      
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Network error',
        error
      );
    }
  }

  // Generic methods
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.GET });
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.POST, body });
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.PUT, body });
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.DELETE });
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Clear authentication token
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Export everything
export default {
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_METHODS,
  HTTP_STATUS,
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ApiClient,
  apiClient,
};