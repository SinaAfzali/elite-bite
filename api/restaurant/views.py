from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import restaurant
from Area.models import Area
from City.models import City
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
            return Response({
                "status": "error",
                "message": "لطفا منطقه را مشخص کنید."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            area = Area.objects.get(id=int(areaId))
        except Area.DoesNotExist:
            return Response({
                "status": "error",
                "message": "منطقه ای که انتخاب کردید توسط سامانه پوشش داده نمیشود."
            }, status=status.HTTP_404_NOT_FOUND)

        selectedRestaurants = Restaurant.objects.filter(areas=area)

        data = []
        for r in selectedRestaurants:
            data.append({
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "isActive": r.isActive,
                "startWorkHour":r.startWorkHour,
                "endWorkHour": r.endWorkHour,
                "ratingAvg": r.ratingAvg
            })

        return Response({
            "status": "success",
            "message": "نزدیک ترین رستوران ها جستجو شد.",
            "data": data
        }, status=status.HTTP_200_OK)