const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');

function createWindow ()
{
    const mainWindow = new BrowserWindow ({
        width: 400,
        height: 460,
        webPreferences: {
            // Is not safety
            // Use it to have access to the node modules inside html files
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true,
        resizable: false,
        icon: path.join(__dirname, 'src', 'images', 'warp.png')
    });

    mainWindow.on('close', (event) => {
        if (!forceQuit)
        {
            event.preventDefault();

            mainWindow.hide();

            mainWindowIpc.send('update-tray-refer');
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'html', 'index.html'));

    // mainWindow.webContents.openDevTools();

    return mainWindow;
}

let tray = null,
    contextMenu = null,
    forceQuit = false,
    mainWindow = null,
    mainWindowIpc = null;

function updateTray(ipc, enabled, sent = null, received = null, latency = null, loss = null)
{
    mainWindowIpc = ipc;

    if (enabled)
    {
        contextMenu = Menu.buildFromTemplate ([
            {
                label: `In: ${sent} / Out: ${received}`,
                enabled: false
            },
            {
                label: `Latency: ${latency} / Loss : ${loss}`,
                enabled: false
            },
            { type: 'separator' },
            {
                label: 'Disconnect',
                click: () => ipc.send('disconnect')
            },
            !mainWindow.isVisible() ?
            {
                label: 'Show',

                click: () => {
                    mainWindow.show();
                    mainWindowIpc.send('update-tray-refer');
                }
            } : null,
            {
                label: 'About',
                click: () => ipc.send('show-about-refer')
            },
            {
                label: 'Close',

                click: () => {
                    forceQuit = true;
                    
                    mainWindow.close();
                    app.quit();
                }
            }
        ].filter((i) => i !== null));
    }
    
    else
    {
        contextMenu = Menu.buildFromTemplate ([
            {
                label: 'Connect',
                click: () => ipc.send('connect')
            },
            !mainWindow.isVisible() ?
            {
                label: 'Show',

                click: () => {
                    mainWindow.show();
                    mainWindowIpc.send('update-tray-refer');
                }
            } : null,
            {
                label: 'About',
                click: () => ipc.send('show-about-refer')
            },
            {
                label: 'Close',

                click: () => {
                    forceQuit = true;

                    mainWindow.close();
                    app.quit();
                }
            }
        ].filter((i) => i !== null));
    }

    tray.setContextMenu(contextMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
    tray = new Tray (path.join(__dirname, 'src', 'images', 'warp.png'));
    tray.setToolTip('Cloudflare WARP');

    mainWindow = createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0)
            mainWindow = createWindow();
    });

    ipcMain.handle('update-tray', (event, ...args) => {
        updateTray(event.sender, ...args);
    });

    ipcMain.handle('show-about', () => {
        const aboutWindow = new BrowserWindow ({
            width: 460,
            height: 400,
            webPreferences: {
                // Is not safety
                // Use it to have access to the node modules inside html files
                nodeIntegration: true,
                contextIsolation: false
            },

            parent: mainWindow,
            modal: true,
            show: false,

            autoHideMenuBar: true,
            resizable: false,
            
            icon: path.join(__dirname, 'src', 'images', 'warp.png')
        });
        
        aboutWindow.loadFile(path.join(__dirname, 'src', 'html', 'about.html'));
        aboutWindow.show();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

/*app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});*/

// Disable app closing while all windows are closed
app.on('before-quit', (event) => {
    if (!forceQuit)
        event.preventDefault();
});
