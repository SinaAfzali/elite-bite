from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Min, Max, Q
from Area.models import Area
from City.models import City
from food.models import Food
from restaurantManager.services import getRestaurantManager
from services.Authorization import require_authorization_manager
from services.ImageValidation import ImageValidation
from services.UploadImages import uploadImage
from .models import Restaurant
from .validator import validateRestaurantData

class AddRestaurantView(APIView):
    @require_authorization_manager
    def post(self, request):
        image_file = request.FILES.get("image")
        # image validation
        validImage = ImageValidation(image_file)
        if not validImage['valid']:
            return Response({
                "status": "error",
                "message": validImage['message'],
            }, status=status.HTTP_400_BAD_REQUEST)

        # validation
        data = request.data.copy()
        validation_error = validateRestaurantData(data)
        if validation_error:
            return Response({
                "status": "error",
                "message": validation_error
            }, status=status.HTTP_400_BAD_REQUEST)

        if Restaurant.objects.filter(owner=getRestaurantManager(request)).exists():
            return Response({
                "status": "error",
                "message": "شما قبلاً یک رستوران ثبت کرده‌اید."
            }, status=status.HTTP_400_BAD_REQUEST)

        # upload image
        randomName = uploadImage(image_file)

        mArea = []
        for area in data.getlist('areas[]'):
            if Area.objects.get(id=int(area)):
                mArea.append(Area.objects.get(id=int(area)))

        restaurant = Restaurant.objects.create(
            owner=getRestaurantManager(request),
            name=data['name'].strip(),
            description=data.get('description', '').strip(),
            image='/public/images/' + randomName,
            address=data['address'].strip(),
            city=City.objects.get(id=int(data['city'])),
            phoneNumber=data['phoneNumber'].strip(),
            contactEmail=data['contactEmail'].strip(),
            startWorkHour=int(data['startWorkHour']),
            endWorkHour=int(data['endWorkHour']),
            deliveryFeeBase=float(data['deliveryFeeBase']),
            freeDeliveryThreshold=data.get('freeDeliveryThreshold'),
            bankAccountNumber=data['bankAccountNumber'].strip(),
            commissionRate=5.00
        )
        restaurant.areas.set(mArea)
        return Response({
            "status": "success",
            "message": "رستوران با موفقیت اضافه شد.",
            "restaurantId": restaurant.id
        }, status=status.HTTP_201_CREATED)


