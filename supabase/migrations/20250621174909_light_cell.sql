/*
  # Create saved_stories table for user favorites

  1. New Tables
    - `saved_stories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `story_id` (uuid, foreign key to stories)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_stories` table
    - Add policies for authenticated users to manage their own saved stories

  3. Constraints
    - Unique constraint on user_id + story_id to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS saved_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id)
);

ALTER TABLE saved_stories ENABLE ROW LEVEL SECURITY;

-- Users can read their own saved stories
CREATE POLICY "Users can read own saved stories"
  ON saved_stories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own saved stories
CREATE POLICY "Users can insert own saved stories"
  ON saved_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved stories
CREATE POLICY "Users can delete own saved stories"
  ON saved_stories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS saved_stories_user_id_idx ON saved_stories(user_id);
CREATE INDEX IF NOT EXISTS saved_stories_story_id_idx ON saved_stories(story_id);
CREATE INDEX IF NOT EXISTS saved_stories_created_at_idx ON saved_stories(created_at DESC);