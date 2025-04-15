// pages/_app.js
import '../styles/home.css';
import '../styles/header.css';
import '../styles/footer.css';
import "../styles/style.css";
import {useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from "next/head";

function MyApp({Component, pageProps}) {
    const router = useRouter();

    useEffect(() => {
        // Code pour le routeur si besoin
    }, [router]);

    return (<>
        <Head>
            <title>MuseHome</title>
            <meta name="description" content="Une super appli web !"/>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

            {/* Favicon de base */}
            <link rel="icon" href="/favicon/favicon.ico"/>

            {/* PNG favicons */}
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png"/>

            {/* Apple Touch Icon */}
            <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png"/>

            {/* Android Chrome Icons */}
            <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png"/>
            <link rel="icon" type="image/png" sizes="512x512" href="/favicon/android-chrome-512x512.png"/>

            {/* Web App Manifest */}
            <link rel="manifest" href="/manifest.json"/>

            {/* Couleur de thème */}
            <meta name="theme-color" content="#ffffff"/>
        </Head>
        <Component {...pageProps} />
    </>);
}

export default MyApp;
