from django.urls import path
from .views import GetAllFoodCategory

urlpatterns = [
    path('all', GetAllFoodCategory.as_view(), name='all-category'),
]