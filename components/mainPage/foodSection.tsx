"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import API from "@/components/frontAPI/api";
import "./FoodSection.css";

interface Restaurant {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    startWorkHour: number;
    endWorkHour: number;
    ratingAvg: number;
    ratingCount: number;
    cityName: string;
    cityId: number;
    areas: { id: number; name: string }[];
    deliveryFeeBase?: number;
    minFoodPrice?: number;
    image?: string;
}

interface FoodItem {
    id: number;
    name: string;
    price: number;
    description?: string;
    image?: string;
    categoryId: number;
    categoryName: string;
    restaurantId: number;
    restaurantName: string;
    isAvailable: boolean;
    ratingScore: number;
    ratingTotalVoters: number;
}

interface FoodCategory {
    id: number;
    name: string;
}

const FoodSection: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState("رستوران‌ها");
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
    const [areaId, setAreaId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        location: "",
        category: "",
        rating: "",
        popularity: "",
        minPrice: "",
        maxPrice: "",
        priceOrder: "asc" as "asc" | "desc",
    });

    // Load areaId from localStorage on client side
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedAreaId = localStorage.getItem("selectedAreaId");
            setAreaId(storedAreaId ? Number(storedAreaId) : null);
        }
    }, []);

    // Listen for location changes
    useEffect(() => {
        const handleLocationChange = () => {
            if (typeof window !== "undefined") {
                const storedAreaId = localStorage.getItem("selectedAreaId");
                setAreaId(storedAreaId ? Number(storedAreaId) : null);
            }
        };

        window.addEventListener("locationChanged", handleLocationChange);
        return () => window.removeEventListener("locationChanged", handleLocationChange);
    }, []);

    // Fetch food categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await API.getFoodCategories();
                if (response.status === "success") {
                    setFoodCategories(response.data || []);
                }
            } catch (error) {
                console.error("Error fetching food categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch data based on category and filters
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            if (selectedCategory === "رستوران‌ها") {
                try {
                    let response;

                    // Apply filters based on selection
                    if (filters.category) {
                        const categoryId = foodCategories.find(c => c.name === filters.category)?.id;
                        if (categoryId) {
                            response = await API.filterRestaurantsByCategory({
                                areaId: areaId || undefined,
                                foodCategoryId: categoryId
                            });
                        } else {
                            response = await API.getNearestRestaurants({
                                areaId: areaId || 0
                            });
                        }
                    } else if (filters.rating) {
                        response = await API.filterRestaurantsByRating({
                            areaId: areaId || undefined
                        });
                    } else if (filters.minPrice || filters.maxPrice) {
                        response = await API.filterRestaurantsByPrice({
                            areaId: areaId || undefined,
                            minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                            maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                            priceOrder: filters.priceOrder,
                        });
                    } else {
                        // Default: get nearest restaurants
                        response = await API.getNearestRestaurants({
                            areaId: areaId || 0
                        });
                    }

                    if (response.status === "success") {
                        let filteredRestaurants = response.data || [];

                        // Apply client-side filters
                        if (filters.location) {
                            filteredRestaurants = filteredRestaurants.filter(
                                restaurant => restaurant.cityName === filters.location
                            );
                        }

                        if (filters.rating) {
                            const minRating = Number(filters.rating);
                            filteredRestaurants = filteredRestaurants.filter(
                                restaurant => restaurant.ratingAvg > minRating
                            );
                        }

                        setRestaurants(filteredRestaurants);
                    } else {
                        setRestaurants([]);
                        setErrorMessage(response.message || "خطا در دریافت رستوران‌ها");
                    }
                } catch (error) {
                    setRestaurants([]);
                    setErrorMessage("خطا در ارتباط با سرور");
                    console.error("Error fetching restaurants:", error);
                }
            } else {
                // Food items section
                try {
                    let response;

                    if (filters.category) {
                        const categoryId = foodCategories.find(c => c.name === filters.category)?.id;
                        if (categoryId) {
                            response = await API.filterFoodsByCategory({
                                areaId: areaId || undefined,
                                categoryId
                            });
                        } else {
                            response = await API.getNearestFoods({
                                areaId: areaId || 0
                            });
                        }
                    } else if (filters.rating) {
                        // Use food filter by rating if available
                        response = await API.getNearestFoods({
                            areaId: areaId || 0
                        });
                    } else if (filters.minPrice || filters.maxPrice) {
                        // Use food price filter if available in API
                        response = await API.getNearestFoods({
                            areaId: areaId || 0
                        });
                    } else {
                        response = await API.getNearestFoods({
                            areaId: areaId || 0
                        });
                    }

                    if (response.status === "success") {
                        let filteredFoods = response.data || [];

                        // Apply client-side filters
                        if (filters.rating) {
                            const minRating = Number(filters.rating);
                            filteredFoods = filteredFoods.filter(
                                food => food.ratingScore > minRating
                            );
                        }

                        if (filters.popularity) {
                            const minVotes = Number(filters.popularity);
                            filteredFoods = filteredFoods.filter(
                                food => food.ratingTotalVoters > minVotes
                            );
                        }

                        if (filters.minPrice) {
                            filteredFoods = filteredFoods.filter(
                                food => food.price >= Number(filters.minPrice)
                            );
                        }

                        if (filters.maxPrice) {
                            filteredFoods = filteredFoods.filter(
                                food => food.price <= Number(filters.maxPrice)
                            );
                        }

                        // Sort by price if specified
                        if (filters.priceOrder) {
                            filteredFoods.sort((a, b) => {
                                return filters.priceOrder === "asc"
                                    ? a.price - b.price
                                    : b.price - a.price;
                            });
                        }

                        setFoodItems(filteredFoods);
                    } else {
                        setFoodItems([]);
                        setErrorMessage(response.message || "خطا در دریافت غذاها");
                    }
                } catch (error) {
                    setFoodItems([]);
                    if (areaId === null) {
                        setErrorMessage("لطفاً ابتدا مکان خود را انتخاب کنید.");
                    } else {
                        setErrorMessage("خطا در ارتباط با سرور");
                    }
                    console.error("Error fetching foods:", error);
                }
            }
            setIsLoading(false);
        };

        fetchData();
    }, [selectedCategory, areaId, filters, foodCategories]);

    const categories = [
        { name: "رستوران‌ها", icon: "burger" },
        { name: "غذا", icon: "food" },
    ];

    const fallbackImage = "https://via.placeholder.com/200x120.png?text=Placeholder";

    const getUniqueLocations = () => {
        return [...new Set(restaurants.map((r) => r.cityName))];
    };

    const clearFilters = () => {
        setFilters({
            location: "",
            category: "",
            rating: "",
            popularity: "",
            minPrice: "",
            maxPrice: "",
            priceOrder: "asc",
        });
    };

    return (
        <section className="food-section font-vazir">
            <svg style={{ position: "absolute", width: 0, height: 0 }}>
                <defs>
                    <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#00CECB", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#06B6D4", stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
            </svg>

            <div className="category-list">
                {categories.map((category) => (
                    <div
                        key={category.name}
                        className={`category-item ${selectedCategory === category.name ? "selected" : ""}`}
                        onClick={() => {
                            setSelectedCategory(category.name);
                            clearFilters();
                        }}
                    >
                        <span>{category.name}</span>
                    </div>
                ))}
            </div>

            <div className="filter-container">
                {selectedCategory === "رستوران‌ها" ? (
                    <>
                        <div className="filter-group">
                            <label className="filter-label">شهر</label>
                            <select
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            >
                                <option value="">همه شهرها</option>
                                {getUniqueLocations().map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">دسته‌بندی غذا</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">همه دسته‌بندی‌ها</option>
                                {foodCategories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">حداقل قیمت</label>
                            <input
                                type="number"
                                placeholder="حداقل قیمت"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">حداکثر قیمت</label>
                            <input
                                type="number"
                                placeholder="حداکثر قیمت"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">ترتیب قیمت</label>
                            <select
                                value={filters.priceOrder}
                                onChange={(e) => setFilters({ ...filters, priceOrder: e.target.value as "asc" | "desc" })}
                            >
                                <option value="asc">صعودی</option>
                                <option value="desc">نزولی</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="filter-group">
                            <label className="filter-label">دسته‌بندی غذا</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">همه دسته‌بندی‌ها</option>
                                {foodCategories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">محبوبیت</label>
                            <select
                                value={filters.popularity}
                                onChange={(e) => setFilters({ ...filters, popularity: e.target.value })}
                            >
                                <option value="">همه محبوبیت‌ها</option>
                                <option value="50">بیش از ۵۰ رای</option>
                                <option value="100">بیش از ۱۰۰ رای</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">حداقل قیمت</label>
                            <input
                                type="number"
                                placeholder="حداقل قیمت"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">حداکثر قیمت</label>
                            <input
                                type="number"
                                placeholder="حداکثر قیمت"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">ترتیب قیمت</label>
                            <select
                                value={filters.priceOrder}
                                onChange={(e) => setFilters({ ...filters, priceOrder: e.target.value as "asc" | "desc" })}
                            >
                                <option value="asc">صعودی</option>
                                <option value="desc">نزولی</option>
                            </select>
                        </div>
                    </>
                )}

                <div className="filter-group">
                    <label className="filter-label">امتیاز</label>
                    <select
                        value={filters.rating}
                        onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    >
                        <option value="">همه امتیازها</option>
                        <option value="4">بالاتر از ۴</option>
                        <option value="3">بالاتر از ۳</option>
                        <option value="2">بالاتر از ۲</option>
                    </select>
                </div>

                <div className="filter-group">
                    <button
                        className="clear-filters-button"
                        onClick={clearFilters}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#ff4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        پاک کردن فیلترها
                    </button>
                </div>
            </div>

            <h2 className="section-title">
                {selectedCategory === "رستوران‌ها" ? "دسته‌بندی رستوران‌ها" : "دسته‌بندی غذاها"}
                {areaId === null && (
                    <span style={{ fontSize: "14px", color: "#666", marginRight: "10px" }}>
                        (نمایش ۱۰۰ مورد اول از دیتابیس - لطفاً مکان خود را انتخاب کنید)
                    </span>
                )}
            </h2>

            {isLoading && <div className="loading">در حال بارگذاری...</div>}

            {errorMessage && (
                <div className="error-message" style={{
                    backgroundColor: "#ffe6e6",
                    color: "#d00",
                    padding: "10px",
                    borderRadius: "5px",
                    margin: "10px 0"
                }}>
                    {errorMessage}
                </div>
            )}

            <div className="restaurant-grid">
                {selectedCategory === "رستوران‌ها"
                    ? restaurants.map((item) => (
                        <Link
                            href={`/restaurant/${item.name}?rating=${item.ratingAvg}`}
                            key={item.id}
                            className="restaurant-card"
                        >
                            <div className="restaurant-image">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    onError={(e) => {
                                        e.currentTarget.src = fallbackImage;
                                        e.currentTarget.onerror = null;
                                    }}
                                />
                                <div className="rating">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        style={{ width: "16px", height: "16px", fill: "#FFFFFF" }}
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    {item.ratingAvg?.toFixed(1) || "N/A"}
                                </div>
                            </div>
                            <div className="name">{item.name}</div>
                            <div className="details" style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                                {item.cityName} • {item.ratingCount} رای
                            </div>
                        </Link>
                    ))
                    : foodItems.map((item) => (
                        <Link
                            href={`/food/${item.name}?category=${item.categoryName}&popularity=${item.ratingTotalVoters}&price=${item.price}&special=false`}
                            key={item.id}
                            className="restaurant-card"
                        >
                            <div className="restaurant-image">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    // onError={(e) => {
                                    //     e.currentTarget.src = fallbackImage;
                                    //     e.currentTarget.onerror = null;
                                    // }}
                                />
                                <div className="rating">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        style={{ width: "16px", height: "16px", fill: "#FFFFFF" }}
                                    >
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    {item.ratingScore?.toFixed(1) || "N/A"}
                                </div>
                            </div>
                            <div className="name">{item.name}</div>
                            <div className="details" style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                                {item.price.toLocaleString()} تومان • {item.restaurantName} • {item.ratingTotalVoters} رای
                            </div>
                        </Link>
                    ))}
            </div>

            {!isLoading && restaurants.length === 0 && foodItems.length === 0 && !errorMessage && (
                <div className="no-results" style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666"
                }}>
                    موردی یافت نشد. لطفاً فیلترهای خود را تغییر دهید.
                </div>
            )}
        </section>
    );
};

export default FoodSection;