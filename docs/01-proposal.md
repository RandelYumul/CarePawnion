# Proposal

## App name

CarePawnion

## What the app is for, in one sentence

CarePawnion lets a household see when each pet was last fed and last taken
outside, and who did it, so the same dog does not get fed twice in one morning
and nobody assumes someone else already walked him.

## Who is it for

The app is made for four people in one household who share three pets.

- **Me.** I usually feed the pets in the morning before class, but I sometimes
  forget if I already fed them.
- **Mama.** She usually feeds the dog and is often at home around midday.
- **My Ate.** She usually handles the evening walk and the late bathroom trip.
- **Papa.** He takes care of the pets when someone else is not available.

We do not always follow the same schedule. We share the same house and the same
pets, so we need a simple way to know who already took care of them.

When someone opens the app, they usually want to do one of two things.

- **Check before taking care of a pet.** They want to quickly see if the pet has
  already been fed or taken outside.
- **Record what they just did.** They want to log the activity right away so the
  next person knows it was already done.

## Sections or routes this app needs

The app has four routes. There is also a shared layout with the app name, the
navigation links, a footer, and a notice that only shows in demo mode.

| # | Route | What it is for |
| - | --- | --- |
| 1 | Home `/` | Shows each pet and when it was last fed or taken outside, and who did it. A status card lists the pets that are hungry or need to go out. |
| 2 | Pets `/pets` | Shows all pets, and lets users add or remove a pet. Users need pets in the system before they can record their care. |
| 3 | Pet details `/pets/:id` | Shows one pet with its photo, breed, birthday, last fed, last out, its vet check ups, its usual times, and its own logs. Users can edit the pet here. |
| 4 | Logs `/logs` | Shows all logs grouped by day, newest first. Users can log care, view one log, edit it, or delete it, all on this page. A status board on top shows today's counts per pet. |

Pet details links back to Pets, and Home and Logs link to Pets when there are no
pets yet. The old `/logs/new` link sends the user to Logs. Any other address goes
to Home.

| Screen | API functions it uses |
| --- | --- |
| Home | `listPets`, `listLogs`, `createLog` (the one tap Fed and Bathroom buttons) |
| Pets | `listPets`, `createPet`, `deletePet` |
| Pet details | `updatePet`, and the pets and logs already loaded |
| Logs | `listLogs`, `getLog`, `createLog`, `updateLog`, `deleteLog` |

## State: what data does the app hold?

`App` owns the data and talks to the API. The pages only own what is on their
screen, like a form or an open panel, and hand the work back to `App`. The pets
and logs are loaded once and kept in `App`, so moving between screens does not
load them again. After every add, edit, or delete, `App` updates its own copy so
every screen shows the change right away.

The most important screen is Home.

| Data | Shape (rough) | Who owns it | Changes when... |
| --- | --- | --- | --- |
| pets | `[{ id, name, species, breed, birthdate, photo }]` | `App` | the app loads, or a pet is added, edited, or removed |
| rows (logs) | `[{ id, pet, type, member, note, vet_kind, next_visit, happened_at }]` | `App` | the app loads, or a log is added, edited, or deleted |
| summary | each pet with its `lastFed`, `lastOut`, and `nextVisit` | worked out in `App` from pets and rows | pets or rows change |
| status | `'loading'`, `'ready'`, or `'error'` | `App` | loading starts, finishes, or fails |
| error | the error message | `App` | something fails while loading or saving |
| limits | `{ fed, out }` in hours | `App`, saved on this device | the user sets new limits on Logs |
| form | `{ pet, types, member, notes, vetKind, nextVisit }` | `Logs` | the user types, or opens a log to edit |
| detail | one log | `Logs` | the user clicks View on a log |

The Home screen does not store a separate status for each pet. It uses the pets
and logs to work out the latest activity. For example, if Cobby has several
feeding logs, Home shows the newest one.

Every screen that loads information shows four different situations.

- **Loading.** The app is still getting the information. If it takes long, the
  message says the server may be waking up.
- **No data.** There is nothing to show yet, with a link to add a pet.
- **Data available.** The information was loaded.
- **Error.** Something went wrong, with a Try again button.

## What each screen contains

- Screen, **Home**
  - Block 1, Header. The CarePawnion name, a short explanation, and the hero
    image of a dog and a cat.
  - Block 2, Home card. The time of the last activity, a Hungry list and a
    Bathroom list with how many pets are due, the latest log, and a View logs
    link.
  - Block 3, Pet cards. One card per pet with its photo, type, breed, and how
    long ago it was fed and taken out. The Fed and Bathroom buttons log the
    activity in one tap. They are red when the pet is due and green when it was
    done recently. A View Details button opens Pet details.
  - Block 4, Messages. Loading, empty with a link to add a pet, and error with
    a Try again button.
- Screen, **Pets**
  - Block 1. An Add a pet button that opens the form.
  - Block 2. The pet form with name, birthday, breed, type of pet, and an
    optional photo.
  - Block 3. A list of all pets with when each was last fed and last taken out,
    a View Details link, and a Remove button. The confirmation says the pet's
    logs stay in the list.
