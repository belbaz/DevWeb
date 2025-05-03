import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS THE HISTORY OF CHANGES FOR A GIVEN OBJECTDATA ID

/**
 * API Route Handler (GET only) for retrieving the history of changes
 * related to a specific ObjectData entry, by its ID.
 *
 * Workflow:
 * 1. Ensure the request method is GET
 * 2. Authenticate the user
 * 3. Verify permission to read object history
 * 4. Validate the presence of the object_data_id in query
 * 5. Fetch and return the history entries from ObjectDataHistory
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with history or error
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // 1. Only allow GET requests
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has permission to view object history
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { id } = req.query;

        // 4. Validate that the object ID is present in the query
        if (!id) {
            return res.status(400).json({ error: 'Missing object ID in the URL' });
        }

        // 5. Query the ObjectDataHistory table for the object's history
        const { data, error } = await supabaseClient
            .from('ObjectDataHistory')
            .select('*')
            .eq('object_data_id', id)
            .order('updated_at', { ascending: false });

        if (error) {
            // Handle Supabase query error
            console.error('Supabase error:', error.message);
            return res.status(500).json({ error: 'Error fetching history', details: error.message });
        }

        // 6. Return the result
        return res.status(200).json({ history: data });

    } catch (err) {
        // 7. Handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
