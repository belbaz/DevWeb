// pages/api/sendMessage.js
import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";

export default async function sendMessage(req, res) {
    if (req.method === 'POST') {

        // Récupérer les données du message depuis le corps de la requête
        const { lastName, firstName, messageBy, message, email} = req.body;

        // Validation des champs
        if (!lastName || !firstName || !message || !email) {
            return res.status(400).json({ error: 'Last name, name, message and email are required' });
        }

        try {
            // Insérer le message dans la table Message
            const { data, error } = await supabase
                .from('Message')
                .insert([
                    {
                        lastName,
                        firstName,
                        messageBy: messageBy || null,
                        message,
                        email,
                        createdAt: new Date().toISOString(), // Utilisation de la date actuelle
                        read: false
                    }
                ]);

            if (error) {
                return res.status(500).json({ message: error.message });
            }

            return res.status(201).json({ message: 'Message sent successfully'});
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    } else {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
