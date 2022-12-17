"use strict"

import {
  ctrl,
  Cursor,
  Data,
  DialogBoxElement,
  Easing,
  File,
  GL,
  GUID,
  History,
  ImageTexture,
  Inspector,
  Layout,
  Local,
  Matrix,
  Menu,
  Scene,
  StageColor,
  TextBoxElement,
  TextElement,
  Timer,
  Window,
  Clipboard
} from "../yami"

// ******************************** UI 窗口 ********************************

const UI = {
  // properties
  state: 'closed',
  page: $('#ui'),
  head: $('#ui-head'),
  body: $('#ui-body').hide(),
  screen: $('#ui-screen'),
  marquee: $('#ui-marquee'),
  searcher: $('#ui-searcher'),
  list: $('#ui-list'),
  // editor properties
  dragging: null,
  target: null,
  hover: null,
  history: null,
  controlPoints: null,
  controlPointActive: null,
  controlPointRotation: null,
  controlPointTexture: null,
  translationKey: 0b0000,
  translationTimer: null,
  background: null,
  foreground: null,
  matrix: null,
  zoom: null,
  zoomTimer: null,
  scale: null,
  scaleX: null,
  scaleY: null,
  outerWidth: null,
  outerHeight: null,
  scrollLeft: null,
  scrollTop: null,
  scrollRight: null,
  scrollBottom: null,
  centerX: null,
  centerY: null,
  centerOffsetX: null,
  centerOffsetY: null,
  padding: null,
  paddingLeft: null,
  paddingTop: null,
  inspectorTypeMap: null,
  // ui properties
  context: null,
  meta: null,
  width: null,
  height: null,
  nodes: null,
  root: null,
  // methods
  initialize: null,
  open: null,
  load: null,
  save: null,
  close: null,
  destroy: null,
  copy: null,
  paste: null,
  create: null,
  delete: null,
  toggle: null,
  undo: null,
  redo: null,
  setZoom: null,
  setSize: null,
  setHover: null,
  setTarget: null,
  revealTarget: null,
  shiftAnchor: null,
  shiftTarget: null,
  resizeTarget: null,
  rotateTarget: null,
  setControlPoint: null,
  updateHover: null,
  updateTarget: null,
  updateTargetItem: null,
  updateElementFont: null,
  updateIndexedColor: null,
  updateControlPoints: null,
  updateElement: null,
  deleteElement: null,
  updateHead: null,
  resize: null,
  getPointerCoords: null,
  updateCamera: null,
  updateTransform: null,
  setPresetId: null,
  unlinkPresetId: null,
  loadElement: null,
  drawBackground: null,
  drawElements: null,
  drawCoordinateAxes: null,
  drawHoverWireframe: null,
  drawTargetWireframe: null,
  drawTargetAnchor: null,
  drawControlPoints: null,
  selectControlPoint: null,
  selectObject: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  switchSettings: null,
  updateFont: null,
  planToSave: null,
  saveToConfig: null,
  loadFromConfig: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  webglRestored: null,
  windowResize: null,
  themechange: null,
  datachange: null,
  keydown: null,
  headPointerdown: null,
  switchPointerdown: null,
  zoomFocus: null,
  zoomInput: null,
  screenKeydown: null,
  translationKeyup: null,
  screenWheel: null,
  screenUserscroll: null,
  screenBlur: null,
  marqueePointerdown: null,
  marqueePointermove: null,
  marqueePointerleave: null,
  marqueeDoubleclick: null,
  pointerup: null,
  pointermove: null,
  menuPopup: null,
  searcherInput: null,
  listKeydown: null,
  listPointerdown: null,
  listSelect: null,
  listRecord: null,
  listPopup: null,
  listOpen: null,
  listRename: null,
  listChange: null,
  listPageResize: null,
  // classes
  Element: null,
  Root: null,
  Image: null,
  Text: null,
  TextBox: null,
  DialogBox: null,
  ProgressBar: null,
  Video: null,
  Window: null,
  Container: null,
}

// ******************************** UI 窗口加载 ********************************

// marquee methods
UI.marquee.resize = null

// list properties
UI.list.page = $('#ui-element')
UI.list.head = $('#ui-list-head')
// list methods
UI.list.copy = null
UI.list.paste = null
UI.list.delete = null
UI.list.toggle = null
UI.list.cancelSearch = null
UI.list.restoreRecursiveStates = Scene.list.restoreRecursiveStates
UI.list.setRecursiveStates = Scene.list.setRecursiveStates
UI.list.createIcon = null
UI.list.updateHead = null
UI.list.createConditionIcon = null
UI.list.updateConditionIcon = null
UI.list.createEventIcon = Scene.list.createEventIcon
UI.list.updateEventIcon = Scene.list.updateEventIcon
UI.list.createScriptIcon = Scene.list.createScriptIcon
UI.list.updateScriptIcon = Scene.list.updateScriptIcon
UI.list.createVisibilityIcon = Scene.list.createVisibilityIcon
UI.list.updateVisibilityIcon = Scene.list.updateVisibilityIcon
UI.list.createLockIcon = Scene.list.createLockIcon
UI.list.updateLockIcon = Scene.list.updateLockIcon
UI.list.onCreate = null
UI.list.onRemove = null
UI.list.onDelete = null
UI.list.onResume = null

