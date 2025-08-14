'use client';

import React, { useEffect, useState } from 'react';
import API, { getData } from '@/components/frontAPI/api';
import './styles/RestaurantManagerDashboard.css';
import { useRouter } from 'next/navigation';

interface ManagerInfo {
    firstName: string;
    lastName: string;
    email: string;
    hasRestaurant: boolean;
}

interface RestaurantInfo {
    name: string;
}

const RestaurantManagerDashboard: React.FC = () => {
    const [manager, setManager] = useState<ManagerInfo | null>(null);
    const [restaurantName, setRestaurantName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchManagerInfo = async () => {
            try {
                const res = await getData<{
                    status: string;
                    message: string;
                    data: ManagerInfo;
                    statusCode: number;
                }>('/api/restaurantManager/info');

                if (res.status === 'success' && res.data) {
                    setManager(res.data);
                    if (res.data.hasRestaurant) {
                        const restaurantRes = await getData<{
                            status: string;
                            data: RestaurantInfo;
                            statusCode: number;
                        }>('/api/restaurant/info');
                        if (restaurantRes.status === 'success' && restaurantRes.data) {
                            setRestaurantName(restaurantRes.data.name);
                        }
                    }
                } else if (res.status === 'unauthorized') {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error fetching manager info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchManagerInfo();
    }, [router]);

    return (
        <div className="wrapper">
            <div className="manager-dashboard">
                <h1 className="dashboard-title">داشبورد</h1>
                {loading ? (
                    <div className="loading-spinner">در حال بارگذاری...</div>
                ) : !manager ? (
                    <div className="content">
                        <p className="error-message">اطلاعات مدیر یافت نشد.</p>
                        <button
                            className="return-btn"
                            onClick={() => router.push('/')}
                        >
                            بازگشت به صفحه اصلی
                        </button>
                    </div>
                ) : (
                    <div className="content">
                        <div className="info-card">
                            <p className="info-item">
                                <strong>نام:</strong> {manager.firstName} {manager.lastName}
                            </p>
                            <p className="info-item">
                                <strong>ایمیل:</strong> {manager.email}
                            </p>
                        </div>
                        {!manager.hasRestaurant && (
                            <button
                                className="add-btn"
                                onClick={() => router.push('/restaurantManager/addRestaurant')}
                            >
                                افزودن رستوران
                            </button>
                        )}
                        <button
                            className="return-btn"
                            onClick={() => router.push('/')}
                        >
                            بازگشت به صفحه اصلی
                        </button>
                    </div>
                )}
                <h2 className="footer-title">رستوران من</h2>
                {loading ? null : !manager ? null : manager.hasRestaurant ? (
                    <div
                        className="restaurant-card"
                        onClick={() => router.push('/restaurantManager/manageRestaurant')}
                        style={{ cursor: 'pointer' }}
                    >
                        <h2 className="card-title">{restaurantName || 'رستوران شما'}</h2>
                    </div>
                ) : (
                    <p className="no-restaurant-text">رستورانی ثبت ندارید</p>
                )}
            </div>
        </div>
    );
};

export default RestaurantManagerDashboard;