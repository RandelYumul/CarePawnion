# Demo video

Screen recorded on the deployed site, in my own voice.

**Link:** [CarePawnion Presentation Demo Video](https://drive.google.com/drive/folders/11VuUrMfoeCFuDK-2zoIXShQQ1_Eb0qzC?usp=sharing)

## Structure

| Part | What it shows |
| --- | --- |
| Intro and problem | What CarePawnion is, and the problem at home. Four people, three pets, and different schedules, so pets get fed twice or skipped. |
| Access restriction | `carepawnion.pages.dev` in an incognito tab. Cloudflare Access asks for an email, and only emails on the list get a one-time login code. |
| Home | The Hungry and Bathroom lists, and tapping Fed on a pet. The button turns green and the Home card updates to just now. |
| Logs and Log care | Today's card for each pet, then Log care with Pee and Poop checked together. Each type is saved as its own log with its own note. |
| Log care, vet | A vet visit logged on its own, with the kind of visit, the next check up, and a note. |
| Pets, add a pet | Adding a pet with a name, type, and photo. It shows on Pets and Home right away. |
| Pet details | One pet's last fed, last out, the vet visit just logged with its next check up, the usual times chart, and its logs grouped by day. |
| AI segment | How Claude was used as a guide, one case where it was wrong (the log widths that broke at 320px), and `server/db/schema.sql` opened to explain the logs table I designed. |
| What's next | Putting the API behind the same gate, and using a database role with fewer permissions. |

## Before recording

- [x] The site is opened a few minutes early, so the Render API is awake
- [x] The **deployed** URL `carepawnion.pages.dev` is recorded, not `localhost`
- [x] Other tabs are closed, with no personal messages, other students' names,
      or `.env` file open in the editor
- [x] The pets have realistic logs from today and earlier days, and the new
      pet's name and photo are ready
- [x] One full practice run is done. If something breaks, the recording starts
      again instead of narrating the bug

## Fallback

1. **Demo mode build.** The GitHub Pages copy at
   https://randelyumul.github.io/CarePawnion/ runs in demo mode with sample data,
   in case the free API is asleep or down.
2. **Screenshots.** The high fidelity screenshots in [mockup.md](02-mockup.md), for
   every screen on desktop and phone.
