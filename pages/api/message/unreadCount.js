// pages/api/message/unreadCount.js
import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";

export default async function unreadCount(req, res) {
    if (req.method === 'GET') {
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (user.level === "expert") {
            try {
                // Récupérer le nombre de messages non lus pour cet utilisateur
                const { data, error } = await supabase
                    .from('Message')
                    .select('*')
                    .eq('read', false)  // On filtre sur les messages non lus

                if (error) {
                    return res.status(500).json({ message: error.message });
                }

                // Le nombre de messages non lus
                const unreadCount = data.length;

                return res.status(200).json({ count: unreadCount });
            } catch (err) {
                return res.status(500).json({ message: err.message });
            }
        } else {
            return res.status(403).json({ error: "You don't have permission to get unread messages" });
        }
    } else {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
