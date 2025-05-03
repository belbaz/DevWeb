import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS ALL DATA LINKED TO A SPECIFIC OBJECT TYPE

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // Only GET method is allowed
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the user from the request (authentication)
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if the user has permission to read data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readData) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { objectId } = req.query;

        // Check if objectId is provided in the URL
        if (!objectId) {
            return res.status(400).json({ error: 'Missing "objectId" parameter in URL' });
        }

        // Fetch all data entries where type_Object matches the given objectId
        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select('*')
            .eq('type_Object', objectId);

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error fetching data',
                details: error.message,
            });
        }

        // Return the matching data
        return res.status(200).json({ objectData: data });

    } catch (err) {
        // Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
