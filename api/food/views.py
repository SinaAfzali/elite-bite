from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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
            image=randomName,
            category=category,
            isAvailable=bool(data.get("isAvailable", False)),
            restaurant=restaurant
        )

        return Response({
            "status": "success",
            "message": "غذا با موفقیت اضافه شد.",
            "foodId": food.id
        }, status=status.HTTP_201_CREATED)
