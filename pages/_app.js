// pages/_app.js
import '../styles/home.css';
import '../styles/header.css';
import '../styles/footer.css';

export default function App({Component, pageProps}) {
    return <Component {...pageProps} />;
}