// 初始化
UI.initialize = function () {
  // 绑定滚动条
  this.screen.addScrollbars()

  // 创建控制点
  const points = {
    rotate: {
      TL: {x: 0, y: 0, angle: 225},
      TR: {x: 0, y: 0, angle: 315},
      BL: {x: 0, y: 0, angle: 135},
      BR: {x: 0, y: 0, angle: 45},
    },
    resize: {
      T: {x: 0, y: 0, angle: 270},
      L: {x: 0, y: 0, angle: 180},
      R: {x: 0, y: 0, angle: 0},
      B: {x: 0, y: 0, angle: 90},
      TL: {x: 0, y: 0, angle: 225},
      TR: {x: 0, y: 0, angle: 315},
      BL: {x: 0, y: 0, angle: 135},
      BR: {x: 0, y: 0, angle: 45},
    },
    list: null,
  }
  // 控制点按优先级从低到高排序
  points.list = [
    // 旋转控制点
    points.rotate.TL,
    points.rotate.TR,
    points.rotate.BL,
    points.rotate.BR,
    // 调整控制点
    points.resize.T,
    points.resize.L,
    points.resize.R,
    points.resize.B,
    points.resize.TL,
    points.resize.TR,
    points.resize.BL,
    points.resize.BR,
  ]
  this.controlPoints = points

  // 创建控制点纹理
  File.get({
    local: 'images/ui_control_point.png',
    type: 'image',
  }).then(image => {
    if (!image) return
    image.guid = 'ui:control-point'
    this.controlPointTexture = new ImageTexture(image)
    this.controlPointTexture.base.protected = true
  })

  // 创建位移计时器
  this.translationTimer = new Timer({
    duration: Infinity,
    update: timer => {
      if (this.state === 'open' &&
        this.dragging === null) {
        const key = this.translationKey
        const step = Timer.deltaTime * 1.5 / this.scale
        let x = 0
        let y = 0
        if (key & 0b0001) {x -= step}
        if (key & 0b0010) {y -= step}
        if (key & 0b0100) {x += step}
        if (key & 0b1000) {y += step}
        const screen = this.screen
        const sl = screen.scrollLeft
        const st = screen.scrollTop
        const cx = Math.roundTo(this.centerX + x, 4)
        const cy = Math.roundTo(this.centerY + y, 4)
        this.updateCamera(cx, cy)
        this.updateTransform()
        if (screen.scrollLeft !== sl ||
          screen.scrollTop !== st) {
          this.requestRendering()
          this.marquee.resize()
          this.screen.updateScrollbars()
        }
      } else {
        return false
      }
    }
  })

  // 创建缩放计时器
  this.zoomTimer = new Timer({
    duration: 80,
    update: timer => {
      if (this.state === 'open') {
        const {elapsed, duration, start, end} = timer
        const time = elapsed / duration
        this.scale = start * (1 - time) + end * time
        this.resize()
        this.requestRendering()
      } else {
        this.scale = timer.end
        return false
      }
    }
  })

  // 设置舞台边距
  this.padding = 800

  // 创建变换矩阵
  this.matrix = new Matrix()

  // 设置检查器类型映射表
  this.inspectorTypeMap = {
    image: 'uiImage',
    text: 'uiText',
    textbox: 'uiTextBox',
    dialogbox: 'uiDialogBox',
    progressbar: 'uiProgressBar',
    video: 'uiVideo',
    window: 'uiWindow',
    container: 'uiContainer',
  }

  // 设置列表搜索框按钮和过滤器
  this.searcher.addCloseButton()
  this.searcher.addKeydownFilter()

  // 绑定对象目录列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.nodes)
  list.creators.push(list.createConditionIcon)
  list.creators.push(list.updateConditionIcon)
  list.creators.push(list.createEventIcon)
  list.creators.push(list.updateEventIcon)
  list.creators.push(list.createScriptIcon)
  list.creators.push(list.updateScriptIcon)
  list.creators.push(list.createVisibilityIcon)
  list.updaters.push(list.updateVisibilityIcon)
  list.creators.push(list.createLockIcon)
  list.updaters.push(list.updateLockIcon)

  // 设置历史操作处理器
  History.processors['ui-object-create'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
  }
  History.processors['ui-object-delete'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
  }
  History.processors['ui-object-remove'] = (operation, data) => {
    const {response} = data
    const {item} = response
    list.restore(operation, response)
    UI.updateElement(item)
  }
  History.processors['ui-object-toggle'] = (operation, data) => {
    const {item, oldValue, newValue} = data
    if (operation === 'undo') {
      item.enabled = oldValue
    } else {
      item.enabled = newValue
    }
    list.updateConditionIcon(item)
    UI.planToSave()
  }
  History.processors['ui-object-hidden'] = (operation, data) => {
    const {item, oldValues1, oldValues2, newValue} = data
    const {instance} = item
    if (operation === 'undo') {
      list.restoreRecursiveStates(item, 'hidden', oldValues1)
      list.restoreRecursiveStates(instance, 'visible', oldValues2)
    } else {
      list.setRecursiveStates(item, 'hidden', newValue)
      list.setRecursiveStates(instance, 'visible', !newValue)
    }
    list.update()
    UI.requestRendering()
    UI.planToSave()
  }
  History.processors['ui-object-locked'] = (operation, data) => {
    const {item, oldValues, newValue} = data
    if (operation === 'undo') {
      list.restoreRecursiveStates(item, 'locked', oldValues)
    } else {
      list.setRecursiveStates(item, 'locked', newValue)
    }
    list.update()
    UI.planToSave()
  }
  History.processors['ui-target-anchor'] = (operation, data) => {
    const {editor, target, anchorX, anchorY} = data
    const {instance, transform} = target
    data.anchorX = transform.anchorX
    data.anchorY = transform.anchorY
    transform.anchorX = anchorX
    transform.anchorY = anchorY
    if (editor.target === target) {
      editor.write({anchorX, anchorY})
    }
    instance.resize()
    UI.setTarget(target)
    UI.requestRendering()
    UI.planToSave()
  }
  History.processors['ui-target-shift'] = (operation, data) => {
    const {editor, target, x, y} = data
    const {instance, transform} = target
    data.x = transform.x
    data.y = transform.y
    transform.x = x
    transform.y = y
    if (editor.target === target) {
      editor.write({x, y})
    }
    instance.resize()
    UI.setTarget(target)
    UI.requestRendering()
    UI.planToSave()
  }
  History.processors['ui-target-resize'] = (operation, data) => {
    const {editor, target, width, height} = data
    const {instance, transform} = target
    data.width = transform.width
    data.height = transform.height
    transform.width = width
    transform.height = height
    if (editor.target === target) {
      editor.write({width, height})
    }
    instance.resize()
    UI.setTarget(target)
    UI.requestRendering()
    UI.planToSave()
  }
  History.processors['ui-target-rotate'] = (operation, data) => {
    const {editor, target, rotation} = data
    const {instance, transform} = target
    data.rotation = transform.rotation
    transform.rotation = rotation
    if (editor.target === target) {
      editor.write({rotation})
    }
    instance.resize()
    UI.setTarget(target)
    UI.requestRendering()
    UI.planToSave()
  }

  // 侦听事件
  window.on('themechange', this.themechange)
  window.on('datachange', this.datachange)
  window.on('keydown', this.keydown)
  this.page.on('resize', this.windowResize)
  this.head.on('pointerdown', this.headPointerdown)
  GL.canvas.on('webglcontextrestored', this.webglRestored)
  $('#ui-head-start').on('pointerdown', this.switchPointerdown)
  $('#ui-zoom').on('focus', this.zoomFocus)
  $('#ui-zoom').on('input', this.zoomInput)
  this.screen.on('keydown', this.screenKeydown)
  this.screen.on('wheel', this.screenWheel)
  this.screen.on('userscroll', this.screenUserscroll)
  this.screen.on('blur', this.screenBlur)
  this.marquee.on('pointerdown', this.marqueePointerdown)
  this.marquee.on('pointermove', this.marqueePointermove)
  this.marquee.on('pointerleave', this.marqueePointerleave)
  this.marquee.on('doubleclick', this.marqueeDoubleclick)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('select', this.listSelect)
  list.on('record', this.listRecord)
  list.on('popup', this.listPopup)
  list.on('open', this.listOpen)
  list.on('change', this.listChange)
  list.page.on('resize', this.listPageResize)
}

// 打开界面
UI.open = function (context) {
  if (this.context === context) {
    return
  }
  this.save()
  this.close()

  // 首次加载界面
  const {meta} = context
  if (!context.ui) {
    context.ui = Data.ui[meta.guid]
  }
  if (context.ui) {
    this.state = 'open'
    this.context = context
    this.meta = meta
    this.body.show()
    this.load(context)
    this.resize()
    this.requestRendering()
  } else {
    Layout.manager.switch('directory')
    Window.confirm({
      message: `Failed to read file: ${meta.path}`,
    }, [{
      label: 'Confirm',
    }])
  }
}

// 加载界面
UI.load = function (context) {
  const firstLoad = !context.editor
  if (firstLoad) {
    context.editor = {
      target: null,
      root: new UI.Root(),
      history: new History(100),
      centerX: context.ui.width / 2,
      centerY: context.ui.height / 2,
      // listScrollTop: 0,
    }
  }
  const {ui, editor} = context

  // 加载界面属性
  this.width = ui.width
  this.height = ui.height
  this.nodes = ui.nodes

  // 加载编辑器属性
  this.root = editor.root
  this.history = editor.history
  this.centerX = editor.centerX
  this.centerY = editor.centerY

  // 更新字体
  this.updateFont()

  // 初始化
  if (firstLoad) {
    // 加载所有元素
    const nodes = this.nodes
    const length = nodes.length
    for (let i = 0; i < length; i++) {
      this.loadElement(nodes[i], this.root)
    }
  }

  // 更新列表
  this.list.update()
  // this.list.scrollTop = editor.listScrollTop

  // 设置目标对象
  this.setTarget(editor.target)

  // 更新元素字体
  if (this.context.fontChanged) {
    this.updateElementFont()
  }
}

// 保存界面
UI.save = function () {
  if (this.state === 'open') {
    const {ui, editor} = this.context

    // 保存界面属性
    ui.width = this.width
    ui.height = this.height
    ui.nodes = this.nodes

    // 保存编辑器属性
    editor.target = this.target
    editor.root = this.root
    editor.history = this.history
    editor.centerX = this.centerX
    editor.centerY = this.centerY
    // editor.listScrollTop = this.list.scrollTop
  }
}

// 关闭界面
UI.close = function () {
  if (this.state !== 'closed') {
    this.screen.blur()
    // 关闭检查器
    if (Inspector.type === 'fileUI') {
      Inspector.close()
    }
    this.setTarget(null)
    this.state = 'closed'
    this.context = null
    this.meta = null
    this.nodes = null
    this.root = null
    this.history = null
    this.searcher.write('')
    this.list.clear()
    this.body.hide()
    this.stopRendering()
  }
}

// 销毁界面
UI.destroy = function (context) {
  if (this.context === context) {
    this.save()
    this.close()
  }
  context.editor?.root.destroy()
}

// 复制对象
UI.copy = function () {
  if (this.state === 'open' &&
    this.target !== null) {
    this.list.copy(this.target)
  }
}

// 粘贴对象
UI.paste = function (x, y) {
  if (this.state === 'open' &&
    this.dragging === null) {
    if (x === undefined) {
      x = this.centerX
      y = this.centerY
    }
    this.list.paste(null, data => {
      const {transform} = data
      transform.x = Math.round(x)
      transform.x = 0
      transform.y = Math.round(y)
      transform.y = 0
    })
  }
}

// 创建对象
UI.create = function (kind, x, y) {
  const map = this.inspectorTypeMap
  const key = map[kind]
  const editor = Inspector[key]
  const node = editor.create()
  node.transform.x = x
  node.transform.y = y
  this.list.addNodeTo(node)
}

// 删除对象
UI.delete = function () {
  if (this.state === 'open' &&
    this.target !== null &&
    this.dragging === null) {
    this.list.delete(this.target)
  }
}

// 开关对象
UI.toggle = function () {
  this.list.toggle(this.target)
}

// 撤销操作
UI.undo = function () {
  if (this.state === 'open' &&
    !this.dragging &&
    this.history.canUndo()) {
    this.history.restore('undo')
    this.marquee.resize()
  }
}

// 重做操作
UI.redo = function () {
  if (this.state === 'open' &&
    !this.dragging &&
    this.history.canRedo()) {
    this.history.restore('redo')
    this.marquee.resize()
  }
}

// 设置缩放
UI.setZoom = function IIFE() {
  const slider = $('#ui-zoom')
  return function (zoom) {
    if (this.zoom !== zoom) {
      let scale
      switch (zoom) {
        case 0: scale = 0.25; break
        case 1: scale = 0.5 ; break
        case 2: scale = 1   ; break
        case 3: scale = 2   ; break
        case 4: scale = 4   ; break
        default: return
      }
      this.zoom = zoom
      slider.write(zoom)
      if (this.state === 'open') {
        const timer = this.zoomTimer
        timer.start = this.scale
        timer.end = scale
        timer.elapsed = 0
        timer.add()
      } else {
        this.scale = scale
      }
    }
  }
}()

