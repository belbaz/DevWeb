import { getUserFromRequest } from '@/lib/getUserFromRequest';
import supabase from '@/lib/supabaseClient';

export default async function handler(req, res) {
    const { q, floors, types } = req.query;

    // Tentative de récupération de l'utilisateur (non bloquant)
    let user = null;
    try {
        user = await getUserFromRequest(req);
    } catch (err) {
        console.warn("Visiteur non connecté : accès limité");
    }

    const results = [];

    // --- EXPO QUERY (accessible à tous) ---
    if (q) {
        const { data: expoData, error: expoError } = await supabase
            .from("Expo")
            .select("id, name")
            .ilike("name", `%${q}%`);

        if (!expoError && expoData) {
            const formattedExpos = expoData.map(expo => ({
                type: "Exposition",
                name: expo.name,
                id: expo.id,
            }));
            results.push(...formattedExpos);
        }
    }

    // --- ROOM QUERY (réservée aux utilisateurs connectés) ---
    if (user?.pseudo && (q || floors || types)) {
        let roomQuery = supabase.from("Room").select("id, name, floor, roomtype, expo_id");

        if (q) {
            roomQuery = roomQuery.ilike("name", `%${q}%`);
        }

        if (floors) {
            const parsedFloors = Array.isArray(floors) ? floors.map(Number) : floors.split(',').map(Number);
            roomQuery = roomQuery.in("floor", parsedFloors);
        }

        if (types) {
            const parsedTypes = Array.isArray(types) ? types : types.split(',');

            const normalTypes = parsedTypes.filter(t => !t.startsWith("exposition"));
            const expoIds = parsedTypes
                .filter(t => t.startsWith("exposition:"))
                .map(t => parseInt(t.split(":")[1], 10));

            if (normalTypes.length > 0 && expoIds.length > 0) {
                roomQuery = roomQuery.or(
                    `roomtype.in.(${normalTypes.join(",")}),and(roomtype.eq.exposition,expo_id.in.(${expoIds.join(",")}))`
                );
            } else if (normalTypes.length > 0) {
                roomQuery = roomQuery.in("roomtype", normalTypes);
            } else if (expoIds.length > 0) {
                roomQuery = roomQuery
                    .eq("roomtype", "exposition")
                    .in("expo_id", expoIds);
            }
        }

        const { data: roomData, error: roomError } = await roomQuery;

        if (roomError) {
            return res.status(500).json({ error: "Supabase Room error" });
        }

        const formattedRooms = roomData.map(room => ({
            type: "Pièce",
            name: room.name,
            id: room.id,
            roomtype: room.roomtype,
            expo_id: room.expo_id ?? null
        }));

        results.push(...formattedRooms);
    }

    // --- USER QUERY (uniquement si connecté) ---
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

    // --- OBJECTDATA QUERY (si connecté ET niveau suffisant) ---
    if (user?.level && ["intermediate", "advanced", "expert"].includes(user.level) && q) {
        const { data: objectData, error: objectError } = await supabase
            .from("ObjectData")
            .select("id, type_Object");

        if (objectError) {
            return res.status(500).json({ error: "Supabase ObjectData error" });
        }

        // Regrouper par type_Object pour générer les indices
        const typeCounters = {};
        const formattedObjects = [];

        for (const obj of objectData) {
            if (!typeCounters[obj.type_Object]) typeCounters[obj.type_Object] = [];
            typeCounters[obj.type_Object].push(obj);
        }

        for (const [type, objs] of Object.entries(typeCounters)) {
            objs.sort((a, b) => a.id - b.id);
            objs.forEach((obj, idx) => {
                const fullName = `${type} n°${idx + 1}`;
                if (fullName.toLowerCase().includes(q.toLowerCase())) {
                    formattedObjects.push({
                        type: "Objet",
                        name: fullName,
                        id: obj.id,
                    });
                }
            });
        }

        results.push(...formattedObjects);
    }

    return res.status(200).json(results);
}
