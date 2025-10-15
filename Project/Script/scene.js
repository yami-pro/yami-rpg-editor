'use strict'

// ******************************** 场景窗口 ********************************

const Scene = {
  // properties
  state: 'closed',
  page: $('#scene'),
  head: $('#scene-head'),
  body: $('#scene-body').hide(),
  info: $('#scene-info'),
  screen: $('#scene-screen'),
  marquee: $('#scene-marquee'),
  searcher: $('#scene-searcher'),
  list: $('#scene-list'),
  // editor properties
  dragging: null,
  tilemap: null,
  target: null,
  layer: null,
  brush: null,
  symbol: null,
  history: null,
  textures: null,
  shiftKey: false,
  translationKey: 0b0000,
  translationTimer: null,
  showGrid: false,
  showLight: false,
  showAnimation: false,
  animationFrame: null,
  animationElapsed: null,
  background: null,
  matrix: null,
  zoom: null,
  zoomTimer: null,
  scale: null,
  scaleX: null,
  scaleY: null,
  scaledTileWidth: null,
  scaledTileHeight: null,
  aspectRatio: null,
  outerWidth: null,
  outerHeight: null,
  scrollLeft: null,
  scrollTop: null,
  scrollRight: null,
  scrollBottom: null,
  scrollCenterX: null,
  scrollCenterY: null,
  centerOffsetX: null,
  centerOffsetY: null,
  lightLeft: null,
  lightTop: null,
  lightRight: null,
  lightBottom: null,
  padding: null,
  paddingLeft: null,
  paddingTop: null,
  patternOriginX: null,
  patternOriginY: null,
  inspectorTypeMap: null,
  tilemapLightSamplingModes: null,
  defaultLightSamplingModes: null,
  startPositionTexture: null,
  blendModeMap: null,
  activeTilemapId: null,
  sharedPoint: null,
  previewObject: null,
  // scene properties
  context: null,
  meta: null,
  width: null,
  height: null,
  tileWidth: null,
  tileHeight: null,
  animationInterval: null,
  ambient: null,
  terrains: null,
  events: null,
  scripts: null,
  objects: null,
  tilemaps: null,
  actors: null,
  regions: null,
  lights: null,
  animations: null,
  particles: null,
  parallaxes: null,
  backgrounds: null,
  foregrounds: null,
  doodads: null,
  // methods
  initialize: null,
  open: null,
  load: null,
  save: null,
  close: null,
  destroy: null,
  shiftTilemap: null,
  shiftTerrains: null,
  shiftObjects: null,
  computeObjectShifting: null,
  getDefaultObjectFolder: null,
  copy: null,
  paste: null,
  duplicate: null,
  create: null,
  delete: null,
  toggle: null,
  undo: null,
  redo: null,
  setZoom: null,
  setSize: null,
  setTileSize: null,
  setTilemapSize: null,
  setTarget: null,
  openTilemap: null,
  closeTilemap: null,
  computeActiveTilemapId: null,
  revealTarget: null,
  shiftTarget: null,
  redirectTarget: null,
  updateTarget: null,
  updateTargetInfo: null,
  updateTargetItem: null,
  updateTargetEditor: null,
  updateAnimationInterval: null,
  updateLightAreaExpansion: null,
  updateActorTeams: null,
  updateHead: null,
  resize: null,
  getTileCoords: null,
  getConvertedCoords: null,
  getParallaxAnchor: null,
  getGridContext: null,
  rasterizeScrollPosition: null,
  updateLightTexParameters: null,
  updateCamera: null,
  updateTransform: null,
  registerPreset: null,
  unregisterPreset: null,
  sortLayers: null,
  loadObjects: null,
  loadTextures: null,
  loadAllContexts: null,
  loadActorContext: null,
  loadLightContext: null,
  loadAnimationContext: null,
  loadParallaxContext: null,
  loadParticleContext: null,
  loadObjectContext: null,
  reloadObjectContext: null,
  destroyObjectContext: null,
  createPreviewObject: null,
  deletePreviewObject: null,
  updateParallaxes: null,
  drawScene: null,
  drawBackgrounds: null,
  drawForegrounds: null,
  updateAnimations: null,
  updateParticles: null,
  drawTileLayer: null,
  drawGridLayer: null,
  drawRegionLayer: null,
  drawRegionBorders: null,
  drawObjectLayer: null,
  drawDirectLightLayer: null,
  drawNameLayer: null,
  drawTerrainLayer: null,
  drawLightTextures: null,
  drawTilemap: null,
  drawTilePreview: null,
  drawTileMarquee: null,
  drawTerrainMarquee: null,
  drawTilemapWireframe: null,
  drawAnimationWireframe: null,
  drawAnimationAnchor: null,
  drawLightWireframe: null,
  drawRegionWireframe: null,
  drawParticleEmitterWireframe: null,
  drawParallaxWireframe: null,
  drawOvalWireframe: null,
  drawTargetAnchor: null,
  drawRectWireframe: null,
  drawRectWireframeOnTilemap: null,
  setRectWireframeVertices: null,
  createStartPositionTexture: null,
  drawStartPosition: null,
  selectObject: null,
  selectRegion: null,
  selectLight: null,
  selectParticleEmitter: null,
  selectSortedLayer: null,
  edit: null,
  editInPencilMode: null,
  editInRectMode: null,
  editInOvalMode: null,
  editInFillMode: null,
  setTile: null,
  setTileFrame: null,
  setTerrain: null,
  createTiles: null,
  cloneTiles: null,
  createTerrains: null,
  getNewTilesetIndex: null,
  requestAnimation: null,
  updateAnimation: null,
  stopAnimation: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  switchLayer: null,
  switchBrush: null,
  switchGrid: null,
  switchLight: null,
  switchAnimation: null,
  switchSettings: null,
  switchTerrain: null,
  resetAnimations: null,
  updateFont: null,
  planToSave: null,
  planToSaveTerrains: null,
  beginMapRecord: null,
  closeMapRecord: null,
  saveMapRecord: null,
  recordMapData: null,
  restoreMapData: null,
  undoMapData: null,
  redoMapData: null,
  createHistory: null,
  createDefaultAnimation: null,
  saveToConfig: null,
  loadFromConfig: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  webglRestored: null,
  windowResize: null,
  themechange: null,
  dprchange: null,
  datachange: null,
  keydown: null,
  headPointerdown: null,
  switchPointerdown: null,
  layerPointerdown: null,
  brushPointerdown: null,
  zoomFocus: null,
  zoomInput: null,
  screenKeydown: null,
  shiftKeyup: null,
  translationKeyup: null,
  screenWheel: null,
  screenUserscroll: null,
  screenBlur: null,
  screenDragenter: null,
  screenDragleave: null,
  screenDragover: null,
  screenDrop: null,
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
  Textures: null,
  Point: null,
}

// marquee properties
Scene.marquee.key = null
Scene.marquee.offsetX = null
Scene.marquee.offsetY = null
Scene.marquee.tilesetMap = null
Scene.marquee.tiles = null
Scene.marquee.terrain = null
Scene.marquee.previewTiles = false
Scene.marquee.pointerevent = null
// marquee methods
Scene.marquee.save = null
Scene.marquee.switch = null
Scene.marquee.resize = null
Scene.marquee.clear = null
Scene.marquee.select = null
Scene.marquee.selectInPencilMode = null
Scene.marquee.selectInRectMode = null
Scene.marquee.selectInCopyMode = null
Scene.marquee.selectInObjectMode = null
Scene.marquee.getTiles = null

// list properties
Scene.list.page = $('#scene-object')
Scene.list.head = $('#scene-list-head')
// list methods
Scene.list.copy = null
Scene.list.paste = null
Scene.list.duplicate = null
Scene.list.delete = null
Scene.list.toggle = null
Scene.list.cancelSearch = null
Scene.list.createFolder = null
Scene.list.createTilemapShortcutItems = null
Scene.list.restoreRecursiveStates = null
Scene.list.setRecursiveStates = null
Scene.list.updateItemClass = null
Scene.list.updateFolderState = null
Scene.list.canSwitchState = null
Scene.list.createIcon = null
Scene.list.updateIcon = null
Scene.list.updateHead = null
Scene.list.updateTilemapClass = null
Scene.list.createConditionIcon = null
Scene.list.updateConditionIcon = null
Scene.list.createEventIcon = null
Scene.list.updateEventIcon = null
Scene.list.createScriptIcon = null
Scene.list.updateScriptIcon = null
Scene.list.createVisibilityIcon = null
Scene.list.updateVisibilityIcon = null
Scene.list.createLockIcon = null
Scene.list.updateLockIcon = null
Scene.list.onCreate = null
Scene.list.onRemove = null
Scene.list.onDelete = null
Scene.list.onResume = null

