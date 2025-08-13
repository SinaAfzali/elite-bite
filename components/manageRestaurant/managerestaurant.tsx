'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import API, { getData, postFormData, deleteData } from '@/components/frontAPI/api';
import '@/components/manageRestaurant/manageRestaurant.css';

interface City {
    id: number;
    name: string;
}

interface Area {
    id: number;
    name: string;
}

interface FoodCategory {
    id: number;
    name: string;
    description?: string;
}

interface Food {
    id: number;
    name: string;
    description?: string;
    image?: string;
    price: number;
    categoryId: number;
    isAvailable: boolean;
}

interface RestaurantInfo {
    name: string;
    description?: string;
    image?: string;
    registrationDate: string;
    isActive: boolean;
    startWorkHour: number;
    endWorkHour: number;
    ratingAvg: number;
    ratingCount: number;
    cityName: string;
    cityId?: number;
    areas: { id: number; name: string }[];
    areasPrices?: number[];
    phoneNumber: string;
    contactEmail?: string;
    isVerified: boolean;
    address?: string;
}

interface FormData {
    name: string;
    description?: string;
    image?: FileList;
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

interface FoodFormData {
    name: string;
    price: number;
    description?: string;
    image?: FileList;
    categoryId: number;
    isAvailable: boolean;
}

interface ApiResponse {
    status: string;
    message?: string;
    statusCode: number;
}

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .max(255, 'نام نباید بیشتر از ۲۵۵ کاراکتر باشد')
        .required('نام الزامی است'),
    description: Yup.string().optional().nullable(),
    image: Yup.mixed<FileList>()
        .optional()
        .test('fileFormat', 'فقط jpg، jpeg و png مجاز هستند', (value) => {
            if (!value || !value[0]) return true;
            return ['image/jpeg', 'image/jpg', 'image/png'].includes(value[0].type);
        })
        .test('fileSize', 'حجم عکس نباید از یک مگابایت بیشتر باشد', (value) => {
            if (!value || !value[0]) return true;
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

const foodValidationSchema = Yup.object().shape({
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
            if (!value || !value[0]) return true;
            return ['image/jpeg', 'image/jpg', 'image/png'].includes(value[0].type);
        })
        .test('fileSize', 'حجم عکس نباید از یک مگابایت بیشتر باشد', (value) => {
            if (!value || !value[0]) return true;
            return value[0].size <= 1048576; // 1MB
        }),
    categoryId: Yup.number().required('دسته‌بندی الزامی است'),
    isAvailable: Yup.boolean().required('وضعیت در دسترس بودن الزامی است'),
});

const ManageRestaurant = () => {
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
    const [categories, setCategories] = useState<FoodCategory[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [foods, setFoods] = useState<Food[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
    const [editingFoodId, setEditingFoodId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema) as any,
    });

    const {
        register: registerFood,
        handleSubmit: handleFoodSubmit,
        formState: { errors: foodErrors },
        setValue: setFoodValue,
        reset: resetFood,
    } = useForm<FoodFormData>({
        resolver: yupResolver(foodValidationSchema) as any,
        defaultValues: { isAvailable: false },
    });

    const selectedCity = watch('city');

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch restaurant info
                const restaurantRes = await getData<{
                    status: string;
                    message: string;
                    data: RestaurantInfo;
                    statusCode: number;
                }>('/api/restaurant/info');
                if (restaurantRes.status === 'success' && restaurantRes.data) {
                    const restaurantData = {
                        ...restaurantRes.data,
                        deliveryFeeBase: Number(localStorage.getItem('deliveryFeeBase')) || restaurantRes.data.deliveryFeeBase || 0,
                        freeDeliveryThreshold: Number(localStorage.getItem('freeDeliveryThreshold')) || restaurantRes.data.freeDeliveryThreshold,
                        bankAccountNumber: localStorage.getItem('bankAccountNumber') || restaurantRes.data.bankAccountNumber || '',
                    };
                    setRestaurant(restaurantData);
                    reset({
                        name: restaurantData.name,
                        description: restaurantData.description || '',
                        address: restaurantData.address || '',
                        city: restaurantData.cityId || 0,
                        areas: restaurantData.areas.map((area) => area.id),
                        areasPrices: restaurantData.areasPrices || restaurantData.areas.map(() => 0),
                        phoneNumber: restaurantData.phoneNumber,
                        contactEmail: restaurantData.contactEmail || '',
                        startWorkHour: restaurantData.startWorkHour,
                        endWorkHour: restaurantData.endWorkHour,
                        deliveryFeeBase: restaurantData.deliveryFeeBase,
                        freeDeliveryThreshold: restaurantData.freeDeliveryThreshold,
                        bankAccountNumber: restaurantData.bankAccountNumber,
                    });
                    setSelectedAreas(restaurantData.areas.map((area) => area.id));
                } else if (restaurantRes.status === 'unauthorized') {
                    router.push('/login');
                }

                // Fetch cities
                const citiesRes = await API.getAllCities();
                if (citiesRes.status === 'success') {
                    setCities(citiesRes.data || []);
                }

                // Fetch categories
                const categoriesRes = await getData<{
                    status: string;
                    data: FoodCategory[];
                    statusCode: number;
                }>('/api/foodCategory/all');
                if (categoriesRes.status === 'success') {
                    setCategories(categoriesRes.data || []);
                }

                // Fetch foods
                const foodsRes = await API.getFoods();
                if (foodsRes.status === 'success') {
                    setFoods(foodsRes.data || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('خطا در بارگذاری اطلاعات');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router, reset]);

    // Fetch areas based on selected city
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

    // Handle area selection
    const handleAreaChange = (areaId: number, checked: boolean) => {
        const newSelectedAreas = [...selectedAreas];
        const newAreasPrices = [...(watch('areasPrices') || [])];
        if (checked) {
            newSelectedAreas.push(areaId);
            newAreasPrices.push(0);
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

    // Handle area price change
    const handlePriceChange = (areaId: number, price: number) => {
        const index = selectedAreas.indexOf(areaId);
        if (index > -1) {
            const newAreasPrices = [...(watch('areasPrices') || [])];
            newAreasPrices[index] = price;
            setValue('areasPrices', newAreasPrices, { shouldValidate: true });
        }
    };

    // Handle restaurant update
    const onSubmit: SubmitHandler<FormData> = async (data) => {
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

        // Update localStorage
        localStorage.setItem('deliveryFeeBase', data.deliveryFeeBase.toString());
        localStorage.setItem('freeDeliveryThreshold', data.freeDeliveryThreshold?.toString() || '');
        localStorage.setItem('bankAccountNumber', data.bankAccountNumber);

        try {
            const response = await postFormData<ApiResponse>('/api/restaurant/update', formData);
            if (response.status === 'success') {
                setSuccessMessage('رستوران با موفقیت به‌روزرسانی شد.');
                setErrorMessage('');
                // Update restaurant state
                setRestaurant({
                    ...restaurant!,
                    name: data.name,
                    description: data.description,
                    address: data.address,
                    cityId: data.city,
                    cityName: cities.find((city) => city.id === data.city)?.name || restaurant!.cityName,
                    areas: data.areas.map((id) => areas.find((area) => area.id === id)!),
                    areasPrices: data.areasPrices,
                    phoneNumber: data.phoneNumber,
                    contactEmail: data.contactEmail,
                    startWorkHour: data.startWorkHour,
                    endWorkHour: data.endWorkHour,
                    deliveryFeeBase: data.deliveryFeeBase,
                    freeDeliveryThreshold: data.freeDeliveryThreshold,
                    bankAccountNumber: data.bankAccountNumber,
                });
            } else if (response.status === 'unauthorized') {
                setErrorMessage('دسترسی غیرمجاز');
                setSuccessMessage('');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setErrorMessage(response.message || 'خطایی رخ داد.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error updating restaurant:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
            setSuccessMessage('');
        }
    };

    // Handle restaurant deletion
    const handleDeleteRestaurant = async () => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید رستوران را حذف کنید؟')) return;
        try {
            const response = await deleteData<ApiResponse>('/api/restaurant/delete');
            if (response.status === 'success') {
                // Clear localStorage
                localStorage.removeItem('deliveryFeeBase');
                localStorage.removeItem('freeDeliveryThreshold');
                localStorage.removeItem('bankAccountNumber');
                setSuccessMessage('رستوران با موفقیت حذف شد.');
                setErrorMessage('');
                setTimeout(() => router.push('/restaurantManager'), 1500);
            } else if (response.status === 'unauthorized') {
                setErrorMessage('دسترسی غیرمجاز');
                setSuccessMessage('');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setErrorMessage(response.message || 'خطایی رخ داد.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
            setSuccessMessage('');
        }
    };

    // Handle food edit
    const handleEditFood = (food: Food) => {
        setEditingFoodId(food.id);
        setFoodValue('name', food.name);
        setFoodValue('price', food.price);
        setFoodValue('description', food.description || '');
        setFoodValue('categoryId', food.categoryId);
        setFoodValue('isAvailable', food.isAvailable);
    };

    // Handle food delete
    const handleDeleteFood = async (foodId: number) => {
        if (!confirm('آیا مطمئن هستید که می‌خواهید این غذا را حذف کنید؟')) return;
        try {
            const response = await deleteData<ApiResponse>(`/api/food/delete?foodId=${foodId}`);
            if (response.status === 'success') {
                setFoods(foods.filter((food) => food.id !== foodId));
                setSuccessMessage('غذا با موفقیت حذف شد.');
                setErrorMessage('');
            } else if (response.status === 'unauthorized') {
                setErrorMessage('دسترسی غیرمجاز');
                setSuccessMessage('');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setErrorMessage(response.message || 'خطایی رخ داد.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error deleting food:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
            setSuccessMessage('');
        }
    };

    // Handle food availability toggle
    const handleToggleAvailability = async (foodId: number, isAvailable: boolean) => {
        const formData = new FormData();
        formData.append('id', foodId.toString());
        formData.append('isAvailable', isAvailable.toString());
        try {
            const response = await postFormData<ApiResponse>('/api/food/update', formData);
            if (response.status === 'success') {
                setFoods(
                    foods.map((food) =>
                        food.id === foodId ? { ...food, isAvailable } : food
                    )
                );
                setSuccessMessage('وضعیت غذا به‌روزرسانی شد.');
                setErrorMessage('');
            } else if (response.status === 'unauthorized') {
                setErrorMessage('دسترسی غیرمجاز');
                setSuccessMessage('');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setErrorMessage(response.message || 'خطایی رخ داد.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error updating food availability:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
            setSuccessMessage('');
        }
    };

    // Handle food form submission (add or update)
    const onFoodSubmit: SubmitHandler<FoodFormData> = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('price', data.price.toString());
        if (data.description) formData.append('description', data.description);
        if (data.image && data.image[0]) formData.append('image', data.image[0]);
        formData.append('category', data.categoryId.toString());
        formData.append('isAvailable', data.isAvailable.toString());

        try {
            const endpoint = editingFoodId ? '/api/food/update' : '/api/food/add';
            if (editingFoodId) {
                formData.append('id', editingFoodId.toString());
            }
            const response = await postFormData<ApiResponse>(endpoint, formData);
            if (response.status === 'success') {
                setSuccessMessage(editingFoodId ? 'غذا با موفقیت به‌روزرسانی شد.' : 'غذا با موفقیت اضافه شد.');
                setErrorMessage('');
                setEditingFoodId(null);
                resetFood({ isAvailable: false });
                // Refetch foods
                const foodRes = await API.getFoods();
                if (foodRes.status === 'success') {
                    setFoods(foodRes.data || []);
                }
            } else if (response.status === 'unauthorized') {
                setErrorMessage('دسترسی غیرمجاز');
                setSuccessMessage('');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setErrorMessage(response.message || 'خطایی رخ داد.');
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error handling food:', error);
            setErrorMessage('خطایی در ارتباط با سرور رخ داد.');
            setSuccessMessage('');
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingFoodId(null);
        resetFood({ isAvailable: false });
    };

    if (loading) {
        return (
            <div className="wrapper">
                <div className="manager-dashboard">
                    <div className="loading-spinner">در حال بارگذاری...</div>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="wrapper">
                <div className="manager-dashboard">
                    <p className="error-message">اطلاعات رستوران یافت نشد.</p>
                    <button className="return-btn" onClick={() => router.push('/restaurantManager')}>
                        بازگشت به داشبورد
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wrapper">
            <div className="manager-dashboard" style={{ overflowY: 'auto' }}>
                <h1 className="dashboard-title">مدیریت رستوران</h1>

                {/* Restaurant Info */}
                <div className="info-card">
                    <h2 className="card-title">{restaurant.name}</h2>
                    {restaurant.image && (
                        <img src={restaurant.image} alt={restaurant.name} className="restaurant-image" />
                    )}
                    <p><strong>توضیحات:</strong> {restaurant.description || 'بدون توضیحات'}</p>
                    <p><strong>آدرس:</strong> {restaurant.address || 'ندارد'}</p>
                    <p><strong>شهر:</strong> {restaurant.cityName}</p>
                    <p><strong>مناطق:</strong> {restaurant.areas.map((area) => area.name).join(', ')}</p>
                    <p><strong>شماره تماس:</strong> {restaurant.phoneNumber}</p>
                    <p><strong>ایمیل تماس:</strong> {restaurant.contactEmail || 'ندارد'}</p>
                    <p><strong>ساعات کاری:</strong> {restaurant.startWorkHour} تا {restaurant.endWorkHour}</p>
                    <p><strong>هزینه پایه ارسال:</strong> {restaurant.deliveryFeeBase ? `${restaurant.deliveryFeeBase} تومان` : 'ندارد'}</p>
                    <p><strong>آستانه ارسال رایگان:</strong> {restaurant.freeDeliveryThreshold ? `${restaurant.freeDeliveryThreshold} تومان` : 'ندارد'}</p>
                    <p><strong>شماره حساب بانکی:</strong> {restaurant.bankAccountNumber || 'ندارد'}</p>
                    <p><strong>تاریخ ثبت:</strong> {new Date(restaurant.registrationDate).toLocaleDateString('fa-IR')}</p>
                    <p><strong>وضعیت:</strong> {restaurant.isActive ? 'فعال' : 'غیرفعال'}</p>
                    <p><strong>تایید شده:</strong> {restaurant.isVerified ? 'بله' : 'خیر'}</p>
                    <p><strong>میانگین امتیاز:</strong> {restaurant.ratingAvg.toFixed(1)} ({restaurant.ratingCount} رأی)</p>
                </div>

                {/* Edit Restaurant Form */}
                <h2 className="card-title">ویرایش اطلاعات رستوران</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="content">
                    <div className="info-card">
                        <label>نام</label>
                        <input {...register('name')} className="input" placeholder="نام رستوران" />
                        {errors.name && <span className="error">{errors.name.message}</span>}

                        <label>توضیحات (اختیاری)</label>
                        <textarea {...register('description')} className="input" placeholder="توضیحات رستوران" />

                        <label>تصویر جدید (اختیاری, jpg/jpeg/png, max 1MB)</label>
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
                        {errors.freeDeliveryThreshold && <span className="error">{errors.freeDeliveryThreshold.message}</span>}

                        <label>شماره حساب بانکی</label>
                        <input
                            {...register('bankAccountNumber')}
                            className="input"
                            placeholder="شماره حساب ۲۴ رقمی"
                        />
                        {errors.bankAccountNumber && <span className="error">{errors.bankAccountNumber.message}</span>}
                    </div>

                    <button type="submit" className="primary-button">
                        به‌روزرسانی رستوران
                    </button>
                </form>

                {/* Add/Edit Food Form */}
                <h2 className="card-title">{editingFoodId ? 'ویرایش غذا' : 'افزودن غذا'}</h2>
                <form onSubmit={handleFoodSubmit(editingFoodId ? onFoodUpdate : onFoodSubmit)} className="content">
                    <div className="info-card">
                        <label>نام غذا</label>
                        <input {...registerFood('name')} className="input" placeholder="نام غذا" />
                        {foodErrors.name && <span className="error">{foodErrors.name.message}</span>}

                        <label>قیمت (تومان)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...registerFood('price', { valueAsNumber: true })}
                            className="input"
                            placeholder="قیمت"
                        />
                        {foodErrors.price && <span className="error">{foodErrors.price.message}</span>}

                        <label>توضیحات (اختیاری)</label>
                        <textarea {...registerFood('description')} className="input" placeholder="توضیحات غذا" />

                        <label>تصویر (اختیاری, jpg/jpeg/png, max 1MB)</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            {...registerFood('image')}
                            className="input"
                        />
                        {foodErrors.image && <span className="error">{foodErrors.image.message}</span>}

                        <label>دسته‌بندی</label>
                        <select {...registerFood('categoryId')} className="input">
                            <option value="">انتخاب دسته‌بندی</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {foodErrors.categoryId && <span className="error">{foodErrors.categoryId.message}</span>}

                        <label>
                            <input
                                type="checkbox"
                                {...registerFood('isAvailable')}
                                className="checkbox-input"
                            />
                            در دسترس
                        </label>
                    </div>

                    <button type="submit" className="action-btn">
                        {editingFoodId ? 'به‌روزرسانی غذا' : 'افزودن غذا'}
                    </button>
                    {editingFoodId && (
                        <button type="button" className="action-btn" onClick={handleCancelEdit}>
                            لغو
                        </button>
                    )}
                </form>

                {/* Food List */}
                <h2 className="card-title">منو</h2>
                <div className="food-card">
                    {foods.length === 0 ? (
                        <p>هیچ غذایی ثبت نشده است.</p>
                    ) : (
                        foods.map((food, index) => (
                            <div
                                key={food.id}
                                className={`food-item ${index === foods.length - 1 ? '' : 'border-bottom'}`}
                            >
                                {food.image && (
                                    <img src={food.image} alt={food.name} className="food-image" />
                                )}
                                <p><strong>نام:</strong> {food.name}</p>
                                <p><strong>دسته‌بندی:</strong> {categories.find((cat) => cat.id === food.categoryId)?.name || 'نامشخص'}</p>
                                <p><strong>قیمت:</strong> {food.price} تومان</p>
                                <p><strong>توضیحات:</strong> {food.description || 'بدون توضیحات'}</p>
                                <div className="is-available-container">
                                    <strong>در دسترس:</strong> {food.isAvailable ? 'بله' : 'خیر'}
                                    <input
                                        type="checkbox"
                                        checked={food.isAvailable}
                                        onChange={(e) => handleToggleAvailability(food.id, e.target.checked)}
                                        className="checkbox-input"
                                    />
                                </div>
                                <button className="action-btn" onClick={() => handleEditFood(food)}>
                                    ویرایش
                                </button>
                                <button className="delete-btn" onClick={() => handleDeleteFood(food.id)}>
                                    حذف
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Delete Restaurant Button */}
                <button className="delete-btn" onClick={handleDeleteRestaurant}>
                    حذف رستوران
                </button>

                {/* Return Button */}
                <button className="return-btn" onClick={() => router.push('/restaurantManager')}>
                    بازگشت به داشبورد
                </button>

                {/* Messages */}
                {successMessage && <span className="success">{successMessage}</span>}
                {errorMessage && <span className="error">{errorMessage}</span>}
            </div>
        </div>
    );
};

export default ManageRestaurant;