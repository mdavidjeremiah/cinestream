import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, BookmarkPlus, BookmarkCheck, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/client';

export default function MovieCard({ movie, showWatchlistBtn = true }) {
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [hovered, setHovered] = useState(false);

  const posterUrl = movie.poster_url || `https://via.placeholder.com/300x450/1a2236/8a9bb5?text=${encodeURIComponent(movie.title)}`;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  const handleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      await authAPI.toggleWatchlist(movie.id);
      setInWatchlist(!inWatchlist);
    } catch (err) {
      console.error(err);
    }
  };

  const ratingColor = rating >= 7 ? '#2ecc71' : rating >= 5 ? 'var(--gold)' : 'var(--accent)';

  return (
    <Link to={`/movie/${movie.id}`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          transform: hovered ? 'scale(1.03) translateY(-4px)' : 'scale(1) translateY(0)',
          boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.3)',
          background: 'var(--surface)',
        }}
      >
        {/* Poster */}
        <div style={{ position: 'relative', paddingBottom: '150%', overflow: 'hidden' }}>
          <img
            src={posterUrl}
            alt={movie.title}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/300x450/1a2236/8a9bb5?text=${encodeURIComponent(movie.title?.substring(0, 10))}`;
            }}
          />

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(8,11,20,0.95) 0%, rgba(8,11,20,0.3) 40%, transparent 70%)',
            transition: 'opacity 0.3s',
          }} />

          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(230,57,70,0.08)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'scale(1)' : 'scale(0.7)',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(230,57,70,0.5)',
            }}>
              <Play size={22} fill="white" color="white" style={{ marginLeft: 3 }} />
            </div>
          </div>

          {/* Rating badge */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(4px)',
            borderRadius: 6, padding: '3px 7px',
            display: 'flex', alignItems: 'center', gap: 3,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Star size={11} fill={ratingColor} color={ratingColor} />
            <span style={{ fontSize: 11, fontWeight: 700, color: ratingColor }}>{rating}</span>
          </div>

          {/* Watchlist btn */}
          {showWatchlistBtn && user && (
            <button
              onClick={handleWatchlist}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(8,11,20,0.8)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: '5px',
                color: inWatchlist ? 'var(--accent)' : 'var(--text2)',
                display: 'flex', transition: 'all 0.2s',
                opacity: hovered ? 1 : 0.6,
              }}
            >
              {inWatchlist
                ? <BookmarkCheck size={14} />
                : <BookmarkPlus size={14} />}
            </button>
          )}

          {/* Genre badges */}
          {movie.genres?.length > 0 && (
            <div style={{
              position: 'absolute', bottom: 8, left: 8, right: 8,
              display: 'flex', gap: 4, flexWrap: 'wrap',
              opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
            }}>
              {movie.genres.slice(0, 2).map(g => (
                <span key={g.id} style={{
                  background: 'rgba(230,57,70,0.15)', color: 'var(--accent2)',
                  fontSize: 10, fontWeight: 600, padding: '2px 7px',
                  borderRadius: 10, border: '1px solid rgba(230,57,70,0.25)',
                }}>{g.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '10px 10px 12px' }}>
          <h3 style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text)',
            lineHeight: 1.3, marginBottom: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{movie.title}</h3>
          {year && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text3)', fontSize: 11 }}>
              <Calendar size={10} />
              <span>{year}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
