-- Drop existing storage policies for avatars and cover photos
DROP POLICY IF EXISTS "Avatars Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Cover Photos Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own cover photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own cover photos" ON storage.objects;

-- Create new storage policies for avatars
CREATE POLICY "Avatars Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

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

-- Create new storage policies for cover photos
CREATE POLICY "Cover Photos Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'cover_photos');

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

-- Ensure the buckets exist with correct settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('cover_photos', 'cover_photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types; 