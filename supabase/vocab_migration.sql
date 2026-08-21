CREATE TABLE IF NOT EXISTS vocab_folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT 'green',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vocab_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vocab_folders_policy" ON vocab_folders FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS vocab_words (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id  UUID REFERENCES vocab_folders(id) ON DELETE CASCADE,
  word       TEXT NOT NULL,
  definition TEXT,
  example    TEXT,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'known')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vocab_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vocab_words_policy" ON vocab_words FOR ALL USING (auth.uid() = user_id);
