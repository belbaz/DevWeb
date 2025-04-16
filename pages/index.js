import {useEffect, useState} from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

export default function Home() {
    const [message, setMessage] = useState('. . .');
    const [messageSupabase, setMessageSupabase] = useState('. . .');

    useEffect(() => {
        // Fonction async déclarée dans le scope du useEffect
        const fetchData = async () => {
            try {
                // Appel de l'API pour obtenir le message
                const res1 = await fetch('/api/hello');
                const data1 = await res1.json();
                setMessage(data1.message);

                // Appel de l'API Supabase
                const res2 = await fetch('/api/supabase');
                if (res2.ok) {
                    setMessageSupabase(await res2.json());
                } else if (res2.status === 500) {
                    setMessageSupabase('Erreur de connexion : BD Supabase pas disponible !');
                } else {
                    setMessageSupabase("Erreur lors de la connexion à la BD");
                }
            } catch (error) {
                setMessageSupabase("Erreur lors de la connexion à la BD");
            }
        };

        fetchData();
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
