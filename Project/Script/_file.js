'use strict'

// ******************************** 文件系统 ********************************

const File = {
  // properties
  root: '',
  promises: {},
  // methods
  get: null,
  getPath: null,
  save: null,
  saveFile: null,
  planToSave: null,
  cancelSave: null,
  parseFileSize: null,
  getFileName: null,
  getImageResolution: null,
  openPath: null,
  openURL: null,
  showInExplorer: null,
  showOpenDialog: null,
  showSaveDialog: null,
  parseGUID: null,
  filterGUID: null,
  updateRoot: null,
  route: null,
}

// 获取文件
File.get = function (descriptor) {
  let path
  if (descriptor.path) {
    path = File.route(descriptor.path)
  } else if (descriptor.guid) {
    path = File.route(this.getPath(descriptor.guid))
  } else if (descriptor.local) {
    path = descriptor.local
  } else {
    Log.throw(new Error('Invalid parameter'))
  }
  const type = descriptor.type
  switch (type) {
    case 'image': {
      // 如果图像存在guid
      // 文件路径添加版本号
      if (descriptor.guid) {
        const meta = Data.manifest.guidMap[descriptor.guid]
        if (meta) path += `?ver=${meta.mtimeMs}`
      }
      const promises = this.promises
      return promises[path] || (
      promises[path] = new Promise(resolve => {
        const image = new Image()
        image.guid = descriptor.guid ?? ''
        image.onload = () => {
          delete promises[path]
          image.onload = null
          image.onerror = null
          resolve(image)
        }
        image.onerror = () => {
          delete promises[path]
          image.onload = null
          image.onerror = null
          image.src = ''
          resolve(image)
        }
        image.src = path
      }))
    }
    default:
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.onload = () => {
          resolve(request.response)
        }
        request.onerror = () => {
          reject(new URIError(path))
        }
        request.open('GET', path)
        request.responseType = type
        request.send()
      })
  }
}

// 获取路径
File.getPath = function (guid) {
  return Data.manifest.guidMap[guid]?.path ?? ''
}

// 保存项目
File.save = function (hint = true) {
  // 保存元数据清单文件
  Data.saveManifest()

  // 保存改变的文件
  const {guidMap, changes} = Data.manifest
  for (const meta of changes) {
    // 验证元数据有效性
    if (guidMap[meta.guid] === meta) {
      File.saveFile(meta)
    }
  }
  if (changes.length !== 0) {
    changes.length = 0
  }

  // 改变指针样式
  if (hint) {
    Cursor.open('cursor-wait')
    setTimeout(() => {
      Cursor.close('cursor-wait')
    }, 100)
  }

  // 这里没有考虑写入失败的情况
  return require('electron').ipcRenderer.invoke('wait-write-file')
}

// 保存文件
File.saveFile = function (meta) {
  switch (meta) {
    case Scene.meta:
      Scene.save()
      break
    case UI.meta:
      UI.save()
      break
    case Animation.meta:
      Animation.save()
      break
    case Particle.meta:
      Particle.save()
      break
    case Data.manifest.project.variables:
      Data.generateVariableEnumScript()
      break
  }
  let text
  const data = meta.dataMap?.[meta.guid]
  switch (typeof data) {
    case 'object':
      meta.tryFixGuid?.(data)
      text = JSON.stringify(data, null, 2)
      break
    default:
      return Promise.resolve()
  }
  const path = meta.path
  const route = File.route(path)
  return FSP.writeFile(
    route, text, true).then(() => {
    console.log(`write: ${path}`)
  }).catch(error => {
    console.warn(error)
  })
}

// 计划保存
File.planToSave = function (meta) {
  if (meta instanceof Object) {
    return Data.manifest.changes.append(meta)
  } else {
    throw new Error('Invalid file meta')
  }
}

// 取消保存
File.cancelSave = function (meta) {
  return Data.manifest.changes.remove(meta)
}

