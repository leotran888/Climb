-- Add upgraded essay fields to writing_results
ALTER TABLE writing_results ADD COLUMN IF NOT EXISTS upgraded_essay TEXT;
ALTER TABLE writing_results ADD COLUMN IF NOT EXISTS target_band NUMERIC(3,1);
