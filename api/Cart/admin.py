from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    fields = ("food", "quantity")
    readonly_fields = ()
    autocomplete_fields = ("food",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "total_items", "created_at", "updated_at")
    search_fields = ("customer__email",)
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)
    inlines = [CartItemInline]

    def total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())
    total_items.short_description = "Total Items"


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "food", "quantity")
    list_filter = ("food",)
    search_fields = ("cart__customer__email", "food__name")
    autocomplete_fields = ("cart", "food")
