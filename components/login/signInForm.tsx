"use client";

import React, { useState } from 'react';
import styles from './styles/login.module.css';
import API from '@/components/frontAPI/api';
import { useRouter } from 'next/navigation';

const SignInForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState<'customer' | 'restaurant' | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userType) {
            setErrorMessage('لطفاً نوع حساب کاربری را انتخاب کنید.');
            setSuccessMessage('');
            return;
        }
        if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            setErrorMessage('لطفاً یک ایمیل معتبر وارد کنید.');
            setSuccessMessage('');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const response = await API[
                userType === 'customer' ? 'customerLoginCode' : 'restaurantLoginCode'
                ]({ email });

            console.log('Login code response:', response);

            if (response.status === 'success') {
                setSuccessMessage(response.message || 'کد ورود ارسال شد.');
                router.push(
                    `/sms/verify?email=${encodeURIComponent(email)}&type=${encodeURIComponent(userType)}&action=login`
                );
            } else {
                switch (response.status) {
                    case 'notVerified':
                        setErrorMessage('حساب کاربری شما فعال نیست.');
                        break;
                    case 'notFound':
                        setErrorMessage('کاربری با این ایمیل یافت نشد.');
                        break;
                    case 'required':
                        setErrorMessage('لطفاً ایمیل را وارد کنید.');
                        break;
                    default:
                        setErrorMessage(response.message || 'خطایی رخ داد.');
                }
            }
        } catch (error) {
            console.error('Login code error:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturn = () => {
        setUserType(null);
        setEmail('');
        setErrorMessage('');
        setSuccessMessage('');
    };

    return (
        <div className={`${styles['form-container']} ${styles['sign-in-container']}`}>
            <form onSubmit={handleSubmit}>
                <h1 className={styles.title}>ورود</h1>
                {!userType ? (
                    <div className={styles['user-type-selection']}>
                        <button
                            type="button"
                            className={`${styles['user-type-button']} ${userType === 'customer' ? styles.active : ''}`}
                            onClick={() => setUserType('customer')}
                        >
                            مشتری
                        </button>
                        <button
                            type="button"
                            className={`${styles['user-type-button']} ${userType === 'restaurant' ? styles.active : ''}`}
                            onClick={() => setUserType('restaurant')}
                        >
                            رستوران
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            type="email"
                            placeholder="ایمیل"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        {errorMessage && <span className={styles.error}>{errorMessage}</span>}
                        {successMessage && <span className={styles.success}>{successMessage}</span>}
                        <button
                            type="button"
                            className={styles['return-button']}
                            onClick={handleReturn}
                        >
                            بازگشت
                        </button>
                        <button
                            type="submit"
                            className={styles['primary-button']}
                            disabled={isLoading}
                        >
                            {isLoading ? 'در حال ارسال...' : 'ارسال کد'}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default SignInForm;