'use strict'

// ******************************** 标题栏对象 ********************************

const Title = {
  // properties
  target: $('#title'),
  tabBar: $('#title-tabBar'),
  theme: null,
  maximized: false,
  fullscreen: false,
  // methods
  initialize: null,
  newProject: null,
  openProject: null,
  closeProject: null,
  deployment: null,
  addRecentTab: null,
  getClosedTabMeta: null,
  openTab: null,
  reopenClosedTab: null,
  askWhetherToSave: null,
  updateTitleName: null,
  updateBodyClass: null,
  updateAppRegion: null,
  switchTheme: null,
  dispatchThemechangeEvent: null,
  playGame: null,
  saveToConfig: null,
  loadFromConfig: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  windowBeforeClose: null,
  windowMaximize: null,
  windowUnmaximize: null,
  windowEnterFullScreen: null,
  windowLeaveFullScreen: null,
  windowDrop: null,
  windowDirchange: null,
  windowLocalize: null,
  pointerenter: null,
  pointermove: null,
  tabBarPointerdown: null,
  tabBarSelect: null,
  tabBarClosed: null,
  tabBarPopup: null,
  playClick: null,
  minimizeClick: null,
  maximizeClick: null,
  closeClick: null,
}

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
  ipcRenderer.on('before-close-window', this.windowBeforeClose)
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
    Editor.close()
    Layout.manager.switch('home')
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
  if (Editor.state === 'open' &&
    !element.hasClass('selected')) {
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
    switch (Path.extname(meta.path).toLowerCase()) {
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

// 窗口 - 关闭前事件
Title.windowBeforeClose = function (event) {
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

// ******************************** 新建项目窗口 ********************************

const NewProject = {
  // properties
  state: 'passed',
  timer: null,
  // methods
  initialize: null,
  open: null,
  check: null,
  readFileList: null,
  copyFilesTo: null,
  writeData: null,
  getNewFolder: null,
  // events
  templateInput: null,
  folderBeforeinput: null,
  folderInput: null,
  locationInput: null,
  chooseClick: null,
  confirm: null,
}

// 初始化
NewProject.initialize = function () {
  // 创建模板选项
  $('#newProject-template').loadItems([
    {name: 'ARPG - English', value: 'arpg-ts-english'},
    {name: 'ARPG - 简体中文', value: 'arpg-ts-chinese'},
    {name: 'Minimized Current Project', value: 'minimized-project'},
  ])

  // 侦听事件
  $('#newProject-template').on('input', this.templateInput)
  $('#newProject-folder').on('beforeinput', this.folderBeforeinput, {capture: true})
  $('#newProject-folder').on('input', this.folderInput)
  $('#newProject-location').on('input', this.locationInput)
  $('#newProject-choose').on('click', this.chooseClick)
  $('#newProject-confirm').on('click', this.confirm)
}

// 打开窗口
NewProject.open = function () {
  Window.open('newProject')
  const write = getElementWriter('newProject')
  const dialogs = Editor.config.dialogs
  const location = Path.normalize(dialogs.new)
  const folder = this.getNewFolder(location)
  let template
  switch (Local.language) {
    default:
    case 'en-US':
      template = 'arpg-ts-english'
      break
    case 'zh-CN':
      template = 'arpg-ts-chinese'
      break
  }
  write('template', template)
  write('folder', folder)
  write('location', location)
  $('#newProject-template').getFocus()
  this.check()
}

// 检查路径
NewProject.check = function () {
  const folder = $('#newProject-folder').read()
  const location = $('#newProject-location').read()
  if (!folder) {
    if (this.state !== 'unnamed') {
      this.state = 'unnamed'
      $('#newProject-warning').textContent = Local.get('confirmation.enterFolderName')
    }
    $('#newProject-confirm').disable()
  } else if (FS.existsSync(Path.resolve(location, folder))) {
    if (this.state !== 'existing') {
      this.state = 'existing'
      $('#newProject-warning').textContent = Local.get('confirmation.folderAlreadyExists')
    }
    $('#newProject-confirm').disable()
  } else {
    if (this.state !== 'passed') {
      this.state = 'passed'
      $('#newProject-warning').textContent = ''
    }
    // 如果选择最小化当前项目，并且没有打开项目，则禁用
    const template = $('#newProject-template').read()
    if (template === 'minimized-project' && Editor.state === 'closed') {
      $('#newProject-confirm').disable()
    } else {
      $('#newProject-confirm').enable()
    }
  }
}

// 读取文件列表
NewProject.readFileList = function IIFE() {
  const options = {withFileTypes: true}
  const read = (dirname, idFilter, path, list) => {
    return FSP.readdir(
      `${dirname}/${path}`,
      options,
    ).then(
      async files => {
        if (path) {
          path += '/'
        }
        const promises = []
        for (const file of files) {
          const newPath = `${path}${file.name}`
          if (file.isDirectory()) {
            list.push({
              folder: true,
              path: newPath,
            })
            promises.push(read(dirname, idFilter, newPath, list))
          } else {
            // 如果存在ID过滤器，文件名中包括了ID
            // 但是未在ID过滤器中找到，则判定为多余文件，跳过
            if (idFilter) {
              const guid = File.parseGUID(file.name)
              if (guid && !idFilter[guid]) continue
            }
            list.push({
              path: newPath,
            })
          }
        }
        if (promises.length !== 0) {
          await Promise.all(promises)
        }
        return list
      }
    )
  }
  return function (dirname, idFilter) {
    return read(dirname, idFilter, '', [])
  }
}()

// 复制文件到指定目录
NewProject.copyFilesTo = function (sPath, dPath, idFilter) {
  Window.open('copyProgress')
  const progressBar = $('#copyProgress-bar')
  const progressInfo = $('#copyProgress-info')
  progressBar.style.width = '0'
  progressInfo.textContent = ''
  return this.readFileList(sPath, idFilter).then(list => {
    let total = 0
    let count = 0
    let info = ''
    const promises = []
    const length = list.length
    for (let i = 0; i < length; i++) {
      const item = list[i]
      const path = item.path
      switch (item.folder) {
        case true:
          // 创建文件夹(同步)
          FS.mkdirSync(dPath + '/' + path)
          continue
        default:
          // 复制文件
          promises.push(FSP.copyFile(
            sPath + '/' + path,
            dPath + '/' + path,
          ).then(() => {
            count++
            info = path
          }))
          total++
          continue
      }
    }
    this.timer = new Timer({
      duration: Infinity,
      update: timer => {
        const percent = Math.round(count / total * 100)
        progressBar.style.width = `${percent}%`
        progressInfo.textContent = info
      }
    }).add()
    return Promise.all(promises)
  })
}

// 写入数据
NewProject.writeData = function (dirPath) {
  const path = `${dirPath}/data/config.json`
  return FSP.readFile(path, 'utf8').then(data => {
    const config = JSON.parse(data)
    config.gameId = GUID.generate64bit()
    config.save.subdir = config.gameId
    const json = JSON.stringify(config, null, 2)
    return FSP.writeFile(path, json)
  })
}

// 获取新的文件夹名称
NewProject.getNewFolder = function (location) {
  for (let i = 1; true; i++) {
    const folder = `Project${i}`
    if (!FS.existsSync(Path.resolve(location, folder))) {
      return folder
    }
  }
}

// 模板 - 输入事件
NewProject.templateInput = function (event) {
  NewProject.check()
}

// 文件夹输入框 - 输入前事件
NewProject.folderBeforeinput = function (event) {
  if (event.inputType === 'insertText' &&
    typeof event.data === 'string') {
    const regexp = /[\\/:*?"<>|"]/
    if (regexp.test(event.data)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
}

// 文件夹输入框 - 输入事件
NewProject.folderInput = function (event) {
  const regexp = /[\\/:*?"<>|"]/g
  const oldName = this.read()
  const newName = oldName.replace(regexp, '')
  if (oldName !== newName) {
    this.write(newName)
  }
  NewProject.check()
}

// 位置输入框 - 输入事件
NewProject.locationInput = function (event) {
  NewProject.check()
}

// 选择按钮 - 鼠标点击事件
NewProject.chooseClick = function (event) {
  const input = $('#newProject-location')
  File.showOpenDialog({
    defaultPath: input.read(),
    properties: ['openDirectory'],
  }).then(({filePaths}) => {
    if (filePaths.length === 1) {
      input.write(filePaths[0])
      NewProject.check()
    }
  })
}

// 确定按钮 - 鼠标点击事件
NewProject.confirm = function (event) {
  const template = $('#newProject-template').read()
  const location = $('#newProject-location').read()
  const folder = $('#newProject-folder').read()
  const sPath = template !== 'minimized-project'
  ? Path.resolve(__dirname, `Templates/${template}`)
  : Path.resolve(File.root)
  const dPath = Path.resolve(location, folder)
  Window.close('newProject')
  FSP.mkdir(dPath, {recursive: true}).then(done => {
    return template === 'minimized-project'
    ? Data.createReferencedFileIDMap()
    : undefined
  }).then(idFilter => {
    return NewProject.copyFilesTo(sPath, dPath, idFilter)
  }).then(done => {
    return NewProject.writeData(dPath)
  }).finally(() => {
    Window.close('copyProgress')
    if (NewProject.timer) {
      NewProject.timer.remove()
      NewProject.timer = null
    }
  }).then(() => {
    Editor.open(`${dPath}/game.yamirpg`)
    Editor.config.dialogs.new =
    Path.slash(Path.resolve(location))
  }).catch(error => {
    Editor.close()
    Log.throw(error)
    Window.confirm({
      message: 'Failed to create project',
      close: () => {
        Layout.manager.switch('home')
      },
    }, [{
      label: 'Confirm',
    }])
  })
}

// ******************************** 部署项目窗口 ********************************

const Deployment = {
  // properties
  state: 'passed',
  gamedir: '',
  timer: null,
  // methods
  initialize: null,
  open: null,
  check: null,
  readShellList: null,
  readFileList: null,
  readTsOutDir: null,
  copyFilesTo: null,
  // events
  platformInput: null,
  folderBeforeinput: null,
  folderInput: null,
  locationInput: null,
  chooseClick: null,
  confirm: null,
}

// 初始化
Deployment.initialize = function () {
  // 创建平台选项
  $('#deployment-platform').loadItems([
    {name: 'Windows x64', value: 'windows-x64'},
    {name: 'MacOS Universal', value: 'mac-universal'},
    {name: 'Web / Android / iOS', value: 'web'},
  ])

  // 侦听事件
  $('#deployment-platform').on('input', this.platformInput)
  $('#deployment-folder').on('beforeinput', this.folderBeforeinput, {capture: true})
  $('#deployment-folder').on('input', this.folderInput)
  $('#deployment-location').on('input', this.locationInput)
  $('#deployment-choose').on('click', this.chooseClick)
  $('#deployment-confirm').on('click', this.confirm)
}

// 打开窗口
Deployment.open = function () {
  Window.open('deployment')
  const write = getElementWriter('deployment')
  const dialogs = Editor.config.dialogs
  const location = Path.normalize(dialogs.deploy)
  write('platform', 'windows-x64')
  write('folder', 'Output')
  write('location', location)
  $('#deployment-platform').getFocus()
  this.check()
}

// 检查路径
Deployment.check = function () {
  let folder = $('#deployment-folder').read()
  const location = $('#deployment-location').read()
  const platform = $('#deployment-platform').read()
  if (platform == 'mac-universal') {
    folder += '.app'
  }
  if (!folder) {
    if (this.state !== 'unnamed') {
      this.state = 'unnamed'
      $('#deployment-warning').textContent = Local.get('confirmation.enterFolderName')
      $('#deployment-confirm').disable()
    }
  } else if (FS.existsSync(Path.resolve(location, folder))) {
    if (this.state !== 'existing') {
      this.state = 'existing'
      $('#deployment-warning').textContent = Local.get('confirmation.folderAlreadyExists')
      $('#deployment-confirm').disable()
    }
  } else {
    if (this.state !== 'passed') {
      this.state = 'passed'
      $('#deployment-warning').textContent = ''
      $('#deployment-confirm').enable()
    }
  }
}

// 读取外壳文件列表
Deployment.readShellList = function IIFE() {
  let root
  const options = {withFileTypes: true}
  const read = (path, list) => {
    return FSP.readdir(
      `${root}${path}`,
      options,
    ).then(
      async files => {
        if (path) {
          path += '/'
        }
        const promises = []
        for (const file of files) {
          const newPath = `${path}${file.name}`
          const srcPath = `${root}${newPath}`
          if (file.isDirectory()) {
            list.push({
              folder: true,
              shell: true,
              srcPath: srcPath,
              newPath: newPath,
            })
            promises.push(read(
              newPath, list,
            ))
          } else {
            list.push({
              shell: true,
              srcPath: srcPath,
              newPath: newPath,
            })
          }
        }
        if (promises.length !== 0) {
          await Promise.all(promises)
        }
        return list
      }
    )
  }
  return function (rootDir) {
    root = Path.resolve(__dirname, rootDir) + '/'
    return read('', [])
  }
}()

// 读取文件列表
Deployment.readFileList = async function (platform) {
  // 暂时设置为强制加密
  const encrypt = true
  // 读取TSCONFIG的输出目录
  const tsOutDir = Deployment.readTsOutDir()
  if (!tsOutDir) {
    throw new Error('Unable to get "outDir" from "tsconfig.json".')
  }
  let fileList
  // 读取外壳文件列表
  switch (platform) {
    case 'windows-x64':
      fileList = await this.readShellList('Templates/electron-win-x64')
      this.gamedir = 'resources/app/'
      break
    case 'mac-universal':
      fileList = await this.readShellList('Templates/electron-mac-universal.app')
      this.gamedir = 'Contents/Resources/app/'
      break
    case 'web':
      fileList = []
      this.gamedir = ''
      break
  }
  // 添加文件夹列表
  fileList.push({
    folder: true,
    path: 'Assets',
  }, {
    folder: true,
    path: 'Icon',
  }, {
    folder: true,
    path: 'Data',
  }, {
    folder: true,
    path: `${tsOutDir}Script`,
  })
  const fileIdMap = await Data.createReferencedFileIDMap()
  // 打包初始化加载的数据
  const manifest = {
    ui: {},
    scenes: {},
    actors: {},
    skills: {},
    items: {},
    equipments: {},
    triggers: {},
    states: {},
    events: {},
    tilesets: {},
    animations: {},
    particles: {},
    images: [],
    audio: [],
    videos: [],
    fonts: [],
    script: [],
    others: [],
  }
  for (const key of [
    'ui',
    'scenes',
    'actors',
    'triggers',
    'states',
    'events',
    'tilesets',
    'animations',
    'particles',
  ]) {
    const sGroup = Data[key]
    const dGroup = manifest[key]
    for (const guid of Object.keys(sGroup)) {
      // 排除未用到的文件
      if (!fileIdMap[guid]) continue
      dGroup[guid] = sGroup[guid]
    }
  }
  // 获取技能|物品|装备的文件名(用来游戏中排序)
  const guidAndExt = /\.[0-9a-f]{16}\.\S+$/
  for (const key of ['skills', 'items', 'equipments']) {
    const dataGroup = Data[key]
    const manifestGroup = manifest[key]
    for (const {guid, path} of Data.manifest[key]) {
      // 排除未用到的文件
      if (!fileIdMap[guid]) continue
      const data = dataGroup[guid]
      if (data !== undefined) {
        manifestGroup[guid] = {...data,
          filename: Path.basename(path).replace(guidAndExt, ''),
        }
      }
    }
  }
  // 复制配置文件，设置为已部署
  const config = Object.clone(Data.config)
  config.deployed = true
  // 添加数据文件列表
  fileList.push({
    data: manifest,
    path: 'Data/manifest.json',
  }, {
    data: config,
    path: 'Data/config.json',
  }, {
    data: Data.easings,
    path: 'Data/easings.json',
  }, {
    data: Data.teams,
    path: 'Data/teams.json',
  }, {
    data: Data.autotiles,
    path: 'Data/autotiles.json',
  }, {
    data: Data.variables,
    path: 'Data/variables.json',
  }, {
    data: Data.attribute,
    path: 'Data/attribute.json',
  }, {
    data: Data.enumeration,
    path: 'Data/enumeration.json',
  }, {
    data: Data.localization,
    path: 'Data/localization.json',
  }, {
    data: Data.plugins,
    path: 'Data/plugins.json',
  }, {
    data: Data.commands,
    path: 'Data/commands.json',
  })
  // 添加基础文件列表
  fileList.push(
    {path: 'index.html'},
    {path: 'Icon/icon.png', encrypt: false},
    {path: `${tsOutDir}Script/util.js`},
    {path: `${tsOutDir}Script/loader.js`},
    {path: `${tsOutDir}Script/codec.js`},
    {path: `${tsOutDir}Script/webgl.js`},
    {path: `${tsOutDir}Script/audio.js`},
    {path: `${tsOutDir}Script/printer.js`},
    {path: `${tsOutDir}Script/variable.js`},
    {path: `${tsOutDir}Script/animation.js`},
    {path: `${tsOutDir}Script/data.js`},
    {path: `${tsOutDir}Script/local.js`},
    {path: `${tsOutDir}Script/stage.js`},
    {path: `${tsOutDir}Script/camera.js`},
    {path: `${tsOutDir}Script/scene.js`},
    {path: `${tsOutDir}Script/actor.js`},
    {path: `${tsOutDir}Script/trigger.js`},
    {path: `${tsOutDir}Script/filter.js`},
    {path: `${tsOutDir}Script/input.js`},
    {path: `${tsOutDir}Script/ui.js`},
    {path: `${tsOutDir}Script/time.js`},
    {path: `${tsOutDir}Script/event.js`},
    {path: `${tsOutDir}Script/command.js`},
    {path: `${tsOutDir}Script/flow.js`},
    {path: `${tsOutDir}Script/yami.js`},
    {path: `${tsOutDir}Script/main.js`},
  )
  // 重定向脚本文件列表
  const tsExtname = /\.ts$/
  for (let {guid, path, parameters} of Data.manifest.script) {
    // 排除未用到的文件
    if (!fileIdMap[guid]) continue
    // 重新映射TS脚本到输出目录的JS脚本
    if (tsExtname.test(path)) {
      path = tsOutDir + path.replace(tsExtname, '.js')
    }
    const newPath = `Assets/${guid}.js`
    manifest.script.push({
      path: newPath,
      parameters: parameters,
    })
    fileList.push({
      srcPath: File.route(path),
      newPath: newPath,
    })
  }
  // 重定向其他文件列表
  const fontNameRegexp = /([^/]+)\.\S+\.\S+$/
  for (const key of [
    'images',
    'audio',
    'videos',
    'fonts',
    'others',
  ]) {
    const sMetaList = Data.manifest[key]
    const dMetaList = manifest[key]
    for (const {guid, path, size} of sMetaList) {
      // 排除未用到的文件
      if (!fileIdMap[guid]) continue
      const extname = encrypt && key === 'images' ? '.dat' : key === 'audio' ? '.res' : Path.extname(path)
      const newPath = `Assets/${guid}${extname}`
      if (key === 'fonts') {
        dMetaList.push({
          path: newPath,
          name: path.match(fontNameRegexp)?.[1] ?? '',
        })
      } else {
        dMetaList.push({
          path: newPath,
          size: size,
        })
      }
      fileList.push({
        srcPath: File.route(path),
        newPath: newPath,
      })
    }
  }
  return fileList
}

// 读取TS输出目录
Deployment.readTsOutDir = function () {
  const ts = FS.readFileSync(File.route('tsconfig.json'), 'utf8')
  const match = ts.match(/"outDir"\s*:\s*"(.*?)"/)
  let outDir
  if (match) {
    outDir = Path.normalize(match[1])
  }
  if (!/\/$/.test(outDir)) {
    outDir += '/'
  }
  return outDir
}

// 复制文件到指定目录
Deployment.copyFilesTo = function (dirPath) {
  Window.open('copyProgress')
  const platform = $('#deployment-platform').read()
  const progressBar = $('#copyProgress-bar')
  const progressInfo = $('#copyProgress-info')
  const {extnameToTypeMap} = FolderItem
  progressBar.style.width = '0'
  progressInfo.textContent = ''
  return this.readFileList(platform).then(list => {
    let total = 0
    let count = 0
    let info = ''
    const dPath = `${dirPath}/`
    const promises = []
    const length = list.length
    for (let i = 0; i < length; i++) {
      const item = list[i]
      const srcPath = item.srcPath ?? File.route(item.path)
      const newPath = item.newPath ?? item.path
      const gamedir = item.shell ? '' : this.gamedir
      const dstPath = dPath + gamedir + newPath
      switch (item.folder) {
        case true:
          // 创建文件夹(同步)
          FS.mkdirSync(dstPath, {recursive: true})
          continue
        default:
          if (item.data) {
            // 写入数据到文件
            const json = JSON.stringify(item.data)
            promises.push(FSP.writeFile(
              dstPath,
              json,
            ).then(() => {
              count++
              info = newPath
            }))
          } else {
            switch (extnameToTypeMap[Path.extname(srcPath).toLowerCase()]) {
              case 'image':
                // 避免加密应用图标文件
                if (item.encrypt === false) {
                  break
                }
                promises.push((async () => {
                  const buffer = await FSP.readFile(srcPath)
                  await FSP.writeFile(dstPath, Codec.encodeFile(buffer))
                  count++
                  info = newPath
                })())
                continue
            }
            // 复制文件
            promises.push(FSP.copyFile(
              srcPath,
              dstPath,
            ).then(() => {
              count++
              info = newPath
            }))
          }
          total++
          continue
      }
    }
    this.timer = new Timer({
      duration: Infinity,
      update: timer => {
        const percent = Math.round(count / total * 100)
        progressBar.style.width = `${percent}%`
        progressInfo.textContent = info
      }
    }).add()
    return Promise.all(promises)
  })
}

// 平台 - 输入事件
Deployment.platformInput = function (event) {
  Deployment.check()
}

// 文件夹输入框 - 输入前事件
Deployment.folderBeforeinput = function (event) {
  if (event.inputType === 'insertText' &&
    typeof event.data === 'string') {
    const regexp = /[\\/:*?"<>|"]/
    if (regexp.test(event.data)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
}

// 文件夹输入框 - 输入事件
Deployment.folderInput = function (event) {
  const regexp = /[\\/:*?"<>|"]/g
  const oldName = this.read()
  const newName = oldName.replace(regexp, '')
  if (oldName !== newName) {
    this.write(newName)
  }
  Deployment.check()
}

// 位置输入框 - 输入事件
Deployment.locationInput = function (event) {
  Deployment.check()
}

// 选择按钮 - 鼠标点击事件
Deployment.chooseClick = function (event) {
  const input = $('#deployment-location')
  File.showOpenDialog({
    defaultPath: input.read(),
    properties: ['openDirectory'],
  }).then(({filePaths}) => {
    if (filePaths.length === 1) {
      input.write(filePaths[0])
      Deployment.check()
    }
  })
}

// 确定按钮 - 鼠标点击事件
Deployment.confirm = function (event) {
  const platform = $('#deployment-platform').read()
  const location = $('#deployment-location').read()
  const folder = $('#deployment-folder').read()
  let path = Path.resolve(location, folder)
  Window.close('deployment')
  if (platform === 'mac-universal') {
    path += '.app'
  }
  return FSP.mkdir(path, {recursive: true}).then(done => {
    return Deployment.copyFilesTo(path)
  }).finally(() => {
    Window.close('copyProgress')
    if (Deployment.timer) {
      Deployment.timer.remove()
      Deployment.timer = null
    }
  }).then(() => {
    Editor.config.dialogs.deploy =
    Path.slash(Path.resolve(location))
  }).catch(error => {
    Log.throw(error)
    Window.confirm({
      message: 'Failed to deploy project:\n' + error.message,
    }, [{
      label: 'Confirm',
    }])
  })
}

// ******************************** 菜单栏对象 ********************************

const Menubar = {
  // methods
  initialize: null,
  toggleFullScreen: null,
  popupFileMenu: null,
  popupEditMenu: null,
  popupViewMenu: null,
  popupWindowMenu: null,
  popupHelpMenu: null,
  createRecentItems: null,
  createLanguageItems: null,
  createColorIcon: null,
  revealSaveDirectory: null,
  sanitizeFolderName: null,
  // events
  keydown: null,
  pointerdown: null,
  pointerup: null,
  pointerover: null,
  hrefClick: null,
}

// 初始化
Menubar.initialize = function () {
  // 侦听事件
  window.on('keydown', this.keydown)
  $('#menu').on('pointerdown', this.pointerdown)
  $('#menu').on('pointerup', this.pointerup)
  $('#menu').on('pointerover', this.pointerover)
  $('.href').on('click', this.hrefClick)
}

// 开关全屏模式
Menubar.toggleFullScreen = function () {
  require('electron')
  .ipcRenderer
  .send('toggle-full-screen')
}

// 弹出文件菜单
Menubar.popupFileMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const open = Editor.state === 'open'
    const get = Local.createGetter('menuFile')
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('newProject'),
      accelerator: ctrl('N'),
      click: () => {
        Title.newProject()
      },
    }, {
      label: get('openProject'),
      accelerator: ctrl('O'),
      click: () => {
        Title.openProject()
      },
    }, {
      label: get('revealProject'),
      enabled: open,
      click: () => {
        File.openPath(Path.dirname(Editor.config.project))
      },
    }, {
      label: get('revealSaveDirectory'),
      enabled: open,
      click: () => {
        Menubar.revealSaveDirectory()
      },
    }, {
      label: get('openRecent'),
      enabled: open,
      submenu: this.createRecentItems(),
    }, {
      label: get('exportLanguage'),
      enabled: open && Data.config.localization.languages.length !== 0,
      click: () => {
        ExportLanguage.open()
      },
    }, {
      label: get('importLanguage'),
      enabled: open && Data.config.localization.languages.length !== 0,
      click: () => {
        ImportLanguage.open()
      },
    }, {
      label: get('saveProject'),
      accelerator: ctrl('S'),
      enabled: open,
      click: () => {
        File.save()
      },
    }, {
      label: get('closeProject'),
      enabled: open,
      click: () => {
        Title.closeProject()
      },
    }, {
      label: get('deployment'),
      enabled: open,
      click: () => {
        Title.deployment()
      },
    }, {
      type: 'separator',
    }, {
      label: get('exit'),
      click: () => {
        Title.closeClick()
      },
    }])
  }
}

// 弹出编辑菜单
Menubar.popupEditMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const get = Local.createGetter('menuEdit')
    const items = {
      cut: {
        label: get('cut'),
        accelerator: ctrl('X'),
        enabled: false,
        click: null,
      },
      copy: {
        label: get('copy'),
        accelerator: ctrl('C'),
        enabled: false,
        click: null,
      },
      paste: {
        label: get('paste'),
        accelerator: ctrl('V'),
        enabled: false,
        click: null,
      },
      delete: {
        label: get('delete'),
        accelerator: 'Delete',
        enabled: false,
        click: null,
      },
      undo: {
        label: get('undo'),
        accelerator: ctrl('Z'),
        enabled: false,
        click: null,
      },
      redo: {
        label: get('redo'),
        accelerator: ctrl('Y'),
        enabled: false,
        click: null,
      },
    }
    // 提前触发检查器输入框的blur事件
    document.activeElement.blur()
    switch (Layout.manager.index) {
      case 'scene':
        if (Scene.state === 'open') {
          const selected = Scene.target instanceof Object
          const pastable = Clipboard.has('yami.scene.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = Scene.history.canUndo()
          items.redo.enabled = Scene.history.canRedo()
          items.cut.click = () => {Scene.copy(); Scene.delete()}
          items.copy.click = () => {Scene.copy()}
          items.paste.click = () => {Scene.paste()}
          items.delete.click = () => {Scene.delete()}
          items.undo.click = () => {Scene.undo()}
          items.redo.click = () => {Scene.redo()}
        }
        break
      case 'ui':
        if (UI.state === 'open') {
          const selected = UI.target instanceof Object
          const pastable = Clipboard.has('yami.ui.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = UI.history.canUndo()
          items.redo.enabled = UI.history.canRedo()
          items.cut.click = () => {UI.copy(); UI.delete()}
          items.copy.click = () => {UI.copy()}
          items.paste.click = () => {UI.paste()}
          items.delete.click = () => {UI.delete()}
          items.undo.click = () => {UI.undo()}
          items.redo.click = () => {UI.redo()}
        }
        break
      case 'animation':
        if (Animation.state === 'open') {
          const selected = Animation.motion instanceof Object
          const pastable = Clipboard.has('yami.animation.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = Animation.history.canUndo()
          items.redo.enabled = Animation.history.canRedo()
          items.cut.click = () => {Animation.copy(); Animation.delete()}
          items.copy.click = () => {Animation.copy()}
          items.paste.click = () => {Animation.paste()}
          items.delete.click = () => {Animation.delete()}
          items.undo.click = () => {Animation.undo()}
          items.redo.click = () => {Animation.redo()}
        }
        break
      case 'particle':
        if (Particle.state === 'open') {
          items.undo.enabled = Particle.history.canUndo()
          items.redo.enabled = Particle.history.canRedo()
          items.undo.click = () => {Particle.undo()}
          items.redo.click = () => {Particle.redo()}
        }
        break
    }
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [
      items.cut,
      items.copy,
      items.paste,
      items.delete,
      items.undo,
      items.redo,
    ])
  }
}

// 弹出视图菜单
Menubar.popupViewMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const open = Editor.state === 'open'
    const isFullScreen = Title.fullscreen
    const isGridOpen = Scene.showGrid
    const isLightOpen = Scene.showLight
    const isAnimationOpen = Scene.showAnimation
    const isDarkTheme = document.documentElement.hasClass('dark')
    const isLightTheme = !isDarkTheme
    const get = Local.createGetter('menuView')
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('fullscreen'),
      accelerator: process.platform === 'darwin' ? '' : 'F11',
      checked: isFullScreen,
      click: () => {
        Menubar.toggleFullScreen()
      },
    }, {
      label: get('scene'),
      enabled: open,
      submenu: [{
        label: get('scene.grid'),
        checked: isGridOpen,
        click: () => {
          Scene.switchGrid()
        },
      }, {
        label: get('scene.light'),
        checked: isLightOpen,
        click: () => {
          Scene.switchLight()
        },
      }, {
        label: get('scene.animation'),
        checked: isAnimationOpen,
        click: () => {
          Scene.switchAnimation()
        },
      }, {
        label: get('scene.background'),
        icon: this.createColorIcon(Scene.background.hex),
        click: () => {
          Color.open(Scene.background)
        },
      }],
    }, {
      label: get('ui'),
      enabled: open,
      submenu: [{
        label: get('ui.background'),
        icon: this.createColorIcon(UI.background.hex),
        click: () => {
          Color.open(UI.background)
        },
      }, {
        label: get('ui.foreground'),
        icon: this.createColorIcon(UI.foreground.hex),
        click: () => {
          Color.open(UI.foreground)
        },
      }],
    }, {
      label: get('animation'),
      enabled: open,
      submenu: [{
        label: get('animation.background'),
        icon: this.createColorIcon(Animation.background.hex),
        click: () => {
          Color.open(Animation.background)
        },
      }],
    }, {
      label: get('particle'),
      enabled: open,
      submenu: [{
        label: get('particle.background'),
        icon: this.createColorIcon(Particle.background.hex),
        click: () => {
          Color.open(Particle.background)
        },
      }],
    }, {
      label: get('layout'),
      enabled: open,
      submenu: [{
        label: get('layout.default'),
        click: () => {
          Layout.switchLayout(Layout.default)
        },
      }, {
        label: `${get('layout.zoom')}: ${Zoom.getFactor()}`,
        click: () => {
          Zoom.open()
        },
      }],
    }, {
      label: get('theme'),
      submenu: [{
        label: get('theme.light'),
        checked: isLightTheme,
        click: () => {
          Title.switchTheme('light')
        },
      }, {
        label: get('theme.dark'),
        checked: isDarkTheme,
        click: () => {
          Title.switchTheme('dark')
        },
      }],
    }, {
      label: get('language'),
      submenu: this.createLanguageItems(),
    }])
  }
}

