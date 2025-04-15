// pages/api/activeAccount.js
import supabase from '/lib/supabaseClient'
import CryptoJS from "crypto-js";

export default async function activeAccount(req, res) {
    if (req.method === 'POST') {
        const {token} = req.body;
        // console.log("token : " + token);
        const bytes = CryptoJS.AES.decrypt(token, process.env.JWT_SECRET_KEY);
        const decryptedPseudo = bytes.toString(CryptoJS.enc.Utf8);
        // console.log("decryptedPseudo: " + decryptedPseudo);

        //test pour generer le token
        // const tokenPseudoTest = CryptoJS.AES.encrypt("test", process.env.JWT_SECRET_KEY).toString();
        // const tokenTest = tokenPseudoTest.toString(CryptoJS.enc.Utf8);
        // console.log("token pour le pseudo test : " + encodeURIComponent(tokenTest));

        if (!decryptedPseudo) {
            return res.status(400).json({error: 'Token invalide'});
        }

        try {
            const {data, error} = await supabase
                .from('User')
                .update({isActive: "TRUE"})
                .eq('pseudo', decryptedPseudo)
                .select()

            if (error) {
                console.error("Erreur Supabase :", error);
                return res.status(500).json({error: "Erreur lors de l'activation du compte."});
            }
            if (!data || data.length === 0) {
                // Aucun utilisateur mis à jour
                return res.status(404).json({error: "Utilisateur introuvable"});
            }
            // Succès
            return res.status(200).json({message: "Compte activé avec succès"});
        } catch (error) {
            // Gestion des erreurs lors de la connexion à la base de données
            //console.error(error);
            res.status(500).json({error: "Une erreur s'est produite lors de la connexion à la base de données"});
        }

    } else {
        // Gérer les autres méthodes HTTP
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}