'use strict'

import * as Yami from '../yami.js'

// ******************************** 元数据类 ********************************

const Meta = {
  meta: null
}

// ******************************** 元数据类加载 ********************************

Meta.meta = function IIFE() {
  // 类型到分组名称映射表
  const typeMapToGroupName = {
    ...Yami.FileItem.dataMapNames,
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
  const groupDescriptor = {value: null}
  const dataMapDescriptor = {value: null}
  const descriptors = {
    file: fileDescriptor,
    guid: guidDescriptor,
    group: groupDescriptor,
    mtimeMs: {writable: true, value: null},
    versionId: {writable: true, value: 0},
  }
  return class FileMeta {
    path //:string

    constructor(file, guid) {
      const {type, path} = file
      this.path = path

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
          break
      }

      // 加载数据文件
      const name = Yami.FileItem.dataMapNames[type]
      if (name !== undefined) {
        dataMapDescriptor.value = Yami.Data[name]
        Object.defineProperty(this, 'dataMap', dataMapDescriptor)

        // 加载除了场景以外的数据
        if (type !== 'scene') {
          const promise = file.promise ?? Promise.resolve()
          file.promise = promise.then(async () => {
            // 文件重命名后会改变元数据路径
            loaderDescriptor.path = this.path
            this.dataMap[guid] = await Yami.File.get(loaderDescriptor)
            switch (type) {
              // 添加UI预设元素链接
              case 'ui':
                Yami.Data.addUILinks(guid)
                break
            }
          }).catch(error => {
            console.log(`读取失败: ${error.message}`)
          })
        }
      }

      // 设置其他内容
      const key = typeMapToGroupName[type]
      if (key === undefined) {
        throw new Error('Unknown meta type')
      }
      const {manifest} = Yami.Data
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
          const {manifest} = Yami.Data
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

    // 静态 - 版本ID
    static versionId = 0
  }
}()

// ******************************** 元数据类导出 ********************************

export { Meta }