// 解析文件大小
File.parseFileSize = function (size) {
  let string
  let unit
  if (size < 1000) {
    unit = size === 1 ? 'byte' : 'bytes'
  } else {
    size /= 1024
    if (size < 1000) {
      unit = 'KB'
    } else {
      size /= 1024
      if (size < 1000) {
        unit = 'MB'
      } else {
        size /= 1024
        unit = 'GB'
      }
    }
  }
  switch (unit) {
    case 'byte':
    case 'bytes':
      string = size.toString()
      break
    default:
      if (size < 10) {
        string = size.toFixed(2)
      } else if (size < 100) {
        string = size.toFixed(1)
      } else {
        string = size.toFixed(0)
      }
      break
  }
  return `${string}${unit}`
}

// 获取文件名称
File.getFileName = function IIFE() {
  const struct = {path: '', route: ''}
  return function (dir, base, ext = '') {
    let path = `${dir}/${base}${ext}`
    let route = File.route(path)
    if (FS.existsSync(route)) {
      for (let i = 1; true; i++) {
        path = `${dir}/${base} ${i}${ext}`
        route = File.route(path)
        if (!FS.existsSync(route)) {
          break
        }
      }
    }
    struct.path = path
    struct.route = route
    return struct
  }
}()

// 获取图像尺寸
File.getImageResolution = function IIFE() {
  const promises = {}
  const resolution = {width: 0, height: 0}
  return function (path) {
    let promise = promises[path]
    if (promise === undefined) {
      promise = promises[path] =
      new Promise((resolve, reject) => {
        const image = new Image()
        image.src = File.route(path)
        const intervalIndex = setInterval(() => {
          if (image.naturalWidth !== 0) {
            resolution.width = image.naturalWidth
            resolution.height = image.naturalHeight
            delete promises[path]
            clearInterval(intervalIndex)
            resolve(resolution)
            image.src = ''
          } else if (image.complete) {
            delete promises[path]
            clearInterval(intervalIndex)
            reject(new URIError('Image load failed.'))
          }
        })
      })
    }
    return promise
  }
}()

// 打开资源管理器路径
File.openPath = function (path) {
  require('electron').ipcRenderer
  .send('open-path', path)
}

// 打开URL
File.openURL = function (url) {
  if (url) {
    require('electron').shell.openExternal(url)
  }
}

// 在资源管理器中显示
File.showInExplorer = function (path) {
  require('electron').ipcRenderer
  .send('show-item-in-folder', path)
}

// 显示打开对话框
File.showOpenDialog = function (options) {
  const {ipcRenderer} = require('electron')
  return ipcRenderer.invoke('show-open-dialog', options)
}

// 显示保存对话框
File.showSaveDialog = function (options) {
  const {ipcRenderer} = require('electron')
  return ipcRenderer.invoke('show-save-dialog', options)
}

// 解析元数据对应的文件名称
File.parseMetaName = function (meta) {
  const alias = File.filterGUID(meta.path)
  const extname = Path.extname(alias)
  return Path.basename(alias, extname)
}

// 解析文件名中的GUID
File.parseGUID = function IIFE() {
  const regexp = /(?<=\.)[0-9a-f]{16}(?=\.\S+$)/
  return function (filename) {
    const match = filename.match(regexp)
    return match ? match[0] : ''
  }
}()

// 过滤文件名中的GUID
File.filterGUID = function IIFE() {
  const regexp = /\.[0-9a-f]{16}(?=\.\S+$)/
  return function (filename) {
    return filename.replace(regexp, '')
  }
}()

// 更新根目录
File.updateRoot = function (path) {
  const index = path.lastIndexOf('/')
  this.root = path.slice(0, index + 1)
}

// 获取路径
File.route = function (relativePath) {
  return this.root + relativePath
}

// ******************************** 文件系统 ********************************

const FS = require('fs')
const FSP = FS.promises

// 重写写入文件方法
FSP.writeFile = function (path, text, check = false) {
  const {invoke} = require('electron').ipcRenderer
  return invoke('write-file', path, text, check)
}

// ******************************** 路径工具 ********************************

const Path = require('path')

// 转换至斜杠分隔符
Path.slash = function IIFE() {
  const regexp = /\\/g
  return function (path) {
    if (path.indexOf('\\') !== -1) {
      path = path.replace(regexp, '/')
    }
    return path
  }
}()

