"use strict"

import { CustomBox } from "../yami"

// ******************************** 文件变量框 ********************************

class FileVar extends HTMLElement {
  mode    //:string
  strBox  //:element
  varBox  //:element

  constructor() {
    super()

    // 设置属性
    this.mode = null
    this.fileBox = new CustomBox()
    this.varBox = new CustomBox()
    this.fileBox.type = 'file'
    this.fileBox.filter = this.getAttribute('filter')
    this.varBox.type = 'variable'
    this.varBox.filter = 'string'

    // 侦听事件
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
  }

  // 读取数据
  read() {
    switch (this.mode) {
      case 'constant': return this.fileBox.read()
      case 'variable': return this.varBox.read()
    }
  }

  // 写入数据
  write(value) {
    switch (typeof value) {
      case 'string':
        this.switch('constant')
        this.fileBox.write(value)
        this.varBox.write(FileVar.defVar)
        break
      case 'object':
        this.switch('variable')
        this.fileBox.write('')
        this.varBox.write(value)
        break
    }
  }

  // 切换模式
  switch(mode) {
    const focus = !mode && !this.hasClass('disabled')
    if (mode === undefined) {
      switch (this.mode) {
        case 'constant':
          mode = 'variable'
          break
        case 'variable':
          mode = 'constant'
          break
      }
    }
    if (this.mode !== mode) {
      this.removeClass(this.mode)
      this.addClass(mode)
      this.mode = mode
      switch (mode) {
        case 'constant':
          this.varBox.remove()
          this.appendChild(this.fileBox)
          if (focus) {
            this.fileBox.focus()
          }
          break
        case 'variable':
          this.fileBox.remove()
          this.appendChild(this.varBox)
          if (focus) {
            this.varBox.focus()
          }
          break
      }
    }
  }

  // 启用元素
  enable() {
    if (this.removeClass('disabled')) {
      this.fileBox.enable()
      this.varBox.enable()
    }
  }

  // 禁用元素
  disable() {
    if (this.addClass('disabled')) {
      this.fileBox.disable()
      this.varBox.disable()
    }
  }

  // 获得焦点
  getFocus(mode) {
    switch (this.mode) {
      case 'constant': return this.fileBox.getFocus(mode)
      case 'variable': return this.varBox.getFocus(mode)
    }
  }

  // 键盘按下事件
  keydown(event) {
    switch (event.code) {
      case 'Slash':
        // 切换输入框导致已侦听的事件失效
        // 因此在这里阻止输入行为
        event.preventDefault()
        this.switch()
        break
    }
  }

  // 指针按下事件
  pointerdown(event) {
    switch (event.button) {
      case 0:
        if (!this.hasClass('disabled') &&
          event.target === this) {
          event.preventDefault()
          this.switch()
        }
        break
      case 2:
        if (!this.hasClass('disabled')) {
          event.preventDefault()
          this.switch()
        }
        break
    }
  }

  // 默认变量值
  static defVar = {type: 'local', key: 'key'}
}

customElements.define('file-var', FileVar)

interface JSXFileVar { [attributes: string]: any }

// ******************************** 文件变量框导出 ********************************

export {
  FileVar,
  JSXFileVar
}
