"use strict"

import {
  Animation,
  getElementWriter,
  Inspector
} from "../yami"

// ******************************** 动画 - 精灵层页面 ********************************

{
const AnimSpriteLayer = {
  // properties
  motion: null,
  target: null,
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
AnimSpriteLayer.initialize = function () {
  // 创建混合模式选项
  $('#animSpriteLayer-blend').loadItems([
    {name: 'Normal', value: 'normal'},
    {name: 'Additive', value: 'additive'},
    {name: 'Subtract', value: 'subtract'},
  ])

  // 创建光照模式选项
  $('#animSpriteLayer-light').loadItems([
    {name: 'Raw', value: 'raw'},
    {name: 'Global Sampling', value: 'global'},
    {name: 'Anchor Sampling', value: 'anchor'},
  ])

  // 侦听事件
  const elements = document.querySelectorAll('#animSpriteLayer-sprite, #animSpriteLayer-blend, #animSpriteLayer-light')
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-layer-change'
      data.motion = this.motion
      data.direction = Animation.direction
    },
  ))
}

// 创建精灵层
AnimSpriteLayer.create = function () {
  return {
    class: 'sprite',
    name: 'Sprite',
    hidden: false,
    locked: false,
    sprite: '',
    blend: 'normal',
    light: 'raw',
    frames: [Inspector.animSpriteFrame.create()],
  }
}

// 打开数据
AnimSpriteLayer.open = function (layer) {
  if (this.target !== layer) {
    this.target = layer
    this.motion = Animation.motion

    // 创建精灵图选项
    const id = Animation.meta.guid
    const items = Animation.getSpriteListItems(id)
    $('#animSpriteLayer-sprite').loadItems(items)

    // 写入数据
    const write = getElementWriter('animSpriteLayer', layer)
    write('sprite')
    write('blend')
    write('light')
  }
}

// 关闭数据
AnimSpriteLayer.close = function () {
  if (this.target) {
    this.target = null
    this.motion = null
  }
}

// 更新数据
AnimSpriteLayer.update = function (layer, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'sprite':
    case 'blend':
    case 'light':
      if (layer[key] !== value) {
        layer[key] = value
      }
      break
  }
  Animation.requestRendering()
}

// 参数 - 输入事件
AnimSpriteLayer.paramInput = function (event) {
  AnimSpriteLayer.update(
    AnimSpriteLayer.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animSpriteLayer = AnimSpriteLayer
}
