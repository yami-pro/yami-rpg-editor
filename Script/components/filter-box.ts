"use strict"

import { IHTMLCanvasElement } from "../yami"

// ******************************** 滤镜框 ********************************

class FilterBox extends HTMLElement {
  canvas: IHTMLCanvasElement
  dataValue: any

  constructor() {
    super()

    // 设置属性
    this.canvas = null
    this.dataValue = null
  }

  // 读取数据
  read() {
    return this.dataValue
  }

  // 写入数据
  write(tint) {
    this.dataValue = tint
    this.update()
  }

  // 更新画面
  update() {
    let {canvas} = this
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = this.getAttribute('width')
      canvas.height = this.getAttribute('height')
      canvas.context = canvas.getContext('2d')
      this.appendChild(this.canvas = canvas)
    }

    // 绘制垂直渐变色带
    const {context, width, height} = canvas
    const [red, green, blue, gray] = this.dataValue
    if (!context.gradient) {
      const gradient = context.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#ff0000')
      gradient.addColorStop(1 / 6, '#ffff00')
      gradient.addColorStop(2 / 6, '#00ff00')
      gradient.addColorStop(3 / 6, '#00ffff')
      gradient.addColorStop(4 / 6, '#0000ff')
      gradient.addColorStop(5 / 6, '#ff00ff')
      gradient.addColorStop(1, '#ff0000')
      context.gradient = gradient
    }
    context.globalCompositeOperation = 'source-over'
    context.fillStyle = context.gradient
    context.fillRect(0, 0, width, height)

    // 绘制水平渐变色带
    const leftGradient = context.createLinearGradient(0, 0, width >> 1, 0)
    leftGradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
    leftGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = leftGradient
    context.fillRect(0, 0, width >> 1, height)
    const rightGradient = context.createLinearGradient(width >> 1, 0, width, 0)
    rightGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
    rightGradient.addColorStop(1, 'rgba(255, 255, 255, 1)')
    context.fillStyle = rightGradient
    context.fillRect(width >> 1, 0, width - (width >> 1), height)

    // 灰度混合
    if (gray) {
      context.globalCompositeOperation = 'saturation'
      context.globalAlpha = gray / 255
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.globalAlpha = 1
    }

    // 加法混合
    const addR = Math.max(red, 0)
    const addG = Math.max(green, 0)
    const addB = Math.max(blue, 0)
    if (addR || addG || addB) {
      context.globalCompositeOperation = 'lighter'
      context.fillStyle = `rgba(${addR}, ${addG}, ${addB}, 1)`
      context.fillRect(0, 0, width, height)
    }

    // 减法混合
    const subR = Math.max(-red, 0)
    const subG = Math.max(-green, 0)
    const subB = Math.max(-blue, 0)
    if (subR || subG || subB) {
      context.globalCompositeOperation = 'difference'
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'lighter'
      context.fillStyle = `rgba(${subR}, ${subG}, ${subB}, 1)`
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'difference'
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
    }
  }

  // 清除画布
  clear() {
    if (this.canvas) {
      this.removeChild(this.canvas)
      this.canvas = null
    }
  }
}

customElements.define('filter-box', FilterBox)

interface JSXFilterBox { [attributes: string]: any }

// ******************************** 滤镜框导出 ********************************

export {
  FilterBox,
  JSXFilterBox
}
