'use strict'

// ******************************** 剪贴板对象 ********************************

class IClipboard implements Clipboard {
  // 构造
  constructor() {}

  // 检查缓冲区
  has(format: any) {
    const {clipboard} = require('electron')
    const buffer = clipboard.readBuffer(format)
    return buffer.length !== 0
  }

  // 读取缓冲区
  read(...args: any[]) {
    const [format] = args
    const {clipboard} = require('electron')
    const buffer = clipboard.readBuffer(format)
    const string = buffer.toString()
    return string ? JSON.parse(string) : null
  }

  // 写入缓冲区
  write(...args: any[]): any {
    const [format, object] = args
    const {clipboard} = require('electron')
    const string = JSON.stringify(object)
    const buffer = Buffer.from(string)
    clipboard.writeBuffer(format, buffer)
  }

  readText(): any {}
  writeText(): any {}
  addEventListener(): any {}
  dispatchEvent(): any {}
  removeEventListener(): any {}
}

const YMClipboard = new IClipboard()

export { YMClipboard as Clipboard }
