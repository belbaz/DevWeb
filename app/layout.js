import "../styles/globals.css";
import "../styles/style.css";
import "../styles/header.css";
import "../styles/footer.css";
import "../styles/home.css";

import { Cinzel, Roboto } from "next/font/google";
import ClientWrapper from "../components/clientWrapper";
import { AuthProvider } from "../components/AuthContext";
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
  title: "MUSEHOME",
  description: "The house of muse !",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${roboto.variable}`}>
      <head>
        {/* Charset & viewport */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* SEO */}
        <title>MUSEHOME</title>
        <meta name="description" content="The house of muse !" />

        {/* PWA manifest + theme */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        {/* iOS support */}
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MUSEHOME" />
      </head>
      <body className="font-roboto">
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <ClientWrapper>{children}</ClientWrapper>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
