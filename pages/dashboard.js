import Header from '../components/header';
import Footer from '../components/footer';
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import Rolling from "../components/rolling";
import {ToastContainer} from "react-toastify";

export default function dashboard() {
    const [pseudo, setPseudo] = useState('');
    const router = useRouter();
    const [active, setActive] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;

        const checkAuth = async () => {
            try {
                const response = await fetch('/api/checkToken', {
                    method: 'GET',
                    credentials: 'include', // Important pour envoyer les cookies
                });

                const data = await response.json();

                if (response.ok) {
                    setPseudo(data.pseudo);
                    setActive(data.isActive);
                    // Récupérer l'avatar
                    const res = await fetch("/api/getAvatarUrl", {
                        method: "GET",
                        credentials: "include",
                    });
                    const json = await res.json();
                    if (json.url) {
                        const img = new Image();
                        img.src = json.url;
                        img.onload = () => {
                            setAvatarUrl(json.url);
                            setIsAvatarLoaded(true);
                        };
                        img.onerror = () => {
                            console.log("erreur");
                            setAvatarUrl('/images/avatar.svg');
                            setIsAvatarLoaded(true); // En cas d'erreur, on passe aussi au rendu (optionnel : tu peux définir une URL par défaut ici)
                        };
                    } else {
                        setIsAvatarLoaded(true); // Si pas d'URL, on passe directement au rendu
                    }
                    console.log("Avatar URL : " + json.url);
                } else {
                    console.error("Erreur lors de la vérification du token");
                    if (data.invalidToken) {
                        await router.push('/login?msgError=Session+expired');
                    } else {
                        await router.push('/login');
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du token :", error);
                await router.push('/login');
            }
        };

        checkAuth();
    }, [router.isReady]); // Ajoute router.isReady comme dépendance

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {method: 'POST'});
            if (response.ok) {
                await router.replace('/login'); // Redirige vers la page de connexion
            }
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    const deleteAccount = async () => {
        try {
            const response = await fetch("/api/deleteAccount", {method: "DELETE"});
            if (response.ok) {
                toast.info("Compte supprimé !");
                setTimeout(async () => {
                    await router.replace("/login");
                }, 6000);
            }
        } catch (error) {
            console.error("Erreur :", error);
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

        const renderAvatar = isAvatarLoaded && avatarUrl ? (
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

        const deleteButton = (
            <button className="popButtonDelete" onClick={deleteAccount}>
                Delete Account
            </button>
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
                            <div>
                                {logoutButton}
                                {deleteButton}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {commonContent}
                            <p>Votre compte n'est pas encore activé.</p>
                            <p>Si vous souhaitez recevoir un nouveau lien d'activation, recréez votre compte avec le
                                même e-mail.</p>
                            <p>Le lien d'activation est valable pendant 1 heure.</p>
                            <p>Vérifiez votre boîte de réception (et vos spams) pour le lien.</p>
                            <div>
                                {logoutButton}
                                {deleteButton}
                            </div>
                        </div>
                    )}
                </main>
                <ToastContainer/>
                <Footer/>
            </div>
        );
    }
}
