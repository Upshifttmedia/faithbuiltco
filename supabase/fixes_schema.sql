-- ============================================================
-- FaithBuilt — fixes_schema.sql
-- Run these statements in the Supabase SQL editor
-- ============================================================

-- 1. Add display_name + commitment_days + onboarding_done to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name     text,
  ADD COLUMN IF NOT EXISTS commitment_days  int DEFAULT 7,
  ADD COLUMN IF NOT EXISTS onboarding_done  boolean DEFAULT false;

-- 2. Update the handle_new_user trigger so the display_name from
--    auth metadata is stored in profiles on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'display_name'
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. pillar_notes table — one note per user per pillar per day
CREATE TABLE IF NOT EXISTS pillar_notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pillar     text NOT NULL,
  note_date  date NOT NULL,
  note       text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, note_date, pillar)
);

ALTER TABLE pillar_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own notes" ON pillar_notes;
CREATE POLICY "Users manage own notes"
  ON pillar_notes FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Make sure daily_completions has the pillar column
ALTER TABLE daily_completions
  ADD COLUMN IF NOT EXISTS pillar text;

-- 5. Grace day columns on streaks table
ALTER TABLE streaks
  ADD COLUMN IF NOT EXISTS grace_active     boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS grace_days_used  int     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grace_week_start date;

-- 6. Identity statement on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS identity_statement text;

-- 7. Morning commitments — one row per user per day
CREATE TABLE IF NOT EXISTS morning_commitments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  commit_date     date NOT NULL,
  faith_text      text NOT NULL DEFAULT '',
  body_text       text NOT NULL DEFAULT '',
  mind_text       text NOT NULL DEFAULT '',
  stewardship_text text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, commit_date)
);

ALTER TABLE morning_commitments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own commitments" ON morning_commitments;
CREATE POLICY "Users manage own commitments"
  ON morning_commitments FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Evening reflections — one row per user per day
CREATE TABLE IF NOT EXISTS evening_reflections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reflect_date date NOT NULL,
  journal_text text NOT NULL DEFAULT '',
  showed_up    text,   -- 'yes' | 'mostly' | 'tomorrow'
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reflect_date)
);

ALTER TABLE evening_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own reflections" ON evening_reflections;
CREATE POLICY "Users manage own reflections"
  ON evening_reflections FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
