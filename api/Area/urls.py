from django.urls import path
from .views import GetAreasByCityIdView

urlpatterns = [
    path('selectById', GetAreasByCityIdView.as_view(), name='area-by-city-id'),
]
