// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import API, { getData } from '@/components/frontAPI/api';

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    console.log(`Middleware triggered for path: ${url.pathname}`);

    // Free routes (no login required)
    if (
        url.pathname.startsWith('/sms/verify') ||
        url.pathname.startsWith('/sms/code') ||
        url.pathname === '/' ||
        url.pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    // Check restaurant manager authorization
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

    // Check customer authorization
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

    // Protected routes
    if (
        url.pathname.startsWith('/desktop/admin') ||
        url.pathname.startsWith('/mobile/admin') ||
        url.pathname.startsWith('/restaurantManager/restaurant')
    ) {
        const isAuthorized = await authorizationRestaurantManager();
        console.log(`RestaurantManager authorized: ${isAuthorized}`);
        if (!isAuthorized) {
            console.log(`Redirecting to / from ${url.pathname}`);
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    } else if (url.pathname.startsWith('/customer/restaurantManager')) {
        const isAuthorized = await authorizationCustomer();
        console.log(`Customer authorized: ${isAuthorized}`);
        if (!isAuthorized) {
            console.log(`Redirecting to / from ${url.pathname}`);
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    } else if (url.pathname === '/restaurantManager') {
        const isRestaurantManager = await authorizationRestaurantManager();
        const isCustomer = await authorizationCustomer();
        console.log(`Dashboard access - RestaurantManager: ${isRestaurantManager}, Customer: ${isCustomer}`);
        if (!isRestaurantManager && !isCustomer) {
            console.log(`Redirecting to / from /restaurantManager`);
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};