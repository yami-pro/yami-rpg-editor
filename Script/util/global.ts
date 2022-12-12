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
  NodeList_ext,
  JSXHTMLElement,
  JSXCheckBox,
  JSXColorBox,
  JSXCommandList,
  JSXCommonList,
  JSXCustomBox,
  JSXDetailBox,
  JSXDetailSummary,
  JSXDragAndDropHint,
  JSXFileBodyPane,
  JSXFileBrowser,
  JSXFileHeadPane,
  JSXFileNavPane,
  JSXFileVar,
  JSXFilterBox,
  JSXKeyboardBox,
  JSXMarqueeArea,
  JSXMenuList,
  JSXNavBar,
  JSXTreeList,
  JSXNumberBox,
  JSXNumberVar,
  JSXPageManager,
  JSXParamList,
  JSXParameterPane,
  JSXRadioBox,
  JSXRadioProxy,
  JSXScrollBar,
  JSXSelectBox,
  JSXSelectList,
  JSXSelectVar,
  JSXSliderBox,
  JSXStringVar,
  JSXSwitchItem,
  JSXTabBar,
  JSXTextArea,
  JSXTextBox,
  JSXTitleBar,
  JSXWindowFrame,
  JSXHTMLCanvasElement,
  JSXHTMLInputElement,
  Array_ext,
  ArrayConstructor_ext
} from "../yami"

// ******************************** 全局对象 ********************************

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
  // Returns the first element that is a descendant of node that matches selectors
  querySelector<K extends keyof IHTMLElementTagNameMap>(selectors: K): IHTMLElementTagNameMap[K] | null
  querySelector<K extends keyof ISVGElementTagNameMap>(selectors: K): ISVGElementTagNameMap[K] | null
  querySelector<E extends IHTMLElement = IHTMLElement>(selectors: string): E | null;
}

const globalDocument = <IDocument>document

interface IWindow extends Window, EventTarget_ext {
  $: typeof globalDocument.querySelector
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

const $ = function (selector: string) {
  return (<IDocument>document).querySelector(selector)
}

// ******************************** 全局唯一声明 ********************************

declare global {
  var $: typeof globalDocument.querySelector
  interface Window extends EventTarget_ext {}
  interface Document {
    // Creates an instance of the element for the specified tag
    createElement<K extends keyof IHTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): IHTMLElementTagNameMap[K]
    createElement(tagName: string, options?: ElementCreationOptions): IHTMLElement

    // Returns all element descendants of node that match selectors
    querySelectorAll<K extends keyof IHTMLElementTagNameMap>(selectors: K): INodeListOf<IHTMLElementTagNameMap[K]>
    querySelectorAll<K extends keyof ISVGElementTagNameMap>(selectors: K): INodeListOf<ISVGElementTagNameMap[K]>
    querySelectorAll<E extends IHTMLElement = IHTMLElement>(selectors: string): INodeListOf<E>
  }
  namespace JSX {
    interface IntrinsicElements {
      "anim-dir": JSXHTMLElement
      "box": JSXHTMLElement
      "button": JSXHTMLElement
      "canvas": JSXHTMLCanvasElement
      "check-mark": JSXHTMLElement
      "command-item": JSXHTMLElement
      "command-mark-major": JSXHTMLElement
      "command-mark-minor": JSXHTMLElement
      "command-text": JSXHTMLElement
      "common-item": JSXHTMLElement
      "detail-grid": JSXHTMLElement
      "empty": JSXHTMLElement
      "error-counter": JSXHTMLElement
      "file-body-content": JSXHTMLElement
      "file-body-icon": JSXHTMLElement
      "file-body-item": JSXHTMLElement
      "file-body-name": JSXHTMLElement
      "file-head-address": JSXHTMLElement
      "file-head-address-arrow": JSXHTMLElement
      "file-head-address-folder": JSXHTMLElement
      "file-head-address-link": JSXHTMLElement
      "file-head-address-text": JSXHTMLElement
      "file-nav-icon": JSXHTMLElement
      "file-nav-item": JSXHTMLElement
      "folder-mark": JSXHTMLElement
      "group": JSXHTMLElement
      "group-border": JSXHTMLElement
      "group-info": JSXHTMLElement
      "group-region": JSXHTMLElement
      "input": JSXHTMLInputElement
      "item": JSXHTMLElement
      "lock-icon": JSXHTMLElement
      "menu-accelerator": JSXHTMLElement
      "menu-checked": JSXHTMLElement
      "menu-icon": JSXHTMLElement
      "menu-item": JSXHTMLElement
      "menu-label": JSXHTMLElement
      "menu-separator": JSXHTMLElement
      "menu-sub-mark": JSXHTMLElement
      "nav-item": JSXHTMLElement
      "no-drag-image": JSXHTMLElement
      "node-icon": JSXHTMLElement
      "node-item": JSXHTMLElement
      "param-item": JSXHTMLElement
      "radio-mark": JSXHTMLElement
      "scroll-corner": JSXHTMLElement
      "scroll-thumb": JSXHTMLElement
      "scroll-thumb-inner": JSXHTMLElement
      "select-item": JSXHTMLElement
      "selection": JSXHTMLElement
      "slider-bar": JSXHTMLElement
      "slider-filler": JSXHTMLElement
      "tab-close": JSXHTMLElement
      "tab-item": JSXHTMLElement
      "tab-text": JSXHTMLElement
      "text": JSXHTMLElement
      "visibility-icon": JSXHTMLElement
      "page-frame": JSXHTMLElement
      "close": JSXHTMLElement
      "content-frame": JSXHTMLElement
      "field-set": JSXHTMLElement
      "flex-box": JSXHTMLElement
      "flex-item": JSXHTMLElement
      "maximize": JSXHTMLElement
      "minimize": JSXHTMLElement
      "grid-box": JSXHTMLElement
      "video": JSXHTMLElement
      "nav-icon": JSXHTMLElement
      "nav-text": JSXHTMLElement

