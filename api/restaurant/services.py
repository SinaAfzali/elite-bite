from restaurant.models import Restaurant


def getRestaurantByRestaurantManagerId(restaurantManagerId):
    restaurant = Restaurant.objects.filter(owner=restaurantManagerId)
    return restaurant