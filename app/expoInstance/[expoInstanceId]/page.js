"use client";

import 'styles/expoInstance.css';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function ExpoInstancePage() {
    const { expoInstanceId } = useParams();
    const router = useRouter();
    const [expo, setExpo] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [availability, setAvailability] = useState("");
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    useEffect(() => {
        fetch("/api/booking/getAllExposData")
            .then((res) => res.json())
            .then((data) => {
                const foundExpo = data.find((e) => e.id === parseInt(expoInstanceId));
                if (foundExpo) {
                    setExpo(foundExpo);
                    setSelectedDate(foundExpo.dates[0]);
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
            .catch(() => setAvailability("Error checking availability"));
    }, [selectedDate, expo]);

    const checkUserAndPurchase = async () => {
        const res = await fetch("/api/user/checkUser", { method: "POST" });
        const data = await res.json();

        if (data?.pseudo) {
            router.push(`/expoBooking?title=${encodeURIComponent(expo.name)}`);
        } else {
            setShowLoginDialog(true);
        }
    };

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
                        <button className="purchase-button" onClick={checkUserAndPurchase}>
                            Purchase
                        </button>
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

            <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)}>
                <DialogContent className="customDialogContent">
                    <p className="customDialogText">
                        Please log in or sign up to purchase tickets.
                    </p>
                    <div className="customDialogButtons">
                        <button className="dialogCancelBtn" onClick={() => setShowLoginDialog(false)}>Cancel</button>
                        <button className="dialogPayBtn" onClick={() => router.push('/login')}>Login</button>
                        <button className="dialogPayBtn" onClick={() => router.push('/signup')}>Sign Up</button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}
