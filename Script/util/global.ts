"use strict"

import {
  EventTarget_ext,
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
  ArrayConstructor_ext,
  HTMLElement_ext,
  HTMLElement_object_ext,
  HTMLElement_scroll_ext,
  HTMLElement_components_ext,
  Element_ext,
  HTMLButtonElement_ext,
  HTMLCanvasElement_ext,
  HTMLImageElement_ext,
  HTMLInputElement_ext,
  DataTransfer_ext,
  Event_ext,
  KeyboardEvent_ext,
  MouseEvent_ext,
  PointerEvent_ext,
  UIEvent_ext,
  WheelEvent_ext,
  Navigator_ext,
  FunctionConstructor_ext,
  Math_ext,
  NumberConstructor_ext,
  ObjectConstructor_ext,
  RegExpConstructor_ext,
  StringConstructor_ext,
  NodeList_ext,
  FileBodyPaneProps
} from "../yami"

// ******************************** 全局对象 ********************************

interface HTMLElementTagNameMap_ext {
  "anim-dir": HTMLElement
  "box": HTMLElement
  // "canvas": HTMLCanvasElement
  "check-mark": HTMLElement
  "command-item": HTMLElement
  "command-mark-major": HTMLElement
  "command-mark-minor": HTMLElement
  "command-text": HTMLElement
  "common-item": HTMLElement
  "detail-grid": HTMLElement
  "empty": HTMLElement
  "error-counter": HTMLElement
  "file-body-content": HTMLElement & FileBodyPaneProps
  "file-body-icon": HTMLElement & FileBodyPaneProps
  "file-body-item": HTMLElement & FileBodyPaneProps
  "file-body-name": HTMLElement & FileBodyPaneProps
  "file-head-address": HTMLElement & FileBodyPaneProps
  "file-head-address-arrow": HTMLElement & FileBodyPaneProps
  "file-head-address-folder": HTMLElement & FileBodyPaneProps
  "file-head-address-link": HTMLElement & FileBodyPaneProps
  "file-head-address-text": HTMLElement & FileBodyPaneProps
  "file-nav-icon": HTMLElement & FileBodyPaneProps
  "file-nav-item": HTMLElement & FileBodyPaneProps
  "folder-mark": HTMLElement
  "group": HTMLElement
  "group-border": HTMLElement
  "group-info": HTMLElement
  "group-region": HTMLElement
  // "input": HTMLInputElement
  "item": HTMLElement
  "lock-icon": HTMLElement
  "menu-accelerator": HTMLElement
  "menu-checked": HTMLElement
  "menu-icon": HTMLElement
  "menu-item": HTMLElement
  "menu-label": HTMLElement
  "menu-separator": HTMLElement
  "menu-sub-mark": HTMLElement
  "nav-item": HTMLElement
  "no-drag-image": HTMLElement
  "node-icon": HTMLElement
  "node-item": HTMLElement
  "param-item": HTMLElement
  "radio-mark": HTMLElement
  "scroll-corner": HTMLElement
  "scroll-thumb": HTMLElement
  "scroll-thumb-inner": HTMLElement
  "select-item": HTMLElement
  "selection": HTMLElement
  "slider-bar": HTMLElement
  "slider-filler": HTMLElement
  "tab-close": HTMLElement
  "tab-item": HTMLElement
  "tab-text": HTMLElement
  "text": HTMLElement
  "visibility-icon": HTMLElement

