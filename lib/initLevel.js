import supabase from 'lib/supabaseClient';

const LEVELS_WITH_POINTS = {
    debutant: 0,
    intermediaire: 250,
    avance: 1000,
    expert: 2000,
};

/**
 * Sets the level and associated points of a user.
 *
 * @param {string} pseudo - The user's identifier.
 * @param {string} level - One of: 'debutant', 'intermediaire', 'avance', 'expert'.
 * @returns {Object} - { success: true } or { success: false, error }
 */
export async function initLevel(pseudo, level) {
    if (!pseudo) {
        return { success: false, error: "Missing user identifier (pseudo)." };
    }

    const normalizedLevel = level.toLowerCase();

    if (!LEVELS_WITH_POINTS.hasOwnProperty(normalizedLevel)) {
        return {
            success: false,
            error: `Invalid level. Must be one of: ${Object.keys(LEVELS_WITH_POINTS).join(', ')}`,
        };
    }

    const newPoints = LEVELS_WITH_POINTS[normalizedLevel];

    try {
        const { error } = await supabase
            .from("User")
            .update({ level: normalizedLevel, points: newPoints })
            .eq("pseudo", pseudo);

        if (error) {
            return { success: false, error: "Failed to update user level and points." };
        }

        return { success: true };
    } catch (err) {
        console.error("Error in initLevel:", err);
        return { success: false, error: "Unexpected server error." };
    }
}