// 初始化
Scene.initialize = function () {
  // 绑定滚动条
  this.screen.addScrollbars()

  // 创建位移计时器
  this.translationTimer = new Timer({
    duration: Infinity,
    update: timer => {
      if (this.state === 'open' &&
        this.dragging === null) {
        const key = this.translationKey
        const meta = this.meta
        const step = Timer.deltaTime * 0.04 / this.scale
        let x = 0
        let y = 0
        if (key & 0b0001) {x -= step}
        if (key & 0b0010) {y -= step}
        if (key & 0b0100) {x += step}
        if (key & 0b1000) {y += step}
        const screen = this.screen
        const sl = screen.scrollLeft
        const st = screen.scrollTop
        const cx = Math.roundTo(meta.x + x, 4)
        const cy = Math.roundTo(meta.y + y, 4)
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

  // 设置选框
  this.marquee.key = 'tile'
  this.marquee.x = 0
  this.marquee.y = 0
  this.marquee.width = 1
  this.marquee.height = 1
  this.marquee.offsetX = 0
  this.marquee.offsetY = 0
  this.marquee.tilesetMap = Palette.tilesetMap
  this.marquee.tiles = this.createTiles(1, 1)
  this.marquee.terrain = 0b10
  this.marquee.save('eraser')
  this.marquee.save('tile')
  this.marquee.save('object')
  this.marquee.save('terrain')
  this.marquee.backgroundColorNormal = [0, 192 / 255, 1, 0.2]
  this.marquee.borderColorNormal = [1, 1, 1, 1]
  this.marquee.backgroundColorCopy = [0, 1, 0, 0.2]
  this.marquee.borderColorCopy = [0, 1, 0, 1]
  this.marquee.backgroundColorRect = [0, 192 / 255, 1, 0.2]
  this.marquee.borderColorRect = [1, 1, 1, 1]
  this.marquee.backgroundColorInvalid = [192 / 255, 0, 0, 0.2]

  // 设置舞台边距
  this.padding = 800

  // 创建变换矩阵
  this.matrix = new Matrix()

  // 设置检查器类型映射表
  this.inspectorTypeMap = {
    actor: 'sceneActor',
    region: 'sceneRegion',
    light: 'sceneLight',
    animation: 'sceneAnimation',
    parallax: 'sceneParallax',
    particle: 'sceneParticle',
    tilemap: 'sceneTilemap',
  }

  // 瓦片地图光线采样模式映射表
  this.tilemapLightSamplingModes = {
    raw: 0,
    global: 1,
    ambient: 2,
  }

  // 缺省光线采样模式映射表
  this.defaultLightSamplingModes = {
    raw: 0,
    global: 0,
    anchor: 0,
  }

  // 混合模式映射表
  this.blendModeMap = {
    0: 'normal',
    1: 'additive',
    2: 'subtract',
    normal: 0,
    additive: 1,
    subtract: 2,
  }

  // 设置共享坐标点
  this.sharedPoint = new Scene.Point()

  // 设置列表搜索框按钮和过滤器
  this.searcher.addCloseButton()
  this.searcher.addKeydownFilter()

  // 绑定对象目录列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.objects)
  list.updaters.push(list.updateItemClass)
  list.creators.push(list.updateTilemapClass)
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
  History.processors['scene-folder-rename'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
  }
  History.processors['scene-object-create'] = (operation, data) => {
    const {response, parent} = data
    list.restore(operation, response)
    list.updateFolderState(parent, 'hidden')
    list.updateFolderState(parent, 'locked')
  }
  History.processors['scene-object-delete'] = (operation, data) => {
    const {response} = data
    const parent = response.item.parent
    list.restore(operation, response)
    list.updateFolderState(parent, 'hidden')
    list.updateFolderState(parent, 'locked')
  }
  History.processors['scene-object-remove'] = (operation, data) => {
    const {response} = data
    const sParent = response.source.parent
    const dParent = response.destination.parent
    list.restore(operation, response)
    list.updateFolderState(sParent, 'hidden')
    list.updateFolderState(sParent, 'locked')
    if (sParent !== dParent) {
      list.updateFolderState(dParent, 'hidden')
      list.updateFolderState(dParent, 'locked')
    }
  }
  History.processors['scene-object-toggle'] = (operation, data) => {
    const {item, oldValue, newValue} = data
    if (operation === 'undo') {
      item.enabled = oldValue
    } else {
      item.enabled = newValue
    }
    list.updateConditionIcon(item)
    Scene.requestRendering()
    Scene.planToSave()
  }
  History.processors['scene-object-hidden'] = (operation, data) => {
    const {item, oldValues, newValue} = data
    if (operation === 'undo') {
      list.restoreRecursiveStates(item, 'hidden', oldValues)
    } else {
      list.setRecursiveStates(item, 'hidden', newValue)
    }
    list.updateFolderState(item.parent, 'hidden')
    list.update()
    Scene.requestRendering()
    Scene.planToSave()
  }
  History.processors['scene-object-locked'] = (operation, data) => {
    const {item, oldValues, newValue} = data
    if (operation === 'undo') {
      list.restoreRecursiveStates(item, 'locked', oldValues)
    } else {
      list.setRecursiveStates(item, 'locked', newValue)
    }
    list.updateFolderState(item.parent, 'locked')
    list.update()
    Scene.planToSave()
  }
  History.processors['scene-resize'] = (operation, data) => {
    const {editor, width, height, terrains} = data
    const {scene} = Scene.context
    data.width = Scene.width
    data.height = Scene.height
    data.terrains = Scene.terrains
    Scene.width = width
    Scene.height = height
    Scene.terrains = terrains
    if (editor.target === scene) {
      editor.write({width, height})
    } else {
      Inspector.open('fileScene', scene)
    }
    Scene.planToSaveTerrains()
    Scene.resize()
    Scene.requestRendering()
    Scene.planToSave()
  }
  History.processors['scene-tilemap-resize'] = (operation, data) => {
    const {editor, tilemap, width, height, tiles, tilesetMap} = data
    data.width = tilemap.width
    data.height = tilemap.height
    data.tiles = tilemap.tiles
    tilemap.width = width
    tilemap.height = height
    tilemap.tiles = tiles
    tilemap.tilesetMap = tilesetMap
    tilemap.changed = true
    if (editor.target === tilemap) {
      editor.write({width, height})
    }
    Scene.setTarget(tilemap)
    Scene.marquee.resize()
    Scene.requestRendering()
    Scene.planToSave()
  }
  History.processors['scene-tilemap-shortcut'] = (operation, data) => {
    const {tilemap, shortcut} = data
    data.shortcut = tilemap.shortcut
    tilemap.shortcut = shortcut
    Scene.setTarget(tilemap)
    Scene.tilemaps.shortcuts.update()
    Scene.planToSave()
  }
  History.processors['scene-tilemap-shift'] = (operation, data) => {
    const {tilemap, shiftX, shiftY} = data
    if (operation === 'undo') {
      Scene.shiftTilemap(tilemap, -shiftX, -shiftY)
    } else {
      Scene.shiftTilemap(tilemap, shiftX, shiftY)
    }
    tilemap.changed = true
    Scene.setTarget(tilemap)
    Scene.planToSave()
  }
  History.processors['scene-shift'] = (operation, data) => {
    const {shiftX, shiftY, changes} = data
    if (operation === 'undo') {
      Scene.shiftTerrains(-shiftX, -shiftY)
    } else {
      Scene.shiftTerrains(shiftX, shiftY)
    }
    Scene.shiftObjects(changes)
    Scene.planToSaveTerrains()
    Scene.planToSave()
  }
  History.processors['scene-tilemap-change'] = (operation, data) => {
    const {tilemap, changes, tilesetMap} = data
    switch (operation) {
      case 'undo':
        Scene.undoMapData(tilemap.tiles, changes)
        break
      case 'redo':
        Scene.redoMapData(tilemap.tiles, changes)
        break
    }
    tilemap.tilesetMap = tilesetMap
    tilemap.changed = true
    Scene.requestRendering()
    Scene.planToSave()
  }
  History.processors['scene-terrain-change'] = (operation, data) => {
    const {terrains, changes} = data
    switch (operation) {
      case 'undo':
        Scene.undoMapData(terrains, changes)
        break
      case 'redo':
        Scene.redoMapData(terrains, changes)
        break
    }
    Scene.planToSaveTerrains()
    Scene.requestRendering()
    Scene.planToSave()
  }
  History.processors['scene-target-shift'] = (operation, data) => {
    const {editor, target, x, y} = data
    data.x = target.x
    data.y = target.y
    target.x = x
    target.y = y
    if (editor.target === target) {
      editor.write({x, y})
    }
    Scene.setTarget(target)
    Scene.updateTargetInfo()
    Scene.requestRendering()
    Scene.planToSave()
  }
  History.processors['scene-target-redirect'] = (operation, data) => {
    const {editor, target, angle} = data
    data.angle = target.angle
    target.angle = angle
    target.player.setAngle(Math.radians(angle))
    if (editor.target === target) {
      editor.write({angle})
    }
    Scene.setTarget(target)
    Scene.requestRendering()
    Scene.planToSave()
  }

  // 侦听事件
  window.on('themechange', this.themechange)
  window.on('dprchange', this.dprchange)
  window.on('datachange', this.datachange)
  window.on('keydown', this.keydown)
  window.on('keydown', Reference.getKeydownListener(list))
  this.page.on('resize', this.windowResize)
  this.head.on('pointerdown', this.headPointerdown)
  GL.canvas.on('webglcontextrestored', this.webglRestored)
  $('#scene-head-start').on('pointerdown', this.switchPointerdown)
  $('#scene-layer').on('pointerdown', this.layerPointerdown)
  $('#scene-brush').on('pointerdown', this.brushPointerdown)
  $('#scene-zoom').on('focus', this.zoomFocus)
  $('#scene-zoom').on('input', this.zoomInput)
  this.screen.on('keydown', this.screenKeydown)
  this.screen.on('wheel', this.screenWheel)
  this.screen.on('userscroll', this.screenUserscroll)
  this.screen.on('blur', this.screenBlur)
  this.screen.on('dragenter', this.screenDragenter)
  this.screen.on('dragleave', this.screenDragleave)
  this.screen.on('dragover', this.screenDragover)
  this.screen.on('drop', this.screenDrop)
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

  // 初始化子对象
  ObjectFolder.initialize()
  SceneShift.initialize()
  TilemapShortcuts.initialize()
}

// 打开场景
Scene.open = function (context) {
  if (this.context === context) {
    return
  }
  this.save()
  this.close()
  const {meta} = context
  this.context = context
  this.meta = meta

  // 设置粒子元素舞台
  Particle.Element.stage = this

  // 恢复场景状态
  if (context.scene) {
    this.state = 'open'
    this.load(context)
    this.body.show()
    // 切换页面时因为关闭状态而阻挡resize
    // 因此在这里调用resize
    this.resize()
    this.requestAnimation()
    this.requestRendering()
    return
  }

  // 首次加载场景
  const scene = Data.scenes[meta.guid]
  if (scene) {
    // 解码场景
    context.scene = Codec.decodeScene(scene)
    this.state = 'loading'
    this.load(context)
  } else {
    Layout.manager.switch('directory')
    Window.confirm({
      message: `Failed to read file: ${meta.path}`,
    }, [{
      label: 'Confirm',
    }])
  }
}

// 加载场景
Scene.load = function (context) {
  const firstLoad = !context.editor
  if (firstLoad) {
    // 创建瓦片地图和快捷方式列表
    const tilemaps = []
    tilemaps.shortcuts = new TilemapShortcuts(tilemaps)

    // 创建区域和可见对象列表
    const regions = []
    regions.visibleList = []
    regions.visibleList.count = 0

    // 设置上下文
    context.changed = false
    context.editor = {
      target: null,
      tilemap: null,
      history: this.createHistory(),
      textures: new Scene.Textures(),
      tilemaps: tilemaps,
      actors: [],
      regions: regions,
      lights: [],
      animations: [],
      particles: [],
      parallaxes: [],
      backgrounds: [],
      foregrounds: [],
      doodads: [],
      animationFrame: 0,
      animationElapsed: 0,
      animationInterval: -1,
      // listScrollTop: 0,
    }
  }
  const {scene, editor} = context

  // 加载场景属性
  this.width = scene.width
  this.height = scene.height
  this.tileWidth = scene.tileWidth
  this.tileHeight = scene.tileHeight
  this.ambient = scene.ambient
  this.terrains = scene.terrainArray
  this.events = scene.events
  this.scripts = scene.scripts
  this.objects = scene.objects

  // 加载编辑器属性
  this.history = editor.history
  this.textures = editor.textures
  this.tilemaps = editor.tilemaps
  this.actors = editor.actors
  this.regions = editor.regions
  this.lights = editor.lights
  this.animations = editor.animations
  this.particles = editor.particles
  this.parallaxes = editor.parallaxes
  this.backgrounds = editor.backgrounds
  this.foregrounds = editor.foregrounds
  this.doodads = editor.doodads
  this.animationFrame = editor.animationFrame
  this.animationElapsed = editor.animationElapsed
  this.animationInterval = editor.animationInterval
  this.updateAnimationInterval()

  // 更新字体
  this.updateFont()

  // 初始化
  if (firstLoad) {
    // 加载对象
    this.loadObjects()

    // 加载图块纹理
    this.loadTextures()
  }

  // 加载所有上下文
  this.loadAllContexts()

  // 更新列表
  this.list.update()
  // this.list.scrollTop = editor.listScrollTop

  // 更新瓦片地图快捷栏
  this.tilemaps.shortcuts.update()

  // 设置目标对象
  this.setTarget(editor.target)

  // 打开瓦片地图对象
  if (editor.tilemap) {
    this.openTilemap(editor.tilemap)
  }

  // 设置环境光
  GL.setAmbientLight(this.ambient)
}

// 保存场景
Scene.save = function () {
  if (this.state === 'open') {
    const {scene, editor} = this.context

    // 保存场景属性
    scene.width = this.width
    scene.height = this.height
    scene.tileWidth = this.tileWidth
    scene.tileHeight = this.tileHeight
    scene.ambient = this.ambient
    scene.terrainArray = this.terrains
    scene.events = this.events
    scene.scripts = this.scripts
    scene.objects = this.objects

    // 保存编辑器属性
    editor.target = this.target
    editor.tilemap = this.tilemap
    editor.history = this.history
    editor.textures = this.textures
    editor.tilemaps = this.tilemaps
    editor.actors = this.actors
    editor.regions = this.regions
    editor.lights = this.lights
    editor.animations = this.animations
    editor.particles = this.particles
    editor.parallaxes = this.parallaxes
    editor.backgrounds = this.backgrounds
    editor.foregrounds = this.foregrounds
    editor.doodads = this.doodads
    editor.animationFrame = this.animationFrame
    editor.animationElapsed = this.animationElapsed
    editor.animationInterval = this.animationInterval
    // editor.listScrollTop = this.list.scrollTop

    // 重新编码场景数据
    if (this.context.changed) {
      this.context.changed = false
      Data.scenes[this.meta.guid] = Codec.encodeScene(scene)
    }
  }
}

// 关闭场景
Scene.close = function () {
  if (this.state !== 'closed') {
    this.screen.blur()
    this.closeTilemap()
    this.setTarget(null)
    this.deletePreviewObject()
    // 关闭检查器
    if (Inspector.type === 'fileScene') {
      Inspector.close()
    }
    this.state = 'closed'
    this.symbol = null
    this.context = null
    this.meta = null
    this.width = null
    this.height = null
    this.tileWidth = null
    this.tileHeight = null
    this.ambient = null
    this.terrains = null
    this.events = null
    this.scripts = null
    this.objects = null
    this.tilemaps = null
    this.actors = null
    this.regions = null
    this.lights = null
    this.animations = null
    this.particles = null
    this.parallaxes = null
    this.backgrounds = null
    this.foregrounds = null
    this.doodads = null
    this.history = null
    this.textures = null
    this.closeMapRecord()
    this.searcher.write('')
    this.marquee.clear()
    this.list.clear()
    this.body.hide()
    this.stopAnimation()
    this.stopRendering()
  }
}

// 销毁场景
Scene.destroy = function (context) {
  const {editor} = context
  if (!editor) return
  if (this.context === context) {
    this.save()
    this.close()
  }
  editor.textures.destroy()
  delete editor.textures
  for (const actor of editor.actors) {
    actor.player.destroy()
    delete actor.player
    delete actor.data
  }
  for (const light of editor.lights) {
    delete light.instance
  }
  for (const animation of editor.animations) {
    animation.player.destroy()
    delete animation.player
    delete animation.data
  }
  for (const particle of editor.particles) {
    particle.emitter?.destroy()
    delete particle.emitter
  }
  for (const parallax of editor.parallaxes) {
    parallax.player.destroy()
    delete parallax.player
  }
}

// 移动瓦片地图
Scene.shiftTilemap = function (tilemap, offsetX, offsetY) {
  const width = tilemap.width
  const height = tilemap.height
  if (width === 0 || height === 0) {
    return
  }
  const ox = (offsetX % width + width) % width
  const oy = (offsetY % height + height) % height
  const sTiles = GL.arrays[0].uint32
  const dTiles = tilemap.tiles
  const tro = dTiles.rowOffset
  sTiles.set(dTiles)
  for (let y = 0; y < height; y++) {
    const siy = y * tro
    const diy = (y + oy) % height * tro
    for (let x = 0; x < width; x++) {
      const si = x + siy
      const di = (x + ox) % width + diy
      dTiles[di] = sTiles[si]
    }
  }
  this.requestRendering()
}

// 移动地形
Scene.shiftTerrains = function (offsetX, offsetY) {
  const width = this.width
  const height = this.height
  if (width === 0 || height === 0) {
    return
  }
  const ox = (offsetX % width + width) % width
  const oy = (offsetY % height + height) % height
  const sTerrains = GL.arrays[0].uint8
  const dTerrains = this.terrains
  const pro = dTerrains.rowOffset
  sTerrains.set(dTerrains)
  for (let y = 0; y < height; y++) {
    const siy = y * pro
    const diy = (y + oy) % height * pro
    for (let x = 0; x < width; x++) {
      const si = x + siy
      const di = (x + ox) % width + diy
      dTerrains[di] = sTerrains[si]
    }
  }
  this.requestRendering()
}

// 移动对象
Scene.shiftObjects = function (changes) {
  const {targets, posX, posY} = changes
  const length = targets.length
  for (let i = 0; i < length; i++) {
    const target = targets[i]
    const x = posX[i]
    const y = posY[i]
    posX[i] = target.x
    posY[i] = target.y
    target.x = x
    target.y = y
  }
  this.requestRendering()
}

// 计算对象移动
Scene.computeObjectShifting = function (ox, oy) {
  const MIN = -128
  const MAX = 640
  const keys = [
    'actors',
    'regions',
    'lights',
    'animations',
    'particles',
    'parallaxes',
    'tilemaps',
  ]
  let index = 0
  let length = 0
  for (const key of keys) {
    length += this[key].length
  }
  const clamp = Math.clamp
  const targets = new Array(length)
  const posX = new Float64Array(length)
  const posY = new Float64Array(length)
  for (const key of keys) {
    const list = this[key]
    const length = list.length
    for (let i = 0; i < length; i++) {
      const target = list[i]
      targets[index] = target
      posX[index] = clamp(target.x + ox, MIN, MAX)
      posY[index] = clamp(target.y + oy, MIN, MAX)
      index++
    }
  }
  return {targets, posX, posY}
}

// 获取默认对象文件夹
Scene.getDefaultObjectFolder = function (kind) {
  const name = Editor.project.scene.defaultFolders[kind]
  return !name ? null : this.list.getItemByProperties({
    class: 'folder',
    name: name,
  })
}

// 复制对象
Scene.copy = function () {
  if (this.state === 'open' &&
    this.target !== null) {
    this.list.copy(this.target)
  }
}

// 粘贴对象
Scene.paste = function (x, y) {
  if (this.state === 'open' &&
    this.dragging === null) {
    if (x === undefined) {
      x = this.meta.x
      y = this.meta.y
    }
    this.list.paste('auto', data => {
      switch (data.class) {
        case 'tilemap':
        case 'actor':
        case 'region':
        case 'light':
        case 'animation':
        case 'particle':
        case 'parallax':
          data.x = Math.clamp(Math.floor(x), 0, this.width - 1) + 0.5
          data.y = Math.clamp(Math.floor(y), 0, this.height - 1) + 0.5
          break
      }
    })
  }
}

// 副本
Scene.duplicate = function () {
  if (this.target) {
    this.list.duplicate(this.target)
  }
}

// 创建对象
Scene.create = function (kind, x, y) {
  const dItem = this.getDefaultObjectFolder(kind)
  const map = this.inspectorTypeMap
  const key = map[kind]
  const editor = Inspector[key]
  const object = editor.create()
  object.x = x
  object.y = y
  this.list.addNodeTo(object, dItem)
}

// 删除对象
Scene.delete = function () {
  if (this.state === 'open' &&
    this.target !== null &&
    this.dragging === null) {
    this.list.delete(this.target)
  }
}

// 开关对象
Scene.toggle = function () {
  this.list.toggle(this.target)
}

// 撤销操作
Scene.undo = function () {
  if (this.state === 'open' &&
    !this.dragging &&
    this.history.canUndo()) {
    this.history.restore('undo')
  }
}

// 重做操作
Scene.redo = function () {
  if (this.state === 'open' &&
    !this.dragging &&
    this.history.canRedo()) {
    this.history.restore('redo')
  }
}

// 设置缩放
Scene.setZoom = function IIFE() {
  const slider = $('#scene-zoom')
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

// 设置场景大小
Scene.setSize = function (width, height) {
  if (this.width === width &&
    this.height === height) {
    return
  }
  this.closeMapRecord()
  this.planToSaveTerrains()
  this.history.save({
    type: 'scene-resize',
    editor: Inspector.fileScene,
    width: this.width,
    height: this.height,
    terrains: this.terrains,
  })
  // 调整地形
  const dTerrains = this.createTerrains(width, height)
  const dro = dTerrains.rowOffset
  const sTerrains = this.terrains
  const sro = sTerrains.rowOffset
  const ex = Math.min(width, this.width)
  const ey = Math.min(height, this.height)
  for (let y = 0; y < ey; y++) {
    for (let x = 0; x < ex; x++) {
      const si = x + y * sro
      const di = x + y * dro
      dTerrains[di] = sTerrains[si]
    }
  }
  this.terrains = dTerrains
  this.width = width
  this.height = height
  this.resize()
  this.requestRendering()
}

// 设置图块大小
Scene.setTileSize = function (tileWidth, tileHeight) {
  this.tileWidth = tileWidth
  this.tileHeight = tileHeight
  this.resize()
  this.requestRendering()
}

// 设置瓦片地图大小
Scene.setTilemapSize = function (tilemap, width, height) {
  if (tilemap.width === width &&
    tilemap.height === height) {
    return
  }
  this.history.save({
    type: 'scene-tilemap-resize',
    editor: Inspector.sceneTilemap,
    tilemap: tilemap,
    width: tilemap.width,
    height: tilemap.height,
    tiles: tilemap.tiles,
    tilesetMap: tilemap.tilesetMap,
  })
  // 调整图块
  const dTiles = this.createTiles(width, height)
  const dro = dTiles.rowOffset
  const sTiles = tilemap.tiles
  const sro = sTiles.rowOffset
  const ex = Math.min(width, tilemap.width)
  const ey = Math.min(height, tilemap.height)
  for (let y = 0; y < ey; y++) {
    for (let x = 0; x < ex; x++) {
      const si = x + y * sro
      const di = x + y * dro
      dTiles[di] = sTiles[si]
    }
  }
  tilemap.tiles = dTiles
  tilemap.width = width
  tilemap.height = height
  tilemap.changed = true
  this.marquee.resize()
}

// 设置目标对象
Scene.setTarget = function (target) {
  if (this.target !== target) {
    if (target !== null &&
      this.tilemap !== null &&
      this.tilemap !== target) {
      this.closeTilemap()
    }
    this.target = target
    this.updateTargetInfo()
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

// 打开瓦片地图
Scene.openTilemap = function (tilemap) {
  if (tilemap instanceof Object &&
    this.tilemap !== tilemap) {
    this.closeTilemap(false)
    this.tilemap = tilemap
    this.tilemap.element?.addClass('highlight')
    if (this.tilemap.shortcut !== 0) {
      TilemapShortcuts.elements[
        this.tilemap.shortcut
      ].addClass('selected')
    }
    this.switchLayer('tilemap')
    this.computeActiveTilemapId()
    this.requestRendering()
    this.marquee.resize()
  }
}

// 关闭瓦片地图
Scene.closeTilemap = function (back = true) {
  if (this.tilemap !== null) {
    this.tilemap.element?.removeClass('highlight')
    if (this.tilemap.shortcut !== 0) {
      TilemapShortcuts.elements[
        this.tilemap.shortcut
      ].removeClass('selected')
    }
    this.tilemap = null
    if (back) {
      this.switchLayer('object')
      this.computeActiveTilemapId()
    }
  }
}

// 计算激活的瓦片地图ID
Scene.computeActiveTilemapId = function () {
  const {tilemap} = this
  switch (tilemap?.layer) {
    case 'background':
      this.activeTilemapId = this.backgrounds.indexOf(tilemap)
      break
    case 'foreground':
      this.activeTilemapId = this.foregrounds.indexOf(tilemap) | 0x20000
      break
    case 'object':
      this.activeTilemapId = this.doodads.indexOf(tilemap) | 0x10000
      break
    default:
      this.activeTilemapId = -1
      break
  }
}

// 显示目标对象
Scene.revealTarget = function IIFE() {
  const timer = new Timer({
    duration: 200,
    update: timer => {
      const {target} = timer
      if (target === Scene.target) {
        const easing = Easing.EasingMap.easeInOut
        const time = easing.map(timer.elapsed / timer.duration)
        const x = timer.startX * (1 - time) + timer.endX * time
        const y = timer.startY * (1 - time) + timer.endY * time
        const screen = Scene.screen
        const sl = screen.scrollLeft
        const st = screen.scrollTop
        Scene.updateCamera(x, y)
        Scene.updateTransform()
        if (screen.scrollLeft !== sl ||
          screen.scrollTop !== st) {
          Scene.requestRendering()
          Scene.marquee.resize()
          Scene.screen.updateScrollbars()
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
    const {target, meta} = this
    const toleranceX = 1 / this.scaledTileWidth / this.scaleX
    const toleranceY = 1 / this.scaledTileHeight / this.scaleY
    // 目标和摄像机的位置不一定相等
    if (target && !timer.target && (
      Math.abs(target.x - meta.x) > toleranceX ||
      Math.abs(target.y - meta.y) > toleranceY)) {
      timer.target = target
      timer.startX = meta.x
      timer.startY = meta.y
      timer.endX = target.x
      timer.endY = target.y
      timer.elapsed = 0
      timer.add()
    }
  }
}()

// 转移目标对象
Scene.shiftTarget = function (x, y) {
  const target = this.target
  const map = this.inspectorTypeMap
  const key = map[target?.class]
  const editor = Inspector[key]
  if (editor !== undefined && (
    target.x !== x ||
    target.y !== y)) {
    this.planToSave()
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'scene-target-shift'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        target: target,
        x: target.x,
        y: target.y,
      })
    }
    target.x = x
    target.y = y
    this.updateTargetInfo()
    this.updateTargetEditor()
    this.requestRendering()
  }
}

// 重定向目标对象
Scene.redirectTarget = function (angle) {
  const target = this.target
  const map = this.inspectorTypeMap
  const key = map[target?.class]
  const editor = Inspector[key]
  if (editor !== undefined &&
    target.angle !== angle) {
    this.planToSave()
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'scene-target-redirect'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        target: target,
        angle: target.angle,
      })
    }
    this.requestRendering()
    target.angle = angle
    target.player.setAngle(Math.radians(angle))
    if (editor.target === target) {
      editor.write({angle})
    }
  }
}

// 更新目标对象
Scene.updateTarget = function () {
  let item = this.list.read()
  if (item?.class === 'folder') {
    item = null
  }
  if (item !== this.target) {
    this.setTarget(item)
  }
}

// 更新目标对象信息
Scene.updateTargetInfo = function () {
  if (this.layer === 'object') {
    switch (this.target?.class) {
      case 'tilemap':
      case 'actor':
      case 'region':
      case 'light':
      case 'animation':
      case 'particle':
      case 'parallax': {
        const target = this.target
        const name = target.name
        const x = Math.floor(target.x)
        const y = Math.floor(target.y)
        this.info.textContent = `${name} ${x},${y}`
        break
      }
      default: {
        const marquee = this.marquee
        const event = marquee.pointerevent
        if (event instanceof PointerEvent) {
          const {x, y} = this.getTileCoords(event, true)
          const sw = this.width
          const sh = this.height
          if (x >= 0 && x < sw && y >= 0 && y < sh) {
            if (x !== marquee.x || y !== marquee.y || !marquee.visible) {
              marquee.selectInObjectMode(x, y)
            }
          } else {
            marquee.clear()
          }
        } else {
          marquee.clear()
        }
        break
      }
    }
  }
}

// 更新目标对象列表项
Scene.updateTargetItem = function () {
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

// 更新目标对象编辑器
Scene.updateTargetEditor = function () {
  const target = this.target
  const map = this.inspectorTypeMap
  const key = map[target?.class]
  const editor = Inspector[key]
  if (editor !== undefined &&
    editor.target === target) {
    editor.write({
      x: target.x,
      y: target.y,
    })
  }
}

// 更新动画播放间隔
Scene.updateAnimationInterval = function () {
  const {animationInterval} = Data.config.scene
  if (this.animationInterval !== animationInterval) {
    if (animationInterval === 0 &&
      this.animationFrame !== 0) {
      this.animationFrame = 0
      this.requestRendering()
    }
    this.animationElapsed = 0
    this.animationInterval = animationInterval
  }
}

// 更新光照区域扩充
Scene.updateLightAreaExpansion = function (last) {
  if (this.showLight) {
    const light = Data.config.lightArea
    if (last.expansionLeft !== light.expansionLeft ||
      last.expansionTop !== light.expansionTop ||
      last.expansionRight !== light.expansionRight ||
      last.expansionBottom !== light.expansionBottom) {
      GL.reflectedLightMap.innerWidth = 0
      GL.reflectedLightMap.paddingLeft = undefined
      GL.resizeLightMap()
      this.updateLightTexParameters()
      this.updateTransform()
      this.requestRendering()
    }
  }
}

// 更新角色队伍
Scene.updateActorTeams = function () {
  const list = this.list
  for (const actor of this.actors) {
    list.updateIcon(actor)
  }
}

// 更新头部位置
Scene.updateHead = function () {
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
    const width = nRect.right - iRect.right
    if (head.width !== width) {
      head.width = width
      const [start, center, end] = head.children
      end.style.marginLeft = ''
      const sRect = start.rect()
      const cRect = center.rect()
      const eRect = end.rect()
      const spacing = eRect.left - sRect.right - cRect.width
      const difference = sRect.right - nRect.left - eRect.width
      const margin = Math.min(spacing, difference)
      end.style.marginLeft = `${margin}px`
    }
  }
}

// 调整大小
Scene.resize = function () {
  if (this.state === 'open' &&
    this.screen.clientWidth !== 0) {
    const scale = this.scale
    const scaledPadding = Math.round(this.padding * scale)
    const scaledTileWidth = Math.round(this.tileWidth * scale)
    const scaledTileHeight = Math.round(this.tileHeight * scale)
    const innerWidth = this.width * scaledTileWidth
    const innerHeight = this.height * scaledTileHeight
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
    this.scaleX = scaledTileWidth / this.tileWidth
    this.scaleY = scaledTileHeight / this.tileHeight
    this.scaledTileWidth = scaledTileWidth
    this.scaledTileHeight = scaledTileHeight
    this.aspectRatio = scaledTileWidth / scaledTileHeight
    this.outerWidth = outerWidth
    this.outerHeight = outerHeight
    this.centerOffsetX = outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2
    this.centerOffsetY = outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2
    this.paddingLeft = paddingLeft
    this.paddingTop = paddingTop
    this.marquee.style.width = `${outerWidth / dpr}px`
    this.marquee.style.height = `${outerHeight / dpr}px`
    GL.resize(screenWidth, screenHeight)
    GL.resizeLightMap()
    this.updateLightTexParameters()
    this.updateCamera()
    this.updateTransform()
    this.marquee.resize()
    this.screen.updateScrollbars()
  }
}

// 获取图块坐标
Scene.getTileCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (event, integer = false) {
    const coords = event.getRelativeCoords(this.marquee)
    const stw = this.scaledTileWidth
    const sth = this.scaledTileHeight
    const dpr = window.devicePixelRatio
    let sx = coords.x * dpr - this.paddingLeft
    let sy = coords.y * dpr - this.paddingTop
    if (this.layer === 'tilemap') {
      const context = this.getGridContext()
      sx -= context.offsetX * this.scaleX
      sy -= context.offsetY * this.scaleY
    }
    let x = sx / stw
    let y = sy / sth
    if (integer) {
      x = Math.floor(x)
      y = Math.floor(y)
    }
    point.x = x
    point.y = y
    return point
  }
}()

// 获取转换的坐标
Scene.getConvertedCoords = function IIFE() {
  const point = {x: 0, y: 0}
  // 返回可独立调用的箭头函数
  return tile => {
    point.x = tile.x * Scene.tileWidth
    point.y = tile.y * Scene.tileHeight
    return point
  }
}()

// 获取视差图锚点
Scene.getParallaxAnchor = function IIFE() {
  const point = {x: 0, y: 0}
  return function (parallax, tiled = false) {
    const tw = this.tileWidth
    const th = this.tileHeight
    const cx = this.scrollCenterX
    const cy = this.scrollCenterY
    const px = parallax.x * tw
    const py = parallax.y * th
    const fx = parallax.parallaxFactorX
    const fy = parallax.parallaxFactorY
    const ax = cx + fx * (px - cx)
    const ay = cy + fy * (py - cy)
    if (tiled) {
      point.x = ax / tw
      point.y = ay / th
    } else {
      point.x = ax
      point.y = ay
    }
    return point
  }
}()

// 获取网格上下文对象
Scene.getGridContext = function IIFE() {
  const context = {width: 0, height: 0, offsetX: 0, offsetY: 0}
  return function () {
    if (this.layer === 'tilemap') {
      const tilemap = this.tilemap
      const anchor = this.getParallaxAnchor(tilemap)
      const tw = this.tileWidth
      const th = this.tileHeight
      const mw = tilemap.width
      const mh = tilemap.height
      const ox = tilemap.offsetX
      const oy = tilemap.offsetY
      const ax = tilemap.anchorX * mw * tw
      const ay = tilemap.anchorY * mh * th
      context.width = mw
      context.height = mh
      context.offsetX = anchor.x - ax + ox
      context.offsetY = anchor.y - ay + oy
    } else {
      context.width = this.width
      context.height = this.height
      context.offsetX = 0
      context.offsetY = 0
    }
    return context
  }
}()

// 光栅化滚动位置 - 对齐到像素
// 避免瓦片地图视差模式下图块|网格|选框位置不同步的现象
Scene.rasterizeScrollPosition = function IIFE() {
  const scroll = {left: 0, top: 0, right: 0, bottom: 0}
  return function (ox, oy) {
    const sx = this.scaleX
    const sy = this.scaleY
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    scroll.left = Math.round((sl + ox) * sx) / sx
    scroll.top = Math.round((st + oy) * sy) / sy
    scroll.right = scroll.left + sr - sl
    scroll.bottom = scroll.top + sb - st
    return scroll
  }
}()

// 更新光影纹理参数
Scene.updateLightTexParameters = function () {
  const light = Data.config.lightArea
  const texture = GL.reflectedLightMap
  const scaleX = this.scaleX
  const scaleY = this.scaleY
  if (texture.scaleX !== scaleX ||
    texture.scaleY !== scaleY) {
    texture.scaleX = scaleX
    texture.scaleY = scaleY
    const {ceil, min} = Math
    const pl = texture.paddingLeft
    const pt = texture.paddingTop
    const pr = texture.paddingRight
    const pb = texture.paddingBottom
    const el = ceil(min(light.expansionLeft * scaleX, pl))
    const et = ceil(min(light.expansionTop * scaleY, pt))
    const er = ceil(min(light.expansionRight * scaleX, pr))
    const eb = ceil(min(light.expansionBottom * scaleY, pb))
    texture.expansionLeft = el / scaleX
    texture.expansionTop = et / scaleY
    texture.expansionRight = er / scaleX
    texture.expansionBottom = eb / scaleY
    texture.maxExpansionLeft = pl / scaleX
    texture.maxExpansionTop = pt / scaleY
    texture.maxExpansionRight = pr / scaleX
    texture.maxExpansionBottom = pb / scaleY
    texture.clipX = pl - el
    texture.clipY = pt - et
    texture.clipWidth = GL.width + el + er
    texture.clipHeight = GL.height + et + eb
  }
}

// 更新摄像机位置
Scene.updateCamera = function (x = this.meta.x, y = this.meta.y) {
  const dpr = window.devicePixelRatio
  const screen = this.screen
  const scrollX = x * this.scaledTileWidth + this.paddingLeft
  const scrollY = y * this.scaledTileHeight + this.paddingTop
  const toleranceX = this.scaledTileWidth * 0.0001
  const toleranceY = this.scaledTileHeight * 0.0001
  screen.rawScrollLeft = Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr
  screen.rawScrollTop = Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr
  screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceX) / dpr
  screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceY) / dpr
}

// 更新变换参数
Scene.updateTransform = function () {
  const dpr = window.devicePixelRatio
  const screen = this.screen
  const left = Math.roundTo(screen.scrollLeft * dpr - this.paddingLeft, 4)
  const top = Math.roundTo(screen.scrollTop * dpr - this.paddingTop, 4)
  const right = left + GL.width
  const bottom = top + GL.height
  const scaleX = this.scaleX
  const scaleY = this.scaleY
  const lightmap = GL.reflectedLightMap
  this.scrollLeft = left / scaleX
  this.scrollTop = top / scaleY
  this.scrollRight = right / scaleX
  this.scrollBottom = bottom / scaleY
  this.scrollCenterX = (this.scrollLeft + this.scrollRight) / 2
  this.scrollCenterY = (this.scrollTop + this.scrollBottom) / 2
  this.lightLeft = this.scrollLeft - lightmap.expansionLeft
  this.lightTop = this.scrollTop - lightmap.expansionTop
  this.lightRight = this.scrollRight + lightmap.expansionRight
  this.lightBottom = this.scrollBottom + lightmap.expansionBottom
  this.matrix.reset()
  .scale(scaleX, scaleY)
  .translate(-this.scrollLeft, -this.scrollTop)
  const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX
  const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY
  this.meta.x = Math.roundTo((scrollX - this.paddingLeft) / this.scaledTileWidth, 4)
  this.meta.y = Math.roundTo((scrollY - this.paddingTop) / this.scaledTileHeight, 4)
  Data.manifest.changed = true
}

// 注册预设对象
Scene.registerPreset = function IIFE() {
  const generatePresetId = () => {
    const {scenePresets} = Data
    let id
    do {id = GUID.generate64bit()}
    while (id in scenePresets)
    return id
  }
  const registerPreset = node => {
    const {scenePresets} = Data
    // 新对象或对象ID冲突，生成新ID
    if (node.presetId === '' ||
      node.presetId in scenePresets) {
      node.presetId = generatePresetId()
    }
    scenePresets[node.presetId] = {
      sceneId: Scene.meta.guid,
      data: node,
    }
    if (node.children instanceof Array) {
      for (const child of node.children) {
        registerPreset(child)
      }
    }
  }
  return function (node) {
    registerPreset(node)
  }
}()

// 取消注册预设对象
Scene.unregisterPreset = function (node) {
  delete Data.scenePresets[node.presetId]
  if (node.children instanceof Array) {
    for (const child of node.children) {
      Scene.unregisterPreset(child)
    }
  }
}

// 排序图层
Scene.sortLayers = function IIFE() {
  const sorter = (a, b) => a.order - b.order
  return function () {
    this.backgrounds.sort(sorter)
    this.foregrounds.sort(sorter)
    this.doodads.sort(sorter)
  }
}()

// 加载对象
Scene.loadObjects = function () {
  const actors = this.actors
  const regions = this.regions
  const lights = this.lights
  const animations = this.animations
  const particles = this.particles
  const parallaxes = this.parallaxes
  const tilemaps = this.tilemaps
  const backgrounds = this.backgrounds
  const foregrounds = this.foregrounds
  const doodads = this.doodads
  let tilemapIndex = 0
  let actorIndex = 0
  let regionIndex = 0
  let lightIndex = 0
  let animationIndex = 0
  let parallaxIndex = 0
  let particleIndex = 0
  let backgroundIndex = 0
  let foregroundIndex = 0
  let doodadIndex = 0
  const layerLoaders = {
    background: node => {
      backgrounds[backgroundIndex++] = node
    },
    foreground: node => {
      foregrounds[foregroundIndex++] = node
    },
    object: node => {
      doodads[doodadIndex++] = node
    },
  }
  const loaders = {
    folder: node => load(node.children),
    actor: node => actors[actorIndex++] = node,
    region: node => regions[regionIndex++] = node,
    light: node => lights[lightIndex++] = node,
    animation: node => animations[animationIndex++] = node,
    particle: node => particles[particleIndex++] = node,
    parallax: node => {
      parallaxes[parallaxIndex++] = node
      layerLoaders[node.layer](node)
    },
    tilemap: node => {
      tilemaps[tilemapIndex++] = node
      layerLoaders[node.layer](node)
    },
  }
  const load = nodes => {
    const length = nodes.length
    for (let i = 0; i < length; i++) {
      const node = nodes[i]
      loaders[node.class](node)
    }
  }
  load(this.objects)
  if (tilemaps.length !== tilemapIndex) {
    tilemaps.length = tilemapIndex
  }
  if (actors.length !== actorIndex) {
    actors.length = actorIndex
  }
  if (regions.length !== regionIndex) {
    regions.length = regionIndex
  }
  if (lights.length !== lightIndex) {
    lights.length = lightIndex
  }
  if (animations.length !== animationIndex) {
    animations.length = animationIndex
  }
  if (particles.length !== particleIndex) {
    particles.length = particleIndex
  }
  if (parallaxes.length !== parallaxIndex) {
    parallaxes.length = parallaxIndex
  }
  if (backgrounds.length !== backgroundIndex) {
    backgrounds.length = backgroundIndex
  }
  if (foregrounds.length !== foregroundIndex) {
    foregrounds.length = foregroundIndex
  }
  if (doodads.length !== doodadIndex) {
    doodads.length = doodadIndex
  }
  this.sortLayers()
  this.computeActiveTilemapId()
}

// 加载图块纹理
Scene.loadTextures = async function () {
  if (this.state === 'closed') return
  const promises = []
  const textures = this.textures
  const tilesets = Data.tilesets
  const templates = Data.autotiles.map
  for (const tilemap of this.tilemaps) {
    const {tiles, tilesetMap} = tilemap
    const length = tiles.length
    for (let i = 0; i < length; i++) {
      const tile = tiles[i]
      if (tile !== 0) {
        const guid = tilesetMap[tile >> 24]
        const tileset = tilesets[guid]
        if (tileset !== undefined) {
          switch (tileset.type) {
            case 'normal': {
              const guid = tileset.image
              if (textures[guid] === undefined) {
                promises.push(textures.load(guid))
              }
              break
            }
            case 'auto': {
              const tx = tile >> 8 & 0xff
              const ty = tile >> 16 & 0xff
              const id = tx + ty * tileset.width
              const autoTile = tileset.tiles[id]
              // autoTile的值可能是0|undefined
              if (autoTile &&
                textures[autoTile.image] === undefined &&
                templates[autoTile.template] !== undefined) {
                promises.push(textures.load(autoTile.image))
              }
              break
            }
          }
        }
      }
    }
  }
  const symbol = this.symbol = Symbol()
  if (promises.length > 0) {
    await Promise.all(promises)
  }
  if (this.symbol === symbol) {
    this.symbol = null
    this.state = 'open'
    this.body.show()
    this.resize()
    this.requestAnimation()
    this.requestRendering()
    if (Window.frames.length === 0 &&
      document.activeElement === document.body) {
      this.screen.focus()
    }
  }
}

// 加载所有上下文
Scene.loadAllContexts = function () {
  for (const actor of this.actors) {
    this.loadActorContext(actor)
  }
  for (const light of this.lights) {
    this.loadLightContext(light)
  }
  for (const animation of this.animations) {
    this.loadAnimationContext(animation)
  }
  for (const particle of this.particles) {
    this.loadParticleContext(particle)
  }
  for (const parallax of this.parallaxes) {
    this.loadParallaxContext(parallax)
  }
}

// 加载角色上下文
Scene.loadActorContext = function (actor) {
  if (actor.player) {
    actor.player.destroy()
    delete actor.player
  }
  const actorId = actor.actorId
  const data = Data.actors[actorId]
  if (data !== undefined) {
    Object.defineProperty(
      actor, 'data', {
        configurable: true,
        value: data,
      }
    )
    const {animationId} = data
    const animation = Data.animations[animationId]
    if (animation !== undefined) {
      const player = new Animation.Player(animation)
      // 加载精灵哈希表
      const images = {}
      const sprites = data.sprites
      const length = sprites.length
      for (let i = 0; i < length; i++) {
        const sprite = sprites[i]
        images[sprite.id] = sprite.image
      }
      player.scale = actor.scale * data.scale
      player.rotatable = data.rotatable
      player.setSpriteImages(images)
      player.setMotion(data.idleMotion)
      player.setAngle(Math.radians(actor.angle))
      Object.defineProperty(
        actor, 'player', {
          configurable: true,
          value: player,
        }
      )
      return
    }
  }

  // 设置默认参数
  Object.defineProperty(
    actor, 'player', {
      configurable: true,
      value: this.createDefaultAnimation(actor),
    }
  )
}

// 加载光源上下文
Scene.loadLightContext = function (light) {
  Object.defineProperty(
    light, 'instance', {
      configurable: true,
      value: new Light(light),
    }
  )
}

// 加载动画上下文
Scene.loadAnimationContext = function (animation) {
  if (animation.player) {
    animation.player.destroy()
    delete animation.player
  }
  const animationId = animation.animationId
  const data = Data.animations[animationId]
  if (data !== undefined) {
    Object.defineProperty(
      animation, 'data', {
        configurable: true,
        value: data,
      }
    )
    const player = new Animation.Player(data)
    player.scale = animation.scale
    player.speed = animation.speed
    player.opacity = animation.opacity
    player.rotatable = animation.rotatable
    player.setMotion(animation.motion)
    player.setAngle(Math.radians(animation.angle))
    Object.defineProperty(
      animation, 'player', {
        configurable: true,
        value: player,
      }
    )
    return
  }

  // 设置默认参数
  Object.defineProperty(
    animation, 'player', {
      configurable: true,
      value: this.createDefaultAnimation(animation),
    }
  )
}

// 加载视差图上下文
Scene.loadParallaxContext = function (parallax) {
  if (parallax.player) {
    parallax.player.destroy()
    delete parallax.player
  }
  Object.defineProperty(
    parallax, 'player', {
      configurable: true,
      value: new Parallax(parallax),
    }
  )
}

// 加载粒子上下文
Scene.loadParticleContext = function (particle) {
  if (particle.emitter) {
    particle.emitter.destroy()
    delete particle.emitter
  }
  const data = Data.particles[particle.particleId]
  if (data !== undefined) {
    const emitter = new Particle.Emitter(data)
    emitter.bounding = emitter.calculateOuterRect()
    emitter.angle = Math.radians(particle.angle)
    emitter.scale = particle.scale
    emitter.speed = particle.speed
    emitter.opacity = particle.opacity
    Object.defineProperty(
      particle, 'emitter', {
        configurable: true,
        value: emitter,
      }
    )
  }
}

// 加载对象上下文
Scene.loadObjectContext = function (object) {
  switch (object.class) {
    case 'actor':
      this.loadActorContext(object)
      break
    case 'light':
      this.loadLightContext(object)
      break
    case 'animation':
      this.loadAnimationContext(object)
      break
    case 'particle':
      this.loadParticleContext(object)
      break
    case 'parallax':
      this.loadParallaxContext(object)
      break
    case 'tilemap':
      if (object.shortcut !== 0) {
        this.tilemaps.shortcuts.update()
      }
      break
  }
}

// 重载对象上下文
Scene.reloadObjectContext = function (object) {
  switch (object.class) {
    case 'folder':
      for (const child of object.children) {
        this.reloadObjectContext(child)
      }
      break
    case 'actor':
      this.loadActorContext(object)
      break
    case 'animation':
      this.loadAnimationContext(object)
      break
    case 'particle':
      this.loadParticleContext(object)
      break
    case 'parallax':
      this.loadParallaxContext(object)
      break
    case 'tilemap':
      if (object.shortcut !== 0) {
        this.tilemaps.shortcuts.update()
      }
      break
  }
}

// 销毁对象上下文
Scene.destroyObjectContext = function (object) {
  switch (object.class) {
    case 'folder':
      for (const child of object.children) {
        this.destroyObjectContext(child)
      }
      break
    case 'actor':
      object.player.destroy()
      delete object.player
      break
    case 'animation':
      object.player.destroy()
      delete object.player
      break
    case 'particle':
      object.emitter?.destroy()
      delete object.emitter
      break
    case 'parallax':
      object.player.destroy()
      delete object.player
      break
    case 'tilemap':
      if (this.tilemap === object) {
        this.closeTilemap()
      }
      if (object.shortcut !== 0) {
        this.tilemaps.shortcuts.update()
      }
      break
  }
}

// 创建预览对象
Scene.createPreviewObject = function (file) {
  if (!this.previewObject) {
    const name = file.basename
    const guid = file.meta.guid
    switch (file.type) {
      case 'actor': {
        const actor = Inspector.sceneActor.create()
        actor.name = name
        actor.actorId = guid
        this.loadActorContext(actor)
        this.actors.push(actor)
        this.previewObject = actor
        break
      }
      case 'animation': {
        const animation = Inspector.sceneAnimation.create()
        const motionId = Data.animations[guid]?.motions[0]?.id ?? ''
        animation.name = name
        animation.animationId = guid
        animation.motion = motionId
        this.loadAnimationContext(animation)
        this.animations.push(animation)
        this.previewObject = animation
        break
      }
      case 'particle': {
        const particle = Inspector.sceneParticle.create()
        particle.name = name
        particle.particleId = guid
        this.loadParticleContext(particle)
        this.particles.push(particle)
        this.previewObject = particle
        break
      }
    }
  }
}

// 删除预览对象
Scene.deletePreviewObject = function () {
  const object = this.previewObject
  if (object) {
    switch (object.class) {
      case 'actor':
        this.actors.remove(object)
        object.player.destroy()
        break
      case 'animation':
        this.animations.remove(object)
        object.player.destroy()
        break
      case 'particle':
        this.particles.remove(object)
        object.emitter?.destroy()
        break
    }
    this.previewObject = null
    this.requestRendering()
  }
}

// 更新视差图
Scene.updateParallaxes = function (deltaTime) {
  for (const parallax of this.parallaxes) {
    if (parallax.hidden) continue
    parallax.player.update(deltaTime)
  }
}

// 绘制场景
Scene.drawScene = function () {
  if (GL.width * GL.height === 0) {
    return
  }
  switch (this.layer) {
    case 'object':
      this.drawLightTextures()
      this.drawBackgrounds()
      this.drawRegionLayer()
      this.drawStartPosition()
      this.drawGridLayer()
      this.drawAnimationWireframe()
      this.drawObjectLayer()
      this.drawDirectLightLayer()
      this.drawForegrounds()
      this.drawRegionBorders()
      this.drawRegionWireframe()
      this.drawLightWireframe()
      this.drawAnimationAnchor()
      this.drawParticleEmitterWireframe()
      this.drawTilemapWireframe()
      this.drawParallaxWireframe()
      this.drawNameLayer()
      break
    case 'tilemap':
      this.drawLightTextures()
      this.drawBackgrounds()
      this.drawObjectLayer()
      this.drawDirectLightLayer()
      this.drawForegrounds()
      GL.alpha = 0.25
      this.drawTilePreview()
      GL.alpha = 1
      this.drawGridLayer()
      this.drawTileMarquee()
      break
    case 'terrain':
      this.drawLightTextures()
      this.drawBackgrounds()
      this.drawObjectLayer()
      this.drawDirectLightLayer()
      this.drawForegrounds()
      this.drawGridLayer()
      this.drawTerrainLayer()
      this.drawTerrainMarquee()
      break
  }
}

// 绘制背景
Scene.drawBackgrounds = function () {
  GL.clearColor(...this.background.getGLRGBA())
  GL.clear(GL.COLOR_BUFFER_BIT)
  const activeId = this.activeTilemapId
  const backgrounds = this.backgrounds
  const length = backgrounds.length
  for (let i = 0; i < length; i++) {
    const object = backgrounds[i]
    if (object.hidden && i !== activeId) {
      continue
    }
    switch (object.class) {
      case 'parallax':
        object.player.draw(i)
        continue
      case 'tilemap':
        this.drawTilemap(object, i)
        continue
    }
  }
  GL.alpha = 1
}

// 绘制前景
Scene.drawForegrounds = function () {
  const activeId = this.activeTilemapId
  const foregrounds = this.foregrounds
  const length = foregrounds.length
  for (let i = 0; i < length; i++) {
    const object = foregrounds[i]
    const id = i | 0x20000
    if (object.hidden && id !== activeId) {
      continue
    }
    switch (object.class) {
      case 'parallax':
        object.player.draw(id)
        continue
      case 'tilemap':
        this.drawTilemap(object, id)
        continue
    }
  }
  GL.alpha = 1
}

// 更新动画
Scene.updateAnimations = function (deltaTime) {
  const lightmap = GL.reflectedLightMap
  const area = Data.config.animationArea
  const th = this.tileHeight
  const sl = this.scrollLeft - area.expansionLeft
  const st = this.scrollTop - area.expansionTop
  const sr = this.scrollRight + area.expansionRight
  const sb = this.scrollBottom + area.expansionBottom
  const ll = this.scrollLeft - lightmap.maxExpansionLeft
  const lt = this.scrollTop - lightmap.maxExpansionTop
  const lr = this.scrollRight + lightmap.maxExpansionRight
  const lb = this.scrollBottom + lightmap.maxExpansionBottom
  const lw = lr - ll
  const lh = lb - lt
  const pFactor = th / lh
  const {showAnimation} = this
  const {actors, animations} = this
  for (let i = 0; i < 2; i++) {
    const list = i === 0 ? actors : animations
    const length = list.length
    for (let i = 0; i < length; i++) {
      const object = list[i]
      if (object.hidden) continue
      const player = object.player
      if (player.motion !== null) {
        player.update(deltaTime)
        const {x, y} = this.getConvertedCoords(object)
        if (x >= sl && x < sr && y >= st && y < sb) {
          const priority = (object.priority ?? object.data?.priority ?? 0) * pFactor
          player.setPosition(x, y)
          player.updateFrameParameters(player.contexts, player.index)
          player.anchorX = (x - ll) / lw
          player.anchorY = (y - lt) / lh + priority
          player.visible = true
          if (showAnimation) {
            player.emitParticles(deltaTime)
            player.updateParticles(deltaTime)
          }
        } else {
          player.visible = false
          // 粒子发射器的更新可以独立出来运行来减少这种计算
          if (showAnimation && player.emitters.length !== 0 && player.updateParticles(deltaTime) !== 0) {
            player.visible = true
          }
        }
      }
    }
  }
}

// 更新粒子
Scene.updateParticles = function (deltaTime) {
  if (this.showAnimation) {
    const lightmap = GL.reflectedLightMap
    const area = Data.config.animationArea
    const th = this.tileHeight
    const al = this.scrollLeft - area.expansionLeft
    const at = this.scrollTop - area.expansionTop
    const ar = this.scrollRight + area.expansionRight
    const ab = this.scrollBottom + area.expansionBottom
    const lt = this.scrollTop - lightmap.maxExpansionTop
    const lh = this.scrollBottom + lightmap.maxExpansionBottom - lt
    const pFactor = th / lh
    const particles = this.particles
    const length = particles.length
    for (let i = 0; i < length; i++) {
      const particle = particles[i]
      if (particle.hidden) continue
      const emitter = particle.emitter
      if (emitter === undefined) continue
      const {x, y} = this.getConvertedCoords(particle)
      // 如果粒子发射器在屏幕中可见，或始终发射
      if (x >= al && x < ar && y >= at && y < ab || emitter.alwaysEmit) {
        const priority = particle.priority * pFactor
        emitter.anchorY = (y - lt) / lh + priority
        emitter.startX = x
        emitter.startY = y
        emitter.emitParticles(deltaTime)
        emitter.updateParticles(deltaTime)
        emitter.visible = true
      } else {
        emitter.updateParticles(deltaTime)
        emitter.visible = false
      }
    }
  }
}

// 绘制瓦片地图
Scene.drawTilemap = function (tilemap, id) {
  let layer, opacity
  const activeId = this.activeTilemapId
  if (activeId === -1 || id === activeId) {
    layer = 'upper'
    opacity = 1
  } else if (id < activeId) {
    layer = 'lower'
    opacity = 1
  } else if (id > activeId) {
    layer = 'upper'
    opacity = 0.25
  }
  const anchor = this.getParallaxAnchor(tilemap)
  const tw = this.tileWidth
  const th = this.tileHeight
  const pw = tilemap.width * tw
  const ph = tilemap.height * th
  const ax = tilemap.anchorX * pw
  const ay = tilemap.anchorY * ph
  const ox = anchor.x - ax + tilemap.offsetX
  const oy = anchor.y - ay + tilemap.offsetY
  return this.drawTileLayer(
    layer,
    tilemap.light,
    tilemap.blend,
    tilemap.opacity * opacity * (tilemap.enabled ? 1 : 0.3),
    tilemap.tilesetMap,
    tilemap.tiles,
    ox,
    oy,
  )
}

// 绘制图块预览
Scene.drawTilePreview = function () {
  const marquee = this.marquee
  if (marquee.visible && marquee.previewTiles) {
    const mm = marquee.tilesetMap
    const mt = marquee.tiles
    const coords = this.getConvertedCoords(marquee)
    let ox = coords.x
    let oy = coords.y
    if (this.layer === 'tilemap') {
      const context = this.getGridContext()
      ox += context.offsetX
      oy += context.offsetY
    }
    this.drawTileLayer('upper', 'global', 'normal', 0.6, mm, mt, ox, oy)
    GL.alpha = 1
  }
}

// 绘制图块层
Scene.drawTileLayer = function (
  layer, light, blend, opacity, tilesetMap, tiles, ox, oy,
) {
  const gl = GL
  const vertices = gl.arrays[0].float32
  const push = gl.batchRenderer.push
  const response = gl.batchRenderer.response
  const textures = this.textures
  const width = tiles.width
  const height = tiles.height
  const tro = tiles.rowOffset
  const tw = this.tileWidth
  const th = this.tileHeight
  const tilesets = Data.tilesets
  const templates = Data.autotiles.map
  const scroll = this.rasterizeScrollPosition(-ox, -oy)
  const sl = scroll.left
  const st = scroll.top
  const sr = scroll.right
  const sb = scroll.bottom
  const area = Data.config.tileArea
  const tl = sl - area.expansionLeft
  const tt = st - area.expansionTop
  const tr = sr + area.expansionRight
  const tb = sb + area.expansionBottom
  const bx = Math.max(Math.floor(tl / tw), 0)
  const by = Math.max(Math.floor(tt / th), 0)
  const ex = Math.min(Math.ceil(tr / tw), width)
  const ey = Math.min(Math.ceil(tb / th), height)
  gl.batchRenderer.setAttrSize(0)
  gl.batchRenderer.setBlendMode(blend)
  for (let y = by; y < ey; y++) {
    for (let x = bx; x < ex; x++) {
      const i = x + y * tro
      const tile = tiles[i]
      if (tile !== 0) {
        const guid = tilesetMap[tile >> 24]
        const tileset = tilesets[guid]
        if (tileset !== undefined) {
          switch (tileset.type) {
            case 'normal': {
              const texture = textures[tileset.image]
              if (texture instanceof ImageTexture) {
                push(texture.base.index)
                const sw = tileset.tileWidth
                const sh = tileset.tileHeight
                const sx = (tile >> 8 & 0xff) * sw
                const sy = (tile >> 16 & 0xff) * sh
                const dl = x * tw + (tw - sw) / 2 + tileset.globalOffsetX
                const dt = y * th + (th - sh)     + tileset.globalOffsetY
                const dr = dl + sw
                const db = dt + sh
                let sl = (sx + 0.002) / texture.width
                let sr = (sx + sw - 0.002) / texture.width
                if (tile & 0b1) {
                  const temporary = sl
                  sl = sr
                  sr = temporary
                }
                const st = (sy + 0.002) / texture.height
                const sb = (sy + sh - 0.002) / texture.height
                const vi = response[0] * 5
                const si = response[1]
                vertices[vi    ] = dl
                vertices[vi + 1] = dt
                vertices[vi + 2] = sl
                vertices[vi + 3] = st
                vertices[vi + 4] = si
                vertices[vi + 5] = dl
                vertices[vi + 6] = db
                vertices[vi + 7] = sl
                vertices[vi + 8] = sb
                vertices[vi + 9] = si
                vertices[vi + 10] = dr
                vertices[vi + 11] = db
                vertices[vi + 12] = sr
                vertices[vi + 13] = sb
                vertices[vi + 14] = si
                vertices[vi + 15] = dr
                vertices[vi + 16] = dt
                vertices[vi + 17] = sr
                vertices[vi + 18] = st
                vertices[vi + 19] = si
              } else if (texture === undefined) {
                const guid = tileset.image
                const image = Palette.images[guid]
                if (image instanceof Image) {
                  textures.append(new ImageTexture(image))
                  x--
                } else {
                  textures.load(guid)
                }
              }
              break
            }
            case 'auto': {
              const tx = tile >> 8 & 0xff
              const ty = tile >> 16 & 0xff
              const id = tx + ty * tileset.width
              const autoTile = tileset.tiles[id]
              if (!autoTile) {
                continue
              }
              const template = templates[autoTile.template]
              if (template === undefined) {
                continue
              }
              const nodeId = tile & 0b111111
              const node = template.nodes[nodeId]
              if (node === undefined) {
                continue
              }
              const texture = textures[autoTile.image]
              if (texture instanceof ImageTexture) {
                push(texture.base.index)
                const index = this.animationFrame
                            % node.frames.length
                const frame = node.frames[index]
                const sw = tileset.tileWidth
                const sh = tileset.tileHeight
                const sx = (autoTile.x + (frame & 0xff)) * sw
                const sy = (autoTile.y + (frame >> 8)) * sh
                const dl = x * tw + (tw - sw) / 2 + tileset.globalOffsetX
                const dt = y * th + (th - sh)     + tileset.globalOffsetY
                const dr = dl + sw
                const db = dt + sh
                const sl = (sx + 0.002) / texture.width
                const st = (sy + 0.002) / texture.height
                const sr = (sx + sw - 0.002) / texture.width
                const sb = (sy + sh - 0.002) / texture.height
                const vi = response[0] * 5
                const si = response[1]
                vertices[vi    ] = dl
                vertices[vi + 1] = dt
                vertices[vi + 2] = sl
                vertices[vi + 3] = st
                vertices[vi + 4] = si
                vertices[vi + 5] = dl
                vertices[vi + 6] = db
                vertices[vi + 7] = sl
                vertices[vi + 8] = sb
                vertices[vi + 9] = si
                vertices[vi + 10] = dr
                vertices[vi + 11] = db
                vertices[vi + 12] = sr
                vertices[vi + 13] = sb
                vertices[vi + 14] = si
                vertices[vi + 15] = dr
                vertices[vi + 16] = dt
                vertices[vi + 17] = sr
                vertices[vi + 18] = st
                vertices[vi + 19] = si
              } else if (texture === undefined) {
                const guid = autoTile.image
                const image = Palette.images[guid]
                if (image instanceof Image) {
                  textures.append(new ImageTexture(image))
                  x--
                } else {
                  textures.load(guid)
                }
              }
              break
            }
          }
        }
      }
    }
  }
  const endIndex = gl.batchRenderer.getEndIndex()
  if (endIndex !== 0) {
    gl.alpha = opacity
    const program = gl.tileProgram.use()
    const modeMap = this.tilemapLightSamplingModes
    const lightMode = this.showLight ? light : 'raw'
    const lightModeIndex = modeMap[lightMode]
    const matrix = gl.matrix.project(
      gl.flip,
      sr - sl,
      sb - st,
    ).translate(-sl, -st)
    switch (layer) {
      case 'upper':
        gl.uniform1i(program.u_TintMode, 0)
        break
      case 'lower':
        gl.uniform1i(program.u_TintMode, 1)
        gl.uniform4f(program.u_Tint, -0.2, -0.2, -0.2, 0.8)
        break
    }
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform1i(program.u_LightMode, lightModeIndex)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, endIndex * 5)
    gl.batchRenderer.draw()
  }
}

// 绘制网格层
Scene.drawGridLayer = function () {
  if (this.showGrid && this.width * this.height) {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const context = this.getGridContext()
    const width = context.width
    const height = context.height
    const sx = context.offsetX
    const sy = context.offsetY
    const tw = this.tileWidth
    const th = this.tileHeight
    const scroll = this.rasterizeScrollPosition(-sx, -sy)
    const sl = scroll.left
    const st = scroll.top
    const sr = scroll.right
    const sb = scroll.bottom
    const ox = 0.5 / this.scaleX / tw
    const oy = 0.5 / this.scaleY / th
    const bx = Math.max(Math.ceil(sl / tw), 0)
    const by = Math.max(Math.ceil(st / th), 0)
    const ex = Math.min(Math.ceil(sr / tw), width + 1)
    const ey = Math.min(Math.ceil(sb / th), height + 1)
    const left = Math.max(Math.floor(sl / tw), 0)
    const top = Math.max(Math.floor(st / th), 0)
    const right = Math.min(ex, width + 1 / this.scaleX / tw)
    const bottom = Math.min(ey, height + 1 / this.scaleY / th)
    let vi = 0
    for (let y = by; y < ey; y++) {
      vertices[vi    ] = left
      vertices[vi + 1] = y + oy
      vertices[vi + 2] = right
      vertices[vi + 3] = y + oy
      vi += 4
    }
    for (let x = bx; x < ex; x++) {
      vertices[vi    ] = x + ox
      vertices[vi + 1] = top
      vertices[vi + 2] = x + ox
      vertices[vi + 3] = bottom
      vi += 4
    }
    if (vi !== 0) {
      const program = gl.graphicProgram.use()
      gl.matrix.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      .scale(tw, th)
      gl.bindVertexArray(program.vao.a10)
      gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 0.5)
      gl.drawArrays(gl.LINES, 0, vi / 2)
    }
  }
}

