# 🎬 CineStream — Full-Stack Movie Streaming App

A complete movie streaming web application with a dark cinematic UI, built with **Django REST Framework** + **React** + **PostgreSQL**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎥 Movie Streaming | Embedded player via vidsrc.to (free, no API key needed) |
| 📺 Multiple Quality | 4K / 1080p / 720p / 480p / 360p selector per movie |
| ⬇️ Downloads | Per-quality download links for each movie |
| 🔐 Authentication | JWT-based login/register with token refresh |
| 👤 User Profiles | Avatar, bio, role (admin/user), premium flag |
| 🔖 Watchlist | Save & remove movies per user |
| ⏱ Watch History | Track which movies a user has watched |
| ⭐ Reviews | Rate (1–5 stars) and comment on movies |
| 🎬 TMDB Integration | Sync popular/trending movies from TMDB |
| 🛡 Admin Dashboard | Manage movies, users, sync content, view stats |
| 🔍 Browse & Filter | Search, filter by genre, sort by popularity/rating/date |
| 📱 Responsive | Works on mobile and desktop |

---

## 🗂 Project Structure

```
cinestream/
├── backend/              # Django REST API
│   ├── accounts/         # User auth, profiles, watchlist
│   ├── movies/           # Movies, genres, video sources, reviews
│   ├── cinestream/       # Django settings & URLs
│   ├── requirements.txt
│   ├── .env              # Environment variables
│   └── setup.py          # Quick setup script
├── frontend/             # React App
│   ├── src/
│   │   ├── api/          # Axios client & API calls
│   │   ├── components/   # Navbar, Footer, MovieCard, VideoPlayer
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Home, Browse, Detail, Auth, Admin, User
│   │   └── styles/       # Global CSS
│   └── Dockerfile
└── docker-compose.yml    # One-command startup
```

---

## 🚀 Quick Start

### Option A — Docker (Easiest)

```bash
# 1. Clone and enter the project
cd cinestream

# 2. (Optional) Set your TMDB API key
export TMDB_API_KEY=your_key_here

# 3. Start everything
docker-compose up --build

# App: http://localhost:3000
# API: http://localhost:8000/api
```

---

### Option B — Manual Setup

#### 1. PostgreSQL

```bash
# Install PostgreSQL then:
psql -U postgres -c "CREATE DATABASE cinestream_db;"
```

#### 2. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Edit .env — add your TMDB_API_KEY
nano .env

# Run setup (migrations + admin user)
python setup.py

# Or manually:
python manage.py migrate
python manage.py createsuperuser

# Start server
python manage.py runserver
# → http://localhost:8000
```

#### 3. Frontend

```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

---

## 🔑 Environment Variables (`backend/.env`)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=cinestream_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
TMDB_API_KEY=your_tmdb_api_key_here   ← Get free at themoviedb.org
```

---

## 🎬 Getting Movies (TMDB API)

1. Register free at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to Settings → API → Request API Key (free)
3. Add to `backend/.env`: `TMDB_API_KEY=your_key`
4. Log into the admin dashboard → **Sync Content** → click **Sync Popular** or **Sync Trending**

Movies are automatically assigned video sources from **vidsrc.to** (free, no registration needed).

---

## 👤 Default Admin Account

After running `python setup.py`:

| Field | Value |
|---|---|
| Email | `admin@cinestream.com` |
| Password | `Admin1234!` |
| Role | admin |

Access the admin dashboard at `/admin` after logging in.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, returns JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET/PATCH | `/api/auth/profile/` | Get/update own profile |
| GET/POST | `/api/auth/watchlist/` | Get/toggle watchlist |

### Movies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/movies/` | List movies (supports `?search=&genre=&sort=`) |
| GET | `/api/movies/<id>/` | Movie detail with sources & reviews |
| GET | `/api/movies/trending/` | Trending movies (from TMDB) |
| GET | `/api/movies/search/?q=` | Search movies |
| GET | `/api/movies/genres/` | List all genres |
| POST | `/api/movies/<id>/review/` | Add/update review |

### Admin (requires admin token)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/movies/admin/stats/` | Dashboard stats |
| POST | `/api/movies/admin/sync/` | Sync from TMDB |
| GET/DELETE | `/api/movies/admin/<id>/` | Manage movie |
| GET/PATCH | `/api/auth/admin/users/<id>/` | Manage user |

---

## 🎨 UI Screens

- **Home** — Hero banner, trending row, popular row, top rated row
- **Browse** — Grid with genre filter, sort, pagination
- **Movie Detail** — Backdrop hero, info, tabbed player/reviews
- **Video Player** — Embedded iframe + quality selector dropdown + download menu
- **Login / Register** — Branded auth forms with validation
- **Watchlist / History** — User saved content
- **Profile** — Edit username & bio
- **Admin Dashboard** — Stats overview, movie table, user table, sync panel

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Backend | Django 4.2, Django REST Framework, SimpleJWT |
| Database | PostgreSQL (psycopg2) |
| Frontend | React 18, React Router v6 |
| Icons | lucide-react |
| HTTP | Axios |
| Movie Data | TMDB API (free) |
| Video | vidsrc.to embed (free) |
| Fonts | Bebas Neue + DM Sans (Google Fonts) |
| Deployment | Docker + docker-compose |

---

## ⚠️ Legal Note

This project is for **educational purposes only**. Video embeds point to third-party services. Ensure compliance with copyright laws in your jurisdiction before deploying publicly.

Movie metadata is provided by [The Movie Database (TMDB)](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.
