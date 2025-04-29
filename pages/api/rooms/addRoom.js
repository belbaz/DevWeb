import supabaseClient from '../../../lib/supabaseClient.js';
import { getUserPermissions } from '../../../lib/getUserPermissions.js';
import { getUserFromRequest } from '../../../lib/getUserFromRequest.js';

// Handler pour traiter une requête POST (création d’une nouvelle pièce)
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

        // Vérifie si l'utilisateur a le droit de créer une pièce
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.addObject) {
            return res.status(403).json({ error: 'Accès refusé : création de pièce non autorisée' });
        }

        // Récupère les données de la nouvelle pièce depuis le corps de la requête
        const newRoom = req.body;

        // Cherche l'ID existant le plus élevé pour créer un nouvel ID
        const { data: maxData, error: maxError } = await supabaseClient
            .from('Room')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        if (maxError) {
            console.error('Erreur récupération max ID :', maxError);
            return res.status(500).json({ error: 'Erreur récupération ID', details: maxError.message });
        }

        const maxId = maxData?.[0]?.id || 0;
        const newId = maxId + 1;

        // Insertion dans Supabase avec le nouvel ID
        const { data, error } = await supabaseClient
            .from('Room')
            .insert([{ id: newId, ...newRoom }])
            .select();

        if (error) {
            console.error('Erreur création pièce :', error);
            return res.status(500).json({
                error: 'Erreur Supabase',
                details: error.message,
            });
        }

        return res.status(201).json({ created: data });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
