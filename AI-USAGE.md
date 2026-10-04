# AI usage

This project was built with AI assistance. This file is the record of it.

The assistant was Claude by Anthropic, used through the claude.ai chat inside a
Project that held my proposal, wireframes, rubrics, and source files. I used it
as a guide, one step at a time. I decided what to build, asked for one change at
a time, tested each change locally before committing it, and sent back
screenshots when something looked wrong. Most of the code it gave I modified, to
match the project requirements and the lessons in the course content. For the
CSS I changed many of the rules myself to get the design I wanted.

## 1. How I used AI

### 2026-09-28 - Connecting the Express API to Neon

* Tool: Claude (claude.ai)
* What I asked for: I do not have PostgreSQL installed locally, so I asked how to use a hosted Neon database with the Express API from the template.
* What it gave back: Steps to create the Neon project, put the connection string in `server/.env`, run the schema and seed with `npm run db:reset`, and check the connection with `/readyz`.
* What I kept, what I changed, and why: I used it as a guide only and made the changes myself. Neon let me run the real database without installing PostgreSQL.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/fb22e17

### 2026-09-28 - Editing a pet with a shared form

* Tool: Claude (claude.ai)
* What I asked for: How to add pet editing without keeping two copies of the pet form.
* What it gave back: A shared `PetForm` component used by both the Pets page and the Pet details page, an `updatePet` function in the API layer, and two options for the logs, since logs keep the pet name. One was to rename the pet's logs on edit, the other was to switch logs to `pet_id`.
* What I kept, what I changed, and why: I kept the shared form so the add and edit forms stay the same. I chose to rename the logs, since switching to `pet_id` would change the schema late in the project. I adjusted the code to follow my proposal and the course lessons.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/6ec826e

### 2026-10-01 - Fixing the client routes for a subfolder host

* Tool: Claude (claude.ai)
* What I asked for: If I should deploy the client to GitHub Pages and what I needed to check first.
* What it gave back: It found that `BrowserRouter` had no `basename`, so the routes would not match under `/CarePawnion/`, and gave an updated `main.jsx` with `basename={import.meta.env.BASE_URL}`.
* What I kept, what I changed, and why: I kept the one line fix. It reads the base from the Vite config, so local dev stays on `/`.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/da88eb4

### 2026-10-01 - Making the brand in the navigation go to Home

* Tool: Claude (claude.ai)
* What I asked for: To make the CarePawnion name in the navigation clickable and go to the Home page.
* What it gave back: An updated `Navigation.jsx` where the brand is a `Link` to `/` that also closes the mobile menu, and `text-decoration: none` on `.brand`.
* What I kept, what I changed, and why: I kept the `Link` and the menu closing, since the brand going Home is what users expect. I adjusted the navigation styles myself in the second commit.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/13ae49c and https://github.com/RandelYumul/CarePawnion/commit/4c484a3

### 2026-10-01 - Mobile layout of the Pet details page and the Home card

* Tool: Claude (claude.ai)
* What I asked for: I sent phone screenshots of the Pet details page and the Home card and asked to make them presentable.
* What it gave back: Phone media queries. For Pet details, a centered column with the Edit button moved to the bottom. For the Home card, a compact layout with the Hungry and Bathroom lists side by side.
* What I kept, what I changed, and why: I adjusted some of the Home card rules myself before asking. I used its layouts as a base and changed many of the rules to get the design I wanted. I chose to put the birthday beside the breed with the same chip design.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/a7438b6

### 2026-10-01 - Deploying to Render and Cloudflare Pages

* Tool: Claude (claude.ai)
* What I asked for: Step by step guidance to deploy the API on Render and the client on Cloudflare Pages, connected to the Neon database.
* What it gave back: The settings for each host, the environment variables to set, and how to check `/readyz` on the live API.
* What I kept, what I changed, and why: I did each step myself in the dashboards. I changed the Render runtime from the detected Docker to Node, used the Pages setup instead of the Workers setup, and fixed a CORS error by checking the Render logs and setting `CORS_ORIGINS` to the exact Cloudflare link. The settings are written in the README.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/399436c

### 2026-10-01 - Updating the README after deployment

* Tool: Claude (claude.ai)
* What I asked for: To update the README based on the deployment we finished.
* What it gave back: A README with the live links, the deploy settings for Neon, Render, and Cloudflare Pages, an architecture section, and corrected curl examples.
* What I kept, what I changed, and why: I kept the deploy sections and checked the feature list against my code. I kept my name in the Author section by choice.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/399436c

### 2026-10-02 - Giving each logged type its own note

* Tool: Claude (claude.ai)
* What I asked for: To check if logging several types at once still copies one note to every log.
* What it gave back: It found that the form had one note box and the loop sent the same note with each type. It gave a fix with one note box per checked type, kept in a `notes` object by type.
* What I kept, what I changed, and why: I first thought the bug did not happen, since my test used one type. After checking again with two types, I kept the fix. With one type the form looks the same as before.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/adc4b44

### 2026-10-02 - Adding Cloudflare Access and the security checklist

* Tool: Claude (claude.ai)
* What I asked for: We were advised to add a layer so only chosen people can open the app, so I asked how to do it, then asked for help filling in the security checklist.
* What it gave back: Two options, Cloudflare Access or a login inside the app, and the steps for Access. For the checklist, it checked each row against my code and gave commands to confirm the rest.
* What I kept, what I changed, and why: I chose Cloudflare Access, since a login would add a sixth screen and new libraries. I ran the checks myself in PowerShell, turned on secret scanning, and tested the gate with an allowed and a blocked email. I kept three honest No answers, like the API being outside the gate.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/d2bf2f6

