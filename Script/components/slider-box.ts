'use strict'

import { NumberBox } from '../yami'

// ******************************** 滑动框 ********************************

class SliderBox extends HTMLElement {
  filler            //:element
  input             //:element
  synchronizer      //:element
  activeWheel       //:boolean
  focusEventEnabled //:boolean
  blurEventEnabled  //:boolean

  constructor() {
    super()

    const min = this.getAttribute('min') ?? '0'
    const max = this.getAttribute('max') ?? '0'
    const step = this.getAttribute('step') ?? '1'

    // 创建进度条
    const bar = document.createElement('slider-bar')
    this.appendChild(bar)

    // 创建填充物
    const filler = document.createElement('slider-filler')
    bar.appendChild(filler)

    // 创建输入框
    const input = document.createElement('input')
    input.addClass('slider-input')
    input.type = 'range'
    input.min = min
    input.max = max
    input.step = step
    input.tabIndex = -1
    input.on('wheel', this.inputWheel)
    this.appendChild(input)

    // 设置属性
    this.filler = filler
    this.input = input
    this.synchronizer = null
    this.activeWheel = this.hasAttribute('active-wheel')
    this.focusEventEnabled = false
    this.blurEventEnabled = false

    // 侦听事件
    this.on('input', this.sliderInput)
  }

  // 读取数据
  read() {
    return parseFloat(this.input.value)
  }

  // 写入数据
  write(value) {
    this.input.value = value
    this.updateFiller()
  }

  // 启用元素
  enable() {
    if (this.removeClass('disabled')) {
      this.showChildNodes()
    }
  }

  // 禁用元素
  disable() {
    if (this.addClass('disabled')) {
      this.hideChildNodes()
    }
  }

  // 更新装填物
  updateFiller() {
    const filler = this.filler
    const value = this.read()
    if (filler.value !== value) {
      filler.value = value
      const input = this.input
      const min = parseFloat(input.min)
      const max = parseFloat(input.max)
      if (min !== max) {
        const p = Math.roundTo(
          (value - min) * 100
        / (max - min)
        , 6)
        filler.style.width = `${p}%`
      }
    }
  }

  // 与数字框元素同步数值
  synchronize(target) {
    const slider = this
    const number = target
    if (slider.synchronizer) {
      return
    }

    // 设置新的同步关系
    if (number instanceof NumberBox) {
      const writeSlider = slider.write
      const writeNumber = number.write

      // 滑动框 - 指针按下事件
      // 在输入事件之前获得焦点
      // 触发focus事件时可获取到旧的值
      const sliderPointerdown = () => {
        slider.input.focus()
      }

      // 滑动框 - 输入事件
      const sliderInput = event => {
        writeNumber.call(number, slider.read())
        event && number.dispatchEvent(new Event('input'))
      }

      // 数字框 - 输入事件
      const numberInput = event => {
        writeSlider.call(slider, number.read())
        event && slider.dispatchEvent(new Event('input'))
      }

      // 设置同步对象
      slider.synchronizer = target

      // 侦听事件
      slider.input.on('pointerdown', sliderPointerdown)
      slider.input.on('input', sliderInput)
      number.input.on('input', numberInput)

      // 重写滑动框写入方法
      slider.write = value => {
        writeSlider.call(slider, value)
        sliderInput()
      }

      // 重写数字框写入方法
      number.write = value => {
        writeNumber.call(number, value)
        numberInput()
      }
    }
  }

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'focus':
        if (!this.focusEventEnabled) {
          this.focusEventEnabled = true
          this.input.on('focus', event => {
            this.dispatchEvent(new FocusEvent('focus'))
          })
        }
        break
      case 'blur':
        if (!this.blurEventEnabled) {
          this.blurEventEnabled = true
          this.input.on('blur', event => {
            this.dispatchEvent(new FocusEvent('blur'))
          })
        }
        break
    }
  }

  // 滑动框 - 输入事件
  sliderInput(event) {
    this.updateFiller()
  }

  // 输入框 - 鼠标滚轮事件
  inputWheel(event) {
    if (event.deltaY === 0) return
    if (this.parentNode.activeWheel) {
      // 阻止滚动页面的默认行为
      event.preventDefault()
      const input = this
      const last = input.value
      input.value = Math.roundTo(
        parseFloat(input.value)
      + parseFloat(input.step)
      * (event.deltaY > 0 ? -1 : 1)
      , 2)
      if (input.value !== last) {
        input.dispatchEvent(
          new Event('input', {
            bubbles: true,
        }))
      }
    }
  }
}

customElements.define('slider-box', SliderBox)

// ******************************** 滑动框导出 ********************************

export { SliderBox }
