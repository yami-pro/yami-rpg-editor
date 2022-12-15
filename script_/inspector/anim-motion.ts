"use strict"

import {
  Animation,
  getElementWriter,
  Inspector
} from "../yami"

// ******************************** 动画 - 动作页面 ********************************

{
const AnimMotion = {
  // properties
  owner: null,
  target: null,
  // methods
  initialize: null,
  create: null,
  createDir: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
AnimMotion.initialize = function () {
  // 设置所有者代理
  this.owner = {
    setTarget: motion => {
      Animation.setMotion(motion)
      Inspector.open('animMotion', motion)
    }
  }

  // 创建动画模式选项
  $('#animMotion-mode').loadItems([
    {name: '1 Directional', value: '1-dir'},
    {name: '2 Directional', value: '2-dir'},
    {name: '4 Directional', value: '4-dir'},
    {name: '8 Directional', value: '8-dir'},
    {name: '1 Directional - Mirror', value: '1-dir-mirror'},
    {name: '3 Directional - Mirror', value: '3-dir-mirror'},
    {name: '5 Directional - Mirror', value: '5-dir-mirror'},
  ])

  // 设置循环关联元素
  $('#animMotion-loop').relate([$('#animMotion-loopStart')])

  // 侦听事件
  const elMode = $('#animMotion-mode')
  const elements = document.querySelectorAll('#animMotion-loop, #animMotion-loopStart')
  elMode.on('input', this.paramInput)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Animation))
}

// 创建动作
AnimMotion.create = function (motionId) {
  return {
    class: 'motion',
    id: motionId,
    mode: '1-dir',
    loop: false,
    loopStart: 0,
    dirCases: [this.createDir()],
  }
}

// 创建方向
AnimMotion.createDir = function () {
  return {
    layers: [Inspector.animSpriteLayer.create()],
  }
}

// 打开数据
AnimMotion.open = function (motion) {
  if (this.target !== motion) {
    this.target = motion

    // 写入数据
    const write = getElementWriter('animMotion', motion)
    write('mode')
    write('loop')
    write('loopStart')
  }
}

// 关闭数据
AnimMotion.close = function () {
  if (this.target) {
    // 此处不能unselect并update
    // Animation.list.unselect(this.target)
    // Animation.updateTarget()
    this.target = null
  }
}

// 写入数据
AnimMotion.write = function (options) {
  if (options.mode !== undefined) {
    $('#animMotion-mode').write(options.mode)
  }
}

// 更新数据
AnimMotion.update = function (motion, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'mode':
      if (motion.mode !== value) {
        Animation.setMotionMode(value)
        Animation.createDirItems()
        break
      }
    case 'loop':
      if (motion.loop !== value) {
        motion.loop = value
        Animation.list.updateLoopIcon(motion)
      }
      break
    case 'loopStart':
      if (motion.loopStart !== value) {
        motion.loopStart = value
        Animation.player.computeLength()
      }
      break
  }
}

// 参数 - 输入事件
AnimMotion.paramInput = function (event) {
  AnimMotion.update(
    AnimMotion.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animMotion = AnimMotion
}
