const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');

function createWindow ()
{
    const mainWindow = new BrowserWindow ({
        width: 400,
        height: 460,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'public', 'images', 'warp.png'),
        autoHideMenuBar: true,
        resizable: false
    });

    mainWindow.on('close', (event) => {
        if (!forceQuit)
        {
            event.preventDefault();

            mainWindow.hide();

            mainWindowIpc.send('update-tray-refer');
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'html', 'index.html'));

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

app.whenReady().then(() => {
    tray = new Tray (path.join(__dirname, 'public', 'images', 'warp.png'));
    tray.setToolTip('Cloudflare WARP');

    mainWindow = createWindow();

    app.on('activate', () => {
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
                nodeIntegration: true,
                contextIsolation: false
            },

            parent: mainWindow,
            modal: true,
            show: false,

            autoHideMenuBar: true,
            resizable: false,
            
            icon: path.join(__dirname, 'public', 'images', 'warp.png')
        });
        
        aboutWindow.loadFile(path.join(__dirname, 'public', 'html', 'about.html'));
        aboutWindow.show();
    });
});

/*app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});*/

// Disable app closing while all windows are closed
app.on('before-quit', (event) => {
    if (!forceQuit)
        event.preventDefault();
});
