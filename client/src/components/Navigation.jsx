import { NavLink } from 'react-router-dom'

// The top bar. Same plain CSS approach as the rest of the app.
//
// It uses react-router now, so it does not need the current page or a
// callback anymore. NavLink knows which route is open, adds the active class
// for us, and sets aria-current="page" by itself.

const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/logs', label: 'Logs' },
  { to: '/pets', label: 'Pets' },
]

export default function Navigation() {
  return (
    <nav className="nav">
      {/* Two spans so the brand can be two colours without an image. */}
      <p className="brand">
        <span className="brand-a">Care</span><span className="brand-b">Pawnion</span>
      </p>

      <ul className="nav-links">
        {PAGES.map((page) => (
          <li key={page.to}>
            {/* end on Home, or "/" would count as active on every page. */}
            <NavLink
              to={page.to}
              end={page.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {page.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}