// 设置容器大小
UI.setSize = function (width, height) {
  if (this.width !== width) {
    this.centerX = this.centerX * width / this.width
    this.width = width
  }
  if (this.height !== height) {
    this.centerY = this.centerY * height / this.height
    this.height = height
  }
  this.resize()
  this.requestRendering()
}

// 设置悬停对象
UI.setHover = function (hover) {
  if (this.hover !== hover) {
    this.hover = hover
    this.requestRendering()
  }
}

// 设置目标对象
UI.setTarget = function (target) {
  if (this.target !== target) {
    this.target = target
    this.updateTargetItem()
    this.requestRendering()
    if (target) {
      const map = this.inspectorTypeMap
      const key = map[target.class]
      Inspector.open(key, target)
    } else {
      Inspector.close()
    }
  }
}

// 显示目标对象
UI.revealTarget = function IIFE() {
  const timer = new Timer({
    duration: 200,
    update: timer => {
      const {target} = timer
      if (target === UI.target) {
        const easing = Easing.EasingMap.easeInOut
        const time = easing.map(timer.elapsed / timer.duration)
        const x = timer.startX * (1 - time) + timer.endX * time
        const y = timer.startY * (1 - time) + timer.endY * time
        const screen = UI.screen
        const sl = screen.scrollLeft
        const st = screen.scrollTop
        UI.updateCamera(x, y)
        UI.updateTransform()
        if (screen.scrollLeft !== sl ||
          screen.scrollTop !== st) {
          UI.requestRendering()
          UI.marquee.resize()
          UI.screen.updateScrollbars()
        }
      } else {
        timer.target = null
        return false
      }
    },
    callback: timer => {
      timer.target = null
    },
  })
  return function () {
    const target = this.target
    if (target && !timer.target) {
      const instance = target.instance
      const matrix = instance.matrix
      const L = instance.x
      const T = instance.y
      const R = L + instance.width
      const B = T + instance.height
      const a = matrix[0]
      const b = matrix[1]
      const c = matrix[3]
      const d = matrix[4]
      const e = matrix[6]
      const f = matrix[7]
      const x1 = a * L + c * T + e
      const y1 = b * L + d * T + f
      const x2 = a * L + c * B + e
      const y2 = b * L + d * B + f
      const x3 = a * R + c * B + e
      const y3 = b * R + d * B + f
      const x4 = a * R + c * T + e
      const y4 = b * R + d * T + f
      const x = (x1 + x2 + x3 + x4) / 4
      const y = (y1 + y2 + y3 + y4) / 4
      const toleranceX = 0.5 / this.scaleX
      const toleranceY = 0.5 / this.scaleY
      const {centerX, centerY} = this
      // 目标和摄像机的位置不一定相等
      if (Math.abs(x - centerX) > toleranceX ||
        Math.abs(y - centerY) > toleranceY) {
        timer.target = target
        timer.startX = centerX
        timer.startY = centerY
        timer.endX = x
        timer.endY = y
        timer.elapsed = 0
        timer.add()
      }
    }
  }
}()

// 转移目标对象锚点
UI.shiftAnchor = function (anchorX, anchorY) {
  const target = this.target
  if (target !== null) {
    this.planToSave()
    const instance = target.instance
    const transform = target.transform
    const editor = Inspector.uiElement
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'ui-target-anchor'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        target: target,
        anchorX: transform.anchorX,
        anchorY: transform.anchorY,
      })
    }
    transform.anchorX = anchorX
    transform.anchorY = anchorY
    instance.resize()
    this.requestRendering()

    // 更新编辑器
    if (editor.target === target) {
      editor.write({anchorX, anchorY})
    }
  }
}

// 转移目标对象
UI.shiftTarget = function (x, y) {
  const target = this.target
  if (target !== null) {
    this.planToSave()
    const instance = target.instance
    const transform = target.transform
    const editor = Inspector.uiElement
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'ui-target-shift'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        target: target,
        x: transform.x,
        y: transform.y,
      })
    }
    transform.x = x
    transform.y = y
    instance.resize()
    this.requestRendering()

    // 更新编辑器
    if (editor.target === target) {
      editor.write({
        x: x,
        y: y,
      })
    }
  }
}

// 调整目标对象
UI.resizeTarget = function (width, height) {
  const target = this.target
  if (target !== null) {
    this.planToSave()
    const instance = target.instance
    const transform = target.transform
    const editor = Inspector.uiElement
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'ui-target-resize'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        target: target,
        width: transform.width,
        height: transform.height,
      })
    }
    if (width !== undefined) {
      transform.width = width
    }
    if (height !== undefined) {
      transform.height = height
    }
    instance.resize()
    this.requestRendering()

    // 更新编辑器
    if (editor.target === target) {
      editor.write({
        width: width,
        height: height,
      })
    }
  }
}

// 旋转目标对象
UI.rotateTarget = function (rotation) {
  const target = this.target
  if (target !== null) {
    this.planToSave()
    const instance = target.instance
    const transform = target.transform
    const editor = Inspector.uiElement
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'ui-target-rotate'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        target: target,
        rotation: transform.rotation,
      })
    }
    transform.rotation = rotation
    instance.resize()
    this.requestRendering()

    // 更新编辑器
    if (editor.target === target) {
      editor.write({rotation})
    }
  }
}

// 设置控制点
UI.setControlPoint = function (point) {
  if (this.controlPointActive !== point) {
    this.controlPointActive = point
    const points = this.controlPoints
    let cursor
    switch (point) {
      case null:
        cursor = ''
        break
      case points.rotate.TL:
      case points.rotate.TR:
      case points.rotate.BL:
      case points.rotate.BR:
        cursor = 'alias'
        break
      case points.resize.T:
      case points.resize.L:
      case points.resize.R:
      case points.resize.B:
      case points.resize.TL:
      case points.resize.TR:
      case points.resize.BL:
      case points.resize.BR: {
        const angle = Math.modDegrees(point.angle + this.controlPointRotation, 180)
        if (angle < 22.5 || angle >= 157.5) {
          cursor = 'ew-resize'
        } else if (angle < 67.5) {
          cursor = 'nwse-resize'
        } else if (angle < 112.5) {
          cursor = 'ns-resize'
        } else {
          cursor = 'nesw-resize'
        }
        break
      }
    }
    this.body.style.cursor = cursor
  }
}

// 更新悬停对象
UI.updateHover = function () {
  if (this.hover &&
    !this.hover.instance) {
    this.setHover(null)
  }
}

// 更新目标对象
UI.updateTarget = function () {
  const item = this.list.read()
  if (item !== this.target) {
    this.setTarget(item)
  }
}

// 更新目标对象列表项
UI.updateTargetItem = function () {
  const {target} = this
  if (target !== null) {
    const {list} = this
    if (list.read() !== target) {
      list.selectWithNoEvent(target)
      if (target) {
        list.expandToSelection()
        list.scrollToSelection()
      }
    }
  }
}

// 更新元素字体
UI.updateElementFont = function () {
  if (this.state === 'open') {
    if (this.context.fontChanged) {
      delete this.context.fontChanged
    }
    const TextElement = UI.Text
    const TextBoxElement = UI.TextBox
    const DialogBoxElement = UI.DialogBox
    const update = element => {
      if ((element instanceof TextElement ||
        element instanceof TextBoxElement ||
        element instanceof DialogBoxElement) &&
        element.printer !== null) {
        element.printer.reset()
        if (element._font === '') {
          element._font = undefined
          element.font = ''
        }
        this.requestRendering()
      }
      const children = element.children
      const length = children.length
      for (let i = 0; i < length; i++) {
        update(children[i])
      }
    }
    update(this.root)
  }
}

// 更新索引颜色
UI.updateIndexedColor = function (index) {
  if (this.state === 'open') {
    const TextElement = UI.Text
    const regexp = new RegExp(`<color:${index}>`, 'i')
    const update = element => {
      if (element instanceof TextElement &&
        regexp.test(element.content)) {
        element.printer.reset()
        this.requestRendering()
      }
      const children = element.children
      const length = children.length
      for (let i = 0; i < length; i++) {
        update(children[i])
      }
    }
    update(this.root)
  }
}

