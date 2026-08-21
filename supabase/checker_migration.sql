-- Migration: Chuyen Writing module sang AI Writing Checker
-- Chay trong Supabase SQL Editor

-- 1. writing_submissions: bo NOT NULL tren prompt_id, them question + task_type
ALTER TABLE writing_submissions ALTER COLUMN prompt_id DROP NOT NULL;
ALTER TABLE writing_submissions ADD COLUMN IF NOT EXISTS question TEXT;
ALTER TABLE writing_submissions ADD COLUMN IF NOT EXISTS task_type TEXT;

-- 2. writing_results: them cac truong rich data
ALTER TABLE writing_results ADD COLUMN IF NOT EXISTS corrections JSONB DEFAULT '[]';
ALTER TABLE writing_results ADD COLUMN IF NOT EXISTS vocabulary_improvements JSONB DEFAULT '[]';
ALTER TABLE writing_results ADD COLUMN IF NOT EXISTS sentence_improvements JSONB DEFAULT '[]';
ALTER TABLE writing_results ADD COLUMN IF NOT EXISTS criteria_detail JSONB;

-- Done. No data is lost. Old submissions still work.
