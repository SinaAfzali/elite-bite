from django.urls import path
from .views import GetAllFoodCategoriesView

urlpatterns = [
    path('all', GetAllFoodCategoriesView.as_view(), name='all-category'),
]