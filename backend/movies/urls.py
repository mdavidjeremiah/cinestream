from django.urls import path
from . import views

urlpatterns = [
    path('', views.MovieListView.as_view(), name='movie-list'),
    path('<int:pk>/', views.MovieDetailView.as_view(), name='movie-detail'),
    path('featured/', views.FeaturedMoviesView.as_view(), name='featured'),
    path('trending/', views.TrendingView.as_view(), name='trending'),
    path('genres/', views.GenreListView.as_view(), name='genres'),
    path('search/', views.SearchView.as_view(), name='search'),
    path('<int:pk>/review/', views.ReviewView.as_view(), name='review'),
    path('history/', views.WatchHistoryView.as_view(), name='watch-history'),
    path('admin/sync/', views.SyncMoviesView.as_view(), name='admin-sync'),
    path('admin/list/', views.AdminMovieView.as_view(), name='admin-movies'),
    path('admin/<int:pk>/', views.AdminMovieDetailView.as_view(), name='admin-movie-detail'),
    path('admin/<int:movie_id>/sources/', views.AdminVideoSourceView.as_view(), name='admin-sources'),
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
]
