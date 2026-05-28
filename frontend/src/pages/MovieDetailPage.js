import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Globe, Bookmark, BookmarkCheck, Share2, ThumbsUp, Send } from 'lucide-react';
import { moviesAPI, authAPI } from '../api/client';
import VideoPlayer from '../components/player/VideoPlayer';
import MovieCard from '../components/movies/MovieCard';
import { useAuth } from '../context/AuthContext';

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('watch');

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    moviesAPI.getById(id).then(r => {
      setMovie(r.data);
      if (r.data.genres?.length > 0) {
        moviesAPI.getAll({ genre: r.data.genres[0].tmdb_id, page_size: 6 })
          .then(rel => setRelated((rel.data.results || []).filter(m => m.id !== parseInt(id)).slice(0, 6)));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleWatchlist = async () => {
    if (!user) return;
    await authAPI.toggleWatchlist(movie.id);
    setInWatchlist(!inWatchlist);
  };

  const submitReview = async () => {
    if (!user || !reviewText.trim()) return;
    setSubmitting(true);
    try {
      await moviesAPI.addReview(id, { rating: reviewRating, comment: reviewText });
      const r = await moviesAPI.getById(id);
      setMovie(r.data);
      setReviewText('');
      setReviewRating(5);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!movie) return (
    <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: 100 }}>
      <h2>Movie not found</h2>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Go Home</Link>
    </div>
  );

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

  return (
    <div>
      {/* Backdrop Hero */}
      <div style={{
        position: 'relative', height: 480, marginTop: -70, overflow: 'hidden',
        background: movie.backdrop_url ? `url(${movie.backdrop_url}) center/cover` : 'var(--bg2)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(8,11,20,1) 30%, rgba(8,11,20,0.6) 60%, rgba(8,11,20,0.3))',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,11,20,1), transparent 50%)',
        }} />
      </div>

      {/* Main Content */}
      <div className="container" style={{ marginTop: -220, position: 'relative', zIndex: 2, paddingBottom: 60 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
          {/* Poster */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={movie.poster_url || `https://via.placeholder.com/220x330/1a2236/8a9bb5?text=${encodeURIComponent(movie.title)}`}
              alt={movie.title}
              style={{ width: '100%', borderRadius: 'var(--radius)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', display: 'block' }}
              onError={e => { e.target.src = `https://via.placeholder.com/220x330/1a2236/8a9bb5?text=No+Poster`; }}
            />
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {movie.genres?.map(g => <span key={g.id} className="badge badge-accent">{g.name}</span>)}
            </div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1, marginBottom: 14 }}>
              {movie.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Star size={16} fill="var(--gold)" color="var(--gold)" />
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 17 }}>{movie.vote_average?.toFixed(1)}</span>
                <span style={{ color: 'var(--text3)', fontSize: 13 }}>({movie.vote_count?.toLocaleString()} votes)</span>
              </div>
              {year && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)' }}><Calendar size={14} /><span>{year}</span></div>}
              {movie.runtime && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)' }}><Clock size={14} /><span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span></div>}
              {movie.language && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)' }}><Globe size={14} /><span style={{ textTransform: 'uppercase' }}>{movie.language}</span></div>}
            </div>

            <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.8, maxWidth: 700, marginBottom: 24 }}>
              {movie.overview}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('watch')} className="btn btn-primary" style={{ fontSize: 15 }}>
                Watch Now
              </button>
              {user && (
                <button onClick={handleWatchlist} className={`btn ${inWatchlist ? 'btn-secondary' : 'btn-secondary'}`} style={{ gap: 8 }}>
                  {inWatchlist ? <BookmarkCheck size={16} color="var(--accent)" /> : <Bookmark size={16} />}
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
            {['watch', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px', fontSize: 14, fontWeight: 600,
                  color: activeTab === tab ? 'var(--text)' : 'var(--text3)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  textTransform: 'capitalize', transition: 'all 0.2s',
                  marginBottom: -1,
                }}
              >
                {tab === 'watch' ? 'Watch' : `Reviews (${movie.review_count || 0})`}
              </button>
            ))}
          </div>

          {activeTab === 'watch' && (
            <div className="fade-in">
              <VideoPlayer sources={movie.video_sources || []} movieTitle={movie.title} />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="fade-in">
              {/* Write Review */}
              {user && (
                <div style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', padding: 20, marginBottom: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Write a Review</h3>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setReviewRating(n)} style={{ padding: 4 }}>
                        <Star size={22} fill={n <= reviewRating ? 'var(--gold)' : 'none'} color="var(--gold)" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="input-field"
                    rows={3}
                    style={{ resize: 'none', marginBottom: 12 }}
                  />
                  <button onClick={submitReview} disabled={submitting || !reviewText.trim()} className="btn btn-primary btn-sm">
                    <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}

              {/* Reviews list */}
              {movie.reviews?.length === 0 ? (
                <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '40px 0' }}>No reviews yet. Be the first!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {movie.reviews?.map(r => (
                    <div key={r.id} style={{
                      background: 'var(--surface)', borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)', padding: '16px 20px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: 'white',
                          }}>
                            {r.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.username}</div>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1,2,3,4,5].map(n => (
                                <Star key={n} size={11} fill={n <= r.rating ? 'var(--gold)' : 'none'} color="var(--gold)" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}>
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h2 className="section-title">More Like <span>This</span></h2>
            <div className="grid-movies">
              {related.map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
