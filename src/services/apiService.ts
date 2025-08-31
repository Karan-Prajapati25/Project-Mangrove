import { supabase } from '@/integrations/supabase/client';
import { apiClient, API_ENDPOINTS, ApiError, AuthenticationError } from '@/config/api';
import type { User, Session } from '@supabase/supabase-js';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  display_name: string;
  country: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  country: string | null;
  points: number;
  rank: number | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  incident_type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  evidence_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  title: string;
  description?: string;
  incident_type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location?: string;
  latitude?: number;
  longitude?: number;
  evidence_urls?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string | null;
  lessons: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: number;
  time_limit: number | null;
  created_at: string;
}

export interface Guide {
  id: string;
  title: string;
  description: string | null;
  category: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

// Authentication Service
export class AuthService {
  // Sign up with Supabase
  static async signUp(data: SignupData): Promise<{ user: User | null; error: any }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            display_name: data.display_name,
            country: data.country
          }
        }
      });

      if (error) throw error;

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Sign in with Supabase
  static async signIn(credentials: LoginCredentials): Promise<{ user: User | null; session: Session | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;

      // Set auth token for backend API calls
      if (data.session?.access_token) {
        apiClient.setAuthToken(data.session.access_token);
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear auth token from backend API client
      apiClient.clearAuthToken();

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Get current session
  static async getSession(): Promise<{ session: Session | null; error: any }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      // Set auth token for backend API calls if session exists
      if (session?.access_token) {
        apiClient.setAuthToken(session.access_token);
      }

      return { session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  }

  // Get current user
  static async getUser(): Promise<{ user: User | null; error: any }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Update profile via backend API
  static async updateProfile(profileData: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await apiClient.put('/api/auth/profile', profileData);
      
      if (error) throw new ApiError(400, error);
      
      return { profile: data.profile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  // Get profile via backend API
  static async getProfile(): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/auth/profile');
      
      if (error) throw new ApiError(400, error);
      
      return { profile: data.profile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  // Request password reset
  static async forgotPassword(email: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
}

// Reports Service
export class ReportsService {
  // Get all reports
  static async getReports(filters?: {
    status?: string;
    incident_type?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ reports: Report[]; pagination?: any; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/reports', { params: filters });
      
      if (error) throw new ApiError(400, error);
      
      return { 
        reports: data.reports, 
        pagination: data.pagination, 
        error: null 
      };
    } catch (error) {
      return { reports: [], error };
    }
  }

  // Get single report
  static async getReport(id: string): Promise<{ report: Report | null; error: any }> {
    try {
      const { data, error } = await apiClient.get(`/api/reports/${id}`);
      
      if (error) throw new ApiError(400, error);
      
      return { report: data.report, error: null };
    } catch (error) {
      return { report: null, error };
    }
  }

  // Create new report
  static async createReport(reportData: CreateReportData): Promise<{ report: Report | null; coins_earned: number; error: any }> {
    try {
      const { data, error } = await apiClient.post('/api/reports', reportData);
      
      if (error) throw new ApiError(400, error);
      
      return { 
        report: data.report, 
        coins_earned: data.coins_earned || 0, 
        error: null 
      };
    } catch (error) {
      return { report: null, coins_earned: 0, error };
    }
  }

  // Update report
  static async updateReport(id: string, updateData: Partial<Report>): Promise<{ report: Report | null; error: any }> {
    try {
      const { data, error } = await apiClient.put(`/api/reports/${id}`, updateData);
      
      if (error) throw new ApiError(400, error);
      
      return { report: data.report, error: null };
    } catch (error) {
      return { report: null, error };
    }
  }

  // Delete report
  static async deleteReport(id: string): Promise<{ error: any }> {
    try {
      const { error } = await apiClient.delete(`/api/reports/${id}`);
      
      if (error) throw new ApiError(400, error);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Get reports by user
  static async getUserReports(userId: string, limit = 20, offset = 0): Promise<{ reports: Report[]; error: any }> {
    try {
      const { data, error } = await apiClient.get(`/api/reports/user/${userId}`, {
        params: { limit, offset }
      });
      
      if (error) throw new ApiError(400, error);
      
      return { reports: data.reports, error: null };
    } catch (error) {
      return { reports: [], error };
    }
  }

  // Get reports statistics
  static async getReportsStats(): Promise<{ stats: any; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/reports/stats/overview');
      
      if (error) throw new ApiError(400, error);
      
      return { stats: data.stats, error: null };
    } catch (error) {
      return { stats: null, error };
    }
  }
}

// Education Service
export class EducationService {
  // Get all courses
  static async getCourses(filters?: {
    difficulty?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: Course[]; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/education/courses', { params: filters });
      
      if (error) throw new ApiError(400, error);
      
      return { courses: data.courses, error: null };
    } catch (error) {
      return { courses: [], error };
    }
  }

  // Get single course
  static async getCourse(id: string): Promise<{ course: Course | null; error: any }> {
    try {
      const { data, error } = await apiClient.get(`/api/education/courses/${id}`);
      
      if (error) throw new ApiError(400, error);
      
      return { course: data.course, error: null };
    } catch (error) {
      return { course: null, error };
    }
  }

  // Get all quizzes
  static async getQuizzes(filters?: {
    difficulty?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ quizzes: Quiz[]; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/education/quizzes', { params: filters });
      
      if (error) throw new ApiError(400, error);
      
      return { quizzes: data.quizzes, error: null };
    } catch (error) {
      return { quizzes: [], error };
    }
  }

  // Get single quiz
  static async getQuiz(id: string): Promise<{ quiz: Quiz | null; error: any }> {
    try {
      const { data, error } = await apiClient.get(`/api/education/quizzes/${id}`);
      
      if (error) throw new ApiError(400, error);
      
      return { quiz: data.quiz, error: null };
    } catch (error) {
      return { quiz: null, error };
    }
  }

  // Submit quiz score
  static async submitQuizScore(quizId: string, score: number, totalQuestions: number): Promise<{
    quizScore: any;
    points_earned: number;
    percentage: number;
    error: any;
  }> {
    try {
      const { data, error } = await apiClient.post(`/api/education/quizzes/${quizId}/score`, {
        score,
        total_questions: totalQuestions
      });
      
      if (error) throw new ApiError(400, error);
      
      return {
        quizScore: data.quizScore,
        points_earned: data.points_earned,
        percentage: data.percentage,
        error: null
      };
    } catch (error) {
      return {
        quizScore: null,
        points_earned: 0,
        percentage: 0,
        error
      };
    }
  }

  // Get all guides
  static async getGuides(filters?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ guides: Guide[]; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/education/guides', { params: filters });
      
      if (error) throw new ApiError(400, error);
      
      return { guides: data.guides, error: null };
    } catch (error) {
      return { guides: [], error };
    }
  }

  // Get single guide
  static async getGuide(id: string): Promise<{ guide: Guide | null; error: any }> {
    try {
      const { data, error } = await apiClient.get(`/api/education/guides/${id}`);
      
      if (error) throw new ApiError(400, error);
      
      return { guide: data.guide, error: null };
    } catch (error) {
      return { guide: null, error };
    }
  }

  // Get user's course progress
  static async getCourseProgress(): Promise<{ progress: any[]; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/education/progress/courses');
      
      if (error) throw new ApiError(400, error);
      
      return { progress: data.progress, error: null };
    } catch (error) {
      return { progress: [], error };
    }
  }

  // Update course progress
  static async updateCourseProgress(courseId: string, progress: number, completed?: boolean): Promise<{
    progress: any;
    error: any;
  }> {
    try {
      const { data, error } = await apiClient.post(`/api/education/progress/courses/${courseId}`, {
        progress,
        completed
      });
      
      if (error) throw new ApiError(400, error);
      
      return { progress: data.progress, error: null };
    } catch (error) {
      return { progress: null, error };
    }
  }

  // Get user's quiz scores
  static async getQuizScores(): Promise<{ scores: any[]; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/education/progress/quizzes');
      
      if (error) throw new ApiError(400, error);
      
      return { scores: data.scores, error: null };
    } catch (error) {
      return { scores: [], error };
    }
  }
}

// Admin Service
export class AdminService {
  // Get all users
  static async getUsers(filters?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ users: any[]; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/admin/users', { params: filters });
      
      if (error) throw new ApiError(400, error);
      
      return { users: data.users, error: null };
    } catch (error) {
      return { users: [], error };
    }
  }

  // Create new user
  static async createUser(userData: {
    email: string;
    password: string;
    display_name: string;
    country: string;
    is_admin: boolean;
    role_type: string;
  }): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await apiClient.post('/api/admin/users', userData);
      
      if (error) throw new ApiError(400, error);
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Create admin role
  static async createAdminRole(adminData: {
    user_id: string;
    role_type: string;
    permissions: string[];
    admin_notes: string;
  }): Promise<{ adminRole: any; error: any }> {
    try {
      const { data, error } = await apiClient.post('/api/admin/admin-roles', adminData);
      
      if (error) throw new ApiError(400, error);
      
      return { adminRole: data.adminRole, error: null };
    } catch (error) {
      return { adminRole: null, error };
    }
  }

  // Create admin user
  static async createAdminUser(adminData: {
    email: string;
    password: string;
    display_name: string;
    role_type: string;
  }): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await apiClient.post('/api/admin/users', adminData);
      
      if (error) throw new ApiError(400, error);
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Get user details
  static async getUser(userId: string): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await apiClient.get(`/api/admin/users/${userId}`);
      
      if (error) throw new ApiError(400, error);
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Update user (admin)
  static async updateUser(userId: string, updateData: any): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await apiClient.put(`/api/admin/users/${userId}`, updateData);
      
      if (error) throw new ApiError(400, error);
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Ban/unban user
  static async banUser(userId: string, banned: boolean, reason?: string): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await apiClient.post(`/api/admin/users/${userId}/ban`, {
        banned,
        reason
      });
      
      if (error) throw new ApiError(400, error);
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Get admin statistics
  static async getStats(): Promise<{ stats: any; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/admin/stats/overview');
      
      if (error) throw new ApiError(400, error);
      
      return { stats: data.stats, error: null };
    } catch (error) {
      return { stats: null, error };
    }
  }

  // Get user activity timeline
  static async getUserActivity(days: number = 30): Promise<{ activity: any; error: any }> {
    try {
      const { data, error } = await apiClient.get('/api/admin/stats/user-activity', {
        params: { days }
      });
      
      if (error) throw new ApiError(400, error);
      
      return { activity: data, error: null };
    } catch (error) {
      return { activity: null, error };
    }
  }
}

// Export all services
export default {
  AuthService,
  ReportsService,
  EducationService,
  AdminService,
};
