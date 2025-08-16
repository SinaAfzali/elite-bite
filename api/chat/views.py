from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from chat.models import ChatRoom, ChatMessage
from customer.services import getCustomer
from restaurant.models import Restaurant
from restaurantManager.services import getRestaurantManager
from services.Authorization import require_authorization_customer, require_authorization_manager


class SendMessageView(APIView):
    @require_authorization_customer
    def post(self, request):
        customer = getCustomer(request)
        restaurantId = request.data.get("restaurantId")
        message = request.data.get("message")

        if not restaurantId or not message:
            return Response({"status":"error","message":"restaurantId و message الزامی است."}, status=400)

        restaurant = get_object_or_404(Restaurant, id=restaurantId)
        room = ChatRoom.objects.filter(restaurant=restaurant, customer=customer).first()
        if not room:
            room = ChatRoom.objects.create(restaurant=restaurant, customer=customer)
        msg = ChatMessage.objects.create(room=room, sender="customer", message=message)

        return Response({"status":"success","message":"پیام ارسال شد.","data":{"id":msg.id,"message":msg.message}}, status=201)


class GetMessagesView(APIView):
    @require_authorization_customer
    def post(self, request):
        customer = getCustomer(request)
        restaurantId = request.data.get("restaurantId")
        if not restaurantId:
            return Response({"status":"error","message":"restaurantId  الزامی است."}, status=400)
        restaurant = get_object_or_404(Restaurant, id=restaurantId)
        room = get_object_or_404(ChatRoom, customer=customer, restaurant=restaurant)
        messages = room.messages.order_by("timestamp")
        return Response({
            "status":"success",
            "data":[{"id":m.id,"sender":m.sender,"message":m.message,"timestamp":m.timestamp} for m in messages]
        })


class GetAllChatForRestaurantView(APIView):
    @require_authorization_manager
    def get(self, request):
        manager = getRestaurantManager(request)
        restaurant = Restaurant.objects.filter(owner=manager).first()
        chats = ChatRoom.objects.filter(restaurant=restaurant)
        result = []
        for chat in chats:
            messages = chat.messages.order_by("timestamp")
            result.append({
                "chatId": chat.id,
                "customer": chat.customer.firstName + ' ' + chat.customer.lastName,
                "messages":[{"id":m.id,"sender":m.sender,"message":m.message,"timestamp":m.timestamp} for m in messages]
            })
        return Response({
            "status":"success",
            "data": result
        })



class SendMessageManagerView(APIView):
    @require_authorization_manager
    def post(self, request):
        chatId = request.data.get("chatId")
        message = request.data.get("message")

        if not chatId or not message:
            return Response({"status":"error","message":"chatId و message الزامی است."}, status=400)

        room = ChatRoom.objects.filter(restaurant=chatId).first()
        if not room:
            return Response({"status":"error","message":"چت با این شناسه یافت نشد!"}, status=400)
        msg = ChatMessage.objects.create(room=room, sender="restaurant", message=message)

        return Response({"status":"success","message":"پیام ارسال شد.","data":{"id":msg.id,"message":msg.message}}, status=201)
