import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { AdminDashboard } from '@/components/AdminDashboard';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const { user, loading } = useAuthUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return; // Wait for user to load
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (error || !profile?.is_admin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page.',
          variant: 'destructive',
        });
        navigate('/');
      }
    };
    checkAdminAccess();
  }, [user, loading, navigate, toast]);

  if (loading) return <div className="flex-1 flex justify-center items-center">Loading...</div>;
  if (!user) return null;

  return <AdminDashboard />;
} 