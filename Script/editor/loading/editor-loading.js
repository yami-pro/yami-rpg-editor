'use strict'

import { Editor } from '../editor.js'
import * as Yami from '../../yami.js'

// ******************************** 编辑器对象加载 ********************************

// 初始化
Editor.initialize = async function () {
  // 关闭快捷键
  this.switchHotkey(false)

  // 加载配置数据
  try {
    // 提前初始化标题组件
    Yami.Title.initialize()
    const data = await window.config
    const code = JSON.stringify(data)
    this.config = data
    Object.defineProperty(this.config, 'code', {value: code})
    delete window.config

    // 初始化组件对象
    Yami.Local.initialize()
    Yami.AudioManager.initialize()
    Yami.Menubar.initialize()
    Yami.Home.initialize()
    Yami.Layout.initialize()
    Yami.Timer.initialize()
    Yami.Scene.initialize()
    Yami.UI.initialize()
    Yami.Animation.initialize()
    Yami.Particle.initialize()
    Yami.Window.initialize()
    Yami.EventEditor.initialize()
    Yami.Inspector.initialize()
    Yami.Command.initialize()
    Yami.Project.initialize()
    Yami.Easing.initialize()
    Yami.Team.initialize()
    Yami.PluginManager.initialize()
    Yami.CustomCommand.initialize()
    Yami.Log.initialize()
    Yami.Directory.initialize()
    Yami.Browser.initialize()
    Yami.Selector.initialize()
    Yami.Printer.initialize()
    Yami.Color.initialize()
    Yami.Variable.initialize()
    Yami.Attribute.initialize()
    Yami.Enum.initialize()
    Yami.ImageClip.initialize()
    Yami.Selection.initialize()
    Yami.Zoom.initialize()
    Yami.Rename.initialize()
    Yami.SetKey.initialize()
    Yami.SetQuantity.initialize()
    Yami.PresetObject.initialize()
    Yami.PresetElement.initialize()
    Yami.ArrayList.initialize()
    Yami.AttributeListInterface.initialize()
    Yami.ConditionListInterface.initialize()

    // 加载配置文件
    this.loadConfig()
    this.open()
  } catch (error) {
    Yami.Log.throw(error)
    Yami.Window.confirm({
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
  path = Yami.Path.slash(path ?? this.config.project)

  // 路径为空则返回
  if (!path) {
    Yami.Layout.manager.switch('home')
    return
  }

  // 验证路径有效性
  try {
    if (!Yami.FS.statSync(path).isFile()) {
      throw new Error('Invalid project path')
    }
  } catch (error) {
    Yami.Log.throw(error)
    Yami.Layout.manager.switch('home')
    return
  }

  // 关闭项目
  await this.close()

  // 更新文件根目录
  Yami.File.updateRoot(path)

  // 读取项目文件
  const promise = Yami.FSP.readFile(path, 'utf8')

  // 加载数据文件
  try {
    const loadData = Yami.Data.loadAll()
    const loadDir = Yami.Directory.read()
    await loadData
    await loadDir
    Yami.Data.inheritMetaData()
    Yami.Printer.loadDefault()
    Yami.Command.custom.loadCommandList()
    Yami.Animation.Player.updateStep()
  } catch (error) {
    Log.throw(error)
    const type =
      error instanceof URIError     ? 'Failed to read file'
    : error instanceof SyntaxError  ? 'Syntax error'
    :                                 'Error'
    Yami.Directory.close()
    Yami.Data.close()
    Yami.Window.confirm({
      message: `${type}: ${error.message}`,
      close: () => {
        Yami.Layout.manager.switch('home')
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
    Yami.Log.throw(error)
    const index = path.lastIndexOf('/') + 1
    const message = path.slice(index)
    Yami.Directory.close()
    Yami.Data.close()
    Yami.Window.confirm({
      message: `Failed to read file: ${message}`,
      close: () => {
        Yami.Layout.manager.switch('home')
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
  Yami.Title.updateTitleName()
}

// 关闭项目
Editor.close = function (save = true) {
  Yami.Layout.manager.switch(null)
  if (this.state === 'open') {
    this.state = 'closed'
    if (save) {
      this.saveProject()
      this.saveManifest()
    }
    this.switchHotkey(false)
    this.config.project = ''
    this.project = null
    Yami.Window.closeAll()
    Yami.Scene.close()
    Yami.UI.close()
    Yami.Directory.close()
    Yami.Inspector.close()
    Yami.Browser.close()
    Yami.Selector.close()
    Yami.Data.close()
    Yami.AudioManager.close()
    Yami.Printer.clearFonts()
    Yami.Title.updateTitleName()
    Yami.GL.textureManager.clear()
    return Promise.all(this.promises).catch(
      error => Yami.Log.throw(error)
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
    error => Yami.Log.throw(error)
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
  config.dialogs.open = Yami.Path.dirname(path)

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
    Yami.Title.saveToConfig(config)
    Yami.Layout.saveToConfig(config)
    Yami.Scene.saveToConfig(config)
    Yami.UI.saveToConfig(config)
    Yami.Animation.saveToConfig(config)
    Yami.Particle.saveToConfig(config)

    // 写入配置文件
    const json = JSON.stringify(config, null, 2)
    const last = config.code
    if (json !== last) {
      const path = 'config.json'
      this.protectPromise(
        Yami.FSP.writeFile(path, json)
        .catch(error => {
          const cache = `${path}.cache`
          Yami.FSP.writeFile(cache, json)
          Yami.FSP.writeFile(path, last)
          Yami.Log.throw(error)
        })
      )
    }
  } catch (error) {
    Yami.Log.throw(error)
    return console.error(error)
  }
}

// 加载配置文件
Editor.loadConfig = function () {
  const {config} = this
  Yami.Title.loadFromConfig(config)
  Yami.Layout.loadFromConfig(config)
  Yami.Scene.loadFromConfig(config)
  Yami.UI.loadFromConfig(config)
  Yami.Animation.loadFromConfig(config)
  Yami.Particle.loadFromConfig(config)
}

// 保存项目文件
Editor.saveProject = function () {
  const {project} = this
  if (!project) {
    return
  }
  try {
    Yami.Scene.saveToProject(project)
    Yami.UI.saveToProject(project)
    Yami.Animation.saveToProject(project)
    Yami.Particle.saveToProject(project)
    Yami.Palette.saveToProject(project)
    Yami.Sprite.saveToProject(project)
    Yami.Browser.saveToProject(project)
    Yami.Selector.saveToProject(project)
    Yami.PluginManager.saveToProject(project)
    Yami.Title.saveToProject(project)

    // 写入项目文件
    const json = JSON.stringify(project, null, 2)
    const last = project.code
    if (json !== last) {
      const path = this.config.project
      this.protectPromise(
        Yami.FSP.writeFile(path, json)
        .catch(error => {
          const cache = `${path}.cache`
          Yami.FSP.writeFile(cache, json)
          Yami.FSP.writeFile(path, last)
          Yami.Log.throw(error)
        })
      )
    }
  } catch (error) {
    Yami.Log.throw(error)
    return console.error(error)
  }
}

// 加载项目文件
// 标签的加载安排到最后
Editor.loadProject = function () {
  const {project} = this
  Yami.Scene.loadFromProject(project)
  Yami.UI.loadFromProject(project)
  Yami.Animation.loadFromProject(project)
  Yami.Particle.loadFromProject(project)
  Yami.Palette.loadFromProject(project)
  Yami.Sprite.loadFromProject(project)
  Yami.Browser.loadFromProject(project)
  Yami.Selector.loadFromProject(project)
  Yami.PluginManager.loadFromProject(project)
  Yami.Title.loadFromProject(project)
}

// 保存元数据清单文件
Editor.saveManifest = function () {
  return Yami.Data.saveManifest()
}
