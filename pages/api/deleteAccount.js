// pages/api/deleteAccount.js

import supabase from 'lib/supabaseClient';
import supabaseAdmin from 'lib/supabaseAdmin';

export default async function DeleteAccount(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({error: 'Méthode non autorisée'});
    }

    try {
        // 1. Récupérer le token
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.TOKEN;

        if (!token) {
            return res.status(401).json({error: 'Token manquant'});
        }

        // 2. Vérifier que le token est valide
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkToken`, {
            method: 'GET', headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const tokenData = await response.json();

        if (!response.ok || tokenData.error) {
            return res.status(401).json({error: 'Token invalide'});
        }

        const {pseudo} = tokenData;

        // 3. Supprimer l'utilisateur avec ta fonction RPC
        let {data: results, error} = await supabase
            .rpc('deleteaccountbypseudo', {pseudo_input: pseudo});

        if (error) {
            console.error('Erreur Supabase RPC :', error);
            return res.status(500).json({error: 'Erreur suppression utilisateur'});
        }

        // 4. Supprimer ses fichiers avatars dans Storage
        try {
            //Lister tous les fichiers du bucket 'avatars'
            const {data: files, error: listError} = await supabaseAdmin
                .storage
                .from('avatars')
                .list('', {limit: 1000});

            if (listError) {
                console.error('Erreur récupération fichiers avatars:', listError);
                return res.status(500).json({error: 'Erreur lors de la récupération des fichiers'});
            }

            //Trouver ceux qui commencent par `${pseudo}_avatar`
            const filesToDelete = files
                .filter(file => file.name.startsWith(`${pseudo}_avatar`))
                .map(file => file.name);

            if (filesToDelete.length === 0) {
                console.log('Aucun fichier avatar trouvé à supprimer pour ce pseudo.');
                return res.status(200).json({message: 'Aucun avatar à supprimer.'});
            }

            //Supprimer tous ces fichiers
            const {data: deleteData, error: deleteError} = await supabaseAdmin
                .storage
                .from('avatars')
                .remove(filesToDelete);

            if (deleteError) {
                console.error('Erreur suppression fichiers avatars:', deleteError);
                return res.status(500).json({error: 'Erreur lors de la suppression des avatars'});
            }
        } catch (error) {
            console.error('Erreur API suppression avatars:', error);
            return res.status(500).json({error: 'Erreur interne du serveur'});
        }


        // 5. Réponse finale
        return res.status(200).json({message: 'Compte et avatars supprimés', pseudo: pseudo});

    } catch (error) {
        console.error('Erreur dans deleteAccount :', error);
        return res.status(500).json({error: 'Erreur interne du serveur'});
    }
}