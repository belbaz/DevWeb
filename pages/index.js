import {useEffect, useState} from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

export default function Home() {
    const [message, setMessage] = useState('. . .');
    const [messageSupabase, setMessageSupabase] = useState('. . .');

    useEffect(async () => {
        // Appel de l'API pour obtenir le message
        fetch('/api/hello')
            .then(response => response.json())
            .then(data => setMessage(data.message));

        // Appel de l'API Supabase
        try {
            const response = await fetch('/api/supabase');
            if (response.ok) {
                setMessageSupabase(await response.json());
            } else if (response.status === 500) {
                // console.log(response.json());
                setMessageSupabase('Erreur de connexion : BD Supabase pas disponible !');
            } else {
                setMessageSupabase("Erreur lors de la connexion a la BD");
            }
        } catch (error) {
            setMessageSupabase("Erreur lors de la connexion a la BD");
        }
    }, []);

    return (
        <div>
            <Header/>
            <main>
                <h1>Welcome to the musehome</h1>
                <p>{message}</p>
                <p>{messageSupabase}</p>
            </main>
            <Footer/>
        </div>
    );
}
