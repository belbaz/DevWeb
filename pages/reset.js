import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Header from '../components/header';
import Footer from '../components/footer';
import {toast, ToastContainer} from "react-toastify";

export default function Reset() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [valid] = useState('/images/valid.svg');

    useEffect(() => {
        if (router.isReady) {
            const urlToken = router.query.token;
            if (urlToken) {
                const decodedToken = decodeURIComponent(urlToken);
                setToken(decodedToken);
            }
        }
    }, [router.isReady, router.query.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(token ? '/api/resetPassword' : '/api/forgetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(token ? {token, password} : {email})
            });

            const data = await res.json();

            if (res.status === 200) {
                toast.success(data.message);
                setLoading(true);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Une erreur est survenue.");
        }
    };

    return (
        <div>
            <Header/>
            <main style={{padding: "2rem"}}>
                <h2>{token ? 'Réinitialisation du mot de passe' : 'Mot de passe oublié'}</h2>
                <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    {token ? (
                        <input
                            placeholder="Nouveau mot de passe"
                            className="inputs"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{margin: "10px 0", padding: "8px"}}
                        />
                    ) : (
                        <input
                            placeholder="Email"
                            className="inputs"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{margin: "10px 0", padding: "8px"}}
                        />
                    )}

                    <button className="button" type="submit" disabled={loading}>
                        {loading ?
                            <div>
                                <img src={valid} alt=""/>
                            </div>
                            : 'Valider'}
                    </button>
                </form>
            </main>
            <div>
                <ToastContainer/>
            </div>
            <Footer/>
        </div>
    );
}
