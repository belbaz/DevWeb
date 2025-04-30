"use client";

import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import styles from '../../styles/home.module.css';

export default function activation() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const activation = async () => {
        const token = searchParams.get('token');
        const response = await fetch("/api/auth/activeAccount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token }),
        });
        const data = await response.json();
        if (response.status === 200) {
            toast("Account activated successfully");
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } else {
            toast.error("error during activation process :", data.error);
        }
    }

    return (
        <div className={styles['activation-container']}>
            <Head>
                <title>Account activation</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div className={styles['activation-content']}>
                <p className={styles['activation-greeting']}>Hello,</p>
                <button className={styles['activate-button']} onClick={activation}>Activate my account</button>
                <p id="activation"></p>
            </div>
        </div>
    );
}
