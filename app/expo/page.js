"use client";

import "styles/expo.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExpoPage() {
    const [expos, setExpos] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/booking/getAllExposData")
            .then((res) => res.json())
            .then((data) => setExpos(data))
            .catch((err) => console.error("Error fetching expos:", err));
    }, []);

    const handleClick = (expoId) => {
        router.push(`/seeMore?expoId=${expoId}`);
    };

    return (
        <>
            {expos.map((expo) => (
                <main key={expo.id}>
                    <div
                        className="expo-banner"
                        style={{
                            backgroundImage: `url(${expo.banner})`,
                        }}
                    >
                        <div
                            className="expo-overlay"
                            onClick={() => handleClick(expo.id)}
                        >
                            <span className="expo-more-button">See More</span>
                        </div>
                    </div>
                </main>
            ))}
        </>
    );
}
