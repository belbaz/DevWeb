// pages/api/forgetPassword.js

import supabase from 'lib/supabaseClient';
import bcrypt from 'bcrypt';

export default async function resetPassword(req, res) {
    if (req.method === 'POST') {
        const {token, password} = req.body;

        if (!token || !password) {
            return res.status(400).json({error: "Token ou mot de passe manquant."});
        }

        // Récupérer le token depuis la table Token
        const {data: tokenData, error: tokenError} = await supabase
            .from('Token')
            .select('pseudo, used, expires_at')
            .eq('token', token)
            .eq('type', 'reset')
            .single();

        if (tokenError || !tokenData) {
            return res.status(400).json({error: 'Token invalide'});
        }

        const {pseudo, used, expires_at} = tokenData;
        // console.log("Expire à (UTC) :", new Date(expires_at).toISOString(), " | Date actuelle (UTC) :", new Date().toISOString());
        // Vérifier si expiré ou déjà utilisé
        if (used || new Date(expires_at) < new Date()) {
            return res.status(400).json({error: 'Token expiré ou déjà utilisé'});
        }

        //tout est bon du coup on peut mettre a jour le mdp dans la BD
        try {
            // Hashage du mot de passe
            const hash = await bcrypt.hash(password, 10);

            // Update dans la bd le mot de passe hashé ☻
            const {data, error} = await supabase
                .from('User')
                .update({password: hash})
                .eq('pseudo', pseudo)
                .select();

            if (error) {
                return res.status(500).json({error: "Erreur lors de la modification du mot de passe."});
            }

            // Marquer le token comme utilisé
            await supabase
                .from('Token')
                .update({used: true})
                .eq('token', token);

            //supprimer la ligne du token
            await supabase
                .from('Token')
                .delete()
                .eq('token', token)

            //réussi
            return res.status(200).json({message: 'Mot de passe réinitialisé avec succès.'});
        } catch (error) {
            return res.status(500).json({error: "Erreur serveur."});
        }

    } else {
        return res.status(405).json({error: "Méthode non autorisée."});
    }
}
