from django.urls import path
from .views import AddRestaurantView, GetNearestRestaurant, GetRestaurantsByRating, GetRestaurantsByPrice, \
    GetRestaurantsByFoodCategory, GetRestaurantInfo, GetRestaurantDetails, EditRestaurantView

urlpatterns = [
    path('add', AddRestaurantView.as_view(), name='restaurant-add'),
    path('edit', EditRestaurantView.as_view(), name='restaurant-edit'),
    path('nearest', GetNearestRestaurant.as_view(), name='restaurant-nearest'),
    path('filter/rating', GetRestaurantsByRating.as_view(), name='restaurant-filter-by-rating'),
    path('filter/price', GetRestaurantsByPrice.as_view(), name='restaurant-filter-by-price'),
    path('filter/foodCategory', GetRestaurantsByFoodCategory.as_view(), name='restaurant-filter-by-foodCategory'),
    path('info', GetRestaurantInfo.as_view(), name='restaurant-info'),
    path('details', GetRestaurantDetails.as_view(), name='restaurant-details'),
]
