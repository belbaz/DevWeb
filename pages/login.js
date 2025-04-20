import React, {useEffect, useState} from 'react';
import Header from '../components/header';
import Rolling from "../components/rolling";
import {useRouter} from "next/router";

export default function Login({ initialMsgError = null }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCookies, setloadingCookies] = useState(false);
    const [msgError, setMsgError] = useState(initialMsgError); // Initialise avec initialMsgError

    // Gérer les paramètres de requête (msgError dans l'URL)
    useEffect(() => {
        if (router.isReady && router.query.msgError) {
            setMsgError(decodeURIComponent(router.query.msgError)); // Décoder pour gérer les espaces, etc.
            setTimeout(() => setMsgError(null), 5000); // Effacer après 5 secondes (optionnel)
        }
    }, [router.isReady, router.query.msgError]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const idf = document.getElementById("idf").value;
        const mdp = document.getElementById("mdp").value;

        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({idf, mdp}),
            credentials: "include",
        });

        const data = await response.json();

        if (response.status === 200) {
            await router.push("/dashboard");
        } else if (response.status === 401) {
            setIsLoading(false);
            setMsgError(data.error);
        } else if (response.status === 500) {
            setIsLoading(false);
            //console.log(data.message);
            setMsgError(data.error);
        }
    };

    useEffect(() => {
            const checkAuth = async () => {
                try {
                    const response = await fetch('/api/checkToken', {
                        method: 'GET',
                        credentials: 'include', // Envoie automatiquement le cookie
                    });

                    if (response.ok) {
                        setloadingCookies(true);
                        // Token valide, attendre 800 ms pour montrer la reconnexion
                        setTimeout(async () => {
                            await router.push("/dashboard");
                        }, 800);
                    } else {
                        // Token invalide ou absent
                        const data = await response.json();
                        if (data.invalidToken) {
                            setMsgError("Token expired");
                            console.log('Token invalide:', data.error);
                        } else if (data.noToken) {
                            console.log('Aucun token');
                        } else {
                            setMsgError(data.error || "Erreur inconnue");
                            console.log('Erreur API:', data.error);
                        }
                    }
                } catch
                    (error) {
                    // Erreur réseau ou autre
                    console.error("Erreur lors de la vérification du token :", error);
                    setMsgError("Erreur de connexion, veuillez réessayer");
                }
            };

            checkAuth();
        }
        ,
        [router]
    );

    return (
        <div>
            <Header/>
            <main>
                <div className="body" style={{height: "auto"}}>
                    <div className="loginPage">
                        <div className="box">
                            <p className="title">Login</p>
                            <form onSubmit={handleSubmit}>
                                <div>
                                    {loadingCookies ?
                                        (
                                            <div style={{padding: "1px 5rem"}}>
                                                {Rolling(120, 120, "#000000")}
                                                <p>Reconnexion ...</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="form-group">
                                                    <div className="formlabel">
                                                        <label className="labels" form="login">Pseudo</label>
                                                        <label className="labels" form="password">Password </label>
                                                    </div>
                                                    <div className="formlabel">
                                                        <input className="inputs" type='text' id="idf" name="idf"
                                                               maxLength="19"
                                                               required
                                                               autoComplete="username"
                                                               onClick={() => setMsgError(null)}>
                                                        </input>
                                                        <input className="inputs" type="password" id="mdp"
                                                               name="mdp"
                                                               maxLength="19"
                                                               required
                                                               autoComplete="current-password"
                                                               onClick={() => setMsgError(null)}>
                                                        </input>
                                                    </div>
                                                </div>
                                                <div style={{paddingBottom: '0.5rem'}}>
                                                    <a style={{
                                                        fontSize: "15px",
                                                        cursor: "pointer",
                                                        textDecoration: "underline"
                                                    }}
                                                       onClick={() => router.replace('/reset')}>Forgotten password
                                                    </a>
                                                </div>
                                                <button className="button" type='submit' disabled={isLoading}
                                                        style={{padding: isLoading ? "7px" : "20px"}}
                                                        onClick={() => setMsgError(null)}>
                                                    {isLoading ? (
                                                        <div>
                                                            {Rolling(50, 50, "#000000")}
                                                        </div>) : (
                                                        <span>Connexion</span>
                                                    )}
                                                </button>
                                                {isLoading ? (
                                                    <div>
                                                        <p>Connexion...</p>
                                                    </div>
                                                ) : (<div>
                                                        <p></p>
                                                    </div>
                                                )}
                                                <p className="error">{msgError}</p>
                                            </div>
                                        )
                                    }
                                </div>
                                <br/>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
