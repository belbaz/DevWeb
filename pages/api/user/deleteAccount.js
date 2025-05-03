// pages/api/deleteAccount.js

import supabase from 'lib/supabaseClient';
import {getUserFromRequest} from "lib/getUserFromRequest";

export default async function DeleteAccount(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({error: `Method ${req.method} Not Allowed`});
    }

    try {
        // 1. get userToDelete
        const user = await getUserFromRequest(req);
        const {userToDelete} = req.body;

        if (!user) {
            return res.status(401).json({error: 'User not authenticated'});
        }
        console.log("user to delete : " + userToDelete + " / user : " + user.pseudo);
        if (user.pseudo === userToDelete || user.level === "expert") {
            // 3. delete user via rpc
            let {data: results, error} = await supabase
                .rpc('deleteaccountbypseudo', {pseudo_input: userToDelete});

            if (error) {
                console.error('Erreur Supabase RPC :', error);
                return res.status(500).json({error: 'Error while deleting user data :' + error?.message});
            }

            // 4. delete all his avatars from storage
            try {
                // list all files in the storage bucket
                const {data: files, error: listError} = await supabase
                    .storage
                    .from('avatars')
                    .list('', {limit: 1000});

                if (listError) {
                    console.error('Error while fetching avatars :', listError);
                    return res.status(500).json({error: 'Error while fetching avatars :' + listError?.message});
                }

                // find those who begin with `${pseudo}_avatar`
                const filesToDelete = files
                    .filter(file => file.name.startsWith(`${userToDelete}_avatar`))
                    .map(file => file.name);

                // effectively delete avatars
                const {data: deleteData, error: deleteError} = await supabase
                    .storage
                    .from('avatars')
                    .remove(filesToDelete);

                if (deleteError) {
                    console.error('Error while deleting avatars :', deleteError);
                    return res.status(500).json({error: 'Error while deleting avatars'});
                }
            } catch (error) {
                console.error('Server error while deleting avatars :', error);
                return res.status(500).json({error: 'Server error while deleting avatars'});
            }

            // 5. final answer
            return res.status(200).json({message: 'account and avatars deleted', pseudo: userToDelete});
        } else {
            return res.status(403).json({error: "You don't have permission to delete account"});
        }

    } catch (error) {
        console.error('error in deleteAccount :', error);
        return res.status(500).json({error: 'internal server error'});
    }
}