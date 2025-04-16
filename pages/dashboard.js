import Header from '../components/header';
import Footer from '../components/footer';
import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useRouter} from "next/router";
import Rolling from "../components/rolling";

export default function dashboard() {
    const token = Cookies.get('TOKEN');
    const [pseudo, setPseudo] = useState('');
    const router = useRouter();
    const [active, setActive] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        if (!router.isReady) return;

        const checkAuth = async () => {
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
                    const res = await fetch(`/api/getAvatarUrl?token=${token}`);
                    const json = await res.json();
                    console.log("Avatar URL : " + json.url);
                    if (json.url) setAvatarUrl(json.url);
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
    }, [router.isReady, token]); // Ajoute router.isReady comme dépendance

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

        const renderAvatar = avatarUrl ? (
            <img
                src={avatarUrl}
                alt="avatar"
                title={pseudo}
                style={{maxWidth: '50px', maxHeight: '50px', width: 'auto', height: 'auto'}}
            />
        ) : (
            <div style={{margin: '5px'}}>
                {Rolling(40, 40, "#000000")}
            </div>
        );

        const commonContent = (
            <div style={{paddingTop: '15px'}}>
                {renderAvatar}
            </div>
        );

        const logoutButton = (
            <button className="popButton" onClick={handleLogout}>Logout</button>
        );

        return (
            <div>
                <Header/>
                <main>
                    <h1>{active ? 'Welcome to the dashboard' : 'Compte non activé'}</h1>
                    {active ? (
                        <div>
                            {commonContent}
                            <p>You are connected as <b>{pseudo}</b></p>
                            <p>Your account is activate 🎉</p>
                            {logoutButton}
                        </div>
                    ) : (
                        <div>
                            {commonContent}
                            <p>Votre compte n'est pas encore activé.</p>
                            <p>Si vous souhaitez recevoir un nouveau lien d'activation, recréez votre compte avec le
                                même e-mail.</p>
                            <p>Le lien d'activation est valable pendant 1 heure.</p>
                            <p>Vérifiez votre boîte de réception (et vos spams) pour le lien.</p>
                            {logoutButton}
                        </div>
                    )}
                </main>
                <Footer/>
            </div>
        );
    }
}
