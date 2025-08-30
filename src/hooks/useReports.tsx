import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Report {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: string;
  status: string;
  location: string;
  latitude: number;
  longitude: number;
  evidence_urls: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface NewReport {
  title: string;
  description: string;
  incident_type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  evidence_urls?: string[];
}

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching reports",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const submitReport = async (newReport: NewReport) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a report.",
        variant: "destructive",
      });
      return false;
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...newReport,
        user_id: user.id,
        status: 'Pending',
        severity: 'Pending' // Will be detected by AI during review
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error submitting report",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    setReports([data, ...reports]);
    toast({
      title: "Report submitted successfully!",
      description: "Your report has been received and will be reviewed by administrators. The severity level will be detected by AI, and you'll earn Guardian Coins based on the severity when your report is approved!",
    });
    return true;
  };


  const getUserReports = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching your reports",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }

    return data || [];
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    submitReport,
    getUserReports,
    refetchReports: fetchReports
  };
};