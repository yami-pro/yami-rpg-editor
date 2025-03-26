'use strict'

// ******************************** 数据对象 ********************************

const Data = {
  // properties
  manifest: null,
  scenePresets: null,
  uiPresets: null,
  actors: null,
  skills: null,
  triggers: null,
  items: null,
  equipments: null,
  states: null,
  events: null,
  scripts: null,
  easings: null,
  teams: null,
  autotiles: null,
  variables: null,
  attribute: null,
  enumeration: null,
  localization: null,
  plugins: null,
  commands: null,
  config: null,
  scenes: null,
  ui: null,
  animations: null,
  particles: null,
  tilesets: null,
  // methods
  loadAll: null,
  loadMeta: null,
  loadFile: null,
  loadScene: null,
  close: null,
  createEasingItems: null,
  createTeamItems: null,
  createDataMaps: null,
  createGUIDMap: null,
  createTeamMap: null,
  createVariableMap: null,
  createAttributeContext: null,
  createEnumerationContext: null,
  createReferencedFileIDMap: null,
  generateVariableEnumScript: null,
  registerScenePresets: null,
  unregisterScenePresets: null,
  registerUiPresets: null,
  unregisterUiPresets: null,
  createManifest: null,
  saveManifest: null,
  filterManifest: null,
  inheritMetaData: null,
  parseGUID: null,
  loadScript: null,
}

// 加载所有文件
Data.loadAll = function () {
  // 创建新的数据映射表
  this.createDataMaps()

  // 创建新的元数据清单
  this.createManifest()

  // 加载文件
  return Promise.all([
    this.loadMeta(),
    this.loadFile('easings'),
    this.loadFile('teams'),
    this.loadFile('autotiles'),
    this.loadFile('variables'),
    this.loadFile('attribute'),
    this.loadFile('enumeration'),
    this.loadFile('localization'),
    this.loadFile('plugins'),
    this.loadFile('commands'),
    this.loadFile('config'),
  ]).then(() => {
    Data.createGUIDMap(this.easings)
    Data.createGUIDMap(this.autotiles)
    Data.createTeamMap()
    Data.createVariableMap()
    Data.createAttributeContext()
    Data.createEnumerationContext()
    Data.createLocalizationMap()
  })
}

// 加载元数据
Data.loadMeta = function () {
  const path = 'Data/manifest.json'
  return File.get({
    path: path,
    type: 'json',
  }).then(
    data => {
      if (data === null) return
      Object.defineProperty(this.manifest, 'last', {
        configurable: true,
        value: data,
      })
    },
    error => {
      error.message = path
      throw error
    },
  )
}

// 加载文件
Data.loadFile = function (filename) {
  const path = `Data/${filename}.json`
  return File.get({
    path: path,
    type: 'json',
  }).then(
    data => {
      if (!data) {
        throw new SyntaxError(path)
      }
      const meta = {
        guid: filename,
        path: path,
        dataMap: this,
      }
      this.manifest.project[filename] = meta
      this.manifest.guidMap[meta.guid] = meta
      return this[filename] = data
    }
  )
}

// 加载场景
Data.loadScene = function (guid) {
  const {scenes} = this
  if (scenes[guid]) {
    return new Promise(resolve => {
      resolve(Codec.decodeScene(scenes[guid]))
    })
  }

  const meta = this.manifest.guidMap[guid]
  if (!meta) {
    return new Promise((resolve, reject) => {
      reject(new URIError('Metadata is undefined.'))
    })
  }
  const path = meta.path
  return File.get({
    path: path,
    type: 'text',
  }).then(
    code => {
      try {
        return Codec.decodeScene(
          scenes[guid] = code
        )
      } catch (error) {
        error.message = `${path}\n${error.message}`
        throw error
      }
    }
  )
}

// 关闭数据
Data.close = function () {
  this.manifest = null
  this.scenePresets = null
  this.uiPresets = null
  this.actors = null
  this.skills = null
  this.triggers = null
  this.items = null
  this.equipments = null
  this.states = null
  this.events = null
  this.scripts = null
  this.easings = null
  this.teams = null
  this.autotiles = null
  this.variables = null
  this.attribute = null
  this.plugins = null
  this.commands = null
  this.config = null
  this.scenes = null
  this.ui = null
  this.animations = null
  this.particles = null
  this.tilesets = null
}

// 创建过渡选项
Data.createEasingItems = function () {
  let items = this.easings.items
  if (items === undefined) {
    // 把属性写入数组中不会被保存到文件
    items = this.easings.items = []
    const easings = this.easings
    const length = easings.length
    const digits = Number.computeIndexDigits(length)
    for (let i = 0; i < length; i++) {
      const index = i.toString().padStart(digits, '0')
      const easing = easings[i]
      items.push({
        name: `${index}:${easing.name}`,
        value: easing.id,
      })
    }
  }
  return items
}

// 创建队伍选项
Data.createTeamItems = function () {
  let items = this.teams.list.items
  if (items === undefined) {
    items = this.teams.list.items = []
    const teams = this.teams.list
    const length = teams.length
    const digits = Number.computeIndexDigits(length)
    for (let i = 0; i < length; i++) {
      const index = i.toString().padStart(digits, '0')
      const team = teams[i]
      items.push({
        name: `${index}:${team.name}`,
        value: team.id,
      })
    }
  }
  return items
}

// 创建数据映射表
Data.createDataMaps = function () {
  this.scenePresets = {}
  this.uiPresets = {}
  this.actors = {}
  this.skills = {}
  this.triggers = {}
  this.items = {}
  this.equipments = {}
  this.states = {}
  this.events = {}
  this.scripts = {}
  this.scenes = {}
  this.ui = {}
  this.animations = {}
  this.particles = {}
  this.tilesets = {}
}

// 创建GUID映射表
Data.createGUIDMap = function (list) {
  const map = {}
  for (const item of list) {
    map[item.id] = item
  }
  Object.defineProperty(list, 'map', {
    configurable: true,
    value: map,
  })
}

// 创建队伍映射表
Data.createTeamMap = function () {
  const map = {}
  const teams = this.teams
  for (const item of teams.list) {
    map[item.id] = item
  }
  Object.defineProperty(teams, 'map', {
    configurable: true,
    value: map,
  })
}

// 创建变量映射表
Data.createVariableMap = function IIFE() {
  const set = (items, map) => {
    for (const item of items) {
      if (item.children) {
        set(item.children, map)
      } else {
        map[item.id] = item
      }
    }
  }
  return function () {
    const map = {}
    set(this.variables, map)
    Object.defineProperty(this.variables, 'map', {
      configurable: true,
      value: map,
    })
  }
}()

// 创建属性上下文对象
Data.createAttributeContext = function () {
  Object.defineProperty(this.attribute, 'context', {
    configurable: true,
    value: new AttributeContext(this.attribute),
  })
}

// 创建枚举上下文对象
Data.createEnumerationContext = function () {
  Object.defineProperty(this.enumeration, 'context', {
    configurable: true,
    value: new EnumerationContext(this.enumeration),
  })
}

// 创建游戏本地化映射表
Data.createLocalizationMap = function () {
  const map = {}
  const set = (items) => {
    for (const item of items) {
      if (item.children) {
        set(item.children)
      } else {
        map[item.id] = item
      }
    }
  }
  set(this.localization.list)
  Object.defineProperty(this.localization, 'map', {
    configurable: true,
    value: map,
  })
}

// 创建(可能)被引用的文件ID映射表
Data.createReferencedFileIDMap = function () {
  const usedMap = {}
  const list = [
    Object.values(this.ui),
    Object.values(this.scenes),
    Object.values(this.actors),
    Object.values(this.skills),
    Object.values(this.triggers),
    Object.values(this.items),
    Object.values(this.equipments),
    Object.values(this.states),
    Object.values(this.events),
    Object.values(this.scripts),
    Object.values(this.animations),
    Object.values(this.particles),
    Object.values(this.tilesets),
    this.plugins,
    this.commands,
    this.config,
  ]
  const {scenePresets, uiPresets} = Data
  const markToMap = guid => {
    usedMap[guid] = true
    if (guid in scenePresets) {
      usedMap[scenePresets[guid].sceneId] = true
    }
    if (guid in uiPresets) {
      usedMap[uiPresets[guid].uiId] = true
    }
  }
  let match
  const guid = /"([0-9a-f]{16})\\?"/g
  const code = JSON.stringify(list)
  while (match = guid.exec(code)) {
    markToMap(match[1])
  }
  // 获取自动触发的事件
  for (const event of Object.values(this.events)) {
    if (event.type !== 'common') {
      markToMap(event.guid)
    }
  }
  // 获取脚本中可能引用的文件ID
  const guidInScript = /"[0-9a-f]{16}"|'[0-9a-f]{16}'/g
  for (const meta of Object.values(this.scripts)) {
    if (meta.guid in usedMap) {
      const code = meta.code
      while (match = guidInScript.exec(code)) {
        markToMap(match[0].slice(1, -1))
      }
    }
  }
  return usedMap
}

// 生成变量枚举脚本
Data.generateVariableEnumScript = function () {
  const regexp = /^[\p{ID_Start}][\p{ID_Continue}]*$/u
  const spaces = / +/g
  const wraps = /\n+/g
  const validItems = []
  const invalidItems = []
  const duplicateItems = []
  const flags = {}
  const set = items => {
    for (const item of items) {
      if (item.children) {
        set(item.children)
        continue
      }
      // 移除空格字符
      let name = item.name
      if (name.indexOf(' ') !== -1) {
        name = name.replace(spaces, '')
      }
      if (name in flags) {
        duplicateItems.push(item)
        continue
      }
      if (regexp.test(name)) {
        flags[name] = true
        validItems.push({
          id: item.id,
          name: name,
          value: item.value,
          note: item.note,
        })
        continue
      }
      invalidItems.push(item)
    }
  }
  set(this.variables)
  if (validItems.length + invalidItems.length + duplicateItems.length !== 0) {
    const contents = [
      '/** This script is generated and defines the IDs of global variables. */\n',
      'enum VAR {',
    ]
    if (validItems.length !== 0) {
      for (const item of validItems) {
        const value = item.value
        const type = typeof value
        let init
        switch (type) {
          case 'boolean':
            init = ` = ${value.toString()}`
            break
          case 'number':
            init = ` = ${value.toString()}`
            break
          case 'string':
            init = ` = '${value.trim().replace(wraps, ' ')}'`
            if (init.length > 40) {
              init = `${init.slice(0, 40)}...'`
            }
            break
          case 'object':
            init = ''
            break
        }
        let note = item.note.trim()
        if (note !== '') {
          note = '\n   *  \n   *  ' + note.replace(wraps, '  \n   *  ')
        }
        contents.push(`  /** ${type}${init}${note} */`)
        contents.push(`  ${item.name} = '${item.id}',`)
      }
    }
    if (invalidItems.length !== 0) {
      contents.push(`  // Invalid variable names:`)
      for (const item of invalidItems) {
        contents.push(`  // ${item.name} = '${item.id}',`)
      }
    }
    if (duplicateItems.length !== 0) {
      contents.push(`  // Duplicate variable names:`)
      for (const item of duplicateItems) {
        contents.push(`  // ${item.name} = '${item.id}',`)
      }
    }
    contents.push('}')
    const code = contents.join('\n')
    const path = 'Script/yami.ts'
    const route = File.route(path)
    FSP.writeFile(route, code).then(() => {
      console.log(`write: ${path}`)
    }).catch(error => {
      console.warn(error)
    })
  }
}