// 弹出窗口菜单
Menubar.popupWindowMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const open = Editor.state === 'open'
    const get = Local.createGetter('menuWindow')
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('project'),
      accelerator: 'F1',
      enabled: open,
      click: () => {
        Project.open()
      },
    }, {
      label: get('variable'),
      accelerator: 'F3',
      enabled: open,
      click: () => {
        Variable.open()
      },
    }, {
      label: get('attribute'),
      accelerator: 'F6',
      enabled: open,
      click: () => {
        Attribute.open()
      },
    }, {
      label: get('enum'),
      accelerator: 'F7',
      enabled: open,
      click: () => {
        Enum.open()
      },
    }, {
      label: get('local'),
      accelerator: 'F8',
      enabled: open,
      click: () => {
        Localization.open()
      },
    }, {
      label: get('easing'),
      enabled: open,
      click: () => {
        Easing.open()
      },
    }, {
      label: get('team'),
      enabled: open,
      click: () => {
        Team.open()
      },
    }, {
      label: get('plugin'),
      accelerator: 'F9',
      enabled: open,
      click: () => {
        PluginManager.open()
      },
    }, {
      label: get('command'),
      accelerator: 'F10',
      enabled: open,
      click: () => {
        CustomCommand.open()
      },
    }, {
      label: get('run'),
      accelerator: 'F4',
      enabled: open,
      click: () => {
        Title.playGame()
      },
    }/*完成度低，先隐藏*//*, {
      label: get('log'),
      enabled: open,
      click: () => {
        Window.open('log')
      },
    }*/])
  }
}