- Screen, **Pet details**
  - Block 1. A Back to pets link.
  - Block 2. The profile with the photo, name, breed and birthday chips, and
    the last fed, last out, and total logs. An Edit details button opens the
    same pet form, filled in.
  - Block 3. The vet check ups and the next visit.
  - Block 4. The usual times for feeding and bathroom trips, from past logs.
  - Block 5. The logs for this pet, grouped by day.
- Screen, **Logs**
  - Block 1. Log care and Set limits buttons.
  - Block 2. The status board with today's count and a card per pet.
  - Block 3. The log form. The five activity types are checkboxes. When adding,
    more than one can be checked, like pee and poop, and each becomes its own log
    with its own note. Vet is logged on its own, with the kind of visit and the
    next check up.
  - Block 4. The history grouped by day, with View, Edit, and Delete on each
    log. View opens the full log in a panel.

## Content you need to gather

**Sample data.** Written by me, so the app has realistic data while testing.

- Three sample pets, Cobby, Yuumi, and Milky
- Fourteen care logs, including vet visits
- One very long note to test long text
- Logs with no note to test how the app looks without one
- Household roles (Kuya, Ate, Mama, Papa) as members, not real names

**Activity types.** Fed, Walk, Pee, Poop, and Vet. Each has its own short label
so users can tell them apart.

**Confirmation messages.** Before removing a pet, the message explains that its
logs stay in the list. Before deleting a log, the app asks to confirm.

**Images.** Each pet can have its own photo, uploaded through the form and
shrunk to 400 pixels. The hero image is from Pngtree under its free license,
credited to DegenerSumon in the footer.

**Online services.** An online API and an online database, so the household
shares the same data instead of only sample data.

## One risk

The part I was least sure about was how the routes would behave after the app is
published on GitHub Pages.

GitHub Pages only serves files that already exist. On my computer React Router
handles the address in the browser, so opening a nested page works. After
deployment, refreshing that same page or opening a shared link makes the browser
ask GitHub Pages for a file at that address. That file does not exist, so it
returns a 404 instead of loading the app.

There were two things I had not done before. Setting the Vite base option to the
repository name so the built files load from the right path, and choosing a
router setup that still works when someone opens a deep link directly.

---

## Where each piece is hosted

| Piece | Host | Free tier's catch |
| --- | --- | --- |
| Client | Cloudflare Pages, behind Cloudflare Access | Access is free for up to 50 users |
| API | Render, free Web Service | It sleeps when idle, so the first request can take up to a minute |
| Database | Neon, free plan | No IP allow list, so the endpoint is public but needs the password and SSL |

**Host change, October 1, 2026.** The client moved from GitHub Pages to
Cloudflare Pages. We were advised to add a layer so only chosen people can open
the app. GitHub Pages cannot be private on a free account, and Cloudflare Access
needs the site on Cloudflare. GitHub Pages still publishes a demo mode copy from
the template workflow.

## Demo mode

Demo mode went off on **October 1, 2026**. The live site runs with
`VITE_USE_MOCK_API=false`, so it uses the real API on Render and the database on
Neon. Demo mode stays in the code as a fallback.

## What changed since the submitted proposal

The submitted proposal is dated September 20, 2026.

| Change | Why |
| --- | --- |
| New Log and Edit Log are a form on the Logs page instead of their own route | The form opens right above the history, so users do not leave the page to log or fix an entry |
| Log Detail is a panel on the Logs page instead of its own route | It shows one log loaded on its own with `getLog`, without leaving the list |
| Added a Pet details route `/pets/:id` | To see one pet's full history, vet visits, and usual times in one place |
| Added Vet as a fifth activity type, with the kind of visit and the next check up | Vaccines and check ups are part of pet care, and the next visit is easy to forget |
| Added pet editing, a birthday, and a photo | Pets change, and a wrong breed or name had to be fixed without removing the pet |
| Added Set limits for hours between meals and bathroom trips | Every household has a different schedule, so the red and green buttons use their own limits |
| Each checked type gets its own note | One shared note was copied to every log, like a food note showing under Poop |
| The floating bar on Home became a card with Hungry and Bathroom lists | Seeing which pets are due answers the main question faster than shortcut buttons |
| `App` loads the data once instead of each screen loading it again | Screens share the same pets and logs, and every change shows right away |
| The sample pets are Cobby, Yuumi, and Milky instead of Marble and Mochi | Real pets are added through the app |

## Stretch goals

These were in the plan but are not in the app yet.

- A logo and a favicon for the deployed version
- Putting the API behind the same Cloudflare Access gate as the client
- Connecting to Neon with a role that can only read and write `pets` and `logs`

## Risks now

- **GitHub Pages deep links, solved.** Fixed with
  `basename={import.meta.env.BASE_URL}` on the router and a copy of `index.html`
  as `404.html`. Since the move to Cloudflare Pages, deep links work there too.
- **The API sleeping, grew.** Render's free tier sleeps, so the first load can
  be slow. The loading message now says the server may be waking up.
- **The API outside the gate, new.** Access only covers the client. CORS stops
  other websites in a browser, but a direct request to Render can still change
  data. It is listed as a stretch goal.
- **CORS on deploy, turned out small.** The first live load failed because Render
  had not picked up `CORS_ORIGINS`. It was fixed by checking the Render logs and
  redeploying with the exact Cloudflare link.
