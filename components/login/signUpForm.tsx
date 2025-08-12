"use client";

import React, { useState } from 'react';
import styles from './styles/login.module.css';
import { useRouter } from "next/navigation";
import API from "@/components/frontAPI/api";
import { toast } from "sonner";

interface SignUpFormProps {
    userType: 'customer' | 'restaurant' | null;
    firstName: string;
    lastName: string;
    email: string;
    setUserType: (type: 'customer' | 'restaurant' | null) => void;
    setFirstName: React.Dispatch<React.SetStateAction<string>>;
    setLastName: React.Dispatch<React.SetStateAction<string>>;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    handleReturn: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
                                                   userType,
                                                   firstName,
                                                   lastName,
                                                   email,
                                                   setUserType,
                                                   setFirstName,
                                                   setLastName,
                                                   setEmail,
                                                   handleReturn,
                                               }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [code, setCode] = useState('');
    const router = useRouter();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userType) {
            setErrorMessage('لطفاً نوع حساب کاربری را انتخاب کنید.');
            return;
        }
        if (!firstName.trim() || !lastName.trim()) {
            setErrorMessage('نام و نام خانوادگی الزامی است.');
            return;
        }
        if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            setErrorMessage('لطفاً یک ایمیل معتبر وارد کنید.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const apiCall = userType === 'customer' ? API.customerSignupCode : API.restaurantSignupCode;
            const res = await apiCall({ firstName, lastName, email });

            if (res.status === 'success') {
                toast.success(res.message || "کد تائید با موفقیت به ایمیل شما ارسال شد.");
                setIsCodeSent(true);
            } else {
                toast.error(res.message || "خطا در ارتباط با سرور");
                setErrorMessage(res.message || "خطا در ارتباط با سرور");
            }
        } catch (err) {
            console.error('Signup code error:', err);
            toast.error("خطا در ارتباط با سرور");
            setErrorMessage("خطا در ارتباط با سرور");
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

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const apiCall = userType === 'customer' ? API.customerSignupVerify : API.restaurantSignupVerify;
            const res = await apiCall({ email, code });

            if (res.status === 'success') {
                toast.success(res.message || "ثبت‌نام با موفقیت انجام شد.");
                // Redirect user to the login page or restaurantManager
                router.push(userType === 'customer' ? '/customer/dashboard' : '/dashboard/restaurant');
            } else {
                toast.error(res.message || "کد وارد شده نامعتبر است.");
                setErrorMessage(res.message || "کد وارد شده نامعتبر است.");
            }
        } catch (err) {
            console.error('Verification error:', err);
            toast.error("خطا در ارتباط با سرور");
            setErrorMessage("خطا در ارتباط با سرور");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormReturn = () => {
        setUserType(null);
        setFirstName('');
        setLastName('');
        setEmail('');
        setErrorMessage('');
        setSuccessMessage('');
        setIsCodeSent(false);
        setCode('');
    };

    return (
        <div className={`${styles['form-container']} ${styles['sign-up-container']}`}>
            <form onSubmit={isCodeSent ? handleVerifyCode : handleSendCode}>
                <h1 className={styles.title}>
                    {userType ? `ثبت‌نام ${userType === 'customer' ? 'مشتری' : 'رستوران'}` : 'ثبت‌نام'}
                </h1>
                {!userType ? (
                    <div className={styles['user-type-selection']}>
                        <button
                            type="button"
                            className={`${styles['user-type-button']} ${
                                userType === 'customer' ? styles.active : ''
                            }`}
                            onClick={() => setUserType('customer')}
                        >
                            مشتری
                        </button>
                        <button
                            type="button"
                            className={`${styles['user-type-button']} ${
                                userType === 'restaurant' ? styles.active : ''
                            }`}
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
                                    type="text"
                                    placeholder="نام"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="نام خانوادگی"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="ایمیل"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="submit"
                                    className={styles['primary-button']}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'در حال ارسال...' : 'ارسال کد'}
                                </button>
                                <button
                                    type="button"
                                    className={styles['return-button']}
                                    onClick={handleFormReturn}
                                >
                                    بازگشت
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
                                    onClick={handleFormReturn}
                                >
                                    بازگشت
                                </button>
                            </>
                        )}
                        {errorMessage && <span className={styles.error}>{errorMessage}</span>}
                    </>
                )}
            </form>
        </div>
    );
};

export default SignUpForm;