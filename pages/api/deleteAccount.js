// pages/api/deleteAccount.js

import supabase from 'lib/supabaseClient';

export default async function DeleteAccount(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        //Récupérer le token (depuis header Authorization OU cookies)
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.TOKEN;

        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        //Vérifier que le token est valide via ton API /checkToken
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkToken`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const tokenData = await response.json();

        if (!response.ok || tokenData.error) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        //tout est bon, on peut continuer
        const { pseudo } = tokenData;

        //on appelle la fonction delete_account_by_pseudo présent dans supabase
        let { data: results, error } = await supabase
            .rpc('deleteaccountbypseudo', { pseudo_input: pseudo });

        console.log(error);

        // 4. Retourner une réponse
        return res.status(200).json({ message: 'salut' , pseudo: pseudo });

    } catch (error) {
        console.error('Erreur dans deleteAccount :', error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}
