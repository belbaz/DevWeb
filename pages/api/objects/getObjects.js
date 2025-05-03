import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS THE LIST OF ALL OBJECT TYPES

/**
 * API Route Handler (GET only) to retrieve the list of all object types
 * from the "Object" table in Supabase.
 *
 * Workflow:
 * 1. Ensure method is GET
 * 2. Authenticate the user
 * 3. Check user permission to read objects
 * 4. Fetch all objects from the database
 * 5. Return the list or appropriate error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with list of objects or error
 */
export default async function handler(req, res) {
    // 1. Reject requests that are not GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if user has permission to read objects
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readObject) {
            return res.status(403).json({ error: 'Access denied: reading objects not allowed' });
        }

        // 4. Query the Supabase "Object" table for all records
        const { data, error } = await supabaseClient
            .from('Object')
            .select('*');

        if (error) {
            // Handle Supabase query error
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error while fetching objects',
                details: error.message,
            });
        }

        // 5. Return the list of all object types
        return res.status(200).json({ objects: data });

    } catch (err) {
        // Handle unexpected server-side errors
        console.error('Server error:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
