from django.urls import path
from .views import GetSuggestedFoods

urlpatterns = [
    path('foods', GetSuggestedFoods.as_view(), name='suggestion-foods'),

]
