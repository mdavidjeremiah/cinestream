from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, CustomTokenSerializer, AdminUserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class WatchlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from movies.serializers import MovieListSerializer
        movies = request.user.watchlist.all()
        serializer = MovieListSerializer(movies, many=True)
        return Response(serializer.data)

    def post(self, request):
        from movies.models import Movie
        movie_id = request.data.get('movie_id')
        try:
            movie = Movie.objects.get(id=movie_id)
            if request.user.watchlist.filter(id=movie_id).exists():
                request.user.watchlist.remove(movie)
                return Response({'status': 'removed'})
            else:
                request.user.watchlist.add(movie)
                return Response({'status': 'added'})
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found'}, status=404)

class AdminUsersView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()
