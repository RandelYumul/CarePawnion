# Security checklist

CarePawnion, checked on October 2, 2026.

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.env` is listed in `.gitignore`, and `git ls-files` shows only the three `.env.example` files, in the root, `client/` and `server/`. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | The root, `client/` and `server/` `.env.example` files hold placeholders only, like `change-this-to-something-long-and-random` and the local `devpassword`, with no real database password. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | A search of the source found none. `pool.js` reads `DATABASE_URL` from the environment. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | Yes | The search only matched placeholders and docs, like the local `devpassword`, `user:pass@host.neon.tech`, and `${POSTGRES_PASSWORD}` in `compose.yml`. No real value was found. |
| 5 | Any credential that was ever committed has been rotated | N/A | No credential was ever committed, based on the search in row 4. |
| 6 | Production credentials live only in my hosting provider's environment settings | Yes | `DATABASE_URL` is set only in the Render dashboard and my local `.env`. Cloudflare Pages only holds the public `VITE_` values. |

## GitHub Actions

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | Yes | `deploy-pages.yml` is the only workflow. It only reads the repository name and the two public `VITE_` variables, with no value written in the file. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | The workflow uses no secrets. It only reads `VITE_USE_MOCK_API` and `VITE_API_BASE_URL` with `${{ vars.NAME }}`, since both end up in the public JavaScript anyway. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | Yes | The only `echo` lines print the ready flag and a notice or warning. I opened the log of the run for commit `22f9834`. It only shows the build output and two notices about the Node.js and Ubuntu versions, with no secret printed. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | Yes | The only artifact is `client/dist`, the Vite build output. `.env` is not committed, so the runner never has one, and the build holds only the public `VITE_` values. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | No | `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4` use version tags from the template, not commit SHAs. They are official GitHub actions, and the workflow only publishes the public demo copy. |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | Both are turned on under Settings > Advanced Security. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | Every query in `logsRepo.js` and `petsRepo.js` uses `$1` placeholders with the values in an array. The only text joined in is the fixed column list. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | No | The Neon free plan has no IP allow list, so the endpoint is public. It still needs the password and an SSL connection, and the password is only in Render and my local `.env`. |
| 15 | The database user the app connects as has only the permissions it needs | No | The app connects as the Neon owner role, which can also change the schema. A role with only read and write on `pets` and `logs` is a next step. |
| 16 | Seed and sample data is invented, not real people's data | Yes | `seed.sql` uses household roles (Kuya, Ate, Mama, Papa). `seed.json` now uses the same roles instead of my first name. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | `server.js` has no seed, reset or debug route. Seeding only runs from the `db:seed` and `db:reset` npm scripts. `/healthz` and `/readyz` only return ok or down. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | The client on Cloudflare Pages is behind Cloudflare Access, for both `carepawnion.pages.dev` and the preview links. Only listed emails get in, with a one-time PIN. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | N/A | The app uses its own Express API and PostgreSQL, not Supabase or Firebase. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | Yes | tjakoen.s@gmail.com is in the Include rule of the access policy. I tested the gate in an incognito window, an email on the list got a login code and an email not on the list did not. |
| 21 | The gate covers every route, including the ones that only change data | No | The gate covers every page of the client, but the API on Render is outside it. CORS only stops other websites in a browser, so a direct request to the API can still change data. |
| 22 | The credentials for the gate are environment variables, not in source | N/A | Cloudflare Access handles the login by email and one-time PIN, so the app has no gate credentials to store. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | `validateLog()` and `validatePet()` in `server.js` check required fields, lengths and allowed values and return 400 before any query runs. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | Notes, names and members are rendered as React text, which escapes it. No `dangerouslySetInnerHTML` is used anywhere in the client. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | The error handler in `server.js` logs the error on the server and only sends "Something went wrong on the server". `/readyz` only sends `db: down`. |
| 26 | CORS is not a wildcard on routes that change data | Yes | `server.js` uses `cors({ origin: allowedOrigins })` from `CORS_ORIGINS`, which is set to the Cloudflare Pages link only. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | Yes | A search of the source and commit messages found none. The README Author section only has my name, GitHub link, course and section, by choice. |
| 28 | No classmate's personal data in the repository | Yes | The only people in the data are household roles in the sample logs. No classmate is named. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | All packages (express, cors, pg, react, react-router-dom, vite) come from npm through `package-lock.json`, and `git ls-files` shows no `node_modules`. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | Yes | `heroImage.png` is from Pngtree under its free license, credited to the author DegenerSumon and linked to the source in the footer on every page. Playfair Display is a Google Font under the Open Font License. Pet photos are uploaded through the app and stored in the database, not the repository. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | The repository is public on purpose, so the code can be graded. I checked it in Settings after my last push. |

## Anything I found and fixed

The first check showed that `seed.json` still used my own first name as a household member, so I changed it to an invented household role. It also showed that the app had no access layer. I put the client behind Cloudflare Access, so only listed emails can open it. Two items are still open. The API on Render is outside the gate, so a direct request can still change data, and the app connects to Neon as the owner role. Both are written as next steps.