// 获取文件扩展名
// Path.ext = function (path) {
//   return path.slice(path.lastIndexOf('.') + 1)
// }

// ******************************** 目录对象 ********************************

const Directory = {
  // properties
  inoMap: {},
  assets: null,
  symbol: null,
  reading: false,
  updating: null,
  // methods
  initialize: null,
  read: null,
  close: null,
  update: null,
  getFolder: null,
  getFile: null,
  readdir: null,
  searchFiles: null,
  existFiles: null,
  filterFiles: null,
  deleteFiles: null,
  moveFiles: null,
  saveFiles: null,
  copyFiles: null,
  sortFiles: null,
  createInoMap: null,
  // events
  windowFocus: null,
}

// 初始化
Directory.initialize = function () {
  // 侦听事件
  window.on('focus', this.windowFocus)
}

// 读取目录
Directory.read = function () {
  const symbol = this.symbol = Symbol()
  this.reading = true
  return FolderItem.create('Assets').then(assets => {
    if (this.symbol === symbol) {
      this.symbol = null
      this.assets = assets
      Meta.versionId++
      return assets.update().then(
        async ({promises}) => {
          this.createInoMap()
          if (promises.length) {
            await Promise.all(promises)
          }
        },
        error => {
          Log.throw(error)
          Window.confirm({
            message: 'Failed to read directory',
            close: () => {
              Editor.close(false)
            },
          }, [{
            label: 'Confirm',
          }])
        },
      ).finally(() => {
        this.reading = false
      })
    }
  })
}

// 关闭目录
Directory.close = function () {
  this.inoMap = {}
  this.assets = null
  this.symbol = null
}

// 更新目录
// 利用Node.js监听目录似乎有更好的方法(Watch)
Directory.update = function () {
  if (this.reading) {
    return Promise.resolve().then(() => false)
  }
  const {assets} = this
  if (assets !== null &&
    this.updating === null) {
    Meta.versionId++
    this.reading = true
    this.updating = assets.update().then(
      async ({changed, promises}) => {
        if (this.assets !== assets) {
          throw new Error('Directory update timeout')
        }
        if (changed) {
          this.createInoMap()
          Data.manifest.update()
        }
        if (promises.length) {
          await Promise.all(promises)
        }
        if (changed) {
          window.dispatchEvent(new Event('dirchange'))
        }
        return changed
      },
      error => {
        throw error
      },
    ).finally(() => {
      this.reading = false
      this.updating = null
    })
  }
  return this.updating
}

// 获取文件夹
Directory.getFolder = function (path) {
  const nodes = path.split('/')
  const length = nodes.length
  let target = this.assets
  outer: for (let i = 1; i < length; i++) {
    if (target instanceof FolderItem) {
      const path = target.path + '/' + nodes[i]
      for (const item of target.subfolders) {
        if (item.path === path) {
          target = item
          continue outer
        }
      }
    }
    break
  }
  return target
}

// 获取文件
Directory.getFile = function (path) {
  const dirname = Path.dirname(path)
  const folder = this.getFolder(dirname)
  if (folder.path === dirname) {
    for (const item of folder.children) {
      if (item.path === path &&
        item instanceof FileItem) {
        return item
      }
    }
  }
  return undefined
}

// 读取目录
Directory.readdir = function IIFE() {
  const options = {withFileTypes: true}
  const read = (dirPath, dir) => {
    return FSP.readdir(
      dirPath,
      options,
    ).then(
      async files => {
        const promises = []
        for (const file of files) {
          const name = file.name
          const path = `${dirPath}/${name}`
          if (file.isDirectory()) {
            const children = []
            dir.push({name, path, children})
            promises.push(read(path, children))
          } else {
            dir.push({name, path})
          }
        }
        if (promises.length !== 0) {
          await Promise.all(promises)
        }
        return dir
      }
    )
  }
  return async function (paths) {
    const dir = []
    const statPromises = []
    const readPromises = []
    const length = paths.length
    for (let i = 0; i < length; i++) {
      statPromises.push(FSP.stat(paths[i]))
    }
    for (let i = 0; i < length; i++) {
      try {
        const stats = await statPromises[i]
        const path = paths[i]
        const name = Path.basename(path)
        if (stats.isDirectory()) {
          const children = []
          dir.push({name, path, children})
          readPromises.push(read(path, children))
        } else {
          dir.push({name, path})
        }
      } catch (error) {
        // 拖拽在外部被删除的文件会抛出此错误
        console.log(error)
      }
    }
    await Promise.all(readPromises)
    return dir
  }
}()

