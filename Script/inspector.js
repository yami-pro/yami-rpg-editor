'use strict'

// ******************************** 检查器 ********************************

const Inspector = {
  // properties
  manager: null,
  type: null,
  meta: null,
  fileScene: null,
  fileUI: null,
  fileAnimation: null,
  fileParticle: null,
  fileTileset: null,
  fileActor: null,
  fileSkill: null,
  fileTrigger: null,
  fileItem: null,
  fileEquipment: null,
  fileState: null,
  fileEvent: null,
  fileImage: null,
  fileAudio: null,
  fileVideo: null,
  fileFont: null,
  fileScript: null,
  sceneActor: null,
  sceneRegion: null,
  sceneLight: null,
  sceneAnimation: null,
  sceneParticle: null,
  sceneParallax: null,
  sceneTilemap: null,
  uiElement: null,
  uiImage: null,
  uiText: null,
  uiTextBox: null,
  uiDialogBox: null,
  uiProgressBar: null,
  uiVideo: null,
  uiWindow: null,
  uiContainer: null,
  animMotion: null,
  animBoneLayer: null,
  animBoneFrame: null,
  animImageLayer: null,
  animImageFrame: null,
  animParticleLayer: null,
  animParticleFrame: null,
  particleLayer: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  getKey: null,
  // events
  inspectorResize: null,
  managerKeydown: null,
  scrollPointerdown: null,
  inputFocus: null,
  inputBlur: null,
  sliderFocus: null,
  sliderBlur: null,
  // classes
  ParamHistory: null,
}

// 初始化
Inspector.initialize = function () {
  // 设置页面管理器
  this.manager = $('#inspector-page-manager')
  this.manager.focusing = null
  this.manager.oldValue = null
  this.manager.listenDraggingScrollbarEvent(
    this.scrollPointerdown, {capture: true},
  )

  // this.manager.switch('fileTrigger')

  // 设置历史操作处理器
  History.processors['inspector-change'] = (operation, data) => {
    const {editor, target, changes} = data
    for (const change of changes) {
      const input = change.input
      const value = (
        operation === 'undo'
      ? change.oldValue
      : change.newValue
      )
      if (editor.target === target) {
        input.write(value)
        input.dispatchEvent(new Event('input'))
      } else {
        const key = Inspector.getKey(input)
        editor.update(target, key, value)
      }
    }
    editor.owner?.setTarget(target)
  }
  History.processors['inspector-layer-change'] = (operation, data) => {
    const {target, motion} = data
    History.processors['inspector-change'](operation, data)
    Animation.setMotion(motion)
    Animation.openLayer(target)
  }
  History.processors['inspector-frame-change'] = (operation, data) => {
    const {target, motion} = data
    History.processors['inspector-change'](operation, data)
    Animation.setMotion(motion)
    Animation.selectFrame(target)
  }
  History.processors['inspector-param-insert'] = (operation, data) => {
    const {history, target} = data
    const {owner, list} = history
    ParamHistory.restore(list, data, 'insert', operation)
    owner.setTarget(target)
    owner.planToSave()
  }
  History.processors['inspector-param-replace'] = (operation, data) => {
    const {history, target} = data
    const {owner, list} = history
    ParamHistory.restore(list, data, 'replace', operation)
    owner.setTarget(target)
    owner.planToSave()
  }
  History.processors['inspector-param-delete'] = (operation, data) => {
    const {history, target} = data
    const {owner, list} = history
    ParamHistory.restore(list, data, 'delete', operation)
    owner.setTarget(target)
    owner.planToSave()
  }
  History.processors['inspector-param-toggle'] = (operation, data) => {
    const {history, target} = data
    const {owner, list} = history
    ParamHistory.restore(list, data, 'toggle', operation)
    owner.setTarget(target)
    owner.planToSave()
  }
  History.processors['script-parameter-change'] = (operation, data) => {
    const {editor, target, meta, list, parameters, key, value} = data
    data.value = parameters[key]
    parameters[key] = value
    if (editor.target === target) {
      list.rewrite(parameters, key)
    }
    editor.owner.setTarget(target, meta)
  }

  // 侦听事件
  $('#inspector').on('resize', this.inspectorResize)
  this.manager.on('keydown', this.managerKeydown)

  // 初始化子对象
  this.fileScene.initialize()
  this.fileUI.initialize()
  this.fileAnimation.initialize()
  this.fileTileset.initialize()
  this.fileActor.initialize()
  this.fileSkill.initialize()
  this.fileTrigger.initialize()
  this.fileItem.initialize()
  this.fileEquipment.initialize()
  this.fileState.initialize()
  this.fileEvent.initialize()
  this.fileImage.initialize()
  this.fileAudio.initialize()
  this.fileVideo.initialize()
  this.fileFont.initialize()
  this.fileScript.initialize()
  this.sceneActor.initialize()
  this.sceneRegion.initialize()
  this.sceneLight.initialize()
  this.sceneAnimation.initialize()
  this.sceneParticle.initialize()
  this.sceneParallax.initialize()
  this.sceneTilemap.initialize()
  this.uiElement.initialize()
  this.uiImage.initialize()
  this.uiText.initialize()
  this.uiTextBox.initialize()
  this.uiDialogBox.initialize()
  this.uiProgressBar.initialize()
  this.uiVideo.initialize()
  this.uiWindow.initialize()
  this.animMotion.initialize()
  this.animBoneFrame.initialize()
  this.animImageLayer.initialize()
  this.animImageFrame.initialize()
  this.animParticleLayer.initialize()
  this.animParticleFrame.initialize()
  this.particleLayer.initialize()
}

// 打开
Inspector.open = function (type, target, meta) {
  if (this.manager.contains(document.activeElement)) {
    document.activeElement.blur()
  }
  if (this.type !== type) {
    if (this.type !== null) {
      this[this.type].close()
    }
    this.type = type
    this.manager.switch(type)
  }
  if (target) {
    this.meta = meta || null
    this[type].open(target, meta)
  } else {
    this.close()
  }
}

// 关闭
Inspector.close = function (type) {
  if (this.manager.contains(document.activeElement)) {
    document.activeElement.blur()
  }
  if (type === undefined) {
    type = this.type || undefined
  }
  if (this.type === type) {
    this[this.type].close()
    this.type = null
    this.meta = null
    this.manager.switch(null)
  }
}

// 获取属性的键
Inspector.getKey = function (element) {
  let key = element.key
  if (key === undefined) {
    const id = element.id
    const index = id.indexOf('-') + 1
    key = element.key = id.slice(index)
  }
  return key
}

// 检查器 - 调整大小
Inspector.inspectorResize = function IIFE() {
  const resize = new Event('resize')
  return function (event) {
    const page = Inspector.manager.active
    if (page instanceof HTMLElement) {
      page.dispatchEvent(resize)
    }
  }
}()

// 页面管理器 - 键盘按下事件
Inspector.managerKeydown = function (event) {
  const element = event.target
  switch (element.tagName) {
    // 禁用组件的按键冒泡行为
    case 'INPUT':
    case 'TEXTAREA':
      // 如果是滑动框类型则跳到default
      if (element.type !== 'range') {
        if (event.cmdOrCtrlKey) {
          switch (event.code) {
            case 'KeyS':
              break
            default:
              event.stopPropagation()
              break
          }
        } else {
          switch (event.code) {
            case 'Escape':
            case 'F1':
            case 'F2':
            case 'F3':
            case 'F4':
              break
            default:
              event.stopPropagation()
              break
          }
        }
        break
      }
    default:
      if (event.cmdOrCtrlKey) {
        switch (event.code) {
          case 'KeyZ':
          case 'KeyY':
            if (Inspector.manager.focusing) {
              document.activeElement.blur()
            }
            break
        }
      }
  }
}

// 滚动 - 指针按下事件
Inspector.scrollPointerdown = function (event) {
  if (this.dragging) {
    return
  }
  switch (event.button) {
    case 0:
      if (event.altKey && !(
        event.target instanceof MarqueeArea)) {
        let element = event.target
        while (element !== this) {
          if (element.scrollPointerup &&
            element.hasScrollBar()) {
            return
          }
          element = element.parentNode
        }
        event.preventDefault()
        event.stopImmediatePropagation()
        this.dragging = event
        event.mode = 'scroll'
        event.scrollLeft = this.scrollLeft
        event.scrollTop = this.scrollTop
        Cursor.open('cursor-grab')
        window.on('pointerup', this.scrollPointerup)
        window.on('pointermove', this.scrollPointermove)
      }
      break
  }
}

// 输入框 - 获得焦点事件
Inspector.inputFocus = function (event) {
  if (Window.activeElement === null) {
    const {manager} = Inspector
    if (manager.focusing !== null) {
      const id1 = manager.focusing.id
      const id2 = this.id
      return Log.throw(new Error(
        `Inspector focus error: ${id1} -> ${id2}`
      ))
    }
    manager.focusing = this
    manager.oldValue = this.read()
  }
}

// 输入框 - 失去焦点事件 - 生成器
Inspector.inputBlur = function (editor, owner, callback = null) {
  return function (event) {
    if (Window.activeElement === null) {
      // 鼠标点击DevTools后再点击其他地方可能额外触发一次blur事件
      // 因此需要判断manager.focusing
      const {manager} = Inspector
      if (manager.focusing === null) {
        return
      }
      const target = editor.target
      const oldValue = manager.oldValue
      const newValue = this.read()
      if (target !== null) {
        const changes = []
        if (oldValue !== newValue) {
          changes.push({
            input: this,
            oldValue: oldValue,
            newValue: newValue,
          })
        }
        if (this.changes) {
          changes.push(...this.changes)
        }
        if (changes.length !== 0) {
          const data = {
            type: 'inspector-change',
            editor: editor,
            target: target,
            changes: changes,
          }
          owner.history.save(data)
          callback?.(data)
        }
      }
      if (this.changes) {
        delete this.changes
      }
      manager.focusing = null
      manager.oldValue = null
    }
  }
}

// 滑动框 - 获得焦点事件
Inspector.sliderFocus = function IIFE() {
  const focus = new FocusEvent('focus')
  return function (event) {
    this.synchronizer.dispatchEvent(focus)
  }
}()

// 滑动框 - 失去焦点事件
Inspector.sliderBlur = function IIFE() {
  const blur = new FocusEvent('blur')
  return function (event) {
    this.synchronizer.dispatchEvent(blur)
  }
}()

// 参数操作历史
Inspector.ParamHistory = class ParamHistory {
  editor  //:object
  owner   //:object
  list    //:element

  constructor(editor, owner, list) {
    this.editor = editor
    this.owner = owner
    this.list = list
  }

  // 重置历史
  reset() {}

  // 保存数据
  save(data) {
    const {target} = this.editor
    if (target !== null) {
      switch (data.type) {
        case 'insert':
          data.type = 'inspector-param-insert'
          break
        case 'replace':
          data.type = 'inspector-param-replace'
          break
        case 'delete':
          data.type = 'inspector-param-delete'
          break
        case 'toggle':
          data.type = 'inspector-param-toggle'
          break
      }
      data.history = this
      data.target = target
      this.owner.history.save(data)
    }
  }

  // 恢复数据
  restore(operation) {
    this.owner.history.restore(operation)
  }

  // 撤销条件判断
  canUndo() {
    const history = this.owner.history
    const data = history[history.index]
    return data?.type.indexOf('inspector-param') === 0
  }

  // 重做条件判断
  canRedo() {
    const history = this.owner.history
    const data = history[history.index + 1]
    return data?.type.indexOf('inspector-param') === 0
  }
}

// ******************************** 文件 - 场景页面 ********************************

{const FileScene = {
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
        Inspector.open('fileScene', target)
      }
    },
    planToSave: () => {
      Scene.planToSave()
    },
    get history() {
      return Scene.history
    },
  }

  // 同步滑动框和数字框的数值
  $('#fileScene-contrast-slider').synchronize($('#fileScene-contrast'))
  $('#fileScene-ambient-red-slider').synchronize($('#fileScene-ambient-red'))
  $('#fileScene-ambient-green-slider').synchronize($('#fileScene-ambient-green'))
  $('#fileScene-ambient-blue-slider').synchronize($('#fileScene-ambient-blue'))

  // 绑定事件列表
  $('#fileScene-events').bind(new EventListInterface(this, this.owner))

  // 绑定脚本列表
  $('#fileScene-scripts').bind(new ScriptListInterface(this, this.owner))

  // 绑定脚本参数面板
  $('#fileScene-parameter-pane').bind($('#fileScene-scripts'))

  // 侦听事件
  const elements = $(`#fileScene-tileWidth, #fileScene-tileHeight, #fileScene-contrast,
    #fileScene-ambient-red, #fileScene-ambient-green, #fileScene-ambient-blue`)
  const sliders = $(`#fileScene-contrast-slider, #fileScene-ambient-red-slider,
    #fileScene-ambient-green-slider, #fileScene-ambient-blue-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, this.owner))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
  $('#fileScene-width, #fileScene-height').on('change', this.paramInput)
  $('#fileScene-events, #fileScene-scripts').on('change', Scene.listChange)
}

// 创建场景
FileScene.create = function () {
  const objects = []
  const filters = {}
  const folders = Editor.project.scene.defaultFolders
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
  return Codec.encodeScene(Object.defineProperties({
    width: WIDTH,
    height: HEIGHT,
    tileWidth: 32,
    tileHeight: 32,
    contrast: 1,
    ambient: {red: 255, green: 255, blue: 255},
    terrains: Scene.createTerrains(WIDTH, HEIGHT),
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
    const write = getElementWriter('fileScene', scene)
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
  Scene.planToSave()
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
        GL.setContrast(value)
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
        GL.setAmbientLight(scene.ambient)
      }
      break
    }
  }
}

// 参数 - 输入事件
FileScene.paramInput = function (event) {
  FileScene.update(
    FileScene.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.fileScene = FileScene}

// ******************************** 文件 - 界面页面 ********************************

{const FileUI = {
  // properties
  button: $('#ui-switch-settings'),
  owner: null,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
FileUI.initialize = function () {
  // 创建所有者代理
  this.owner = {
    setTarget: target => {
      if (this.target !== target) {
        Inspector.open('fileUI', target)
      }
    },
    planToSave: () => {
      UI.planToSave()
    },
    get history() {
      return UI.history
    },
  }

  // 侦听事件
  const elements = $('#fileUI-width, #fileUI-height')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, this.owner))
}

// 创建界面
FileUI.create = function () {
  const {resolution} = Data.config
  return {
    width: resolution.minWidth,
    height: resolution.minHeight,
    nodes: [],
  }
}

// 打开数据
FileUI.open = function (ui) {
  if (this.target !== ui) {
    this.target = ui

    // 更新按钮样式
    this.button.addClass('selected')

    // 写入数据
    const write = getElementWriter('fileUI', ui)
    write('width')
    write('height')
  }
}

// 关闭数据
FileUI.close = function () {
  if (this.target) {
    this.target = null

    // 更新按钮样式
    this.button.removeClass('selected')
  }
}

// 更新数据
FileUI.update = function (ui, key, value) {
  UI.planToSave()
  switch (key) {
    case 'width':
      if (ui.width !== value) {
        ui.setSize(value, ui.height)
      }
      break
    case 'height':
      if (ui.height !== value) {
        ui.setSize(ui.width, value)
      }
      break
  }
}

// 参数 - 输入事件
FileUI.paramInput = function (event) {
  FileUI.update(
    FileUI.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.fileUI = FileUI}

// ******************************** 文件 - 动画页面 ********************************

{const FileAnimation = {
  // properties
  button: $('#animation-switch-settings'),
  owner: null,
  target: null,
  sprites: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  // update: null,
  // events
  // paramInput: null,
}

// 初始化
FileAnimation.initialize = function () {
  // 创建所有者代理
  this.owner = {
    setTarget: target => {
      if (this.target !== target) {
        Inspector.open('fileAnimation', target)
      }
    },
    planToSave: () => {
      Animation.planToSave()
    },
    get history() {
      return Animation.history
    },
  }

  // 绑定精灵图列表
  $('#fileAnimation-sprites').bind(this.sprites)

  // 侦听事件
  $('#fileAnimation-sprites').on('change', Animation.listChange)
}

// 创建动画
FileAnimation.create = function () {
  return {
    sprites: [],
    motions: [],
  }
}

// 打开数据
FileAnimation.open = function (animation) {
  if (this.target !== animation) {
    this.target = animation

    // 更新按钮样式
    this.button.addClass('selected')

    // 写入数据
    const write = getElementWriter('fileAnimation', animation)
    write('sprites')
  }
}

// 关闭数据
FileAnimation.close = function () {
  if (this.target) {
    this.target = null

    // 更新按钮样式
    this.button.removeClass('selected')
  }
}

// 更新数据
// FileAnimation.update = function (animation, key, value) {
//   Animation.planToSave()
// }

// 参数 - 输入事件
// FileAnimation.paramInput = function (event) {
//   FileAnimation.update(
//     FileAnimation.target,
//     Inspector.getKey(this),
//     this.read(),
//   )
// }

// 精灵图列表接口
FileAnimation.sprites = {
  list: null,
  spriteId: '',
  initialize: function (list) {
    $('#fileAnimation-sprite-confirm').on('click', () => list.save())

    // 引用列表元素
    this.list = list

    // 创建参数历史操作
    this.history = new Inspector.ParamHistory(
      FileAnimation,
      FileAnimation.owner,
      list,
    )

    // 重载动画纹理 - 改变事件
    list.on('change', event => {
      if (Animation.sprites) {
        if (Animation.sprites.listItems) {
          Animation.sprites.listItems = undefined
        }
        Animation.loadTextures()
      }
    })
  },
  parse: function ({name, image, hframes, vframes}) {
    return [name, `${Command.parseFileName(image)} [${hframes}x${vframes}]`]
  },
  createSpriteId: function (exclusions = Object.empty) {
    let id
    do {id = GUID.generate64bit()}
    while (this.list.data.find(a => a.id === id) && exclusions[id])
    return id
  },
  open: function ({
    name    = '',
    id      = this.createSpriteId(),
    image   = '',
    hframes = 1,
    vframes = 1,
  } = {}) {
    Window.open('fileAnimation-sprite')
    const write = getElementWriter('fileAnimation-sprite')
    write('name', name)
    write('image', image)
    write('hframes', hframes)
    write('vframes', vframes)
    this.spriteId = id
    if (!name) {
      $('#fileAnimation-sprite-name').getFocus()
    } else {
      $('#fileAnimation-sprite-image').getFocus()
    }
  },
  save: function () {
    const read = getElementReader('fileAnimation-sprite')
    const name = read('name').trim()
    if (!name) {
      return $('#fileAnimation-sprite-name').getFocus()
    }
    const image = read('image')
    const hframes = read('hframes')
    const vframes = read('vframes')
    const id = this.spriteId
    Window.close('fileAnimation-sprite')
    return {name, id, image, hframes, vframes}
  },
  onPaste: function (list, copies) {
    const exclusions = {}
    for (const sprite of copies) {
      const id = this.createSpriteId(exclusions)
      sprite.id = id
      exclusions[id] = true
    }
  },
}

Inspector.fileAnimation = FileAnimation}

// ******************************** 文件 - 粒子页面 ********************************

{const FileParticle = {
  // methods
  create: null,
}

// 创建粒子
FileParticle.create = function () {
  return {
    duration: 0,
    layers: [],
  }
}

Inspector.fileParticle = FileParticle}

// ******************************** 文件 - 图块组页面 ********************************

{const FileTileset = {
  // properties
  target: null,
  meta: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
FileTileset.initialize = function () {
  // 侦听事件
  $(`#fileTileset-image, #fileTileset-tileWidth, #fileTileset-tileHeight,
    #fileTileset-globalOffsetX, #fileTileset-globalOffsetY,
    #fileTileset-globalPriority`).on('input', this.paramInput)
  $('#fileTileset-width, #fileTileset-height').on('change', this.paramInput)

  // 初始化调色板
  Palette.initialize()
}

// 创建图块组
FileTileset.create = function (type) {
  switch (type) {
    case 'normal':
      return {
        type: 'normal',
        image: '',
        width: 1,
        height: 1,
        tileWidth: 32,
        tileHeight: 32,
        globalOffsetX: 0,
        globalOffsetY: 0,
        globalPriority: 0,
        priorities: [0],
      }
    case 'auto':
      return {
        type: 'auto',
        tiles: [0],
        width: 1,
        height: 1,
        tileWidth: 32,
        tileHeight: 32,
        globalOffsetX: 0,
        globalOffsetY: 0,
        globalPriority: 0,
        priorities: [0],
      }
  }
}

