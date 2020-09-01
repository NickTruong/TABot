const { app, BrowserWindow } = require('electron')
require('electron-reload')

import path from "path";

let window : any;

function createWindow () {
    let window = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        opacity: 0.96,
        backgroundColor: '#eeeeee',
        webPreferences: {
            nodeIntegration: true
        }
    })

    window.loadURL(`file://${__dirname}/src/index.html`);

    window.on('closed', () => {
        window = null
    })
}

app.on('ready', createWindow)

// Mac stuff below
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (window == null) {
        createWindow()
    }
})



