"use strict"

import {
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
  WindowFrame,
  NodeList_ext
} from "../yami"

// ******************************** 全局对象 ********************************

interface IWindow extends Window, EventTarget_ext {
  $: typeof globalDocument.querySelector
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

interface INodeListOf<T extends Node> extends NodeListOf<T>, NodeList_ext {}

interface ISVGElementTagNameMap extends SVGElementTagNameMap {}

interface IDocument extends Document {
  // Creates an instance of the element for the specified tag
  createElement<K extends keyof IHTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): IHTMLElementTagNameMap[K]
  createElement(tagName: string, options?: ElementCreationOptions): IHTMLElement

  // Returns the first element that is a descendant of node that matches selectors
  querySelector<K extends keyof IHTMLElementTagNameMap>(selectors: K): IHTMLElementTagNameMap[K] | null
  querySelector<K extends keyof ISVGElementTagNameMap>(selectors: K): ISVGElementTagNameMap[K] | null
  querySelector<E extends IHTMLElement = IHTMLElement>(selectors: string): E | null;

  // Returns all element descendants of node that match selectors
  querySelectorAll<K extends keyof IHTMLElementTagNameMap>(selectors: K): INodeListOf<IHTMLElementTagNameMap[K]>
  querySelectorAll<K extends keyof ISVGElementTagNameMap>(selectors: K): INodeListOf<ISVGElementTagNameMap[K]>
  querySelectorAll<E extends IHTMLElement = IHTMLElement>(selectors: string): INodeListOf<E>
}

// ******************************** CSS选择器 ********************************

// const $ = function IIFE() {
//   const regexp = /^#(\w|-)+$/
//   return function (selector: string) {
//     if (regexp.test(selector)) {
//       return (<IDocument>document).querySelector(selector)
//     } else {
//       return (<IDocument>document).querySelectorAll(selector)
//     }
//   }
// }()

const objectDocument = <Object>document
const globalDocument = <IDocument>objectDocument
const $ = globalDocument.querySelector

// ******************************** 全局唯一声明 ********************************
declare global {
  var $: typeof globalDocument.querySelector
  interface Window extends EventTarget_ext {}
  interface Document {
    // Creates an instance of the element for the specified tag
    createElement<K extends keyof IHTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): IHTMLElementTagNameMap[K]
    createElement(tagName: string, options?: ElementCreationOptions): IHTMLElement
  }
}

// ******************************** 绑定到全局对象 ********************************

const objectWindow = <Object>window
const globalWindow = <IWindow>objectWindow
globalWindow.$ = $

export {
  IWindow,
  IDocument
}
