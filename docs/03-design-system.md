# Design System

CarePawnion uses a small, fixed set of tokens and reusable components, so every
screen looks like part of the same app. The tokens live once in `:root` in
`client/src/styles.css`, and every rule uses them by name.

## In code

The visual version of this document is `CarePawnion-design-system.pdf`, with the
swatches, type samples, spacing, component states, and screen states.

**Plain CSS with custom properties**, one `styles.css` file split into blocks per component and page
(Base, Navigation, Masthead, Home Rectangle, Pet card, Pets, Pet detail, Logs,
Footer). Tokens are `:root` custom properties.

## Colour tokens

Five colours, taken from the olive and cream of the design.

| Token | Hex | Role |
| --- | --- | --- |
| `--color-primary` | `#5f6448` | Buttons, links, tags, borders, the active nav link, the footer, and "done" (green) states |
| `--color-accent` | `#c0392b` | "Due" (red) states, the Hungry and Bathroom counts, Remove and Delete |
| `--color-bg` | `#F9F2EC` | Cards, the navigation bar, chips, and the inside of buttons |
| `--color-surface` | `#FFFCF8` | The page background |
| `--color-text` | `#232a2c` | Body text and headings |

**Contrast.** Every pair used for text passes 4.5 : 1.

| Text on background | Ratio |
| --- | --- |
| Text on surface (page) | 14.27 : 1 |
| Text on bg (cards) | 13.16 : 1 |
| Primary on surface | 6.03 : 1 |
| Primary on bg | 5.57 : 1 |
| Bg on primary (filled buttons, footer) | 5.57 : 1 |
| Accent on surface | 5.32 : 1 |
| Accent on bg, and bg on accent (red buttons) | 4.90 : 1 |

## Type scale

Two families. **Playfair Display** (falls back to Georgia, then serif) for the
brand, headings, and the Home clock. The **system font** (`system-ui`, Segoe UI)
for body text, so it loads instantly and reads well on any phone.

| Name | Size | Weight | Used for |
| --- | --- | --- | --- |
| Title | `clamp(1.8rem, 4vw, 2.5rem)` | Bold | Page titles like Pets, Logs, and the pet's name |
| Section | `clamp(1.3rem, 3vw, 1.75rem)` | Bold | Section titles like History, Check ups, and Usual times |
| Body | `1rem` (16px), line height `1.6` | Regular | Paragraphs, pet details, form fields |
| Small | `.75rem` to `.85rem` | Regular | Labels, tags, captions, timestamps, the footer |

Two one-offs sit outside the scale. The Home title uses
`clamp(1rem, 14cqw, 5rem)`, and the brand in the navigation uses
`clamp(1.25rem, 3.2vw, 1.85rem)`.

The headings use `clamp()`, so they shrink on phones and grow on desktop without
extra media queries.

## Spacing

One base unit of **4px** (`.25rem`), used in multiples everywhere.

| Token | Value | Used for |
| --- | --- | --- |
| `--space-1` | `.25rem` (4px) | Tight gaps, like a label and its value |
| `--space-2` | `.5rem` (8px) | Gaps between buttons, the logo and the name |
| `--space-3` | `.75rem` (12px) | Padding inside small cards and log rows |
| `--space-4` | `1rem` (16px) | Standard padding inside cards, gaps between cards |
| `--space-6` | `1.5rem` (24px) | Space between sections |
| `--space-8` | `2rem` (32px) | Large breaks, like above the footer |

- **Screen edge padding.** `--gutter`, `clamp(1rem, 5vw, 4rem)`, so 16px on a phone
  and up to 64px on desktop.
- **Content width.** `--max-width`, `80rem`, so lines never stretch across a wide
  screen.

## Shape and depth

- **Buttons.** `1px` border in primary, `.4rem` radius, at least `2.75rem` tall so
  they are easy to tap.
- **Pills.** `1rem` radius for tags, chips, and the Fed and Bathroom buttons.
- **Cards.** Rounded corners with a top or left border in primary to mark them,
  and a soft shadow on the Home card and pet cards.

## Reusable components

Every component below appears on more than one screen, or is used for more than
one job, and is built once.

