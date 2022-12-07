'use strict'

import { CheckBox } from "../components/check-box"
import { ColorBox } from "../components/color-box"
import { CommonList } from "../components/common-list"
import { CustomBox } from "../components/custom-box"
import { DetailBox } from "../components/detail-box"
import { TextBox } from "../components/text-box"
import { SliderBox } from "../components/slider-box"
import { FileNavPane } from "../components/file-nav-pane"
import { FileBodyPane } from "../components/file-body-pane"
import { FileVar } from "../components/file-var"
import { KeyboardBox } from "../components/keyboard-box"
import { NavBar } from "../components/nav-bar"
import { TreeList } from "../components/node-list"
import { NumberBox } from "../components/number-box"
import { NumberVar } from "../components/number-var"
import { PageManager } from "../components/page-manager"
import { ParameterPane } from "../components/parameter-pane"
import { RadioProxy } from "../components/radio-proxy"
import { SelectBox } from "../components/select-box"
import { SelectVar } from "../components/select-var"
import { StringVar } from "../components/string-var"
import { SwitchItem } from "../components/switch-item"
import { TabBar } from "../components/tab-bar"
import { TextArea } from "../components/text-area"
import { WindowFrame } from "../components/window-frame"

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
