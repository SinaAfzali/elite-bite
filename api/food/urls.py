from django.urls import path
from .views import AddFoodView, GetFoodsByAreaView

urlpatterns = [
    path('add', AddFoodView.as_view(), name='food-add'),
    path('nearest', GetFoodsByAreaView.as_view(), name='food-add'),

] 