'use strict'

import { NewProject } from './new-project.js'
import { Deployment } from './deployment.js'

// ******************************** 标题栏对象加载 ********************************

// 初始化
Title.initialize = function () {
  // 设置按钮图标
  const {ipcRenderer} = require('electron')
  ipcRenderer.invoke('update-max-min-icon').then(mode => {
    switch (mode) {
      case 'maximize':
        this.windowMaximize(event)
        break
      case 'unmaximize':
        this.windowUnmaximize(event)
        break
      case 'enter-full-screen':
        this.windowEnterFullScreen(event)
        break
    }
  })

  // 创建用来刷新拖动区域的辅助元素
  this.target.element = this.target.appendChild(
    document.createElement('div')
  )

  // 设置标题栏为可拖动状态
  this.pointerenter()

  // 标签栏扩展方法 - 解析图标
  this.tabBar.parseIcon = function (type) {
    switch (type) {
      case 'scene':
        return '\uf0ac'
      case 'ui':
        return '\uf2d2'
      case 'animation':
        return '\uf110'
      case 'particle':
        return '\uf2dc'
    }
  }

  // 标签栏扩展方法 - 解析名称
  this.tabBar.parseName = function (meta) {
    return File.parseMetaName(meta)
  }

  // 侦听事件
  window.on('drop', this.windowDrop)
  window.on('dirchange', this.windowDirchange)
  window.on('localize', this.windowLocalize)
  $('#title').on('pointerenter', this.pointerenter)
  $('#title-tabBar').on('pointerdown', this.tabBarPointerdown)
  $('#title-tabBar').on('select', this.tabBarSelect)
  $('#title-tabBar').on('closed', this.tabBarClosed)
  $('#title-tabBar').on('popup', this.tabBarPopup)
  $('#title-play').on('click', this.playClick)
  $('#title-minimize').on('click', this.minimizeClick)
  $('#title-maximize').on('click', this.maximizeClick)
  $('#title-close').on('click', this.closeClick)

  // 侦听应用窗口事件
  ipcRenderer.on('close', this.windowClose)
  ipcRenderer.on('maximize', this.windowMaximize)
  ipcRenderer.on('unmaximize', this.windowUnmaximize)
  ipcRenderer.on('enter-full-screen', this.windowEnterFullScreen)
  ipcRenderer.on('leave-full-screen', this.windowLeaveFullScreen)

  // 初始化子对象
  NewProject.initialize()
  Deployment.initialize()
}

// 新建项目
Title.newProject = function () {
  this.askWhetherToSave(() => {
    NewProject.open()
  })
}

// 打开项目
Title.openProject = function () {
  this.askWhetherToSave(() => {
    const dialogs = Editor.config.dialogs
    const location = Path.normalize(dialogs.open)
    File.showOpenDialog({
      defaultPath: location,
      filters: [{
        name: 'Project',
        extensions: ['yamirpg'],
      }],
    }).then(({filePaths}) => {
      if (filePaths.length === 1) {
        Editor.open(filePaths[0])
      }
    })
  })
}

// 关闭项目
Title.closeProject = function () {
  this.askWhetherToSave(() => {
    Editor.close().then(() => {
      Layout.manager.switch('home')
    })
  })
}

// 部署项目
Title.deployment = function () {
  this.askWhetherToSave(() => {
    Deployment.open()
  })
}

// 添加最近的标签
Title.addRecentTab = function (guid) {
  const tabs = Editor.project.recentTabs
  if (tabs.remove(guid)) {
    tabs.unshift(guid)
  } else {
    tabs.unshift(guid)
    while (tabs.length > 10) {
      tabs.pop()
    }
  }
}

// 获取关闭的标签元数据
Title.getClosedTabMeta = function () {
  const {recentTabs} = Editor.project
  outer: for (const guid of recentTabs) {
    for (const item of this.tabBar.data) {
      if (item.meta.guid === guid) {
        continue outer
      }
    }
    return Data.manifest.guidMap[guid]
  }
  return undefined
}

// 打开标签
Title.openTab = function (file) {
  const {tabBar} = this
  const {meta, type} = file
  let context = tabBar.find(meta)
  if (context === undefined) {
    const icon = tabBar.parseIcon(type)
    const name = tabBar.parseName(meta)
    tabBar.insert(context = {icon, name, meta, type})
  }
  tabBar.select(context)
}

// 重新打开关闭的标签
Title.reopenClosedTab = function (meta) {
  meta = meta ?? this.getClosedTabMeta()
  if (meta) {
    const file = Directory.getFile(meta.path)
    if (file instanceof FileItem) {
      this.openTab(file)
    }
  }
}

// 询问是否保存
Title.askWhetherToSave = function (callback) {
  if (Data.manifest?.changes.length > 0) {
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedProject'),
    }, [{
      label: get('yes'),
      click: () => {
        File.save()
        callback()
      },
    }, {
      label: get('no'),
      click: () => {
        callback()
      },
    }, {
      label: get('cancel'),
    }])
  } else {
    callback()
  }
}

