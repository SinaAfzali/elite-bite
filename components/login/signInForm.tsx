// SignInForm.tsx (or wherever it's located)
"use client";

import React, { useState } from 'react';
import styles from './styles/login.module.css';
import API from '@/components/frontAPI/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/components/login/authStore'; // Adjust path

const SignInForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState<'customer' | 'restaurant' | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [code, setCode] = useState('');
    const router = useRouter();
    const { setLoggedIn } = useAuthStore(); // Add this

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userType) {
            setErrorMessage('لطفاً نوع حساب کاربری را انتخاب کنید.');
            return;
        }
        if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            setErrorMessage('لطفاً یک ایمیل معتبر وارد کنید.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const apiCall = userType === 'customer' ? API.customerLoginCode : API.restaurantLoginCode;
            const response = await apiCall({ email });

            console.log('Login code response:', response);

            if (response.status === 'success') {
                setSuccessMessage(response.message || 'کد ورود ارسال شد. لطفاً ایمیل خود را چک کنید.');
                setIsCodeSent(true);
            } else {
                setErrorMessage(response.message || 'خطایی رخ داد.');
            }
        } catch (error) {
            console.error('Login code error:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) {
            setErrorMessage('لطفاً کد تأیید را وارد کنید.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const apiCall = userType === 'customer' ? API.customerLoginVerify : API.restaurantLoginVerify;
            const response = await apiCall({ email, code });

            console.log('Verification response:', response);

            if (response.status === 'success') {
                setSuccessMessage(response.message || 'ورود با موفقیت انجام شد.');
                setLoggedIn(true, userType); // Set in Zustand (persists)
                window.location.href = 'http://localhost:3000/';
            } else {
                setErrorMessage(response.message || 'کد وارد شده نامعتبر است.');
            }
        } catch (error) {
            console.error('Verification error:', error);
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
        setIsCodeSent(false);
        setCode('');
    };

    return (
        <div className={`${styles['form-container']} ${styles['sign-in-container']}`}>
            <form onSubmit={isCodeSent ? handleVerifyCode : handleSendCode}>
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
                        {!isCodeSent ? (
                            <>
                                <input
                                    type="email"
                                    placeholder="ایمیل"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    required
                                />
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
                        ) : (
                            <>
                                <p className={styles['success-message']}>کد تأیید به ایمیل شما ارسال شد.</p>
                                <input
                                    type="text"
                                    placeholder="کد تأیید"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="submit"
                                    className={styles['primary-button']}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'در حال تأیید...' : 'تأیید کد'}
                                </button>
                                <button
                                    type="button"
                                    className={styles['return-button']}
                                    onClick={handleReturn}
                                >
                                    بازگشت
                                </button>
                            </>
                        )}
                        {errorMessage && <span className={styles.error}>{errorMessage}</span>}
                        {successMessage && <span className={styles.success}>{successMessage}</span>}
                    </>
                )}
            </form>
        </div>
    );
};

export default SignInForm;