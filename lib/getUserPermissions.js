export function getUserPermissions(points) {
    let level = '';
    let permissions = {
        readData: false,
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
            permissions.readData = true;
            break;
        case 'intermediaire':
            permissions.readData = true;
            permissions.addData = true;
            break;
        case 'avance':
            permissions.readData = true;
            permissions.addData = true;
            permissions.deleteData = true;
            break;
        case 'expert':
            permissions.readData = true;
            permissions.addData = true;
            permissions.deleteData = true;
            permissions.addObject = true;
            permissions.deleteObject = true;
            break;
    }

    return { level, permissions };
}
