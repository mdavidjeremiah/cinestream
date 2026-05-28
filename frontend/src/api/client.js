import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          err.config.headers.Authorization = `Bearer ${data.access}`;
          return client.request(err.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default client;

export const moviesAPI = {
  getAll: (params) => client.get('/movies/', { params }),
  getById: (id) => client.get(`/movies/${id}/`),
  search: (q) => client.get('/movies/search/', { params: { q } }),
  getTrending: () => client.get('/movies/trending/'),
  getFeatured: () => client.get('/movies/featured/'),
  getGenres: () => client.get('/movies/genres/'),
  addReview: (id, data) => client.post(`/movies/${id}/review/`, data),
  getHistory: () => client.get('/movies/history/'),
  updateHistory: (data) => client.post('/movies/history/', data),
};

export const authAPI = {
  login: (data) => client.post('/auth/login/', data),
  register: (data) => client.post('/auth/register/', data),
  getProfile: () => client.get('/auth/profile/'),
  updateProfile: (data) => client.patch('/auth/profile/', data),
  getWatchlist: () => client.get('/auth/watchlist/'),
  toggleWatchlist: (movie_id) => client.post('/auth/watchlist/', { movie_id }),
};

export const adminAPI = {
  getStats: () => client.get('/movies/admin/stats/'),
  getMovies: (params) => client.get('/movies/admin/list/', { params }),
  syncMovies: (data) => client.post('/movies/admin/sync/', data),
  updateMovie: (id, data) => client.patch(`/movies/admin/${id}/`, data),
  deleteMovie: (id) => client.delete(`/movies/admin/${id}/`),
  getUsers: () => client.get('/auth/admin/users/'),
  updateUser: (id, data) => client.patch(`/auth/admin/users/${id}/`, data),
  getVideoSources: (movieId) => client.get(`/movies/admin/${movieId}/sources/`),
  addVideoSource: (movieId, data) => client.post(`/movies/admin/${movieId}/sources/`, data),
};
