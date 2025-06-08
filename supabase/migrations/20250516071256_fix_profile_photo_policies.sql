-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can update their own profile photos" ON profiles;

-- Create policy for updating profile photos
CREATE POLICY "Users can update their own profile photos"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 