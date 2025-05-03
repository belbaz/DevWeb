import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS THE HISTORY OF OBJECTS BY TYPE

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // Only GET method is allowed
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if the user has permission to read object data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { objectType } = req.query;

        // Check if objectType is provided
        if (!objectType) {
            return res.status(400).json({ error: 'Missing object type' });
        }

        // Fetch all history entries of the given object type, ordered by most recent update
        const { data, error } = await supabaseClient
            .from('ObjectDataHistory')
            .select('*')
            .eq('type_Object', objectType)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({ error: 'Error fetching history', details: error.message });
        }

        // Return the history data
        return res.status(200).json({ history: data });

    } catch (err) {
        // Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
