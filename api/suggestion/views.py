from django.db import models
from rest_framework.response import Response
from rest_framework.views import APIView, status
from food.models import Food
from Order.models import OrderItem
from customer.services import getCustomer
from services.Authorization import require_authorization_customer


def get_similar_foods(customer):
    # 1. سفارش‌های تکمیل شده
    completed_orders = OrderItem.objects.filter(
        order__customer=customer,
        order__status='completed'
    )

    if not completed_orders.exists():
        return []

    # 2. جمع‌آوری غذاهای خریداری شده
    purchased_food_ids = completed_orders.values_list('food_id', flat=True).distinct()
    purchased_foods = Food.objects.filter(id__in=purchased_food_ids)

    # 3. دسته‌بندی‌ها و رستوران‌های خریداری شده
    categories = purchased_foods.values_list('category', flat=True).distinct()
    restaurants = purchased_foods.values_list('restaurant', flat=True).distinct()

    # 4. پیدا کردن غذاهای مشابه
    similar_foods = Food.objects.filter(
        models.Q(category__in=categories) | models.Q(restaurant__in=restaurants)
    ).exclude(id__in=purchased_food_ids).distinct().order_by('-ratingScore')[:3]

    # 5. آماده‌سازی خروجی
    result = [{
        "id": food.id,
        "name": food.name,
        "description": food.description,
        "restaurant": food.restaurant.name if food.restaurant else None
    } for food in similar_foods]

    return result


class GetSuggestedFoods(APIView):
    @require_authorization_customer
    def get(self, request):
        customer = getCustomer(request)
        foods = get_similar_foods(customer)
        return Response({'status': 'success', 'message': 'لیست غذا هایی که به سلیقه شما نزدیک است را ارسال کردیم.','data': foods},  status=status.HTTP_200_OK)