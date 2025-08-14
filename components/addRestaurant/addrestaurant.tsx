'use client';

import React, { useEffect, useState } from 'react';
import API, { postFormData } from '@/components/frontAPI/api';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import '@/components/addRestaurant/addRestaurant.css';

interface City {
    id: number;
    name: string;
}

interface Area {
    id: number;
    name: string;
}

interface FormData {
    name: string;
    description?: string;
    image: FileList;
    address: string;
    city: number;
    areas: number[];
    areasPrices: number[];
    phoneNumber: string;
    contactEmail: string;
    startWorkHour: number;
    endWorkHour: number;
    deliveryFeeBase: number;
    freeDeliveryThreshold?: number;
    bankAccountNumber: string;
}

interface ApiResponse {
    status: string;
    message?: string;
    statusCode: number;
    restaurantId?: number;
}

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .max(255, 'نام نباید بیشتر از ۲۵۵ کاراکتر باشد')
        .required('نام الزامی است'),
    description: Yup.string().optional().nullable(),
    image: Yup.mixed<FileList>()
        .required('تصویر الزامی است')
        .test('fileFormat', 'فقط jpg، jpeg و png مجاز هستند', (value) => {
            if (!value || !value[0]) return false;
            return ['image/jpeg', 'image/jpg', 'image/png'].includes(value[0].type);
        })
        .test('fileSize', 'حجم عکس نباید از یک مگابایت بیشتر باشد', (value) => {
            if (!value || !value[0]) return false;
            return value[0].size <= 1048576; // 1MB
        }),
    address: Yup.string().required('آدرس الزامی است'),
    city: Yup.number().required('شهر الزامی است'),
    areas: Yup.array()
        .of(Yup.number().required())
        .min(1, 'حداقل یک منطقه الزامی است')
        .required('مناطق الزامی است'),
    areasPrices: Yup.array()
        .of(Yup.number().min(0, 'قیمت نباید منفی باشد').required('قیمت الزامی است'))
        .min(1, 'حداقل یک قیمت الزامی است')
        .required('قیمت مناطق الزامی است')
        .test('match-areas', 'تعداد قیمت‌ها باید با تعداد مناطق برابر باشد', function (value) {
            return value.length === this.parent.areas.length;
        }),
    phoneNumber: Yup.string()
        .matches(/^09\d{9}$/, 'شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود')
        .required('شماره تلفن الزامی است'),
    contactEmail: Yup.string().email('ایمیل معتبر نیست').required('ایمیل تماس الزامی است'),
    startWorkHour: Yup.number()
        .min(0, 'ساعت شروع باید بین ۰ تا ۲۳ باشد')
        .max(23, 'ساعت شروع باید بین ۰ تا ۲۳ باشد')
        .required('ساعت شروع کار الزامی است'),
    endWorkHour: Yup.number()
        .min(0, 'ساعت پایان باید بین ۰ تا ۲۳ باشد')
        .max(23, 'ساعت پایان باید بین ۰ تا ۲۳ باشد')
        .required('ساعت پایان کار الزامی است')
        .test('greater-than-start', 'ساعت پایان باید بزرگ‌تر یا مساوی ساعت شروع باشد', function (value) {
            return value >= this.parent.startWorkHour;
        }),
    deliveryFeeBase: Yup.number()
        .min(0, 'مقدار نباید منفی باشد')
        .required('هزینه پایه ارسال الزامی است'),
    freeDeliveryThreshold: Yup.number()
        .min(0, 'مقدار نباید منفی باشد')
        .optional()
        .nullable(),
    bankAccountNumber: Yup.string()
        .matches(/^\d{24}$/, 'شماره حساب باید ۲۴ رقم باشد')
        .required('شماره حساب بانکی الزامی است'),
});

