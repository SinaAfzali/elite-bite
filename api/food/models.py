from django.db import models
from restaurant.models import Restaurant

class Food(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='food_images/', blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    isAvailable = models.BooleanField(default=True)
    ratingScore = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    ratingTotalVoters = models.PositiveIntegerField(default=0)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='foods', null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
