"use client";

import 'styles/home.css';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

export default function Home() {
    const [expos, setExpos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    useEffect(() => {
        fetch("/api/booking/getAllExposData")
            .then((res) => res.json())
            .then((data) => {
                const today = new Date();
                const filtered = data.filter((expo) => {
                    return [expo.dates[0], expo.dates[1], expo.dates[2]].some((d) => new Date(d) >= today);
                });
                setExpos(filtered);
            })
            .catch((err) => console.error("Error fetching expos:", err));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                expos.length > 0 ? (prevIndex + 1) % expos.length : 0
            );
        }, 3000);
        return () => clearInterval(interval);
    }, [expos]);

    const handleClick = (expoId) => {
        router.push(`/expoInstance/${expoId}`);
    };

    const checkUserAndPurchase = async () => {
        const res = await fetch("/api/user/checkUser", { method: "POST" });
        const data = await res.json();

        if (data?.pseudo) {
            router.push("/visitBooking");
        } else {
            setShowLoginDialog(true);
        }
    };

    return (
        <>
        <main>
            <div className="carousel-container">
                {expos.length > 0 && (
                    <div
                        className="carousel-banner"
                        style={{
                            backgroundImage: `url(${expos[currentIndex].banner})`,
                        }}
                    >
                        <div
                            className="carousel-overlay"
                            onClick={() => handleClick(expos[currentIndex].id)}
                        >
                            <span className="more-button">See More</span>
                        </div>
                    </div>
                )}
            </div>
        </main>

        <main>
            <div className="section-bar">
                <button className="purchase-button" onClick={checkUserAndPurchase}>Visits</button>
                <button onClick={() => router.push("/expo")}>Expos</button>
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
        </>
    );
}

