// [YAMI RPG EDITOR]主线程

// ******************************** 加载模块 ********************************

const {app, Menu, BrowserWindow, ipcMain, dialog, shell} = require('electron')
const {fork} = require('child_process')
const path = require('path')

// 如果启动时包含dirname参数
// 表示应用运行在node.js调试模式中
// 重定向根目录并开启应用的调试模式
let debug = false
let dirname = app.getAppPath()
const regexp = /^--dirname=(.+)$/
for (const arg of process.argv) {
  if (match = arg.match(regexp)) {
    dirname = path.resolve(dirname, match[1])
    debug = true
    break
  }
}

// ******************************** 文件系统 ********************************

// 获取存档目录
ipcMain.handle('get-dir-path', (event, location) => {
  switch (location) {
    case 'app-data':
      return app.getPath('appData')
    case 'documents':
      return app.getPath('documents')
    case 'desktop':
      return app.getPath('desktop')
    case 'local':
      return app.getAppPath()
  }
})

// 写入文件
ipcMain.handle('write-file', (event, filePath, text, check) => {
  return protectPromise(writeFile(filePath, text, check))
})

// 等待写入文件
ipcMain.handle('wait-write-file', event => {
  return Promise.allSettled(promises)
})

// 异步写入文件
const FSP = require('fs').promises
const writeFile = async (filePath, text, check) => {
  if (check) await FSP.stat(filePath)
  return FSP.writeFile(filePath, text)
}

// 保护承诺对象
const promises = []
const protectPromise = function (promise) {
  promises.push(promise)
  promise.finally(() => {
    const index = promises.indexOf(promise)
    if (index !== -1) {
      promises.splice(index, 1)
    }
  })
  return promise
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

// 阻止退出直到写入完成
app.on('before-quit', async event => {
  event.preventDefault()
  await Promise.allSettled(promises)
  app.exit()
})

// ******************************** 创建编辑器菜单栏 ********************************

const createEditorMenu = function () {
  // 创建模板
  const template = createMenuTemplate()

  // 设置菜单
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ******************************** 创建编辑器菜单栏 ********************************

const createMenuTemplate = function () {
  const template = []
  const file = {
    label: 'File',
    submenu: [],
  }
  const edit = {
    label: 'Edit',
    submenu: [],
  }
  // 开发模式：开启F5刷新
  if (debug) {
    file.submenu.push({
      label: 'Reload',
      accelerator: 'F5',
      role: 'forceReload',
    })
  }
  // F11全屏
  if (process.platform !== 'darwin') {
    file.submenu.push({
      label: 'FullScreen',
      accelerator: 'F11',
      role: 'toggleFullScreen',
    })
  }
  // F12开发者工具
  file.submenu.push({
    label: 'Toogle DevTools',
    accelerator: 'F12',
    role: 'toggleDevTools',
  })
  // 启用MacOS开发者工具的复制粘贴操作(但跟编辑器冲突)
  if (process.platform === 'darwin' && debug) {
    edit.submenu.push(
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'selectAll'},
    )
  }
  if (file.submenu.length !== 0) {
    template.push(file)
  }
  if (edit.submenu.length !== 0) {
    template.push(edit)
  }
  return template
}

// ******************************** 创建编辑器窗口 ********************************

const createEditorWindow = function () {
  // 创建窗口
  const editor = new BrowserWindow({
    title: 'Yami RPG Editor',
    width: 1600,
    height: 900,
    useContentSize: true,
    backgroundColor: 'white',
    frame: process.platform === 'darwin',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      additionalArguments: debug ? ['--debug-mode'] : [],
    },
  })

  // 隐藏菜单栏
  editor.setMenuBarVisibility(process.platform === 'darwin')

  // 加载文件
  editor.loadFile(path.resolve(dirname, 'index.html'))

  // 侦听窗口模式切换事件
  editor.on('maximize', event => editor.send('maximize'))
  editor.on('unmaximize', event => editor.send('unmaximize'))
  editor.on('enter-full-screen', event => editor.send('enter-full-screen'))
  editor.on('leave-full-screen', event => editor.send('leave-full-screen'))

  // 加载配置文件并设置缩放系数
  const configPath = path.resolve(dirname, 'config.json')
  const promise = require('fs').promises.readFile(configPath)
  editor.once('ready-to-show', event => {
    // 窗口最大化
    editor.maximize()
    promise.then(config => {
      editor.webContents.setZoomFactor(JSON.parse(config).zoom)
    }).catch(error => {
      editor.webContents.setZoomFactor(1)
    })
  })

  // 侦听窗口关闭事件
  editor.on('close', event => {
    if (!editor.stopCloseEvent) {
      editor.send('before-close-window')
      event.preventDefault()
      // 如果渲染线程未响应，超时2秒后退出应用
      setTimeout(() => {
        if (!editor.stopCloseEvent) {
          editor.stopCloseEvent = true
          editor.close()
        }
      }, 2000)
    }
  })

  // 启动TSC事件
  ipcMain.on('start-tsc', (event, projectDir) => {
    startTSC(path.normalize(projectDir))
  })

  // 停止TSC事件
  ipcMain.on('stop-tsc', (event) => {
    stopTSC()
  })

  let tscProcess = null

  // 启动TSC
  function startTSC(projectDir) {
    if (tscProcess) {
      stopTSC(() => startTSC(projectDir))
      return
    }
    // 启动'tsc --watch'进程
    const tscPath = path.join(__dirname, 'node_modules', 'typescript', 'lib', 'tsc.js')
    tscProcess = fork(tscPath, ['--watch'], {
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      cwd: projectDir,
      execPath: process.execPath,
    })
    // 监听 stdout（正常输出）
    tscProcess.stdout.on('data', data => {
      editor.send('tsc-log', data.toString())
    })
    // 监听 stderr（错误输出）
    tscProcess.stderr.on('data', (data) => {
      editor.send('tsc-log', data.toString())
    })
  }

  // 停止TSC
  function stopTSC(callback) {
    if (tscProcess) {
      tscProcess.kill()
      tscProcess.on('close', () => {
        tscProcess = null
        callback?.()
      })
    } else {
      callback?.()
    }
  }
}

