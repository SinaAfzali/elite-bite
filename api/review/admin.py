from django.contrib import admin
from .models import FoodReview


@admin.register(FoodReview)
class FoodReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "food", "customer", "rating", "short_comment", "createdAt")
    list_filter = ("rating", "createdAt")
    search_fields = ("food__name", "customer__email", "comment")
    readonly_fields = ("createdAt",)
    ordering = ("-createdAt",)

    def short_comment(self, obj):
        return (obj.comment[:40] + "...") if obj.comment and len(obj.comment) > 40 else obj.comment
    short_comment.short_description = "نظر مشتری"

    fieldsets = (
        ("اطلاعات اصلی", {
            "fields": ("food", "customer", "rating", "comment")
        }),
        ("زمان", {
            "fields": ("createdAt",)
        }),
    )
