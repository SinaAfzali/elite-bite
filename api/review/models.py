# models.py (در همان اپ مربوط به Food یا اپ جدا مثل reviews)
from django.db import models
from customer.models import Customer
from food.models import Food  # مسیر را با توجه به پروژه تغییر بده

class FoodReview(models.Model):
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='food_reviews')
    rating = models.PositiveSmallIntegerField()  # عدد بین 1 تا 5
    comment = models.TextField(blank=True, null=True, max_length=500)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer} - {self.food} ({self.rating})"
