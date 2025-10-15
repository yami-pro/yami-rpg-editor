'use strict'

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
  duplicate: null,
  create: null,
  createPrefab: null,
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
  updateElementLanguage: null,
  updateElementTextScaling: null,
  updateIndexedColor: null,
  updateControlPoints: null,
  updateAllTexts: null,
  updateAllPrinters: null,
  updateAllReferences: null,
  updateElement: null,
  deleteElement: null,
  updateHead: null,
  resize: null,
  getPointerCoords: null,
  updateCamera: null,
  updateTransform: null,
  registerPreset: null,
  unregisterPreset: null,
  createPrefabItem: null,
  hasPrefab: null,
  setAsPrefab: null,
  unsetAsPrefab: null,
  clearInvalidPrefabs: null,
  createElement: null,
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
  planToSave: null,
  saveToConfig: null,
  loadFromConfig: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  webglRestored: null,
  windowResize: null,
  themechange: null,
  localizationchange: null,
  keydown: null,
  headPointerdown: null,
  switchPointerdown: null,
  shortcutPointerdown: null,
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
  Reference: null,
}

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
UI.list.updateItemClass = Scene.list.updateItemClass
UI.list.createIcon = null
UI.list.updateIcon = null
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
    local: 'Images/ui_control_point.png',
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
    button: 'uiButton',
    animation: 'uiAnimation',
    video: 'uiVideo',
    window: 'uiWindow',
    container: 'uiContainer',
    reference: 'uiReference',
  }

  // 设置列表搜索框按钮和过滤器
  this.searcher.addCloseButton()
  this.searcher.addKeydownFilter()

  // 绑定对象目录列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.nodes)
  list.updaters.push(list.updateItemClass)
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
    const {instances, transform} = target
    data.anchorX = transform.anchorX
    data.anchorY = transform.anchorY
    // transform.anchorX = anchorX
    // transform.anchorY = anchorY
    instances.set('transform-anchorX', anchorX)
    instances.set('transform-anchorY', anchorY)
    if (editor.target === target) {
      editor.write({anchorX, anchorY})
    }
    instances.resize()
    UI.setTarget(target)
    UI.requestRendering()
    UI.planToSave()
  }
  History.processors['ui-target-shift'] = (operation, data) => {
    const {editor, target, x, y} = data
    const {instances, transform} = target
    data.x = transform.x
    data.y = transform.y
    // transform.x = x
    // transform.y = y
    instances.set('transform-x', x)
    instances.set('transform-y', y)
    if (editor.target === target) {
      editor.write({x, y})
    }
    instances.resize()
    UI.setTarget(target)
    UI.requestRendering()
    UI.planToSave()
  }
  History.processors['ui-target-resize'] = (operation, data) => {
    const {editor, target, width, height} = data
    const {instances, transform} = target
    data.width = transform.width
    data.height = transform.height
    // transform.width = width
    // transform.height = height
    instances.set('transform-width', width)
    instances.set('transform-height', height)
    if (editor.target === target) {
      editor.write({width, height})
    }
    instances.resize()
    UI.setTarget(target)
    UI.requestRendering()
    UI.planToSave()
  }
  History.processors['ui-target-rotate'] = (operation, data) => {
    const {editor, target, rotation} = data
    const {instances, transform} = target
    data.rotation = transform.rotation
    // transform.rotation = rotation
    instances.set('transform-rotation', rotation)
    if (editor.target === target) {
      editor.write({rotation})
    }
    instances.resize()
    UI.setTarget(target)
    UI.requestRendering()
    UI.planToSave()
  }

  // 侦听事件
  window.on('themechange', this.themechange)
  window.on('localizationchange', this.localizationchange)
  window.on('keydown', this.keydown)
  window.on('keydown', Reference.getKeydownListener(list))
  this.page.on('resize', this.windowResize)
  this.head.on('pointerdown', this.headPointerdown)
  GL.canvas.on('webglcontextrestored', this.webglRestored)
  $('#ui-head-start').on('pointerdown', this.switchPointerdown)
  $('#ui-head-center').on('pointerdown', this.shortcutPointerdown)
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
  list.on('pointerdown', Reference.getPointerdownListener(list), {capture: true})
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

  // 设置粒子元素舞台
  Particle.Element.stage = this

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

  // 初始化
  if (firstLoad) {
    // 加载所有元素
    const nodes = this.nodes
    const length = nodes.length
    for (let i = 0; i < length; i++) {
      this.loadElement(nodes[i], this.root)
    }
  } else {
    this.updateAllReferences()
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

  // 更新元素文本语言
  if (this.context.languageChanged) {
    this.updateElementLanguage()
  }

  // 更新元素文本缩放
  if (this.context.scalingChanged) {
    this.updateElementTextScaling()
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
  if (!context.editor) return
  if (this.context === context) {
    this.save()
    this.close()
  }
  // 销毁UI组件实例
  context.editor.root.destroy()
  // 销毁绑定的元素
  TreeList.deleteCaches(context.ui.nodes)
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

// 副本
UI.duplicate = function () {
  if (this.target) {
    this.list.duplicate(this.target)
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

// 创建预制件
UI.createPrefab = function (prefab, parent, x, y) {
  const reference = Inspector.uiReference.create()
  reference.name = prefab.name
  reference.prefabId = prefab.presetId
  reference.synchronous = true
  reference.transform = {...prefab.transform}
  if (typeof x === 'number') {
    reference.transform.x = x
    reference.transform.x2 = 0
  }
  if (typeof y === 'number') {
    reference.transform.y = y
    reference.transform.y2 = 0
  }
  this.list.addNodeTo(reference, parent)
}

// 创建快捷方式
UI.createShortcut = function (item) {
  const reference = Inspector.uiReference.create()
  reference.name = this.list.generateUniqueName(item)
  reference.prefabId = item.presetId
  reference.synchronous = true
  reference.transform = {...item.transform}
  const index = item.parent.children.indexOf(item)
  const next = item.parent.children[index + 1]
  if (next) {
    this.list.addNodeTo(reference, next, true)
  } else {
    this.list.addNodeTo(reference, item.parent)
  }
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
    const instances = target.instances
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
    // transform.anchorX = anchorX
    // transform.anchorY = anchorY
    instances.set('transform-anchorX', anchorX)
    instances.set('transform-anchorY', anchorY)
    instances.resize()
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
    const instances = target.instances
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
    // transform.x = x
    // transform.y = y
    instances.set('transform-x', x)
    instances.set('transform-y', y)
    instances.resize()
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
    const instances = target.instances
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
      // transform.width = width
      instances.set('transform-width', width)
    }
    if (height !== undefined) {
      // transform.height = height
      instances.set('transform-height', height)
    }
    instances.resize()
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
    const instances = target.instances
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
    // transform.rotation = rotation
    instances.set('transform-rotation', rotation)
    instances.resize()
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
    const update = element => {
      if (element instanceof UI.Text ||
        element instanceof UI.TextBox ||
        element instanceof UI.DialogBox ||
        element instanceof UI.Button) {
        let el = element
        if (el instanceof UI.Button) {
          el = el.shadowText
        }
        if (el.printer !== null) {
          el.printer.reset()
          if (el._font === '') {
            el._font = undefined
            el.font = ''
          }
          this.requestRendering()
        }
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

// 更新元素语言
UI.updateElementLanguage = function () {
  if (this.state === 'open') {
    if (this.context.languageChanged) {
      delete this.context.languageChanged
    }
    const update = elements => {
      for (const element of elements) {
        element.updateTextContent?.()
        update(element.children)
      }
    }
    update(this.root.children)
    this.requestRendering()
  }
}

// 更新元素文本缩放
UI.updateElementTextScaling = function () {
  if (this.state === 'open') {
    if (this.context.scalingChanged) {
      delete this.context.scalingChanged
    }
    const update = elements => {
      for (const element of elements) {
        element.updatePrinter?.()
        update(element.children)
      }
    }
    update(this.root.children)
    this.requestRendering()
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

// 更新所有文本
UI.updateAllTexts = function () {
  if (!Title.tabBar.data) return
  for (const context of Title.tabBar.data) {
    if (context.type === 'ui') {
      context.languageChanged = true
    }
  }
  this.updateElementLanguage()
}

// 更新所有打印机
UI.updateAllPrinters = function () {
  if (!Title.tabBar.data) return
  for (const context of Title.tabBar.data) {
    if (context.type === 'ui') {
      context.scalingChanged = true
    }
  }
  this.updateElementTextScaling()
}

// 更新所有引用元素
UI.updateAllReferences = function () {
  if (this.state === 'open') {
    const update = elements => {
      for (const element of elements) {
        if (element instanceof UI.Reference) {
          element.update()
        } else {
          update(element.children)
        }
      }
    }
    update(this.root.children)
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

// 注册预设元素
UI.registerPreset = function IIFE() {
  const generatePresetId = () => {
    const {uiPresets} = Data
    let id
    do {id = GUID.generate64bit()}
    while (id in uiPresets)
    return id
  }
  const registerPreset = node => {
    const {uiPresets} = Data
    // 新元素或元素ID冲突，生成新ID
    if (node.presetId === '' ||
      node.presetId in uiPresets) {
      node.presetId = generatePresetId()
    }
    uiPresets[node.presetId] = {
      uiId: UI.meta.guid,
      data: node,
    }
    for (const child of node.children) {
      registerPreset(child)
    }
  }
  return function (node) {
    registerPreset(node)
  }
}()

// 取消注册预设元素
UI.unregisterPreset = function (node) {
  delete Data.uiPresets[node.presetId]
  for (const child of node.children) {
    UI.unregisterPreset(child)
  }
}

// 创建预制件选项
UI.createPrefabItem = function (parent, x, y) {
  const {uiPrefabs} = Editor.project
  const items = []
  // 添加有效的预制件选项
  if (uiPrefabs.length !== 0) {
    const click = function () {
      UI.createPrefab(this.data, parent, x, y)
    }
    const map = Data.uiPresets
    for (const guid of uiPrefabs) {
      const preset = map[guid]
      if (preset !== undefined) {
        items.push({
          label: preset.data.name,
          data: preset.data,
          click: click,
        })
      }
    }
  }
  return {
    label: Local.get('menuUIList.create.prefab'),
    enabled: items.length !== 0,
    submenu: items.sort((a, b) => a.label.localeCompare(b.label)),
  }
}

// 是否包含该预制件
UI.hasPrefab = function (node) {
  return Editor.project.uiPrefabs.includes(node.presetId)
}

// 设置为预制件
UI.setAsPrefab = function (node) {
  if (Editor.project.uiPrefabs.append(node.presetId)) {
    UI.list.updateIcon(node)
  }
}

// 取消设置为
UI.unsetAsPrefab = function (node) {
  if (Editor.project.uiPrefabs.remove(node.presetId)) {
    UI.list.updateIcon(node)
  }
}

// 清除无效预制件
UI.clearInvalidPrefabs = function (uiPrefabs) {
  let i = uiPrefabs.length
  while (--i >= 0) {
    const guid = uiPrefabs[i]
    if (!Data.uiPresets[guid]) {
      uiPrefabs.splice(i, 1)
    }
  }
}

// 创建元素
UI.createElement = function (node, main) {
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
    case 'button':
      instance = new UI.Button(node)
      break
    case 'animation':
      instance = new UI.Animation(node)
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
    case 'reference':
      instance = new UI.Reference(node)
      break
  }
  instance.node = node
  if (main) {
    Object.defineProperty(
      node, 'instance', {
        configurable: true,
        value: instance,
      }
    )
  }
  if (!node.instances) {
    Object.defineProperty(
      node, 'instances', {
        configurable: true,
        value: new UIInstanceList(),
      }
    )
  }
  node.instances.push(instance)
  return instance
}

// 加载元素
UI.loadElement = function (node, parent) {
  const instance = this.createElement(node, true)
  if (parent !== undefined) {
    parent.appendChild(instance)
  }
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
  if (this.target !== null && !(this.target.class === 'reference' && this.target.synchronous)) {
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
        element.node.instance === element &&
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
  const {ui, uiPrefabs} = project
  ui.zoom = this.zoom ?? ui.zoom
  // 更新后添加的uiPrefabs
  // 取消升级时似乎可能undefined？先这样吧
  UI.clearInvalidPrefabs(uiPrefabs ?? [])
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

// 本地化改变事件
UI.localizationchange = function (event) {
  this.updateAllTexts()
}.bind(UI)

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

// 快捷栏 - 指针按下事件
UI.shortcutPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'ITEM') {
        UI.create(element.getAttribute('value'), 0, 0)
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
        case 'KeyD':
          this.duplicate()
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
      if (event.dragKey) {
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
            const dpr = window.devicePixelRatio
            event.mode = 'object-rotate'
            event.absoluteAnchorX = ax
            event.absoluteAnchorY = ay
            event.lastAngle = Math.atan2(y * dpr - ay, x * dpr - ax)
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
      let object
      if (event.cmdOrCtrlKey && this.target) {
        object = this.target
      }
      if (object === undefined) {
        object = this.selectObject(x, y)
      }
      if (object) {
        this.dragging = event
        event.mode = 'object-move'
        event.node = object
        event.enabled = false
        event.startX = object.transform.x
        event.startY = object.transform.y
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        // 预览按钮
        this.requestRendering()
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
        break
      case 'object-move':
        // 预览按钮
        this.requestRendering()
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
    const dpr = window.devicePixelRatio
    switch (dragging.mode) {
      case 'object-rotate':
        if (this.target) {
          const {x, y} = event.getRelativeCoords(GL.canvas)
          const distX = x * dpr - dragging.absoluteAnchorX
          const distY = y * dpr - dragging.absoluteAnchorY
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
          const distX = (event.clientX - dragging.clientX) * dpr / this.scaleX
          const distY = (event.clientY - dragging.clientY) * dpr / this.scaleY
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
          const distX = (event.clientX - dragging.clientX) * dpr / this.scaleX
          const distY = (event.clientY - dragging.clientY) * dpr / this.scaleY
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
  const get = Local.createGetter('menuUIList')
  const items = [{
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
      label: get('create.button'),
      click: () => {
        this.create('button', x, y)
      },
    }, {
      label: get('create.animation'),
      click: () => {
        this.create('animation', x, y)
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
    }, {
      label: get('create.reference'),
      click: () => {
        this.create('reference', x, y)
      },
    }, {
      label: get('create.shortcut'),
      enabled: selected && target.class !== 'reference',
      click: () => {
        this.createShortcut(target)
      },
    }, UI.createPrefabItem(null, x, y)],
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
    label: get('duplicate'),
    accelerator: ctrl('D'),
    enabled: selected,
    click: () => {
      this.duplicate()
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
  }, {
    label: get('find-references'),
    enabled: selected,
    click: () => {
      Reference.openRelated(target.presetId)
    },
  }]
  // 添加设置为预制件菜单项目
  if (selected) {
    if (!UI.hasPrefab(target)) {
      items.push({
        label: get('set-as-prefab'),
        enabled: target.class !== 'reference',
        click: () => {
          UI.setAsPrefab(target)
        },
      })
    } else {
      items.push({
        label: get('unset-as-prefab'),
        enabled: target.class !== 'reference',
        click: () => {
          UI.unsetAsPrefab(target)
        },
      })
    }
  }
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, items)
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
      case 'KeyD':
        this.duplicate(item)
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
  const selected = !!item
  const copyable = selected
  const pastable = Clipboard.has('yami.ui.object')
  const deletable = selected
  const renamable = selected
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
      label: get('create.button'),
      click: () => {
        this.addNodeTo(Inspector.uiButton.create(), item)
      },
    }, {
      label: get('create.animation'),
      click: () => {
        this.addNodeTo(Inspector.uiAnimation.create(), item)
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
    }, {
      label: get('create.reference'),
      click: () => {
        this.addNodeTo(Inspector.uiReference.create(), item)
      },
    }, {
      label: get('create.shortcut'),
      enabled: selected && item.class !== 'reference',
      click: () => {
        UI.createShortcut(item)
      },
    }, UI.createPrefabItem(item)],
  })
  if (selected) {
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
    label: get('duplicate'),
    accelerator: ctrl('D'),
    enabled: copyable,
    click: () => {
      this.duplicate(item)
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
  if (copyable) {
    menuItems.push({
      label: get('find-references'),
      accelerator: 'Alt+LB',
      enabled: copyable,
      click: () => {
        Reference.openRelated(item.presetId)
      },
    })
  }
  // 添加设置为预制件菜单项目
  if (selected) {
    if (!UI.hasPrefab(item)) {
      menuItems.push({
        label: get('set-as-prefab'),
        enabled: item.class !== 'reference',
        click: () => {
          UI.setAsPrefab(item)
        },
      })
    } else {
      menuItems.push({
        label: get('unset-as-prefab'),
        enabled: item.class !== 'reference',
        click: () => {
          UI.unsetAsPrefab(item)
        },
      })
    }
  }
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
    button: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-button')
      return icon
    },
    animation: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-ui-animation')
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
    reference: (item) => {
      const icon = document.createElement('node-icon')
      const preset = Data.uiPresets[item.prefabId]
      switch (preset?.data.class ?? 'reference') {
        case 'image':
          icon.addClass('icon-ui-image')
          break
        case 'text':
          icon.addClass('icon-ui-text')
          break
        case 'textbox':
          icon.addClass('icon-ui-textbox')
          break
        case 'dialogbox':
          icon.addClass('icon-ui-dialogbox')
          break
        case 'progressbar':
          icon.addClass('icon-ui-progressbar')
          break
        case 'button':
          icon.addClass('icon-ui-button')
          break
        case 'animation':
          icon.addClass('icon-ui-animation')
          break
        case 'video':
          icon.addClass('icon-ui-video')
          break
        case 'window':
          icon.addClass('icon-ui-window')
          break
        case 'container':
          icon.addClass('icon-ui-container')
          break
        case 'reference':
          icon.addClass('icon-ui-reference')
          break
      }
      if (!icon.hasClass('icon-ui-reference')) {
        icon.addClass('icon-ui-reference-active')
      }
      return icon
    },
  }
  return function (item) {
    const icon = iconCreators[item.class](item)
    if (UI.hasPrefab(item)) {
      icon.addClass('icon-ui-set-as-prefab')
    }
    return icon
  }
}()

// 列表 - 更新图标
UI.list.updateIcon = function (item) {
  const {element} = item
  if (element?.nodeIcon) {
    const icon = this.createIcon(item)
    element.replaceChild(icon, element.nodeIcon)
    element.nodeIcon = icon
  }
}

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
        element.removeClass('weak')
        icon.hide()
        break
      case 'absent':
        element.addClass('weak')
        icon.textContent = '!'
        icon.show()
        break
    }
  }
}

// 列表 - 在创建数据时回调
UI.list.onCreate = function (item) {
  UI.registerPreset(item)
  UI.loadElement(item)
  UI.updateElement(item)
}

// 列表 - 在迁移数据时回调
UI.list.onRemove = function (item) {
  UI.updateElement(item)
}

// 列表 - 在删除数据时回调
UI.list.onDelete = function (item) {
  UI.unregisterPreset(item)
  UI.deleteElement(item)
  UI.updateHover()
  UI.updateTarget()
  UI.requestRendering()
}

// 列表 - 在恢复数据时回调
UI.list.onResume = function (item) {
  UI.registerPreset(item)
  UI.loadElement(item)
  UI.updateElement(item)
}

// ******************************** 元素基类 ********************************

UI.Element = class UIElement {
  node      //:object
  x         //:number
  y         //:number
  width     //:number
  height    //:number
  matrix    //:object
  opacity   //:number
  transform //:object
  parent    //:object
  children  //:array
  visible   //:boolean
  connected //:boolean

  constructor(data) {
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
    this.matrix = new Matrix()
    this.opacity = 1
    this.transform = data.transform
    this.parent = null
    this.children = []
    this.visible = !data.hidden
    this.connected = false
  }

  // 绘制线框
  drawWireframe(color) {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const colors = gl.arrays[0].uint32
    const matrix = gl.matrix
    .set(UI.matrix)
    .multiply(this.matrix)
    const L = this.x
    const T = this.y
    const R = L + this.width
    const B = T + this.height
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
    const ox1 = Math.cos(angle1) * 0.5
    const oy1 = Math.sin(angle1) * 0.5
    const ox2 = Math.cos(angle2) * 0.5
    const oy2 = Math.sin(angle2) * 0.5
    const ox3 = Math.cos(angle3) * 0.5
    const oy3 = Math.sin(angle3) * 0.5
    const ox4 = Math.cos(angle4) * 0.5
    const oy4 = Math.sin(angle4) * 0.5
    const bx1 = x1 + ox4 - ox1
    const by1 = y1 + oy4 - oy1
    const bx2 = x2 + ox1 - ox2
    const by2 = y2 + oy1 - oy2
    const bx3 = x3 + ox2 - ox3
    const by3 = y3 + oy2 - oy3
    const bx4 = x4 + ox3 - ox4
    const by4 = y4 + oy3 - oy4
    vertices[0] = bx1
    vertices[1] = by1
    colors  [2] = color
    vertices[3] = bx2
    vertices[4] = by2
    colors  [5] = color
    vertices[6] = bx3
    vertices[7] = by3
    colors  [8] = color
    vertices[9] = bx4
    vertices[10] = by4
    colors  [11] = color
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.alpha = 1
    gl.blend = 'normal'
    const program = gl.graphicProgram.use()
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12)
    gl.drawArrays(gl.LINE_LOOP, 0, 4)
  }

  // 绘制默认图像
  drawDefaultImage() {
    GL.alpha = this.opacity
    GL.blend = this.blend
    GL.matrix.set(UI.matrix).multiply(this.matrix)
    GL.fillRect(this.x, this.y, this.width, this.height, 0x80ffffff)
  }

  // 连接元素
  connect() {
    this.connected = true
    this.connectChildren()
  }

  // 断开元素
  disconnect() {
    this.connected = false
    this.disconnectChildren()
  }

  // 连接子元素
  connectChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].connect()
    }
  }

  // 断开子元素
  disconnectChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].disconnect()
    }
  }

  // 绘制子元素
  drawChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].draw()
    }
  }

  // 调整子元素
  resizeChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].resize()
    }
  }

  // 销毁子元素
  destroyChildren() {
    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      children[i].destroy()
    }
  }

  // 销毁元素
  destroy() {
    const {node} = this
    if (!node) return
    if (this === node.instance) {
      delete node.instance
    }
    node.instances.remove(this)
  }

  // 加入子对象
  appendChild(element) {
    if (element && this.children.append(element)) {
      element.parent instanceof UI.Element &&
      element.parent.children.remove(element)
      element.parent = this
      if (this.connected) {
        !element.connected &&
        element.connect()
        element.resize()
      }
    }
  }

  // 加入子对象到指定位置
  appendChildTo(element, index) {
    if (element instanceof UI.Element) {
      if (element.parent instanceof UI.Element) {
        UI.root.tryUpdateReferenceElements(element.parent)
        element.parent.children.remove(element)
      }
      if (element.parent instanceof UI.Window) {
        element.parent.requestResizing()
      }
      element.parent = this
      this.children.splice(index, 0, element)
      if (this.connected) {
        !element.connected &&
        element.connect()
        element.resize()
      }
      UI.root.tryUpdateReferenceElements(this)
    }
  }

  // 从父对象中移除
  remove() {
    if (this.parent instanceof UI.Element &&
      this.parent.children.remove(this)) {
      UI.root.tryUpdateReferenceElements(this.parent)
      if (this.parent instanceof UI.Window) {
        this.parent.requestResizing()
      }
      this.parent = null
      if (this.connected) {
        this.disconnect()
      }
    }
  }

  // 计算位置
  calculatePosition() {
    if (this.connected === false) {
      return
    }

    const parent = this.parent
    const matrix = this.matrix.set(parent.matrix)
    const transform = this.transform
    const parentWidth = parent.width
    const parentHeight = parent.height
    const x = parent.x + transform.x + transform.x2 * parentWidth
    const y = parent.y + transform.y + transform.y2 * parentHeight
    const width = Math.max(transform.width + transform.width2 * parentWidth, 0)
    const height = Math.max(transform.height + transform.height2 * parentHeight, 0)
    const anchorX = transform.anchorX * width
    const anchorY = transform.anchorY * height
    const rotation = transform.rotation
    const scaleX = transform.scaleX
    const scaleY = transform.scaleY
    const skewX = transform.skewX
    const skewY = transform.skewY
    const opacity = transform.opacity * parent.opacity

    // 写入计算值
    this.x = x - anchorX
    this.y = y - anchorY
    this.width = width
    this.height = height
    this.opacity = opacity

    // 计算矩阵变换
    if (rotation !== 0) {
      matrix.rotateAt(x, y, Math.radians(rotation))
    }
    if (scaleX !== 1 || scaleY !== 1) {
      matrix.scaleAt(x, y, scaleX, scaleY)
    }
    if (skewX !== 0 || skewY !== 0) {
      matrix.skewAt(x, y, skewX, skewY)
    }
  }

  // 判断是否包含指定元素
  contains(element) {
    while (element) {
      if (element === this) {
        return true
      }
      element = element.parent
    }
    return false
  }

  // 判断点是否在矩形区域内
  isPointIn(x, y) {
    const W = this.width
    const H = this.height
    if (W * H === 0) {
      return false
    }

    const matrix = this.matrix
    const L = this.x
    const T = this.y
    const R = L + W
    const B = T + H
    const a = matrix[0]
    const b = matrix[1]
    const c = matrix[3]
    const d = matrix[4]
    const e = matrix[6]
    const f = matrix[7]
    const x1 = a * L + c * T + e - x
    const y1 = b * L + d * T + f - y
    const x2 = a * L + c * B + e - x
    const y2 = b * L + d * B + f - y
    const x3 = a * R + c * B + e - x
    const y3 = b * R + d * B + f - y
    const x4 = a * R + c * T + e - x
    const y4 = b * R + d * T + f - y
    const cross1 = x1 * y2 - y1 * x2
    const cross2 = x2 * y3 - y2 * x3
    const cross3 = x3 * y4 - y3 * x4
    const cross4 = x4 * y1 - y4 * x1
    return (
      cross1 * cross2 >= 0 &&
      cross2 * cross3 >= 0 &&
      cross3 * cross4 >= 0 &&
      cross4 * cross1 >= 0
    )
  }
}

