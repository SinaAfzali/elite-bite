from django.urls import path
from .views import AddRestaurantView, GetNearestRestaurant

urlpatterns = [
    path('add', AddRestaurantView.as_view(), name='restaurant-add'),
    path('nearest', GetNearestRestaurant.as_view(), name='restaurant-nearest'),
]