// 绘制区域层
Scene.drawRegionLayer = function () {
  const gl = GL
  const vertices = gl.arrays[0].float32
  const colors = gl.arrays[0].uint32
  const tw = this.tileWidth
  const th = this.tileHeight
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const regions = this.regions
  const length = regions.length
  const list = regions.visibleList
  let li = 0
  let vi = 0
  for (let i = 0; i < length; i++) {
    const region = regions[i]
    if (region.hidden) continue
    const rx = region.x
    const ry = region.y
    const rw = region.width
    const rh = region.height
    const rl = rx - rw / 2
    const rt = ry - rh / 2
    const rr = rl + rw
    const rb = rt + rh
    const ml = rl * tw
    const mt = rt * th
    const mr = rr * tw
    const mb = rb * th
    if (ml < sr && mt < sb && mr > sl && mb > st) {
      const hex = region.color
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = parseInt(hex.slice(6, 8), 16) * (region.enabled ? 1 : 0.5)
      const rgba = r | g << 8 | b << 16 | a << 24
      list[li++] = region
      vertices[vi    ] = rl
      vertices[vi + 1] = rt
      colors  [vi + 2] = rgba
      vertices[vi + 3] = rl
      vertices[vi + 4] = rb
      colors  [vi + 5] = rgba
      vertices[vi + 6] = rr
      vertices[vi + 7] = rb
      colors  [vi + 8] = rgba
      vertices[vi + 9] = rr
      vertices[vi + 10] = rt
      colors  [vi + 11] = rgba
      vi += 12
    }
  }

  // 清除无效的可见区域
  const count = list.count
  for (let i = li; i < count; i++) {
    list[i] = undefined
  }
  list.count = li

  // 绘制区域
  if (vi !== 0) {
    const program = gl.graphicProgram.use()
    gl.matrix.project(
      gl.flip,
      sr - sl,
      sb - st,
    )
    .translate(-sl, -st)
    .scale(tw, th)
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.drawElements(gl.TRIANGLES, vi / 2, gl.UNSIGNED_INT, 0)
  }
}

// 绘制区域边框
Scene.drawRegionBorders = function () {
  const gl = GL
  const vertices = gl.arrays[0].float32
  const tw = this.tileWidth
  const th = this.tileHeight
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const ox = 0.5 / this.scaleX / tw
  const oy = 0.5 / this.scaleY / th
  const regions = this.regions.visibleList
  const count = regions.count
  let vi = 0
  for (let i = 0; i < count; i++) {
    const region = regions[i]
    const rx = region.x
    const ry = region.y
    const rw = region.width
    const rh = region.height
    const dl = rx - rw / 2 + ox
    const dt = ry - rh / 2 + oy
    const dr = dl + rw
    const db = dt + rh
    vertices[vi    ] = dl
    vertices[vi + 1] = dt
    vertices[vi + 2] = dl
    vertices[vi + 3] = db
    vertices[vi + 4] = dl
    vertices[vi + 5] = db
    vertices[vi + 6] = dr
    vertices[vi + 7] = db
    vertices[vi + 8] = dr
    vertices[vi + 9] = db
    vertices[vi + 10] = dr
    vertices[vi + 11] = dt
    vertices[vi + 12] = dr
    vertices[vi + 13] = dt
    vertices[vi + 14] = dl
    vertices[vi + 15] = dt
    vi += 16
  }
  // 绘制开始位置边框
  const {startPosition} = Data.config
  if (startPosition.sceneId === this.meta.guid) {
    const dl = startPosition.x - 0.5 + ox
    const dt = startPosition.y - 0.5 + oy
    const dr = dl + 1
    const db = dt + 1
    vertices[vi    ] = dl
    vertices[vi + 1] = dt
    vertices[vi + 2] = dl
    vertices[vi + 3] = db
    vertices[vi + 4] = dl
    vertices[vi + 5] = db
    vertices[vi + 6] = dr
    vertices[vi + 7] = db
    vertices[vi + 8] = dr
    vertices[vi + 9] = db
    vertices[vi + 10] = dr
    vertices[vi + 11] = dt
    vertices[vi + 12] = dr
    vertices[vi + 13] = dt
    vertices[vi + 14] = dl
    vertices[vi + 15] = dt
    vi += 16
  }
  if (vi !== 0) {
    const program = gl.graphicProgram.use()
    gl.matrix.project(
      gl.flip,
      sr - sl,
      sb - st,
    )
    .translate(-sl, -st)
    .scale(tw, th)
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1)
    gl.drawArrays(gl.LINES, 0, vi / 2)
  }
}

