import supabase from 'lib/supabaseClient';

function getLevelFromPoints(points) {
    if (points >= 2000) return "expert";
    if (points >= 1000) return "advanced";
    if (points >= 250) return "intermediate";
    return "beginner";
}

/**
 * Updates the user's level based on their current points.
 */
export async function updateLevel(pseudo) {
    if (!pseudo) {
        return { success: false, error: "Missing user identifier." };
    }

    try {
        const { data: userData, error: fetchError } = await supabase
            .from("User")
            .select("points, level")
            .eq("pseudo", pseudo)
            .single();

        if (fetchError || !userData) {
            return { success: false, error: "User not found." };
        }

        const currentPoints = userData.points || 0;
        const currentLevel = userData.level?.toLowerCase();
        const newLevel = getLevelFromPoints(currentPoints);

        if (newLevel === currentLevel) {
            return { success: true, level: currentLevel }; // No update needed
        }

        const { error: updateError } = await supabase
            .from("User")
            .update({ level: newLevel })
            .eq("pseudo", pseudo);

        if (updateError) {
            return { success: false, error: "Failed to update level." };
        }

        return { success: true, level: newLevel };
    } catch (err) {
        console.error("Error in updateLevel:", err);
        return { success: false, error: "Unexpected server error." };
    }
}
