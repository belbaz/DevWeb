/**
 * Determine user's level and permissions based on accumulated points.
 *
 * Levels:
 * - 0 to 249     → beginner
 * - 250 to 500   → intermediate
 * - 1000 to 1999 → advanced
 * - 2000+        → expert
 *
 * Each level unlocks specific permissions on:
 * - Objects (read/update/add/delete)
 * - Data (read/update/add/delete)
 * - Rooms (read/update/add/delete)
 *
 * @param {number} points - Total points earned by the user
 * @returns {Object} - { level: string, permissions: Object }
 */
export function getUserPermissions(points) {
    let level = '';
    let permissions = {
        readObject: false,
        readData: false,
        readRoom: false,

        updateObject: false,
        updateData: false,
        updateRoom: false,

        addObject: false,
        addData: false,
        addRoom: false,

        deleteObject: false,
        deleteData: false,
        deleteRoom: false,
    };

    if (points >= 0 && points <= 249) {
        level = 'beginner';
    } else if (points >= 250 && points <= 500) {
        level = 'intermediate';
    } else if (points >= 1000 && points <= 1999) {
        level = 'advanced';
    } else if (points >= 2000) {
        level = 'expert';
    } else {
        level = 'inconnu';
    }

    switch (level) {
        case 'beginner':
            // Can read objects and rooms only
            permissions.readObject = true;
            permissions.readRoom = true;
            break;
        case 'intermediate':
            // Basic read access + update room + add data
            permissions.readObject = true;
            permissions.readData = true;
            permissions.readRoom = true;

            permissions.updateRoom = true;

            permissions.addData = true;
            break;
        case 'advanced':
            // Can read, update and delete data + update object/room
            permissions.readObject = true;
            permissions.readData = true;
            permissions.readRoom = true;

            permissions.addData = true;

            permissions.deleteData = true;

            permissions.updateRoom = true;
            permissions.updateObject = true;
            permissions.updateData = true;
            break;
        case 'expert':
            // Full access: read, add, update, delete on everything
            permissions.readObject = true;
            permissions.readData = true;
            permissions.readRoom = true;

            permissions.addData = true;
            permissions.addObject = true;
            permissions.addRoom = true;

            permissions.deleteObject = true;
            permissions.deleteData = true;
            permissions.deleteRoom = true;

            permissions.updateObject = true;
            permissions.updateData = true;
            permissions.updateRoom = true;
            break;
    }

    return { level, permissions };
}
