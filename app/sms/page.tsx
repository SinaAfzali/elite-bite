"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CodeInput from '@/components/sms/codeInput';
import VerifyButton from '@/components/sms/verifyButton';
import API from '@/components/frontAPI/api';
import styles from '@/components/sms/styles/OneTimeCodeInput.module.css';
import loginStyles from '@/components/login/styles/login.module.css';

interface ApiResponse {
    status: string;
    message?: string;
    statusCode: number;
}

const OneTimeCodeInput: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const router = useRouter();
    const searchParams = useSearchParams();

    const email = searchParams.get('email') || '';
    const userType = searchParams.get('type') as 'customer' | 'restaurant' | null;
    const action = searchParams.get('action') as 'signup' | 'login' | null;

    useEffect(() => {
        if (!email || !userType || !action) {
            setErrorMessage('اطلاعات ناقص است. لطفاً دوباره امتحان کنید.');
            setTimeout(() => router.push('/'), 2000);
        }
    }, [email, userType, action, router]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [resendTimer]);

    const handleVerify = async () => {
        if (!userType || !action) return;
        const code = inputValue.replace(/ - /g, '');
        if (code.length !== 6) {
            setErrorMessage('کد باید ۶ رقم باشد.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const apiMethod = API[
                `${userType}${action === 'signup' ? 'Signup' : 'Login'}Verify` as keyof typeof API
                ] as (data: { email: string; code: string }) => Promise<ApiResponse>;

            const res = await apiMethod({ email, code });
            console.log('Verify response:', res);

            if (res.status === 'success') {
                setSuccessMessage(res.message || 'تأیید با موفقیت انجام شد.');
                localStorage.removeItem('signupEmail');
                setTimeout(() => {
                    if (userType === 'customer') {
                        router.push('/customer/dashboard');
                    } else {
                        router.push('/dashboard/restaurant');
                    }
                }, 1000);
            } else {
                switch (res.status) {
                    case 'required':
                        setErrorMessage('اطلاعات ورودی ناقص است.');
                        break;
                    case 'error':
                        setErrorMessage('کد وارد شده نامعتبر یا منقضی شده است.');
                        break;
                    case 'notFound':
                        setErrorMessage('کاربری با این ایمیل پیدا نشد.');
                        break;
                    default:
                        setErrorMessage(res.message || 'خطای نامشخص');
                }
            }
        } catch (error) {
            console.error('Verify error:', error);
            setErrorMessage('خطایی در تأیید کد رخ داده است.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!userType || !action || resendTimer > 0) return;

        setResendLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const apiMethod = API[
                `${userType}${action === 'signup' ? 'Signup' : 'Login'}Code` as keyof typeof API
                ] as (
                data: { email: string } | { firstName: string; lastName: string; email: string }
            ) => Promise<ApiResponse>;

            const data =
                action === 'signup'
                    ? { firstName: 'N/A', lastName: 'N/A', email }
                    : { email };
            const res = await apiMethod(data);
            console.log('Resend code response:', res);

            if (res.status === 'success') {
                setSuccessMessage(res.message || 'کد جدید ارسال شد.');
                setResendTimer(60);
            } else {
                switch (res.status) {
                    case 'required':
                        setErrorMessage('اطلاعات ورودی ناقص است.');
                        break;
                    case 'notFound':
                        setErrorMessage('کاربری با این ایمیل پیدا نشد.');
                        break;
                    case 'notVerified':
                        setErrorMessage('حساب کاربری شما فعال نیست.');
                        break;
                    case 'exist':
                        setErrorMessage('این ایمیل یک حساب کاربری فعال دارد.');
                        break;
                    default:
                        setErrorMessage(res.message || 'خطا در ارسال کد.');
                }
            }
        } catch (error) {
            console.error('Resend code error:', error);
            setErrorMessage('خطایی در ارسال کد رخ داد.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className={`${styles.container} ${loginStyles.wrapper}`}>
            <div className={`${styles.formContainer} ${loginStyles.container}`}>
                <h1 className={loginStyles['brand-title']}>
                    <span className={loginStyles['brand-elite']}>Elite</span>
                    <span className={loginStyles['brand-bite']}>Bite</span>
                </h1>
                <h3 className={styles.enter}>کد تأیید را وارد کنید</h3>
                <p className={styles.des}>کد تأیید برای ایمیل {email} ارسال شده است.</p>
                <CodeInput inputValue={inputValue} setInputValue={setInputValue} />
                {errorMessage && <span className={loginStyles.error}>{errorMessage}</span>}
                {successMessage && <span className={loginStyles.success}>{successMessage}</span>}
                <VerifyButton handleVerify={handleVerify} disabled={isLoading} />
                <button
                    type="button"
                    className={loginStyles['ghost-button']}
                    onClick={handleResendCode}
                    disabled={resendLoading || resendTimer > 0}
                >
                    {resendLoading
                        ? 'در حال ارسال...'
                        : resendTimer > 0
                            ? `ارسال مجدد (${resendTimer} ثانیه)`
                            : 'ارسال مجدد کد'}
                </button>
                <p className={styles.des}>
                    با ورود به سایت،{' '}
                    <a href="#" className={styles.link}>
                        شرایط استفاده
                    </a>{' '}
                    و{' '}
                    <a href="#" className={styles.link}>
                        قوانین حریم خصوصی
                    </a>{' '}
                    را می‌پذیرید.
                </p>
            </div>
        </div>
    );
};

export default OneTimeCodeInput;