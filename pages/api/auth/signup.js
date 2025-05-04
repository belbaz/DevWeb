// pages/api/signup.js
import bcrypt from 'bcrypt';
import supabase from 'lib/supabaseClient';
import { sendMail } from "lib/sendMail";
import { authenticate } from "lib/authenticate";

export default async function signup(req, res) {
    if (req.method === 'POST') {
        const { name, lastName, pseudo, email, password, gender, birthdate, address } = req.body;

        if (!name || !lastName || !pseudo || !email || !password || !gender || !birthdate || !address) {
            return res.status(400).json({ error: 'Please enter all data' });
        }

        try {
            // check if username already exists
            const { data: existingUser } = await supabase
                .from('User')
                .select('pseudo, isActive')
                .ilike('pseudo', pseudo)
                .eq('isActive', true)
                .single();

            if (existingUser) {
                return res.status(409).json({ error: 'This username is already taken' });
            }

            // check if email is already used
            const { data: existingEmail } = await supabase
                .from('User')
                .select('email, isActive')
                .ilike('email', email)
                .eq('isActive', true)
                .single();

            if (existingEmail) {
                return res.status(409).json({ error: 'This email is already used' });
            }

            // hash the password
            const hash = await bcrypt.hash(password, 10);

            // Delete all existing entries with the same pseudo or email (even inactive ones)
            // If the account already exists with the email or pseudo and is active, it will NEVER reach here!
            // We call the deleteAccountByPseudo or deleteAccountByEmail function because there might be a token in the table linked to it, which would cause issues!
            // We ignore errors because they are not critical (e.g., if the user does not exist, we do nothing)
            const { data: results1, error: deleteError1 } = await supabase
                .rpc('deleteaccountbypseudo', { pseudo_input: pseudo });

            if (deleteError1) {
                console.log('Error during deletion by pseudo (not critical if already deleted):', deleteError1);
            }

            const { data: results2, error: deleteError2 } = await supabase
                .rpc('deleteaccountbyemail', { email_input: email });

            if (deleteError2) {
                console.log('Error during deletion by email (not critical if already deleted):', deleteError2);
            }

            // then, normal INSERT
            const { data: newUser, error: insertError } = await supabase
                .from('User')
                .insert({
                    name,
                    lastName,
                    pseudo,
                    email,
                    password: hash,
                    isActive: false,
                    level: 'beginner',
                    role: 'visiteur',
                    gender: gender,
                    birthdate: birthdate,
                    address: address
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error while creating account :', insertError);
                return res.status(500).json({ error: 'Error while creating account.' });
            }

            try {
                // sending the activation email
                await sendMail(pseudo, email, true);

                //call authenticate to create the cookie and be directly logged in
                const user = { name: name, lastName: lastName, pseudo: pseudo, email: email, password: hash };
                const authResult = await authenticate(user, password);
                if (!authResult.success) {
                    return res.status(401).json({ error: 'incorrect password or username' });
                }
                // Create the cookie with the token returned by authResult
                res.setHeader("Set-Cookie", authResult.cookie);
                return res.status(200).json({ message: 'Account successfully created' });
            } catch (error) {
                console.error("Error while sending the email:", error);
                res.status(500).json({ error: "An error occurred while sending the email." });
            }

        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).json({ error: 'An error occurred during signup.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

