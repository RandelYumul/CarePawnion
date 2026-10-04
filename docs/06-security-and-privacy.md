# Security and privacy checklist

CarePawnion, checked on October 3, 2026. The repository is public, so this
checks that no secret and no personal data is in it, and that the app protects
the household's data.

## Before the first push

- [x] `.gitignore` includes `.env`, and `git check-ignore -v .env` confirms it
- [x] `git ls-files | grep -iE '\.env$|\.pem$|id_rsa'` prints nothing
- [x] `.env.example` is committed, with **placeholder** values only
- [x] No connection string, key or password anywhere in the repository,
      including in a screenshot
- [ ] No `student.json`, and no name, student number or email of yours or anyone
      else's
  - There is no `student.json`, student number or email. My full name, course and
    section stay in the README Author section by choice, and the screenshots show
    my first name as the member who logged.

No credential was ever committed. A search of `git log -p` only found
placeholders, so nothing needed to be rotated or removed from the history.

## The application

- [x] Every SQL query is parameterised. Values go in the array, never into the
      string. This is one line of defence you already know how to do
- [x] Input is validated **on the server**, not only in React. Length limits on
      every text field
- [x] `cors({ origin: allowedOrigins })` names your origins. Not `cors()` with no
      options, which allows every site on the internet
- [x] `NODE_ENV=production` on the host, and no stack trace in any response body
- [ ] `helmet` installed, which is one line for several real protections
  - Not installed yet. `server.js` does not use it.
- [x] Anything that costs money or accepts a password is rate limited
  - Nothing in the app costs money or accepts a password. The login is handled by
    Cloudflare Access with a one-time code.
- [x] Passwords, if you have accounts, are hashed with bcrypt and never logged
  - The app has no accounts or passwords.
- [x] Every route that touches somebody's data has the ownership check **in the
      query**, as `AND user_id = $2`, not as an `if` above it
  - There are no user accounts. One household shares the same pets and logs, and
    only emails on the Cloudflare Access policy can open the app.
- [ ] `npm audit` run once, and the easy fixes taken
  - Not run yet.

## Privacy

CarePawnion stores data about the household's pets and the people who take care
of them.

- [x] **No real classmates' names, numbers, emails or photos**, anywhere. Not in
      seed data, not in screenshots, not in the demo video. Consent for a course
      project does not cover the next ten years of a public repository
- [x] Seed data is invented. Yours will be read
  - The members are household roles (Kuya, Ate, Mama, Papa), not real names.
- [ ] If real people tested your app, even three friends, their data is deleted
      before you submit
  - To check. The live logs in Neon were made by me.
- [ ] If your app collects anything about anyone, the app says what it collects
  - The app stores pet details, pet photos, and the name typed as the member who
    did each log, but it does not say this anywhere yet.
- [x] Any face in a screenshot is stock, generated, or yours
  - The screenshots only show my own pets and the Pngtree hero image.

CarePawnion only keeps what the app needs. For each pet it stores the name,
type, breed, birthday, and photo. For each log it stores the type, the time, a
note, and the name typed as the member who did it. It stores no email, phone
number, or address. Cloudflare Access sees the email of each person who logs in,
but the app itself does not save it.

## Riskiest part

The riskiest part is that anyone with the link could read and change the
household's data. The client is now behind Cloudflare Access, so only listed
emails can open it, and the API only accepts the Cloudflare Pages origin through
CORS. The API on Render is still outside the gate, so a direct request can reach
it. This is accepted for now, since the data is about pets and holds no
passwords or contact details.