// 弹出帮助菜单
Menubar.popupHelpMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const get = Local.createGetter('menuHelp')
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('documentation'),
      click: () => {
        File.openURL(
          Local.language.slice(0, 2) === 'zh'
        ? 'https://yamirpg.com/zh/docs/intro'
        : 'https://yamirpg.com/docs/intro'
        )
      },
    }, {
      label: get('about'),
      click: () => {
        let osversion = ''
        const macos = navigator.userAgent.match(/Macintosh/)
        const winos = navigator.userAgent.match(/Windows NT [0-9.]+/)
        const bits = navigator.userAgent.match(/(?<!\w)x64|x86(?!\w)/)
        if (macos) osversion += 'Macintosh'
        if (winos) osversion += winos
        if (winos && bits) osversion += ' ' + bits
        if (!osversion) osversion = 'unknown'
        Window.open('about')
        $('#editor-version').textContent = Editor.config.version
        $('#electron-version').textContent = process.versions.electron
        $('#chrome-version').textContent = process.versions.chrome
        $('#node-version').textContent = process.versions.node
        $('#v8-version').textContent = process.versions.v8
        $('#os-version').textContent = osversion
      },
    }, {
      label: get('updateLog'),
      click: () => {
        UpdateLog.open()
      },
    }])
  }
}

