-- SQL to create the 'avatars' storage bucket and set up RLS policies

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 3. Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar."
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() = owner
);

-- 4. Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar."
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Note: The users table is managed by Supabase Auth (auth.users). 
-- When storing phone numbers, we will save it in the auth.users `raw_user_meta_data` JSONB column. 
-- No additional tables need to be created for basic phone number storage!
