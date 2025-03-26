'use strict'

// ******************************** 编辑器对象 ********************************

const Editor = {
  // properties
  state: 'closed',
  config: null,
  project: null,
  latestEditorVersion: '1.0.17',
  latestProjectVersion: '1.0.130',
  // methods
  initialize: null,
  open: null,
  close: null,
  quit: null,
  updatePath: null,
  switchHotkey: null,
  saveConfig: null,
  loadConfig: null,
  saveProject: null,
  loadProject: null,
  saveManifest: null,
  getVersionNumber: null,
  checkForEditorUpdates: null,
  checkForProjectUpdates: null,
  isProjectVersionSupported: null,
}

// 初始化
Editor.initialize = async function () {
  // 关闭快捷键
  this.switchHotkey(false)

  // 加载配置数据
  try {
    // 提前初始化标题组件
    Title.initialize()
    const data = await window.config
    const code = JSON.stringify(data)
    this.config = data
    this.checkForEditorUpdates()
    Object.defineProperty(this.config, 'code', {value: code})
    delete window.config

    // 初始化组件对象
    Local.initialize()
    AudioManager.initialize()
    Menubar.initialize()
    Home.initialize()
    Layout.initialize()
    Timer.initialize()
    Scene.initialize()
    UI.initialize()
    Animation.initialize()
    Particle.initialize()
    Window.initialize()
    EventEditor.initialize()
    Inspector.initialize()
    Command.initialize()
    Project.initialize()
    Easing.initialize()
    Team.initialize()
    PluginManager.initialize()
    CustomCommand.initialize()
    Log.initialize()
    UpdateLog.initialize()
    Reference.initialize()
    Directory.initialize()
    Browser.initialize()
    Selector.initialize()
    Printer.initialize()
    Color.initialize()
    Variable.initialize()
    Attribute.initialize()
    Enum.initialize()
    Localization.initialize()
    ImageClip.initialize()
    Selection.initialize()
    Zoom.initialize()
    Rename.initialize()
    SetKey.initialize()
    SetQuantity.initialize()
    PresetObject.initialize()
    PresetElement.initialize()
    ArrayList.initialize()
    AttributeListInterface.initialize()
    ConditionListInterface.initialize()

    // 加载配置文件
    this.loadConfig()
    Layout.manager.switch('home')
  } catch (error) {
    Log.throw(error)
    Window.confirm({
      message: `Failed to initialize\n${error.message}`,
      close: () => {
        this.config = null
        this.quit()
      },
    }, [{
      label: 'Confirm',
    }])
  }
}

// 打开项目
Editor.open = async function (path, agreed = false) {
  // 规范化路径分隔符
  path = Path.slash(path ?? this.config.project)

  // 路径为空则返回
  if (!path) {
    Layout.manager.switch('home')
    return
  }

  // 验证路径有效性
  try {
    if (!FS.statSync(path).isFile()) {
      throw new Error('Invalid project path')
    }
  } catch (error) {
    Layout.manager.switch('home')
    return
  }

  // 关闭项目
  await this.close()

  // 更新文件根目录
  File.updateRoot(path)

  // 获取本地化方法
  const get = Local.createGetter('confirmation')

  // 加载项目
  try {
    const json = FS.readFileSync(path, 'utf8')
    this.project = JSON.parse(json)
    Object.defineProperty(this.project, 'code', {value: json})
    const verNum = Editor.getVersionNumber(this.project.version)
    if (!Editor.isProjectVersionSupported()) {
      return Window.confirm({
        message: get('versionIsTooHigh'),
        close: () => {
          Layout.manager.switch('home')
        },
      }, [{
        label: get('confirm'),
      }])
    }
    // 升级到1.0.122：破坏性更新
    if (verNum < Editor.getVersionNumber('1.0.122')) {
      if (!agreed) {
        const warning = Updater.getTSVersionWarning()
        return Window.confirm({
          message: warning.message,
          close: () => {
            Layout.manager.switch('home')
          },
        }, [{
          label: warning.confirm,
          click: () => {
            Editor.open(path, true)
          },
        }, {
          label: warning.cancel,
        }])
      } else {
        Updater.backupProject()
      }
    }
  } catch (error) {
    Log.throw(error)
    return Window.confirm({
      message: error.message,
      close: () => {
        Layout.manager.switch('home')
      },
    }, [{
      label: get('confirm'),
    }])
  }

  // 加载数据文件
  try {
    const ver = this.project.version
    const verNum = Editor.getVersionNumber(ver)
    await Updater.createLocalization(verNum)
    const loadData = Data.loadAll()
    const loadDir = Directory.read()
    await loadData
    await loadDir
    Data.inheritMetaData()
  } catch (error) {
    Log.throw(error)
    const type =
      error instanceof URIError ? 'Failed to read file'
    : error instanceof SyntaxError ? 'Syntax error'
    : 'Error'
    Directory.close()
    Data.close()
    return Window.confirm({
      message: `${type}: ${error.message}`,
      close: () => {
        Layout.manager.switch('home')
      },
    }, [{
      label: get('confirm'),
    }])
  }

  // 加载项目文件
  try {
    // 更新路径
    this.updatePath(path)

    // 加载完所有数据后再检查更新
    await this.checkForProjectUpdates()

    // 使用更新后的数据初始化
    Printer.loadDefault()
    Command.custom.loadCommandList()
    Animation.Player.updateStep()
    this.loadProject()
  } catch (error) {
    Log.throw(error)
    const index = path.lastIndexOf('/') + 1
    const message = path.slice(index)
    Directory.close()
    Data.close()
    Window.confirm({
      message: `Failed to read file: ${message}`,
      close: () => {
        Layout.manager.switch('home')
      },
    }, [{
      label: 'Confirm',
    }])
    return
  }

  // 设置状态
  this.state = 'open'

  // 打开快捷键
  this.switchHotkey(true)

  // 启动TS编译
  if (Data.config.script.autoCompile) {
    Project.startTSC()
  }

  // 更新标题名称
  Title.updateTitleName()

  // 初始化游戏本地化语言
  // 因为是追加的内容
  // 必须置于检查更新之后
  GameLocal.initialize()
}

