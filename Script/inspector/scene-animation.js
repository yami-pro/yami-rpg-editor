'use strict'

import * as Yami from '../yami.js'

// ******************************** 场景 - 动画页面 ********************************

{
  const SceneAnimation = {
    // properties
    owner: Yami.Scene,
    target: null,
    nameBox: $('#sceneAnimation-name'),
    motions: null,
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    write: null,
    update: null,
    // events
    animationIdWrite: null,
    paramInput: null,
  }

  // 初始化
  SceneAnimation.initialize = function () {
    // 创建翻转选项
    $('#sceneAnimation-mirror').loadItems([
      {name: 'None', value: 'none'},
      {name: 'Horizontal', value: 'horizontal'},
      {name: 'Vertical', value: 'vertical'},
      {name: 'Both', value: 'both'},
    ])

    // 绑定条件列表
    $('#sceneAnimation-conditions').bind(new Yami.ConditionListInterface(this, Yami.Scene))

    // 绑定事件列表
    $('#sceneAnimation-events').bind(new Yami.EventListInterface(this, Yami.Scene))

    // 绑定脚本列表
    $('#sceneAnimation-scripts').bind(new Yami.ScriptListInterface(this, Yami.Scene))

    // 绑定脚本参数面板
    $('#sceneAnimation-parameter-pane').bind($('#sceneAnimation-scripts'))

    // 侦听事件
    $('#sceneAnimation-animationId').on('write', this.animationIdWrite)
    const elements = $(`#sceneAnimation-name,
      #sceneAnimation-animationId, #sceneAnimation-motion,
      #sceneAnimation-mirror, #sceneAnimation-x, #sceneAnimation-y`)
    elements.on('input', this.paramInput)
    elements.on('focus', Yami.Inspector.inputFocus)
    elements.on('blur', Yami.Inspector.inputBlur(this, Yami.Scene))
    $('#sceneAnimation-conditions, #sceneAnimation-events, #sceneAnimation-scripts').on('change', Yami.Scene.listChange)
  }

  // 创建动画
  SceneAnimation.create = function () {
    return {
      class: 'animation',
      name: 'Animation',
      hidden: false,
      locked: false,
      presetId: '',
      animationId: '',
      motion: '',
      mirror: 'none',
      x: 0,
      y: 0,
      conditions: [],
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  SceneAnimation.open = function (animation) {
    if (this.target !== animation) {
      this.target = animation

      // 写入数据
      const write = Yami.getElementWriter('sceneAnimation', animation)
      write('name')
      write('animationId')
      write('motion')
      write('mirror')
      write('x')
      write('y')
      write('conditions')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  SceneAnimation.close = function () {
    if (this.target) {
      Yami.Scene.list.unselect(this.target)
      Yami.Scene.updateTarget()
      this.target = null
      this.motions = null
      $('#sceneAnimation-conditions').clear()
      $('#sceneAnimation-events').clear()
      $('#sceneAnimation-scripts').clear()
      $('#sceneAnimation-parameter-pane').clear()
    }
  }

  // 写入数据
  SceneAnimation.write = function (options) {
    if (options.x !== undefined) {
      $('#sceneAnimation-x').write(options.x)
    }
    if (options.y !== undefined) {
      $('#sceneAnimation-y').write(options.y)
    }
  }

  // 更新数据
  SceneAnimation.update = function (animation, key, value) {
    Yami.Scene.planToSave()
    switch (key) {
      case 'name':
        if (animation.name !== value) {
          animation.name = value
          Yami.Scene.updateTargetInfo()
          Yami.Scene.list.updateItemName(animation)
        }
        break
      case 'animationId':
        if (animation.animationId !== value) {
          animation.animationId = value
          SceneAnimation.motions = null
          Yami.Scene.destroyObjectContext(animation)
          Yami.Scene.loadAnimationContext(animation)
        }
        break
      case 'motion':
        if (animation.motion !== value) {
          animation.motion = value
          if (animation.player.switch(value)) {
            animation.player.restart()
          }
        }
        break
      case 'mirror':
        if (animation.mirror !== value) {
          animation.mirror = value
          animation.player.mirror = value
        }
        break
      case 'x':
      case 'y':
        if (animation[key] !== value) {
          animation[key] = value
        }
        break
    }
    Yami.Scene.requestRendering()
  }

  // 动画ID - 写入事件
  SceneAnimation.animationIdWrite = function (event) {
    const elMotion = $('#sceneAnimation-motion')
    const items = Animation.getMotionListItems(event.value)
    elMotion.loadItems(items)
    elMotion.write(elMotion.read() ?? items[0].value)
  }

  // 参数 - 输入事件
  SceneAnimation.paramInput = function (event) {
    SceneAnimation.update(
      SceneAnimation.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.sceneAnimation = SceneAnimation
}
