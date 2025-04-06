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
            <title>MuseHome</title> {/* 👈 Titre global */}
            <meta name="description" content=""/>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </Head>
        <Component {...pageProps} />);

    </>);
}

export default MyApp;
