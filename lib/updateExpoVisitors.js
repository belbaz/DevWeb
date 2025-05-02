import supabase from 'lib/supabaseClient';

/**
 * Increments the visitor count in the Expo table for a specific date.
 *
 * @param {string} title - The title of the exposition (matches column `name` in table `Expo`)
 * @param {string} date - The date of the visit (should match day1, day2, or day3)
 * @param {number} count - Number of tickets to add (usually names.length)
 */
export async function updateExpoVisitors(title, date, count) {
    const { data: expos, error } = await supabase
        .from('Expo')
        .select('id, name, day1, day2, day3, visitorsDay1, visitorsDay2, visitorsDay3')
        .eq('name', title);

    if (error || !expos || expos.length === 0) {
        console.error('Expo not found or error fetching:', error);
        return;
    }

    const expo = expos[0];
    let fieldToUpdate = null;
    let newValue = null;

    if (expo.day1 === date) {
        fieldToUpdate = 'visitorsDay1';
        newValue = (expo.visitorsDay1 || 0) + count;
    } else if (expo.day2 === date) {
        fieldToUpdate = 'visitorsDay2';
        newValue = (expo.visitorsDay2 || 0) + count;
    } else if (expo.day3 === date) {
        fieldToUpdate = 'visitorsDay3';
        newValue = (expo.visitorsDay3 || 0) + count;
    } else {
        console.warn('Date does not match any day of the expo.');
        return;
    }

    const { error: updateError } = await supabase
        .from('Expo')
        .update({ [fieldToUpdate]: newValue })
        .eq('id', expo.id);

    if (updateError) {
        console.error('Error updating visitor count:', updateError);
    }
}
