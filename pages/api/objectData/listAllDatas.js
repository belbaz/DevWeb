import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS THE LIST OF ALL OBJECTDATA INSTANCES

/**
 * API Route Handler (GET only) for retrieving the full list
 * of all ObjectData entries (all instances of connected objects).
 *
 * Workflow:
 * 1. Ensure the method is GET
 * 2. Authenticate the user
 * 3. Verify if the user has permission to read data
 * 4. Query the ObjectData table for all records
 * 5. Return the data or appropriate error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with array of ObjectData or error
 */
export default async function handler(req, res) {
    // 1. Ensure the request method is GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has permission to read object data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readData) {
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        // 4. Fetch all object data entries from the database
        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select('*');

        if (error) {
            // Handle Supabase query error
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error fetching data',
                details: error.message,
            });
        }

        // 5. Return the complete list of object data entries
        return res.status(200).json({ objectData: data });

    } catch (err) {
        // 6. Catch unexpected server-side errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