// ******************************** 根元素 ********************************

UI.Root = class RootElement extends UI.Element {
  background  //:number
  references = {}

  constructor() {
    super({
      transform: null,
      hidden: false,
    })
    this.connected = true
    this.background = null
  }

  // 绘制图像
  draw() {
    GL.matrix.set(UI.matrix)
    GL.alpha = 1
    GL.blend = 'normal'
    GL.fillRect(this.x, this.y, this.width, this.height, this.background)
    this.drawChildren()
  }

  // 调整大小
  resize() {
    this.x = 0
    this.y = 0
    this.width = UI.width
    this.height = UI.height
    this.background = UI.foreground.getINTRGBA()
    this.resizeChildren()
  }

  // 添加被引用的元素
  addReference(prefabElement) {
    const map = this.references
    const id = prefabElement.node.presetId
    if (map[id] === undefined) {
      map[id] = []
    }
    map[id].append(prefabElement)
  }

  // 移除被引用的元素
  removeReference(prefabElement) {
    const map = this.references
    const id = prefabElement.node.presetId
    if (map[id] !== undefined) {
      map[id].remove(prefabElement)
    }
  }

  // 更新引用元素(通过变动的元素位置判断)
  tryUpdateReferenceElements(element) {
    const map = this.references
    while (element !== this) {
      const id = element.node.presetId
      if (id in map) {
        for (const prefab of map[id]) {
          prefab.parent.update()
        }
      }
      element = element.parent
    }
  }

  // 销毁元素
  destroy() {
    this.destroyChildren()
  }
}

