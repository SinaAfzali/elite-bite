from django.contrib import admin
from .models import Customer

@admin.register(Customer)
class RestaurantManagerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'isVerified')
    list_filter = ('isVerified',)
    search_fields = ('firstName', 'lastName', 'email')
    list_editable = ('isVerified',)
    ordering = ('-isVerified', 'lastName')

    def full_name(self, obj):
        return f"{obj.firstName} {obj.lastName}"
    full_name.short_description = "نام کامل"
