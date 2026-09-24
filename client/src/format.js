// Small helpers shared by the pages. They used to live at the top of App.jsx,
// but Pets and Logs both need them now.

export const TYPES = [
  { value: 'fed', label: 'Fed' },
  { value: 'walk', label: 'Walk' },
  { value: 'pee', label: 'Pee' },
  { value: 'poop', label: 'Poop' },
]

export const labelOf = (type) => TYPES.find((item) => item.value === type)?.label ?? type

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

// "3 years" or "5 months" from a birthdate like '2021-03-14'.
// The date is split by hand, because new Date('2021-03-14') reads it as UTC
// and can land on the day before in some timezones.
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

// How many hours before a pet is due again. Change these to fit the house.
// fed is for the Fed button, out is for the Bathroom button (walk, pee or poop).
export const LIMITS = { fed: 12, out: 6 }

// No record at all counts as due, since nobody has done it yet.
export function isDue(iso, hours, now = new Date()) {
  if (!iso) return true
  return now - new Date(iso) > hours * 60 * 60 * 1000
}