const AddRestaurant = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema) as any,
    });
    const [cities, setCities] = useState<City[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const selectedCity = watch('city');

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await API.getAllCities();
                if (response.status === 'success') {
                    setCities(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
                setErrorMessage('خطا در بارگذاری شهرها');
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        if (selectedCity) {
            const fetchAreas = async () => {
                try {
                    const response = await API.getAreasByCityId({ cityId: Number(selectedCity) });
                    if (response.status === 'success') {
                        setAreas(response.areas || []);
                    } else {
                        setAreas([]);
                    }
                } catch (error) {
                    console.error('Error fetching areas:', error);
                    setErrorMessage('خطا در بارگذاری مناطق');
                }
            };
            fetchAreas();
        } else {
            setAreas([]);
            setSelectedAreas([]);
            setValue('areas', []);
            setValue('areasPrices', []);
        }
    }, [selectedCity, setValue]);

    const handleAreaChange = (areaId: number, checked: boolean) => {
        const newSelectedAreas = [...selectedAreas];
        const newAreasPrices = [...(watch('areasPrices') || [])];
        if (checked) {
            newSelectedAreas.push(areaId);
            newAreasPrices.push(0); // Initialize price to 0 for new area
        } else {
            const index = newSelectedAreas.indexOf(areaId);
            if (index > -1) {
                newSelectedAreas.splice(index, 1);
                newAreasPrices.splice(index, 1);
            }
        }
        setSelectedAreas(newSelectedAreas);
        setValue('areas', newSelectedAreas, { shouldValidate: true });
        setValue('areasPrices', newAreasPrices, { shouldValidate: true });
    };

    const handlePriceChange = (areaId: number, price: number) => {
        const index = selectedAreas.indexOf(areaId);
        if (index > -1) {
            const newAreasPrices = [...(watch('areasPrices') || [])];
            newAreasPrices[index] = price;
            setValue('areasPrices', newAreasPrices, { shouldValidate: true });
        }
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        // Validate areas and areasPrices match
        if (data.areas.length !== data.areasPrices.length) {
            setErrorMessage('تعداد قیمت‌ها باید با تعداد مناطق برابر باشد');
            return;
        }

        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.image && data.image[0]) formData.append('image', data.image[0]);
        formData.append('address', data.address);
        formData.append('city', data.city.toString());
        data.areas.forEach((area, index) => {
            formData.append(`areas[]`, area.toString());
            formData.append(`areasPrices[]`, data.areasPrices[index].toString());
        });
        formData.append('phoneNumber', data.phoneNumber);
        formData.append('contactEmail', data.contactEmail);
        formData.append('startWorkHour', data.startWorkHour.toString());
        formData.append('endWorkHour', data.endWorkHour.toString());
        formData.append('deliveryFeeBase', data.deliveryFeeBase.toString());
        if (data.freeDeliveryThreshold) {
            formData.append('freeDeliveryThreshold', data.freeDeliveryThreshold.toString());
        }
        formData.append('bankAccountNumber', data.bankAccountNumber);

        // Store non-supported fields in localStorage
        localStorage.setItem('deliveryFeeBase', data.deliveryFeeBase.toString());
        localStorage.setItem('freeDeliveryThreshold', data.freeDeliveryThreshold?.toString() || '');
        localStorage.setItem('bankAccountNumber', data.bankAccountNumber);

        try {
            const response = await postFormData<ApiResponse>('/api/restaurant/add', formData);
            if (response.status === 'success' && response.restaurantId) {
                setSuccessMessage('رستوران با موفقیت اضافه شد.');
                setErrorMessage('');
                setTimeout(() => router.push('/restaurantManager/manageRestaurant'), 1500);
            } else if (response.status === 'unauthorized') {
                setErrorMessage('دسترسی غیرمجاز');
                setSuccessMessage('');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setErrorMessage(response.message || 'خطایی رخ داد.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error adding restaurant:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="wrapper">
            <div className="manager-dashboard">
                <h1 className="dashboard-title">افزودن رستوران</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="content">
                    <div className="info-card">
                        <label>نام</label>
                        <input {...register('name')} className="input" placeholder="نام رستوران" />
                        {errors.name && <span className="error">{errors.name.message}</span>}

                        <label>توضیحات (اختیاری)</label>
                        <textarea {...register('description')} className="input" placeholder="توضیحات رستوران" />

                        <label>تصویر (jpg/jpeg/png, max 1MB)</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            {...register('image')}
                            className="input"
                        />
                        {errors.image && <span className="error">{errors.image.message}</span>}

                        <label>آدرس</label>
                        <input {...register('address')} className="input" placeholder="آدرس رستوران" />
                        {errors.address && <span className="error">{errors.address.message}</span>}

                        <label>شهر</label>
                        <select {...register('city')} className="input">
                            <option value="">انتخاب شهر</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        {errors.city && <span className="error">{errors.city.message}</span>}

                        <label>مناطق</label>
                        <div className="areas-container">
                            {areas.map((area) => (
                                <div key={area.id} className="area-item">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedAreas.includes(area.id)}
                                            onChange={(e) => handleAreaChange(area.id, e.target.checked)}
                                        />
                                        {area.name}
                                    </label>
                                    {selectedAreas.includes(area.id) && (
                                        <div>
                                            <label>قیمت ارسال برای {area.name}</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                {...register(`areasPrices.${selectedAreas.indexOf(area.id)}`)}
                                                onChange={(e) => handlePriceChange(area.id, parseFloat(e.target.value) || 0)}
                                                className="input"
                                                placeholder="قیمت (تومان)"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.areas && <span className="error">{errors.areas.message}</span>}
                        {errors.areasPrices && <span className="error">{errors.areasPrices.message}</span>}

                        <label>شماره تلفن</label>
                        <input
                            {...register('phoneNumber')}
                            className="input"
                            placeholder="مثال: 09123456789"
                        />
                        {errors.phoneNumber && <span className="error">{errors.phoneNumber.message}</span>}

                        <label>ایمیل تماس</label>
                        <input
                            {...register('contactEmail')}
                            className="input"
                            placeholder="ایمیل تماس"
                        />
                        {errors.contactEmail && <span className="error">{errors.contactEmail.message}</span>}

                        <label>ساعت شروع کار</label>
                        <input
                            type="number"
                            {...register('startWorkHour', { valueAsNumber: true })}
                            className="input"
                            placeholder="0-23"
                        />
                        {errors.startWorkHour && <span className="error">{errors.startWorkHour.message}</span>}

                        <label>ساعت پایان کار</label>
                        <input
                            type="number"
                            {...register('endWorkHour', { valueAsNumber: true })}
                            className="input"
                            placeholder="0-23"
                        />
                        {errors.endWorkHour && <span className="error">{errors.endWorkHour.message}</span>}

                        <label>هزینه پایه ارسال</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('deliveryFeeBase', { valueAsNumber: true })}
                            className="input"
                            placeholder="هزینه پایه (تومان)"
                        />
                        {errors.deliveryFeeBase && <span className="error">{errors.deliveryFeeBase.message}</span>}

                        <label>آستانه ارسال رایگان (اختیاری)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('freeDeliveryThreshold', { valueAsNumber: true })}
                            className="input"
                            placeholder="آستانه ارسال رایگان (تومان)"
                        />
                        {errors.freeDeliveryThreshold && (
                            <span className="error">{errors.freeDeliveryThreshold.message}</span>
                        )}

                        <label>شماره حساب بانکی</label>
                        <input
                            {...register('bankAccountNumber')}
                            className="input"
                            placeholder="شماره حساب ۲۴ رقمی"
                        />
                        {errors.bankAccountNumber && (
                            <span className="error">{errors.bankAccountNumber.message}</span>
                        )}
                    </div>

                    <button type="submit" className="primary-button">
                        تایید
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

export default AddRestaurant;