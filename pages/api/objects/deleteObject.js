import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from 'lib/logAction';

// Handler to process a DELETE request (delete an object)

/**
 * API Route Handler (DELETE only) for deleting an object from the "Object" table.
 * It also removes all associated ObjectData entries before deleting the object itself.
 *
 * Workflow:
 * 1. Ensure the method is DELETE
 * 2. Authenticate the user
 * 3. Check if user has permission to delete
 * 4. Fetch object type from Object table
 * 5. Delete all related ObjectData entries
 * 6. Delete the object
 * 7. Log the action
 * 8. Return the deleted object or an error
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - JSON response with deleted object or error
 */
export default async function handler(req, res) {
    const { id } = req.query; // Extract object ID from URL

    // 1. Allow only DELETE requests
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Validate that object ID is present
    if (!id) {
        return res.status(400).json({ error: 'Missing object ID in the URL' });
    }

    try {
        // 3. Authenticate the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // 4. Check if the user has permission to delete an object
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Access denied: deletion not allowed' });
        }

        // 5. Fetch the type of the object (needed to find related ObjectData)
        const { data: objectToDelete, error: fetchError } = await supabaseClient
            .from('Object')
            .select('type')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error fetching object type:', fetchError);
            return res.status(500).json({
                error: 'Failed to fetch object type',
                details: fetchError.message,
            });
        }

        // 6. Delete all related entries in ObjectData using type_Object match
        const { error: deleteDataError } = await supabaseClient
            .from('ObjectData')
            .delete()
            .eq('type_Object', objectToDelete.type);

        if (deleteDataError) {
            console.error('Error deleting associated ObjectData:', deleteDataError);
            return res.status(500).json({
                error: 'Failed to delete associated ObjectData',
                details: deleteDataError.message,
            });
        }

        // 7. Delete the object from the Object table
        const { data, error } = await supabaseClient
            .from('Object')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error deleting object:', error);
            return res.status(500).json({
                error: 'Supabase error',
                details: error.message,
            });
        }

        // 8. Log the deletion action
        await logAction(user.pseudo, "deleteObject");

        // Return the deleted object info
        return res.status(200).json({ deleted: data });

    } catch (err) {
        // Handle unexpected server-side errors
        console.error('Server error:', err);
        return res.status(500).json({
            error: 'Unexpected server error',
            details: err.message,
        });
    }
}