// 注册场景预设元素
Data.registerScenePresets = function (sceneId) {
  const scene = this.scenes[sceneId]
  if (scene) {
    let changed = false
    const {scenePresets} = this
    const generatePresetId = () => {
      let id
      do {id = GUID.generate64bit()}
      while (id in scenePresets)
      return id
    }
    const setMap = nodes => {
      for (const node of nodes) {
        if (node.class === 'folder') {
          setMap(node.children)
        } else {
          // 如果存在该ID的元素，重新生成ID
          if (scenePresets[node.presetId]) {
            node.presetId = generatePresetId()
            changed = true
          }
          scenePresets[node.presetId] = {
            sceneId: sceneId,
            data: node,
          }
        }
      }
    }
    setMap(scene.objects)
    // 如果发生了改变，立即写入UI文件，避免重新打开工程时影响已有预设元素的ID
    if (changed) {
      File.planToSave(Data.manifest.guidMap[sceneId])
      File.save(false)
    }
  }
}

// 取消注册场景预设元素
Data.unregisterScenePresets = function (sceneId) {
  const scene = this.scenes[sceneId]
  if (scene) {
    const {scenePresets} = this
    const unlink = nodes => {
      for (const node of nodes) {
        const {presetId} = node
        if (scenePresets[presetId]?.sceneId === sceneId) {
          delete scenePresets[presetId]
        }
        if (node.children) {
          unlink(node.children)
        }
      }
    }
    unlink(scene.objects)
  }
}

// 注册界面预设元素
Data.registerUiPresets = function (uiId) {
  const ui = this.ui[uiId]
  if (ui) {
    let changed = false
    const {uiPresets} = this
    const generatePresetId = () => {
      let id
      do {id = GUID.generate64bit()}
      while (id in uiPresets)
      return id
    }
    const setMap = nodes => {
      for (const node of nodes) {
        // 如果存在该ID的元素，重新生成ID
        if (uiPresets[node.presetId]) {
          node.presetId = generatePresetId()
          changed = true
        }
        uiPresets[node.presetId] = {
          uiId: uiId,
          data: node,
        }
        if (node.children.length !== 0) {
          setMap(node.children)
        }
      }
    }
    setMap(ui.nodes)
    // 如果发生了改变，立即写入UI文件，避免重新打开工程时影响已有预设元素的ID
    if (changed) {
      File.planToSave(Data.manifest.guidMap[uiId])
      File.save(false)
    }
  }
}

// 取消注册界面预设元素
Data.unregisterUiPresets = function (uiId) {
  const ui = this.ui[uiId]
  if (ui) {
    const {uiPresets} = this
    const unlink = nodes => {
      for (const node of nodes) {
        const {presetId} = node
        if (uiPresets[presetId]?.uiId === uiId) {
          delete uiPresets[presetId]
        }
        if (node.children.length !== 0) {
          unlink(node.children)
        }
      }
    }
    unlink(ui.nodes)
  }
}

// 创建元数据清单
Data.createManifest = function () {
  this.manifest = new Manifest()
}

// 保存元数据清单
Data.saveManifest = function () {
  const manifest = this.manifest
  if (manifest?.changed) {
    manifest.changed = false
    const copy = Data.filterManifest(manifest)
    const json = JSON.stringify(copy, null, 2)
    const last = manifest.code
    if (json && json !== last) {
      const path = File.route('Data/manifest.json')
      return FSP.writeFile(path, json)
      .then(() => {
        manifest.code = json
      }).catch(error => {
        Log.throw(error)
      })
    }
  }
  return null
}

// 过滤元数据
Data.filterManifest = function (manifest) {
  // 快速拷贝
  const copy = {}
  for (const key of Object.keys(manifest)) {
    copy[key] = manifest[key]
  }
  copy.images = Object.clone(manifest.images)
  copy.audio = Object.clone(manifest.audio)
  // 把未使用的图像和音频文件大小设置为0
  const {usedMap} = Reference.findAllGuids()
  for (const list of [copy.images, copy.audio]) {
    for (const meta of list) {
      const guid = Data.parseGUID(meta)
      if (usedMap[guid] === undefined) {
        meta.size = 0
      }
    }
  }
  return copy
}

// 继承元数据
Data.inheritMetaData = function () {
  const manifest = this.manifest
  const last = manifest.last
  const map = manifest.guidMap
  if (last === undefined) return
  for (const scene of last.scenes) {
    const guid = this.parseGUID(scene)
    const meta = map[guid]
    if (meta !== undefined) {
      meta.x = scene.x
      meta.y = scene.y
    }
  }
  for (const tileset of last.tilesets) {
    const guid = this.parseGUID(tileset)
    const meta = map[guid]
    if (meta !== undefined) {
      meta.x = tileset.x
      meta.y = tileset.y
    }
  }
  delete manifest.last
}

// 从元数据中解析GUID
Data.parseGUID = function IIFE() {
  const regexp = /(?<=\.)[0-9a-f]{16}(?=\.\S+$)/
  return function (meta) {
    const match = meta.path.match(regexp)
    return match ? match[0] : ''
  }
}()

// 加载脚本
Data.loadScript = async function (file) {
  const meta = file.meta
  if (meta !== undefined) {
    const {scripts} = this
    const {guid} = meta
    await file.promise
    scripts[guid] = File.get({
      path: file.path,
      type: 'text',
    }).then(code => {
      meta.code = code
      PluginManager.parseMeta(meta, code)
      return scripts[guid] = meta
    }).catch(error => {
      delete scripts[guid]
    })
  }
}

// ******************************** 元数据清单类 ********************************

class Manifest {
  actors = []
  skills = []
  triggers = []
  items = []
  equipments = []
  states = []
  events = []
  scenes = []
  tilesets = []
  ui = []
  animations = []
  particles = []
  images = []
  audio = []
  videos = []
  fonts = []
  script = []
  others = []

  constructor() {
    Object.defineProperties(this, {
      metaList: {value: []},
      guidMap: {value: {}},
      pathMap: {value: {}},
      project: {value: {}},
      changes: {value: []},
      changed: {writable: true, value: false},
      code: {writable: true, value: ''},
    })
  }

  // 更新
  update() {
    const {metaList} = this
    const {versionId} = Meta
    let i = metaList.length
    while (--i >= 0) {
      const meta = metaList[i]
      // 如果版本ID不一致，表示文件已被删除
      if (meta.versionId !== versionId) {
        this.deleteMeta(meta)
      }
    }
  }

  // 删除元数据
  deleteMeta(meta) {
    const {guidMap} = this
    const {pathMap} = this
    const {guid, path} = meta
    this.metaList.remove(meta)
    meta.group.remove(meta)
    if (guidMap[guid] === meta) {
      delete guidMap[guid]
    }
    if (pathMap[path] === meta) {
      delete pathMap[path]
    }
    const {dataMap} = meta
    if (dataMap) {
      // 从待保存列表中移除
      File.cancelSave(meta)
      // 关闭已打开的标签
      switch (dataMap) {
        case Data.scenes:
        case Data.ui:
        case Data.animations:
        case Data.particles:
          Title.tabBar.closeByProperty('meta', meta)
          break
      }
      // 移除UI预设元素的链接
      switch (dataMap) {
        case Data.scenes:
          Data.unregisterScenePresets(guid)
          break
        case Data.ui:
          Data.unregisterUiPresets(guid)
          break
      }
      delete dataMap[guid]
    }
    this.changed = true
    console.log(`delete meta: ${meta.path}`)
  }
}

// ******************************** 元数据类 ********************************

const Meta = function IIFE() {
  // 类型到分组名称映射表
  const typeMapToGroupName = {
    ...FileItem.dataMapNames,
    image: 'images',
    audio: 'audio',
    video: 'videos',
    script: 'script',
    font: 'fonts',
    other: 'others',
  }
  const loaderDescriptor = {path: null, type: 'json'}
  const fileDescriptor = {writable: true, value: null}
  const guidDescriptor = {writable: true, value: ''}
  const codeDescriptor = {writable: true, value: ''}
  const groupDescriptor = {value: null}
  const dataMapDescriptor = {value: null}
  const descriptors = {
    file: fileDescriptor,
    guid: guidDescriptor,
    group: groupDescriptor,
    mtimeMs: {writable: true, value: null},
    versionId: {writable: true, value: -1},
  }
  return class FileMeta {
    path //:string
    size //:number

    constructor(file, guid) {
      const {type, path} = file
      this.path = path
      this.size = Number(file.stats.size)

      // 特殊类型额外附加属性
      switch (type) {
        case 'scene':
          this.x = 10
          this.y = 10
          break
        case 'tileset':
          this.x = 0
          this.y = 0
          break
        case 'script':
          this.parameters = Array.empty
          Object.defineProperty(this, 'code', codeDescriptor)
          break
      }

      // 加载数据文件
      const name = FileItem.dataMapNames[type]
      if (name !== undefined) {
        dataMapDescriptor.value = Data[name]
        Object.defineProperty(this, 'dataMap', dataMapDescriptor)

        const promise = file.promise ?? Promise.resolve()
        file.promise = promise.then(async () => {
          // 文件重命名后会改变元数据路径
          loaderDescriptor.path = this.path
          const data = await File.get(loaderDescriptor)
          if (data) {
            guidDescriptor.value = guid
            Object.defineProperty(data, 'guid', guidDescriptor)
          }
          this.dataMap[guid] = data
          switch (type) {
            case 'event':
              Updater.updateGlobalEvent(this)
              break
            case 'scene':
              Data.registerScenePresets(guid)
              break
            case 'ui':
              Data.registerUiPresets(guid)
              break
          }
        }).catch(error => {
          console.log(`读取失败: ${error.message}`)
        })
      }

      // 设置其他内容
      const key = typeMapToGroupName[type]
      if (key === undefined) {
        throw new Error('Unknown meta type')
      }
      const {manifest} = Data
      manifest.changed = true
      manifest[key].push(this)
      manifest.metaList.push(this)
      manifest.guidMap[guid] = this
      manifest.pathMap[path] = this
      fileDescriptor.value = file
      guidDescriptor.value = guid
      groupDescriptor.value = manifest[key]
      Object.defineProperties(this, descriptors)
    }

    // 重定向
    redirect(file) {
      if (this.file.type === file.type) {
        this.file = file
        const sPath = this.path
        const dPath = file.path
        if (sPath !== dPath) {
          this.path = dPath
          this.mtimeMs = file.stats.mtimeMs
          const {manifest} = Data
          const {pathMap} = manifest
          if (pathMap[sPath] === this) {
            delete pathMap[sPath]
          }
          pathMap[dPath] = this
          manifest.changed = true
        }
        return true
      }
      return false
    }

    // 尝试修复因项目更新而丢失的GUID
    tryFixGuid(data) {
      if (data.guid === undefined) {}
      guidDescriptor.value = this.guid
      Object.defineProperty(data, 'guid', guidDescriptor)
    }

    // 静态 - 版本ID
    static versionId = 0
  }
}()

