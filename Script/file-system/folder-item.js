'use strict'

import * as Yami from '../yami.js'

// ******************************** 文件夹项目 ********************************

class FolderItem {
  name        //:string
  path        //:string
  stats       //:object
  parent      //:object
  children    //:array
  subfolders  //:array
  contexts    //:object

  constructor(name, path, parent) {
    this.name = name
    this.path = path
    this.stats = null
    this.parent = parent
    this.children = Array.empty
    this.subfolders = Array.empty
    this.contexts = null
  }

  // 获取上下文对象
  getContext(key) {
    let contexts = this.contexts
    if (contexts === null) {
      contexts = this.contexts = new Map()
    }
    let context = contexts.get(key)
    if (context === undefined) {
      contexts.set(key, context = {
        expanded: false,
      })
    }
    return context
  }

  // 更新目录
  async update(context = {changed: false, promises: []}) {
    const bigint = FolderItem.bigint
    const path = Yami.File.route(this.path)
    const pStat = Yami.FSP.stat(path, bigint)
    const pReaddir = this.readdir(context)
    const stats = await pStat
    if (this.stats?.mtimeMs !== stats.mtimeMs) {
      context.changed = true
    }
    this.stats = stats
    await pReaddir
    return context
  }

  // 读取目录
  async readdir(context) {
    // 创建旧的文件集合
    const map = {}
    const nodes = this.children
    if (nodes instanceof Array) {
      const length = nodes.length
      for (let i = 0; i < length; i++) {
        const item = nodes[i]
        map[item.path] = item
      }
    }

    // 读取新的文件目录
    const dir = this.path
    const path = Yami.File.route(dir)
    const files = await Yami.FSP.readdir(
      path, {withFileTypes: true},
    )
    const length = files.length
    const promises = new Array(length)
    const children = new Array(length)
    const subfolders = []
    const bigint = FolderItem.bigint
    for (let i = 0; i < length; i++) {
      const file = files[i]
      const name = file.name
      const path = `${dir}/${name}`
      if (file.isDirectory()) {
        let item = map[path]
        if (!(item instanceof FolderItem)) {
          item = new FolderItem(name, path, this)
          context.changed = true
        }
        promises[i] = item.update(context)
        children[i] = item
        subfolders.push(item)
      } else {
        promises[i] = Yami.FSP.stat(Yami.File.route(path), bigint)
        children[i] = path
      }
    }

    // 获取未改变的项目
    // 以及创建新的项目
    const {extnameToTypeMap} = FolderItem
    for (let i = 0; i < length; i++) {
      const response = await promises[i]
      if (children[i] instanceof FolderItem) {
        continue
      }
      const path = children[i]
      const stats = response
      let item = map[path]
      if (item === undefined ||
        item.stats.mtimeMs !== stats.mtimeMs) {
        const name = files[i].name
        const extname = Yami.Path.extname(name)
        const type = extnameToTypeMap[extname.toLowerCase()] ?? 'other'
        item = new Yami.FileItem(name, extname, path, type, stats)
        if (item.promise instanceof Promise) {
          context.promises.push(item.promise.finally(() => {
            delete item.promise
          }))
        }
        context.changed = true
      }
      const meta = item.meta
      if (meta !== null) {
        meta.versionId = Yami.Meta.meta.versionId
      }
      children[i] = item
    }
    this.children = children
    this.subfolders = subfolders
  }

  // 静态 - 扩展名 -> 类型映射表
  static extnameToTypeMap = {
    // 数据类型
    '.actor': 'actor',
    '.skill': 'skill',
    '.trigger': 'trigger',
    '.item': 'item',
    '.equip': 'equipment',
    '.state': 'state',
    '.event': 'event',
    '.scene': 'scene',
    '.tile': 'tileset',
    '.ui': 'ui',
    '.anim': 'animation',
    '.particle': 'particle',
    // 图像类型
    '.png': 'image',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.cur': 'image',
    '.webp': 'image',
    // 音频类型
    '.mp3': 'audio',
    '.m4a': 'audio',
    '.ogg': 'audio',
    '.wav': 'audio',
    '.flac': 'audio',
    // 视频类型
    '.mp4': 'video',
    '.mkv': 'video',
    '.webm': 'video',
    // 脚本类型
    '.js': 'script',
    '.ts': 'script',
    // 字体类型
    '.ttf': 'font',
    '.otf': 'font',
    '.woff': 'font',
    '.woff2': 'font',
  }

  // Yami.FSP.stat选项 - 64位整数
  // 默认类型的stats因为精度问题可能产生相同的ino
  static bigint = {bigint: true}

  // 静态方法 - 创建项目
  static async create(path) {
    const name = Yami.Path.basename(path)
    const item = new FolderItem(name, path, null)
    return item
  }
}

// ******************************** 文件夹项目导出 ********************************

export { FolderItem }
