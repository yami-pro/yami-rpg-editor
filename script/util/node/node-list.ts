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

interface TypeMap {
  elementsOn: CheckBox |
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
  elementsEnable: CheckBox |
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
  elementsDisable: TypeMap["elementsEnable"]
}

interface NodeList_ext {
  on: (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => NodeList
  enable: () => void
  disable: () => void
}

// 节点列表 - 添加事件
NodeList.prototype.on = function (this: NodeList, type, listener, options) {
  this.forEach( (element: TypeMap["elementsOn"]) => {
    element.on(type, listener, options)
  })
  return this
}

// 节点列表 - 启用元素
NodeList.prototype.enable = function (this: NodeList) {
  this.forEach( (element: TypeMap["elementsEnable"]) => {
    element.enable()
  })
}

// 节点列表 - 禁用元素
NodeList.prototype.disable = function (this: NodeList) {
  this.forEach( (element: TypeMap["elementsDisable"]) => {
    element.disable()
  })
}

export { NodeList_ext }
