"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// main.ts
var electron = __toESM(require("electron"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
var { app, Menu, BrowserWindow, ipcMain, dialog, shell } = electron;
var Path = path;
app.on("ready", () => {
  createEditorMenu();
  createEditorWindow();
});
app.on("window-all-closed", () => {
  app.quit();
});
var removeFullScreenMenu = function(template) {
  for (let i = 0; i < template.length; i++) {
    let item = template[i];
    if (item.label === "Menu") {
      for (let j = 0; j < item.submenu.length; j++) {
        const subItem = item.submenu[j];
        if (process.platform === "darwin" && subItem.label === "FullScreen") {
          item.submenu.splice(j, j);
          return template;
        }
      }
    }
  }
  return template;
};
var createEditorMenu = function() {
  let template = [
    {
      label: "Menu",
      submenu: [
        { label: "Reload", accelerator: "F5", role: "forceReload" },
        { label: "FullScreen", accelerator: "F11", role: "toggleFullScreen" },
        { label: "Toogle DevTools", accelerator: "F12", role: "toggleDevTools" }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "SelectAll", accelerator: "CmdOrCtrl+A", role: "selectAll" }
      ]
    }
  ];
  template = removeFullScreenMenu(template);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
var createEditorWindow = function() {
  const editor = new BrowserWindow({
    title: "Yami RPG Editor",
    width: 1280,
    height: 800,
    useContentSize: true,
    backgroundColor: "white",
    frame: false,
    roundedCorners: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false
    }
  });
  editor.setMenuBarVisibility(false);
  editor.loadFile(Path.resolve(__dirname, "index.html"));
  editor.on("maximize", (event) => editor.send("maximize"));
  editor.on("unmaximize", (event) => editor.send("unmaximize"));
  editor.on("enter-full-screen", (event) => editor.send("enter-full-screen"));
  editor.on("leave-full-screen", (event) => editor.send("leave-full-screen"));
  const path2 = Path.resolve(__dirname, "config.json");
  const promise = fs.promises.readFile(path2);
  editor.once("ready-to-show", (event) => {
    editor.maximize();
    editor.show();
    promise.then((config) => {
      editor.webContents.setZoomFactor(JSON.parse(config).zoom);
      editor.webContents.openDevTools({ mode: "bottom" });
    });
  });
  editor.on("close", (event) => {
    if (!editor.stopCloseEvent) {
      editor.send("close");
      event.preventDefault();
    }
  });
};
var createPlayerWindow = function(parent, path2) {
  const window = JSON.parse(fs.readFileSync(`${path2}data/config.json`)).window;
  if (process.platform === "win32") {
    window.height = Math.max(window.height - 20, 0);
  }
  const player = new BrowserWindow({
    icon: `${path2}Icon/icon.png`,
    title: window.title,
    width: window.width,
    height: window.height,
    backgroundColor: "#000000",
    useContentSize: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      additionalArguments: ["--debug-mode"]
    }
  });
  switch (window.display) {
    case "window":
      player.show();
      break;
    case "maximized":
      player.maximize();
      break;
    case "fullscreen":
      player.setFullScreen(true);
      player.show();
      break;
  }
  player.setMenuBarVisibility(false);
  player.loadFile(`${path2}index.html`);
  player.once("closed", () => {
    if (!parent.isDestroyed()) {
      parent.send("player-window-closed");
    }
  });
};
var getWindowFromEvent = function(event) {
  return BrowserWindow.fromWebContents(event.sender);
};
ipcMain.on("minimize-window", (event) => {
  const window = getWindowFromEvent(event);
  if (window.isMinimized()) {
    window.restore();
  } else {
    window.minimize();
  }
});
ipcMain.on("maximize-window", (event) => {
  const window = getWindowFromEvent(event);
  if (!window.isFullScreen()) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});
ipcMain.on("close-window", (event) => {
  const window = getWindowFromEvent(event);
  window.close();
});
ipcMain.on("close-window-force", (event) => {
  const window = getWindowFromEvent(event);
  window.stopCloseEvent = true;
  window.close();
});
ipcMain.on("toggle-full-screen", (event) => {
  const window = getWindowFromEvent(event);
  window.setFullScreen(!window.isFullScreen());
});
ipcMain.on("open-path", (event, path2) => {
  shell.openPath(Path.normalize(path2));
});
ipcMain.on("show-item-in-folder", (event, path2) => {
  shell.showItemInFolder(Path.normalize(path2));
});
ipcMain.on("create-player-window", (event, path2) => {
  const window = getWindowFromEvent(event);
  createPlayerWindow(window, path2);
});
ipcMain.handle("update-max-min-icon", (event) => {
  const window = getWindowFromEvent(event);
  return window.isMaximized() ? "maximize" : window.isFullScreen() ? "enter-full-screen" : "unmaximize";
});
ipcMain.handle("show-open-dialog", (event, options) => {
  const window = getWindowFromEvent(event);
  return dialog.showOpenDialog(window, options);
});
ipcMain.handle("show-save-dialog", (event, options) => {
  const window = getWindowFromEvent(event);
  return dialog.showSaveDialog(window, options);
});
ipcMain.handle("trash-item", (event, path2) => {
  return shell.trashItem(Path.normalize(path2));
});
ipcMain.handle("get-documents-path", (event) => {
  return app.getPath("documents");
});
//# sourceMappingURL=main.js.map