// 更新控制点
UI.updateControlPoints = function () {
  if (this.target !== null) {
    const POINT_RADIUS = 4 / this.scale
    const {instance} = this.target
    const points = this.controlPoints
    const matrix = instance.matrix
    const L = instance.x
    const T = instance.y
    const R = L + instance.width
    const B = T + instance.height
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = a * L + c * T + e
    const y1 = b * L + d * T + f
    const x2 = a * L + c * B + e
    const y2 = b * L + d * B + f
    const x3 = a * R + c * B + e
    const y3 = b * R + d * B + f
    const x4 = a * R + c * T + e
    const y4 = b * R + d * T + f
    const angle1 = Math.atan2(y1 - y2, x1 - x2)
    const angle2 = Math.atan2(y2 - y3, x2 - x3)
    const angle3 = Math.atan2(y3 - y4, x3 - x4)
    const angle4 = Math.atan2(y4 - y1, x4 - x1)
    const ox1 = -Math.cos(angle3) * POINT_RADIUS
    const oy1 = Math.sin(angle1) * POINT_RADIUS
    const ox2 = -Math.cos(angle4) * POINT_RADIUS
    const oy2 = Math.sin(angle2) * POINT_RADIUS
    const ox3 = Math.cos(angle3) * POINT_RADIUS
    const oy3 = Math.sin(angle3) * POINT_RADIUS
    const ox4 = Math.cos(angle4) * POINT_RADIUS
    const oy4 = Math.sin(angle4) * POINT_RADIUS

    // 旋转控制点: 左上|右上|左下|右下
    const {rotate} = points
    rotate.TL.x = x1 + (ox1 - ox4) * 3
    rotate.TL.y = y1 + (oy1 - oy4) * 3
    rotate.TR.x = x4 + (ox4 - ox3) * 3
    rotate.TR.y = y4 + (oy4 - oy3) * 3
    rotate.BL.x = x2 + (ox2 - ox1) * 3
    rotate.BL.y = y2 + (oy2 - oy1) * 3
    rotate.BR.x = x3 + (ox3 - ox2) * 3
    rotate.BR.y = y3 + (oy3 - oy2) * 3
    // 调整控制点: 上|左|右|下|左上|右上|左下|右下
    const {resize} = points
    resize.T.x = (x4 + x1) / 2 + ox1
    resize.T.y = (y4 + y1) / 2 + oy1
    resize.L.x = (x1 + x2) / 2 + ox2
    resize.L.y = (y1 + y2) / 2 + oy2
    resize.R.x = (x3 + x4) / 2 + ox4
    resize.R.y = (y3 + y4) / 2 + oy4
    resize.B.x = (x2 + x3) / 2 + ox3
    resize.B.y = (y2 + y3) / 2 + oy3
    resize.TL.x = x1 + ox1 - ox4
    resize.TL.y = y1 + oy1 - oy4
    resize.TR.x = x4 + ox4 - ox3
    resize.TR.y = y4 + oy4 - oy3
    resize.BL.x = x2 + ox2 - ox1
    resize.BL.y = y2 + oy2 - oy1
    resize.BR.x = x3 + ox3 - ox2
    resize.BR.y = y3 + oy3 - oy2
    let element = instance
    let rotation = element.transform.rotation
    while ((element = element.parent)?.transform) {
      rotation += element.transform.rotation
    }
    this.controlPointRotation = rotation
  }
}

// 更新节点元素
UI.updateElement = function (target) {
  let nodes
  let instance
  if (this.nodes.includes(target)) {
    nodes = this.nodes
    instance = this.root
  } else {
    // 递归查找父节点
    const find = node => {
      const children = node.children
      if (children.includes(target)) {
        return node
      }
      for (const child of children) {
        const result = find(child)
        if (result) {
          return result
        }
      }
      return null
    }
    const node = find({
      instance: this.root,
      children: this.nodes,
    })
    if (node) {
      nodes = node.children
      instance = node.instance
    }
  }
  if (instance) {
    instance.appendChildTo(
      target.instance,
      nodes.indexOf(target),
    )
  }
  this.requestRendering()
}

// 删除节点元素
UI.deleteElement = function (target) {
  target.instance.remove()
  target.instance.destroy()
}

// 更新头部位置
UI.updateHead = function () {
  const {page, head} = this
  if (page.clientWidth !== 0) {
    // 调整左边位置
    const {nav} = Layout.getGroupOfElement(head)
    const nRect = nav.rect()
    const iRect = nav.lastChild.rect()
    const left = iRect.right - nRect.left
    if (head.left !== left) {
      head.left = left
      head.style.left = `${left}px`
    }
    // 调整居中组件的位置
    // const width = nRect.right - iRect.right
    // if (head.width !== width) {
    //   head.width = width
    //   const [start, center, end] = head.children
    //   end.style.marginLeft = '0'
    //   const sRect = start.rect()
    //   const cRect = center.rect()
    //   const eRect = end.rect()
    //   const spacing = eRect.left - sRect.right - cRect.width
    //   const difference = sRect.right - nRect.left - eRect.width
    //   const margin = Math.min(spacing, difference)
    //   end.style.marginLeft = `${margin}px`
    // }
  }
}

// 调整大小
UI.resize = function () {
  if (this.state === 'open' &&
    this.screen.clientWidth !== 0) {
    const scale = this.scale
    const scaledPadding = Math.round(this.padding * scale)
    const innerWidth = Math.round(this.width * scale / 2) * 2
    const innerHeight = Math.round(this.height * scale / 2) * 2
    const screenBox = CSS.getDevicePixelContentBoxSize(this.screen)
    const screenWidth = screenBox.width
    const screenHeight = screenBox.height
    const paddingLeft = Math.max(screenWidth - innerWidth >> 1, scaledPadding)
    const paddingTop = Math.max(screenHeight - innerHeight >> 1, scaledPadding)
    const paddingRight = Math.max(screenWidth - innerWidth - paddingLeft, scaledPadding)
    const paddingBottom = Math.max(screenHeight - innerHeight - paddingTop, scaledPadding)
    const outerWidth = innerWidth + paddingLeft + paddingRight
    const outerHeight = innerHeight + paddingTop + paddingBottom
    const dpr = window.devicePixelRatio
    this.scaleX = innerWidth / this.width
    this.scaleY = innerHeight / this.height
    this.outerWidth = outerWidth
    this.outerHeight = outerHeight
    this.centerOffsetX = outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2
    this.centerOffsetY = outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2
    this.paddingLeft = paddingLeft
    this.paddingTop = paddingTop
    this.marquee.style.width = `${outerWidth / dpr}px`
    this.marquee.style.height = `${outerHeight / dpr}px`
    GL.resize(screenWidth, screenHeight)
    this.updateCamera()
    this.updateTransform()
    this.root.resize()
    this.marquee.resize()
    this.screen.updateScrollbars()
  }
}

// 获取指针坐标
UI.getPointerCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (event) {
    const coords = event.getRelativeCoords(this.marquee)
    const dpr = window.devicePixelRatio
    point.x = (coords.x * dpr - this.paddingLeft) / this.scaleX
    point.y = (coords.y * dpr - this.paddingTop) / this.scaleY
    return point
  }
}()

// 更新摄像机位置
UI.updateCamera = function (x = this.centerX, y = this.centerY) {
  const dpr = window.devicePixelRatio
  const screen = this.screen
  const scrollX = x * this.scaleX + this.paddingLeft
  const scrollY = y * this.scaleY + this.paddingTop
  const toleranceForDPR = 0.0001
  screen.rawScrollLeft = Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr
  screen.rawScrollTop = Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr
  screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceForDPR) / dpr
  screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceForDPR) / dpr
}

// 更新变换参数
UI.updateTransform = function () {
  const dpr = window.devicePixelRatio
  const screen = this.screen
  const left = Math.roundTo(screen.scrollLeft * dpr - this.paddingLeft, 4)
  const top = Math.roundTo(screen.scrollTop * dpr - this.paddingTop, 4)
  const right = left + GL.width
  const bottom = top + GL.height
  this.scrollLeft = left / this.scaleX
  this.scrollTop = top / this.scaleY
  this.scrollRight = right / this.scaleX
  this.scrollBottom = bottom / this.scaleY
  this.matrix.reset()
  .scale(this.scaleX, this.scaleY)
  .translate(-this.scrollLeft, -this.scrollTop)
  const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX
  const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY
  this.centerX = Math.roundTo((scrollX - this.paddingLeft) / this.scaleX, 4)
  this.centerY = Math.roundTo((scrollY - this.paddingTop) / this.scaleY, 4)
}

// 设置预设对象ID
UI.setPresetId = function IIFE() {
  const generatePresetId = () => {
    const {uiLinks} = Data
    let id
    do {id = GUID.generate64bit()}
    while (id in uiLinks)
    uiLinks[id] = UI.meta.guid
    return id
  }
  const setPresetId = item => {
    const {uiLinks} = Data
    const {presetId} = item
    if (presetId === '' || presetId in uiLinks) {
      item.presetId = generatePresetId()
    } else {
      uiLinks[presetId] = UI.meta.guid
    }
    for (const child of item.children) {
      setPresetId(child)
    }
  }
  return function (item) {
    setPresetId(item)
  }
}()

// 解除预设对象ID的链接
UI.unlinkPresetId = function IIFE() {
  const unlinkPresetId = item => {
    delete Data.uiLinks[item.presetId]
    for (const child of item.children) {
      unlinkPresetId(child)
    }
  }
  return function (item) {
    unlinkPresetId(item)
  }
}()

// 加载元素
UI.loadElement = function (node, parent) {
  let instance
  switch (node.class) {
    case 'image':
      instance = new UI.Image(node)
      break
    case 'text':
      instance = new UI.Text(node)
      break
    case 'textbox':
      instance = new UI.TextBox(node)
      break
    case 'dialogbox':
      instance = new UI.DialogBox(node)
      break
    case 'progressbar':
      instance = new UI.ProgressBar(node)
      break
    case 'video':
      instance = new UI.Video(node)
      break
    case 'window':
      instance = new UI.Window(node)
      break
    case 'container':
      instance = new UI.Container(node)
      break
  }
  if (parent !== undefined) {
    parent.appendChild(instance)
  }
  instance.node = node
  Object.defineProperty(
    node, 'instance', {
      configurable: true,
      value: instance,
    }
  )
  for (const child of node.children) {
    UI.loadElement(child, instance)
  }
}

