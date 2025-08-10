from django.urls import path
from .views import GetAllCitiesView

urlpatterns = [
    path('all', GetAllCitiesView.as_view(), name='cities-all'),
]
