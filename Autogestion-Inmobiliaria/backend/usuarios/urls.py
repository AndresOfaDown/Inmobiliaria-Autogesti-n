from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegistroView,
    CustomTokenObtainPairView,
    VerifyEmailView,
    UserProfileView,
    LogoutView,
)

urlpatterns = [
    path('registro/', RegistroView.as_view(), name='registro'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
