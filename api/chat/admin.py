from django.contrib import admin
from .models import ChatRoom, ChatMessage


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "restaurant", "created_at")
    list_filter = ("created_at", "restaurant")
    search_fields = ("customer__email", "restaurant__name")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    # نمایش پیام‌های داخل روم به صورت Inline
    class ChatMessageInline(admin.TabularInline):
        model = ChatMessage
        extra = 0
        readonly_fields = ("sender", "message", "timestamp", "is_read")

    inlines = [ChatMessageInline]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "room", "sender", "short_message", "timestamp", "is_read")
    list_filter = ("sender", "is_read", "timestamp")
    search_fields = ("message", "room__customer__email", "room__restaurant__name")
    ordering = ("-timestamp",)
    readonly_fields = ("timestamp",)

    def short_message(self, obj):
        return obj.message[:50] + ("..." if len(obj.message) > 50 else "")
    short_message.short_description = "Message"
