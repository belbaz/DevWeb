// pages/api/login.js

// Client Supabase
import supabase from 'lib/supabaseClient';
import { authenticate } from "lib/authenticate";

export default async function login(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send(`Method ${req.method} Not Allowed`);
    }

    const { idf, mdp } = req.body;
    try {
        let user;
        try {
            let { data, error: dbError } = await supabase
                .from('User')
                .select('*')
                .eq('pseudo', idf)
                .single();

            if (!data || dbError) {
                return res.status(401).json({ error: 'incorrect username or password' });
            }


            user = data;
        } catch (err) {
            console.error('unexpected error :', err);
            return res.status(401).json({ error: 'error while checking credentials :' + err?.message });
        }

        const authResult = await authenticate(user, mdp);

        if (!authResult || !authResult.success) { // avoid accessing to field if authResult is null
            return res.status(401).json({ error: 'incorrect password or username' });
        }
        res.setHeader("Set-Cookie", authResult.cookie);
        return res.status(200).json({ success: true, pseudo: authResult.pseudo });

    } catch (error) {
        console.error('error while connecting :', error);
        res.status(401).json({ error: 'An error has occured during connection' });
    }

}