// 绘制背景
UI.drawBackground = function () {
  const gl = GL
  gl.clearColor(...this.background.getGLRGBA())
  gl.clear(gl.COLOR_BUFFER_BIT)
}

// 绘制元素
UI.drawElements = function () {
  this.root.draw()
}

// 绘制坐标轴
UI.drawCoordinateAxes = function () {
  if (this.target !== null) {
    const {parent} = this.target.instance
    const gl = GL
    const vertices = gl.arrays[0].float32
    const matrix = gl.matrix
    .set(UI.matrix)
    .multiply(parent.matrix)
    const PL = parent.x
    const PT = parent.y
    const PR = PL + parent.width
    const PB = PT + parent.height
    const TL = PL - 10000 / this.scaleX
    const TT = PT - 10000 / this.scaleY
    const TR = PR + 10000 / this.scaleX
    const TB = PB + 10000 / this.scaleY
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = a * TL + c * PT + e
    const y1 = b * TL + d * PT + f
    const x2 = a * TR + c * PT + e
    const y2 = b * TR + d * PT + f
    const x3 = a * TL + c * PB + e
    const y3 = b * TL + d * PB + f
    const x4 = a * TR + c * PB + e
    const y4 = b * TR + d * PB + f
    const x5 = a * PL + c * TT + e
    const y5 = b * PL + d * TT + f
    const x6 = a * PL + c * TB + e
    const y6 = b * PL + d * TB + f
    const x7 = a * PR + c * TT + e
    const y7 = b * PR + d * TT + f
    const x8 = a * PR + c * TB + e
    const y8 = b * PR + d * TB + f
    vertices[0] = x1
    vertices[1] = y1 + 0.5
    vertices[2] = 0
    vertices[3] = x2
    vertices[4] = y2 + 0.5
    vertices[5] = Math.dist(x1, y1, x2, y2)
    vertices[6] = x3
    vertices[7] = y3 + 0.5
    vertices[8] = 0
    vertices[9] = x4
    vertices[10] = y4 + 0.5
    vertices[11] = Math.dist(x3, y3, x4, y4)
    vertices[12] = x5 + 0.5
    vertices[13] = y5
    vertices[14] = 0
    vertices[15] = x6 + 0.5
    vertices[16] = y6
    vertices[17] = Math.dist(x5, y5, x6, y6)
    vertices[18] = x7 + 0.5
    vertices[19] = y7
    vertices[20] = 0
    vertices[21] = x8 + 0.5
    vertices[22] = y8
    vertices[23] = Math.dist(x7, y7, x8, y8)
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.alpha = 1
    gl.blend = 'normal'
    const program = gl.dashedLineProgram.use()
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform4f(program.u_Color, 0.5, 0, 1, 1)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 24)
    gl.drawArrays(gl.LINES, 0, 8)
  }
}

// 绘制悬停元素线框
UI.drawHoverWireframe = function () {
  if (this.hover !== null &&
    this.hover !== this.target) {
    const {instance} = this.hover
    if (instance.visible) {
      instance.drawWireframe(0xffffffff)
    }
  }
}

// 绘制目标元素线框
UI.drawTargetWireframe = function () {
  if (this.target !== null) {
    const {instance} = this.target
    instance.drawWireframe(0xffc0ff00)
  }
}

// 绘制目标元素锚点
UI.drawTargetAnchor = function () {
  if (this.target !== null) {
    const {instance} = this.target
    const gl = GL
    const vertices = gl.arrays[0].float32
    const matrix = gl.matrix
    .set(UI.matrix)
    .multiply(instance.matrix)
    const transform = instance.transform
    const X = instance.x + instance.width * transform.anchorX
    const Y = instance.y + instance.height * transform.anchorY
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x = a * X + c * Y + e
    const y = b * X + d * Y + f
    vertices[0] = x + 0.5 - 8
    vertices[1] = y + 0.5
    vertices[2] = x + 0.5 + 9
    vertices[3] = y + 0.5
    vertices[4] = x + 0.5
    vertices[5] = y + 0.5 - 8
    vertices[6] = x + 0.5
    vertices[7] = y + 0.5 + 9
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.alpha = 1
    gl.blend = 'normal'
    const program = gl.graphicProgram.use()
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8)
    gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1)
    gl.drawArrays(gl.LINES, 0, 4)
  }
}

// 绘制控制点
UI.drawControlPoints = function () {
  const target = this.target
  const texture = this.controlPointTexture
  if (target !== null && texture !== null) {
    this.updateControlPoints()
    const POINT_RADIUS = 4 / this.scale
    const gl = GL
    const vertices = gl.arrays[0].float32
    let vi = 0
    const {list} = this.controlPoints
    const length = list.length
    for (let i = 4; i < length; i++) {
      const {x, y} = list[i]
      const dl = x - POINT_RADIUS
      const dt = y - POINT_RADIUS
      const dr = x + POINT_RADIUS
      const db = y + POINT_RADIUS
      vertices[vi    ] = dl
      vertices[vi + 1] = dt
      vertices[vi + 2] = 0
      vertices[vi + 3] = 0
      vertices[vi + 4] = dl
      vertices[vi + 5] = db
      vertices[vi + 6] = 0
      vertices[vi + 7] = 1
      vertices[vi + 8] = dr
      vertices[vi + 9] = db
      vertices[vi + 10] = 1
      vertices[vi + 11] = 1
      vertices[vi + 12] = dr
      vertices[vi + 13] = dt
      vertices[vi + 14] = 1
      vertices[vi + 15] = 0
      vi += 16
    }
    gl.blend = 'normal'
    const program = gl.imageProgram.use()
    const matrix = gl.matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    ).multiply(UI.matrix)
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform1i(program.u_LightMode, 0)
    gl.uniform1i(program.u_ColorMode, 0)
    gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
    gl.drawElements(gl.TRIANGLES, vi / 16 * 6, gl.UNSIGNED_INT, 0)
  }
}

// 选择控制点
UI.selectControlPoint = function (x, y) {
  if (this.target !== null) {
    const radius = 6 / this.scale
    const {list} = this.controlPoints
    for (let i = list.length - 1; i >= 0; i--) {
      const point = list[i]
      const sx = point.x - radius
      const ex = point.x + radius
      const sy = point.y - radius
      const ey = point.y + radius
      if (x >= sx && x < ex && y >= sy && y < ey) {
        return point
      }
    }
  }
  return null
}

// 选择对象
UI.selectObject = function IIFE() {
  // 递归查找
  const find = (elements, x, y) => {
    const length = elements.length
    for (let i = length - 1; i >= 0; i--) {
      const element = elements[i]
      const target = find(element.children, x, y)
      if (target) return target
      if (element.visible &&
        !element.node.locked &&
        element.isPointIn(x, y)) {
        return element.node
      }
    }
    return null
  }
  return function (x, y) {
    return find(this.root.children, x, y)
  }
}()

// 请求渲染
UI.requestRendering = function () {
  if (this.state === 'open') {
    Timer.appendUpdater('stageRendering', this.renderingFunction)
  }
}

// 渲染函数
UI.renderingFunction = function () {
  if (GL.width * GL.height !== 0) {
    UI.drawBackground()
    UI.drawElements()
    UI.drawCoordinateAxes()
    UI.drawHoverWireframe()
    UI.drawTargetWireframe()
    UI.drawTargetAnchor()
    UI.drawControlPoints()
  }
}

// 停止渲染
UI.stopRendering = function () {
  Timer.removeUpdater('stageRendering', this.renderingFunction)
}

// 开关设置
UI.switchSettings = function () {
  if (!Inspector.fileUI.button.hasClass('selected')) {
    Inspector.open('fileUI', UI)
  } else {
    Inspector.close()
  }
}

// 更新字体
UI.updateFont = function () {
  const context = GL.context2d
  const font = Data.config.font
  const {pixelated, threshold} = font
  if (context.mode !== 'ui' ||
    context.pixelated !== pixelated ||
    context.threshold !== threshold) {
    context.mode = 'ui'
    context.pixelated = pixelated
    context.threshold = threshold
    const program = GL.textProgram.use()
    GL.uniform1f(program.u_Threshold, pixelated ? threshold / 255 : 0)
    return true
  }
  return false
}

// 计划保存
UI.planToSave = function () {
  File.planToSave(this.meta)
}

// 保存状态到配置文件
UI.saveToConfig = function (config) {
  config.colors.uiBackground = this.background.hex
  config.colors.uiForeground = this.foreground.hex
}

// 从配置文件中加载状态
UI.loadFromConfig = function (config) {
  this.background = new StageColor(
    config.colors.uiBackground,
    () => this.requestRendering(),
  )
  this.foreground = new StageColor(
    config.colors.uiForeground,
    () => {
      if (this.state === 'open') {
        this.root.resize()
        this.requestRendering()
      }
    },
  )
}

