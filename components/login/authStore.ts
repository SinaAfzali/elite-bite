// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Import API if needed for logout, but since APIs are 404, we'll handle errors gracefully
import API, { getData } from '@/components/frontAPI/api'; // Adjust path

interface AuthState {
    isLoggedIn: boolean;
    userType: 'customer' | 'restaurant' | null;
    setLoggedIn: (loggedIn: boolean, userType: 'customer' | 'restaurant' | null) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isLoggedIn: false,
            userType: null,
            setLoggedIn: (loggedIn, userType) => set({ isLoggedIn: loggedIn, userType }),
            logout: async () => {
                try {
                    const currentUserType = get().userType;
                    // Attempt logout API based on userType; adjust if customer has a different endpoint
                    const logoutEndpoint = currentUserType === 'customer'
                        ? API.checkCustomerLogin + '/logout'  // Placeholder; update when API exists
                        : API.checkRestaurantManagerLogin + '/logout';
                    await getData(logoutEndpoint);
                } catch (error) {
                    console.error('Logout API failed (likely 404):', error);
                    // Proceed with client-side logout anyway
                } finally {
                    set({ isLoggedIn: false, userType: null });
                }
            },
        }),
        {
            name: 'auth-storage', // Key for localStorage persistence
        }
    )
);