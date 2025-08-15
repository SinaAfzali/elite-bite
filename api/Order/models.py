from django.db import models
from customer.models import Customer
from restaurant.models import Restaurant


class Order(models.Model):
    STATUS_CHOICES = [
        ('waitingForPayment', 'در انتظار پرداخت'),
        ('processing', 'در حال پردازش'),
        ('preparing', 'در حال آماده سازی'),
        ('delivering', 'در حال ارسال'),
        ('completed', 'تکمیل شده'),
        ('canceled', 'لغو شده'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waitingForPayment')
    paymentCode = models.CharField(max_length=10, unique=True)
    totalPrice = models.PositiveIntegerField(default=0)
    tax = models.PositiveIntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    foodName = models.CharField(max_length=100)
    foodPrice = models.PositiveIntegerField()
    foodDescription = models.TextField(blank=True, null=True)
    foodCategory = models.IntegerField()
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.foodName} x {self.quantity}"
