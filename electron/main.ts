import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
  var window = new BrowserWindow({minWidth: 950, minHeight: 500, autoHideMenuBar: true }).loadURL("https://tension.battlekeeper.com/login")
})