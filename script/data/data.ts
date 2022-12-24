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
  PluginManager,
  ErrorMsg,
  FileItem
} from "../yami"

// ******************************** 数据对象 ********************************

namespace Type {
  export type node = {
    [key: string]:
      number |
      boolean |
      string |
      node |
      node[]
  }
  export type list = node[] & {
    items: Type.node[]
  }
  export type meta = InstanceType<typeof Meta>
  export type manifest = Manifest & {[key: string]: meta[]}
  export type assert = {
    path: string
    x?: number
    y?: number
  }
}

interface Data {
  // properties
  manifest: Type.manifest | null
  uiLinks: Type.node | null
  actors: Type.node | null
  skills: Type.node | null
  triggers: Type.node | null
  items: Type.node | null
  equipments: Type.node | null
  states: Type.node | null
  events: Type.node | null
  scripts: {[key: string]: Type.meta} | null
  easings: Type.node[] & {
    items: Type.node[]
    map: Type.node
    selection: string
  } | null
  teams: Type.node | null
  autotiles: Type.node[] | null
  variables: Type.node[] | null
  attribute: Type.node | null
  enumeration: Type.node | null
  plugins: Type.node[] | null
  commands: Type.node[] | null
  config: Type.node | null
  scenes: Type.node | null
  ui: Type.node | null
  animations: Type.node | null
  particles: Type.node | null
  tilesets: Type.node | null
  // methods
  fuck(): void
  loadAll(): Promise<void>
  loadMeta(): Promise<void>
  loadFile(filename: string): Promise<Type.node>
  loadScene(guid: string): Promise<Type.node>
  close(): void
  createEasingItems(): Type.node[]
  createTeamItems(): Type.node[]
  createDataMaps(): void
  createGUIDMap(list: Type.node[]): void
  createTeamMap(): void
  createVariableMap(): void
  createAttributeContext(): void
  createEnumerationContext(): void
  addUILinks(uiId: string): void
  removeUILinks(uiId: string): void
  createManifest(): void
  saveManifest(): Promise<void> | null
  inheritMetaData(): void
  parseGUID(meta: Type.assert): string
  loadScript(file: FileItem): Promise<void>
}

const Data = <Data & Type.node>{}

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
  const animations = <Type.node>this.animations
  for (let [key, animation] of Object.entries(animations)) {
    animation = <Type.node>animation
    const motions = <Type.node[]>animation.motions
    for (const motion of motions) {
      const dirMap = motion.dirMap
      delete motion.dirMap
      motion.dirCases = dirMap
    }
    if (Data.manifest !== null) {
      File.planToSave(Data.manifest.guidMap[key])
    }
  }
}

// 加载所有文件
Data.loadAll = async function () {
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
    if (this.easings !== null) {
      Data.createGUIDMap(this.easings)
    }
    if (this.autotiles !== null) {
      Data.createGUIDMap(this.autotiles)
    }
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
Data.loadFile = async function (filename) {
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
      if (this.manifest !== null) {
        this.manifest.project[filename] = meta
        this.manifest.guidMap[meta.guid] = meta
      }
      const node = <Data & Type.node>this
      return node[filename] = data
    }
  )
}

// 加载场景
Data.loadScene = async function (guid) {
  const {scenes} = this
  if (scenes !== null && scenes[guid]) {
    return new Promise(resolve => {
      resolve(Codec.decodeScene(scenes[guid]))
    })
  }
  if (this.manifest === null) {
    return new Promise((resolve, reject) => {
      reject(new Error(ErrorMsg.E00000062))
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
        if (scenes !== null) {
          scenes[guid] = <Type.node>code
        }
        return Codec.decodeScene(code)
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
  if (this.easings === null)
    return []
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
  const list = <Type.list>this.teams?.list
  let items = list.items
  if (items === undefined) {
    items = list.items = []
    const teams = list
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
  const map: Type.node = {}
  for (const item of list) {
    map[<string>item.id] = item
  }
  Object.defineProperty(list, 'map', {
    configurable: true,
    value: map,
  })
}

// 创建队伍映射表
Data.createTeamMap = function () {
  const map: Type.node = {}
  const list = <Type.node[]>this.teams?.list
  for (const item of list) {
    map[<string>item.id] = item
  }
  Object.defineProperty(this.teams, 'map', {
    configurable: true,
    value: map,
  })
}

// 创建变量映射表
Data.createVariableMap = function IIFE() {
  const set = (items: Type.node[], map: Type.node) => {
    for (const item of items) {
      if (item.children) {
        set(<Type.node[]>item.children, map)
      } else {
        map[<string>item.id] = item
      }
    }
  }
  return function (this: Data) {
    const map: Type.node = {}
    if (this.variables === null) {
      return
    }
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
  let guid: string
  let uiLinks: Type.node | null
  const setMap = (nodes: Type.node[]) => {
    for (const node of nodes) {
      if (uiLinks === null)
        continue
      uiLinks[<string>node.presetId] = guid
      const children = <Type.node[]>node.children
      if (children.length !== 0) {
        setMap(children)
      }
    }
  }
  return function (this: Data, uiId: string) {
    if (this.ui === null)
      return
    const ui = <Type.node>this.ui[uiId]
    if (ui) {
      guid = uiId
      uiLinks = this.uiLinks
      setMap(<Type.node[]>ui.nodes)
      uiLinks = null
    }
  }
}()

// 移除UI预设元素链接
Data.removeUILinks = function IIFE() {
  let guid: string
  let uiLinks: Type.node | null
  const unlink = (nodes: Type.node[]) => {
    for (const node of nodes) {
      const {presetId} = node
      if (uiLinks === null)
        continue
      if (uiLinks[<string>presetId] === guid) {
        delete uiLinks[<string>presetId]
      }
      const children = <Type.node []>node.children
      if (children.length !== 0) {
        unlink(children)
      }
    }
  }
  return function (this: Data, uiId: string) {
    if (this.ui === null)
      return
    const ui = <Type.node>this.ui[uiId]
    if (ui) {
      guid = uiId
      uiLinks = this.uiLinks
      unlink(<Type.node[]>ui.nodes)
      uiLinks = null
    }
  }
}()

// 创建元数据清单
Data.createManifest = function () {
  this.manifest = <Type.manifest>new Manifest()
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
  const last = manifest?.last
  const map = manifest?.guidMap
  if (last === undefined || map === undefined)
    return
  for (const scene of last.scenes) {
    const guid = this.parseGUID(scene)
    const meta = <Type.meta>map[guid]
    if (meta !== undefined) {
      meta.x = scene.x
      meta.y = scene.y
    }
  }
  for (const tileset of last.tilesets) {
    const guid = this.parseGUID(tileset)
    const meta = <Type.meta>map[guid]
    if (meta !== undefined) {
      meta.x = tileset.x
      meta.y = tileset.y
    }
  }
  delete manifest?.last
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
Data.loadScript = async function (file: FileItem) {
  const meta = file.meta
  if (meta !== undefined && meta !== null) {
    const {scripts} = this
    if (scripts === null) {
      return
    }
    const {guid} = meta
    await file.promise
    const script = await File.get({
      path: file.path,
      type: 'text',
    }).then(code => {
      PluginManager.parseMeta(meta, code)
      return scripts[guid] = meta
    }).catch(error => {
      delete scripts[guid]
      return null
    })
    if (script !== null) {
      scripts[guid] = script
    }
  }
}

// ******************************** 数据对象导出 ********************************

export { Data }
