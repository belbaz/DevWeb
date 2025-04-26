import supabase from 'lib/supabaseClient';


// checks wether the email is already taken or not
export default async function checkPseudo(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;

        try {
            // check if email is valid
            const { data: user } = await supabase
                .from('User')
                .select('email, isActive')
                .ilike('email', email)
                .eq('isActive', true)
                .single();

            if (user) {
                res.status(409).json({ error: "this email is already taken" });
            } else {
                res.status(200).json({ message: "email is available" });
            }

        } catch (error) {
            // handle db connection error 
            console.error("Server error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    } else { // handle method not allowed
        res.setHeader('Allow', ['POST']);
        res.status(405).send(`Method ${req.method} Not Allowed`);
    }
}
