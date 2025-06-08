-- Add banned column to profiles table
ALTER TABLE profiles ADD COLUMN banned BOOLEAN DEFAULT false; 