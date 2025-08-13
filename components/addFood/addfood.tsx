'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import API, { getData, postFormData } from '@/components/frontAPI/api';
import '@/components/addFood/addFood.css';

interface FoodCategory {
    id: number;
    name: string;
    description?: string;
}

interface FormData {
    name: string;
    price: number;
    description?: string;
    image?: FileList;
    category: number;
    isAvailable: boolean;
}

interface ApiResponse {
    status: string;
    message?: string;
    statusCode: number;
    foodId?: number;
}

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .max(100, 'نام نباید بیشتر از ۱۰۰ کاراکتر باشد')
        .required('نام غذا الزامی است'),
    price: Yup.number()
        .min(0, 'قیمت نباید منفی باشد')
        .required('قیمت الزامی است'),
    description: Yup.string().optional().nullable(),
    image: Yup.mixed<FileList>()
        .optional()
        .test('fileFormat', 'فقط jpg، jpeg و png مجاز هستند', (value) => {
            if (!value || !value[0]) return true; // Optional field
            return ['image/jpeg', 'image/jpg', 'image/png'].includes(value[0].type);
        })
        .test('fileSize', 'حجم عکس نباید از یک مگابایت بیشتر باشد', (value) => {
            if (!value || !value[0]) return true; // Optional field
            return value[0].size <= 1048576; // 1MB
        }),
    category: Yup.number().required('دسته‌بندی الزامی است'),
    isAvailable: Yup.boolean().required('وضعیت در دسترس بودن الزامی است'),
});

const AddFood = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const restaurantId = searchParams.get('restaurantId');
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema) as any,
        defaultValues: { isAvailable: false },
    });
    const [categories, setCategories] = useState<FoodCategory[]>([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!restaurantId) {
            setErrorMessage('شناسه رستوران یافت نشد.');
            setTimeout(() => router.push('/restaurantManager'), 1500);
            return;
        }

        const fetchCategories = async () => {
            try {
                const response = await getData<{
                    status: string;
                    data: FoodCategory[];
                    statusCode: number;
                }>('/api/foodCategory/all');
                if (response.status === 'success') {
                    setCategories(response.data || []);
                } else {
                    setErrorMessage('خطا در بارگذاری دسته‌بندی‌ها');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setErrorMessage('خطا در ارتباط با سرور');
            }
        };
        fetchCategories();
    }, [router, restaurantId]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price.toString());
        if (data.description) formData.append('description', data.description);
        if (data.image && data.image[0]) formData.append('image', data.image[0]);
        formData.append('category', data.category.toString());
        formData.append('isAvailable', data.isAvailable.toString());

        try {
            const response = await postFormData<ApiResponse>('/api/food/add', formData);
            if (response.status === 'success') {
                setSuccessMessage('غذا با موفقیت اضافه شد.');
                setErrorMessage('');
                reset();
                setTimeout(() => {
                    setSuccessMessage('');
                }, 1500);
            } else if (response.status === 'unauthorized') {
                setErrorMessage('دسترسی غیرمجاز');
                setSuccessMessage('');
                setTimeout(() => router.push('/login'), 1500);
            } else if (response.message === 'رستوران شما به تایید ادمین نرسیده است. بنابراین نمیتوانید غذا ثبت کنید.') {
                setErrorMessage(response.message);
                setSuccessMessage('');
                setTimeout(() => router.push('/restaurantManager'), 1500);
            } else {
                setErrorMessage(response.message || 'خطایی رخ داد.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error adding food:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="wrapper">
            <div className="manager-dashboard">
                <h1 className="dashboard-title">افزودن غذا</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="content">
                    <div className="info-card">
                        <label>نام غذا</label>
                        <input {...register('name')} className="input" placeholder="نام غذا" />
                        {errors.name && <span className="error">{errors.name.message}</span>}

                        <label>قیمت (تومان)</label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            {...register('price', { valueAsNumber: true })}
                            className="input"
                            placeholder="قیمت"
                        />
                        {errors.price && <span className="error">{errors.price.message}</span>}

                        <label>توضیحات (اختیاری)</label>
                        <textarea {...register('description')} className="input" placeholder="توضیحات غذا" />

                        <label>تصویر (jpg/jpeg/png, max 1MB, اختیاری)</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            {...register('image')}
                            className="input"
                        />
                        {errors.image && <span className="error">{errors.image.message}</span>}

                        <label>دسته‌بندی</label>
                        <select {...register('category')} className="input">
                            <option value="">انتخاب دسته‌بندی</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && <span className="error">{errors.category.message}</span>}

                        <label>در دسترس</label>
                        <input
                            type="checkbox"
                            {...register('isAvailable')}
                            className="checkbox-input"
                        />
                        {errors.isAvailable && <span className="error">{errors.isAvailable.message}</span>}
                    </div>

                    <button type="submit" className="primary-button">
                        افزودن غذا
                    </button>
                    {successMessage && <span className="success">{successMessage}</span>}
                    {errorMessage && <span className="error">{errorMessage}</span>}
                </form>
                <button className="return-btn" onClick={() => router.push('/restaurantManager')}>
                    بازگشت به داشبورد
                </button>
            </div>
        </div>
    );
};

export default AddFood;