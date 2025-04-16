// pages/api/activeAccount.js
import supabase from '/lib/supabaseClient';

export default async function activeAccount(req, res) {
    if (req.method === 'POST') {
        const {token} = req.body;
        // console.log(token);
        try {
            // Récupérer le token depuis la table Token
            const {data: tokenData, error: tokenError} = await supabase
                .from('Token')
                .select('pseudo, used, expires_at')
                .eq('token', token)
                .eq('type', 'activation')
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

            // Activer le compte utilisateur
            const {error: userError} = await supabase
                .from('User')
                .update({isActive: true})
                .eq('pseudo', pseudo);

            if (userError) {
                return res.status(500).json({error: "Erreur lors de l'activation du compte."});
            }

            // Marquer le token comme utilisé
            await supabase
                .from('Token')
                .update({used: true})
                .eq('token', token);

            //supprimer la ligne du token
            const { error } = await supabase
                .from('Token')
                .delete()
                .eq('token', token)

            return res.status(200).json({message: 'Compte activé avec succès'});

        } catch (error) {
            return res.status(500).json({error: "Erreur serveur"});
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}