import {useEffect, useState} from 'react';
import '../styles/home.css';
import Header from '../components/header';
import Footer from '../components/footer';

export default function home() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Appel de l'API pour obtenir le message
        fetch('/api/hello')
            .then(response => response.json())
            .then(data => setMessage(data.message));
    }, []);

    return (
        <div>
            <Header/>
            <main>
                <h1>Bienvenue sur dev web !</h1>
                <p>{message}</p>
            </main>
            <Footer/>
        </div>
    );
}
