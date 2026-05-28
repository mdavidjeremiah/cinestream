import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, History, User, Mail, Save, Film, Clock } from 'lucide-react';
import { authAPI, moviesAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/movies/MovieCard';

export function WatchlistPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    authAPI.getWatchlist()
      .then(r => setMovies(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <h1 className="font-display" style={{ fontSize: 36, marginBottom: 6 }}>My Watchlist</h1>
        <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 28 }}>
          {movies.length} movie{movies.length !== 1 ? 's' : ''} saved
        </p>

        {loading ? (
          <div className="spinner" />
        ) : movies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Bookmark size={52} color="var(--text3)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No saved movies yet</h3>
            <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 24 }}>
              Browse movies and click the bookmark icon to save them here
            </p>
            <Link to="/browse" className="btn btn-primary">Browse Movies</Link>
          </div>
        ) : (
          <div className="grid-movies fade-in">
            {movies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moviesAPI.getHistory()
      .then(r => setHistory(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <h1 className="font-display" style={{ fontSize: 36, marginBottom: 6 }}>Watch History</h1>
        <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 28 }}>
          {history.length} movie{history.length !== 1 ? 's' : ''} watched
        </p>

        {loading ? (
          <div className="spinner" />
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <History size={52} color="var(--text3)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No history yet</h3>
            <Link to="/browse" className="btn btn-primary" style={{ marginTop: 8 }}>Start Watching</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map(h => (
              <Link to={`/movie/${h.movie.id}`} key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: 14, transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <img
                  src={h.movie.poster_url || `https://via.placeholder.com/60x90/1a2236/8a9bb5?text=N/A`}
                  alt={h.movie.title}
                  style={{ width: 52, height: 78, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/52x78/1a2236/8a9bb5?text=N/A'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{h.movie.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text3)', fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {new Date(h.watched_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {h.progress > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 3, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(h.progress, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ username: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setForm({ username: user.username || '', bio: user.bio || '' });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 600 }}>
        <h1 className="font-display" style={{ fontSize: 36, marginBottom: 28 }}>My Profile</h1>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {/* Avatar header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #c0392b 100%)',
            padding: '32px 28px', display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: 'white',
              border: '3px solid rgba(255,255,255,0.4)',
            }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{user.username}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{user.email}</div>
              <span style={{ display: 'inline-block', marginTop: 6, background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
                {user.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="input-field" style={{ paddingLeft: 36 }} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="input-field" style={{ paddingLeft: 36 }} value={user.email} disabled style={{ paddingLeft: 36, opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Bio</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  style={{ resize: 'none' }}
                />
              </div>

              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Save size={15} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
