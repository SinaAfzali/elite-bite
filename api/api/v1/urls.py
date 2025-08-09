from django.urls import path, include

urlpatterns=[
    path("customer/", include("customer.urls")),
    path("restaurantManager/", include("restaurantManager.urls")),
    path("restaurant/", include("restaurant.urls")),
    path("food/", include("food.urls")),
]