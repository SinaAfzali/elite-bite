from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from Area.models import Area
from restaurant.models import Restaurant
from restaurant.services import getRestaurantByRestaurantManagerId
from services.Authorization import require_authorization_manager
from services.ImageValidation import ImageValidation
from services.UploadImages import uploadImage
from restaurantManager.services import getRestaurantManager
from FoodCategory.models import FoodCategory
from .models import Food


class AddFoodView(APIView):
    @require_authorization_manager
    def post(self, request):
        data = request.data.copy()
        image_file = request.FILES.get("image")

        if image_file:
            valid_image = ImageValidation(image_file)
            if not valid_image['valid']:
                return Response({
                    "status": "error",
                    "message": valid_image['message'],
                }, status=status.HTTP_400_BAD_REQUEST)

        required_fields = ["name", "price", "category"]
        for field in required_fields:
            if not data.get(field):
                return Response({
                    "status": "error",
                    "message": f"فیلد {field} الزامی است."
                }, status=status.HTTP_400_BAD_REQUEST)

        try:
            category = FoodCategory.objects.get(id=data["category"])
        except FoodCategory.DoesNotExist:
            return Response({
                "status": "error",
                "message": "دسته‌بندی مورد نظر یافت نشد."
            }, status=status.HTTP_400_BAD_REQUEST)

        restaurant = getRestaurantByRestaurantManagerId(restaurantManagerId=getRestaurantManager(request).id)
        if not restaurant:
            return Response({
                "status": "error",
                "message": "شما هنوز رستوران ثبت نکرده‌اید."
            }, status=status.HTTP_400_BAD_REQUEST)

        randomName = uploadImage(image_file)

        food = Food.objects.create(
            name=data["name"].strip(),
            price=int(data["price"]),
            description=data.get("description", "").strip(),
            image='/public/images/' + randomName,
            category=category,
            isAvailable=bool(data.get("isAvailable", False)),
            restaurant=restaurant
        )

        return Response({
            "status": "success",
            "message": "غذا با موفقیت اضافه شد.",
            "foodId": food.id
        }, status=status.HTTP_201_CREATED)


class GetFoodsByAreaView(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')
        if not areaId:
            return Response({
                "status": "error",
                "message": "منطقه خود را مشخص کنید"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            area = Area.objects.get(id=int(areaId))
        except Area.DoesNotExist:
            return Response({
                "status": "error",
                "message": "منطقه انتخابی توسط سامانه پوشش داده نمیشود."
            }, status=status.HTTP_404_NOT_FOUND)

        restaurants = Restaurant.objects.filter(areas=area)
        foods = Food.objects.filter(restaurant__in=restaurants, isAvailable=True)

        foodList = []
        for food in foods:
            foodList.append({
                "id": food.id,
                "name": food.name,
                "price": food.price,
                "description": food.description,
                "image": food.image,
                "categoryId": food.category.id,
                "categoryName": food.category.name,
                "restaurantId": food.restaurant.id,
                "restaurantName": food.restaurant.name,
                "isAvailable": food.isAvailable,
                "ratingScore": float(food.ratingScore),
                "ratingTotalVoters": food.ratingTotalVoters,
            })

        return Response({
            "status": "success",
            "message": "غذاهای رستوران های نزدیک جستجو شد.",
            "data": foodList
        }, status=status.HTTP_200_OK)