// pages/api/supabase.js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

//creation de la fonction asyncrone
export default async function handler(req, res) {
    try {
        // Vérifiez si la méthode HTTP est correcte (par exemple, GET)
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Méthode non autorisée' });
        }

        // Appel à Supabase pour récupérer les données de la table "devWebTEST"
        const { data: devWebTEST, error } = await supabase
            .from('devWebTEST')
            .select('*');

        // Vérifiez si une erreur survient lors de la requête
        if (error) {
            console.error('Erreur Supabase :', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        }

        // Renvoi des données dans la réponse HTTP
        // console.log(devWebTEST);
        return res.status(200).json(devWebTEST[0].nom);
    } catch (err) {
        // Gestion des erreurs imprévues
        console.error('Erreur interne du serveur :', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}