// ******************************** 图像元素 ********************************

UI.Image = class ImageElement extends UI.Element {
  texture   //:object
  _display  //:string
  _image    //:string
  flip      //:string
  shiftX    //:number
  shiftY    //:number
  border    //:number
  clip      //:array
  tint      //:array
  blend     //:string

  constructor(data) {
    super(data)
    this.texture = null
    this.display = data.display ?? 'stretch'
    this.image = data.image ?? ''
    this.flip = data.flip ?? 'none'
    this.shiftX = data.shiftX ?? 0
    this.shiftY = data.shiftY ?? 0
    this.border = data.border ?? 0
    this.clip = data.clip ?? [0, 0, 0, 0]
    this.tint = data.tint ?? [0, 0, 0, 0]
    this.blend = data.blend ?? 'normal'
  }

  // 读取图像
  get image() {
    return this._image
  }

  // 写入图像
  set image(value) {
    if (this._image !== value) {
      this._image = value
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
      if (value) {
        this.texture = new ImageTexture(value)
        this.texture.on('load', () => {
          UI.requestRendering()
        })
      }
    }
  }

  // 读取显示模式
  get display() {
    return this._display
  }

  // 写入显示模式
  set display(value) {
    this._display = value
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 绘制图片
    const {texture} = this
    if (texture !== null) draw: {
      let dx = this.x
      let dy = this.y
      let dw = this.width
      let dh = this.height
      if (this.blend === 'mask') {
        if (GL.maskTexture.binding) {
          break draw
        }
        if (GL.depthTest) {
          GL.disable(GL.DEPTH_TEST)
        }
        GL.maskTexture.binding = this
        GL.bindFBO(GL.maskTexture.fbo)
        GL.alpha = 1
        GL.blend = 'normal'
      } else {
        GL.alpha = this.opacity
        GL.blend = this.blend
      }
      GL.matrix.set(UI.matrix).multiply(this.matrix)
      switch (this.display) {
        case 'stretch':
          texture.clip(this.shiftX, this.shiftY, texture.base.width, texture.base.height)
          break
        case 'tile':
          texture.clip(this.shiftX, this.shiftY, this.width, this.height)
          break
        case 'clip':
          texture.clip(...this.clip)
          break
        case 'slice':
          GL.drawSliceImage(texture, dx, dy, dw, dh, this.clip, this.border, this.tint)
          break draw
      }
      switch (this.flip) {
        case 'none':
          break
        case 'horizontal':
          dx += dw
          dw *= -1
          break
        case 'vertical':
          dy += dh
          dh *= -1
          break
        case 'both':
          dx += dw
          dy += dh
          dw *= -1
          dh *= -1
          break
      }
      GL.drawImage(texture, dx, dy, dw, dh, this.tint)
    } else if (this.blend !== 'mask') {
      this.drawDefaultImage()
    }

    // 绘制子元素
    if (GL.maskTexture.binding === this) {
      GL.unbindFBO()
      if (GL.depthTest) {
        GL.enable(GL.DEPTH_TEST)
      }
      GL.masking = true
      this.drawChildren()
      GL.masking = false
      GL.maskTexture.binding = null
      // 擦除遮罩纹理缓冲区
      const [x1, y1, x2, y2] = this.computeBoundingRectangle()
      const sl = Math.max(Math.floor(x1 - 1), 0)
      const st = Math.max(Math.floor(y1 - 1), 0)
      const sr = Math.min(Math.ceil(x2 + 1), GL.maskTexture.width)
      const sb = Math.min(Math.ceil(y2 + 1), GL.maskTexture.height)
      const sw = sr - sl
      const sh = sb - st
      if (sw > 0 && sh > 0) {
        GL.bindFBO(GL.maskTexture.fbo)
        GL.enable(GL.SCISSOR_TEST)
        GL.scissor(sl, st, sw, sh)
        GL.clearColor(0, 0, 0, 0)
        GL.clear(GL.COLOR_BUFFER_BIT)
        GL.disable(GL.SCISSOR_TEST)
        GL.unbindFBO()
      }
    } else {
      this.drawChildren()
    }
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.texture?.destroy()
    this.destroyChildren()
  }

  // 计算外接矩形
  computeBoundingRectangle() {
    const matrix = GL.matrix.set(UI.matrix).multiply(this.matrix)
    const L = this.x
    const T = this.y
    const R = L + this.width
    const B = T + this.height
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
    const vertices = ImageElement.sharedFloat64Array
    vertices[0] = Math.min(x1, x2, x3, x4)
    vertices[1] = Math.min(y1, y2, y3, y4)
    vertices[2] = Math.max(x1, x2, x3, x4)
    vertices[3] = Math.max(y1, y2, y3, y4)
    return vertices
  }

  // 公共属性
  static sharedFloat64Array = new Float64Array(4)
}

// ******************************** 文本元素 ********************************