class GetNearestRestaurant(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')

        if not areaId:
            selectedRestaurants = Restaurant.objects.all()[:100]
        else:
            try:
                area = Area.objects.get(id=int(areaId))
                selectedRestaurants = Restaurant.objects.filter(areas=area)
            except Area.DoesNotExist:
                selectedRestaurants = Restaurant.objects.all()[:100]

        data = []
        for r in selectedRestaurants:
            areas = r.areas.all()
            data.append({
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "isActive": r.isActive,
                "startWorkHour": r.startWorkHour,
                "endWorkHour": r.endWorkHour,
                "ratingAvg": r.ratingAvg,
                "ratingCount": r.ratingCount,
                "cityName": r.city.name,
                "cityId": r.city.id,
                "areas": [
                    {"id": a.id, "name": a.name} for a in areas
                ]
            })

        return Response({
            "status": "success",
            "message": "نزدیک ترین رستوران ها جستجو شد.",
            "data": data
        }, status=status.HTTP_200_OK)


class GetRestaurantsByRating(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')

        if areaId:
            try:
                area = Area.objects.get(id=int(areaId))
                restaurants = Restaurant.objects.filter(areas=area)
            except Area.DoesNotExist:
                restaurants = Restaurant.objects.all()
        else:
            restaurants = Restaurant.objects.all()

        restaurants = restaurants.order_by('-ratingAvg')[:100]

        data = []
        for r in restaurants:
            areas = r.areas.all()
            data.append({
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "isActive": r.isActive,
                "startWorkHour": r.startWorkHour,
                "endWorkHour": r.endWorkHour,
                "ratingAvg": r.ratingAvg,
                "ratingCount": r.ratingCount,
                "cityName": r.city.name,
                "cityId": r.city.id,
                "areas": [{"id": a.id, "name": a.name} for a in areas],
                "deliveryFeeBase": r.deliveryFeeBase
            })

        return Response({
            "status": "success",
            "message": "رستوران‌ها بر اساس امتیاز مرتب شدند.",
            "data": data
        }, status=status.HTTP_200_OK)



class GetRestaurantsByPrice(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')
        priceOrder = request.data.get('priceOrder', 'asc')  # 'asc' یا 'desc'
        minPrice = request.data.get('minPrice')
        maxPrice = request.data.get('maxPrice')

        # فیلتر رستوران‌ها براساس منطقه (اگر ارسال شده)
        if areaId:
            try:
                area = Area.objects.get(id=int(areaId))
                restaurants = Restaurant.objects.filter(areas=area)
            except Area.DoesNotExist:
                # اگر منطقه یافت نشد، روی همه رستوران‌ها ادامه بده
                restaurants = Restaurant.objects.all()
        else:
            restaurants = Restaurant.objects.all()

        # فیلتر غذاها بر اساس قیمت
        food_filter = Q()
        if minPrice is not None:
            try:
                minPrice = float(minPrice)
                food_filter &= Q(price__gte=minPrice)
            except ValueError:
                return Response({
                    "status": "error",
                    "message": "minPrice باید عدد باشد."
                }, status=status.HTTP_400_BAD_REQUEST)
        if maxPrice is not None:
            try:
                maxPrice = float(maxPrice)
                food_filter &= Q(price__lte=maxPrice)
            except ValueError:
                return Response({
                    "status": "error",
                    "message": "maxPrice باید عدد باشد."
                }, status=status.HTTP_400_BAD_REQUEST)

        # فقط رستوران‌هایی که حداقل یک غذا با قیمت در بازه دارند
        restaurants = restaurants.filter(food__isAvailable=True).filter(food_filter).distinct()

        # به ازای هر رستوران کمترین یا بیشترین قیمت غذای داخل بازه را می‌گیریم برای مرتب‌سازی
        if priceOrder == 'desc':
            restaurants = restaurants.annotate(price=Max('food__price')).order_by('-price')
        else:
            restaurants = restaurants.annotate(price=Min('food__price')).order_by('price')

        data = []
        for r in restaurants:
            areas = r.areas.all()
            data.append({
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "isActive": r.isActive,
                "startWorkHour": r.startWorkHour,
                "endWorkHour": r.endWorkHour,
                "ratingAvg": r.ratingAvg,
                "ratingCount": r.ratingCount,
                "cityName": r.city.name,
                "cityId": r.city.id,
                "areas": [{"id": a.id, "name": a.name} for a in areas],
                "minFoodPrice": r.price  # قیمت کمینه یا بیشینه غذای داخل بازه
            })

        return Response({
            "status": "success",
            "message": "رستوران‌ها بر اساس قیمت غذا فیلتر و مرتب شدند.",
            "data": data
        }, status=status.HTTP_200_OK)


class GetRestaurantsByFoodCategory(APIView):
    def post(self, request):
        areaId = request.data.get('areaId')
        foodCategoryId = request.data.get('foodCategoryId')

        if not foodCategoryId:
            return Response({
                "status": "error",
                "message": "آیدی دسته‌بندی غذا ارسال نشده است."
            }, status=status.HTTP_400_BAD_REQUEST)

        if areaId:
            try:
                area = Area.objects.get(id=int(areaId))
                restaurants = Restaurant.objects.filter(areas=area)
            except Area.DoesNotExist:
                restaurants = Restaurant.objects.all()
        else:
            restaurants = Restaurant.objects.all()

        # فیلتر رستوران‌هایی که حداقل یک غذا با این دسته دارند
        restaurants = restaurants.filter(food__category_id=foodCategoryId).distinct()

        data = []
        for r in restaurants:
            areas = r.areas.all()
            data.append({
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "isActive": r.isActive,
                "startWorkHour": r.startWorkHour,
                "endWorkHour": r.endWorkHour,
                "ratingAvg": r.ratingAvg,
                "ratingCount": r.ratingCount,
                "cityName": r.city.name,
                "cityId": r.city.id,
                "areas": [{"id": a.id, "name": a.name} for a in areas],
                "deliveryFeeBase": r.deliveryFeeBase
            })

        return Response({
            "status": "success",
            "message": "رستوران‌ها بر اساس دسته‌بندی غذا فیلتر شدند.",
            "data": data
        }, status=status.HTTP_200_OK)


class GetRestaurantInfo(APIView):
    def get(self, request):
        manager = getRestaurantManager(request)
        if manager:
            restaurant = Restaurant.objects.get(owner=manager.id)
            areas = restaurant.areas.all()
            return Response({'message': 'اطلاعات رستوران ارسال شد.', 'status': 'success',
                             'data': {
                                'name': restaurant.name,
                                 'description': restaurant.description,
                                 'image': restaurant.image,
                                 'registrationDate': restaurant.registrationDate,
                                 'isActive': restaurant.isActive,
                                 'startWorkHour': restaurant.startWorkHour,
                                 'endWorkHour': restaurant.endWorkHour,
                                 'ratingAvg': restaurant.ratingAvg,
                                 'ratingCount': restaurant.ratingCount,
                                 'cityName': restaurant.city.name,
                                 'areas': [{"id": a.id, "name": a.name} for a in areas],
                                 'phoneNumber': restaurant.phoneNumber,
                                 'contactEmail': restaurant.contactEmail,
                                 'isVerified': restaurant.isVerified,
                             }}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'لاگین نیست.', 'status': 'unauthorized'},
                            status=status.HTTP_401_UNAUTHORIZED)


class GetRestaurantWithFoods(APIView):
    def get(self, request, restaurant_id):
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response({
                "status": "error",
                "message": "رستوران یافت نشد."
            }, status=status.HTTP_404_NOT_FOUND)

        # گرفتن غذاهای رستوران
        foods = Food.objects.filter(restaurant=restaurant)

        data = {
            "id": restaurant.id,
            "name": restaurant.name,
            "description": restaurant.description,
            "image": restaurant.image,
            "registrationDate": restaurant.registrationDate,
            "isActive": restaurant.isActive,
            "startWorkHour": restaurant.startWorkHour,
            "endWorkHour": restaurant.endWorkHour,
            "ratingAvg": restaurant.ratingAvg,
            "ratingCount": restaurant.ratingCount,
            "cityName": restaurant.city.name,
            "areas": [{"id": a.id, "name": a.name} for a in restaurant.areas.all()],
            "phoneNumber": restaurant.phoneNumber,
            "contactEmail": restaurant.contactEmail,
            "isVerified": restaurant.isVerified,
            "foods": [
                {
                    "id": f.id,
                    "name": f.name,
                    "price": f.price,
                    "description": f.description,
                    "image": f.image,
                    "categoryId": f.category.id,
                    "categoryName": f.category.name,
                    "isAvailable": f.isAvailable,
                    "ratingScore": f.ratingScore,
                    "ratingTotalVoters": f.ratingTotalVoters
                }
                for f in foods
            ]
        }

        return Response({
            "status": "success",
            "message": "اطلاعات رستوران و لیست غذاها ارسال شد.",
            "data": data
        }, status=status.HTTP_200_OK)