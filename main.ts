const { app, BrowserWindow, Tray, Menu } = require('electron')
require('electron-reload')

import path from "path";

let window : any;
let loadingScreen: any;
let trayIcon: any;

function createWindow () {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        icon: "/src/Icon.png",
        autoHideMenuBar: true,
        opacity: 0.96,
        backgroundColor: '#eeeeee',
        webPreferences: {
            nodeIntegration: true
        }
    })

    window.loadURL(`file://${__dirname}/src/index.html`);

    window.on('minimize', (event: any) => {
        event.preventDefault();
        window.hide();
    });

    window.on('close', (event: any) => {
        if(!app.isQuiting){
            event.preventDefault();
            window.hide();
        }
    
        return false;
    });

    trayIcon = new Tray(path.join(__dirname,'/src/Icon.png'))

    var trayMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: () => {
                window.show();
            }
        },
        {
            label: 'Quit', click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    trayIcon.setContextMenu(trayMenu);

    window.webContents.on('did-finish-load', () => {
        /// then close the loading screen window and show the main window
        if (loadingScreen) {
            loadingScreen.close();
        }
        window.show();
    });
}


app.on('ready', () => {
    createLoadingScreen();
    createWindow();
});

app.on('will-quit', () => {
    trayIcon.destroy();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

function createLoadingScreen() {
    loadingScreen = new BrowserWindow(
        Object.assign({
            width: 256,
            height: 256,
            frame: false,
        })
    );

    loadingScreen.setResizable(false);

    loadingScreen.loadURL(`file://${__dirname}/src/loading.html`);

    loadingScreen.on('closed', () => (loadingScreen = null));

    loadingScreen.webContents.on('did-finish-load', () => {
        loadingScreen.show();
    });
}

