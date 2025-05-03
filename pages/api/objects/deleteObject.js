import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from 'lib/logAction';

// Handler to process a DELETE request (delete an object)
export default async function handler(req, res) {
    const { id } = req.query; // Get the object ID from the URL

    // Reject any method other than DELETE
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Ensure object ID is provided
    if (!id) {
        return res.status(400).json({ error: 'Missing object ID in the URL' });
    }

    try {
        // Get the user from the request
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if user has permission to delete the object
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Access denied: deletion not allowed' });
        }

        // Delete the object from the 'Object' table in Supabase
        const { data, error } = await supabaseClient
            .from('Object')
            .delete()
            .eq('id', id)
            .select();

        // Handle Supabase errors
        if (error) {
            console.error('Error deleting object:', error);
            return res.status(500).json({
                error: 'Supabase error',
                details: error.message,
            });
        }

        // Log the action
        await logAction(user.pseudo, "deleteObject");

        // Return the deleted object data
        return res.status(200).json({ deleted: data });
    } catch (err) {
        // Handle unexpected server-side errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}