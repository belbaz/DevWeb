import Header from '../components/header';
import Footer from '../components/footer';
import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useRouter} from "next/router";
import Rolling from "../components/rolling";

export default function dashboard() {

    const [pseudo, setPseudo] = useState('');
    const router = useRouter();
    const [active, setActive] = useState(false);

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
                    setActive(data.isActive);
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
            <div>
                <Header/>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                    <p style={{fontSize: '30px', marginBottom: '5px'}}>Loading...</p>
                    <div>
                        {Rolling(50, 50, "#000000")}
                    </div>
                </div>
                <Footer/>
            </div>
        ); // Éviter de montrer le dashboard avant validation
    } else {
        return (
            <div>
                <Header/>
                {
                    active ? (
                        <main>
                            <h1>Welcome to the dashboard</h1>
                            <p>You are connected as <b>{pseudo}</b></p>
                            <p>Your account is activate 🎉</p>
                            <button className="popButton" onClick={handleLogout}>Logout</button>
                        </main>
                    ) : (
                        <main>
                            <h1>Compte non activé</h1>
                            <p>Veuillez activer votre compte pour accéder au tableau de bord.</p>
                            <p>Un e-mail d'activation vous a été envoyé.</p><p>Veuillez vérifier votre boîte de
                            réception (et vos spams).</p>
                            <button className="popButton" onClick={handleLogout}>Logout</button>
                        </main>
                    )
                }
                <Footer/>
            </div>
        );
    }
}
