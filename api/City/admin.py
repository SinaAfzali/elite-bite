from django.contrib import admin
from .models import City

@admin.register(City)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')