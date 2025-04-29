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
            permissions.readObject = true;
            permissions.readRoom = true;
            break;
        case 'intermediaire':
            permissions.readObject = true;
            permissions.readData = true;
            permissions.readRoom = true;

            permissions.updateRoom = true;

            permissions.addData = true;
            break;
        case 'avance':
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
