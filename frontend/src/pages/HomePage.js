import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Star, ChevronRight, Flame, Clock, Award } from 'lucide-react';
import { moviesAPI } from '../api/client';
import MovieCard from '../components/movies/MovieCard';

function HeroSection({ movie }) {
  if (!movie) return null;
  const backdrop = movie.backdrop_url || movie.poster_url;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

  return (
    <div style={{
      position: 'relative', height: '88vh', minHeight: 550, overflow: 'hidden',
      display: 'flex', alignItems: 'flex-end',
      marginTop: -70,
    }}>
      {/* Backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: backdrop ? `url(${backdrop}) center/cover no-repeat` : 'var(--bg2)',
      }} />
      {/* Overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(8,11,20,0.95) 35%, rgba(8,11,20,0.4) 70%, transparent)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(8,11,20,1) 0%, rgba(8,11,20,0.3) 30%, transparent 60%)',
      }} />

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 2, paddingBottom: 60, maxWidth: 680 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {movie.genres?.slice(0, 3).map(g => (
            <span key={g.id} className="badge badge-accent">{g.name}</span>
          ))}
          {year && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text2)' }}>{year}</span>}
        </div>

        <h1 style={{
          fontFamily: 'Bebas Neue', fontSize: 'clamp(40px, 7vw, 78px)',
          letterSpacing: '0.03em', lineHeight: 1, color: 'var(--text)',
          marginBottom: 16,
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          {movie.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Star size={15} fill="var(--gold)" color="var(--gold)" />
            <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 16 }}>
              {movie.vote_average?.toFixed(1)}
            </span>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>/ 10</span>
          </div>
          {movie.runtime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)' }}>
              <Clock size={14} />
              <span style={{ fontSize: 14 }}>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </div>
          )}
        </div>

        <p style={{
          color: 'var(--text2)', fontSize: 15, lineHeight: 1.7,
          maxWidth: 520, marginBottom: 28,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {movie.overview}
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to={`/movie/${movie.id}`} className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
            <Play size={17} fill="white" /> Watch Now
          </Link>
          <Link to={`/movie/${movie.id}`} className="btn btn-secondary" style={{ fontSize: 15, padding: '12px 28px' }}>
            More Info
          </Link>
        </div>
      </div>
    </div>
  );
}

function MovieRow({ title, icon: Icon, movies, color = 'var(--accent)', link }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          {Icon && <Icon size={22} color={color} />}
          {title.split(' ').map((w, i) => (
            <span key={i} style={{ color: i === title.split(' ').length - 1 ? color : 'var(--text)' }}>{w} </span>
          ))}
        </h2>
        {link && (
          <Link to={link} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: 'var(--text3)', fontSize: 13, transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >
            View All <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="grid-movies">
        {movies.map(m => <MovieCard key={m.id} movie={m} />)}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      moviesAPI.getTrending(),
      moviesAPI.getAll({ sort: '-popularity', page_size: 12 }),
      moviesAPI.getAll({ sort: '-vote_average', page_size: 8 }),
    ]).then(([trendRes, popRes, ratedRes]) => {
      setTrending(trendRes.data.results || []);
      setPopular(popRes.data.results || []);
      setTopRated(ratedRes.data.results || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hero = trending[0] || popular[0];

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <div className="spinner" />
          <p style={{ textAlign: 'center', color: 'var(--text3)', marginTop: 12 }}>Loading CineStream...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeroSection movie={hero} />

      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        {trending.length > 0 && (
          <MovieRow title="Trending Now" icon={Flame} movies={trending.slice(0, 8)} color="var(--accent)" link="/browse?sort=trending" />
        )}
        {popular.length > 0 && (
          <MovieRow title="Popular Movies" icon={TrendingUp} movies={popular.slice(0, 8)} color="#3498db" link="/browse" />
        )}
        {topRated.length > 0 && (
          <MovieRow title="Top Rated" icon={Award} movies={topRated.slice(0, 8)} color="var(--gold)" link="/browse?sort=-vote_average" />
        )}
      </div>
    </div>
  );
}
