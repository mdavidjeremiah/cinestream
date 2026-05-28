from django.db import models

class Genre(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Movie(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=500)
    overview = models.TextField(blank=True)
    release_date = models.DateField(null=True, blank=True)
    poster_path = models.CharField(max_length=500, blank=True)
    backdrop_path = models.CharField(max_length=500, blank=True)
    vote_average = models.FloatField(default=0)
    vote_count = models.IntegerField(default=0)
    popularity = models.FloatField(default=0)
    runtime = models.IntegerField(null=True, blank=True)
    genres = models.ManyToManyField(Genre, blank=True)
    language = models.CharField(max_length=10, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-popularity']

    def __str__(self):
        return self.title

    @property
    def poster_url(self):
        if self.poster_path:
            return f"https://image.tmdb.org/t/p/w500{self.poster_path}"
        return None

    @property
    def backdrop_url(self):
        if self.backdrop_path:
            return f"https://image.tmdb.org/t/p/original{self.backdrop_path}"
        return None

class VideoSource(models.Model):
    QUALITY_CHOICES = [
        ('4K', '4K Ultra HD'),
        ('1080p', '1080p Full HD'),
        ('720p', '720p HD'),
        ('480p', '480p SD'),
        ('360p', '360p'),
    ]
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='video_sources')
    quality = models.CharField(max_length=10, choices=QUALITY_CHOICES)
    embed_url = models.URLField(max_length=1000)
    download_url = models.URLField(max_length=1000, blank=True)
    file_size = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['movie', 'quality']

    def __str__(self):
        return f"{self.movie.title} - {self.quality}"

class WatchHistory(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='watch_history')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    watched_at = models.DateTimeField(auto_now=True)
    progress = models.IntegerField(default=0)

    class Meta:
        unique_together = ['user', 'movie']
        ordering = ['-watched_at']

class Review(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='reviews')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'movie']