// 保存状态到项目文件
UI.saveToProject = function (project) {
  const {ui} = project
  ui.zoom = this.zoom ?? ui.zoom
}

// 从项目文件中加载状态
UI.loadFromProject = function (project) {
  const {ui} = project
  this.setZoom(ui.zoom)
}

// WebGL - 上下文恢复事件
UI.webglRestored = function (event) {
  if (UI.state === 'open') {
    UI.requestRendering()
  }
}

// 窗口 - 调整大小事件
UI.windowResize = function (event) {
  this.updateHead()
  if (this.state === 'open') {
    this.resize()
    this.updateCamera()
    this.requestRendering()
  }
}.bind(UI)

// 主题改变事件
UI.themechange = function (event) {
  this.requestRendering()
}.bind(UI)

// 数据改变事件
UI.datachange = function (event) {
  if (event.key === 'config' &&
    UI.state === 'open' &&
    UI.updateFont()) {
    UI.updateElementFont()
  }
}

// 键盘按下事件
UI.keydown = function (event) {
  if (UI.state === 'open' &&
    UI.dragging === null) {
    if (event.cmdOrCtrlKey) {
      return
    } else if (event.altKey) {
      switch (event.code) {
        case 'KeyS':
          UI.switchSettings()
          break
      }
    } else {
      return
    }
  }
}

// 头部 - 指针按下事件
UI.headPointerdown = function (event) {
  if (!(event.target instanceof HTMLInputElement)) {
    event.preventDefault()
    if (document.activeElement !== UI.screen) {
      UI.screen.focus()
    }
  }
}

// 开关 - 指针按下事件
UI.switchPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'ITEM') {
        switch (element.getAttribute('value')) {
          case 'settings':
            return UI.switchSettings()
        }
      }
      break
    }
  }
}

// 缩放 - 获得焦点事件
UI.zoomFocus = function (event) {
  UI.screen.focus()
}

// 缩放 - 输入事件
UI.zoomInput = function (event) {
  UI.setZoom(this.read())
}

// 屏幕 - 键盘按下事件
UI.screenKeydown = function (event) {
  if (this.state === 'open' &&
    this.dragging === null) {
    if (event.cmdOrCtrlKey) {
      switch (event.code) {
        case 'KeyX':
          this.copy()
          this.delete()
          return
        case 'KeyC':
          this.copy()
          return
        case 'KeyV':
          this.paste()
          return
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
          break
        default:
          return
      }
    }
    if (event.altKey) {
      return
    }
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        this.revealTarget()
        break
      case 'Slash':
        this.toggle()
        break
      case 'Delete':
        this.delete()
        break
      case 'Escape':
        this.setTarget(null)
        break
      case 'KeyA':
        if ((this.translationKey & 0b0001) === 0) {
          this.translationKey |= 0b0001
          this.translationTimer.add()
          this.screen.beginScrolling()
          window.on('keyup', this.translationKeyup)
        }
        break
      case 'KeyW':
        if ((this.translationKey & 0b0010) === 0) {
          this.translationKey |= 0b0010
          this.translationTimer.add()
          this.screen.beginScrolling()
          window.on('keyup', this.translationKeyup)
        }
        break
      case 'KeyD':
        if ((this.translationKey & 0b0100) === 0) {
          this.translationKey |= 0b0100
          this.translationTimer.add()
          this.screen.beginScrolling()
          window.on('keyup', this.translationKeyup)
        }
        break
      case 'KeyS':
        if ((this.translationKey & 0b1000) === 0) {
          this.translationKey |= 0b1000
          this.translationTimer.add()
          this.screen.beginScrolling()
          window.on('keyup', this.translationKeyup)
        }
        break
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
        if (this.target !== null) {
          event.preventDefault()
          const transform = this.target.transform
          let offsetX = 0
          let offsetY = 0
          switch (event.code) {
            case 'ArrowLeft':  offsetX = -1; break
            case 'ArrowUp':    offsetY = -1; break
            case 'ArrowRight': offsetX = +1; break
            case 'ArrowDown':  offsetY = +1; break
          }
          if (event.cmdOrCtrlKey) {
            const ax = Math.roundTo(transform.anchorX - offsetX * 0.5, 4)
            const ay = Math.roundTo(transform.anchorY - offsetY * 0.5, 4)
            return this.shiftAnchor(ax, ay)
          }
          if (event.shiftKey) {
            offsetX *= 10
            offsetY *= 10
          }
          const x = Math.roundTo(transform.x + offsetX, 4)
          const y = Math.roundTo(transform.y + offsetY, 4)
          this.shiftTarget(x, y)
        }
        break
      case 'Minus':
      case 'NumpadSubtract':
        this.setZoom(this.zoom - 1)
        break
      case 'Equal':
      case 'NumpadAdd':
        this.setZoom(this.zoom + 1)
        break
      case 'Digit0':
      case 'Numpad0':
        this.setZoom(2)
        break
    }
  }
}.bind(UI)

// 位移键弹起事件
UI.translationKeyup = function (event) {
  if (this.translationKey === 0b0000) {
    return
  }
  if (event === undefined) {
    this.translationKey = 0b0000
  } else {
    switch (event.code) {
      case 'KeyA':
        this.translationKey &= 0b1110
        break
      case 'KeyW':
        this.translationKey &= 0b1101
        break
      case 'KeyD':
        this.translationKey &= 0b1011
        break
      case 'KeyS':
        this.translationKey &= 0b0111
        break
    }
  }
  if (this.translationKey === 0b0000) {
    this.translationTimer.remove()
    this.screen.endScrolling()
    window.off('keyup', this.translationKeyup)
  }
}.bind(UI)

// 屏幕 - 鼠标滚轮事件
UI.screenWheel = function (event) {
  if (this.state === 'open' &&
    this.dragging === null) {
    event.preventDefault()
    if (event.deltaY !== 0) {
      const step = event.deltaY > 0 ? -1 : 1
      this.setZoom(this.zoom + step)
    }
  }
}.bind(UI)

// 屏幕 - 用户滚动事件
UI.screenUserscroll = function (event) {
  if (this.state === 'open') {
    this.screen.rawScrollLeft = this.screen.scrollLeft
    this.screen.rawScrollTop = this.screen.scrollTop
    this.updateTransform()
    this.requestRendering()
    this.marquee.resize()
    this.screen.updateScrollbars()
  }
}.bind(UI)

// 屏幕 - 失去焦点事件
UI.screenBlur = function (event) {
  this.translationKeyup()
  this.pointerup()
  // this.marqueePointerleave()
}.bind(UI)

