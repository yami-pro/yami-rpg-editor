"use strict"

import {
  Animation,
  getElementWriter,
  Inspector
} from "../yami"

// ******************************** 动画 - 粒子层页面 ********************************

{
const AnimParticleLayer = {
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
AnimParticleLayer.initialize = function () {
  // 创建发射角度选项
  $('#animParticleLayer-angle').loadItems([
    {name: 'Default', value: 'default'},
    {name: 'Inherit', value: 'inherit'},
  ])

  // 侦听事件
  const elements = document.querySelectorAll('#animParticleLayer-particleId, #animParticleLayer-angle')
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

// 创建关键帧
AnimParticleLayer.create = function () {
  return {
    class: 'particle',
    name: 'Particle',
    hidden: false,
    locked: false,
    particleId: '',
    angle: 'default',
    frames: [Inspector.animParticleFrame.create()],
  }
}

// 打开数据
AnimParticleLayer.open = function (layer) {
  if (this.target !== layer) {
    this.target = layer
    this.motion = Animation.motion

    // 写入数据
    const write = getElementWriter('animParticleLayer', layer)
    write('particleId')
    write('angle')
  }
}

// 关闭数据
AnimParticleLayer.close = function () {
  if (this.target) {
    this.target = null
    this.motion = null
  }
}

// 更新数据
AnimParticleLayer.update = function (layer, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'particleId':
      if (layer.particleId !== value) {
        layer.particleId = value
        Animation.player.destroyContextEmitters()
        Animation.updateFrameContexts()
      }
      break
    case 'angle':
      if (layer.angle !== value) {
        layer.angle = value
      }
      break
  }
  Animation.requestRendering()
}

// 参数 - 输入事件
AnimParticleLayer.paramInput = function (event) {
  AnimParticleLayer.update(
    AnimParticleLayer.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animParticleLayer = AnimParticleLayer
}
