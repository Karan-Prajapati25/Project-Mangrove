import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Types based on our database schema
export interface Profile {
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
  status: 'Pending' | 'Investigating' | 'Resolved' | 'Dismissed';
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  evidence_urls: string[] | null;
  created_at: string;
  updated_at: string;
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

// Profile hooks
export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });
};

// Reports hooks
export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Report[];
    },
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (reportData: Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('reports')
        .insert([{ ...reportData, user_id: user.id }])
        .select()
        .single();
        
      if (error) throw error;
      return data as Report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

// Courses hooks
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Course[];
    },
  });
};

// Quizzes hooks
export const useQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Quiz[];
    },
  });
};

// Guides hooks
export const useGuides = () => {
  return useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Guide[];
    },
  });
};

// Leaderboard hooks
export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      return data as Profile[];
    },
  });
};