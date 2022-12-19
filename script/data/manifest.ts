"use strict"

import {
  Data,
  File,
  Meta,
  Title
} from "../yami"

// ******************************** 元数据清单类 ********************************

namespace Type {
  export type meta = InstanceType<typeof Meta>
}

class Manifest {
  actors: []
  skills: []
  triggers: []
  items: []
  equipments: []
  states: []
  events: []
  scenes: []
  tilesets: []
  ui: []
  animations: []
  particles: []
  images: []
  audio: []
  videos: []
  fonts: []
  script: []
  others: []

  metaList: Type.meta[]
  guidMap: {[key: string]: Type.meta}
  pathMap: {[key: string]: Type.meta}
  project: {}
  changes: []
  changed: boolean
  code: string

  constructor() {
    this.actors = []
    this.skills = []
    this.triggers = []
    this.items = []
    this.equipments = []
    this.states = []
    this.events = []
    this.scenes = []
    this.tilesets = []
    this.ui = []
    this.animations = []
    this.particles = []
    this.images = []
    this.audio = []
    this.videos = []
    this.fonts = []
    this.script = []
    this.others = []

    this.metaList = []
    this.guidMap = {}
    this.pathMap = {}
    this.project = {}
    this.changes = []
    this.changed = false
    this.code = ''
    Object.defineProperties(this, {
      metaList: {writable: false, enumerable: false},
      guidMap: {writable: false, enumerable: false},
      pathMap: {writable: false, enumerable: false},
      project: {writable: false, enumerable: false},
      changes: {writable: false, enumerable: false},
      changed: {writable: true, enumerable: false},
      code: {writable: true, enumerable: false},
    })
  }

  // 更新
  update() {
    const {metaList} = this
    const {guidMap} = this
    const {pathMap} = this
    const {versionId} = Meta
    let i = metaList.length
    while (--i >= 0) {
      const meta = metaList[i]
      // 如果版本ID不一致, 表示文件已被删除
      if (meta.versionId !== versionId) {
        const {guid, path} = meta
        metaList.splice(i, 1)
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
            case Data.ui:
              Data.removeUILinks(guid)
              break
          }
          delete dataMap[guid]
        }
        this.changed = true
        console.log(meta)
      }
    }
  }
}

// ******************************** 元数据清单类导出 ********************************

export { Manifest }
