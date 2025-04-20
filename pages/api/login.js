// pages/api/login.js

// Client Supabase
import supabase from 'lib/supabaseClient';
import {authenticate} from "../../lib/authenticate";

export default async function login(req, res) {
    if (req.method === 'POST') {
        const {idf, mdp} = req.body;
        //console.log("idf : " + idf + " et mdp : " + mdp);
        try {
            //test pour voir si la BD est disponible
            const {error: dbError} = await supabase
                .from('User')
                .select('id') // ou un champ très léger
                .limit(1);

            if (dbError) {
                console.error('La base de données est indisponible :', dbError);
                return res.status(500).json({
                    message: 'Base de donnée indisponible'
                });
            }

            let user;
            try {
                //voir dans la BD si l'IDF existe et recuperer toute ces
                let {data, error} = await supabase
                    .from('User')
                    .select('*')
                    .eq('pseudo', idf)
                    .single();

                if (!data || error) {
                    return res.status(401).json({error: 'Identifiant ou mot de passe incorrect'});
                }
                user = data;
                //console.log(user);
            } catch (err) {
                console.error('Erreur inattendue :', err);
                return res.status(401).json({error: 'Identifiant ou mot de passe incorrect'});
            }

            const authResult = await authenticate(user, mdp);

            if (!authResult.success) {
                return res.status(401).json({error: 'Identifiant ou mot de passe incorrect'});
            }
            res.setHeader("Set-Cookie", authResult.cookie); // utilise authResult.cookie directement
            return res.status(200).json({success: true, pseudo: authResult.pseudo});

        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(401).json({error: 'Une erreur s\'est produite lors de la connexion'});
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}