// 绘制对象层
Scene.drawObjectLayer = function () {
  const {max, min, floor, ceil, round} = Math
  const activeId = this.activeTilemapId
  const translucent = activeId !== -1 && activeId < 0x20000
  const animAlpha = translucent ? 0.25 : 1

  // 获取图块对象
  const gl = GL
  const lightModeMap = this.showLight
  ? Animation.Player.lightSamplingModes
  : this.defaultLightSamplingModes
  const blendModeMap = this.blendModeMap
  const textures = this.textures
  const tilesets = Data.tilesets
  const templates = Data.autotiles.map
  const area = Data.config.tileArea
  const lightmap = GL.reflectedLightMap
  const tw = this.tileWidth
  const th = this.tileHeight
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const ll = sl - lightmap.maxExpansionLeft
  const lt = st - lightmap.maxExpansionTop
  const lr = sr + lightmap.maxExpansionRight
  const lb = sb + lightmap.maxExpansionBottom
  const lw = lr - ll
  const lh = lb - lt
  const ly = th / 2 / lh
  const layers = gl.layers
  const starts = gl.zeros
  const ends = gl.arrays[1].uint32
  const set = gl.arrays[2].uint32
  const data = gl.arrays[3].float32
  const datau = gl.arrays[3].uint32
  let li = 0
  let si = 2
  let di = 0
  const doodads = this.doodads
  const length = doodads.length
  for (let i = 0; i < length; i++) {
    const tilemap = doodads[i]
    const id = i | 0x10000
    const active = id === activeId
    if (tilemap.hidden && !active) {
      continue
    }
    const tilesetMap = tilemap.tilesetMap
    const tiles = tilemap.tiles
    const width = tiles.width
    const height = tiles.height
    const tro = tiles.rowOffset
    const anchor = this.getParallaxAnchor(tilemap)
    const ax = tilemap.anchorX * width * tw
    const ay = tilemap.anchorY * height * th
    const sox = anchor.x - ax + tilemap.offsetX
    const soy = anchor.y - ay + tilemap.offsetY
    const scroll = this.rasterizeScrollPosition(-sox, -soy)
    const left = scroll.left - area.expansionLeft
    const top = scroll.top - area.expansionTop
    const right = scroll.right + area.expansionRight
    const bottom = scroll.bottom + area.expansionBottom
    const ox = sl - scroll.left
    const oy = st - scroll.top
    const bx = max(floor(left / tw), 0)
    const by = max(floor(top / th), 0)
    const ex = min(ceil(right / tw), width)
    const ey = min(ceil(bottom / th), height)
    let opacity = tilemap.opacity
    if (translucent && !active) opacity /= 4
    opacity = Math.round(opacity * 255) << 8
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const i = x + y * tro
        const tile = tiles[i]
        if (tile !== 0) {
          const guid = tilesetMap[tile >> 24]
          const tileset = tilesets[guid]
          if (tileset !== undefined) {
            switch (tileset.type) {
              case 'normal': {
                const texture = textures[tileset.image]
                if (texture instanceof ImageTexture) {
                  const tx = tile >> 8 & 0xff
                  const ty = tile >> 16 & 0xff
                  const id = tx + ty * tileset.width
                  const tp = tileset.priorities[id] + tileset.globalPriority
                  const sw = tileset.tileWidth
                  const sh = tileset.tileHeight
                  const sx = tx * sw
                  const sy = ty * sh
                  const ax = (x + 0.5) * tw + ox
                  const ay = (y + 1) * th + oy
                  const dl = ax - sw / 2 + tileset.globalOffsetX
                  const dt = ay - sh     + tileset.globalOffsetY
                  const dr = dl + sw
                  const db = dt + sh
                  const px = (ax - ll) / lw
                  const py = (ay - lt + tp * th) / lh
                  const key = max(0, min(0x3ffff, round(
                    py * 0x20000 + 0x10000
                  )))
                  const anchor = (
                    round(max(min(px, 1), 0) * 0xffff)
                  | round(max(min(py - ly, 1), 0) * 0xffff) << 16
                  )
                  data[di    ] = texture.base.index
                  data[di + 1] = dl
                  data[di + 2] = dt
                  data[di + 3] = dr
                  data[di + 4] = db
                  data[di + 5] = (sx + 0.002) / texture.width
                  data[di + 6] = (sy + 0.002) / texture.height
                  data[di + 7] = (sx + sw - 0.002) / texture.width
                  data[di + 8] = (sy + sh - 0.002) / texture.height
                  datau[di + 9] = anchor
                  datau[di + 10] = opacity
                  datau[di + 11] = lightModeMap[tilemap.light]
                  datau[di + 12] = blendModeMap[tilemap.blend]
                  if (tile & 0b1) {
                    data[di + 9] = data[di + 5]
                    data[di + 5] = data[di + 7]
                    data[di + 7] = data[di + 9]
                  }
                  if (starts[key] === 0) {
                    starts[key] = si
                    layers[li++] = key
                  } else {
                    set[ends[key] + 1] = si
                  }
                  ends[key] = si
                  set[si++] = di
                  set[si++] = 0
                  di += 13
                } else if (texture === undefined) {
                  const guid = tileset.image
                  const image = Palette.images[guid]
                  if (image instanceof Image) {
                    textures.append(new ImageTexture(image))
                    x--
                  } else {
                    textures.load(guid)
                  }
                }
                break
              }
              case 'auto': {
                const tx = tile >> 8 & 0xff
                const ty = tile >> 16 & 0xff
                const id = tx + ty * tileset.width
                const autoTile = tileset.tiles[id]
                if (!autoTile) {
                  continue
                }
                const template = templates[autoTile.template]
                if (template === undefined) {
                  continue
                }
                const nodeId = tile & 0b111111
                const node = template.nodes[nodeId]
                if (node === undefined) {
                  continue
                }
                const texture = textures[autoTile.image]
                if (texture instanceof ImageTexture) {
                  const index = this.animationFrame
                              % node.frames.length
                  const frame = node.frames[index]
                  const tp = tileset.priorities[id] + tileset.globalPriority
                  const sw = tileset.tileWidth
                  const sh = tileset.tileHeight
                  const sx = (autoTile.x + (frame & 0xff)) * sw
                  const sy = (autoTile.y + (frame >> 8)) * sh
                  const ax = (x + 0.5) * tw + ox
                  const ay = (y + 1) * th + oy
                  const dl = ax - sw / 2 + tileset.globalOffsetX
                  const dt = ay - sh     + tileset.globalOffsetY
                  const dr = dl + sw
                  const db = dt + sh
                  const px = (ax - ll) / lw
                  const py = (ay - lt + tp * th) / lh
                  const key = max(0, min(0x3ffff, round(
                    py * 0x20000 + 0x10000
                  )))
                  const anchor = (
                    round(max(min(px, 1), 0) * 0xffff)
                  | round(max(min(py - ly, 1), 0) * 0xffff) << 16
                  )
                  data[di    ] = texture.base.index
                  data[di + 1] = dl
                  data[di + 2] = dt
                  data[di + 3] = dr
                  data[di + 4] = db
                  data[di + 5] = (sx + 0.002) / texture.width
                  data[di + 6] = (sy + 0.002) / texture.height
                  data[di + 7] = (sx + sw - 0.002) / texture.width
                  data[di + 8] = (sy + sh - 0.002) / texture.height
                  datau[di + 9] = anchor
                  datau[di + 10] = opacity
                  datau[di + 11] = lightModeMap[tilemap.light]
                  datau[di + 12] = blendModeMap[tilemap.blend]
                  if (starts[key] === 0) {
                    starts[key] = si
                    layers[li++] = key
                  } else {
                    set[ends[key] + 1] = si
                  }
                  ends[key] = si
                  set[si++] = di
                  set[si++] = 0
                  di += 13
                } else if (texture === undefined) {
                  const guid = autoTile.image
                  const image = Palette.images[guid]
                  if (image instanceof Image) {
                    textures.append(new ImageTexture(image))
                    x--
                  } else {
                    textures.load(guid)
                  }
                }
                break
              }
            }
          }
        }
      }
    }
  }

  // 获取角色和动画对象
  const actors = this.actors
  const animations = this.animations
  const particles = this.particles
  for (let i = 0; i < 3; i++) {
    const kind = i + 1 << 16
    if (i <= 1) {
      const list = i === 0 ? actors : animations
      const length = list.length
      for (let i = 0; i < length; i++) {
        const object = list[i]
        if (object.hidden) continue
        const player = object.player
        if (player.visible) {
          const py = player.anchorY
          const key = max(0, min(0x3ffff, round(
            py * 0x20000 + 0x10000
          )))
          data[di] = i | kind
          if (starts[key] === 0) {
            starts[key] = si
            layers[li++] = key
          } else {
            set[ends[key] + 1] = si
          }
          ends[key] = si
          set[si++] = di
          set[si++] = 0
          di += 1
        }
      }
    } else {
      const length = particles.length
      for (let i = 0; i < length; i++) {
        const object = particles[i]
        if (object.hidden) continue
        const emitter = object.emitter
        if (emitter?.visible) {
          const py = emitter.anchorY
          const key = max(0, min(0x3ffff, round(
            py * 0x20000 + 0x10000
          )))
          data[di] = i | kind
          if (starts[key] === 0) {
            starts[key] = si
            layers[li++] = key
          } else {
            set[ends[key] + 1] = si
          }
          ends[key] = si
          set[si++] = di
          set[si++] = 0
          di += 1
        }
      }
    }
  }

  // 绘制图像
  if (li !== 0) {
    const vertices = gl.arrays[0].float32
    const attributes = gl.arrays[0].uint32
    const blend = gl.batchRenderer.setBlendMode
    const push = gl.batchRenderer.push
    const response = gl.batchRenderer.response
    const program = gl.spriteProgram.use()
    const matrix = gl.matrix.project(
      gl.flip,
      sr - sl,
      sb - st,
    ).translate(-sl, -st)
    if (activeId < 0x20000) {
      gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
    } else {
      gl.uniform4f(program.u_Tint, -0.2, -0.2, -0.2, 0.8)
    }
    gl.batchRenderer.bindProgram()
    gl.batchRenderer.setAttrSize(8)
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    const queue = new Uint32Array(layers.buffer, 0, li).sort()
    for (let i = 0; i < li; i++) {
      const key = queue[i]
      let si = starts[key]
      starts[key] = 0
      do {
        const di = set[si]
        const code = data[di]
        if (code < 0x10000) {
          blend(blendModeMap[datau[di + 12]])
          push(code)
          const dl = data[di + 1]
          const dt = data[di + 2]
          const dr = data[di + 3]
          const db = data[di + 4]
          const sl = data[di + 5]
          const st = data[di + 6]
          const sr = data[di + 7]
          const sb = data[di + 8]
          const anchor = datau[di + 9]
          const opacity = datau[di + 10]
          const mode = datau[di + 11] << 16
          const vi = response[0] * 8
          const param = response[1] | opacity | mode
          vertices  [vi    ] = dl
          vertices  [vi + 1] = dt
          vertices  [vi + 2] = sl
          vertices  [vi + 3] = st
          attributes[vi + 4] = param
          attributes[vi + 5] = 0x00ff00ff
          attributes[vi + 6] = 0x00ff00ff
          attributes[vi + 7] = anchor
          vertices  [vi + 8] = dl
          vertices  [vi + 9] = db
          vertices  [vi + 10] = sl
          vertices  [vi + 11] = sb
          attributes[vi + 12] = param
          attributes[vi + 13] = 0x00ff00ff
          attributes[vi + 14] = 0x00ff00ff
          attributes[vi + 15] = anchor
          vertices  [vi + 16] = dr
          vertices  [vi + 17] = db
          vertices  [vi + 18] = sr
          vertices  [vi + 19] = sb
          attributes[vi + 20] = param
          attributes[vi + 21] = 0x00ff00ff
          attributes[vi + 22] = 0x00ff00ff
          attributes[vi + 23] = anchor
          vertices  [vi + 24] = dr
          vertices  [vi + 25] = dt
          vertices  [vi + 26] = sr
          vertices  [vi + 27] = st
          attributes[vi + 28] = param
          attributes[vi + 29] = 0x00ff00ff
          attributes[vi + 30] = 0x00ff00ff
          attributes[vi + 31] = anchor
        } else if (code < 0x20000) {
          const actor = actors[code & 0x0ffff]
          actor.player.draw(animAlpha * (actor.enabled ? 1 : 0.3))
        } else if (code < 0x30000) {
          const animation = animations[code & 0x0ffff]
          animation.player.draw(animAlpha * (animation.enabled ? 1 : 0.3))
        } else {
          gl.batchRenderer.draw()
          const particle = particles[code & 0x0ffff]
          particle.emitter.draw(animAlpha * (particle.enabled ? 1 : 0.3))
        }
      } while ((si = set[si + 1]) !== 0)
    }
    gl.batchRenderer.draw()
    gl.batchRenderer.unbindProgram()
    gl.blend = 'normal'
  }
}

// 绘制直射光层
Scene.drawDirectLightLayer = function () {
  if (this.showLight) {
    GL.matrix.reset()
    GL.blend = 'additive'
    GL.drawImage(GL.directLightMap, 0, 0, GL.width, GL.height)
    GL.blend = 'normal'
  }
}

// 绘制名字层
Scene.drawNameLayer = function () {
  if (this.target?.name) {
    const gl = GL
    const sl = this.scrollLeft * this.scaleX
    const st = this.scrollTop * this.scaleY
    const stw = this.scaledTileWidth
    const sth = this.scaledTileHeight
    const size = GL.context2d.size
    const color = 0xffffffff
    const shadow = 0x80000000
    const target = this.target
    const x = target.x * stw - sl
    const y = target.y * sth - st - size - 8
    gl.fillTextWithOutline(target.name, x, y, color, shadow)
  }
}

// 绘制地形层
Scene.drawTerrainLayer = function () {
  const gl = GL
  const vertices = gl.arrays[0].float32
  const terrains = this.terrains
  const tro = terrains.rowOffset
  const width = this.width
  const height = this.height
  const tw = this.tileWidth
  const th = this.tileHeight
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const bx = Math.max(Math.floor(sl / tw), 0)
  const by = Math.max(Math.floor(st / th), 0)
  const ex = Math.min(Math.ceil(sr / tw), width)
  const ey = Math.min(Math.ceil(sb / th), height)
  let vi = 0
  let flag = false

  // 计算墙块顶点位置
  for (let y = by; y < ey; y++) {
    for (let x = bx; x < ex; x++) {
      const i = x + y * tro
      if (terrains[i] === 0b10) {
        if (flag) {
          continue
        } else {
          flag = true
          vertices[vi    ] = x
          vertices[vi + 1] = y
          vertices[vi + 2] = x
          vertices[vi + 3] = y + 1
        }
      } else if (flag) {
        flag = false
        vertices[vi + 4] = x
        vertices[vi + 5] = y + 1
        vertices[vi + 6] = x
        vertices[vi + 7] = y
        vi += 8
      }
    }
    if (flag) {
      flag = false
      vertices[vi + 4] = ex
      vertices[vi + 5] = y + 1
      vertices[vi + 6] = ex
      vertices[vi + 7] = y
      vi += 8
    }
  }
  const mi1 = vi

  // 计算水域顶点位置
  for (let y = by; y < ey; y++) {
    for (let x = bx; x < ex; x++) {
      const i = x + y * tro
      if (terrains[i] === 0b01) {
        if (flag) {
          continue
        } else {
          flag = true
          vertices[vi    ] = x
          vertices[vi + 1] = y
          vertices[vi + 2] = x
          vertices[vi + 3] = y + 1
        }
      } else if (flag) {
        flag = false
        vertices[vi + 4] = x
        vertices[vi + 5] = y + 1
        vertices[vi + 6] = x
        vertices[vi + 7] = y
        vi += 8
      }
    }
    if (flag) {
      flag = false
      vertices[vi + 4] = ex
      vertices[vi + 5] = y + 1
      vertices[vi + 6] = ex
      vertices[vi + 7] = y
      vi += 8
    }
  }
  const mi2 = vi

  // 计算墙块水平边缘顶点位置
  const ox = 0.5 / this.scaleX / tw
  const oy = 0.5 / this.scaleY / th
  for (let y = by; y <= ey; y++) {
    for (let x = bx; x < ex; x++) {
      const i = x + y * tro
      if (y < ey && terrains[i] === 0b10
      ? (y === 0 || terrains[i - tro] !== 0b10)
      : (y !== 0 && terrains[i - tro] === 0b10)) {
        if (flag) {
          continue
        } else {
          flag = true
          vertices[vi    ] = x
          vertices[vi + 1] = y + oy
        }
      } else if (flag) {
        flag = false
        vertices[vi + 2] = x + ox * 2
        vertices[vi + 3] = y + oy
        vi += 4
      }
    }
    if (flag) {
      flag = false
      vertices[vi + 2] = ex + ox * 2
      vertices[vi + 3] = y + oy
      vi += 4
    }
  }

  // 计算墙块垂直边缘顶点位置
  for (let x = bx; x <= ex; x++) {
    for (let y = by; y < ey; y++) {
      const i = x + y * tro
      if (x < ex && terrains[i] === 0b10
      ? (x === 0 || terrains[i - 1] !== 0b10)
      : (x !== 0 && terrains[i - 1] === 0b10)) {
        if (flag) {
          continue
        } else {
          flag = true
          vertices[vi    ] = x + ox
          vertices[vi + 1] = y
        }
      } else if (flag) {
        flag = false
        vertices[vi + 2] = x + ox
        vertices[vi + 3] = y + oy * 2
        vi += 4
      }
    }
    if (flag) {
      flag = false
      vertices[vi + 2] = x + ox
      vertices[vi + 3] = ey + oy * 2
      vi += 4
    }
  }
  const mi3 = vi

  // 计算水域水平边缘顶点位置
  for (let y = by; y <= ey; y++) {
    for (let x = bx; x < ex; x++) {
      const i = x + y * tro
      if (y < ey && terrains[i] === 0b01
      ? (y === 0 || terrains[i - tro] === 0b00)
      : (y !== 0 && terrains[i - tro] === 0b01)) {
        if (flag) {
          continue
        } else {
          flag = true
          vertices[vi    ] = x
          vertices[vi + 1] = y + oy
        }
      } else if (flag) {
        flag = false
        vertices[vi + 2] = x + ox * 2
        vertices[vi + 3] = y + oy
        vi += 4
      }
    }
    if (flag) {
      flag = false
      vertices[vi + 2] = ex + ox * 2
      vertices[vi + 3] = y + oy
      vi += 4
    }
  }

  // 计算水域垂直边缘顶点位置
  for (let x = bx; x <= ex; x++) {
    for (let y = by; y < ey; y++) {
      const i = x + y * tro
      if (x < ex && terrains[i] === 0b01
      ? (x === 0 || terrains[i - 1] === 0b00)
      : (x !== 0 && terrains[i - 1] === 0b01)) {
        if (flag) {
          continue
        } else {
          flag = true
          vertices[vi    ] = x + ox
          vertices[vi + 1] = y
        }
      } else if (flag) {
        flag = false
        vertices[vi + 2] = x + ox
        vertices[vi + 3] = y + oy * 2
        vi += 4
      }
    }
    if (flag) {
      flag = false
      vertices[vi + 2] = x + ox
      vertices[vi + 3] = ey + oy * 2
      vi += 4
    }
  }

  // 绘制图像
  if (vi !== 0) {
    const program = gl.graphicProgram.use()
    gl.matrix.project(
      gl.flip,
      sr - sl,
      sb - st,
    )
    .translate(-sl, -st)
    .scale(tw, th)
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    if (mi1 !== mi2) {
      gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 0.25)
      gl.drawElements(gl.TRIANGLES, (mi2 - mi1) * 0.75, gl.UNSIGNED_INT, mi1 * 3)
    }
    if (mi1 !== 0) {
      gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 0.25)
      gl.drawElements(gl.TRIANGLES, mi1 * 0.75, gl.UNSIGNED_INT, 0)
    }
    if (mi3 !== vi) {
      gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 1)
      gl.drawArrays(gl.LINES, mi3 / 2, (vi - mi3) / 2)
    }
    if (mi2 !== mi3) {
      gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1)
      gl.drawArrays(gl.LINES, mi2 / 2, (mi3 - mi2) / 2)
    }
  }
}

// 绘制灯光纹理
Scene.drawLightTextures = function () {
  if (this.showLight) {
    const gl = GL
    const ambient = this.ambient
    const ambientRed = ambient.red / 255
    const ambientGreen = ambient.green / 255
    const ambientBlue = ambient.blue / 255
    const ambientDirect = ambient.direct
    const cx = gl.reflectedLightMap.clipX
    const cy = gl.reflectedLightMap.clipY
    const cw = gl.reflectedLightMap.clipWidth
    const ch = gl.reflectedLightMap.clipHeight
    gl.bindFBO(gl.reflectedLightMap.fbo)
    gl.setViewport(cx, cy, cw, ch)
    gl.clearColor(ambientRed, ambientGreen, ambientBlue, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const queue = gl.arrays[1].uint16
    const tw = this.tileWidth
    const th = this.tileHeight
    const twh = tw / 2
    const vs = tw / th
    const sl = this.lightLeft
    const st = this.lightTop
    const sr = this.lightRight
    const sb = this.lightBottom
    const lights = this.lights
    const length = lights.length
    let qi0 = 0
    let qi1 = 0
    let qi2 = 0
    let qi3 = 0
    for (let i = 0; i < length; i++) {
      const light = lights[i]
      if (light.hidden) continue
      const ox = light.x * tw
      const oy = light.y * th
      switch (light.type) {
        case 'point': {
          const hr = light.range * twh
          const px = ox < sl ? sl : ox > sr ? sr : ox
          const py = oy < st ? st : oy > sb ? sb : oy
          if ((px - ox) ** 2 + ((py - oy) * vs) ** 2 < hr ** 2) {
            switch (light.blend) {
              case 'max':
                queue[qi0++] = i
                continue
              case 'screen':
                queue[qi1++ | 0x10000] = i
                continue
              case 'additive':
                queue[qi2++ | 0x20000] = i
                continue
              case 'subtract':
                queue[qi3++ | 0x30000] = i
                continue
            }
          }
          continue
        }
        case 'area': {
          const instance = light.instance
          const ml = ox + instance.measureOffsetX * tw
          const mt = oy + instance.measureOffsetY * th
          const mr = ml + instance.measureWidth * tw
          const mb = mt + instance.measureHeight * th
          if (ml < sr && mt < sb && mr > sl && mb > st) {
            switch (light.blend) {
              case 'max':
                queue[qi0++] = i
                continue
              case 'screen':
                queue[qi1++ | 0x10000] = i
                continue
              case 'additive':
                queue[qi2++ | 0x20000] = i
                continue
              case 'subtract':
                queue[qi3++ | 0x30000] = i
                continue
            }
          }
          continue
        }
      }
    }
    const count = qi0 + qi1 + qi2 + qi3
    if (count !== 0) {
      // 排列光源索引
      for (let i = 0; i < qi1; i++) {
        queue[qi0 + i] = queue[i | 0x10000]
      }
      for (let i = 0; i < qi2; i++) {
        queue[qi0 + qi1 + i] = queue[i | 0x20000]
      }
      for (let i = 0; i < qi3; i++) {
        queue[qi0 + qi1 + qi2 + i] = queue[i | 0x30000]
      }
    }
    if (count !== 0) {
      // 绘制反射光
      const projMatrix = Matrix.instance.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      .scale(tw, th)
      for (let i = 0; i < count; i++) {
        const light = lights[queue[i]]
        light.instance.draw(projMatrix, 1)
      }
      gl.blend = 'normal'
    }
    gl.resetViewport()
    const directRed = ambientRed * ambientDirect
    const directGreen = ambientGreen * ambientDirect
    const directBlue = ambientBlue * ambientDirect
    // 避免使用直射光纹理
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindFBO(gl.directLightMap.fbo)
    gl.clearColor(directRed, directGreen, directBlue, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    if (count !== 0) {
      // 绘制直射光
      const sl = this.scrollLeft
      const st = this.scrollTop
      const sr = this.scrollRight
      const sb = this.scrollBottom
      const projMatrix = Matrix.instance.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      .scale(tw, th)
      for (let i = 0; i < count; i++) {
        const light = lights[queue[i]]
        light.instance.draw(projMatrix, light.direct)
      }
      gl.blend = 'normal'
    }
    gl.unbindFBO()
  }
}

// 绘制图块选框
Scene.drawTileMarquee = function () {
  const marquee = this.marquee
  if (marquee.visible) {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const grid = this.getGridContext()
    const sx = grid.offsetX
    const sy = grid.offsetY
    const tw = this.tileWidth
    const th = this.tileHeight
    const scroll = this.rasterizeScrollPosition(-sx, -sy)
    const sl = scroll.left
    const st = scroll.top
    const sr = scroll.right
    const sb = scroll.bottom

    // 绘制选框
    const dl = marquee.x
    const dt = marquee.y
    const dr = dl + marquee.width
    const db = dt + marquee.height
    const ox = 0.5 / this.scaleX / tw
    const oy = 0.5 / this.scaleY / th
    vertices[0] = dl + ox
    vertices[1] = dt + oy
    vertices[2] = dl + ox
    vertices[3] = db + oy
    vertices[4] = dr + ox
    vertices[5] = db + oy
    vertices[6] = dr + ox
    vertices[7] = dt + oy
    let vi = 8
    let valid = null
    let invalid = null
    const context = Scene.tilemap ?? Scene
    const sw = context.width
    const sh = context.height
    const mw = marquee.width
    const mh = marquee.height
    const bx = marquee.x
    const by = marquee.y
    const ex = bx + mw
    const ey = by + mh
    const max = Math.max
    const min = Math.min
    if (ex > 0 && bx < sw && ey > 0 && by < sh) {
      const dl = max(bx, 0)
      const dt = max(by, 0)
      const dr = min(ex, sw)
      const db = min(ey, sh)
      vertices[vi    ] = dl
      vertices[vi + 1] = dt
      vertices[vi + 2] = dl
      vertices[vi + 3] = db
      vertices[vi + 4] = dr
      vertices[vi + 5] = db
      vertices[vi + 6] = dr
      vertices[vi + 7] = dt
      valid = vi
      vi += 8
      if (bx < 0) {
        vertices[vi    ] = 0
        vertices[vi + 1] = max(by, 0)
        vertices[vi + 2] = bx
        vertices[vi + 3] = by
        vertices[vi + 4] = bx
        vertices[vi + 5] = ey
        vertices[vi + 6] = 0
        vertices[vi + 7] = min(ey, sh)
        invalid = invalid || vi
        vi += 8
      }
      if (by < 0) {
        vertices[vi    ] = max(bx, 0)
        vertices[vi + 1] = 0
        vertices[vi + 2] = bx
        vertices[vi + 3] = by
        vertices[vi + 4] = ex
        vertices[vi + 5] = by
        vertices[vi + 6] = min(ex, sw)
        vertices[vi + 7] = 0
        invalid = invalid || vi
        vi += 8
      }
      if (ex > sw) {
        vertices[vi    ] = sw
        vertices[vi + 1] = max(by, 0)
        vertices[vi + 2] = ex
        vertices[vi + 3] = by
        vertices[vi + 4] = ex
        vertices[vi + 5] = ey
        vertices[vi + 6] = sw
        vertices[vi + 7] = min(ey, sh)
        invalid = invalid || vi
        vi += 8
      }
      if (ey > sh) {
        vertices[vi    ] = max(bx, 0)
        vertices[vi + 1] = sh
        vertices[vi + 2] = bx
        vertices[vi + 3] = ey
        vertices[vi + 4] = ex
        vertices[vi + 5] = ey
        vertices[vi + 6] = min(ex, sw)
        vertices[vi + 7] = sh
        invalid = invalid || vi
        vi += 8
      }
    } else {
      vertices[vi    ] = bx
      vertices[vi + 1] = by
      vertices[vi + 2] = bx
      vertices[vi + 3] = ey
      vertices[vi + 4] = ex
      vertices[vi + 5] = ey
      vertices[vi + 6] = ex
      vertices[vi + 7] = by
      invalid = vi
      vi += 8
    }
    if (valid !== null) {
      valid = {
        start: valid * 0.75,
        count: 6,
      }
    }
    if (invalid !== null) {
      invalid = {
        start: invalid * 0.75,
        count: (vi - invalid) * 0.75,
      }
    }
    const program = gl.graphicProgram.use()
    gl.matrix.project(
      gl.flip,
      sr - sl,
      sb - st,
    )
    .translate(-sl, -st)
    .scale(tw, th)
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    if (valid !== null) {
      gl.vertexAttrib4fv(program.a_Color, marquee.backgroundColor)
      gl.drawElements(gl.TRIANGLES, valid.count, gl.UNSIGNED_INT, valid.start * 4)
    }
    if (invalid !== null) {
      gl.vertexAttrib4fv(program.a_Color, marquee.backgroundColorInvalid)
      gl.drawElements(gl.TRIANGLES, invalid.count, gl.UNSIGNED_INT, invalid.start * 4)
    }
    gl.vertexAttrib4fv(program.a_Color, marquee.borderColor)
    gl.drawArrays(gl.LINE_LOOP, 0, 4)
  }
}

// 绘制地形选框
Scene.drawTerrainMarquee = function () {
  const marquee = this.marquee
  if (marquee.visible) {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const tw = this.tileWidth
    const th = this.tileHeight
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const dl = marquee.x
    const dt = marquee.y
    const dr = marquee.x + marquee.width
    const db = marquee.y + marquee.height
    const ox = 0.5 / this.scaleX / tw
    const oy = 0.5 / this.scaleY / th
    vertices[0] = dl + ox
    vertices[1] = dt + oy
    vertices[2] = dl + ox
    vertices[3] = db + oy
    vertices[4] = dr + ox
    vertices[5] = db + oy
    vertices[6] = dr + ox
    vertices[7] = dt + oy
    const program = gl.graphicProgram.use()
    gl.matrix.project(
      gl.flip,
      sr - sl,
      sb - st,
    )
    .translate(-sl, -st)
    .scale(tw, th)
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8)
    switch (marquee.terrain) {
      case 0b00:
        gl.vertexAttrib4f(program.a_Color, 0, 1, 0, 0.25)
        break
      case 0b01:
        gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 0.25)
        break
      case 0b10:
        gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 0.25)
        break
    }
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
    gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1)
    gl.drawArrays(gl.LINE_LOOP, 0, 4)
  }
}

// 绘制瓦片地图线框
Scene.drawTilemapWireframe = function () {
  if (this.target?.class === 'tilemap') {
    const tilemap = this.target
    const anchor = this.getParallaxAnchor(tilemap)
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const tw = this.tileWidth
    const th = this.tileHeight
    const mx = tilemap.x
    const my = tilemap.y
    const mw = tilemap.width
    const mh = tilemap.height
    const ox = tilemap.offsetX
    const oy = tilemap.offsetY
    const pw = mw * tw
    const ph = mh * th
    const ax = tilemap.anchorX * pw
    const ay = tilemap.anchorY * ph
    const dl = anchor.x - ax + ox
    const dt = anchor.y - ay + oy
    const dr = dl + pw
    const db = dt + ph
    if (dl < sr && dt < sb && dr > sl && db > st) {
      const ml = dl / tw
      const mt = dt / th
      this.drawRectWireframeOnTilemap(ml, mt, mw, mh, mx, my, 0)
      this.drawTargetAnchor(tilemap, 0)
    }
  }
}

// 绘制动画线框
Scene.drawAnimationWireframe = function () {
  switch (this.target?.class) {
    case 'actor':
    case 'animation': {
      const target = this.target
      const data = target.data
      if (data === undefined) {
        return
      }
      const sl = this.scrollLeft
      const st = this.scrollTop
      const sr = this.scrollRight
      const sb = this.scrollBottom
      const tw = this.tileWidth
      const th = this.tileHeight
      const ax = target.x
      const ay = target.y
      const as = target.class === 'actor'
      ? Math.max(data.size * target.player.scale, 1)
      : 1
      const ar = as / 2
      const ml = (ax - ar) * tw
      const mt = (ay - ar) * th
      const mr = (ax + ar) * tw
      const mb = (ay + ar) * th
      if (mr > sl && ml < sr && mb > st && mt < sb) {
        this.drawRectWireframeOnTilemap(ax - ar, ay - ar, as, as, ax, ay, 0)
      }
      break
    }
  }
}

// 绘制动画锚点
Scene.drawAnimationAnchor = function () {
  switch (this.target?.class) {
    case 'actor': {
      const team = Data.teams.map[this.target.teamId]
      const color = INTRGBA(team?.color ?? 'ffffffff')
      this.drawTargetAnchor(this.target, 0, color)
      break
    }
    case 'animation':
      this.drawTargetAnchor(this.target, 0)
      break
  }
}

// 绘制光源线框
Scene.drawLightWireframe = function () {
  if (this.target?.class === 'light') {
    const light = this.target
    const tw = this.tileWidth
    const th = this.tileHeight
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    switch (light.type) {
      case 'point': {
        const ox = light.x * tw
        const oy = light.y * th
        const hr = light.range / 2 * tw
        const vs = tw / th
        const px = ox < sl ? sl : ox > sr ? sr : ox
        const py = oy < st ? st : oy > sb ? sb : oy
        if ((px - ox) ** 2 + ((py - oy) * vs) ** 2 < hr ** 2) {
          const vr = light.range / 2 * th
          this.drawOvalWireframe(ox, oy, hr, vr, 0xffffffff)
          this.drawTargetAnchor(light, 0)
        }
        break
      }
      case 'area': {
        const instance = light.instance
        const ax = light.x
        const ay = light.y
        const ox = light.x * tw
        const oy = light.y * th
        const ml = ox + instance.measureOffsetX * tw
        const mt = oy + instance.measureOffsetY * th
        const mr = ml + instance.measureWidth * tw
        const mb = mt + instance.measureHeight * th
        if (ml < sr && mt < sb && mr > sl && mb > st) {
          const rl = light.x - instance.anchorOffsetX
          const rt = light.y - instance.anchorOffsetY
          const rw = light.width
          const rh = light.height
          const angle = instance.angle
          this.drawRectWireframeOnTilemap(rl, rt, rw, rh, ax, ay, angle)
          this.drawTargetAnchor(light, angle)
        }
        break
      }
    }
  }
}

