"use client";

import "../styles/home.css";
import "../styles/header.css";
import "../styles/footer.css";
import "../styles/style.css";

import Head from "next/head";
import { usePathname } from "next/navigation";

import Header from "../components/header";
import Footer from "../components/footer";
import { ToastContainer } from "react-toastify";
import React, { Suspense } from "react";

export default function RootLayout({ children }) {
	const pathname = usePathname();
	const isActivationPage = pathname === "/activation";

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<html lang="fr">
				<Head>
					<title>MuseHome</title>
					<meta name="description" />
					<meta charSet="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<meta name="theme-color" content="#ffffff" />

					<link rel="icon" href="/favicon/favicon.ico" />

					<link
						rel="icon"
						type="image/png"
						sizes="16x16"
						href="/favicon/favicon-16x16.png"
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="32x32"
						href="/favicon/favicon-32x32.png"
					/>

					<link
						rel="apple-touch-icon"
						sizes="180x180"
						href="/favicon/apple-touch-icon.png"
					/>

					<link
						rel="icon"
						type="image/png"
						sizes="192x192"
						href="/favicon/android-chrome-192x192.png"
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="512x512"
						href="/favicon/android-chrome-512x512.png"
					/>

					<link rel="manifest" href="/manifest.json" />
				</Head>

				<body>
					{!isActivationPage && <Header />}
					{isActivationPage ? (
						children
					) : (
						<div>
							<div style={{ height: "100Vh", margin: "auto", paddingTop: "3%" }}>
								{children}
							</div>
							<div>
								<ToastContainer />
							</div>
						</div>
					)}
					{!isActivationPage && <Footer />}
				</body>
			</html>
		</Suspense>
	);
}