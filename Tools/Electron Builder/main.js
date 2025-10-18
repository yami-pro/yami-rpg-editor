// [YAMI RPG PLAYER]主线程

// ******************************** 加载模块 ********************************

const {app, Menu, BrowserWindow, ipcMain} = require('electron')
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

// 开启叠加渲染模式，支持在游戏中启用steam ui
// 目前存在以下小问题：
// 如果有黑边(带鱼屏用户)，弹出成就社交界面时
// 被steam ui接管后渲染的脏矩形区域画面有残留
// 因为浏览器认为那部分没有改变，没有重新绘制的必要
// 注释掉脚本可关闭这个功能
app.commandLine.appendSwitch('in-process-gpu')
app.commandLine.appendSwitch('disable-direct-composition')

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
  createPlayerMenu()
  createPlayerWindow()
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

// ******************************** 创建播放器菜单栏 ********************************

const createPlayerMenu = function () {
  // 设置子菜单
  const submenu = [{
    label: 'FullScreen',
    accelerator: 'F11',
    role: 'toggleFullScreen',
  }]

  // 添加开发者工具
  // submenu.push({
  //   label: 'Toogle DevTools',
  //   accelerator: 'F12',
  //   role: 'toggleDevTools',
  // })

  // 创建模板
  const template = [{
    label: 'Menu',
    submenu: submenu,
  }]

  // 设置菜单
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ******************************** 创建播放器窗口 ********************************

const createPlayerWindow = function () {
  // 加载配置文件
  const fs = require('fs')
  const config = path.resolve(dirname, 'Data/config.json')
  const window = JSON.parse(fs.readFileSync(config)).window

  // WIN窗口大小调整：减去菜单栏的高度
  let windowHeight = window.height
  if (process.platform === 'win32') {
    windowHeight = Math.max(windowHeight - 20, 0)
  }

  // 创建窗口
  const player = new BrowserWindow({
    icon: 'Icon/icon.png',
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
      additionalArguments: debug ? ['--debug-mode'] : [],
    },
  })
  player.config = window

  // 隐藏菜单栏
  player.setMenuBarVisibility(false)

  // 加载页面文件
  player.loadFile(path.resolve(dirname, 'index.html'))

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
}

// ******************************** 进程通信 ********************************

// 获取事件来源窗口
const getWindowFromEvent = function (event) {
  return BrowserWindow.fromWebContents(event.sender)
}

// 强制关闭窗口
ipcMain.on('force-close-window', event => {
  const window = getWindowFromEvent(event)
  window.stopCloseEvent = true
  window.close()
})

// 打开开发者工具
ipcMain.on('open-devTools', event => {
  event.sender.openDevTools()
})

// 设置设备像素比率
ipcMain.on('set-device-pixel-ratio', (event, ratio) => {
  const window = BrowserWindow.fromWebContents(event.sender)
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

// 设置显示模式
ipcMain.on('set-display-mode', (event, display) => {
  const window = BrowserWindow.fromWebContents(event.sender)
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