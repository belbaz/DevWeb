import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS A SINGLE OBJECTDATA ENTRY BY ID

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // Only GET method is allowed
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Authenticate user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if user has permission to read data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readData) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { id } = req.query;

        // Check if ID is provided in the request
        if (!id) {
            return res.status(400).json({ error: 'Missing instance ID in the request' });
        }

        // Fetch the entry from ObjectData table by ID
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

        // Make sure the "data" field is a valid JSON object
        if (typeof data.data !== 'object') {
            return res.status(500).json({ error: '"data" field is not a valid JSON object' });
        }

        // Return the instance
        return res.status(200).json({ instance: data });

    } catch (err) {
        // Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
