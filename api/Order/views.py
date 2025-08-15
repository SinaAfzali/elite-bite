import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

import restaurant
from utilities.sendEmailFunctions.utilities import SendPaymentCode, SendPaymentSuccess, SendStatusOrder
from restaurantManager.services import getRestaurantManager
from services.Authorization import require_authorization_manager, require_authorization_customer
from .models import Order, OrderItem
from Cart.models import Cart, CartItem
from food.serializer import FoodSerializer
from customer.services import getCustomer

def getCartData(cart):
    items = CartItem.objects.select_related('food').filter(cart=cart)
    total_price = 0
    foods_data = []
    for item in items:
        food_data = FoodSerializer(item.food).data
        food_data['quantity'] = item.quantity
        foods_data.append(food_data)
        total_price += item.food.price * item.quantity
    return foods_data, total_price, int(total_price*0.10), int(total_price*1.10)

# -----------------------------
# 1️⃣ ایجاد سفارش و خالی کردن سبد خرید
# -----------------------------
class CreateOrderView(APIView):
    @require_authorization_customer
    def get(self, request):
        try:
            customer = getCustomer(request)
            cart = Cart.objects.get(customer=customer)
        except Cart.DoesNotExist:
            return Response({"status": "error", "message": "سبد خرید شما خالی است."}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = CartItem.objects.filter(cart=cart)
        if not cart_items.exists():
            return Response({"status": "error", "message": "سبد خرید شما خالی است."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = Order.objects.create(
                restaurant=cart[0].food.restaurant,
                customer=customer,
                status="waitingForPayment",
                paymentCode=random.randint(10000, 99999)
            )

            totalPrice = 0
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    foodName=item.food.name,
                    foodPrice=item.food.price,
                    foodDescription=item.food.description,
                    foodCategory=item.food.category.id,
                    quantity=item.quantity
                )
                totalPrice += item.food.price * item.quantity
            cart_items.delete()  # خالی کردن سبد خرید
            order.totalPrice = int(totalPrice * 1.1)
            order.tax = int(totalPrice * 0.10)
            order.save()

        SendPaymentCode(customer.email, str(order.paymentCode))

        return Response({
            "status": "success",
            "message": "سفارش ایجاد شد و در انتظار پرداخت است.",
            "data": {
                "orderId": order.id,
                "paymentCode": order.paymentCode,
                "status": order.status,
                "price": int(totalPrice),
                "totalPrice": int(totalPrice * 1.1),
                "tax": int(totalPrice * 0.10),
                "items": [item.to_dict() for item in order.items.all()]
            }
        }, status=status.HTTP_201_CREATED)

# -----------------------------
# 2️⃣ تأیید پرداخت توسط مشتری
# -----------------------------
class ConfirmPaymentView(APIView):
    @require_authorization_customer
    def post(self, request):
        code = request.data.get("paymentCode")
        if not code:
            return Response({"status": "error", "message": "paymentCode الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = getCustomer(request)
            order = Order.objects.get(customer=customer, paymentCode=code, status="waitingForPayment")
        except Order.DoesNotExist:
            return Response({"status": "error", "message": "کد پرداخت نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = "processing"
        order.save()
        SendPaymentSuccess(getCustomer(request).email, str(order.id))
        return Response({"status": "success", "message": "پرداخت تأیید شد و سفارش در حال پردازش است.", "data": {"orderId": order.id, "status": order.status}})

# -----------------------------
# 3️⃣ تغییر وضعیت سفارش توسط restaurantManager
# -----------------------------
class UpdateOrderStatusView(APIView):
    @require_authorization_manager
    def post(self, request):
        order_id = request.data.get("orderId")
        new_status = request.data.get("status")
        if not order_id or not new_status:
            return Response({"status": "error", "message": "orderId و status الزامی هستند."}, status=status.HTTP_400_BAD_REQUEST)

        status_list = [
            "waitingForPayment",
            "processing",
            "preparing",
            "delivering",
            "completed",
            "canceled"
        ]

        if new_status not in status_list:
            return Response({"status": "error", "message": "وضعیت جدید نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"status": "error", "message": "سفارش یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        manager = getRestaurantManager(request)
        # چک کردن اینکه سفارش مربوط به رستوران مدیر باشد
        if order.restaurant != manager.restaurant:
            return Response({"status": "error", "message": "این سفارش مربوط به رستوران شما نیست."}, status=status.HTTP_403_FORBIDDEN)

        order.status = new_status
        order.save()
        SendStatusOrder(order.customer.email, str(order.id) ,new_status)
        return Response({"status": "success", "message": f"وضعیت سفارش به {new_status} تغییر کرد.", "data": {"orderId": order.id, "status": order.status}})

# -----------------------------
# 4️⃣ دریافت آخرین سفارش مشتری
# -----------------------------
class GetLastOrderView(APIView):
    @require_authorization_customer
    def get(self, request):
        try:
            customer = getCustomer(request)
            order = Order.objects.filter(customer=customer).latest('createdAt')
        except Order.DoesNotExist:
            return Response({"status": "error", "message": "سفارشی برای این مشتری یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "status": "success",
            "message": "آخرین سفارش دریافت شد.",
            "data": {
                "orderId": order.id,
                "status": order.status,
                "totalPrice": order.totalPrice,
                "tax": order.tax,
                "items": [item.to_dict() for item in order.items.all()]
            }
        })


class GetOrderByIdView(APIView):
    @require_authorization_customer
    def post(self, request):
        try:
            customer = getCustomer(request)
            orderId = request.data.get("orderId")
            order = Order.objects.filter(customer=customer, id=orderId)
        except Order.DoesNotExist:
            return Response({"status": "error", "message": "سفارشی برای این مشتری یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "status": "success",
            "message": "سفارش دریافت شد.",
            "data": {
                "orderId": order[0].id,
                "status": order[0].status,
                "totalPrice": order[0].totalPrice,
                "tax": order[0].tax,
                "items": [item.to_dict() for item in order[0].items.all()]
            }
        })