const url = require('url');
const path = require('path');
const chokidar = require('chokidar');
const electron = require('electron');
const { autoUpdater } = require('electron-updater');

const app = electron.app;
const Menu = electron.Menu;
const ipc = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let fileWatcher;
let localChange = false;

const date = new Date();
const fileName = `PLANOVANI_ZAKAZEK_${date.getFullYear()}.json`;
const documentsPath = `${electron.app.getPath('documents')}`;

const template = [
    {
        label: 'Soubor',
        submenu: [
            {
                label: 'Otevřít',
                accelerator: 'CmdOrCtrl+O',
                role: 'open',
                click: () => {
                    sendMessageToWindow('menu', 'openFile');
                }
            },
            {
                label: 'Uložit',
                accelerator: 'CmdOrCtrl+S',
                role: 'save',
                click: () => {
                    sendMessageToWindow('menu', 'saveFile');
                }
            },
            {
                label: 'Uložit jako',
                accelerator: 'CmdOrCtrl+Shift+S',
                role: 'save',
                click: () => {
                    sendMessageToWindow('menu', 'saveAsFile');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Konec',
                accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
                click: () => {
                    app.quit();
                }
            }
        ]
    },
    // {
    //     label: 'Úpravy',
    //     submenu: [
    //         {
    //             label: 'Zpět',
    //             accelerator: 'CmdOrCtrl+Z',
    //             click: () => {
                    
    //             },
    //         },
    //     ],
    // },
    {
        label: 'Zakázky',
        submenu: [
            {
                label: 'Přidat zakázku',
                accelerator: 'CmdOrCtrl+N',
                click: () => {
                    sendMessageToWindow('menu', 'newEvent');
                }
            },
        ]
    },
    {
        label: 'Nápověda',
        submenu: [
            {
                label: 'Zkontrolovat aktualizace',
                click: () => {
                    autoUpdater.checkForUpdates();
                }
            },
            {
                label: 'Debug',
                accelerator: 'CmdOrCtrl+Shift+I',
                click: () => {
                    mainWindow.webContents.openDevTools();
                }
            }
        ]
    }
];

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        show: false,
        minWidth: 500,
        minHeight: 400,
    });

    // DEV
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
        mainWindow.loadURL('http://localhost:3000');
    } else {
        // PRODUCTION
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../build/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });

    mainWindow.webContents.on('dom-ready', () => {
        sendMessageToWindow('dom-ready');
    });

    // if the render process crashes, reload the window
    mainWindow.webContents.on('crashed', () => {
        mainWindow.destroy();
        createWindow();
    });

    // mainWindow.webContents.on('unresponsive', () => {
    //     const options = {
    //         type: 'info',
    //         title: 'Aplikace přestala reagovat',
    //         message: 'Aplikace přestala reagovat',
    //         buttons: ['Obnovit', 'Ukončit']
    //     };

    //     electron.dialog.showMessageBox(options, (index) => {
    //         if (index === 0) {
    //             mainWindow.reload();
    //         }
    //         else {
    //             mainWindow.close();
    //         }
    //     });
    // });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        stopWatchingForFileChanges();
    });

    autoUpdater.checkForUpdates();

    ipcListeners();
    autoUpdaterListeners();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function ipcListeners() {
    // events from renderer
    ipc.on('open-file-dialog', (event) => {
        const w = BrowserWindow.fromWebContents(event.sender);

        electron.dialog.showOpenDialog(w, {
            title: 'Otevřít soubor',
            defaultPath: documentsPath + '/' + fileName,
            filters: [{ name: 'JSON', extension: ['json'] }]
        }, (resultPath) => {
            event.sender.send('selected-directory', 'open', resultPath);
        });
    });

    ipc.on('open-save-dialog', (event) => {
        const w = BrowserWindow.fromWebContents(event.sender);

        electron.dialog.showSaveDialog(w, {
            title: 'Uložit soubor',
            defaultPath: path + '/' + fileName,
            filters: [{ name: 'JSON', extension: ['json'] }]
        }, (resultPath) => {
            event.sender.send('selected-directory', 'save', resultPath);
        });
    });

    ipc.on('update-install', (event) => {
        autoUpdater.quitAndInstall();
    });

    ipc.on('open-error-dialog', (event, title = 'Chyba', content) => {
        electron.dialog.showErrorBox(title, content);
    });

    ipc.on('show-dev-tools', (event) => {
        mainWindow.webContents.openDevTools();
    });

    ipc.on('file-watcher-localsave', (event, local) => {
        localChange = local;
    });

    ipc.on('file-stop-watching', stopWatchingForFileChanges);

    ipc.on('file-start-watching', startWatchingForFileChanges);
}

function autoUpdaterListeners() {
    autoUpdater.on('checking-for-update', () => {
        sendMessageToWindow('update-checking');
    });

    autoUpdater.on('update-not-available', () => {
        sendMessageToWindow('update-not-available');
    });

    autoUpdater.on('download-progress', (progress) => {
        sendMessageToWindow('update-downloading', progress);
    });

    autoUpdater.on('error', () => {
        sendMessageToWindow('update-error');
    });

    autoUpdater.on('update-downloaded', () => {
        sendMessageToWindow('update-ready');
    });
}

function startWatchingForFileChanges(event, filePath) {
    try {
        fileWatcher = chokidar.watch(filePath, {
            usePolling: true, // pro sledování změn na síťovém úložišti (více vytěžuje CPU - ukládat do nastavení?)
            awaitWriteFinish: true,
        });

        fileWatcher.on('change', (path, stats) => {
            if (!localChange) {
                event.sender.send('file-watcher-change', path, stats);
            }

            localChange = false;
        });

        fileWatcher.on('error', (error) => {
            console.log('Chyba při sledování změn souboru', error);
        });
    } catch (err) {
        event.sender.send('file-watcher-error', error);
    }
}

function stopWatchingForFileChanges(event) {
    if (fileWatcher) {
        // zastavit sledování
        const watchedFiles = fileWatcher.getWatched();
        for (let path in watchedFiles) {
            watchedFiles[path].forEach((file) => {
                fileWatcher.unwatch(path + '/' +file);
            });
        }

        fileWatcher.close();
        fileWatcher = null;
    }
}

function sendMessageToWindow(name, ...rest) {
    mainWindow.webContents.send(name, ...rest);
}
