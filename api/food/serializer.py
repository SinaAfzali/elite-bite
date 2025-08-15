from rest_framework import serializers
from .models import Food

class FoodSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Food
        fields = ['id', 'name', 'price', 'description', 'image', 'category', 'category_name']
