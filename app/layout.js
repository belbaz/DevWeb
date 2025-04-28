import "../styles/style.css";
import "../styles/header.css";
import "../styles/footer.css";
import "../styles/home.css";

import { Cinzel, Roboto } from "next/font/google";
import ClientWrapper from "../components/clientWrapper";
import React, { Suspense } from 'react';

const cinzel = Cinzel({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-cinzel",
	display: "swap",
});

const roboto = Roboto({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-roboto",
	display: "swap",
});

export const metadata = {
	title: "MuseHome",
	description: "Une super appli web !",
};

export default function RootLayout({ children }) {
	return (
		<html lang="fr" className={`${cinzel.variable} ${roboto.variable}`}>
			<body className="font-roboto">
				<Suspense fallback={<div>Chargement...</div>}>
					<ClientWrapper>{children}</ClientWrapper>
				</Suspense>
			</body>
		</html>
	);
}
