from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Food
from restaurant.models import Restaurant

# Create your views here.

class AddFoodView(APIView):
    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()
        price = data.get('price')
        description = data.get('description', '').strip()
        category = data.get('category', '').strip()
        isAvailable = data.get('isAvailable', True)
        restaurant_id = data.get('restaurant')
        image = request.FILES.get('image')

        # Validation
        if not name:
            return Response({'status': 'error', 'message': 'نام غذا الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)
        if not price:
            return Response({'status': 'error', 'message': 'قیمت غذا الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            price = float(price)
        except ValueError:
            return Response({'status': 'error', 'message': 'قیمت باید عدد باشد.'}, status=status.HTTP_400_BAD_REQUEST)
        restaurant = None
        if restaurant_id:
            try:
                restaurant = Restaurant.objects.get(id=restaurant_id)
            except Restaurant.DoesNotExist:
                return Response({'status': 'error', 'message': 'رستوران یافت نشد.'}, status=status.HTTP_400_BAD_REQUEST)

        food = Food.objects.create(
            name=name,
            price=price,
            description=description,
            category=category,
            isAvailable=isAvailable,
            ratingScore=ratingScore,
            ratingTotalVoters=ratingTotalVoters,
            restaurant=restaurant,
            image=image
        )
        return Response({'status': 'success', 'message': 'غذا با موفقیت اضافه شد.', 'foodId': food.id}, status=status.HTTP_201_CREATED)