UI.Text = class TextElement extends UI.Element {
  texture           //:object
  printer           //:object
  _direction        //:string
  _horizontalAlign  //:string
  _verticalAlign    //:string
  _content          //:string
  _rawContent       //:string
  _size             //:number
  _lineSpacing      //:number
  _letterSpacing    //:number
  _color            //:string
  _font             //:string
  style             //:string
  weight            //:string
  _typeface         //:string
  _effect           //:object
  wordWrap          //:boolean
  truncate          //:boolean
  _overflow         //:string
  textOuterX        //:number
  textOuterY        //:number
  textOuterWidth    //:number
  textOuterHeight   //:number
  blend             //:string

  // 全局变量正则表达式
  static globalVarRegexp = /<global(::?)([0-9a-f]{16})>/g

  // 替换全局变量
  static replaceGlobalVariable(text) {
    return text.replace(this.globalVarRegexp, (match, delimiter, varId) => {
      const name = Data.variables.map[varId]?.name
      const sign = delimiter === '::' ? '@' : ''
      return name ? `<color:f0d0ff>${sign}${name}</color>` : match
    })
  }

  constructor(data) {
    super(data)
    this.texture = null
    this.printer = null
    this.direction = data.direction ?? 'horizontal-tb'
    this.horizontalAlign = data.horizontalAlign ?? 'left'
    this.verticalAlign = data.verticalAlign ?? 'middle'
    this.content = data.content ?? ''
    this.size = data.size ?? 12
    this.lineSpacing = data.lineSpacing ?? 0
    this.letterSpacing = data.letterSpacing ?? 0
    this.color = data.color ?? 'ffffffff'
    this.font = data.font ?? ''
    this.style = null
    this.weight = null
    this.typeface = data.typeface ?? 'regular'
    this.effect = data.effect ?? {type: 'none'}
    this.wordWrap = false
    this.truncate = false
    this.overflow = data.overflow ?? 'visible'
    this.textOuterX = 0
    this.textOuterY = 0
    this.textOuterWidth = 0
    this.textOuterHeight = 0
    this.blend = data.blend ?? 'normal'
  }

  // 读取方向
  get direction() {
    return this._direction
  }

  // 写入方向
  set direction(value) {
    if (this._direction !== value) {
      this._direction = value
      if (this.printer) {
        this.printer.reset()
        this.printer.direction = value
      }
    }
  }

  // 读取水平对齐
  get horizontalAlign() {
    return this._horizontalAlign
  }

  // 写入水平对齐
  set horizontalAlign(value) {
    if (this._horizontalAlign !== value) {
      switch (value) {
        case 'left':
        case 'center':
        case 'right':
          break
        default:
          return
      }
      this._horizontalAlign = value
      if (this.printer) {
        this.printer.reset()
        this.printer.horizontalAlign = value
      }
    }
  }

  // 读取垂直对齐
  get verticalAlign() {
    return this._verticalAlign
  }

  // 写入垂直对齐
  set verticalAlign(value) {
    if (this._verticalAlign !== value) {
      switch (value) {
        case 'top':
        case 'middle':
        case 'bottom':
          break
        default:
          return
      }
      this._verticalAlign = value
      if (this.printer) {
        this.printer.reset()
        this.printer.verticalAlign = value
      }
    }
  }

  // 读取文本内容
  get content() {
    return this._content
  }

  // 写入文本内容
  set content(value) {
    // 需要刷新语言包中的内容，不做差异判断
    this._rawContent = value
    this._content = TextElement.replaceGlobalVariable(GameLocal.replace(value))
  }

  // 读取字体大小
  get size() {
    return this._size
  }

  // 写入字体大小
  set size(value) {
    if (this._size !== value) {
      this._size = value
      if (this.printer) {
        this.printer.reset()
        this.printer.sizes[0] = value
      }
    }
  }

  // 读取行间距
  get lineSpacing() {
    return this._lineSpacing
  }

  // 写入行间距
  set lineSpacing(value) {
    if (this._lineSpacing !== value) {
      this._lineSpacing = value
      if (this.printer) {
        this.printer.reset()
        this.printer.lineSpacing = value
      }
    }
  }

  // 读取字间距
  get letterSpacing() {
    return this._letterSpacing
  }

  // 写入字间距
  set letterSpacing(value) {
    if (this._letterSpacing !== value) {
      this._letterSpacing = value
      if (this.printer) {
        this.printer.reset()
        this.printer.letterSpacing = value
      }
    }
  }

  // 读取颜色
  get color() {
    return this._color
  }

  // 写入颜色
  set color(value) {
    if (this._color !== value) {
      this._color = value
      if (this.printer) {
        this.printer.reset()
        this.printer.colors[0] = CSSRGBA(value)
      }
    }
  }

  // 读取字体
  get font() {
    return this._font
  }

  // 写入字体
  set font(value) {
    if (this._font !== value) {
      this._font = value
      if (this.printer) {
        this.printer.reset()
        this.printer.fonts[0] = value || Printer.font
      }
    }
  }

  // 读取字型
  get typeface() {
    return this._typeface
  }

  // 写入字型
  set typeface(value) {
    if (this._typeface !== value) {
      switch (value) {
        case 'regular':
          this.style = 'normal'
          this.weight = 'normal'
          break
        case 'bold':
          this.style = 'normal'
          this.weight = 'bold'
          break
        case 'italic':
          this.style = 'italic'
          this.weight = 'normal'
          break
        case 'bold-italic':
          this.style = 'italic'
          this.weight = 'bold'
          break
        default:
          return
      }
      this._typeface = value
      if (this.printer) {
        this.printer.reset()
        this.printer.styles[0] = this.style
        this.printer.weights[0] = this.weight
      }
    }
  }

  // 读取文字效果
  get effect() {
    return this._effect
  }

  // 写入文字效果
  set effect(value) {
    this._effect = value
    if (this.printer) {
      this.printer.reset()
      this.printer.effects[0] = Printer.parseEffect(value)
    }
  }

  // 读取溢出模式
  get overflow() {
    return this._overflow
  }

  // 写入溢出模式
  set overflow(value) {
    if (this._overflow !== value) {
      this._overflow = value
      switch (value) {
        case 'visible':
          this.wordWrap = false
          this.truncate = false
          break
        case 'wrap':
          this.wordWrap = true
          this.truncate = false
          break
        case 'truncate':
          this.wordWrap = false
          this.truncate = true
          break
        case 'wrap-truncate':
          this.wordWrap = true
          this.truncate = true
          break
      }
      if (this.printer) {
        this.printer.reset()
        this.printer.wordWrap = this.wordWrap
        this.printer.truncate = this.truncate
      }
    }
  }

  // 更新文本
  update() {
    let printer = this.printer
    if (printer === null) {
      const texture = new Texture()
      printer = new Printer(texture)
      printer.direction = this.direction
      printer.horizontalAlign = this.horizontalAlign
      printer.verticalAlign = this.verticalAlign
      printer.sizes[0] = this.size
      printer.lineSpacing = this.lineSpacing
      printer.letterSpacing = this.letterSpacing
      printer.colors[0] = CSSRGBA(this.color)
      printer.fonts[0] = this.font || Printer.font
      printer.styles[0] = this.style
      printer.weights[0] = this.weight
      printer.effects[0] = Printer.parseEffect(this.effect)
      printer.wordWrap = this.wordWrap
      printer.truncate = this.truncate
      this.texture = texture
      this.printer = printer
    }
    if (printer.content !== this.content ||
      printer.wordWrap && (printer.horizontal
      ? printer.printWidth !== this.width
      : printer.printHeight !== this.height) ||
      printer.truncate && (printer.horizontal
      ? printer.printHeight !== this.height
      : printer.printWidth !== this.width)) {
      // 更新打印机并绘制文本
      this.updatePrinter()
    }
  }

  // 更新文本内容
  updateTextContent() {
    const content = this._rawContent
    this._rawContent = ''
    this.content = content
  }

  // 更新打印机
  updatePrinter() {
    const {printer} = this
    if (printer) {
      // 重置打印机
      if (printer.content) {
        printer.reset()
      }
      // 设置打印区域并打印文本
      printer.setPrintArea(this.width, this.height)
      printer.draw(this.content)
      this.calculateTextPosition()
    }
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 更新文本
    this.update()

    // 绘制文本
    if (this.content) {
      GL.alpha = this.opacity
      GL.blend = this.blend
      GL.matrix.set(UI.matrix).multiply(this.matrix)
      GL.drawImage(this.texture, this.textOuterX, this.textOuterY, this.textOuterWidth, this.textOuterHeight)

      // 绘制内嵌图像元素
      for (const image of this.printer.images) {
        image.draw()
      }
    }

    // 绘制子元素
    this.drawChildren()
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    if (this.printer) {
      this.printer.images.changed = true
    }
    this.calculatePosition()
    this.calculateTextPosition()
    this.resizeChildren()
  }

  // 计算文本位置
  calculateTextPosition() {
    const printer = this.printer
    if (printer !== null) {
      const scale = Printer.scale
      const pl = printer.paddingLeft / scale
      const pt = printer.paddingTop / scale
      const pr = printer.paddingRight / scale
      const pb = printer.paddingBottom / scale
      const outerX = this.x - pl
      const outerY = this.y - pt
      const outerWidth = this.texture.width / scale
      const outerHeight = this.texture.height / scale
      const innerWidth = outerWidth - pl - pr
      const innerHeight = outerHeight - pt - pb
      const marginWidth = this.width - innerWidth
      const marginHeight = this.height - innerHeight
      const factorX = printer.alignmentFactorX
      const factorY = printer.alignmentFactorY
      const offsetX = marginWidth * factorX
      const offsetY = marginHeight * factorY
      this.textOuterX = outerX + offsetX
      this.textOuterY = outerY + offsetY
      this.textOuterWidth = outerWidth
      this.textOuterHeight = outerHeight

      // 调整内嵌图像元素
      this.resizeEmbeddedImages(offsetX, offsetY)
    }
  }

  // 调整内嵌图像元素
  resizeEmbeddedImages(offsetX, offsetY) {
    const images = this.printer.images
    if (images.changed) {
      images.changed = false
      for (const image of images) {
        const transform = image.transform
        transform.x = image.startX + offsetX
        transform.y = image.startY + offsetY
        image.parent = this
        image.connected = true
        image.resize()
      }
    }
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.texture?.destroy()
    this.printer?.destroy()
    this.destroyChildren()
  }
}

// ******************************** 文本框元素 ********************************

