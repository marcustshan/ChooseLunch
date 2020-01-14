'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import logger from 'electron-log'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    width: 1400,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    webSecurity: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // mainWindow.webContents.openDevTools()

  ipcMain.on('check_update', (event) => {
    if (process.env.NODE_ENV === 'production') {
      autoUpdater.checkForUpdates()
    }
  })

  ipcMain.on('update_completed', (event) => {
    if (process.env.NODE_ENV === 'production') {
      autoUpdater.quitAndInstall()
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
autoUpdater.channel = 'latest'
autoUpdater.allowDowngrade = false

autoUpdater.logger = logger
autoUpdater.logger.transports.file.level = 'error'
autoUpdater.autoDownload = true

autoUpdater.on('checking-for-update', (event) => {
  mainWindow.webContents.send('checking_for_update', event)
})
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available')
})
autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('update_not_available')
})
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded')
})
autoUpdater.on('download-progress', (progressObject) => {
  mainWindow.webContents.send('download_progress', JSON.stringify(progressObject))
})
autoUpdater.on('error', (error) => {
  autoUpdater.logger.debug(error)
  mainWindow.webContents.send('update_error', error)
})
