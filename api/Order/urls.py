from django.urls import path
from .views import (
    CreateOrderView,
    ConfirmPaymentView,
    UpdateOrderStatusView,
    GetLastOrderView, GetOrderByIdView
)

urlpatterns = [
    path('add', CreateOrderView.as_view(), name='createOrder'),
    path('payment', ConfirmPaymentView.as_view(), name='confirmPayment'),
    path('changeStatus', UpdateOrderStatusView.as_view(), name='updateOrderStatus'),
    path('last', GetLastOrderView.as_view(), name='getLastOrder'),
    path('get', GetOrderByIdView.as_view(), name='getOrderById'),

]
