from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from food.models import Food
from customer.models import Customer
from restaurant.models import Restaurant
from django.shortcuts import get_object_or_404
from django.db import transaction

class CreateOrderView(APIView):
    def post(self, request):
        customer_id = request.data.get('customerId')
        restaurant_id = request.data.get('restaurantId')
        items = request.data.get('items', [])

        if not customer_id or not restaurant_id or not items:
            return Response({"status": "error", "message": "اطلاعات سفارش ناقص است."},
                            status=status.HTTP_400_BAD_REQUEST)

        customer = get_object_or_404(Customer, id=customer_id)
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)

        with transaction.atomic():
            total_price = 0
            order = Order.objects.create(
                restaurant=restaurant,
                customer=customer,
                totalPrice=0
            )

            for item in items:
                food = get_object_or_404(Food, id=item.get('foodId'), restaurant=restaurant)
                quantity = int(item.get('quantity', 1))
                price = food.price
                total = price * quantity
                total_price += total

                OrderItem.objects.create(
                    order=order,
                    food=food,
                    quantity=quantity,
                    price=price,
                    total=total
                )

            order.totalPrice = total_price
            order.save()

        return Response({
            "status": "success",
            "message": "سفارش با موفقیت ثبت شد.",
            "orderId": order.id
        }, status=status.HTTP_201_CREATED)


class ListCustomerOrdersView(APIView):
    def get(self, request):
        customer_id = request.query_params.get('customerId')
        if not customer_id:
            return Response({"status": "error", "message": "شناسه مشتری الزامی است."},
                            status=status.HTTP_400_BAD_REQUEST)

        orders = Order.objects.filter(customer_id=customer_id).order_by('-createdAt')
        data = []
        for order in orders:
            data.append({
                "id": order.id,
                "restaurant": order.restaurant.name,
                "totalPrice": order.totalPrice,
                "status": order.status,
                "createdAt": order.createdAt,
            })

        return Response({
            "status": "success",
            "data": data
        }, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        items_data = []
        for item in order.items.all():
            items_data.append({
                "food": item.food.name,
                "quantity": item.quantity,
                "price": item.price,
                "total": item.total
            })

        return Response({
            "status": "success",
            "data": {
                "id": order.id,
                "restaurant": order.restaurant.name,
                "customer": f"{order.customer.firstName} {order.customer.lastName}",
                "totalPrice": order.totalPrice,
                "status": order.status,
                "createdAt": order.createdAt,
                "items": items_data
            }
        }, status=status.HTTP_200_OK)


class UpdateOrderStatusView(APIView):
    def patch(self, request, order_id):
        status_choice = request.data.get('status')
        if status_choice not in dict(Order.STATUS_CHOICES):
            return Response({"status": "error", "message": "وضعیت سفارش نامعتبر است."},
                            status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, id=order_id)
        order.status = status_choice
        order.save()

        return Response({
            "status": "success",
            "message": "وضعیت سفارش با موفقیت به‌روزرسانی شد."
        }, status=status.HTTP_200_OK)