UI.TextBox = class TextBoxElement extends UI.Element {
  focusing              //:boolean
  texture               //:object
  _type                 //:string
  _align                //:string
  content               //:string
  text                  //:string
  maxLength             //:number
  number                //:number
  min                   //:number
  max                   //:number
  decimals              //:number
  _padding              //:number
  _size                 //:number
  _font                 //:string
  _color                //:string
  _colorInt             //:number
  textX                 //:number
  textY                 //:number
  textWidth             //:number
  textShiftY            //:number
  innerWidth            //:number
  innerHeight           //:number
  selectionY            //:number
  selectionWidth        //:number
  selectionHeight       //:number
  _selectionColor       //:string
  _selectionColorInt    //:number
  _selectionBgColor     //:string
  _selectionBgColorInt  //:number
  printer               //:object

  constructor(data) {
    super(data)
    this.focusing = false
    this.texture = null
    this.align = data.align
    this.text = data.text
    this.maxLength = data.maxLength
    this.number = data.number
    this.min = data.min
    this.max = data.max
    this.decimals = data.decimals
    this.type = data.type
    this.padding = data.padding
    this.size = data.size
    this.font = data.font
    this.color = data.color
    this.textX = null
    this.textY = null
    this.textWidth = null
    this.textShiftY = null
    this.innerWidth = null
    this.innerHeight = null
    this.selectionY = null
    this.selectionWidth = null
    this.selectionHeight = null
    this.selectionColor = data.selectionColor
    this.selectionBgColor = data.selectionBgColor
    this.printer = null
  }

  // 读取类型
  get type() {
    return this._type
  }

  // 写入类型
  set type(value) {
    if (this._type !== value) {
      this._type = value
      switch (value) {
        case 'text':
          this.content = this.text
          break
        case 'number':
          this.content = this.number.toString()
          break
      }
    }
  }

  // 读取对齐方式
  get align() {
    return this._align
  }

  // 写入对齐方式
  set align(value) {
    this._align = value
    if (this.connected) {
      this.calculateTextPosition()
    }
  }

  // 读取内边距
  get padding() {
    return this._padding
  }

  // 写入内边距
  set padding(value) {
    if (this._padding !== value) {
      this._padding = value
      if (this.connected) {
        this.calculateTextPosition()
      }
    }
  }

  // 读取字体大小
  get size() {
    return this._size
  }

  // 写入字体大小
  set size(value) {
    if (this._size !== value) {
      this._size = value
      if (this.printer) {
        this.printer.reset()
        this.printer.sizes[0] = value
      }
    }
  }

  // 读取字体
  get font() {
    return this._font
  }

  // 写入字体
  set font(value) {
    if (this._font !== value) {
      this._font = value
      if (this.printer) {
        this.printer.reset()
        this.printer.fonts[0] = value || Printer.font
      }
    }
  }

  // 读取颜色
  get color() {
    return this._color
  }

  // 写入颜色
  set color(value) {
    if (this._color !== value) {
      this._color = value
      this._colorInt = INTRGBA(value)
    }
  }

  // 读取选中颜色
  get selectionColor() {
    return this._selectionColor
  }

  // 写入选中颜色
  set selectionColor(value) {
    if (this._selectionColor !== value) {
      this._selectionColor = value
      this._selectionColorInt = INTRGBA(value)
    }
  }

  // 读取选中背景颜色
  get selectionBgColor() {
    return this._selectionBgColor
  }

  // 写入选中背景颜色
  set selectionBgColor(value) {
    if (this._selectionBgColor !== value) {
      this._selectionBgColor = value
      this._selectionBgColorInt = INTRGBA(value)
    }
  }

  // 更新数据
  update() {
    // 打印文本
    let printer = this.printer
    if (printer === null) {
      const texture = new Texture()
      printer = new Printer(texture)
      printer.matchTag = Function.empty
      printer.sizes[0] = this.size
      printer.fonts[0] = this.font || Printer.font
      printer.colors[0] = '#ffffff'
      printer.effects[0] = {type: 'none'}
      this.texture = texture
      this.printer = printer
    }
    if (printer.content !== this.content) {
      this.updatePrinter()
    }
  }

  // 更新打印机
  updatePrinter() {
    const {printer} = this
    if (printer) {
      // 重置打印机
      if (printer.content) {
        printer.reset()
      }
      // 打印文本
      printer.draw(this.content)
      if (this.connected) {
        this.calculateTextPosition()
      }
    }
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 更新数据
    this.update()

    // 设置上下文属性
    GL.alpha = this.opacity
    GL.blend = 'normal'
    GL.matrix.set(UI.matrix).multiply(this.matrix)

    // 绘制文字纹理
    const {scale} = Printer
    const {texture} = this
    if (texture !== null) {
      if (UI.hover === this.node) {
        // 绘制选中背景
        const dx = this.textX
        const dy = this.selectionY
        const dw = this.selectionWidth
        const dh = this.selectionHeight
        GL.fillRect(dx, dy, dw, dh, this._selectionBgColorInt)
        // 绘制普通文本
        const sy = this.textShiftY
        const sw = Math.min(this.textWidth, this.innerWidth)
        const sh = this.innerHeight
        texture.clip(0, sy * scale, sw * scale, sh * scale)
        GL.drawImageWithColor(texture, this.textX, this.textY, sw, sh, this._selectionColorInt)
      } else {
        // 绘制普通文本
        if (this.content) {
          const sy = this.textShiftY
          const sw = Math.min(this.textWidth, this.innerWidth)
          const sh = this.innerHeight
          texture.clip(0, sy * scale, sw * scale, sh * scale)
          GL.drawImageWithColor(texture, this.textX, this.textY, sw, sh, this._colorInt)
        }
      }
    }

    // 绘制子元素
    this.drawChildren()
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.calculateTextPosition()
    this.resizeChildren()
  }

  // 计算文本位置
  calculateTextPosition() {
    if (this.texture) {
      const scale = Printer.scale
      const printer = this.printer
      const size = printer.sizes[0]
      const vpadding = (this.height - size) / 2
      const paddingTop = printer.paddingTop / scale
      const textWidth = this.texture.base.width / scale
      const textHeight = this.texture.base.height / scale
      this.textX = this.x + this.padding
      this.textY = this.y + Math.max(vpadding - paddingTop, 0)
      this.textWidth = textWidth
      this.textShiftY = Math.max(paddingTop - vpadding, 0)
      this.innerWidth = Math.max(this.width - this.padding * 2, 0)
      this.innerHeight = Math.min(this.height + this.y - this.textY, textHeight)
      this.selectionY = this.y + Math.max(vpadding, 0)
      this.selectionWidth = Math.min(this.innerWidth, printer.width / scale)
      this.selectionHeight = Math.min(this.height, size)
      switch (this.align) {
        case 'center':
          if (textWidth < this.innerWidth) {
            this.textX += (this.innerWidth - textWidth) / 2
          }
          break
        case 'right':
          if (textWidth < this.innerWidth) {
            this.textX += this.innerWidth - textWidth + 1
          }
          break
      }
      // 绘制文本时像素对齐
      const scaleX = Math.max(this.transform.scaleX, 1)
      const scaleY = Math.max(this.transform.scaleY, 1)
      this.textX = Math.round(this.textX * scaleX) / scaleX
      this.textY = Math.round(this.textY * scaleY) / scaleY
    }
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.texture?.destroy()
    this.destroyChildren()
  }
}

// ******************************** 对话框元素 ********************************

UI.DialogBox = class DialogBoxElement extends UI.Text {
  constructor(data) {
    super({...data,
      direction: 'horizontal-tb',
      horizontalAlign: 'left',
      verticalAlign: 'top',
      overflow: 'wrap-truncate',
    })
  }
}

// ******************************** 进度条元素 ********************************

