from django.db import models

from FoodCategory.models import FoodCategory
from restaurant.models import Restaurant


class Food(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)
    category = models.ForeignKey(FoodCategory, on_delete=models.CASCADE)
    isAvailable = models.BooleanField(default=False)
    ratingScore = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    ratingTotalVoters = models.PositiveIntegerField(default=0)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
