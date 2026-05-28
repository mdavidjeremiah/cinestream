import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { moviesAPI } from '../api/client';
import MovieCard from '../components/movies/MovieCard';

const SORT_OPTIONS = [
  { value: '-popularity', label: 'Most Popular' },
  { value: '-vote_average', label: 'Highest Rated' },
  { value: '-release_date', label: 'Newest First' },
  { value: 'title', label: 'A–Z' },
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') === 'trending' ? '-popularity' : (searchParams.get('sort') || '-popularity');
  const page = parseInt(searchParams.get('page') || '1');

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    if (key !== 'page') p.delete('page');
    setSearchParams(p);
  };

  useEffect(() => {
    moviesAPI.getGenres().then(r => setGenres(r.data.results || r.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort, page };
    if (search) params.search = search;
    if (genre) params.genre = genre;

    moviesAPI.getAll(params)
      .then(r => {
        setMovies(r.data.results || []);
        setTotal(r.data.count || 0);
        setTotalPages(Math.ceil((r.data.count || 0) / 20) || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, genre, sort, page]);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="font-display" style={{ fontSize: 36, marginBottom: 6 }}>
            {search ? `Search: "${search}"` : 'Browse Movies'}
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>
            {loading ? 'Loading...' : `${total.toLocaleString()} movies found`}
          </p>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
          marginBottom: 28, padding: '16px 18px',
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <SlidersHorizontal size={16} color="var(--text3)" />
          <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, marginRight: 4 }}>FILTER</span>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => updateParam('sort', e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Genre */}
          <select
            value={genre}
            onChange={e => updateParam('genre', e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
          >
            <option value="">All Genres</option>
            {genres.map(g => <option key={g.id} value={g.tmdb_id}>{g.name}</option>)}
          </select>

          {(search || genre) && (
            <button
              onClick={() => setSearchParams({})}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent)', fontSize: 13 }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div>
            <div className="grid-movies">
              {Array(12).fill(0).map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ paddingBottom: '150%', borderRadius: 'var(--radius)' }} />
                  <div className="skeleton" style={{ height: 14, marginTop: 8, width: '70%' }} />
                </div>
              ))}
            </div>
          </div>
        ) : movies.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            color: 'var(--text2)',
          }}>
            <Search size={48} color="var(--text3)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No movies found</h3>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid-movies fade-in">
            {movies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 8, marginTop: 40,
          }}>
            <button
              onClick={() => updateParam('page', page - 1)}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page <= 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 3, totalPages - 6)) + i;
              return p <= totalPages ? (
                <button
                  key={p}
                  onClick={() => updateParam('page', p)}
                  style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: p === page ? 'var(--accent)' : 'var(--surface)',
                    color: p === page ? 'white' : 'var(--text2)',
                    border: '1px solid var(--border)',
                    fontWeight: 600, fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                >{p}</button>
              ) : null;
            })}

            <button
              onClick={() => updateParam('page', page + 1)}
              disabled={page >= totalPages}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page >= totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
