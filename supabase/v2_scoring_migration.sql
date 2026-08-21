-- Add priority_improvements column to writing_results
ALTER TABLE writing_results
  ADD COLUMN IF NOT EXISTS priority_improvements JSONB DEFAULT '[]';

-- Index for faster lookups on submission_id (if not already exists)
CREATE INDEX IF NOT EXISTS idx_writing_results_submission_id
  ON writing_results(submission_id);
