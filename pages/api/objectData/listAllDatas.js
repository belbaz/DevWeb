import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS THE LIST OF ALL OBJECTDATA INSTANCES

export default async function handler(req, res) {
    // Ensure the method is GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if the user has permission to read data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readData) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        // Query Supabase to get all data from ObjectData
        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select('*');

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error fetching data',
                details: error.message,
            });
        }

        // Return the full list of object data
        return res.status(200).json({ objectData: data });

    } catch (err) {
        // Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
