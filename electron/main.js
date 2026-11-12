const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'TYPE RUSH', // Fuerza el título
        backgroundColor: '#0A0015',
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../build/icon.ico'), // Ruta al ícono
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    // Evita que la página web cambie el título de la ventana
    win.on('page-title-updated', (e) => e.preventDefault());

    if (isDev) {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});