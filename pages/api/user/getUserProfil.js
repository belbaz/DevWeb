// pages/api/getObject.js

import supabase from "lib/supabaseClient";
import {getUserFromRequest} from "lib/getUserFromRequest";

// get users profil
export default async function getUserProfil(req, res) {

    const pseudoProfil = req.query.pseudo;
    // console.log(pseudoProfil);

    const user = await getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    // console.log("User : " + user.pseudo + " level : " + user.level);

    try {
        // 1. it's your account ou you are level expert !
        if (user.pseudo === pseudoProfil || user.level === "expert") {
            const {data: userData, error: userError} = await supabase
                .from('User')
                .select('name, lastName, pseudo, email, isActive, gender, level, role, address, points, birthday')
                .eq('pseudo', pseudoProfil)
                .single();

            if (userError || !userData) {
                console.error("user error :", userError);
                return res.status(400).json({error: "user not found"});
            }

            return res.status(200).json({data: userData});
        } else {
            const {data: userProfil, error: userError} = await supabase
                .from('User')
                .select('name, lastName, pseudo, gender, level, points, birthday')
                .eq('pseudo', pseudoProfil)
                .single();

            if (userError || !userProfil) {
                console.error("user error :", userError);
                return res.status(400).json({error: "user not found"});
            }

            return res.status(200).json({data: userProfil});
        }


        // 3. return the objects
        // return res.status(200).json({objets});

    } catch (err) {
        console.error("server error :", err);
        return res.status(500).json({error: "Internal server error"});
    }
}