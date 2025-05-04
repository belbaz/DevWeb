import { addPoints } from 'lib/addPoints';
import { updateLevel } from 'lib/updateLevel';
import supabase from 'lib/supabaseClient';

/**
 * Logs a user's action by:
 * 1. Fetching current level
 * 2. Adding points
 * 3. Updating level
 * 4. Logging the action (with previous level)
 *
 * @param {string} pseudo - The user's identifier
 * @param {string} action - The action performed
 * @returns {Object} - { success: true } or { success: false, error }
 */

export async function logAction(pseudo, action) {
    if (!pseudo || !action) {
        return { success: false, error: "Missing pseudo or action." };
    }

    const now = new Date().toISOString();

    try {
        // 1. Get current level before action
        const { data: userData, error: userError } = await supabase
            .from("User")
            .select("level")
            .eq("pseudo", pseudo)
            .single();

        if (userError || !userData) {
            return { success: false, error: "User not found when retrieving level." };
        }

        const previousLevel = userData.level;

        // 2. Add points
        const pointResult = await addPoints(pseudo, action);
        if (!pointResult.success) {
            return { success: false, error: "Failed to add points: " + pointResult.error };
        }

        // 3. Update level
        const levelResult = await updateLevel(pseudo);
        if (!levelResult.success) {
            return { success: false, error: "Failed to update level: " + levelResult.error };
        }

        // 4. Log the action with the previous level
        const { error: logError } = await supabase
            .from("HistoryActions")
            .insert([
                {
                    type: action,
                    date: now,
                    pseudo: pseudo,
                    currentLevel: previousLevel,
                },
            ]);

        if (logError) {
            console.error("Action log failed:", logError);
            return { success: false, error: "Failed to log action." };
        }

        return { success: true };
    } catch (err) {
        console.error("Unexpected error in logAction:", err);
        return { success: false, error: "Unexpected server error." };
    }
}
