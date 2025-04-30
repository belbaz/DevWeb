// pages/api/deleteAccount.js

import supabase from 'lib/supabaseClient';
import supabaseAdmin from 'lib/supabaseAdmin';
import { getUserFromRequest } from "lib/getUserFromRequest";

export default async function DeleteAccount(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // 1. get username
        const username = getUserFromRequest(req);

        if (!username) {
            return res.status(401).json({ error: 'username not found in DB' });
        }

        // 3. delete user via rpc
        let { data: results, error } = await supabase
            .rpc('deleteaccountbypseudo', { pseudo_input: username });

        if (error) {
            console.error('Erreur Supabase RPC :', error);
            return res.status(500).json({ error: 'Error while deleting user data :' + error?.message });
        }

        // 4. delete all his avatars from storage
        try {
            // list all files in the storage bucket
            const { data: files, error: listError } = await supabaseAdmin
                .storage
                .from('avatars')
                .list('', { limit: 1000 });

            if (listError) {
                console.error('Error while fetching avatars :', listError);
                return res.status(500).json({ error: 'Error while fetching avatars :' + listError?.message });
            }

            // find those who begin with `${pseudo}_avatar`
            const filesToDelete = files
                .filter(file => file.name.startsWith(`${username}_avatar`))
                .map(file => file.name);

            if (filesToDelete.length === 0) {
                return res.status(200).json({ message: 'no avatar to delete.' });
            }

            // effectively delete avatars
            const { data: deleteData, error: deleteError } = await supabaseAdmin
                .storage
                .from('avatars')
                .remove(filesToDelete);

            if (deleteError) {
                console.error('Error while deleting avatars :', deleteError);
                return res.status(500).json({ error: 'Error while deleting avatars' });
            }
        } catch (error) {
            console.error('Server error while deleting avatars :', error);
            return res.status(500).json({ error: 'Server error while deleting avatars' });
        }


        // 5. final answer
        return res.status(200).json({ message: 'account and avatars deleted', pseudo: username });

    } catch (error) {
        console.error('error in deleteAccount :', error);
        return res.status(500).json({ error: 'internal server error' });
    }
}