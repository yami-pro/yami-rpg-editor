'use strict'

import {
  Animation,
  Curve,
  getElementWriter,
  Inspector
} from '../yami'

// ******************************** 动画 - 关节帧页面 ********************************

{
const AnimJointFrame = {
  // properties
  motion: null,
  target: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
AnimJointFrame.initialize = function () {
  // 侦听事件
  const elements = $(`#animJointFrame-x, #animJointFrame-y, #animJointFrame-rotation,
    #animJointFrame-scaleX, #animJointFrame-scaleY, #animJointFrame-opacity`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(
    this, Animation, data => {
      data.type = 'inspector-frame-change'
      data.motion = this.motion
      data.direction = Animation.direction
    },
  ))
}

// 创建关键帧
AnimJointFrame.create = function () {
  return {
    start: 0,     // 帧起始位置
    end: 1,       // 帧结束位置
    easingId: '', // 过渡方式
    x: 0,         // 位移X
    y: 0,         // 位移Y
    rotation: 0,  // 旋转角度
    scaleX: 1,    // 缩放X
    scaleY: 1,    // 缩放Y
    opacity: 1,   // 不透明度
  }
}

// 打开数据
AnimJointFrame.open = function (frame) {
  if (this.target !== frame) {
    this.target = frame
    this.motion = Animation.motion
    Curve.load(frame)

    // 写入数据
    const write = getElementWriter('animJointFrame', frame)
    write('x')
    write('y')
    write('rotation')
    write('scaleX')
    write('scaleY')
    write('opacity')
  }
}

// 关闭数据
AnimJointFrame.close = function () {
  if (this.target) {
    Animation.unselectMarquee(this.target)
    Curve.load(null)
    this.target = null
    this.motion = null
  }
}

// 写入数据
AnimJointFrame.write = function (options) {
  if (options.x !== undefined) {
    $('#animJointFrame-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#animJointFrame-y').write(options.y)
  }
  if (options.rotation !== undefined) {
    $('#animJointFrame-rotation').write(options.rotation)
  }
  if (options.scaleX !== undefined) {
    $('#animJointFrame-scaleX').write(options.scaleX)
  }
  if (options.scaleY !== undefined) {
    $('#animJointFrame-scaleY').write(options.scaleY)
  }
}

// 更新数据
AnimJointFrame.update = function (frame, key, value) {
  Animation.planToSave()
  switch (key) {
    case 'x':
    case 'y':
    case 'rotation':
    case 'scaleX':
    case 'scaleY':
    case 'opacity':
      if (frame[key] !== value) {
        frame[key] = value
        Animation.updateFrameContexts()
      }
      break
  }
  Animation.requestRendering()
}

// 参数 - 输入事件
AnimJointFrame.paramInput = function (event) {
  AnimJointFrame.update(
    AnimJointFrame.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.animJointFrame = AnimJointFrame
}
