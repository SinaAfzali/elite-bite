from django.db import models
from customer.models import Customer
from restaurant.models import Restaurant
from food.models import Food

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در حال پردازش'),
        ('sending', 'در حال ارسال'),
        ('rejected', 'رد شده'),
        ('delivered', 'تحویل داده شده'),
        ('canceled', 'لغو شده'),
    ]
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    totalPrice = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.restaurant.name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} × {self.food.name}"