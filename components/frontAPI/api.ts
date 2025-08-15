const BASE_URL = 'http://localhost:8000';

export async function postJson<T extends Record<string, unknown>, R>(
    endpoint: string,
    data: T
): Promise<R> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    return response.json();
}

export async function getData<R>(endpoint: string): Promise<R> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return response.json();
}

export async function postFormData<R>(
    endpoint: string,
    data: FormData
): Promise<R> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: data,
    });
    return response.json();
}

export async function deleteData<R>(endpoint: string): Promise<R> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return response.json();
}

interface ApiResponse<T = never> {
    status: string;
    message?: string;
    statusCode: number;
    data?: T;
}

interface City {
    id: number;
    name: string;
}

interface Area {
    id: number;
    name: string;
}

interface AreaResponse {
    message: string;
    status: string;
    city: City;
    areas: Area[];
}

interface Restaurant {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    startWorkHour: number;
    endWorkHour: number;
    ratingAvg: number;
    ratingCount: number;
    cityName: string;
    cityId: number;
    areas: { id: number; name: string }[];
    deliveryFeeBase?: number;
    minFoodPrice?: number;
}

interface FoodItem {
    id: number;
    name: string;
    price: number;
    description?: string;
    image?: string;
    categoryId: number;
    categoryName: string;
    restaurantId: number;
    restaurantName: string;
    isAvailable: boolean;
    ratingScore: number;
    ratingTotalVoters: number;
}

interface FoodCategory {
    id: number;
    name: string;
}

class API {
    static customerSignupCode(data: {
        firstName: string;
        lastName: string;
        email: string;
    }) {
        return postJson<
            { firstName: string; lastName: string; email: string },
            ApiResponse
        >('/api/customer/signup/code', data);
    }

    static customerSignupVerify(data: { email: string; code: string }) {
        return postJson<{ email: string; code: string }, ApiResponse>(
            '/api/customer/signup/verify',
            data
        );
    }

    static restaurantSignupCode(data: {
        firstName: string;
        lastName: string;
        email: string;
    }) {
        return postJson<
            { firstName: string; lastName: string; email: string },
            ApiResponse
        >('/api/restaurantManager/signup/code', data);
    }

    static restaurantSignupVerify(data: { email: string; code: string }) {
        return postJson<{ email: string; code: string }, ApiResponse>(
            '/api/restaurantManager/signup/verify',
            data
        );
    }

    static customerLoginCode(data: { email: string }) {
        return postJson<{ email: string }, ApiResponse>(
            '/api/customer/login/code',
            data
        );
    }

    static customerLoginVerify(data: { email: string; code: string }) {
        return postJson<{ email: string; code: string }, ApiResponse>(
            '/api/customer/login/verify',
            data
        );
    }

    static restaurantLoginCode(data: { email: string }) {
        return postJson<{ email: string }, ApiResponse>(
            '/api/restaurantManager/login/code',
            data
        );
    }

    static restaurantLoginVerify(data: { email: string; code: string }) {
        return postJson<{ email: string; code: string }, ApiResponse>(
            '/api/restaurantManager/login/verify',
            data
        );
    }

    static getAllCities() {
        return getData<ApiResponse<City[]>>('/api/city/all');
    }

    static getAreasByCityId(data: { cityId: number }) {
        return postJson<{ cityId: number }, AreaResponse>(
            '/api/area/selectById',
            data
        );
    }

    static restaurantAdd(data: FormData) {
        return postFormData<ApiResponse>('/api/restaurant/add', data);
    }

    static getRestaurant() {
        return getData<ApiResponse>('/api/restaurant/get');
    }

    static updateRestaurant(data: FormData) {
        return postFormData<ApiResponse>('/api/restaurant/update', data);
    }

    static addFood(data: FormData) {
        return postFormData<ApiResponse>('/api/food/add', data);
    }

    static getFoods() {
        return getData<ApiResponse>('/api/food/get');
    }

    static getOrders() {
        return getData<ApiResponse>('/api/orders');
    }

    static getNearestRestaurants(data: { areaId: number }) {
        return postJson<{ areaId: number }, ApiResponse<Restaurant[]>>(
            '/api/restaurant/nearest',
            data
        );
    }

    static getNearestFoods(data: { areaId: number }) {
        return postJson<{ areaId: number }, ApiResponse<FoodItem[]>>(
            '/api/food/nearest',
            data
        );
    }

    static getFoodCategories() {
        return getData<ApiResponse<FoodCategory[]>>('/api/categories');
    }

    static filterFoodsByCategory(data: { areaId?: number; categoryId: number }) {
        return postJson<{ areaId?: number; categoryId: number }, ApiResponse<FoodItem[]>>(
            '/api/food/filter/category',
            data
        );
    }

    static filterRestaurantsByCategory(data: { areaId?: number; foodCategoryId: number }) {
        return postJson<{ areaId?: number; foodCategoryId: number }, ApiResponse<Restaurant[]>>(
            '/api/restaurant/filter/foodCategory',
            data
        );
    }

    static filterRestaurantsByPrice(data: { areaId?: number; minPrice?: number; maxPrice?: number; priceOrder?: 'asc' | 'desc' }) {
        return postJson<{ areaId?: number; minPrice?: number; maxPrice?: number; priceOrder?: 'asc' | 'desc' }, ApiResponse<Restaurant[]>>(
            '/api/restaurant/filter/price',
            data
        );
    }

    static filterRestaurantsByRating(data: { areaId?: number }) {
        return postJson<{ areaId?: number }, ApiResponse<Restaurant[]>>(
            '/api/restaurant/filter/rating',
            data
        );
    }

    static checkRestaurantManagerLogin = '/api/restaurantManager/check-login';
    static checkCustomerLogin = '/api/customer/check-login';
}

export default API;