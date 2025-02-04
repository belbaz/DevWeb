import {useEffect, useState} from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

export default function home() {
    const [message, setMessage] = useState('. . .');
    const [messageSupabase, setMessageSupabase] = useState('. . .');

    useEffect(() => {
        // Appel de l'API pour obtenir le message
        fetch('/api/hello')
            .then(response => response.json())
            .then(data => setMessage(data.message));

        // Appel de l'API Supabase
        fetch('/api/supabase')
            .then((response) => response.json())
            .then((data) => {
                setMessageSupabase(data);
            });
    }, []);

    return (
        <div>
            <Header/>
            <main>
                <h1>Bienvenue sur dev web !</h1>
                <p>{message}</p>
                <p>{messageSupabase}</p>
            </main>
            <Footer/>
        </div>
    );
}
