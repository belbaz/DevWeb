// pages/api/forgetPassword.js

import supabase from 'lib/supabaseClient';
import bcrypt from 'bcrypt';

export default async function resetPassword(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send(`Method ${req.method} Not Allowed`);
    }

    const { token, password } = req.body;

    if (!token) {
        return res.status(400).json({ error: "token missing." });
    } else if (!password) {
        return res.status(400).json({ error: "password missing." });
    }

    // get token from token table
    const { data: tokenData, error: tokenError } = await supabase
        .from('Token')
        .select('pseudo, used, expires_at')
        .eq('token', token)
        .eq('type', 'reset')
        .single();

    if (tokenError || !tokenData) {
        return res.status(400).json({ error: 'invalid token' });
    }

    const { pseudo, used, expires_at } = tokenData;
    // check if expired or already used
    if (used || new Date(expires_at) < new Date()) {
        return res.status(400).json({ error: 'Token expired or already used' });
    }

    // if we get here, then all good we can insert
    try {
        // Hashing new password
        const hash = await bcrypt.hash(password, 10);

        // update new hash in DB ☻
        const { data, error } = await supabase
            .from('User')
            .update({ password: hash })
            .eq('pseudo', pseudo)
            .select();

        if (error) {
            return res.status(500).json({ error: "DB error while changing password : " + error?.message });
        }

        // mark it as used
        await supabase
            .from('Token')
            .update({ used: true })
            .eq('token', token);

        // delete token from token table
        await supabase
            .from('Token')
            .delete()
            .eq('token', token)

        //success!!
        return res.status(200).json({ message: 'Password resetted successfully.' });
    } catch (error) {
        console.error('Error while resetting password:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