UI.ProgressBar = class ProgressBarElement extends UI.Element {
  texture       //:object
  _image        //:string
  display       //:string
  clip          //:array
  type          //:string
  step          //:number
  centerX       //:number
  centerY       //:number
  startAngle    //:number
  centralAngle  //:number
  progress      //:number
  colorMode     //:string
  color         //:array
  blend         //:string

  constructor(data) {
    super(data)
    this.texture = null
    this.image = data.image
    this.display = data.display
    this.clip = data.clip
    this.type = data.type
    this.step = data.step
    this.centerX = data.centerX
    this.centerY = data.centerY
    this.startAngle = data.startAngle
    this.centralAngle = data.centralAngle
    this.progress = data.progress
    this.colorMode = data.colorMode
    this.color = data.color
    this.blend = data.blend
  }

  // 读取文本
  get image() {
    return this._image
  }

  // 设置文本
  set image(value) {
    if (this._image !== value) {
      this._image = value
      if (this.texture) {
        this.texture.destroy()
        this.texture = null
      }
      if (value) {
        this.texture = new ImageTexture(value)
        this.texture.on('load', () => {
          UI.requestRendering()
        })
      }
    }
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 绘制进度条
    const {texture} = this
    if (texture === null) {
      this.drawDefaultImage()
    } else if (texture.complete) {
      const {base} = texture
      switch (this.display) {
        case 'stretch':
          texture.clip(0, 0, base.width, base.height)
          break
        case 'clip':
          texture.clip(...this.clip)
          break
      }
      const scaleX = this.width / texture.width
      const scaleY = this.height / texture.height
      const {vertices, vertexLength, drawingLength} =
      this.calculateProgressVertices()

      // 绘制图像
      GL.alpha = this.opacity
      GL.blend = this.blend
      GL.matrix.project(
        GL.flip,
        GL.width,
        GL.height,
      )
      .multiply(UI.matrix)
      .multiply(this.matrix)
      .translate(this.x, this.y)
      .scale(scaleX, scaleY)
      const program = GL.imageProgram.use()
      GL.bindVertexArray(program.vao)
      GL.uniformMatrix3fv(program.u_Matrix, false, GL.matrix)
      GL.uniform1i(program.u_LightMode, 0)
      switch (this.colorMode) {
        case 'texture':
          GL.uniform1i(program.u_ColorMode, 0)
          GL.uniform4f(program.u_Tint, 0, 0, 0, 0)
          break
        case 'fixed': {
          const color = this.color
          const red = color[0] / 255
          const green = color[1] / 255
          const blue = color[2] / 255
          const alpha = color[3] / 255
          GL.uniform1i(program.u_ColorMode, 1)
          GL.uniform4f(program.u_Color, red, green, blue, alpha)
          break
        }
      }
      GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.STREAM_DRAW, 0, vertexLength)
      GL.bindTexture(GL.TEXTURE_2D, base.glTexture)
      GL.drawArrays(GL.TRIANGLE_FAN, 0, drawingLength)
    }

    // 绘制子元素
    this.drawChildren()
  }

  // 计算进度条顶点
  calculateProgressVertices() {
    const type = this.type
    const progress = Math.clamp(this.progress, 0, 1)
    const texture = this.texture
    const x = texture.x
    const y = texture.y
    const w = texture.width
    const h = texture.height
    const tw = texture.base.width
    const th = texture.base.height
    const response = UI.ProgressBar.response
    const vertices = response.vertices
    const step = this.step
    switch (type) {
      case 'horizontal': {
        let sw = w * progress
        let sh = h
        if (step !== 0) {
          sw = Math.round(sw / step) * step
          sw = Math.clamp(sw, 0, w)
        }
        const dl = 0
        const dt = 0
        const dr = sw
        const db = sh
        const sl = x / tw
        const st = y / th
        const sr = (x + sw) / tw
        const sb = (y + sh) / th
        vertices[0] = dl
        vertices[1] = dt
        vertices[2] = sl
        vertices[3] = st
        vertices[4] = dl
        vertices[5] = db
        vertices[6] = sl
        vertices[7] = sb
        vertices[8] = dr
        vertices[9] = db
        vertices[10] = sr
        vertices[11] = sb
        vertices[12] = dr
        vertices[13] = dt
        vertices[14] = sr
        vertices[15] = st
        response.vertexLength = 16
        response.drawingLength = 4
        return response
      }
      case 'vertical': {
        let sw = w
        let sh = h * progress
        if (step !== 0) {
          sh = Math.round(sh / step) * step
          sh = Math.clamp(sh, 0, h)
        }
        const dl = 0
        const dt = h - sh
        const dr = sw
        const db = h
        const sl = x / tw
        const st = (y + dt) / th
        const sr = (x + sw) / tw
        const sb = (y + h) / th
        vertices[0] = dl
        vertices[1] = dt
        vertices[2] = sl
        vertices[3] = st
        vertices[4] = dl
        vertices[5] = db
        vertices[6] = sl
        vertices[7] = sb
        vertices[8] = dr
        vertices[9] = db
        vertices[10] = sr
        vertices[11] = sb
        vertices[12] = dr
        vertices[13] = dt
        vertices[14] = sr
        vertices[15] = st
        response.vertexLength = 16
        response.drawingLength = 4
        return response
      }
      case 'round': {
        const angles = response.angles
        const array = response.array
        let startAngle = this.startAngle
        let centralAngle = this.centralAngle
        let currentAngle = centralAngle * progress
        if (step !== 0) {
          currentAngle = Math.round(currentAngle / step) * step
          currentAngle = centralAngle >= 0
          ? Math.min(currentAngle, centralAngle)
          : Math.max(currentAngle, centralAngle)
        }
        if (currentAngle < 0) {
          currentAngle = -currentAngle
          startAngle -= currentAngle
        }
        startAngle = Math.radians(startAngle)
        currentAngle = Math.radians(currentAngle)
        const dl = 0
        const dt = 0
        const dr = w
        const db = h
        const dox = w * this.centerX
        const doy = h * this.centerY
        const tox = dox + x
        const toy = doy + y
        const sox = tox / tw
        const soy = toy / th
        const sl = x / tw
        const st = y / th
        const sr = (x + w) / tw
        const sb = (y + h) / th
        angles[0] = Math.modRadians(Math.atan2(dt - doy, dr - dox) - startAngle)
        angles[1] = Math.modRadians(Math.atan2(db - doy, dr - dox) - startAngle)
        angles[2] = Math.modRadians(Math.atan2(db - doy, dl - dox) - startAngle)
        angles[3] = Math.modRadians(Math.atan2(dt - doy, dl - dox) - startAngle)
        vertices[0] = dox
        vertices[1] = doy
        vertices[2] = sox
        vertices[3] = soy
        let minimum = angles[0]
        let startIndex = 0
        for (let i = 1; i < 4; i++) {
          if (angles[i] < minimum) {
            minimum = angles[i]
            startIndex = i
          }
        }
        let vi = 8
        let endIndex = startIndex
        for (let i = 0; i < 4; i++) {
          const index = (startIndex + i) % 4
          if (angles[index] < currentAngle) {
            switch (index) {
              case 0:
                vertices[vi    ] = dr
                vertices[vi + 1] = dt
                vertices[vi + 2] = sr
                vertices[vi + 3] = st
                break
              case 1:
                vertices[vi    ] = dr
                vertices[vi + 1] = db
                vertices[vi + 2] = sr
                vertices[vi + 3] = sb
                break
              case 2:
                vertices[vi    ] = dl
                vertices[vi + 1] = db
                vertices[vi + 2] = sl
                vertices[vi + 3] = sb
                break
              case 3:
                vertices[vi    ] = dl
                vertices[vi + 1] = dt
                vertices[vi + 2] = sl
                vertices[vi + 3] = st
                break
            }
            vi += 4
          } else {
            endIndex = index
            break
          }
        }
        array[0] = startAngle
        array[1] = startIndex
        array[2] = 4
        array[3] = startAngle + currentAngle
        array[4] = endIndex
        array[5] = vi
        for (let i = 0; i < 6; i += 3) {
          const angle = array[i]
          const side = array[i + 1]
          const vi = array[i + 2]
          switch (side) {
            case 0: {
              const x = Math.tan(angle + Math.PI * 0.5) * doy
              const dx = (dox + x)
              const sx = (tox + x) / tw
              vertices[vi    ] = dx
              vertices[vi + 1] = dt
              vertices[vi + 2] = sx
              vertices[vi + 3] = st
              break
            }
            case 1: {
              const y = Math.tan(angle) * (w - dox)
              const dy = (doy + y)
              const sy = (toy + y) / th
              vertices[vi    ] = dr
              vertices[vi + 1] = dy
              vertices[vi + 2] = sr
              vertices[vi + 3] = sy
              break
            }
            case 2: {
              const x = Math.tan(angle - Math.PI * 0.5) * (h - doy)
              const dx = (dox - x)
              const sx = (tox - x) / tw
              vertices[vi    ] = dx
              vertices[vi + 1] = db
              vertices[vi + 2] = sx
              vertices[vi + 3] = sb
              break
            }
            case 3: {
              const y = Math.tan(angle - Math.PI) * dox
              const dy = (doy - y)
              const sy = (toy - y) / th
              vertices[vi    ] = dl
              vertices[vi + 1] = dy
              vertices[vi + 2] = sl
              vertices[vi + 3] = sy
              break
            }
          }
        }
        const drawingLength = vi / 4 + 1
        response.vertexLength = drawingLength * 4
        response.drawingLength = drawingLength
        return response
      }
    }
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.texture?.destroy()
    this.destroyChildren()
  }

  // 静态 - 返回数据
  static response = {
    vertices: new Float32Array(28),
    angles: new Float64Array(4),
    array: new Float64Array(6),
    vertexLength: null,
    drawingLength: null,
  }
}

// ******************************** 按钮元素 ********************************

UI.Button = class ButtonElement extends UI.Element {
  state         //:string
  shadowImage   //:element
  shadowText    //:element
  _imagePadding //:number
  _textPadding  //:number
  normalImage   //:string
  normalClip    //:array
  hoverImage    //:string
  hoverClip     //:array
  activeImage   //:string
  activeClip    //:array
  normalColor   //:string
  hoverColor    //:string
  activeColor   //:string
  _imageOpacity //:number
  imageEffect   //:string
  normalTint    //:array
  hoverTint     //:array
  activeTint    //:array

  constructor(data) {
    super(data)
    this.state = 'normal'
    this.shadowImage = this.createShadowImage(data)
    this.shadowText = this.createShadowText(data)
    this.imageOpacity = data.imageOpacity
    this.imagePadding = data.imagePadding
    this.textPadding = data.textPadding
    this.normalImage = data.normalImage
    this.normalClip = data.normalClip
    this.hoverImage = data.hoverImage
    this.hoverClip = data.hoverClip
    this.activeImage = data.activeImage
    this.activeClip = data.activeClip
    this.normalColor = data.normalColor
    this.hoverColor = data.hoverColor
    this.activeColor = data.activeColor
    this.imageEffect = data.imageEffect
    this.normalTint = data.normalTint
    this.hoverTint = data.hoverTint
    this.activeTint = data.activeTint
  }

  // 读取图像内边距
  get imagePadding() {
    return this._imagePadding
  }

  // 写入图像内边距
  set imagePadding(value) {
    if (this._imagePadding !== value) {
      this._imagePadding = value
      this.shadowImage.transform.width = -value * 2
      this.shadowImage.transform.height = -value * 2
      if (this.connected) {
        this.shadowImage.resize()
      }
    }
  }

  // 读取文本内边距
  get textPadding() {
    return this._textPadding
  }

  // 写入文本内边距
  set textPadding(value) {
    if (this._textPadding !== value) {
      this._textPadding = value
      this.shadowText.transform.width = -value * 2
      this.shadowText.transform.height = -value * 2
      if (this.connected) {
        this.shadowText.resize()
      }
    }
  }

  // 读取图像
  get image() {
    return this.shadowImage.image
  }

  // 写入图像
  set image(value) {
    this.shadowImage.image = value
  }

  // 读取显示模式
  get display() {
    return this.shadowImage.display
  }

  // 写入显示模式
  set display(value) {
    this.shadowImage.display = value
  }

  // 读取翻转模式
  get flip() {
    return this.shadowImage.flip
  }

  // 写入翻转模式
  set flip(value) {
    this.shadowImage.flip = value
  }

  // 读取裁剪区域
  get clip() {
    return this.shadowImage.clip
  }

  // 写入裁剪区域
  set clip(value) {
    this.shadowImage.clip = value
  }

  // 读取图像切片边距
  get border() {
    return this.shadowImage.border
  }

  // 写入图像切片边距
  set border(value) {
    this.shadowImage.border = value
  }

  // 读取图像不透明度
  get imageOpacity() {
    return this.shadowImage.transform.opacity
  }

  // 写入图像不透明度
  set imageOpacity(value) {
    this.shadowImage.transform.opacity = value
    if (this.connected) {
      this.shadowImage.resize()
    }
  }

  // 读取文本内容
  get content() {
    return this.shadowText.content
  }

  // 写入文本内容
  set content(value) {
    this.shadowText.content = value
  }

  // 读取字体大小
  get size() {
    return this.shadowText.size
  }

  // 写入字体大小
  set size(value) {
    this.shadowText.size = value
  }

  // 读取字体
  get font() {
    return this.shadowText.font
  }

  // 写入字体
  set font(value) {
    this.shadowText.font = value
  }

  // 读取方向
  get direction() {
    return this.shadowText.direction
  }

  // 写入方向
  set direction(value) {
    this.shadowText.direction = value
  }

  // 读取水平对齐
  get horizontalAlign() {
    return this.shadowText.horizontalAlign
  }

  // 写入水平对齐
  set horizontalAlign(value) {
    this.shadowText.horizontalAlign = value
  }

  // 读取垂直对齐
  get verticalAlign() {
    return this.shadowText.verticalAlign
  }

  // 写入垂直对齐
  set verticalAlign(value) {
    this.shadowText.verticalAlign = value
  }

  // 读取字体大小
  get size() {
    return this.shadowText.size
  }

  // 写入字体大小
  set size(value) {
    this.shadowText.size = value
  }

  // 读取行间距
  get lineSpacing() {
    return this.shadowText.lineSpacing
  }

  // 写入行间距
  set lineSpacing(value) {
    this.shadowText.lineSpacing = value
  }

  // 读取字间距
  get letterSpacing() {
    return this.shadowText.letterSpacing
  }

  // 写入字间距
  set letterSpacing(value) {
    this.shadowText.letterSpacing = value
  }

  // 读取颜色
  get color() {
    return this.shadowText.color
  }

  // 写入颜色
  set color(value) {
    this.shadowText.color = value
  }

  // 读取字体
  get font() {
    return this.shadowText.font
  }

  // 写入字体
  set font(value) {
    this.shadowText.font = value
  }

  // 读取字型
  get typeface() {
    return this.shadowText.typeface
  }

  // 写入字型
  set typeface(value) {
    this.shadowText.typeface = value
  }

  // 读取文字效果
  get textEffect() {
    return this.shadowText.effect
  }

  // 写入文字效果
  set textEffect(value) {
    this.shadowText.effect = value
  }

  // 创建影子图像元素
  createShadowImage(data) {
    const image = data.normalImage
    const clip = data.normalClip
    const tint = [0, 0, 0, 0]
    const transform = this.createShadowTransform()
    const element = new UI.Image({...data, image, clip, tint, transform})
    element.parent = this
    element.connected = true
    return element
  }

  // 创建影子文本元素
  createShadowText(data) {
    const color = data.normalColor
    const effect = data.textEffect
    const transform = this.createShadowTransform()
    const element = new UI.Text({...data, color, effect, transform})
    element.parent = this
    element.connected = true
    return element
  }

  // 创建影子变换对象
  createShadowTransform() {
    const transform = Inspector.uiElement.createTransform()
    transform.anchorX = 0.5
    transform.anchorY = 0.5
    transform.x2 = 0.5
    transform.y2 = 0.5
    transform.width2 = 1
    transform.height2 = 1
    return transform
  }

  // 更新文本内容
  updateTextContent() {
    this.shadowText.updateTextContent()
  }

  // 更新打印机
  updatePrinter() {
    this.shadowText.updatePrinter()
  }

  // 更新图像
  updateImage() {
    let state
    if (UI.dragging?.node === this.node) {
      state = 'active'
    } else if (UI.hover === this.node) {
      state = 'hover'
    } else {
      state = 'normal'
    }
    if (this.state !== state) {
      this.state = state
      switch (state) {
        case 'normal':
          // 正常状态
          this.image = this.normalImage
          this.color = this.normalColor
          this.clip = this.normalClip
          switch (this.imageEffect) {
            case 'none':
              this.shadowImage.tint.fill(0)
              break
            case 'tint-1':
            case 'tint-2':
            case 'tint-3':
              this.shadowImage.tint.set(this.normalTint)
              break
          }
          break
        case 'hover':
          // 鼠标悬停状态
          this.image = this.hoverImage || this.normalImage
          this.color = this.hoverColor || this.normalColor
          this.clip = this.hoverImage && this.hoverClip || this.normalClip
          switch (this.imageEffect) {
            case 'none':
              break
            case 'tint-1':
              this.shadowImage.tint.set(this.normalTint)
              break
            case 'tint-2':
            case 'tint-3':
              this.shadowImage.tint.set(this.hoverTint)
              break
          }
          break
        case 'active':
          // 鼠标按下状态
          this.image = this.activeImage || this.hoverImage || this.normalImage
          this.color = this.activeColor || this.hoverColor || this.normalColor
          this.clip = this.activeImage && this.activeClip || this.hoverImage && this.hoverClip || this.normalClip
          switch (this.imageEffect) {
            case 'none':
              break
            case 'tint-1':
              this.shadowImage.tint.set(this.normalTint)
              break
            case 'tint-2':
              this.shadowImage.tint.set(this.hoverTint)
              break
            case 'tint-3':
              this.shadowImage.tint.set(this.activeTint)
              break
          }
          break
      }
    }
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 更新图像
    this.updateImage()

    // 绘制图像(不存在图片时跳过)
    if (this.image) {
      this.shadowImage.visible = this.visible
      this.shadowImage.draw()
    }

    // 绘制文本
    this.shadowText.visible = this.visible
    this.shadowText.draw()

    // 绘制子元素
    this.drawChildren()
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.shadowImage.resize()
    this.shadowText.resize()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.shadowImage.destroy()
    this.shadowText.destroy()
    this.destroyChildren()
  }
}

