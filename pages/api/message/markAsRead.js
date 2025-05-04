// pages/api/markAsRead.js
import supabase from "lib/supabaseClient";
import {getUserFromRequest} from "lib/getUserFromRequest";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const {id} = req.body;

    if (!id) return res.status(400).json({error: "Missing message ID"});

    const user = await getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({error: 'User not authenticated'});
    }

    if (user.level === "expert") {
        const {error} = await supabase
            .from("Message")
            .update({read: true})
            .eq("id", id);

        if (error) return res.status(500).json({error: error.message});

        res.status(200).json({success: true});
    } else {
        return res.status(403).json({error: "You don't have permission to get message admin"});
    }

}
