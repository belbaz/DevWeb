import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

/**
 * API Route Handler (GET only) for retrieving the list of expositions.
 *
 * Workflow:
 * 1. Ensure the method is GET
 * 2. Authenticate the user
 * 3. Check user permissions
 * 4. Query the Expo table
 * 5. Return the data or error
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Authenticate user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 2. Get user permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readRoom) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        // 3. Query the Expo table
        const { data, error } = await supabaseClient
            .from('Expo')
            .select('id, name');

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error fetching exposition data',
                details: error.message,
            });
        }

        // 4. Return exposition list
        return res.status(200).json({ expos: data });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
