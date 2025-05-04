// pages/api/user/getActivity.js

import supabase from "lib/supabaseClient";
import {getUserFromRequest} from "lib/getUserFromRequest";

// get users profil
export default async function getActivity(req, res) {

    const user = await getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({error: 'User not authenticated'});
    }
    // console.log(user.pseudo);
    try {
        //you are admin so you can see all activity of all user
        if (user.level === "expert") {
            console.log("expert")

            let {data: HistoryActions, error} = await supabase
                .from('HistoryActions')
                .select('*')
                .eq("pseudo", user.pseudo)

            if (error) {
                console.error("user error :", error);
                return res.status(400).json({error: "user not found"});
            }
            if(HistoryActions.length === 0) {
                return res.status(200).json({data: HistoryActions});
            }

            return res.status(200).json({data: HistoryActions});
        }
        // 2. you simple user
        else {

            let {data: HistoryActions, error} = await supabase
                .from('HistoryActions')
                .select('*')
                .eq("pseudo", user.pseudo)

            if (error) {
                console.error("user error :", error);
                return res.status(400).json({error: "user not found"});
            }
            if(HistoryActions.length === 0) {
                return res.status(200).json({data: HistoryActions});
            }

            return res.status(200).json({data: HistoryActions});

        }

    } catch (err) {
        console.error("server error :", err);
        return res.status(500).json({error: "Internal server error"});
    }
}