// 更新标题名称
Title.updateTitleName = function IIFE() {
  const title = $('title')[0]
  return function () {
    let text = 'Yami RPG Editor'
    if (Editor.state === 'open') {
      text = Data.config.window.title + ' - ' + text
    }
    title.textContent = text
  }
}()

// 更新 Body Class
Title.updateBodyClass = function () {
  if (this.maximized || this.fullscreen) {
    document.body.addClass('maximized')
    document.body.removeClass('border')
  } else {
    document.body.removeClass('maximized')
    document.body.addClass('border')
  }
}

// 更新应用区域
// 应用拖拽区域无法自动更新
// 需要通过开关元素的显示来手动刷新
Title.updateAppRegion = function () {
  const {target} = this
  target.element.show()
  // 强制刷新样式
  // target.element.css().display
  setTimeout(() => target.element.hide())
}

// 切换主题
Title.switchTheme = function (scheme) {
  switch (scheme) {
    case 'light':
      if (document.documentElement.removeClass('dark')) {
        this.dispatchThemechangeEvent('light')
      }
      break
    case 'dark':
      if (document.documentElement.addClass('dark')) {
        this.dispatchThemechangeEvent('dark')
      }
      break
  }
}

// 发送主题改变事件
Title.dispatchThemechangeEvent = function IIFE() {
  const themechange = new Event('themechange')
  return function (theme) {
    this.theme = theme
    themechange.value = theme
    window.dispatchEvent(themechange)
  }
}()

// 播放游戏
Title.playGame = async function () {
  const element = $('#title-play')
  if (!element.hasClass('selected')) {
    element.addClass('selected')

    // 暂时失去输入框焦点来触发改变事件
    const {activeElement} = document
    activeElement.blur()
    activeElement.focus()

    // 停止播放声音
    AudioManager.player.stop()

    // 保存数据文件
    await File.save(false)

    // 创建播放器窗口
    const {ipcRenderer} = require('electron')
    ipcRenderer.send('create-player-window', File.root)

    // 窗口关闭事件
    ipcRenderer.once('player-window-closed', event => {
      element.removeClass('selected')
    })
  }
}

// 保存状态到配置文件
Title.saveToConfig = function (config) {
  config.theme = this.theme
}

// 从配置文件中加载状态
Title.loadFromConfig = function (config) {
  const {theme} = config
  switch (theme) {
    case 'light':
      document.documentElement.removeClass('dark')
      break
    case 'dark':
      document.documentElement.addClass('dark')
      break
  }
  this.dispatchThemechangeEvent(theme)
}

// 保存状态到项目文件
Title.saveToProject = function (project) {
  // 保存打开的标签集合
  const items = this.tabBar.data
  const length = items.length
  const tabs = new Array(length)
  for (let i = 0; i < length; i++) {
    tabs[i] = items[i].meta.guid
  }
  project.openTabs = tabs

  // 保存激活的标签
  const tab = this.tabBar.read()
  project.activeTab = tab?.meta.guid ?? ''
}

// 从项目文件中加载状态
Title.loadFromProject = function (project) {
  const {openTabs, activeTab} = project

  // 加载标签页
  const dirItem = {
    icon: '\uf07c',
    name: Local.get('common.directory'),
    meta: {guid: ''},
    type: 'directory',
  }
  const items = [dirItem]
  const tabBar = this.tabBar
  tabBar.dirItem = dirItem
  const map = Data.manifest.guidMap
  for (const guid of openTabs) {
    const meta = map[guid]
    if (!meta) continue
    let type
    switch (Path.extname(meta.path)) {
      case '.scene':
        type = 'scene'
        break
      case '.ui':
        type = 'ui'
        break
      case '.anim':
        type = 'animation'
        break
      case '.particle':
        type = 'particle'
        break
      default:
        continue
    }
    const icon = tabBar.parseIcon(type)
    const name = tabBar.parseName(meta)
    items.push({icon, name, meta, type})
  }
  tabBar.data = items
  tabBar.update()

  // 加载打开的文件
  if (activeTab) {
    const elements = tabBar.childNodes
    for (const element of elements) {
      const context = element.item
      if (context.meta.guid === activeTab) {
        return tabBar.select(context)
      }
    }
    if (elements.length !== 0) {
      const context = elements[0].item
      return tabBar.select(context)
    }
  }
  Layout.manager.switch('directory')
}

// 窗口 - 关闭事件
Title.windowClose = function (event) {
  if (Window.frames.length === 0) {
    Title.askWhetherToSave(() => {
      Editor.quit()
    })
  }
}

// 窗口 - 最大化事件
Title.windowMaximize = function (event) {
  this.maximized = true
  this.updateBodyClass()
}.bind(Title)

// 窗口 - 退出最大化事件
Title.windowUnmaximize = function (event) {
  this.maximized = false
  this.updateBodyClass()
}.bind(Title)

// 窗口 - 进入全屏事件
Title.windowEnterFullScreen = function (event) {
  this.fullscreen = true
  this.updateBodyClass()
}.bind(Title)

