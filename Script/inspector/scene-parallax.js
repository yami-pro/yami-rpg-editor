'use strict'

import * as Yami from '../yami.js'

// ******************************** 场景 - 视差图页面 ********************************

{
  const SceneParallax = {
    // properties
    owner: Yami.Scene,
    target: null,
    nameBox: $('#sceneParallax-name'),
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
  SceneParallax.initialize = function () {
    // 创建图层选项
    $('#sceneParallax-layer').loadItems([
      {name: 'Background', value: 'background'},
      {name: 'Foreground', value: 'foreground'},
    ])

    // 创建光线采样选项
    $('#sceneParallax-light').loadItems([
      {name: 'Raw', value: 'raw'},
      {name: 'Global Sampling', value: 'global'},
      {name: 'Anchor Sampling', value: 'anchor'},
      {name: 'Ambient Light', value: 'ambient'},
    ])

    // 创建混合模式选项
    $('#sceneParallax-blend').loadItems([
      {name: 'Normal', value: 'normal'},
      {name: 'Additive', value: 'additive'},
      {name: 'Subtract', value: 'subtract'},
    ])

    // 同步滑动框和数字框的数值
    $('#sceneParallax-tint-0-slider').synchronize($('#sceneParallax-tint-0'))
    $('#sceneParallax-tint-1-slider').synchronize($('#sceneParallax-tint-1'))
    $('#sceneParallax-tint-2-slider').synchronize($('#sceneParallax-tint-2'))
    $('#sceneParallax-tint-3-slider').synchronize($('#sceneParallax-tint-3'))

    // 绑定条件列表
    $('#sceneParallax-conditions').bind(new Yami.ConditionListInterface(this, Yami.Scene))

    // 绑定事件列表
    $('#sceneParallax-events').bind(new Yami.EventListInterface(this, Yami.Scene))

    // 绑定脚本列表
    $('#sceneParallax-scripts').bind(new Yami.ScriptListInterface(this, Yami.Scene))

    // 绑定脚本参数面板
    $('#sceneParallax-parameter-pane').bind($('#sceneParallax-scripts'))

    // 侦听事件
    const elements = $(`#sceneParallax-name,
      #sceneParallax-image, #sceneParallax-layer, #sceneParallax-order,
      #sceneParallax-light, #sceneParallax-blend,
      #sceneParallax-opacity, #sceneParallax-x, #sceneParallax-y,
      #sceneParallax-scaleX, #sceneParallax-scaleY,
      #sceneParallax-repeatX, #sceneParallax-repeatY,
      #sceneParallax-anchorX, #sceneParallax-anchorY,
      #sceneParallax-offsetX, #sceneParallax-offsetY,
      #sceneParallax-parallaxFactorX, #sceneParallax-parallaxFactorY,
      #sceneParallax-shiftSpeedX, #sceneParallax-shiftSpeedY,
      #sceneParallax-tint-0, #sceneParallax-tint-1,
      #sceneParallax-tint-2, #sceneParallax-tint-3`)
    const sliders = $(`
      #sceneParallax-tint-0-slider, #sceneParallax-tint-1-slider,
      #sceneParallax-tint-2-slider, #sceneParallax-tint-3-slider`)
    elements.on('input', this.paramInput)
    elements.on('focus', Yami.Inspector.inputFocus)
    elements.on('blur', Yami.Inspector.inputBlur(this, Yami.Scene))
    sliders.on('focus', Yami.Inspector.sliderFocus)
    sliders.on('blur', Yami.Inspector.sliderBlur)
    $('#sceneParallax-conditions, #sceneParallax-events, #sceneParallax-scripts').on('change', Yami.Scene.listChange)
  }

  // 创建视差图
  SceneParallax.create = function () {
    return {
      class: 'parallax',
      name: 'Parallax',
      hidden: false,
      locked: false,
      presetId: '',
      image: '',
      layer: 'foreground',
      order: 0,
      light: 'raw',
      blend: 'normal',
      opacity: 1,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      repeatX: 1,
      repeatY: 1,
      anchorX: 0,
      anchorY: 0,
      offsetX: 0,
      offsetY: 0,
      parallaxFactorX: 1,
      parallaxFactorY: 1,
      shiftSpeedX: 0,
      shiftSpeedY: 0,
      tint: [0, 0, 0, 0],
      conditions: [],
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  SceneParallax.open = function (parallax) {
    if (this.target !== parallax) {
      this.target = parallax

      // 写入数据
      const write = Yami.getElementWriter('sceneParallax', parallax)
      write('name')
      write('image')
      write('layer')
      write('order')
      write('light')
      write('blend')
      write('opacity')
      write('x')
      write('y')
      write('scaleX')
      write('scaleY')
      write('repeatX')
      write('repeatY')
      write('anchorX')
      write('anchorY')
      write('offsetX')
      write('offsetY')
      write('parallaxFactorX')
      write('parallaxFactorY')
      write('shiftSpeedX')
      write('shiftSpeedY')
      write('tint-0')
      write('tint-1')
      write('tint-2')
      write('tint-3')
      write('conditions')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  SceneParallax.close = function () {
    if (this.target) {
      Yami.Scene.list.unselect(this.target)
      Yami.Scene.updateTarget()
      this.target = null
      $('#sceneParallax-conditions').clear()
      $('#sceneParallax-events').clear()
      $('#sceneParallax-scripts').clear()
      $('#sceneParallax-parameter-pane').clear()
    }
  }

  // 写入数据
  SceneParallax.write = function (options) {
    if (options.x !== undefined) {
      $('#sceneParallax-x').write(options.x)
    }
    if (options.y !== undefined) {
      $('#sceneParallax-y').write(options.y)
    }
  }

  // 更新数据
  SceneParallax.update = function (parallax, key, value) {
    Yami.Scene.planToSave()
    switch (key) {
      case 'name':
        if (parallax.name !== value) {
          parallax.name = value
          Yami.Scene.updateTargetInfo()
          Yami.Scene.list.updateItemName(parallax)
        }
        break
      case 'image':
        if (parallax.image !== value) {
          parallax.image = value
          parallax.player.destroy()
          parallax.player.loadTexture()
          Yami.Scene.list.updateIcon(parallax)
        }
        break
      case 'layer':
      case 'order':
        if (parallax[key] !== value) {
          parallax[key] = value
          Yami.Scene.loadObjects()
        }
        break
      case 'light':
      case 'blend':
      case 'opacity':
      case 'x':
      case 'y':
      case 'scaleX':
      case 'scaleY':
      case 'repeatX':
      case 'repeatY':
      case 'anchorX':
      case 'anchorY':
      case 'offsetX':
      case 'offsetY':
      case 'parallaxFactorX':
      case 'parallaxFactorY':
        if (parallax[key] !== value) {
          parallax[key] = value
        }
        break
      case 'shiftSpeedX':
        if (parallax.shiftSpeedX !== value) {
          parallax.shiftSpeedX = value
          if (value === 0) {
            parallax.player.shiftX = 0
          }
        }
        break
      case 'shiftSpeedY':
        if (parallax.shiftSpeedY !== value) {
          parallax.shiftSpeedY = value
          if (value === 0) {
            parallax.player.shiftY = 0
          }
        }
        break
      case 'tint-0':
      case 'tint-1':
      case 'tint-2':
      case 'tint-3': {
        const index = key.indexOf('-') + 1
        const color = key.slice(index)
        if (parallax.tint[color] !== value) {
          parallax.tint[color] = value
        }
        break
      }
    }
    Yami.Scene.requestRendering()
  }

  // 参数 - 输入事件
  SceneParallax.paramInput = function (event) {
    SceneParallax.update(
      SceneParallax.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.sceneParallax = SceneParallax
}
