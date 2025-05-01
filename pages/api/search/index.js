import { getUserFromRequest } from '@/lib/getUserFromRequest';
import supabase from '@/lib/supabaseClient';

export default async function handler(req, res) {
    const { q, floors, types } = req.query;
    const user = await getUserFromRequest(req);
    const results = [];

    let query = supabase.from("Room").select("id, name, floor, roomtype");

    if (q) query = query.ilike("name", `%${q}%`);
    if (floors) {
        const parsedFloors = Array.isArray(floors) ? floors.map(Number) : floors.split(',').map(Number);
        query = query.in("floor", parsedFloors);
    }
    if (types) {
        const parsedTypes = Array.isArray(types) ? types : types.split(',');
        query = query.in("roomtype", parsedTypes);
    }

    const { data: roomData, error } = await query;
    if (error) return res.status(500).json({ error: "Supabase error" });

    // Inclure ID dans chaque pièce
    const formattedRooms = roomData.map(room => ({
        type: "Pièce",
        name: room.name,
        id: room.id
    }));

    results.push(...formattedRooms);

    if (user?.pseudo) {
        const users = ["deux", "me"];
        const filteredUsers = users
            .filter(u => q && u.toLowerCase().includes(q.toLowerCase()))
            .map(u => ({ type: "Utilisateur", name: u }));
        results.push(...filteredUsers);
    }

    return res.status(200).json(results);
}