| Component | Level | Appears on | Props it takes |
| --- | --- | --- | --- |
| `Navigation` | organism | Every screen | none, it reads the route by itself |
| `Footer` | organism | Every screen | none |
| `DemoNotice` | molecule | Every screen, only in demo mode | none |
| `PetCard` | molecule | Home | `pet`, `onLog`, `onView`, `busy`, `now`, `limits` |
| `HomeRectangle` | organism | Home | `rows`, `summary`, `limits`, `onOpen` |
| `PetForm` | organism | Pets (add), Pet details (edit) | `pet`, `submitLabel`, `onSubmit`, `onCancel` |
| Button | atom | Everywhere | Filled for the main action, `.ghost` for secondary actions, `.danger` for Remove and Delete |
| Tag | atom | Logs, Pet details, Home | One per type, Fed, Walk, Pee, Poop, Vet |
| Info pill | atom | Pet details | The breed line and the birthday |
| Card | molecule | Pets, Logs, Pet details | The base box for pet cards, stat cards, and forms |
| Day group | molecule | Logs, Pet details | One card per day, with a log row per entry |

## Component states

Every reusable control follows the same five states. The visual is in
`CarePawnion-design-system.pdf`, page 3.

| Component | Normal | Hover | Focus | Disabled | Loading |
| --- | --- | --- | --- | --- | --- |
| Filled button (Add log, Save, Add pet) | Primary fill, surface text | Darker primary | 2px primary outline, 2px gap | 60% opacity | "Saving..." on a disabled button |
| Ghost button (View, Edit, Back to pets, View Details) | Bg fill, primary border and text | Fills with primary, text turns bg | Same outline | 60% opacity | Not used |
| Danger button (Remove, Delete) | Ghost look with accent text | Stays bg, text stays accent | Same outline | 60% opacity | Not used |
| Fed and Bathroom buttons | Green (primary) when done, red (accent) when due | Slightly darker | Same outline | 60% opacity while a log is saving | Disabled until the log is saved |
| Field (input, select, textarea) | Surface fill, primary border | No change | Same outline | Not used | Not used |
| Nav link | Text colour | Primary colour with an underline | Same outline | Not used | Not used |

Focus comes from one global `:focus-visible` rule, so no control loses its
outline. In the footer the outline turns surface coloured, so it still shows on
the olive background.

## Screen states

Loading, empty, error, and data look the same on every page. The visual is in
`CarePawnion-design-system.pdf`, page 4.

| State | What it looks like | Example |
| --- | --- | --- |
| Loading | A short muted line. After a few seconds it explains that the server may be waking up. | "Loading. The server may be waking up, which can take up to a minute." |
| Empty | A muted line that says what is missing and how to fix it | "No pets yet. Add one before you can log anything." |
| Error | A red-bordered box with `role="alert"`, the message, and a Try again button | Shown at the top of the page when loading fails |
| Data | The real screen | Pet cards, logs, and the Home card |

## Responsive plan

The layout is built for desktop first, then adjusted at two breakpoints. Nothing
scrolls sideways at 375px or 320px.

- **Below 48rem (768px, tablets and phones).**
  - The navigation folds into a menu button, and the menu opens over the page
    instead of pushing it down.
  - Pet cards and stat cards stack into one column.
  - The Pet details profile centres, and Edit details becomes a full width
    button at the bottom.
  - On Logs, the open form moves above the stat cards, and View, Edit, and Delete
    become one even row.
- **Below 40rem (640px, phones).**
  - The Home card puts the clock on top and Hungry and Bathroom side by side.
  - Each log puts the time, tag, pet, and member on one line, with the note in its
    own box below.
- **Below 22.5rem (360px, small phones).** Smaller log text, natural tag widths,
  and tighter button gaps.

## Accessibility

- [x] Every text-on-background pair passes 4.5 : 1 contrast (see the table above)
- [x] Real semantic elements, like `<nav>`, `<main>`, `<section>`, `<button>`,
      `<time>`, and `<dl>` for label and value pairs
- [x] Every meaningful image has `alt` text, like the pet photos, and the logo
      uses `alt=""` since the name beside it already says CarePawnion
- [x] Every form input has a matching `<label>` with `htmlFor` and `id`
- [x] Every link and button can be reached with the Tab key, with a visible
      `:focus-visible` outline and a skip link to the main content