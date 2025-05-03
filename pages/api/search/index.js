import { getUserFromRequest } from '@/lib/getUserFromRequest';
import supabase from '@/lib/supabaseClient';

export default async function handler(req, res) {
    const { q, floors, types } = req.query;
    const user = await getUserFromRequest(req);
    const results = [];

    // Requête pour les pièces
    let roomQuery = supabase.from("Room").select("id, name, floor, roomtype");

    if (q) roomQuery = roomQuery.ilike("name", `%${q}%`);
    if (floors) {
        const parsedFloors = Array.isArray(floors) ? floors.map(Number) : floors.split(',').map(Number);
        roomQuery = roomQuery.in("floor", parsedFloors);
    }
    if (types) {
        const parsedTypes = Array.isArray(types) ? types : types.split(',');
        roomQuery = roomQuery.in("roomtype", parsedTypes);
    }

    const { data: roomData, error: roomError } = await roomQuery;
    if (roomError) return res.status(500).json({ error: "Supabase Room error" });

    const formattedRooms = roomData.map(room => ({
        type: "Pièce",
        name: room.name,
        id: room.id
    }));

    results.push(...formattedRooms);

    // Requête pour les utilisateurs
    if (user?.pseudo && q) {
        const { data: userData, error: userError } = await supabase
            .from("User")
            .select("id, pseudo, name, lastName")
            .ilike("pseudo", `%${q}%`);

        if (userError) return res.status(500).json({ error: "Supabase User error" });

        const formattedUsers = userData.map(u => ({
            type: "Utilisateur",
            name: `${u.name} ${u.lastName} (${u.pseudo})`,
            id: u.id,
            pseudo: u.pseudo
        }));

        results.push(...formattedUsers);
    }

    return res.status(200).json(results);
}