// ******************************** 项目设置窗口 ********************************

const Project = {
  // properties
  data: null,
  changed: false,
  importedFonts: null,
  languages: null,
  tscStarted: false,
  // methods
  initialize: null,
  open: null,
  startTSC: null,
  stopTSC: null,
  // events
  windowClose: null,
  windowClosed: null,
  projectChange: null,
  dataChange: null,
  paramInput: null,
  confirm: null,
}

// 初始化
Project.initialize = function () {
  // 创建窗口显示模式选项
  $('#config-window-display').loadItems([
    {name: 'Windowed', value: 'windowed'},
    {name: 'Maximized', value: 'maximized'},
    {name: 'Fullscreen', value: 'fullscreen'},
  ])

  // 创建角色碰撞选项
  $('#config-collision-actor-enabled').loadItems([
    {name: 'Enabled', value: true},
    {name: 'Disabled', value: false},
  ])

  // 创建场景碰撞选项
  $('#config-collision-scene-enabled').loadItems([
    {name: 'Enabled', value: true},
    {name: 'Disabled', value: false},
  ])

  // 设置场景碰撞关联元素
  $('#config-collision-scene-enabled').enableHiddenMode().relate([
    {case: true, targets: [$('#config-collision-scene-actorSize')]},
  ])

  // 创建触发器碰撞模式选项
  $('#config-collision-trigger-collideWithActorShape').loadItems([
    {name: 'Collide With Actor\'s Shape', value: true},
    {name: 'Collide With Actor\'s Anchor', value: false},
  ])

  // 绑定导入字体列表
  $('#config-text-importedFonts').bind(this.importedFonts)

  // 创建高清晰度选项
  $('#config-text-highDefinition').loadItems([
    {name: 'Yes', value: true},
    {name: 'No', value: false},
  ])

  // 绑定角色临时属性列表
  $('#config-actor-tempAttributes').bind(new AttributeListInterface())

  // 创建WebGL低延时模式选项
  $('#config-webgl-desynchronized').loadItems([
    {name: 'Enabled', value: true},
    {name: 'Disabled', value: false},
  ])

  // 创建WebGL纹理放大滤波器选项
  $('#config-webgl-textureMagFilter').loadItems([
    {name: 'Nearest', value: 'nearest'},
    {name: 'Linear', value: 'linear'},
  ])

  // 创建WebGL纹理缩小滤波器选项
  $('#config-webgl-textureMinFilter').loadItems([
    {name: 'Nearest', value: 'nearest'},
    {name: 'Linear', value: 'linear'},
  ])

  // 创建脚本自动编译选项
  $('#config-script-autoCompile').loadItems([
    {name: 'Enabled', value: true},
    {name: 'Disabled', value: false},
  ])

  // 创建存档位置选项
  $('#config-save-location').loadItems([
    {name: 'App Data', value: 'app-data'},
    {name: 'Documents', value: 'documents'},
    {name: 'Local Directory', value: 'local'},
  ])

  // 设置场景碰撞关联元素
  $('#config-save-location').enableHiddenMode().relate([
    {case: ['app-data', 'documents'], targets: [
      $('#config-save-subdir'),
    ]},
  ])

  // 绑定语言列表
  $('#config-localization-languages').bind(this.languages)

  // 创建预加载选项
  $('#config-preload').loadItems([
    {name: 'Never', value: 'never'},
    {name: 'Always', value: 'always'},
    {name: 'Only on Deployment', value: 'deployed'},
  ])

  // 侦听事件
  window.on('datachange', this.projectChange)
  $('#project-settings').on('close', this.windowClose)
  $('#project-settings').on('closed', this.windowClosed)
  $('#project-settings').on('change', this.dataChange)
  $('#project-confirm').on('click', this.confirm)
  $(`#config-window-title, #config-window-width, #config-window-height,
    #config-window-display, #config-resolution-width, #config-resolution-height,
    #config-resolution-sceneScale, #config-resolution-uiScale,
    #config-scene-padding, #config-scene-animationInterval,
    #config-tileArea-expansionTop, #config-tileArea-expansionLeft,
    #config-tileArea-expansionRight, #config-tileArea-expansionBottom,
    #config-animationArea-expansionTop, #config-animationArea-expansionLeft,
    #config-animationArea-expansionRight, #config-animationArea-expansionBottom,
    #config-lightArea-expansionTop, #config-lightArea-expansionLeft,
    #config-lightArea-expansionRight, #config-lightArea-expansionBottom,
    #config-virtualAxis-up, #config-virtualAxis-down, #config-virtualAxis-left, #config-virtualAxis-right,
    #config-collision-actor-enabled, #config-collision-scene-enabled, #config-collision-scene-actorSize,
    #config-collision-trigger-collideWithActorShape, #config-text-fontFamily,
    #config-text-highDefinition, #config-animation-frameRate,
    #config-soundAttenuation-distance, #config-soundAttenuation-easingId,
    #config-webgl-desynchronized, #config-webgl-textureMagFilter, #config-webgl-textureMinFilter,
    #config-script-autoCompile, #config-save-location, #config-save-subdir,
    #config-localization-languages, #config-localization-default, #config-preload`
  ).on('input', this.paramInput)
}

// 打开窗口
Project.open = function () {
  Window.open('project-settings')

  // 创建数据副本
  this.data = Object.clone(Data.config)

  // 创建音效衰减过渡选项
  $('#config-soundAttenuation-easingId').loadItems(Data.createEasingItems())

  // 写入数据
  const write = getElementWriter('config', this.data)
  write('window-title')
  write('window-width')
  write('window-height')
  write('window-display')
  write('resolution-width')
  write('resolution-height')
  write('resolution-sceneScale')
  write('resolution-uiScale')
  write('scene-padding')
  write('scene-animationInterval')
  write('tileArea-expansionTop')
  write('tileArea-expansionLeft')
  write('tileArea-expansionRight')
  write('tileArea-expansionBottom')
  write('animationArea-expansionTop')
  write('animationArea-expansionLeft')
  write('animationArea-expansionRight')
  write('animationArea-expansionBottom')
  write('lightArea-expansionTop')
  write('lightArea-expansionLeft')
  write('lightArea-expansionRight')
  write('lightArea-expansionBottom')
  write('virtualAxis-up')
  write('virtualAxis-down')
  write('virtualAxis-left')
  write('virtualAxis-right')
  write('collision-actor-enabled')
  write('collision-scene-enabled')
  write('collision-scene-actorSize')
  write('collision-trigger-collideWithActorShape')
  write('text-importedFonts')
  write('text-fontFamily')
  write('text-highDefinition')
  write('actor-tempAttributes')
  write('animation-frameRate')
  write('soundAttenuation-distance')
  write('soundAttenuation-easingId')
  write('webgl-desynchronized')
  write('webgl-textureMagFilter')
  write('webgl-textureMinFilter')
  write('script-autoCompile')
  write('save-location')
  write('save-subdir')
  write('localization-languages')
  write('localization-default')
  write('preload')
}

// 启动TypeScript编译
Project.startTSC = function () {
  if (!this.tscStarted) {
    this.tscStarted = true
    require('electron').ipcRenderer.send('start-tsc', File.root)
  }
}

// 停止TypeScript编译
Project.stopTSC = function () {
  if (this.tscStarted) {
    this.tscStarted = false
    require('electron').ipcRenderer.send('stop-tsc')
    Log.clear()
  }
}

// 窗口 - 关闭事件
Project.windowClose = function (event) {
  if (Project.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedProjectSettings'),
    }, [{
      label: get('yes'),
      click: () => {
        Project.changed = false
        Window.close('project-settings')
      },
    }, {
      label: get('no'),
    }])
  }
}

// 窗口 - 已关闭事件
Project.windowClosed = function (event) {
  Project.data = null
}

// 项目 - 改变事件
Project.projectChange = function (event) {
  if (event.key === 'config') {
    const last = event.last.script
    const current = Data.config.script
    if (current.autoCompile !== last.autoCompile) {
      if (current.autoCompile) {
        Project.startTSC()
      } else {
        Project.stopTSC()
      }
    }
  }
}

// 数据 - 改变事件
Project.dataChange = function (event) {
  this.changed = true
}.bind(Project)

// 参数 - 输入事件
Project.paramInput = function (event) {
  const key = Inspector.getKey(this)
  const value = this.read()
  const keys = key.split('-')
  const end = keys.length - 1
  let node = Project.data
  for (let i = 0; i < end; i++) {
    node = node[keys[i]]
  }
  const property = keys[end]
  if (node[property] !== value) {
    node[property] = value
  }
}

// 过滤重复的语言
Project.filterDuplicateLanguages = function () {
  const local = this.data.localization
  const languages = []
  for (const language of local.languages) {
    languages.append(language)
  }
  local.languages = languages
}

