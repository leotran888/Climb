-- Add completion_time_seconds to writing_submissions
ALTER TABLE writing_submissions
  ADD COLUMN IF NOT EXISTS completion_time_seconds INTEGER;
