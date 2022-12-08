"use strict"

import {
  $,
  selectorVar,
  EventTarget_ext,
  IHTMLElement,
  IHTMLCanvasElement,
  IHTMLInputElement,
  CheckBox,
  ColorBox,
  CommandList,
  CommonList,
  CustomBox,
  DetailBox,
  DetailSummary,
  DragAndDropHint,
  FileBodyPane,
  FileHeadPane,
  FileNavPane,
  FileBrowser,
  FileVar,
  FilterBox,
  KeyboardBox,
  MarqueeArea,
  MenuList,
  NavBar,
  TreeList,
  NumberBox,
  NumberVar,
  PageManager,
  ParamList,
  ParameterPane,
  RadioBox,
  RadioProxy,
  ScrollBar,
  SelectBox,
  SelectList,
  SelectVar,
  SliderBox,
  StringVar,
  SwitchItem,
  TabBar,
  TextArea,
  TextBox,
  TitleBar,
  WindowFrame
} from "../yami"

// ******************************** 全局对象 ********************************

interface IWindow extends Window, EventTarget_ext {
  $: (selector: string) => selectorVar
}

interface IHTMLElementTagNameMap extends HTMLElementTagNameMap {
  "anim-dir": IHTMLElement
  "box": IHTMLElement
  "canvas": IHTMLCanvasElement
  "check-mark": IHTMLElement
  "command-item": IHTMLElement
  "command-mark-major": IHTMLElement
  "command-mark-minor": IHTMLElement
  "command-text": IHTMLElement
  "common-item": IHTMLElement
  "detail-grid": IHTMLElement
  "empty": IHTMLElement
  "error-counter": IHTMLElement
  "file-body-content": IHTMLElement
  "file-body-icon": IHTMLElement
  "file-body-item": IHTMLElement
  "file-body-name": IHTMLElement
  "file-head-address": IHTMLElement
  "file-head-address-arrow": IHTMLElement
  "file-head-address-folder": IHTMLElement
  "file-head-address-link": IHTMLElement
  "file-head-address-text": IHTMLElement
  "file-nav-icon": IHTMLElement
  "file-nav-item": IHTMLElement
  "folder-mark": IHTMLElement
  "group": IHTMLElement
  "group-border": IHTMLElement
  "group-info": IHTMLElement
  "group-region": IHTMLElement
  "input": IHTMLInputElement
  "item": IHTMLElement
  "lock-icon": IHTMLElement
  "menu-accelerator": IHTMLElement
  "menu-checked": IHTMLElement
  "menu-icon": IHTMLElement
  "menu-item": IHTMLElement
  "menu-label": IHTMLElement
  "menu-separator": IHTMLElement
  "menu-sub-mark": IHTMLElement
  "nav-item": IHTMLElement
  "no-drag-image": IHTMLElement
  "node-icon": IHTMLElement
  "node-item": IHTMLElement
  "param-item": IHTMLElement
  "radio-mark": IHTMLElement
  "scroll-corner": IHTMLElement
  "scroll-thumb": IHTMLElement
  "scroll-thumb-inner": IHTMLElement
  "select-item": IHTMLElement
  "selection": IHTMLElement
  "slider-bar": IHTMLElement
  "slider-filler": IHTMLElement
  "tab-close": IHTMLElement
  "tab-item": IHTMLElement
  "tab-text": IHTMLElement
  "text": IHTMLElement
  "visibility-icon": IHTMLElement

  "check-box": CheckBox
  "color-box": ColorBox
  "command-list": CommandList
  "common-list": CommonList
  "custom-box": CustomBox
  "detail-box": DetailBox
  "detail-summary": DetailSummary
  "drag-and-drop-hint": DragAndDropHint
  "file-body-pane": FileBodyPane
  "file-browser": FileBrowser
  "file-head-pane": FileHeadPane
  "file-nav-pane": FileNavPane
  "file-var": FileVar
  "filter-box": FilterBox
  "keyboard-box": KeyboardBox
  "marquee-area": MarqueeArea
  "menu-list": MenuList
  "nav-bar": NavBar
  "node-list": TreeList
  "number-box": NumberBox
  "number-var": NumberVar
  "page-manager": PageManager
  "param-list": ParamList
  "parameter-pane": ParameterPane
  "radio-box": RadioBox
  "radio-proxy": RadioProxy
  "scroll-bar": ScrollBar
  "select-box": SelectBox
  "select-list": SelectList
  "select-var": SelectVar
  "slider-box": SliderBox
  "string-var": StringVar
  "switch-item": SwitchItem
  "tab-bar": TabBar
  "text-area": TextArea
  "text-box": TextBox
  "title-bar": TitleBar
  "window-frame": WindowFrame
}

interface IDocument extends Document {
  createElement<K extends keyof IHTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): IHTMLElementTagNameMap[K];
}

// ******************************** 绑定到全局对象 ********************************

// window对象添加dom查询器
const windowObject = <Object>window
const iwindow = <IWindow>windowObject
iwindow.$ = $

const documentObject = <Object>document
const idocument = <IDocument>documentObject

export {
  iwindow as window,
  idocument as document
}
