import React, {useEffect, useState} from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import Rolling from "../components/rolling";
import "../styles/style.css"
import {router} from "next/client";
import Cookies from "js-cookie";

export default function login() {
    const [isLoading, setIsLoading] = useState(false);

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

        if (response.status === 200) {
            // Ajoutez un délai avant la redirection
            setTimeout(() => {
                router.push("/dashboard");
            }, 100);
        } else if (response.status === 401) {
            setIsLoading(false);
            document.getElementById("error").innerText = "identifiant ou mot de passe incorrect";
        }
    };
    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('TOKEN');
            try {
                const response = await fetch('/api/checkToken', {
                    method: 'GET',
                    headers: {'Authorization': `Bearer ${token}`},
                    credentials: 'include', // Important pour envoyer les cookies
                });

                const data = await response.json();

                if (response.ok) {
                    await router.replace('/dashboard');
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du token :", error);
            }
        };
        checkAuth();
    }, []); // Ajoute router.isReady comme dépendance

    const clearErrorMessage = () => {
        document.getElementById("error").innerText = "";
    }

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
                                                       onClick={clearErrorMessage}>
                                                </input>
                                                <input className="inputs" type="password" id="mdp" name="mdp"
                                                       maxLength="19"
                                                       required
                                                       autoComplete="current-password"
                                                       onClick={clearErrorMessage}>
                                                </input>
                                            </div>
                                        </div>
                                        <button className="button" type='submit' disabled={isLoading}
                                                style={{padding: isLoading ? "7px" : "20px"}}
                                                onClick={clearErrorMessage}>
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
                                        <p id="error" className="error"></p>
                                    </div>
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
