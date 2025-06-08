-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('posts', 'posts', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('cover_photos', 'cover_photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Set up storage policies for posts bucket
CREATE POLICY "Posts Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'posts' );

CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own posts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete their own posts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts'
  AND auth.uid() = owner
);

-- Set up storage policies for avatars bucket
CREATE POLICY "Avatars Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

-- Set up storage policies for cover_photos bucket
CREATE POLICY "Cover Photos Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'cover_photos' );

CREATE POLICY "Authenticated users can upload cover photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cover_photos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own cover photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cover_photos'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete their own cover photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cover_photos'
  AND auth.uid() = owner
); 