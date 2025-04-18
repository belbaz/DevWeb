// pages/api/signup.js
import bcrypt from 'bcrypt';
import supabase from 'lib/supabaseClient';
import {sendMail} from "../../lib/sendMail";
import {authenticate} from "../../lib/authenticate";

export default async function signup(req, res) {
    if (req.method === 'POST') {
        const {name, lastName, pseudo, email, password} = req.body;

        try {
            // Vérifier si le pseudo existe déjà
            const {data: existingUser} = await supabase
                .from('User')
                .select('pseudo, isActive')
                .ilike('pseudo', pseudo)
                .eq('isActive', true)
                .single();

            if (existingUser) {
                return res.status(409).json({error: 'Ce pseudo existe déjà'});
            }

            // Vérifier si le pseudo existe déjà
            const {data: existingEmail} = await supabase
                .from('User')
                .select('email, isActive')
                .ilike('email', email)
                .eq('isActive', true)
                .single();

            if (existingEmail) {
                return res.status(409).json({error: 'Ce mail existe déjà'});
            }

            // Hasher le mot de passe
            const hash = await bcrypt.hash(password, 10);
            //console.log(name, lastName, pseudo, email, password, hash);

            // Supprimer toutes les entrées existantes avec le même pseudo ou email (même inactives)
            // Si le compte existe déjà avec le mail ou même pseudo et qu'il est actif, il ne rentrera JAMAIS ici !
            // On appelle la fonction deleteAccountByPseudo ou deleteAccountByEmail car il peut y avoir un token dans la table qui est lié et du coup ça marchera pas !
            // On ignore les erreurs car elles ne sont pas critiques (ex : si l'utilisateur n'existe pas, on ne fait rien)
            const { data: results1, error: deleteError1 } = await supabase
                .rpc('deleteaccountbypseudo', { pseudo_input: pseudo });

            if (deleteError1) {
                console.log('Erreur lors de la suppression par pseudo (pas grave si déjà supprimé):', deleteError1);
            }

            const { data: results2, error: deleteError2 } = await supabase
                .rpc('deleteaccountbyemail', { email_input: email });

            if (deleteError2) {
                console.log('Erreur lors de la suppression par email (pas grave si déjà supprimé):', deleteError2);
            }

            // Ensuite, INSERT normal
            const {data: newUser, error: insertError} = await supabase
                .from('User')
                .insert({
                    name,
                    lastName,
                    pseudo,
                    email,
                    password: hash,
                    isActive: false,
                    level: 'debutant',
                    role: 'visiteur'
                })
                .select()
                .single();

            if (insertError) {
                console.error('Erreur lors de la création du compte:', insertError);
                return res.status(500).json({error: 'Erreur lors de la création du compte.'});
            }

            try {
                //envoie du mail d'activation
                await sendMail(pseudo, email, true);

                //console.log(user)
                //appelle d'authenticate pour créer le cookie et etre directement connecté
                const user = {name: name, lastName: lastName, pseudo: pseudo, email: email, password: hash};
                const authResult = await authenticate(user, password);
                if (!authResult.success) {
                    return res.status(401).json({error: 'Identifiant ou mot de passe incorrect'});
                }
                //création du cookies avec le token qu'a renvoyé authResult
                res.setHeader("Set-Cookie", authResult.cookie);
                return res.status(200).json({message: 'Compte créé avec succès'});
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'email :", error);
                res.status(500).json({
                    error: "Une erreur s'est produite lors de l'envoi de l'email."
                });
            }

        } catch
            (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).json({error: 'Une erreur s\'est produite lors de l\'inscription.'});
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
;

