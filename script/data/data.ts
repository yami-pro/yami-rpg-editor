"use strict"

import {
  AttributeContext,
  Codec,
  Editor,
  EnumerationContext,
  File,
  FSP,
  Log,
  Manifest,
  Meta,
  PluginManager
} from "../yami"

// ******************************** 数据对象 ********************************

namespace Type {
  export type meta = InstanceType<typeof Meta>
  export type manifest = Manifest & {[key: string]: meta[]}
  type guid = string
  export type config = {
    gameId: guid
    window: {
      title: string
      width: number
      height: number
      display: string
    }
    resolution: {
      width: number
      height: number
    }
    scene: {
      padding: number
      animationInterval: number
    }
    tileArea: {
      expansionTop: number
      expansionLeft: number
      expansionRight: number
      expansionBottom: number
    }
    animationArea: {
      expansionTop: number
      expansionLeft: number
      expansionRight: number
      expansionBottom: number
    }
    lightArea: {
      expansionTop: number
      expansionLeft: number
      expansionRight: number
      expansionBottom: number
    }
    collision: {
      actor: {
        enabled: boolean
        ignoreTeamMember: boolean
      }
      scene: {
        enabled: boolean
        actorSize: number
      }
    }
    font: {
      imports: []
      default: string
      pixelated: boolean
      threshold: number
    }
    event: {
      startup: guid
      loadGame: guid
      initScene: guid
      showText: guid
      showChoices: guid
    }
    actor: {
      playerTeam: guid
      playerActor: guid
      partyMembers: guid[]
      partyInventory: string
      tempAttributes: {key: guid, value: guid | number}[]
    }
    animation: {
      frameRate: number
    }
    script: {
      language: "javascript" | "typescript"
      outDir: "dist"
    }
    startPosition: {
      sceneId: guid
      x: number
      y: number
    }
    indexedColors: {name: string, code: string}[]
  }
}

interface Data {
  // properties
  manifest: Type.manifest | null
  uiLinks: null
  actors: null
  skills: null
  triggers: null
  items: null
  equipments: null
  states: null
  events: null
  scripts: null
  easings: null
  teams: null
  autotiles: null
  variables: null
  attribute: null
  enumeration: null
  plugins: null
  commands: null
  config: Type.config | null
  scenes: null
  ui: null
  animations: null
  particles: null
  tilesets: null
  // methods
  fuck(): void
  loadAll(): Promise<void>
  loadMeta(): Promise<void>
  loadFile(filename: string): Promise<HTMLImageElement>
  loadScene(guid: string): Promise<any>
  close(): void
  createEasingItems(): any
  createTeamItems(): any
  createDataMaps(): void
  createGUIDMap(list: any): void
  createTeamMap(): void
  createVariableMap(): void
  createAttributeContext(): void
  createEnumerationContext(): void
  addUILinks(uiId: string): void
  removeUILinks(uiId: any): void
  createManifest(): void
  saveManifest(): Promise<void> | null
  inheritMetaData(): void
  parseGUID(meta: any): any
  loadScript(file: any): Promise<void>
}

const Data = <Data>{}

// ******************************** 数据对象加载 ********************************

Data.manifest = null
Data.uiLinks = null
Data.actors = null
Data.skills = null
Data.triggers = null
Data.items = null
Data.equipments = null
Data.states = null
Data.events = null
Data.scripts = null
Data.easings = null
Data.teams = null
Data.autotiles = null
Data.variables = null
Data.attribute = null
Data.enumeration = null
Data.plugins = null
Data.commands = null
Data.config = null
Data.scenes = null
Data.ui = null
Data.animations = null
Data.particles = null
Data.tilesets = null

Data.fuck = function () {
  for (const [key, animation] of Object.entries(this.animations)) {
    for (const motion of animation.motions) {
      const dirMap = motion.dirMap
      delete motion.dirMap
      motion.dirCases = dirMap
    }
    File.planToSave(Data.manifest.guidMap[key])
  }
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
  })
}

// 加载元数据
Data.loadMeta = function () {
  const path = 'manifest.json'
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
  const path = `data/${filename}.json`
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
  this.uiLinks = null
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
  this.uiLinks = {}
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

// 添加UI预设元素链接
Data.addUILinks = function IIFE() {
  let guid
  let uiLinks
  const setMap = nodes => {
    for (const node of nodes) {
      uiLinks[node.presetId] = guid
      if (node.children.length !== 0) {
        setMap(node.children)
      }
    }
  }
  return function (uiId) {
    const ui = this.ui[uiId]
    if (ui) {
      guid = uiId
      uiLinks = this.uiLinks
      setMap(ui.nodes)
      uiLinks = null
    }
  }
}()

// 移除UI预设元素链接
Data.removeUILinks = function IIFE() {
  let guid
  let uiLinks
  const unlink = nodes => {
    for (const node of nodes) {
      const {presetId} = node
      if (uiLinks[presetId] === guid) {
        delete uiLinks[presetId]
      }
      if (node.children.length !== 0) {
        unlink(node.children)
      }
    }
  }
  return function (uiId) {
    const ui = this.ui[uiId]
    if (ui) {
      guid = uiId
      uiLinks = this.uiLinks
      unlink(ui.nodes)
      uiLinks = null
    }
  }
}()

// 创建元数据清单
Data.createManifest = function () {
  this.manifest = new Manifest()
}

// 保存元数据清单
Data.saveManifest = function () {
  const manifest = this.manifest
  if (manifest?.changed) {
    manifest.changed = false
    const json = JSON.stringify(manifest, null, 2)
    const last = manifest.code
    if (json !== last) {
      const path = File.route('manifest.json')
      return Editor.protectPromise(
        FSP.writeFile(path, json)
        .then(() => {
          manifest.code = json
        }).catch(error => {
          const cache = `${path}.cache`
          FSP.writeFile(cache, json)
          FSP.writeFile(path, last)
          Log.throw(error)
        })
      )
    }
  }
  return null
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
      PluginManager.parseMeta(meta, code)
      return scripts[guid] = meta
    }).catch(error => {
      delete scripts[guid]
    })
  }
}

// ******************************** 数据对象导出 ********************************

export { Data }
