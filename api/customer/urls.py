from django.urls import path
from .views import SignupVerifyView, SignupCodeView, LoginCodeView, LoginVerifyView, CheckLoginView, GetInformation

urlpatterns = [
    path('signup/code', SignupCodeView.as_view(), name='customer-signup-code'),
    path('signup/verify', SignupVerifyView.as_view(), name='customer-signup-verify'),
    path('login/code', LoginCodeView.as_view(), name='customer-login-code'),
    path('login/verify', LoginVerifyView.as_view(), name='customer-login-verify'),
    path('check/login', CheckLoginView.as_view(), name='customer-check-login'),
    path('info', GetInformation.as_view(), name='customer-info'),
]