// 确定按钮 - 鼠标点击事件
Project.confirm = function (event) {
  if (this.changed) {
    this.changed = false
    this.filterDuplicateLanguages()
    const last = Data.config
    const title1 = Data.config.window.title
    const title2 = this.data.window.title
    Data.config = this.data
    File.planToSave(Data.manifest.project.config)
    // 更新标题名称
    if (title1 !== title2) {
      Title.updateTitleName()
    }
    const datachange = new Event('datachange')
    datachange.key = 'config'
    datachange.last = last
    window.dispatchEvent(datachange)
  }
  Window.close('project-settings')
}.bind(Project)

// 导入字体列表接口
Project.importedFonts = {
  fontId: null,
  filter: 'font',
  initialize: function () {},
  parse: function (fontId) {
    return Command.removeTextTags(Command.parseFileName(fontId))
  },
  open: function (fontId = '') {
    this.fontId = fontId
    Selector.open(this, false)
  },
  save: function () {
    return this.fontId
  },
  read: function () {
    return this.fontId
  },
  input: function (fontId) {
    this.fontId = fontId
    this.target.save()
  },
}

// 语言列表接口
Project.languages = {
  initialize: function (list) {
    $('#language-confirm').on('click', () => {
      // 如果是插入模式且语言重复，阻止操作
      if (list.inserting) {
        const languages = Project.data.localization.languages
        const langName = $('#language-name').read()
        if (languages.find(lang => lang.name === langName)) {
          return $('#language-name').getFocus()
        }
      }
      this.target.save()
      Window.close('language')
    })
  },
  parse: function (language) {
    return [
      {content: Local.get('languages.' + language.name)},
      {content: language.name, class: 'weak'},
    ]
  },
  open: function (language = {name: '', font: '', scale: 1}) {
    $('#language-name').loadItems(this.createAllItems())
    $('#language-name').write2(language.name)
    $('#language-font').write(language.font)
    $('#language-scale').write(language.scale)
    $('#language-name').getFocus()
    Window.open('language')
  },
  save: function () {
    return {
      name: $('#language-name').read(),
      font: $('#language-font').read(),
      scale: $('#language-scale').read(),
    }
  },
  update: function () {
    // 创建默认游戏语言选项
    const selectBox = $('#config-localization-default')
    const defaultLang = selectBox.read()
    selectBox.loadItems(Project.languages.createValidItems())
    if (defaultLang) selectBox.write(defaultLang)
  },
  createAllItems: function () {
    const items = []
    const languages = Local.get('languages')
    if (languages) {
      for (const [value, name] of Object.entries(languages)) {
        if (value !== 'auto') {
          items.push({name, value})
        }
      }
    }
    return items
  },
  createValidItems: function () {
    const items = []
    const languages = Local.get('languages')
    if (languages) {
      const langList = Project.data.localization.languages.map(lang => lang.name)
      for (const [value, name] of Object.entries(languages)) {
        if (value === 'auto' || langList.includes(value)) {
          items.push({name, value})
        }
      }
    }
    return items
  },
}

// ******************************** 过渡窗口 ********************************

const Easing = {
  // properties
  list: $('#easing-list'),
  curve: $('#easing-curve-canvas'),
  preview: $('#easing-preview-canvas'),
  data: null,
  points: null,
  dragging: null,
  activePoint: null,
  scale: null,
  originX: null,
  originY: null,
  timer: null,
  reverse: null,
  elapsed: null,
  duration: null,
  delay: null,
  curveMap: null,
  easingMap: null,
  pointImage: null,
  previewImage: null,
  startPoint: null,
  endPoint: null,
  changed: false,
  // methods
  initialize: null,
  get: null,
  clear: null,
  open: null,
  load: null,
  insert: null,
  copy: null,
  paste: null,
  delete: null,
  createId: null,
  createData: null,
  setEasingKey: null,
  getItemById: null,
  updateMaps: null,
  updateCanvases: null,
  drawCurve: null,
  drawPreview: null,
  updatePoints: null,
  selectPointByCoords: null,
  createPointImage: null,
  createPreviewImage: null,
  requestRendering: null,
  renderingFunction: null,
  stopRendering: null,
  // events
  windowClose: null,
  windowClosed: null,
  dprchange: null,
  themechange: null,
  dataChange: null,
  listKeydown: null,
  listSelect: null,
  listOpen: null,
  listPopup: null,
  modeSelect: null,
  pointInput: null,
  scaleInput: null,
  curveKeydown: null,
  curvePointerdown: null,
  curveWheel: null,
  curveBlur: null,
  pointerup: null,
  pointermove: null,
  reverseInput: null,
  durationInput: null,
  delayInput: null,
  confirm: null,
  // classes
  CurveMap: null,
  EasingMap: null,
}

// list methods
Easing.list.saveSelection = null
Easing.list.restoreSelection = null
Easing.list.updateNodeElement = null
Easing.list.updateItemName = null
Easing.list.addElementClass = null
Easing.list.updateTextNode = null
Easing.list.createKeyTextNode = null
Easing.list.updateKeyTextNode = null

// 初始化
Easing.initialize = function () {
  // 设置起点和终点
  this.startPoint = {x: 0, y: 0}
  this.endPoint = {x: 1, y: 1}

  // 绑定过渡列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.updaters.push(list.updateTextNode)
  list.creators.push(list.createKeyTextNode)
  list.updaters.push(list.updateKeyTextNode)

  // 创建模式选项
  $('#easing-mode').loadItems([
    {name: 'Use 2 Points', value: 2},
    {name: 'Use 5 Points', value: 5},
    {name: 'Use 8 Points', value: 8},
  ])

  // 创建回放选项
  $('#easing-preview-reverse').loadItems([
    {name: 'ON', value: true},
    {name: 'OFF', value: false},
  ])

  // 设置模式关联元素
  const inputs = []
  for (let i = 0; i < 8; i++) {
    inputs.push(
      $(`#easing-points-${i}-x`),
      $(`#easing-points-${i}-y`),
    )
  }
  $('#easing-mode').enableHiddenMode().relate([
    {case: 2, targets: inputs.slice(0, 4)},
    {case: 5, targets: inputs.slice(0, 10)},
    {case: 8, targets: inputs},
  ])

  // 设置初始缩放率
  this.scale = 1
  $('#easing-scale').write(this.scale)

  // 设置预览参数
  this.reverse = true
  this.duration = 400
  this.delay = 400
  $('#easing-preview-reverse').write(this.reverse)
  $('#easing-preview-duration').write(this.duration)
  $('#easing-preview-delay').write(this.delay)

  // 创建计时器
  this.timer = new Timer({
    duration: this.duration,
    update: timer => {
      switch (timer.state) {
        case 'playing':
          this.elapsed = timer.elapsed
          this.requestRendering()
          this.drawPreview()
          break
      }
    },
    callback: timer => {
      switch (timer.state) {
        case 'playing':
          // 如果存在等待时间
          if (this.delay !== 0) {
            timer.state = 'waiting'
            timer.elapsed = timer.playbackRate > 0 ? 0 : this.delay
            timer.duration = this.delay
            break
          }
        case 'waiting':
          timer.state = 'playing'
          timer.duration = this.duration
          switch (timer.playbackRate) {
            case 1:
              if (this.reverse) {
                timer.playbackRate = -1
                timer.elapsed = timer.duration
              } else {
                timer.elapsed = 0
              }
              break
            case -1:
              timer.playbackRate = 1
              break
          }
          break
      }
      return true
    },
  })

  // 侦听事件
  window.on('dprchange', this.dprchange)
  window.on('themechange', this.themechange)
  $('#easing').on('close', this.windowClose)
  $('#easing').on('closed', this.windowClosed)
  $('#easing-points-grid').on('change', this.dataChange)
  list.on('keydown', this.listKeydown)
  list.on('select', this.listSelect)
  list.on('change', this.dataChange)
  list.on('open', this.listOpen)
  list.on('popup', this.listPopup)
  $('#easing-mode').on('input', this.modeSelect)
  $(`#easing-points-0-x, #easing-points-0-y, #easing-points-1-x, #easing-points-1-y,
    #easing-points-2-x, #easing-points-2-y, #easing-points-3-x, #easing-points-3-y,
    #easing-points-4-x, #easing-points-4-y, #easing-points-5-x, #easing-points-5-y,
    #easing-points-6-x, #easing-points-6-y, #easing-points-7-x, #easing-points-7-y`
  ).on('input', this.pointInput)
  $('#easing-scale').on('input', this.scaleInput)
  this.curve.on('keydown', this.curveKeydown)
  this.curve.on('pointerdown', this.curvePointerdown)
  this.curve.on('wheel', this.curveWheel)
  this.curve.on('blur', this.curveBlur)
  $('#easing-preview-reverse').on('input', this.reverseInput)
  $('#easing-preview-duration').on('input', this.durationInput)
  $('#easing-preview-delay').on('input', this.delayInput)
  $('#easing-confirm').on('click', this.confirm)
}

// 创建作用域
namespace: {
const maps = {}
const linear = {map: a => a}
const get = id => {
  // 返回现有映射表
  const map = maps[id]
  if (map !== undefined) {
    return map
  }

  // 创建新的映射表
  const easing = Data.easings.map[id]
  if (easing) {
    const {points} = easing
    const {startPoint, endPoint} = Easing
    const map = new Easing.EasingMap()
    map.update(startPoint, ...points, endPoint)
    return maps[id] = map
  }

  // 返回缺省值
  return linear
}
const clear = () => {
  for (const key of Object.keys(maps)) {
    delete maps[key]
  }
}

// 获取映射表
Easing.get = get

// 清除映射表集合
Easing.clear = clear
}

// 打开窗口
Easing.open = function () {
  Window.open('easing')

  // 创建数据副本
  this.data = Object.clone(Data.easings)

  // 创建映射表
  this.curveMap = new Easing.CurveMap()
  this.easingMap = new Easing.EasingMap()

  // 重置并添加计时器
  this.timer.state = 'playing'
  this.timer.playbackRate = 1
  this.timer.elapsed = 0
  this.timer.add()

  // 创建控制点图像
  this.createPointImage()

  // 创建预览图像
  this.createPreviewImage()

  // 更新画布
  this.updateCanvases()

  // 更新列表项目
  this.list.restoreSelection()

  // 列表获得焦点
  this.list.getFocus()
}

// 加载数据
Easing.load = function (easing) {
  const points = easing.points
  this.points = points

  // 写入数据
  const write = getElementWriter('easing', easing)
  const length = points.length
  write('mode', length)
  for (let i = 0; i < length; i++) {
    write(`points-${i}-x`)
    write(`points-${i}-y`)
  }
  for (let i = length; i < 8; i++) {
    write(`points-${i}-x`, 0)
    write(`points-${i}-y`, 0)
  }

  // 更新映射表并绘制图形
  this.updateMaps()
  this.requestRendering()
}

