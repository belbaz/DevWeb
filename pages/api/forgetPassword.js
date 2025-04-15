// pages/api/forgetPassword.js
import supabase from '/lib/supabaseClient';
import {sendMail} from '../../lib/sendMail';

//function qui va créer envoyer le mail de réintialisation
export default async function forgetPassword(req, res) {
    if (req.method === 'POST') {
        const {email} = req.body;

        try {
            // Vérifie si un utilisateur existe avec cet email
            const {data: user, error} = await supabase
                .from('User')
                .select('pseudo, email')
                .eq('email', email)
                .single();

            if (error || !user) {
                return res.status(200).json({message: "Un mail de réinitialisation a été envoyé si le compte existe."});
            }
            // console.log(user);
            try {
                // Appel de ta fonction d'envoi de mail avec "reset"
                await sendMail(user.pseudo, user.email, false);

                return res.status(200).json({message: "Un mail de réinitialisation a été envoyé si le compte existe."});
            } catch (error) {
                //console.error("Erreur lors de l'envoi de l'email :", error);
                return res.status(500).json({error: "Une erreur s'est produite lors de l'envoi de l'email."});
            }

        } catch (error) {
            //console.error('Erreur lors de la récupération de l\'utilisateur :', error);
            return res.status(500).json({error: "Une erreur interne est survenue."});
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
