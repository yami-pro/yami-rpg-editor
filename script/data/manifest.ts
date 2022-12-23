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

  type parameter = {
    key: string
    type: string
    value: string | number | boolean
    options: (string | number | boolean)[]
  }
  type dataMap = object
  export type actor = {path: string}
  export type skill = actor
  export type trigger = actor
  export type item = actor
  export type equipment = actor
  export type state = actor
  export type event = actor
  export type scene = {
    path: string
    x: number
    y: number
  }
  export type tileset = scene
  export type ui = actor
  export type animation = actor
  export type particle = actor
  export type image = {path: string, dataMap: dataMap}[]
  export type audio = image[]
  export type video = image[]
  export type font = image[]
  export type script = {
    path: string
    parameters: parameter[]
  }[]
  export type other = actor
  export type project = {
    guid: string
    path: string
    dataMap: dataMap
  }
}

class Manifest {
  actors: Type.actor[]
  skills: Type.skill[]
  triggers: Type.trigger[]
  items: Type.item[]
  equipments: Type.equipment[]
  states: Type.state[]
  events: Type.event[]
  scenes: Type.scene[]
  tilesets: Type.tileset[]
  ui: Type.ui[]
  animations: Type.animation[]
  particles: Type.particle[]
  images: Type.image[]
  audio: Type.audio[]
  videos: Type.video[]
  fonts: Type.font[]
  script: Type.script[]
  others: Type.other[]
  last?: Manifest

  metaList: Type.meta[]
  guidMap: {[key: string]: Type.project | Type.meta}
  pathMap: {[key: string]: Type.meta}
  project: {[key: string]: Type.project}
  changes: Type.meta[]
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
        meta.group?.remove(meta)
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
