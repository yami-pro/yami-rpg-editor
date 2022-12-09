"use strict"

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
} from "../yami"

// ******************************** 节点列表方法 ********************************

type elementOn =
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

type elementEnable =
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

type elementDisable = elementEnable

interface NodeList_ext {
  on: (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => INodeList
  enable: () => void
  disable: () => void
}

interface INodeList extends NodeList, NodeList_ext {}

const prototype_as_obj = <Object>NodeList.prototype
const prototype = <INodeList>prototype_as_obj

// 节点列表 - 添加事件
prototype.on = function (this: INodeList, type, listener, options) {
  this.forEach( (element: elementOn) => {
    element.on(type, listener, options)
  })
  return this
}

// 节点列表 - 启用元素
prototype.enable = function (this: INodeList) {
  this.forEach( (element: elementEnable) => {
    element.enable()
  })
}

// 节点列表 - 禁用元素
prototype.disable = function (this: INodeList) {
  this.forEach( (element: elementDisable) => {
    element.disable()
  })
}

export {
  INodeList,
  NodeList_ext
}
