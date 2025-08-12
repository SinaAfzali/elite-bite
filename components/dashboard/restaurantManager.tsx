'use client';

import React, { useEffect, useState } from 'react';
import API from '@/components/frontAPI/api';
import './styles/RestaurantManagerDashboard.css';
import { useRouter } from 'next/navigation'; // Use next/navigation in App Router

interface ManagerInfo {
    firstName: string;
    lastName: string;
    email: string;
    hasRestaurant: boolean;
}

const RestaurantManagerDashboard: React.FC = () => {
    const [manager, setManager] = useState<ManagerInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchManagerInfo = async () => {
            try {
                const res = await API.getData<{
                    status: string;
                    message: string;
                    data: ManagerInfo;
                    statusCode: number;
                }>('/api/restaurantManager/info');

                if (res.status === 'success' && res.data) {
                    setManager(res.data);
                }
            } catch (error) {
                console.error('Error fetching manager info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchManagerInfo();
    }, []);

    if (loading) return <div className="manager-dashboard">در حال بارگذاری...</div>;

    if (!manager) {
        return (
            <div className="manager-dashboard">
                <p>اطلاعات مدیر یافت نشد.</p>
            </div>
        );
    }

    return (
        <div className="manager-dashboard">
            <h1 className="title">رستوران من</h1>
            <div className="info">
                <p>
                    <strong>نام:</strong> {manager.firstName} {manager.lastName}
                </p>
                <p>
                    <strong>ایمیل:</strong> {manager.email}
                </p>
            </div>

            {!manager.hasRestaurant ? (
                <button
                    className="add-btn"
                    onClick={() => router.push('/addRestaurant')}
                >
                    افزودن رستوران
                </button>
            ) : (
                <p className="notice">شما قبلاً یک رستوران ثبت کرده‌اید.</p>
            )}
        </div>
    );
};

export default RestaurantManagerDashboard;
