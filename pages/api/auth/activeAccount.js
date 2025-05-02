// pages/api/activeAccount.js
import supabase from 'lib/supabaseClient';
import {logAction} from "lib/logAction";

// receives a token and checks if it is valid
export default async function activeAccount(req, res) {
    if (req.method === 'POST') {
        const { token } = req.body;
        try {
            // get token from token table
            const { data: tokenData, error: tokenError } = await supabase
                .from('Token')
                .select('pseudo, used, expires_at')
                .eq('token', token)
                .eq('type', 'activation')
                .single();

            if (tokenError || !tokenData) {
                return res.status(400).json({ error: 'invalid token' });
            }

            const { pseudo, used, expires_at } = tokenData;
            // checks if expired or used
            if (used || new Date(expires_at) < new Date()) {
                return res.status(400).json({ error: 'Token expired or already used' });
            }

            // activate the user account
            const { error: userError } = await supabase
                .from('User')
                .update({ isActive: true })
                .eq('pseudo', pseudo);

            if (userError) {
                return res.status(500).json({ error: "Error while activating the account :" + userError?.message });
            }

            // mark token as used
            await supabase
                .from('Token')
                .update({ used: true })
                .eq('token', token);

            // delete token line in the table
            await supabase
                .from('Token')
                .delete()
                .eq('token', token)
            await logAction(idf,"accountActivation");
            return res.status(200).json({ message: 'account successfully activated' });

        } catch (error) {
            console.error("Server error:", error);
            return res.status(500).json({ error: "Server error" });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).send(`Method ${req.method} Not Allowed`);
    }
}