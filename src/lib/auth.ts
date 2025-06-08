import { supabase } from '@/integrations/supabase/client';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username: string;
}

export async function signUp({ email, password, fullName, username }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function ensureProfile(userId: string) {
  try {
    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: user } = await supabase.auth.admin.getUserById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: user.user_metadata.full_name || 'User',
          username: user.user_metadata.username || `user_${userId}`,
        });

      if (insertError) {
        throw insertError;
      }
    }

    return true;
  } catch (error) {
    console.error('Error ensuring profile:', error);
    throw error;
  }
}

export async function updateProfile(userId: string, updates: {
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
} 