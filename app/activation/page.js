"use client";

import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../styles/home.module.css';

export default function activation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const notify = (text) => toast(text);

    const activation = async () => {
        const token = searchParams.get('token');
        const response = await fetch("/api/activeAccount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token }),
        });
        const data = await response.json();
        if (response.status === 200) {
            console.log("activation réussi");
            notify("Compte activé avec succes");
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } else {
            console.log("Erreur lors de l'activation");
            toast.error(data.error);
        }
    }

    return (
        <div className={styles['activation-container']}>
            <Head>
                <title>Activation de compte</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className={styles['activation-content']}>
                <p className={styles['activation-greeting']}>Bonjour,</p>
                <button className={styles['activate-button']} onClick={activation}>Activer mon compte</button>
                <p id="activation"></p>
            </div>
            <ToastContainer />
        </div>
    );
}
