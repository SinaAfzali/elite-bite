"use client";

import React, { useState, useEffect } from 'react';
import API from '@/components/frontAPI/api';
import styles from './styles/RestaurantDashboard.module.css';

interface Restaurant {
    id: number;
    name: string;
    description?: string;
    address: string;
    city: string;
    areas: string[];
    areasPrices: number[];
    phoneNumber: string;
    contactEmail: string;
    startWorkHour: number;
    endWorkHour: number;
    deliveryFeeBase: number;
    freeDeliveryThreshold?: number;
    bankAccountNumber: string;
    imageUrl?: string;
}

interface Food {
    id: number;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
}

interface Order {
    id: number;
    customerName: string;
    total: number;
    status: 'pending' | 'shipped' | 'delivered';
    createdAt: string;
}

const RestaurantDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'restaurant' | 'foods' | 'orders' | 'reports'>('restaurant');
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [foods, setFoods] = useState<Food[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        phoneNumber: '',
        contactEmail: '',
        startWorkHour: '',
        endWorkHour: '',
        deliveryFeeBase: '',
        freeDeliveryThreshold: '',
        bankAccountNumber: '',
    });
    const [image, setImage] = useState<File | null>(null);
    const [areas, setAreas] = useState<string[]>([]);
    const [areaInput, setAreaInput] = useState('');
    const [areasPrices, setAreasPrices] = useState<number[]>([]);
    const [priceInput, setPriceInput] = useState('');
    const [foodForm, setFoodForm] = useState({ name: '', price: '', description: '' });
    const [foodImage, setFoodImage] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch restaurant data
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await API.getRestaurant();
                if (res.status === 'success' && res.data) {
                    setRestaurant(res.data);
                    setFormData({
                        name: res.data.name,
                        description: res.data.description || '',
                        address: res.data.address,
                        city: res.data.city,
                        phoneNumber: res.data.phoneNumber,
                        contactEmail: res.data.contactEmail,
                        startWorkHour: res.data.startWorkHour.toString(),
                        endWorkHour: res.data.endWorkHour.toString(),
                        deliveryFeeBase: res.data.deliveryFeeBase.toString(),
                        freeDeliveryThreshold: res.data.freeDeliveryThreshold?.toString() || '',
                        bankAccountNumber: res.data.bankAccountNumber,
                    });
                    setAreas(res.data.areas);
                    setAreasPrices(res.data.areasPrices);
                }
            } catch (error) {
                console.error('Error fetching restaurant:', error);
            }
        };

        const fetchFoods = async () => {
            try {
                const res = await API.getFoods();
                if (res.status === 'success') {
                    setFoods(res.data || []);
                }
            } catch (error) {
                console.error('Error fetching foods:', error);
            }
        };

        const fetchOrders = async () => {
            try {
                const res = await API.getOrders();
                if (res.status === 'success') {
                    setOrders(res.data || []);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchRestaurant();
        fetchFoods();
        fetchOrders();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                setErrorMessage('فقط فرمت‌های jpg، jpeg و png مجاز هستند.');
                return;
            }
            if (file.size > 1024 * 1024) {
                setErrorMessage('حجم عکس نباید بیش از یک مگابایت باشد.');
                return;
            }
            setImage(file);
            setErrorMessage('');
        }
    };

    const handleAddArea = () => {
        if (areaInput.trim() && !areas.includes(areaInput.trim())) {
            setAreas((prev) => [...prev, areaInput.trim()]);
            setAreaInput('');
        }
    };

    const handleAddPrice = () => {
        const price = parseFloat(priceInput);
        if (!isNaN(price) && price >= 0) {
            setAreasPrices((prev) => [...prev, price]);
            setPriceInput('');
        }
    };

    const handleFoodInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFoodForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFoodImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                setErrorMessage('فقط فرمت‌های jpg، jpeg و png مجاز هستند.');
                return;
            }
            if (file.size > 1024 * 1024) {
                setErrorMessage('حجم عکس نباید بیش از یک مگابایت باشد.');
                return;
            }
            setFoodImage(file);
            setErrorMessage('');
        }
    };

    const validateRestaurantForm = (): boolean => {
        if (!formData.name.trim() || formData.name.length > 255) {
            setErrorMessage('نام رستوران الزامی است و حداکثر ۲۵۵ کاراکتر.');
            return false;
        }
        if (!formData.address.trim()) {
            setErrorMessage('آدرس الزامی است.');
            return false;
        }
        if (!formData.city) {
            setErrorMessage('شهر الزامی است.');
            return false;
        }
        if (!formData.phoneNumber.match(/^09\d{9}$/)) {
            setErrorMessage('شماره تلفن باید ۱۱ رقم باشد و با ۰۹ شروع شود.');
            return false;
        }
        if (!formData.contactEmail.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            setErrorMessage('ایمیل معتبر وارد کنید.');
            return false;
        }
        if (!formData.bankAccountNumber.match(/^\d{24}$/)) {
            setErrorMessage('شماره حساب باید دقیقاً ۲۴ رقم باشد.');
            return false;
        }
        const startHour = parseInt(formData.startWorkHour);
        const endHour = parseInt(formData.endWorkHour);
        if (isNaN(startHour) || startHour < 0 || startHour > 23) {
            setErrorMessage('ساعت شروع کار باید بین ۰ تا ۲۳ باشد.');
            return false;
        }
        if (isNaN(endHour) || endHour < 0 || endHour > 23 || endHour < startHour) {
            setErrorMessage('ساعت پایان کار باید بین ۰ تا ۲۳ و بزرگ‌تر یا مساوی ساعت شروع باشد.');
            return false;
        }
        const deliveryFee = parseFloat(formData.deliveryFeeBase);
        if (isNaN(deliveryFee) || deliveryFee < 0) {
            setErrorMessage('هزینه پایه تحویل باید غیرمنفی باشد.');
            return false;
        }
        if (formData.freeDeliveryThreshold) {
            const threshold = parseFloat(formData.freeDeliveryThreshold);
            if (isNaN(threshold) || threshold < 0) {
                setErrorMessage('آستانه تحویل رایگان باید غیرمنفی باشد.');
                return false;
            }
        }
        if (areas.length === 0 || areasPrices.length === 0 || areas.length !== areasPrices.length) {
            setErrorMessage('حداقل یک منطقه و قیمت مربوطه باید وارد شود.');
            return false;
        }
        if (!restaurant && !image) {
            setErrorMessage('تصویر رستوران الزامی است.');
            return false;
        }
        return true;
    };

    const validateFoodForm = (): boolean => {
        if (!foodForm.name.trim() || foodForm.name.length > 255) {
            setErrorMessage('نام غذا الزامی است و حداکثر ۲۵۵ کاراکتر.');
            return false;
        }
        const price = parseFloat(foodForm.price);
        if (isNaN(price) || price <= 0) {
            setErrorMessage('قیمت غذا باید عدد مثبت باشد.');
            return false;
        }
        return true;
    };

    const handleRestaurantSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        if (!validateRestaurantForm()) return;

        setIsLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        if (formData.description) data.append('description', formData.description);
        data.append('address', formData.address);
        data.append('city', formData.city);
        areas.forEach((area) => data.append('areas[]', area));
        areasPrices.forEach((price) => data.append('areasPrices[]', price.toString()));
        data.append('phoneNumber', formData.phoneNumber);
        data.append('contactEmail', formData.contactEmail);
        data.append('startWorkHour', formData.startWorkHour);
        data.append('endWorkHour', formData.endWorkHour);
        data.append('deliveryFeeBase', formData.deliveryFeeBase);
        if (formData.freeDeliveryThreshold) data.append('freeDeliveryThreshold', formData.freeDeliveryThreshold);
        data.append('bankAccountNumber', formData.bankAccountNumber);
        if (image) data.append('image', image);

        try {
            const res = restaurant
                ? await API.updateRestaurant(data)
                : await API.restaurantAdd(data);
            console.log('API response:', res);
            if (res.status === 'success') {
                setSuccessMessage(restaurant ? 'رستوران با موفقیت ویرایش شد.' : 'رستوران با موفقیت اضافه شد.');
                setRestaurant(res.data);
                setIsEditingRestaurant(false);
                setImage(null);
                if (!restaurant) {
                    setFormData({
                        name: '',
                        description: '',
                        address: '',
                        city: '',
                        phoneNumber: '',
                        contactEmail: '',
                        startWorkHour: '',
                        endWorkHour: '',
                        deliveryFeeBase: '',
                        freeDeliveryThreshold: '',
                        bankAccountNumber: '',
                    });
                    setAreas([]);
                    setAreasPrices([]);
                }
            } else {
                setErrorMessage(res.message || 'خطا در ثبت رستوران.');
            }
        } catch (error) {
            console.error('API error:', error);
            setErrorMessage('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFoodSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        if (!validateFoodForm()) return;

        setIsLoading(true);
        const data = new FormData();
        data.append('name', foodForm.name);
        data.append('price', foodForm.price);
        if (foodForm.description) data.append('description', foodForm.description);
        if (foodImage) data.append('image', foodImage);

        try {
            const res = await API.addFood(data);
            console.log('Food API response:', res);
            if (res.status === 'success') {
                setSuccessMessage('غذا با موفقیت اضافه شد.');
                setFoods((prev) => [...prev, res.data]);
                setFoodForm({ name: '', price: '', description: '' });
                setFoodImage(null);
            } else {
                setErrorMessage(res.message || 'خطا در افزودن غذا.');
            }
        } catch (error) {
            console.error('Food API error:', error);
            setErrorMessage('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditRestaurant = () => {
        setIsEditingRestaurant(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.dashboardWrapper}>
                <h1 className={styles.title}>داشبورد رستوران</h1>
                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tab} ${activeTab === 'restaurant' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('restaurant')}
                    >
                        رستوران
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'foods' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('foods')}
                    >
                        غذاها
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        سفارشات
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'reports' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        گزارشات
                    </button>
                </div>

                {activeTab === 'restaurant' && (
                    <div className={styles.tabContent}>
                        {restaurant && !isEditingRestaurant ? (
                            <div className={styles.restaurantCard}>
                                <img
                                    src={restaurant.imageUrl || '/placeholder.jpg'}
                                    alt={restaurant.name}
                                    className={styles.restaurantImage}
                                />
                                <h2 className={styles.restaurantName}>{restaurant.name}</h2>
                                <p><strong>آدرس:</strong> {restaurant.address}</p>
                                <p><strong>شهر:</strong> {restaurant.city === '1' ? 'تهران' : restaurant.city === '2' ? 'اصفهان' : 'شیراز'}</p>
                                <p><strong>مناطق:</strong> {restaurant.areas.join(', ')}</p>
                                <p><strong>هزینه‌ها:</strong> {restaurant.areasPrices.join(', ')} تومان</p>
                                <p><strong>تلفن:</strong> {restaurant.phoneNumber}</p>
                                <p><strong>ایمیل:</strong> {restaurant.contactEmail}</p>
                                <p><strong>ساعات کار:</strong> {restaurant.startWorkHour} تا {restaurant.endWorkHour}</p>
                                <p><strong>هزینه پایه:</strong> {restaurant.deliveryFeeBase} تومان</p>
                                {restaurant.freeDeliveryThreshold && (
                                    <p><strong>آستانه تحویل رایگان:</strong> {restaurant.freeDeliveryThreshold} تومان</p>
                                )}
                                <button
                                    className={styles.button}
                                    onClick={handleEditRestaurant}
                                >
                                    ویرایش رستوران
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleRestaurantSubmit} className={styles.form}>
                                <h2 className={styles.formTitle}>
                                    {restaurant ? 'ویرایش رستوران' : 'افزودن رستوران جدید'}
                                </h2>
                                <div className={styles.field}>
                                    <label className={styles.label}>نام رستوران</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: رستوران نمونه"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>توضیحات (اختیاری)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={styles.textarea}
                                        placeholder="توضیحات رستوران..."
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>تصویر رستوران</label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleImageChange}
                                        className={styles.fileInput}
                                        required={!restaurant}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>آدرس</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: خیابان ولیعصر، کوچه..."
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>شهر</label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={styles.select}
                                        required
                                    >
                                        <option value="" disabled>انتخاب شهر</option>
                                        <option value="1">تهران</option>
                                        <option value="2">اصفهان</option>
                                        <option value="3">شیراز</option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>مناطق</label>
                                    <div className={styles.areaGroup}>
                                        <input
                                            type="text"
                                            placeholder="مثال: نیاوران"
                                            value={areaInput}
                                            onChange={(e) => setAreaInput(e.target.value)}
                                            className={styles.input}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddArea}
                                            disabled={!areaInput.trim()}
                                            className={styles.button}
                                        >
                                            افزودن
                                        </button>
                                    </div>
                                    {areas.length > 0 && (
                                        <p className={styles.infoText}>مناطق: {areas.join(', ')}</p>
                                    )}
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>هزینه‌های ارسال</label>
                                    <div className={styles.areaGroup}>
                                        <input
                                            type="number"
                                            placeholder="مثال: 5000"
                                            value={priceInput}
                                            onChange={(e) => setPriceInput(e.target.value)}
                                            className={styles.input}
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddPrice}
                                            disabled={!priceInput || parseFloat(priceInput) < 0}
                                            className={styles.button}
                                        >
                                            افزودن
                                        </button>
                                    </div>
                                    {areasPrices.length > 0 && (
                                        <p className={styles.infoText}>هزینه‌ها: {areasPrices.join(', ')} تومان</p>
                                    )}
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>شماره تلفن</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: 09123456789"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>ایمیل تماس</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: example@domain.com"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>ساعت شروع کار</label>
                                    <input
                                        type="number"
                                        name="startWorkHour"
                                        value={formData.startWorkHour}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: 10"
                                        min="0"
                                        max="23"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>ساعت پایان کار</label>
                                    <input
                                        type="number"
                                        name="endWorkHour"
                                        value={formData.endWorkHour}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: 22"
                                        min="0"
                                        max="23"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>هزینه پایه تحویل</label>
                                    <input
                                        type="number"
                                        name="deliveryFeeBase"
                                        value={formData.deliveryFeeBase}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: 10000"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>آستانه تحویل رایگان (اختیاری)</label>
                                    <input
                                        type="number"
                                        name="freeDeliveryThreshold"
                                        value={formData.freeDeliveryThreshold}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: 50000"
                                        min="0"
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>شماره حساب بانکی</label>
                                    <input
                                        type="text"
                                        name="bankAccountNumber"
                                        value={formData.bankAccountNumber}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="مثال: 123456789012345678901234"
                                        required
                                    />
                                </div>
                                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                                {successMessage && <p className={styles.success}>{successMessage}</p>}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={styles.submitButton}
                                >
                                    {isLoading ? 'در حال ارسال...' : restaurant ? 'به‌روزرسانی رستوران' : 'ثبت رستوران'}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {activeTab === 'foods' && (
                    <div className={styles.tabContent}>
                        <form onSubmit={handleFoodSubmit} className={styles.form}>
                            <h2 className={styles.formTitle}>افزودن غذا</h2>
                            <div className={styles.field}>
                                <label className={styles.label}>نام غذا</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={foodForm.name}
                                    onChange={handleFoodInputChange}
                                    className={styles.input}
                                    placeholder="مثال: پیتزا مارگاریتا"
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>قیمت (تومان)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={foodForm.price}
                                    onChange={handleFoodInputChange}
                                    className={styles.input}
                                    placeholder="مثال: 120000"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>توضیحات (اختیاری)</label>
                                <textarea
                                    name="description"
                                    value={foodForm.description}
                                    onChange={handleFoodInputChange}
                                    className={styles.textarea}
                                    placeholder="توضیحات غذا..."
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>تصویر غذا</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleFoodImageChange}
                                    className={styles.fileInput}
                                />
                            </div>
                            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                            {successMessage && <p className={styles.success}>{successMessage}</p>}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={styles.submitButton}
                            >
                                {isLoading ? 'در حال ارسال...' : 'افزودن غذا'}
                            </button>
                        </form>
                        {foods.length > 0 && (
                            <div className={styles.foodList}>
                                <h3 className={styles.formTitle}>لیست غذاها</h3>
                                {foods.map((food) => (
                                    <div key={food.id} className={styles.foodItem}>
                                        <img
                                            src={food.imageUrl || '/placeholder.jpg'}
                                            alt={food.name}
                                            className={styles.foodImage}
                                        />
                                        <div>
                                            <h4>{food.name}</h4>
                                            <p>قیمت: {food.price} تومان</p>
                                            {food.description && <p>{food.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.formTitle}>سفارشات</h2>
                        {orders.length > 0 ? (
                            <div className={styles.orderList}>
                                {orders.map((order) => (
                                    <div key={order.id} className={styles.orderItem}>
                                        <p><strong>سفارش #{order.id}</strong></p>
                                        <p>مشتری: {order.customerName}</p>
                                        <p>مبلغ: {order.total} تومان</p>
                                        <p>وضعیت: {order.status === 'pending' ? 'در انتظار' : order.status === 'shipped' ? 'ارسال‌شده' : 'تحویل‌شده'}</p>
                                        <p>تاریخ: {new Date(order.createdAt).toLocaleDateString('fa-IR')}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.infoText}>هیچ سفارشی یافت نشد.</p>
                        )}
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.formTitle}>گزارشات</h2>
                        <div className={styles.report}>
                            <p><strong>تعداد کل سفارشات:</strong> {orders.length}</p>
                            <p><strong>درآمد کل:</strong> {orders.reduce((sum, order) => sum + order.total, 0)} تومان</p>
                            <p><strong>سفارشات در انتظار:</strong> {orders.filter(o => o.status === 'pending').length}</p>
                            <p><strong>سفارشات تحویل‌شده:</strong> {orders.filter(o => o.status === 'delivered').length}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDashboard;