export function getUserPermissions(points) {
    let level = '';
    let permissions = {
        readObject: false,
        readData: false,
        updateObject: false,
        updateData: false,
        addData: false,
        deleteData: false,
        addObject: false,
        deleteObject: false,
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
            break;
        case 'intermediaire':
            permissions.readObject = true;
            permissions.readData = true;
            permissions.addData = true;
            break;
        case 'avance':
            permissions.readObject = true;
            permissions.readData = true;
            permissions.addData = true;
            permissions.deleteData = true;
            permissions.updateObject = true;
            permissions.updateData = true;
            break;
        case 'expert':
            permissions.readObject = true;
            permissions.readData = true;
            permissions.addData = true;
            permissions.deleteData = true;
            permissions.addObject = true;
            permissions.deleteObject = true;
            permissions.updateObject = true;
            permissions.updateData = true;
            break;
    }

    return { level, permissions };
}
