// pages/api/checkPseudo.js

import supabase from 'lib/supabaseClient';

// check if the username is already taken
export default async function checkPseudo(req, res) {
    if (req.method === 'POST') {
        const { pseudo: username } = req.body;

        try {
            // check if username is taken
            const { data: user } = await supabase
                .from('User')
                .select('pseudo, isActive')
                .ilike('pseudo', username)
                .eq('isActive', true)
                .single();
            console.log(username);
            if (user) {
                res.status(409).json({ error: "This username is already used." });
            } else {
                res.status(200).json({ message: "This username is available" });
            }

        } catch (error) {
            console.error("Error checking username:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        // handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).send(`Method ${req.method} Not Allowed`);
    }
}