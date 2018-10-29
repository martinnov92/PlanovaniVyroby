const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

export function openEventContextMenu (callback = () => {}) {
    const eventContextMenu = new Menu();

    eventContextMenu.append(new MenuItem({
        label: 'Upravit',
        click: () => callback('edit'),
    }));

    eventContextMenu.append(new MenuItem({
        label: 'Kopírovat',
        click: () => callback('copy'),
    }));

    eventContextMenu.append(new MenuItem({
        label: 'Smazat',
        click: () => callback('delete'),
    }));

    eventContextMenu.popup({ window: remote.getCurrentWindow() });
}

export function openTableContextMenu (isProduct, isDone, isEditing, callback = () => {}) {
    const tableContextMenu = new Menu();

    if (isProduct) {
        tableContextMenu.append(new MenuItem({
            label: isDone ? 'Otevřít zakázku' : 'Uzavřít výrobek',
            click: () => callback(isDone ? 'open-order' : 'close-product'),
        }));
    } else {
        tableContextMenu.append(new MenuItem({
            label: isDone ? 'Otevřít výrobek' : 'Uzavřít výrobek',
            click: () => callback(isDone ? 'open-product' : 'close-product'),
        }));

        tableContextMenu.append(new MenuItem({
            label: isEditing ? 'Uložit termín' : 'Editovat termín',
            click: () => callback(isEditing ? 'save-term' : 'edit-term'),
        }));
    }

    tableContextMenu.popup({ window: remote.getCurrentWindow() });
}
