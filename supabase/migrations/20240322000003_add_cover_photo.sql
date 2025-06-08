-- Add cover_photo column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_photo text;

-- Update RLS policies to include cover_photo
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); 