// 窗口 - 退出全屏事件
Title.windowLeaveFullScreen = function (event) {
  this.fullscreen = false
  this.updateBodyClass()
}.bind(Title)

// 窗口 - 拖拽释放事件
Title.windowDrop = function (event) {
  if (Window.frames.length === 0) {
    const {files} = event.dataTransfer
    for (const file of files) {
      if (/\.yamirpg$/i.test(file.name)) {
        this.askWhetherToSave(() => {
          Editor.open(file.path)
        })
      }
    }
  }
}.bind(Title)

// 窗口 - 目录改变事件
Title.windowDirchange = function (event) {
  const {tabBar} = Title
  for (const item of tabBar.data) {
    if (item === tabBar.dirItem) continue
    const name = tabBar.parseName(item.meta)
    if (item.name !== name) {
      item.name = name
      if (item.tab) {
        item.tab.text.textContent = tabBar.parseTabName(item)
      }
    }
  }
}

// 窗口 - 本地化事件
Title.windowLocalize = function (event) {
  const text = Title.tabBar.dirItem?.tab?.text
  if (text instanceof HTMLElement) {
    text.textContent = Local.get('common.directory')
  }
}

// 指针进入事件
Title.pointerenter = function (event) {
  const {target} = this
  if (!target.active) {
    target.active = true
    target.style.WebkitAppRegion = 'drag'
    this.updateAppRegion()
    window.on('pointermove', this.pointermove)
  }
}.bind(Title)

// 指针移动事件
Title.pointermove = function (event) {
  const {target} = this
  if (target.active) {
    let element = event.target
    while (element) {
      if (element === target) {
        return
      } else {
        element = element.parentNode
      }
    }
    if (!element) {
      target.active = false
      target.style.WebkitAppRegion = 'no-drag'
      this.updateAppRegion()
      window.off('pointermove', this.pointermove)
    }
  }
}.bind(Title)

// 标签栏 - 指针按下事件
Title.tabBarPointerdown = function (event) {
  switch (this.read()?.type) {
    case 'scene':
      Layout.readyToFocus(Scene.screen)
      break
    case 'ui':
      Layout.readyToFocus(UI.screen)
      break
    case 'animation':
      Layout.readyToFocus(Animation.screen)
      break
    case 'particle':
      Layout.readyToFocus(Particle.screen)
  }
}

// 标签栏 - 选择事件
Title.tabBarSelect = function (event) {
  if (Layout.resizing) {
    Layout.pointerup()
  }
  const context = event.value
  switch (context.type) {
    case 'directory':
      Layout.manager.switch('directory')
      break
    case 'scene':
      Layout.manager.switch('scene')
      Scene.open(context)
      Scene.screen.focus()
      break
    case 'ui':
      Layout.manager.switch('ui')
      UI.open(context)
      UI.screen.focus()
      break
    case 'animation':
      Layout.manager.switch('animation')
      Animation.open(context)
      Animation.screen.focus()
      break
    case 'particle':
      Layout.manager.switch('particle')
      Particle.open(context)
      Particle.screen.focus()
      break
  }
}

// 标签栏 - 已关闭事件
Title.tabBarClosed = function (event) {
  const {closedItems, lastValue} = event
  for (const context of closedItems) {
    switch (context.type) {
      case 'scene':
        Scene.destroy(context)
        break
      case 'ui':
        UI.destroy(context)
        break
      case 'animation':
        Animation.destroy(context)
        break
      case 'particle':
        Particle.destroy(context)
        break
    }
    if (context.meta.guid) {
      Title.addRecentTab(context.meta.guid)
    }
  }
  if (closedItems.includes(lastValue)) {
    const items = this.data
    const index = Math.min(this.selectionIndex, items.length - 1)
    const item = items[index]
    if (item instanceof Object) {
      this.select(item)
    } else {
      Layout.manager.switch('directory')
    }
  }
}

// 标签栏 - 菜单弹出事件
Title.tabBarPopup = function (event) {
  const item = event.value
  if (!item) return
  const items = this.data
  const last = items[items.length - 1]
  const get = Local.createGetter('menuTab')
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('close'),
    accelerator: ctrl('W'),
    enabled: item.type !== 'directory',
    click: () => {
      this.close(item)
    }
  }, {
    label: get('closeOtherTabs'),
    enabled: items.length > 1,
    click: () => {
      this.closeOtherTabs(item)
    }
  }, {
    label: get('closeTabsToTheRight'),
    enabled: item !== last,
    click: () => {
      this.closeTabsToTheRight(item)
    }
  }])
}

// 播放按钮 - 鼠标点击事件
Title.playClick = function (event) {
  Title.playGame()
}

// 最小化按钮 - 鼠标点击事件
Title.minimizeClick = function (event) {
  require('electron')
  .ipcRenderer
  .send('minimize-window')
}

// 最大化按钮 - 鼠标点击事件
Title.maximizeClick = function (event) {
  require('electron')
  .ipcRenderer
  .send('maximize-window')
}

// 关闭按钮 - 鼠标点击事件
Title.closeClick = function (event) {
  require('electron')
  .ipcRenderer
  .send('close-window')
}
