"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import { ToastContainer } from "react-toastify";

export default function ClientWrapper({ children }) {
	const pathname = usePathname();
	const isActivationPage = pathname === "/activation";

	// Enregistrement du Service Worker
	useEffect(() => {
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("/sw.js")
					.then((registration) => {
						console.log("Service Worker registered with scope:", registration.scope);
					})
					.catch((error) => {
						console.error("Service Worker registration failed:", error);
					});
			});
		}
	}, []);

	return (
		<>
			{!isActivationPage && <Header />}
			{isActivationPage ? (
				children
			) : (
				<div className="main-wrapper">
					<div className="content-container">
						{children}
					</div>
				</div>
			)}
			{!isActivationPage && <Footer />}
			<ToastContainer />
		</>
	);
}
