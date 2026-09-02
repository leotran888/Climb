CREATE TABLE IF NOT EXISTS writing_vocab_progress (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id    TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('learning', 'learned')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE writing_vocab_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "writing_vocab_progress_policy"
  ON writing_vocab_progress FOR ALL
  USING (auth.uid() = user_id);
