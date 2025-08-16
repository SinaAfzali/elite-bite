from django.urls import path
from .views import SendMessageView, GetMessagesView, GetAllChatForRestaurantView, SendMessageManagerView

urlpatterns = [
    path('send', SendMessageView.as_view(), name='send-message'),
    path('restaurant/send', SendMessageManagerView.as_view(), name='restaurant-send-messages'),
    path('get', GetMessagesView.as_view(), name='get-messages'),
    path('restaurant/get', GetAllChatForRestaurantView.as_view(), name='restaurant-get-messages'),

]
