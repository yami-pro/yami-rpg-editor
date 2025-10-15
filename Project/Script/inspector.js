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
  uiButton: null,
  uiAnimation: null,
  uiVideo: null,
  uiWindow: null,
  uiContainer: null,
  uiReference: null,
  animMotion: null,
  animJointLayer: null,
  animJointFrame: null,
  animSpriteLayer: null,
  animSpriteFrame: null,
  animParticleLayer: null,
  animParticleFrame: null,
  animSoundLayer: null,
  animSoundFrame: null,
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
    const {target, motion, direction} = data
    History.processors['inspector-change'](operation, data)
    Animation.setMotion(motion)
    Animation.setDirection(direction)
    Animation.openLayer(target)
  }
  History.processors['inspector-frame-change'] = (operation, data) => {
    const {target, motion, direction} = data
    History.processors['inspector-change'](operation, data)
    Animation.setMotion(motion)
    Animation.setDirection(direction)
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
  this.uiButton.initialize()
  this.uiAnimation.initialize()
  this.uiVideo.initialize()
  this.uiWindow.initialize()
  this.uiReference.initialize()
  this.animMotion.initialize()
  this.animJointFrame.initialize()
  this.animSpriteLayer.initialize()
  this.animSpriteFrame.initialize()
  this.animParticleLayer.initialize()
  this.animParticleFrame.initialize()
  this.animSoundLayer.initialize()
  this.animSoundFrame.initialize()
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
  $('#fileScene-ambient-red-slider').synchronize($('#fileScene-ambient-red'))
  $('#fileScene-ambient-green-slider').synchronize($('#fileScene-ambient-green'))
  $('#fileScene-ambient-blue-slider').synchronize($('#fileScene-ambient-blue'))
  $('#fileScene-ambient-direct-slider').synchronize($('#fileScene-ambient-direct'))

  // 绑定事件列表
  $('#fileScene-events').bind(new EventListInterface(this, this.owner))

  // 绑定脚本列表
  $('#fileScene-scripts').bind(new ScriptListInterface(this, this.owner))

  // 绑定脚本参数面板
  $('#fileScene-parameter-pane').bind($('#fileScene-scripts'))

  // 侦听事件
  const elements = $(`#fileScene-tileWidth, #fileScene-tileHeight,
    #fileScene-ambient-red, #fileScene-ambient-green, #fileScene-ambient-blue, #fileScene-ambient-direct`)
  const sliders = $(`#fileScene-ambient-red-slider, #fileScene-ambient-green-slider,
    #fileScene-ambient-blue-slider, #fileScene-ambient-direct-slider`)
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
    ambient: {red: 255, green: 255, blue: 255, direct: 0},
    terrains: '',
    events: [],
    scripts: [],
    objects: objects,
  }, {
    terrainArray: {
      writable: true,
      value: Scene.createTerrains(WIDTH, HEIGHT),
    },
    terrainChanged: {
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
    const write = getElementWriter('fileScene', Scene)
    write('width')
    write('height')
    write('tileWidth')
    write('tileHeight')
    write('ambient-red')
    write('ambient-green')
    write('ambient-blue')
    write('ambient-direct')
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
FileScene.update = function (_, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'width':
      if (Scene.width !== value) {
        Scene.setSize(value, Scene.height)
      }
      break
    case 'height':
      if (Scene.height !== value) {
        Scene.setSize(Scene.width, value)
      }
      break
    case 'tileWidth':
      if (Scene.tileWidth !== value) {
        Scene.setTileSize(value, Scene.tileHeight)
      }
      break
    case 'tileHeight':
      if (Scene.tileHeight !== value) {
        Scene.setTileSize(Scene.tileWidth, value)
      }
      break
    case 'ambient-red':
    case 'ambient-green':
    case 'ambient-blue':
    case 'ambient-direct': {
      const index = key.indexOf('-') + 1
      const color = key.slice(index)
      if (Scene.ambient[color] !== value) {
        Scene.ambient[color] = value
        Scene.requestRendering()
        GL.setAmbientLight(Scene.ambient)
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
    width: resolution.width,
    height: resolution.height,
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
    const fileName = Command.removeTextTags(Command.parseFileName(image))
    return [name, `${fileName} [${hframes}x${vframes}]`]
  },
  createExclusionMap: function () {
    const exclusions = {}
    for (const sprite of this.list.data) {
      exclusions[sprite.id] = true
    }
    return exclusions
  },
  createSpriteId: function (exclusions = this.createExclusionMap()) {
    let id
    do {id = GUID.generate64bit()}
    while (exclusions[id])
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
    const exclusions = this.createExclusionMap()
    for (const sprite of copies) {
      if (sprite.id in exclusions) {
        const id = this.createSpriteId(exclusions)
        sprite.id = id
      }
      exclusions[sprite.id] = true
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
        terrains: [0],
        tags: [0],
      }
    case 'auto':
      return {
        type: 'auto',
        width: 1,
        height: 1,
        tileWidth: 32,
        tileHeight: 32,
        globalOffsetX: 0,
        globalOffsetY: 0,
        globalPriority: 0,
        tiles: [0],
        priorities: [0],
        terrains: [0],
        tags: [0],
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
  inventory: null,
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
  // 创建动画旋转选项
  $('#fileActor-rotatable').loadItems([
    {name: 'Yes', value: true},
    {name: 'No', value: false},
  ])

  // 创建通行选项
  $('#fileActor-passage').loadItems([
    {name: 'Land', value: 'land'},
    {name: 'Water', value: 'water'},
    {name: 'Unrestricted', value: 'unrestricted'},
  ])

  // 创建碰撞形状选项
  $('#fileActor-shape').loadItems([
    {name: 'Square', value: 'square'},
    {name: 'Circle', value: 'circle'},
  ])

  // 创建不可推动选项
  $('#fileActor-immovable').loadItems([
    {name: 'Yes', value: true},
    {name: 'No', value: false},
  ])

  // 绑定属性列表
  $('#fileActor-attributes').bind(new AttributeListInterface())

  // 绑定精灵图列表
  $('#fileActor-sprites').bind(this.sprites)

  // 绑定技能列表
  $('#fileActor-skills').bind(this.skills)

  // 绑定装备列表
  $('#fileActor-equipments').bind(this.equipments)

  // 绑定库存列表
  $('#fileActor-inventory').bind(this.inventory)

  // 绑定事件列表
  $('#fileActor-events').bind(new EventListInterface(this))

  // 绑定脚本列表
  $('#fileActor-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileActor-parameter-pane').bind($('#fileActor-scripts'))

  // 侦听事件
  $('#fileActor-animationId').on('write', this.animationIdWrite)
  $(`#fileActor-portrait, #fileActor-clip, #fileActor-animationId, #fileActor-idleMotion,
    #fileActor-moveMotion, #fileActor-rotatable, #fileActor-passage, #fileActor-speed,
    #fileActor-shape, #fileActor-size, #fileActor-weight, #fileActor-immovable, #fileActor-scale,
    #fileActor-priority, #fileActor-inherit`).on('input', this.paramInput)
  $(`#fileActor-sprites, #fileActor-attributes, #fileActor-skills, #fileActor-equipments,
    #fileActor-inventory, #fileActor-events, #fileActor-scripts
  `).on('change', this.listChange)
}

// 创建角色
FileActor.create = function () {
  return {
    portrait: '',
    clip: [0, 0, 64, 64],
    animationId: '',
    idleMotion: '',
    moveMotion: '',
    rotatable: false,
    passage: 'land',
    speed: 4,
    shape: 'circle',
    size: 0.8,
    weight: 1,
    immovable: true,
    scale: 1,
    priority: 0,
    inherit: '',
    sprites: [],
    attributes: [],
    skills: [],
    equipments: [],
    inventory: [],
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
    write('clip')
    write('animationId')
    write('idleMotion')
    write('moveMotion')
    write('sprites')
    write('rotatable')
    write('passage')
    write('speed')
    write('shape')
    write('size')
    write('weight')
    write('immovable')
    write('scale')
    write('priority')
    write('inherit')
    write('attributes')
    write('skills')
    write('equipments')
    write('inventory')
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
    $('#fileActor-inventory').clear()
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
    case 'clip':
      if (actor[key] !== value) {
        actor[key] = value
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
              player.setMotion(value)
            }
          }
          Scene.requestRendering()
        }
      }
      break
    case 'rotatable':
      if (actor.rotatable !== value) {
        actor.rotatable = value
        if (Scene.actors instanceof Array) {
          for (const node of Scene.actors) {
            if (node.data === actor) {
              const {player} = node
              player.rotatable = value
              player.rotation = 0
              player.setAngle(player.angle)
            }
          }
          Scene.requestRendering()
        }
      }
      break
    case 'passage':
    case 'moveMotion':
    case 'speed':
    case 'shape':
    case 'size':
    case 'weight':
    case 'immovable':
    case 'inherit':
      if (actor[key] !== value) {
        actor[key] = value
      }
      break
    case 'scale':
      if (actor.scale !== value) {
        actor.scale = value
        if (Scene.actors instanceof Array) {
          for (const node of Scene.actors) {
            if (node.data === actor) {
              node.player.setScale(value * node.scale)
            }
          }
          Scene.requestRendering()
        }
      }
      break
    case 'priority':
      if (actor.priority !== value) {
        actor.priority = value
        if (Scene.actors instanceof Array) {
          Scene.requestRendering()
        }
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
      {content: Command.removeTextTags(fileName), class: fileClass},
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
      {content: Command.removeTextTags(skillName), class: skillClass},
      {content: Command.removeTextTags(shortcutKey), class: shortcutClass},
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
      {content: Command.removeTextTags(equipmentName), class: equipmentClass},
      {content: Command.removeTextTags(shortcutKey), class: shortcutClass},
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

// 库存列表接口
FileActor.inventory = {
  initialize: function (list) {
    $('#fileActor-inventory-confirm').on('click', () => list.save())

    // 创建库存货物类型选项
    $('#fileActor-inventory-type').loadItems([
      {name: 'Item', value: 'item'},
      {name: 'Equipment', value: 'equipment'},
      {name: 'Money', value: 'money'},
    ])

    // 设置库存货物类型关联元素
    $('#fileActor-inventory-type').enableHiddenMode().relate([
      {case: 'item', targets: [
        $('#fileActor-inventory-item-id'),
        $('#fileActor-inventory-item-quantity'),
      ]},
      {case: 'equipment', targets: [
        $('#fileActor-inventory-equipment-id'),
      ]},
      {case: 'money', targets: [
        $('#fileActor-inventory-money'),
      ]},
    ])
  },
  parse: function ({type, id, quantity, money}) {
    switch (type) {
      case 'item': {
        Command.invalid = false
        const goodsName = Command.parseFileName(id)
        const goodsClass = Command.invalid ? 'invalid' : ''
        return [
          {content: Command.removeTextTags(goodsName), class: goodsClass},
          {content: quantity.toString(), class: 'weak'},
        ]
      }
      case 'equipment': {
        Command.invalid = false
        const goodsName = Command.parseFileName(id)
        const goodsClass = Command.invalid ? 'invalid' : ''
        return [
          {content: Command.removeTextTags(goodsName), class: goodsClass},
          {content: '1', class: 'weak'},
        ]
      }
      case 'money':
        return [
          {content: Local.get('common.money')},
          {content: money.toString(), class: 'weak'},
        ]
    }
  },
  open: function ({type = 'item', id = '', quantity = 1, money = 1} = {}) {
    Window.open('fileActor-inventory-goods')
    const write = getElementWriter('fileActor-inventory')
    const itemId = type === 'item' ? id : ''
    const equipmentId = type === 'equipment' ? id : ''
    write('type', type)
    write('item-id', itemId)
    write('item-quantity', quantity)
    write('equipment-id', equipmentId)
    write('money', money)
    $('#fileActor-inventory-type').getFocus()
  },
  save: function () {
    const read = getElementReader('fileActor-inventory')
    const type = read('type')
    let goods
    switch (type) {
      case 'item':
        goods = {type: 'item', id: read('item-id'), quantity: read('item-quantity')}
        if (!goods.id) return $('#fileActor-inventory-item-id').getFocus()
        break
      case 'equipment':
        goods = {type: 'equipment', id: read('equipment-id')}
        if (!goods.id) return $('#fileActor-inventory-equipment-id').getFocus()
        break
      case 'money':
        goods = {type: 'money', money: read('money')}
        break
    }
    Window.close('fileActor-inventory-goods')
    return goods
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
  $('#fileSkill-events').bind(new EventListInterface(this))

  // 绑定脚本列表
  $('#fileSkill-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileSkill-parameter-pane').bind($('#fileSkill-scripts'))

  // 侦听事件
  $('#fileSkill-icon, #fileSkill-clip, #fileSkill-inherit').on('input', this.paramInput)
  $('#fileSkill-attributes, #fileSkill-events, #fileSkill-scripts').on('change', this.listChange)
}

// 创建技能
FileSkill.create = function () {
  return {
    icon: '',
    clip: [0, 0, 32, 32],
    inherit: '',
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
    write('inherit')
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
    case 'inherit':
      if (skill[key] !== value) {
        skill[key] = value
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
    {name: 'Penetrate', value: 'penetrate'},
    {name: 'Destroy', value: 'destroy'},
  ])

  // 创建角色碰撞选项
  $('#fileTrigger-onHitActors').loadItems([
    {name: 'Penetrate', value: 'penetrate'},
    {name: 'Destroy', value: 'destroy'},
    {name: 'Destroy After Multiple Hits', value: 'penetrate-destroy'}
  ])

  // 设置角色碰撞关联元素
  $('#fileTrigger-onHitActors').enableHiddenMode().relate([
    {case: 'penetrate-destroy', targets: [
      $('#fileTrigger-hitCount'),
    ]},
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
      $('#fileTrigger-shape-anchor'),
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

  // 绑定事件列表
  $('#fileTrigger-events').bind(new EventListInterface(this))

  // 绑定脚本列表
  $('#fileTrigger-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileTrigger-parameter-pane').bind($('#fileTrigger-scripts'))

  // 侦听事件
  $('#fileTrigger-animationId').on('write', this.animationIdWrite)
  $(`#fileTrigger-selector, #fileTrigger-onHitWalls, #fileTrigger-onHitActors, #fileTrigger-hitCount,
    #fileTrigger-shape-type, #fileTrigger-shape-width, #fileTrigger-shape-height,
    #fileTrigger-shape-anchor, #fileTrigger-shape-radius, #fileTrigger-shape-centralAngle,
    #fileTrigger-speed, #fileTrigger-hitMode, #fileTrigger-hitInterval,
    #fileTrigger-initialDelay, #fileTrigger-effectiveTime, #fileTrigger-duration,
    #fileTrigger-inherit, #fileTrigger-animationId, #fileTrigger-motion,
    #fileTrigger-priority, #fileTrigger-offsetY, #fileTrigger-rotatable
  `).on('input', this.paramInput)
  $('#fileTrigger-events, #fileTrigger-scripts').on('change', this.listChange)
}

// 创建技能
FileTrigger.create = function () {
  return {
    selector: 'enemy',
    onHitWalls: 'penetrate',
    onHitActors: 'penetrate',
    hitCount: 2,
    shape: {
      type: 'circle',
      radius: 0.5,
    },
    speed: 0,
    hitMode: 'once',
    hitInterval: 0,
    initialDelay: 0,
    effectiveTime: 0,
    duration: 0,
    inherit: '',
    animationId: '',
    motion: '',
    priority: 0,
    offsetY: 0,
    rotatable: true,
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
    write('hitCount')
    write('shape-type')
    write('shape-width', shape.width ?? 1)
    write('shape-height', shape.height ?? 1)
    write('shape-anchor', shape.anchor ?? 0.5)
    write('shape-radius', shape.radius ?? 0.5)
    write('shape-centralAngle', shape.centralAngle ?? 90)
    write('speed')
    write('hitMode')
    write('hitInterval')
    write('initialDelay')
    write('effectiveTime')
    write('duration')
    write('inherit')
    write('animationId')
    write('motion')
    write('priority')
    write('offsetY')
    write('rotatable')
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
    case 'hitCount':
    case 'speed':
    case 'hitMode':
    case 'hitInterval':
    case 'initialDelay':
    case 'effectiveTime':
    case 'duration':
    case 'inherit':
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
              anchor: read('anchor'),
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
    case 'shape-anchor':
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
  elMotion.write(elMotion.read())
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
  $('#fileItem-events').bind(new EventListInterface(this))

  // 绑定脚本列表
  $('#fileItem-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileItem-parameter-pane').bind($('#fileItem-scripts'))

  // 侦听事件
  $('#fileItem-icon, #fileItem-clip, #fileItem-inherit').on('input', this.paramInput)
  $('#fileItem-attributes, #fileItem-events, #fileItem-scripts').on('change', this.listChange)
}

// 创建物品
FileItem.create = function () {
  return {
    icon: '',
    clip: [0, 0, 32, 32],
    inherit: '',
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
    write('inherit')
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
    case 'inherit':
      if (item[key] !== value) {
        item[key] = value
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
  $('#fileEquipment-events').bind(new EventListInterface(this))

  // 绑定脚本列表
  $('#fileEquipment-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileEquipment-parameter-pane').bind($('#fileEquipment-scripts'))

  // 侦听事件
  $('#fileEquipment-icon, #fileEquipment-clip, #fileEquipment-inherit').on('input', this.paramInput)
  $('#fileEquipment-attributes, #fileEquipment-events, #fileEquipment-scripts').on('change', this.listChange)
}

// 创建装备
FileEquipment.create = function () {
  return {
    icon: '',
    clip: [0, 0, 32, 32],
    inherit: '',
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
    write('inherit')
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
    case 'inherit':
      if (equipment[key] !== value) {
        equipment[key] = value
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
  $('#fileState-events').bind(new EventListInterface(this))

  // 绑定脚本列表
  $('#fileState-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileState-parameter-pane').bind($('#fileState-scripts'))

  // 侦听事件
  $('#fileState-icon, #fileState-clip, #fileState-inherit').on('input', this.paramInput)
  $('#fileState-attributes, #fileState-events, #fileState-scripts').on('change', this.listChange)
}

// 创建状态
FileState.create = function () {
  return {
    icon: '',
    clip: [0, 0, 32, 32],
    inherit: '',
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
    write('inherit')
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
    case 'inherit':
      if (state[key] !== value) {
        state[key] = value
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
  parameters: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  paramInput: null,
  typeWrite: null,
  listChange: null,
}

// 初始化
FileEvent.initialize = function () {
  // 创建类型选项
  $('#fileEvent-type').loadItems(EventEditor.types.global)
  EventEditor.types.relatedElements.push($('#fileEvent-type'))

  // 创建返回类型选项
  $('#fileEvent-returnType').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Boolean', value: 'boolean'},
    {name: 'Number', value: 'number'},
    {name: 'String', value: 'string'},
    {name: 'Object', value: 'object'},
    {name: 'Actor', value: 'actor'},
    {name: 'Skill', value: 'skill'},
    {name: 'State', value: 'state'},
    {name: 'Equipment', value: 'equipment'},
    {name: 'Item', value: 'item'},
    {name: 'Trigger', value: 'trigger'},
    {name: 'Light', value: 'light'},
    {name: 'Element', value: 'element'},
  ])

  // 绑定参数列表
  $('#fileEvent-parameters').bind(this.parameters)

  // 侦听事件
  $(`#fileEvent-type, #fileEvent-enabled, #fileEvent-priority, #fileEvent-namespace, #fileEvent-returnType, #fileEvent-description`).on('input', this.paramInput)
  $('#fileEvent-type').on('write', this.typeWrite)
  $('#fileEvent-parameters').on('change', this.listChange)
}

// 创建事件
FileEvent.create = function (filter) {
  const type = EventEditor.types[filter][0].value
  switch (filter) {
    case 'global':
      return {
        type: type,
        enabled: true,
        priority: false,
        namespace: true,
        returnType: 'none',
        description: '',
        parameters: [],
        commands: [],
      }
    default:
      return {
        type: type,
        enabled: true,
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
    const write = getElementWriter('fileEvent', event)
    write('type')
    write('enabled')
    write('priority')
    write('namespace')
    write('returnType')
    write('description')
    write('parameters')
  }
}

// 关闭数据
FileEvent.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    $('#fileEvent-parameters').clear()
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
    case 'priority':
    case 'namespace':
    case 'returnType':
    case 'description':
      if (event[key] !== value) {
        event[key] = value
      }
      break
    case 'enabled':
      if (event.enabled !== value) {
        event.enabled = value
        Browser.body.updateIcon(this.meta.file)
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

// 类型 - 写入事件
FileEvent.typeWrite = function (event) {
  const enabledInput = $('#fileEvent-enabled')
  const enabledLabel = enabledInput.previousElementSibling
  const priorityInput = $('#fileEvent-priority')
  const priorityLabel = priorityInput.previousElementSibling
  switch (event.value) {
    case 'common':
      enabledLabel.hide()
      enabledInput.hide()
      break
    default:
      enabledLabel.show()
      enabledInput.show()
      break
  }
  switch (event.value) {
    case 'input':
    case 'keydown':
    case 'keyup':
    case 'mousedown':
    case 'mouseup':
    case 'mousemove':
    case 'doubleclick':
    case 'wheel':
    case 'touchstart':
    case 'touchmove':
    case 'touchend':
    case 'gamepadbuttonpress':
    case 'gamepadbuttonrelease':
    case 'gamepadleftstickchange':
    case 'gamepadrightstickchange':
      priorityLabel.show()
      priorityInput.show()
      break
    default:
      priorityLabel.hide()
      priorityInput.hide()
      break
  }
}

// 列表 - 改变事件
FileEvent.listChange = function (event) {
  File.planToSave(FileEvent.meta)
}

// 事件参数列表接口
FileEvent.parameters = {
  initialize: function (list) {
    $('#fileEvent-parameter-confirm').on('click', () => list.save())

    // 加载类型选项
    $('#fileEvent-parameter-type').loadItems([
      {name: 'Boolean', value: 'boolean'},
      {name: 'Number', value: 'number'},
      {name: 'String', value: 'string'},
      {name: 'Object', value: 'object'},
      {name: 'Actor', value: 'actor'},
      {name: 'Skill', value: 'skill'},
      {name: 'State', value: 'state'},
      {name: 'Equipment', value: 'equipment'},
      {name: 'Item', value: 'item'},
      {name: 'Trigger', value: 'trigger'},
      {name: 'Light', value: 'light'},
      {name: 'Element', value: 'element'},
    ])
  },
  parse: function ({type, key, note}) {
    return [
      {content: key},
      {content: Local.get('eventParameterTypes.' + type)},
    ]
  },
  open: function ({type = 'number', key = '', note = ''} = {}) {
    Window.open('fileEvent-parameter')
    const write = getElementWriter('fileEvent-parameter')
    write('type', type)
    write('key', key)
    write('note', note)
    $('#fileEvent-parameter-type').getFocus()
  },
  save: function () {
    const read = getElementReader('fileEvent-parameter')
    const type = read('type')
    const key = read('key').trim()
    if (!key) {
      return $('#fileEvent-parameter-key').getFocus()
    }
    const note = read('note').trim()
    Window.close('fileEvent-parameter')
    return {type, key, note}
  },
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
  onStart() {}
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
  typeWrite: null,
}

// 初始化
SceneActor.initialize = function () {
  // 创建类型选项
  $('#sceneActor-type').loadItems([
    {name: 'Local Actor', value: 'local'},
    {name: 'Global Actor', value: 'global'},
  ])

  // 绑定条件列表
  $('#sceneActor-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneActor-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneActor-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneActor-parameter-pane').bind($('#sceneActor-scripts'))

  // 同步滑动框和数字框的数值
  $('#sceneActor-angle-slider').synchronize($('#sceneActor-angle'))
  $('#sceneActor-scale-slider').synchronize($('#sceneActor-scale'))

  // 侦听事件
  window.on('datachange', this.datachange)
  const elements = $(`#sceneActor-name, #sceneActor-type, #sceneActor-actorId, #sceneActor-teamId,
    #sceneActor-x, #sceneActor-y, #sceneActor-angle, #sceneActor-scale`)
  const sliders = $('#sceneActor-angle-slider, #sceneActor-scale-slider')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
  $('#sceneActor-type').on('write', this.typeWrite)
  $('#sceneActor-conditions, #sceneActor-events, #sceneActor-scripts').on('change', Scene.listChange)
}

// 创建角色
SceneActor.create = function () {
  return {
    class: 'actor',
    name: 'Actor',
    type: 'local',
    enabled: true,
    hidden: false,
    locked: false,
    presetId: '',
    actorId: '',
    teamId: Data.teams.list[0].id,
    x: 0,
    y: 0,
    angle: 0,
    scale: 1,
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
    write('type')
    write('actorId')
    write('teamId')
    write('x')
    write('y')
    write('angle')
    write('scale')
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
    case 'type':
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
          actor.player.setAngle(Math.radians(value))
        }
      }
      break
    case 'scale':
      if (actor.scale !== value) {
        actor.scale = value
        actor.player.setScale(value * (actor.data?.scale ?? 1))
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

// 类型 - 写入事件
SceneActor.typeWrite = function (event) {
  switch (event.value) {
    case 'local':
      $('#sceneActor-scripts-detail').show()
      $('#sceneActor-parameter-pane').show()
      break
    case 'global':
      $('#sceneActor-scripts-detail').hide()
      $('#sceneActor-parameter-pane').hide()
      break
  }
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
    enabled: true,
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
  $('#sceneLight-direct-slider').synchronize($('#sceneLight-direct'))

  // 侦听事件
  const elements = $(`
    #sceneLight-name, #sceneLight-type,
    #sceneLight-blend, #sceneLight-x, #sceneLight-y,
    #sceneLight-range, #sceneLight-intensity,
    #sceneLight-mask, #sceneLight-anchorX, #sceneLight-anchorY,
    #sceneLight-width, #sceneLight-height, #sceneLight-angle,
    #sceneLight-red, #sceneLight-green, #sceneLight-blue, #sceneLight-direct`)
  const sliders = $(`
    #sceneLight-range-slider, #sceneLight-intensity-slider,
    #sceneLight-anchorX-slider, #sceneLight-anchorY-slider,
    #sceneLight-width-slider, #sceneLight-height-slider, #sceneLight-angle-slider,
    #sceneLight-red-slider, #sceneLight-green-slider, #sceneLight-blue-slider, #sceneLight-direct-slider`)
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
    enabled: true,
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
    direct: 0.5,
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
    write('direct')
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
    case 'direct':
      if (light[key] !== value) {
        light[key] = value
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
  // 创建动画旋转选项
  $('#sceneAnimation-rotatable').loadItems([
    {name: 'Yes', value: true},
    {name: 'No', value: false},
  ])

  // 绑定条件列表
  $('#sceneAnimation-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneAnimation-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneAnimation-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneAnimation-parameter-pane').bind($('#sceneAnimation-scripts'))

  // 同步滑动框和数字框的数值
  $('#sceneAnimation-angle-slider').synchronize($('#sceneAnimation-angle'))
  $('#sceneAnimation-scale-slider').synchronize($('#sceneAnimation-scale'))
  $('#sceneAnimation-speed-slider').synchronize($('#sceneAnimation-speed'))
  $('#sceneAnimation-opacity-slider').synchronize($('#sceneAnimation-opacity'))
  $('#sceneAnimation-priority-slider').synchronize($('#sceneAnimation-priority'))

  // 侦听事件
  $('#sceneAnimation-animationId').on('write', this.animationIdWrite)
  const elements = $(`#sceneAnimation-name, #sceneAnimation-animationId,
    #sceneAnimation-motion, #sceneAnimation-rotatable, #sceneAnimation-x, #sceneAnimation-y,
    #sceneAnimation-angle, #sceneAnimation-scale, #sceneAnimation-speed,
    #sceneAnimation-opacity, #sceneAnimation-priority`)
  const sliders = $(`#sceneAnimation-angle-slider,
    #sceneAnimation-scale-slider, #sceneAnimation-speed-slider,
    #sceneAnimation-opacity-slider, #sceneAnimation-priority-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
  $('#sceneAnimation-conditions, #sceneAnimation-events, #sceneAnimation-scripts').on('change', Scene.listChange)
}

// 创建动画
SceneAnimation.create = function () {
  return {
    class: 'animation',
    name: 'Animation',
    enabled: true,
    hidden: false,
    locked: false,
    presetId: '',
    animationId: '',
    motion: '',
    rotatable: false,
    x: 0,
    y: 0,
    angle: 0,
    scale: 1,
    speed: 1,
    opacity: 1,
    priority: 0,
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
    write('rotatable')
    write('x')
    write('y')
    write('angle')
    write('scale')
    write('speed')
    write('opacity')
    write('priority')
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
  if (options.angle !== undefined) {
    $('#sceneAnimation-angle').write(options.angle)
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
        if (animation.player.setMotion(value)) {
          animation.player.restart()
        }
      }
      break
    case 'rotatable':
      if (animation.rotatable !== value) {
        animation.rotatable = value
        animation.player.rotatable = value
        animation.player.rotation = 0
        animation.player.setAngle(animation.player.angle)
      }
      break
    case 'x':
    case 'y':
    case 'priority':
      if (animation[key] !== value) {
        animation[key] = value
      }
      break
    case 'angle':
      if (animation.angle !== value) {
        animation.angle = value
        animation.player.setAngle(Math.radians(value))
      }
      break
    case 'scale':
      if (animation.scale !== value) {
        animation.scale = value
        animation.player.setScale(value)
      }
      break
    case 'speed':
      if (animation.speed !== value) {
        animation.speed = value
        animation.player.setSpeed(value)
      }
      break
    case 'opacity':
      if (animation.opacity !== value) {
        animation.opacity = value
        animation.player.setOpacity(value)
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

  // 同步滑动框和数字框的数值
  $('#sceneParticle-angle-slider').synchronize($('#sceneParticle-angle'))
  $('#sceneParticle-scale-slider').synchronize($('#sceneParticle-scale'))
  $('#sceneParticle-speed-slider').synchronize($('#sceneParticle-speed'))
  $('#sceneParticle-opacity-slider').synchronize($('#sceneParticle-opacity'))
  $('#sceneParticle-priority-slider').synchronize($('#sceneParticle-priority'))

  // 侦听事件
  const elements = $(`#sceneParticle-name, #sceneParticle-particleId,
    #sceneParticle-x, #sceneParticle-y, #sceneParticle-angle,
    #sceneParticle-scale, #sceneParticle-speed, #sceneParticle-opacity, #sceneParticle-priority`)
  const sliders = $(`#sceneParticle-angle-slider,
    #sceneParticle-scale-slider, #sceneParticle-speed-slider,
    #sceneParticle-opacity-slider, #sceneParticle-priority-slider`)
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, Scene))
    sliders.on('focus', Inspector.sliderFocus)
    sliders.on('blur', Inspector.sliderBlur)
  $('#sceneParticle-conditions, #sceneParticle-events, #sceneParticle-scripts').on('change', Scene.listChange)
}

// 创建粒子
SceneParticle.create = function () {
  return {
    class: 'particle',
    name: 'Particle',
    enabled: true,
    hidden: false,
    locked: false,
    presetId: '',
    particleId: '',
    x: 0,
    y: 0,
    angle: 0,
    scale: 1,
    speed: 1,
    opacity: 1,
    priority: 0,
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
    write('opacity')
    write('priority')
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
    case 'priority':
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
    case 'opacity':
      if (particle.opacity !== value) {
        particle.opacity = value
        if (particle.emitter) {
          particle.emitter.opacity = value
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
    enabled: true,
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
SceneTilemap.create = function (width = 4, height = 4) {
  const tiles = Scene.createTiles(width, height)
  return Codec.decodeTilemap({
    class: 'tilemap',
    name: 'Tilemap',
    enabled: true,
    hidden: false,
    locked: false,
    presetId: '',
    tilesetMap: {},
    shortcut: Scene.tilemaps.shortcuts.getEmptyIndex(),
    layer: 'background',
    order: 0,
    light: 'global',
    blend: 'normal',
    x: 0,
    y: 0,
    width: width,
    height: height,
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
  synchronous: false,
  nameBox: $('#uiElement-name'),
  pointerEvents: $('#uiElement-pointerEvents'),
  generalGroup: $('#uiElement-general-group'),
  transformGroup: $('#uiElement-transform-group'),
  eventsGroup: $('#uiElement-events-group'),
  scriptsGroup: $('#uiElement-scripts-group'),
  parameterPane: $('#uiElement-parameter-pane'),
  // methods
  initialize: null,
  createTransform: null,
  lockSizeInputs: null,
  unlockSizeInputs: null,
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
  this.pointerEvents.loadItems([
    {name: 'Enabled', value: 'enabled'},
    {name: 'Disabled', value: 'disabled'},
    {name: 'Skipped', value: 'skipped'},
  ])

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
  const otherElements = $(`#uiElement-name,
    #uiElement-pointerEvents, #uiElement-transform-anchorX, #uiElement-transform-anchorY,
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

// 锁定大小输入框
UIElement.lockSizeInputs = function () {
  if (!this.synchronous) {
    this.synchronous = true
    $(`#uiElement-transform-anchorX, #uiElement-transform-anchorY,
      #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
      #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
      #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`).disable()
  }
}

// 取消锁定大小输入框
UIElement.unlockSizeInputs = function () {
  if (this.synchronous) {
    this.synchronous = false
    $(`#uiElement-transform-anchorX, #uiElement-transform-anchorY,
      #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
      #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
      #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`).enable()
  }
}

// 打开数据
UIElement.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiElement', node)
    write('name')
    if (node.pointerEvents) {
      this.pointerEvents.show()
      this.pointerEvents.previousElementSibling.show()
      write('pointerEvents')
    } else {
      this.pointerEvents.hide()
      this.pointerEvents.previousElementSibling.hide()
    }
    // 锁定或解锁大小输入框
    if (node.class === 'reference' && node.synchronous) {
      this.lockSizeInputs()
    } else {
      this.unlockSizeInputs()
    }
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
  if (options.x2 !== undefined) {
    $('#uiElement-transform-x2').write(options.x2)
  }
  if (options.y !== undefined) {
    $('#uiElement-transform-y').write(options.y)
  }
  if (options.y2 !== undefined) {
    $('#uiElement-transform-y2').write(options.y2)
  }
  if (options.width !== undefined) {
    $('#uiElement-transform-width').write(options.width)
  }
  if (options.width2 !== undefined) {
    $('#uiElement-transform-width2').write(options.width2)
  }
  if (options.height !== undefined) {
    $('#uiElement-transform-height').write(options.height)
  }
  if (options.height2 !== undefined) {
    $('#uiElement-transform-height2').write(options.height2)
  }
  if (options.rotation !== undefined) {
    $('#uiElement-transform-rotation').write(options.rotation)
  }
  if (options.scaleX !== undefined) {
    $('#uiElement-transform-scaleX').write(options.scaleX)
  }
  if (options.scaleY !== undefined) {
    $('#uiElement-transform-scaleY').write(options.scaleY)
  }
  if (options.skewX !== undefined) {
    $('#uiElement-transform-skewX').write(options.skewX)
  }
  if (options.skewY !== undefined) {
    $('#uiElement-transform-skewY').write(options.skewY)
  }
  if (options.opacity !== undefined) {
    $('#uiElement-transform-opacity').write(options.opacity)
  }
}

// 更新数据
UIElement.update = function (node, key, value) {
  UI.planToSave()
  // const element = node.instance
  const transform = node.transform
  switch (key) {
    case 'name':
      if (node.name !== value) {
        node.name = value
        UI.list.updateItemName(node)
      }
      break
    case 'pointerEvents':
      if (node.pointerEvents !== value) {
        node.pointerEvents = value
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
        // transform[property] = value
        // element.resize()
        node.instances.set(key, value)
        node.instances.resize()
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
    case 'uiButton':
    case 'uiAnimation':
    case 'uiVideo':
    case 'uiWindow':
    case 'uiContainer':
    case 'uiReference': {
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
  const elements = node.instances
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
      // transform.anchorX = x
      elements.set('transform-anchorX', x)
      input.write(x)
    }
    if (transform.x !== 0) {
      const input = $('#uiElement-transform-x')
      changes.push({
        input: input,
        oldValue: transform.x,
        newValue: 0,
      })
      // transform.x = 0
      elements.set('transform-x', 0)
      input.write(0)
    }
    if (transform.x2 !== x) {
      const input = $('#uiElement-transform-x2')
      changes.push({
        input: input,
        oldValue: transform.x2,
        newValue: x,
      })
      // transform.x2 = x
      elements.set('transform-x2', x)
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
      // transform.anchorY = y
      elements.set('transform-anchorY', y)
      input.write(y)
    }
    if (transform.y !== 0) {
      const input = $('#uiElement-transform-y')
      changes.push({
        input: input,
        oldValue: transform.y,
        newValue: 0,
      })
      // transform.y = 0
      elements.set('transform-y', 0)
      input.write(0)
    }
    if (transform.y2 !== y) {
      const input = $('#uiElement-transform-y2')
      changes.push({
        input: input,
        oldValue: transform.y2,
        newValue: y,
      })
      // transform.y2 = y
      elements.set('transform-y2', y)
      input.write(y)
    }
  }
  if (changes.length !== 0) {
    elements.resize()
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
    {name: 'Mask', value: 'mask'},
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
    pointerEvents: 'enabled',
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
  // const element = node.instance
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
        // element[key] = value
        node.instances.set(key, value)
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
        // element.tint[color] = value
        node.instances.set(key, value)
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
    pointerEvents: 'enabled',
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
  // const element = node.instance
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
        // element.horizontalAlign = value
        node.instances.set(key, value)
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
        // element.verticalAlign = value
        node.instances.set(key, value)
      }
      break
    case 'content':
      // 直接复制，更新语言包中的内容
      node[key] = value
      // element[key] = value
      node.instances.set(key, value)
      break
    case 'direction':
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
    case 'color':
    case 'typeface':
    case 'overflow':
    case 'blend':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
        node.instances.set(key, value)
      }
      break
    case 'font': {
      const font = value.trim()
      if (node.font !== font) {
        node.font = font
        // element.font = font
        node.instances.set(key, font)
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
        // element.effect = effect
        node.instances.set('effect', effect)
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
        // element.effect = node.effect
        node.instances.set('effect', node.effect)
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
    pointerEvents: 'enabled',
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
  // const element = node.instance
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
        // element[key] = value
        node.instances.set(key, value)
      }
      break
    case 'text':
    case 'number':
      if (node[key] !== value) {
        node[key] = value
        // element.content = value.toString()
        node.instances.set('content', value.toString())
      }
      break
    case 'min':
    case 'max':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
        node.instances.set(key, value)
        $('#uiTextBox-number').input[key] = value
      }
      break
    case 'decimals':
      if (node.decimals !== value) {
        node.decimals = value
        // element.decimals = value
        node.instances.set(key, value)
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

// 创建对话框
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
    pointerEvents: 'enabled',
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
  // const element = node.instance
  switch (key) {
    case 'content':
      // 直接复制，更新语言包中的内容
      node[key] = value
      // element[key] = value
      node.instances.set(key, value)
      break
    case 'interval':
    case 'size':
    case 'lineSpacing':
    case 'letterSpacing':
    case 'color':
    case 'typeface':
    case 'blend':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
        node.instances.set(key, value)
      }
      break
    case 'font': {
      const font = value.trim()
      if (node.font !== font) {
        node.font = font
        // element.font = font
        node.instances.set(key, font)
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
        // element.effect = effect
        node.instances.set('effect', effect)
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
        // element.effect = node.effect
        node.instances.set('effect', node.effect)
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

// 创建进度条
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
    pointerEvents: 'enabled',
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
  // const element = node.instance
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
        // element[key] = value
        node.instances.set(key, value)
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
        // element.color[color] = value
        node.instances.set(key, value)
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

// ******************************** 元素 - 按钮页面 ********************************

{const UIButton = {
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
UIButton.initialize = function () {
  // 创建显示选项
  $('#uiButton-display').loadItems([
    {name: 'Stretch', value: 'stretch'},
    {name: 'Tile', value: 'tile'},
    {name: 'Clip', value: 'clip'},
    {name: 'Slice', value: 'slice'},
  ])

  // 设置显示模式关联元素
  $('#uiButton-display').enableHiddenMode().relate([
    {case: ['stretch', 'tile'], targets: [
      $('#uiButton-flip'),
    ]},
    {case: 'clip', targets: [
      $('#uiButton-flip'),
      $('#uiButton-normalClip'),
      $('#uiButton-hoverClip'),
      $('#uiButton-activeClip'),
    ]},
    {case: 'slice', targets: [
      $('#uiButton-normalClip'),
      $('#uiButton-hoverClip'),
      $('#uiButton-activeClip'),
      $('#uiButton-border'),
    ]},
  ])

  // 创建翻转选项
  $('#uiButton-flip').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Horizontal', value: 'horizontal'},
    {name: 'Vertical', value: 'vertical'},
    {name: 'Both', value: 'both'},
  ])

  // 创建图像效果选项
  $('#uiButton-imageEffect').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Tint', value: 'tint-1'},
    {name: 'Tint (Normal, Hover)', value: 'tint-2'},
    {name: 'Tint (Normal, Hover, Active)', value: 'tint-3'},
  ])

  // 设置图像效果关联元素
  $('#uiButton-imageEffect').enableHiddenMode().relate([
    {case: 'tint-1', targets: [
      $('#uiButton-normalTint-box'),
    ]},
    {case: 'tint-2', targets: [
      $('#uiButton-normalTint-box'),
      $('#uiButton-hoverTint-box'),
    ]},
    {case: 'tint-3', targets: [
      $('#uiButton-normalTint-box'),
      $('#uiButton-hoverTint-box'),
      $('#uiButton-activeTint-box'),
    ]},
  ])

  // 创建文本方向选项
  $('#uiButton-direction').loadItems([
    {name: 'Horizontal', value: 'horizontal-tb'},
    {name: 'Vertical', value: 'vertical-lr'},
  ])

  // 创建字型选项
  $('#uiButton-typeface').loadItems([
    {name: 'Regular', value: 'regular'},
    {name: 'Bold', value: 'bold'},
    {name: 'Italic', value: 'italic'},
    {name: 'Bold Italic', value: 'bold-italic'},
  ])

  // 创建文字效果类型选项
  $('#uiButton-textEffect-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Shadow', value: 'shadow'},
    {name: 'Stroke', value: 'stroke'},
    {name: 'Outline', value: 'outline'},
  ])

  // 设置文字效果类型关联元素
  $('#uiButton-textEffect-type').enableHiddenMode().relate([
    {case: 'shadow', targets: [
      $('#uiButton-textEffect-shadowOffsetX'),
      $('#uiButton-textEffect-shadowOffsetY'),
      $('#uiButton-textEffect-color'),
    ]},
    {case: 'stroke', targets: [
      $('#uiButton-textEffect-strokeWidth'),
      $('#uiButton-textEffect-color'),
    ]},
    {case: 'outline', targets: [
      $('#uiButton-textEffect-color'),
    ]},
  ])

  // 同步滑动框和数字框的数值
  $('#uiButton-imagePadding-slider').synchronize($('#uiButton-imagePadding'))
  $('#uiButton-imageOpacity-slider').synchronize($('#uiButton-imageOpacity'))
  $('#uiButton-size-slider').synchronize($('#uiButton-size'))
  $('#uiButton-letterSpacing-slider').synchronize($('#uiButton-letterSpacing'))
  $('#uiButton-textPadding-slider').synchronize($('#uiButton-textPadding'))

  // 侦听事件
  const elements = $(`#uiButton-display,
    #uiButton-normalImage, #uiButton-normalClip,
    #uiButton-hoverImage, #uiButton-hoverClip,
    #uiButton-activeImage, #uiButton-activeClip,
    #uiButton-flip, #uiButton-border, #uiButton-imagePadding, #uiButton-imageOpacity, #uiButton-imageEffect,
    #uiButton-normalTint-0, #uiButton-normalTint-1, #uiButton-normalTint-2, #uiButton-normalTint-3,
    #uiButton-hoverTint-0, #uiButton-hoverTint-1, #uiButton-hoverTint-2, #uiButton-hoverTint-3,
    #uiButton-activeTint-0, #uiButton-activeTint-1, #uiButton-activeTint-2, #uiButton-activeTint-3,
    #uiButton-direction, #uiButton-horizontalAlign, #uiButton-verticalAlign,
    #uiButton-content, #uiButton-size, #uiButton-letterSpacing, #uiButton-textPadding,
    #uiButton-font, #uiButton-typeface, #uiButton-textEffect-type, #uiButton-textEffect-shadowOffsetX,
    #uiButton-textEffect-shadowOffsetY, #uiButton-textEffect-strokeWidth, #uiButton-textEffect-color,
    #uiButton-normalColor, #uiButton-hoverColor, #uiButton-activeColor,
    #uiButton-hoverSound, #uiButton-clickSound`)
  const sliders = $(`#uiButton-imagePadding-slider, #uiButton-imageOpacity-slider,
    #uiButton-size-slider, #uiButton-letterSpacing-slider, #uiButton-textPadding-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)
}

// 创建按钮
UIButton.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 24
  return {
    class: 'button',
    name: 'Button',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    display: 'stretch',
    normalImage: '',
    normalClip: [0, 0, 32, 32],
    hoverImage: '',
    hoverClip: [0, 0, 32, 32],
    activeImage: '',
    activeClip: [0, 0, 32, 32],
    flip: 'none',
    clip: [0, 0, 32, 32],
    border: 1,
    imagePadding: 0,
    imageOpacity: 1,
    imageEffect: 'none',
    normalTint: [0, 0, 0, 0],
    hoverTint: [0, 0, 0, 0],
    activeTint: [0, 0, 0, 0],
    direction: 'horizontal-tb',
    horizontalAlign: 'center',
    verticalAlign: 'middle',
    content: 'New Button',
    size: 16,
    letterSpacing: 0,
    textPadding: 0,
    font: '',
    typeface: 'regular',
    textEffect: {type: 'none'},
    normalColor: 'ffffffff',
    hoverColor: 'ffffffff',
    activeColor: 'ffffffff',
    hoverSound: '',
    clickSound: '',
    pointerEvents: 'enabled',
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIButton.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiButton', node)
    write('display')
    write('normalImage')
    write('normalClip')
    write('hoverImage')
    write('hoverClip')
    write('activeImage')
    write('activeClip')
    write('flip')
    write('border')
    write('imagePadding')
    write('imageOpacity')
    write('imageEffect')
    write('normalTint-0')
    write('normalTint-1')
    write('normalTint-2')
    write('normalTint-3')
    write('hoverTint-0')
    write('hoverTint-1')
    write('hoverTint-2')
    write('hoverTint-3')
    write('activeTint-0')
    write('activeTint-1')
    write('activeTint-2')
    write('activeTint-3')
    write('direction')
    write('horizontalAlign')
    write('verticalAlign')
    write('content')
    write('size')
    write('letterSpacing')
    write('textPadding')
    write('font')
    write('typeface')
    write('textEffect-type')
    write('textEffect-shadowOffsetX', node.textEffect.shadowOffsetX || 1)
    write('textEffect-shadowOffsetY', node.textEffect.shadowOffsetY || 1)
    write('textEffect-strokeWidth', node.textEffect.strokeWidth || 1)
    write('textEffect-color', node.textEffect.color || '000000ff')
    write('normalColor')
    write('hoverColor')
    write('activeColor')
    write('hoverSound')
    write('clickSound')
    UIElement.open(node)
  }
}

// 关闭数据
UIButton.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIButton.update = function (node, key, value) {
  UI.planToSave()
  // const element = node.instance
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
              input: $('#uiButton-horizontalAlign'),
              oldValue: node.horizontalAlign,
              newValue: value,
            }],
          })
        }
        node.horizontalAlign = value
        // element.horizontalAlign = value
        node.instances.set(key, value)
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
              input: $('#uiButton-verticalAlign'),
              oldValue: node.verticalAlign,
              newValue: value,
            }],
          })
        }
        node.verticalAlign = value
        // element.verticalAlign = value
        node.instances.set(key, value)
      }
      break
    case 'normalImage':
    case 'normalClip':
    case 'hoverImage':
    case 'hoverClip':
    case 'activeImage':
    case 'activeClip':
    case 'normalColor':
    case 'hoverColor':
    case 'activeColor':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
        // element.state = 'changed'
        node.instances.set(key, value)
        node.instances.set('state', 'changed')
      }
      break
    case 'content':
      // 直接复制，更新语言包中的内容
      node[key] = value
      // element[key] = value
      node.instances.set(key, value)
      break
    case 'display':
    case 'flip':
    case 'clip':
    case 'border':
    case 'imagePadding':
    case 'imageOpacity':
    case 'imageEffect':
    case 'direction':
    case 'size':
    case 'letterSpacing':
    case 'textPadding':
    case 'font':
    case 'typeface':
    case 'hoverSound':
    case 'clickSound':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
        node.instances.set(key, value)
      }
      break
    case 'normalTint-0':
    case 'normalTint-1':
    case 'normalTint-2':
    case 'normalTint-3':
    case 'hoverTint-0':
    case 'hoverTint-1':
    case 'hoverTint-2':
    case 'hoverTint-3':
    case 'activeTint-0':
    case 'activeTint-1':
    case 'activeTint-2':
    case 'activeTint-3': {
      const [property, index] = key.split('-')
      if (node[property][index] !== value) {
        node[property][index] = value
        // element[property][index] = value
        // element.state = 'changed'
        node.instances.set(key, value)
        node.instances.set('state', 'changed')
      }
      break
    }
    case 'textEffect-type':
      if (node.textEffect.type !== value) {
        const read = getElementReader('uiButton-textEffect')
        const textEffect = {type: value}
        switch (value) {
          case 'none':
            break
          case 'shadow':
            textEffect.shadowOffsetX = read('shadowOffsetX')
            textEffect.shadowOffsetY = read('shadowOffsetY')
            textEffect.color = read('color')
            break
          case 'stroke':
            textEffect.strokeWidth = read('strokeWidth')
            textEffect.color = read('color')
            break
          case 'outline':
            textEffect.color = read('color')
            break
        }
        node.textEffect = textEffect
        // element.textEffect = textEffect
        node.instances.set('textEffect', textEffect)
      }
      break
    case 'textEffect-shadowOffsetX':
    case 'textEffect-shadowOffsetY':
    case 'textEffect-strokeWidth':
    case 'textEffect-color': {
      const index = key.indexOf('-') + 1
      const property = key.slice(index)
      if (node.textEffect[property] !== value) {
        node.textEffect[property] = value
        // element.textEffect = node.textEffect
        node.instances.set('textEffect', node.textEffect)
      }
      break
    }
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIButton.paramInput = function (event) {
  UIButton.update(
    UIButton.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiButton = UIButton}

// ******************************** 元素 - 动画页面 ********************************

{const UIAnimation = {
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
  animationIdWrite: null,
}

// 初始化
UIAnimation.initialize = function () {
  // 侦听事件
  $('#uiAnimation-animation').on('write', this.animationIdWrite)
  const elements = $(`#uiAnimation-animation, #uiAnimation-motion,
    #uiAnimation-autoplay, #uiAnimation-rotatable, #uiAnimation-angle,
    #uiAnimation-frame, #uiAnimation-offsetX, #uiAnimation-offsetY`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
}

// 创建动画
UIAnimation.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 100
  return {
    class: 'animation',
    name: 'Animation',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    animation: '',
    motion: '',
    autoplay: true,
    rotatable: false,
    angle: 0,
    frame: 0,
    offsetX: 0,
    offsetY: 0,
    pointerEvents: 'enabled',
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIAnimation.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiAnimation', node)
    write('animation')
    write('motion')
    write('autoplay')
    write('rotatable')
    write('angle')
    write('frame')
    write('offsetX')
    write('offsetY')
    UIElement.open(node)
  }
}

// 关闭数据
UIAnimation.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIAnimation.update = function (node, key, value) {
  UI.planToSave()
  // const element = node.instance
  switch (key) {
    case 'animation':
    case 'motion':
    case 'autoplay':
    case 'rotatable':
    case 'angle':
    case 'frame':
    case 'offsetX':
    case 'offsetY':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
        node.instances.set(key, value)
      }
      break
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIAnimation.paramInput = function (event) {
  UIAnimation.update(
    UIAnimation.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// 动画ID - 写入事件
UIAnimation.animationIdWrite = function (event) {
  const elMotion = $('#uiAnimation-motion')
  elMotion.loadItems(Animation.getMotionListItems(event.value))
  elMotion.write(elMotion.read())
}

Inspector.uiAnimation = UIAnimation}

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
  const elements = $('#uiVideo-video, #uiVideo-playbackRate, #uiVideo-loop, #uiVideo-flip, #uiVideo-blend')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
}

// 创建视频
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
    playbackRate: 1,
    loop: false,
    flip: 'none',
    blend: 'normal',
    pointerEvents: 'enabled',
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
    write('playbackRate')
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
  switch (key) {
    case 'video':
    case 'playbackRate':
    case 'loop':
    case 'flip':
    case 'blend':
      if (node[key] !== value) {
        node[key] = value
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
    pointerEvents: 'enabled',
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
  // const element = node.instance
  switch (key) {
    case 'layout':
    case 'overflow':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
        node.instances.set(key, value)
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
        // element[key] = value
        // element.resize()
        node.instances.set(key, value)
        node.instances.resize()
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

// 创建容器
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
    pointerEvents: 'enabled',
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

// ******************************** 元素 - 引用页面 ********************************

{const UIReference = {
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
UIReference.initialize = function () {
  // 侦听事件
  const elements = $('#uiReference-prefabId, #uiReference-synchronous')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, UI))
}

// 创建引用
UIReference.create = function () {
  const transform = UIElement.createTransform()
  transform.width = 100
  transform.height = 100
  return {
    class: 'reference',
    name: 'Reference',
    enabled: true,
    expanded: false,
    hidden: false,
    locked: false,
    presetId: '',
    prefabId: '',
    synchronous: false,
    transform: transform,
    events: [],
    scripts: [],
    children: [],
  }
}

// 打开数据
UIReference.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiReference', node)
    write('prefabId')
    write('synchronous')
    UIElement.open(node)
  }
}

// 关闭数据
UIReference.close = function () {
  if (this.target) {
    UI.list.unselect(this.target)
    UI.updateTarget()
    UIElement.close()
    this.target = null
  }
}

// 更新数据
UIReference.update = function (node, key, value) {
  UI.planToSave()
  // const element = node.instance
  switch (key) {
    case 'prefabId':
      if (node[key] !== value) {
        node[key] = value
        // element[key] = value
        node.instance.historyEnabled = true
        node.instances.set(key, value)
        node.instance.historyEnabled = false
        UI.list.updateIcon(node)
      }
      break
    case 'synchronous':
      if (node[key] !== value) {
        node[key] = value
        node.instance.historyEnabled = true
        node.instances.set(key, value)
        node.instance.historyEnabled = false
      }
      break
  }
  UI.requestRendering()
}

// 参数 - 输入事件
UIReference.paramInput = function (event) {
  UIReference.update(
    UIReference.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiReference = UIReference}

Inspector.uiElement = UIElement}

// ******************************** 动画 - 动作页面 ********************************

{const AnimMotion = {
  // properties
  owner: null,
  target: null,
  // methods
  initialize: null,
  create: null,
  createDir: null,
  open: null,
  close: null,
  write: null,
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

  // 创建动画模式选项
  $('#animMotion-mode').loadItems([
    {name: '1 Directional', value: '1-dir'},
    {name: '2 Directional', value: '2-dir'},
    {name: '4 Directional', value: '4-dir'},
    {name: '8 Directional', value: '8-dir'},
    {name: '1 Directional - Mirror', value: '1-dir-mirror'},
    {name: '2 Directional - Mirror', value: '2-dir-mirror'},
    {name: '3 Directional - Mirror', value: '3-dir-mirror'},
    {name: '5 Directional - Mirror', value: '5-dir-mirror'},
  ])

  // 设置循环关联元素
  $('#animMotion-loop').relate([$('#animMotion-loopStart')])

  // 侦听事件
  const elMode = $('#animMotion-mode')
  const elements = $('#animMotion-skip, #animMotion-loop, #animMotion-loopStart')
  elMode.on('input', this.paramInput)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Animation))
}

// 创建动作
AnimMotion.create = function (motionId) {
  return {
    class: 'motion',
    id: motionId,
    mode: '1-dir',
    skip: false,
    loop: false,
    loopStart: 0,
    dirCases: [this.createDir()],
  }
}

// 创建方向
AnimMotion.createDir = function () {
  return {layers: []}
}

// 打开数据
AnimMotion.open = function (motion) {
  if (this.target !== motion) {
    this.target = motion

    // 写入数据
    const write = getElementWriter('animMotion', motion)
    write('mode')
    write('skip')
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

// 写入数据
AnimMotion.write = function (options) {
  if (options.mode !== undefined) {
    $('#animMotion-mode').write(options.mode)
  }
}

// 更新数据
AnimMotion.update = function (motion, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'mode':
      if (motion.mode !== value) {
        Animation.setMotionMode(value)
        Animation.createDirItems()
      }
      break
    case 'skip':
    case 'loopStart':
      if (motion[key] !== value) {
        motion[key] = value
      }
      break
    case 'loop':
      if (motion.loop !== value) {
        motion.loop = value
        Animation.list.updateLoopIcon(motion)
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

// ******************************** 动画 - 关节层页面 ********************************

{const AnimJointLayer = {
  // methods
  create: null,
}

// 创建关节层
AnimJointLayer.create = function () {
  return {
    class: 'joint',
    name: 'Joint',
    expanded: true,
    hidden: false,
    locked: false,
    frames: [Inspector.animJointFrame.create()],
    children: [],
  }
}

Inspector.animJointLayer = AnimJointLayer}

// ******************************** 动画 - 关节帧页面 ********************************

{const AnimJointFrame = {
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
AnimJointFrame.initialize = function () {
  // 侦听事件
  const elements = $(`#animJointFrame-x, #animJointFrame-y, #animJointFrame-rotation,
    #animJointFrame-scaleX, #animJointFrame-scaleY, #animJointFrame-opacity`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-frame-change'
      data.motion = this.motion
      data.direction = Animation.direction
    },
  ))
}

// 创建关键帧
AnimJointFrame.create = function () {
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
AnimJointFrame.open = function (frame) {
  if (this.target !== frame) {
    this.target = frame
    this.motion = Animation.motion
    Curve.load(frame)

    // 写入数据
    const write = getElementWriter('animJointFrame', frame)
    write('x')
    write('y')
    write('rotation')
    write('scaleX')
    write('scaleY')
    write('opacity')
  }
}

// 关闭数据
AnimJointFrame.close = function () {
  if (this.target) {
    Animation.unselectMarquee(this.target)
    Curve.load(null)
    this.target = null
    this.motion = null
  }
}

// 写入数据
AnimJointFrame.write = function (options) {
  if (options.x !== undefined) {
    $('#animJointFrame-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#animJointFrame-y').write(options.y)
  }
  if (options.rotation !== undefined) {
    $('#animJointFrame-rotation').write(options.rotation)
  }
  if (options.scaleX !== undefined) {
    $('#animJointFrame-scaleX').write(options.scaleX)
  }
  if (options.scaleY !== undefined) {
    $('#animJointFrame-scaleY').write(options.scaleY)
  }
}

// 更新数据
AnimJointFrame.update = function (frame, key, value) {
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
AnimJointFrame.paramInput = function (event) {
  AnimJointFrame.update(
    AnimJointFrame.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animJointFrame = AnimJointFrame}

// ******************************** 动画 - 精灵层页面 ********************************

{const AnimSpriteLayer = {
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
AnimSpriteLayer.initialize = function () {
  // 创建混合模式选项
  $('#animSpriteLayer-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 创建光照模式选项
  $('#animSpriteLayer-light').loadItems([
    {name: 'Raw', value: 'raw'},
    {name: 'Global Sampling', value: 'global'},
    {name: 'Anchor Sampling', value: 'anchor'},
  ])

  // 侦听事件
  const elements = $('#animSpriteLayer-sprite, #animSpriteLayer-blend, #animSpriteLayer-light')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-layer-change'
      data.motion = this.motion
      data.direction = Animation.direction
    },
  ))
}

// 创建精灵层
AnimSpriteLayer.create = function () {
  return {
    class: 'sprite',
    name: 'Sprite',
    hidden: false,
    locked: false,
    sprite: '',
    blend: 'normal',
    light: 'raw',
    frames: [Inspector.animSpriteFrame.create()],
  }
}

// 打开数据
AnimSpriteLayer.open = function (layer) {
  if (this.target !== layer) {
    this.target = layer
    this.motion = Animation.motion

    // 创建精灵图选项
    const id = Animation.meta.guid
    const items = Animation.getSpriteListItems(id)
    $('#animSpriteLayer-sprite').loadItems(items)

    // 写入数据
    const write = getElementWriter('animSpriteLayer', layer)
    write('sprite')
    write('blend')
    write('light')
  }
}

// 关闭数据
AnimSpriteLayer.close = function () {
  if (this.target) {
    this.target = null
    this.motion = null
  }
}

// 更新数据
AnimSpriteLayer.update = function (layer, key, value) {
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
AnimSpriteLayer.paramInput = function (event) {
  AnimSpriteLayer.update(
    AnimSpriteLayer.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animSpriteLayer = AnimSpriteLayer}

// ******************************** 动画 - 精灵帧页面 ********************************

{const AnimSpriteFrame = {
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
AnimSpriteFrame.initialize = function () {
  // 同步滑动框和数字框的数值
  $('#animSpriteFrame-tint-0-slider').synchronize($('#animSpriteFrame-tint-0'))
  $('#animSpriteFrame-tint-1-slider').synchronize($('#animSpriteFrame-tint-1'))
  $('#animSpriteFrame-tint-2-slider').synchronize($('#animSpriteFrame-tint-2'))
  $('#animSpriteFrame-tint-3-slider').synchronize($('#animSpriteFrame-tint-3'))

  // 侦听事件
  const elements = $(`
    #animSpriteFrame-anchorX, #animSpriteFrame-anchorY,
    #animSpriteFrame-pivotX, #animSpriteFrame-pivotY,
    #animSpriteFrame-x, #animSpriteFrame-y, #animSpriteFrame-rotation,
    #animSpriteFrame-scaleX, #animSpriteFrame-scaleY, #animSpriteFrame-opacity,
    #animSpriteFrame-tint-0, #animSpriteFrame-tint-1, #animSpriteFrame-tint-2, #animSpriteFrame-tint-3`)
  const sliders = $(`
    #animSpriteFrame-tint-0-slider, #animSpriteFrame-tint-1-slider,
    #animSpriteFrame-tint-2-slider, #animSpriteFrame-tint-3-slider`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-frame-change'
      data.motion = this.motion
      data.direction = Animation.direction
    },
  ))
  sliders.on('focus', Inspector.sliderFocus)
  sliders.on('blur', Inspector.sliderBlur)

  // 初始化精灵窗口
  Sprite.initialize()
}

// 创建关键帧
AnimSpriteFrame.create = function () {
  return {
    start: 0,           // 帧起始位置
    end: 1,             // 帧结束位置
    easingId: '',       // 过渡方式
    anchorX: 0.5,       // 锚点X
    anchorY: 0.5,       // 锚点Y
    pivotX: 0,          // 轴点X
    pivotY: 0,          // 轴点Y
    x: 0,               // 位移X
    y: 0,               // 位移Y
    rotation: 0,        // 旋转角度
    scaleX: 1,          // 缩放X
    scaleY: 1,          // 缩放Y
    opacity: 1,         // 不透明度
    spriteX: 0,         // 精灵索引X
    spriteY: 0,         // 精灵索引Y
    tint: [0, 0, 0, 0], // 精灵图像色调
  }
}

// 打开数据
AnimSpriteFrame.open = function (frame) {
  if (this.target !== frame) {
    this.target = frame
    this.motion = Animation.motion
    Sprite.open(frame)
    Curve.load(frame)

    // 写入数据
    const write = getElementWriter('animSpriteFrame', frame)
    write('anchorX')
    write('anchorY')
    write('pivotX')
    write('pivotY')
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
AnimSpriteFrame.close = function () {
  if (this.target) {
    Animation.unselectMarquee(this.target)
    Sprite.close()
    Curve.load(null)
    this.target = null
    this.motion = null
  }
}

// 写入数据
AnimSpriteFrame.write = function (options) {
  if (options.anchorX !== undefined) {
    $('#animSpriteFrame-anchorX').write(options.anchorX)
  }
  if (options.anchorY !== undefined) {
    $('#animSpriteFrame-anchorY').write(options.anchorY)
  }
  if (options.pivotX !== undefined) {
    $('#animSpriteFrame-pivotX').write(options.pivotX)
  }
  if (options.pivotY !== undefined) {
    $('#animSpriteFrame-pivotY').write(options.pivotY)
  }
  if (options.x !== undefined) {
    $('#animSpriteFrame-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#animSpriteFrame-y').write(options.y)
  }
  if (options.rotation !== undefined) {
    $('#animSpriteFrame-rotation').write(options.rotation)
  }
  if (options.scaleX !== undefined) {
    $('#animSpriteFrame-scaleX').write(options.scaleX)
  }
  if (options.scaleY !== undefined) {
    $('#animSpriteFrame-scaleY').write(options.scaleY)
  }
}

// 更新数据
AnimSpriteFrame.update = function (frame, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'anchorX':
    case 'anchorY':
    case 'pivotX':
    case 'pivotY':
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
AnimSpriteFrame.paramInput = function (event) {
  AnimSpriteFrame.update(
    AnimSpriteFrame.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animSpriteFrame = AnimSpriteFrame}

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
  // 创建位置选项
  $('#animParticleLayer-position').loadItems([
    {name: 'Absolute', value: 'absolute'},
    {name: 'Relative', value: 'relative'},
  ])

  // 创建角度选项
  $('#animParticleLayer-angle').loadItems([
    {name: 'Default', value: 'default'},
    {name: 'Inherit', value: 'inherit'},
  ])

  // 侦听事件
  const elements = $('#animParticleLayer-particleId, #animParticleLayer-position, #animParticleLayer-angle')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-layer-change'
      data.motion = this.motion
      data.direction = Animation.direction
    },
  ))
}

// 创建粒子层
AnimParticleLayer.create = function () {
  return {
    class: 'particle',
    name: 'Particle',
    hidden: false,
    locked: false,
    particleId: '',
    position: 'absolute',
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
    write('position')
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
    case 'position':
    case 'angle':
      if (layer[key] !== value) {
        layer[key] = value
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
      data.direction = Animation.direction
    },
  ))
}

// 创建关键帧
AnimParticleFrame.create = function () {
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
    scale: 1,     // 粒子比例
    speed: 1,     // 播放速度
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
    case 'scale':
      if (frame[key] !== value) {
        frame[key] = value
        Animation.updateFrameContexts()
      }
      break
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

// ******************************** 动画 - 音效层页面 ********************************

{const AnimSoundLayer = {
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
AnimSoundLayer.initialize = function () {
  // 创建播放速度选项
  $('#animSoundLayer-playbackRate').loadItems([
    {name: 'Default', value: 'default'},
    {name: 'Inherit', value: 'inherit'},
  ])

  // 侦听事件
  const element = $('#animSoundLayer-playbackRate')
  element.on('input', this.paramInput)
  element.on('focus', Inspector.inputFocus)
  element.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-layer-change'
      data.motion = this.motion
      data.direction = Animation.direction
    },
  ))
}

// 创建音效层
AnimSoundLayer.create = function () {
  return {
    class: 'sound',
    name: 'Sound',
    hidden: false,
    locked: false,
    playbackRate: 'default',
    frames: [Inspector.animSoundFrame.create()],
  }
}

// 打开数据
AnimSoundLayer.open = function (layer) {
  if (this.target !== layer) {
    this.target = layer
    this.motion = Animation.motion

    // 写入数据
    const write = getElementWriter('animSoundLayer', layer)
    write('playbackRate')
  }
}

// 关闭数据
AnimSoundLayer.close = function () {
  if (this.target) {
    this.target = null
    this.motion = null
  }
}

// 更新数据
AnimSoundLayer.update = function (layer, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'playbackRate':
      if (layer[key] !== value) {
        layer[key] = value
      }
      break
  }
}

// 参数 - 输入事件
AnimSoundLayer.paramInput = function (event) {
  AnimSoundLayer.update(
    AnimSoundLayer.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animSoundLayer = AnimSoundLayer}

// ******************************** 动画 - 音效帧页面 ********************************

{const AnimSoundFrame = {
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
AnimSoundFrame.initialize = function () {
  // 侦听事件
  const elements = $('#animSoundFrame-sound, #animSoundFrame-volume')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-frame-change'
      data.motion = this.motion
      data.direction = Animation.direction
    },
  ))
}

// 创建关键帧
AnimSoundFrame.create = function () {
  return {
    start: 0,   // 帧起始位置
    end: 1,     // 帧结束位置
    sound: '',  // 音效文件
    volume: 1,  // 音量
  }
}

// 打开数据
AnimSoundFrame.open = function (frame) {
  if (this.target !== frame) {
    this.target = frame
    this.motion = Animation.motion

    // 写入数据
    const write = getElementWriter('animSoundFrame', frame)
    write('sound')
    write('volume')
  }
}

// 关闭数据
AnimSoundFrame.close = function () {
  if (this.target) {
    Animation.unselectMarquee(this.target)
    this.target = null
    this.motion = null
  }
}

// 写入数据
AnimSoundFrame.write = function (options) {
  if (options.sound !== undefined) {
    $('#animSoundFrame-sound').write(options.sound)
  }
  if (options.volume !== undefined) {
    $('#animSoundFrame-volume').write(options.volume)
  }
}

// 更新数据
AnimSoundFrame.update = function (frame, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'sound':
    case 'volume':
      if (frame[key] !== value) {
        frame[key] = value
      }
      break
  }
}

// 参数 - 输入事件
AnimSoundFrame.paramInput = function (event) {
  AnimSoundFrame.update(
    AnimSoundFrame.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animSoundFrame = AnimSoundFrame}

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

  // 设置发射区域类型关联元素
  $('#particleLayer-area-type').enableHiddenMode().relate([
    {case: 'point', targets: [
      $('#particleLayer-area-x'),
      $('#particleLayer-area-y'),
    ]},
    {case: 'rectangle', targets: [
      $('#particleLayer-area-x'),
      $('#particleLayer-area-y'),
      $('#particleLayer-area-width'),
      $('#particleLayer-area-height'),
    ]},
    {case: 'circle', targets: [
      $('#particleLayer-area-x'),
      $('#particleLayer-area-y'),
      $('#particleLayer-area-radius'),
    ]},
  ])

  // 创建混合模式选项
  $('#particleLayer-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 创建光线采样选项
  $('#particleLayer-light').loadItems([
    {name: 'Raw', value: 'raw'},
    {name: 'Global Sampling', value: 'global'},
    {name: 'Ambient Light', value: 'ambient'},
  ])

  // 创建排序模式选项
  $('#particleLayer-sort').loadItems([
    {name: 'Youngest in Front', value: 'youngest-in-front'},
    {name: 'Oldest in Front', value: 'oldest-in-front'},
    {name: 'By Scale Factor', value: 'by-scale-factor'},
  ])

  // 创建精灵模式选项
  $('#particleLayer-sprite-mode').loadItems([
    {name: 'Random', value: 'random'},
    {name: 'Animation', value: 'animation'},
    {name: 'Animation(Loop)', value: 'animation-loop'},
  ])

  // 设置精灵模式关联元素
  $('#particleLayer-sprite-mode').enableHiddenMode().relate([
    {case: ['animation', 'animation-loop'], targets: [
      $('#particleLayer-sprite-interval'),
    ]},
  ])

  // 创建颜色模式选项
  $('#particleLayer-color-mode').loadItems([
    {name: 'Fixed', value: 'fixed'},
    {name: 'Random', value: 'random'},
    {name: 'Easing', value: 'easing'},
    {name: 'Texture Sampling', value: 'texture'},
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
  const elements = $(`#particleLayer-name,
    #particleLayer-area-type, #particleLayer-area-x, #particleLayer-area-y,
    #particleLayer-area-width, #particleLayer-area-height, #particleLayer-area-radius,
    #particleLayer-count, #particleLayer-delay, #particleLayer-interval,
    #particleLayer-lifetime, #particleLayer-lifetimeDev, #particleLayer-fadeout,
    #particleLayer-anchor-x-0, #particleLayer-anchor-x-1,
    #particleLayer-anchor-y-0, #particleLayer-anchor-y-1,
    #particleLayer-anchor-speedX-0, #particleLayer-anchor-speedX-1,
    #particleLayer-anchor-speedY-0, #particleLayer-anchor-speedY-1,
    #particleLayer-movement-angle-0, #particleLayer-movement-angle-1,
    #particleLayer-movement-speed-0, #particleLayer-movement-speed-1,
    #particleLayer-movement-accelAngle-0, #particleLayer-movement-accelAngle-1,
    #particleLayer-movement-accel-0, #particleLayer-movement-accel-1,
    #particleLayer-rotation-angle-0, #particleLayer-rotation-angle-1,
    #particleLayer-rotation-speed-0, #particleLayer-rotation-speed-1,
    #particleLayer-rotation-accel-0, #particleLayer-rotation-accel-1,
    #particleLayer-hRotation-radius-0, #particleLayer-hRotation-radius-1,
    #particleLayer-hRotation-expansionSpeed-0, #particleLayer-hRotation-expansionSpeed-1,
    #particleLayer-hRotation-expansionAccel-0, #particleLayer-hRotation-expansionAccel-1,
    #particleLayer-hRotation-angle-0, #particleLayer-hRotation-angle-1,
    #particleLayer-hRotation-angularSpeed-0, #particleLayer-hRotation-angularSpeed-1,
    #particleLayer-hRotation-angularAccel-0, #particleLayer-hRotation-angularAccel-1,
    #particleLayer-scale-factor-0, #particleLayer-scale-factor-1,
    #particleLayer-scale-speed-0, #particleLayer-scale-speed-1,
    #particleLayer-scale-accel-0, #particleLayer-scale-accel-1,
    #particleLayer-image, #particleLayer-blend, #particleLayer-light,
    #particleLayer-sort, #particleLayer-sprite-mode,
    #particleLayer-sprite-hframes, #particleLayer-sprite-vframes, #particleLayer-sprite-interval,
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
    class: 'particle',
    name: 'Layer',
    hidden: false,
    locked: false,
    area: {
      type: 'point',
      x: 0,
      y: 0,
    },
    count: 0,
    delay: 0,
    interval: 40,
    lifetime: 1000,
    lifetimeDev: 0,
    fadeout: 200,
    anchor: {
      x: [0, 0],
      y: [0, 0],
      speedX: [0, 0],
      speedY: [0, 0],
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
    hRotation: {
      radius: [0, 0],
      expansionSpeed: [0, 0],
      expansionAccel: [0, 0],
      angle: [0, 0],
      angularSpeed: [0, 0],
      angularAccel: [0, 0],
    },
    scale: {
      factor: [1, 1],
      speed: [0, 0],
      accel: [0, 0],
    },
    image: '',
    blend: 'additive',
    light: 'raw',
    sort: 'youngest-in-front',
    sprite: {
      mode: 'random',
      hframes: 1,
      vframes: 1,
      interval: 100,
    },
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
    write('area-x', area.x ?? 0)
    write('area-y', area.y ?? 0)
    write('area-width', area.width ?? 64)
    write('area-height', area.height ?? 64)
    write('area-radius', area.radius ?? 32)
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
    write('anchor-speedX-0')
    write('anchor-speedX-1')
    write('anchor-speedY-0')
    write('anchor-speedY-1')
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
    write('hRotation-radius-0')
    write('hRotation-radius-1')
    write('hRotation-expansionSpeed-0')
    write('hRotation-expansionSpeed-1')
    write('hRotation-expansionAccel-0')
    write('hRotation-expansionAccel-1')
    write('hRotation-angle-0')
    write('hRotation-angle-1')
    write('hRotation-angularSpeed-0')
    write('hRotation-angularSpeed-1')
    write('hRotation-angularAccel-0')
    write('hRotation-angularAccel-1')
    write('scale-factor-0')
    write('scale-factor-1')
    write('scale-speed-0')
    write('scale-speed-1')
    write('scale-accel-0')
    write('scale-accel-1')
    write('image')
    write('blend')
    write('light')
    write('sort')
    write('sprite-mode')
    write('sprite-hframes')
    write('sprite-vframes')
    write('sprite-interval')
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
        delete area.x
        delete area.y
        delete area.width
        delete area.height
        delete area.radius
        const read = getElementReader('particleLayer-area')
        switch (value) {
          case 'point':
            area.x = read('x')
            area.y = read('y')
            break
          case 'rectangle':
            area.x = read('x')
            area.y = read('y')
            area.width = read('width')
            area.height = read('height')
            break
          case 'circle':
            area.x = read('x')
            area.y = read('y')
            area.radius = read('radius')
            break
          case 'edge':
            break
        }
        layerInstance.updateElementMethods()
        Particle.computeOuterRect()
      }
      break
    }
    case 'area-x':
    case 'area-y':
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
    case 'light':
    case 'sort':
      if (layer[key] !== value) {
        layer[key] = value
      }
      break
    case 'sprite-hframes':
    case 'sprite-vframes': {
      const {sprite} = layer
      const property = key.split('-')[1]
      if (sprite[property] !== value) {
        sprite[property] = value
        layerInstance.calculateElementSize()
        layerInstance.resizeElementIndices()
        Particle.list.updateIcon(layer)
      }
      break
    }
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
    case 'sprite-mode':
    case 'sprite-interval':
    case 'anchor-x-0':
    case 'anchor-x-1':
    case 'anchor-y-0':
    case 'anchor-y-1':
    case 'anchor-speedX-0':
    case 'anchor-speedX-1':
    case 'anchor-speedY-0':
    case 'anchor-speedY-1':
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
    case 'hRotation-radius-0':
    case 'hRotation-radius-1':
    case 'hRotation-expansionSpeed-0':
    case 'hRotation-expansionSpeed-1':
    case 'hRotation-expansionAccel-0':
    case 'hRotation-expansionAccel-1':
    case 'hRotation-angle-0':
    case 'hRotation-angle-1':
    case 'hRotation-angularSpeed-0':
    case 'hRotation-angularSpeed-1':
    case 'hRotation-angularAccel-0':
    case 'hRotation-angularAccel-1':
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