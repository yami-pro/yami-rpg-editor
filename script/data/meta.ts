"use strict"

import {
  Data,
  File,
  FileItem
} from "../yami"

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

  interface Props {
    file: object | null
    guid: string
    group: object | null
    mtimeMs: number | null
    versionId: number
    dataMap: object | null
  }

  return class FileMeta {
    path: string
    x: number
    y: number
    parameters: []

    private props: Props

    get file() { return this.props.file }
    get guid() { return this.props.guid }
    get group() { return this.props.group }
    get mtimeMs() { return this.props.mtimeMs }
    get versionId() { return this.props.versionId }
    get dataMap() { return this.props.dataMap }

    set file(value) { this.props.file = value }
    set guid(value) { this.props.guid = value }
    set mtimeMs(value) { this.props.mtimeMs = value }
    set versionId(value) { this.props.versionId = value }

    constructor(file, guid: string) {
      const {type, path} = file
      this.path = path
      this.props = <Props>{}

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
        this.props.dataMap = Data[name]

        // 加载除了场景以外的数据
        if (type !== 'scene') {
          const promise = file.promise ?? Promise.resolve()
          file.promise = promise.then(async () => {
            // 文件重命名后会改变元数据路径
            this.props.dataMap[guid] = await File.get({type: 'json', path: this.path})
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
      manifest.changed = true
      manifest[key].push(this)
      manifest.metaList.push(this)
      manifest.guidMap[guid] = this
      manifest.pathMap[path] = this

      this.props.file = file
      this.props.guid = guid
      this.props.group = manifest[key]
      this.props.mtimeMs = null
      this.props.versionId = 0
    }

    // 重定向
    redirect(file) {
      if (this.file.type === file.type) {
        this.file = file
        const sPath = this.path
        const dPath = file.path
        if (sPath !== dPath) {
          this.path = dPath
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

    // 静态 - 版本ID
    static versionId = 0
  }
}()

// ******************************** 元数据类导出 ********************************

export { Meta }