## 2. Where the AI got it wrong

### Case 1 - Mobile CSS that never applied

* What it gave me: A phone media query for the Pet details page that stretched the info area and moved the Edit button below the details.
* What was wrong with it: `styles.css` had the Pet details rules twice, an older block and a newer one further down. The AI did not account for that, and the query went into the older block. The later rules overrode it, so the button stayed beside the name and squeezed it into one letter per line.
* What I did instead: I kept one Pet details block (the newer design) and placed the phone query last in it, so nothing after it overrides it. This also removed the copied code.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/a7438b6

### Case 2 - Desktop alignment that broke small phones

* What it gave me: To line up the logs on desktop, it gave fixed minimum widths to the type tag (`4.5rem`), the pet name (`6rem`), and the member (`7rem`) in `.log-row`.
* What was wrong with it: The widths also applied on phones. At 320px the first line of each log no longer fit, so "by Randel" dropped to a line of its own and the rows looked broken.
* What I did instead: I tested the Logs page at 320px and sent a screenshot. I kept the widths for desktop, but reset them in the phone query (tag `3.5rem`, pet and member `0`), and added a query for 360px and below with smaller text, natural tag widths, and tighter button gaps.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/6c1e9ea

### Case 3 - Mobile fix that kept the Edit button in a weird spot

* What it gave me: For the Pet details page on a phone, it first gave a fix that only stretched the info area to full width with `align-items: stretch`, and lined up the Edit details button with the name.
* What was wrong with it: The stat boxes became full width, but the name and the Edit details button still shared one row. On a small phone the button sat beside the name and the details were not centered, so the page still looked weird.
* What I did instead: I asked for the details to be centered and the button moved somewhere that makes sense. The final query centers the info column and uses `display: contents` with `order: 1`, so the button goes to the bottom of the card as a full width button. I also moved the birthday beside the breed with the same chip design.
* Commit: https://github.com/RandelYumul/CarePawnion/commit/a7438b6

## 3. Who wrote what

### Written by me

My own part covers both the backend and the frontend. On the Node, Express and
Postgres side, I designed the `logs` table and wrote its queries. On the client,
I made the design and the responsive layout.

#### The logs data and the database queries

* File: `server/db/schema.sql` (the `logs` table), `server/logsRepo.js`
* Commit: https://github.com/RandelYumul/CarePawnion/commit/fb22e17
* What it does and why it is built this way: I designed the logs, like what the backend and the frontend exchange, and also the queries for the database. Each log has the pet, the type (fed, walk, pee, poop, or vet), the member who did it, a note, and the time it happened. A vet log also has the vet kind and the next visit. The frontend sends these fields and the backend sends the same fields back, so both sides use one shape. In the table I added checks so only the five types are saved, and a vet log must have a vet kind while other logs cannot. I kept the same rule in the server validation too, in case a row skips the API. For the queries I wrote get all, get by id, create, update, and delete in `logsRepo.js`. They use named columns instead of `SELECT *`, and `$1` placeholders instead of putting the values in the text, so the input is safe from SQL injection. The logs are sorted by newest first, and I added an index on `happened_at` so that sort stays fast.

#### The design and responsive layout

* File: `client/src/styles.css`, and the layout of the components and pages (`Navigation.jsx`, `Footer.jsx`, `Petcard.jsx`, `HomeRectangle.jsx`, `Home.jsx`, `Pets.jsx`, `Logs.jsx`, `Petdetail.jsx`)
* Commit: https://github.com/RandelYumul/CarePawnion/commit/d0184bd, https://github.com/RandelYumul/CarePawnion/commit/e93347c, https://github.com/RandelYumul/CarePawnion/commit/3951a9d, https://github.com/RandelYumul/CarePawnion/commit/4faa57b, https://github.com/RandelYumul/CarePawnion/commit/430e3aa, https://github.com/RandelYumul/CarePawnion/commit/df35ccc, https://github.com/RandelYumul/CarePawnion/commit/a7438b6
* What it does and why it is built this way: I first drafted a mock up design in Figma. Then I created the files and each component so they can be reused all throughout the project. At first most of the components and the design were not responsive. It looked weird on mobile and when the screen was smaller than my desktop. So I adjusted the CSS and the JSX to fit mobile and make it responsive. I adjusted the box sizing and font sizes, and changed the layout of the JSX files to fix the order of the rows and columns. The CSS properties I adjusted most were padding, margin, border, grid, color, font size, align-items, justify-content, flex, display, and position. I also reduced the colors to only five, since it was part of the instructions. I put them in `:root` as variables (`--color-primary`, `--color-accent`, `--color-bg`, `--color-surface`, `--color-text`) so they are easy to call in every rule and the colors stay the same across the app. One example is the Home card. On a phone it was too big, since Hungry and Bathroom sat in columns with a divider on the right side. I changed the top grid to one column, moved the divider line from the right to the bottom, aligned the last activity to the left, and made the date and time smaller so the card fits the screen.

### The AI-written part I understand best

* File: `client/src/styles.css`, the phone media query of the Pet details page
* Commit: https://github.com/RandelYumul/CarePawnion/commit/a7438b6
* What it does and why we kept it: On a wide screen the photo sits on the left and the details on the right. On a phone the query turns the card into one column. `align-items: stretch` lets the details fill the full width instead of shrinking to their content. The name and the Edit button share one row in the markup, so the query uses `display: contents` on that row. This removes the row box on phones only, which lets the button take `order: 1` and move below everything else. We kept it because the JSX did not need to change, so the desktop layout stays the same.
