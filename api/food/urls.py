from django.urls import path
from .views import AddFoodView

urlpatterns = [
    path('add', AddFoodView.as_view(), name='food-add'),
] 