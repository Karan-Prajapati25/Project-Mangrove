import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  points: number;
  rank: number;
  country?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  badge_type: string;
  target: number;
  progress: number;
  earned: boolean;
  earned_at?: string;
  created_at: string;
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    try {
      // Fetch top users with their profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedData: LeaderboardEntry[] = (data || []).map((profile, index) => ({
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name || 'Anonymous Guardian',
        avatar_url: profile.avatar_url,
        points: profile.points || 0,
        rank: index + 1,
        country: profile.country || 'Unknown',
        created_at: profile.created_at
      }));

      setLeaderboard(formattedData);

      // Find current user's rank
      if (user) {
        const userEntry = formattedData.find(entry => entry.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }

    } catch (error: any) {
      toast({
        title: "Error loading leaderboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);

    } catch (error: any) {
      toast({
        title: "Error loading achievements",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserPoints = async (points: number) => {
    if (!user) return false;

    try {
      // Get current user profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newPoints = (profile?.points || 0) + points;

      // Update user points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Refresh leaderboard
      await fetchLeaderboard();
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating points",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const checkAchievements = async () => {
    if (!user) return;

    try {
      // Get user stats
      const [profileRes, reportsRes, coinsRes] = await Promise.all([
        supabase.from('profiles').select('points').eq('user_id', user.id).single(),
        supabase.from('reports').select('id, status').eq('user_id', user.id),
        supabase.from('coins').select('balance').eq('user_id', user.id).single()
      ]);

      const points = profileRes.data?.points || 0;
      const reports = reportsRes.data || [];
      const verifiedReports = reports.filter(r => r.status === 'verified').length;
      const totalReports = reports.length;
      const verificationRate = totalReports > 0 ? (verifiedReports / totalReports) * 100 : 0;

      // Define achievement checks
      const achievementChecks = [
        { title: 'First Report', target: 1, progress: totalReports, type: 'reports' },
        { title: 'Guardian Elite', target: 10000, progress: points, type: 'points' },
        { title: 'Sharp Eye', target: 90, progress: verificationRate, type: 'verification' },
        { title: 'Marine Protector', target: 50, progress: totalReports, type: 'reports' },
      ];

      // Check and update achievements
      for (const check of achievementChecks) {
        const earned = check.progress >= check.target;
        
        // Check if achievement already exists
        const existing = achievements.find(a => a.title === check.title);
        
        if (!existing) {
          // Create new achievement
          await supabase.from('achievements').insert({
            user_id: user.id,
            title: check.title,
            description: `Achievement: ${check.title}`,
            badge_type: check.type,
            target: check.target,
            progress: check.progress,
            earned,
            earned_at: earned ? new Date().toISOString() : null
          });
        } else if (!existing.earned && earned) {
          // Update achievement as earned
          await supabase.from('achievements')
            .update({ 
              earned: true, 
              earned_at: new Date().toISOString(),
              progress: check.progress
            })
            .eq('id', existing.id);
          
          toast({
            title: "Achievement unlocked!",
            description: `You've earned the ${check.title} badge!`,
          });
        } else if (existing.progress !== check.progress) {
          // Update progress
          await supabase.from('achievements')
            .update({ progress: check.progress })
            .eq('id', existing.id);
        }
      }

      // Refresh achievements
      await fetchUserAchievements();

    } catch (error: any) {
      console.error('Error checking achievements:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchUserAchievements();
      checkAchievements();
    }
  }, [user]);

  return {
    leaderboard,
    userRank,
    achievements,
    loading,
    updateUserPoints,
    checkAchievements,
    refetchLeaderboard: fetchLeaderboard
  };
};