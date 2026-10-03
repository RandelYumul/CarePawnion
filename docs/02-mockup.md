# Mockup

## Low fidelity

### Screen map

- **First screen.** Home. It answers the main question right away, when each pet
  was last fed or let out.
- **Home base.** The navigation, on every screen.
- **No dead ends.** The navigation and footer are on every screen, Pet details
  links back to Pets, and a wrong address goes to Home.

### Wireframes

Grey boxes only, updated to the four screens of the revised proposal. The logs show a few sample rows, since the rest repeat.

| Screen | Desktop | Phone |
| --- | --- | --- |
| Home | <img src="assets/wireframes/home-desktop.svg" width="340" alt="Home wireframe, desktop"> | <img src="assets/wireframes/home-mobile.svg" width="200" alt="Home wireframe, phone"> |
| Pets | <img src="assets/wireframes/pets-desktop.svg" width="340" alt="Pets wireframe, desktop"> | <img src="assets/wireframes/pets-mobile.svg" width="200" alt="Pets wireframe, phone"> |
| Pet details | <img src="assets/wireframes/pet-details-desktop.svg" width="340" alt="Pet details wireframe, desktop"> | <img src="assets/wireframes/pet-details-mobile.svg" width="200" alt="Pet details wireframe, phone"> |
| Logs | <img src="assets/wireframes/logs-desktop.svg" width="340" alt="Logs wireframe, desktop"> | <img src="assets/wireframes/logs-mobile.svg" width="200" alt="Logs wireframe, phone"> |

## High fidelity

The wireframes painted in, with the real colours, type, spacing, and content.

### Home

<img src="assets/mockup/home-desktop.png" width="720" alt="Home with three pets due for the bathroom">

The Home card shows the last activity, the Hungry list, and the Bathroom list.
Here all three pets are due for the bathroom, so their Bathroom buttons are red.

<img src="assets/mockup/home-desktop-recent.png" width="720" alt="Home right after a feeding">

Right after a feeding, the time reads "Just now", nobody is hungry, and only
Yuumi is still due for the bathroom.

### Pets

<img src="assets/mockup/pets-desktop.png" width="720" alt="Pets with three pet cards">

### Pet details

<img src="assets/mockup/pet-details-desktop.png" width="720" alt="Milky's Pet details page">

The profile with the breed and birthday chips and three stat boxes, the check
ups, the usual times chart, and the logs for this pet.

### Logs

<img src="assets/mockup/logs-desktop.png" width="720" alt="Logs with the status board and history">

The history shows a few sample rows, since the rest repeat.

<img src="assets/mockup/logs-log-care.png" width="720" alt="Logs with the Log care form open">

The Log care form opens from its button. More than one type can be checked.

<img src="assets/mockup/logs-set-limits.png" width="720" alt="Logs with the Set limits form open">

Set limits changes how many hours pass before a pet shows as due.

### On a phone

The logs show a few sample rows, since the rest repeat.

| Home | Pets | Pets, adding a pet |
| --- | --- | --- |
| <img src="assets/mockup/home-mobile.png" width="220" alt="Home on a phone"> | <img src="assets/mockup/pets-mobile.png" width="220" alt="Pets on a phone"> | <img src="assets/mockup/pets-mobile-add.png" width="220" alt="The add pet form on a phone"> |

| Pet details | Logs, Log care | Logs, Set limits |
| --- | --- | --- |
| <img src="assets/mockup/pet-details-mobile.png" width="220" alt="Pet details on a phone"> | <img src="assets/mockup/logs-mobile-log-care.png" width="220" alt="Logs with the Log care form on a phone"> | <img src="assets/mockup/logs-mobile-set-limits.png" width="220" alt="Logs with Set limits and the open menu on a phone"> |

## Design implementation

**Colours.** Five colours, set once in `:root` in `styles.css` and used by name
everywhere.

| Token | Value | Used for |
| --- | --- | --- |
| `--color-primary` | `#5f6448` | Buttons, tags, borders, the footer, done (green) states |
| `--color-accent` | `#c0392b` | Due (red) states, counts, Delete and Remove |
| `--color-bg` | `#F9F2EC` | Cards, the navigation, chips |
| `--color-surface` | `#FFFCF8` | The page background |
| `--color-text` | `#232a2c` | Body text and headings |

**Type.** Playfair Display for the brand, headings, and the clock. The system
font for body text, so it loads fast and reads well on any phone.

**Spacing.** A fixed scale from `--space-1` (0.25rem) to `--space-8` (2rem).
Content stays within an 80rem width, with a gutter that grows with the screen.

**Components.** Each piece is styled once and reused.

- **Pet card.** Photo, name, type, breed, age, last fed, last out, and the Fed
  and Bathroom buttons, green when done and red when due.
- **Home card.** The clock, the Hungry and Bathroom lists with a red count, and
  the latest log.
- **Tag.** A rounded label for each type, Fed, Walk, Pee, Poop, and Vet.
- **Chip.** The breed and birthday on Pet details.
- **Ghost button.** An outlined button for secondary actions, like View, Edit,
  Back to pets, and View Details.
- **Day group.** One card per day in the history, used on Logs and Pet details.

**Phone.** Below 48rem the layouts turn into one column and the navigation
folds into a menu button. The Pet details profile centres, and Edit details
moves to the bottom as a full width button. Below 40rem the Home card puts
Hungry and Bathroom side by side. Each log puts the time, tag, pet, and member on
one line, the note in its own box below, and View, Edit, and Delete in one even
row.

## Honest note

The high fidelity screens are taken from the built app, so everything shown here
is in it. The differences from the wireframes are in the change table of
`proposal.md`.
