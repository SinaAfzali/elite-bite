from restaurant.models import Restaurant


def getRestaurantByRestaurantManagerId(restaurantManagerId):
    restaurant = Restaurant.objects.get(owner=restaurantManagerId)
    return restaurant