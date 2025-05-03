import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

// CREATE A NEW OBJECT DATA ENTRY

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        // Only POST method is allowed
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the user from the request (authentication)
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if the user has permission to add data
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.addData) {
            return res.status(403).json({ error: 'Access denied: creation not allowed' });
        }

        const { data, type_Object } = JSON.parse(req.body);

        // Check if required fields are present
        if (!data || !type_Object) {
            return res.status(400).json({ error: 'Missing required fields: data and type_Object' });
        }

        // Get the highest existing ID in ObjectData
        const { data: maxData, error: maxError } = await supabaseClient
            .from('ObjectData')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        if (maxError) {
            console.error('Error getting max ID:', maxError);
            return res.status(500).json({ error: 'Failed to get max ID', details: maxError.message });
        }

        const maxId = maxData?.[0]?.id || 0;
        const newId = maxId + 1;

        // Insert the new entry into Supabase with the manual ID
        const { data: insertedData, error } = await supabaseClient
            .from('ObjectData')
            .insert([{ id: newId, data, type_Object }])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                error: 'Error creating data',
                details: error.message,
            });
        }

        // Return the newly created data
        return res.status(201).json({ created: insertedData });

    } catch (err) {
        // Catch any unexpected server errors
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
