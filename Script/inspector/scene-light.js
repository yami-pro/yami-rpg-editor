'use strict'

import { Inspector } from './inspector.js'
import { Scene } from '../scene/scene.js'

// ******************************** 场景 - 光源页面 ********************************

{
  const SceneLight = {
    // properties
    owner: Scene,
    target: null,
    nameBox: $('#sceneLight-name'),
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
  SceneLight.initialize = function () {
    // 加载类型选项
    $('#sceneLight-type').loadItems([
      {name: 'Point', value: 'point'},
      {name: 'Area', value: 'area'},
    ])

    // 加载混合模式选项
    $('#sceneLight-blend').loadItems([
      {name: 'Screen', value: 'screen'},
      {name: 'Additive', value: 'additive'},
      {name: 'Subtract', value: 'subtract'},
      {name: 'Max', value: 'max'},
    ])

    // 设置类型关联元素
    $('#sceneLight-type').enableHiddenMode().relate([
      {case: 'point', targets: [
        $('#sceneLight-range-box'),
        $('#sceneLight-intensity-box'),
      ]},
      {case: 'area', targets: [
        $('#sceneLight-mask'),
        $('#sceneLight-anchorX-box'),
        $('#sceneLight-anchorY-box'),
        $('#sceneLight-width-box'),
        $('#sceneLight-height-box'),
        $('#sceneLight-angle-box'),
      ]},
    ])

    // 绑定条件列表
    $('#sceneLight-conditions').bind(new ConditionListInterface(this, Scene))

    // 绑定事件列表
    $('#sceneLight-events').bind(new EventListInterface(this, Scene))

    // 绑定脚本列表
    $('#sceneLight-scripts').bind(new ScriptListInterface(this, Scene))

    // 绑定脚本参数面板
    $('#sceneLight-parameter-pane').bind($('#sceneLight-scripts'))

    // 同步滑动框和数字框的数值
    $('#sceneLight-range-slider').synchronize($('#sceneLight-range'))
    $('#sceneLight-intensity-slider').synchronize($('#sceneLight-intensity'))
    $('#sceneLight-anchorX-slider').synchronize($('#sceneLight-anchorX'))
    $('#sceneLight-anchorY-slider').synchronize($('#sceneLight-anchorY'))
    $('#sceneLight-width-slider').synchronize($('#sceneLight-width'))
    $('#sceneLight-height-slider').synchronize($('#sceneLight-height'))
    $('#sceneLight-angle-slider').synchronize($('#sceneLight-angle'))
    $('#sceneLight-red-slider').synchronize($('#sceneLight-red'))
    $('#sceneLight-green-slider').synchronize($('#sceneLight-green'))
    $('#sceneLight-blue-slider').synchronize($('#sceneLight-blue'))

    // 侦听事件
    const elements = $(`
      #sceneLight-name, #sceneLight-type,
      #sceneLight-blend, #sceneLight-x, #sceneLight-y,
      #sceneLight-range, #sceneLight-intensity,
      #sceneLight-mask, #sceneLight-anchorX, #sceneLight-anchorY,
      #sceneLight-width, #sceneLight-height, #sceneLight-angle,
      #sceneLight-red, #sceneLight-green, #sceneLight-blue`)
    const sliders = $(`
      #sceneLight-range-slider, #sceneLight-intensity-slider,
      #sceneLight-anchorX-slider, #sceneLight-anchorY-slider,
      #sceneLight-width-slider, #sceneLight-height-slider, #sceneLight-angle-slider,
      #sceneLight-red-slider, #sceneLight-green-slider, #sceneLight-blue-slider`)
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, Scene))
    sliders.on('focus', Inspector.sliderFocus)
    sliders.on('blur', Inspector.sliderBlur)
    $('#sceneLight-conditions, #sceneLight-events, #sceneLight-scripts').on('change', Scene.listChange)
  }

  // 创建光源
  SceneLight.create = function () {
    return {
      class: 'light',
      name: 'Light',
      hidden: false,
      locked: false,
      presetId: '',
      type: 'point',
      blend: 'screen',
      x: 0,
      y: 0,
      range: 4,
      intensity: 0,
      mask: '',
      anchorX: 0.5,
      anchorY: 0.5,
      width: 1,
      height: 1,
      angle: 0,
      red: 255,
      green: 255,
      blue: 255,
      conditions: [],
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  SceneLight.open = function (light) {
    if (this.target !== light) {
      this.target = light

      // 写入数据
      const write = getElementWriter('sceneLight', light)
      write('name')
      write('type')
      write('blend')
      write('x')
      write('y')
      write('range')
      write('intensity')
      write('mask')
      write('anchorX')
      write('anchorY')
      write('width')
      write('height')
      write('angle')
      write('red')
      write('green')
      write('blue')
      write('conditions')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  SceneLight.close = function () {
    if (this.target) {
      Scene.list.unselect(this.target)
      Scene.updateTarget()
      this.target = null
      $('#sceneLight-conditions').clear()
      $('#sceneLight-events').clear()
      $('#sceneLight-scripts').clear()
      $('#sceneLight-parameter-pane').clear()
    }
  }

  // 写入数据
  SceneLight.write = function (options) {
    if (options.x !== undefined) {
      $('#sceneLight-x').write(options.x)
    }
    if (options.y !== undefined) {
      $('#sceneLight-y').write(options.y)
    }
  }

  // 更新数据
  SceneLight.update = function (light, key, value) {
    Scene.planToSave()
    switch (key) {
      case 'name':
        if (light.name !== value) {
          light.name = value
          Scene.updateTargetInfo()
          Scene.list.updateItemName(light)
        }
        break
      case 'type':
        if (light.type !== value) {
          light.type = value
          light.instance.measure()
        }
        break
      case 'blend':
      case 'x':
      case 'y':
      case 'range':
      case 'intensity':
      case 'mask':
        if (light[key] !== value) {
          light[key] = value
        }
        break
      case 'anchorX':
      case 'anchorY':
      case 'width':
      case 'height':
      case 'angle':
        if (light[key] !== value) {
          light[key] = value
          light.instance.measure()
        }
        break
      case 'red':
      case 'green':
      case 'blue':
        if (light[key] !== value) {
          light[key] = value
          Scene.list.updateIcon(light)
        }
        break
    }
    Scene.requestRendering()
  }

  // 基本参数 - 输入事件
  SceneLight.paramInput = function (event) {
    SceneLight.update(
      SceneLight.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.sceneLight = SceneLight
}
