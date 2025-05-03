import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS THE HISTORY OF OBJECTS BY TYPE

/**
 * API Route Handler (GET only) for retrieving the full history
 * of all ObjectData entries matching a specific object type.
 *
 * Workflow:
 * 1. Ensure the request method is GET
 * 2. Authenticate the user
 * 3. Check if the user has permission to read object history
 * 4. Validate presence of 'objectType' in query parameters
 * 5. Query ObjectDataHistory for matching type_Object entries
 * 6. Return the result or appropriate error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with history array or error
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // 1. Only allow GET method
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if user has permission to read object data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { objectType } = req.query;

        // 4. Validate that objectType is provided
        if (!objectType) {
            return res.status(400).json({ error: 'Missing object type' });
        }

        // 5. Fetch all history records for the given object type, sorted by most recent
        const { data, error } = await supabaseClient
            .from('ObjectDataHistory')
            .select('*')
            .eq('type_Object', objectType)
            .order('updated_at', { ascending: false });

        if (error) {
            // Handle database query error
            console.error('Supabase error:', error.message);
            return res.status(500).json({ error: 'Error fetching history', details: error.message });
        }

        // 6. Return the history array
        return res.status(200).json({ history: data });

    } catch (err) {
        // 7. Handle any unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
