-- The complete shape of the database. Safe to run against an empty database,
-- and safe to run twice.
--
-- This file is committed on purpose. Your schema is a fact about your
-- application, not a runtime concern: it should be readable by opening a file
-- rather than by connecting to a server. It is also what lets you move to a
-- hosted database in one command.
--
-- gen_random_uuid() is built in from PostgreSQL 13, so no extension is needed.

CREATE TABLE IF NOT EXISTS pets (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  species    TEXT        NOT NULL CHECK (char_length(species) BETWEEN 1 AND 40),
  breed      TEXT        NOT NULL DEFAULT '',
  birthdate  DATE,
  photo      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feedings, outings and vet visits are all one table. They only differ by
-- type, the same as in the brief.
--
-- pet is the NAME and not a foreign key, on purpose. Removing a pet does not
-- erase their history.
CREATE TABLE IF NOT EXISTS logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pet         TEXT        NOT NULL CHECK (char_length(pet) BETWEEN 1 AND 60),
  type        TEXT        NOT NULL CHECK (type IN ('fed', 'walk', 'pee', 'poop', 'vet')),
  member      TEXT        NOT NULL CHECK (char_length(member) BETWEEN 1 AND 60),
  note        TEXT        NOT NULL DEFAULT '',
  vet_kind    TEXT        CHECK (vet_kind IN ('vaccine', 'checkup', 'treatment')),
  next_visit  DATE,
  happened_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A vet log must have a kind, and no other log may have one. Same rule as
  -- validateLog in server.js, kept here too in case a row skips the API.
  CHECK ((type = 'vet') = (vet_kind IS NOT NULL)),
  CHECK (type = 'vet' OR next_visit IS NULL)
);

-- The list page always sorts newest first. Without this the database reads
-- every row and sorts it on each request.
CREATE INDEX IF NOT EXISTS logs_happened_at_idx
  ON logs (happened_at DESC);