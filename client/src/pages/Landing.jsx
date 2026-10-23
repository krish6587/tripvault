import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

import hero from '../assets/landing/hero.jpg';
import frame from '../assets/landing/frame.jpg';
import m1 from '../assets/landing/m1.jpg';
import m2 from '../assets/landing/m2.jpg';

// p00.jpg ... p16.jpg (zero-padded so the order is correct)
const polaroids = Object.entries(
  import.meta.glob('../assets/landing/p*.jpg', { eager: true, import: 'default' })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src);

const LEFT = ['Himalayas', 'Lake View', 'Chasing Sunsets', 'Santorini', 'Train Stories', 'Bali', 'Rome', 'Amalfi Coast'];
const RIGHT = ['Road Trip', 'Thailand', 'Switzerland', 'Paris', 'Waterfalls', 'Camping', 'Island Vibes', 'Adventure', 'Cappadocia'];
const NAMES = [...LEFT, ...RIGHT];

// [left %, top %, rotation deg]
const POS = [
  [2, 2, -14], [14, 5, 10], [74, 1, 12], [86, 3, -10], [92, 16, 14], [10, 40, -8], [20, 50, 12], [30, 34, -6],
  [38, 52, 7], [47, 36, -10], [57, 48, 9], [66, 38, -12], [76, 52, 12], [84, 42, -7], [24, 68, 9], [60, 66, -8], [44, 68, 7],
];

const bg = (src) => ({ backgroundImage: `url(${src})` });
const pad = (n) => String(n).padStart(2, '0');

export default function Landing() {
  const heroBg = useRef(null);
  const loggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const onScroll = () => {
      if (heroBg.current) {
        heroBg.current.style.transform = `scale(1.05) translateY(${Math.min(window.scrollY, 700) * 0.2}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp">
      <header className="hero">
        <div className="bg" ref={heroBg} style={bg(hero)} />
        <nav>
          <div className="logo">TripVault</div>
          <ul className="tiny">
            <li>Journal</li><li>Experiences</li><li>About</li><li>Contact</li>
          </ul>
          <div className="tiny ex">
            {loggedIn ? (
              <Link to="/dashboard">Open your vault</Link>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Get started</Link>
              </>
            )}
          </div>
        </nav>

        <div className="stage">
          <div className="mini m1" style={bg(m1)} />
          <h1 className="l"><span>Beyond<br />Places.</span></h1>
          <div className="frame" style={bg(frame)}>
            <b className="tiny"><span>01</span><span>Real journeys</span><span>42</span></b>
          </div>
          <h1 className="r"><span style={{ animationDelay: '.3s' }}>Into<br />Moments.</span></h1>
          <div className="mini m2" style={bg(m2)} />
          <div className="dest tiny">
            <b>+ All destinations</b><br />Himalayas<br />Bali<br />Santorini<br />Paris
          </div>
        </div>
      </header>

      <section className="wander" id="destinations">
        <h2>Destinations<br />Worth Wandering.</h2>
        <div className="pols">
          {POS.map(([l, t, r], i) => (
            <div key={i} className="pol" style={{ left: `${l}%`, top: `${t}%`, transform: `rotate(${r}deg)` }}>
              <i style={bg(polaroids[i])} />
              <span className="tiny">{NAMES[i]}</span>
            </div>
          ))}
        </div>
        <div className="list tiny l">
          {LEFT.map((n, i) => (
            <div key={n}>{pad(i + 1)}. {i === 0 ? <b>{n}</b> : n}</div>
          ))}
        </div>
        <div className="list tiny r">
          {RIGHT.map((n, i) => (
            <div key={n}>{n} {pad(i + 9)}</div>
          ))}
        </div>
      </section>

      <section className="end">
        <div className="bg" style={{ ...bg(hero), filter: 'blur(14px) brightness(.4)' }} />
        <div>
          <h2>Your next story<br />starts here.</h2>
          <Link className="btn tiny" to={loggedIn ? '/dashboard' : '/register'}>Open your vault</Link>
        </div>
      </section>

      <footer className="tiny">
        <span>© 2026 TripVault • Crafted by Krish Kumar</span>
        <a
          href="https://github.com/krish6587/tripvault"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', color: 'var(--mute)' }}
        >
          GitHub ↗
        </a>
      </footer>
    </div>
  );
}
