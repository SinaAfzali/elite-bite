"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import API from '@/components/frontAPI/api'; // Adjust the import path as needed

interface City {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
}

const Header: React.FC = () => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | "">("");
  const [selectedAreaId, setSelectedAreaId] = useState<number | "">("");
  const [locationButtonText, setLocationButtonText] = useState("مکان");

  useEffect(() => {
    fetchCities();
  }, []);

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
        // Access areas directly from response (not response.data)
        setAreas(response.areas || []);

        // Also set the city name if needed
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
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;900&display=swap');
          .font-vazir {
            font-family: 'Vazirmatn', sans-serif;
          }
          .header-container {
            position: relative;
            width: 100%;
          }
          .header {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px 32px;
            background: #FFFFFF;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            border-bottom: 1px solid #E5E7EB;
            box-sizing: border-box;
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
          }
          .logo {
            font-size: 28px;
            font-weight: 700;
            white-space: nowrap;
            color: #f99245;
          }
          .logo span {
            color: #00CECB;
            background: linear-gradient(135deg, #00CECB 0%, #06B6D4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .search-container {
            flex: 1;
            max-width: 600px;
            margin: 0 24px;
            position: relative;
          }
          .search-container input {
            width: 100%;
            height: 48px;
            padding: 12px 48px 12px 16px;
            border-radius: 24px;
            border: 1px solid #E5E7EB;
            background: #F8FAFC;
            font-size: 16px;
            color: #1F2937;
            outline: none;
            text-align: right;
            transition: all 0.3s ease;
          }
          .search-container input:focus {
            border-color: #00CECB;
            box-shadow: 0 0 0 3px rgba(0, 206, 203, 0.1);
          }
          .search-container .search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            fill: #6B7280;
            transition: fill 0.3s ease;
          }
          .search-container input:focus + .search-icon {
            fill: #00CECB;
          }
          .location-button, .cart-button {
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #00CECB 0%, #06B6D4 100%);
            color: #FFFFFF;
            padding: 10px 20px;
            border-radius: 24px;
            font-size: 16px;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s ease;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0, 206, 203, 0.2);
            margin-right: 12px;
          }
          .location-button:hover, .cart-button:hover {
            background: linear-gradient(135deg, #06B6D4 0%, #00A4A3 100%);
            box-shadow: 0 4px 12px rgba(0, 206, 203, 0.3);
            transform: translateY(-1px);
          }
          .location-button svg, .cart-button img {
            width: 20px;
            height: 20px;
            margin-left: 8px;
          }
          .buttons-container {
            display: flex;
            align-items: center;
          }
          .location-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            overflow-y: auto;
          }
          .location-modal-content {
            background: #FFFFFF;
            border-radius: 16px;
            width: 100%;
            max-width: 500px;
            margin: 16px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            animation: slideDown 0.5s ease-out forwards;
            position: relative;
            direction: rtl;
          }
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .location-modal-content h2 {
            font-size: 24px;
            font-weight: 700;
            color: #333333;
            margin-bottom: 16px;
          }
          .location-modal-content select {
            width: 100%;
            padding: 12px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 16px;
            background: #F8FAFC;
            color: #1F2937;
            outline: none;
            text-align: right;
          }
          .location-modal-content select:focus {
            border-color: #00CECB;
            box-shadow: 0 0 0 3px rgba(0, 206, 203, 0.1);
          }
          .location-modal-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }
          .location-modal-buttons button {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .location-modal-buttons .confirm-button {
            background: linear-gradient(135deg, #00CECB 0%, #06B6D4 100%);
            color: #FFFFFF;
            border: none;
          }
          .location-modal-buttons .confirm-button:hover {
            background: linear-gradient(135deg, #06B6D4 0%, #00A4A3 100%);
            box-shadow: 0 4px 12px rgba(0, 206, 203, 0.3);
          }
          .location-modal-buttons .cancel-button {
            background: #F8FAFC;
            color: #333333;
            border: 1px solid #E5E7EB;
          }
          .location-modal-buttons .cancel-button:hover {
            background: #E5E7EB;
          }
          .hero-section {
            position: relative;
            min-height: 950px;
            background: linear-gradient(135deg, #E6FFFA 0%, #B0F4F3 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px 32px;
            overflow: hidden;
            z-index: 1;
          }
          .hero-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1000px;
            width: 100%;
            position: relative;
          }
          .hero-images {
            position: relative;
            flex: 0 0 400px;
            max-width: 400px;
            height: 350px;
            margin-right: 30px;
          }
          .hero-image {
            position: absolute;
            transition: all 0.3s ease;
            background: #FFFFFF;
            padding: 10px;
            border-radius: 24px;
          }
          .hero-image img {
            width: 100%;
            height: 100%;
            border-radius: 16px;
            object-fit: cover;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            border: 2px solid #FFFFFF;
          }
          .hero-image:nth-child(1) {
            width: 250px;
            height: 250px;
            top: 0;
            left: 0;
            transform: rotate(-10deg);
          }
          .hero-image:nth-child(1):hover {
            transform: rotate(-10deg) scale(1.05);
            filter: drop-shadow(0 0 25px rgba(0, 206, 203, 0.7));
          }
          .hero-image:nth-child(2) {
            width: 200px;
            height: 200px;
            top: 160px;
            left: 180px;
            transform: rotate(5deg);
          }
          .hero-image:nth-child(2):hover {
            transform: rotate(5deg) scale(1.05);
            filter: drop-shadow(0 0 25px rgba(0, 206, 203, 0.7));
          }
          .hero-image:nth-child(3) {
            width: 160px;
            height: 160px;
            top: 20px;
            left: 260px;
            transform: rotate(15deg);
          }
          .hero-image:nth-child(3):hover {
            transform: rotate(15deg) scale(1.05);
            filter: drop-shadow(0 0 25px rgba(0, 206, 203, 0.7));
          }
          .hero-text {
            flex: 1;
            max-width: 500px;
            padding: 30px;
            border-radius: 15px;
            border: 1px solid transparent;
            background-clip: padding-box;
            animation: fadeIn 1s ease-out forwards;
          }
          @keyframes fadeIn {
            to { opacity: 1; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .hero-text {
            width: 40px;
            height: 40px;
            fill: #00CECB;
            margin-bottom: 200px;
          }
          .hero-text h1 {
            font-size: 48px;
            font-weight: 700;
            color: #333333;
            margin-bottom: 20px;
            line-height: 1.2;
          }
          .hero-text p {
            font-size: 16px;
            font-weight: 400;
            color: #666666;
            margin-bottom: 30px;
            line-height: 1.5;
          }
          .hero-text .cta-container {
            display: flex;
            gap: 20px;
            opacity: 0;
            animation: fadeIn 1s ease-out 0.5s forwards;
          }
          .hero-text .cta-button {
            position: relative;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            text-decoration: none;
            border-radius: 5px;
            transition: all 0.3s ease;
          }
          .hero-text .cta-button::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: 0;
            left: 0;
            background: #333333;
            transition: width 0.3s ease;
          }
          .hero-text .cta-button:hover::after {
            width: 100%;
          }
          .hero-text .cta-button.primary {
            background: #00CECB;
            color: #FFFFFF;
          }
          .hero-text .cta-button.primary:hover {
            background: #06B6D4;
          }
          .hero-text .cta-button.secondary {
            background: transparent;
            color: #333333;
            border: 2px solid #00CECB;
          }
          .hero-text .cta-button.secondary:hover {
            background: #00CECB;
            color: #FFFFFF;
          }
          .hero-text .cta-button.secondary::after {
            background: #00CECB;
          }

          /* Responsive Styles */
          @media (max-width: 1200px) {
            .header {
              padding: 14px 24px;
            }
            .header-content {
              max-width: 95%;
            }
            .search-container {
              max-width: 500px;
              margin: 0 20px;
            }
            .hero-section {
              padding: 70px 24px;
              min-height: 650px;
            }
            .hero-content {
              max-width: 900px;
            }
            .hero-images {
              flex: 0 0 350px;
              max-width: 350px;
              height: 300px;
              margin-right: 25px;
            }
            .hero-image:nth-child(1) {
              width: 220px;
              height: 220px;
            }
            .hero-image:nth-child(2) {
              width: 175px;
              height: 175px;
              top: 140px;
              left: 160px;
            }
            .hero-image:nth-child(3) {
              width: 140px;
              height: 140px;
              top: 15px;
              left: 230px;
            }
            .hero-text {
              padding: 25px;
              max-width: 450px;
            }
            .hero-text h1 {
              font-size: 42px;
            }
            .hero-text p {
              font-size: 15px;
            }
            .location-modal-content {
              max-width: 450px;
            }
          }

          @media (max-width: 1024px) {
            .header {
              padding: 12px 20px;
            }
            .header-content {
              max-width: 90%;
            }
            .logo {
              font-size: 24px;
            }
            .search-container input {
              height: 44px;
              font-size: 15px;
            }
            .location-button, .cart-button {
              padding: 8px 16px;
              font-size: 14px;
            }
            .location-button svg, .cart-button img {
              width: 18px;
              height: 18px;
            }
            .search-container .search-icon {
              width: 22px;
              height: 22px;
            }
            .hero-section {
              padding: 60px 20px;
              min-height: 600px;
            }
            .hero-content {
              max-width: 800px;
            }
            .hero-images {
              flex: 0 0 300px;
              max-width: 300px;
              height: 250px;
              margin-right: 20px;
            }
            .hero-image:nth-child(1) {
              width: 190px;
              height: 190px;
            }
            .hero-image:nth-child(2) {
              width: 150px;
              height: 150px;
              top: 120px;
              left: 140px;
            }
            .hero-image:nth-child(3) {
              width: 120px;
              height: 120px;
              top: 10px;
              left: 200px;
            }
            .hero-text {
              padding: 20px;
              max-width: 400px;
            }
            .hero-text h1 {
              font-size: 36px;
            }
            .hero-text p {
              font-size: 14px;
              margin-bottom: 25px;
            }
            .hero-text .cta-button {
              padding: 10px 20px;
              font-size: 13px;
            }
            .hero-text {
              width: 35px;
              height: 35px;
            }
            .location-modal-content {
              max-width: 400px;
              padding: 20px;
            }
            .location-modal-content h2 {
              font-size: 22px;
            }
            .location-modal-content select {
              font-size: 15px;
            }
            .location-modal-buttons button {
              padding: 8px 16px;
              font-size: 14px;
            }
          }

          @media (max-width: 768px) {
            .header {
              padding: 10px 16px;
            }
            .header-content {
              flex-direction: column;
              align-items: stretch;
              max-width: 95%;
              gap: 12px;
            }
            .logo {
              font-size: 22px;
              text-align: center;
              margin-bottom: 12px;
            }
            .search-container {
              margin: 0;
              max-width: 100%;
            }
            .search-container input {
              height: 40px;
              font-size: 14px;
            }
            .location-button, .cart-button {
              padding: 8px 14px;
              font-size: 14px;
              justify-content: center;
            }
            .location-button svg, .cart-button img {
              width: 16px;
              height: 16px;
            }
            .search-container .search-icon {
              width: 20px;
              height: 20px;
            }
            .buttons-container {
              justify-content: center;
              gap: 10px;
            }
            .hero-section {
              flex-direction: column;
              align-items: center;
              padding: 50px 16px;
              text-align: center;
              min-height: 800px;
            }
            .hero-content {
              flex-direction: column;
              max-width: 600px;
            }
            .hero-images {
              flex: 0 0 300px;
              max-width: 300px;
              height: 250px;
              margin-right: 0;
              margin-bottom: 30px;
            }
            .hero-image:nth-child(1) {
              width: 190px;
              height: 190px;
            }
            .hero-image:nth-child(2) {
              width: 150px;
              height: 150px;
              top: 120px;
              left: 140px;
            }
            .hero-image:nth-child(3) {
              width: 120px;
              height: 120px;
              top: 10px;
              left: 200px;
            }
            .hero-text {
              max-width: 100%;
              padding: 20px;
              backdrop-filter: blur(6px);
            }
            .hero-text h1 {
              font-size: 30px;
            }
            .hero-text p {
              font-size: 14px;
              margin-bottom: 20px;
            }
            .hero-text .cta-container {
              flex-direction: column;
              gap: 12px;
            }
            .hero-text .cta-button {
              padding: 10px 18px;
              font-size: 12px;
            }
            .hero-text {
              width: 30px;
              height: 30px;
            }
            .location-modal-content {
              max-width: 90%;
              padding: 16px;
            }
            .location-modal-content h2 {
              font-size: 20px;
            }
            .location-modal-content select {
              font-size: 14px;
            }
            .location-modal-buttons button {
              padding: 8px 14px;
              font-size: 14px;
            }
          }

          @media (max-width: 480px) {
            .header {
              padding: 8px 12px;
            }
            .header-content {
              max-width: 98%;
            }
            .logo {
              font-size: 20px;
            }
            .search-container input {
              height: 36px;
              font-size: 13px;
            }
            .location-button, .cart-button {
              padding: 6px 12px;
              font-size: 12px;
            }
            .location-button svg, .cart-button img {
              width: 14px;
              height: 14px;
            }
            .search-container .search-icon {
              width: 18px;
              height: 18px;
            }
            .hero-section {
              padding: 40px 12px;
              min-height: 700px;
            }
            .hero-content {
              max-width: 400px;
            }
            .hero-images {
              flex: 0 0 250px;
              max-width: 250px;
              height: 200px;
              margin-bottom: 20px;
            }
            .hero-image:nth-child(1) {
              width: 160px;
              height: 160px;
            }
            .hero-image:nth-child(2) {
              width: 125px;
              height: 125px;
              top: 100px;
              left: 120px;
            }
            .hero-image:nth-child(3) {
              width: 100px;
              height: 100px;
              top: 5px;
              left: 160px;
            }
            .hero-text {
              padding: 15px;
            }
            .hero-text h1 {
              font-size: 26px;
            }
            .hero-text p {
              font-size: 13px;
              margin-bottom: 16px;
            }
            .hero-text .cta-button {
              padding: 8px 16px;
              font-size: 11px;
            }
            .hero-text {
              width: 25px;
              height: 25px;
            }
            .location-modal-content {
              max-width: 95%;
              padding: 12px;
            }
            .location-modal-content h2 {
              font-size: 18px;
            }
            .location-modal-content select {
              font-size: 13px;
            }
            .location-modal-buttons button {
              padding: 6px 12px;
              font-size: 12px;
            }
          }

          @media (max-width: 360px) {
            .header {
              padding: 6px 10px;
            }
            .logo {
              font-size: 18px;
            }
            .search-container input {
              height: 32px;
              font-size: 12px;
              padding: 10px 40px 10px 14px;
            }
            .search-container .search-icon {
              width: 16px;
              height: 16px;
            }
            .location-button, .cart-button {
              padding: 5px 10px;
              font-size: 11px;
            }
            .location-button svg, .cart-button img {
              width: 12px;
              height: 12px;
            }
            .hero-section {
              padding: 30px 10px;
              min-height: 650px;
            }
            .hero-content {
              max-width: 320px;
            }
            .hero-images {
              flex: 0 0 200px;
              max-width: 200px;
              height: 160px;
              margin-bottom: 15px;
            }
            .hero-image:nth-child(1) {
              width: 130px;
              height: 130px;
            }
            .hero-image:nth-child(2) {
              width: 100px;
              height: 100px;
              top: 80px;
              left: 100px;
            }
            .hero-image:nth-child(3) {
              width: 80px;
              height: 80px;
              top: 0px;
              left: 130px;
            }
            .hero-text {
              padding: 12px;
            }
            .hero-text h1 {
              font-size: 22px;
            }
            .hero-text p {
              font-size: 12px;
              margin-bottom: 14px;
            }
            .hero-text .cta-button {
              padding: 7px 14px;
              font-size: 10px;
            }
            .hero-text {
              width: 20px;
              height: 20px;
            }
            .location-modal-content {
              max-width: 98%;
              padding: 10px;
            }
            .location-modal-content h2 {
              font-size: 16px;
            }
            .location-modal-content select {
              font-size: 12px;
            }
            .location-modal-buttons button {
              padding: 5px 10px;
              font-size: 11px;
            }
          }
        `}
        </style>
        <header className="header">
          <div className="header-content">
            <div className="buttons-container">
              <Link href="/login" className="location-button">
                ورود/ثبت‌نام
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </Link>
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