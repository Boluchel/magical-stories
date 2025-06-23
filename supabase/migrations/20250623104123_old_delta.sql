/*
  # Fix users table and RLS policies

  1. Create users table if it doesn't exist
    - `id` (uuid, primary key, references auth.users)
    - `email` (text)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

  2. Update foreign key constraints to reference auth.users directly
  3. Fix RLS policies to use auth.uid() correctly
*/

-- Create users table if it doesn't exist (referencing auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update stories table foreign key to reference auth.users directly
DO $$
BEGIN
  -- Drop existing foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'stories_user_id_fkey' 
    AND table_name = 'stories'
  ) THEN
    ALTER TABLE stories DROP CONSTRAINT stories_user_id_fkey;
  END IF;
  
  -- Add new foreign key constraint
  ALTER TABLE stories ADD CONSTRAINT stories_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Update saved_stories table foreign key to reference auth.users directly
DO $$
BEGIN
  -- Drop existing foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'saved_stories_user_id_fkey' 
    AND table_name = 'saved_stories'
  ) THEN
    ALTER TABLE saved_stories DROP CONSTRAINT saved_stories_user_id_fkey;
  END IF;
  
  -- Add new foreign key constraint
  ALTER TABLE saved_stories ADD CONSTRAINT saved_stories_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;