// 绘制区域线框
Scene.drawRegionWireframe = function () {
  if (this.target?.class === 'region') {
    const region = this.target
    const tw = this.tileWidth
    const th = this.tileHeight
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const rx = region.x
    const ry = region.y
    const rw = region.width
    const rh = region.height
    const rl = rx - rw / 2
    const rt = ry - rh / 2
    const dl = rl * tw
    const dt = rt * th
    const dr = (rl + rw) * tw
    const db = (rt + rh) * th
    if (dl < sr && dt < sb && dr > sl && db > st) {
      this.drawRectWireframeOnTilemap(rl, rt, rw, rh, rx, ry, 0)
      this.drawTargetAnchor(region, 0)
    }
  }
}

// 绘制粒子发射器线框
Scene.drawParticleEmitterWireframe = function () {
  if (this.target?.class === 'particle') {
    const particle = this.target
    const rect = particle.emitter?.bounding
    const angle = Math.radians(particle.angle)
    if (rect?.hasArea) {
      const coords = this.getConvertedCoords(particle)
      const ax = coords.x
      const ay = coords.y
      const rl = ax + rect.left * particle.scale
      const rt = ay + rect.top * particle.scale
      const rr = ax + rect.right * particle.scale
      const rb = ay + rect.bottom * particle.scale
      this.drawRectWireframe(rl, rt, rr, rb, ax, ay, angle)
    }
    this.drawTargetAnchor(particle, angle)
  }
}

// 绘制视差图线框
Scene.drawParallaxWireframe = function () {
  if (this.target?.class === 'parallax') {
    const parallax = this.target
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const texture = parallax.player.texture
    const width = texture?.width ?? 128
    const height = texture?.height ?? 128
    const anchor = this.getParallaxAnchor(parallax)
    const pw = parallax.scaleX * parallax.repeatX * width
    const ph = parallax.scaleY * parallax.repeatY * height
    const ox = parallax.offsetX
    const oy = parallax.offsetY
    const ax = parallax.anchorX * pw
    const ay = parallax.anchorY * ph
    const dl = anchor.x - ax + ox
    const dt = anchor.y - ay + oy
    const dr = dl + pw
    const db = dt + ph
    if (dl < sr && dt < sb && dr > sl && db > st) {
      const {x, y} = this.getConvertedCoords(parallax)
      this.drawRectWireframe(dl, dt, dr, db, x, y, 0)
      this.drawTargetAnchor(parallax, 0)
    }
  }
}

// 创建初始位置图像纹理
Scene.createStartPositionTexture = function () {
  let texture = this.startPositionTexture
  if (texture === null) {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')
    const y = (canvas.height - 160) / 2 + 160 * 0.85
    context.fillStyle = 'rgba(0, 255, 255, 0.5)'
    context.fillRect(0, 0, 256, 256)
    context.fillStyle = '#ffffff'
    context.textAlign = 'center'
    context.shadowColor = '#000000'
    context.shadowBlur = 4
    context.shadowOffsetY = 4
    context.font = '160px Awesome'
    context.fillText('\uf041', 128, y)
    texture = new Texture()
    texture.fromImage(canvas)
    texture.base.protected = true
    this.startPositionTexture = texture
  }
  return texture
}

// 绘制初始位置
Scene.drawStartPosition = function () {
  const {startPosition} = Data.config
  if (startPosition.sceneId === this.meta.guid) {
    const tw = this.tileWidth
    const th = this.tileHeight
    const sl = this.scrollLeft
    const st = this.scrollTop
    const sr = this.scrollRight
    const sb = this.scrollBottom
    const dl = (startPosition.x - 0.5) * tw
    const dt = (startPosition.y - 0.5) * th
    const dr = dl + tw
    const db = dt + th
    if (dl < sr && dt < sb && dr > sl && db > st) {
      const gl = GL
      const vertices = gl.arrays[0].float32
      vertices[0] = dl
      vertices[1] = dt
      vertices[2] = 0
      vertices[3] = 0
      vertices[4] = dl
      vertices[5] = db
      vertices[6] = 0
      vertices[7] = 1
      vertices[8] = dr
      vertices[9] = db
      vertices[10] = 1
      vertices[11] = 1
      vertices[12] = dr
      vertices[13] = dt
      vertices[14] = 1
      vertices[15] = 0

      // 绘制文本
      gl.alpha = 0.5
      const texture = this.createStartPositionTexture()
      const program = gl.imageProgram.use()
      gl.matrix.project(
        gl.flip,
        sr - sl,
        sb - st,
      )
      .translate(-sl, -st)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
      gl.uniform1i(program.u_LightMode, 0)
      gl.uniform1i(program.u_ColorMode, 0)
      gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
      gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0)
      gl.alpha = 1
    }
  }
}

// 选择对象
Scene.selectObject = function (x, y) {
  let precise = false
  let target = null
  let weight = 0

  // 选择角色和动画对象
  if (!target) {
    const actors = this.actors
    const animations = this.animations
    for (let i = 0; i < 2; i++) {
      const list = i === 0 ? actors : animations
      const length = list.length
      for (let i = length - 1; i >= 0; i--) {
        const object = list[i]
        if (object.hidden || object.locked) {
          continue
        }
        const size = object.data?.size ?? 1
        const radius = Math.max(size, 1) / 2
        const ax = object.x
        const ay = object.y
        const l = ax - radius
        const r = ax + radius
        const t = ay - radius - 1
        const b = ay + radius
        if (x >= l && x < r && y >= t && y < b) {
          const p = Math.dist(x, y, ax, ay) <= radius
          const w = (p ? 0 : -100) + ay / 2
          - Math.abs(x - ax)
          - Math.abs(y - ay)
          if (target === null || weight < w) {
            if (!precise) {
              precise = p
            }
            target = object
            weight = w
          }
        }
      }
    }
  }

  // 选择区域对象
  if (!precise) {
    target = this.selectRegion(x, y) ?? target
  }

  // 选择粒子发射器对象
  if (!target) {
    target = this.selectParticleEmitter(x, y)
  }

  // 选择光源对象
  if (!target && this.showLight) {
    target = this.selectLight(x, y)
  }

  // 选择视差图和瓦片地图对象
  if (!target) {
    target = this.selectSortedLayer(x, y)
  }

  return target
}

// 选择区域
Scene.selectRegion = function (x, y) {
  let target = null
  let weight = 0
  const regions = this.regions
  const length = regions.length
  for (let i = length - 1; i >= 0; i--) {
    const region = regions[i]
    if (region.hidden || region.locked) {
      continue
    }
    const rw = region.width
    const rh = region.height
    const rl = region.x - rw / 2
    const rt = region.y - rh / 2
    const rr = rl + rw
    const rb = rt + rh
    if (x >= rl && y >= rt && x < rr && y < rb) {
      const w = -Math.min(rw, rh)
      - Math.abs(x - region.x)
      - Math.abs(y - region.y)
      if (target === null || weight < w) {
        target = region
        weight = w
      }
    }
  }
  return target
}

// 选择光源
Scene.selectLight = function (x, y) {
  let target = null
  let weight = 0
  const lights = this.lights
  const length = lights.length
  for (let i = length - 1; i >= 0; i--) {
    const light = lights[i]
    if (light.hidden || light.locked) {
      continue
    }
    switch (light.type) {
      case 'point': {
        const rx = x - light.x
        const ry = y - light.y
        const lr = light.range / 2
        if (rx ** 2 + ry ** 2 <= lr ** 2) {
          const w = -Math.PI * lr ** 2
          - Math.abs(rx)
          - Math.abs(ry)
          if (target === null || weight < w) {
            target = light
            weight = w
          }
        }
        continue
      }
      case 'area': {
        const instance = light.instance
        const rx = x - light.x
        const ry = y - light.y
        const lw = light.width
        const lh = light.height
        const ll = -instance.anchorOffsetX
        const lt = -instance.anchorOffsetY
        const lr = ll + lw
        const lb = lt + lh
        const angle = instance.angle
        const cos = Math.cos(-angle)
        const sin = Math.sin(-angle)
        const px = rx * cos - ry * sin
        const py = rx * sin + ry * cos
        if (px >= ll && py >= lt && px < lr && py < lb) {
          const w = -lw * lh
          - Math.abs(rx)
          - Math.abs(ry)
          if (target === null || weight < w) {
            target = light
            weight = w
          }
        }
        continue
      }
    }
  }
  return target
}

// 选择粒子发射器
Scene.selectParticleEmitter = function (x, y) {
  let target = null
  let weight = 0
  const convert = this.getConvertedCoords
  const point = convert(this.sharedPoint.set(x, y))
  const mx = point.x
  const my = point.y
  const particles = this.particles
  const length = particles.length
  for (let i = length - 1; i >= 0; i--) {
    const particle = particles[i]
    if (particle.hidden || particle.locked) {
      continue
    }
    const emitter = particle.emitter
    if (emitter?.bounding.hasArea) {
      // 如果粒子发射器存在区域
      const rect = emitter.bounding
      const point = convert(particle)
      const rx = mx - point.x
      const ry = my - point.y
      const rl = rect.left * particle.scale
      const rt = rect.top * particle.scale
      const rr = rect.right * particle.scale
      const rb = rect.bottom * particle.scale
      const angle = Math.radians(particle.angle)
      const cos = Math.cos(-angle)
      const sin = Math.sin(-angle)
      const px = rx * cos - ry * sin
      const py = rx * sin + ry * cos
      if (px >= rl && py >= rt && px < rr && py < rb) {
        const w = -rect.width * rect.height
        - Math.abs(rx)
        - Math.abs(ry)
        if (target === null || weight < w) {
          target = particle
          weight = w
        }
      }
    } else {
      // 否则默认设置一个图块的区域
      const rl = particle.x - 0.5
      const rt = particle.y - 0.5
      const rr = particle.x + 0.5
      const rb = particle.y + 0.5
      if (x >= rl && y >= rt && x < rr && y < rb) {
        const w =
        - Math.abs(x - particle.x)
        - Math.abs(y - particle.y)
        if (target === null || weight < w) {
          target = particle
          weight = w
        }
      }
    }
  }
  return target
}

// 选择有序图层(视差图和瓦片地图)
Scene.selectSortedLayer = function (x, y) {
  const sPoint = this.sharedPoint.set(x, y)
  const dPoint = this.getConvertedCoords(sPoint)
  const mx = dPoint.x
  const my = dPoint.y
  const tw = this.tileWidth
  const th = this.tileHeight
  for (let i = 0; i < 3; i++) {
    let layers
    switch (i) {
      case 0: layers = this.foregrounds; break
      case 1: layers = this.doodads    ; break
      case 2: layers = this.backgrounds; break
    }
    const length = layers.length
    for (let i = length - 1; i >= 0; i--) {
      const object = layers[i]
      if (object.hidden || object.locked) {
        continue
      }
      switch (object.class) {
        case 'parallax': {
          const parallax = object
          const texture = parallax.player.texture
          const width = texture?.width ?? 128
          const height = texture?.height ?? 128
          const pw = parallax.scaleX * parallax.repeatX * width
          const ph = parallax.scaleY * parallax.repeatY * height
          const anchor = this.getParallaxAnchor(parallax)
          const ox = parallax.offsetX
          const oy = parallax.offsetY
          const ax = parallax.anchorX * pw
          const ay = parallax.anchorY * ph
          const pl = anchor.x - ax + ox
          const pt = anchor.y - ay + oy
          const pr = pl + pw
          const pb = pt + ph
          if (mx >= pl && my >= pt && mx < pr && my < pb) {
            return parallax
          }
          continue
        }
        case 'tilemap': {
          const tilemap = object
          const anchor = this.getParallaxAnchor(tilemap, true)
          const rw = tilemap.width
          const rh = tilemap.height
          const ox = tilemap.offsetX
          const oy = tilemap.offsetY
          const ax = tilemap.anchorX * rw
          const ay = tilemap.anchorY * rh
          const rl = anchor.x - ax + ox / tw
          const rt = anchor.y - ay + oy / th
          const rr = rl + rw
          const rb = rt + rh
          if (x >= rl && y >= rt && x < rr && y < rb) {
            return tilemap
          }
          continue
        }
      }
    }
  }
  return null
}

// 绘制椭圆线框
Scene.drawOvalWireframe = function (ox, oy, hr, vr, color) {
  const gl = GL
  const vertices = gl.arrays[0].float32
  const scale = this.scale
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const offset = Math.max(1, 0.5 / scale)
  const hmr = hr - offset
  const vmr = vr - offset
  const segments = 360
  const step = Math.PI * 2 / segments
  let vi = 0
  for (let i = 0, j = 1; i < segments; i++, j = -j) {
    const angle = i * step
    const or = j * offset
    vertices[vi    ] = ox + (hmr + or) * Math.cos(angle)
    vertices[vi + 1] = oy + (vmr + or) * Math.sin(angle)
    vi += 2
  }
  vertices[vi    ] = vertices[0]
  vertices[vi + 1] = vertices[1]
  vertices[vi + 2] = vertices[2]
  vertices[vi + 3] = vertices[3]
  vi += 4
  const program = gl.graphicProgram.use()
  const red = (color & 0xff) / 255
  const green = (color >> 8 & 0xff) / 255
  const blue = (color >> 16 & 0xff) / 255
  const alpha = (color >> 24 & 0xff) / 255
  gl.matrix.project(
    gl.flip,
    sr - sl,
    sb - st,
  )
  .translate(-sl, -st)
  gl.bindVertexArray(program.vao.a10)
  gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
  gl.vertexAttrib4f(program.a_Color, red, green, blue, alpha)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vi / 2)
}

// 绘制目标锚点
Scene.drawTargetAnchor = function (target, angle, color = 0xff00ff00) {
  const {x, y} = this.getConvertedCoords(target)
  const gl = GL
  const vertices = gl.arrays[0].float32
  const scale = this.scale
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const offset = Math.max(1, 0.5 / scale)
  const sox = scale <= 0.5 ? 0.5 : 0
  const o1 = offset
  const o4 = offset * 4
  vertices[0] = x - o1
  vertices[1] = y - o4
  vertices[2] = x - o1
  vertices[3] = y + o4
  vertices[4] = x + o1
  vertices[5] = y + o4
  vertices[6] = x + o1
  vertices[7] = y + o4
  vertices[8] = x + o1
  vertices[9] = y - o4
  vertices[10] = x - o1
  vertices[11] = y - o4
  vertices[12] = x - o4
  vertices[13] = y - o1
  vertices[14] = x - o4
  vertices[15] = y + o1
  vertices[16] = x + o4
  vertices[17] = y + o1
  vertices[18] = x + o4
  vertices[19] = y + o1
  vertices[20] = x + o4
  vertices[21] = y - o1
  vertices[22] = x - o4
  vertices[23] = y - o1
  const program = gl.graphicProgram.use()
  const red = (color & 0xff) / 255
  const green = (color >> 8 & 0xff) / 255
  const blue = (color >> 16 & 0xff) / 255
  const alpha = (color >> 24 & 0xff) / 255
  gl.matrix.project(
    gl.flip,
    sr - sl,
    sb - st,
  )
  .translate(-sl + sox, -st)
  .rotateAt(x, y, angle)
  gl.bindVertexArray(program.vao.a10)
  gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 24)
  gl.vertexAttrib4f(program.a_Color, red, green, blue, alpha)
  gl.drawArrays(gl.TRIANGLES, 0, 12)
}

// 绘制矩形线框
Scene.drawRectWireframe = function (dl, dt, dr, db, ax, ay, angle) {
  const gl = GL
  const vertices = gl.arrays[0].float32
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const sox = this.scale <= 0.5 ? 0.5 : 0
  gl.matrix.reset()
  .translate(-sl + sox, -st)
  .rotateAt(ax, ay, angle)
  this.setRectWireframeVertices(vertices, dl, dt, dr, db, gl.matrix)
  const program = gl.graphicProgram.use()
  gl.matrix.project(
    gl.flip,
    sr - sl,
    sb - st,
  )
  gl.bindVertexArray(program.vao.a10)
  gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 20)
  gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10)
}

// 绘制瓦片地图上的矩形线框
Scene.drawRectWireframeOnTilemap = function (rl, rt, rw, rh, ax, ay, angle) {
  const gl = GL
  const vertices = gl.arrays[0].float32
  const tw = this.tileWidth
  const th = this.tileHeight
  const sl = this.scrollLeft
  const st = this.scrollTop
  const sr = this.scrollRight
  const sb = this.scrollBottom
  const dl = rl
  const dt = rt
  const dr = rl + rw
  const db = rt + rh
  const sox = this.scale <= 0.5 ? 0.5 : 0
  gl.matrix.reset()
  .translate(-sl + sox, -st)
  .scale(tw, th)
  .rotateAt(ax, ay, angle)
  this.setRectWireframeVertices(vertices, dl, dt, dr, db, gl.matrix)
  const program = gl.graphicProgram.use()
  gl.matrix.project(
    gl.flip,
    sr - sl,
    sb - st,
  )
  gl.bindVertexArray(program.vao.a10)
  gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 20)
  gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10)
}

// 设置矩形线框顶点
Scene.setRectWireframeVertices = function (vertices, dl, dt, dr, db, matrix) {
  const a = matrix[0]
  const b = matrix[1]
  const c = matrix[3]
  const d = matrix[4]
  const e = matrix[6]
  const f = matrix[7]
  const x1 = a * dl + c * dt + e
  const y1 = b * dl + d * dt + f
  const x2 = a * dl + c * db + e
  const y2 = b * dl + d * db + f
  const x3 = a * dr + c * db + e
  const y3 = b * dr + d * db + f
  const x4 = a * dr + c * dt + e
  const y4 = b * dr + d * dt + f
  const vectors = Vector.instances
  const vector14 = vectors[0].set(x4 - x1, y4 - y1)
  const vector12 = vectors[1].set(x2 - x1, y2 - y1)
  const vector21 = vectors[2].set(x1 - x2, y1 - y2)
  const vector23 = vectors[3].set(x3 - x2, y3 - y2)
  const vector32 = vectors[4].set(x2 - x3, y2 - y3)
  const vector34 = vectors[5].set(x4 - x3, y4 - y3)
  const vector43 = vectors[6].set(x3 - x4, y3 - y4)
  const vector41 = vectors[7].set(x1 - x4, y1 - y4)
  const vector1 = vector14.normalize().add(vector12.normalize())
  const vector2 = vector21.normalize().add(vector23.normalize())
  const vector3 = vector32.normalize().add(vector34.normalize())
  const vector4 = vector43.normalize().add(vector41.normalize())
  const offset = Math.max(1, 0.5 / this.scale)
  vector1.length = offset / vector1.sin(vector12)
  vector2.length = offset / vector2.sin(vector23)
  vector3.length = offset / vector3.sin(vector34)
  vector4.length = offset / vector4.sin(vector41)
  vertices[0] = x1 - vector1.x
  vertices[1] = y1 - vector1.y
  vertices[2] = x1 + vector1.x
  vertices[3] = y1 + vector1.y
  vertices[4] = x2 - vector2.x
  vertices[5] = y2 - vector2.y
  vertices[6] = x2 + vector2.x
  vertices[7] = y2 + vector2.y
  vertices[8] = x3 - vector3.x
  vertices[9] = y3 - vector3.y
  vertices[10] = x3 + vector3.x
  vertices[11] = y3 + vector3.y
  vertices[12] = x4 - vector4.x
  vertices[13] = y4 - vector4.y
  vertices[14] = x4 + vector4.x
  vertices[15] = y4 + vector4.y
  vertices[16] = x1 - vector1.x
  vertices[17] = y1 - vector1.y
  vertices[18] = x1 + vector1.x
  vertices[19] = y1 + vector1.y
}

// 编辑图块
Scene.edit = function (x, y, width, height) {
  // 使用笔刷来编辑图块
  switch (this.brush) {
    case 'eraser':
    case 'pencil':
      this.editInPencilMode(x, y, width, height)
      break
    case 'rect':
      this.editInRectMode(x, y, width, height)
      break
    case 'oval':
      this.editInOvalMode(x, y, width, height)
      break
    case 'fill':
      this.editInFillMode(x, y)
      break
  }

  // 刷新画面
  this.requestRendering()

  // 计划保存
  this.planToSave()
}

// 编辑图块 - 铅笔模式
Scene.editInPencilMode = function (x, y, width, height) {
  const context = this.tilemap ?? this
  const mapWidth = context.width
  const mapHeight = context.height
  const pox = this.patternOriginX
  const poy = this.patternOriginY
  const layer = this.layer
  const shiftKey = this.shiftKey || Palette.explicit
  const sTiles = this.marquee.getTiles(true)

  // 设置图块
  const bx = Math.max(x, 0)
  const by = Math.max(y, 0)
  const ex = Math.min(x + width, mapWidth)
  const ey = Math.min(y + height, mapHeight)
  for (let y = by; y < ey; y++) {
    for (let x = bx; x < ex; x++) {
      if (layer === 'terrain') {
        this.setTerrain(x, y)
      } else {
        this.setTile(sTiles, x - pox, y - poy, x, y)
      }
    }
  }

  // 更新目标图块以及相邻的帧索引
  if (layer !== 'terrain' && !shiftKey) {
    const bx = Math.max(x - 1, 0)
    const by = Math.max(y - 1, 0)
    const ex = Math.min(x + width + 1, mapWidth)
    const ey = Math.min(y + height + 1, mapHeight)
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        this.setTileFrame(x, y)
      }
    }
  }
}

// 编辑图块 - 矩形模式
Scene.editInRectMode = function (x, y, width, height) {
  const context = this.tilemap ?? this
  const mapWidth = context.width
  const mapHeight = context.height
  const pox = this.patternOriginX
  const poy = this.patternOriginY
  const layer = this.layer
  const shiftKey = this.shiftKey || Palette.explicit
  const sTiles = this.marquee.getTiles(shiftKey)

  // 撤销上一次的改动
  this.restoreMapData()

  // 设置图块
  const bx = Math.max(x, 0)
  const by = Math.max(y, 0)
  const ex = Math.min(x + width, mapWidth)
  const ey = Math.min(y + height, mapHeight)
  for (let y = by; y < ey; y++) {
    for (let x = bx; x < ex; x++) {
      if (layer === 'terrain') {
        this.setTerrain(x, y)
      } else {
        this.setTile(sTiles, x - pox, y - poy, x, y)
      }
    }
  }

  // 更新边缘图块的帧索引
  if (layer !== 'terrain' && !shiftKey) {
    const left = x + 1
    const top = y + 1
    const right = x + width - 2
    const bottom = y + height - 2
    const bx = Math.max(x - 1, 0)
    const by = Math.max(y - 1, 0)
    const ex = Math.min(x + width + 1, mapWidth)
    const ey = Math.min(y + height + 1, mapHeight)
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        if (x < left || x > right || y < top || y > bottom) {
          this.setTileFrame(x, y)
        }
      }
    }
  }
}

// 编辑图块 - 椭圆模式
Scene.editInOvalMode = function (x, y, width, height) {
  const context = this.tilemap ?? this
  const mapWidth = context.width
  const mapHeight = context.height
  const pox = this.patternOriginX
  const poy = this.patternOriginY
  const layer = this.layer
  const shiftKey = this.shiftKey || Palette.explicit
  const sTiles = this.marquee.getTiles(shiftKey)

  // 撤销上一次的改动
  this.restoreMapData()

  // 设置图块
  const rr = (Math.max(width, height) / 2 - 0.1) ** 2
  const scale = Math.max(width, height) / Math.min(width, height)
  const ox = x + (width - 1) / 2
  const oy = y + (height - 1) / 2
  let ovalWidth
  let ovalFlags
  let edgeFlags
  if (layer !== 'terrain' && !shiftKey) {
    const bx = Math.max(x, 0) - 1
    const by = Math.max(y, 0) - 1
    const ex = Math.min(x + width, mapWidth) + 1
    const ey = Math.min(y + height, mapHeight) + 1
    ovalWidth = ex - bx
    ovalFlags = new Uint8Array((ex - bx) * (ey - by))
    edgeFlags = new Uint8Array(ovalFlags.length)
  }
  const bx = Math.max(x, 0)
  const by = Math.max(y, 0)
  const ex = Math.min(x + width, mapWidth)
  const ey = Math.min(y + height, mapHeight)
  for (let y = by; y < ey; y++) {
    for (let x = bx; x < ex; x++) {
      const sumOfSquares = (
        width < height
      ? ((x - ox) * scale) ** 2 + (y - oy) ** 2
      : (x - ox) ** 2 + ((y - oy) * scale) ** 2
      )
      if (sumOfSquares < rr) {
        if (layer === 'terrain') {
          this.setTerrain(x, y)
        } else {
          this.setTile(sTiles, x - pox, y - poy, x, y)
          if (!shiftKey) {
            const i = (x - bx + 1) + (y - by + 1) * ovalWidth
            ovalFlags[i] = 1
          }
        }
      }
    }
  }

  // 选取边缘区域
  if (layer !== 'terrain' && !shiftKey) {
    const bx = Math.max(x, 0) - 1
    const by = Math.max(y, 0) - 1
    const ex = Math.min(x + width, mapWidth) + 1
    const ey = Math.min(y + height, mapHeight) + 1
    const dx = ex - 1
    const dy = ey - 1
    for (let y = by; y < dy; y++) {
      for (let x = bx; x < dx; x++) {
        const i = (x - bx) + (y - by) * ovalWidth
        if (x < dx && ovalFlags[i] !== ovalFlags[i + 1]) {
          edgeFlags[i] = 1
          edgeFlags[i + 1] = 1
        }
        if (y < dy && ovalFlags[i] !== ovalFlags[i + ovalWidth]) {
          edgeFlags[i] = 1
          edgeFlags[i + ovalWidth] = 1
        }
        if (x < dx && y < dy && ovalFlags[i] !== ovalFlags[i + 1 + ovalWidth]) {
          edgeFlags[i] = 1
          edgeFlags[i + 1 + ovalWidth] = 1
        }
        if (x > 0 && y < dy && ovalFlags[i] !== ovalFlags[i - 1 + ovalWidth]) {
          edgeFlags[i] = 1
          edgeFlags[i - 1 + ovalWidth] = 1
        }
      }
    }

    // 更新帧索引
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const i = (x - bx) + (y - by) * ovalWidth
        if (edgeFlags[i] === 1) {
          this.setTileFrame(x, y)
        }
      }
    }
  }
}

