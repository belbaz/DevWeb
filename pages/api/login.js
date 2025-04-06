// pages/api/login.js
import jwt from 'jsonwebtoken';
import {serialize} from 'cookie';
import bcrypt from 'bcrypt';
import moment from 'moment-timezone';
import {createClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);


const login = async (req, res) => {
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

                //connexion a la BD avec les idf et mdp
                let {data: user, error} = await supabase
                    .from('User')
                    .select('*')
                    .eq('pseudo', idf)
                    .single();

                // console.log(user);
                if (error) {
                    console.error('Erreur Supabase :', error);
                    return res.status().json({error: 'Erreur serveur, veuillez réessayer plus tard.'});
                }
                if (!user) {
                    return res.status(401).json({error: 'Identifiant ou mot de passe incorrect'});
                }

                //vérification du mot de passer en comparant le hash avec le mdp hashé dans la BD
                if (bcrypt.compareSync(mdp, user.password)) {
                    if (!process.env.JWT_SECRET) {
                        throw new Error("JWT_SECRET non défini dans le fichier .env !");
                    }
                    const secret = process.env.JWT_SECRET;

                    const token = jwt.sign({pseudo: user.pseudo, exp: Math.floor(Date.now() / 1000) + 3600}, secret);

                    // Définir l'utilisateur actuel dans Supabase
                    await supabase.rpc('set_current_user', {pseudo: user.pseudo});

                    // Mise à jour de la date d'User
                    try {
                        await supabase
                            .from('User')
                            .update({
                                dateOnline: moment().tz('Europe/Paris').format(),
                            })
                            .eq('pseudo', idf);
                    } catch (error) {
                        console.error("Erreur lors de l'update de dateOnline : ", error);
                    }

                    res.setHeader('Set-Cookie', [
                        serialize('TOKEN', token, {
                            httpOnly: false,
                            secure: process.env.NODE_ENV !== 'development',
                            sameSite: 'strict',
                            maxAge: 3600,
                            path: '/',
                        })

                    ]);

                    res.status(200).json({success: true, pseudo: user.pseudo});
                } else {
                    res.status(401).json({error: 'Identifiant ou mot de passe incorrect'});
                }
            } catch (error) {
                console.error('Erreur lors de la connexion:', error);
                res.status(401).json({error: 'Une erreur s\'est produite lors de la connexion'});
            }
        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    }
;
// Exportez la fonction principale par défaut
export default login;
