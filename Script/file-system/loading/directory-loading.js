'use strict'

import { Directory } from '../directory.js'
import * as Yami from '../../yami.js'

// ******************************** 目录对象加载 ********************************

// 初始化
Directory.initialize = function () {
  // 侦听事件
  window.on('focus', this.windowFocus)
}

// 读取目录
Directory.read = function () {
  const symbol = this.symbol = Symbol()
  return Yami.FolderItem.create('Assets').then(assets => {
    if (this.symbol === symbol) {
      this.symbol = null
      this.assets = assets
      Yami.Meta.meta.versionId++
      return assets.update().then(
        async ({promises}) => {
          this.createInoMap()
          if (promises.length) {
            await Promise.all(promises)
          }
        },
        error => {
          Yami.Log.throw(error)
          Yami.Window.confirm({
            message: 'Failed to read directory',
            close: () => {
              Yami.Editor.close(false)
            },
          }, [{
            label: 'Confirm',
          }])
        },
      )
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
Directory.update = function () {
  const {assets} = this
  if (assets !== null &&
    this.updating === null) {
    Yami.Meta.meta.versionId++
    this.updating = assets.update().then(
      async ({changed, promises}) => {
        if (this.assets !== assets) {
          throw new Error('Directory update timeout')
        }
        if (changed) {
          this.createInoMap()
          Yami.Data.manifest.update()
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
    if (target instanceof Yami.FolderItem) {
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
  const dirname = Yami.Path.dirname(path)
  const folder = this.getFolder(dirname)
  if (folder.path === dirname) {
    for (const item of folder.children) {
      if (item.path === path &&
        item instanceof Yami.FileItem) {
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
    return Yami.FSP.readdir(
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
      statPromises.push(Yami.FSP.stat(paths[i]))
    }
    for (let i = 0; i < length; i++) {
      try {
        const stats = await statPromises[i]
        const path = paths[i]
        const name = Yami.Path.basename(path)
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
        item instanceof Yami.FileItem &&
        !filters.includes(item.type)) {
        continue
      }
      if (keyword.test(item.alias ?? item.name)) {
        list.push(item)
      }
      if (item instanceof Yami.FolderItem) {
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
      promises.push(Yami.FSP.stat(path))
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
    return check(Yami.File.route(dirPath), dir).then(
      existed => true,
      error => false,
    )
  }
}()

// 过滤文件
Directory.filterFiles = function IIFE() {
  const sorter = (a, b) => {
    if (a instanceof Yami.FileItem) {
      if (b instanceof Yami.FileItem) {
        return -a.path.localeCompare(b.path)
      } else {
        return -1
      }
    } else {
      if (b instanceof Yami.FileItem) {
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
      if (file instanceof Yami.FolderItem) {
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
      const path = Yami.File.route(file.path)
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
        promises.push(Yami.FSP.rename(file.path, path))
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
      if (file instanceof Yami.FolderItem) {
        promises.push(save(file.children, changes))
      } else if (Yami.FileItem.isDataFile(file)) {
        const meta = file.meta
        if (changes.includes(meta)) {
          promises.push(Yami.File.saveFile(meta))
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
    const changes = Yami.Data.manifest.changes
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
      const name = Yami.File.filterGUID(file.name)
      const ext = Yami.Path.extname(name)
      const base = Yami.Path.basename(name, ext)
      // 这里必须加上Copy标记来避免混淆
      // 否则可能会破坏对原始文件的引用
      let path = `${dirPath}/${base}${suffix}${ext}`
      let existed = existings[path]
      existings[path] = true
      promises.push((existed
      ? Promise.resolve()
      : Yami.FSP.stat(path)
      ).then(
        stats => {
          for (let i = 2;; i++) {
            path = `${dirPath}/${base}${suffix} (${i})${ext}`
            if (existings[path]) {
              continue
            }
            existings[path] = true
            if (!Yami.FS.existsSync(path)) {
              break
            }
          }
        },
        Function.empty,
      ).finally(() => {
        const {children} = file
        if (children) {
          Yami.FS.mkdirSync(path)
          if (children.length !== 0) {
            return copy(path, children, suffix, existings)
          }
        } else {
          return Yami.FSP.copyFile(file.path, path)
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
    if (a instanceof Yami.FileItem) {
      if (b instanceof Yami.FileItem) {
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
      if (b instanceof Yami.FileItem) {
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

// 创建 INO 映射表
Directory.createInoMap = function IIFE() {
  const register = (map, item) => {
    map[item.stats.ino] = item
    if (item instanceof Yami.FolderItem) {
      const children = item.children
      const length = children.length
      for (let i = 0; i < length; i++) {
        register(map, children[i])
      }
    }
  }
  return function () {
    const {assets} = Directory
    if (assets instanceof Yami.FolderItem) {
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
