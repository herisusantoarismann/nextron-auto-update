import path from "path";
import { app, ipcMain, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { autoUpdater } from "electron-updater";

const isProd = process.env.NODE_ENV === "production";

// Feed URL untuk auto-update
// const feed = `https://github.com/herisusantoarismann/nextron-auto-update/releases/latest/download/`;
// autoUpdater.setFeedURL(feed);
autoUpdater.autoDownload = false;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

  // Cek untuk update saat aplikasi siap
  autoUpdater.checkForUpdatesAndNotify();

  // Menangani update-available event
  autoUpdater.on("update-available", () => {
    mainWindow.webContents.send("update-state", "update-available");

    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        buttons: ["Yes", "No"],
        title: "Update Available",
        message: "A new version is available.",
      })
      .then((result) => {
        if (result.response === 1) {
          autoUpdater.downloadUpdate();
        }
      });
  });

  // Menangani update-downloaded event
  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update-state", "update-downloaded");

    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Update Ready",
        message: "Update downloaded. Restart to apply changes?",
      })
      .then((result) => {
        if (result.response === 0) {
          // 0 = Restart
          autoUpdater.quitAndInstall();
        }
      });
  });
})();

// Menangani penutupan jendela
app.on("window-all-closed", () => {
  app.quit();
});

// IPC untuk komunikasi
ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World! v1.0.2 ${autoUpdater.currentVersion}`);
});
