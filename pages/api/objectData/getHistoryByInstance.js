import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS THE HISTORY OF CHANGES FOR A GIVEN OBJECTDATA ID

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

        // Check if the user has permission to read object history
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { id } = req.query;

        // Ensure object ID is provided
        if (!id) {
            return res.status(400).json({ error: 'Missing object ID in the URL' });
        }

        // Fetch history from ObjectDataHistory table by object ID, sorted by update date (latest first)
        const { data, error } = await supabaseClient
            .from('ObjectDataHistory')
            .select('*')
            .eq('object_data_id', id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({ error: 'Error fetching history', details: error.message });
        }

        // Return the history data
        return res.status(200).json({ history: data });

    } catch (err) {
        // Handle unexpected errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
