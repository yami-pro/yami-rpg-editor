'use strict'

import { getElementWriter } from '../util/index.js'
import * as Yami from '../yami.js'

const {
  Browser,
  File,
  Inspector,
  Palette,
  Scene
} = Yami

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
    Palette.initialize()
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
      Palette.open(meta)

      // 允许页面内容溢出
      Inspector.manager.addClass('overflow-visible')

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
      const write = getElementWriter('fileTileset', tileset)
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
      Inspector.manager.removeClass('overflow-visible')
      Browser.unselect(this.meta)
      Palette.close()
      this.target = null
      this.meta = null
    }
  }

  // 更新数据
  FileTileset.update = function (tileset, key, value) {
    File.planToSave(this.meta)
    switch (key) {
      case 'image':
        if (tileset.image !== value) {
          Palette.setImage(value)
        }
        break
      case 'width':
        if (tileset.width !== value) {
          Palette.setSize(value, tileset.height)
        }
        break
      case 'height':
        if (tileset.height !== value) {
          Palette.setSize(tileset.width, value)
        }
        break
      case 'tileWidth':
        if (tileset.tileWidth !== value) {
          Palette.setTileSize(value, tileset.tileHeight)
        }
        break
      case 'tileHeight':
        if (tileset.tileHeight !== value) {
          Palette.setTileSize(tileset.tileWidth, value)
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
    Scene.requestRendering()
  }

  // 参数 - 输入事件
  FileTileset.paramInput = function (event) {
    FileTileset.update(
      FileTileset.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.fileTileset = FileTileset
}