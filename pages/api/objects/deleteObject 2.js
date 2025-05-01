import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// Handler pour traiter une requête DELETE (suppression d'un objet)
export default async function handler(req, res) {
    // Vérifie que la méthode est bien DELETE
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'ID de l\'objet manquant' });
    }

    try {
        // Récupère l'utilisateur
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        // Vérifie les permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Accès refusé : suppression non autorisée' });
        }

        // Vérifie si l'objet existe
        const { data: existingObject, error: checkError } = await supabaseClient
            .from('Object')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !existingObject) {
            return res.status(404).json({ error: 'Objet non trouvé' });
        }

        // Supprime l'objet
        const { error: deleteError } = await supabaseClient
            .from('Object')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Erreur Supabase :', deleteError.message);
            return res.status(500).json({
                error: 'Erreur lors de la suppression de l\'objet',
                details: deleteError.message,
            });
        }

        return res.status(200).json({ success: true, message: 'Objet supprimé avec succès' });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
