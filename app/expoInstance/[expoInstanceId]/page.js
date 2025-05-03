"use client";

import 'styles/expoInstance.css';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ExpoInstancePage() {
    const { expoInstanceId } = useParams();
    const [expo, setExpo] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [availability, setAvailability] = useState("");

    useEffect(() => {
        // Fetch data for the specific expo
        fetch("/api/booking/getAllExposData")
            .then((res) => res.json())
            .then((data) => {
                const foundExpo = data.find((e) => e.id === parseInt(expoInstanceId));
                if (foundExpo) {
                    setExpo(foundExpo);
                    setSelectedDate(foundExpo.dates[0]); // default to first date
                }
            });
    }, [expoInstanceId]);

    useEffect(() => {
        if (!expo || !selectedDate) return;

        fetch("/api/booking/expoAvailability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: expo.name, date: selectedDate }),
        })
            .then((res) => res.text())
            .then(setAvailability)
            .catch((err) => {
                console.error("Error checking availability:", err);
                setAvailability("Error checking availability");
            });
    }, [selectedDate, expo]);

    if (!expo) return <p>Loading...</p>;

    return (
        <main className="expo-instance-container">
            <div className="expo-instance-header">
                <div className="date-select-group">
                    <label htmlFor="date-select">Choose a date :&nbsp;</label>
                    <select
                        id="date-select"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    >
                        {expo.dates.map((date, index) => (
                            <option key={index} value={date}>
                                {new Date(date).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>

                {availability.includes("tickets available") && (
                    <div className="purchase-button-wrapper">
                        <button className="purchase-button">Purchase</button>
                    </div>
                )}

                <div>
                    Status : <strong>{availability}</strong>
                </div>
            </div>



            <div className="expo-instance-details-vertical">
                <div className="expo-poster-centered">
                    <img src={expo.poster} alt="Expo poster" />
                </div>
                <div className="expo-text-block">
                    <h2>{expo.theme}</h2>
                    <p>{expo.description}</p>
                </div>
            </div>


        </main>
    );
}