// 打开数据
FileTileset.open = function (tileset, meta) {
  if (this.meta !== meta) {
    this.target = tileset
    this.meta = meta
    Palette.open(meta)

    // 允许页面内容溢出
    Inspector.manager.addClass('overflow-visible')

    // 显示或隐藏图像输入框
    switch (tileset.type) {
      case 'normal':
        $('#fileTileset-image').enable()
        break
      case 'auto':
        $('#fileTileset-image').disable()
        break
    }

    // 写入数据
    const write = getElementWriter('fileTileset', tileset)
    write('image', tileset.image ?? '')
    write('width')
    write('height')
    write('tileWidth')
    write('tileHeight')
    write('globalOffsetX')
    write('globalOffsetY')
    write('globalPriority')
  }
}

// 关闭数据
FileTileset.close = function () {
  if (this.target) {
    Inspector.manager.removeClass('overflow-visible')
    Browser.unselect(this.meta)
    Palette.close()
    this.target = null
    this.meta = null
  }
}

// 更新数据
FileTileset.update = function (tileset, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'image':
      if (tileset.image !== value) {
        Palette.setImage(value)
      }
      break
    case 'width':
      if (tileset.width !== value) {
        Palette.setSize(value, tileset.height)
      }
      break
    case 'height':
      if (tileset.height !== value) {
        Palette.setSize(tileset.width, value)
      }
      break
    case 'tileWidth':
      if (tileset.tileWidth !== value) {
        Palette.setTileSize(value, tileset.tileHeight)
      }
      break
    case 'tileHeight':
      if (tileset.tileHeight !== value) {
        Palette.setTileSize(tileset.tileWidth, value)
      }
      break
    case 'globalOffsetX':
    case 'globalOffsetY':
    case 'globalPriority':
      if (tileset[key] !== value) {
        tileset[key] = value
      }
      break
  }
  Scene.requestRendering()
}

// 参数 - 输入事件
FileTileset.paramInput = function (event) {
  FileTileset.update(
    FileTileset.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.fileTileset = FileTileset}

// ******************************** 文件 - 角色页面 ********************************

{const FileActor = {
  // properties
  target: null,
  meta: null,
  sprites: null,
  skills: null,
  equipments: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  animationIdWrite: null,
  paramInput: null,
  listChange: null,
}

// 初始化
FileActor.initialize = function () {
  // 绑定属性列表
  $('#fileActor-attributes').bind(new AttributeListInterface())

  // 绑定精灵图列表
  $('#fileActor-sprites').bind(this.sprites)

  // 绑定技能列表
  $('#fileActor-skills').bind(this.skills)

  // 绑定装备列表
  $('#fileActor-equipments').bind(this.equipments)

  // 绑定事件列表
  $('#fileActor-events').bind(new EventListInterface())

  // 绑定脚本列表
  $('#fileActor-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileActor-parameter-pane').bind($('#fileActor-scripts'))

  // 侦听事件
  $('#fileActor-animationId').on('write', this.animationIdWrite)
  $(`#fileActor-portrait, #fileActor-animationId, #fileActor-idleMotion, #fileActor-moveMotion,
    #fileActor-speed, #fileActor-size, #fileActor-weight`).on('input', this.paramInput)
  $(`#fileActor-sprites, #fileActor-attributes, #fileActor-skills, #fileActor-equipments,
    #fileActor-events, #fileActor-scripts
  `).on('change', this.listChange)
}

// 创建角色
FileActor.create = function () {
  return {
    portrait: '',
    animationId: '',
    idleMotion: '',
    moveMotion: '',
    speed: 4,
    size: 0.8,
    weight: 1,
    sprites: [],
    attributes: [],
    skills: [],
    equipments: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
FileActor.open = function (actor, meta) {
  if (this.meta !== meta) {
    this.target = actor
    this.meta = meta

    // 写入数据
    const write = getElementWriter('fileActor', actor)
    write('portrait')
    write('animationId')
    write('idleMotion')
    write('moveMotion')
    write('sprites')
    write('speed')
    write('size')
    write('weight')
    write('attributes')
    write('skills')
    write('equipments')
    write('events')
    write('scripts')
  }
}

// 关闭数据
FileActor.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    $('#fileActor-sprites').clear()
    $('#fileActor-attributes').clear()
    $('#fileActor-skills').clear()
    $('#fileActor-equipments').clear()
    $('#fileActor-events').clear()
    $('#fileActor-scripts').clear()
    $('#fileActor-parameter-pane').clear()
  }
}

// 更新数据
FileActor.update = function (actor, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'portrait':
      if (actor.portrait !== value) {
        actor.portrait = value
        Browser.body.updateIcon(this.meta.file)
      }
      break
    case 'animationId':
      if (actor.animationId !== value) {
        const id = actor.animationId
        actor.animationId = value
        if (Scene.actors instanceof Array) {
          const animation = Data.animations[id]
          for (const actor of Scene.actors) {
            if (actor.player?.data === animation) {
              Scene.destroyObjectContext(actor)
              Scene.loadActorContext(actor)
            }
          }
          Scene.requestRendering()
        }
      }
      break
    case 'idleMotion':
      if (actor[key] !== value) {
        actor[key] = value
        if (Scene.actors instanceof Array) {
          const id = actor.animationId
          const animation = Data.animations[id]
          for (const {player} of Scene.actors) {
            if (player?.data === animation) {
              player.reset()
              player.switch(value, player.suffix)
            }
          }
          Scene.requestRendering()
        }
      }
      break
    case 'moveMotion':
    case 'speed':
    case 'size':
    case 'weight':
      if (actor[key] !== value) {
        actor[key] = value
      }
      break
  }
}

// 动画ID - 写入事件
FileActor.animationIdWrite = function (event) {
  const elIdleMotion = $('#fileActor-idleMotion')
  const elMoveMotion = $('#fileActor-moveMotion')
  const items = Animation.getMotionListItems(event.value)
  elIdleMotion.loadItems(items)
  elMoveMotion.loadItems(items)
  elIdleMotion.write2(elIdleMotion.read())
  elMoveMotion.write2(elMoveMotion.read())
}

// 参数 - 输入事件
FileActor.paramInput = function (event) {
  FileActor.update(
    FileActor.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// 列表 - 改变事件
FileActor.listChange = function (event) {
  File.planToSave(FileActor.meta)
}

// 精灵图列表接口
FileActor.sprites = {
  initialize: function (list) {
    $('#fileActor-sprite-confirm').on('click', () => list.save())

    // 重载场景角色动画 - 改变事件
    list.on('change', event => {
      const guid = FileActor.meta.guid
      if (Scene.actors instanceof Array) {
        for (const actor of Scene.actors) {
          if (actor.actorId === guid) {
            Scene.destroyObjectContext(actor)
            Scene.loadActorContext(actor)
          }
        }
      }
    })
  },
  parse: function ({id, image}) {
    Command.invalid = false
    const animationId = FileActor.target.animationId
    const spriteName = Command.parseSpriteName(animationId, id)
    const spriteClass = Command.invalid ? 'invalid' : ''
    Command.invalid = false
    const fileName = Command.parseFileName(image)
    const fileClass = Command.invalid ? 'invalid' : ''
    return [
      {content: spriteName, class: spriteClass},
      {content: fileName, class: fileClass},
    ]
  },
  open: function ({id = '', image = ''} = {}) {
    Window.open('fileActor-sprite')
    const animationId = FileActor.target.animationId
    const items = Animation.getSpriteListItems(animationId)
    $('#fileActor-sprite-id').loadItems(items)
    const write = getElementWriter('fileActor-sprite')
    write('id', id)
    write('image', image)
    if (!id) {
      $('#fileActor-sprite-id').getFocus()
    } else {
      $('#fileActor-sprite-image').getFocus()
    }
  },
  save: function () {
    const read = getElementReader('fileActor-sprite')
    const id = read('id')
    if (!id) {
      return $('#fileActor-sprite-id').getFocus()
    }
    const image = read('image')
    Window.close('fileActor-sprite')
    return {id, image}
  },
}

// 技能列表接口
FileActor.skills = {
  initialize: function (list) {
    $('#fileActor-skill-confirm').on('click', () => list.save())
  },
  parse: function ({id, key}) {
    Command.invalid = false
    const skillName = Command.parseFileName(id)
    const skillClass = Command.invalid ? 'invalid' : ''
    Command.invalid = false
    const shortcutKey = key ? Command.parseGroupEnumString('shortcut-key', key) : ''
    const shortcutClass = Command.invalid ? 'invalid' : 'weak'
    return [
      {content: skillName, class: skillClass},
      {content: shortcutKey, class: shortcutClass},
    ]
  },
  open: function ({id = '', key = ''} = {}) {
    Window.open('fileActor-skill')
    const elSkillId = $('#fileActor-skill-id')
    const elSkillKey = $('#fileActor-skill-key')
    const items = Enum.getStringItems('shortcut-key', true)
    elSkillKey.loadItems(items)
    elSkillId.write(id)
    elSkillKey.write(key)
    elSkillId.getFocus()
  },
  save: function () {
    const elSkillId = $('#fileActor-skill-id')
    const elSkillKey = $('#fileActor-skill-key')
    const id = elSkillId.read()
    if (!id) {
      return elSkillId.getFocus()
    }
    const key = elSkillKey.read()
    Window.close('fileActor-skill')
    return {id, key}
  },
}

// 装备列表接口
FileActor.equipments = {
  initialize: function (list) {
    $('#fileActor-equipment-confirm').on('click', () => list.save())
  },
  parse: function ({id, slot}) {
    Command.invalid = false
    const equipmentName = Command.parseFileName(id)
    const equipmentClass = Command.invalid ? 'invalid' : ''
    Command.invalid = false
    const shortcutKey = slot ? Command.parseGroupEnumString('equipment-slot', slot) : ''
    const shortcutClass = Command.invalid ? 'invalid' : 'weak'
    return [
      {content: equipmentName, class: equipmentClass},
      {content: shortcutKey, class: shortcutClass},
    ]
  },
  open: function ({id = '', slot = Enum.getDefStringId('equipment-slot')} = {}) {
    Window.open('fileActor-equipment')
    const elEquipmentId = $('#fileActor-equipment-id')
    const elEquipmentKey = $('#fileActor-equipment-slot')
    const items = Enum.getStringItems('equipment-slot')
    elEquipmentKey.loadItems(items)
    elEquipmentId.write(id)
    elEquipmentKey.write(slot)
    elEquipmentId.getFocus()
  },
  save: function () {
    const elEquipmentId = $('#fileActor-equipment-id')
    const elKey = $('#fileActor-equipment-slot')
    const id = elEquipmentId.read()
    if (!id) {
      return elEquipmentId.getFocus()
    }
    const slot = elKey.read()
    if (!slot) {
      return elKey.getFocus()
    }
    Window.close('fileActor-equipment')
    return {id, slot}
  },
}

Inspector.fileActor = FileActor}

// ******************************** 文件 - 技能页面 ********************************

{const FileSkill = {
  // properties
  target: null,
  meta: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
  listChange: null,
}

// 初始化
FileSkill.initialize = function () {
  // 绑定属性列表
  $('#fileSkill-attributes').bind(new AttributeListInterface())

  // 绑定事件列表
  $('#fileSkill-events').bind(new EventListInterface())

  // 绑定脚本列表
  $('#fileSkill-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileSkill-parameter-pane').bind($('#fileSkill-scripts'))

  // 侦听事件
  $('#fileSkill-icon, #fileSkill-clip').on('input', this.paramInput)
  $('#fileSkill-attributes, #fileSkill-events, #fileSkill-scripts').on('change', this.listChange)
}

// 创建技能
FileSkill.create = function () {
  return {
    icon: '',
    clip: [0, 0, 32, 32],
    attributes: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
FileSkill.open = function (skill, meta) {
  if (this.meta !== meta) {
    this.target = skill
    this.meta = meta

    // 写入数据
    const write = getElementWriter('fileSkill', skill)
    write('icon')
    write('clip')
    write('attributes')
    write('events')
    write('scripts')
  }
}

// 关闭数据
FileSkill.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    $('#fileSkill-attributes').clear()
    $('#fileSkill-events').clear()
    $('#fileSkill-scripts').clear()
    $('#fileSkill-parameter-pane').clear()
  }
}

// 更新数据
FileSkill.update = function (skill, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'icon':
    case 'clip':
      if (skill[key] !== value) {
        skill[key] = value
        Browser.body.updateIcon(this.meta.file)
      }
      break
  }
}

// 参数 - 输入事件
FileSkill.paramInput = function (event) {
  FileSkill.update(
    FileSkill.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// 列表 - 改变事件
FileSkill.listChange = function (event) {
  File.planToSave(FileSkill.meta)
}

Inspector.fileSkill = FileSkill}

// ******************************** 文件 - 触发器页面 ********************************

{const FileTrigger = {
  // properties
  target: null,
  meta: null,
  motions: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  animationIdWrite: null,
  paramInput: null,
  listChange: null,
}

// 初始化
FileTrigger.initialize = function () {
  // 创建选择器选项
  $('#fileTrigger-selector').loadItems([
    {name: 'Enemy', value: 'enemy'},
    {name: 'Friend', value: 'friend'},
    {name: 'Team Member', value: 'team'},
    {name: 'Team Member Except Self', value: 'team-except-self'},
    {name: 'Any Except Self', value: 'any-except-self'},
    {name: 'Any', value: 'any'},
  ])

  // 创建墙体碰撞选项
  $('#fileTrigger-onHitWalls').loadItems([
    {name: 'Through', value: 'through'},
    {name: 'Destroy', value: 'destroy'},
  ])

  // 创建角色碰撞选项
  $('#fileTrigger-onHitActors').loadItems([
    {name: 'Through', value: 'through'},
    {name: 'Destroy', value: 'destroy'},
  ])

  // 创建形状类型选项
  $('#fileTrigger-shape-type').loadItems([
    {name: 'Rectangle', value: 'rectangle'},
    {name: 'Circle', value: 'circle'},
    {name: 'Sector', value: 'sector'},
  ])

  // 设置形状类型关联元素
  $('#fileTrigger-shape-type').enableHiddenMode().relate([
    {case: 'rectangle', targets: [
      $('#fileTrigger-shape-width'),
      $('#fileTrigger-shape-height'),
    ]},
    {case: 'circle', targets: [
      $('#fileTrigger-shape-radius'),
    ]},
    {case: 'sector', targets: [
      $('#fileTrigger-shape-radius'),
      $('#fileTrigger-shape-centralAngle'),
    ]},
  ])

  // 创建触发模式选项
  $('#fileTrigger-hitMode').loadItems([
    {name: 'Once', value: 'once'},
    {name: 'Once On Overlap', value: 'once-on-overlap'},
    {name: 'Repeat', value: 'repeat'},
  ])

  // 设置触发模式关联元素
  $('#fileTrigger-hitMode').enableHiddenMode().relate([
    {case: 'repeat', targets: [
      $('#fileTrigger-hitInterval'),
    ]},
  ])

  // 创建动画旋转选项
  $('#fileTrigger-rotatable').loadItems([
    {name: 'Yes', value: true},
    {name: 'No', value: false},
  ])

  // 创建动画方向映射选项
  $('#fileTrigger-mappable').loadItems([
    {name: 'Yes', value: true},
    {name: 'No', value: false},
  ])

  // 绑定事件列表
  $('#fileTrigger-events').bind(new EventListInterface())

  // 绑定脚本列表
  $('#fileTrigger-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileTrigger-parameter-pane').bind($('#fileTrigger-scripts'))

  // 侦听事件
  $('#fileTrigger-animationId').on('write', this.animationIdWrite)
  $(`#fileTrigger-selector, #fileTrigger-onHitWalls, #fileTrigger-onHitActors,
    #fileTrigger-shape-type, #fileTrigger-shape-width, #fileTrigger-shape-height,
    #fileTrigger-shape-radius, #fileTrigger-shape-centralAngle, #fileTrigger-speed,
    #fileTrigger-hitMode, #fileTrigger-hitInterval,
    #fileTrigger-initialDelay, #fileTrigger-effectiveTime, #fileTrigger-duration,
    #fileTrigger-animationId, #fileTrigger-motion,
    #fileTrigger-priority, #fileTrigger-offsetY, #fileTrigger-rotatable,
    #fileTrigger-mappable`).on('input', this.paramInput)
  $('#fileTrigger-events, #fileTrigger-scripts').on('change', this.listChange)
}

// 创建技能
FileTrigger.create = function () {
  return {
    selector: 'enemy',
    onHitWalls: 'through',
    onHitActors: 'through',
    shape: {
      type: 'circle',
      radius: 0.25,
    },
    speed: 0,
    hitMode: 'once',
    hitInterval: 0,
    initialDelay: 0,
    effectiveTime: 0,
    duration: 0,
    animationId: '',
    motion: '',
    priority: 0,
    offsetY: 0,
    rotatable: true,
    mappable: false,
    events: [],
    scripts: [],
  }
}

// 打开数据
FileTrigger.open = function (trigger, meta) {
  if (this.meta !== meta) {
    this.target = trigger
    this.meta = meta

    // 写入数据
    const write = getElementWriter('fileTrigger', trigger)
    const shape = trigger.shape
    write('selector')
    write('onHitWalls')
    write('onHitActors')
    write('shape-type')
    write('shape-width', shape.width ?? 1)
    write('shape-height', shape.height ?? 1)
    write('shape-radius', shape.radius ?? 0.5)
    write('shape-centralAngle', shape.centralAngle ?? 90)
    write('speed')
    write('hitMode')
    write('hitInterval')
    write('initialDelay')
    write('effectiveTime')
    write('duration')
    write('animationId')
    write('motion')
    write('priority')
    write('offsetY')
    write('rotatable')
    write('mappable')
    write('events')
    write('scripts')
  }
}

// 关闭数据
FileTrigger.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    this.motions = null
    $('#fileTrigger-events').clear()
    $('#fileTrigger-scripts').clear()
    $('#fileTrigger-parameter-pane').clear()
  }
}

// 更新数据
FileTrigger.update = function (trigger, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'selector':
    case 'onHitWalls':
    case 'onHitActors':
    case 'speed':
    case 'hitMode':
    case 'hitInterval':
    case 'initialDelay':
    case 'effectiveTime':
    case 'duration':
      if (trigger[key] !== value) {
        trigger[key] = value
      }
      break
    case 'shape-type':
      if (trigger.shape.type !== value) {
        const read = getElementReader('fileTrigger-shape')
        switch (value) {
          case 'rectangle':
            trigger.shape = {
              type: 'rectangle',
              width: read('width'),
              height: read('height'),
            }
            break
          case 'circle':
            trigger.shape = {
              type: 'circle',
              radius: read('radius'),
            }
            break
          case 'sector':
            trigger.shape = {
              type: 'sector',
              radius: read('radius'),
              centralAngle: read('centralAngle'),
            }
            break
        }
      }
      break
    case 'shape-width':
    case 'shape-height':
    case 'shape-radius':
    case 'shape-centralAngle': {
      const index = key.indexOf('-') + 1
      const property = key.slice(index)
      if (trigger.shape[property] !== value) {
        trigger.shape[property] = value
      }
      break
    }
    case 'animationId':
      if (trigger.animationId !== value) {
        trigger.animationId = value
        FileTrigger.motions = null
      }
      break
    case 'motion':
    case 'priority':
    case 'offsetY':
    case 'rotatable':
    case 'mappable':
      if (trigger[key] !== value) {
        trigger[key] = value
      }
      break
  }
}

// 动画ID - 写入事件
FileTrigger.animationIdWrite = function (event) {
  const elMotion = $('#fileTrigger-motion')
  elMotion.loadItems(Animation.getMotionListItems(event.value))
  elMotion.write2(elMotion.read())
}

// 参数 - 输入事件
FileTrigger.paramInput = function (event) {
  FileTrigger.update(
    FileTrigger.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// 列表 - 改变事件
FileTrigger.listChange = function (event) {
  File.planToSave(FileTrigger.meta)
}

Inspector.fileTrigger = FileTrigger}

// ******************************** 文件 - 物品页面 ********************************

{const FileItem = {
  // properties
  target: null,
  meta: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
  listChange: null,
}

// 初始化
FileItem.initialize = function () {
  // 绑定属性列表
  $('#fileItem-attributes').bind(new AttributeListInterface())

  // 绑定事件列表
  $('#fileItem-events').bind(new EventListInterface())

  // 绑定脚本列表
  $('#fileItem-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileItem-parameter-pane').bind($('#fileItem-scripts'))

  // 侦听事件
  $('#fileItem-icon, #fileItem-clip').on('input', this.paramInput)
  $('#fileItem-attributes, #fileItem-events, #fileItem-scripts').on('change', this.listChange)
}

// 创建物品
FileItem.create = function () {
  return {
    icon: '',
    clip: [0, 0, 32, 32],
    attributes: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
FileItem.open = function (item, meta) {
  if (this.meta !== meta) {
    this.target = item
    this.meta = meta

    // 写入数据
    const write = getElementWriter('fileItem', item)
    write('icon')
    write('clip')
    write('attributes')
    write('events')
    write('scripts')
  }
}

// 关闭数据
FileItem.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    $('#fileItem-attributes').clear()
    $('#fileItem-events').clear()
    $('#fileItem-scripts').clear()
    $('#fileItem-parameter-pane').clear()
  }
}

// 更新数据
FileItem.update = function (item, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'icon':
    case 'clip':
      if (item[key] !== value) {
        item[key] = value
        Browser.body.updateIcon(this.meta.file)
      }
      break
  }
}

// 参数 - 输入事件
FileItem.paramInput = function (event) {
  FileItem.update(
    FileItem.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// 列表 - 改变事件
FileItem.listChange = function (event) {
  File.planToSave(FileItem.meta)
}

Inspector.fileItem = FileItem}

// ******************************** 文件 - 装备页面 ********************************

{const FileEquipment = {
  // properties
  target: null,
  meta: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
  listChange: null,
}

// 初始化
FileEquipment.initialize = function () {
  // 绑定属性列表
  $('#fileEquipment-attributes').bind(new AttributeListInterface())

  // 绑定事件列表
  $('#fileEquipment-events').bind(new EventListInterface())

  // 绑定脚本列表
  $('#fileEquipment-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileEquipment-parameter-pane').bind($('#fileEquipment-scripts'))

  // 侦听事件
  $('#fileEquipment-icon, #fileEquipment-clip').on('input', this.paramInput)
  $('#fileEquipment-attributes, #fileEquipment-events, #fileEquipment-scripts').on('change', this.listChange)
}

// 创建装备
FileEquipment.create = function () {
  return {
    icon: '',
    clip: [0, 0, 32, 32],
    attributes: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
FileEquipment.open = function (equipment, meta) {
  if (this.meta !== meta) {
    this.target = equipment
    this.meta = meta

    // 写入数据
    const write = getElementWriter('fileEquipment', equipment)
    write('icon')
    write('clip')
    write('attributes')
    write('events')
    write('scripts')
  }
}

// 关闭数据
FileEquipment.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    $('#fileEquipment-attributes').clear()
    $('#fileEquipment-events').clear()
    $('#fileEquipment-scripts').clear()
    $('#fileEquipment-parameter-pane').clear()
  }
}

// 更新数据
FileEquipment.update = function (equipment, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'icon':
    case 'clip':
      if (equipment[key] !== value) {
        equipment[key] = value
        Browser.body.updateIcon(this.meta.file)
      }
      break
  }
}

// 参数 - 输入事件
FileEquipment.paramInput = function (event) {
  FileEquipment.update(
    FileEquipment.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// 列表 - 改变事件
FileEquipment.listChange = function (event) {
  File.planToSave(FileEquipment.meta)
}

Inspector.fileEquipment = FileEquipment}

// ******************************** 文件 - 状态页面 ********************************

{const FileState = {
  // properties
  target: null,
  meta: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
  listChange: null,
}

// 初始化
FileState.initialize = function () {
  // 绑定属性列表
  $('#fileState-attributes').bind(new AttributeListInterface())

  // 绑定事件列表
  $('#fileState-events').bind(new EventListInterface())

  // 绑定脚本列表
  $('#fileState-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileState-parameter-pane').bind($('#fileState-scripts'))

  // 侦听事件
  $('#fileState-icon, #fileState-clip').on('input', this.paramInput)
  $('#fileState-attributes, #fileState-events, #fileState-scripts').on('change', this.listChange)
}

// 创建状态
FileState.create = function () {
  return {
    icon: '',
    clip: [0, 0, 32, 32],
    attributes: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
FileState.open = function (state, meta) {
  if (this.meta !== meta) {
    this.target = state
    this.meta = meta

    // 写入数据
    const write = getElementWriter('fileState', state)
    write('icon')
    write('clip')
    write('attributes')
    write('events')
    write('scripts')
  }
}

// 关闭数据
FileState.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    $('#fileState-attributes').clear()
    $('#fileState-events').clear()
    $('#fileState-scripts').clear()
    $('#fileState-parameter-pane').clear()
  }
}

// 更新数据
FileState.update = function (state, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'icon':
    case 'clip':
      if (state[key] !== value) {
        state[key] = value
        Browser.body.updateIcon(this.meta.file)
      }
      break
  }
}

// 参数 - 输入事件
FileState.paramInput = function (event) {
  FileState.update(
    FileState.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// 列表 - 改变事件
FileState.listChange = function (event) {
  File.planToSave(FileState.meta)
}

Inspector.fileState = FileState}

// ******************************** 文件 - 事件页面 ********************************

{const FileEvent = {
  // properties
  target: null,
  meta: null,
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
FileEvent.initialize = function () {
  // 创建类型选项
  $('#fileEvent-type').loadItems(EventEditor.types.global)
  EventEditor.types.relatedElements.push($('#fileEvent-type'))

  // 侦听事件
  $('#fileEvent-type').on('input', this.paramInput)
}

// 创建事件
FileEvent.create = function (filter) {
  const type = EventEditor.types[filter][0].value
  switch (filter) {
    case 'global':
      return {
        enabled: true,
        type: type,
        commands: [],
      }
    default:
      return {
        type: type,
        commands: [],
      }
  }
}

// 打开数据
FileEvent.open = function (event, meta) {
  if (this.meta !== meta) {
    this.target = event
    this.meta = meta

    $('#fileEvent-type').loadItems(
      Enum.getMergedItems(
        EventEditor.types.global,
        'global-event',
    ))

    // 写入数据
    const write = getElementWriter('fileEvent')
    write('type', event.type)
  }
}

// 关闭数据
FileEvent.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
  }
}

// 写入数据
FileEvent.write = function (options) {
  if (options.type !== undefined) {
    $('#fileEvent-type').write(options.type)
  }
}

// 更新数据
FileEvent.update = function (event, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'type':
      if (event.type !== value) {
        event.type = value
      }
      break
  }
}

// 参数 - 输入事件
FileEvent.paramInput = function (event) {
  FileEvent.update(
    FileEvent.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.fileEvent = FileEvent}

// ******************************** 文件 - 图像页面 ********************************

{const FileImage = {
  // properties
  target: null,
  meta: null,
  symbol: null,
  image: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  updateImage: null,
  // events
  windowResize: null,
}

// 初始化
FileImage.initialize = function () {
  // 获取图像元素
  this.image = $('#fileImage-image')

  // 侦听事件
  $('#fileImage').on('resize', this.windowResize)
  $('#fileImage-image-detail').on('toggle', this.windowResize)
}

// 打开数据
FileImage.open = function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileImage-name')
    const elSize = $('#fileImage-size')
    const elResolution = $('#fileImage-resolution')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)
    elResolution.textContent = ''

    // 加载图像
    const image = this.image.hide()
    const path = File.route(file.path)
    image.src = path

    // 更新图像信息
    const symbol = this.symbol = Symbol()
    new Promise((resolve, reject) => {
      const intervalIndex = setInterval(() => {
        if (image.naturalWidth !== 0) {
          clearInterval(intervalIndex)
          resolve()
        } else if (image.complete) {
          clearInterval(intervalIndex)
          reject()
        }
      })
    }).then(() => {
      if (this.symbol === symbol) {
        this.symbol = null
        this.updateImage()
        const width = image.naturalWidth
        const height = image.naturalHeight
        elResolution.textContent = `${width} x ${height}`
      }
    })
  }
}

// 关闭数据
FileImage.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    this.symbol = null
    this.image.src = ''
  }
}

// 更新图像
FileImage.updateImage = function () {
  // 隐藏元素避免滚动条意外出现
  const image = this.image.hide()
  const frame = image.parentNode
  const frameBox = CSS.getDevicePixelContentBoxSize(frame)
  const cw = frameBox.width
  const ch = frameBox.height
  if (cw > 0 && ch > 0) {
    const nw = image.naturalWidth
    const nh = image.naturalHeight
    let dw
    let dh
    if (nw <= cw && nh <= ch) {
      dw = nw
      dh = nh
    } else {
      const scaleX = cw / nw
      const scaleY = ch / nh
      if (scaleX < scaleY) {
        dw = cw
        dh = Math.round(nh * scaleX)
      } else {
        dw = Math.round(nw * scaleY)
        dh = ch
      }
    }
    const dpr = window.devicePixelRatio
    image.style.left = `${(cw - dw >> 1) / dpr}px`
    image.style.top = `${(ch - dh >> 1) / dpr}px`
    image.style.width = `${dw / dpr}px`
    image.style.height = `${dh / dpr}px`
    image.show()
  }
}

// 窗口 - 调整大小事件
FileImage.windowResize = function (event) {
  if (FileImage.target !== null &&
    FileImage.symbol === null) {
    FileImage.updateImage()
  }
}

Inspector.fileImage = FileImage}

