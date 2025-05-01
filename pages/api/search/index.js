import supabase from 'lib/supabaseClient';
import { getUserFromRequest } from '@/lib/getUserFromRequest';

export default async function handler(req, res) {
    const { q, floors, types } = req.query;

    const results = [];

    let query = supabase.from("Room").select("*");

    if (q) {
        query = query.ilike("name", `%${q}%`);
    }

    if (floors) {
        const parsedFloors = Array.isArray(floors)
            ? floors.map(Number)
            : floors.split(',').map(Number);
        query = query.in("floor", parsedFloors);
    }

    if (types) {
        const parsedTypes = Array.isArray(types)
            ? types
            : types.split(',');
        query = query.in("roomtype", parsedTypes);
    }

    const { data: roomData, error } = await query;

    if (error) {
        console.error("Erreur Supabase :", error);
        return res.status(500).json({ error: "Erreur de requête Supabase" });
    }

    // Formater comme avant
    const formattedRooms = roomData.map(room => ({
        type: "Pièce",
        name: room.name
    }));

    results.push(...formattedRooms);

    const user = await getUserFromRequest(req);
    if (user?.pseudo) {
        const users = ["deux", "me"];
        const filteredUsers = users
            .filter(u => q && u.toLowerCase().includes(q.toLowerCase()))
            .map(u => ({ type: "Utilisateur", name: u }));

        results.push(...filteredUsers);
    }

    return res.status(200).json(results);
}
