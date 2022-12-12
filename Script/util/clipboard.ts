"use strict"

// ******************************** 剪贴板对象 ********************************

interface Clipboard {
  has(format: any): boolean
  read(format: any): any
  write(format: any, object: any): void
}

const Clipboard = <Clipboard>new Object()

Clipboard.has = function (format: any) {
  const {clipboard} = require('electron')
  const buffer = clipboard.readBuffer(format)
  return buffer.length !== 0
}

Clipboard.read = function (format: any) {
  const {clipboard} = require('electron')
  const buffer = clipboard.readBuffer(format)
  const string = buffer.toString()
  return string ? JSON.parse(string) : null
}

Clipboard.write = function (format: any, object: any) {
  const {clipboard} = require('electron')
  const string = JSON.stringify(object)
  const buffer = Buffer.from(string)
  clipboard.writeBuffer(format, buffer)
}

export { Clipboard }
