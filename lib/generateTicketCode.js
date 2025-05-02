import supabase from 'lib/supabaseClient';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCode(length = 8) {
    let result = '';
    const charactersLength = CHARACTERS.length;
    for (let i = 0; i < length; i++) {
        result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Generates a unique ticket code of 8 alphanumeric characters.
 * Ensures it doesn't exist already in the Booking table.
 */
export async function generateTicketCode() {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = generateCode();

        const { data, error } = await supabase
            .from('Booking')
            .select('ticketCode')
            .eq('ticketCode', code)
            .maybeSingle();

        if (error) {
            console.error('Error checking ticketNumber uniqueness:', error.message);
            throw new Error('Database error');
        }

        if (!data) {
            isUnique = true;
        }
    }

    return code;
}
