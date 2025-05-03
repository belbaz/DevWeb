import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// RETURNS ALL DATA LINKED TO A SPECIFIC OBJECT TYPE

/**
 * API Route Handler (GET only) for retrieving all ObjectData entries linked to a specific object type.
 *
 * Workflow:
 * 1. Verify HTTP method is GET
 * 2. Authenticate user from request
 * 3. Check if user has permission to read data
 * 4. Validate presence of required 'objectId' in query parameters
 * 5. Fetch all entries in ObjectData where type_Object equals objectId
 * 6. Return the data or appropriate error message
 *
 * @param {Object} req - HTTP request object (includes query and headers)
 * @param {Object} res - HTTP response object (used to send back JSON)
 * @returns {Object} - JSON response with status and objectData or error
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // 1. Ensure only GET method is allowed
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            // If authentication fails, respond with 401 Unauthorized
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has read permission based on their points
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.readData) {
            // If user lacks permission, respond with 403 Forbidden
            return res.status(403).json({ error: 'Access denied: reading not allowed' });
        }

        const { objectId } = req.query; // 4. Extract object type identifier from query parameters

        // Ensure objectId is provided in the request URL
        if (!objectId) {
            return res.status(400).json({ error: 'Missing "objectId" parameter in URL' });
        }

        // 5. Query Supabase for all entries in ObjectData with the given type_Object
        const { data, error } = await supabaseClient
            .from('ObjectData')
            .select('*')
            .eq('type_Object', objectId);

        if (error) {
            // 6. If database query fails, log error and return 500 Internal Server Error
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error fetching data',
                details: error.message,
            });
        }

        // 7. Return the fetched data as JSON
        return res.status(200).json({ objectData: data });

    } catch (err) {
        // 8. Catch and handle unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
