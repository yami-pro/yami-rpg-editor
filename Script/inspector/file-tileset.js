'use strict'

import * as Yami from '../yami.js'

// ******************************** 文件 - 图块组页面 ********************************

{
  const FileTileset = {
    // properties
    target: null,
    meta: null,
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    update: null,
    // events
    paramInput: null,
  }

  // 初始化
  FileTileset.initialize = function () {
    // 侦听事件
    $(`#fileTileset-image, #fileTileset-tileWidth, #fileTileset-tileHeight,
      #fileTileset-globalOffsetX, #fileTileset-globalOffsetY,
      #fileTileset-globalPriority`).on('input', this.paramInput)
    $('#fileTileset-width, #fileTileset-height').on('change', this.paramInput)

    // 初始化调色板
    Yami.Palette.initialize()
  }

  // 创建图块组
  FileTileset.create = function (type) {
    switch (type) {
      case 'normal':
        return {
          type: 'normal',
          image: '',
          width: 1,
          height: 1,
          tileWidth: 32,
          tileHeight: 32,
          globalOffsetX: 0,
          globalOffsetY: 0,
          globalPriority: 0,
          priorities: [0],
        }
      case 'auto':
        return {
          type: 'auto',
          tiles: [0],
          width: 1,
          height: 1,
          tileWidth: 32,
          tileHeight: 32,
          globalOffsetX: 0,
          globalOffsetY: 0,
          globalPriority: 0,
          priorities: [0],
        }
    }
  }

  // 打开数据
  FileTileset.open = function (tileset, meta) {
    if (this.meta !== meta) {
      this.target = tileset
      this.meta = meta
      Yami.Palette.open(meta)

      // 允许页面内容溢出
      Yami.Inspector.manager.addClass('overflow-visible')

      // 显示或隐藏图像输入框
      switch (tileset.type) {
        case 'normal':
          $('#fileTileset-image').enable()
          break
        case 'auto':
          $('#fileTileset-image').disable()
          break
      }

      // 写入数据
      const write = Yami.getElementWriter('fileTileset', tileset)
      write('image', tileset.image ?? '')
      write('width')
      write('height')
      write('tileWidth')
      write('tileHeight')
      write('globalOffsetX')
      write('globalOffsetY')
      write('globalPriority')
    }
  }

  // 关闭数据
  FileTileset.close = function () {
    if (this.target) {
      Yami.Inspector.manager.removeClass('overflow-visible')
      Yami.Browser.unselect(this.meta)
      Yami.Palette.close()
      this.target = null
      this.meta = null
    }
  }

  // 更新数据
  FileTileset.update = function (tileset, key, value) {
    Yami.File.planToSave(this.meta)
    switch (key) {
      case 'image':
        if (tileset.image !== value) {
          Yami.Palette.setImage(value)
        }
        break
      case 'width':
        if (tileset.width !== value) {
          Yami.Palette.setSize(value, tileset.height)
        }
        break
      case 'height':
        if (tileset.height !== value) {
          Yami.Palette.setSize(tileset.width, value)
        }
        break
      case 'tileWidth':
        if (tileset.tileWidth !== value) {
          Yami.Palette.setTileSize(value, tileset.tileHeight)
        }
        break
      case 'tileHeight':
        if (tileset.tileHeight !== value) {
          Yami.Palette.setTileSize(tileset.tileWidth, value)
        }
        break
      case 'globalOffsetX':
      case 'globalOffsetY':
      case 'globalPriority':
        if (tileset[key] !== value) {
          tileset[key] = value
        }
        break
    }
    Yami.Scene.requestRendering()
  }

  // 参数 - 输入事件
  FileTileset.paramInput = function (event) {
    FileTileset.update(
      FileTileset.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.fileTileset = FileTileset
}