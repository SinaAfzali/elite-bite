from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Cart, CartItem
from food.models import Food
from customer.services import getCustomer
from food.serializer import FoodSerializer


def get_cart_data(cart):
    """برگرداندن اطلاعات کامل سبد خرید"""
    items = CartItem.objects.select_related('food', 'food__category').filter(cart=cart)
    total_price = 0
    foods_data = []

    for item in items:
        food_data = FoodSerializer(item.food).data
        food_data['quantity'] = item.quantity
        foods_data.append(food_data)
        total_price += item.food.price * item.quantity

    return {
        "foods": foods_data,
        "tax": int(total_price * 0.10),
        "price": total_price,
        "totalPrice": int(total_price * 1.10)
    }


class CartAddFoodView(APIView):
    def post(self, request):
        customer = getCustomer(request)
        if not customer:
            return Response(
                {"status": "error", "message": "مشتری وارد نشده است."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        food_id = request.data.get('foodId')
        if not food_id:
            return Response(
                {"status": "error", "message": "پارامتر foodId الزامی است."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            food = Food.objects.get(id=food_id)
        except Food.DoesNotExist:
            return Response(
                {"status": "not_found", "message": "غذا یافت نشد."},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            cart, _ = Cart.objects.get_or_create(customer=customer)
            cart_item, created = CartItem.objects.get_or_create(cart=cart, food=food)
            if not created:
                cart_item.quantity += 1
                cart_item.save()

        return Response(
            {
                "status": "success",
                "message": f"{food.name} به سبد خرید اضافه شد.",
                "data": get_cart_data(cart)
            },
            status=status.HTTP_200_OK
        )


class CartRemoveFoodView(APIView):
    def post(self, request):
        customer = getCustomer(request)
        if not customer:
            return Response(
                {"status": "error", "message": "مشتری وارد نشده است."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        food_id = request.data.get('foodId')
        if not food_id:
            return Response(
                {"status": "error", "message": "پارامتر foodId الزامی است."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            food = Food.objects.get(id=food_id)
        except Food.DoesNotExist:
            return Response(
                {"status": "not_found", "message": "غذا یافت نشد."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            cart = Cart.objects.get(customer=customer)
            cart_item = CartItem.objects.get(cart=cart, food=food)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response(
                {"status": "error", "message": "این غذا در سبد خرید وجود ندارد."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            if cart_item.quantity > 1:
                cart_item.quantity -= 1
                cart_item.save()
            else:
                cart_item.delete()

        return Response(
            {
                "status": "success",
                "message": f"{food.name} از سبد خرید حذف شد.",
                "data": get_cart_data(cart)
            },
            status=status.HTTP_200_OK
        )


class CartListView(APIView):
    def get(self, request):
        customer = getCustomer(request)
        if not customer:
            return Response(
                {"status": "error", "message": "مشتری وارد نشده است."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        cart, _ = Cart.objects.get_or_create(customer=customer)

        return Response(
            {
                "status": "success",
                "message": "لیست سبد خرید دریافت شد.",
                "data": get_cart_data(cart)
            },
            status=status.HTTP_200_OK
        )
