from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FoodCategory

class GetAllFoodCategoriesView(APIView):
    def get(self, request):
        categories = FoodCategory.objects.all().values("id", "name", "description")
        return Response({
            "status": "success",
            "data": list(categories)
        }, status=status.HTTP_200_OK)
