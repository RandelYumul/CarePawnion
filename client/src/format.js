// Small helpers shared by the pages. They used to live at the top of App.jsx,
// but Pets and Logs both need them now.

export const TYPES = [
  { value: 'fed', label: 'Fed' },
  { value: 'walk', label: 'Walk' },
  { value: 'pee', label: 'Pee' },
  { value: 'poop', label: 'Poop' },
  { value: 'vet', label: 'Vet' },
]

export const labelOf = (type) => TYPES.find((item) => item.value === type)?.label ?? type

// A vet visit is not a bathroom trip. Before this list, "last out" was
// anything that was not fed, which would have counted a check up as a pee.
export const OUT_TYPES = ['walk', 'pee', 'poop']

export const isOut = (type) => OUT_TYPES.includes(type)

// What the visit was for. The note field next to it holds the details,
// like the vaccine name or what the vet found.
export const VET_KINDS = [
  { value: 'vaccine', label: 'Vaccine' },
  { value: 'checkup', label: 'Check up' },
  { value: 'treatment', label: 'Treatment' },
]

export const vetKindOf = (kind) => VET_KINDS.find((item) => item.value === kind)?.label ?? kind

export function formatWhen(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

// "3 hours ago" reads faster than a date when you just want to know if the
// dog has eaten. now is passed in so the text updates with the page's clock.
export function timeAgo(iso, now = new Date()) {
  const ms = now - new Date(iso)
  if (Number.isNaN(ms)) return 'Unknown time'

  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

// A plain date with no time, like '2021-03-14' to "Mar 14, 2021". Split by
// hand, because new Date('2021-03-14') reads it as UTC and can land on the
// day before in some timezones. Used for birthdays and for the next visit.
export function formatDate(date) {
  if (!date) return 'Unknown'
  const [year, month, day] = String(date).slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return 'Unknown'
  return new Date(year, month - 1, day).toLocaleDateString([], { dateStyle: 'medium' })
}

// How many days from today to a plain date. Negative means it already passed.
// Both sides are cut down to the start of the day, so an appointment later
// today still reads as 0 and not as a fraction.
export function daysUntil(date, now = new Date()) {
  if (!date) return null
  const [year, month, day] = String(date).slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return null

  const target = new Date(year, month - 1, day)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target - startOfToday) / 86400000)
}

// "In 12 days", "Tomorrow", "3 days late". The words matter more than the
// date here, because the point is whether the visit is still coming.
export function visitLabel(date, now = new Date()) {
  const days = daysUntil(date, now)
  if (days === null) return null
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'A day late'
  if (days < 0) return `${Math.abs(days)} days late`
  return `In ${days} day${days === 1 ? '' : 's'}`
}

// A visit is late once the day is past, the same way a pet is due once the
// limit is past. Used for the red styling on the check up box.
export function isVisitDue(date, now = new Date()) {
  const days = daysUntil(date, now)
  return days !== null && days < 0
}

// "3 years" or "5 months" from a birthdate like '2021-03-14'.
export function ageOf(birthdate, now = new Date()) {
  if (!birthdate) return null
  const [year, month, day] = String(birthdate).slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return null

  let months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month)
  if (now.getDate() < day) months -= 1
  if (months < 0) return null

  if (months < 1) return 'Under a month'
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`
  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'}`
}

// How many hours before a pet is due again. These are the defaults, the
// household can change them from the Set limits button on the Logs page.
// fed is for the Fed button, out is for the Bathroom button (walk, pee or poop).
export const LIMITS = { fed: 12, out: 6 }

// No record at all counts as due, since nobody has done it yet.
export function isDue(iso, hours, now = new Date()) {
  if (!iso) return true
  return now - new Date(iso) > hours * 60 * 60 * 1000
}

// Just the time, since the day is already the heading above the row.
export function formatTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return date.toLocaleTimeString([], { timeStyle: 'short' })
}

// "Today", "Yesterday", or a plain date. Used to group the log list by day.
export function dayLabel(iso, now = new Date()) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown day'

  const startOf = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate())
  const days = Math.round((startOf(now) - startOf(date)) / 86400000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString([], { dateStyle: 'medium' })
}