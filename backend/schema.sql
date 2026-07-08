-- Users (guest-first, no forced auth)
CREATE TABLE IF NOT EXISTS users (
  id                uuid PRIMARY KEY,
  display_name      text NOT NULL,
  auth_type         text CHECK (auth_type IN ('guest','email','oauth')) DEFAULT 'guest',
  email             text NULL,
  created_at        timestamptz DEFAULT now(),
  last_active_at    timestamptz,
  curiosity_factor  numeric DEFAULT 1.0,
  last_fact_shown_at timestamptz NULL,
  pending_fact_id   uuid NULL
);

-- Fact bank (core content database)
CREATE TABLE IF NOT EXISTS facts (
  id              uuid PRIMARY KEY,
  trigger_value    numeric NULL,
  trigger_type     text CHECK (trigger_type IN ('exact','range','unit_conversion','property')),
  range_min        numeric NULL,
  range_max        numeric NULL,
  category         text CHECK (category IN ('space','body','nature','history','pop_culture','math_property')),
  rarity           text CHECK (rarity IN ('common','uncommon','rare','legendary')),
  override_chance  numeric DEFAULT 0,
  format_family    text CHECK (format_family IN ('you_just_became','add_a_unit','has_a_name','rare_number','not_first')),
  copy_template    text NOT NULL,
  verified         boolean DEFAULT false,
  source_note      text NULL,
  active           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

-- Foreign key constraints for users table
ALTER TABLE users 
ADD CONSTRAINT fk_pending_fact 
FOREIGN KEY (pending_fact_id) REFERENCES facts(id) 
ON DELETE SET NULL;

-- Per-user unlocked facts ("Pokédex" collection)
CREATE TABLE IF NOT EXISTS user_facts (
  id            uuid PRIMARY KEY,
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  fact_id       uuid REFERENCES facts(id) ON DELETE CASCADE,
  unlocked_at   timestamptz DEFAULT now(),
  interaction   text CHECK (interaction IN ('engaged','dismissed','ignored')),
  calc_context  jsonb NULL,
  shared        boolean DEFAULT false
);

-- Usage metadata (fun stats)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id              uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_calculations   int DEFAULT 0,
  addition_count       int DEFAULT 0,
  subtraction_count    int DEFAULT 0,
  multiplication_count int DEFAULT 0,
  division_count       int DEFAULT 0,
  complex_calc_count   int DEFAULT 0,
  facts_unlocked_count int DEFAULT 0,
  last_calc_at         timestamptz
);

-- Wake-ping debug/tuning log
CREATE TABLE IF NOT EXISTS server_wake_events (
  id                 uuid PRIMARY KEY,
  user_id            uuid NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger_reason     text CHECK (trigger_reason IN ('complex_calc_typed','fact_cooldown_near_clear')),
  fired_at           timestamptz DEFAULT now(),
  resulted_in_request boolean
);
