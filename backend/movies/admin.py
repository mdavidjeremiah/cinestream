from django.contrib import admin
from .models import Movie, Genre, VideoSource, Review, WatchHistory

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'vote_average', 'release_date', 'is_featured', 'popularity']
    list_filter = ['is_featured', 'language', 'genres']
    search_fields = ['title', 'overview']
    list_editable = ['is_featured']
    filter_horizontal = ['genres']

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name', 'tmdb_id']

@admin.register(VideoSource)
class VideoSourceAdmin(admin.ModelAdmin):
    list_display = ['movie', 'quality', 'is_active']
    list_filter = ['quality', 'is_active']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'movie', 'rating', 'created_at']
