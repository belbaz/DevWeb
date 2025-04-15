// pages/api/forgetPassword.js
import supabase from '/lib/supabaseClient';
import CryptoJS from "crypto-js";
import bcrypt from 'bcrypt';

export default async function resetPassword(req, res) {
    if (req.method === 'POST') {
        const {token, password} = req.body;

        if (!token || !password) {
            return res.status(400).json({error: "Token ou mot de passe manquant."});
        }

        // Décryptage du token
        let decryptedPseudo = null;
        try {
            const bytesPseudo = CryptoJS.AES.decrypt(token, process.env.JWT_SECRET_KEY);
            decryptedPseudo = bytesPseudo.toString(CryptoJS.enc.Utf8);

            // Vérifie que le résultat est non vide
            if (!decryptedPseudo) {
                throw new Error("Décryptage échoué");
            }
        } catch (err) {
            return res.status(400).json({error : "Token invalide."});
        }

        try {
            // Hashage du mot de passe
            const hash = await bcrypt.hash(password, 10);

            // Update dans la bd le mot de passe hashé ☻
            const {data, error} = await supabase
                .from('User')
                .update({password: hash})
                .eq('pseudo', decryptedPseudo)
                .select();

            if (error || !data || data.length === 0) {
                return res.status(400).json({message : "Token invalide."});
            }
            //réussi
            return res.status(200).json({message: 'Mot de passe réinitialisé avec succès.'});
        } catch (error) {
            return res.status(500).json({error: "Erreur serveur."});
        }
    } else {
        return res.status(405).json({error: "Méthode non autorisée."});
    }
}