// 搜索文件
Directory.searchFiles = function IIFE() {
  const search = (filters, keyword, items, list) => {
    const length = items.length
    for (let i = 0; i < length; i++) {
      const item = items[i]
      if (filters !== null &&
        item instanceof FileItem &&
        !filters.includes(item.type)) {
        continue
      }
      if (keyword.test(item.name)) {
        list.push(item)
      }
      if (item instanceof FolderItem) {
        search(filters, keyword, item.children, list)
      }
    }
  }
  return function (filters, keyword, items, list) {
    return search(filters, keyword, items, list)
  }
}()

// 判断是否存在文件
Directory.existFiles = function IIFE() {
  const check = async (dirPath, dir) => {
    const promises = []
    for (const file of dir) {
      const path = `${dirPath}/${file.name}`
      promises.push(FSP.stat(path))
      if (file.children?.length) {
        promises.push(check(
          path,
          file.children,
        ))
      }
    }
    if (promises.length !== 0) {
      return Promise.any(promises)
    }
  }
  return function (dirPath, dir) {
    return check(File.route(dirPath), dir).then(
      existed => true,
      error => false,
    )
  }
}()

// 过滤文件
Directory.filterFiles = function IIFE() {
  const sorter = (a, b) => {
    if (a instanceof FileItem) {
      if (b instanceof FileItem) {
        return -a.path.localeCompare(b.path)
      } else {
        return -1
      }
    } else {
      if (b instanceof FileItem) {
        return 1
      } else {
        return -a.path.localeCompare(b.path)
      }
    }
  }
  return function (files) {
    files.sort(sorter)
    const folders = []
    let i = files.length
    while (--i >= 0) {
      const file = files[i]
      const path = file.path
      for (const folder of folders) {
        if (path.indexOf(folder) === 0 &&
          path[folder.length] === '/') {
          files.splice(i, 1)
          continue
        }
      }
      if (file instanceof FolderItem) {
        folders.push(path)
      }
    }
    return files.reverse()
  }
}()

// 删除文件
Directory.deleteFiles = function IIFE() {
  const {invoke} = require('electron').ipcRenderer
  const trash = async files => {
    const promises = []
    for (const file of files) {
      const path = File.route(file.path)
      console.log('delete: ' + Path.normalize(path))
      promises.push(invoke('trash-item', path))
    }
    if (promises.length !== 0) {
      return Promise.all(promises)
    }
  }
  return function (files) {
    return trash(Directory.filterFiles(files))
  }
}()

// 移动文件
Directory.moveFiles = function IIFE() {
  const move = async (dirPath, dir, existings) => {
    const promises = []
    for (const file of dir) {
      const path = `${dirPath}/${file.name}`
      if (!existings[path]) {
        existings[path] = true
        promises.push(FSP.rename(file.path, path))
        // if (file.children?.length) {
        //   promises.push(move(
        //     path,
        //     file.children,
        //     existings,
        //   ))
        // }
      }
    }
    if (promises.length !== 0) {
      return Promise.all(promises)
    }
  }
  return function (dirPath, dir) {
    return move(
      dirPath,
      Directory.filterFiles(dir),
      {},
    )
  }
}()

// 保存文件
Directory.saveFiles = function IIFE() {
  const save = async (files, changes, metaset) => {
    const promises = []
    for (const file of files) {
      if (file instanceof FolderItem) {
        promises.push(save(file.children, changes))
      } else if (FileItem.isDataFile(file)) {
        const meta = file.meta
        if (changes.includes(meta)) {
          promises.push(File.saveFile(meta))
          metaset.push(meta)
        }
      }
    }
    if (promises.length !== 0) {
      return Promise.all(promises)
    }
  }
  return function (files) {
    const metaset = []
    const changes = Data.manifest.changes
    return save(files, changes, metaset).then(result => {
      for (const meta of metaset) {
        changes.remove(meta)
      }
      return result
    })
  }
}()

