import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, Settings, Bookmark, History, Shield, Menu, X, Film } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse', path: '/browse' },
    { label: 'Trending', path: '/browse?sort=trending' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 70, display: 'flex', alignItems: 'center',
      padding: '0 24px',
      background: scrolled
        ? 'rgba(8,11,20,0.95)'
        : 'linear-gradient(to bottom, rgba(8,11,20,0.9), transparent)',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 40 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Film size={20} color="white" />
        </div>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.1em', color: 'var(--text)' }}>
          CINE<span style={{ color: 'var(--accent)' }}>STREAM</span>
        </span>
      </Link>

      {/* Desktop Nav Links */}
      <div style={{ display: 'flex', gap: 4, flex: 1 }} className="desktop-nav">
        {navLinks.map(({ label, path }) => (
          <Link key={label} to={path} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            color: location.pathname === path ? 'var(--text)' : 'var(--text2)',
            fontWeight: 500, fontSize: 14, transition: 'all 0.2s',
            background: location.pathname === path ? 'var(--surface)' : 'transparent',
          }}
            onMouseEnter={e => { if (location.pathname !== path) e.target.style.color = 'var(--text)'; }}
            onMouseLeave={e => { if (location.pathname !== path) e.target.style.color = 'var(--text2)'; }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '6px 12px',
        marginRight: 16, width: 220,
      }}>
        <Search size={15} color="var(--text3)" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search movies..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 14, width: '100%',
          }}
        />
      </form>

      {/* Auth */}
      {user ? (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 12, fontWeight: 700,
            }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{user.username}</span>
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 8,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', minWidth: 200, overflow: 'hidden',
              boxShadow: 'var(--shadow)',
            }}>
              {[
                { icon: User, label: 'Profile', path: '/profile' },
                { icon: Bookmark, label: 'Watchlist', path: '/watchlist' },
                { icon: History, label: 'History', path: '/history' },
                ...(isAdmin ? [{ icon: Shield, label: 'Admin Dashboard', path: '/admin' }] : []),
              ].map(({ icon: Icon, label, path }) => (
                <Link key={label} to={path} onClick={() => setDropdownOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', color: 'var(--text2)',
                  fontSize: 14, transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
                >
                  <Icon size={15} /> {label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <button onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', color: 'var(--accent)',
                fontSize: 14, width: '100%', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
        </div>
      )}

      {/* Mobile menu toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ display: 'none', marginLeft: 12, color: 'var(--text)' }}
        className="mobile-menu-btn"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