// 编辑图块 - 填充模式
Scene.editInFillMode = function (x, y) {
  let mapData, mapWidth, mapHeight, bitShift
  let shiftKey, sTiles
  const layer = this.layer
  switch (layer) {
    case 'tilemap': {
      const {tilemap} = this
      mapData = tilemap.tiles
      mapWidth = tilemap.width
      mapHeight = tilemap.height
      bitShift = 6
      shiftKey = this.shiftKey || Palette.explicit
      sTiles = this.marquee.getTiles(shiftKey)
      break
    }
    case 'terrain':
      mapData = this.terrains
      mapWidth = this.width
      mapHeight = this.height
      bitShift = 0
      break
  }
  const pox = this.patternOriginX
  const poy = this.patternOriginY
  const flags = new Uint8Array(mapWidth * mapHeight)

  // 脏矩形参数
  let minX = x
  let minY = y
  let maxX = x
  let maxY = y

  // 初始堆栈和标记 - openset: 当前被填充图块坐标栈, closedset: 下一轮...
  const {min, max} = Math
  const buffer = GL.arrays[1].uint16.buffer
  const sLength = min(mapWidth, mapHeight) * 4
  let openset = new Uint16Array(buffer, 0, sLength)
  let closedset = new Uint16Array(buffer, sLength * 2, sLength)
  let openlength = 2
  let closedlength = 0
  openset[0] = x
  openset[1] = y
  flags[x + y * mapWidth] = 1

  // 获取被填充的图块键值
  const di = x + y * mapWidth
  const key = mapData[di] >> bitShift

  // 获取标记(-1: 场景外, 0: 未访问, 1: 可填充, 2: 内边缘, 3: 外边缘)
  const getFlag = (x, y) => {
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
      minX = min(x, minX)
      minY = min(y, minY)
      maxX = max(x, maxX)
      maxY = max(y, maxY)
      return -1
    }

    // 初次访问
    const fi = x + y * mapWidth
    if (flags[fi] === 0) {
      const di = x + y * mapWidth
      if (mapData[di] >> bitShift !== key) {
        minX = min(x, minX)
        minY = min(y, minY)
        maxX = max(x, maxX)
        maxY = max(y, maxY)
        return flags[fi] = 3
      }
      closedset[closedlength] = x
      closedset[closedlength + 1] = y
      closedlength += 2
      return flags[fi] = 1
    }
    return flags[fi]
  }

  // 处理开集数据
  while (openlength > 0) {
    for (let i = 0; i < openlength; i += 2) {
      const x = openset[i]
      const y = openset[i + 1]
      if (layer === 'terrain') {
        this.setTerrain(x, y)
      } else {
        this.setTile(sTiles, x - pox, y - poy, x, y)
      }
      if (getFlag(x - 1, y) === 3) {
        flags[x + y * mapWidth] = 2
      }
      if (getFlag(x, y - 1) === 3) {
        flags[x + y * mapWidth] = 2
      }
      if (getFlag(x + 1, y) === 3) {
        flags[x + y * mapWidth] = 2
      }
      if (getFlag(x, y + 1) === 3) {
        flags[x + y * mapWidth] = 2
      }
    }
    const temporary = openset
    openset = closedset
    closedset = temporary
    openlength = closedlength
    closedlength = 0
  }

  // 修补图块填充边缘
  if (layer !== 'terrain' && !shiftKey) {
    const bx = max(minX, 0)
    const by = max(minY, 0)
    const ex = min(maxX + 1, mapWidth)
    const ey = min(maxY + 1, mapHeight)
    for (let y = by; y < ey; y++) {
      for (let x = bx; x < ex; x++) {
        const fi = x + y * mapWidth
        switch (flags[fi]) {
          case 2:
            this.setTileFrame(x, y)
            {
              const tx = x - 1
              const fi = tx + y * mapWidth
              if (flags[fi] === 1 && (
                getFlag(x, y - 1) === 3 ||
                getFlag(x, y + 1) === 3)) {
                flags[fi] = 2
                this.setTileFrame(tx, y)
              }
            }
            {
              const tx = x + 1
              const fi = tx + y * mapWidth
              if (flags[fi] === 1 && (
                getFlag(x, y - 1) === 3 ||
                getFlag(x, y + 1) === 3)) {
                flags[fi] = 2
                this.setTileFrame(tx, y)
              }
            }
            {
              const tx = x - 1
              const ty = y - 1
              const fi = tx + ty * mapWidth
              if (flags[fi] === 0 && tx >= 0 && ty >= 0) {
                flags[fi] = 3
                this.setTileFrame(tx, ty)
              }
            }
            {
              const tx = x + 1
              const ty = y - 1
              const fi = tx + ty * mapWidth
              if (flags[fi] === 0 && tx < mapWidth && ty >= 0) {
                flags[fi] = 3
                this.setTileFrame(tx, ty)
              }
            }
            {
              const tx = x + 1
              const ty = y + 1
              const fi = tx + ty * mapWidth
              if (flags[fi] === 0 && tx < mapWidth && ty < mapHeight) {
                flags[fi] = 3
                this.setTileFrame(tx, ty)
              }
            }
            {
              const tx = x - 1
              const ty = y + 1
              const fi = tx + ty * mapWidth
              if (flags[fi] === 0 && tx >= 0 && ty < mapHeight) {
                flags[fi] = 3
                this.setTileFrame(tx, ty)
              }
            }
            break
          case 3:
            this.setTileFrame(x, y)
            break
        }
      }
    }
  }
}

// 设置图块
Scene.setTile = function (sTiles, sx, sy, dx, dy) {
  const sw = sTiles.width
  const sh = sTiles.height
  const sro = sTiles.rowOffset
  sx = ((sx % sw) + sw) % sw
  sy = ((sy % sh) + sh) % sh
  const tilemap = this.tilemap
  const dTiles = tilemap.tiles
  const dro = dTiles.rowOffset
  const si = sx + sy * sro
  const di = dx + dy * dro
  const sTile = sTiles[si]
  const dTile = dTiles[di]
  if (sTile === 0) {
    if (dTile !== 0) {
      this.recordMapData(di)
      dTiles[di] = 0
    }
    return
  }
  const sMap = this.marquee.tilesetMap
  const rMap = tilemap.reverseMap
  const guid = sMap[sTile >> 24]
  let index = rMap[guid]
  if (index === undefined) {
    const dMap = tilemap.tilesetMap
    index = this.getNewTilesetIndex(dMap)
    if (index === 0) return
    dMap[index] = guid
    rMap[guid] = index
  }
  const nTile = sTile & 0xffffff | index << 24
  if (dTile !== nTile) {
    this.recordMapData(di)
    dTiles[di] = nTile
  }
}

// 设置图块帧索引
Scene.setTileFrame = function (x, y) {
  const tilemap = this.tilemap
  const width = tilemap.width
  const height = tilemap.height
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return
  }
  const tiles = tilemap.tiles
  const ro = tiles.rowOffset
  const ti = x + y * ro
  const tile = tiles[ti]
  if (tile === 0) {
    return
  }
  const tilesetMap = tilemap.tilesetMap
  const tilesets = Data.tilesets
  const templates = Data.autotiles.map
  const guid = tilesetMap[tile >> 24]
  const tileset = tilesets[guid]
  if (tileset !== undefined &&
    tileset.type === 'auto') {
    const tx = tile >> 8 & 0xff
    const ty = tile >> 16 & 0xff
    const id = tx + ty * tileset.width
    const autoTile = tileset.tiles[id]
    if (!autoTile) {
      return
    }
    const template = templates[autoTile.template]
    if (template === undefined) {
      return
    }
    const key = tile >> 8
    const r = width - 1
    const b = height - 1
    const neighbor =
      (x > 0          && key !== tiles[ti - 1     ] >> 8) + 1
    | (x > 0 && y > 0 && key !== tiles[ti - 1 - ro] >> 8) + 1 << 2
    | (         y > 0 && key !== tiles[ti     - ro] >> 8) + 1 << 4
    | (x < r && y > 0 && key !== tiles[ti + 1 - ro] >> 8) + 1 << 6
    | (x < r          && key !== tiles[ti + 1     ] >> 8) + 1 << 8
    | (x < r && y < b && key !== tiles[ti + 1 + ro] >> 8) + 1 << 10
    | (         y < b && key !== tiles[ti     + ro] >> 8) + 1 << 12
    | (x > 0 && y < b && key !== tiles[ti - 1 + ro] >> 8) + 1 << 14
    const nodes = template.nodes
    const length = nodes.length
    let nodeIndex = 0
    for (let i = 0; i < length; i++) {
      const code = nodes[i].rule | neighbor
      if (Math.max(
        code       & 0b11,
        code >> 2  & 0b11,
        code >> 4  & 0b11,
        code >> 6  & 0b11,
        code >> 8  & 0b11,
        code >> 10 & 0b11,
        code >> 12 & 0b11,
        code >> 14 & 0b11,
      ) !== 0b11) {
        nodeIndex = i
        break
      }
    }
    const nTile = key << 8 | nodeIndex
    if (tiles[ti] !== nTile) {
      this.recordMapData(ti)
      tiles[ti] = nTile
    }
  }
}

// 设置地形
Scene.setTerrain = function (x, y) {
  const terrain = this.marquee.terrain
  const terrains = this.terrains
  const ro = terrains.rowOffset
  const pi = x + y * ro
  this.recordMapData(pi)
  terrains[pi] = terrain
}

// 创建图块集合
Scene.createTiles = function (width, height) {
  const tiles = new Uint32Array(width * height)
  tiles.width = width
  tiles.height = height
  tiles.rowOffset = width
  return tiles
}

// 克隆图块集合
Scene.cloneTiles = function (sTiles) {
  const dTiles = new Uint32Array(sTiles)
  dTiles.width = sTiles.width
  dTiles.height = sTiles.height
  dTiles.rowOffset = sTiles.rowOffset
  return dTiles
}

// 创建地形
Scene.createTerrains = function (width, height) {
  const terrains = new Uint8Array(width * height)
  terrains.rowOffset = width
  return terrains
}

// 获取新的图块组映射表索引
Scene.getNewTilesetIndex = function (tilesetMap) {
  for (let i = 1; i < 256; i++) {
    if (tilesetMap[i] === undefined) {
      return i
    }
  }
  return 0
}

// 请求更新动画
Scene.requestAnimation = function () {
  if (this.state === 'open' && this.showAnimation) {
    Timer.appendUpdater('stageAnimation', this.updateAnimation)
  }
}

// 更新动画帧
Scene.updateAnimation = function (deltaTime) {
  const {animationInterval} = Scene
  if (animationInterval > 0) {
    Scene.animationElapsed += deltaTime
    if (Scene.animationElapsed >= animationInterval) {
      Scene.animationElapsed -= animationInterval
      Scene.animationFrame += 1
    }
  }
  Scene.updateParallaxes(deltaTime)
  Scene.updateAnimations(deltaTime)
  Scene.updateParticles(deltaTime)
  if (Timer.updaters.stageRendering !== Scene.renderingFunction) {
    Scene.drawScene()
  }
}

// 停止更新动画
Scene.stopAnimation = function () {
  Timer.removeUpdater('stageAnimation', this.updateAnimation)
}

// 请求渲染
Scene.requestRendering = function () {
  if (this.state === 'open') {
    Timer.appendUpdater('stageRendering', this.renderingFunction)
  }
}

// 渲染函数
Scene.renderingFunction = function () {
  Scene.updateAnimations(0)
  Scene.drawScene()
}

// 停止渲染
Scene.stopRendering = function () {
  Timer.removeUpdater('stageRendering', this.renderingFunction)
}

// 切换图层
Scene.switchLayer = function IIFE() {
  const layerGroup = $('#scene-layer')
  const items = {tilemap: null}
  for (const item of layerGroup.children) {
    const layer = item.getAttribute('value')
    items[layer] = item
  }
  let selection = undefined
  return function (layer) {
    const element = items[layer]
    if (selection === element) {
      return
    }

    // 关闭瓦片地图
    if (selection === null) {
      this.closeTilemap(false)
      this.computeActiveTilemapId()
    }

    // 更新元素样式
    selection?.removeClass('selected')
    element?.addClass('selected')
    selection = element

    // 切换选框模式
    const marquee = this.marquee
    switch (this.layer = layer) {
      case 'object':
        marquee.switch('object')
        this.updateTargetInfo()
        break
      case 'tilemap':
        marquee.switch(this.brush === 'eraser' ? 'eraser' : 'tile')
        marquee.clear()
        break
      case 'terrain':
        marquee.switch(this.brush === 'eraser' ? 'eraser' : 'terrain')
        marquee.clear()
        break
    }
    marquee.resize()
    if (this.state === 'open') {
      Scene.requestRendering()
    }
  }
}()

// 切换笔刷
Scene.switchBrush = function IIFE() {
  const list = $('#scene-brush')
  const items = {}
  for (const item of list.children) {
    const brush = item.getAttribute('value')
    items[brush] = item
  }
  let selection = null
  return function (brush) {
    const element = items[brush]
    if (selection === element) {
      return
    }

    // 更新元素样式
    selection?.removeClass('selected')
    element.addClass('selected')
    selection = element

    // 切换选框模式
    const marquee = this.marquee
    switch (this.brush = brush) {
      case 'eraser':
        marquee.switch('eraser')
        break
      case 'pencil':
      case 'rect':
      case 'oval':
      case 'fill':
        marquee.switch(this.layer === 'terrain' ? 'terrain' : 'tile')
        break
    }
    marquee.clear()
    marquee.resize()
  }
}()

// 开关网格
Scene.switchGrid = function IIFE() {
  const item = $('#scene-switch-grid')
  return function (enabled = !this.showGrid) {
    if (enabled) {
      item.addClass('selected')
    } else {
      item.removeClass('selected')
    }
    this.showGrid = enabled
    this.requestRendering()
  }
}()

// 开关灯光
Scene.switchLight = function IIFE() {
  const item = $('#scene-switch-light')
  return function (enabled = !this.showLight) {
    if (enabled) {
      item.addClass('selected')
    } else {
      item.removeClass('selected')
    }
    this.showLight = enabled
    this.requestRendering()
  }
}()

// 开关动画
Scene.switchAnimation = function IIFE() {
  const item = $('#scene-switch-animation')
  return function (enabled = !this.showAnimation) {
    this.showAnimation = enabled
    if (enabled) {
      item.addClass('selected')
      this.requestAnimation()
    } else {
      item.removeClass('selected')
      this.stopAnimation()
      this.resetAnimations()
    }
    this.requestRendering()
  }
}()

// 开关设置
Scene.switchSettings = function () {
  if (!Inspector.fileScene.button.hasClass('selected')) {
    Inspector.open('fileScene', Scene.context.scene)
  } else {
    Inspector.close()
  }
}

// 切换地形
Scene.switchTerrain = function () {
  const context = (
    this.marquee.key === 'terrain'
  ? this.marquee
  : this.marquee.saveData.terrain
  )
  context.terrain = (context.terrain + 2) % 3
  if (this.brush === 'eraser') {
    this.switchBrush('pencil')
  }
  if (this.marquee.visible) {
    this.requestRendering()
  }
}

// 重置动画
Scene.resetAnimations = function () {
  if (this.state === 'open') {
    for (const {player} of this.actors) {
      player.clearParticles()
      player.restart()
    }
    for (const {player} of this.animations) {
      player.clearParticles()
      player.restart()
    }
    for (const {emitter} of this.particles) {
      emitter?.clear()
    }
  }
}

// 更新字体
Scene.updateFont = function () {
  const context = GL.context2d
  const size = window.devicePixelRatio * 12
  if (context.size !== size) {
    context.size = size
    context.font = `${size}px ${document.body.css().fontFamily}`
  }
}

// 计划保存场景
Scene.planToSave = function () {
  File.planToSave(this.meta)
  this.context.changed = true
}

// 计划保存地形
Scene.planToSaveTerrains = function () {
  this.context.scene.terrainChanged = true
}

// 创建作用域
namespace: {
let tilemap = null
let mapData = null
let changes = null
let states = null
let count = 0
let length = 0

// 开始地图数据记录
Scene.beginMapRecord = function () {
  switch (this.layer) {
    case 'tilemap':
      tilemap = this.tilemap
      mapData = tilemap.tiles
      break
    case 'terrain':
      tilemap = null
      mapData = this.terrains
      break
  }
  if (length < mapData.length) {
    length = mapData.length
    changes = new Uint32Array(length * 2)
    states = new Uint8Array(length)
  }
}

// 关闭地图数据记录
Scene.closeMapRecord = function () {
  if (mapData !== null) {
    tilemap = null
    mapData = null
    changes = null
    states = null
    count = 0
    length = 0
  }
}

// 保存地图数据记录
Scene.saveMapRecord = function () {
  if (count === 0) return
  if (tilemap) {
    tilemap.changed = true
    this.history.save({
      type: 'scene-tilemap-change',
      tilemap: tilemap,
      changes: changes.slice(0, count),
      tilesetMap: tilemap.tilesetMap,
    })
  } else {
    this.planToSaveTerrains()
    this.history.save({
      type: 'scene-terrain-change',
      terrains: mapData,
      changes: changes.slice(0, count),
    })
  }
  for (let i = 0; i < count; i += 2) {
    states[changes[i]] = 0
  }
  count = 0
}

// 记录地图数据
Scene.recordMapData = function (index) {
  if (states[index] === 0) {
    states[index] = 1
    changes[count    ] = index
    changes[count + 1] = mapData[index]
    count += 2
  }
}

// 恢复地图数据
Scene.restoreMapData = function () {
  for (let i = count - 2; i >= 0; i -= 2) {
    const index = changes[i]
    mapData[index] = changes[i + 1]
    states[index] = 0
  }
  count = 0
}

// 撤销地图数据
Scene.undoMapData = function (mapData, changes) {
  const length = changes.length
  for (let i = length - 1; i > 0; i -= 2) {
    const ti = changes[i - 1]
    const code = changes[i]
    changes[i] = mapData[ti]
    mapData[ti] = code
  }
}

// 重做地图数据
Scene.redoMapData = function (mapData, changes) {
  const length = changes.length
  for (let i = 1; i < length; i += 2) {
    const ti = changes[i - 1]
    const code = changes[i]
    changes[i] = mapData[ti]
    mapData[ti] = code
  }
}
}

// 创建历史操作对象
Scene.createHistory = function IIFE() {
  const onSave = data => {
    data.layer = Scene.tilemap ?? Scene.layer
  }
  const onRestore = data => {
    const {layer} = data
    switch (layer) {
      case 'object':
      case 'terrain':
        Scene.switchLayer(layer)
        break
      default:
        Scene.openTilemap(layer)
        break
    }
  }
  return function () {
    const history = new History(100)
    history.onSave = onSave
    history.onRestore = onRestore
    return history
  }
}()

// 创建默认动画播放器
Scene.createDefaultAnimation = function IIFE() {
  let DefaultPlayer
  let texture

  // 创建默认图像纹理
  File.get({
    local: 'Images/default_actor.png',
    type: 'image',
  }).then(image => {
    if (!image) return
    const width = image.naturalWidth
    const height = image.naturalHeight / 2
    image.guid = 'scene:default_actor'
    texture = new ImageTexture(image)
    texture.width = width
    texture.height = height
    texture.base.protected = true
  })

  // 返回函数
  return function (target) {
    // 初始化默认动画播放器类
    if (!DefaultPlayer) {
      const motion = Inspector.animMotion.create('ffffffffffffffff')
      const data = {mode: '1-dir', sprites: [], motions: [motion]}
      const layers = motion.dirCases[0].layers
      const layer = Inspector.animSpriteLayer.create()
      const frames = layer.frames
      layers.push(layer)
      frames[0].y = -8
      frames[0].scaleX = 0.25
      frames[0].scaleY = 0.25
      frames[1] = Object.clone(frames[0])
      frames[1].start = 1
      frames[1].end = 2
      frames[1].spriteY = 1
      DefaultPlayer = class DefaultPlayer extends Animation.Player {
        constructor(target) {
          super(data)
          this.target = target
          this.setMotion(motion.id)
        }

        setScale() {}

        getTexture() {
          return texture
        }

        update() {
          this.index = this.target === Scene.target ? 1 : 0
        }

        destroy() {}
      }
    }
    return new DefaultPlayer(target)
  }
}()

// 保存状态到配置文件
Scene.saveToConfig = function (config) {
  config.colors.sceneBackground = this.background.hex
}

// 从配置文件中加载状态
Scene.loadFromConfig = function (config) {
  this.background = new StageColor(
    config.colors.sceneBackground,
    () => this.requestRendering(),
  )
}

// 保存状态到项目文件
Scene.saveToProject = function (project) {
  const {scene} = project
  this.closeTilemap()
  scene.grid = this.showGrid ?? scene.grid
  scene.light = this.showLight ?? scene.light
  scene.animation = this.showAnimation ?? scene.animation
  scene.layer = this.layer ?? scene.layer
  scene.brush = this.brush ?? scene.brush
  scene.zoom = this.zoom ?? scene.zoom
}

// 从项目文件中加载状态
Scene.loadFromProject = function (project) {
  const {scene} = project
  this.switchGrid(scene.grid)
  this.switchLight(scene.light)
  this.switchAnimation(scene.animation)
  this.switchLayer(scene.layer)
  this.switchBrush(scene.brush)
  this.setZoom(scene.zoom)
}

// WebGL - 上下文恢复事件
Scene.webglRestored = function (event) {
  if (Scene.state === 'open') {
    Scene.requestRendering()
  }
}

// 窗口 - 调整大小事件
Scene.windowResize = function (event) {
  this.updateHead()
  if (this.state === 'open') {
    this.resize()
    this.requestRendering()
  }
}.bind(Scene)

// 主题改变事件
Scene.themechange = function (event) {
  this.requestRendering()
}.bind(Scene)

// 设备像素比改变事件
Scene.dprchange = function (event) {
  if (this.state === 'open') {
    this.updateFont()
  }
}.bind(Scene)

// 数据改变事件
Scene.datachange = function (event) {
  if (this.state === 'open') {
    switch (event.key) {
      case 'config':
        this.updateAnimationInterval()
        this.updateLightAreaExpansion(event.last.lightArea)
        break
      case 'teams':
        this.updateActorTeams()
        break
    }
  }
}.bind(Scene)

// 键盘按下事件
Scene.keydown = function (event) {
  if (Scene.state === 'open' &&
    Scene.dragging === null) {
    if (event.cmdOrCtrlKey) {
      return
    } else if (event.altKey) {
      switch (event.code) {
        case 'KeyS':
          Scene.switchSettings()
          break
      }
    } else {
      switch (event.code) {
        case 'Escape':
          Scene.closeTilemap()
          break
        case 'Backquote':
          Scene.layer !== 'object'
          ? Scene.switchLayer('object')
          : Scene.switchLayer('terrain')
          break
        case 'Digit1':
          Scene.openTilemap(Scene.tilemaps.shortcuts[1])
          break
        case 'Digit2':
          Scene.openTilemap(Scene.tilemaps.shortcuts[2])
          break
        case 'Digit3':
          Scene.openTilemap(Scene.tilemaps.shortcuts[3])
          break
        case 'Digit4':
          Scene.openTilemap(Scene.tilemaps.shortcuts[4])
          break
        case 'Digit5':
          Scene.openTilemap(Scene.tilemaps.shortcuts[5])
          break
        case 'Digit6':
          Scene.openTilemap(Scene.tilemaps.shortcuts[6])
          break
        case 'KeyQ':
          Scene.switchBrush('eraser')
          break
        case 'KeyE':
          Scene.switchBrush('pencil')
          break
        case 'KeyR':
          Scene.switchBrush('rect')
          break
        case 'KeyT':
          Scene.switchBrush('oval')
          break
        case 'KeyY':
          Scene.switchBrush('fill')
          break
      }
    }
  }
}

// 头部 - 指针按下事件
Scene.headPointerdown = function (event) {
  if (!(event.target instanceof HTMLInputElement)) {
    event.preventDefault()
    if (document.activeElement !== Scene.screen) {
      Scene.screen.focus()
    }
  }
}

// 开关 - 指针按下事件
Scene.switchPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'ITEM') {
        switch (element.getAttribute('value')) {
          case 'grid':
            return Scene.switchGrid()
          case 'light':
            return Scene.switchLight()
          case 'animation':
            return Scene.switchAnimation()
          case 'settings':
            return Scene.switchSettings()
        }
      }
      break
    }
  }
}

// 图层 - 指针按下事件
Scene.layerPointerdown = function (event) {
  switch (event.button) {
    case 0:
      if (!Scene.dragging) {
        const element = event.target
        if (element.tagName === 'ITEM' &&
          !element.hasClass('selected')) {
          const value = element.getAttribute('value')
          switch (value) {
            case 'object':
            case 'terrain':
              Scene.switchLayer(value)
              break
            default:
              Scene.openTilemap(Scene.tilemaps.shortcuts[value])
              break
          }
        }
      }
      break
  }
}

// 笔刷 - 指针按下事件
Scene.brushPointerdown = function (event) {
  switch (event.button) {
    case 0:
      if (!Scene.dragging) {
        const element = event.target
        if (element.tagName === 'ITEM' &&
          !element.hasClass('selected')) {
          Scene.switchBrush(element.getAttribute('value'))
        }
      }
      break
  }
}

// 缩放 - 获得焦点事件
Scene.zoomFocus = function (event) {
  Scene.screen.focus()
}

// 缩放 - 输入事件
Scene.zoomInput = function (event) {
  Scene.setZoom(this.read())
}

// 屏幕 - 键盘按下事件
Scene.screenKeydown = function (event) {
  if (this.state === 'open' && (
    this.dragging === null ||
    event.code === 'ShiftLeft')) {
    if (event.cmdOrCtrlKey) {
      switch (event.code) {
        case 'KeyX':
          this.copy()
          this.delete()
          break
        case 'KeyC':
          this.copy()
          break
        case 'KeyV':
          this.paste()
          break
        case 'KeyD':
          this.duplicate()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
          if (this.layer === 'object' && (
            this.target?.class === 'actor' ||
            this.target?.class === 'animation')) {
            let angle
            switch (event.code) {
              case 'ArrowLeft':  angle = 180 ; break
              case 'ArrowUp':    angle = 270 ; break
              case 'ArrowRight': angle = 0   ; break
              case 'ArrowDown':  angle = 90  ; break
            }
            this.redirectTarget(angle)
          }
          break
      }
    } else if (event.altKey) {
      return
    } else {
      switch (event.code) {
        case 'ShiftLeft':
          // 切换到初始图块帧
          if (!this.shiftKey) {
            this.shiftKey = true
            if (this.dragging) {
              switch (this.dragging.mode) {
                case 'pencil':
                case 'rect':
                case 'oval': {
                  const marquee = this.marquee
                  this.edit(marquee.x, marquee.y, marquee.width, marquee.height)
                  break
                }
                case 'object-move':
                  this.pointermove(this.dragging.latest)
                  break
              }
            }
            window.on('keyup', this.shiftKeyup)
          }
          break
        case 'Enter':
        case 'NumpadEnter':
          if (this.target) {
            this.listOpen({value: this.target})
          }
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
          if (this.layer === 'object') {
            event.preventDefault()
            const width = this.width
            const height = this.height
            const shift = this.shiftKey
            let offsetX = 0
            let offsetY = 0
            switch (event.code) {
              case 'ArrowLeft':  offsetX = shift ? -0.1 : -1; break
              case 'ArrowUp':    offsetY = shift ? -0.1 : -1; break
              case 'ArrowRight': offsetX = shift ? +0.1 : +1; break
              case 'ArrowDown':  offsetY = shift ? +0.1 : +1; break
            }
            switch (this.target?.class) {
              case 'actor': {
                const actor = this.target
                const size = actor.data?.size ?? 1
                const radius = Math.max(size, 1) / 2
                const x = Math.clamp(actor.x + offsetX, radius, width - radius)
                const y = Math.clamp(actor.y + offsetY, radius, height - radius)
                this.shiftTarget(Math.roundTo(x, 4), Math.roundTo(y, 4))
                break
              }
              case 'region': {
                const region = this.target
                const rwh = region.width / 2
                const rhh = region.height / 2
                const x = Math.clamp(region.x + offsetX, rwh, width - rwh)
                const y = Math.clamp(region.y + offsetY, rhh, height - rhh)
                this.shiftTarget(Math.roundTo(x, 4), Math.roundTo(y, 4))
                break
              }
              case 'tilemap':
              case 'light':
              case 'animation':
              case 'particle':
              case 'parallax': {
                const target = this.target
                const x = Math.clamp(target.x + offsetX, 0, width)
                const y = Math.clamp(target.y + offsetY, 0, height)
                this.shiftTarget(Math.roundTo(x, 4), Math.roundTo(y, 4))
                break
              }
            }
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
  }
}.bind(Scene)

// Shift键弹起事件
Scene.shiftKeyup = function (event) {
  if (!this.shiftKey) {
    return
  }
  switch (event?.code) {
    case 'ShiftLeft':
    case undefined:
      if (this.shiftKey) {
        this.shiftKey = false
        if (this.dragging) {
          switch (this.dragging.mode) {
            case 'pencil':
            case 'rect':
            case 'oval': {
              const marquee = this.marquee
              this.edit(marquee.x, marquee.y, marquee.width, marquee.height)
              break
            }
            case 'object-move':
              this.pointermove(this.dragging.latest)
              break
          }
        }
        window.off('keyup', this.shiftKeyup)
      }
      break
  }
}.bind(Scene)

// 位移键弹起事件
Scene.translationKeyup = function (event) {
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
}.bind(Scene)

// 屏幕 - 鼠标滚轮事件
Scene.screenWheel = function (event) {
  if (this.state === 'open' &&
    this.dragging === null) {
    event.preventDefault()
    if (event.deltaY !== 0) {
      const step = event.deltaY > 0 ? -1 : 1
      this.setZoom(this.zoom + step)
    }
  }
}.bind(Scene)

// 屏幕 - 用户滚动事件
Scene.screenUserscroll = function (event) {
  if (this.state === 'open') {
    this.screen.rawScrollLeft = this.screen.scrollLeft
    this.screen.rawScrollTop = this.screen.scrollTop
    this.updateTransform()
    this.requestRendering()
    this.marquee.resize()
    this.screen.updateScrollbars()
  }
}.bind(Scene)

// 屏幕 - 失去焦点事件
Scene.screenBlur = function (event) {
  this.shiftKeyup()
  this.translationKeyup()
  this.pointerup()
  // this.marqueePointerleave()
}.bind(Scene)

// 屏幕 - 拖拽进入事件
Scene.screenDragenter = function (event) {
  const file = Browser.body.activeFile
  switch (file?.type) {
    case 'actor':
    case 'animation':
    case 'particle':
      Scene.createPreviewObject(file)
      Scene.screenDragover.call(this, event)
  }
}

// 屏幕 - 拖拽离开事件
Scene.screenDragleave = function (event) {
  if (!this.contains(event.relatedTarget)) {
    Scene.deletePreviewObject()
  }
}

// 屏幕 - 拖拽悬停事件
Scene.screenDragover = function (event) {
  if (Scene.previewObject) {
    event.dataTransfer.dropEffect = 'move'
    event.preventDefault()
    const integer = !event.shiftKey
    const object = Scene.previewObject
    let {x, y} = Scene.getTileCoords(event, integer)
    if (integer) {
      x += 0.5
      y += 0.5
    }
    if (object.x !== x || object.y !== y) {
      object.x = x
      object.y = y
      Scene.requestRendering()
    }
  }
}

// 屏幕 - 拖拽施放事件
Scene.screenDrop = function (event) {
  if (Scene.previewObject) {
    const kind = Scene.previewObject.class
    const folder = Scene.getDefaultObjectFolder(kind)
    const fn = Scene.loadObjectContext
    Scene.loadObjectContext = Function.empty
    Scene.list.addNodeTo(Scene.previewObject, folder)
    Scene.loadObjectContext = fn
    Scene.previewObject = null
  }
}

// 选框 - 指针按下事件
Scene.marqueePointerdown = function (event) {
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
        this.marquee.clear()
        Cursor.open('cursor-grab')
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        return
      }
      const marquee = this.marquee
      switch (this.layer) {
        case 'tilemap':
        case 'terrain': {
          const {x, y} = this.getTileCoords(event, true)
          const context = this.tilemap ?? this
          const mx = x + marquee.offsetX
          const my = y + marquee.offsetY
          const mw = marquee.width
          const mh = marquee.height
          const sw = context.width
          const sh = context.height
          this.patternOriginX = mx
          this.patternOriginY = my
          this.beginMapRecord()
          switch (this.brush) {
            case 'eraser':
            case 'pencil':
              if (mx + mw > 0 && mx < sw && my + mh > 0 && my < sh) {
                this.dragging = event
                event.mode = this.brush
                event.pointerdownX = x
                event.pointerdownY = y
                window.on('pointerup', this.pointerup)
                window.on('pointermove', this.pointermove)
                marquee.selectInPencilMode(mx, my)
                this.edit(marquee.x, marquee.y, marquee.width, marquee.height)
              }
              break
            case 'rect':
            case 'oval':
              if (mx + mw > 0 && mx < sw && my + mh > 0 && my < sh) {
                const width = 1
                const height = 1
                this.dragging = event
                event.mode = this.brush
                event.pointerdownX = x
                event.pointerdownY = y
                window.on('pointerup', this.pointerup)
                window.on('pointermove', this.pointermove)
                marquee.save()
                marquee.selectInRectMode(x, y, width, height)
                this.edit(marquee.x, marquee.y, marquee.width, marquee.height)
              }
              break
            case 'fill':
              if (x >= 0 && x < sw && y >= 0 && y < sh) {
                marquee.selectInPencilMode(mx, my)
                this.edit(x, y)
                this.saveMapRecord()
              }
              break
          }
          break
        }
        case 'object': {
          const {x, y} = this.getTileCoords(event)
          let object
          if (event.cmdOrCtrlKey) {
            switch (this.target?.class) {
              case 'tilemap':
              case 'actor':
              case 'region':
              case 'light':
              case 'animation':
              case 'particle':
              case 'parallax':
                object = this.target
                break
            }
          }
          if (object === undefined) {
            object = this.selectObject(x, y)
          }
          if (object) {
            this.dragging = event
            event.mode = 'object-move'
            event.enabled = false
            event.latest = event
            event.startX = object.x
            event.startY = object.y
            event.pointerdownX = x
            event.pointerdownY = y
            window.on('pointerup', this.pointerup)
            window.on('pointermove', this.pointermove)
            this.screen.addScrollListener('both', this.scale / 2, false, () => {
              this.screen.beginScrolling()
              this.screen.rawScrollLeft = this.screen.scrollLeft
              this.screen.rawScrollTop = this.screen.scrollTop
              this.updateTransform()
              this.requestRendering()
              this.screen.updateScrollbars()
              this.pointermove(event.latest)
            })
          }
          this.setTarget(object)
          break
        }
      }
      break
    }
    case 1:
    case 4:
      this.dragging = event
      event.mode = 'scroll'
      event.scrollLeft = this.screen.scrollLeft
      event.scrollTop = this.screen.scrollTop
      this.marquee.clear()
      Cursor.open('cursor-grab')
      window.on('pointerup', this.pointerup)
      window.on('pointermove', this.pointermove)
      break
    case 2: {
      const marquee = this.marquee
      switch (this.layer) {
        case 'object':
          this.dragging = event
          event.mode = 'ready-to-scroll'
          event.scrollLeft = this.screen.scrollLeft
          event.scrollTop = this.screen.scrollTop
          window.on('pointerup', this.pointerup)
          window.on('pointermove', this.pointermove)
          break
        case 'tilemap': {
          const {x, y} = this.getTileCoords(event, true)
          const context = this.tilemap ?? this
          const sw = context.width
          const sh = context.height
          if (x >= 0 && x < sw && y >= 0 && y < sh) {
            if (this.brush === 'eraser') {
              this.switchBrush('pencil')
            }
            this.dragging = event
            event.mode = 'copy'
            event.pointerdownX = x
            event.pointerdownY = y
            window.on('pointerup', this.pointerup)
            window.on('pointermove', this.pointermove)
            marquee.selectInCopyMode(x, y, 1, 1)
          }
          break
        }
        case 'terrain':
          this.switchTerrain()
          break
      }
      break
    }
    case 3:
      switch (this.layer) {
        case 'tilemap':
          Palette.flipTiles()
          break
      }
      break
  }
}.bind(Scene)

