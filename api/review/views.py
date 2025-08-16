# views.py
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from Order.models import OrderItem
from customer.services import getCustomer
from food.models import Food
from services.Authorization import require_authorization_customer
from .models import FoodReview

class SubmitFoodReviewView(APIView):
    @require_authorization_customer
    def post(self, request):
        customer = getCustomer(request)
        food_id = request.data.get('foodId')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not food_id or not rating:
            return Response({"message": "شناسه غذا و امتیاز الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rating = int(rating)
        except ValueError:
            return Response({"message": "امتیاز باید یک عدد صحیح باشد."}, status=status.HTTP_400_BAD_REQUEST)

        if rating < 1 or rating > 5:
            return Response({"message": "امتیاز باید بین 1 تا 5 باشد."}, status=status.HTTP_400_BAD_REQUEST)

        if len(comment) > 500:
            return Response({"message": "متن نظر نمی‌تواند بیش از ۵۰۰ کاراکتر باشد."}, status=status.HTTP_400_BAD_REQUEST)

        has_purchased = OrderItem.objects.filter(
            food_id=food_id,
            order__customer=customer,
            order__status='completed'
        ).exists()

        if not has_purchased:
            return Response({"message": "شما قبلاً این غذا را نخریده‌اید یا سفارش شما تکمیل نشده است."},
                            status=status.HTTP_403_FORBIDDEN)

        food = get_object_or_404(Food, id=food_id)

        FoodReview.objects.create(
            food=food,
            customer=customer,
            rating=rating,
            comment=comment
        )

        food.ratingScore = round((food.ratingScore * food.ratingTotalVoters + int(rating)) / (food.ratingTotalVoters + 1), 2)
        food.ratingTotalVoters = food.ratingTotalVoters + 1
        food.save()

        return Response({"message": "نظر شما با موفقیت ثبت شد."}, status=status.HTTP_201_CREATED)
