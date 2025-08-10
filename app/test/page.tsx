"use client";
import React, { useEffect, useState } from "react";

interface Area {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
}

const TehranAreas: React.FC = () => {
    const [city, setCity] = useState<City | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://localhost:8000/api/area/selectById", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cityId: 1 })
        }).then((res) => {
                if (!res.ok) {
                    throw new Error(`خطا در دریافت اطلاعات: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (data.status === "success") {
                    setCity(data.city);
                    setAreas(data.areas);
                } else {
                    setError(data.message || "خطای ناشناخته");
                }
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <p>در حال بارگذاری...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto mt-8" style={{fontFamily: 'Iran-sans-regular', direction:'rtl'}}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                مناطق {city?.name}
            </h2>
            <ul className="space-y-2">
                {areas.map((area) => (
                    <li
                        key={area.id}
                        className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 rounded-md shadow-sm text-gray-700"
                    >
                        {area.name}
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default TehranAreas;
