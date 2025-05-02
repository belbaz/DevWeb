import supabase from 'lib/supabaseClient';

const POINTS_BY_ACTION = {
    accountActivation: 10,
    login: 1,
    regularVisit: 5,
    expoVisit: 7,
    audioGuide: 8,
    changeProfilePic: 2,
    addRoom: 20,
    updateRoom: 10,
    deleteRoom: 5,
    addObject: 40,
    updateObject: 25,
    deleteObject: 10
};

/**
 * Adds points to a user based on a given action.
 * - "intermediaire" users are capped at 500 points.
 * - "expert" users don't get points but actions are still logged.
 *
 * @param {string} pseudo - The user's unique identifier.
 * @param {string} action - The action triggering point rewards.
 * @returns {Object} - { success: true, totalPoints, added } or { success: false, error }
 */
export async function addPoints(pseudo, action) {
    if (!pseudo) {
        return { success: false, error: "Missing user identifier (pseudo)." };
    }

    if (!action || !POINTS_BY_ACTION[action]) {
        return { success: false, error: "Invalid or missing action." };
    }

    const pointsToAdd = POINTS_BY_ACTION[action];
    const now = new Date().toISOString();

    try {
        // Get current user info
        const { data: userData, error: fetchError } = await supabase
            .from("User")
            .select("points, level")
            .eq("pseudo", pseudo)
            .single();

        if (fetchError || !userData) {
            return { success: false, error: "User not found." };
        }

        const currentPoints = userData.points || 0;
        const level = (userData.level || "").toLowerCase();

        let newPoints = currentPoints;
        let added = false;

        if (level === "intermediaire") {
            if (currentPoints === 499) {
                newPoints = 500;
                added = true;
            } else if (currentPoints < 500) {
                const candidate = currentPoints + pointsToAdd;
                newPoints = candidate > 500 ? 500 : candidate;
                added = newPoints !== currentPoints;
            }
        } else if (level === "expert") {
            // Do not add points, just log later
            added = false;
        } else {
            // debutant / avance → normal
            newPoints = currentPoints + pointsToAdd;
            added = true;
        }

        // Update points only if needed
        if (added) {
            const { error: updateError } = await supabase
                .from("User")
                .update({ points: newPoints })
                .eq("pseudo", pseudo);

            if (updateError) {
                return { success: false, error: "Failed to update user points." };
            }
        }

        return { success: true, totalPoints: newPoints, added };
    } catch (err) {
        console.error("Internal error during point addition:", err);
        return { success: false, error: "Server error during point addition." };
    }
}
