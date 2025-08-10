from django.db import models
from City.models import City

class Area(models.Model):
    name = models.CharField(max_length=100)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="areas")

    def __str__(self):
        return f"{self.name} - {self.city.name}"
