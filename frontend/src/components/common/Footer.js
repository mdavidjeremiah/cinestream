import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg3)', borderTop: '1px solid var(--border)',
      padding: '40px 0 24px',
      marginTop: 60,
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 32, marginBottom: 36 }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Film size={18} color="white" />
              </div>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: '0.1em' }}>
                CINE<span style={{ color: 'var(--accent)' }}>STREAM</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text3)', fontSize: 13, lineHeight: 1.6 }}>
              Your ultimate destination for free movie streaming.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 12 }}>Browse</h4>
            {['Home', 'Browse', 'Trending'].map(l => (
              <Link key={l} to={l === 'Home' ? '/' : `/${l.toLowerCase()}`} style={{ display: 'block', color: 'var(--text2)', fontSize: 13, marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--text2)'}
              >{l}</Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 12 }}>Account</h4>
            {[['Sign In', '/login'], ['Register', '/register'], ['Profile', '/profile'], ['Watchlist', '/watchlist']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', color: 'var(--text2)', fontSize: 13, marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--text2)'}
              >{l}</Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text3)', fontSize: 12 }}>
            © {new Date().getFullYear()} CineStream. For educational purposes only. Movie data powered by{' '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>TMDB</a>.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[Github, Twitter, Mail].map((Icon, i) => (
              <button key={i} style={{ color: 'var(--text3)', padding: 6, borderRadius: 6, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