// 复制文件
Directory.copyFiles = function IIFE() {
  const copy = async (dirPath, dir, suffix, existings) => {
    const promises = []
    for (const file of dir) {
      const name = File.filterGUID(file.name)
      const ext = Path.extname(name)
      const base = Path.basename(name, ext)
      // 这里必须加上Copy标记来避免混淆
      // 否则可能会破坏对原始文件的引用
      let path = `${dirPath}/${base}${suffix}${ext}`
      let existed = existings[path]
      existings[path] = true
      promises.push((existed
      ? Promise.resolve()
      : FSP.stat(path)
      ).then(
        stats => {
          for (let i = 2;; i++) {
            path = `${dirPath}/${base}${suffix} (${i})${ext}`
            if (existings[path]) {
              continue
            }
            existings[path] = true
            if (!FS.existsSync(path)) {
              break
            }
          }
        },
        Function.empty,
      ).finally(() => {
        const {children} = file
        if (children) {
          FS.mkdirSync(path)
          if (children.length !== 0) {
            return copy(path, children, suffix, existings)
          }
        } else {
          return FSP.copyFile(file.path, path)
        }
      }))
    }
    if (promises.length !== 0) {
      return Promise.all(promises)
    }
  }
  return function (dirPath, dir, suffix = ' - Copy') {
    return copy(dirPath, dir, suffix, {})
  }
}()

// 排序文件列表
Directory.sortFiles = function IIFE() {
  const sorter = (a, b) => {
    if (a instanceof FileItem) {
      if (b instanceof FileItem) {
        // 优先比较基本名称，相同时再比较扩展名称
        const r1 = a.basename.localeCompare(b.basename)
        if (r1 !== 0) return r1
        const r2 = a.extname.localeCompare(b.extname)
        if (r2 !== 0) return r2
        const am = a.meta
        const bm = b.meta
        if (am !== null && bm !== null) {
          return am.guid.localeCompare(bm.guid)
        }
        return 0
      } else {
        return 1
      }
    } else {
      if (b instanceof FileItem) {
        return -1
      } else {
        return a.name.localeCompare(b.name)
      }
    }
  }
  return function (files) {
    return files.sort(sorter)
  }
}()

// 创建文件INO映射表
// 注意：使用PS等工具可能造成文件INO变化
Directory.createInoMap = function IIFE() {
  const register = (map, item) => {
    map[item.stats.ino] = item
    if (item instanceof FolderItem) {
      const children = item.children
      const length = children.length
      for (let i = 0; i < length; i++) {
        register(map, children[i])
      }
    }
  }
  return function () {
    const {assets} = Directory
    if (assets instanceof FolderItem) {
      register(Directory.inoMap = {}, assets)
    }
  }
}()

// 窗口 - 获得焦点事件
Directory.windowFocus = function (event) {
  // 当外部正在重命名文件时点击编辑器窗口
  // 会因为异步保存文件名而无法及时读取到
  // 因此延时更新目录
  setTimeout(() => Directory.update(), 100)
}

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
    const path = File.route(this.path)
    const pStat = FSP.stat(path, bigint)
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
    const path = File.route(dir)
    const files = await FSP.readdir(
      path, {withFileTypes: true},
    )
    const length = files.length
    const promises = new Array(length)
    const children = []
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
        children.push(item)
        subfolders.push(item)
      } else {
        // 跳过MacOS隐藏文件
        if (name === '.DS_Store') {
          continue
        }
        const promise = FSP.stat(File.route(path), bigint)
        promise.path = path
        promises[i] = promise
      }
    }

    // 获取未改变的项目
    // 以及创建新的项目
    const {extnameToTypeMap} = FolderItem
    for (let i = 0; i < length; i++) {
      const promise = promises[i]
      const response = await promise
      // 跳过文件夹Promise
      if (promise?.path === undefined) {
        continue
      }
      const path = promise.path
      const stats = response
      let item = map[path]
      if (item === undefined ||
        item.stats.mtimeMs !== stats.mtimeMs) {
        const name = files[i].name
        const extname = Path.extname(name)
        const type = extnameToTypeMap[extname.toLowerCase()] ?? 'other'
        try {
          item = new FileItem(name, extname, path, type, stats)
          if (item.promise instanceof Promise) {
            context.promises.push(item.promise.finally(() => {
              delete item.promise
            }))
          }
        } catch (error) {
          console.warn(error)
          continue
        }
      }
      // 更新文件元数据版本，如果版本一致则已经被占用
      if (item.meta.versionId !== Meta.versionId) {
        item.meta.versionId = Meta.versionId
        children.push(item)
        context.changed = true
      }
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

  // FSP.stat选项 - 64位整数
  // 默认类型的stats因为精度问题可能产生相同的ino
  static bigint = {bigint: true}

  // 静态方法 - 创建项目
  static async create(path) {
    const name = Path.basename(path)
    const item = new FolderItem(name, path, null)
    return item
  }
}

