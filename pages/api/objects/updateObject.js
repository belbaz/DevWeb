import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

// Handler to process PUT requests (update an object)

/**
 * API Route Handler (PUT only) for updating an object in the "Object" table by its ID.
 * Requires user authentication and proper permissions.
 *
 * Workflow:
 * 1. Ensure method is PUT
 * 2. Authenticate the user
 * 3. Verify update permissions
 * 4. Validate presence of object ID
 * 5. Parse fields to update from body
 * 6. Update object in database
 * 7. Log the action
 * 8. Return updated object or error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with updated object or error
 */
export default async function handler(req, res) {
    const { id } = req.query; // Get the object ID to update from the URL

    // 1. Reject methods other than PUT
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Authenticate the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 3. Check if the user has permission to update objects
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.updateObject) {
            return res.status(403).json({ error: 'Access denied: update not allowed' });
        }

        // 4. Ensure the object ID is provided in the query
        if (!id) {
            return res.status(400).json({ error: 'Missing object ID in the URL' });
        }

        // 5. Retrieve the fields to update from the request body
        const fieldsToUpdate = req.body;

        // 6. Perform the update operation in Supabase
        const { data, error } = await supabaseClient
            .from('Object')
            .update(fieldsToUpdate)
            .eq('id', id)
            .select();

        if (error) {
            // Handle Supabase update error
            console.error('Error updating object:', error);
            return res.status(500).json({
                error: 'Supabase error',
                details: error.message,
            });
        }

        // 7. Log the update action for user tracking
        await logAction(user.pseudo, "updateObject");

        // 8. Return the updated object data
        return res.status(200).json({ updated: data });
    } catch (err) {
        // Handle unexpected server-side errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
