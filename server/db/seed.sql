-- Sample data for development. The same rows as seed.json in the client.
--
-- This starts with TRUNCATE. That is correct on your laptop and catastrophic
-- against the database your live demo depends on. Check which DATABASE_URL is
-- loaded before you run it.
--
-- Times are relative to now() and not fixed dates, so the status board shows
-- recent care every time the seed is run, instead of every pet looking overdue.

TRUNCATE TABLE logs, pets RESTART IDENTITY CASCADE;

INSERT INTO pets (name, species, breed, birthdate, created_at) VALUES
  ('Cobby', 'Dog', 'Schweenie', '2021-03-14', now() - interval '3 minutes'),
  ('Yuumi', 'Cat', 'Schweenie', '2023-11-02', now() - interval '2 minutes'),
  ('Milky', 'Dog', 'Schweenie', '2019-06-30', now() - interval '1 minute');

-- Feedings
INSERT INTO logs (pet, type, member, note, happened_at) VALUES
  ('Cobby', 'fed', 'Kuya', '1 cup dry kibble', now() - interval '50 minutes'),
  ('Yuumi', 'fed', 'Mama', 'half can wet food', now() - interval '35 minutes'),
  ('Milky', 'fed', 'Kuya',
   '2 cups kibble plus a spoon of rice, and a small piece of boiled chicken because he refused to eat otherwise. This note is deliberately long, because a seed row of four words hides every text-wrapping bug you have.',
   now() - interval '13 hours 20 minutes'),
  ('Cobby', 'fed', 'Ate', '', now() - interval '14 hours'),
  ('Yuumi', 'fed', 'Kuya', '1 cup dry kibble', now() - interval '2 days 55 minutes');

-- Walks and bathroom trips
INSERT INTO logs (pet, type, member, note, happened_at) VALUES
  ('Cobby', 'walk', 'Kuya', 'Around the block, about 20 minutes.', now() - interval '1 hour 30 minutes'),
  ('Cobby', 'poop', 'Kuya', '', now() - interval '1 hour 25 minutes'),
  ('Milky', 'pee', 'Papa', 'Backyard only, it was raining.', now() - interval '10 hours 45 minutes'),
  ('Milky', 'walk', 'Papa', 'Skipped the long route.', now() - interval '15 hours'),
  ('Cobby', 'pee', 'Ate', '', now() - interval '1 day 11 hours 50 minutes');

-- Vet visits. next_visit is a plain date, also relative to today.
INSERT INTO logs (pet, type, member, note, vet_kind, next_visit, happened_at) VALUES
  ('Cobby', 'vet', 'Kuya', '5 in 1 vaccine, second dose. No reaction after.',
   'vaccine', current_date + 14, now() - interval '14 days 5 hours 30 minutes'),
  ('Yuumi', 'vet', 'Mama', 'Routine check up. Weight is normal, ears cleaned.',
   'checkup', current_date + 76, now() - interval '15 days 5 hours'),
  ('Milky', 'vet', 'Papa', 'Skin allergy on the belly. Given a week of medicine.',
   'treatment', current_date + 2, now() - interval '5 days 6 hours 15 minutes'),
  ('Cobby', 'vet', 'Kuya', 'Anti rabies, yearly.',
   'vaccine', NULL, now() - interval '49 days 6 hours');