// ******************************** 动画元素 ********************************

UI.Animation = class AnimationElement extends UI.Element {
  player      //:object
  _animation  //:string
  _motion     //:string
  _rotatable  //:boolean
  _angle      //:number
  _frame      //:number
  _offsetX    //:number
  _offsetY    //:number
  animationX  //:number
  animationY  //:number

  constructor(data) {
    super(data)
    this.player = null
    this.motion = data.motion
    this.rotatable = data.rotatable
    this.angle = data.angle
    this.frame = data.frame
    this.offsetX = data.offsetX
    this.offsetY = data.offsetY
    this.animation = data.animation
  }

  // 读取动画ID
  get animation() {
    return this._animation
  }

  // 写入动画ID
  set animation(value) {
    if (this._animation !== value) {
      this._animation = value
      if (this.player !== null) {
        this.player.destroy()
        this.player = null
      }
      const animation = Data.animations[value]
      if (animation !== undefined) {
        this.player = new Animation.Player(animation)
        this.player.setAsUIComponent()
        this.player.setMotion(this.motion)
        this.player.rotatable = this.rotatable
        this.player.setAngle(Math.radians(this.angle))
        this.player.goto(this.frame)
      }
    }
  }

  // 读取动作
  get motion() {
    return this._motion
  }

  // 写入动作
  set motion(value) {
    if (this._motion !== value) {
      this._motion = value
      this.player?.setMotion(value)
    }
  }

  // 读取可旋转开关
  get rotatable() {
    return this._rotatable
  }

  // 写入可旋转开关
  set rotatable(value) {
    if (this._rotatable !== value) {
      this._rotatable = value
      if (this.player) {
        this.player.rotatable = value
        this.player.rotation = 0
        if (typeof this.angle === 'number') {
          this.player.setAngle(Math.radians(this.angle))
        }
      }
    }
  }

  // 读取角度
  get angle() {
    return this._angle
  }

  // 写入角度
  set angle(value) {
    if (this._angle !== value) {
      this._angle = value
      this.player?.setAngle(Math.radians(value))
    }
  }

  // 读取帧索引
  get frame() {
    return this._frame
  }

  // 写入帧索引
  set frame(value) {
    if (this._frame !== value) {
      this._frame = value
      this.player?.goto(value)
    }
  }

  // 读取偏移X
  get offsetX() {
    return this._offsetX
  }

  // 写入偏移X
  set offsetX(value) {
    if (this._offsetX !== value) {
      this._offsetX = value
      if (this.connected) {
        this.calculateAnimationPosition()
      }
    }
  }

  // 读取偏移Y
  get offsetY() {
    return this._offsetY
  }

  // 写入偏移Y
  set offsetY(value) {
    if (this._offsetY !== value) {
      this._offsetY = value
      if (this.connected) {
        this.calculateAnimationPosition()
      }
    }
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }
    const player = this.player
    if (player !== null) {
      GL.alpha = this.opacity
      const gl = GL
      const sl = UI.scrollLeft
      const st = UI.scrollTop
      const sr = UI.scrollRight
      const sb = UI.scrollBottom
      const program = gl.spriteProgram.use()
      const matrix = gl.matrix.project(
        gl.flip,
        sr - sl,
        sb - st,
      ).translate(-sl, -st)
      .multiply(this.matrix)
      gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
      gl.batchRenderer.bindProgram()
      gl.batchRenderer.setAttrSize(8)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      player.setPosition(this.animationX, this.animationY)
      player.updateFrameParameters(player.contexts, player.index)
      player.draw(1, 'raw')
      gl.batchRenderer.draw()
      gl.batchRenderer.unbindProgram()
    }

    // 绘制锚点
    this.drawAnchor()

    // 绘制子元素
    this.drawChildren()
  }

  // 绘制锚点
  drawAnchor() {
    if (UI.target === this.node) {
      const gl = GL
      const vertices = gl.arrays[0].float32
      const matrix = gl.matrix
      .set(UI.matrix)
      .multiply(this.matrix)
      const ax = this.animationX
      const ay = this.animationY
      const a = matrix[0]
      const b = matrix[1]
      const c = matrix[3]
      const d = matrix[4]
      const e = matrix[6]
      const f = matrix[7]
      const x = a * ax + c * ay + e
      const y = b * ax + d * ay + f
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
      gl.vertexAttrib4f(program.a_Color, 0, 1, 0, 1)
      gl.drawArrays(gl.LINES, 0, 4)
    }
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.calculateAnimationPosition()
    this.resizeChildren()
  }

  // 计算动画位置
  calculateAnimationPosition() {
    this.animationX = this.x + this.width / 2 + this.offsetX
    this.animationY = this.y + this.height / 2 + this.offsetY
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.player?.destroy()
    this.destroyChildren()
  }
}

// ******************************** 视频元素 ********************************

UI.Video = class VideoElement extends UI.Element {
  video   //:string
  loop    //:boolean
  flip    //:string
  blend   //:string

  constructor(data) {
    super(data)
    this.video = data.video
    this.loop = data.loop
    this.flip = data.flip
    this.blend = data.blend
  }

  // 绘制图像
  draw() {
    this.drawDefaultImage()
    this.drawChildren()
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.destroyChildren()
  }
}

// ******************************** 窗口元素 ********************************

