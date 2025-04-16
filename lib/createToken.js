// lib/createToken.js
import crypto from 'crypto';
import supabase from "./supabaseClient";

//création d'un token pour activation du compte et réinitialisation du mdp
export async function createToken(pseudo, type) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 heure

    console.log('Creating token for token ' + pseudo + " " + type);
    const {error} = await supabase.from('Token').insert([{
        token,
        pseudo,
        type,
        expires_at: expiresAt.toISOString(),
        used: false
    }]);

    if (error) throw new Error("Erreur lors de l'enregistrement du token");

    return token;
}