// 插入
Easing.insert = function (dItem) {
  this.list.addNodeTo(this.createData(), dItem)
}

// 复制
Easing.copy = function (item) {
  if (item) {
    Clipboard.write('yami.data.easing', item)
  }
}

// 粘贴
Easing.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.easing')
  if (copy) {
    copy.name += ' - Copy'
    copy.id = this.createId()
    this.list.addNodeTo(copy, dItem)
  }
}

// 删除
Easing.delete = function (item) {
  const items = this.data
  if (items.length > 1) {
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('deleteSingleFile').replace('<filename>', item.name),
    }, [{
      label: get('yes'),
      click: () => {
        const index = items.indexOf(item)
        this.list.deleteNode(item)
        const last = items.length - 1
        this.list.select(items[Math.min(index, last)])
      },
    }, {
      label: get('no'),
    }])
  }
}

// 创建ID
Easing.createId = function () {
  let id
  do {id = GUID.generate64bit()}
  while (this.getItemById(id))
  return id
}

// 创建数据
Easing.createData = function () {
  return {
    id: this.createId(),
    key: '',
    name: '',
    points: [{x: 0, y: 0}, {x: 1, y: 1}],
  }
}

// 设置过渡曲线的键
Easing.setEasingKey = function (item) {
  SetKey.open(item.key, key => {
    item.key = key
    this.changed = true
    this.list.updateKeyTextNode(item)
  })
}

// 获取ID匹配的数据
Easing.getItemById = function (id) {
  const {data} = this
  const {length} = data
  for (let i = 0; i < length; i++) {
    if (data[i].id === id) {
      return data[i]
    }
  }
  return undefined
}

// 更新映射表
Easing.updateMaps = function () {
  const {startPoint, endPoint} = this
  this.curveMap.update(startPoint, ...this.points, endPoint)
  this.easingMap.update(startPoint, ...this.points, endPoint)
}

// 更新画布
Easing.updateCanvases = function () {
  // 更新曲线画布
  const {curve} = this
  const {width: cWidth, height: cHeight} =
  CSS.getDevicePixelContentBoxSize(curve)
  if (curve.width !== cWidth ||
    curve.height !== cHeight) {
    if (curve.width !== cWidth) {
      curve.width = cWidth
    }
    if (curve.height !== cHeight) {
      curve.height = cHeight
    }
    curve.centerX = cWidth >> 1
    curve.centerY = cHeight >> 1
    // 间隔设置为偶数可保证50%缩放率时原点是整数
    curve.spacing = Math.floor(Math.max(cWidth / 12, 20) / 2) * 2
  }

  // 更新预览画布
  const {preview} = this
  const {width: pWidth, height: pHeight} =
  CSS.getDevicePixelContentBoxSize(preview)
  if (preview.width !== pWidth) {
    preview.width = pWidth
  }
  if (preview.height !== pHeight) {
    preview.height = pHeight
  }
}

// 绘制曲线
Easing.drawCurve = function () {
  const canvas = this.curve
  const scale = this.scale
  const width = canvas.width
  const height = canvas.height
  const spacing = canvas.spacing * scale
  const fullSize = spacing * 10
  const originX = this.originX = canvas.centerX - spacing * 5
  const originY = this.originY = canvas.centerY + spacing * 5

  // 擦除画布
  let {context} = canvas
  if (!context) {
    context = canvas.context = canvas.getContext('2d', {desynchronized: true})
  }
  context.clearRect(0, 0, width, height)

  // 绘制虚线网格
  context.beginPath()
  for (let y = originY % spacing; y < height; y += spacing) {
    context.moveTo(0, y + 0.5)
    context.lineTo(width, y + 0.5)
  }
  for (let x = originX % spacing; x < width; x += spacing) {
    context.moveTo(x + 0.5, 0)
    context.lineTo(x + 0.5, height)
  }
  context.strokeStyle = canvas.gridColor
  context.setLineDash([1])
  context.stroke()

  // 绘制辅助线
  context.strokeStyle = canvas.axisColor
  context.beginPath()
  context.moveTo(originX, originY - fullSize + 0.5)
  context.lineTo(originX + fullSize + 0.5, originY - fullSize + 0.5)
  context.lineTo(originX + fullSize + 0.5, originY)
  context.stroke()

  // 绘制坐标轴
  context.beginPath()
  context.moveTo(0, originY + 0.5)
  context.lineTo(width, originY + 0.5)
  context.moveTo(originX + 0.5, 0)
  context.lineTo(originX + 0.5, height)
  context.strokeStyle = canvas.axisColor
  context.setLineDash([])
  context.stroke()

  // 绘制坐标轴文本
  context.textBaseline = 'top'
  context.font = '12px Arial'
  context.fillStyle = canvas.textColor
  context.fillText('TIME', originX + 4, originY + 4)
  context.translate(originX, originY)
  context.rotate(Math.PI * 3 / 2)
  context.fillText('PROGRESSION', 4, -12)
  context.setTransform(1, 0, 0, 1, 0, 0)

  // 绘制曲线
  context.lineWidth = 2
  context.strokeStyle = canvas.curveColor
  context.beginPath()
  context.moveTo(originX + 0.5, originY + 0.5)
  const curveMap = this.curveMap
  const count = curveMap.count
  for (let i = 2; i < count; i += 2) {
    context.lineTo(originX + curveMap[i] * fullSize + 0.5, originY - curveMap[i + 1] * fullSize + 0.5)
  }
  context.stroke()

  // 绘制激活曲线
  context.strokeStyle = canvas.curveColorActive
  context.beginPath()
  context.moveTo(originX + 0.5, originY + 0.5)
  const easingMap = this.easingMap
  const ratio = easingMap.length - 1
  const time = this.elapsed / this.duration
  const length = Math.ceil(ratio * time) + 1
  for (let i = 1; i < length; i++) {
    context.lineTo(originX + i * fullSize / ratio + 0.5, originY - easingMap[i] * fullSize + 0.5)
  }
  context.stroke()
  context.lineWidth = 1

  // 绘制连接线
  const active = this.activePoint
  const points = this.points
  const pLength = points.length
  for (let i = 0; i < pLength; i++) {
    let linkPoint
    switch (i % 3) {
      case 0:
        linkPoint = points[i - 1] ?? this.startPoint
        break
      case 1:
        linkPoint = points[i + 1] ?? this.endPoint
        break
      default:
        continue
    }
    const point = points[i]
    const sx = originX + Math.round(point.x * fullSize)
    const sy = originY - Math.round(point.y * fullSize)
    const dx = originX + Math.round(linkPoint.x * fullSize)
    const dy = originY - Math.round(linkPoint.y * fullSize)
    const isActive = active === point
    context.strokeStyle = isActive ? canvas.linkColorActive : canvas.axisColor
    context.beginPath()
    context.moveTo(sx + 0.5, sy + 0.5)
    context.lineTo(dx + 0.5, dy + 0.5)
    context.stroke()
  }

  // 绘制控制点
  const image = this.pointImage
  if (image === null) return
  for (let i = 0; i < pLength; i++) {
    const point = points[i]
    const x = originX + Math.round(point.x * fullSize)
    const y = originY - Math.round(point.y * fullSize)
    const sx = i * 3
    const isActive = active === point
    if (y - 3 < 0) {
      context.drawImage(image, 7, isActive ? 22: 15, 7, 4, x - 3, 0, 7, 4)
      context.drawImage(image, sx, isActive ? 10: 5, 3, 5, x - 1, 3, 3, 5)
    } else if (y + 4 >= height) {
      context.drawImage(image, 7, isActive ? 25: 18, 7, 4, x - 3, height - 4, 7, 4)
      context.drawImage(image, sx, isActive ? 10: 5, 3, 5, x - 1, height - 8, 3, 5)
    } else {
      context.drawImage(image, 0, isActive ? 22: 15, 7, 7, x - 3, y - 3, 7, 7)
      context.drawImage(image, sx, 0, 3, 5, x - 1, y - 2, 3, 5)
    }
  }
}

// 绘制预览视图
Easing.drawPreview = function () {
  const canvas = this.preview
  const width = canvas.width
  const height = canvas.height
  const image = this.previewImage
  const size = image.height
  const halfsize = size / 2
  const spacingX = Math.floor((width - size * 4) / 5)
  const spacingY = Math.floor(height / 2)
  const time = this.easingMap.map(this.elapsed / this.duration)
  const dpr = window.devicePixelRatio

  // 擦除画布
  let {context} = canvas
  if (!context) {
    context = canvas.context = canvas.getContext('2d', {desynchronized: true})
  }
  context.clearRect(0, 0, width, height)

  // 绘制位移元素
  {
    const offset = Math.round(60 * dpr)
    const y0 = spacingY - halfsize + offset
    const y1 = spacingY - halfsize - offset
    const dx = spacingX
    const dy = y0 * (1 - time) + y1 * time
    context.drawImage(image, 0, 0, size, size, dx, dy, size, size)
  }

  // 绘制缩放元素
  {
    const minScale = 0.5 * dpr
    const maxScale = 1.75 * dpr
    const side0 = size * minScale
    const side1 = size * maxScale
    const side = side0 * (1 - time) + side1 * time
    const halfside = side / 2
    const dx = spacingX * 2 + halfsize * 3 - halfside
    const dy = spacingY - halfside
    context.drawImage(image, size, 0, size, size, dx, dy, side, side)
  }

  // 绘制旋转元素
  {
    const angle = time * Math.PI * 2
    const ox = spacingX * 3 + halfsize * 5
    const oy = spacingY + 20
    context.translate(ox, oy)
    context.rotate(angle)
    context.drawImage(image, size * 2, 0, size, size, -halfsize, -halfsize, size, size)
    context.setTransform(1, 0, 0, 1, 0, 0)
  }

  // 绘制透明元素
  {
    const alpha = time
    const dx = spacingX * 4 + halfsize * 6
    const dy = spacingY + 20 - halfsize
    context.globalAlpha = alpha
    context.drawImage(image, size * 3, 0, size, size, dx, dy, size, size)
    context.globalAlpha = 1
  }
}

