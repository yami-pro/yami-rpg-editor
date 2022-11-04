'use strict'

import * as Yami from '../yami.js'

// ******************************** 动画 - 动作页面 ********************************

{
  const AnimMotion = {
    // properties
    owner: null,
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
  AnimMotion.initialize = function () {
    // 设置所有者代理
    this.owner = {
      setTarget: motion => {
        Yami.Animation.setMotion(motion)
        Yami.Inspector.open('animMotion', motion)
      }
    }

    // 设置循环关联元素
    $('#animMotion-loop').relate([$('#animMotion-loopStart')])

    // 侦听事件
    const elements = $('#animMotion-loop, #animMotion-loopStart')
    elements.on('input', this.paramInput)
    elements.on('focus', Yami.Inspector.inputFocus)
    elements.on('blur', Yami.Inspector.inputBlur(this, Animation))
  }

  // 创建动作
  AnimMotion.create = function (motionId) {
    return {
      class: 'motion',
      id: motionId,
      direction: Yami.Animation.mode === '1-dir' ? 'fixed' : 'right',
      loop: false,
      loopStart: 0,
      layers: [Yami.Inspector.animSpriteLayer.create()],
    }
  }

  // 打开数据
  AnimMotion.open = function (motion) {
    if (this.target !== motion) {
      this.target = motion

      // 写入数据
      const write = Yami.getElementWriter('animMotion', motion)
      write('loop')
      write('loopStart')
    }
  }

  // 关闭数据
  AnimMotion.close = function () {
    if (this.target) {
      // 此处不能unselect并update
      // Yami.Animation.list.unselect(this.target)
      // Yami.Animation.updateTarget()
      this.target = null
    }
  }

  // 更新数据
  AnimMotion.update = function (motion, key, value) {
    Yami.Animation.planToSave()
    switch (key) {
      case 'loop':
        if (motion.loop !== value) {
          motion.loop = value
          Yami.Animation.list.updateLoopIcon(motion)
        }
        break
      case 'loopStart':
        if (motion.loopStart !== value) {
          motion.loopStart = value
          Yami.Animation.player.computeLength()
        }
        break
    }
  }

  // 参数 - 输入事件
  AnimMotion.paramInput = function (event) {
    AnimMotion.update(
      AnimMotion.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.animMotion = AnimMotion
}
