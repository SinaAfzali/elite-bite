from django.urls import path
from .views import SubmitFoodReviewView

urlpatterns = [
    path('submit', SubmitFoodReviewView.as_view(), name='review-submit'),

]
