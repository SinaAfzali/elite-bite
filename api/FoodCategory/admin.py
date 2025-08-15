from django.contrib import admin
from .models import FoodCategory

@admin.register(FoodCategory)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    ordering = ('id', )
