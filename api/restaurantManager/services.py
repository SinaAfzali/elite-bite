from restaurantManager.models import RestaurantManager

def getRestaurantManager(request):
    managerData = request.session.get('restaurantManager_login')
    if managerData:
        return RestaurantManager.objects.get(id=managerData['id'], email=managerData['email'])
    return None
