'use strict'

// ******************************** 剪贴板对象 ********************************

class YMClipboard {
  constructor() {}

  // 检查缓冲区
  has(format: any) {
    const {clipboard} = require('electron')
    const buffer = clipboard.readBuffer(format)
    return buffer.length !== 0
  }

  // 读取缓冲区
  read(format: any) {
    const {clipboard} = require('electron')
    const buffer = clipboard.readBuffer(format)
    const string = buffer.toString()
    return string ? JSON.parse(string) : null
  }

  // 写入缓冲区
  write(format: any, object: any) {
    const {clipboard} = require('electron')
    const string = JSON.stringify(object)
    const buffer = Buffer.from(string)
    clipboard.writeBuffer(format, buffer)
  }
}

const _YMClipboard = new YMClipboard()

// 修改原型对象
Object.setPrototypeOf(_YMClipboard, Clipboard)

export { _YMClipboard as Clipboard }
