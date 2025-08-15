from django.contrib import admin
from .models import VerificationCode

@admin.register(VerificationCode)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'email', 'sendDate', 'forLogin', 'used', 'role')
    list_filter = ('role', 'used')
    search_fields = ('email', 'code', 'sendDate')
    ordering = ('id', )