// ******************************** 文件项目 ********************************

class FileItem {
  meta      //:object
  name      //:string
  alias     //:string
  aliasPath //:string
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
    this.aliasPath = Path.dirname(path) + '/' + this.alias
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
    // 如果GUID不存在或冲突则新建GUID
    // 如果GUID重复则不要修改避免丢失
    if (guid === undefined) {
      do {guid = GUID.generate64bit()}
      while (Data.manifest.guidMap[guid])
      this.updateFileName(guid)
    } else {
      const meta = Data.manifest.guidMap[guid]
      // 如果存在元数据并且并未被使用，则重定向或删除该元数据
      // 如果存在元数据并且已经被使用，则文件GUID冲突
      if (meta && meta.versionId !== Meta.versionId) {
        if (meta.redirect(this)) {
          this.meta = meta
          this.updateFileName(guid)
          return
        }
        Data.manifest.deleteMeta(meta)
      } else if (meta) {
        FileItem.addGuidConflictPaths(meta.path, this.path + '(已隐藏)')
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

  // 静态属性 - GUID冲突路径列表
  static guidConflictPaths = []

  // 静态属性 - 过大图像路径列表
  static oversizeImagePaths = []

  // 静态方法 - 判断是不是数据文件
  static isDataFile(file) {
    return FileItem.dataMapNames[file.type] !== undefined
  }

  // 静态方法 - 添加冲突路径
  static addGuidConflictPaths(...paths) {
    for (const path of paths) {
      this.guidConflictPaths.append(path)
    }
    request(this.warnGuidConflicts)
  }

  // 静态方法 - 警告GUID冲突
  static warnGuidConflicts() {
    const warnings = [Local.get('confirmation.guidConflict')]
    Window.confirm({
      message: warnings.concat(FileItem.guidConflictPaths).join('\n'),
    }, [{
      label: 'Confirm',
    }])
    FileItem.guidConflictPaths.length = 0
  }

  // 静态方法 - 添加过大图像路径
  static addOversizeImagePaths(...paths) {
    for (const path of paths) {
      this.oversizeImagePaths.append(path)
    }
    request(this.warnOversizeImages)
  }

  // 静态方法 - 警告过大图像
  static warnOversizeImages() {
    const warnings = [Local.get('confirmation.oversizeImage').replace('<size>', GL.maxTexSize)]
    Window.confirm({
      message: warnings.concat(FileItem.oversizeImagePaths).join('\n'),
    }, [{
      label: 'Confirm',
    }])
    FileItem.oversizeImagePaths.length = 0
  }
}

// ******************************** 全局唯一标识符 ********************************

// GUID含有字母或首位是零可以大幅提升查询效率
// 因此需要避免纯数字的GUID出现
class GUID {
  static regExpForChecking = /[a-f]/

  // 生成32位GUID(8个字符)
  static generate32bit() {
    const n = Math.random() * 0x100000000
    const s = Math.floor(n).toString(16)
    return s.length === 8 ? s : s.padStart(8, '0')
  }

  // 生成64位GUID(16个字符)
  static generate64bit() {
    let id
    do {id = this.generate32bit() + this.generate32bit()}
    while (!this.regExpForChecking.test(id))
    return id
  }
}