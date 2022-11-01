'use strict'

// ******************************** 瓦片地图快捷方式列表类 ********************************

class TilemapShortcuts {
  constructor(tilemaps) {
    this.tilemaps = tilemaps
    this.reset()
  }

  // 重置
  reset() {
    this[1] = null
    this[2] = null
    this[3] = null
    this[4] = null
    this[5] = null
    this[6] = null
  }

  // 更新
  update() {
    this.reset()
    for (const tilemap of this.tilemaps) {
      const {shortcut} = tilemap
      if (shortcut !== 0) {
        this[shortcut] = tilemap
      }
    }
    const {elements} = TilemapShortcuts
    const opening = Scene.tilemap
    for (let i = 1; i <= 6; i++) {
      const element = elements[i]
      const tilemap = this[i]
      if (tilemap) {
        tilemap === opening &&
        element.addClass('selected')
        element.show()
      } else {
        element.removeClass('selected')
        element.hide()
      }
    }
    Scene.head.width = 0
    Scene.updateHead()
  }

  // 静态 - 选项元素
  static elements = {
    1: $('#scene-layer-tilemap-1'),
    2: $('#scene-layer-tilemap-2'),
    3: $('#scene-layer-tilemap-3'),
    4: $('#scene-layer-tilemap-4'),
    5: $('#scene-layer-tilemap-5'),
    6: $('#scene-layer-tilemap-6'),
  }

  // 静态 - 初始化
  static initialize() {
    const {elements} = this
    for (let i = 1; i <= 6; i++) {
      elements[i].setTooltip(() => {
        const tilemap = Scene.tilemaps?.shortcuts[i]
        return tilemap ? tilemap.name : ''
      })
    }
  }
}

export { TilemapShortcuts }
