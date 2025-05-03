import supabaseClient from 'lib/supabaseClient.js';
import { getUserPermissions } from 'lib/getUserPermissions.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';
import { logAction } from "lib/logAction";

// Handler to process a POST request (create a new room)
export default async function handler(req, res) {
    // Allow only POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Check if user has permission to create a room
        const { permissions } = getUserPermissions(user.points || 0);
        if (!permissions.addObject) {
            return res.status(403).json({ error: 'Access denied: room creation not allowed' });
        }

        const { name, floor, levelAcces = 'debutant', roomtype } = JSON.parse(req.body);

        // Vérification des champs obligatoires
        if (!name || isNaN(floor) || !roomtype) {
            return res.status(400).json({ error: 'Champs obligatoires manquants ou invalides ' + name + " " + floor + " " + roomtype });
        }

        // Get the highest existing ID to generate a new one
        const { data: maxData, error: maxError } = await supabaseClient
            .from('Room')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        if (maxError) {
            console.error('Error retrieving max ID:', maxError);
            return res.status(500).json({ error: 'Error retrieving ID', details: maxError.message });
        }

        const maxId = maxData?.[0]?.id || 0;
        const newId = maxId + 1;

        // Insert new room in Supabase
        const { data, error } = await supabaseClient
            .from('Room')
            .insert([{
                id: newId,
                name,
                floor,
                levelAcces,
                roomtype
            }])
            .select();

        if (error) {
            console.error('Room creation error:', error);
            return res.status(500).json({ error: 'Supabase error', details: error.message });
        }

        await logAction(user.pseudo, "addRoom");
        return res.status(201).json({ created: data });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
}