// 选框 - 指针移动事件
Scene.marqueePointermove = function (event) {
  const marquee = this.marquee
  if (!this.dragging) {
    marquee.pointerevent = event
    switch (this.layer) {
      case 'tilemap':
      case 'terrain': {
        const {x, y} = this.getTileCoords(event, true)
        const context = this.tilemap ?? this
        const mx = x + marquee.offsetX
        const my = y + marquee.offsetY
        const mw = marquee.width
        const mh = marquee.height
        const sw = context.width
        const sh = context.height
        if (mx + mw > 0 && mx < sw && my + mh > 0 && my < sh) {
          if (mx !== marquee.x || my !== marquee.y || !marquee.visible) {
            marquee.selectInPencilMode(mx, my)
          }
        } else {
          marquee.clear()
        }
        break
      }
      case 'object':
        if (!this.target) {
          const {x, y} = this.getTileCoords(event, true)
          const sw = this.width
          const sh = this.height
          if (x >= 0 && x < sw && y >= 0 && y < sh) {
            if (x !== marquee.x || y !== marquee.y || !marquee.visible) {
              marquee.selectInObjectMode(x, y)
            }
          } else {
            marquee.clear()
          }
        }
        break
    }
  }
}.bind(Scene)

// 选框 - 指针离开事件
Scene.marqueePointerleave = function (event) {
  if (this.marquee.pointerevent !== null) {
    this.marquee.pointerevent = null
    if (!this.dragging && !(
      this.layer === 'object' &&
      this.target !== null)) {
      this.marquee.clear()
    }
  }
}.bind(Scene)

// 选框 - 鼠标双击事件
Scene.marqueeDoubleclick = function (event) {
  switch (this.layer) {
    case 'object':
      if (!this.target) return
      switch (this.target.class) {
        case 'tilemap':
          this.screenBlur()
          this.openTilemap(this.target)
          break
        default:
          this.screenBlur()
          this.revealTarget()
          break
      }
      break
    case 'tilemap': {
      const {x, y} = this.getTileCoords(event)
      const {width, height} = this.getGridContext()
      if (x < 0 || y < 0 || x >= width || y >= height) {
        this.screenBlur()
        this.closeTilemap()
      }
      break
    }
  }
}.bind(Scene)

// 指针弹起事件
Scene.pointerup = function (event) {
  const {dragging} = this
  if (dragging === null) {
    return
  }
  if (event === undefined) {
    event = dragging
  }
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'eraser':
      case 'pencil': {
        const marquee = this.marquee
        if (marquee.pointerevent === null) {
          marquee.clear()
        }
        this.saveMapRecord()
        break
      }
      case 'rect':
      case 'oval': {
        const marquee = this.marquee
        if (marquee.pointerevent === null) {
          marquee.clear()
        }
        marquee.restore()
        if (marquee.pointerevent !== null) {
          const coords = this.getTileCoords(event, true)
          const x = coords.x + marquee.offsetX
          const y = coords.y + marquee.offsetY
          marquee.selectInPencilMode(x, y)
        }
        this.saveMapRecord()
        break
      }
      case 'copy': {
        const marquee = this.marquee
        const coords = this.getTileCoords(event, true)
        const context = this.tilemap ?? this
        const x = Math.clamp(coords.x, 0, context.width - 1)
        const y = Math.clamp(coords.y, 0, context.height - 1)
        marquee.offsetX = marquee.x - x
        marquee.offsetY = marquee.y - y
        if (marquee.pointerevent !== null) {
          marquee.selectInPencilMode()
        } else {
          marquee.clear()
        }
        Palette.copyTilesFromScene(marquee.x, marquee.y, marquee.width, marquee.height)
        break
      }
      case 'object-move':
        this.screen.endScrolling()
        this.screen.removeScrollListener()
        break
      case 'ready-to-scroll':
        if (event.target === this.marquee) {
          const {x, y} = this.getTileCoords(event)
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
}.bind(Scene)

// 指针移动事件
Scene.pointermove = function (event) {
  const {dragging, marquee} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'eraser':
      case 'pencil': {
        const mw = marquee.width
        const mh = marquee.height
        const ox = marquee.offsetX
        const oy = marquee.offsetY
        const coords = this.getTileCoords(event, true)
        const context = this.tilemap ?? this
        const x = Math.clamp(coords.x, 1 - ox - mw, context.width - 1 - ox)
        const y = Math.clamp(coords.y, 1 - oy - mh, context.height - 1 - oy)
        const mx = x + ox
        const my = y + oy
        if (mx !== marquee.x || my !== marquee.y) {
          const gapX = Math.abs(mx - marquee.x)
          const gapY = Math.abs(my - marquee.y)

          // 绘制补间图块
          if (gapX > 1 && mw < 9 || gapY > 1 && mh < 9) {
            const length = Math.max(gapX, gapY)
            const actorOffsetX = (mx - marquee.x) / length
            const actorOffsetY = (my - marquee.y) / length
            for (let i = 1; i < length; i++) {
              const mx = marquee.x + Math.round(i * actorOffsetX)
              const my = marquee.y + Math.round(i * actorOffsetY)
              this.edit(mx, my, mw, mh)
            }
          }
          marquee.selectInPencilMode(mx, my)
          this.edit(mx, my, mw, mh)
        }
        break
      }
      case 'rect':
      case 'oval': {
        const coords = this.getTileCoords(event, true)
        const mx = Math.min(coords.x, dragging.pointerdownX)
        const my = Math.min(coords.y, dragging.pointerdownY)
        const mw = Math.abs(coords.x - dragging.pointerdownX) + 1
        const mh = Math.abs(coords.y - dragging.pointerdownY) + 1
        if (mx !== marquee.x || my !== marquee.y || mw !== marquee.width || mh !== marquee.height) {
          marquee.selectInRectMode(mx, my, mw, mh)
          this.edit(mx, my, mw, mh)
        }
        break
      }
      case 'copy': {
        const coords = this.getTileCoords(event, true)
        const context = this.tilemap ?? this
        const x = Math.clamp(coords.x, 0, context.width - 1)
        const y = Math.clamp(coords.y, 0, context.height - 1)
        const mx = Math.min(x, dragging.pointerdownX)
        const my = Math.min(y, dragging.pointerdownY)
        const mw = Math.abs(x - dragging.pointerdownX) + 1
        const mh = Math.abs(y - dragging.pointerdownY) + 1
        if (mx !== marquee.x || my !== marquee.y || mw !== marquee.width || mh !== marquee.height) {
          this.marquee.selectInCopyMode(mx, my, mw, mh)
        }
        break
      }
      case 'object-move': {
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
        dragging.latest = event
        const width = this.width
        const height = this.height
        const coords = this.getTileCoords(event)
        let x
        let y
        const divider = event.cmdOrCtrlKey ? 2 : 1
        switch (this.target?.class) {
          case 'actor': {
            const actor = this.target
            const size = actor.data?.size ?? 1
            const radius = Math.max(size, 1) / 2
            if (this.shiftKey) {
              x = dragging.startX - dragging.pointerdownX + coords.x
              y = dragging.startY - dragging.pointerdownY + coords.y
              x = Math.roundTo(Math.clamp(x, radius, width - radius), 4)
              y = Math.roundTo(Math.clamp(y, radius, height - radius), 4)
            } else {
              x = dragging.startX
                - Math.floor(dragging.pointerdownX * divider) / divider
                + Math.floor(coords.x * divider) / divider
              y = dragging.startY
                - Math.floor(dragging.pointerdownY * divider) / divider
                + Math.floor(coords.y * divider) / divider
              x = Math.clamp(x, radius, width - radius)
              y = Math.clamp(y, radius, height - radius)
            }
            this.shiftTarget(x, y)
            break
          }
          case 'region': {
            const region = this.target
            const rwh = region.width / 2
            const rhh = region.height / 2
            if (this.shiftKey) {
              x = dragging.startX - dragging.pointerdownX + coords.x
              y = dragging.startY - dragging.pointerdownY + coords.y
              x = Math.roundTo(Math.clamp(x, rwh, width - rwh), 4)
              y = Math.roundTo(Math.clamp(y, rhh, height - rhh), 4)
            } else {
              x = dragging.startX
                - Math.floor(dragging.pointerdownX * divider) / divider
                + Math.floor(coords.x * divider) / divider
              y = dragging.startY
                - Math.floor(dragging.pointerdownY * divider) / divider
                + Math.floor(coords.y * divider) / divider
              x = Math.clamp(x, rwh, width - rwh)
              y = Math.clamp(y, rhh, height - rhh)
            }
            this.shiftTarget(x, y)
            break
          }
          case 'tilemap':
          case 'light':
          case 'animation':
          case 'particle':
          case 'parallax':
            if (this.shiftKey) {
              x = dragging.startX - dragging.pointerdownX + coords.x
              y = dragging.startY - dragging.pointerdownY + coords.y
              x = Math.roundTo(Math.clamp(x, 0, width), 4)
              y = Math.roundTo(Math.clamp(y, 0, height), 4)
            } else {
              x = dragging.startX
                - Math.floor(dragging.pointerdownX * divider) / divider
                + Math.floor(coords.x * divider) / divider
              y = dragging.startY
                - Math.floor(dragging.pointerdownY * divider) / divider
                + Math.floor(coords.y * divider) / divider
              x = Math.clamp(x, 0, width)
              y = Math.clamp(y, 0, height)
            }
            this.shiftTarget(x, y)
            break
        }
        break
      }
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
}.bind(Scene)

// 菜单 - 弹出事件
Scene.menuPopup = function (event) {
  const {x, y} = this.getTileCoords(event, true)
  const isInScene = (
    x >= 0 && x < this.width &&
    y >= 0 && y < this.height
  )
  if (this.target || isInScene) {
    this.translationKeyup()
    const target = this.target
    const selected = !!target
    const pastable = Clipboard.has('yami.scene.object')
    const get = Local.createGetter('menuScene')
    const menuItems = [{
      label: get('create'),
      enabled: isInScene,
      submenu: [{
        label: get('create.actor'),
        click: () => {
          this.create('actor', x + 0.5, y + 0.5)
        },
      }, {
        label: get('create.region'),
        click: () => {
          this.create('region', x + 0.5, y + 0.5)
        },
      }, {
        label: get('create.light'),
        click: () => {
          this.create('light', x + 0.5, y + 0.5)
        },
      }, {
        label: get('create.animation'),
        click: () => {
          this.create('animation', x + 0.5, y + 0.5)
        },
      }, {
        label: get('create.particle'),
        click: () => {
          this.create('particle', x + 0.5, y + 0.5)
        },
      }, {
        label: get('create.parallax'),
        click: () => {
          this.create('parallax', x, y)
        },
      }, {
        label: get('create.tilemap'),
        click: () => {
          this.create('tilemap', x, y)
        },
      }],
    }, {
      label: get('toggle'),
      accelerator: '/',
      enabled: selected,
      click: () => {
        this.toggle()
      }
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
    }, {
      type: 'separator',
    }]
    switch (target?.class) {
      case 'actor':
      case 'animation': {
        // 添加编辑动画选项
        const id = target.animationId ?? target.data?.animationId
        const meta = Data.manifest.guidMap[id]
        menuItems.push({
          label: get('editAnimation'),
          enabled: !!meta,
          click: () => {
            const animFile = Directory.getFile(meta.path)
            if (animFile) {
              Title.openTab(animFile)
            }
          }
        })
        break
      }
      case 'particle': {
        // 添加编辑粒子选项
        const id = target.particleId
        const meta = Data.manifest.guidMap[id]
        menuItems.push({
          label: get('editParticle'),
          enabled: !!meta,
          click: () => {
            const particleFile = Directory.getFile(meta.path)
            if (particleFile) {
              Title.openTab(particleFile)
            }
          }
        })
        break
      }
    }
    const {startPosition} = Data.config
    if (startPosition.sceneId === this.meta.guid &&
      Math.floor(startPosition.x) === x &&
      Math.floor(startPosition.y) === y) {
      // 添加重置初始位置选项
      menuItems.push({
        label: get('resetStartPosition'),
        click: () => {
          startPosition.sceneId = ''
          startPosition.x = 0
          startPosition.y = 0
          this.requestRendering()
          File.planToSave(Data.manifest.project.config)
        },
      })
    } else {
      // 添加设置初始位置选项
      menuItems.push({
        label: get('setStartPosition'),
        click: () => {
          const {startPosition} = Data.config
          startPosition.sceneId = this.meta.guid
          startPosition.x = x + 0.5
          startPosition.y = y + 0.5
          this.requestRendering()
          File.planToSave(Data.manifest.project.config)
        },
      })
    }
    Menu.popup({
      x: event.clientX,
      y: event.clientY,
    }, menuItems)
  }
}

// 搜索框 - 输入事件
Scene.searcherInput = function (event) {
  if (event.inputType !== 'insertCompositionText') {
    const text = this.input.value
    Scene.list.searchNodes(text)
  }
}

// 列表 - 键盘按下事件
Scene.listKeydown = function (event) {
  if (!this.data) {
    return
  }
  const item = this.read()
  const isFile = item && item.class !== 'folder'
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyX':
        if (isFile) {
          this.copy(item)
          this.delete(item)
        }
        break
      case 'KeyC':
        if (isFile) {
          this.copy(item)
        }
        break
      case 'KeyV':
        this.paste('auto')
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
        Scene.setTarget(null)
        break
    }
  }
}

