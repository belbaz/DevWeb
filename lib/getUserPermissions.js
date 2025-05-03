/**
 * Determine user's level and permissions based on accumulated points.
 *
 * Levels:
 * - 0 to 249     → débutant
 * - 250 to 500   → intermédiaire
 * - 1000 to 1999 → avancé
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
        level = 'debutant';
    } else if (points >= 250 && points <= 500) {
        level = 'intermediaire';
    } else if (points >= 1000 && points <= 1999) {
        level = 'avance';
    } else if (points >= 2000) {
        level = 'expert';
    } else {
        level = 'inconnu';
    }

    switch (level) {
        case 'debutant':
            // Can read objects and rooms only
            permissions.readObject = true;
            permissions.readRoom = true;
            break;
        case 'intermediaire':
            // Basic read access + update room + add data
            permissions.readObject = true;
            permissions.readData = true;
            permissions.readRoom = true;

            permissions.updateRoom = true;

            permissions.addData = true;
            break;
        case 'avance':
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