// 创建最近的文件项目
Menubar.createRecentItems = function () {
  if (Editor.state === 'closed') {
    return []
  }
  const {recentTabs} = Editor.project
  const items = []
  const get = Local.createGetter('menuFile')
  items.push({
    label: get('openRecent.reopenClosedFile'),
    enabled: !!Title.getClosedTabMeta(),
    accelerator: ctrl('Shift+T'),
    click: () => {
      Title.reopenClosedTab()
    },
  })
  // 添加最近的标签选项
  if (recentTabs.length !== 0) {
    const click = function () {
      Title.reopenClosedTab(this.meta)
    }
    items.push({type: 'separator'})
    const map = Data.manifest.guidMap
    for (const guid of recentTabs) {
      const meta = map[guid]
      if (meta !== undefined) {
        items.push({
          label: File.filterGUID(meta.path),
          meta: meta,
          click: click,
        })
      }
    }
  }
  items.push({type: 'separator'})
  items.push({
    label: get('openRecent.clearItems'),
    enabled: recentTabs.length !== 0,
    click: () => {
      recentTabs.length = 0
    },
  })
  return items
}

// 创建语言项目
Menubar.createLanguageItems = function () {
  const get = Local.createGetter('menuView.language')
  const autoChecked = Editor.config.language === ''
  const autoLabel = get('auto')
  const items = [{
    label: autoLabel,
    checked: autoChecked,
    click: () => {
      if (!autoChecked) {
        Local.setLanguage('')
      }
    },
  }]
  Local.readLanguageList().then(languages => {
    const active = Local.active
    if (languages.length !== 0) {
      items.push({type: 'separator'})
    }
    for (const {key, alias, filename} of languages) {
      let checked = filename === active
      if (checked && autoChecked) {
        checked = false
        items[0].label = `${autoLabel} - ${alias}`
      }
      items.push({
        label: alias,
        checked: checked,
        click: () => {
          if (!checked) {
            Local.setLanguage(key)
          }
        },
      })
    }
    items.push({type: 'separator'})
    items.push({
      label: get(Local.showInExplorer()),
      click: () => {
        File.openPath(Local.dirname)
      },
    })
  })
  return items
}

