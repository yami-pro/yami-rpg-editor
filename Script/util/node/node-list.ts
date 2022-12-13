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
} from "../../yami"

// ******************************** 节点列表方法 ********************************

type Element_listener_on_t =
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

type Element_enable_t =
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

type Element_disable_t = Element_enable_t

interface NodeList_ext {
  on: (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => NodeList
  enable: () => void
  disable: () => void
}

// 节点列表 - 添加事件
NodeList.prototype.on = function (this: NodeList, type, listener, options) {
  this.forEach( (element: Element_listener_on_t) => {
    element.on(type, listener, options)
  })
  return this
}

// 节点列表 - 启用元素
NodeList.prototype.enable = function (this: NodeList) {
  this.forEach( (element: Element_enable_t) => {
    element.enable()
  })
}

// 节点列表 - 禁用元素
NodeList.prototype.disable = function (this: NodeList) {
  this.forEach( (element: Element_disable_t) => {
    element.disable()
  })
}

export { NodeList_ext }
