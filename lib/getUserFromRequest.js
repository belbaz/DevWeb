// lib/getUserFromRequest.js
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import supabaseClient from './supabaseClient.js'; // ✅ import par défaut

export async function getUserFromRequest(req) {
    let token = null;

    if (req.headers.cookie) {
        const cookies = parse(req.headers.cookie);
        token = cookies.TOKEN;
    }

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret); // contient au moins le pseudo

        // Récupération des infos utilisateur (pseudo + points) en BDD
        const { data, error } = await supabaseClient
            .from('User')
            .select('pseudo, points')
            .eq('pseudo', decoded.pseudo)
            .single();

        if (error || !data) {
            console.error('Erreur récupération utilisateur en BDD :', error);
            return null;
        }

        return data; // → { pseudo: '...', points: ... }
    } catch (err) {
        console.error('JWT Error:', err.message);
        return null;
    }
}