// ******************************** 文件 - 音频页面 ********************************

{const FileAudio = {
  // properties
  target: null,
  meta: null,
  symbol: null,
  promise: null,
  progress: $('#fileAudio-progress'),
  progressFiller: $('#fileAudio-progress-filler'),
  pointer: $('#fileAudio-progress-pointer').hide(),
  currentTimeInfo: $('#fileAudio-currentTime'),
  pointerTimeInfo: $('#fileAudio-pointerTime'),
  canvas: $('#fileAudio-frequency-canvas'),
  context: null,
  dataArray: null,
  intervals: null,
  intensities: null,
  rotation: null,
  lineColor: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  play: null,
  writeParams: null,
  updateParams: null,
  updateParamInfos: null,
  updateCanvas: null,
  formatTime: null,
  requestAnimation: null,
  updateAnimation: null,
  stopAnimation: null,
  // events
  themechange: null,
  windowResize: null,
  paramInput: null,
  progressPointerdown: null,
  progressPointermove: null,
  progressPointerleave: null,
}

// 初始化
FileAudio.initialize = function () {
  // 获取画布上下文对象
  this.context = this.canvas.getContext('2d', {desynchronized: true})

  // 设置音频分析器
  const analyser = AudioManager.analyser
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0

  // 创建数据数组
  this.dataArray = new Uint8Array(
    analyser.frequencyBinCount
  )

  // 创建间隔数组
  this.intervals = new Float64Array(64)

  // 创建强度数组
  this.intensities = new Float64Array(64)
  this.intensities.index = 0

  // 侦听事件
  window.on('themechange', this.themechange)
  $('#fileAudio').on('resize', this.windowResize)
  $('#fileAudio-frequency-detail').on('toggle', this.windowResize)
  $('#fileAudio-volume').on('input', this.paramInput)
  $('#fileAudio-pan').on('input', this.paramInput)
  $('#fileAudio-dry').on('input', this.paramInput)
  $('#fileAudio-wet').on('input', this.paramInput)
  this.progress.on('pointerdown', this.progressPointerdown)
  this.progress.on('pointermove', this.progressPointermove)
  this.progress.on('pointerleave', this.progressPointerleave)
}

// 打开数据
FileAudio.open = function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileAudio-name')
    const elSize = $('#fileAudio-size')
    const elDuration = $('#fileAudio-duration')
    const elBitrate = $('#fileAudio-bitrate')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)
    elDuration.textContent = ''
    elBitrate.textContent = ''

    // 加载混合器参数
    this.writeParams(AudioManager.player.getParams())

    // 加载音频
    const audio = AudioManager.player.audio
    const path = file.path
    if (audio.path !== path) {
      audio.path = path
      audio.src = File.route(path)

      // 加载波形图
      this.progress.removeClass('visible')
      // 保留对返回的原始promise的引用
      // 以便可以取消解码音频数据的操作
      const promise = this.promise =
      AudioManager.getWaveform(meta.guid)
      promise.then(url => {
        if (this.promise === promise) {
          this.promise = null
          this.progress.style.webkitMaskImage = url
          this.progress.addClass('visible')
        }
      })
    }

    // 请求绘制分析器动画
    this.updateCanvas()
    this.requestAnimation()

    // 更新音频信息
    const symbol = this.symbol = Symbol()
    new Promise(resolve => {
      if (isNaN(audio.duration)) {
        audio.on('loadedmetadata', () => {
          resolve()
        }, {once: true})
      } else {
        resolve()
      }
    }).then(() => {
      if (this.symbol === symbol) {
        this.symbol = null
        const duration = audio.duration
        const bitrate = Math.round(size / 128 / duration)
        elDuration.textContent = this.formatTime(duration)
        elBitrate.textContent = `${bitrate}Kbps`
      }
    })
  }
}

// 关闭数据
FileAudio.close = function () {
  if (this.target) {
    if (this.promise) {
      this.promise.canceled = true
      this.promise = null
    }
    Browser.unselect(this.meta)
    this.stopAnimation()
    this.target = null
    this.meta = null
    this.symbol = null
  }
}

// 播放音频
FileAudio.play = function () {
  if (this.target !== null) {
    const {audio} = AudioManager.player
    if (audio.paused) {
      audio.play()
    } else {
      audio.currentTime = 0
    }
  }
}

// 写入参数
FileAudio.writeParams = function (params) {
  $('#fileAudio-volume').write(params.volume)
  $('#fileAudio-pan').write(params.pan)
  $('#fileAudio-dry').write(params.dry)
  $('#fileAudio-wet').write(params.wet)
  this.updateParamInfos(params)
}

// 更新参数
FileAudio.updateParams = function (params) {
  AudioManager.player.setVolume(params.volume)
  AudioManager.player.setPan(params.pan)
  AudioManager.player.setReverb(params.dry, params.wet)
}

// 更新参数信息
FileAudio.updateParamInfos = function (params) {
  $('#fileAudio-volume-info').textContent = `${params.volume * 100}%`
  $('#fileAudio-pan-info').textContent = `${params.pan * 100}%`
  $('#fileAudio-dry-info').textContent = `${params.dry * 100}%`
  $('#fileAudio-wet-info').textContent = `${params.wet * 100}%`
}

// 更新画布
FileAudio.updateCanvas = function () {
  const manager = Inspector.manager
  const canvas = this.canvas
  const scrollTop = manager.scrollTop
  if (canvas.hasClass('hidden')) {
    if (canvas.width !== 0) {
      canvas.width = 0
    }
    if (canvas.height !== 0) {
      canvas.height = 0
    }
  } else {
    canvas.style.width = '100%'
    canvas.style.height = '0'
    const dpr = window.devicePixelRatio
    const height = CSS.getDevicePixelContentBoxSize(canvas).width
    if (canvas.height !== height) {
      canvas.height = height
    }
    canvas.style.height = `${height / dpr}px`
    const width = CSS.getDevicePixelContentBoxSize(canvas).width
    if (canvas.width !== width) {
      canvas.width = width
    }
    canvas.style.width = `${width / dpr}px`
  }
  if (manager.scrollTop !== scrollTop) {
    manager.scrollTop = scrollTop
  }
}

// 格式化时间
FileAudio.formatTime = function (time) {
  const pad = Number.padZero
  const length = Math.floor(time)
  const hours = Math.floor(length / 3600)
  const minutes = Math.floor(length / 60) % 60
  const seconds = length % 60
  return hours
  ? `${hours}:${pad(minutes, 60)}:${pad(seconds, 60)}`
  : `${minutes}:${pad(seconds, 60)}`
}

// 请求动画
FileAudio.requestAnimation = function () {
  if (this.target !== null) {
    Timer.appendUpdater('sharedAnimation', this.updateAnimation)
  }
}

// 更新动画帧
FileAudio.updateAnimation = function (deltaTime) {
  // 更新播放进度
  const audio = AudioManager.player.audio
  const currentTime = audio.currentTime
  const duration = audio.duration || Infinity
  const cw = Inspector.manager.clientWidth
  const pw = Math.round(cw * currentTime / duration)
  const pp = Math.roundTo(pw / cw * 100, 6)
  const {progress, progressFiller} = FileAudio
  if (progress.percent !== pp) {
    progress.percent = pp
    progressFiller.style.width = `${pp}%`
  }

  // 更新当前时间
  const time = FileAudio.formatTime(currentTime)
  const currentTimeInfo = FileAudio.currentTimeInfo
  if (currentTimeInfo.textContent !== time) {
    currentTimeInfo.textContent = time
  }

  const canvas = FileAudio.canvas
  const context = FileAudio.context
  const width = canvas.width
  const height = canvas.height
  if (width * height === 0) {
    return
  }
  // 计算当前帧的强度以及平均值
  // 单独提前计算可以减少延时
  const analyser = AudioManager.analyser
  const array = FileAudio.dataArray
  const aLength = array.length
  const start = Math.floor(aLength * 0.1)
  const end = Math.floor(aLength * 0.85)
  const step = Math.PI * 2 / (end - start)
  const intervals = FileAudio.intervals
  const intensities = FileAudio.intensities
  const length = intensities.length
  const index = intensities.index
  let intensity = 0
  let samples = 0
  analyser.getByteFrequencyData(array)
  for (let i = start; i < end; i++) {
    const freq = array[i]
    if (freq !== 0) {
      intensity += freq
      samples++
    }
  }
  if (intensity !== 0) {
    intensity = intensity / samples / 255 * 2
  }
  intervals[index] = deltaTime
  intensities[index] = intensity
  intensities.index = (index + 1) % length
  let intervalSum = 0
  let intensityAverage = 0
  let intensityCount = 0
  let i = index + length
  while (i > index) {
    const j = i-- % length
    intervalSum += intervals[j]
    intensityAverage += intensities[j]
    intensityCount++
    // 取最近150ms的强度平均值(平滑过渡)
    if (intervalSum >= 150) {
      break
    }
  }
  intensityAverage /= intensityCount

  // 绘制频率
  const centerX = height / 2
  const centerY = height / 2
  const size = height * (0.8 + intensityAverage * 0.2)
  const padding = height * 0.04
  const amplitude = height * 0.1
  const lineWidth = size * 0.005
  const halfWidth = lineWidth / 2
  const fRadius = size / 2 - padding - amplitude
  const rotation = FileAudio.rotation - start * step
  const MathCos = Math.cos
  const MathSin = Math.sin
  context.clearRect(0, 0, width, height)
  context.lineWidth = lineWidth
  context.strokeStyle = FileAudio.lineColor
  context.beginPath()
  for (let i = start; i < end; i++) {
    const freq = array[i]
    if (freq !== 0) {
      const angle = i * step + rotation
      const cos = MathCos(angle)
      const sin = MathSin(angle)
      const af = (freq / 255) ** 2.5
      const am = amplitude * af + halfWidth
      const br = fRadius - am
      const er = fRadius + am
      const bx = centerX + br * cos
      const by = centerY + br * sin
      const ex = centerX + er * cos
      const ey = centerY + er * sin
      context.moveTo(bx, by)
      context.lineTo(ex, ey)
    }
  }
  context.globalAlpha = 1
  context.stroke()
  context.beginPath()
  for (let i = start; i < end; i++) {
    const freq = array[i]
    if (freq === 0) {
      const angle = i * step + rotation
      const cos = MathCos(angle)
      const sin = MathSin(angle)
      const br = fRadius - halfWidth
      const er = fRadius + halfWidth
      const bx = centerX + br * cos
      const by = centerY + br * sin
      const ex = centerX + er * cos
      const ey = centerY + er * sin
      context.moveTo(bx, by)
      context.lineTo(ex, ey)
    }
  }
  context.globalAlpha = 0.25
  context.stroke()

  // 更新旋转角度
  FileAudio.rotation -= Math.PI * deltaTime / 15000
}

// 停止更新动画
FileAudio.stopAnimation = function () {
  Timer.removeUpdater('sharedAnimation', this.updateAnimation)
}

// 主题改变事件
FileAudio.themechange = function (event) {
  switch (event.value) {
    case 'light':
      this.lineColor = '#000000'
      break
    case 'dark':
      this.lineColor = '#ffffff'
      break
  }
}.bind(FileAudio)

// 窗口 - 调整大小事件
FileAudio.windowResize = function (event) {
  if (FileAudio.target !== null &&
    FileAudio.symbol === null) {
    FileAudio.updateCanvas()
  }
}

