from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Avg
from .models import Movie, Genre, VideoSource, Review, WatchHistory
from .serializers import *
from . import tmdb_service

class MovieListView(generics.ListAPIView):
    serializer_class = MovieListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Movie.objects.prefetch_related('genres')
        genre = self.request.query_params.get('genre')
        search = self.request.query_params.get('search')
        sort = self.request.query_params.get('sort', '-popularity')
        year = self.request.query_params.get('year')
        language = self.request.query_params.get('language')

        if genre:
            qs = qs.filter(genres__tmdb_id=genre)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(overview__icontains=search))
        if year:
            qs = qs.filter(release_date__year=year)
        if language:
            qs = qs.filter(language=language)

        valid_sorts = ['-popularity', '-vote_average', '-release_date', 'title', '-created_at']
        if sort in valid_sorts:
            qs = qs.order_by(sort)
        return qs

class MovieDetailView(generics.RetrieveAPIView):
    serializer_class = MovieDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Movie.objects.prefetch_related('genres', 'video_sources', 'reviews__user')

class FeaturedMoviesView(generics.ListAPIView):
    serializer_class = MovieListSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Movie.objects.filter(is_featured=True)[:10]

class TrendingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        data = tmdb_service.fetch_trending()
        if data:
            movies = []
            for item in data.get('results', [])[:10]:
                movie = tmdb_service.import_movie(item)
                movies.append(MovieListSerializer(movie).data)
            return Response({'results': movies})
        return Response({'results': []})

class GenreListView(generics.ListAPIView):
    serializer_class = GenreSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Genre.objects.all().order_by('name')

class SearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        page = request.query_params.get('page', 1)
        if not query:
            return Response({'results': [], 'total': 0})

        # Search local DB first
        local = Movie.objects.filter(Q(title__icontains=query))
        if local.count() < 5:
            # Fetch from TMDB
            data = tmdb_service.search_movies(query, page)
            if data:
                for item in data.get('results', [])[:10]:
                    tmdb_service.import_movie(item)

        results = Movie.objects.filter(Q(title__icontains=query) | Q(overview__icontains=query))
        serializer = MovieListSerializer(results[:20], many=True)
        return Response({'results': serializer.data, 'total': results.count()})

class ReviewView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request, pk):
        movie = Movie.objects.get(pk=pk)
        review, created = Review.objects.update_or_create(
            user=request.user, movie=movie,
            defaults={
                'rating': request.data.get('rating', 5),
                'comment': request.data.get('comment', '')
            }
        )
        return Response(ReviewSerializer(review).data, status=201 if created else 200)

class SyncMoviesView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        sync_type = request.data.get('type', 'popular')
        page = request.data.get('page', 1)
        count = 0

        tmdb_service.sync_genres()

        if sync_type == 'popular':
            data = tmdb_service.fetch_popular_movies(page)
        elif sync_type == 'trending':
            data = tmdb_service.fetch_trending()
        else:
            data = tmdb_service.fetch_popular_movies(page)

        if data:
            for item in data.get('results', []):
                tmdb_service.import_movie(item)
                count += 1

        return Response({'synced': count, 'type': sync_type})

class WatchHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        history = WatchHistory.objects.filter(user=request.user).select_related('movie')[:20]
        return Response(WatchHistorySerializer(history, many=True).data)

    def post(self, request):
        movie_id = request.data.get('movie_id')
        progress = request.data.get('progress', 0)
        movie = Movie.objects.get(pk=movie_id)
        wh, _ = WatchHistory.objects.update_or_create(
            user=request.user, movie=movie,
            defaults={'progress': progress}
        )
        return Response({'status': 'updated'})

class AdminMovieView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = MovieDetailSerializer
    queryset = Movie.objects.all()

class AdminMovieDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = MovieDetailSerializer
    queryset = Movie.objects.all()

class AdminVideoSourceView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = VideoSourceSerializer

    def get_queryset(self):
        movie_id = self.kwargs.get('movie_id')
        return VideoSource.objects.filter(movie_id=movie_id)

    def perform_create(self, serializer):
        movie = Movie.objects.get(pk=self.kwargs['movie_id'])
        serializer.save(movie=movie)

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from accounts.models import User
        total_movies = Movie.objects.count()
        total_users = User.objects.count()
        total_reviews = Review.objects.count()
        featured = Movie.objects.filter(is_featured=True).count()
        top_movies = Movie.objects.order_by('-vote_average')[:5]
        recent_users = User.objects.order_by('-date_joined')[:5]

        return Response({
            'total_movies': total_movies,
            'total_users': total_users,
            'total_reviews': total_reviews,
            'featured_movies': featured,
            'top_movies': MovieListSerializer(top_movies, many=True).data,
            'recent_users': [{'id': u.id, 'username': u.username, 'email': u.email, 'date_joined': u.date_joined} for u in recent_users],
        })
