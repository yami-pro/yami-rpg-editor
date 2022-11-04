'use strict'

import * as Yami from '../yami.js'

// ******************************** 场景 - 粒子页面 ********************************

{
  const SceneParticle = {
    // properties
    owner: Yami.Scene,
    target: null,
    nameBox: $('#sceneParticle-name'),
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
  SceneParticle.initialize = function () {
    // 绑定条件列表
    $('#sceneParticle-conditions').bind(new Yami.ConditionListInterface(this, Yami.Scene))

    // 绑定事件列表
    $('#sceneParticle-events').bind(new Yami.EventListInterface(this, Yami.Scene))

    // 绑定脚本列表
    $('#sceneParticle-scripts').bind(new Yami.ScriptListInterface(this, Yami.Scene))

    // 绑定脚本参数面板
    $('#sceneParticle-parameter-pane').bind($('#sceneParticle-scripts'))

    // 侦听事件
    const elements = $(`#sceneParticle-name,
      #sceneParticle-particleId, #sceneParticle-x, #sceneParticle-y,
      #sceneParticle-angle, #sceneParticle-scale, #sceneParticle-speed`)
    elements.on('input', this.paramInput)
    elements.on('focus', Yami.Inspector.inputFocus)
    elements.on('blur', Yami.Inspector.inputBlur(this, Yami.Scene))
    $('#sceneParticle-conditions, #sceneParticle-events, #sceneParticle-scripts').on('change', Yami.Scene.listChange)
  }

  // 创建粒子
  SceneParticle.create = function () {
    return {
      class: 'particle',
      name: 'Particle',
      hidden: false,
      locked: false,
      presetId: '',
      particleId: '',
      x: 0,
      y: 0,
      angle: 0,
      scale: 1,
      speed: 1,
      conditions: [],
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  SceneParticle.open = function (particle) {
    if (this.target !== particle) {
      this.target = particle

      // 写入数据
      const write = Yami.getElementWriter('sceneParticle', particle)
      write('name')
      write('particleId')
      write('x')
      write('y')
      write('angle')
      write('scale')
      write('speed')
      write('conditions')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  SceneParticle.close = function () {
    if (this.target) {
      Yami.Scene.list.unselect(this.target)
      Yami.Scene.updateTarget()
      this.target = null
      $('#sceneParticle-conditions').clear()
      $('#sceneParticle-events').clear()
      $('#sceneParticle-scripts').clear()
      $('#sceneParticle-parameter-pane').clear()
    }
  }

  // 写入数据
  SceneParticle.write = function (options) {
    if (options.x !== undefined) {
      $('#sceneParticle-x').write(options.x)
    }
    if (options.y !== undefined) {
      $('#sceneParticle-y').write(options.y)
    }
  }

  // 更新数据
  SceneParticle.update = function (particle, key, value) {
    Yami.Scene.planToSave()
    switch (key) {
      case 'name':
        if (particle.name !== value) {
          particle.name = value
          Yami.Scene.updateTargetInfo()
          Yami.Scene.list.updateItemName(particle)
        }
        break
      case 'particleId':
        if (particle.particleId !== value) {
          particle.particleId = value
          Yami.Scene.loadParticleContext(particle)
          Yami.Scene.list.updateIcon(particle)
        }
        break
      case 'x':
      case 'y':
        if (particle[key] !== value) {
          // const {x, y} = particle
          particle[key] = value
          // particle.emitter?.shift(Scene.getConvertedCoords({
          //   x: particle.x - x,
          //   y: particle.y - y,
          // }))
        }
        break
      case 'angle':
        if (particle.angle !== value) {
          particle.angle = value
          if (particle.emitter) {
            particle.emitter.angle = Math.radians(value)
          }
        }
        break
      case 'scale':
        if (particle.scale !== value) {
          particle.scale = value
          if (particle.emitter) {
            particle.emitter.scale = value
          }
        }
        break
      case 'speed':
        if (particle.speed !== value) {
          particle.speed = value
          if (particle.emitter) {
            particle.emitter.speed = value
          }
        }
        break
    }
    Yami.Scene.requestRendering()
  }

  // 参数 - 输入事件
  SceneParticle.paramInput = function (event) {
    SceneParticle.update(
      SceneParticle.target,
      Yami.Inspector.getKey(this),
      this.read(),
    )
  }

  Yami.Inspector.sceneParticle = SceneParticle
}
