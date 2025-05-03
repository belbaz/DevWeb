import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

// Handler to process a DELETE request (delete an object)
export default async function handler(req, res) {
    // Check that the method is DELETE
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Missing object ID' });
    }

    try {
        // Retrieve the user
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check permissions
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.deleteObject) {
            return res.status(403).json({ error: 'Access denied: deletion not allowed' });
        }

        // Check if the object exists
        const { data: existingObject, error: checkError } = await supabaseClient
            .from('Object')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !existingObject) {
            return res.status(404).json({ error: 'Object not found' });
        }

        // Delete the object
        const { error: deleteError } = await supabaseClient
            .from('Object')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Supabase error:', deleteError.message);
            return res.status(500).json({
                error: 'Error while deleting the object',
                details: deleteError.message,
            });
        }

        await logAction(idf, "deleteObject");
        return res.status(200).json({ success: true, message: 'Object successfully deleted' });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
