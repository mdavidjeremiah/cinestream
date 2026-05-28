from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [('admin', 'Admin'), ('moderator', 'Moderator'), ('user', 'User')]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    avatar = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True)
    is_premium = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    watchlist = models.ManyToManyField('movies.Movie', blank=True, related_name='watchlisted_by')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
