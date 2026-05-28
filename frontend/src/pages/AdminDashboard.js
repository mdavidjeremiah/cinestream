import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Film, Users, Star, TrendingUp, RefreshCw,
  Trash2, Edit, Plus, ChevronRight, Shield, Activity, Eye,
  CheckCircle, XCircle, Download, BarChart2
} from 'lucide-react';
import { adminAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon: Icon, label, value, color, change }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 22px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 50, height: 50, borderRadius: 12,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{value?.toLocaleString()}</div>
        <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
        background: active ? 'rgba(230,57,70,0.12)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text2)',
        fontSize: 14, fontWeight: 500, transition: 'all 0.15s', textAlign: 'left',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getMovies({ page_size: 20 }),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data);
      setMovies(moviesRes.data.results || moviesRes.data || []);
      setUsers(usersRes.data.results || usersRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type) => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const r = await adminAPI.syncMovies({ type });
      setSyncMsg(`✓ Synced ${r.data.synced} ${type} movies`);
      await loadData();
    } catch (e) {
      setSyncMsg('✗ Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const toggleFeatured = async (movie) => {
    await adminAPI.updateMovie(movie.id, { is_featured: !movie.is_featured });
    await loadData();
  };

  const deleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    await adminAPI.deleteMovie(id);
    await loadData();
  };

  const toggleUserActive = async (u) => {
    await adminAPI.updateUser(u.id, { is_active: !u.is_active });
    await loadData();
  };

  if (!isAdmin) return null;

  const sections = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'movies', icon: Film, label: 'Movies' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'sync', icon: RefreshCw, label: 'Sync Content' },
  ];

  return (
    <div className="page-wrapper" style={{ display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--bg3)', borderRight: '1px solid var(--border)',
        padding: '24px 12px', position: 'sticky', top: 70, height: 'calc(100vh - 70px)',
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: 24, paddingLeft: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Shield size={16} color="var(--accent)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Admin Panel
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Signed in as {user?.username}</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map(s => (
            <SidebarLink key={s.id} icon={s.icon} label={s.label}
              active={activeSection === s.id} onClick={() => setActiveSection(s.id)} />
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)', marginTop: 32 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text3)', fontSize: 13, padding: '6px 14px' }}>
            <Eye size={14} /> View Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px 32px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="fade-in">
                <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 32, marginBottom: 6 }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 28 }}>
                  Welcome back, {user?.username}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
                  <StatCard icon={Film} label="Total Movies" value={stats?.total_movies} color="#3498db" />
                  <StatCard icon={Users} label="Total Users" value={stats?.total_users} color="var(--accent)" />
                  <StatCard icon={Star} label="Total Reviews" value={stats?.total_reviews} color="var(--gold)" />
                  <StatCard icon={Activity} label="Featured" value={stats?.featured_movies} color="#2ecc71" />
                </div>

                {/* Top Movies */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Star size={15} color="var(--gold)" /> Top Rated Movies
                    </h3>
                    {stats?.top_movies?.map((m, i) => (
                      <div key={m.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 0', borderBottom: i < stats.top_movies.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text3)' }}>{i + 1}</span>
                        {m.poster_url && <img src={m.poster_url} alt={m.title} style={{ width: 36, height: 54, borderRadius: 4, objectFit: 'cover' }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Star size={10} fill="var(--gold)" color="var(--gold)" />
                            <span style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 700 }}>{m.vote_average?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={15} color="var(--accent)" /> Recent Users
                    </h3>
                    {stats?.recent_users?.map((u, i) => (
                      <div key={u.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 0', borderBottom: i < stats.recent_users.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{u.username}</div>
                          <div style={{ color: 'var(--text3)', fontSize: 11 }}>{u.email}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
                          {new Date(u.date_joined).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MOVIES */}
            {activeSection === 'movies' && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 32 }}>Manage Movies</h1>
                  <button onClick={() => setActiveSection('sync')} className="btn btn-primary btn-sm">
                    <Plus size={15} /> Add via Sync
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        {['Movie', 'Rating', 'Year', 'Featured', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {m.poster_url && <img src={m.poster_url} alt={m.title} style={{ width: 32, height: 48, borderRadius: 4, objectFit: 'cover' }} />}
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                                <div style={{ color: 'var(--text3)', fontSize: 11 }}>ID: {m.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Star size={12} fill="var(--gold)" color="var(--gold)" />
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>{m.vote_average?.toFixed(1)}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text3)', fontSize: 13 }}>
                            {m.release_date ? new Date(m.release_date).getFullYear() : '—'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button onClick={() => toggleFeatured(m)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              {m.is_featured
                                ? <span className="badge badge-green">Featured</span>
                                : <span className="badge" style={{ background: 'var(--surface)', color: 'var(--text3)', border: '1px solid var(--border)' }}>Normal</span>
                              }
                            </button>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Link to={`/movie/${m.id}`} className="btn btn-ghost btn-sm"><Eye size={13} /></Link>
                              <button onClick={() => deleteMovie(m.id)} className="btn btn-danger btn-sm"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS */}
            {activeSection === 'users' && (
              <div className="fade-in">
                <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 32, marginBottom: 24 }}>Manage Users</h1>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        {['User', 'Email', 'Role', 'Premium', 'Status', 'Joined', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                                {u.username?.[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{u.username}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text3)', fontSize: 12 }}>{u.email}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-blue'}`}>{u.role}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {u.is_premium ? <CheckCircle size={16} color="#2ecc71" /> : <XCircle size={16} color="var(--text3)" />}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`badge ${u.is_active ? 'badge-green' : 'badge-accent'}`}>
                              {u.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text3)', fontSize: 12 }}>
                            {new Date(u.date_joined).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button
                              onClick={() => toggleUserActive(u)}
                              className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                              style={{ fontSize: 11 }}
                            >
                              {u.is_active ? 'Suspend' : 'Restore'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SYNC */}
            {activeSection === 'sync' && (
              <div className="fade-in" style={{ maxWidth: 600 }}>
                <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 32, marginBottom: 6 }}>Sync Content</h1>
                <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 28 }}>
                  Import movies from TMDB into your database
                </p>

                {syncMsg && (
                  <div style={{
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 20,
                    background: syncMsg.startsWith('✓') ? 'rgba(46,204,113,0.1)' : 'rgba(230,57,70,0.1)',
                    border: `1px solid ${syncMsg.startsWith('✓') ? 'rgba(46,204,113,0.3)' : 'rgba(230,57,70,0.3)'}`,
                    color: syncMsg.startsWith('✓') ? '#2ecc71' : 'var(--accent)',
                    fontSize: 14,
                  }}>
                    {syncMsg}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { type: 'popular', label: 'Sync Popular Movies', desc: 'Fetch the current most popular movies from TMDB', color: '#3498db' },
                    { type: 'trending', label: 'Sync Trending Movies', desc: 'Fetch this week\'s trending movies from TMDB', color: 'var(--accent)' },
                  ].map(({ type, label, desc, color }) => (
                    <div key={type} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '20px 22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>{label}</div>
                        <div style={{ color: 'var(--text3)', fontSize: 13 }}>{desc}</div>
                      </div>
                      <button
                        onClick={() => handleSync(type)}
                        disabled={syncing}
                        className="btn btn-primary btn-sm"
                        style={{ whiteSpace: 'nowrap', opacity: syncing ? 0.6 : 1 }}
                      >
                        <RefreshCw size={14} style={{ animation: syncing ? 'spin 0.8s linear infinite' : 'none' }} />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: 24, padding: '16px 18px',
                  background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.2)',
                  borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text2)',
                }}>
                  <strong style={{ color: 'var(--gold)' }}>Note:</strong> You need a valid TMDB API key in your backend <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4 }}>.env</code> file (<code>TMDB_API_KEY=your_key</code>). Get one free at{' '}
                  <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>themoviedb.org</a>.
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
