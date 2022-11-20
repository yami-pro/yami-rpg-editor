'use strict'

import {
  Data,
  Directory,
  File,
  FSP,
  GL,
  GUID,
  Log,
  Meta,
  Path
} from '../yami'

// ******************************** 文件项目 ********************************

class FileItem {
  meta      //:object
  name      //:string
  alias     //:string
  basename  //:string
  extname   //:string
  path      //:string
  type      //:string
  stats     //:object
  contexts  //:object

  constructor(name, extname, path, type, stats) {
    let basename = Path.basename(name, extname)
    const match = basename.match(FileItem.guidRegExp)
    if (match) basename = basename.slice(0, match.index - 1)
    this.meta = null
    this.name = name
    this.alias = basename + extname
    this.basename = basename
    this.extname = extname
    this.path = path
    this.type = type
    this.stats = stats
    this.contexts = null

    // 创建元数据
    this.createMeta(match?.[0])

    // 加载脚本
    switch (type) {
      case 'image':
        GL.textureManager.updateImage(this.meta.guid)
        break
      case 'script':
        Data.loadScript(this)
        break
    }
  }

  // 读取数据
  get data() {
    const {meta} = this
    const {guid} = meta
    const {guidMap} = Data.manifest
    if (guidMap[guid] === meta) {
      return meta.dataMap?.[guid]
    }
    return undefined
  }

  // 创建元数据
  createMeta(guid) {
    const stats = this.stats
    const file = Directory.inoMap[stats.ino]
    // 使关联的元数据重定向到这个文件
    if (file instanceof FileItem) {
      const meta = file.meta
      if ((guid === undefined ||
        meta.guid === guid) &&
        meta.redirect(this)) {
        this.meta = meta
        this.meta.mtimeMs = stats.mtimeMs
        this.updateFileName(meta.guid)
        return
      }
    }
    // 如果GUID不存在或冲突则新建GUID
    // 如果GUID重复则不要修改避免丢失
    if (guid === undefined) {
      do {guid = GUID.generate64bit()}
      while (Data.manifest.guidMap[guid])
      this.updateFileName(guid)
    } else {
      if (Log.devmode && Data.manifest.guidMap[guid]) {
        throw new Error(`GUID already exists: ${guid}`)
      }
    }
    this.meta = new Meta(this, guid)
    this.meta.mtimeMs = stats.mtimeMs
  }

  // 更新文件名称
  updateFileName(guid) {
    const basename = this.basename
    const extname = this.extname
    // 如果代码被修改可能导致批量的错误命名结果
    // 因此进行文件名组成部分类型检查
    if (typeof guid !== 'string' ||
      typeof basename !== 'string' ||
      typeof extname !== 'string') {
      throw new Error('Failed to update File Name')
    }
    const name = `${basename}.${guid}${extname}`
    if (this.name !== name) {
      const dir = Path.dirname(this.path)
      const path = `${dir}/${name}`
      const sPath = File.route(this.path)
      const dPath = File.route(path)
      const promise = this.promise ?? Promise.resolve()
      this.promise = promise.then(() => {
        return FSP.rename(sPath, dPath).then(() => {
          // console.log(this.name, this.path)
          this.name = name
          this.path = path
          this.meta?.redirect(this)
          // console.log(this.meta.path)
        })
      })
    }
  }

  // 获取上下文对象
  getContext(key) {
    let contexts = this.contexts
    if (contexts === null) {
      contexts = this.contexts = new Map()
    }
    let context = contexts.get(key)
    if (context === undefined) {
      contexts.set(key, context = {})
    }
    return context
  }

  // 静态属性 - 数据映射表的名称
  static dataMapNames = {
    'actor': 'actors',
    'skill': 'skills',
    'trigger': 'triggers',
    'item': 'items',
    'equipment': 'equipments',
    'state': 'states',
    'event': 'events',
    'scene': 'scenes',
    'tileset': 'tilesets',
    'ui': 'ui',
    'animation': 'animations',
    'particle': 'particles',
    'script': 'scripts',
  }

  // 静态属性 - GUID正则表达式
  static guidRegExp = /(?<=\.)[0-9a-f]{16}$/

  // 静态方法 - 判断是不是数据文件
  static isDataFile(file) {
    return FileItem.dataMapNames[file.type] !== undefined
  }
}

// ******************************** 文件项目导出 ********************************

export { FileItem }