// 参数 - 输入事件
FileAudio.paramInput = function (event) {
  const read = getElementReader('fileAudio')
  const params = {
    volume: read('volume'),
    pan: read('pan'),
    dry: read('dry'),
    wet: read('wet'),
  }
  this.updateParams(params)
  this.updateParamInfos(params)
}.bind(FileAudio)

// 进度条 - 指针按下事件
FileAudio.progressPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const {audio} = AudioManager.player
      const {time} = FileAudio.pointer
      if (time !== -1) {
        audio.currentTime = time
      }
      break
    }
  }
}

// 进度条 - 指针移动事件
FileAudio.progressPointermove = function (event) {
  const {pointer, pointerTimeInfo} = FileAudio
  const {duration} = AudioManager.player.audio
  if (!isNaN(duration)) {
    const pointerX = event.offsetX
    const boxWidth = this.clientWidth
    const ratio = pointerX / Math.max(boxWidth - 1, 1)
    const time = ratio * duration
    pointer.time = time
    pointer.style.left = `${pointerX}px`
    pointer.show()
    pointerTimeInfo.textContent = FileAudio.formatTime(time)
    pointerTimeInfo.show()
    const infoWidth = pointerTimeInfo.clientWidth + 16
    const infoX = Math.min(pointerX, boxWidth - infoWidth)
    pointerTimeInfo.style.left = `${infoX}px`
  }
}

// 进度条 - 指针离开事件
FileAudio.progressPointerleave = function (event) {
  const {pointer, pointerTimeInfo} = FileAudio
  if (pointer.time !== -1) {
    pointer.time = -1
    pointer.hide()
    pointerTimeInfo.hide()
  }
}

Inspector.fileAudio = FileAudio}

// ******************************** 文件 - 视频页面 ********************************

{const FileVideo = {
  // properties
  target: null,
  meta: null,
  symbol: null,
  video: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  play: null,
  // events
  windowError: null,
}

// 初始化
FileVideo.initialize = function () {
  // 获取视频播放器
  this.video = $('#fileVideo-video')

  // 侦听事件
  window.on('error', this.windowError)
}

// 打开数据
FileVideo.open = function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileVideo-name')
    const elSize = $('#fileVideo-size')
    const elDuration = $('#fileVideo-duration')
    const elResolution = $('#fileVideo-resolution')
    const elBitrate = $('#fileVideo-bitrate')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)
    elDuration.textContent = ''
    elResolution.textContent = ''
    elBitrate.textContent = ''

    // 加载视频
    const video = this.video
    const path = file.path
    video.src = File.route(path)

    // 更新视频信息
    const symbol = this.symbol = Symbol()
    new Promise(resolve => {
      video.on('loadedmetadata', () => {
        resolve(video)
      }, {once: true})
    }).then(() => {
      if (this.symbol === symbol) {
        this.symbol = null
        const duration = video.duration
        const width = video.videoWidth
        const height = video.videoHeight
        const bitrate = Math.round(size / 128 / duration)
        const formatTime = Inspector.fileAudio.formatTime
        elDuration.textContent = formatTime(duration)
        elResolution.textContent = `${width} x ${height}`
        elBitrate.textContent = `${bitrate}Kbps`
      }
    })
  }
}

// 关闭数据
FileVideo.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    this.symbol = null
    this.video.src = ''
  }
}

// 播放视频
FileVideo.play = function () {
  if (this.target !== null) {
    AudioManager.player.stop()
    const {video} = this
    if (video.paused) {
      video.play()
    } else {
      video.currentTime = 0
    }
  }
}

// 窗口 - 错误事件
// 过滤视频窗口全屏切换时的报错事件
FileVideo.windowError = function (event) {
  if (event.message === 'ResizeObserver loop limit exceeded') {
    event.stopImmediatePropagation()
  }
}

Inspector.fileVideo = FileVideo}

// ******************************** 文件 - 字体页面 ********************************

{const FileFont = {
  // properties
  target: null,
  meta: null,
  symbol: null,
  font: null,
  input: null,
  previews: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  // events
  windowResize: null,
  textInput: null,
}

// 初始化
FileFont.initialize = function () {
  // 获取预览文本元素
  this.previews = $('.fileFont-preview')

  // 获取输入框并设置内容
  this.input = $('#fileFont-content')
  this.input.write('Yami RPG Editor')
  this.textInput({target: this.input.input})

  // 侦听事件
  $('#fileFont').on('resize', this.windowResize)
  this.input.on('input', this.textInput)
}

// 打开数据
FileFont.open = function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileFont-name')
    const elSize = $('#fileFont-size')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)

    // 加载字体
    const previews = this.previews
    const path = File.route(file.path)
    const url = CSS.encodeURL(path)
    const font = new FontFace('preview', url)
    for (const preview of previews) {
      preview.hide()
    }
    if (this.font instanceof FontFace) {
      document.fonts.delete(this.font)
    }
    const symbol = this.symbol = Symbol()
    font.load().then(() => {
      if (this.symbol === symbol) {
        this.symbol = null
        this.font = font
        document.fonts.add(font)
        for (const preview of previews) {
          preview.show()
        }
      }
    })
  }
}

// 关闭数据
FileFont.close = function () {
  if (this.target) {
    if (this.font instanceof FontFace) {
      document.fonts.delete(this.font)
    }
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    this.symbol = null
    this.font = null
  }
}

// 窗口 - 调整大小事件
FileFont.windowResize = function (event) {
  const previews = FileFont.previews
  const dpr = window.devicePixelRatio
  if (previews.dpr !== dpr) {
    previews.dpr = dpr
    $('#fileFont-font-grid').style.fontSize = `${12 / dpr}px`
  }
}

// 文本框 - 输入事件
FileFont.textInput = function (event) {
  const text = event.target.value
  for (const element of FileFont.previews) {
    element.textContent = text
  }
}

Inspector.fileFont = FileFont}

// ******************************** 文件 - 脚本页面 ********************************

{const FileScript = {
  // properties
  target: null,
  meta: null,
  overview: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  // events
  windowLocalize: null,
}

// 初始化
FileScript.initialize = function () {
  // 获取概述元素
  this.overview = $('#fileScript-overview')

  // 侦听事件
  window.on('localize', this.windowLocalize)
}

// 创建脚本
FileScript.create = function () {
return `/*
@plugin
@version
@author
@link
@desc
*/

export default class Plugin {
  start() {}
}`
}

// 打开数据
FileScript.open = async function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileScript-name')
    const elSize = $('#fileScript-size')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)

    // 加载脚本概述
    await Data.scripts[meta.guid]
    const elements = PluginManager.createOverview(meta, true)
    const overview = this.overview.clear()
    for (const element of elements) {
      overview.appendChild(element)
    }
  }
}

// 关闭数据
FileScript.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    this.overview.clear()
  }
}

// 窗口 - 本地化事件
FileScript.windowLocalize = function (event) {
  if (FileScript.target) {
    const {target, meta} = FileScript
    FileScript.target = null
    FileScript.open(target, meta)
  }
}

Inspector.fileScript = FileScript}

// ******************************** 场景 - 角色页面 ********************************

