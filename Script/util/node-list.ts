'use strict'

import {
  CheckBox,
  ColorBox,
  CommonList,
  CustomBox,
  DetailBox,
  TextBox,
  SliderBox,
  FileNavPane,
  FileBodyPane,
  FileVar,
  KeyboardBox,
  NavBar,
  TreeList,
  NumberBox,
  NumberVar,
  PageManager,
  ParameterPane,
  RadioProxy,
  SelectBox,
  SelectVar,
  StringVar,
  SwitchItem,
  TabBar,
  TextArea,
  WindowFrame
} from "../components"

// ******************************** 节点列表方法 ********************************

type elementOnVar =
  CheckBox |
  ColorBox |
  CommonList |
  CustomBox |
  DetailBox |
  TextBox |
  SliderBox |
  FileNavPane |
  FileBodyPane |
  KeyboardBox |
  NavBar |
  TreeList |
  NumberBox |
  PageManager |
  ParameterPane |
  RadioProxy |
  SelectBox |
  SwitchItem |
  TabBar |
  TextArea |
  WindowFrame

type elementEnableVar =
  CheckBox |
  ColorBox |
  CustomBox |
  TextBox |
  SliderBox |
  FileVar |
  KeyboardBox |
  NumberBox |
  NumberVar |
  RadioProxy |
  SelectBox |
  SelectVar |
  StringVar |
  TextArea

type elementDisableVar = elementEnableVar

interface INodeList extends NodeList {
  on: (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => NodeList
  enable: () => void
  disable: () => void
}

const prototypeObject = <Object>NodeList.prototype
const prototype = <INodeList>prototypeObject

// 节点列表 - 添加事件
prototype.on = function (this: NodeList, type, listener, options) {
  this.forEach( (element: elementOnVar) => {
    element.on(type, listener, options)
  })
  return this
}

// 节点列表 - 启用元素
prototype.enable = function (this: NodeList) {
  this.forEach( (element: elementEnableVar) => {
    element.enable()
  })
}

// 节点列表 - 禁用元素
prototype.disable = function (this: NodeList) {
  this.forEach( (element: elementDisableVar) => {
    element.disable()
  })
}

export { INodeList }