// 关闭项目
Editor.close = function (save = true) {
  Layout.manager.switch(null)
  if (this.state === 'open') {
    this.state = 'closed'
    if (save) {
      this.saveProject()
      this.saveManifest()
    }
    this.switchHotkey(false)
    this.config.project = ''
    this.project = null
    Window.closeAll()
    Scene.close()
    UI.close()
    Directory.close()
    Inspector.close()
    Browser.close()
    Selector.close()
    Data.close()
    AudioManager.close()
    Printer.clearFonts()
    Project.stopTSC()
    Title.updateTitleName()
    GL.textureManager.clear()
  }
}

// 退出应用
Editor.quit = function () {
  this.saveConfig()
  this.saveProject()
  this.saveManifest()
  require('electron').ipcRenderer.send('force-close-window')
}

// 更新路径
Editor.updatePath = function (path) {
  const {config} = this

  // 设置打开的项目路径
  config.project = path

  // 设置打开对话框路径
  config.dialogs.open = Path.dirname(path)

  // 设置最近的项目路径
  const items = config.recent
  const date = Date.now()
  const item = items.find(
    a => a.path === path
  )
  if (item) {
    item.date = date
    items.remove(item)
    items.unshift(item)
  } else {
    items.unshift({path, date})
    while (items.length > 3) {
      items.pop()
    }
  }
}

// 开关快捷键
Editor.switchHotkey = function IIFE() {
  const keydown = function (event) {
    if (event.cmdOrCtrlKey) {
      switch (event.code) {
        case 'KeyN':
        case 'KeyO':
        case 'KeyZ':
        case 'KeyY':
          return
      }
    } else {
      switch (event.code) {
        case 'Enter':
        case 'Escape':
        case 'ArrowUp':
        case 'ArrowDown':
          return
      }
    }
    event.stopPropagation()
  }
  return function (enabled) {
    switch (enabled) {
      case true:
        window.off('keydown', keydown, {capture: true})
        break
      case false:
        window.on('keydown', keydown, {capture: true})
        break
    }
  }
}()

// 保存配置文件
Editor.saveConfig = function () {
  const {config} = this
  if (!config) {
    return
  }
  try {
    Title.saveToConfig(config)
    Layout.saveToConfig(config)
    Scene.saveToConfig(config)
    UI.saveToConfig(config)
    Animation.saveToConfig(config)
    Particle.saveToConfig(config)

    // 写入配置文件
    const json = JSON.stringify(config, null, 2)
    const last = config.code
    if (json && json !== last) {
      const path = Path.resolve(__dirname, 'config.json')
      FSP.writeFile(path, json)
      .catch(error => {
        Log.throw(error)
      })
    }
  } catch (error) {
    Log.throw(error)
  }
}

