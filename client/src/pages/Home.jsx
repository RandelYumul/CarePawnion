import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImage from '../assets/heroImage.png'
import PetCard from '../components/Petcard.jsx'
import HomeRectangle from '../components/HomeRectangle.jsx'

// The landing page. The masthead, the floating bar, and the status board.

export default function Home({ summary, status, busy, onLog, rows }) {
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())

  // Re-check every minute, so a card turns red on its own when a pet becomes
  // due, without anyone reloading the page.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <header className="masthead">
        <div className="masthead-body">
          <div className="masthead-text">
            <h1 className="masthead-care">
              <span className="brand-a">Care</span><span className="brand-b">Pawnion</span>
            </h1>
            <p className="lede">
              A shared pet care log for the household. See when each pet was last
              fed or let out, and who did it.
            </p>
          </div>

          <img className="masthead-art" src={heroImage} alt="" />
        </div>
      </header>

      <HomeRectangle rows={rows} onOpen={() => navigate('/logs')} />

      {status === 'loading' && <p className="muted content">Loading...</p>}

      {status === 'ready' && summary.length === 0 && (
        <p className="muted content">No pets yet. Add one on the Pets page.</p>
      )}

      <section className="pet-grid">
        {summary.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            busy={busy}
            now={now}
            onLog={onLog}
            onView={() => navigate('/pets')}
          />
        ))}
      </section>
    </>
  )
}