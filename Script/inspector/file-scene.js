'use strict'

import * as Yami from '../yami.js'

// ******************************** 文件 - 场景页面 ********************************

{
  const FileScene = {
    // properties
    button: $('#scene-switch-settings'),
    owner: null,
    target: null,
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    write: null,
    update: null,
    // events
    paramInput: null,
  }

  // 初始化
  FileScene.initialize = function () {
    // 创建所有者代理
    this.owner = {
      setTarget: target => {
        if (this.target !== target) {
          Yami.Inspector.open('fileScene', target)
        }
      },
      planToSave: () => {
        Yami.Scene.planToSave()
      },
      get history() {
        return Yami.Scene.history
      },
    }

    // 同步滑动框和数字框的数值
    $('#fileScene-contrast-slider').synchronize($('#fileScene-contrast'))
    $('#fileScene-ambient-red-slider').synchronize($('#fileScene-ambient-red'))
    $('#fileScene-ambient-green-slider').synchronize($('#fileScene-ambient-green'))
    $('#fileScene-ambient-blue-slider').synchronize($('#fileScene-ambient-blue'))

    // 绑定事件列表
    $('#fileScene-events').bind(new Yami.EventListInterface(this, this.owner))

    // 绑定脚本列表
    $('#fileScene-scripts').bind(new Yami.ScriptListInterface(this, this.owner))

    // 绑定脚本参数面板
    $('#fileScene-parameter-pane').bind($('#fileScene-scripts'))

    // 侦听事件
    const elements = $(`#fileScene-tileWidth, #fileScene-tileHeight, #fileScene-contrast,
      #fileScene-ambient-red, #fileScene-ambient-green, #fileScene-ambient-blue`)
    const sliders = $(`#fileScene-contrast-slider, #fileScene-ambient-red-slider,
      #fileScene-ambient-green-slider, #fileScene-ambient-blue-slider`)
    elements.on('input', this.paramInput)
    elements.on('focus', Yami.Inspector.inputFocus)
    elements.on('blur', Yami.Inspector.inputBlur(this, this.owner))
    sliders.on('focus', Yami.Inspector.sliderFocus)
    sliders.on('blur', Yami.Inspector.sliderBlur)
    $('#fileScene-width, #fileScene-height').on('change', this.paramInput)
    $('#fileScene-events, #fileScene-scripts').on('change', Yami.Scene.listChange)
  }

  // 创建场景
  FileScene.create = function () {
    const objects = []
    const filters = {}
    const folders = Yami.Editor.project.scene.defaultFolders
    for (const name of Object.values(folders)) {
      if (name && filters[name] === undefined) {
        filters[name] = true
        objects.push({
          class: 'folder',
          name: name,
          expanded: true,
          hidden: false,
          locked: false,
          children: [],
        })
      }
    }
    const WIDTH = 20
    const HEIGHT = 20
    return Yami.Codec.encodeScene(Object.defineProperties({
      width: WIDTH,
      height: HEIGHT,
      tileWidth: 32,
      tileHeight: 32,
      contrast: 1,
      ambient: {red: 255, green: 255, blue: 255},
      terrains: Yami.Scene.createTerrains(WIDTH, HEIGHT),
      events: [],
      scripts: [],
      objects: objects,
    }, {
      terrainsCode: {
        writable: true,
        value: '',
      },
      terrainsChanged: {
        writable: true,
        value: true,
      },
    }))
  }

  // 打开数据
  FileScene.open = function (scene) {
    if (this.target !== scene) {
      this.target = scene

      // 更新按钮样式
      this.button.addClass('selected')

      // 写入数据
      const write = Yami.getElementWriter('fileScene', scene)
      write('width')
      write('height')
      write('tileWidth')
      write('tileHeight')
      write('contrast')
      write('ambient-red')
      write('ambient-green')
      write('ambient-blue')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  FileScene.close = function () {
    if (this.target) {
      this.target = null

      // 更新按钮样式
      this.button.removeClass('selected')
      $('#fileScene-events').clear()
      $('#fileScene-scripts').clear()
      $('#fileScene-parameter-pane').clear()
    }
  }

  // 写入数据
  FileScene.write = function (options) {
    if (options.width !== undefined) {
      $('#fileScene-width').write(options.width)
    }
    if (options.height !== undefined) {
      $('#fileScene-height').write(options.height)
    }
  }

  // 更新数据
  FileScene.update = function (scene, key, value) {
    Yami.Scene.planToSave()
    switch (key) {
      case 'width':
        if (scene.width !== value) {
          scene.setSize(value, scene.height)
        }
        break
      case 'height':
        if (scene.height !== value) {
          scene.setSize(scene.width, value)
        }
        break
      case 'tileWidth':
        if (scene.tileWidth !== value) {
          scene.setTileSize(value, scene.tileHeight)
        }
        break
      case 'tileHeight':
        if (scene.tileHeight !== value) {
          scene.setTileSize(scene.tileWidth, value)
        }
        break
      case 'contrast':
        if (scene.contrast !== value) {
          scene.contrast = value
          scene.requestRendering()
          Yami.GL.setContrast(value)
        }
        break
      case 'ambient-red':
      case 'ambient-green':
      case 'ambient-blue': {
        const index = key.indexOf('-') + 1
        const color = key.slice(index)
        if (scene.ambient[color] !== value) {
          scene.ambient[color] = value
          scene.requestRendering()
          Yami.GL.setAmbientLight(scene.ambient)
        }
        break
      }
    }
  }

  // 参数 - 输入事件
  FileScene.paramInput = function (event) {
    FileScene.update(
      FileScene.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.fileScene = FileScene
}
