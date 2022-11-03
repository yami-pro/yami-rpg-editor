'use strict'

import { Editor } from '../editor.js'

import { Title } from '../../title/title.js'
import { Menubar } from '../../title/menu-bar.js'
import { Home } from '../../title/home.js'
import { AudioManager } from '../../audio/audio-manager.js'
import { Local } from '../../tools/local.js'
import { Data } from '../../data/data.js'
import { Log } from '../../log/log.js'
import { Path } from '../../file-system/path.js'
import { Layout } from '../../layout/layout.js'
import { Scene } from '../../scene/scene.js'
import { UI } from '../../ui/ui.js'
import { Timer } from '../../util/timer.js'
import { Animation } from '../../animation/animation.js'
import { Particle } from '../../particle/particle.js'
import { Window } from '../../tools/window.js'
import { EventEditor } from '../../command/event-editor.js'
import { Inspector } from '../../inspector/inspector.js'
import { Command } from '../../command/command.js'
import { Project } from '../../data/project.js'
import { Easing } from '../../data/easing.js'
import { Team } from '../../data/team.js'
import { PluginManager } from '../../plugin/plugin.js'
import { CustomCommand } from '../../command/custom-command.js'
import { Directory } from '../../file-system/directory.js'
import { Browser } from '../../browser/browser.js'
import { Selector } from '../../browser/selector.js'
import { Printer } from '../../printer/printer.js'
import { Color } from '../../tools/color.js'
import { Variable } from '../../variable/variable.js'
import { Attribute } from '../../attribute/attribute.js'
import { Enum } from '../../enum/enum.js'
import { ImageClip } from '../../tools/image-clip.js'
import { Selection } from '../../tools/selection.js'
import { Zoom } from '../../tools/zoom.js'
import { Rename } from '../../tools/rename.js'
import { SetKey } from '../../tools/set-key.js'
import { SetQuantity } from '../../tools/set-quantity.js'
import { PresetObject } from '../../tools/preset-object.js'
import { PresetElement } from '../../tools/preset-element.js'
import { ArrayList } from '../../tools/array-list.js'
import { AttributeListInterface } from '../../tools/attribute-list-interface.js'
import { ConditionListInterface } from '../../tools/condition-list-interface.js'
import { Palette } from '../../palette/palette.js'
import { Sprite } from '../../sprite/sprite.js'
import { FS, FSP } from '../../file-system/file-system.js'
import { GL } from '../../webgl/gl.js'
import { File } from '../../file-system/file.js'

// ******************************** 编辑器对象加载 ********************************

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
    Directory.initialize()
    Browser.initialize()
    Selector.initialize()
    Printer.initialize()
    Color.initialize()
    Variable.initialize()
    Attribute.initialize()
    Enum.initialize()
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
    this.open()
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
Editor.open = async function (path) {
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
    Log.throw(error)
    Layout.manager.switch('home')
    return
  }

  // 关闭项目
  await this.close()

  // 更新文件根目录
  File.updateRoot(path)

  // 读取项目文件
  const promise = FSP.readFile(path, 'utf8')

  // 加载数据文件
  try {
    const loadData = Data.loadAll()
    const loadDir = Directory.read()
    await loadData
    await loadDir
    Data.inheritMetaData()
    Printer.loadDefault()
    Command.custom.loadCommandList()
    Animation.Player.updateStep()
  } catch (error) {
    Log.throw(error)
    const type =
      error instanceof URIError     ? 'Failed to read file'
    : error instanceof SyntaxError  ? 'Syntax error'
    :                                 'Error'
    Directory.close()
    Data.close()
    Window.confirm({
      message: `${type}: ${error.message}`,
      close: () => {
        Layout.manager.switch('home')
      },
    }, [{
      label: 'Confirm',
    }])
    return
  }

  // 加载项目文件
  try {
    const data = await promise
    this.project = JSON.parse(data)
    Object.defineProperty(this.project, 'code', {value: data})
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

  // 更新路径
  this.updatePath(path)

  // 打开快捷键
  this.switchHotkey(true)

  // 更新标题名称
  Title.updateTitleName()
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
    Title.updateTitleName()
    GL.textureManager.clear()
    return Promise.all(this.promises).catch(
      error => Log.throw(error)
    )
  }
  return Promise.resolve()
}

// 退出应用
Editor.quit = function () {
  this.saveConfig()
  this.saveProject()
  this.saveManifest()
  Promise.all(this.promises).catch(
    error => Log.throw(error)
  ).then(() => {
    require('electron')
    .ipcRenderer
    .send('close-window-force')
  })
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
        case 'Escape':
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

// 保护承诺对象
Editor.protectPromise = function (promise) {
  const {promises} = this
  promises.push(promise)
  promise.finally(() => {
    promises.remove(promise)
  })
  return promise
}

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
    if (json !== last) {
      const path = 'config.json'
      this.protectPromise(
        FSP.writeFile(path, json)
        .catch(error => {
          const cache = `${path}.cache`
          FSP.writeFile(cache, json)
          FSP.writeFile(path, last)
          Log.throw(error)
        })
      )
    }
  } catch (error) {
    Log.throw(error)
    return console.error(error)
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
    if (json !== last) {
      const path = this.config.project
      this.protectPromise(
        FSP.writeFile(path, json)
        .catch(error => {
          const cache = `${path}.cache`
          FSP.writeFile(cache, json)
          FSP.writeFile(path, last)
          Log.throw(error)
        })
      )
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