  "check-box": CheckBox
  "color-box": ColorBox
  "command-list": CommandList
  "common-list": CommonList
  "custom-box": CustomBox
  "detail-box": DetailBox
  "detail-summary": DetailSummary
  "drag-and-drop-hint": DragAndDropHint
  "file-body-pane": FileBodyPane & FileBodyPaneProps
  "file-browser": FileBrowser & FileBodyPaneProps
  "file-head-pane": FileHeadPane & FileBodyPaneProps
  "file-nav-pane": FileNavPane & FileBodyPaneProps
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

interface SVGElementTagNameMap_ext {}

interface Window_ext {
  $: typeof document.querySelector
}

// ******************************** CSS选择器 ********************************

// const $ = function IIFE() {
//   const regexp = /^#(\w|-)+$/
//   return function (selector: string) {
//     if (regexp.test(selector)) {
//       return document.querySelector(selector)
//     } else {
//       return document.querySelectorAll(selector)
//     }
//   }
// }()

window.$ = function (selector: string) {
  return document.querySelector(selector)
}

// ******************************** 全局唯一声明 ********************************

declare global {
  // CSS选择器
  var $: typeof document.querySelector

  // Window 扩展
  interface Window extends Window_ext, EventTarget_ext {}

  // JSX 扩展
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

  namespace CSS {
    function encodeURL(str: string): string
    function rasterize(csspx: number): number
    function getDevicePixelContentBoxSize(element: Element): {width: number, height: number}
  }

  // HTMLElementTagNameMap 扩展
  interface HTMLElementTagNameMap extends HTMLElementTagNameMap_ext {}

  // SVGElementTagNameMap 扩展
  interface SVGElementTagNameMap extends SVGElementTagNameMap_ext {}

  // ArrayConstructor 扩展
  interface ArrayConstructor extends ArrayConstructor_ext {}

  // Array 扩展
  interface Array<T> extends Array_ext {}

  // NodeListOf 扩展
  interface NodeListOf<TNode extends Node> extends NodeList, NodeList_ext {}

  // EventTarget 扩展
  interface EventTarget extends EventTarget_ext {}

  // Element 扩展
  interface Element extends Element_ext {}

  // HTMLElement 扩展
  interface HTMLElement extends HTMLElement_ext, HTMLElement_object_ext, HTMLElement_scroll_ext, HTMLElement_components_ext, EventTarget_ext {}

  // HTMLButtonElement 扩展
  interface HTMLButtonElement extends HTMLButtonElement_ext {}

  // HTMLCanvasElement 扩展
  interface HTMLCanvasElement extends HTMLCanvasElement_ext {}

  // HTMLImageElement 扩展
  interface HTMLImageElement extends HTMLImageElement_ext {}

  // HTMLInputElement 扩展
  interface HTMLInputElement extends HTMLInputElement_ext {}

  // DataTransfer 扩展
  interface DataTransfer extends DataTransfer_ext {}

  // Event 扩展
  interface Event extends Event_ext {}

  // KeyboardEvent 扩展
  interface KeyboardEvent extends KeyboardEvent_ext {}

  // MouseEvent 扩展
  interface MouseEvent extends MouseEvent_ext {}

  // PointerEvent 扩展
  interface PointerEvent extends PointerEvent_ext {}

  // UIEvent 扩展
  interface UIEvent extends UIEvent_ext {}

  // WheelEvent 扩展
  interface WheelEvent extends WheelEvent_ext {}

  // Navigator 扩展
  interface Navigator extends Navigator_ext {}

  // FunctionConstructor 扩展
  interface FunctionConstructor extends FunctionConstructor_ext {}

  // Math 扩展
  interface Math extends Math_ext {}

  // NumberConstructor 扩展
  interface NumberConstructor extends NumberConstructor_ext {}

  // ObjectConstructor 扩展
  interface ObjectConstructor extends ObjectConstructor_ext {}

  // RegExpConstructor 扩展
  interface RegExpConstructor extends RegExpConstructor_ext {}

  // StringConstructor 扩展
  interface StringConstructor extends StringConstructor_ext {}

  // NodeList 扩展
  interface NodeList extends NodeList_ext {}

  // Document 扩展
  interface Document {
    // Creates an instance of the element for the specified tag
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]
    createElement(tagName: string, options?: ElementCreationOptions): HTMLElement

    // Returns the first element that is a descendant of node that matches selectors
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null
    querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null
    querySelector<E extends HTMLElement = HTMLElement>(selectors: string): E | null;

    // Returns all element descendants of node that match selectors
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>
    querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>
    querySelectorAll<E extends HTMLElement = HTMLElement>(selectors: string): NodeListOf<E>
  }
}
