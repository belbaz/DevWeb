import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS A SINGLE OBJECTDATA ENTRY BY ID

/**
 * API Route Handler (GET only) for retrieving a single ObjectData entry by its ID.
 *
 * Workflow:
 * 1. Ensure the method is GET
 * 2. Authenticate the user from the request
 * 3. Verify if the user has permission to read data
 * 4. Check if the "id" parameter is present in the query
 * 5. Query the ObjectData table for the given ID
 * 6. Validate the returned "data" field
 * 7. Return the entry or an appropriate error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response containing the instance or an error
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // 1. Only allow GET method
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate user from request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has permission to read data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readData) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { id } = req.query;

        // 4. Ensure the "id" parameter is provided
        if (!id) {
            return res.status(400).json({ error: 'Missing instance ID in the request' });
        }

        // 5. Fetch the object instance from ObjectData table
        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            // Handle database error
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error fetching the data instance',
                details: error.message,
            });
        }

        // 6. Ensure the "data" field contains a valid JSON object
        if (typeof data.data !== 'object') {
            return res.status(500).json({ error: '"data" field is not a valid JSON object' });
        }

        // 7. Return the object instance
        return res.status(200).json({ instance: data });

    } catch (err) {
        // 8. Catch any unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
