import { useState } from 'react'
import { NavLink } from 'react-router-dom'

// The top bar. Same plain CSS approach as the rest of the app.
//
// It uses react-router now, so it does not need the current page or a
// callback anymore. NavLink knows which route is open, adds the active class
// for us, and sets aria-current="page" by itself.

const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/pets', label: 'Pets' },
  { to: '/logs', label: 'Logs' },
]

export default function Navigation() {
  const [open, setOpen] = useState(false)

  function handleToggle() {
    setOpen((current) => !current)
  }

  return (
    <nav className="nav">
      {/* Two spans so the brand can be two colours without an image. */}
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-a">Care</span><span className="brand-b">Pawnion</span>
      </Link>

      {/* Only shown on small screens, by CSS. */}
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-label="Toggle menu"
        onClick={handleToggle}
      >
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
      </button>

      <ul className={`nav-links${open ? ' open' : ''}`}>
        {PAGES.map((page) => (
          <li key={page.to}>
            {/* end on Home, or "/" would count as active on every page. */}
            <NavLink
              to={page.to}
              end={page.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {page.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}