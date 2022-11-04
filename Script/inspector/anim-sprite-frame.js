'use strict'

import * as Yami from '../yami.js'

// ******************************** 动画 - 精灵帧页面 ********************************

{
  const AnimSpriteFrame = {
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
  AnimSpriteFrame.initialize = function () {
    // 同步滑动框和数字框的数值
    $('#animSpriteFrame-tint-0-slider').synchronize($('#animSpriteFrame-tint-0'))
    $('#animSpriteFrame-tint-1-slider').synchronize($('#animSpriteFrame-tint-1'))
    $('#animSpriteFrame-tint-2-slider').synchronize($('#animSpriteFrame-tint-2'))
    $('#animSpriteFrame-tint-3-slider').synchronize($('#animSpriteFrame-tint-3'))

    // 侦听事件
    const elements = $(`#animSpriteFrame-x, #animSpriteFrame-y, #animSpriteFrame-rotation,
      #animSpriteFrame-scaleX, #animSpriteFrame-scaleY, #animSpriteFrame-opacity,
      #animSpriteFrame-tint-0, #animSpriteFrame-tint-1, #animSpriteFrame-tint-2, #animSpriteFrame-tint-3`)
    const sliders = $(`
      #animSpriteFrame-tint-0-slider, #animSpriteFrame-tint-1-slider,
      #animSpriteFrame-tint-2-slider, #animSpriteFrame-tint-3-slider`)
    elements.on('input', this.paramInput)
    elements.on('focus', Yami.Inspector.inputFocus)
    elements.on('blur', Yami.Inspector.inputBlur(
      this, Animation, data => {
        data.type = 'inspector-frame-change'
        data.motion = this.motion
      },
    ))
    sliders.on('focus', Yami.Inspector.sliderFocus)
    sliders.on('blur', Yami.Inspector.sliderBlur)

    // 初始化精灵窗口
    Yami.Sprite.initialize()
  }

  // 创建关键帧
  AnimSpriteFrame.create = function () {
    return {
      start: 0,           // 帧起始位置
      end: 1,             // 帧结束位置
      easingId: '',       // 过渡方式
      x: 0,               // 位移X
      y: 0,               // 位移Y
      rotation: 0,        // 旋转角度
      scaleX: 1,          // 缩放X
      scaleY: 1,          // 缩放Y
      opacity: 1,         // 不透明度
      spriteX: 0,         // 精灵索引X
      spriteY: 0,         // 精灵索引Y
      tint: [0, 0, 0, 0], // 精灵图像色调
    }
  }

  // 打开数据
  AnimSpriteFrame.open = function (frame) {
    if (this.target !== frame) {
      this.target = frame
      this.motion = Yami.Animation.motion
      Yami.Sprite.open(frame)
      Yami.Curve.load(frame)

      // 写入数据
      const write = Yami.getElementWriter('animSpriteFrame', frame)
      write('x')
      write('y')
      write('rotation')
      write('scaleX')
      write('scaleY')
      write('opacity')
      write('tint-0')
      write('tint-1')
      write('tint-2')
      write('tint-3')
    }
  }

  // 关闭数据
  AnimSpriteFrame.close = function () {
    if (this.target) {
      Yami.Animation.unselectMarquee(this.target)
      Yami.Sprite.close()
      Yami.Curve.load(null)
      this.target = null
      this.motion = null
    }
  }

  // 写入数据
  AnimSpriteFrame.write = function (options) {
    if (options.x !== undefined) {
      $('#animSpriteFrame-x').write(options.x)
    }
    if (options.y !== undefined) {
      $('#animSpriteFrame-y').write(options.y)
    }
    if (options.rotation !== undefined) {
      $('#animSpriteFrame-rotation').write(options.rotation)
    }
    if (options.scaleX !== undefined) {
      $('#animSpriteFrame-scaleX').write(options.scaleX)
    }
    if (options.scaleY !== undefined) {
      $('#animSpriteFrame-scaleY').write(options.scaleY)
    }
  }

  // 更新数据
  AnimSpriteFrame.update = function (frame, key, value) {
    Yami.Animation.planToSave()
    switch (key) {
      case 'x':
      case 'y':
      case 'rotation':
      case 'scaleX':
      case 'scaleY':
      case 'opacity':
        if (frame[key] !== value) {
          frame[key] = value
          Yami.Animation.updateFrameContexts()
        }
        break
      case 'tint-0':
      case 'tint-1':
      case 'tint-2':
      case 'tint-3': {
        const index = key.slice(-1)
        if (frame.tint[index] !== value) {
          frame.tint[index] = value
          Yami.Animation.updateFrameContexts()
        }
        break
      }
    }
    Yami.Animation.requestRendering()
  }

  // 参数 - 输入事件
  AnimSpriteFrame.paramInput = function (event) {
    AnimSpriteFrame.update(
      AnimSpriteFrame.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.animSpriteFrame = AnimSpriteFrame
}
