"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import { ToastContainer } from "react-toastify";

export default function ClientWrapper({ children }) {
	const pathname = usePathname();
	const isActivationPage = pathname === "/activation";
	const isDashboardPage = pathname === "/dashboard";
	const isSettingsPage = pathname.includes("/settings");

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

	// Determine the class name for the wrapper based on the current path
	const getWrapperClassName = () => {
		if (isDashboardPage) return "main-wrapper dashboard-page";
		if (isSettingsPage) return "main-wrapper settings-page";
		return "main-wrapper";
	};

	return (
		<>
			{!isActivationPage && <Header />}
			{isActivationPage ? (
				children
			) : (
				<div className={getWrapperClassName()}>
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
