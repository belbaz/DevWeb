import supabaseClient from 'lib/supabaseClient.js';
import { getUserFromRequest } from 'lib/getUserFromRequest.js';

export default async function handler(req, res) {
    // Vérifie que la méthode est bien POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Récupère l'utilisateur actuel depuis la requête
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthenticated user' });
        }

        // Récupère les points à ajouter depuis le corps de la requête
        const { points } = req.body;
        
        // Vérifie que points est un nombre valide
        if (isNaN(points) || typeof points !== 'number') {
            return res.status(400).json({ error: 'Invalid points value' });
        }

        // Récupère les points actuels de l'utilisateur
        const { data: userData, error: fetchError } = await supabaseClient
            .from('User')
            .select('points')
            .eq('pseudo', user.pseudo)
            .single();

        if (fetchError) {
            console.error('Error fetching user points:', fetchError);
            return res.status(500).json({ error: 'Error fetching user data' });
        }

        // Calcule les nouveaux points (en s'assurant qu'ils ne soient pas négatifs)
        const currentPoints = userData.points || 0;
        const newPoints = Math.max(0, currentPoints + points);

        // Met à jour les points de l'utilisateur
        const { error: updateError } = await supabaseClient
            .from('User')
            .update({ points: newPoints })
            .eq('pseudo', user.pseudo);

        if (updateError) {
            console.error('Error updating user points:', updateError);
            return res.status(500).json({ error: 'Error updating user points' });
        }

        // Mettre à jour le niveau en fonction des nouveaux points
        const levelResult = await updateUserLevel(user.pseudo, newPoints);

        // Retourne les points mis à jour et les informations de niveau
        return res.status(200).json({ 
            success: true,
            previousPoints: currentPoints,
            pointsAdded: points,
            newPoints: newPoints,
            levelUp: levelResult.levelChanged,
            newLevel: levelResult.levelChanged ? levelResult.newLevel : undefined
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Unexpected server error', details: err.message });
    }
} 