'use strict'

import { Particle } from './particle.js'

// ******************************** 粒子发射器类 ********************************

class ParticleEmitter {
  data      //:object
  startX    //:number
  startY    //:number
  angle     //:number
  scale     //:number
  speed     //:number
  elapsed   //:number
  duration  //:number
  matrix    //:object
  layers    //:array

  constructor(data) {
    const sLayers = data.layers
    const sLength = sLayers.length
    const dLayers = new Array(sLength)
    for (let i = 0; i < sLength; i++) {
      dLayers[i] = new Particle.Layer(this, sLayers[i])
    }
    this.data = data
    this.startX = 0
    this.startY = 0
    this.angle = 0
    this.scale = 1
    this.speed = 1
    this.elapsed = 0
    this.duration = data.duration || Infinity
    this.matrix = null
    this.layers = dLayers
  }

  // 获取图层
  getLayer(layerData) {
    for (const layer of this.layers) {
      if (layer.data === layerData) {
        return layer
      }
    }
  }

  // 更新图层
  updateLayers() {
    const map = new Map()
    for (const layer of this.layers) {
      map.set(layer.data, layer)
    }
    const sLayers = this.data.layers
    const sLength = sLayers.length
    const dLayers = new Array(sLength)
    for (let i = 0; i < sLength; i++) {
      const sLayer = sLayers[i]
      let dLayer = map.get(sLayer)
      if (dLayer) map.delete(sLayer)
      else dLayer = new Particle.Layer(this, sLayer)
      dLayers[i] = dLayer
    }
    // 销毁已经不存在的图层
    for (const entries of map) {
      entries[1].destroy()
    }
    this.layers = dLayers
  }

  // 更新数据
  update(deltaTime) {
    if ((this.elapsed += deltaTime) >= this.duration) {
      this.clear()
    }
    this.emitParticles(deltaTime)
    this.updateParticles(deltaTime)
  }

  // 发射粒子
  emitParticles(deltaTime) {
    for (const layer of this.layers) {
      layer.emit(deltaTime)
    }
  }

  // 更新粒子
  updateParticles(deltaTime) {
    let active = false
    for (const layer of this.layers) {
      if (layer.update(deltaTime)) {
        active = true
      }
    }
    return active
  }

  // 绘制粒子
  draw() {
    for (const layer of this.layers) {
      layer.draw()
    }
  }

  // 更新过渡映射表
  updateEasing() {
    for (const layer of this.layers) {
      layer.updateEasing()
    }
  }

  // 判断是否为空
  isEmpty() {
    for (const {elements} of this.layers) {
      if (elements.count !== 0) {
        return false
      }
    }
    return true
  }

  // 清除粒子元素
  clear() {
    for (const layer of this.layers) {
      layer.clear()
    }
    this.elapsed = 0
  }

  // 销毁资源
  destroy() {
    for (const layer of this.layers) {
      layer.destroy()
    }
  }
}

Particle.Emitter = ParticleEmitter

export { ParticleEmitter }
