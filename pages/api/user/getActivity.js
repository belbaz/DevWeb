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
        // Admin (expert) user can see all activity of all users
        if (user.level === "expert") {
            console.log("expert user - fetching all activity");

            // Fetch all activity records for all users
            let {data: HistoryActions, error} = await supabase
                .from('HistoryActions')
                .select('*')

            if (error) {
                console.error("Database error:", error);
                return res.status(400).json({error: "Failed to fetch activity data"});
            }

            if (HistoryActions.length === 0) {
                return res.status(200).json({data: HistoryActions});
            }

            return res.status(200).json({data: HistoryActions});
        }
        // Regular user can only see their own activity
        else {
            console.log("regular user - fetching personal activity");

            let {data: HistoryActions, error} = await supabase
                .from('HistoryActions')
                .select('*')
                .eq("pseudo", user.pseudo)

            if (error) {
                console.error("Database error:", error);
                return res.status(400).json({error: "Failed to fetch activity data"});
            }

            if (HistoryActions.length === 0) {
                return res.status(200).json({data: HistoryActions});
            }

            return res.status(200).json({data: HistoryActions});
        }

    } catch (err) {
        console.error("server error :", err);
        return res.status(500).json({error: "Internal server error"});
    }
}