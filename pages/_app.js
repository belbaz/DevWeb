// pages/_app.js
import '../styles/home.css';
import '../styles/header.css';
import '../styles/footer.css';
import "../styles/style.css";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        // Code pour le routeur si besoin
    }, [router]);

    return <Component {...pageProps} />;
}

export default MyApp;
