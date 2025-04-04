import React, {useEffect, useState} from 'react';
import Header from '../components/header';
import Rolling from "../components/rolling";
import {router} from "next/client";
import Cookies from "js-cookie";

export default function login() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCookies, setloadingCookies] = useState(false);
    const [msgError, setMsgError] = useState(null);

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
        });

        const data = await response.json();

        if (response.status === 200) {
            // Ajoutez un délai avant la redirection
            setTimeout(() => {
                router.push("/dashboard");
            }, 100);
        } else if (response.status === 401) {
            setIsLoading(false);
            setMsgError("identifiant ou mot de passe incorrect");
        } else if (response.status === 500) {
            setIsLoading(false);
            console.log(data.message);
            setMsgError(data.message);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            // Vérifie si le cookie 'TOKEN' existe avant de définir loadingCookies
            const token = Cookies.get('TOKEN');

            if (!token) {
                console.log("Aucun token trouvé, redirection vers la page de connexion");
                setloadingCookies(false);
                return;
            }

            setloadingCookies(true); // Affiche le loading si le token est présent

            try {
                const response = await fetch('/api/checkToken', {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}`},
                    credentials: 'include', // Important pour envoyer les cookies
                });

                if (response.ok) {
                    await router.replace('/dashboard');
                } else {
                    console.log("Erreur lors de la connexion sur la page");


                    document.getElementById("error").innerText = "identifiant ou mot de passe incorrect";
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du token :", error);
            }
            setloadingCookies(false); // On cache le loading après la réponse du serveur
        };
        checkAuth();
    }, []);

    return (
        <div>
            <Header/>
            <main>
                <div className="body" style={{height: "auto"}}>
                    <div className="loginPage">
                        <div className="box">
                            <p className="title">Login</p>
                            <form action="/api/login" method="post" onSubmit={handleSubmit}>
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
