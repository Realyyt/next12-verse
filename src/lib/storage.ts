import { supabase } from '@/integrations/supabase/client';

export type BucketType = 'posts' | 'avatars' | 'events';

// Validate bucket exists
async function validateBucket(bucket: BucketType): Promise<boolean> {
  const { data, error } = await supabase
    .storage
    .getBucket(bucket);

  if (error) {
    console.error(`Error validating bucket ${bucket}:`, error);
    return false;
  }

  return true;
}

export async function uploadFile(
  bucket: BucketType,
  file: File,
  path: string
): Promise<{ path: string; error: Error | null }> {
  try {
    // Validate bucket exists
    const bucketExists = await validateBucket(bucket);
    if (!bucketExists) {
      throw new Error(`Storage bucket '${bucket}' not found`);
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { path: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { path: '', error: error as Error };
  }
}

export async function deleteFile(
  bucket: BucketType,
  path: string
): Promise<{ error: Error | null }> {
  try {
    // Validate bucket exists
    const bucketExists = await validateBucket(bucket);
    if (!bucketExists) {
      throw new Error(`Storage bucket '${bucket}' not found`);
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error: error as Error };
  }
}

export function getPublicUrl(bucket: BucketType, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// Helper function to generate a unique file path
export function generateFilePath(bucket: BucketType, file: File): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
} 