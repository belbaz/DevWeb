import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// CRÉE UNE NOUVELLE INSTANCE DE DONNÉE (ObjectData)

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.addData) {
            return res.status(403).json({ error: 'Accès refusé : création non autorisée' });
        }

        const { data, type_Object } = req.body;

        if (!data || !type_Object) {
            return res.status(400).json({ error: 'Champs requis manquants : data et type_Object' });
        }

        // Récupère l’ID le plus élevé existant dans ObjectData
        const { data: maxData, error: maxError } = await supabaseClient
            .from('ObjectData')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        if (maxError) {
            console.error('Erreur récupération max ID :', maxError);
            return res.status(500).json({ error: 'Erreur récupération ID', details: maxError.message });
        }

        const maxId = maxData?.[0]?.id || 0;
        const newId = maxId + 1;

        // Insertion dans Supabase avec ID manuel
        const { data: insertedData, error } = await supabaseClient
            .from('ObjectData')
            .insert([{ id: newId, data, type_Object }])
            .select()
            .single();

        if (error) {
            console.error('Erreur Supabase :', error.message);
            return res.status(500).json({
                error: 'Erreur lors de la création de la donnée',
                details: error.message,
            });
        }

        return res.status(201).json({ created: insertedData });

    } catch (err) {
        console.error('Erreur serveur :', err);
        return res.status(500).json({ error: 'Erreur serveur inattendue', details: err.message });
    }
}
