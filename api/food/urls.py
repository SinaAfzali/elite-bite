from django.urls import path
from .views import AddFoodView, GetFoodsByAreaView, FilterFoodsByPrice, FilterFoodsByRating, FilterFoodsByCategory, \
    GetFoodDetails, DeleteFood, EditFoodView

urlpatterns = [
    path('add', AddFoodView.as_view(), name='food-add'),
    path('edit', EditFoodView.as_view(), name='food-edit'),
    path('delete', DeleteFood.as_view(), name='food-delete'),
    path('nearest', GetFoodsByAreaView.as_view(), name='food-add'),
    path('filter/rating', FilterFoodsByRating.as_view(), name='food-filter-by-rating'),
    path('filter/price', FilterFoodsByPrice.as_view(), name='food-filter-by-price'),
    path('filter/category', FilterFoodsByCategory.as_view(), name='food-filter-by-category'),
    path('details', GetFoodDetails.as_view(), name='food-details'),
]