-- Add IELTS goal fields and exam date to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_writing  NUMERIC(3,1);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_speaking NUMERIC(3,1);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS exam_date       DATE;
