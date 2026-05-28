from rest_framework import serializers
from .models import Movie, Genre, VideoSource, Review, WatchHistory

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'tmdb_id', 'name']

class VideoSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoSource
        fields = ['id', 'quality', 'embed_url', 'download_url', 'file_size', 'is_active']

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.URLField(source='user.avatar', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'username', 'avatar', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

class MovieListSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    poster_url = serializers.ReadOnlyField()

    class Meta:
        model = Movie
        fields = ['id', 'tmdb_id', 'title', 'poster_url', 'vote_average', 
                  'release_date', 'genres', 'language', 'is_featured']

class MovieDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    video_sources = VideoSourceSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    poster_url = serializers.ReadOnlyField()
    backdrop_url = serializers.ReadOnlyField()
    review_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ['id', 'tmdb_id', 'title', 'overview', 'release_date', 'poster_url',
                  'backdrop_url', 'vote_average', 'vote_count', 'popularity', 'runtime',
                  'genres', 'language', 'is_featured', 'video_sources', 'reviews',
                  'review_count', 'avg_rating', 'created_at']

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

class WatchHistorySerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)

    class Meta:
        model = WatchHistory
        fields = ['id', 'movie', 'watched_at', 'progress']
