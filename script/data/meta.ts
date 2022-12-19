"use strict"

import {
  Data,
  File,
  FileItem
} from "../yami"

// ******************************** 元数据类 ********************************

namespace TypeMap {
  export type meta = InstanceType<typeof Meta>
  export type file = FileItem | null
  export type group = meta[] | null
  export type mtimeMs = BigInt | null
  export type data = {[key: string]: (HTMLImageElement | null)} | null
  export type dataTagName = {[key: string]: string}
}

const Meta = function IIFE() {

  // 类型到分组名称映射表
  const typeMapToGroupName: TypeMap.dataTagName = {
    ...FileItem.dataMapNames,
    image: 'images',
    audio: 'audio',
    video: 'videos',
    script: 'script',
    font: 'fonts',
    other: 'others',
  }

  // 修改对象属性, 不修改value
  const dataMapDescriptor = {writable: false, enumerable: false}
  const descriptors = {
    file: {writable: true, enumerable: false},
    guid: {writable: true, enumerable: false},
    group: {writable: false, enumerable: false},
    mtimeMs: {writable: true, enumerable: false},
    versionId: {writable: true, enumerable: false},
  }

  return class FileMeta {
    path: string
    x: number
    y: number
    parameters: []

    file: TypeMap.file
    guid: string
    readonly group: TypeMap.group
    mtimeMs: BigInt | null
    versionId: number
    readonly dataMap: TypeMap.data

    constructor(file: FileItem, guid: string) {
      const {type, path} = file
      this.path = path

      this.file = null
      this.guid = ''
      this.group = null
      this.mtimeMs = null
      this.versionId = 0
      this.dataMap = null

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
          this.parameters = []
          break
      }

      // 加载数据文件
      const name = FileItem.dataMapNames[type]
      if (name !== undefined) {
        this.dataMap = Data[name]
        Object.defineProperty(this, 'dataMap', dataMapDescriptor)

        // 加载除了场景以外的数据
        if (type !== 'scene') {
          const promise = file.promise ?? Promise.resolve()
          file.promise = promise.then(async () => {
            // 文件重命名后会改变元数据路径
            if (this.dataMap !== null) {
              this.dataMap[guid] = await File.get({type: 'json', path: this.path})
            }
            switch (type) {
              // 添加UI预设元素链接
              case 'ui':
                Data.addUILinks(guid)
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
      const {manifest} = Data
      if (manifest === null)
        return
      manifest.changed = true
      manifest[key].push(this)
      manifest.metaList.push(this)
      manifest.guidMap[guid] = this
      manifest.pathMap[path] = this

      this.file = file
      this.guid = guid
      this.group = manifest[key]
      Object.defineProperties(this, descriptors)
    }

    // 重定向
    redirect(file: FileItem) {
      if (this.file !== null && this.file.type === file.type) {
        this.file = file
        const sPath = this.path
        const dPath = file.path
        if (sPath !== dPath) {
          this.path = dPath
          const {manifest} = Data
          if (manifest !== null) {
            const {pathMap} = manifest
            if (pathMap[sPath] === this) {
              delete pathMap[sPath]
            }
            pathMap[dPath] = this
            manifest.changed = true
          }
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
