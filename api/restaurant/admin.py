from django.contrib import admin
from .models import Restaurant

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'owner',
        'city',
        'isVerified',
        'isActive',
        'registrationDate'
    )
    list_filter = ('isVerified', 'city', 'isActive')
    search_fields = ('name', 'owner__firstName', 'owner__lastName','description', 'city__name')
    list_editable = ('isVerified',)  # چک‌باکس برای تغییر وضعیت در همان لیست
    ordering = ('-registrationDate',)

    # برای جلوگیری از باز کردن فیلدهایی که تغییرشون از لیست منطقی نیست
    list_display_links = ('name', 'owner')

    # برای اینکه در ویرایش جزئیات هم قابل تغییر باشه
    fieldsets = (
        ('اطلاعات عمومی', {
            'fields': ('name', 'description', 'image', 'isActive', 'isVerified')
        }),
        ('مکان و تماس', {
            'fields': ('address', 'city', 'areas', 'phoneNumber', 'contactEmail')
        }),
        ('ساعت کاری', {
            'fields': ('startWorkHour', 'endWorkHour')
        }),
        ('هزینه ارسال', {
            'fields': ('deliveryFeeBase', 'freeDeliveryThreshold')
        }),
        ('اطلاعات مالی', {
            'fields': ('bankAccountNumber', 'commissionRate')
        }),
    )
