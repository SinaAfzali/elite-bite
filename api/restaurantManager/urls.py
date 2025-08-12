from django.urls import path
from .views import SignupVerifyView, SignupCodeView, LoginCodeView, LoginVerifyView, CheckLoginView, GetInformation

urlpatterns = [
    path('signup/code', SignupCodeView.as_view(), name='restaurantManager-signup-code'),
    path('signup/verify', SignupVerifyView.as_view(), name='restaurantManager-signup-verify'),
    path('login/code', LoginCodeView.as_view(), name='restaurantManager-login-code'),
    path('login/verify', LoginVerifyView.as_view(), name='restaurantManager-login-verify'),
    path('check/login', CheckLoginView.as_view(), name='restaurantManager-check-login'),
    path('info', GetInformation.as_view(), name='restaurantManager-get-information'),
]