// 更新控制点
Easing.updatePoints = function () {
  const read = getElementReader('easing')
  const count = read('mode')
  const points = this.points
  const length = points.length
  if (length !== count) {
    points.length = count
    for (let i = length; i < count; i++) {
      points[i] = {
        x: read(`points-${i}-x`),
        y: read(`points-${i}-y`),
      }
    }
  }
}

// 选择控制点 - 通过坐标
Easing.selectPointByCoords = function (mouseX, mouseY) {
  let target = null
  let weight = 0
  const canvas = this.curve
  const fullSize = canvas.spacing * this.scale * 10
  const x = (mouseX - this.originX) / fullSize
  const y = (this.originY - mouseY) / fullSize
  const ifSelectUpper = mouseY < 20
  const ifSelectLower = mouseY >= canvas.height - 20
  const borderY =
    ifSelectUpper ? this.originY / fullSize
  : ifSelectLower ? (this.originY - canvas.height) / fullSize
  : null
  const points = this.points
  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i]
    const distX = Math.abs(point.x - x)
    const distY = Math.abs(point.y - y)
    if (distX <= 0.1 && distY <= 0.1 ||
      ifSelectUpper && distX <= 0.1 && point.y > borderY ||
      ifSelectLower && distX <= 0.1 && point.y < borderY) {
      const w = -Math.hypot(distX, distY)
      if (target === null || weight < w) {
        target = point
        weight = w
      }
    }
  }
  if (this.activePoint !== target) {
    this.activePoint = target
    this.requestRendering()
  }
  return target
}

// 创建控制点图像
Easing.createPointImage = function () {
  if (!this.pointImage) {
    File.get({
      local: 'Images/curve_mark.png',
      type: 'image',
    }).then(image => {
      this.pointImage = image
    })
  }
}

// 创建预览图像
Easing.createPreviewImage = function () {
  if (!this.previewImage) {
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 120
    const context = canvas.getContext('2d')
    const y = (canvas.height - 64) / 2 + 64 * 0.85
    context.fillStyle = '#000000'
    context.fillRect(0, 0, 480, 120)
    context.fillStyle = '#ffffff'
    context.textAlign = 'center'
    context.font = '64px Microsoft YaHei UI'
    context.fillText('Y', 60, y)
    context.fillText('A', 180, y)
    context.fillText('M', 300, y)
    context.fillText('I', 420, y)
    this.previewImage = canvas
  }
}

// 请求渲染
Easing.requestRendering = function () {
  if (this.data !== null) {
    Timer.appendUpdater('sharedRendering', this.renderingFunction)
  }
}

// 渲染函数
Easing.renderingFunction = function () {
  Easing.drawCurve()
}

// 停止渲染
Easing.stopRendering = function () {
  Timer.removeUpdater('sharedRendering', this.renderingFunction)
}

// 窗口 - 关闭事件
Easing.windowClose = function (event) {
  if (Easing.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedEasings'),
    }, [{
      label: get('yes'),
      click: () => {
        Easing.changed = false
        Window.close('easing')
      },
    }, {
      label: get('no'),
    }])
  }
}

// 窗口 - 已关闭事件
Easing.windowClosed = function (event) {
  this.list.saveSelection()
  this.curve.blur()
  this.timer.remove()
  this.data = null
  this.points = null
  this.curveMap = null
  this.easingMap = null
  this.activePoint = null
  this.previewImage = null
  this.list.clear()
  this.stopRendering()
}.bind(Easing)

// 设备像素比改变事件
Easing.dprchange = function (event) {
  if (this.data !== null) {
    this.updateCanvases()
    this.requestRendering()
  }
}.bind(Easing)

// 主题改变事件
Easing.themechange = function (event) {
  const canvas = this.curve
  switch (event.value) {
    case 'light':
      canvas.textColor = '#808080'
      canvas.gridColor = '#c0c0c0'
      canvas.axisColor = '#606060'
      canvas.curveColor = '#808080'
      canvas.curveColorActive = '#000000'
      canvas.linkColorActive = '#00a0f0'
      break
    case 'dark':
      canvas.textColor = '#808080'
      canvas.gridColor = '#404040'
      canvas.axisColor = '#808080'
      canvas.curveColor = '#000000'
      canvas.curveColorActive = '#d8d8d8'
      canvas.linkColorActive = '#00bbff'
      break
  }
  this.requestRendering()
}.bind(Easing)

// 数据 - 改变事件
Easing.dataChange = function (event) {
  this.changed = true
}.bind(Easing)

// 列表 - 键盘按下事件
Easing.listKeydown = function (event) {
  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyC':
        Easing.copy(item)
        break
      case 'KeyV':
        Easing.paste()
        break
    }
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'Insert':
        Easing.insert(item)
        break
      case 'Delete':
        Easing.delete(item)
        break
    }
  }
}

// 列表 - 选择事件
Easing.listSelect = function (event) {
  Easing.load(event.value)
}

// 列表 - 打开事件
Easing.listOpen = function (event) {
  Easing.setEasingKey(event.value)
}

// 列表 - 菜单弹出事件
Easing.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const pastable = Clipboard.has('yami.data.easing')
  const deletable = selected && Easing.data.length > 1
  const get = Local.createGetter('menuEasingList')
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('insert'),
    accelerator: 'Insert',
    click: () => {
      Easing.insert(item)
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: selected,
    click: () => {
      Easing.copy(item)
    },
  }, {
    label: get('paste'),
    accelerator: ctrl('V'),
    enabled: pastable,
    click: () => {
      Easing.paste(item)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      Easing.delete(item)
    },
  }, {
    label: get('rename'),
    accelerator: 'F2',
    enabled: selected,
    click: () => {
      this.rename(item)
    },
  }, {
    label: get('set-key'),
    enabled: selected,
    click: () => {
      Easing.setEasingKey(item)
    },
  }])
}

// 模式 - 选择事件
Easing.modeSelect = function (event) {
  this.updatePoints()
  const points = this.points
  const easingMap = this.easingMap
  const write = getElementWriter('easing')
  const read = getElementReader('easing')
  if (points.length === 5 &&
    points[2].x === 0 && points[2].y === 0 &&
    points[3].x === 0 && points[3].y === 0 &&
    points[4].x === 0 && points[4].y === 0) {
    const left = 0
    const right = 1
    const startX = left + (right - left) / 2
    const startY = easingMap.map(startX)
    const ctrlX0 = startX + (right - startX) / 3
    const ctrlY0 = easingMap.map(ctrlX0)
    const ctrlX1 = startX + (right - startX) * 2 / 3
    const ctrlY1 = easingMap.map(ctrlX1)
    write('points-2-x', startX)
    write('points-2-y', startY)
    write('points-3-x', ctrlX0)
    write('points-3-y', ctrlY0)
    write('points-4-x', ctrlX1)
    write('points-4-y', ctrlY1)
    for (let i = 2; i < 5; i++) {
      points[i].x = read(`points-${i}-x`)
      points[i].y = read(`points-${i}-y`)
    }
  }
  if (points.length === 8 &&
    points[5].x === 0 && points[5].y === 0 &&
    points[6].x === 0 && points[6].y === 0 &&
    points[7].x === 0 && points[7].y === 0) {
    const left = points[2].x
    const right = 1
    const startX = left + (right - left) / 2
    const startY = easingMap.map(startX)
    const ctrlX0 = startX + (right - startX) / 3
    const ctrlY0 = easingMap.map(ctrlX0)
    const ctrlX1 = startX + (right - startX) * 2 / 3
    const ctrlY1 = easingMap.map(ctrlX1)
    write('points-5-x', startX)
    write('points-5-y', startY)
    write('points-6-x', ctrlX0)
    write('points-6-y', ctrlY0)
    write('points-7-x', ctrlX1)
    write('points-7-y', ctrlY1)
    for (let i = 5; i < 8; i++) {
      points[i].x = read(`points-${i}-x`)
      points[i].y = read(`points-${i}-y`)
    }
  }
  this.updateMaps()
  this.requestRendering()
}.bind(Easing)

// 控制点输入框 - 输入事件
Easing.pointInput = function (event) {
  const key = Inspector.getKey(this)
  const value = this.read()
  const keys = key.split('-')
  const end = keys.length - 1
  let node = Easing.list.read()
  for (let i = 0; i < end; i++) {
    node = node[keys[i]]
  }
  const property = keys[end]
  if (node[property] !== value) {
    node[property] = value
  }
  Easing.updateMaps()
  Easing.requestRendering()
}

// 缩放单选框 - 输入事件
Easing.scaleInput = function (event) {
  this.scale = event.value
  this.requestRendering()
}.bind(Easing)

// 曲线画布 - 键盘按下事件
Easing.curveKeydown = function (event) {
  const point = this.activePoint
  if (point !== null) {
    switch (event.code) {
      case 'ArrowUp': {
        const index = this.points.indexOf(point)
        const element = $(`#easing-points-${index}-y`)
        element.write(point.y + 0.01)
        point.y = element.read()
        this.changed = true
        this.updateMaps()
        this.requestRendering()
        break
      }
      case 'ArrowDown': {
        const index = this.points.indexOf(point)
        const element = $(`#easing-points-${index}-y`)
        element.write(point.y - 0.01)
        point.y = element.read()
        this.changed = true
        this.updateMaps()
        this.requestRendering()
        break
      }
      case 'ArrowLeft': {
        const index = this.points.indexOf(point)
        const element = $(`#easing-points-${index}-x`)
        element.write(point.x - 0.01)
        point.x = element.read()
        this.changed = true
        this.updateMaps()
        this.requestRendering()
        break
      }
      case 'ArrowRight': {
        const index = this.points.indexOf(point)
        const element = $(`#easing-points-${index}-x`)
        element.write(point.x + 0.01)
        point.x = element.read()
        this.changed = true
        this.updateMaps()
        this.requestRendering()
        break
      }
    }
  }
}.bind(Easing)

// 曲线画布 - 指针按下事件
Easing.curvePointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const coords = event.getRelativeCoords(this.curve)
      const dpr = window.devicePixelRatio
      const x = coords.x * dpr
      const y = coords.y * dpr
      const selectedPoint = this.selectPointByCoords(x, y)
      if (selectedPoint) {
        this.dragging = event
        event.pointStartX = selectedPoint.x
        event.pointStartY = selectedPoint.y
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      break
    }
  }
}.bind(Easing)

// 曲线画布 - 鼠标滚轮事件
Easing.curveWheel = function (event) {
  if (!this.dragging && event.deltaY !== 0) {
    const radios = document.getElementsByName('easing-scale')
    const length = radios.length
    for (let i = 0; i < length; i++) {
      if (radios[i].dataValue === this.scale) {
        const step = event.deltaY < 0 ? -1 : 1
        const radio = radios[i + step]
        if (radio !== undefined) {
          radio.pointerdown(event)
        }
        break
      }
    }
  }
}.bind(Easing)

