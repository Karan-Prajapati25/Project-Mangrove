import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  lessons: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  questions: number;
  time_limit: number;
  created_at: string;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  image_url: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  completed_at: string;
  created_at: string;
}

export const useEducation = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEducationData = async () => {
    setLoading(true);
    
    try {
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);

      // Fetch guides
      const { data: guidesData, error: guidesError } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (guidesError) throw guidesError;
      setGuides(guidesData || []);

      // Fetch user progress if authenticated
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;
        setUserProgress(progressData || []);
      }

    } catch (error: any) {
      toast({
        title: "Error loading education content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (courseId: string, progress: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          progress,
          completed: progress >= 100,
          completed_at: progress >= 100 ? new Date().toISOString() : null
        });

      if (error) throw error;

      // Update local state
      await fetchEducationData();
      
      if (progress >= 100) {
        toast({
          title: "Course completed!",
          description: "Congratulations! You've earned bonus coins for completing this course.",
        });
      }

      return true;
    } catch (error: any) {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const submitQuizScore = async (quizId: string, score: number, totalQuestions: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_quiz_scores')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          total_questions: totalQuestions
        });

      if (error) throw error;

      // Award coins for quiz completion
      const coinsToAward = Math.floor((score / totalQuestions) * 100); // 1 coin per correct answer
      await awardCoinsForQuiz(coinsToAward);

      toast({
        title: "Quiz completed!",
        description: `You scored ${score}/${totalQuestions} and earned ${coinsToAward} coins!`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error submitting quiz",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const awardCoinsForQuiz = async (coins: number) => {
    if (!user) return;

    try {
      // Check if user has coins record
      const { data: existingCoins } = await supabase
        .from('coins')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (existingCoins) {
        // Update existing balance
        await supabase
          .from('coins')
          .update({ balance: existingCoins.balance + coins })
          .eq('user_id', user.id);
      } else {
        // Create new coins record (no welcome bonus here, it's handled by CoinsWidget)
        await supabase
          .from('coins')
          .insert({ user_id: user.id, balance: coins });
      }
    } catch (error) {
      console.error('Error awarding coins:', error);
    }
  };

  useEffect(() => {
    fetchEducationData();
  }, [user]);

  return {
    courses,
    quizzes,
    guides,
    userProgress,
    loading,
    updateProgress,
    submitQuizScore,
    refetchData: fetchEducationData
  };
};