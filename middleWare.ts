import { NextRequest, NextResponse } from 'next/server';
import API, { getData } from '@/components/frontAPI/api';

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    console.log(`Middleware triggered for path: ${url.pathname}`);

    // مسیرهای آزاد (نیازی به لاگین ندارند)
    if (
        url.pathname.startsWith('/sms/verify') ||
        url.pathname.startsWith('/sms/code') ||
        url.pathname === '/' ||
        url.pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    // بررسی دسترسی برای مدیران رستوران
    const authorizationRestaurantManager = async () => {
        try {
            const response = await getData<{ status: string; isAdminLogin: boolean }>(
                API.checkRestaurantManagerLogin
            );
            console.log(`RestaurantManager check-login response:`, response);
            return response.status === 'success' && response.isAdminLogin;
        } catch (error) {
            console.error(`Error in restaurantManager check-login:`, error);
            return false;
        }
    };

    // بررسی دسترسی برای مشتری‌ها
    const authorizationCustomer = async () => {
        try {
            const response = await getData<{ status: string; isCustomerLogin: boolean }>(
                API.checkCustomerLogin
            );
            console.log(`Customer check-login response:`, response);
            return response.status === 'success' && response.isCustomerLogin;
        } catch (error) {
            console.error(`Error in customer check-login:`, error);
            return false;
        }
    };

    // مسیرهای محافظت‌شده
    if (
        url.pathname.startsWith('/desktop/admin') ||
        url.pathname.startsWith('/mobile/admin') ||
        url.pathname.startsWith('/dashboard/restaurant')
    ) {
        const isAuthorized = await authorizationRestaurantManager();
        console.log(`RestaurantManager authorized: ${isAuthorized}`);
        if (!isAuthorized) {
            console.log(`Redirecting to / from ${url.pathname}`);
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    } else if (url.pathname.startsWith('/customer/dashboard')) {
        const isAuthorized = await authorizationCustomer();
        console.log(`Customer authorized: ${isAuthorized}`);
        if (!isAuthorized) {
            console.log(`Redirecting to / from ${url.pathname}`);
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    } else if (url.pathname === '/dashboard') {
        const isRestaurantManager = await authorizationRestaurantManager();
        const isCustomer = await authorizationCustomer();
        console.log(`Dashboard access - RestaurantManager: ${isRestaurantManager}, Customer: ${isCustomer}`);
        if (!isRestaurantManager && !isCustomer) {
            console.log(`Redirecting to / from /dashboard`);
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};