// 曲线画布 - 失去焦点事件
Easing.curveBlur = function (event) {
  this.pointerup()
  if (this.activePoint !== null) {
    this.activePoint = null
    this.requestRendering()
  }
}.bind(Easing)

// 指针弹起事件
Easing.pointerup = function (event) {
  const {dragging} = this
  if (dragging === null) {
    return
  }
  if (event === undefined) {
    event = dragging
  }
  if (this.dragging.relate(event)) {
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(Easing)

// 指针移动事件
Easing.pointermove = function (event) {
  if (this.activePoint !== null) {
    const dragging = this.dragging
    const point = this.activePoint
    const index = this.points.indexOf(point)
    const fullSize = this.curve.spacing * this.scale * 10
    const transX = Math.roundTo((event.clientX - dragging.clientX) / fullSize, 2)
    const transY = Math.roundTo((dragging.clientY - event.clientY) / fullSize, 2)
    const pointX = Math.clamp(Math.roundTo(dragging.pointStartX + transX, 2), 0, 1)
    const pointY = Math.clamp(Math.roundTo(dragging.pointStartY + transY, 2), -5, 5)
    const xInput = $(`#easing-points-${index}-x`)
    const yInput = $(`#easing-points-${index}-y`)
    xInput.write(pointX)
    yInput.write(pointY)
    point.x = xInput.read()
    point.y = yInput.read()
    this.changed = true
    this.updateMaps()
    this.requestRendering()
  }
}.bind(Easing)

// 回放 - 输入事件
Easing.reverseInput = function (event) {
  Easing.reverse = this.read()
}

// 持续时间 - 输入事件
Easing.durationInput = function (event) {
  Easing.duration = this.read()
  const timer = Easing.timer
  if (timer.state === 'playing') {
    const lastDuration = timer.duration
    timer.duration = Easing.duration
    timer.elapsed = timer.elapsed * timer.duration / lastDuration
  }
}

// 延时 - 输入事件
Easing.delayInput = function (event) {
  Easing.delay = this.read()
  const timer = Easing.timer
  if (timer.state === 'waiting') {
    const lastDuration = timer.duration
    timer.duration = Easing.delay
    timer.elapsed = timer.elapsed * timer.duration / lastDuration
  }
}

// 确定按钮 - 鼠标点击事件
Easing.confirm = function (event) {
  if (this.changed) {
    this.changed = false
    this.clear()
    // 删除数据绑定的元素对象
    const easings = this.data
    TreeList.deleteCaches(easings)
    Data.easings = easings
    Data.createGUIDMap(easings)
    File.planToSave(Data.manifest.project.easings)
    // 发送数据改变事件
    const datachange = new Event('datachange')
    datachange.key = 'easings'
    window.dispatchEvent(datachange)
  }
  Window.close('easing')
}.bind(Easing)

// 三次方曲线映射表类 - 必须使用Float64
// 因为Float32会导致部分点参数出现绘制BUG:线条变粗
// Chromium78-89都存在这个BUG而Chromium69是正常的
Easing.CurveMap = class CurveMap extends Float64Array {
  count //:number

  constructor() {
    super(6002)
  }

  // 更新数据
  update(...points) {
    const length = points.length - 1
    for (let i = 0; i < length; i += 3) {
      const {x: x0, y: y0} = points[i]
      const {x: x1, y: y1} = points[i + 1]
      const {x: x2, y: y2} = points[i + 2]
      const {x: x3, y: y3} = points[i + 3]
      const offset = (i / 3) * 2000
      for (let i = 0; i <= 1000; i++) {
        const t0 = i / 1000
        const t1 = 1 - t0
        const n0 = t1 ** 3
        const n1 = 3 * t0 * t1 ** 2
        const n2 = 3 * t0 ** 2 * t1
        const n3 = t0 ** 3
        const x = x0 * n0 + x1 * n1 + x2 * n2 + x3 * n3
        const y = y0 * n0 + y1 * n1 + y2 * n2 + y3 * n3
        this[offset + i * 2] = x
        this[offset + i * 2 + 1] = y
      }
    }
    this.count = Math.floor(points.length / 3) * 2000 + 2
  }
}

// 过渡映射表类
Easing.EasingMap = function IIFE() {
  const SCALE = 1000
  const round = Math.round
  return class EasingMap extends Float32Array {
    constructor() {
      super(SCALE + 1)
    }

    // 更新数据
    update(...points) {
      const length = points.length - 1
      let pos = -1
      for (let i = 0; i < length; i += 3) {
        const {x: x0, y: y0} = points[i]
        const {x: x1, y: y1} = points[i + 1]
        const {x: x2, y: y2} = points[i + 2]
        const {x: x3, y: y3} = points[i + 3]
        for (let n = 0; n <= SCALE; n++) {
          const t0 = n / SCALE
          const t1 = 1 - t0
          const n0 = t1 ** 3
          const n1 = 3 * t0 * t1 ** 2
          const n2 = 3 * t0 ** 2 * t1
          const n3 = t0 ** 3
          const x = x0 * n0 + x1 * n1 + x2 * n2 + x3 * n3
          const i = round(x * SCALE)
          if (i > pos && i <= SCALE) {
            const y = y0 * n0 + y1 * n1 + y2 * n2 + y3 * n3
            this[i] = y
            if (i > pos + 1) {
              for (let j = pos + 1; j < i; j++) {
                this[j] = this[pos] + (this[i] - this[pos]) * (j - pos) / (i - pos)
              }
            }
            pos = i
          }
        }
      }
      // 尾数不一定是精确值
      // 因此需要设置为1
      this[SCALE] = 1
      return this
    }

    // 映射
    map(time) {
      return this[round(time * SCALE)]
    }

    // 静态 - 缓入缓出
    static easeInOut = function IIFE() {
      const p1 = {x: 0, y: 0}
      const p2 = {x: 0.42, y: 0}
      const p3 = {x: 0.58, y: 1}
      const p4 = {x: 1, y: 1}
      const instance = new EasingMap()
      return instance.update(p1, p2, p3, p4)
    }()
  }
}()

// 列表 - 保存选项状态
Easing.list.saveSelection = function () {
  const {easings} = Data
  // 将数据保存在外部可以切换项目后重置
  if (easings.selection === undefined) {
    Object.defineProperty(easings, 'selection', {
      writable: true,
      value: '',
    })
  }
  const selection = this.read()
  if (selection) {
    easings.selection = selection.id
  }
}

// 列表 - 恢复选项状态
Easing.list.restoreSelection = function () {
  const id = Data.easings.selection
  const item = Easing.getItemById(id) ?? this.data[0]
  this.select(item)
  this.update()
  this.scrollToSelection()
}

// 列表 - 重写更新节点元素方法
Easing.list.updateNodeElement = function (element) {
  const {item} = element
  if (!element.textNode) {
    // 创建文本节点
    const textNode = document.createTextNode('')
    element.appendChild(textNode)


    // 设置元素属性
    element.draggable = true
    element.textNode = textNode

    // 调用组件创建器
    for (const creator of this.creators) {
      creator(item)
    }
  }

  // 调用组件更新器
  for (const updater of this.updaters) {
    updater(item)
  }
}

// 列表 - 重写更新项目名称方法
Easing.list.updateItemName = function (item) {
  this.updateTextNode(item)
  this.updateKeyTextNode(item)
}

// 列表 - 添加元素类名
Easing.list.addElementClass = function (item) {
  item.element.addClass('plain')
}

// 列表 - 更新文本节点
Easing.list.updateTextNode = function (item) {
  const textNode = item.element.textNode
  const items = item.parent.children
  const index = items.indexOf(item)
  const length = items.length
  const digits = Number.computeIndexDigits(length)
  const sn = index.toString().padStart(digits, '0')
  const text = `${sn}:${item.name}`
  if (textNode.nodeValue !== text) {
    textNode.nodeValue = text
  }
}

// 创建键文本节点
Easing.list.createKeyTextNode = function (item) {
  const keyTextNode = document.createElement('text')
  keyTextNode.key = ''
  keyTextNode.addClass('variable-init-text')
  item.element.appendChild(keyTextNode)
  item.element.keyTextNode = keyTextNode
}

// 更新键文本节点
Easing.list.updateKeyTextNode = function (item) {
  const keyTextNode = item.element.keyTextNode
  const key = item.key
  if (keyTextNode.key !== key) {
    keyTextNode.key = key
    keyTextNode.textContent = ' = ' + key
  }
}

// ******************************** 队伍窗口 ********************************

const Team = {
  // properties
  list: $('#team-list'),
  data: null,
  maximum: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  createId: null,
  createData: null,
  getItemById: null,
  unpackTeams: null,
  packTeams: null,
  // events
  windowClose: null,
  windowClosed: null,
  listKeydown: null,
  listPointerdown: null,
  listSelect: null,
  listChange: null,
  listPopup: null,
  confirm: null,
}

// list methods
Team.list.insert = null
Team.list.copy = null
Team.list.paste = null
Team.list.delete = null
Team.list.saveSelection = null
Team.list.restoreSelection = null
Team.list.updateNodeElement = Easing.list.updateNodeElement
Team.list.createIcon = null
Team.list.updateIcon = null
Team.list.updateItemName = null
Team.list.addElementClass = Easing.list.addElementClass
Team.list.updateTextNode = Easing.list.updateTextNode
Team.list.createMarks = null
Team.list.updateMarks = null

// 初始化
Team.initialize = function () {
  // 设置最大数量
  this.maximum = 256

  // 绑定队伍列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.creators.push(list.createIcon)
  list.updaters.push(list.updateTextNode)
  list.creators.push(list.createMarks)
  list.updaters.push(list.updateMarks)

  // 侦听事件
  $('#team').on('close', this.windowClose)
  $('#team').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('select', this.listSelect)
  list.on('change', this.listChange)
  list.on('popup', this.listPopup)
  $('#team-confirm').on('click', this.confirm)
}

// 打开窗口
Team.open = function (data) {
  Window.open('team')

  // 解包队伍数据
  this.unpackTeams()

  // 更新列表项目
  this.list.restoreSelection()

  // 列表获得焦点
  this.list.getFocus()
}

// 创建ID
Team.createId = function () {
  let id
  do {id = GUID.generate64bit()}
  while (this.getItemById(id))
  return id
}

// 创建数据
Team.createData = function () {
  const id = this.createId()
  const relations = {}
  const collisions = {}
  const teams = this.data
  for (const {id} of teams) {
    relations[id] = 1
    collisions[id] = 1
  }
  relations[id] = 1
  collisions[id] = 1
  return {
    id: id,
    name: '',
    color: '000000ff',
    relations: relations,
    collisions: collisions,
  }
}

// 获取ID匹配的数据
Team.getItemById = Easing.getItemById

// 解包队伍数据
Team.unpackTeams = function () {
  const items = Data.teams.list
  const length = items.length
  const sRelations = Codec.decodeTeamData(Data.teams.relations, length)
  const sCollisions = Codec.decodeTeamData(Data.teams.collisions, length)
  const copies = new Array(length)
  const a = length * 2
  for (let i = 0; i < length; i++) {
    const item = items[i]
    const dRelations = {}
    const dCollisions = {}
    for (let j = 0; j < i; j++) {
      const ri = (a - j + 1) / 2 * j - j + i
      const id = items[j].id
      dRelations[id] = sRelations[ri]
      dCollisions[id] = sCollisions[ri]
    }
    const b = (a - i + 1) / 2 * i - i
    for (let j = i; j < length; j++) {
      const ri = b + j
      const id = items[j].id
      dRelations[id] = sRelations[ri]
      dCollisions[id] = sCollisions[ri]
    }
    copies[i] = {
      id: item.id,
      name: item.name,
      color: item.color,
      relations: dRelations,
      collisions: dCollisions,
    }
  }
  this.data = copies
}

// 打包队伍数据
Team.packTeams = function () {
  const items = this.data
  const length = items.length
  const copies = new Array(length)
  const dRelations = GL.arrays[0].uint8
  const dCollisions = GL.arrays[1].uint8
  let ri = 0
  for (let i = 0; i < length; i++) {
    const item = items[i]
    const sRelations = item.relations
    const sCollisions = item.collisions
    for (let j = i; j < length; j++, ri++) {
      const id = items[j].id
      dRelations[ri] = sRelations[id]
      dCollisions[ri] = sCollisions[id]
    }
    copies[i] = {
      id: item.id,
      name: item.name,
      color: item.color,
    }
  }
  Data.teams.list = copies
  Data.teams.relations = Codec.encodeTeamData(new Uint8Array(dRelations.buffer, 0, ri))
  Data.teams.collisions = Codec.encodeTeamData(new Uint8Array(dCollisions.buffer, 0, ri))
  Data.createTeamMap()
}

// 窗口 - 关闭事件
Team.windowClose = function (event) {
  if (Team.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedTeams'),
    }, [{
      label: get('yes'),
      click: () => {
        Team.changed = false
        Window.close('team')
      },
    }, {
      label: get('no'),
    }])
  }
}

