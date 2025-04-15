// pages/api/signup.js
import bcrypt from 'bcrypt';
import supabase from '/lib/supabaseClient'
import {sendMail} from "../../lib/sendMail";
import {authenticate} from "../../lib/authenticate";

export default async function signup(req, res) {
    if (req.method === 'POST') {
        const {name, lastName, pseudo, email, password} = req.body;

        try {
            // Vérifier si le pseudo existe déjà
            const {data: existingUser} = await supabase
                .from('User')
                .select('pseudo')
                .ilike('pseudo', pseudo)
                .single();

            if (existingUser) {
                return res.status(409).json({error: 'Ce pseudo existe déjà'});
            }

            // Vérifier si le pseudo existe déjà
            const {data: existingEmail} = await supabase
                .from('User')
                .select('email')
                .ilike('email', email)
                .single();

            if (existingEmail) {
                return res.status(409).json({error: 'Ce mail existe déjà'});
            }

            // Hasher le mot de passe
            const hash = await bcrypt.hash(password, 10);
            //console.log(name, lastName, pseudo, email, password, hash);

            // Insérer le nouvel utilisateur
            const {data: newUser, error} = await supabase
                .from('User')
                .insert({
                    name: name,
                    lastName: lastName,
                    pseudo: pseudo,
                    email: email,
                    password: hash,
                    isActive: false,
                    level: 'debutant',
                    role: 'visiteur'
                })
                .single();

            if (error) {
                console.error('Erreur lors de la création du compte:', error);
                return res.status(500).json({error: 'Une erreur s\'est produite lors de la création du compte.'});
            }

            try {
                //envoie du mail avec la template d'activation
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

