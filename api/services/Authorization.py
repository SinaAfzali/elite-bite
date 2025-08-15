from functools import wraps
from django.http import JsonResponse

def require_authorization_manager(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        managerData = request.session.get('restaurantManager_login')
        if not managerData:
            return JsonResponse({'error': 'Unauthorized', 'message': 'دسترسی غیرمجاز'}, status=401)
        return view_func(self, request, *args, **kwargs)
    return wrapper


def require_authorization_customer(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        customerData = request.session.get('customer_login')
        if not customerData:
            return JsonResponse({'error': 'Unauthorized', 'message': 'دسترسی غیرمجاز'}, status=401)
        return view_func(self, request, *args, **kwargs)
    return wrapper