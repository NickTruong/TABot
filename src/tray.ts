const { remote } = require('electron')
const { app, Tray, Menu} = remote
const path = require('path')

let trayIcon = new Tray(path.join(__dirname,'/src/Icon.png'))

var contextMenu = [
    {
        label: 'Show App', click: () => {
            app.show();
        }
    },
    {
        label: 'Quit', click: () => {
            app.isQuiting = true;
            app.quit();
        }
    }
]

let trayMenu = Menu.buildFromTemplate(contextMenu)
trayIcon.setContextMenu(trayMenu)