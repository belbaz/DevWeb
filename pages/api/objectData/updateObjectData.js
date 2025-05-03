import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.updateData) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!id) {
            return res.status(400).json({ error: 'Missing object ID in URL' });
        }

        let { data: jsonData } = req.body;

        // Si jsonData est une chaîne, on tente de la parser
        if (typeof jsonData === 'string') {
            try {
                jsonData = JSON.parse(jsonData);
            } catch (err) {
                return res.status(400).json({ error: 'Invalid JSON string in "data"' });
            }
        }

        if (!jsonData || typeof jsonData !== 'object') {
            return res.status(400).json({ error: 'Missing or invalid JSON payload' });
        }

        const { data: oldState, error: fetchError } = await supabaseClient
            .from('ObjectData')
            .select('data')
            .eq('id', id)
            .single();

        if (fetchError) {
            return res.status(500).json({ error: 'Error fetching current data', details: fetchError.message });
        }

        const updatedByValue = user.id ?? user.pseudo;
        if (!updatedByValue) {
            return res.status(500).json({ error: 'Cannot determine updatedBy value' });
        }

        const { error: insertError } = await supabaseClient
            .from('ObjectDataHistory')
            .insert([{
                object_data_id: parseInt(id, 10),
                old_data: oldState.data,
                updatedBy: updatedByValue,
                updated_at: new Date().toISOString()
            }]);

        if (insertError) {
            return res.status(500).json({ error: 'Error inserting into history', details: insertError.message });
        }

        const { data: updatedData, error: updateError } = await supabaseClient
            .from('ObjectData')
            .update({ data: jsonData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ error: 'Error updating ObjectData', details: updateError.message });
        }

        return res.status(200).json({ updated: updatedData });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
}
