// pages/api/user/seUserProfil.js

import supabase from "lib/supabaseClient";
import { getUserFromRequest } from "lib/getUserFromRequest";

// get users profil
export default async function setUserProfil(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
    console.log(req.body?.data)
    const user = await getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    console.log(user);
    const { pseudo } = req.body.data;
    if (!pseudo) {
        return res.status(401).json({ error: 'Invalid data: missing pseudo fields !' });
    }

    try {
        //you are admin
        if (user.level === "expert") {
            console.log("expert")
            const { name, lastName, birthdate, gender, address, points, level, isActive } = req.body.data;
            if (name === undefined || lastName === undefined || birthdate === undefined || gender === undefined || address === undefined || points === undefined || level === undefined || isActive === undefined) {
                return res.status(401).json({ error: 'Invalid data: missing required fields.' });
            }

            //faire un update avec toutes les données
            const { data, error } = await supabase
                .from('User')
                .update(
                    {
                        name: name,
                        lastName: lastName,
                        birthdate: birthdate,
                        gender: gender,
                        address: address,
                        points: points,
                        level: level,
                        isActive: isActive
                    },
                )
                .eq('pseudo', pseudo)
                .select()


            if (error) {
                console.error("user error :", error);
                return res.status(400).json({ error: "error when update user data !" });
            }

            return res.status(200).json({ data: "update succefuly for " + pseudo });

        }
        // 2. it's your account
        else if (user.pseudo === pseudo) {

            const { name, lastName, birthdate, gender, address } = req.body.data;
            if (name === undefined || lastName === undefined || birthdate === undefined || gender === undefined || address === undefined) {
                return res.status(401).json({ error: 'Invalid data: missing required fields.' });
            }

            //faire un update avec toutes les données
            const { data, error } = await supabase
                .from('User')
                .update(
                    {
                        name: name,
                        lastName: lastName,
                        birthdate: birthdate,
                        gender: gender,
                        address: address
                    },
                )
                .eq('pseudo', pseudo)
                .select()


            if (error) {
                console.error("user error :", error);
                return res.status(400).json({ error: "error when update user data !" });
            }

            return res.status(200).json({ data: "update succefuly for " + pseudo });
        }

    } catch (err) {
        console.error("server error :", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}