// 选框 - 指针按下事件
UI.marqueePointerdown = function (event) {
  if (this.dragging) {
    return
  }
  switch (event.button) {
    case 0: {
      if (event.altKey) {
        this.dragging = event
        event.mode = 'scroll'
        event.scrollLeft = this.screen.scrollLeft
        event.scrollTop = this.screen.scrollTop
        Cursor.open('cursor-grab')
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        return
      }
      if (this.controlPointActive && this.target) {
        const {transform} = this.target
        const points = this.controlPoints
        this.dragging = event
        switch (this.controlPointActive) {
          case points.rotate.TL:
          case points.rotate.TR:
          case points.rotate.BL:
          case points.rotate.BR: {
            const {instance} = this.target
            const matrix = Matrix.instance
            .set(UI.matrix)
            .multiply(instance.matrix)
            const X = instance.x + instance.width * transform.anchorX
            const Y = instance.y + instance.height * transform.anchorY
            const a = matrix[0]
            const b = matrix[1]
            const c = matrix[3]
            const d = matrix[4]
            const e = matrix[6]
            const f = matrix[7]
            const ax = a * X + c * Y + e
            const ay = b * X + d * Y + f
            const {x, y} = event.getRelativeCoords(GL.canvas)
            event.mode = 'object-rotate'
            event.absoluteAnchorX = ax
            event.absoluteAnchorY = ay
            event.lastAngle = Math.atan2(y - ay, x - ax)
            event.rotationRadians = 0
            event.startRotation = transform.rotation
            break
          }
          case points.resize.T:
          case points.resize.L:
          case points.resize.R:
          case points.resize.B:
          case points.resize.TL:
          case points.resize.TR:
          case points.resize.BL:
          case points.resize.BR:
            event.mode = 'object-resize'
            event.startWidth = transform.width
            event.startHeight = transform.height
            break
        }
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        return
      }
      const {x, y} = this.getPointerCoords(event)
      const object = this.selectObject(x, y)
      if (object) {
        this.dragging = event
        event.mode = 'object-move'
        event.enabled = false
        event.startX = object.transform.x
        event.startY = object.transform.y
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      this.setTarget(object)
      break
    }
    case 2:
      this.dragging = event
      event.mode = 'ready-to-scroll'
      event.scrollLeft = this.screen.scrollLeft
      event.scrollTop = this.screen.scrollTop
      window.on('pointerup', this.pointerup)
      window.on('pointermove', this.pointermove)
      break
  }
}.bind(UI)

// 选框 - 指针移动事件
UI.marqueePointermove = function (event) {
  if (!this.dragging) {
    this.marquee.pointerevent = event
    const {x, y} = this.getPointerCoords(event)
    if (this.target) {
      const point = this.selectControlPoint(x, y)
      if (point) {
        this.setHover(null)
        this.setControlPoint(point)
        return
      }
    }
    if (this.controlPointActive) {
      this.setControlPoint(null)
    }
    const object = this.selectObject(x, y)
    this.setHover(object)
  }
}.bind(UI)

// 选框 - 指针离开事件
UI.marqueePointerleave = function (event) {
  if (this.marquee.pointerevent) {
    this.marquee.pointerevent = null
    this.setHover(null)
  }
}.bind(UI)

// 选框 - 鼠标双击事件
UI.marqueeDoubleclick = function (event) {
  if (this.target) {
    this.screenBlur()
    this.revealTarget()
  }
}.bind(UI)

// 指针弹起事件
UI.pointerup = function (event) {
  const {dragging} = this
  if (dragging === null) {
    return
  }
  if (event === undefined) {
    event = dragging
  }
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'object-rotate':
      case 'object-resize':
      case 'object-move':
        break
      case 'ready-to-scroll':
        if (event.target === this.marquee) {
          const {x, y} = this.getPointerCoords(event)
          const object = this.selectObject(x, y)
          this.setTarget(object)
          this.menuPopup(event)
        }
        break
      case 'scroll':
        this.screen.endScrolling()
        Cursor.close('cursor-grab')
        break
    }
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(UI)

// 指针移动事件
UI.pointermove = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'object-rotate':
        if (this.target) {
          const {x, y} = event.getRelativeCoords(GL.canvas)
          const distX = x - dragging.absoluteAnchorX
          const distY = y - dragging.absoluteAnchorY
          const currentAngle = Math.atan2(distY, distX)
          const angle = Math.modRadians(currentAngle - dragging.lastAngle)
          dragging.rotationRadians += angle < Math.PI ? angle : angle - Math.PI * 2
          let rotation = Math.round(dragging.startRotation + Math.degrees(dragging.rotationRadians))
          if (event.shiftKey) {
            rotation = Math.round(rotation / 15) * 15
          }
          const transform = this.target.transform
          if (transform.rotation !== rotation) {
            this.rotateTarget(rotation)
          }
          dragging.lastAngle = currentAngle
        }
        break
      case 'object-resize':
        if (this.target) {
          const {instance} = this.target
          const {parent, transform} = instance
          const points = this.controlPoints
          const point = this.controlPointActive
          const angle = Math.radians(point.angle + this.controlPointRotation)
          const distX = (event.clientX - dragging.clientX) / this.scaleX
          const distY = (event.clientY - dragging.clientY) / this.scaleY
          const dist = Math.sqrt(distX ** 2 + distY ** 2)
          const distAngle = Math.atan2(distY, distX)
          const scaleX = Math.abs(transform.scaleX) || 1
          const scaleY = Math.abs(transform.scaleY) || 1
          let width = undefined
          let height = undefined
          switch (point) {
            case points.resize.T:
            case points.resize.L:
            case points.resize.R:
            case points.resize.B: {
              const offset = dist * Math.cos(distAngle - angle)
              switch (point) {
                case points.resize.T:
                case points.resize.B:
                  height = offset / scaleY
                  break
                case points.resize.L:
                case points.resize.R:
                  width = offset / scaleX
                  break
              }
              break
            }
            case points.resize.TL:
            case points.resize.TR:
            case points.resize.BL:
            case points.resize.BR:
              if (event.shiftKey) {
                const rectWidth = dragging.startWidth + parent.width * transform.width2
                const rectHeight = dragging.startHeight + parent.height * transform.height2
                const aspectAngle = Math.atan2(rectHeight, rectWidth)
                let startAngle
                switch (point) {
                  case points.resize.TL:
                  case points.resize.BR:
                    startAngle = angle - Math.PI / 4 + aspectAngle
                    break
                  case points.resize.TR:
                  case points.resize.BL:
                    startAngle = angle + Math.PI / 4 - aspectAngle
                    break
                }
                const includedAngle = distAngle - startAngle
                const offset = dist * Math.cos(includedAngle)
                const offsetX = offset * Math.cos(aspectAngle)
                const offsetY = offset * Math.sin(aspectAngle)
                width = offsetX / scaleX
                height = offsetY / scaleY
              } else {
                const startAngle = angle - Math.PI / 4
                const includedAngle = distAngle - startAngle
                const offsetX = dist * Math.cos(includedAngle)
                const offsetY = dist * Math.sin(includedAngle)
                switch (point) {
                  case points.resize.TL:
                  case points.resize.BR:
                    width = offsetX / scaleX
                    height = offsetY / scaleY
                    break
                  case points.resize.TR:
                  case points.resize.BL:
                    width = offsetY / scaleY
                    height = offsetX / scaleX
                    break
                }
              }
              break
          }
          if (width !== undefined) {
            const minWidth = -Math.ceil(parent.width * transform.width2)
            width = Math.max(Math.round(dragging.startWidth + width), minWidth)
          }
          if (height !== undefined) {
            const minHeight = -Math.ceil(parent.height * transform.height2)
            height = Math.max(Math.round(dragging.startHeight + height), minHeight)
          }
          if (width !== undefined && transform.width !== width ||
            height !== undefined && transform.height !== height) {
            this.resizeTarget(width, height)
          }
        }
        break
      case 'object-move':
        if (!dragging.enabled) {
          const distX = event.clientX - dragging.clientX
          const distY = event.clientY - dragging.clientY
          if (Math.sqrt(distX ** 2 + distY ** 2) > 4 ||
            event.timeStamp - dragging.timeStamp >= 500) {
            dragging.enabled = true
          } else {
            break
          }
        }
        if (this.target) {
          const transform = this.target.transform
          const distX = (event.clientX - dragging.clientX) / this.scaleX
          const distY = (event.clientY - dragging.clientY) / this.scaleY
          let x
          let y
          if (event.shiftKey) {
            const angle = Math.atan2(distY, distX)
            const directions = 4
            const proportion = Math.modRadians(angle) / (Math.PI * 2)
            const section = (proportion * directions + 0.5) % directions
            switch (Math.floor(section)) {
              case 0: case 2:
                x = Math.round(dragging.startX + distX)
                y = dragging.startY
                break
              case 1: case 3:
                x = dragging.startX
                y = Math.round(dragging.startY + distY)
                break
            }
          } else {
            x = Math.round(dragging.startX + distX)
            y = Math.round(dragging.startY + distY)
          }
          if (transform.x !== x || transform.y !== y) {
            this.shiftTarget(x, y)
          }
        }
        break
      case 'ready-to-scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        this.screen.setScroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
          dragging.mode = 'scroll'
          Cursor.open('cursor-grab')
        }
        break
      }
      case 'scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        this.screen.beginScrolling()
        this.screen.setScroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        break
      }
    }
  }
}.bind(UI)

// 菜单 - 弹出事件
UI.menuPopup = function (event) {
  this.translationKeyup()
  const {x, y} = this.getPointerCoords(event)
  const target = this.target
  const selected = !!target
  const pastable = Clipboard.has('yami.ui.object')
  const get = Local.createGetter('menuUI')
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('create'),
    submenu: [{
      label: get('create.image'),
      click: () => {
        this.create('image', x, y)
      },
    }, {
      label: get('create.text'),
      click: () => {
        this.create('text', x, y)
      },
    }, {
      label: get('create.textBox'),
      click: () => {
        this.create('textbox', x, y)
      },
    }, {
      label: get('create.dialogBox'),
      click: () => {
        this.create('dialogbox', x, y)
      },
    }, {
      label: get('create.progressBar'),
      click: () => {
        this.create('progressbar', x, y)
      },
    }, {
      label: get('create.video'),
      click: () => {
        this.create('video', x, y)
      },
    }, {
      label: get('create.window'),
      click: () => {
        this.create('window', x, y)
      },
    }, {
      label: get('create.container'),
      click: () => {
        this.create('container', x, y)
      },
    }],
  }, {
    label: get('toggle'),
    accelerator: '/',
    enabled: selected,
    click: () => {
      this.toggle()
    },
  }, {
    type: 'separator',
  }, {
    label: get('cut'),
    accelerator: ctrl('X'),
    enabled: selected,
    click: () => {
      this.copy()
      this.delete()
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: selected,
    click: () => {
      this.copy()
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
    enabled: pastable,
    click: () => {
      this.paste(x, y)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: selected,
    click: () => {
      this.delete()
    },
  }, {
    label: get('copy-id'),
    enabled: selected,
    click: () => {
      navigator.clipboard.writeText(target.presetId)
    },
  }])
}

// 搜索框 - 输入事件
UI.searcherInput = function (event) {
  if (event.inputType !== 'insertCompositionText') {
    const text = this.input.value
    UI.list.searchNodes(text)
  }
}

// 列表 - 键盘按下事件
UI.listKeydown = function (event) {
  if (!this.data) {
    return
  }
  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyX':
        if (item) {
          this.copy(item)
          this.delete(item)
        }
        break
      case 'KeyC':
        this.copy(item)
        break
      case 'KeyV':
        this.paste(null)
        break
    }
  } else {
    switch (event.code) {
      case 'Slash':
        this.toggle(item)
        break
      case 'Delete':
        this.delete(item)
        break
      case 'Backspace':
        this.cancelSearch()
        break
      case 'Escape':
        UI.setTarget(null)
        break
    }
  }
}

