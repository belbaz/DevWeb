import { getUserFromRequest } from '@/lib/getUserFromRequest';
import supabase from '@/lib/supabaseClient';

/**
 * API Route Handler (GET only) to perform a global search across Rooms and Users.
 *
 * Features:
 * - Filter rooms by name (`q`), floors (`floors`) and room types (`types`)
 * - If authenticated and `q` is provided, also search users by pseudo
 * - Results are returned as a flat list with `type` field: "Pièce" or "Utilisateur"
 *
 * @route GET /api/search
 * @queryParam {string} [q] - Optional search keyword (used for room name and user pseudo)
 * @queryParam {string|string[]} [floors] - Optional floor filter(s), can be comma-separated
 * @queryParam {string|string[]} [types] - Optional room type filter(s), can be comma-separated
 * @returns {Array} - List of matching rooms and/or users with `type`, `name`, `id`, and optionally `pseudo`
 */
export default async function handler(req, res) {
    const { q, floors, types } = req.query;

    // Get the authenticated user (if any)
    const user = await getUserFromRequest(req);

    const results = [];

    // --- ROOM QUERY ---
    let roomQuery = supabase.from("Room").select("id, name, floor, roomtype");

    if (q) {
        roomQuery = roomQuery.ilike("name", `%${q}%`);
    }

    if (floors) {
        const parsedFloors = Array.isArray(floors) ? floors.map(Number) : floors.split(',').map(Number);
        roomQuery = roomQuery.in("floor", parsedFloors);
    }

    if (types) {
        const parsedTypes = Array.isArray(types) ? types : types.split(',');
        roomQuery = roomQuery.in("roomtype", parsedTypes);
    }

    const { data: roomData, error: roomError } = await roomQuery;

    if (roomError) {
        return res.status(500).json({ error: "Supabase Room error" });
    }

    const formattedRooms = roomData.map(room => ({
        type: "Pièce",
        name: room.name,
        id: room.id
    }));

    results.push(...formattedRooms);

    // --- USER QUERY (only if logged in and `q` present) ---
    if (user?.pseudo && q) {
        const { data: userData, error: userError } = await supabase
            .from("User")
            .select("id, pseudo, name, lastName")
            .ilike("pseudo", `%${q}%`);

        if (userError) {
            return res.status(500).json({ error: "Supabase User error" });
        }

        const formattedUsers = userData.map(u => ({
            type: "Utilisateur",
            name: `${u.name} ${u.lastName} (${u.pseudo})`,
            id: u.id,
            pseudo: u.pseudo
        }));

        results.push(...formattedUsers);
    }

    // Final response: all results (rooms and users)
    return res.status(200).json(results);
}