// 窗口 - 已关闭事件
Team.windowClosed = function (event) {
  this.data = null
  this.list.clear()
}.bind(Team)

// 列表 - 键盘按下事件
Team.listKeydown = function (event) {
  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyC':
        this.copy(item)
        break
      case 'KeyV':
        this.paste()
        break
    }
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'Insert':
        this.insert(item)
        break
      case 'Delete':
        this.delete(item)
        break
    }
  }
}

// 列表 - 指针按下事件
Team.listPointerdown = function (event) {
  switch (event.button) {
    case 0:
      // 设置队伍颜色
      if (event.target.hasClass('team-icon')) {
        const element = event.target.parentNode
        const team = element.item
        return Color.open({
          read: () => {
            return team.color
          },
          input: color => {
            team.color = color
            this.updateIcon(team)
            Team.changed = true
          }
        })
      }
      // 设置队伍关系
      if (event.target.hasClass('team-relation-mark')) {
        const element = event.target.parentNode
        const teamA = this.read()
        const teamB = element.item
        teamA.relations[teamB.id] ^= 1
        if (teamA !== teamB) {
          teamB.relations[teamA.id] ^= 1
        }
        this.updateMarks(teamB)
        Team.changed = true
      }
      // 设置队伍碰撞
      if (event.target.hasClass('team-collision-mark')) {
        const element = event.target.parentNode
        const teamA = this.read()
        const teamB = element.item
        teamA.collisions[teamB.id] ^= 1
        if (teamA !== teamB) {
          teamB.collisions[teamA.id] ^= 1
        }
        this.updateMarks(teamB)
        Team.changed = true
      }
      break
  }
}

// 列表 - 选择事件
Team.listSelect = function (event) {
  // 更新队伍关系
  for (const team of this.data) {
    const element = team.element
    if (element !== undefined) {
      element.changed = true
      if (element.parentNode) {
        this.updateMarks(team)
      }
    }
  }
}

// 列表 - 改变事件
Team.listChange = function (event) {
  Team.changed = true
}

// 列表 - 菜单弹出事件
Team.listPopup = function (event) {
  const item = event.value
  const length = Team.data.length
  const selected = !!item
  const insertable = length < Team.maximum
  const pastable = insertable && Clipboard.has('yami.data.team')
  const deletable = selected && length > 1
  const get = Local.createGetter('menuTeamList')
  Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('insert'),
    accelerator: 'Insert',
    enabled: insertable,
    click: () => {
      this.insert(item)
    },
  }, {
    label: get('copy'),
    accelerator: ctrl('C'),
    enabled: selected,
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
    enabled: selected,
    click: () => {
      this.rename(item)
    },
  }])
}

// 确定按钮 - 鼠标点击事件
Team.confirm = function (event) {
  if (this.changed) {
    this.changed = false
    this.packTeams()
    File.planToSave(Data.manifest.project.teams)
    const datachange = new Event('datachange')
    datachange.key = 'teams'
    window.dispatchEvent(datachange)
  }
  Window.close('team')
}.bind(Team)

// 列表 - 插入
Team.list.insert = function (dItem) {
  if (this.data.length < Team.maximum) {
    const team = Team.createData()
    const id = team.id
    for (const item of this.data) {
      item.relations[id] = 1
      item.collisions[id] = 1
    }
    this.addNodeTo(team, dItem)
  }
}

// 列表 - 复制
Team.list.copy = function (item) {
  if (item) {
    Clipboard.write('yami.data.team', item)
  }
}

// 列表 - 粘贴
Team.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.team')
  if (copy) {
    const dId = Team.createId()
    const cRelations = copy.relations
    const cCollisions = copy.collisions
    const dRelations = {}
    const dCollisions = {}
    for (const item of this.data) {
      const sId = item.id
      const sRelations = item.relations
      const sCollisions = item.collisions
      const r = cRelations[sId] ?? 1
      const c = cCollisions[sId] ?? 1
      sRelations[dId] = r
      sCollisions[dId] = c
      dRelations[sId] = r
      dCollisions[sId] = c
    }
    dRelations[dId] = 1
    dCollisions[dId] = 1
    copy.name += ' - Copy'
    copy.id = dId
    copy.relations = dRelations
    copy.collisions = dCollisions
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
Team.list.delete = function (item) {
  const items = this.data
  if (items.length > 1) {
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('deleteSingleFile').replace('<filename>', item.name),
    }, [{
      label: get('yes'),
      click: () => {
        const id = item.id
        for (const item of items) {
          delete item.relations[id]
        }
        const index = items.indexOf(item)
        this.deleteNode(item)
        const last = items.length - 1
        this.select(items[Math.min(index, last)])
      },
    }, {
      label: get('no'),
    }])
  }
}

// 列表 - 保存选项状态
Team.list.saveSelection = function () {
  const {teams} = Data
  // 将数据保存在外部可以切换项目后重置
  if (teams.selection === undefined) {
    Object.defineProperty(teams, 'selection', {
      writable: true,
      value: '',
    })
  }
  const selection = this.read()
  if (selection) {
    teams.selection = selection.id
  }
}

// 列表 - 恢复选项状态
Team.list.restoreSelection = function () {
  const id = Data.teams.selection
  const item = Team.getItemById(id) ?? this.data[0]
  this.select(item)
  this.update()
  this.scrollToSelection()
}

// 列表 - 重写创建图标方法
Team.list.createIcon = function (item) {
  const {element} = item
  const icon = document.createElement('node-icon')
  icon.addClass('team-icon')
  element.nodeIcon = icon
  element.insertBefore(icon, element.textNode)
  Team.list.updateIcon(item)
}

// 列表 - 更新图标
Team.list.updateIcon = function (item) {
  const icon = item.element.nodeIcon
  const color = item.color
  if (icon.color !== color) {
    icon.color = color
    const r = parseInt(color.slice(0, 2), 16)
    const g = parseInt(color.slice(2, 4), 16)
    const b = parseInt(color.slice(4, 6), 16)
    const a = parseInt(color.slice(6, 8), 16) / 255
    icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`
  }
}

// 列表 - 重写更新项目名称方法
Team.list.updateItemName = function (item) {
  this.updateTextNode(item)
}

// 列表 - 创建标记
Team.list.createMarks = function (item) {
  const {element} = item
  // 创建关系标记
  const relationMark = document.createElement('text')
  relationMark.addClass('team-relation-mark')
  element.relationMark = relationMark
  element.appendChild(relationMark)
  // 创建碰撞标记
  const collisionMark = document.createElement('text')
  collisionMark.addClass('team-collision-mark')
  collisionMark.textContent = '\uf066'
  element.collisionMark = collisionMark
  element.appendChild(collisionMark)
}

// 列表 - 更新标记
Team.list.updateMarks = function (item) {
  const selection = Team.list.read()
  if (selection === null) return
  // 更新关系标记
  const relationMark = item.element.relationMark
  const relations = selection.relations
  const relation = relations[item.id]
  if (relationMark.relation !== relation) {
    relationMark.relation = relation
    switch (relation) {
      case 0:
        relationMark.removeClass('friend')
        relationMark.addClass('enemy')
        relationMark.textContent = '\uf119'
        break
      case 1:
        relationMark.removeClass('enemy')
        relationMark.addClass('friend')
        relationMark.textContent = '\uf118'
        break
    }
  }
  // 更新碰撞标记
  const collisionMark = item.element.collisionMark
  const collisions = selection.collisions
  const collision = collisions[item.id]
  if (collisionMark.collision !== collision) {
    collisionMark.collision = collision
    switch (collision) {
      case 0:
        collisionMark.removeClass('on')
        break
      case 1:
        collisionMark.addClass('on')
        break
    }
  }
}