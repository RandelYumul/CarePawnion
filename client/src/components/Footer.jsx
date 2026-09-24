import { Link } from 'react-router-dom'

// Sits at the bottom of the shared layout, so it renders on every route.
//
// Two jobs only. Say what the app is, and give a second way to reach the
// other screens for someone who has scrolled past the nav. Anything more and
// it turns into a second navigation bar competing with the real one.
//
// No name, student number or email here. This file ships in the public repo.

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-brand">
          <strong>CarePawnion</strong>
          <span className="muted"> A shared pet care log for the household.</span>
        </p>

        <nav className="footer-links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/pets">Pets</Link>
          <Link to="/logs">Logs</Link>
          <Link to="/logs/new">Log care</Link>
        </nav>

        <p className="footer-fine muted">
          {YEAR} CarePawnion. Built for 6APSI.
        </p>
      </div>
    </footer>
  )
}