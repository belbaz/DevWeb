// pages/api/getObject.js

import supabase from "lib/supabaseClient";
import {getUserFromRequest} from "lib/getUserFromRequest";
import bcrypt from 'bcrypt';

// get users profil
export default async function getUserProfil(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send(`Method ${req.method} Not Allowed`);
    }

    const {password} = req.body;

    const user = await getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
    } else if (!password) {
        return res.status(401).json({ error: 'Password is missing' });
    }
    // console.log("User : " + user.pseudo);

    try {
        // Hashing new password
        const hash = await bcrypt.hash(password, 10);

        // update new hash in DB ☻
        const {data, error} = await supabase
            .from('User')
            .update({password: hash})
            .eq('pseudo', user.pseudo)
            .select();

        if (error) {
            return res.status(500).json({error: "DB error while changing password : " + error?.message});
        }

        //success!!
        return res.status(200).json({message: 'Password resetted successfully.'});

    } catch (err) {
        console.error("server error :", err);
        return res.status(500).json({error: "Internal server error"});
    }
}