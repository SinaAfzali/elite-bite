"use client";

import React, { useState } from 'react';
import styles from './styles/login.module.css';
import {useRouter} from "next/navigation";
import API from "@/components/frontAPI/api";
import {toast} from "sonner";

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
    const router = useRouter();

    const handleSignUp = async () => {
        if (!userType) {
            return;
        }
        try {
            return await API[
                userType === 'customer' ? 'customerSignupCode' : 'restaurantSignupCode'
                ]({firstName, lastName, email});
        } catch (error) {
            // Errors are handled in SignUpForm
            console.log(error);
            return {status: 'error', message: 'خطا در ارتباط با سرور'};
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userType) {
            setErrorMessage('لطفاً نوع حساب کاربری را انتخاب کنید.');
            setSuccessMessage('');
            return;
        }
        if (!firstName.trim() || !lastName.trim()) {
            setErrorMessage('نام و نام خانوادگی الزامی است.');
            setSuccessMessage('');
            return;
        }
        if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            setErrorMessage('لطفاً یک ایمیل معتبر وارد کنید.');
            setSuccessMessage('');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const res = await handleSignUp();
            if (res?.status === 'success') {
                toast.success(res?.message || "کد تائید با موفقیت به ایمیل شما ارسال شد.");
                router.push(
                    `/sms/verify?email=${encodeURIComponent(email)}&type=${encodeURIComponent(userType)}&action=signup`
                );
            }else{
                toast.error(res?.message || "خطا در ارتباط با سرور");
            }
        } catch {
        //
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles['form-container']} ${styles['sign-up-container']}`}>
            <form onSubmit={handleFormSubmit}>
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
                        {errorMessage && <span className={styles.error}>{errorMessage}</span>}
                        {successMessage && <span className={styles.success}>{successMessage}</span>}
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
                            onClick={handleReturn}
                        >
                            بازگشت
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default SignUpForm;