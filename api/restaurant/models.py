from django.db import models

from City.models import City
from restaurantManager.models import RestaurantManager

class Restaurant(models.Model):
    owner = models.OneToOneField(RestaurantManager, on_delete=models.CASCADE, related_name="restaurant")
    # اطلاعات عمومی
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.CharField(max_length=255, blank=True, null=True)
    registrationDate = models.DateTimeField(auto_now_add=True)
    isActive = models.BooleanField(default=False)
    # اطلاعات تماس و مکان
    address = models.TextField()
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    areas = models.CharField(max_length=100)
    areasPrices = models.CharField(max_length=100)
    phoneNumber = models.CharField(max_length=20)
    contactEmail = models.EmailField(blank=True, null=True)
    startWorkHour = models.IntegerField(default=0, blank=True, null=True)
    endWorkHour = models.IntegerField(default=0, blank=True, null=True)
    # تنظیمات ارسال
    deliveryFeeBase = models.DecimalField(max_digits=7, decimal_places=2, default=0.0)
    freeDeliveryThreshold = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    # مالی
    bankAccountNumber = models.CharField(max_length=50, blank=True, null=True)
    commissionRate = models.DecimalField(max_digits=4, decimal_places=2, default=5.00)
    # امتیازدهی
    ratingAvg = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    ratingCount = models.PositiveIntegerField(default=0)
    # تایید و امنیت
    isVerified = models.BooleanField(default=False)
    def __str__(self):
        return self.name