// 创建颜色图标
Menubar.createColorIcon = function (color) {
  const icon = document.createElement('menu-icon')
  const r = parseInt(color.slice(0, 2), 16)
  const g = parseInt(color.slice(2, 4), 16)
  const b = parseInt(color.slice(4, 6), 16)
  const a = parseInt(color.slice(6, 8), 16) / 255
  icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`
  icon.addClass('color-icon')
  if (a === 0) {
    icon.addClass('transparent')
  }
  return icon
}

// 显示存档目录
Menubar.revealSaveDirectory = async function () {
  let saveDir
  const {location, subdir} = Data.config.save
  if (location !== 'local') {
    const dirname = await
    require('electron').ipcRenderer
    .invoke('get-dir-path', location)
    const folder = this.sanitizeFolderName(subdir)
    saveDir = require('path').resolve(dirname, folder)
  } else {
    saveDir = File.route('Save')
  }
  File.openPath(saveDir)
}

// 规范化文件夹名称
Menubar.sanitizeFolderName = function (name) {
  // 移除Windows/macOS/Linux不允许的字符
  name = name.replace(/[\/:*?"<>|]/g, "")
  // 去掉开头和结尾的空格
  name = name.replace(/^\s+|\s+$/g, "")
  // Windows不能以"."结尾
  name = name.replace(/\.$/, "")
  // 避免Windows设备名（不区分大小写）
  const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
  if (reservedNames.test(name)) {
    // 添加后缀以避免冲突
    name += "_safe"
  }
  // 避免空字符串
  return name || "default_folder"
}

// 键盘按下事件
Menubar.keydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyN':
        Title.newProject()
        break
      case 'KeyO':
        Title.openProject()
        break
      case 'KeyS':
        File.save()
        break
      case 'KeyT':
        if (event.shiftKey) {
          Title.reopenClosedTab()
        }
        break
      case 'KeyW':
        Title.tabBar.close(Title.tabBar.read())
        break
      case 'KeyZ':
        if (!event.macRedoKey) {
          Scene.undo()
          UI.undo()
          Animation.undo()
          Particle.undo()
          break
        }
      case 'KeyY':
        Scene.redo()
        UI.redo()
        Animation.redo()
        Particle.redo()
        break
    }
  } else if (event.altKey) {
    switch (event.code) {
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9': {
        const elements = Title.tabBar.childNodes
        const index = parseInt(event.code.slice(-1)) - 1
        if (index < elements.length) {
          Title.tabBar.select(elements[index].item)
        }
        break
      }
    }
  } else {
    switch (event.code) {
      case 'F1':
        Project.open()
        break
      case 'F3':
        Variable.open()
        break
      case 'F6':
        Attribute.open()
        break
      case 'F7':
        Enum.open()
        break
      case 'F8':
        Localization.open()
        break
      case 'F9':
        PluginManager.open()
        break
      case 'F4':
        Title.playGame()
        break
      case 'F10':
        CustomCommand.open()
        break
      case 'KeyF':
        Palette.flipTiles()
        break
      // case 'Pause':
      //   GL.WEBGL_lose_context.loseContext()
      //   break
    }
  }
}

// 指针按下事件
Menubar.pointerdown = function (event) {
  switch (event.button) {
    case 0: case -1: {
      const target = event.target
      if (target.tagName === 'ITEM' &&
        !target.hasClass('selected')) {
        switch (target.getAttribute('value')) {
          case 'file':
            return Menubar.popupFileMenu(target)
          case 'edit':
            return Menubar.popupEditMenu(target)
          case 'view':
            return Menubar.popupViewMenu(target)
          case 'window':
            return Menubar.popupWindowMenu(target)
          case 'help':
            return Menubar.popupHelpMenu(target)
        }
      }
      break
    }
  }
}

// 指针弹起事件
Menubar.pointerup = function (event) {
  switch (event.button) {
    case 0: {
      const target = event.target
      if (target.tagName === 'ITEM' &&
        target.hasClass('selected')) {
        event.stopPropagation()
      }
      break
    }
  }
}

// 指针进入事件
Menubar.pointerover = function (event) {
  const element = event.target
  if (element.tagName === 'ITEM') {
    const parent = element.parentNode
    const selected = parent.querySelector('.selected')
    if (selected !== null && selected !== element) {
      Menubar.pointerdown(event)
    }
  }
}

// 超链接 - 点击事件
Menubar.hrefClick = function (event) {
  File.openURL(event.target.getAttribute('href'))
}

// ******************************** 主页面对象 ********************************

const Home = {
  // methods
  initialize: null,
  updateCenterPosition: null,
  parseRecentProjects: null,
  removeRecentProject: null,
  readFileList: null,
  // events
  windowResize: null,
  windowLocalize: null,
  startClick: null,
  recentClick: null,
  recentPointerup: null,
}

// 初始化
Home.initialize = function () {
  // 侦听事件
  window.on('resize', this.windowResize)
  window.on('localize', this.windowLocalize)
  $('#home-start-list').on('click', this.startClick)
  $('#home-recent-list').on('click', this.recentClick)
  $('#home-recent-list').on('pointerup', this.recentPointerup)
}

// 更新居中位置
Home.updateCenterPosition = function () {
  if (Layout.manager.index === 'home') {
    const elPage = $('#home')
    const elContent = $('#home-content')
    const pageRect = elPage.rect()
    const contentRect = elContent.rect()
    const left = (pageRect.width - contentRect.width) / 2
    const top = (pageRect.height - contentRect.height) / 2
    elContent.style.left = `${left}px`
    elContent.style.top = `${top}px`
  }
}

// 窗口 - 调整大小事件
Home.windowResize = function (event) {
  // 不支持page(home):resize事件
  // 先用window:resize代替
  Home.updateCenterPosition()
}

// 解析最近的项目
Home.parseRecentProjects = function () {
  const nodes = $('.home-recent-item')
  const items = Editor.config.recent
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i].clear()
    const item = items[i]
    node.removeClass('disabled')
    if (!item) {
      node.hide()
      continue
    } else {
      node.show()
    }

    // 创建标题栏
    const eBar = document.createElement('box')
    eBar.addClass('home-recent-bar')
    node.appendChild(eBar)

    // 创建标题文本
    const eTitle = document.createElement('text')
    eTitle.addClass('home-recent-title')
    eBar.appendChild(eTitle)

    // 创建日期文本
    const eDate = document.createElement('text')
    const date = new Date(item.date)
    const Y = date.getFullYear()
    const M = date.getMonth() + 1
    const D = date.getDate()
    const h = date.getHours()
    const m = date.getMinutes()
    const m2 = m.toString().padStart(2, '0')
    eDate.addClass('home-recent-date')
    eDate.textContent = `${Y}/${M}/${D} ${h}:${m2}`
    eBar.appendChild(eDate)

    // 创建路径文本
    const ePath = document.createElement('text')
    const path = item.path
    ePath.addClass('home-recent-path')
    ePath.textContent = Path.normalize(path)
    node.appendChild(ePath)

    // 创建统计列表
    const eStat = document.createElement('box')
    eStat.addClass('home-recent-stat')
    node.appendChild(eStat)

    // 检查文件是否存在
    const dirname = Path.dirname(path)
    new Promise((resolve, reject) => {
      if (FS.existsSync(path)) {
        const dPath = `${dirname}/data/config.json`
        resolve(FSP.readFile(dPath, 'utf8'))
      } else {
        reject(new URIError())
      }
    }).then(data => {
      // 设置标题文本
      const {window} = JSON.parse(data)
      eTitle.textContent = window.title
      return this.readFileList(dirname)
    }).then(list => {
      const counts = {
        folder: 0,
        data: 0,
        script: 0,
        image: 0,
        media: 0,
        other: 0,
        total: 0,
      }
      const sizes = {
        folder: 0,
        data: 0,
        script: 0,
        image: 0,
        media: 0,
        other: 0,
        total: 0,
      }
      const length = list.length
      for (let i = 0; i < length; i++) {
        const {type, size} = list[i]
        counts[type] += 1
        sizes[type] += size
      }
      counts.total =
        counts.data
      + counts.script
      + counts.image
      + counts.media
      + counts.other
      sizes.total =
        sizes.data
      + sizes.script
      + sizes.image
      + sizes.media
      + sizes.other
      const get = Local.createGetter('stats')
      for (const {type, name} of [
        {type: 'data',   name: get('data')},
        {type: 'script', name: get('script')},
        {type: 'image',  name: get('image')},
        {type: 'media',  name: get('media')},
        {type: 'other',  name: get('other')},
        {type: 'total',  name: get('total')},
      ]) {
        const count = counts[type]
        const size = File.parseFileSize(sizes[type])

        // 创建统计文本
        const eText1 = document.createElement('text')
        const eText2 = document.createElement('text')
        const eText3 = document.createElement('text')
        eText1.addClass('home-recent-data')
        eText2.addClass('home-recent-data')
        eText3.addClass('home-recent-data')
        eText1.textContent = name
        eText2.textContent = size
        eText3.textContent = `(${count})`
        eStat.appendChild(eText1)
        eStat.appendChild(eText2)
        eStat.appendChild(eText3)
      }
      node.show()
    }).catch(error => {
      node.addClass('disabled')
      if (error instanceof URIError) {
        eTitle.textContent = 'Project does not exist'
      } else {
        eTitle.textContent = 'Failed to load data'
      }
    })
  }
}

// 移除最近的项目
Home.removeRecentProject = function (index) {
  const nodes = $('.home-recent-item')
  const items = Editor.config.recent
  const item = items[index]
  const node = nodes[index]
  if (item && node) {
    items.remove(item)
    node.clear()
    const end = nodes.length - 1
    for (let i = index; i < end; i++) {
      const sNode = nodes[i + 1]
      const dNode = nodes[i]
      const array = Array.from(sNode.childNodes)
      for (const node of array) {
        dNode.appendChild(node)
      }
      sNode.hasClass('disabled')
      ? dNode.addClass('disabled')
      : dNode.removeClass('disabled')
    }
    nodes[items.length].hide()
  }
}

// 读取文件列表
Home.readFileList = function IIFE() {
  const extnameToTypeMap = {
    // 数据类型
    '.actor': 'data',
    '.skill': 'data',
    '.trigger': 'data',
    '.item': 'data',
    '.equip': 'data',
    '.state': 'data',
    '.event': 'data',
    '.scene': 'data',
    '.tile': 'data',
    '.ui': 'data',
    '.anim': 'data',
    '.particle': 'data',
    '.json': 'data',
    // 脚本类型
    '.js': 'script',
    '.ts': 'script',
    // 图像类型
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.cur': 'image',
    '.webp': 'image',
    // 媒体类型
    '.mp3': 'media',
    '.m4a': 'media',
    '.ogg': 'media',
    '.wav': 'media',
    '.flac': 'media',
    '.mp4': 'media',
    '.mkv': 'media',
    '.webm': 'media',
    // 其他类型
    '.ttf': 'other',
    '.otf': 'other',
    '.woff': 'other',
    '.woff2': 'other',
  }
  const options = {withFileTypes: true}
  const read = (path, list) => {
    return FSP.readdir(
      path,
      options,
    ).then(
      async files => {
        if (path) {
          path += '/'
        }
        const promises = []
        for (const file of files) {
          const name = file.name
          const newPath = `${path}${name}`
          if (file.isDirectory()) {
            list.push({
              type: 'folder',
              size: 0,
            })
            promises.push(read(
              newPath, list,
            ))
          } else {
            const extname = Path.extname(name)
            const type = extnameToTypeMap[extname.toLowerCase()] ?? 'other'
            const item = {
              type: type,
              size: 0,
            }
            list.push(item)
            promises.push(FSP.stat(newPath).then(
              stats => {
                item.size = stats.size
            }))
          }
        }
        if (promises.length !== 0) {
          await Promise.all(promises)
        }
        return list
      }
    )
  }
  return function (path) {
    return read(path, [])
  }
}()

// 窗口 - 本地化事件
Home.windowLocalize = function (event) {
  if (Layout.manager.index === 'home') {
    Home.parseRecentProjects()
  }
}

// 开始列表 - 鼠标点击事件
Home.startClick = function (event) {
  const element = event.target
  if (element.hasClass('home-start-item')) {
    switch (element.getAttribute('value')) {
      case 'new':
        Title.newProject()
        break
      case 'open':
        Title.openProject()
        break
    }
  }
}

// 最近列表 - 鼠标点击事件
Home.recentClick = function (event) {
  const element = event.target
  if (element.hasClass('home-recent-item') &&
    !element.hasClass('disabled')) {
    const index = element.getAttribute('value')
    const items = Editor.config.recent
    const item = items[parseInt(index)]
    if (item) Editor.open(item.path)
  }
}

// 最近列表 - 指针弹起事件
Home.recentPointerup = function (event) {
  switch (event.button) {
    case 2: {
      const element = event.target
      if (element.hasClass('home-recent-item') &&
        element.childNodes.length !== 0 &&
        document.activeElement === element.parentNode) {
        element.addClass('hover')
        const index = parseInt(element.getAttribute('value'))
        const enabled = !element.hasClass('disabled')
        const get = Local.createGetter('menuRecent')
        Menu.popup({
          x: event.clientX,
          y: event.clientY,
          close: () => {
            element.removeClass('hover')
          },
        }, [{
          label: get('openProject'),
          enabled: enabled,
          click: () => {
            const items = Editor.config.recent
            const item = items[index]
            if (item) {
              Editor.open(item.path)
            }
          },
        }, {
          label: get(Local.showInExplorer()),
          enabled: enabled,
          click: () => {
            const items = Editor.config.recent
            const item = items[index]
            if (item) {
              File.showInExplorer(item.path)
            }
          },
        }, {
          label: get('removeFromList'),
          click: () => {
            Home.removeRecentProject(index)
          },
        }])
      }
      break
    }
  }
}