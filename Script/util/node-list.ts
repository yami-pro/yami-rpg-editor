'use strict'

// ******************************** 节点列表方法 ********************************

interface INodeList extends NodeList {
  on: (type: string, listener: any, options?: any) => NodeList
  enable: () => void
  disable: () => void
}

const prototypeObject = <Object>NodeList.prototype
const prototype = <INodeList>prototypeObject

// 节点列表 - 添加事件
prototype.on = function (this: NodeList, type, listener, options) {
  this.forEach( element => {
    element.on(type, listener, options)
  })
  return this
}

// 节点列表 - 启用元素
prototype.enable = function (this: NodeList) {
  this.forEach( element => {
    element.enable()
  })
}

// 节点列表 - 禁用元素
prototype.disable = function (this: NodeList) {
  this.forEach( element => {
    element.disable()
  })
}

export { INodeList }
