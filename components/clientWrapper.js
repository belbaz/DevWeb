"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import { ToastContainer } from "react-toastify";

export default function ClientWrapper({ children }) {
	const pathname = usePathname();
	const isActivationPage = pathname === "/activation";

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
					<ToastContainer />
				</div>
			)}
			{!isActivationPage && <Footer />}
		</>
	);
}
