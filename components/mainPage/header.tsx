"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API, { getData } from '@/components/frontAPI/api';
import './header.css';

interface City {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
}

const Header: React.FC = () => {
  const router = useRouter();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [, setSelectedCity] = useState("");
  const [, setSelectedArea] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | "">("");
  const [selectedAreaId, setSelectedAreaId] = useState<number | "">("");
  const [locationButtonText, setLocationButtonText] = useState("مکان");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);

  useEffect(() => {
    fetchCities();
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await getData<{ status: string; isAdminLogin: boolean }>(
          API.checkRestaurantManagerLogin
      );
      setIsLoggedIn(response.status === 'success' && response.isAdminLogin);
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      // You'll need to implement a logout endpoint in your API
      await getData(API.checkRestaurantManagerLogin + '/logout'); // Adjust this based on your actual logout endpoint
      setIsLoggedIn(false);
      setShowAuthDropdown(false);
      router.push('/');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDashboardClick = () => {
    if (isLoggedIn) {
      router.push('/restaurantManager'); // changed from '/dashboard/restaurant'
    } else {
      router.push('/login');
    }
    setShowAuthDropdown(false);
  };

  const fetchCities = async () => {
    try {
      const response = await API.getAllCities();
      if (response.status === "success") {
        setCities(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchAreas = async (cityId: number) => {
    try {
      console.log("Fetching areas for cityId:", cityId);
      const response = await API.getAreasByCityId({ cityId });
      console.log("API Response:", response);

      if (response.status === "success") {
        setAreas(response.areas || []);
        setSelectedCity(response.city.name);
      } else {
        console.error("API Error:", response.message);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const handleLocationSelect = (city: string, area: string) => {
    setSelectedCity(city);
    setSelectedArea(area);
    setLocationButtonText(`${city}, ${area}`);
    setIsLocationModalOpen(false);
  };

  return (
      <div className="header-container font-vazir">
        <header className="header">
          <div className="header-content">
            <div className="buttons-container">
              <div className="auth-dropdown-container">
                <button
                    className="location-button auth-button"
                    onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                >
                  {isLoggedIn ? 'خروج از حساب' : 'ورود/ثبت‌نام'}
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </button>
                {showAuthDropdown && (
                    <div className="auth-dropdown">
                      {!isLoggedIn && (
                          <Link href="/login" className="dropdown-item" onClick={() => setShowAuthDropdown(false)}>
                            ورود/ثبت‌نام
                          </Link>
                      )}
                      <button className="dropdown-item" onClick={handleDashboardClick}>
                        داشبورد
                      </button>
                      {isLoggedIn && (
                          <button className="dropdown-item" onClick={handleLogout}>
                            خروج از حساب
                          </button>
                      )}
                    </div>
                )}
              </div>
              <Link href="/cart" className="cart-button">
                سبد خرید
                <img src="cart.png" alt="Cart" />
              </Link>
              <button
                  className="cart-button"
                  onClick={() => setIsLocationModalOpen(true)}
              >
                {locationButtonText}
                <img src="location.png" alt="Location" />
              </button>
            </div>
            <div className="search-container">
              <input
                  type="text"
                  placeholder="...رستوران‌ها، کافه‌ها، غذاها"
                  defaultValue="...سفارش آنلاین غذا"
              />
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="search-icon"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <div className="logo">
              <span>elite</span>bite
            </div>
          </div>
        </header>
        {isLocationModalOpen && (
            <div className="location-modal">
              <div className="location-modal-content">
                <h2>انتخاب مکان</h2>
                <select
                    value={selectedCityId}
                    onChange={(e) => {
                      const id = e.target.value ? parseInt(e.target.value) : "";
                      setSelectedCityId(id);
                      setAreas([]);
                      setSelectedAreaId("");
                      if (id) {
                        fetchAreas(id);
                      }
                    }}
                >
                  <option value="">انتخاب شهر</option>
                  {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                  ))}
                </select>
                {selectedCityId && (
                    <select
                        value={selectedAreaId}
                        onChange={(e) => {
                          setSelectedAreaId(e.target.value ? parseInt(e.target.value) : "");
                        }}
                    >
                      <option value="">انتخاب منطقه</option>
                      {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                      ))}
                    </select>
                )}
                <div className="location-modal-buttons">
                  <button
                      className="confirm-button"
                      onClick={() => {
                        const cityName = cities.find((c) => c.id === selectedCityId)?.name || "";
                        const areaName = areas.find((a) => a.id === selectedAreaId)?.name || "";
                        if (cityName && areaName) {
                          handleLocationSelect(cityName, areaName);
                        }
                      }}
                      disabled={!selectedCityId || !selectedAreaId}
                  >
                    تأیید
                  </button>
                  <button
                      className="cancel-button"
                      onClick={() => setIsLocationModalOpen(false)}
                  >
                    لغو
                  </button>
                </div>
              </div>
            </div>
        )}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-images">
              <div className="hero-image">
                <img
                    src="pizza.png"
                    alt="Plate of food with burger, fries, egg, and pickles"
                />
              </div>
              <div className="hero-image">
                <img
                    src="burger.png"
                    alt="Burger with fries"
                />
              </div>
              <div className="hero-image">
                <img
                    src="drink.png"
                    alt="Pizza slice"
                />
              </div>
            </div>
            <div className="hero-text">
              <h1>یکبار بگیر مشتری شو</h1>
              <p>سفارش آنلاین غذای مورد علاقه‌تان را با سریع‌ترین زمان تجربه کنید، با بهترین کیفیت و تنوع در منو.</p>
              <div className="cta-container">
                <Link href="/restaurants" className="cta-button primary">
                  سفارش آنلاین
                </Link>
                <Link href="/location" className="cta-button secondary">
                  موقعیت ما
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Header;