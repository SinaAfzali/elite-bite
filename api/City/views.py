from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import City

class GetAllCitiesView(APIView):
    def get(self, request):
        cities = City.objects.all().values("id", "name")
        return Response({
            "status": "success",
            "data": list(cities)
        }, status=status.HTTP_200_OK)
