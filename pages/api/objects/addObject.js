import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// Handler pour traiter une requête POST (création d’un nouvel objet)
export default async function handler(req, res) {
    // Refuse toute méthode autre que POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        // Récupération de l'utilisateur à partir de la requête
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifie si l'utilisateur a le droit de créer un objet
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.addObject) {
            return res.status(403).json({ error: 'Accès refusé : création non autorisée' });
        }

        // Récupère les données du nouvel objet depuis le corps de la requête
        const newObject = req.body;

        // Cherche l'ID existant le plus élevé pour créer un nouvel ID
        const { data: maxData, error: maxError } = await supabaseClient
            .from('Object')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        // Gestion des erreurs lors de la récupération du max ID
        if (maxError) {
            console.error('Erreur récupération max ID :', maxError);
            return res.status(500).json({ error: 'Erreur récupération ID', details: maxError.message });
        }

        const maxId = maxData?.[0]?.id || 0; // Prend l'ID maximum trouvé ou 0
        const newId = maxId + 1; // Définit l'ID du nouvel objet

        // Insère le nouvel objet dans Supabase avec le nouvel ID
        const { data, error } = await supabaseClient
            .from('Object')
            .insert([{ id: newId, ...newObject }])
            .select();

        // Gestion des erreurs lors de l'insertion
        if (error) {
            console.error('Erreur création objet :', error);
            return res.status(500).json({
                error: 'Erreur Supabase',
                details: error.message,
            });
        }

        // Retourne l'objet créé
        return res.status(201).json({ created: data });
    } catch (err) {
        // Gestion des erreurs inattendues
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
