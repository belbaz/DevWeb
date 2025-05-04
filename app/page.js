"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const [expos, setExpos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();

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
                <button onClick={() => router.push("/visitBooking")}>Visits</button>
                <button onClick={() => router.push("/expo")}>Expos</button>
            </div>
        </main>
        </>
    );
}

