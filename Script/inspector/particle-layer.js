'use strict'

import { Inspector } from './inspector.js'
import { Particle } from '../particle/particle.js'
import { Data } from '../data/data.js'

// ******************************** 粒子 - 图层页面 ********************************

{
  const ParticleLayer = {
    // properties
    owner: Particle,
    target: null,
    nameBox: $('#particleLayer-name'),
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
  ParticleLayer.initialize = function () {
    // 创建发射区域类型选项
    $('#particleLayer-area-type').loadItems([
      {name: 'Point', value: 'point'},
      {name: 'Rectangle', value: 'rectangle'},
      {name: 'Circle', value: 'circle'},
      {name: 'Screen Edge', value: 'edge'},
    ])

    // 创建混合模式选项
    $('#particleLayer-blend').loadItems([
      {name: 'Normal', value: 'normal'},
      {name: 'Additive', value: 'additive'},
      {name: 'Subtract', value: 'subtract'},
    ])

    // 创建排序模式选项
    $('#particleLayer-sort').loadItems([
      {name: 'Youngest in Front', value: 'youngest-in-front'},
      {name: 'Oldest in Front', value: 'oldest-in-front'},
      {name: 'By Scale Factor', value: 'by-scale-factor'},
    ])

    // 创建颜色模式选项
    $('#particleLayer-color-mode').loadItems([
      {name: 'Fixed', value: 'fixed'},
      {name: 'Random', value: 'random'},
      {name: 'Easing', value: 'easing'},
      {name: 'Texture Sampling', value: 'texture'},
    ])

    // 设置发射区域类型关联元素
    $('#particleLayer-area-type').enableHiddenMode().relate([
      {case: 'rectangle', targets: [
        $('#particleLayer-area-width'),
        $('#particleLayer-area-height'),
      ]},
      {case: 'circle', targets: [
        $('#particleLayer-area-radius'),
      ]},
    ])

    // 设置颜色模式关联元素
    $('#particleLayer-color-mode').enableHiddenMode().relate([
      {case: 'fixed', targets: [
        $('#particleLayer-color-rgba-box'),
      ]},
      {case: 'random', targets: [
        $('#particleLayer-color-min-box'),
        $('#particleLayer-color-max-box'),
      ]},
      {case: 'easing', targets: [
        $('#particleLayer-color-easingId'),
        $('#particleLayer-color-startMin-box'),
        $('#particleLayer-color-startMax-box'),
        $('#particleLayer-color-endMin-box'),
        $('#particleLayer-color-endMax-box'),
      ]},
      {case: 'texture', targets: [
        $('#particleLayer-color-tint-0-box'),
        $('#particleLayer-color-tint-1-box'),
        $('#particleLayer-color-tint-2-box'),
        $('#particleLayer-color-tint-3-box'),
      ]},
    ])

    // 同步滑动框和数字框的数值
    $('#particleLayer-color-tint-0-slider').synchronize($('#particleLayer-color-tint-0'))
    $('#particleLayer-color-tint-1-slider').synchronize($('#particleLayer-color-tint-1'))
    $('#particleLayer-color-tint-2-slider').synchronize($('#particleLayer-color-tint-2'))
    $('#particleLayer-color-tint-3-slider').synchronize($('#particleLayer-color-tint-3'))

    // 侦听事件
    const elements = $(`#particleLayer-name, #particleLayer-area-type,
      #particleLayer-area-width, #particleLayer-area-height, #particleLayer-area-radius,
      #particleLayer-maximum, #particleLayer-count,
      #particleLayer-delay, #particleLayer-interval, #particleLayer-lifetime,
      #particleLayer-lifetimeDev, #particleLayer-fadeout,
      #particleLayer-anchor-x-0, #particleLayer-anchor-x-1,
      #particleLayer-anchor-y-0, #particleLayer-anchor-y-1,
      #particleLayer-movement-angle-0, #particleLayer-movement-angle-1,
      #particleLayer-movement-speed-0, #particleLayer-movement-speed-1,
      #particleLayer-movement-accelAngle-0, #particleLayer-movement-accelAngle-1,
      #particleLayer-movement-accel-0, #particleLayer-movement-accel-1,
      #particleLayer-rotation-angle-0, #particleLayer-rotation-angle-1,
      #particleLayer-rotation-speed-0, #particleLayer-rotation-speed-1,
      #particleLayer-rotation-accel-0, #particleLayer-rotation-accel-1,
      #particleLayer-scale-factor-0, #particleLayer-scale-factor-1,
      #particleLayer-scale-speed-0, #particleLayer-scale-speed-1,
      #particleLayer-scale-accel-0, #particleLayer-scale-accel-1,
      #particleLayer-image, #particleLayer-blend, #particleLayer-sort,
      #particleLayer-hframes, #particleLayer-vframes,
      #particleLayer-color-mode,
      #particleLayer-color-rgba-0, #particleLayer-color-rgba-1,
      #particleLayer-color-rgba-2, #particleLayer-color-rgba-3,
      #particleLayer-color-min-0, #particleLayer-color-min-1,
      #particleLayer-color-min-2, #particleLayer-color-min-3,
      #particleLayer-color-max-0, #particleLayer-color-max-1,
      #particleLayer-color-max-2, #particleLayer-color-max-3,
      #particleLayer-color-easingId,
      #particleLayer-color-startMin-0, #particleLayer-color-startMin-1,
      #particleLayer-color-startMin-2, #particleLayer-color-startMin-3,
      #particleLayer-color-startMax-0, #particleLayer-color-startMax-1,
      #particleLayer-color-startMax-2, #particleLayer-color-startMax-3,
      #particleLayer-color-endMin-0, #particleLayer-color-endMin-1,
      #particleLayer-color-endMin-2, #particleLayer-color-endMin-3,
      #particleLayer-color-endMax-0, #particleLayer-color-endMax-1,
      #particleLayer-color-endMax-2, #particleLayer-color-endMax-3,
      #particleLayer-color-tint-0, #particleLayer-color-tint-1,
      #particleLayer-color-tint-2, #particleLayer-color-tint-3`)
    const sliders = $(`
      #particleLayer-color-tint-0-slider, #particleLayer-color-tint-1-slider,
      #particleLayer-color-tint-2-slider, #particleLayer-color-tint-3-slider`)
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, Particle))
    sliders.on('focus', Inspector.sliderFocus)
    sliders.on('blur', Inspector.sliderBlur)
  }

  // 创建粒子图层
  ParticleLayer.create = function () {
    return {
      name: 'Layer',
      hidden: false,
      locked: false,
      area: {
        type: 'point',
      },
      maximum: 20,
      count: 0,
      delay: 0,
      interval: 40,
      lifetime: 1000,
      lifetimeDev: 0,
      fadeout: 200,
      anchor: {
        x: [0.5, 0.5],
        y: [0.5, 0.5],
      },
      movement: {
        angle: [0, 0],
        speed: [0, 0],
        accelAngle: [0, 0],
        accel: [0, 0],
      },
      rotation: {
        angle: [0, 0],
        speed: [0, 0],
        accel: [0, 0],
      },
      scale: {
        factor: [1, 1],
        speed: [0, 0],
        accel: [0, 0],
      },
      image: '',
      blend: 'normal',
      sort: 'youngest-in-front',
      hframes: 1,
      vframes: 1,
      color: {
        mode: 'texture',
        tint: [0, 0, 0, 0],
      },
    }
  }

  // 打开数据
  ParticleLayer.open = function (layer) {
    if (this.target !== layer) {
      this.target = layer

      // 创建过渡方式选项
      $('#particleLayer-color-easingId').loadItems(
        Data.createEasingItems()
      )

      // 写入数据
      const write = getElementWriter('particleLayer', layer)
      const {area, color} = layer
      const {rgba, min, max, easingId, startMin, startMax, endMin, endMax, tint} = color
      write('name')
      write('area-type')
      write('area-width', area.width ?? 64)
      write('area-height', area.height ?? 64)
      write('area-radius', area.radius ?? 32)
      write('maximum')
      write('count')
      write('delay')
      write('interval')
      write('lifetime')
      write('lifetimeDev')
      write('fadeout')
      write('anchor-x-0')
      write('anchor-x-1')
      write('anchor-y-0')
      write('anchor-y-1')
      write('movement-angle-0')
      write('movement-angle-1')
      write('movement-speed-0')
      write('movement-speed-1')
      write('movement-accelAngle-0')
      write('movement-accelAngle-1')
      write('movement-accel-0')
      write('movement-accel-1')
      write('rotation-angle-0')
      write('rotation-angle-1')
      write('rotation-speed-0')
      write('rotation-speed-1')
      write('rotation-accel-0')
      write('rotation-accel-1')
      write('scale-factor-0')
      write('scale-factor-1')
      write('scale-speed-0')
      write('scale-speed-1')
      write('scale-accel-0')
      write('scale-accel-1')
      write('image')
      write('blend')
      write('sort')
      write('hframes')
      write('vframes')
      write('color-mode')
      write('color-rgba-0', rgba?.[0] ?? 255)
      write('color-rgba-1', rgba?.[1] ?? 255)
      write('color-rgba-2', rgba?.[2] ?? 255)
      write('color-rgba-3', rgba?.[3] ?? 255)
      write('color-min-0', min?.[0] ?? 0)
      write('color-min-1', min?.[1] ?? 0)
      write('color-min-2', min?.[2] ?? 0)
      write('color-min-3', min?.[3] ?? 255)
      write('color-max-0', max?.[0] ?? 255)
      write('color-max-1', max?.[1] ?? 255)
      write('color-max-2', max?.[2] ?? 255)
      write('color-max-3', max?.[3] ?? 255)
      write('color-easingId', easingId ?? Data.easings[0].id)
      write('color-startMin-0', startMin?.[0] ?? 0)
      write('color-startMin-1', startMin?.[1] ?? 0)
      write('color-startMin-2', startMin?.[2] ?? 0)
      write('color-startMin-3', startMin?.[3] ?? 255)
      write('color-startMax-0', startMax?.[0] ?? 255)
      write('color-startMax-1', startMax?.[1] ?? 255)
      write('color-startMax-2', startMax?.[2] ?? 255)
      write('color-startMax-3', startMax?.[3] ?? 255)
      write('color-endMin-0', endMin?.[0] ?? 0)
      write('color-endMin-1', endMin?.[1] ?? 0)
      write('color-endMin-2', endMin?.[2] ?? 0)
      write('color-endMin-3', endMin?.[3] ?? 255)
      write('color-endMax-0', endMax?.[0] ?? 255)
      write('color-endMax-1', endMax?.[1] ?? 255)
      write('color-endMax-2', endMax?.[2] ?? 255)
      write('color-endMax-3', endMax?.[3] ?? 255)
      write('color-tint-0', tint?.[0] ?? 0)
      write('color-tint-1', tint?.[1] ?? 0)
      write('color-tint-2', tint?.[2] ?? 0)
      write('color-tint-3', tint?.[3] ?? 0)
    }
  }

  // 关闭数据
  ParticleLayer.close = function () {
    if (this.target) {
      Particle.list.unselect(this.target)
      Particle.updateTarget()
      this.target = null
    }
  }

  // 更新数据
  ParticleLayer.update = function (layer, key, value) {
    const layerInstance = Particle.emitter.getLayer(layer)
    Particle.planToSave()
    switch (key) {
      case 'name':
        if (layer.name !== value) {
          layer.name = value
          Particle.updateParticleInfo()
          Particle.list.updateItemName(layer)
        }
        break
      case 'area-type': {
        const {area} = layer
        if (area.type !== value) {
          area.type = value
          delete area.width
          delete area.height
          delete area.radius
          const read = getElementReader('particleLayer-area')
          switch (value) {
            case 'point':
            case 'edge':
              break
            case 'rectangle':
              area.width = read('width')
              area.height = read('height')
              break
            case 'circle':
              area.radius = read('radius')
              break
          }
          layerInstance.updateElementMethods()
          Particle.computeOuterRect()
        }
        break
      }
      case 'area-width':
      case 'area-height':
      case 'area-radius': {
        const {area} = layer
        const index = key.indexOf('-') + 1
        const property = key.slice(index)
        if (area[property] !== value) {
          area[property] = value
          Particle.computeOuterRect()
        }
        break
      }
      case 'maximum':
        if (layer.maximum !== value) {
          layer.maximum = value
          layerInstance.setMaximum(value)
        }
        break
      case 'count':
        if (layer.count !== value) {
          layer.count = value
          layerInstance.updateCount()
          layerInstance.clear()
        }
        break
      case 'delay':
        if (layer.delay !== value) {
          layer.delay = value
          layerInstance.clear()
        }
        break
      case 'interval':
        if (layer.interval !== value) {
          layer.interval = value
          if (layerInstance.elapsed >= value) {
            layerInstance.elapsed = 0
          }
          if (value === 0) {
            layerInstance.clear()
          }
        }
        break
      case 'lifetime':
      case 'lifetimeDev':
        if (layer[key] !== value) {
          layer[key] = value
          layerInstance.clear()
        }
        break
      case 'fadeout':
        if (layer.fadeout !== value) {
          layer.fadeout = value
        }
        break
      case 'image':
        if (layer.image !== value) {
          layer.image = value
          layerInstance.loadTexture()
          Particle.list.updateIcon(layer)
        }
        break
      case 'blend':
      case 'sort':
        if (layer[key] !== value) {
          layer[key] = value
        }
        break
      case 'hframes':
      case 'vframes':
        if (layer[key] !== value) {
          layer[key] = value
          layerInstance.calculateElementSize()
          layerInstance.resizeElementIndices()
          Particle.list.updateIcon(layer)
        }
        break
      case 'color-mode': {
        const {color} = layer
        if (color.mode !== value) {
          color.mode = value
          delete color.rgba
          delete color.min
          delete color.max
          delete color.easingId
          delete color.startMin
          delete color.startMax
          delete color.endMin
          delete color.endMax
          delete color.tint
          const read = getElementReader('particleLayer-color')
          switch (value) {
            case 'fixed':
              color.rgba = [read('rgba-0'), read('rgba-1'), read('rgba-2'), read('rgba-3')]
              break
            case 'random':
              color.min = [read('min-0'), read('min-1'), read('min-2'), read('min-3')]
              color.max = [read('max-0'), read('max-1'), read('max-2'), read('max-3')]
              break
            case 'easing':
              color.easingId = read('easingId')
              color.startMin = [read('startMin-0'), read('startMin-1'), read('startMin-2'), read('startMin-3')]
              color.startMax = [read('startMax-0'), read('startMax-1'), read('startMax-2'), read('startMax-3')]
              color.endMin = [read('endMin-0'), read('endMin-1'), read('endMin-2'), read('endMin-3')]
              color.endMax = [read('endMax-0'), read('endMax-1'), read('endMax-2'), read('endMax-3')]
              layerInstance.updateEasing()
              break
            case 'texture':
              color.tint = [read('tint-0'), read('tint-1'), read('tint-2'), read('tint-3')]
              break
          }
          layerInstance.updateElementMethods()
        }
        break
      }
      case 'color-easingId': {
        const {color} = layer
        if (color.easingId !== value) {
          color.easingId = value
          layerInstance.updateEasing()
        }
        break
      }
      case 'anchor-x-0':
      case 'anchor-x-1':
      case 'anchor-y-0':
      case 'anchor-y-1':
      case 'movement-angle-0':
      case 'movement-angle-1':
      case 'movement-speed-0':
      case 'movement-speed-1':
      case 'movement-accelAngle-0':
      case 'movement-accelAngle-1':
      case 'movement-accel-0':
      case 'movement-accel-1':
      case 'rotation-angle-0':
      case 'rotation-angle-1':
      case 'rotation-speed-0':
      case 'rotation-speed-1':
      case 'rotation-accel-0':
      case 'rotation-accel-1':
      case 'scale-factor-0':
      case 'scale-factor-1':
      case 'scale-speed-0':
      case 'scale-speed-1':
      case 'scale-accel-0':
      case 'scale-accel-1':
      case 'color-rgba-0':
      case 'color-rgba-1':
      case 'color-rgba-2':
      case 'color-rgba-3':
      case 'color-min-0':
      case 'color-min-1':
      case 'color-min-2':
      case 'color-min-3':
      case 'color-max-0':
      case 'color-max-1':
      case 'color-max-2':
      case 'color-max-3':
      case 'color-startMin-0':
      case 'color-startMin-1':
      case 'color-startMin-2':
      case 'color-startMin-3':
      case 'color-startMax-0':
      case 'color-startMax-1':
      case 'color-startMax-2':
      case 'color-startMax-3':
      case 'color-endMin-0':
      case 'color-endMin-1':
      case 'color-endMin-2':
      case 'color-endMin-3':
      case 'color-endMax-0':
      case 'color-endMax-1':
      case 'color-endMax-2':
      case 'color-endMax-3':
      case 'color-tint-0':
      case 'color-tint-1':
      case 'color-tint-2':
      case 'color-tint-3': {
        const keys = key.split('-')
        const last = keys.length - 1
        let node = layer
        for (let i = 0; i < last; i++) {
          node = node[keys[i]]
        }
        const property = keys[last]
        if (node[property] !== value) {
          node[property] = value
        }
        break
      }
    }
    Particle.requestRendering()
  }

  // 参数 - 输入事件
  ParticleLayer.paramInput = function (event) {
    ParticleLayer.update(
      ParticleLayer.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.particleLayer = ParticleLayer
}