UI.Window = class WindowElement extends UI.Element {
  _layout       //:string
  scrollWidth   //:number
  scrollHeight  //:number
  _scrollX      //:number
  _scrollY      //:number
  gridWidth     //:number
  gridHeight    //:number
  gridGapX      //:number
  gridGapY      //:number
  paddingX      //:number
  paddingY      //:number
  overflow      //:string
  columns       //:number
  rows          //:number
  proxy         //:object

  constructor(data) {
    super(data)
    this.layout = data.layout
    this.scrollWidth = 0
    this.scrollHeight = 0
    this.scrollX = data.scrollX
    this.scrollY = data.scrollY
    this.gridWidth = data.gridWidth
    this.gridHeight = data.gridHeight
    this.gridGapX = data.gridGapX
    this.gridGapY = data.gridGapY
    this.paddingX = data.paddingX
    this.paddingY = data.paddingY
    this.overflow = data.overflow
    this.columns = 0
    this.rows = 0
    this.proxy = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      matrix: null,
      opacity: 0,
    }
  }

  // 读取布局
  get layout() {
    return this._layout
  }

  // 写入布局
  set layout(value) {
    if (this._layout !== value) {
      this._layout = value
      switch (value) {
        case 'normal':
          delete this.resize
          break
        case 'horizontal-grid':
          this.resize = WindowElement.horizontalGridResize
          break
        case 'vertical-grid':
          this.resize = WindowElement.verticalGridResize
          break
      }
      if (this.connected) {
        this.resize()
      }
    }
  }

  // 读取滚动X
  get scrollX() {
    return this._scrollX
  }

  // 写入滚动X
  set scrollX(value) {
    const max = this.scrollWidth - this.width
    const scrollX = Math.clamp(value, 0, max)
    if (this._scrollX !== scrollX) {
      this._scrollX = scrollX
      if (this.connected) {
        this.resize()
        UI.requestRendering()
      }
    }
  }

  // 读取滚动Y
  get scrollY() {
    return this._scrollY
  }

  // 写入滚动Y
  set scrollY(value) {
    const max = this.scrollHeight - this.height
    const scrollY = Math.clamp(value, 0, max)
    if (this._scrollY !== value) {
      this._scrollY = scrollY
      if (this.connected) {
        this.resize()
        UI.requestRendering()
      }
    }
  }

  // 绘制图像
  draw() {
    switch (this.overflow) {
      case 'visible':
        this.drawChildren()
        break
      case 'hidden':
        if (!GL.depthTest) {
          GL.alpha = 1
          GL.blend = 'normal'
          GL.depthTest = true
          GL.enable(GL.DEPTH_TEST)
          GL.depthFunc(GL.ALWAYS)
          GL.matrix.set(UI.matrix).multiply(this.matrix)
          GL.fillRect(this.x, this.y, this.width, this.height, 0x00000000)
          GL.depthFunc(GL.EQUAL)
          this.drawChildren()
          GL.clear(GL.DEPTH_BUFFER_BIT)
          GL.disable(GL.DEPTH_TEST)
          GL.depthTest = false
        }
        break
    }
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    const {children} = this
    const {length} = children
    const {proxy} = this
    proxy.x = this.x - this.scrollX
    proxy.y = this.y - this.scrollY
    proxy.width = this.width
    proxy.height = this.height
    proxy.matrix = this.matrix
    proxy.opacity = this.opacity
    for (let i = 0; i < length; i++) {
      const element = children[i]
      element.parent = proxy
      element.resize()
      element.parent = this
    }
    this._calculateScrollArea()
  }

  // 请求调整大小
  requestResizing = (IIFE => {
    const timer = new Timer({
      duration: 0,
      callback: () => this.resize(),
    })
    return () => timer.add()
  })()

  // 计算滚动区域
  _calculateScrollArea() {
    const {max} = Math
    const {children} = this
    const {length} = children
    const parentWidth = this.width
    const parentHeight = this.height
    let scrollWidth = this.width
    let scrollHeight = this.height
    for (let i = 0; i < length; i++) {
      const {transform} = children[i]
      const sx = transform.scaleX
      const sy = transform.scaleY
      const x = transform.x + transform.x2 * parentWidth
      const y = transform.y + transform.y2 * parentHeight
      const w = max(transform.width + transform.width2 * parentWidth, 0)
      const h = max(transform.height + transform.height2 * parentHeight, 0)
      scrollWidth = max(scrollWidth, x + (1 - transform.anchorX) * w * sx)
      scrollHeight = max(scrollHeight, y + (1 - transform.anchorY) * h * sy)
    }
    this.scrollWidth = scrollWidth
    this.scrollHeight = scrollHeight
    // this.scrollX = this.scrollX
    // this.scrollY = this.scrollY
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.destroyChildren()
  }

  // 水平网格 - 调整大小
  static horizontalGridResize() {
    this.calculatePosition()
    const {children} = this
    const {length} = children
    if (length === 0) {
      this.columns = 0
      this.rows = 0
      return
    }
    const {floor, ceil, max} = Math
    const {proxy} = this
    const {gridWidth, gridHeight, gridGapX, gridGapY, paddingX, paddingY} = this
    const unitWidth = gridWidth + gridGapX
    const unitHeight = gridHeight + gridGapY
    const columns = unitWidth === 0 ? length
    : max(floor((this.width + gridGapX - paddingX * 2) / unitWidth), 1)
    const rows = ceil(length / columns)
    const scrollHeight = rows * unitHeight - gridGapY + paddingY * 2
    this.scrollWidth = max(this.width, gridWidth)
    this.scrollHeight = max(this.height, scrollHeight)
    this.columns = columns
    this.rows = rows
    proxy.width = gridWidth
    proxy.height = gridHeight
    proxy.matrix = this.matrix
    proxy.opacity = this.opacity
    const sx = this.x - this.scrollX + paddingX
    const sy = this.y - this.scrollY + paddingY
    for (let i = 0; i < length; i++) {
      const element = children[i]
      proxy.x = sx + i % columns * unitWidth
      proxy.y = sy + floor(i / columns) * unitHeight
      element.parent = proxy
      element.resize()
      element.parent = this
    }
  }

  // 垂直网格 - 调整大小
  static verticalGridResize() {
    this.calculatePosition()
    const {children} = this
    const {length} = children
    if (length === 0) {
      this.columns = 0
      this.rows = 0
      return
    }
    const {floor, ceil, max} = Math
    const {proxy} = this
    const {gridWidth, gridHeight, gridGapX, gridGapY, paddingX, paddingY} = this
    const unitWidth = gridWidth + gridGapX
    const unitHeight = gridHeight + gridGapY
    const rows = unitHeight === 0 ? length
    : max(floor((this.height + gridGapY - paddingY * 2) / unitHeight), 1)
    const columns = ceil(length / rows)
    const scrollWidth = columns * unitWidth - gridGapX + paddingX * 2
    this.scrollWidth = max(this.width, scrollWidth)
    this.scrollHeight = max(this.height, gridHeight)
    this.columns = columns
    this.rows = rows
    proxy.width = gridWidth
    proxy.height = gridHeight
    proxy.matrix = this.matrix
    proxy.opacity = this.opacity
    const sx = this.x - this.scrollX + paddingX
    const sy = this.y - this.scrollY + paddingY
    for (let i = 0; i < length; i++) {
      const element = children[i]
      proxy.x = sx + floor(i / rows) * unitWidth
      proxy.y = sy + i % rows * unitHeight
      element.parent = proxy
      element.resize()
      element.parent = this
    }
  }
}

// ******************************** 容器元素 ********************************

UI.Container = class ContainerElement extends UI.Element {
  // 绘制图像
  draw() {
    this.drawChildren()
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.destroyChildren()
  }
}

// ******************************** 引用元素 ********************************

UI.Reference = class ReferenceElement extends UI.Element {
  _prefabId = undefined
  _synchronous = undefined
  historyEnabled = false
  prefab = null
  paths = {}

  constructor(data) {
    super(data)
    this.paths[data.presetId] = true
    this.prefabId = data.prefabId
    this.synchronous = data.synchronous
  }

  // 读取预制件ID
  get prefabId() {
    return this._prefabId
  }

  // 写入预制件ID
  set prefabId(value) {
    if (this._prefabId !== value) {
      const firstTime = this._prefabId === undefined
      this._prefabId = value
      this.clear()
      const preset = Data.uiPresets[value]
      if (preset && preset.data.class !== 'reference') {
        // 加载被引用的元素
        this.loadElement(preset.data, this)
        if (this.children.length !== 0) {
          this.prefab = this.children[0]
          UI.root.addReference(this.prefab)
          if (this.synchronous) {
            this.lockTransform()
            this.setToPrefabSize()
          } else {
            this.unlockTransform()
            if (!firstTime) {
              this.setToPrefabSize()
            }
          }
        }
      }
    }
  }

  // 读取同步开关
  get synchronous() {
    return this._synchronous
  }

  // 写入同步开关
  set synchronous(value) {
    if (this._synchronous !== value) {
      this._synchronous = value
      if (value) {
        this.lockTransform()
        this.setToPrefabSize()
      } else {
        this.unlockTransform()
      }
    }
  }

  // 设置为预制件大小
  setToPrefabSize() {
    if (!this.prefab) return
    const sTransform = this.transform
    const dTransform = this.prefab.node.transform
    const changes = []
    for (const key of Object.keys(dTransform)) {
      switch (key) {
        case 'x':
        case 'x2':
        case 'y':
        case 'y2':
          continue
      }
      if (sTransform[key] !== dTransform[key]) {
        if (this.historyEnabled) {
          changes.push({
            input: $(`#uiElement-transform-${key}`),
            oldValue: sTransform[key],
            newValue: dTransform[key],
          })
        }
        sTransform[key] = dTransform[key]
      }
    }
    if (changes.length !== 0) {
      UI.history.save({
        type: 'inspector-change',
        editor: Inspector.uiElement,
        target: this.node,
        changes: changes,
      })
    }
    if (Inspector.uiElement.target === this.node) {
      Inspector.uiElement.write(sTransform)
    }
    this.resize()
  }

  // 加载元素
  loadElement(node, parent) {
    const {presetId} = node
    const {paths} = parent
    if (!(presetId in paths)) {
      const element = UI.createElement(node, false)
      element.paths = Object.create(paths)
      element.paths[presetId] = true
      parent.appendChild(element)
      for (const child of node.children) {
        this.loadElement(child, element)
      }
    }
  }

  // 更新
  update() {
    this.prefab.destroyChildren()
    this.prefab.children.length = 0
    for (const node of this.prefab.node.children) {
      this.loadElement(node, this.prefab)
    }
  }

  // 绘制图像
  draw() {
    this.drawChildren()
  }

  // 锁定元素大小
  lockTransform() {
    if (this.prefab) {
      const parent = this
      const transform = this.transform
      this.prefab.transform = new class Transform {
        get anchorX() {return 0}
        set anchorX(value) {transform.anchorX = value; parent.resize()}
        get anchorY() {return 0}
        set anchorY(value) {transform.anchorY = value; parent.resize()}
        get x() {return 0}
        set x(value) {}
        get x2() {return 0}
        set x2(value) {}
        get y() {return 0}
        set y(value) {}
        get y2() {return 0}
        set y2(value) {}
        get width() {return 0}
        set width(value) {transform.width = value; parent.resize()}
        get width2() {return 1}
        set width2(value) {transform.width2 = value; parent.resize()}
        get height() {return 0}
        set height(value) {transform.height = value; parent.resize()}
        get height2() {return 1}
        set height2(value) {transform.height2 = value; parent.resize()}
        get rotation() {return 0}
        set rotation(value) {transform.rotation = value; parent.resize()}
        get scaleX() {return 1}
        set scaleX(value) {transform.scaleX = value; parent.resize()}
        get scaleY() {return 1}
        set scaleY(value) {transform.scaleY = value; parent.resize()}
        get skewX() {return 0}
        set skewX(value) {transform.skewX = value; parent.resize()}
        get skewY() {return 0}
        set skewY(value) {transform.skewY = value; parent.resize()}
        get opacity() {return 1}
        set opacity(value) {transform.opacity = value; parent.resize()}
      }
    }
    if (Inspector.uiElement.target === this.node) {
      Inspector.uiElement.lockSizeInputs()
    }
  }

  // 取消锁定元素大小
  unlockTransform() {
    if (this.prefab) {
      this.prefab.transform = new class Transform {
        get anchorX() {return 0}
        set anchorX(value) {}
        get anchorY() {return 0}
        set anchorY(value) {}
        get x() {return 0}
        set x(value) {}
        get x2() {return 0}
        set x2(value) {}
        get y() {return 0}
        set y(value) {}
        get y2() {return 0}
        set y2(value) {}
        get width() {return 0}
        set width(value) {}
        get width2() {return 1}
        set width2(value) {}
        get height() {return 0}
        set height(value) {}
        get height2() {return 1}
        set height2(value) {}
        get rotation() {return 0}
        set rotation(value) {}
        get scaleX() {return 1}
        set scaleX(value) {}
        get scaleY() {return 1}
        set scaleY(value) {}
        get skewX() {return 0}
        set skewX(value) {}
        get skewY() {return 0}
        set skewY(value) {}
        get opacity() {return 1}
        set opacity(value) {}
      }
    }
    if (Inspector.uiElement.target === this.node) {
      Inspector.uiElement.unlockSizeInputs()
    }
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.resizeChildren()
  }

  // 销毁元素
  destroy() {
    super.destroy()
    this.clear()
  }

  // 清除元素
  clear() {
    if (this.prefab) {
      this.getRoot().removeReference(this.prefab)
      this.prefab = null
      this.destroyChildren()
      this.children.length = 0
    }
  }

  // 获取根元素
  getRoot() {
    // 删除元素操作必须用这个获取
    if (UI.root) return UI.root
    // 关闭标签页后销毁用这个获取
    let element = this.parent
    while (!(element instanceof UI.Root)) {
      element = element.parent
    }
    return element
  }
}

// ******************************** 元素实例列表 ********************************

class UIInstanceList extends Array {
  // 设置属性
  set(key, value) {
    const keys = key.split('-')
    const last = keys.length - 1
    const property = keys[last]
    for (const element of this) {
      let node = element
      for (let i = 0; i < last; i++) {
        node = node[keys[i]]
      }
      node[property] = value
    }
  }

  // 调整大小
  resize() {
    for (const element of this) {
      element.resize()
    }
  }
}