// 列表 - 指针按下事件
Scene.listPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      switch (element.tagName) {
        case 'VISIBILITY-ICON': {
          const {item} = element.parentNode
          if (!this.canSwitchState(item)) {
            return
          }
          const {hidden} = item
          const backups = this.setRecursiveStates(item, 'hidden', !hidden)
          this.updateFolderState(item.parent, 'hidden')
          this.update()
          this.dispatchChangeEvent()
          Scene.requestRendering()
          Scene.history.save({
            type: 'scene-object-hidden',
            item: item,
            oldValues: backups,
            newValue: !hidden,
          })
          break
        }
        case 'LOCK-ICON': {
          const {item} = element.parentNode
          if (!this.canSwitchState(item)) {
            return
          }
          const {locked} = item
          const backups = this.setRecursiveStates(item, 'locked', !locked)
          this.updateFolderState(item.parent, 'locked')
          this.update()
          this.dispatchChangeEvent()
          Scene.history.save({
            type: 'scene-object-locked',
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
Scene.listSelect = function (event) {
  const item = event.value
  switch (item.class) {
    case 'folder':
      Scene.setTarget(null)
      break
    case 'tilemap':
      // 正在编辑图块时直接打开瓦片地图
      // 图块组关闭时打开瓦片地图检查器
      if (Scene.tilemap) {
        if (Palette.state === 'closed') {
          Scene.setTarget(item)
        }
        Scene.openTilemap(item)
      } else {
        Scene.setTarget(item)
      }
      break
    default:
      Scene.setTarget(item)
      break
  }
}

// 列表 - 记录事件
Scene.listRecord = function (event) {
  const response = event.value
  switch (response.type) {
    case 'rename':
      Scene.listRename(response)
      break
    case 'create': {
      let parent = response.dItem
      if (parent.class !== 'folder') {
        parent = parent.parent ?? parent
      }
      this.updateFolderState(parent, 'hidden')
      this.updateFolderState(parent, 'locked')
      Scene.history.save({
        type: 'scene-object-create',
        response: response,
        parent: parent,
      })
      break
    }
    case 'delete': {
      const parent = response.item.parent
      this.updateFolderState(parent, 'hidden')
      this.updateFolderState(parent, 'locked')
      Scene.history.save({
        type: 'scene-object-delete',
        response: response,
      })
      break
    }
    case 'remove': {
      const sParent = response.source.parent
      const dParent = response.destination.parent
      this.updateFolderState(sParent, 'hidden')
      this.updateFolderState(sParent, 'locked')
      if (sParent !== dParent) {
        this.updateFolderState(dParent, 'hidden')
        this.updateFolderState(dParent, 'locked')
      }
      Scene.history.save({
        type: 'scene-object-remove',
        response: response,
      })
      break
    }
  }
}

// 列表 - 菜单弹出事件
Scene.listPopup = function (event) {
  const item = event.value
  const menuItems = []
  const get = Local.createGetter('menuSceneList')
  let copyable
  let pastable
  let deletable
  let renamable
  if (item) {
    switch (item.class) {
      case 'folder':
        copyable = false
        break
      case 'tilemap':
        copyable = true
        menuItems.push({
          label: get('edit'),
          accelerator: 'Enter',
          click: () => {
            Scene.openTilemap(item)
          },
        }, {
          label: get('shift'),
          enabled: item.tiles.length !== 0,
          click: () => {
            SceneShift.open((x, y) => {
              Scene.history.save({
                type: 'scene-tilemap-shift',
                tilemap: item,
                shiftX: x,
                shiftY: y,
              })
              Scene.shiftTilemap(item, x, y)
              Scene.planToSave()
            })
          },
        }, {
          label: get('reveal'),
          click: () => {
            Scene.revealTarget()
          },
        }, {
          label: get('shortcut'),
          submenu: this.createTilemapShortcutItems(item),
        })
        break
      case 'actor':
      case 'region':
      case 'light':
      case 'animation':
      case 'particle':
      case 'parallax':
        copyable = true
        menuItems.push({
          label: get('reveal'),
          accelerator: 'Enter',
          click: () => {
            Scene.revealTarget()
          },
        })
        break
    }
    pastable = Clipboard.has('yami.scene.object')
    deletable = true
    renamable = true
  } else {
    copyable = false
    pastable = Clipboard.has('yami.scene.object')
    deletable = false
    renamable = false
  }
  menuItems.push({
    label: get('create'),
    submenu: [{
      label: get('create.folder'),
      click: () => {
        this.addNodeTo(this.createFolder(), item)
      },
    }, {
      label: get('create.actor'),
      click: () => {
        this.addNodeTo(Inspector.sceneActor.create(), item)
      },
    }, {
      label: get('create.region'),
      click: () => {
        this.addNodeTo(Inspector.sceneRegion.create(), item)
      },
    }, {
      label: get('create.light'),
      click: () => {
        this.addNodeTo(Inspector.sceneLight.create(), item)
      },
    }, {
      label: get('create.animation'),
      click: () => {
        this.addNodeTo(Inspector.sceneAnimation.create(), item)
      },
    }, {
      label: get('create.particle'),
      click: () => {
        this.addNodeTo(Inspector.sceneParticle.create(), item)
      },
    }, {
      label: get('create.parallax'),
      click: () => {
        this.addNodeTo(Inspector.sceneParallax.create(), item)
      },
    }, {
      label: get('create.tilemap'),
      click: () => {
        // 关闭图块组检查器
        Inspector.fileTileset.close()
        this.addNodeTo(Inspector.sceneTilemap.create(Scene.width, Scene.height), item)
      },
    }],
  }, {
    label: get('toggle'),
    accelerator: '/',
    enabled: copyable,
    click: () => {
      this.toggle(item)
    }
  }, {
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
    enabled: !!item,
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
  if (!item) {
    menuItems.push({
      type: 'separator',
    }, {
      label: get('shiftAll'),
      click: () => {
        SceneShift.open((x, y) => {
          const changes = Scene.computeObjectShifting(x, y)
          Scene.history.save({
            type: 'scene-shift',
            shiftX: x,
            shiftY: y,
            changes: changes,
          })
          Scene.shiftTerrains(x, y)
          Scene.shiftObjects(changes)
          Scene.planToSave()
        })
      },
    }, {
      label: get('settings'),
      click: () => {
        ObjectFolder.open()
      },
    })
  }
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, menuItems)
}

// 列表 - 打开事件
Scene.listOpen = function (event) {
  const item = event.value
  switch (item.class) {
    case 'tilemap':
      Scene.openTilemap(item)
      break
    case 'actor':
    case 'region':
    case 'light':
    case 'animation':
    case 'particle':
    case 'parallax':
      Scene.revealTarget()
      break
  }
}

// 列表 - 重命名事件
Scene.listRename = function (response) {
  const target = response.item
  switch (target.class) {
    case 'folder':
      Scene.history.save({
        type: 'scene-folder-rename',
        response: response,
      })
      break
    default: {
      const map = Scene.inspectorTypeMap
      const key = map[target.class]
      const editor = Inspector[key]
      const input = editor.nameBox
      const {oldValue, newValue} = response
      input.write(newValue)
      Scene.updateTargetInfo()
      Scene.requestRendering()
      Scene.history.save({
        type: 'inspector-change',
        editor: editor,
        target: target,
        changes: [{
          input,
          oldValue,
          newValue,
        }],
      })
      break
    }
  }
}

// 列表 - 改变事件
Scene.listChange = function (event) {
  Scene.planToSave()
}

// 列表页面 - 调整大小事件
Scene.listPageResize = function (event) {
  Scene.list.updateHead()
  Scene.list.resize()
}

// 选框 - 保存状态
Scene.marquee.save = function (key = 'default') {
  let data
  switch (key) {
    case 'object':
      data = {}
      break
    case 'tile':
      data = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        tiles: this.tiles,
      }
      break
    case 'terrain':
      data = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        terrain: this.terrain,
      }
      break
    case 'eraser':
      data = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        tiles: this.tiles,
        terrain: 0b00,
      }
      break
    default:
      data = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
      }
      break
  }
  this.saveData[key] = data
}

// 选框 - 切换状态
Scene.marquee.switch = function (key) {
  if (this.key !== key) {
    this.save(this.key)
    this.restore(this.key = key)
  }
}

// 选框 - 调整位置
Scene.marquee.resize = function () {
  if (this.pointerevent !== null) {
    Scene.marqueePointermove(this.pointerevent)
  }
}

// 选框 - 擦除矩形
Scene.marquee.clear = function () {
  if (this.visible) {
    this.visible = false
    Scene.requestRendering()
  }
  if (Scene.info.textContent && !(
    Scene.layer === 'object' &&
    Scene.target !== null)) {
    Scene.info.textContent = ''
  }
}

// 选框 - 选取矩形
Scene.marquee.select = function (x = this.x, y = this.y, width = this.width, height = this.height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.visible = true
  Scene.requestRendering()
}

// 选框 - 选取矩形: 橡皮, 铅笔, 填充模式
Scene.marquee.selectInPencilMode = function (x, y, width, height) {
  this.backgroundColor = this.backgroundColorNormal
  this.borderColor = this.borderColorNormal
  this.previewTiles = true
  this.select(x, y, width, height)
  const left = this.x - this.offsetX
  const top = this.y - this.offsetY
  Scene.info.textContent = `${left},${top}`
}

// 选框 - 选取矩形: 矩形, 椭圆模式
Scene.marquee.selectInRectMode = function (x, y, width, height) {
  this.backgroundColor = this.backgroundColorRect
  this.borderColor = this.borderColorRect
  this.previewTiles = false
  this.select(x, y, width, height)
  Scene.info.textContent = `${this.width} x ${this.height}`
}

// 选框 - 选取矩形: 复制模式
Scene.marquee.selectInCopyMode = function (x, y, width, height) {
  this.backgroundColor = this.backgroundColorCopy
  this.borderColor = this.borderColorCopy
  this.previewTiles = false
  this.select(x, y, width, height)
  Scene.info.textContent = `${this.width} x ${this.height}`
}

// 选框 - 选取矩形: 对象模式
Scene.marquee.selectInObjectMode = function (x, y) {
  Scene.info.textContent = `${x},${y}`
}

// 选框 - 获取图块数据
Scene.marquee.getTiles = function (raw) {
  const sTiles = this.tiles
  if (raw) return sTiles
  let dTiles = sTiles.standard
  if (dTiles === undefined) {
    dTiles = sTiles
    const tilesetMap = this.tilesetMap
    const tilesets = Data.tilesets
    const length = sTiles.length
    for (let i = 0; i < length; i++) {
      let tile = sTiles[i]
      if (tile === 0) continue
      const guid = tilesetMap[tile >> 24]
      const tileset = tilesets[guid]
      if (tileset?.type === 'auto') {
        if (dTiles === sTiles) {
          dTiles = Scene.cloneTiles(sTiles)
        }
        dTiles[i] = tile & 0xffffffc0
      }
    }
    sTiles.standard = dTiles
  }
  return dTiles
}

// 列表 - 复制
Scene.list.copy = function (item) {
  if (item) {
    switch (item.class) {
      case 'tilemap':
        Codec.encodeTilemap(item)
        break
    }
    Clipboard.write('yami.scene.object', item)
  }
}

// 列表 - 粘贴
Scene.list.paste = function (dItem, callback) {
  const copy = Clipboard.read('yami.scene.object')
  if (copy && this.data) {
    switch (copy.class) {
      case 'tilemap':
        Codec.decodeTilemap(copy)
        copy.shortcut = 0
        break
    }
    if (dItem === 'auto') {
      const folders = Editor.project.scene.defaultFolders
      const name = folders[copy.class]
      dItem = !name ? null
      : this.getItemByProperties({
        class: 'folder',
        name: name,
      })
    }
    callback?.(copy)
    this.addNodeTo(copy, dItem)
    Scene.requestRendering()
  }
}

// 列表 - 创建副本
Scene.list.duplicate = function (item) {
  let copy
  switch (item.class) {
    case 'tilemap':
      Codec.encodeTilemap(item)
      copy = Object.clone(item)
      Codec.decodeTilemap(copy)
      copy.shortcut = 0
      break
    default:
      copy = Object.clone(item)
      break
  }
  copy.name = this.generateUniqueName(item)
  const index = item.parent.children.indexOf(item)
  const next = item.parent.children[index + 1]
  if (next) {
    this.addNodeTo(copy, next, true)
  } else {
    this.addNodeTo(copy, item.parent)
  }
}

// 列表 - 删除
Scene.list.delete = function (item) {
  if (item) {
    this.deleteNode(item)
  }
}

// 列表 - 开关对象
Scene.list.toggle = function (item) {
  if (item && 'enabled' in item) {
    Scene.history.save({
      type: 'scene-object-toggle',
      item: item,
      oldValue: item.enabled,
      newValue: !item.enabled,
    })
    item.enabled = !item.enabled
    this.updateConditionIcon(item)
    this.dispatchChangeEvent()
    Scene.requestRendering()
  }
}

// 列表 - 取消搜索
Scene.list.cancelSearch = function () {
  if (this.display === 'search') {
    const active = document.activeElement
    Scene.searcher.deleteInputContent()
    this.expandToSelection()
    this.scrollToSelection()
    active.focus()
  }
}

// 列表 - 创建文件夹
Scene.list.createFolder = function () {
  return {
    class: 'folder',
    name: 'New Folder',
    expanded: false,
    hidden: true,
    locked: true,
    children: [],
  }
}

// 列表 - 创建瓦片地图快捷方式菜单选项
Scene.list.createTilemapShortcutItems = function (tilemap) {
  const {shortcuts} = Scene.tilemaps
  const {shortcut} = tilemap
  const menuItems = []
  for (let i = 0; i < 7; i++) {
    const target = shortcuts[i]
    const checked = shortcut === i
    const click = () => {
      if (shortcut !== i) {
        tilemap.shortcut = i
        shortcuts.update()
        Scene.planToSave()
        Scene.history.save({
          type: 'scene-tilemap-shortcut',
          tilemap: tilemap,
          shortcut: shortcut,
        })
      }
    }
    if (i === 0) {
      menuItems.push({
        label: Local.get('menuSceneList.shortcut.none'),
        checked: checked,
        click: click,
      })
    } else {
      menuItems.push({
        label: `${i}: ${target?.name ?? ''}`,
        enabled: !target || checked,
        checked: checked,
        click: click,
      })
    }
  }
  return menuItems
}

// 列表 - 恢复递归状态
Scene.list.restoreRecursiveStates = function IIFE() {
  const restore = (node, key, states, index) => {
    if (node[key] !== undefined) {
      node[key] = states[index++]
    }
    // 兼容动画图层列表
    const children = node.children
    if (children !== undefined) {
      const length = children.length
      for (let i = 0; i < length; i++) {
        index = restore(children[i], key, states, index)
      }
    }
    return index
  }
  return function (item, key, states) {
    return restore(item, key, states, 0)
  }
}()

// 列表 - 设置递归状态
Scene.list.setRecursiveStates = function IIFE() {
  const set = (node, key, state, backups) => {
    if (node[key] !== undefined) {
      backups.push(node[key])
      node[key] = state
    }
    // 兼容动画图层列表
    const children = node.children
    if (children !== undefined) {
      const length = children.length
      for (let i = 0; i < length; i++) {
        set(children[i], key, state, backups)
      }
    }
    return backups
  }
  return function (item, key, state) {
    return set(item, key, state, [])
  }
}()

// 列表 - 更新项目类名
Scene.list.updateItemClass = function (item) {
  if (item.class !== 'folder') {
    item.element.addClass('reference')
  } else {
    item.element.removeClass('reference')
  }
}

// 列表 - 更新文件夹状态
Scene.list.updateFolderState = function IIFE() {
  let key
  const list = Scene.list
  const check = item => {
    if (item.class === 'folder') {
      update(item)
    }
  }
  const toggle = folder => {
    folder[key] = !folder[key]
    // 撤销重做时无法控制列表的更新顺序
    // 所以在这里手动刷新元素图标
    switch (key) {
      case 'hidden':
        list.updateVisibilityIcon(folder)
        break
      case 'locked':
        list.updateLockIcon(folder)
        break
    }
    check(folder.parent)
  }
  const update = folder => {
    const items = folder.children
    const state = folder[key]
    if (state) {
      for (const item of items) {
        if (item[key] === false) {
          toggle(folder)
          return
        }
      }
    } else {
      for (const item of items) {
        if (item[key] === false) {
          return
        }
      }
      toggle(folder)
    }
  }
  return function (item, iKey) {
    key = iKey
    return check(item)
  }
}()

// 列表 - 判断是否可以开关状态
// 因为可视和锁定状态自动更新导致了历史操作可能无法正确还原
// 锁死不包含场景对象的文件夹是为了保证撤消重做结果的正确性
Scene.list.canSwitchState = function IIFE() {
  const check = item => {
    if (item.class === 'folder') {
      for (const child of item.children) {
        if (check(child)) return true
      }
      return false
    }
    return true
  }
  return function (item) {
    return check(item)
  }
}()

// 列表 - 重写创建图标方法
Scene.list.createIcon = function IIFE() {
  // 图标创建函数集合
  const iconCreators = {
    folder: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('icon-folder')
      return icon
    },
    actor: actor => {
      const teams = Data.teams.map
      const team = teams[actor.teamId]
      const hex = team ? team.color : 'ffffffff'
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = parseInt(hex.slice(6, 8), 16) / 255
      const icon = document.createElement('node-icon')
      icon.textContent = '\uf2c0'
      icon.style.color = `rgba(${r}, ${g}, ${b}, ${a})`
      return icon
    },
    region: region => {
      const hex = region.color
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = parseInt(hex.slice(6, 8), 16) / 255
      const icon = document.createElement('node-icon')
      icon.addClass('icon-scene-region')
      icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`
      return icon
    },
    light: light => {
      const icon = document.createElement('node-icon')
      const r = light.red
      const g = light.green
      const b = light.blue
      icon.textContent = '\uf006'
      icon.style.color = `rgba(${r}, ${g}, ${b})`
      return icon
    },
    animation: () => {
      const icon = document.createElement('node-icon')
      icon.textContent = '\uf110'
      return icon
    },
    particle: () => {
      const icon = document.createElement('node-icon')
      icon.textContent = '\uf2dc'
      return icon
    },
    parallax: parallax => {
      const icon = document.createElement('node-icon')
      const path = File.getPath(parallax.image)
      if (path) {
        icon.addClass('icon-scene-parallax')
        icon.style.backgroundImage = CSS.encodeURL(File.route(path))
      } else {
        icon.textContent = '\uf1c5'
      }
      return icon
    },
    tilemap: () => {
      const icon = document.createElement('node-icon')
      icon.textContent = '\uf00a'
      return icon
    },
  }
  return function (item) {
    return iconCreators[item.class](item)
  }
}()

// 列表 - 更新图标
Scene.list.updateIcon = function (item) {
  const {element} = item
  if (element?.nodeIcon) {
    const icon = this.createIcon(item)
    element.replaceChild(icon, element.nodeIcon)
    element.nodeIcon = icon
  }
}

// 列表 - 更新头部位置
Scene.list.updateHead = function () {
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

// 列表 - 更新瓦片地图的类名
Scene.list.updateTilemapClass = function (item) {
  if (item === Scene.tilemap) {
    item.element.addClass('highlight')
  }
}

// 列表 - 创建条件图标
Scene.list.createConditionIcon = function (item) {
  if (item.conditions instanceof Array) {
    const {element} = item
    const conditionIcon = document.createElement('node-icon')
    conditionIcon.addClass('icon-conditional')
    element.appendChild(conditionIcon)
    element.conditionIcon = conditionIcon
    element.condition = ''
  }
}

// 列表 - 更新条件图标
Scene.list.updateConditionIcon = function (item) {
  const {element} = item
  if (element.conditionIcon !== undefined) {
    const condition = (
      item.enabled
    ? item.conditions.length !== 0
    ? 'conditional'
    : 'none'
    : 'absent'
    )
    if (element.condition !== condition) {
      element.condition = condition
      const icon = element.conditionIcon
      switch (condition) {
        case 'none':
          element.removeClass('weak')
          icon.hide()
          break
        case 'conditional':
          element.removeClass('weak')
          icon.textContent = '?'
          icon.show()
          break
        case 'absent':
          element.addClass('weak')
          icon.textContent = '!'
          icon.show()
          break
      }
    }
  }
}

// 列表 - 创建事件图标
Scene.list.createEventIcon = function (item) {
  if (item.events instanceof Array) {
    const {element} = item
    const eventIcon = document.createElement('node-icon')
    eventIcon.addClass('icon-eventEnabled')
    eventIcon.textContent = 'E'
    element.appendChild(eventIcon)
    element.eventIcon = eventIcon
    element.eventEnabled = null
  }
}

// 列表 - 更新事件图标
Scene.list.updateEventIcon = function (item) {
  const {element} = item
  if (element.eventIcon !== undefined) {
    const eventEnabled = item.events.length !== 0
    if (element.eventEnabled !== eventEnabled) {
      element.eventEnabled = eventEnabled
      eventEnabled
      ? element.eventIcon.show()
      : element.eventIcon.hide()
    }
  }
}

// 列表 - 创建脚本图标
Scene.list.createScriptIcon = function (item) {
  if (item.scripts instanceof Array) {
    const {element} = item
    const scriptIcon = document.createElement('node-icon')
    scriptIcon.addClass('icon-scriptEnabled')
    scriptIcon.textContent = '\uf121'
    element.appendChild(scriptIcon)
    element.scriptIcon = scriptIcon
    element.scriptEnabled = null
  }
}

// 列表 - 更新脚本图标
Scene.list.updateScriptIcon = function (item) {
  const {element} = item
  if (element.scriptIcon !== undefined) {
    const scriptEnabled = item.scripts.length !== 0
    if (element.scriptEnabled !== scriptEnabled) {
      element.scriptEnabled = scriptEnabled
      scriptEnabled
      ? element.scriptIcon.show()
      : element.scriptIcon.hide()
    }
  }
}

// 列表 - 创建可见性图标
Scene.list.createVisibilityIcon = function (item) {
  const {element} = item
  const hiddenIcon = document.createElement('visibility-icon')
  element.appendChild(hiddenIcon)
  element.hiddenIcon = hiddenIcon
  // 使用hiddenState来避开原生属性hidden
  element.hiddenState = null
}

// 列表 - 更新可见性图标
Scene.list.updateVisibilityIcon = function (item) {
  const {element} = item
  if (element.hiddenState !== item.hidden) {
    const {hiddenIcon} = element
    if (element.hiddenState = item.hidden) {
      hiddenIcon.textContent = '\uf070'
      hiddenIcon.addClass('node-icon-highlight')
    } else {
      hiddenIcon.textContent = '\uf06e'
      hiddenIcon.removeClass('node-icon-highlight')
    }
  }
}

// 列表 - 创建锁定图标
Scene.list.createLockIcon = function (item) {
  const {element} = item
  const lockIcon = document.createElement('lock-icon')
  element.appendChild(lockIcon)
  element.lockIcon = lockIcon
  element.lockState = null
}

// 列表 - 更新锁定图标
Scene.list.updateLockIcon = function (item) {
  const {element} = item
  if (element.lockState !== item.locked) {
    const {lockIcon} = element
    if (element.lockState = item.locked) {
      lockIcon.textContent = '\uf023'
      lockIcon.addClass('node-icon-highlight')
    } else {
      lockIcon.textContent = '\uf09c'
      lockIcon.removeClass('node-icon-highlight')
    }
  }
}

// 列表 - 在创建数据时回调
Scene.list.onCreate = function (item) {
  if (item.class === 'folder') return
  Scene.registerPreset(item)
  Scene.loadObjects()
  Scene.loadObjectContext(item)
  Scene.requestRendering()
}

// 列表 - 在迁移数据时回调
Scene.list.onRemove = function () {
  Scene.loadObjects()
  Scene.requestRendering()
}

// 列表 - 在删除数据时回调
Scene.list.onDelete = function (item) {
  Scene.unregisterPreset(item)
  Scene.updateTarget()
  Scene.loadObjects()
  Scene.destroyObjectContext(item)
  Scene.requestRendering()
}

// 列表 - 在恢复数据时回调
Scene.list.onResume = function (item) {
  Scene.registerPreset(item)
  Scene.loadObjects()
  Scene.reloadObjectContext(item)
  Scene.requestRendering()
}

// ******************************** 纹理集合类 ********************************

Scene.Textures = class Textures {
  state //:string

  constructor() {
    this.state = 'open'
    this[''] = null
  }

  // 添加纹理
  append(texture) {
    if (this.state === 'open') {
      this[texture.base.guid] = texture
    }
  }

  // 加载纹理
  load(guid) {
    if (!this[guid]) {
      const texture = new ImageTexture(guid)
      if (texture.complete) {
        this[guid] = texture
        return Promise.resolve().then(() => {
          Scene.requestRendering()
          return texture
        })
      }
      this[guid] = new Promise(resolve => {
        texture.on('load', () => {
          if (this.state === 'open' &&
            this[guid] instanceof Promise) {
            this[guid] = texture
            Scene.requestRendering()
            return resolve(texture)
          }
          texture.destroy()
          return resolve(null)
        })
      })
    }
    return this[guid]
  }

  // 销毁纹理
  destroy() {
    this.state = 'closed'
    for (const texture of Object.values(this)) {
      if (texture instanceof ImageTexture) {
        texture.destroy()
      }
    }
  }
}

// ******************************** 坐标点类 ********************************

Scene.Point = class Point {
  x //:number
  y //:number

  constructor() {
    this.x = 0
    this.y = 0
  }

  // 设置
  set(x, y) {
    this.x = x
    this.y = y
    return this
  }
}

// ******************************** 默认对象文件夹 ********************************

const ObjectFolder = {
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
ObjectFolder.initialize = function () {
  // 侦听事件
  $('#object-folder-confirm').on('click', this.confirm)
}

// 打开窗口
ObjectFolder.open = function () {
  Window.open('object-folder')
  const data = Editor.project.scene.defaultFolders
  const write = getElementWriter('object-folder', data)
  write('tilemap')
  write('actor')
  write('region')
  write('light')
  write('animation')
  write('particle')
  write('parallax')
}

// 确定按钮 - 鼠标点击事件
ObjectFolder.confirm = function (event) {
  const read = getElementReader('object-folder')
  Editor.project.scene.defaultFolders = {
    tilemap: read('tilemap'),
    actor: read('actor'),
    region: read('region'),
    light: read('light'),
    animation: read('animation'),
    particle: read('particle'),
    parallax: read('parallax'),
  }
  Window.close('object-folder')
}

// ******************************** 移动场景 ********************************

const SceneShift = {
  // properties
  callback: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
SceneShift.initialize = function () {
  // 侦听事件
  $('#scene-shift').on('closed', this.windowClosed)
  $('#scene-shift-confirm').on('click', this.confirm)
}

// 打开窗口
SceneShift.open = function (callback) {
  this.callback = callback
  Window.open('scene-shift')
  $('#scene-shift-x').write(0)
  $('#scene-shift-y').write(0)
  $('#scene-shift-x').getFocus('all')
}

// 窗口 - 已关闭事件
SceneShift.windowClosed = function (event) {
  SceneShift.callback = null
}

// 确定按钮 - 鼠标点击事件
SceneShift.confirm = function (event) {
  const x = $('#scene-shift-x').read()
  const y = $('#scene-shift-y').read()
  if (x === 0 && y === 0) {
    return $('#scene-shift-x').getFocus()
  }
  SceneShift.callback(x, y)
  Window.close('scene-shift')
}

// ******************************** 瓦片地图快捷方式列表类 ********************************

class TilemapShortcuts {
  constructor(tilemaps) {
    this.tilemaps = tilemaps
    this.reset()
  }

  // 重置
  reset() {
    this[1] = null
    this[2] = null
    this[3] = null
    this[4] = null
    this[5] = null
    this[6] = null
  }

  // 更新
  update() {
    this.reset()
    for (const tilemap of this.tilemaps) {
      const {shortcut} = tilemap
      if (shortcut !== 0) {
        this[shortcut] = tilemap
      }
    }
    const {elements} = TilemapShortcuts
    const opening = Scene.tilemap
    for (let i = 1; i <= 6; i++) {
      const element = elements[i]
      const tilemap = this[i]
      if (tilemap) {
        tilemap === opening &&
        element.addClass('selected')
        element.show()
      } else {
        element.removeClass('selected')
        element.hide()
      }
    }
    Scene.head.width = 0
    Scene.updateHead()
  }

  // 获取空索引
  getEmptyIndex() {
    for (let i = 1; i <= 6; i++) {
      if (!this[i]) return i
    }
    return 0
  }

  // 静态 - 选项元素
  static elements = {
    1: $('#scene-layer-tilemap-1'),
    2: $('#scene-layer-tilemap-2'),
    3: $('#scene-layer-tilemap-3'),
    4: $('#scene-layer-tilemap-4'),
    5: $('#scene-layer-tilemap-5'),
    6: $('#scene-layer-tilemap-6'),
  }

  // 静态 - 初始化
  static initialize() {
    const {elements} = this
    for (let i = 1; i <= 6; i++) {
      elements[i].setTooltip(() => {
        const tilemap = Scene.tilemaps?.shortcuts[i]
        return tilemap ? `<b>${tilemap.name}</b>` : ''
      })
    }
  }
}

// ******************************** 视差图类 ********************************

class Parallax {
  data    //:object
  shiftX  //:number
  shiftY  //:number
  texture //:object

  constructor(data) {
    this.data = data
    this.shiftX = 0
    this.shiftY = 0
    this.texture = null
    this.loadTexture()
  }

  // 更新数据
  update(deltaTime) {
    const {shiftSpeedX, shiftSpeedY} = this.data
    if (shiftSpeedX !== 0 || shiftSpeedY !== 0) {
      const texture = this.texture
      if (texture instanceof ImageTexture) {
        this.shiftX = (
          this.shiftX
        + shiftSpeedX
        * deltaTime / 1000
        / texture.width
        ) % 1
        this.shiftY = (
          this.shiftY
        + shiftSpeedY
        * deltaTime / 1000
        / texture.height
        ) % 1
      }
    }
  }

  // 绘制图像
  draw(id) {
    const texture = this.texture
    if (texture instanceof ImageTexture) {
      const gl = GL
      const parallax = this.data
      const vertices = gl.arrays[0].float32
      const pw = texture.width
               * parallax.scaleX
               * parallax.repeatX
      const ph = texture.height
               * parallax.scaleY
               * parallax.repeatY
      const ox = parallax.offsetX
      const oy = parallax.offsetY
      const ax = parallax.anchorX * pw
      const ay = parallax.anchorY * ph
      const anchor = Scene.getParallaxAnchor(parallax)
      const dl = anchor.x - ax + ox
      const dt = anchor.y - ay + oy
      const dr = dl + pw
      const db = dt + ph
      const cl = Scene.scrollLeft
      const ct = Scene.scrollTop
      const cr = Scene.scrollRight
      const cb = Scene.scrollBottom
      if (dl < cr && dr > cl && dt < cb && db > ct) {
        const sl = this.shiftX
        const st = this.shiftY
        const sr = sl + parallax.repeatX
        const sb = st + parallax.repeatY
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
        gl.blend = parallax.blend
        gl.alpha = parallax.opacity * (parallax.enabled ? 1 : 0.3)
        const activeId = Scene.activeTilemapId
        if (activeId !== -1 && id > activeId) {
          gl.alpha *= 0.25
        }
        const program = gl.imageProgram.use()
        const tint = parallax.tint
        const red = tint[0] / 255
        const green = tint[1] / 255
        const blue = tint[2] / 255
        const gray = tint[3] / 255
        const modeMap = Parallax.lightSamplingModes
        const lightMode = Scene.showLight ? parallax.light : 'raw'
        const lightModeIndex = modeMap[lightMode]
        const matrix = gl.matrix.project(
          gl.flip,
          cr - cl,
          cb - ct,
        ).translate(-cl, -ct)
        gl.bindVertexArray(program.vao)
        gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
        gl.uniform1i(program.u_LightMode, lightModeIndex)
        if (lightMode === 'anchor') {
          gl.uniform2f(program.u_LightCoord, anchor.x, anchor.y)
        }
        gl.uniform1i(program.u_ColorMode, 0)
        gl.uniform4f(program.u_Tint, red, green, blue, gray)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
        gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        gl.blend = 'normal'
      }
    } else {
      this.drawDefaultImage()
    }
  }

  // 绘制默认图像
  drawDefaultImage() {
    const parallax = this.data
    const width = 128 * parallax.scaleX * parallax.repeatX
    const height = 128 * parallax.scaleY * parallax.repeatY
    const ox = parallax.offsetX
    const oy = parallax.offsetY
    const ax = parallax.anchorX * width
    const ay = parallax.anchorY * height
    const anchor = Scene.getParallaxAnchor(parallax)
    const x = anchor.x - ax + ox
    const y = anchor.y - ay + oy
    GL.matrix.set(Scene.matrix)
    GL.alpha = parallax.opacity
    GL.blend = parallax.blend
    GL.fillRect(x, y, width, height, 0x80ffffff)
  }

  // 加载纹理
  loadTexture() {
    const guid = this.data.image
    if (guid) {
      const texture = new ImageTexture(guid)
      this.texture = texture
      if (texture.complete) {
        return texture
      }
      this.update = Function.empty
      this.draw = Function.empty
      texture.on('load', () => {
        Scene.requestRendering()
        delete this.update
        delete this.draw
      })
    }
  }

  // 销毁
  destroy() {
    if (this.texture instanceof ImageTexture) {
      this.texture.destroy()
    }
    this.texture = null
  }

  // 静态 - 光线采样模式映射表
  static lightSamplingModes = {raw: 0, global: 1, anchor: 2, ambient: 3}
}

// ******************************** 光源类 ********************************

class Light {
  data            //:object
  angle           //:number
  anchorOffsetX   //:number
  anchorOffsetY   //:number
  measureOffsetX  //:number
  measureOffsetY  //:number
  measureWidth    //:number
  measureHeight   //:number

  constructor(data) {
    this.data = data
    this.measure()
  }

  // 绘制图像
  draw(projMatrix, opacity) {
    opacity *= this.data.enabled ? 1 : 0.3
    switch (this.data.type) {
      case 'point':
        return this.drawPointLight(projMatrix, opacity)
      case 'area':
        return this.drawAreaLight(projMatrix, opacity)
    }
  }

  // 绘制点光
  drawPointLight(projMatrix, opacity) {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const light = this.data
    const r = light.range / 2
    const ox = light.x
    const oy = light.y
    const dl = ox - r
    const dt = oy - r
    const dr = ox + r
    const db = oy + r
    vertices[0] = dl
    vertices[1] = dt
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = dl
    vertices[5] = db
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = dr
    vertices[9] = db
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = dr
    vertices[13] = dt
    vertices[14] = 1
    vertices[15] = 0
    gl.blend = light.blend
    const program = gl.lightProgram.use()
    const red = light.red * opacity / 255
    const green = light.green * opacity / 255
    const blue = light.blue * opacity / 255
    const intensity = light.intensity
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, projMatrix)
    gl.uniform1i(program.u_LightMode, 0)
    gl.uniform4f(program.u_LightColor, red, green, blue, intensity)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  // 绘制区域光
  drawAreaLight(projMatrix, opacity) {
    const light = this.data
    const textures = Scene.textures
    const texture = textures[light.mask]
    if (texture === undefined) {
      return textures.load(light.mask)
    }
    if (texture instanceof Promise) {
      return
    }
    const gl = GL
    const vertices = gl.arrays[0].float32
    const ox = light.x
    const oy = light.y
    const dl = ox - this.anchorOffsetX
    const dt = oy - this.anchorOffsetY
    const dr = dl + light.width
    const db = dt + light.height
    vertices[0] = dl
    vertices[1] = dt
    vertices[2] = 0
    vertices[3] = 0
    vertices[4] = dl
    vertices[5] = db
    vertices[6] = 0
    vertices[7] = 1
    vertices[8] = dr
    vertices[9] = db
    vertices[10] = 1
    vertices[11] = 1
    vertices[12] = dr
    vertices[13] = dt
    vertices[14] = 1
    vertices[15] = 0
    gl.blend = light.blend
    const program = gl.lightProgram.use()
    const mode = texture !== null ? 1 : 2
    const red = light.red * opacity / 255
    const green = light.green * opacity / 255
    const blue = light.blue * opacity / 255
    const matrix = gl.matrix
    .set(projMatrix)
    .rotateAt(ox, oy, this.angle)
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform1i(program.u_LightMode, mode)
    gl.uniform4f(program.u_LightColor, red, green, blue, 0)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16)
    gl.bindTexture(gl.TEXTURE_2D, texture?.base.glTexture)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  // 测量
  measure() {
    const light = this.data
    if (light.type !== 'area') return
    const width = light.width
    const height = light.height
    const anchorOffsetX = width * light.anchorX
    const anchorOffsetY = height * light.anchorY
    const a = -anchorOffsetX
    const b = -anchorOffsetY
    const c = a + width
    const d = b + height
    const angle = Math.radians(light.angle)
    const angle1 = Math.atan2(b, a) + angle
    const angle2 = Math.atan2(b, c) + angle
    const angle3 = Math.atan2(d, c) + angle
    const angle4 = Math.atan2(d, a) + angle
    const distance1 = Math.sqrt(a * a + b * b)
    const distance2 = Math.sqrt(c * c + b * b)
    const distance3 = Math.sqrt(c * c + d * d)
    const distance4 = Math.sqrt(a * a + d * d)
    const x1 = Math.cos(angle1) * distance1
    const x2 = Math.cos(angle2) * distance2
    const x3 = Math.cos(angle3) * distance3
    const x4 = Math.cos(angle4) * distance4
    const y1 = Math.sin(angle1) * distance1
    const y2 = Math.sin(angle2) * distance2
    const y3 = Math.sin(angle3) * distance3
    const y4 = Math.sin(angle4) * distance4
    const measureOffsetX = Math.min(x1, x2, x3, x4)
    const measureOffsetY = Math.min(y1, y2, y3, y4)
    const measureWidth = Math.max(Math.abs(x1 - x3), Math.abs(x2 - x4))
    const measureHeight = Math.max(Math.abs(y1 - y3), Math.abs(y2 - y4))
    this.angle = angle
    this.anchorOffsetX = anchorOffsetX
    this.anchorOffsetY = anchorOffsetY
    this.measureOffsetX = measureOffsetX
    this.measureOffsetY = measureOffsetY
    this.measureWidth = measureWidth
    this.measureHeight = measureHeight
  }
}