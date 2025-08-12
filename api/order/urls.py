from django.urls import path
from .views import (
    CreateOrderView,
    ListCustomerOrdersView,
    OrderDetailView,
    UpdateOrderStatusView
)

urlpatterns = [
    path('create/', CreateOrderView.as_view(), name='create_order'),
    path('my-orders/', ListCustomerOrdersView.as_view(), name='list_customer_orders'),
    path('<int:order_id>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:order_id>/status/', UpdateOrderStatusView.as_view(), name='update_order_status'),
]
