// pages/api/getMessage.js
import supabase from "lib/supabaseClient";
import {getUserFromRequest} from "lib/getUserFromRequest";

export default async function getMessage(req, res) {
    if (req.method === 'GET') {

        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({error: 'User not authenticated'});
        }

        if (user.level === "expert") {
            try {
                // Récupérer les messages par pseudo
                const {data, error} = await supabase
                    .from('Message')
                    .select('*')
                    .order('createdAt', { ascending: false });

                if (error) {
                    return res.status(500).json({message: error.message});
                }

                if (data.length === 0) {
                    return res.status(404).json({message: 'Any message'});
                }

                return res.status(200).json(data);
            } catch (err) {
                return res.status(500).json({message: err.message});
            }
        } else {
            return res.status(403).json({error: "You don't have permission to get message admin"});
        }
    } else {
        return res.status(405).json({error: `Method ${req.method} Not Allowed`});
    }
}