// ******************************** 创建播放器窗口 ********************************

const createPlayerWindow = function (parent, projectDir) {
  // 加载配置文件
  const fs = require('fs')
  const config = path.resolve(projectDir, 'Data/config.json')
  const window = JSON.parse(fs.readFileSync(config)).window

  // WIN窗口大小调整：减去菜单栏的高度
  let windowHeight = window.height
  if (process.platform === 'win32') {
    windowHeight = Math.max(windowHeight - 20, 0)
  }

  // 创建窗口
  const player = new BrowserWindow({
    icon: `${projectDir}Icon/icon.png`,
    title: window.title,
    width: window.width,
    height: windowHeight,
    useContentSize: true,
    backgroundColor: 'black',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      additionalArguments: ['--debug-mode'],
    },
  })
  player.config = window

  // 隐藏菜单栏
  player.setMenuBarVisibility(false)

  // 加载页面文件
  player.loadFile(`${projectDir}index.html`)

  // 设置窗口模式
  player.once('ready-to-show', event => {
    player.show()
    switch (window.display) {
      case 'windowed':
        break
      case 'maximized':
        player.maximize()
        break
      case 'fullscreen':
        player.setFullScreen(true)
        break
    }
  })

  // 侦听窗口关闭事件
  player.on('close', event => {
    if (!player.stopCloseEvent) {
      player.send('before-close-window')
      event.preventDefault()
      // 如果渲染线程未响应，超时2秒后关闭窗口
      setTimeout(() => {
        if (!player.stopCloseEvent) {
          player.stopCloseEvent = true
          player.close()
        }
      }, 2000)
    }
  })

  // 侦听窗口关闭事件
  player.once('closed', () => {
    if (!parent.isDestroyed()) {
      parent.send('player-window-closed')
    }
  })
}

// ******************************** 进程通信 ********************************

// 获取事件来源窗口
const getWindowFromEvent = function (event) {
  return BrowserWindow.fromWebContents(event.sender)
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
ipcMain.on('force-close-window', event => {
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
ipcMain.on('open-path', (event, targetPath) => {
  shell.openPath(path.normalize(targetPath))
})

// 使用VSCode打开脚本
ipcMain.on('open-vscode', (event, scriptPath, line, column) => {
  const url = `${path.normalize(scriptPath)}:${line}:${column}`
  shell.openExternal(`vscode://file/${url}`)
})

// 在资源管理器中显示
ipcMain.on('show-item-in-folder', (event, filePath) => {
  shell.showItemInFolder(path.normalize(filePath))
})

// 创建播放器窗口
ipcMain.on('create-player-window', (event, projectPath) => {
  const window = getWindowFromEvent(event)
  createPlayerWindow(window, projectPath)
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
ipcMain.handle('show-save-dialog', (event, options) => {
  const window = getWindowFromEvent(event)
  return dialog.showSaveDialog(window, options)
})

// 把文件扔进回收站
ipcMain.handle('trash-item', (event, filePath) => {
  return shell.trashItem(path.normalize(filePath))
})

// 设置设备像素比率
ipcMain.on('set-device-pixel-ratio', (event, ratio) => {
  const window = getWindowFromEvent(event)
  // MacOS不像Windows一样锁定窗口最大化
  if (process.platform === 'darwin') {
    if (window.isMaximized() || window.isFullScreen()) {
      return
    }
  }
  const bounds = window.getContentBounds()
  const config = window.config
  const width = Math.round(config.width / ratio)
  const height = Math.round(config.height / ratio)
  const x = bounds.x + (bounds.width - width >> 1)
  const y = bounds.y + (bounds.height - height >> 1)
  // electron bug：非100%缩放时，窗口位置不能完美地被设置
  window.setContentBounds({x, y, width, height})
})

// 打开开发者工具
ipcMain.on('open-devTools', event => {
  event.sender.openDevTools()
})

// 设置显示模式
ipcMain.on('set-display-mode', (event, display) => {
  const window = getWindowFromEvent(event)
  switch (display) {
    case 'windowed':
      if (window.isFullScreen()) {
        window.setFullScreen(false)
      }
      if (window.isMaximized()) {
        window.unmaximize()
      }
      break
    case 'maximized':
      if (window.isFullScreen()) {
        window.setFullScreen(false)
      }
      if (!window.isMaximized()) {
        window.maximize()
      }
      break
    case 'fullscreen':
      if (!window.isFullScreen()) {
        window.setFullScreen(true)
      }
      break
  }
})