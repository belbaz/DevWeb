import Header from '../components/header';
import Footer from '../components/footer';
import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useRouter} from "next/router";
import Rolling from "../components/rolling";

export default function dashboard() {

    const [pseudo, setPseudo] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) return;

        const checkAuth = async () => {
            const token = Cookies.get('TOKEN');

            if (!token) {
                await router.replace('/login');
                return;
            }

            try {
                const response = await fetch('/api/checkToken', {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}`},
                    credentials: 'include', // Important pour envoyer les cookies
                });

                const data = await response.json();

                if (response.ok) {
                    setPseudo(data.pseudo);
                } else {
                    Cookies.remove('TOKEN');
                    await router.replace('/login');
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du token :", error);
                await router.replace('/login');
            }
        };
        checkAuth();
    }, [router.isReady]); // Ajoute router.isReady comme dépendance

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {method: 'POST'});
            if (response.ok) {
                Cookies.remove('TOKEN'); // Supprime aussi le cookie côté client
                router.replace('/login'); // Redirige vers la page de connexion
            }
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    if (!pseudo) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                <p style={{fontSize: '26px', marginBottom: '5px'}}>Loading...</p>
                <div>
                    {Rolling(50, 50, "#000000")}
                </div>
            </div>
        ); // Éviter de montrer le dashboard avant validation
    } else {
        return (
            <div>
                <Header/>
                <main>
                    <h1>Welcome to the dashboard</h1>
                    <p>You are connected <b>{pseudo}</b></p>
                    <button className="popButton" onClick={handleLogout}>Logout</button>
                </main>
                <Footer/>
            </div>
        );
    }
}