      "check-box": JSXCheckBox
      "color-box": JSXColorBox
      "command-list": JSXCommandList
      "common-list": JSXCommonList
      "custom-box": JSXCustomBox
      "detail-box": JSXDetailBox
      "detail-summary": JSXDetailSummary
      "drag-and-drop-hint": JSXDragAndDropHint
      "file-body-pane": JSXFileBodyPane
      "file-browser": JSXFileBrowser
      "file-head-pane": JSXFileHeadPane
      "file-nav-pane": JSXFileNavPane
      "file-var": JSXFileVar
      "filter-box": JSXFilterBox
      "keyboard-box": JSXKeyboardBox
      "marquee-area": JSXMarqueeArea
      "menu-list": JSXMenuList
      "nav-bar": JSXNavBar
      "node-list": JSXTreeList
      "number-box": JSXNumberBox
      "number-var": JSXNumberVar
      "page-manager": JSXPageManager
      "param-list": JSXParamList
      "parameter-pane": JSXParameterPane
      "radio-box": JSXRadioBox
      "radio-proxy": JSXRadioProxy
      "scroll-bar": JSXScrollBar
      "select-box": JSXSelectBox
      "select-list": JSXSelectList
      "select-var": JSXSelectVar
      "slider-box": JSXSliderBox
      "string-var": JSXStringVar
      "switch-item": JSXSwitchItem
      "tab-bar": JSXTabBar
      "text-area": JSXTextArea
      "text-box": JSXTextBox
      "title-bar": JSXTitleBar
      "window-frame": JSXWindowFrame
    }
  }
  interface ArrayConstructor extends ArrayConstructor_ext {}
  interface Array<T> extends Array_ext {}
}

// ******************************** 绑定到全局对象 ********************************

const objectWindow = <Object>window
const globalWindow = <IWindow>objectWindow
globalWindow.$ = $

export {
  IWindow,
  IDocument
}
