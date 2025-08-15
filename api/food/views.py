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
        elif not restaurant[0].isVerified:
            return Response({
                "status": "error",
                "message": "رستوران شما به تایید ادمین نرسیده است. بنابراین نمیتوانید غذا ثبت کنید."
            }, status=status.HTTP_400_BAD_REQUEST)

        randomName = uploadImage(image_file)

        food = Food.objects.create(
            name=data["name"].strip(),
            price=int(data["price"]),
            description=data.get("description", "").strip(),
            image='/images/' + randomName,
            category=category,
            isAvailable=bool(data.get("isAvailable", False)),
            restaurant=restaurant[0]
        )

        return Response({
            "status": "success",
            "message": "غذا با موفقیت اضافه شد.",
            "foodId": food.id
        }, status=status.HTTP_201_CREATED)


class EditFoodView(APIView):
    @require_authorization_manager
    def post(self, request):
        data = request.data.copy()
        food_id = data.get("foodId")
        if not food_id:
            return Response({
                "status": "error",
                "message": "پارامتر foodId الزامی است."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            food = Food.objects.select_related('restaurant').get(id=food_id)
        except Food.DoesNotExist:
            return Response({
                "status": "error",
                "message": "غذا یافت نشد."
            }, status=status.HTTP_404_NOT_FOUND)

        manager = getRestaurantManager(request)
        if food.restaurant.owner != manager:
            return Response({
                "status": "error",
                "message": "این غذا متعلق به رستوران شما نیست."
            }, status=status.HTTP_403_FORBIDDEN)

        # ویرایش فیلدها در صورت ارسال شدن
        if "name" in data:
            food.name = data["name"].strip()
        if "price" in data:
            try:
                food.price = int(data["price"])
            except ValueError:
                return Response({
                    "status": "error",
                    "message": "مقدار قیمت معتبر نیست."
                }, status=status.HTTP_400_BAD_REQUEST)
        if "description" in data:
            food.description = data["description"].strip()
        if "category" in data:
            try:
                category = FoodCategory.objects.get(id=data["category"])
                food.category = category
            except FoodCategory.DoesNotExist:
                return Response({
                    "status": "error",
                    "message": "دسته‌بندی مورد نظر یافت نشد."
                }, status=status.HTTP_400_BAD_REQUEST)
        if "isAvailable" in data:
            food.isAvailable = bool(data.get("isAvailable"))

        # آپلود تصویر جدید در صورت ارسال
        image_file = request.FILES.get("image")
        if image_file:
            valid_image = ImageValidation(image_file)
            if not valid_image['valid']:
                return Response({
                    "status": "error",
                    "message": valid_image['message'],
                }, status=status.HTTP_400_BAD_REQUEST)
            randomName = uploadImage(image_file)
            food.image = '/public/images/' + randomName

        food.save()

        return Response({
            "status": "success",
            "message": "غذا با موفقیت ویرایش شد.",
            "foodId": food.id
        }, status=status.HTTP_200_OK)


class DeleteFood(APIView):
    @require_authorization_manager
    def post(self, request):
        food_id = request.data.get("foodId")
        if not food_id:
            return Response(
                {'status': 'error', 'message': 'پارامتر foodId الزامی است.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        manager = getRestaurantManager(request)
        if not manager:
            return Response(
                {'status': 'error', 'message': 'احراز هویت انجام نشده است.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            food = Food.objects.select_related('restaurant').get(id=food_id)
        except Food.DoesNotExist:
            return Response(
                {'status': 'error', 'message': 'غذا یافت نشد.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if food.restaurant.owner != manager:
            return Response(
                {'status': 'error', 'message': 'این غذا متعلق به رستوران شما نیست.'},
                status=status.HTTP_403_FORBIDDEN
            )

        food.delete()
        return Response(
            {'status': 'success', 'message': 'غذا با موفقیت حذف شد.'},
            status=status.HTTP_200_OK
        )


class GetFoodsByAreaView(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')

        try:
            if not areaId:
                foods = Food.objects.all()
            else:
                area = Area.objects.get(id=int(areaId))
                restaurants = Restaurant.objects.filter(areas=area)
                foods = Food.objects.filter(restaurant__in=restaurants, isAvailable=True)
        except Area.DoesNotExist:
            return Response({
                "status": "error",
                "message": "منطقه انتخابی توسط سامانه پوشش داده نمیشود."
            }, status=status.HTTP_404_NOT_FOUND)

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


class FilterFoodsByRating(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')

        foods = Food.objects.filter(isAvailable=True)
        if areaId:
            try:
                area = Area.objects.get(id=int(areaId))
                restaurants = Restaurant.objects.filter(areas=area)
                foods = foods.filter(restaurant__in=restaurants)
            except Area.DoesNotExist:
                # اگر منطقه یافت نشد، روی همه غذاها کار کن
                pass

        foods = foods.order_by('-ratingScore')[:100]

        data = []
        for food in foods:
            data.append({
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
            "message": "غذاهای برتر بر اساس امتیاز جستجو شدند.",
            "data": data
        }, status=status.HTTP_200_OK)


class FilterFoodsByCategory(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')
        categoryId = request.data.get('categoryId')

        if not categoryId:
            return Response({
                "status": "error",
                "message": "آیدی دسته‌بندی غذا را وارد کنید."
            }, status=status.HTTP_400_BAD_REQUEST)

        foods = Food.objects.filter(isAvailable=True, category_id=categoryId)
        if areaId:
            try:
                area = Area.objects.get(id=int(areaId))
                restaurants = Restaurant.objects.filter(areas=area)
                foods = foods.filter(restaurant__in=restaurants)
            except Area.DoesNotExist:
                # اگر منطقه یافت نشد، روی همه غذاها فیلتر دسته‌بندی بزن
                pass

        data = []
        for food in foods:
            data.append({
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
            "message": "غذاهای دسته‌بندی شده جستجو شدند.",
            "data": data
        }, status=status.HTTP_200_OK)


class FilterFoodsByPrice(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')
        priceOrder = request.data.get('priceOrder', 'asc')  # پیش‌فرض صعودی
        minPrice = request.data.get('minPrice')
        maxPrice = request.data.get('maxPrice')

        foods = Food.objects.filter(isAvailable=True)

        if areaId:
            try:
                area = Area.objects.get(id=int(areaId))
                restaurants = Restaurant.objects.filter(areas=area)
                foods = foods.filter(restaurant__in=restaurants)
            except Area.DoesNotExist:
                pass

        if minPrice is not None:
            foods = foods.filter(price__gte=minPrice)
        if maxPrice is not None:
            foods = foods.filter(price__lte=maxPrice)

        if priceOrder == "desc":
            foods = foods.order_by("price")
        else:
            foods = foods.order_by("price")

        data = []
        for food in foods:
            data.append({
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
            "message": "غذاها بر اساس بازه قیمت جستجو شدند.",
            "data": data
        }, status=status.HTTP_200_OK)


class GetFoodDetails(APIView):
    def post(self, request):
        food_id = request.data.get("foodId")
        if not food_id:
            return Response({
                "status": "error",
                "message": "پارامتر foodId الزامی است."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            food = Food.objects.select_related('category', 'restaurant').get(id=food_id)
        except Food.DoesNotExist:
            return Response({
                "status": "error",
                "message": "غذا یافت نشد."
            }, status=status.HTTP_404_NOT_FOUND)

        data = {
            "id": food.id,
            "name": food.name,
            "price": food.price,
            "description": food.description,
            "image": food.image,
            "category": {
                "id": food.category.id,
                "name": food.category.name
            } if food.category else None,
            "isAvailable": food.isAvailable,
            "ratingScore": float(food.ratingScore),
            "ratingTotalVoters": food.ratingTotalVoters,
            "restaurant": {
                "id": food.restaurant.id if food.restaurant else None,
                "name": food.restaurant.name if food.restaurant else None
            }
        }

        return Response({
            "status": "success",
            "message": "اطلاعات غذا ارسال شد.",
            "data": data
        }, status=status.HTTP_200_OK)


