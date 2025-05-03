import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETRIEVES THE FULL HISTORY OF A SINGLE OBJECT INSTANCE

/**
 * API Route Handler (GET only) for retrieving the full history
 * of a specific ObjectData instance by its ID.
 *
 * Workflow:
 * 1. Ensure the request method is GET
 * 2. Authenticate the user
 * 3. Check if the user has permission to read object history
 * 4. Validate the presence of the object ID in the query
 * 5. Query ObjectDataHistory by object ID, ordered by update date (newest first)
 * 6. Return the full history or an appropriate error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with history array or error
 */
export default async function handler(req, res) {
    // 1. Allow only GET method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has permission to read object history
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { id } = req.query;

        // 4. Validate that object ID is provided
        if (!id) {
            return res.status(400).json({ error: 'Missing object ID in the request' });
        }

        // 5. Fetch the full history for the given object ID from ObjectDataHistory
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

        // 6. Return the full history as JSON
        return res.status(200).json({ history: data });

    } catch (err) {
        // Catch and log unexpected server-side errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
