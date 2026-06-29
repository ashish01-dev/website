-- 1. progress
CREATE TABLE progress (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  chapter_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  completed_on TEXT,
  topic_status JSONB DEFAULT '{}',
  custom_topics JSONB DEFAULT '{}',
  PRIMARY KEY (user_id, chapter_id)
);
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_progress" ON progress
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. timetable
CREATE TABLE timetable (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, id)
);
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_timetable" ON timetable
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. tests
CREATE TABLE tests (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id TEXT NOT NULL,
  date TEXT NOT NULL,
  subject TEXT NOT NULL,
  subjects JSONB DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 0,
  notes TEXT,
  PRIMARY KEY (user_id, id)
);
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_tests" ON tests
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. errors
CREATE TABLE errors (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id TEXT NOT NULL,
  date TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  question TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (user_id, id)
);
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_errors" ON errors
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. formulas
CREATE TABLE formulas (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  files JSONB DEFAULT '[]',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, id)
);
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_formulas" ON formulas
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. dailylogs
CREATE TABLE dailylogs (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date TEXT NOT NULL,
  study_minutes INTEGER NOT NULL DEFAULT 0,
  chapters_completed JSONB DEFAULT '[]',
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  pomodoro_sessions INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
ALTER TABLE dailylogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_dailylogs" ON dailylogs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. settings
CREATE TABLE settings (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, id)
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_settings" ON settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. pomodoro
CREATE TABLE pomodoro (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id TEXT NOT NULL,
  date TEXT NOT NULL,
  "start" BIGINT NOT NULL,
  "end" BIGINT NOT NULL,
  duration INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, id)
);
ALTER TABLE pomodoro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_pomodoro" ON pomodoro
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. dailyplans
CREATE TABLE dailyplans (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date TEXT NOT NULL,
  chapters JSONB DEFAULT '[]',
  PRIMARY KEY (user_id, date)
);
ALTER TABLE dailyplans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_dailyplans" ON dailyplans
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. questions
CREATE TABLE questions (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  id TEXT NOT NULL,
  date TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, id)
);
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_questions" ON questions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
