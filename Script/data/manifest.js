'use strict'

import * as Yami from '../yami.js'

// ******************************** 元数据清单类 ********************************

class Manifest {
  actors = []
  skills = []
  triggers = []
  items = []
  equipments = []
  states = []
  events = []
  scenes = []
  tilesets = []
  ui = []
  animations = []
  particles = []
  images = []
  audio = []
  videos = []
  fonts = []
  script = []
  others = []

  constructor() {
    Object.defineProperties(this, {
      metaList: {value: []},
      guidMap: {value: {}},
      pathMap: {value: {}},
      project: {value: {}},
      changes: {value: []},
      changed: {writable: true, value: false},
      code: {writable: true, value: ''},
    })
  }

  // 更新
  update() {
    const {metaList} = this
    const {guidMap} = this
    const {pathMap} = this
    const {versionId} = Yami.Meta.meta
    let i = metaList.length
    while (--i >= 0) {
      const meta = metaList[i]
      // 如果版本ID不一致，表示文件已被删除
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
          Yami.File.cancelSave(meta)
          // 关闭已打开的标签
          switch (dataMap) {
            case Yami.Data.scenes:
            case Yami.Data.ui:
            case Yami.Data.animations:
            case Yami.Data.particles:
              Yami.Title.tabBar.closeByProperty('meta', meta)
              break
          }
          // 移除UI预设元素的链接
          switch (dataMap) {
            case Yami.Data.ui:
              Yami.Data.removeUILinks(guid)
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
