"use strict"

import * as electron from 'electron'

// ******************************** 剪贴板对象 ********************************

namespace Type {
  type element = Node
  export type node = {
    [key: string]:
      number |
      boolean |
      string |
      element |
      node |
      node[]
  }
}

interface Clipboard {
  has(format: any): boolean
  read(format: any): Type.node
  write(format: any, object: any): void
}

const Clipboard = <Clipboard>{}

Clipboard.has = function (format: any) {
  const {clipboard} = electron
  const buffer = clipboard.readBuffer(format)
  return buffer.length !== 0
}

Clipboard.read = function (format: any) {
  const {clipboard} = electron
  const buffer = clipboard.readBuffer(format)
  const string = buffer.toString()
  return string ? JSON.parse(string) : null
}

Clipboard.write = function (format: any, object: any) {
  const {clipboard} = electron
  const string = JSON.stringify(object)
  const buffer = Buffer.from(string)
  clipboard.writeBuffer(format, buffer)
}

export { Clipboard }
