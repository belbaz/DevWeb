import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// Parse JSON avec sécurité (si data est stringifiée plusieurs fois)
function parseJsonSafely(input) {
    try {
        let result = input;
        while (typeof result === 'string') {
            result = JSON.parse(result);
        }
        return result;
    } catch {
        return null;
    }
}

/**
 * API Route Handler (GET only) for retrieving a single ObjectData entry by its ID.
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readData) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Missing instance ID in the request' });
        }

        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error fetching the data instance',
                details: error.message,
            });
        }

        // ✅ Essayer de parser le champ data si c'est une string
        const parsedData = parseJsonSafely(data.data);
        if (!parsedData || typeof parsedData !== 'object') {
            return res.status(500).json({ error: 'data : "data" field is not a valid JSON object' });
        }

        // ✅ Remplacer dans l’objet retourné
        data.data = parsedData;

        return res.status(200).json({ instance: data });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
