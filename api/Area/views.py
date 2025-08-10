from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from City.models import City

class GetAreasByCityIdView(APIView):
    def post(self, request):
        cityId = request.data['cityId']
        try:
            city = City.objects.get(id=int(cityId))
        except City.DoesNotExist:
            return Response({
                "status": "error",
                "message": "شهر مورد نظر یافت نشد."
            }, status=status().HTTP_404_NOT_FOUND)

        areas = city.areas.all().values("id", "name")
        return Response({
            "status": "success",
            "city": {"id": city.id, "name": city.name},
            "areas": list(areas)
        }, status=status.HTTP_200_OK)