{const SceneActor = {
  // properties
  owner: Scene,
  target: null,
  nameBox: $('#sceneActor-name'),
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  datachange: null,
  paramInput: null,
}

// 初始化
SceneActor.initialize = function () {
  // 绑定条件列表
  $('#sceneActor-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneActor-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneActor-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneActor-parameter-pane').bind($('#sceneActor-scripts'))

  // 侦听事件
  window.on('datachange', this.datachange)
  const elements = $(`#sceneActor-name, #sceneActor-actorId,
    #sceneActor-teamId, #sceneActor-x, #sceneActor-y, #sceneActor-angle`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  $('#sceneActor-conditions, #sceneActor-events, #sceneActor-scripts').on('change', Scene.listChange)
}

// 创建角色
SceneActor.create = function () {
  return {
    class: 'actor',
    name: 'Actor',
    hidden: false,
    locked: false,
    presetId: '',
    actorId: '',
    teamId: Data.teams.list[0].id,
    x: 0,
    y: 0,
    angle: 0,
    conditions: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
SceneActor.open = function (actor) {
  if (this.target !== actor) {
    this.target = actor

    // 创建队伍选项
    const elTeamId = $('#sceneActor-teamId')
    elTeamId.loadItems(Data.createTeamItems())

    // 写入数据
    const write = getElementWriter('sceneActor', actor)
    write('name')
    write('actorId')
    write('teamId')
    write('x')
    write('y')
    write('angle')
    write('conditions')
    write('events')
    write('scripts')
  }
}

// 关闭数据
SceneActor.close = function () {
  if (this.target) {
    Scene.list.unselect(this.target)
    Scene.updateTarget()
    this.target = null
    $('#sceneActor-conditions').clear()
    $('#sceneActor-events').clear()
    $('#sceneActor-scripts').clear()
    $('#sceneActor-parameter-pane').clear()
  }
}

// 写入数据
SceneActor.write = function (options) {
  if (options.x !== undefined) {
    $('#sceneActor-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#sceneActor-y').write(options.y)
  }
  if (options.angle !== undefined) {
    $('#sceneActor-angle').write(options.angle)
  }
}

// 更新数据
SceneActor.update = function (actor, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (actor.name !== value) {
        actor.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(actor)
      }
      break
    case 'x':
    case 'y':
      if (actor[key] !== value) {
        actor[key] = value
      }
      break
    case 'actorId':
      if (actor.actorId !== value) {
        actor.actorId = value
        actor.player.destroy()
        delete actor.data
        delete actor.player
        Scene.loadActorContext(actor)
      }
      break
    case 'teamId':
      if (actor.teamId !== value) {
        actor.teamId = value
        Scene.list.updateIcon(actor)
      }
      break
    case 'angle':
      if (actor.angle !== value) {
        actor.angle = value
        if (actor.player) {
          const params = Animation.getDirParamsByAngle(value)
          actor.player.switch(actor.data.idleMotion, params.suffix)
          actor.player.flip = params.flip
        }
      }
      break
  }
  Scene.requestRendering()
}

// 数据改变事件
SceneActor.datachange = function (event) {
  if (this.target && event.key === 'teams') {
    const elTeamId = $('#sceneActor-teamId')
    elTeamId.loadItems(Data.createTeamItems())
    this.target.teamId = ''
    elTeamId.update()
    elTeamId.dispatchEvent(new Event('input'))
  }
}.bind(SceneActor)

// 参数 - 输入事件
SceneActor.paramInput = function (event) {
  SceneActor.update(
    SceneActor.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneActor = SceneActor}

// ******************************** 场景 - 区域页面 ********************************

{const SceneRegion = {
  // properties
  owner: Scene,
  target: null,
  nameBox: $('#sceneRegion-name'),
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
SceneRegion.initialize = function () {
  // 绑定条件列表
  $('#sceneRegion-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneRegion-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneRegion-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneRegion-parameter-pane').bind($('#sceneRegion-scripts'))

  // 侦听事件
  const elements = $(`#sceneRegion-name, #sceneRegion-color,
    #sceneRegion-x, #sceneRegion-y, #sceneRegion-width, #sceneRegion-height`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  $('#sceneRegion-conditions, #sceneRegion-events, #sceneRegion-scripts').on('change', Scene.listChange)
}

// 创建区域
SceneRegion.create = function () {
  return {
    class: 'region',
    name: 'Region',
    hidden: false,
    locked: false,
    presetId: '',
    color: '00000080',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    conditions: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
SceneRegion.open = function (region) {
  if (this.target !== region) {
    this.target = region

    // 写入数据
    const write = getElementWriter('sceneRegion', region)
    write('name')
    write('color')
    write('x')
    write('y')
    write('width')
    write('height')
    write('conditions')
    write('events')
    write('scripts')
  }
}

// 关闭数据
SceneRegion.close = function () {
  if (this.target) {
    Scene.list.unselect(this.target)
    Scene.updateTarget()
    this.target = null
    $('#sceneRegion-conditions').clear()
    $('#sceneRegion-events').clear()
    $('#sceneRegion-scripts').clear()
    $('#sceneRegion-parameter-pane').clear()
  }
}

// 写入数据
SceneRegion.write = function (options) {
  if (options.x !== undefined) {
    $('#sceneRegion-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#sceneRegion-y').write(options.y)
  }
}

// 更新数据
SceneRegion.update = function (region, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (region.name !== value) {
        region.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(region)
      }
      break
    case 'x':
    case 'y':
    case 'width':
    case 'height':
      if (region[key] !== value) {
        region[key] = value
      }
      break
    case 'color':
      if (region.color !== value) {
        region.color = value
        Scene.list.updateIcon(region)
      }
      break
  }
  Scene.requestRendering()
}

// 参数 - 输入事件
SceneRegion.paramInput = function (event) {
  SceneRegion.update(
    SceneRegion.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneRegion = SceneRegion}

// ******************************** 场景 - 光源页面 ********************************

{const SceneLight = {
  // properties
  owner: Scene,
  target: null,
  nameBox: $('#sceneLight-name'),
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
SceneLight.initialize = function () {
  // 加载类型选项
  $('#sceneLight-type').loadItems([
    {name: 'Point', value: 'point'},
    {name: 'Area', value: 'area'},
  ])

  // 加载混合模式选项
  $('#sceneLight-blend').loadItems([
    {name: 'Screen', value: 'screen'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
    {name: 'Max', value: 'max'},
  ])

  // 设置类型关联元素
  $('#sceneLight-type').enableHiddenMode().relate([
    {case: 'point', targets: [
      $('#sceneLight-range-box'),
      $('#sceneLight-intensity-box'),
    ]},
    {case: 'area', targets: [
      $('#sceneLight-mask'),
      $('#sceneLight-anchorX-box'),
      $('#sceneLight-anchorY-box'),
      $('#sceneLight-width-box'),
      $('#sceneLight-height-box'),
      $('#sceneLight-angle-box'),
    ]},
  ])

  // 绑定条件列表
  $('#sceneLight-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneLight-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneLight-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneLight-parameter-pane').bind($('#sceneLight-scripts'))

  // 同步滑动框和数字框的数值
  $('#sceneLight-range-slider').synchronize($('#sceneLight-range'))
  $('#sceneLight-intensity-slider').synchronize($('#sceneLight-intensity'))
  $('#sceneLight-anchorX-slider').synchronize($('#sceneLight-anchorX'))
  $('#sceneLight-anchorY-slider').synchronize($('#sceneLight-anchorY'))
  $('#sceneLight-width-slider').synchronize($('#sceneLight-width'))
  $('#sceneLight-height-slider').synchronize($('#sceneLight-height'))
  $('#sceneLight-angle-slider').synchronize($('#sceneLight-angle'))
  $('#sceneLight-red-slider').synchronize($('#sceneLight-red'))
  $('#sceneLight-green-slider').synchronize($('#sceneLight-green'))
  $('#sceneLight-blue-slider').synchronize($('#sceneLight-blue'))

  // 侦听事件
  const elements = $(`
    #sceneLight-name, #sceneLight-type,
    #sceneLight-blend, #sceneLight-x, #sceneLight-y,
    #sceneLight-range, #sceneLight-intensity,
    #sceneLight-mask, #sceneLight-anchorX, #sceneLight-anchorY,
    #sceneLight-width, #sceneLight-height, #sceneLight-angle,
    #sceneLight-red, #sceneLight-green, #sceneLight-blue`)
  const sliders = $(`
    #sceneLight-range-slider, #sceneLight-intensity-slider,
    #sceneLight-anchorX-slider, #sceneLight-anchorY-slider,
    #sceneLight-width-slider, #sceneLight-height-slider, #sceneLight-angle-slider,
    #sceneLight-red-slider, #sceneLight-green-slider, #sceneLight-blue-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
  $('#sceneLight-conditions, #sceneLight-events, #sceneLight-scripts').on('change', Scene.listChange)
}

// 创建光源
SceneLight.create = function () {
  return {
    class: 'light',
    name: 'Light',
    hidden: false,
    locked: false,
    presetId: '',
    type: 'point',
    blend: 'screen',
    x: 0,
    y: 0,
    range: 4,
    intensity: 0,
    mask: '',
    anchorX: 0.5,
    anchorY: 0.5,
    width: 1,
    height: 1,
    angle: 0,
    red: 255,
    green: 255,
    blue: 255,
    conditions: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
SceneLight.open = function (light) {
  if (this.target !== light) {
    this.target = light

    // 写入数据
    const write = getElementWriter('sceneLight', light)
    write('name')
    write('type')
    write('blend')
    write('x')
    write('y')
    write('range')
    write('intensity')
    write('mask')
    write('anchorX')
    write('anchorY')
    write('width')
    write('height')
    write('angle')
    write('red')
    write('green')
    write('blue')
    write('conditions')
    write('events')
    write('scripts')
  }
}

// 关闭数据
SceneLight.close = function () {
  if (this.target) {
    Scene.list.unselect(this.target)
    Scene.updateTarget()
    this.target = null
    $('#sceneLight-conditions').clear()
    $('#sceneLight-events').clear()
    $('#sceneLight-scripts').clear()
    $('#sceneLight-parameter-pane').clear()
  }
}

// 写入数据
SceneLight.write = function (options) {
  if (options.x !== undefined) {
    $('#sceneLight-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#sceneLight-y').write(options.y)
  }
}

// 更新数据
SceneLight.update = function (light, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (light.name !== value) {
        light.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(light)
      }
      break
    case 'type':
      if (light.type !== value) {
        light.type = value
        light.instance.measure()
      }
      break
    case 'blend':
    case 'x':
    case 'y':
    case 'range':
    case 'intensity':
    case 'mask':
      if (light[key] !== value) {
        light[key] = value
      }
      break
    case 'anchorX':
    case 'anchorY':
    case 'width':
    case 'height':
    case 'angle':
      if (light[key] !== value) {
        light[key] = value
        light.instance.measure()
      }
      break
    case 'red':
    case 'green':
    case 'blue':
      if (light[key] !== value) {
        light[key] = value
        Scene.list.updateIcon(light)
      }
      break
  }
  Scene.requestRendering()
}

// 基本参数 - 输入事件
SceneLight.paramInput = function (event) {
  SceneLight.update(
    SceneLight.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneLight = SceneLight}

// ******************************** 场景 - 动画页面 ********************************

{const SceneAnimation = {
  // properties
  owner: Scene,
  target: null,
  nameBox: $('#sceneAnimation-name'),
  motions: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  animationIdWrite: null,
  paramInput: null,
}

// 初始化
SceneAnimation.initialize = function () {
  // 创建翻转选项
  $('#sceneAnimation-flip').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Horizontal', value: 'horizontal'},
    {name: 'Vertical', value: 'vertical'},
    {name: 'Both', value: 'both'},
  ])

  // 绑定条件列表
  $('#sceneAnimation-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneAnimation-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneAnimation-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneAnimation-parameter-pane').bind($('#sceneAnimation-scripts'))

  // 侦听事件
  $('#sceneAnimation-animationId').on('write', this.animationIdWrite)
  const elements = $(`#sceneAnimation-name,
    #sceneAnimation-animationId, #sceneAnimation-motion,
    #sceneAnimation-flip, #sceneAnimation-x, #sceneAnimation-y`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  $('#sceneAnimation-conditions, #sceneAnimation-events, #sceneAnimation-scripts').on('change', Scene.listChange)
}

// 创建动画
SceneAnimation.create = function () {
  return {
    class: 'animation',
    name: 'Animation',
    hidden: false,
    locked: false,
    presetId: '',
    animationId: '',
    motion: '',
    flip: 'none',
    x: 0,
    y: 0,
    conditions: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
SceneAnimation.open = function (animation) {
  if (this.target !== animation) {
    this.target = animation

    // 写入数据
    const write = getElementWriter('sceneAnimation', animation)
    write('name')
    write('animationId')
    write('motion')
    write('flip')
    write('x')
    write('y')
    write('conditions')
    write('events')
    write('scripts')
  }
}

// 关闭数据
SceneAnimation.close = function () {
  if (this.target) {
    Scene.list.unselect(this.target)
    Scene.updateTarget()
    this.target = null
    this.motions = null
    $('#sceneAnimation-conditions').clear()
    $('#sceneAnimation-events').clear()
    $('#sceneAnimation-scripts').clear()
    $('#sceneAnimation-parameter-pane').clear()
  }
}

// 写入数据
SceneAnimation.write = function (options) {
  if (options.x !== undefined) {
    $('#sceneAnimation-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#sceneAnimation-y').write(options.y)
  }
}

// 更新数据
SceneAnimation.update = function (animation, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (animation.name !== value) {
        animation.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(animation)
      }
      break
    case 'animationId':
      if (animation.animationId !== value) {
        animation.animationId = value
        SceneAnimation.motions = null
        Scene.destroyObjectContext(animation)
        Scene.loadAnimationContext(animation)
      }
      break
    case 'motion':
      if (animation.motion !== value) {
        animation.motion = value
        if (animation.player.switch(value)) {
          animation.player.restart()
        }
      }
      break
    case 'flip':
      if (animation.flip !== value) {
        animation.flip = value
        animation.player.flip = value
      }
      break
    case 'x':
    case 'y':
      if (animation[key] !== value) {
        animation[key] = value
      }
      break
  }
  Scene.requestRendering()
}

// 动画ID - 写入事件
SceneAnimation.animationIdWrite = function (event) {
  const elMotion = $('#sceneAnimation-motion')
  const items = Animation.getMotionListItems(event.value)
  elMotion.loadItems(items)
  elMotion.write(elMotion.read() ?? items[0].value)
}

// 参数 - 输入事件
SceneAnimation.paramInput = function (event) {
  SceneAnimation.update(
    SceneAnimation.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneAnimation = SceneAnimation}

// ******************************** 场景 - 粒子页面 ********************************

{const SceneParticle = {
  // properties
  owner: Scene,
  target: null,
  nameBox: $('#sceneParticle-name'),
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
SceneParticle.initialize = function () {
  // 绑定条件列表
  $('#sceneParticle-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneParticle-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneParticle-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneParticle-parameter-pane').bind($('#sceneParticle-scripts'))

  // 侦听事件
  const elements = $(`#sceneParticle-name,
    #sceneParticle-particleId, #sceneParticle-x, #sceneParticle-y,
    #sceneParticle-angle, #sceneParticle-scale, #sceneParticle-speed`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  $('#sceneParticle-conditions, #sceneParticle-events, #sceneParticle-scripts').on('change', Scene.listChange)
}

// 创建粒子
SceneParticle.create = function () {
  return {
    class: 'particle',
    name: 'Particle',
    hidden: false,
    locked: false,
    presetId: '',
    particleId: '',
    x: 0,
    y: 0,
    angle: 0,
    scale: 1,
    speed: 1,
    conditions: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
SceneParticle.open = function (particle) {
  if (this.target !== particle) {
    this.target = particle

    // 写入数据
    const write = getElementWriter('sceneParticle', particle)
    write('name')
    write('particleId')
    write('x')
    write('y')
    write('angle')
    write('scale')
    write('speed')
    write('conditions')
    write('events')
    write('scripts')
  }
}

// 关闭数据
SceneParticle.close = function () {
  if (this.target) {
    Scene.list.unselect(this.target)
    Scene.updateTarget()
    this.target = null
    $('#sceneParticle-conditions').clear()
    $('#sceneParticle-events').clear()
    $('#sceneParticle-scripts').clear()
    $('#sceneParticle-parameter-pane').clear()
  }
}

// 写入数据
SceneParticle.write = function (options) {
  if (options.x !== undefined) {
    $('#sceneParticle-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#sceneParticle-y').write(options.y)
  }
}

// 更新数据
SceneParticle.update = function (particle, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (particle.name !== value) {
        particle.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(particle)
      }
      break
    case 'particleId':
      if (particle.particleId !== value) {
        particle.particleId = value
        Scene.loadParticleContext(particle)
        Scene.list.updateIcon(particle)
      }
      break
    case 'x':
    case 'y':
      if (particle[key] !== value) {
        // const {x, y} = particle
        particle[key] = value
        // particle.emitter?.shift(Scene.getConvertedCoords({
        //   x: particle.x - x,
        //   y: particle.y - y,
        // }))
      }
      break
    case 'angle':
      if (particle.angle !== value) {
        particle.angle = value
        if (particle.emitter) {
          particle.emitter.angle = Math.radians(value)
        }
      }
      break
    case 'scale':
      if (particle.scale !== value) {
        particle.scale = value
        if (particle.emitter) {
          particle.emitter.scale = value
        }
      }
      break
    case 'speed':
      if (particle.speed !== value) {
        particle.speed = value
        if (particle.emitter) {
          particle.emitter.speed = value
        }
      }
      break
  }
  Scene.requestRendering()
}

// 参数 - 输入事件
SceneParticle.paramInput = function (event) {
  SceneParticle.update(
    SceneParticle.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneParticle = SceneParticle}

// ******************************** 场景 - 视差图页面 ********************************

{const SceneParallax = {
  // properties
  owner: Scene,
  target: null,
  nameBox: $('#sceneParallax-name'),
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
SceneParallax.initialize = function () {
  // 创建图层选项
  $('#sceneParallax-layer').loadItems([
    {name: 'Background', value: 'background'},
    {name: 'Foreground', value: 'foreground'},
  ])

  // 创建光线采样选项
  $('#sceneParallax-light').loadItems([
    {name: 'Raw', value: 'raw'},
    {name: 'Global Sampling', value: 'global'},
    {name: 'Anchor Sampling', value: 'anchor'},
    {name: 'Ambient Light', value: 'ambient'},
  ])

  // 创建混合模式选项
  $('#sceneParallax-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 同步滑动框和数字框的数值
  $('#sceneParallax-tint-0-slider').synchronize($('#sceneParallax-tint-0'))
  $('#sceneParallax-tint-1-slider').synchronize($('#sceneParallax-tint-1'))
  $('#sceneParallax-tint-2-slider').synchronize($('#sceneParallax-tint-2'))
  $('#sceneParallax-tint-3-slider').synchronize($('#sceneParallax-tint-3'))

  // 绑定条件列表
  $('#sceneParallax-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneParallax-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneParallax-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneParallax-parameter-pane').bind($('#sceneParallax-scripts'))

  // 侦听事件
  const elements = $(`#sceneParallax-name,
    #sceneParallax-image, #sceneParallax-layer, #sceneParallax-order,
    #sceneParallax-light, #sceneParallax-blend,
    #sceneParallax-opacity, #sceneParallax-x, #sceneParallax-y,
    #sceneParallax-scaleX, #sceneParallax-scaleY,
    #sceneParallax-repeatX, #sceneParallax-repeatY,
    #sceneParallax-anchorX, #sceneParallax-anchorY,
    #sceneParallax-offsetX, #sceneParallax-offsetY,
    #sceneParallax-parallaxFactorX, #sceneParallax-parallaxFactorY,
    #sceneParallax-shiftSpeedX, #sceneParallax-shiftSpeedY,
    #sceneParallax-tint-0, #sceneParallax-tint-1,
    #sceneParallax-tint-2, #sceneParallax-tint-3`)
  const sliders = $(`
    #sceneParallax-tint-0-slider, #sceneParallax-tint-1-slider,
    #sceneParallax-tint-2-slider, #sceneParallax-tint-3-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
  $('#sceneParallax-conditions, #sceneParallax-events, #sceneParallax-scripts').on('change', Scene.listChange)
}

// 创建视差图
SceneParallax.create = function () {
  return {
    class: 'parallax',
    name: 'Parallax',
    hidden: false,
    locked: false,
    presetId: '',
    image: '',
    layer: 'foreground',
    order: 0,
    light: 'raw',
    blend: 'normal',
    opacity: 1,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    repeatX: 1,
    repeatY: 1,
    anchorX: 0,
    anchorY: 0,
    offsetX: 0,
    offsetY: 0,
    parallaxFactorX: 1,
    parallaxFactorY: 1,
    shiftSpeedX: 0,
    shiftSpeedY: 0,
    tint: [0, 0, 0, 0],
    conditions: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
SceneParallax.open = function (parallax) {
  if (this.target !== parallax) {
    this.target = parallax

    // 写入数据
    const write = getElementWriter('sceneParallax', parallax)
    write('name')
    write('image')
    write('layer')
    write('order')
    write('light')
    write('blend')
    write('opacity')
    write('x')
    write('y')
    write('scaleX')
    write('scaleY')
    write('repeatX')
    write('repeatY')
    write('anchorX')
    write('anchorY')
    write('offsetX')
    write('offsetY')
    write('parallaxFactorX')
    write('parallaxFactorY')
    write('shiftSpeedX')
    write('shiftSpeedY')
    write('tint-0')
    write('tint-1')
    write('tint-2')
    write('tint-3')
    write('conditions')
    write('events')
    write('scripts')
  }
}

// 关闭数据
SceneParallax.close = function () {
  if (this.target) {
    Scene.list.unselect(this.target)
    Scene.updateTarget()
    this.target = null
    $('#sceneParallax-conditions').clear()
    $('#sceneParallax-events').clear()
    $('#sceneParallax-scripts').clear()
    $('#sceneParallax-parameter-pane').clear()
  }
}

// 写入数据
SceneParallax.write = function (options) {
  if (options.x !== undefined) {
    $('#sceneParallax-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#sceneParallax-y').write(options.y)
  }
}

// 更新数据
SceneParallax.update = function (parallax, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (parallax.name !== value) {
        parallax.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(parallax)
      }
      break
    case 'image':
      if (parallax.image !== value) {
        parallax.image = value
        parallax.player.destroy()
        parallax.player.loadTexture()
        Scene.list.updateIcon(parallax)
      }
      break
    case 'layer':
    case 'order':
      if (parallax[key] !== value) {
        parallax[key] = value
        Scene.loadObjects()
      }
      break
    case 'light':
    case 'blend':
    case 'opacity':
    case 'x':
    case 'y':
    case 'scaleX':
    case 'scaleY':
    case 'repeatX':
    case 'repeatY':
    case 'anchorX':
    case 'anchorY':
    case 'offsetX':
    case 'offsetY':
    case 'parallaxFactorX':
    case 'parallaxFactorY':
      if (parallax[key] !== value) {
        parallax[key] = value
      }
      break
    case 'shiftSpeedX':
      if (parallax.shiftSpeedX !== value) {
        parallax.shiftSpeedX = value
        if (value === 0) {
          parallax.player.shiftX = 0
        }
      }
      break
    case 'shiftSpeedY':
      if (parallax.shiftSpeedY !== value) {
        parallax.shiftSpeedY = value
        if (value === 0) {
          parallax.player.shiftY = 0
        }
      }
      break
    case 'tint-0':
    case 'tint-1':
    case 'tint-2':
    case 'tint-3': {
      const index = key.indexOf('-') + 1
      const color = key.slice(index)
      if (parallax.tint[color] !== value) {
        parallax.tint[color] = value
      }
      break
    }
  }
  Scene.requestRendering()
}

// 参数 - 输入事件
SceneParallax.paramInput = function (event) {
  SceneParallax.update(
    SceneParallax.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneParallax = SceneParallax}

// ******************************** 场景 - 瓦片地图页面 ********************************

{const SceneTilemap = {
  // properties
  owner: Scene,
  target: null,
  nameBox: $('#sceneTilemap-name'),
  lightBox: $('#sceneTilemap-light'),
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  layerWrite: null,
  layerInput: null,
  paramInput: null,
}

// 初始化
SceneTilemap.initialize = function () {
  // 创建图层选项
  $('#sceneTilemap-layer').loadItems([
    {name: 'Background', value: 'background'},
    {name: 'Foreground', value: 'foreground'},
    {name: 'Object', value: 'object'},
  ])

  // 创建光线采样选项
  const items = {
    raw: {name: 'Raw', value: 'raw'},
    global: {name: 'Global Sampling', value: 'global'},
    ambient: {name: 'Ambient Light', value: 'ambient'},
    anchor: {name: 'Anchor Sampling', value: 'anchor'},
  }
  this.lightBox.lightItems = {
    all: Object.values(items),
    tile: [items.raw, items.global, items.ambient],
    sprite: [items.raw, items.global, items.anchor],
  }

  // 光线采样选项 - 重写设置选项名字方法
  this.lightBox.setItemNames = function (options) {
    const backup = this.dataItems
    this.dataItems = this.lightItems.all
    SelectBox.prototype.setItemNames.call(this, options)
    this.dataItems = backup
    if (this.dataValue !== null) {
      this.update()
    }
  }

  // 创建混合模式选项
  $('#sceneTilemap-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 绑定条件列表
  $('#sceneTilemap-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneTilemap-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneTilemap-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneTilemap-parameter-pane').bind($('#sceneTilemap-scripts'))

  // 侦听事件
  const elements = $(`#sceneTilemap-name, #sceneTilemap-layer, #sceneTilemap-order,
    #sceneTilemap-light, #sceneTilemap-blend, #sceneTilemap-x, #sceneTilemap-y,
    #sceneTilemap-anchorX, #sceneTilemap-anchorY, #sceneTilemap-offsetX, #sceneTilemap-offsetY,
    #sceneTilemap-parallaxFactorX, #sceneTilemap-parallaxFactorY, #sceneTilemap-opacity`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  $('#sceneTilemap-layer').on('write', this.layerWrite)
  $('#sceneTilemap-layer').on('input', this.layerInput)
  $('#sceneTilemap-width, #sceneTilemap-height').on('change', this.paramInput)
  $('#sceneTilemap-conditions, #sceneTilemap-events, #sceneTilemap-scripts').on('change', Scene.listChange)
}

// 创建瓦片地图
SceneTilemap.create = function () {
  const tiles = Scene.createTiles(4, 4)
  return Codec.decodeTilemap({
    class: 'tilemap',
    name: 'Tilemap',
    hidden: false,
    locked: false,
    presetId: '',
    tilesetMap: {},
    shortcut: 0,
    layer: 'background',
    order: 0,
    light: 'global',
    blend: 'normal',
    x: 0,
    y: 0,
    width: tiles.width,
    height: tiles.height,
    anchorX: 0,
    anchorY: 0,
    offsetX: 0,
    offsetY: 0,
    parallaxFactorX: 1,
    parallaxFactorY: 1,
    opacity: 1,
    code: Codec.encodeTiles(tiles),
    conditions: [],
    events: [],
    scripts: [],
  })
}

// 打开数据
SceneTilemap.open = function (tilemap) {
  if (this.target !== tilemap) {
    this.target = tilemap

    // 写入数据
    const write = getElementWriter('sceneTilemap', tilemap)
    write('name')
    write('layer')
    write('order')
    write('light')
    write('blend')
    write('x')
    write('y')
    write('width')
    write('height')
    write('anchorX')
    write('anchorY')
    write('offsetX')
    write('offsetY')
    write('parallaxFactorX')
    write('parallaxFactorY')
    write('opacity')
    write('conditions')
    write('events')
    write('scripts')
  }
}

// 关闭数据
SceneTilemap.close = function () {
  if (this.target) {
    Scene.list.unselect(this.target)
    Scene.updateTarget()
    this.target = null
    $('#sceneTilemap-conditions').clear()
    $('#sceneTilemap-events').clear()
    $('#sceneTilemap-scripts').clear()
    $('#sceneTilemap-parameter-pane').clear()
  }
}

// 写入数据
SceneTilemap.write = function (options) {
  if (options.x !== undefined) {
    $('#sceneTilemap-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#sceneTilemap-y').write(options.y)
  }
  if (options.width !== undefined) {
    $('#sceneTilemap-width').write(options.width)
  }
  if (options.height !== undefined) {
    $('#sceneTilemap-height').write(options.height)
  }
}

// 更新数据
SceneTilemap.update = function (tilemap, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (tilemap.name !== value) {
        tilemap.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(tilemap)
      }
      break
    case 'layer':
    case 'order':
      if (tilemap[key] !== value) {
        tilemap[key] = value
        Scene.loadObjects()
      }
      break
    case 'light':
    case 'blend':
    case 'x':
    case 'y':
    case 'anchorX':
    case 'anchorY':
    case 'offsetX':
    case 'offsetY':
    case 'parallaxFactorX':
    case 'parallaxFactorY':
    case 'opacity':
      if (tilemap[key] !== value) {
        tilemap[key] = value
      }
      break
    case 'width':
      if (tilemap.width !== value) {
        Scene.setTilemapSize(tilemap, value, tilemap.height)
      }
      break
    case 'height':
      if (tilemap.height !== value) {
        Scene.setTilemapSize(tilemap, tilemap.width, value)
      }
      break
  }
  Scene.requestRendering()
}

// 图层 - 写入事件
SceneTilemap.layerWrite = function (event) {
  const lightBox = SceneTilemap.lightBox
  const type = event.value === 'object' ? 'sprite' : 'tile'
  const items = lightBox.lightItems[type]
  if (lightBox.dataItems !== items) {
    lightBox.loadItems(items)
  }
}

// 图层 - 输入事件
SceneTilemap.layerInput = function (event) {
  if (Inspector.manager.focusing === this) {
    const lightBox = SceneTilemap.lightBox
    const value = lightBox.read()
    for (const item of lightBox.dataItems) {
      if (item.value === value) {
        return
      }
    }
    lightBox.write('raw')
    this.changes = [{
      input: lightBox,
      oldValue: value,
      newValue: 'raw',
    }]
  }
}

// 参数 - 输入事件
SceneTilemap.paramInput = function (event) {
  SceneTilemap.update(
    SceneTilemap.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneTilemap = SceneTilemap}

// ******************************** 元素页面 ********************************

{const UIElement = {
  // properties
  owner: UI,
  target: null,
  nameBox: $('#uiElement-name'),
  generalGroup: $('#uiElement-general-group'),
  transformGroup: $('#uiElement-transform-group'),
  eventsGroup: $('#uiElement-events-group'),
  scriptsGroup: $('#uiElement-scripts-group'),
  parameterPane: $('#uiElement-parameter-pane'),
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  pageSwitch: null,
  alignmentClick: null,
  paramInput: null,
}

// 初始化
UIElement.initialize = function () {
  // 绑定事件列表
  $('#uiElement-events').bind(new EventListInterface(this, UI))

  // 绑定脚本列表
  $('#uiElement-scripts').bind(new ScriptListInterface(this, UI))

  // 绑定脚本参数面板
  this.parameterPane.bind($('#uiElement-scripts'))

  // 移除以上群组元素
  // this.generalGroup.remove()
  // this.transformGroup.remove()
  // this.eventsGroup.remove()
  // this.scriptsGroup.remove()

  // 侦听事件
  Inspector.manager.on('switch', this.pageSwitch)
  const alignElements = $('.uiElement-transform-align')
  const otherElements = $(`#uiElement-name, #uiElement-transform-anchorX, #uiElement-transform-anchorY,
    #uiElement-transform-x, #uiElement-transform-x2, #uiElement-transform-y, #uiElement-transform-y2,
    #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
    #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
    #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`)
  alignElements.on('click', this.alignmentClick)
  otherElements.on('input', this.paramInput)
  otherElements.on('focus', Inspector.inputFocus)
  otherElements.on('blur', Inspector.inputBlur(this, UI))
  $('#uiElement-events, #uiElement-scripts').on('change', UI.listChange)
}

// 创建变换参数
UIElement.createTransform = function () {
  return {
    anchorX: 0,
    anchorY: 0,
    x: 0,
    x2: 0,
    y: 0,
    y2: 0,
    width: 0,
    width2: 0,
    height: 0,
    height2: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    opacity: 1,
  }
}

// 打开数据
UIElement.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiElement', node)
    write('name')
    write('transform-anchorX')
    write('transform-anchorY')
    write('transform-x')
    write('transform-x2')
    write('transform-y')
    write('transform-y2')
    write('transform-width')
    write('transform-width2')
    write('transform-height')
    write('transform-height2')
    write('transform-rotation')
    write('transform-scaleX')
    write('transform-scaleY')
    write('transform-skewX')
    write('transform-skewY')
    write('transform-opacity')
    write('events')
    write('scripts')
  }
}

// 关闭数据
UIElement.close = function () {
  if (this.target) {
    this.target = null
    $('#uiElement-events').clear()
    $('#uiElement-scripts').clear()
    $('#uiElement-parameter-pane').clear()
  }
}

// 写入数据
UIElement.write = function (options) {
  if (options.anchorX !== undefined) {
    $('#uiElement-transform-anchorX').write(options.anchorX)
  }
  if (options.anchorY !== undefined) {
    $('#uiElement-transform-anchorY').write(options.anchorY)
  }
  if (options.x !== undefined) {
    $('#uiElement-transform-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#uiElement-transform-y').write(options.y)
  }
  if (options.width !== undefined) {
    $('#uiElement-transform-width').write(options.width)
  }
  if (options.height !== undefined) {
    $('#uiElement-transform-height').write(options.height)
  }
  if (options.rotation !== undefined) {
    $('#uiElement-transform-rotation').write(options.rotation)
  }
}

// 更新数据
UIElement.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  const transform = node.transform
  switch (key) {
    case 'name':
      if (node.name !== value) {
        node.name = value
        UI.list.updateItemName(node)
      }
      break
    case 'transform-anchorX':
    case 'transform-anchorY':
    case 'transform-x':
    case 'transform-x2':
    case 'transform-y':
    case 'transform-y2':
    case 'transform-width':
    case 'transform-width2':
    case 'transform-height':
    case 'transform-height2':
    case 'transform-rotation':
    case 'transform-scaleX':
    case 'transform-scaleY':
    case 'transform-skewX':
    case 'transform-skewY':
    case 'transform-opacity': {
      const index = key.indexOf('-') + 1
      const property = key.slice(index)
      if (transform[property] !== value) {
        transform[property] = value
        element.resize()
      }
      break
    }
  }
  UI.requestRendering()
}

// 页面 - 切换事件
UIElement.pageSwitch = function (event) {
  switch (event.value) {
    case 'uiImage':
    case 'uiText':
    case 'uiTextBox':
    case 'uiDialogBox':
    case 'uiProgressBar':
    case 'uiVideo':
    case 'uiWindow':
    case 'uiContainer': {
      const page = Inspector.manager.active
      page.insertBefore(this.transformGroup, page.firstChild)
      page.insertBefore(this.generalGroup, page.firstChild)
      page.appendChild(this.eventsGroup)
      page.appendChild(this.scriptsGroup)
      page.appendChild(this.parameterPane)
      break
    }
  }
}.bind(UIElement)

// 对齐 - 鼠标点击事件
UIElement.alignmentClick = function (event) {
  let x
  let y
  switch (this.getAttribute('value')) {
    case 'left':    x = 0   ; break
    case 'center':  x = 0.5 ; break
    case 'right':   x = 1   ; break
    case 'top':     y = 0   ; break
    case 'middle':  y = 0.5 ; break
    case 'bottom':  y = 1   ; break
  }
  const node = UIElement.target
  const element = node.instance
  const transform = node.transform
  const changes = []
  if (x !== undefined) {
    if (transform.anchorX !== x) {
      const input = $('#uiElement-transform-anchorX')
      changes.push({
        input: input,
        oldValue: transform.anchorX,
        newValue: x,
      })
      transform.anchorX = x
      input.write(x)
    }
    if (transform.x !== 0) {
      const input = $('#uiElement-transform-x')
      changes.push({
        input: input,
        oldValue: transform.x,
        newValue: 0,
      })
      transform.x = 0
      input.write(0)
    }
    if (transform.x2 !== x) {
      const input = $('#uiElement-transform-x2')
      changes.push({
        input: input,
        oldValue: transform.x2,
        newValue: x,
      })
      transform.x2 = x
      input.write(x)
    }
  }
  if (y !== undefined) {
    if (transform.anchorY !== y) {
      const input = $('#uiElement-transform-anchorY')
      changes.push({
        input: input,
        oldValue: transform.anchorY,
        newValue: y,
      })
      transform.anchorY = y
      input.write(y)
    }
    if (transform.y !== 0) {
      const input = $('#uiElement-transform-y')
      changes.push({
        input: input,
        oldValue: transform.y,
        newValue: 0,
      })
      transform.y = 0
      input.write(0)
    }
    if (transform.y2 !== y) {
      const input = $('#uiElement-transform-y2')
      changes.push({
        input: input,
        oldValue: transform.y2,
        newValue: y,
      })
      transform.y2 = y
      input.write(y)
    }
  }
  if (changes.length !== 0) {
    element.resize()
    UI.planToSave()
    UI.requestRendering()
    UI.history.save({
      type: 'inspector-change',
      editor: UIElement,
      target: UIElement.target,
      changes: changes,
    })
  }
}

// 参数 - 输入事件
UIElement.paramInput = function (event) {
  UIElement.update(
    UIElement.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// ******************************** 元素 - 图像页面 ********************************

{const UIImage = {
  // properties
  owner: UI,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
UIImage.initialize = function () {
  // 创建显示选项
  $('#uiImage-display').loadItems([
    {name: 'Stretch', value: 'stretch'},
    {name: 'Tile', value: 'tile'},
    {name: 'Clip', value: 'clip'},
    {name: 'Slice', value: 'slice'},
  ])

  // 设置显示模式关联元素
  $('#uiImage-display').enableHiddenMode().relate([
    {case: ['stretch', 'tile'], targets: [
      $('#uiImage-flip'),
      $('#uiImage-shift-box'),
    ]},
    {case: 'clip', targets: [
      $('#uiImage-flip'),
      $('#uiImage-clip'),
    ]},
    {case: 'slice', targets: [
      $('#uiImage-clip'),
      $('#uiImage-border'),
    ]},
  ])

  // 创建翻转选项
  $('#uiImage-flip').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Horizontal', value: 'horizontal'},
    {name: 'Vertical', value: 'vertical'},
    {name: 'Both', value: 'both'},
  ])

  // 创建混合模式选项
  $('#uiImage-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 同步滑动框和数字框的数值
  $('#uiImage-tint-0-slider').synchronize($('#uiImage-tint-0'))
  $('#uiImage-tint-1-slider').synchronize($('#uiImage-tint-1'))
  $('#uiImage-tint-2-slider').synchronize($('#uiImage-tint-2'))
  $('#uiImage-tint-3-slider').synchronize($('#uiImage-tint-3'))

  // 侦听事件
  const elements = $(`#uiImage-image,
    #uiImage-display, #uiImage-flip, #uiImage-blend,
    #uiImage-shiftX, #uiImage-shiftY, #uiImage-clip, #uiImage-border,
    #uiImage-tint-0, #uiImage-tint-1, #uiImage-tint-2, #uiImage-tint-3`)
  const sliders = $(`
    #uiImage-tint-0-slider, #uiImage-tint-1-slider,
    #uiImage-tint-2-slider, #uiImage-tint-3-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
}

// 创建图像
UIImage.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 100
  return {
    class: 'image',
    name: 'Image',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    image: '',
    display: 'stretch',
    flip: 'none',
    blend: 'normal',
    shiftX: 0,
    shiftY: 0,
    clip: [0, 0, 32, 32],
    border: 1,
    tint: [0, 0, 0, 0],
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIImage.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiImage', node)
    write('image')
    write('display')
    write('flip')
    write('blend')
    write('shiftX')
    write('shiftY')
    write('clip')
    write('border')
    write('tint-0')
    write('tint-1')
    write('tint-2')
    write('tint-3')
    UIElement.open(node)
  }
}

// 关闭数据
UIImage.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIImage.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  switch (key) {
    case 'image':
    case 'display':
    case 'flip':
    case 'blend':
    case 'shiftX':
    case 'shiftY':
    case 'clip':
    case 'border':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
      }
      break
    case 'tint-0':
    case 'tint-1':
    case 'tint-2':
    case 'tint-3': {
      const index = key.indexOf('-') + 1
      const color = key.slice(index)
      if (node.tint[color] !== value) {
        node.tint[color] = value
        element.tint[color] = value
      }
      break
    }
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIImage.paramInput = function (event) {
  UIImage.update(
    UIImage.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiImage = UIImage}

// ******************************** 元素 - 文本页面 ********************************

 {const UIText = {
  // properties
  owner: UI,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
UIText.initialize = function () {
  // 创建文本方向选项
  $('#uiText-direction').loadItems([
    {name: 'Horizontal - TB', value: 'horizontal-tb'},
    {name: 'Vertical - LR', value: 'vertical-lr'},
    {name: 'Vertical - RL', value: 'vertical-rl'},
  ])

  // 创建字型选项
  $('#uiText-typeface').loadItems([
    {name: 'Regular', value: 'regular'},
    {name: 'Bold', value: 'bold'},
    {name: 'Italic', value: 'italic'},
    {name: 'Bold Italic', value: 'bold-italic'},
  ])

  // 创建文字效果类型选项
  $('#uiText-effect-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Shadow', value: 'shadow'},
    {name: 'Stroke', value: 'stroke'},
    {name: 'Outline', value: 'outline'},
  ])

  // 创建溢出处理选项
  $('#uiText-overflow').loadItems([
    {name: 'Visible', value: 'visible'},
    {name: 'Wrap', value: 'wrap'},
    {name: 'Truncate', value: 'truncate'},
    {name: 'Wrap Truncate', value: 'wrap-truncate'},
  ])

  // 创建混合模式选项
  $('#uiText-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 同步滑动框和数字框的数值
  $('#uiText-size-slider').synchronize($('#uiText-size'))
  $('#uiText-lineSpacing-slider').synchronize($('#uiText-lineSpacing'))
  $('#uiText-letterSpacing-slider').synchronize($('#uiText-letterSpacing'))

  // 设置文字效果类型关联元素
  $('#uiText-effect-type').enableHiddenMode().relate([
    {case: 'shadow', targets: [
      $('#uiText-effect-shadowOffsetX'),
      $('#uiText-effect-shadowOffsetY'),
      $('#uiText-effect-color'),
    ]},
    {case: 'stroke', targets: [
      $('#uiText-effect-strokeWidth'),
      $('#uiText-effect-color'),
    ]},
    {case: 'outline', targets: [
      $('#uiText-effect-color'),
    ]},
  ])

  // 侦听事件
  const elements = $(`#uiText-direction, #uiText-horizontalAlign, #uiText-verticalAlign,
    #uiText-content, #uiText-size, #uiText-lineSpacing, #uiText-letterSpacing, #uiText-color, #uiText-font,
    #uiText-typeface, #uiText-effect-type, #uiText-effect-shadowOffsetX, #uiText-effect-shadowOffsetY,
    #uiText-effect-strokeWidth, #uiText-effect-color, #uiText-overflow, #uiText-blend`)
  const sliders = $('#uiText-size-slider, #uiText-lineSpacing-slider, #uiText-letterSpacing-slider')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
}

// 创建文本
UIText.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 24
  return {
    class: 'text',
    name: 'Text',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    direction: 'horizontal-tb',
    horizontalAlign: 'left',
    verticalAlign: 'middle',
    content: 'New Text',
    size: 16,
    lineSpacing: 0,
    letterSpacing: 0,
    color: 'ffffffff',
    font: '',
    typeface: 'regular',
    effect: {type: 'none'},
    overflow: 'visible',
    blend: 'normal',
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIText.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiText', node)
    write('direction')
    write('horizontalAlign')
    write('verticalAlign')
    write('content')
    write('size')
    write('lineSpacing')
    write('letterSpacing')
    write('color')
    write('font')
    write('typeface')
    write('effect-type')
    write('effect-shadowOffsetX', node.effect.shadowOffsetX || 1)
    write('effect-shadowOffsetY', node.effect.shadowOffsetY || 1)
    write('effect-strokeWidth', node.effect.strokeWidth || 1)
    write('effect-color', node.effect.color || '000000ff')
    write('overflow')
    write('blend')
    UIElement.open(node)
  }
}

// 关闭数据
UIText.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIText.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  switch (key) {
    case 'horizontalAlign':
      if (node.horizontalAlign !== value) {
        const event = window.event
        if (event &&
          event.type === 'input' &&
          event.value !== undefined) {
          UI.history.save({
            type: 'inspector-change',
            editor: this,
            target: this.target,
            changes: [{
              input: $('#uiText-horizontalAlign'),
              oldValue: node.horizontalAlign,
              newValue: value,
            }],
          })
        }
        node.horizontalAlign = value
        element.horizontalAlign = value
      }
      break
    case 'verticalAlign':
      if (node.verticalAlign !== value) {
        const event = window.event
        if (event &&
          event.type === 'input' &&
          event.value !== undefined) {
          UI.history.save({
            type: 'inspector-change',
            editor: this,
            target: this.target,
            changes: [{
              input: $('#uiText-verticalAlign'),
              oldValue: node.verticalAlign,
              newValue: value,
            }],
          })
        }
        node.verticalAlign = value
        element.verticalAlign = value
      }
      break
    case 'direction':
    case 'content':
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
    case 'color':
    case 'typeface':
    case 'overflow':
    case 'blend':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
      }
      break
    case 'font': {
      const font = value.trim()
      if (node.font !== font) {
        node.font = font
        element.font = font
      }
      break
    }
    case 'effect-type':
      if (node.effect.type !== value) {
        const read = getElementReader('uiText-effect')
        const effect = {type: value}
        switch (value) {
          case 'none':
            break
          case 'shadow':
            effect.shadowOffsetX = read('shadowOffsetX')
            effect.shadowOffsetY = read('shadowOffsetY')
            effect.color = read('color')
            break
          case 'stroke':
            effect.strokeWidth = read('strokeWidth')
            effect.color = read('color')
            break
          case 'outline':
            effect.color = read('color')
            break
        }
        node.effect = effect
        element.effect = effect
      }
      break
    case 'effect-shadowOffsetX':
    case 'effect-shadowOffsetY':
    case 'effect-strokeWidth':
    case 'effect-color': {
      const index = key.indexOf('-') + 1
      const property = key.slice(index)
      if (node.effect[property] !== value) {
        node.effect[property] = value
        element.effect = node.effect
      }
      break
    }
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIText.paramInput = function (event) {
  UIText.update(
    UIText.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiText = UIText}

// ******************************** 元素 - 文本框页面 ********************************

{const UITextBox = {
  // properties
  owner: UI,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
UITextBox.initialize = function () {
  // 创建类型选项
  $('#uiTextBox-type').loadItems([
    {name: 'Text', value: 'text'},
    {name: 'Number', value: 'number'},
  ])

  // 创建对齐方式选项
  $('#uiTextBox-align').loadItems([
    {name: 'Left', value: 'left'},
    {name: 'Center', value: 'center'},
    {name: 'Right', value: 'right'},
  ])

  // 设置类型关联元素
  $('#uiTextBox-type').enableHiddenMode().relate([
    {case: 'text', targets: [
      $('#uiTextBox-text'),
      $('#uiTextBox-maxLength'),
    ]},
    {case: 'number', targets: [
      $('#uiTextBox-number'),
      $('#uiTextBox-min'),
      $('#uiTextBox-max'),
      $('#uiTextBox-decimals'),
    ]},
  ])

  // 侦听事件
  const elements = $(`#uiTextBox-type, #uiTextBox-align, #uiTextBox-text,
    #uiTextBox-maxLength, #uiTextBox-number, #uiTextBox-min, #uiTextBox-max,
    #uiTextBox-decimals, #uiTextBox-padding, #uiTextBox-size, #uiTextBox-font,
    #uiTextBox-color, #uiTextBox-selectionColor, #uiTextBox-selectionBgColor`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
}

// 创建文本框
UITextBox.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 24
  return {
    class: 'textbox',
    name: 'TextBox',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    type: 'text',
    align: 'left',
    text: 'Content',
    maxLength: 16,
    number: 0,
    min: 0,
    max: 0,
    decimals: 0,
    padding: 4,
    size: 16,
    font: '',
    color: 'ffffffff',
    selectionColor: 'ffffffff',
    selectionBgColor: '0090ccff',
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UITextBox.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiTextBox', node)
    const number = $('#uiTextBox-number')
    number.input.min = node.min
    number.input.max = node.max
    number.decimals = node.decimals
    write('type')
    write('align')
    write('text')
    write('maxLength')
    write('number')
    write('min')
    write('max')
    write('decimals')
    write('padding')
    write('size')
    write('font')
    write('color')
    write('selectionColor')
    write('selectionBgColor')
    UIElement.open(node)
  }
}

// 关闭数据
UITextBox.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UITextBox.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  switch (key) {
    case 'type':
    case 'align':
    case 'maxLength':
    case 'padding':
    case 'size':
    case 'font':
    case 'color':
    case 'selectionColor':
    case 'selectionBgColor':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
      }
      break
    case 'text':
    case 'number':
      if (node[key] !== value) {
        node[key] = value
        element.content = value.toString()
      }
      break
    case 'min':
    case 'max':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
        $('#uiTextBox-number').input[key] = value
      }
      break
    case 'decimals':
      if (node.decimals !== value) {
        node.decimals = value
        element.decimals = value
        $('#uiTextBox-number').decimals = value
      }
      break
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UITextBox.paramInput = function (event) {
  UITextBox.update(
    UITextBox.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiTextBox = UITextBox}

// ******************************** 元素 - 对话框页面 ********************************

 {const UIDialogBox = {
  // properties
  owner: UI,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
UIDialogBox.initialize = function () {
  // 创建字型选项
  $('#uiDialogBox-typeface').loadItems([
    {name: 'Regular', value: 'regular'},
    {name: 'Bold', value: 'bold'},
    {name: 'Italic', value: 'italic'},
    {name: 'Bold Italic', value: 'bold-italic'},
  ])

  // 创建文字效果类型选项
  $('#uiDialogBox-effect-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Shadow', value: 'shadow'},
    {name: 'Stroke', value: 'stroke'},
    {name: 'Outline', value: 'outline'},
  ])

  // 创建混合模式选项
  $('#uiDialogBox-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 同步滑动框和数字框的数值
  $('#uiDialogBox-size-slider').synchronize($('#uiDialogBox-size'))
  $('#uiDialogBox-lineSpacing-slider').synchronize($('#uiDialogBox-lineSpacing'))
  $('#uiDialogBox-letterSpacing-slider').synchronize($('#uiDialogBox-letterSpacing'))

  // 设置文字效果类型关联元素
  $('#uiDialogBox-effect-type').enableHiddenMode().relate([
    {case: 'shadow', targets: [
      $('#uiDialogBox-effect-shadowOffsetX'),
      $('#uiDialogBox-effect-shadowOffsetY'),
      $('#uiDialogBox-effect-color'),
    ]},
    {case: 'stroke', targets: [
      $('#uiDialogBox-effect-strokeWidth'),
      $('#uiDialogBox-effect-color'),
    ]},
    {case: 'outline', targets: [
      $('#uiDialogBox-effect-color'),
    ]},
  ])

  // 侦听事件
  const elements = $(`#uiDialogBox-content, #uiDialogBox-interval, #uiDialogBox-size,
    #uiDialogBox-lineSpacing, #uiDialogBox-letterSpacing, #uiDialogBox-color, #uiDialogBox-font,
    #uiDialogBox-typeface, #uiDialogBox-effect-type, #uiDialogBox-effect-shadowOffsetX, #uiDialogBox-effect-shadowOffsetY,
    #uiDialogBox-effect-strokeWidth, #uiDialogBox-effect-color, #uiDialogBox-blend`)
  const sliders = $('#uiDialogBox-size-slider, #uiDialogBox-lineSpacing-slider, #uiDialogBox-letterSpacing-slider')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
}

// 创建文本
UIDialogBox.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 24
  return {
    class: 'dialogbox',
    name: 'DialogBox',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    content: 'Content',
    interval: 16.6666,
    size: 16,
    lineSpacing: 0,
    letterSpacing: 0,
    color: 'ffffffff',
    font: '',
    typeface: 'regular',
    effect: {type: 'none'},
    blend: 'normal',
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIDialogBox.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiDialogBox', node)
    write('content')
    write('interval')
    write('size')
    write('lineSpacing')
    write('letterSpacing')
    write('color')
    write('font')
    write('typeface')
    write('effect-type')
    write('effect-shadowOffsetX', node.effect.shadowOffsetX || 1)
    write('effect-shadowOffsetY', node.effect.shadowOffsetY || 1)
    write('effect-strokeWidth', node.effect.strokeWidth || 1)
    write('effect-color', node.effect.color || '000000ff')
    write('blend')
    UIElement.open(node)
  }
}

// 关闭数据
UIDialogBox.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIDialogBox.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  switch (key) {
    case 'content':
    case 'interval':
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
    case 'color':
    case 'typeface':
    case 'blend':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
      }
      break
    case 'font': {
      const font = value.trim()
      if (node.font !== font) {
        node.font = font
        element.font = font
      }
      break
    }
    case 'effect-type':
      if (node.effect.type !== value) {
        const read = getElementReader('uiDialogBox-effect')
        const effect = {type: value}
        switch (value) {
          case 'none':
            break
          case 'shadow':
            effect.shadowOffsetX = read('shadowOffsetX')
            effect.shadowOffsetY = read('shadowOffsetY')
            effect.color = read('color')
            break
          case 'stroke':
            effect.strokeWidth = read('strokeWidth')
            effect.color = read('color')
            break
          case 'outline':
            effect.color = read('color')
            break
        }
        node.effect = effect
        element.effect = effect
      }
      break
    case 'effect-shadowOffsetX':
    case 'effect-shadowOffsetY':
    case 'effect-strokeWidth':
    case 'effect-color': {
      const index = key.indexOf('-') + 1
      const property = key.slice(index)
      if (node.effect[property] !== value) {
        node.effect[property] = value
        element.effect = node.effect
      }
      break
    }
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIDialogBox.paramInput = function (event) {
  UIDialogBox.update(
    UIDialogBox.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiDialogBox = UIDialogBox}

// ******************************** 元素 - 进度条页面 ********************************

{const UIProgressBar = {
  // properties
  owner: UI,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
UIProgressBar.initialize = function () {
  // 创建显示选项
  $('#uiProgressBar-display').loadItems([
    {name: 'Stretch', value: 'stretch'},
    {name: 'Clip', value: 'clip'},
  ])

  // 设置显示关联元素
  $('#uiProgressBar-display').enableHiddenMode().relate([
    {case: 'clip', targets: [
      $('#uiProgressBar-clip'),
    ]},
  ])

  // 创建类型选项
  $('#uiProgressBar-type').loadItems([
    {name: 'Horizontal', value: 'horizontal'},
    {name: 'Vertical', value: 'vertical'},
    {name: 'Round', value: 'round'},
  ])

  // 设置类型关联元素
  $('#uiProgressBar-type').enableHiddenMode().relate([
    {case: 'round', targets: [
      $('#uiProgressBar-centerX'),
      $('#uiProgressBar-centerY'),
      $('#uiProgressBar-startAngle'),
      $('#uiProgressBar-centralAngle'),
    ]},
  ])

  // 创建混合模式选项
  $('#uiProgressBar-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 创建颜色模式选项
  $('#uiProgressBar-colorMode').loadItems([
    {name: 'Texture Sampling', value: 'texture'},
    {name: 'Fixed', value: 'fixed'},
  ])

  // 设置颜色模式关联元素
  $('#uiProgressBar-colorMode').enableHiddenMode().relate([
    {case: 'fixed', targets: [
      $('#uiProgressBar-color-0-box'),
      $('#uiProgressBar-color-1-box'),
      $('#uiProgressBar-color-2-box'),
      $('#uiProgressBar-color-3-box'),
    ]},
  ])

  // 同步滑动框和数字框的数值
  $('#uiProgressBar-color-0-slider').synchronize($('#uiProgressBar-color-0'))
  $('#uiProgressBar-color-1-slider').synchronize($('#uiProgressBar-color-1'))
  $('#uiProgressBar-color-2-slider').synchronize($('#uiProgressBar-color-2'))
  $('#uiProgressBar-color-3-slider').synchronize($('#uiProgressBar-color-3'))

  // 侦听事件
  const elements = $(`#uiProgressBar-image,
    #uiProgressBar-display, #uiProgressBar-clip,
    #uiProgressBar-type, #uiProgressBar-centerX, #uiProgressBar-centerY,
    #uiProgressBar-startAngle, #uiProgressBar-centralAngle, #uiProgressBar-step,
    #uiProgressBar-progress, #uiProgressBar-blend, #uiProgressBar-colorMode,
    #uiProgressBar-color-0, #uiProgressBar-color-1,
    #uiProgressBar-color-2, #uiProgressBar-color-3`)
  const sliders = $(`
    #uiProgressBar-color-0-slider, #uiProgressBar-color-1-slider,
    #uiProgressBar-color-2-slider, #uiProgressBar-color-3-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
}

// 创建图像
UIProgressBar.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 100
  return {
    class: 'progressbar',
    name: 'ProgressBar',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    image: '',
    display: 'stretch',
    clip: [0, 0, 32, 32],
    type: 'horizontal',
    centerX: 0.5,
    centerY: 0.5,
    startAngle: -90,
    centralAngle: 360,
    step: 0,
    progress: 1,
    blend: 'normal',
    colorMode: 'texture',
    color: [0, 0, 0, 0],
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIProgressBar.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiProgressBar', node)
    write('image')
    write('display')
    write('clip')
    write('type')
    write('centerX')
    write('centerY')
    write('startAngle')
    write('centralAngle')
    write('step')
    write('progress')
    write('blend')
    write('colorMode')
    write('color-0')
    write('color-1')
    write('color-2')
    write('color-3')
    UIElement.open(node)
  }
}

// 关闭数据
UIProgressBar.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIProgressBar.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  switch (key) {
    case 'image':
    case 'display':
    case 'clip':
    case 'type':
    case 'centerX':
    case 'centerY':
    case 'startAngle':
    case 'centralAngle':
    case 'step':
    case 'progress':
    case 'blend':
    case 'colorMode':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
      }
      break
    case 'color-0':
    case 'color-1':
    case 'color-2':
    case 'color-3': {
      const index = key.indexOf('-') + 1
      const color = key.slice(index)
      if (node.color[color] !== value) {
        node.color[color] = value
        element.color[color] = value
      }
      break
    }
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIProgressBar.paramInput = function (event) {
  UIProgressBar.update(
    UIProgressBar.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiProgressBar = UIProgressBar}

// ******************************** 元素 - 视频页面 ********************************

{const UIVideo = {
  // properties
  owner: UI,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
UIVideo.initialize = function () {
  // 创建循环选项
  $('#uiVideo-loop').loadItems([
    {name: 'Once', value: false},
    {name: 'Loop', value: true},
  ])

  // 创建翻转选项
  $('#uiVideo-flip').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Horizontal', value: 'horizontal'},
    {name: 'Vertical', value: 'vertical'},
    {name: 'Both', value: 'both'},
  ])

  // 创建混合模式选项
  $('#uiVideo-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 侦听事件
  const elements = $('#uiVideo-video, #uiVideo-loop, #uiVideo-flip, #uiVideo-blend')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
}

// 创建文本框
UIVideo.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 100
  return {
    class: 'video',
    name: 'Video',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    video: '',
    loop: false,
    flip: 'none',
    blend: 'normal',
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIVideo.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiVideo', node)
    write('video')
    write('loop')
    write('flip')
    write('blend')
    UIElement.open(node)
  }
}

// 关闭数据
UIVideo.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIVideo.update = function (node, key, value) {
  UI.planToSave()
  // const element = node.instance
  switch (key) {
    case 'video':
    case 'loop':
    case 'flip':
    case 'blend':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
      }
      break
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIVideo.paramInput = function (event) {
  UIVideo.update(
    UIVideo.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiVideo = UIVideo}

// ******************************** 元素 - 窗口页面 ********************************

{const UIWindow = {
  // properties
  owner: UI,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
UIWindow.initialize = function () {
  // 创建布局选项
  $('#uiWindow-layout').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Horizontal Grid', value: 'horizontal-grid'},
    {name: 'Vertical Grid', value: 'vertical-grid'},
  ])

  // 设置布局关联元素
  $('#uiWindow-layout').enableHiddenMode().relate([
    {case: 'normal', targets: [
      $('#uiWindow-scrollX'),
      $('#uiWindow-scrollY'),
    ]},
    {case: ['horizontal-grid', 'vertical-grid'], targets: [
      $('#uiWindow-scrollX'),
      $('#uiWindow-scrollY'),
      $('#uiWindow-gridWidth'),
      $('#uiWindow-gridHeight'),
      $('#uiWindow-gridGapX'),
      $('#uiWindow-gridGapY'),
      $('#uiWindow-paddingX'),
      $('#uiWindow-paddingY'),
    ]},
  ])

  // 创建溢出选项
  $('#uiWindow-overflow').loadItems([
    {name: 'Visible', value: 'visible'},
    {name: 'Hidden', value: 'hidden'},
  ])

  // 侦听事件
  const elements = $(`#uiWindow-layout,
    #uiWindow-scrollX, #uiWindow-scrollY, #uiWindow-gridWidth,
    #uiWindow-gridHeight, #uiWindow-gridGapX, #uiWindow-gridGapY,
    #uiWindow-paddingX, #uiWindow-paddingY, #uiWindow-overflow`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
}

// 创建窗口
UIWindow.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 100
  return {
    class: 'window',
    name: 'Window',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    layout: 'normal',
    scrollX: 0,
    scrollY: 0,
    gridWidth: 0,
    gridHeight: 0,
    gridGapX: 0,
    gridGapY: 0,
    paddingX: 0,
    paddingY: 0,
    overflow: 'visible',
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIWindow.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiWindow', node)
    write('layout')
    write('scrollX')
    write('scrollY')
    write('gridWidth')
    write('gridHeight')
    write('gridGapX')
    write('gridGapY')
    write('paddingX')
    write('paddingY')
    write('overflow')
    UIElement.open(node)
  }
}

// 关闭数据
UIWindow.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIWindow.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  switch (key) {
    case 'layout':
    case 'overflow':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
      }
      break
    case 'scrollX':
    case 'scrollY':
    case 'gridWidth':
    case 'gridHeight':
    case 'gridGapX':
    case 'gridGapY':
    case 'paddingX':
    case 'paddingY':
      if (node[key] !== value) {
        node[key] = value
        element[key] = value
        element.resize()
      }
      break
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIWindow.paramInput = function (event) {
  UIWindow.update(
    UIWindow.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiWindow = UIWindow}

// ******************************** 元素 - 容器页面 ********************************

{const UIContainer = {
  // properties
  owner: UI,
  target: null,
  // methods
  create: null,
  open: null,
  close: null,
}

// 创建窗口
UIContainer.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 100
  return {
    class: 'container',
    name: 'Container',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIContainer.open = function (node) {
  if (this.target !== node) {
    this.target = node
    UIElement.open(node)

    // 写入数据
    const write = getElementWriter('uiContainer', node)
    UIElement.open(node)
  }
}

// 关闭数据
UIContainer.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

Inspector.uiContainer = UIContainer}

Inspector.uiElement = UIElement}

// ******************************** 动画 - 动作页面 ********************************

{const AnimMotion = {
  // properties
  owner: null,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
AnimMotion.initialize = function () {
  // 设置所有者代理
  this.owner = {
    setTarget: motion => {
      Animation.setMotion(motion)
      Inspector.open('animMotion', motion)
    }
  }

  // 设置循环关联元素
  $('#animMotion-loop').relate([$('#animMotion-loopStart')])

  // 侦听事件
  const elements = $('#animMotion-loop, #animMotion-loopStart')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Animation))
}

// 创建动作
AnimMotion.create = function (motionId) {
  return {
    class: 'motion',
    id: motionId,
    loop: false,
    loopStart: 0,
    layers: [Inspector.animImageLayer.create()],
  }
}

// 打开数据
AnimMotion.open = function (motion) {
  if (this.target !== motion) {
    this.target = motion

    // 写入数据
    const write = getElementWriter('animMotion', motion)
    write('loop')
    write('loopStart')
  }
}

// 关闭数据
AnimMotion.close = function () {
  if (this.target) {
    // 此处不能unselect并update
    // Animation.list.unselect(this.target)
    // Animation.updateTarget()
    this.target = null
  }
}

// 更新数据
AnimMotion.update = function (motion, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'loop':
      if (motion.loop !== value) {
        motion.loop = value
        Animation.list.updateLoopIcon(motion)
      }
      break
    case 'loopStart':
      if (motion.loopStart !== value) {
        motion.loopStart = value
        Animation.player.computeLength()
      }
      break
  }
}

// 参数 - 输入事件
AnimMotion.paramInput = function (event) {
  AnimMotion.update(
    AnimMotion.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animMotion = AnimMotion}

// ******************************** 动画 - 骨骼层页面 ********************************

{const AnimBoneLayer = {
  // methods
  create: null,
}

// 创建骨骼层
AnimBoneLayer.create = function () {
  return {
    class: 'bone',
    name: 'Bone',
    expanded: true,
    hidden: false,
    locked: false,
    frames: [Inspector.animBoneFrame.create()],
    children: [],
  }
}

Inspector.animBoneLayer = AnimBoneLayer}

// ******************************** 动画 - 骨骼帧页面 ********************************

{const AnimBoneFrame = {
  // properties
  motion: null,
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
AnimBoneFrame.initialize = function () {
  // 侦听事件
  const elements = $(`#animBoneFrame-x, #animBoneFrame-y, #animBoneFrame-rotation,
    #animBoneFrame-scaleX, #animBoneFrame-scaleY, #animBoneFrame-opacity`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-frame-change'
      data.motion = this.motion
    },
  ))
}

// 创建关键帧
AnimBoneFrame.create = function () {
  return {
    start: 0,     // 帧起始位置
    end: 1,       // 帧结束位置
    easingId: '', // 过渡方式
    x: 0,         // 位移X
    y: 0,         // 位移Y
    rotation: 0,  // 旋转角度
    scaleX: 1,    // 缩放X
    scaleY: 1,    // 缩放Y
    opacity: 1,   // 不透明度
  }
}

// 打开数据
AnimBoneFrame.open = function (frame) {
  if (this.target !== frame) {
    this.target = frame
    this.motion = Animation.motion
    Curve.load(frame)

    // 写入数据
    const write = getElementWriter('animBoneFrame')
    write('x')
    write('y')
    write('rotation')
    write('scaleX')
    write('scaleY')
    write('opacity')
  }
}

// 关闭数据
AnimBoneFrame.close = function () {
  if (this.target) {
    Animation.unselectMarquee(this.target)
    Curve.load(null)
    this.target = null
    this.motion = null
  }
}

// 写入数据
AnimBoneFrame.write = function (options) {
  if (options.x !== undefined) {
    $('#animBoneFrame-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#animBoneFrame-y').write(options.y)
  }
  if (options.rotation !== undefined) {
    $('#animBoneFrame-rotation').write(options.rotation)
  }
  if (options.scaleX !== undefined) {
    $('#animBoneFrame-scaleX').write(options.scaleX)
  }
  if (options.scaleY !== undefined) {
    $('#animBoneFrame-scaleY').write(options.scaleY)
  }
}

// 更新数据
AnimBoneFrame.update = function (frame, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'x':
    case 'y':
    case 'rotation':
    case 'scaleX':
    case 'scaleY':
    case 'opacity':
      if (frame[key] !== value) {
        frame[key] = value
        Animation.updateFrameContexts()
      }
      break
  }
  Animation.requestRendering()
}

// 参数 - 输入事件
AnimBoneFrame.paramInput = function (event) {
  AnimBoneFrame.update(
    AnimBoneFrame.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animBoneFrame = AnimBoneFrame}

// ******************************** 动画 - 图像层页面 ********************************

{const AnimImageLayer = {
  // properties
  motion: null,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
AnimImageLayer.initialize = function () {
  // 创建混合模式选项
  $('#animImageLayer-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 创建光照模式选项
  $('#animImageLayer-light').loadItems([
    {name: 'Raw', value: 'raw'},
    {name: 'Global Sampling', value: 'global'},
    {name: 'Anchor Sampling', value: 'anchor'},
  ])

  // 侦听事件
  const elements = $('#animImageLayer-sprite, #animImageLayer-blend, #animImageLayer-light')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-layer-change'
      data.motion = this.motion
    },
  ))
}

// 创建图像层
AnimImageLayer.create = function () {
  return {
    class: 'sprite',
    name: 'Image',
    hidden: false,
    locked: false,
    sprite: '',
    blend: 'normal',
    light: 'raw',
    frames: [Inspector.animImageFrame.create()],
  }
}

// 打开数据
AnimImageLayer.open = function (layer) {
  if (this.target !== layer) {
    this.target = layer
    this.motion = Animation.motion

    // 创建精灵图选项
    const id = Animation.meta.guid
    const items = Animation.getSpriteListItems(id)
    $('#animImageLayer-sprite').loadItems(items)

    // 写入数据
    const write = getElementWriter('animImageLayer', layer)
    write('sprite')
    write('blend')
    write('light')
  }
}

// 关闭数据
AnimImageLayer.close = function () {
  if (this.target) {
    this.target = null
    this.motion = null
  }
}

// 更新数据
AnimImageLayer.update = function (layer, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'sprite':
    case 'blend':
    case 'light':
      if (layer[key] !== value) {
        layer[key] = value
      }
      break
  }
  Animation.requestRendering()
}

// 参数 - 输入事件
AnimImageLayer.paramInput = function (event) {
  AnimImageLayer.update(
    AnimImageLayer.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animImageLayer = AnimImageLayer}

// ******************************** 动画 - 图像帧页面 ********************************

{const AnimImageFrame = {
  // properties
  motion: null,
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
AnimImageFrame.initialize = function () {
  // 同步滑动框和数字框的数值
  $('#animImageFrame-tint-0-slider').synchronize($('#animImageFrame-tint-0'))
  $('#animImageFrame-tint-1-slider').synchronize($('#animImageFrame-tint-1'))
  $('#animImageFrame-tint-2-slider').synchronize($('#animImageFrame-tint-2'))
  $('#animImageFrame-tint-3-slider').synchronize($('#animImageFrame-tint-3'))

  // 侦听事件
  const elements = $(`#animImageFrame-x, #animImageFrame-y, #animImageFrame-rotation,
    #animImageFrame-scaleX, #animImageFrame-scaleY, #animImageFrame-opacity,
    #animImageFrame-tint-0, #animImageFrame-tint-1, #animImageFrame-tint-2, #animImageFrame-tint-3`)
  const sliders = $(`
    #animImageFrame-tint-0-slider, #animImageFrame-tint-1-slider,
    #animImageFrame-tint-2-slider, #animImageFrame-tint-3-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-frame-change'
      data.motion = this.motion
    },
  ))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)

  // 初始化精灵窗口
  Sprite.initialize()
}

// 创建关键帧
AnimImageFrame.create = function () {
  return {
    start: 0,           // 0:帧起始位置
    end: 1,             // 1:帧结束位置
    easingId: '',       // 2:过渡方式
    x: 0,               // 3:位移X
    y: 0,               // 4:位移Y
    rotation: 0,        // 5:旋转角度
    scaleX: 1,          // 6:缩放X
    scaleY: 1,          // 7:缩放Y
    opacity: 1,         // 8:不透明度
    spriteX: 0,         // 9:精灵索引X
    spriteY: 0,         // 10:精灵索引Y
    tint: [0, 0, 0, 0], // 11:精灵图像色调
  }
}

// 打开数据
AnimImageFrame.open = function (frame) {
  if (this.target !== frame) {
    this.target = frame
    this.motion = Animation.motion
    Sprite.open(frame)
    Curve.load(frame)

    // 写入数据
    const write = getElementWriter('animImageFrame', frame)
    write('x')
    write('y')
    write('rotation')
    write('scaleX')
    write('scaleY')
    write('opacity')
    write('tint-0')
    write('tint-1')
    write('tint-2')
    write('tint-3')
  }
}

// 关闭数据
AnimImageFrame.close = function () {
  if (this.target) {
    Animation.unselectMarquee(this.target)
    Sprite.close()
    Curve.load(null)
    this.target = null
    this.motion = null
  }
}

// 写入数据
AnimImageFrame.write = function (options) {
  if (options.x !== undefined) {
    $('#animImageFrame-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#animImageFrame-y').write(options.y)
  }
  if (options.rotation !== undefined) {
    $('#animImageFrame-rotation').write(options.rotation)
  }
  if (options.scaleX !== undefined) {
    $('#animImageFrame-scaleX').write(options.scaleX)
  }
  if (options.scaleY !== undefined) {
    $('#animImageFrame-scaleY').write(options.scaleY)
  }
}

// 更新数据
AnimImageFrame.update = function (frame, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'x':
    case 'y':
    case 'rotation':
    case 'scaleX':
    case 'scaleY':
    case 'opacity':
      if (frame[key] !== value) {
        frame[key] = value
        Animation.updateFrameContexts()
      }
      break
    case 'tint-0':
    case 'tint-1':
    case 'tint-2':
    case 'tint-3': {
      const index = key.slice(-1)
      if (frame.tint[index] !== value) {
        frame.tint[index] = value
        Animation.updateFrameContexts()
      }
      break
    }
  }
  Animation.requestRendering()
}

// 参数 - 输入事件
AnimImageFrame.paramInput = function (event) {
  AnimImageFrame.update(
    AnimImageFrame.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animImageFrame = AnimImageFrame}

// ******************************** 动画 - 粒子层页面 ********************************

{const AnimParticleLayer = {
  // properties
  motion: null,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
AnimParticleLayer.initialize = function () {
  // 创建发射角度选项
  $('#animParticleLayer-angle').loadItems([
    {name: 'Default', value: 'default'},
    {name: 'Inherit', value: 'inherit'},
  ])

  // 侦听事件
  const elements = $('#animParticleLayer-particleId, #animParticleLayer-angle')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-layer-change'
      data.motion = this.motion
    },
  ))
}

// 创建关键帧
AnimParticleLayer.create = function () {
  return {
    class: 'particle',
    name: 'Particle',
    hidden: false,
    locked: false,
    particleId: '',
    angle: 'default',
    frames: [Inspector.animParticleFrame.create()],
  }
}

// 打开数据
AnimParticleLayer.open = function (layer) {
  if (this.target !== layer) {
    this.target = layer
    this.motion = Animation.motion

    // 写入数据
    const write = getElementWriter('animParticleLayer', layer)
    write('particleId')
    write('angle')
  }
}

// 关闭数据
AnimParticleLayer.close = function () {
  if (this.target) {
    this.target = null
    this.motion = null
  }
}

// 更新数据
AnimParticleLayer.update = function (layer, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'particleId':
      if (layer.particleId !== value) {
        layer.particleId = value
        Animation.player.destroyContextEmitters()
        Animation.updateFrameContexts()
      }
      break
    case 'angle':
      if (layer.angle !== value) {
        layer.angle = value
      }
      break
  }
  Animation.requestRendering()
}

// 参数 - 输入事件
AnimParticleLayer.paramInput = function (event) {
  AnimParticleLayer.update(
    AnimParticleLayer.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animParticleLayer = AnimParticleLayer}

// ******************************** 动画 - 粒子帧页面 ********************************

{const AnimParticleFrame = {
  // properties
  motion: null,
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
AnimParticleFrame.initialize = function () {
  // 侦听事件
  const elements = $(`#animParticleFrame-x, #animParticleFrame-y, #animParticleFrame-rotation,
    #animParticleFrame-scaleX, #animParticleFrame-scaleY, #animParticleFrame-opacity,
    #animParticleFrame-scale, #animParticleFrame-speed`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-frame-change'
      data.motion = this.motion
    },
  ))
}

// 创建关键帧
AnimParticleFrame.create = function () {
  return {
    start: 0,     // 0 帧起始位置
    end: 1,       // 1 帧结束位置
    easingId: '', // 2 过渡方式
    x: 0,         // 3 位移X
    y: 0,         // 4 位移Y
    rotation: 0,  // 5 旋转角度
    scaleX: 1,    // 6 缩放X
    scaleY: 1,    // 7 缩放Y
    opacity: 1,   // 8 不透明度
    scale: 1,     // 9 粒子比例
    speed: 1,     // 10 播放速度
  }
}

// 打开数据
AnimParticleFrame.open = function (frame) {
  if (this.target !== frame) {
    this.target = frame
    this.motion = Animation.motion
    Curve.load(frame)

    // 写入数据
    const write = getElementWriter('animParticleFrame', frame)
    write('x')
    write('y')
    write('rotation')
    write('scaleX')
    write('scaleY')
    write('opacity')
    write('scale')
    write('speed')
  }
}

// 关闭数据
AnimParticleFrame.close = function () {
  if (this.target) {
    Animation.unselectMarquee(this.target)
    Curve.load(null)
    this.target = null
    this.motion = null
  }
}

// 写入数据
AnimParticleFrame.write = function (options) {
  if (options.x !== undefined) {
    $('#animParticleFrame-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#animParticleFrame-y').write(options.y)
  }
  if (options.rotation !== undefined) {
    $('#animParticleFrame-rotation').write(options.rotation)
  }
  if (options.scaleX !== undefined) {
    $('#animParticleFrame-scaleX').write(options.scaleX)
  }
  if (options.scaleY !== undefined) {
    $('#animParticleFrame-scaleY').write(options.scaleY)
  }
}

// 更新数据
AnimParticleFrame.update = function (frame, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'x':
    case 'y':
    case 'rotation':
    case 'scaleX':
    case 'scaleY':
    case 'opacity':
      if (frame[key] !== value) {
        frame[key] = value
        Animation.updateFrameContexts()
      }
      break
    case 'scale':
    case 'speed':
      if (frame[key] !== value) {
        frame[key] = value
      }
      break
  }
  Animation.requestRendering()
}

// 参数 - 输入事件
AnimParticleFrame.paramInput = function (event) {
  AnimParticleFrame.update(
    AnimParticleFrame.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animParticleFrame = AnimParticleFrame}

// ******************************** 粒子 - 图层页面 ********************************

{const ParticleLayer = {
  // properties
  owner: Particle,
  target: null,
  nameBox: $('#particleLayer-name'),
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
ParticleLayer.initialize = function () {
  // 创建发射区域类型选项
  $('#particleLayer-area-type').loadItems([
    {name: 'Point', value: 'point'},
    {name: 'Rectangle', value: 'rectangle'},
    {name: 'Circle', value: 'circle'},
    {name: 'Screen Edge', value: 'edge'},
  ])

  // 创建混合模式选项
  $('#particleLayer-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 创建排序模式选项
  $('#particleLayer-sort').loadItems([
    {name: 'Youngest in Front', value: 'youngest-in-front'},
    {name: 'Oldest in Front', value: 'oldest-in-front'},
    {name: 'By Scale Factor', value: 'by-scale-factor'},
  ])

  // 创建颜色模式选项
  $('#particleLayer-color-mode').loadItems([
    {name: 'Fixed', value: 'fixed'},
    {name: 'Random', value: 'random'},
    {name: 'Easing', value: 'easing'},
    {name: 'Texture Sampling', value: 'texture'},
  ])

  // 设置发射区域类型关联元素
  $('#particleLayer-area-type').enableHiddenMode().relate([
    {case: 'rectangle', targets: [
      $('#particleLayer-area-width'),
      $('#particleLayer-area-height'),
    ]},
    {case: 'circle', targets: [
      $('#particleLayer-area-radius'),
    ]},
  ])

  // 设置颜色模式关联元素
  $('#particleLayer-color-mode').enableHiddenMode().relate([
    {case: 'fixed', targets: [
      $('#particleLayer-color-rgba-box'),
    ]},
    {case: 'random', targets: [
      $('#particleLayer-color-min-box'),
      $('#particleLayer-color-max-box'),
    ]},
    {case: 'easing', targets: [
      $('#particleLayer-color-easingId'),
      $('#particleLayer-color-startMin-box'),
      $('#particleLayer-color-startMax-box'),
      $('#particleLayer-color-endMin-box'),
      $('#particleLayer-color-endMax-box'),
    ]},
    {case: 'texture', targets: [
      $('#particleLayer-color-tint-0-box'),
      $('#particleLayer-color-tint-1-box'),
      $('#particleLayer-color-tint-2-box'),
      $('#particleLayer-color-tint-3-box'),
    ]},
  ])

  // 同步滑动框和数字框的数值
  $('#particleLayer-color-tint-0-slider').synchronize($('#particleLayer-color-tint-0'))
  $('#particleLayer-color-tint-1-slider').synchronize($('#particleLayer-color-tint-1'))
  $('#particleLayer-color-tint-2-slider').synchronize($('#particleLayer-color-tint-2'))
  $('#particleLayer-color-tint-3-slider').synchronize($('#particleLayer-color-tint-3'))

  // 侦听事件
  const elements = $(`#particleLayer-name, #particleLayer-area-type,
    #particleLayer-area-width, #particleLayer-area-height, #particleLayer-area-radius,
    #particleLayer-maximum, #particleLayer-count,
    #particleLayer-delay, #particleLayer-interval, #particleLayer-lifetime,
    #particleLayer-lifetimeDev, #particleLayer-fadeout,
    #particleLayer-anchor-x-0, #particleLayer-anchor-x-1,
    #particleLayer-anchor-y-0, #particleLayer-anchor-y-1,
    #particleLayer-movement-angle-0, #particleLayer-movement-angle-1,
    #particleLayer-movement-speed-0, #particleLayer-movement-speed-1,
    #particleLayer-movement-accelAngle-0, #particleLayer-movement-accelAngle-1,
    #particleLayer-movement-accel-0, #particleLayer-movement-accel-1,
    #particleLayer-rotation-angle-0, #particleLayer-rotation-angle-1,
    #particleLayer-rotation-speed-0, #particleLayer-rotation-speed-1,
    #particleLayer-rotation-accel-0, #particleLayer-rotation-accel-1,
    #particleLayer-scale-factor-0, #particleLayer-scale-factor-1,
    #particleLayer-scale-speed-0, #particleLayer-scale-speed-1,
    #particleLayer-scale-accel-0, #particleLayer-scale-accel-1,
    #particleLayer-image, #particleLayer-blend, #particleLayer-sort,
    #particleLayer-hframes, #particleLayer-vframes,
    #particleLayer-color-mode,
    #particleLayer-color-rgba-0, #particleLayer-color-rgba-1,
    #particleLayer-color-rgba-2, #particleLayer-color-rgba-3,
    #particleLayer-color-min-0, #particleLayer-color-min-1,
    #particleLayer-color-min-2, #particleLayer-color-min-3,
    #particleLayer-color-max-0, #particleLayer-color-max-1,
    #particleLayer-color-max-2, #particleLayer-color-max-3,
    #particleLayer-color-easingId,
    #particleLayer-color-startMin-0, #particleLayer-color-startMin-1,
    #particleLayer-color-startMin-2, #particleLayer-color-startMin-3,
    #particleLayer-color-startMax-0, #particleLayer-color-startMax-1,
    #particleLayer-color-startMax-2, #particleLayer-color-startMax-3,
    #particleLayer-color-endMin-0, #particleLayer-color-endMin-1,
    #particleLayer-color-endMin-2, #particleLayer-color-endMin-3,
    #particleLayer-color-endMax-0, #particleLayer-color-endMax-1,
    #particleLayer-color-endMax-2, #particleLayer-color-endMax-3,
    #particleLayer-color-tint-0, #particleLayer-color-tint-1,
    #particleLayer-color-tint-2, #particleLayer-color-tint-3`)
  const sliders = $(`
    #particleLayer-color-tint-0-slider, #particleLayer-color-tint-1-slider,
    #particleLayer-color-tint-2-slider, #particleLayer-color-tint-3-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Particle))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
}

// 创建粒子图层
ParticleLayer.create = function () {
  return {
    name: 'Layer',
    hidden: false,
    locked: false,
    area: {
      type: 'point',
    },
    maximum: 20,
    count: 0,
    delay: 0,
    interval: 40,
    lifetime: 1000,
    lifetimeDev: 0,
    fadeout: 200,
    anchor: {
      x: [0.5, 0.5],
      y: [0.5, 0.5],
    },
    movement: {
      angle: [0, 0],
      speed: [0, 0],
      accelAngle: [0, 0],
      accel: [0, 0],
    },
    rotation: {
      angle: [0, 0],
      speed: [0, 0],
      accel: [0, 0],
    },
    scale: {
      factor: [1, 1],
      speed: [0, 0],
      accel: [0, 0],
    },
    image: '',
    blend: 'normal',
    sort: 'youngest-in-front',
    hframes: 1,
    vframes: 1,
    color: {
      mode: 'texture',
      tint: [0, 0, 0, 0],
    },
  }
}

// 打开数据
ParticleLayer.open = function (layer) {
  if (this.target !== layer) {
    this.target = layer

    // 创建过渡方式选项
    $('#particleLayer-color-easingId').loadItems(
      Data.createEasingItems()
    )

    // 写入数据
    const write = getElementWriter('particleLayer', layer)
    const {area, color} = layer
    const {rgba, min, max, easingId, startMin, startMax, endMin, endMax, tint} = color
    write('name')
    write('area-type')
    write('area-width', area.width ?? 64)
    write('area-height', area.height ?? 64)
    write('area-radius', area.radius ?? 32)
    write('maximum')
    write('count')
    write('delay')
    write('interval')
    write('lifetime')
    write('lifetimeDev')
    write('fadeout')
    write('anchor-x-0')
    write('anchor-x-1')
    write('anchor-y-0')
    write('anchor-y-1')
    write('movement-angle-0')
    write('movement-angle-1')
    write('movement-speed-0')
    write('movement-speed-1')
    write('movement-accelAngle-0')
    write('movement-accelAngle-1')
    write('movement-accel-0')
    write('movement-accel-1')
    write('rotation-angle-0')
    write('rotation-angle-1')
    write('rotation-speed-0')
    write('rotation-speed-1')
    write('rotation-accel-0')
    write('rotation-accel-1')
    write('scale-factor-0')
    write('scale-factor-1')
    write('scale-speed-0')
    write('scale-speed-1')
    write('scale-accel-0')
    write('scale-accel-1')
    write('image')
    write('blend')
    write('sort')
    write('hframes')
    write('vframes')
    write('color-mode')
    write('color-rgba-0', rgba?.[0] ?? 255)
    write('color-rgba-1', rgba?.[1] ?? 255)
    write('color-rgba-2', rgba?.[2] ?? 255)
    write('color-rgba-3', rgba?.[3] ?? 255)
    write('color-min-0', min?.[0] ?? 0)
    write('color-min-1', min?.[1] ?? 0)
    write('color-min-2', min?.[2] ?? 0)
    write('color-min-3', min?.[3] ?? 255)
    write('color-max-0', max?.[0] ?? 255)
    write('color-max-1', max?.[1] ?? 255)
    write('color-max-2', max?.[2] ?? 255)
    write('color-max-3', max?.[3] ?? 255)
    write('color-easingId', easingId ?? Data.easings[0].id)
    write('color-startMin-0', startMin?.[0] ?? 0)
    write('color-startMin-1', startMin?.[1] ?? 0)
    write('color-startMin-2', startMin?.[2] ?? 0)
    write('color-startMin-3', startMin?.[3] ?? 255)
    write('color-startMax-0', startMax?.[0] ?? 255)
    write('color-startMax-1', startMax?.[1] ?? 255)
    write('color-startMax-2', startMax?.[2] ?? 255)
    write('color-startMax-3', startMax?.[3] ?? 255)
    write('color-endMin-0', endMin?.[0] ?? 0)
    write('color-endMin-1', endMin?.[1] ?? 0)
    write('color-endMin-2', endMin?.[2] ?? 0)
    write('color-endMin-3', endMin?.[3] ?? 255)
    write('color-endMax-0', endMax?.[0] ?? 255)
    write('color-endMax-1', endMax?.[1] ?? 255)
    write('color-endMax-2', endMax?.[2] ?? 255)
    write('color-endMax-3', endMax?.[3] ?? 255)
    write('color-tint-0', tint?.[0] ?? 0)
    write('color-tint-1', tint?.[1] ?? 0)
    write('color-tint-2', tint?.[2] ?? 0)
    write('color-tint-3', tint?.[3] ?? 0)
  }
}

// 关闭数据
ParticleLayer.close = function () {
  if (this.target) {
    Particle.list.unselect(this.target)
    Particle.updateTarget()
    this.target = null
  }
}

// 更新数据
ParticleLayer.update = function (layer, key, value) {
  const layerInstance = Particle.emitter.getLayer(layer)
  Particle.planToSave()
  switch (key) {
    case 'name':
      if (layer.name !== value) {
        layer.name = value
        Particle.updateParticleInfo()
        Particle.list.updateItemName(layer)
      }
      break
    case 'area-type': {
      const {area} = layer
      if (area.type !== value) {
        area.type = value
        delete area.width
        delete area.height
        delete area.radius
        const read = getElementReader('particleLayer-area')
        switch (value) {
          case 'point':
          case 'edge':
            break
          case 'rectangle':
            area.width = read('width')
            area.height = read('height')
            break
          case 'circle':
            area.radius = read('radius')
            break
        }
        layerInstance.updateElementMethods()
        Particle.computeOuterRect()
      }
      break
    }
    case 'area-width':
    case 'area-height':
    case 'area-radius': {
      const {area} = layer
      const index = key.indexOf('-') + 1
      const property = key.slice(index)
      if (area[property] !== value) {
        area[property] = value
        Particle.computeOuterRect()
      }
      break
    }
    case 'maximum':
      if (layer.maximum !== value) {
        layer.maximum = value
        layerInstance.setMaximum(value)
      }
      break
    case 'count':
      if (layer.count !== value) {
        layer.count = value
        layerInstance.updateCount()
        layerInstance.clear()
      }
      break
    case 'delay':
      if (layer.delay !== value) {
        layer.delay = value
        layerInstance.clear()
      }
      break
    case 'interval':
      if (layer.interval !== value) {
        layer.interval = value
        if (layerInstance.elapsed >= value) {
          layerInstance.elapsed = 0
        }
        if (value === 0) {
          layerInstance.clear()
        }
      }
      break
    case 'lifetime':
    case 'lifetimeDev':
      if (layer[key] !== value) {
        layer[key] = value
        layerInstance.clear()
      }
      break
    case 'fadeout':
      if (layer.fadeout !== value) {
        layer.fadeout = value
      }
      break
    case 'image':
      if (layer.image !== value) {
        layer.image = value
        layerInstance.loadTexture()
        Particle.list.updateIcon(layer)
      }
      break
    case 'blend':
    case 'sort':
      if (layer[key] !== value) {
        layer[key] = value
      }
      break
    case 'hframes':
    case 'vframes':
      if (layer[key] !== value) {
        layer[key] = value
        layerInstance.calculateElementSize()
        layerInstance.resizeElementIndices()
        Particle.list.updateIcon(layer)
      }
      break
    case 'color-mode': {
      const {color} = layer
      if (color.mode !== value) {
        color.mode = value
        delete color.rgba
        delete color.min
        delete color.max
        delete color.easingId
        delete color.startMin
        delete color.startMax
        delete color.endMin
        delete color.endMax
        delete color.tint
        const read = getElementReader('particleLayer-color')
        switch (value) {
          case 'fixed':
            color.rgba = [read('rgba-0'), read('rgba-1'), read('rgba-2'), read('rgba-3')]
            break
          case 'random':
            color.min = [read('min-0'), read('min-1'), read('min-2'), read('min-3')]
            color.max = [read('max-0'), read('max-1'), read('max-2'), read('max-3')]
            break
          case 'easing':
            color.easingId = read('easingId')
            color.startMin = [read('startMin-0'), read('startMin-1'), read('startMin-2'), read('startMin-3')]
            color.startMax = [read('startMax-0'), read('startMax-1'), read('startMax-2'), read('startMax-3')]
            color.endMin = [read('endMin-0'), read('endMin-1'), read('endMin-2'), read('endMin-3')]
            color.endMax = [read('endMax-0'), read('endMax-1'), read('endMax-2'), read('endMax-3')]
            layerInstance.updateEasing()
            break
          case 'texture':
            color.tint = [read('tint-0'), read('tint-1'), read('tint-2'), read('tint-3')]
            break
        }
        layerInstance.updateElementMethods()
      }
      break
    }
    case 'color-easingId': {
      const {color} = layer
      if (color.easingId !== value) {
        color.easingId = value
        layerInstance.updateEasing()
      }
      break
    }
    case 'anchor-x-0':
    case 'anchor-x-1':
    case 'anchor-y-0':
    case 'anchor-y-1':
    case 'movement-angle-0':
    case 'movement-angle-1':
    case 'movement-speed-0':
    case 'movement-speed-1':
    case 'movement-accelAngle-0':
    case 'movement-accelAngle-1':
    case 'movement-accel-0':
    case 'movement-accel-1':
    case 'rotation-angle-0':
    case 'rotation-angle-1':
    case 'rotation-speed-0':
    case 'rotation-speed-1':
    case 'rotation-accel-0':
    case 'rotation-accel-1':
    case 'scale-factor-0':
    case 'scale-factor-1':
    case 'scale-speed-0':
    case 'scale-speed-1':
    case 'scale-accel-0':
    case 'scale-accel-1':
    case 'color-rgba-0':
    case 'color-rgba-1':
    case 'color-rgba-2':
    case 'color-rgba-3':
    case 'color-min-0':
    case 'color-min-1':
    case 'color-min-2':
    case 'color-min-3':
    case 'color-max-0':
    case 'color-max-1':
    case 'color-max-2':
    case 'color-max-3':
    case 'color-startMin-0':
    case 'color-startMin-1':
    case 'color-startMin-2':
    case 'color-startMin-3':
    case 'color-startMax-0':
    case 'color-startMax-1':
    case 'color-startMax-2':
    case 'color-startMax-3':
    case 'color-endMin-0':
    case 'color-endMin-1':
    case 'color-endMin-2':
    case 'color-endMin-3':
    case 'color-endMax-0':
    case 'color-endMax-1':
    case 'color-endMax-2':
    case 'color-endMax-3':
    case 'color-tint-0':
    case 'color-tint-1':
    case 'color-tint-2':
    case 'color-tint-3': {
      const keys = key.split('-')
      const last = keys.length - 1
      let node = layer
      for (let i = 0; i < last; i++) {
        node = node[keys[i]]
      }
      const property = keys[last]
      if (node[property] !== value) {
        node[property] = value
      }
      break
    }
  }
  Particle.requestRendering()
}

// 参数 - 输入事件
ParticleLayer.paramInput = function (event) {
  ParticleLayer.update(
    ParticleLayer.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.particleLayer = ParticleLayer}
