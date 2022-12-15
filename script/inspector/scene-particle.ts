"use strict"

import {
  ConditionListInterface,
  EventListInterface,
  getElementWriter,
  Inspector,
  Scene,
  ScriptListInterface
} from "../yami"

// ******************************** 场景 - 粒子页面 ********************************

{
const SceneParticle = {
  // properties
  owner: Scene,
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
  $('#sceneParticle-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneParticle-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneParticle-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneParticle-parameter-pane').bind($('#sceneParticle-scripts'))

  // 侦听事件
  const elements = $(`#sceneParticle-name,
    #sceneParticle-particleId, #sceneParticle-x, #sceneParticle-y,
    #sceneParticle-angle, #sceneParticle-scale, #sceneParticle-speed`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  document.querySelectorAll('#sceneParticle-conditions, #sceneParticle-events, #sceneParticle-scripts').on('change', Scene.listChange)
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
    const write = getElementWriter('sceneParticle', particle)
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
    Scene.list.unselect(this.target)
    Scene.updateTarget()
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
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (particle.name !== value) {
        particle.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(particle)
      }
      break
    case 'particleId':
      if (particle.particleId !== value) {
        particle.particleId = value
        Scene.loadParticleContext(particle)
        Scene.list.updateIcon(particle)
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
  Scene.requestRendering()
}

// 参数 - 输入事件
SceneParticle.paramInput = function (event) {
  SceneParticle.update(
    SceneParticle.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneParticle = SceneParticle
}
