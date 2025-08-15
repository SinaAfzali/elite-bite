'use client';

import React, { useEffect, useState } from 'react';
import API, { getData } from '@/components/frontAPI/api';
import './styles/CustomerDashboard.css'; // Use the same styles as RestaurantManagerDashboard
import { useRouter } from 'next/navigation';

interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
}

const CustomerDashboard: React.FC = () => {
    const [customer, setCustomer] = useState<CustomerInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCustomerInfo = async () => {
            try {
                const res = await getData<{
                    status: string;
                    message: string;
                    data: CustomerInfo;
                    statusCode: number;
                }>('/api/customer/info');

                if (res.status === 'success' && res.data) {
                    setCustomer(res.data);
                } else if (res.status === 'unauthorized') {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error fetching customer info:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerInfo();
    }, [router]);

    return (
        <div className="wrapper">
            <div className="customer-dashboard">
                <h1 className="dashboard-title">داشبورد مشتری</h1>
                {loading ? (
                    <div className="loading-spinner">در حال بارگذاری...</div>
                ) : !customer ? (
                    <div className="content">
                        <p className="error-message">اطلاعات مشتری یافت نشد.</p>
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
                                <strong>نام:</strong> {customer.firstName} {customer.lastName}
                            </p>
                            <p className="info-item">
                                <strong>ایمیل:</strong> {customer.email}
                            </p>
                        </div>
                        <button
                            className="return-btn"
                            onClick={() => router.push('/')}
                        >
                            بازگشت به صفحه اصلی
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;