// 加载配置文件
Editor.loadConfig = function () {
  const {config} = this
  Title.loadFromConfig(config)
  Layout.loadFromConfig(config)
  Scene.loadFromConfig(config)
  UI.loadFromConfig(config)
  Animation.loadFromConfig(config)
  Particle.loadFromConfig(config)
}

// 保存项目文件
Editor.saveProject = function () {
  const {project} = this
  if (!project) {
    return
  }
  try {
    Scene.saveToProject(project)
    UI.saveToProject(project)
    Animation.saveToProject(project)
    Particle.saveToProject(project)
    Palette.saveToProject(project)
    Sprite.saveToProject(project)
    Browser.saveToProject(project)
    Selector.saveToProject(project)
    PluginManager.saveToProject(project)
    Title.saveToProject(project)

    // 写入项目文件
    const json = JSON.stringify(project, null, 2)
    const last = project.code
    if (json && json !== last) {
      const path = this.config.project
      FSP.writeFile(path, json)
      .catch(error => {
        Log.throw(error)
      })
    }
  } catch (error) {
    Log.throw(error)
    return console.error(error)
  }
}

// 加载项目文件
// 标签的加载安排到最后
Editor.loadProject = function () {
  const {project} = this
  Scene.loadFromProject(project)
  UI.loadFromProject(project)
  Animation.loadFromProject(project)
  Particle.loadFromProject(project)
  Palette.loadFromProject(project)
  Sprite.loadFromProject(project)
  Browser.loadFromProject(project)
  Selector.loadFromProject(project)
  PluginManager.loadFromProject(project)
  Title.loadFromProject(project)
}

// 保存元数据清单文件
Editor.saveManifest = function () {
  return Data.saveManifest()
}

// 获取版本数值
Editor.getVersionNumber = function (version) {
  const nodes = version.split('.')
  const a = parseInt(nodes[0])
  const b = parseInt(nodes[1])
  const c = parseInt(nodes[2])
  return a * 100000000 + b * 10000 + c
}

// 检查编辑器更新
Editor.checkForEditorUpdates = function () {
  const ver1 = Editor.config.version
  const ver2 = Editor.latestEditorVersion
  const verNum1 = Editor.getVersionNumber(ver1)
  const verNum2 = Editor.getVersionNumber(ver2)
  if (verNum1 < verNum2) {
    Editor.config.version = ver2
    console.warn(`升级编辑器版本：${ver1} -> ${ver2}`)
  }
}

// 检查项目更新
Editor.checkForProjectUpdates = async function () {
  const ver1 = Editor.project.version
  const ver2 = Editor.latestProjectVersion
  const verNum1 = Editor.getVersionNumber(ver1)
  const verNum2 = Editor.getVersionNumber(ver2)
  if (verNum1 < verNum2) {
    console.warn(`升级项目版本：${ver1} -> ${ver2}`)
    Updater.updateProject(verNum1)
    Updater.updateConfig(verNum1)
    Updater.updateLocalEvents(verNum1)
    Updater.updateGlobalEvents(verNum1)
    Updater.updateActors(verNum1)
    Updater.updateSkills(verNum1)
    Updater.updateTriggers(verNum1)
    Updater.updateItems(verNum1)
    Updater.updateEquipments(verNum1)
    Updater.updateStates(verNum1)
    Updater.updateScenes(verNum1)
    Updater.updateTilesets(verNum1)
    Updater.updateElements(verNum1)
    Updater.updateAnimations(verNum1)
    Updater.updateParticles(verNum1)
    Updater.updateTeams(verNum1)
    Updater.updateToLatest(ver1)

    // 保存已修改的文件
    await File.save(false)
    Editor.project.version = ver2

    // 更新脚本等文件
    Directory.update()
    console.log('项目升级完毕!')
  }
}

// 判断项目版本是否受编辑器支持
Editor.isProjectVersionSupported = function () {
  const ver1 = Editor.project.version
  const ver2 = Editor.latestProjectVersion
  const verNum1 = Editor.getVersionNumber(ver1)
  const verNum2 = Editor.getVersionNumber(ver2)
  if (verNum1 <= verNum2) {
    return true
  }
}

// ******************************** 主函数 ********************************

!function main() {
  Editor.initialize()
}()