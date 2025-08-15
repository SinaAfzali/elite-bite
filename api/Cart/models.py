from django.db import models
from customer.models import Customer
from food.models import Food

class Cart(models.Model):
    customer = models.OneToOneField(
        Customer, on_delete=models.CASCADE, related_name='cart'
    )
    foods = models.ManyToManyField(Food, through='CartItem', related_name='carts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.customer.email}"



class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'food')

    def __str__(self):
        return f"{self.quantity} × {self.food.name} (cart #{self.cart.id})"
