"use strict"

import {
  app,
  ipcMain,
  dialog,
  shell,
  Menu,
  MenuItem,
  BrowserWindow,
  MenuItemConstructorOptions,
  IpcMainInvokeEvent,
  SaveDialogOptions
} from 'electron'

import {
  promises,
  readFileSync
} from 'fs'

import {
  resolve,
  normalize
} from 'path'

// ******************************** 声明 ********************************

interface Props {
  stopCloseEvent: boolean
}

// ******************************** 注册事件 ********************************

// 准备完毕
app.on('ready', () => {
  createEditorMenu()
  createEditorWindow()
})

// 窗口全部关闭后退出应用
app.on('window-all-closed', () => {
  app.quit()
})

// ******************************** 创建编辑器菜单栏 ********************************

const removeFullScreenMenu = function (template: (MenuItemConstructorOptions | MenuItem)[]) {
  for (let i = 0; i < template.length; i++) {
    let item = template[i]
    if (item.label === 'Menu' && 
        item.submenu !== undefined &&
        item.submenu instanceof Array) {
      for (let j = 0; j < item.submenu.length; j++) {
        const subItem = item.submenu[j]
        if (process.platform === 'darwin' && subItem.label === 'FullScreen') {
          item.submenu.splice(j, j)
          return template
        }
      }
    }
  }
  return template
}

const createEditorMenu = function () {
  // 创建模板
  let template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: 'Menu',
      submenu: [
        { label: 'Reload', accelerator: 'F5', role: 'forceReload', },
        { label: 'FullScreen', accelerator: 'F11', role: 'togglefullscreen', },
        { label: 'Toogle DevTools', accelerator: 'F12', role: 'toggleDevTools', }
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut', },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy', },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste', },
        { label: 'SelectAll', accelerator: 'CmdOrCtrl+A', role: 'selectAll', }
      ],
    }
  ]

  // 关闭macOS上窗口圆角, 进入全屏模式会crash
  // macOS下取消全屏模式选项
  template = removeFullScreenMenu(template)

  // 设置菜单
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ******************************** 创建编辑器窗口 ********************************

const createEditorWindow = function () {
  // 创建窗口
  const editor = <BrowserWindow & Props>new BrowserWindow({
    title: 'Yami RPG Editor',
    width: 1280,
    height: 800,
    useContentSize: true,
    backgroundColor: 'white',
    frame: false,
    roundedCorners: false, // 关闭macOS上窗口圆角
    hasShadow: false, // 关闭窗口阴影
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
    },
  })

  // 隐藏菜单栏
  editor.setMenuBarVisibility(false)

  // 加载文件
  editor.loadFile(resolve(__dirname, 'index.html'))

  // 侦听窗口模式切换事件
  editor.on('maximize', (event: Event) => editor.webContents.send('maximize'))
  editor.on('unmaximize', (event: Event) => editor.webContents.send('unmaximize'))
  editor.on('enter-full-screen', (event: Event) => editor.webContents.send('enter-full-screen'))
  editor.on('leave-full-screen', (event: Event) => editor.webContents.send('leave-full-screen'))

  // 加载配置文件并设置缩放系数
  const path = resolve(__dirname, 'config.json')
  const promise = promises.readFile(path)
  editor.once('ready-to-show', (event: Event) => {
    // 窗口最大化
    editor.maximize()
    // 激活
    editor.show()
    promise.then(config => {
      editor.webContents.setZoomFactor(JSON.parse(config.toString()).zoom)
      // 打开调试器
      editor.webContents.openDevTools({mode: 'bottom'})
    })
  })

  // 侦听窗口关闭事件
  editor.on('close', (event: Event) => {
    if (!editor.stopCloseEvent) {
      editor.webContents.send('close')
      event.preventDefault()
    }
  })
}

// ******************************** 创建播放器窗口 ********************************

const createPlayerWindow = function (parent: BrowserWindow & Props, path: string) {
  // 加载配置文件
  const window = JSON.parse(readFileSync(`${path}data/config.json`).toString()).window

  // 减去菜单栏的高度
  if (process.platform === 'win32') {
    window.height = Math.max(window.height - 20, 0)
  }

  // 创建窗口
  const player = new BrowserWindow({
    icon: `${path}Icon/icon.png`,
    title: window.title,
    width: window.width,
    height: window.height,
    backgroundColor: '#000000',
    useContentSize: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      additionalArguments: ['--debug-mode'],
    },
  })

  // 设置窗口模式
  switch (window.display) {
    case 'window':
      player.show()
      break
    case 'maximized':
      player.maximize()
      break
    case 'fullscreen':
      player.setFullScreen(true)
      player.show()
      break
  }

  // 隐藏菜单栏
  player.setMenuBarVisibility(false)

  // 加载页面文件
  player.loadFile(`${path}index.html`)

  // 侦听窗口关闭事件
  player.once('closed', () => {
    if (!parent.isDestroyed()) {
      parent.webContents.send('player-window-closed')
    }
  })
}

// ******************************** 进程通信 ********************************

// 获取事件来源窗口
const getWindowFromEvent = function (event: IpcMainInvokeEvent) {
  const webContents = BrowserWindow.fromWebContents(event.sender)
  // 断言为 Intersection Types
  return <BrowserWindow & Props>webContents
}

// 最小化窗口
ipcMain.on('minimize-window', event => {
  const window = getWindowFromEvent(event)
  if (window.isMinimized()) {
    window.restore()
  } else {
    window.minimize()
  }
})

// 最大化窗口
ipcMain.on('maximize-window', event => {
  const window = getWindowFromEvent(event)
  if (!window.isFullScreen()) {
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  }
})

// 关闭窗口
ipcMain.on('close-window', event => {
  const window = getWindowFromEvent(event)
  window.close()
})

// 强制关闭窗口
ipcMain.on('close-window-force', event => {
  const window = getWindowFromEvent(event)
  window.stopCloseEvent = true
  window.close()
})

// 开关全屏模式
ipcMain.on('toggle-full-screen', event => {
  const window = getWindowFromEvent(event)
  window.setFullScreen(!window.isFullScreen())
})

// 打开资源管理器路径
ipcMain.on('open-path', (event, path) => {
  shell.openPath(normalize(path))
})

// 在资源管理器中显示
ipcMain.on('show-item-in-folder', (event, path) => {
  shell.showItemInFolder(normalize(path))
})

// 创建播放器窗口
ipcMain.on('create-player-window', (event, path) => {
  const window = getWindowFromEvent(event)
  createPlayerWindow(window, path)
})

// 更新最大小化图标
ipcMain.handle('update-max-min-icon', event => {
  const window = getWindowFromEvent(event)
  return window.isMaximized()  ? 'maximize'
       : window.isFullScreen() ? 'enter-full-screen'
       :                         'unmaximize'
})

// 显示打开对话框
ipcMain.handle('show-open-dialog', (event, options) => {
  const window = getWindowFromEvent(event)
  return dialog.showOpenDialog(window, options)
})

// 显示保存对话框
ipcMain.handle('show-save-dialog', (event, options: SaveDialogOptions) => {
  const window = getWindowFromEvent(event)
  return dialog.showSaveDialog(window, options)
})

// 把文件扔进回收站
ipcMain.handle('trash-item', (event, path: string) => {
  return shell.trashItem(normalize(path))
})

// 获取用户文档路径
ipcMain.handle('get-documents-path', event => {
  return app.getPath('documents')
})
