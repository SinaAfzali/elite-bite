from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ("foodName", "foodPrice", "quantity", "foodCategory")
    readonly_fields = ("foodName", "foodPrice", "foodCategory")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "restaurant", "status", "totalPrice", "createdAt", "updatedAt")
    list_filter = ("status", "restaurant")
    search_fields = ("customer__email", "restaurant__name")
    readonly_fields = ("createdAt", "updatedAt", "paymentCode")
    ordering = ("-createdAt",)
    inlines = [OrderItemInline]

    fieldsets = (
        ("اطلاعات سفارش", {
            "fields": ("customer", "restaurant", "status", "paymentCode")
        }),
        ("مالی", {
            "fields": ("totalPrice", "tax")
        }),
        ("زمان‌ها", {
            "fields": ("createdAt", "updatedAt")
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "foodName", "foodPrice", "quantity", "foodCategory")
    search_fields = ("foodName", "order__customer__email")
    list_filter = ("foodCategory",)
    readonly_fields = ("foodName", "foodPrice", "foodDescription", "foodCategory")
