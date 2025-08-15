from django.contrib import admin
from .models import Food

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'name', 'price', 'category', 'isAvailable',
        'ratingScore', 'ratingTotalVoters', 'restaurant', 'createdAt', 'updatedAt'
    )
    list_filter = ('isAvailable', 'category', 'restaurant__city')
    search_fields = ('name', 'category__name', 'restaurant__name', 'restaurant__city__name')
    ordering = ('-createdAt',)
    list_editable = ('isAvailable',)
    date_hierarchy = 'createdAt'
