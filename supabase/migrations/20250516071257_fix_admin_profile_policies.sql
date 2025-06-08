-- Drop problematic admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Add fixed admin policies to avoid recursion
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (auth.uid() = id AND is_admin = true);

CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (auth.uid() = id AND is_admin = true); 