// 列表 - 指针按下事件
UI.listPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      switch (element.tagName) {
        case 'VISIBILITY-ICON': {
          const {item} = element.parentNode
          const {instance, hidden} = item
          const backups1 = this.setRecursiveStates(item, 'hidden', !hidden)
          const backups2 = this.setRecursiveStates(instance, 'visible', hidden)
          const length = Math.max(backups1.length, backups2.length)
          for (let i = 0; i < length; i++) {
            if (backups1[i] === backups2[i]) {
              throw new Error('Failed to switch hidden state')
            }
          }
          this.update()
          this.dispatchChangeEvent()
          UI.requestRendering()
          UI.history.save({
            type: 'ui-object-hidden',
            item: item,
            oldValues1: backups1,
            oldValues2: backups2,
            newValue: !hidden,
          })
          break
        }
        case 'LOCK-ICON': {
          const {item} = element.parentNode
          const {locked} = item
          const backups = this.setRecursiveStates(item, 'locked', !locked)
          this.update()
          this.dispatchChangeEvent()
          UI.history.save({
            type: 'ui-object-locked',
            item: item,
            oldValues: backups,
            newValue: !locked,
          })
          break
        }
      }
      break
    }
    case 3:
      this.cancelSearch()
      break
  }
}

// 列表 - 选择事件
UI.listSelect = function (event) {
  UI.setTarget(event.value)
}

// 列表 - 记录事件
UI.listRecord = function (event) {
  const response = event.value
  switch (response.type) {
    case 'rename':
      UI.listRename(response)
      break
    case 'create':
      UI.history.save({
        type: 'ui-object-create',
        response: response,
      })
      break
    case 'delete':
      UI.history.save({
        type: 'ui-object-delete',
        response: response,
      })
      break
    case 'remove':
      UI.history.save({
        type: 'ui-object-remove',
        response: response,
      })
      break
  }
}

// 列表 - 菜单弹出事件
UI.listPopup = function (event) {
  const item = event.value
  const menuItems = []
  const get = Local.createGetter('menuUIList')
  let selected
  let copyable
  let pastable
  let deletable
  let renamable
  menuItems.push({
    label: get('create'),
    submenu: [{
      label: get('create.image'),
      click: () => {
        this.addNodeTo(Inspector.uiImage.create(), item)
      },
    }, {
      label: get('create.text'),
      click: () => {
        this.addNodeTo(Inspector.uiText.create(), item)
      },
    }, {
      label: get('create.textBox'),
      click: () => {
        this.addNodeTo(Inspector.uiTextBox.create(), item)
      },
    }, {
      label: get('create.dialogBox'),
      click: () => {
        this.addNodeTo(Inspector.uiDialogBox.create(), item)
      },
    }, {
      label: get('create.progressBar'),
      click: () => {
        this.addNodeTo(Inspector.uiProgressBar.create(), item)
      },
    }, {
      label: get('create.video'),
      click: () => {
        this.addNodeTo(Inspector.uiVideo.create(), item)
      },
    }, {
      label: get('create.window'),
      click: () => {
        this.addNodeTo(Inspector.uiWindow.create(), item)
      },
    }, {
      label: get('create.container'),
      click: () => {
        this.addNodeTo(Inspector.uiContainer.create(), item)
      },
    }],
  })
  if (item) {
    selected = true
    copyable = true
    pastable = Clipboard.has('yami.ui.object')
    deletable = true
    renamable = true
    menuItems.push({
      label: get('reveal'),
      accelerator: 'Enter',
      click: () => {
        UI.revealTarget(item)
      },
    }, {
      label: get('toggle'),
      accelerator: '/',
      click: () => {
        this.toggle(item)
      },
    })
  } else {
    selected = false
    copyable = false
    pastable = Clipboard.has('yami.ui.object')
    deletable = false
    renamable = false
  }
  menuItems.push({
    type: 'separator',
  }, {
    label: get('cut'),
    accelerator: ctrl('X'),
    enabled: copyable,
    click: () => {
      this.copy(item)
      this.delete(item)
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: copyable,
    click: () => {
      this.copy(item)
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
    enabled: pastable,
    click: () => {
      this.paste(item)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      this.delete(item)
    },
  }, {
    label: get('rename'),
    accelerator: 'F2',
    enabled: renamable,
    click: () => {
      this.rename(item)
    },
  }, {
    label: get('copy-id'),
    enabled: selected,
    click: () => {
      navigator.clipboard.writeText(item.presetId)
    },
  })
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, menuItems)
}

// 列表 - 打开事件
UI.listOpen = function (event) {
  UI.revealTarget(event.value)
}

// 列表 - 重命名事件
UI.listRename = function (response) {
  const editor = Inspector.uiElement
  const target = response.item
  const input = editor.nameBox
  const {oldValue, newValue} = response
  input.write(newValue)
  UI.history.save({
    type: 'inspector-change',
    editor: editor,
    target: target,
    changes: [{
      input,
      oldValue,
      newValue,
    }],
  })
}

// 列表 - 改变事件
UI.listChange = function (event) {
  UI.planToSave()
}

// 列表页面 - 调整大小事件
UI.listPageResize = function (event) {
  UI.list.updateHead()
  UI.list.resize()
}

// 选框 - 调整目标
UI.marquee.resize = function () {
  if (this.pointerevent) {
    UI.marqueePointermove(this.pointerevent)
  }
}

// 列表 - 复制
UI.list.copy = function (item) {
  if (item) {
    Clipboard.write('yami.ui.object', item)
  }
}

// 列表 - 粘贴
UI.list.paste = function (dItem, callback) {
  const copy = Clipboard.read('yami.ui.object')
  if (copy && this.data) {
    callback?.(copy)
    this.addNodeTo(copy, dItem)
    UI.requestRendering()
  }
}

// 列表 - 删除
UI.list.delete = function (item) {
  if (item) {
    this.deleteNode(item)
    UI.requestRendering()
  }
}

// 列表 - 开关
UI.list.toggle = function (item) {
  if (item) {
    UI.history.save({
      type: 'ui-object-toggle',
      item: item,
      oldValue: item.enabled,
      newValue: !item.enabled,
    })
    item.enabled = !item.enabled
    this.updateConditionIcon(item)
    this.dispatchChangeEvent()
  }
}

// 列表 - 取消搜索
UI.list.cancelSearch = function () {
  if (this.display === 'search') {
    const active = document.activeElement
    UI.searcher.deleteInputContent()
    this.expandToSelection()
    this.scrollToSelection()
    active.focus()
  }
}

// 列表 - 重写创建图标方法
UI.list.createIcon = function IIFE() {
  // 图标创建函数集合
  const iconCreators = {
    image: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-image')
      return icon
    },
    text: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-text')
      return icon
    },
    textbox: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-textbox')
      return icon
    },
    dialogbox: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-dialogbox')
      return icon
    },
    progressbar: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-progressbar')
      return icon
    },
    video: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-video')
      return icon
    },
    window: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-window')
      return icon
    },
    container: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-container')
      return icon
    },
  }
  return function (item) {
    return iconCreators[item.class]()
  }
}()

// 列表 - 更新头部位置
UI.list.updateHead = function () {
  const {page, head} = this
  if (page.clientWidth !== 0) {
    // 调整左边位置
    const {nav} = Layout.getGroupOfElement(head)
    const nRect = nav.rect()
    const iRect = nav.lastChild.rect()
    const left = iRect.right - nRect.left
    if (head.left !== left) {
      head.left = left
      head.style.left = `${left}px`
    }
  }
}

// 列表 - 创建条件图标
UI.list.createConditionIcon = function (item) {
  const {element} = item
  const conditionIcon = document.createElement('node-icon')
  conditionIcon.addClass('icon-conditional')
  element.appendChild(conditionIcon)
  element.conditionIcon = conditionIcon
  element.condition = ''
}

// 列表 - 更新条件图标
UI.list.updateConditionIcon = function (item) {
  const {element, enabled} = item
  const condition = enabled ? 'none' : 'absent'
  if (element.condition !== condition) {
    element.condition = condition
    const icon = element.conditionIcon
    switch (condition) {
      case 'none':
        icon.hide()
        break
      case 'absent':
        icon.textContent = '!'
        icon.show()
        break
    }
  }
}

// 列表 - 在创建数据时回调
UI.list.onCreate = function (item) {
  UI.setPresetId(item)
  UI.loadElement(item)
  UI.updateElement(item)
}

// 列表 - 在迁移数据时回调
UI.list.onRemove = function (item) {
  UI.updateElement(item)
}

// 列表 - 在删除数据时回调
UI.list.onDelete = function (item) {
  UI.unlinkPresetId(item)
  UI.deleteElement(item)
  UI.updateHover()
  UI.updateTarget()
  UI.requestRendering()
}

// 列表 - 在恢复数据时回调
UI.list.onResume = function (item) {
  UI.setPresetId(item)
  UI.loadElement(item)
  UI.updateElement(item)
}

// ******************************** UI 窗口导出 ********************************

export { UI }
