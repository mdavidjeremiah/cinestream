import requests
from django.conf import settings
from .models import Movie, Genre, VideoSource

TMDB_BASE = settings.TMDB_BASE_URL
API_KEY = settings.TMDB_API_KEY

def get_headers():
    return {"Authorization": f"Bearer {API_KEY}"} if API_KEY.startswith('ey') else {}

def fetch_tmdb(endpoint, params=None):
    url = f"{TMDB_BASE}{endpoint}"
    if params is None:
        params = {}
    params['api_key'] = API_KEY
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"TMDB Error: {e}")
        return None

def sync_genres():
    data = fetch_tmdb('/genre/movie/list')
    if data:
        for g in data.get('genres', []):
            Genre.objects.update_or_create(tmdb_id=g['id'], defaults={'name': g['name']})

def import_movie(tmdb_data):
    genres_data = tmdb_data.get('genre_ids', []) or [g['id'] for g in tmdb_data.get('genres', [])]
    release = tmdb_data.get('release_date') or None
    if release == '':
        release = None

    movie, created = Movie.objects.update_or_create(
        tmdb_id=tmdb_data['id'],
        defaults={
            'title': tmdb_data.get('title', ''),
            'overview': tmdb_data.get('overview', ''),
            'release_date': release,
            'poster_path': tmdb_data.get('poster_path', '') or '',
            'backdrop_path': tmdb_data.get('backdrop_path', '') or '',
            'vote_average': tmdb_data.get('vote_average', 0),
            'vote_count': tmdb_data.get('vote_count', 0),
            'popularity': tmdb_data.get('popularity', 0),
            'runtime': tmdb_data.get('runtime'),
            'language': tmdb_data.get('original_language', ''),
        }
    )
    for genre_id in genres_data:
        genre = Genre.objects.filter(tmdb_id=genre_id).first()
        if genre:
            movie.genres.add(genre)

    # Add demo video sources with free embeds
    if created:
        for quality in ['1080p', '720p', '480p']:
            VideoSource.objects.get_or_create(
                movie=movie,
                quality=quality,
                defaults={
                    'embed_url': f'https://vidsrc.to/embed/movie/{tmdb_data["id"]}',
                    'download_url': f'https://dl.vidsrc.vip/movie/{tmdb_data["id"]}',
                    'file_size': {'1080p': '2.1 GB', '720p': '1.2 GB', '480p': '650 MB'}.get(quality, ''),
                }
            )
    return movie

def fetch_popular_movies(page=1):
    data = fetch_tmdb('/movie/popular', {'page': page})
    return data

def fetch_trending(time_window='week'):
    data = fetch_tmdb(f'/trending/movie/{time_window}')
    return data

def fetch_movie_detail(tmdb_id):
    return fetch_tmdb(f'/movie/{tmdb_id}')

def search_movies(query, page=1):
    return fetch_tmdb('/search/movie', {'query': query, 'page': page})

def fetch_by_genre(genre_id, page=1):
    return fetch_tmdb('/discover/movie', {'with_genres': genre_id, 'page': page, 'sort_by': 'popularity.desc'})
