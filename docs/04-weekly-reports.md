# Weekly reports

Five minutes a week. Add a new section at the top; never edit an old one.

The value is entirely in writing them **while it is happening**. What took four
hours and why is invisible a month later, and it is exactly what your journal
needs.

---

## Week of 2026-10-04

**Done.**

* The client is live on Cloudflare Pages at carepawnion.pages.dev and runs on the real Express API (Render) and PostgreSQL database (Neon), not the demo backend. `/readyz` returns `{"ok":true,"db":"up"}`.
* Pushing to `main` rebuilds the client on Cloudflare and redeploys the API on Render.
* Fixed the blank page on GitHub Pages by adding `basename={import.meta.env.BASE_URL}` to `BrowserRouter` in `main.jsx`.
* The brand in Navigation is now a link to Home that also closes the mobile menu.
* Save on the edit pet form is disabled when nothing changed.
* Pet Details now uses one newer design block. On phones the profile is centered, Edit details is a full width button at the bottom, and the birthday sits after the breed line as a chip.
* The Home floating bar has a compact phone layout, with the clock on two short lines and Hungry and Bathroom side by side.
* Updated the README for the Cloudflare, Render, and Neon setup, the real feature list, and the architecture.

**Stuck.**

* The live site showed a CORS error because Render had not picked up `CORS_ORIGINS`. Fixed by checking the `CORS allows` line in the Render logs and redeploying with the exact origin `https://carepawnion.pages.dev`.
* Cloudflare Access is paused. Preview access only protects `*.carepawnion.pages.dev`, so the main `carepawnion.pages.dev` link is still open. It needs to be added as a second hostname in the same Access application.
* The Render free plan sleeps when idle, so the first request after a while is slow.

**Hours.** About __ hours.

**Next.**

* Finish Cloudflare Access on the main link with One-time PIN login for allowed emails, then turn off GitHub Pages so there is only one live link.
* Since the Render API stays public and CORS only limits browsers, add a simple check on the API side in the future so only the client can write data.
* Changes to `schema.sql` are not applied on their own, so keep a short list of the SQL run against Neon each time the schema changes.
* For the cold start on Render, show a loading message on the first request so users know the app is waking up, or move to a paid plan if the app is used daily.
* Add a real screenshot and the demo video link to the README, and fill in `SECURITY-CHECKLIST.md` for the Week 2 documentation.

---

## Week of 2026-09-27

**Done.**

* Built the Pet Details screen at `/pets/:id` with the pet's profile, a check up box, a routine box, and all of that pet's logs grouped by day. View Details on Home and on the Pets page now opens this screen.
* Added a routine view on Pet Details that shows the usual time a pet eats or goes out, based on the busiest three hour window, with 24 hour bars.
* Added Vet as a log type with the kind of visit (vaccine, check up, or treatment) and an optional next visit date. The vet fields only show when Vet is picked, and Vet cannot be checked together with other types.
* Showed the next vet visit as "In 12 days" or "3 days late", red once the date has passed.
* Reworked the Logs page with a status board of today's counts on top, the form behind a button, and the list grouped by day.
* Added birthday, breed, and species to the add pet form, and showed each pet's age.
* Moved shared helpers (dates, ages, visit labels, day labels) into `format.js` so Pets, Logs, and Pet Details use the same ones.
* Changed `seed.json` into separate pets, feedings, outings, and vet lists linked by `pet_id`, closer to the planned database tables. The demo backend turns them into one list of logs.
* Added a skip link, a main tag, and `role="alert"` on errors. The error message now has a Try Again button, and the empty Logs page links to the Pets page.

**Stuck.**

* After adding the vet fields, browsers that had opened the old build still had old logs saved without them. I changed the storage key to a new version so those browsers load the new seed.
* A vet visit counted as a bathroom trip, which turned the Bathroom button green for the wrong reason. I added a list of bathroom types (walk, pee, poop) and only those count now.
* The earliest allowed next visit date showed yesterday before 8am in the Philippines, because the date was read in UTC. I switched to the local date. Birthdays and visit dates are now split by hand for the same reason.
* The server files are still the class template (sightings). I have not started changing them to logs and pets yet.
* There is no `getPet` yet, so Pet Details finds the pet from the list App already has.
* Logs are still matched to pets by name, not by `pet_id`.

**Hours.** About __ hours.

**Next.**

* Change the Express API and schema from sightings to logs and pets, with a `pet_id` foreign key on logs.
* Deploy the API and database, then switch off the demo backend.

---

## Week of 2026-09-21

**Done.**

* Wrote the app proposal with the five screens (Home, Pets, Logs, New Log, and Log Detail), the data each screen needs, and the API functions each one uses.
* Made the wireframes with the screen map, the desktop and mobile layouts, and the component tree.
* Set up the React and Vite client with React Router for the Home, Logs, and Pets routes, plus a redirect back to Home for any wrong URL.
* Built the shared layout with Navigation, Footer, and DemoNotice on every screen.
* Built the Home page with the masthead, the floating bar (last activity, shortcut buttons with today's count, and who did it), and one pet card per pet.
* Added one-tap Fed and Bathroom buttons on each pet card, red when the pet is due and green when it was done recently.
* Built the Logs page with the log form, the list of all logs, and View, Edit, and Delete for each row. More than one activity can be checked when adding, and each becomes its own log.
* Built the Pets page with the add pet form, an optional photo that is shrunk before saving, and a Remove button that keeps the pet's old logs.
* Added the demo backend (`mockApi.js`) that saves pets and logs in the browser using localStorage, with sample data from `seed.json`.
* Added `index.js` so the client picks between the demo backend and the real Express API using one environment variable.

**Stuck.**

* An older version of the demo backend saved the seed object in localStorage instead of a list of logs, which made the logs list crash. I fixed it by checking that the saved data is a list and resetting it if it is not.
* Phone photos are too big for localStorage, so I had to shrink each photo before saving it.
* I had less time this week because of other academic requirements and family matters, so I focused on the structure and the first demo version.
* New Log and Log Detail are not their own routes yet. For now `/logs/new` goes back to `/logs`, and View opens a panel on the Logs page.

**Hours.** About __ hours.

**Next.**

* Build the Pet Details screen from the wireframes and point View Details to it.
* Build the Express API and PostgreSQL database, then switch off the demo backend.
