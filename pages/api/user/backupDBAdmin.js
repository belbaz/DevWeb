// pages/api/user/backupDBAdmin.js

import supabase from 'lib/supabaseClient';
import {getUserFromRequest} from "lib/getUserFromRequest";

export default async function backupDBAdmin(req, res) {

    try {
        // 1. get username
        const user = await getUserFromRequest(req);
        const username = user?.pseudo;

        if (!username) {
            return res.status(401).json({error: 'User not authenticated'});
        }

        // console.log(user);
        // check is admin
        if (user?.level !== "expert") {
            return res.status(403).json({error: "You don't have permission to access this resource"});
        } else {
            let {data: results, error} = await supabase
                .rpc('getbackupdb');

            if (error) {
                console.error('Erreur Supabase RPC :', error);
                return res.status(500).json({error: 'Error while backup all data in db :' + error?.message});
            }

            // console.log(results);
            return res.status(200).json({message: results});
        }
    } catch (e) {

    }
}