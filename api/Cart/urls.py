from django.urls import path
from .views import CartAddFoodView, CartRemoveFoodView, CartListView

urlpatterns = [
    path('add', CartAddFoodView.as_view(), name='cart-add'),
    path('remove', CartRemoveFoodView.as_view(), name='cart-remove'),
    path('get', CartListView.as_view(), name='cart-list'),
]