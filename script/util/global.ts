"use strict"

import {
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
  EventTarget_ext,
  Array_ext,
  ArrayConstructor_ext,
  HTMLElement_ext,
  HTMLElement_object_ext,
  HTMLElement_scroll_ext,
  Element_ext,
  HTMLButtonElement_ext,
  HTMLCanvasElement_ext,
  HTMLImageElement_ext,
  HTMLInputElement_ext,
  DataTransfer_ext,
  Event_ext,
  Navigator_ext,
  FunctionConstructor_ext,
  Math_ext,
  NumberConstructor_ext,
  ObjectConstructor_ext,
  RegExpConstructor_ext,
  StringConstructor_ext,
  Node_props,
  NodeList_ext,
  GL_ext,
  WebGLRenderingContext_ext,
  CanvasRenderingContext2D_ext,
  WebGLProgram_ext,
  WebGLVertexArrayObject_ext,
  Element_props,
  Event_props
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
  "file-body-content": HTMLElement
  "file-body-icon": HTMLElement
  "file-body-item": HTMLElement
  "file-body-name": HTMLElement
  "file-head-address": HTMLElement
  "file-head-address-arrow": HTMLElement
  "file-head-address-folder": HTMLElement
  "file-head-address-link": HTMLElement
  "file-head-address-text": HTMLElement
  "file-nav-icon": HTMLElement
  "file-nav-item": HTMLElement
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

  // id选择器
  "#activateScene-pointer": SelectBox
  "#actorGetter-memberId": SelectBox
  "#actorGetter-type": SelectBox
  "#ancestorGetter-type": SelectBox
  "#angleGetter-type": SelectBox
  "#animation-easing-id": SelectBox
  "#animMotion-mode": SelectBox
  "#animParticleLayer-angle": SelectBox
  "#animSpriteLayer-blend": SelectBox
  "#animSpriteLayer-light": SelectBox
  "#animSpriteLayer-sprite": SelectBox
  "#callEvent-eventType": SelectBox
  "#callEvent-type": SelectBox
  "#castSkill-key": SelectBox
  "#castSkill-mode": SelectBox
  "#castSkill-wait": SelectBox
  "#changeActorEquipment-operation": SelectBox
  "#changeActorEquipment-slot": SelectBox
  "#changeActorPortrait-mode": SelectBox
  "#changeActorSkill-operation": SelectBox
  "#changeActorSprite-spriteId": SelectBox
  "#changeActorState-operation": SelectBox
  "#changeActorTeam-teamId": SelectBox
  "#changeThreat-operation": SelectBox
  "#condition-boolean-operation": SelectBox
  "#condition-boolean-value": SelectBox
  "#condition-number-operation": SelectBox
  "#condition-string-operation": SelectBox
  "#condition-type": SelectBox
  "#config-actor-partyInventory": SelectBox
  "#config-actor-playerTeam": SelectBox
  "#config-collision-actor-enabled": SelectBox
  "#config-collision-actor-ignoreTeamMember": SelectBox
  "#config-collision-scene-enabled": SelectBox
  "#config-font-pixelated": SelectBox
  "#config-script-language": SelectBox
  "#config-window-display": SelectBox
  "#controlDialog-operation": SelectBox
  "#createActor-teamId": SelectBox
  "#createElement-operation": SelectBox
  "#createGlobalActor-teamId": SelectBox
  "#deleteElement-operation": SelectBox
  "#deployment-platform": SelectBox
  "#detectTargets-inSight": SelectBox
  "#detectTargets-selector": SelectBox
  "#discardTargets-selector": SelectBox
  "#easing-mode": SelectBox
  "#easing-preview-reverse": SelectBox
  "#elementGetter-type": SelectBox
  "#equipmentGetter-slot": SelectBox
  "#equipmentGetter-type": SelectBox
  "#event-type": SelectBox
  "#fileActor-equipment-slot": SelectBox
  "#fileActor-idleMotion": SelectBox
  "#fileActor-moveMotion": SelectBox
  "#fileActor-skill-key": SelectBox
  "#fileActor-sprite-id": SelectBox
  "#fileEvent-type": SelectBox
  "#fileTrigger-hitMode": SelectBox
  "#fileTrigger-motion": SelectBox
  "#fileTrigger-onHitActors": SelectBox
  "#fileTrigger-onHitWalls": SelectBox
  "#fileTrigger-rotatable": SelectBox
  "#fileTrigger-selector": SelectBox
  "#fileTrigger-shape-type": SelectBox
  "#fixAngle-fixed": SelectBox
  "#followActor-mode": SelectBox
  "#followActor-navigate": SelectBox
  "#followActor-once": SelectBox
  "#followActor-wait": SelectBox
  "#forEach-data": SelectBox
  "#getTarget-attribute": SelectBox
  "#getTarget-condition": SelectBox
  "#getTarget-divisor": SelectBox
  "#getTarget-selector": SelectBox
  "#if-branch-mode": SelectBox
  "#if-condition-actor-operation": SelectBox
  "#if-condition-boolean-constant-value": SelectBox
  "#if-condition-boolean-operand-type": SelectBox
  "#if-condition-boolean-operation": SelectBox
  "#if-condition-element-operation": SelectBox
  "#if-condition-keyboard-state": SelectBox
  "#if-condition-list-operation": SelectBox
  "#if-condition-mouse-button": SelectBox
  "#if-condition-mouse-state": SelectBox
  "#if-condition-number-operand-type": SelectBox
  "#if-condition-number-operation": SelectBox
  "#if-condition-object-operand-type": SelectBox
  "#if-condition-object-operation": SelectBox
  "#if-condition-other-key": SelectBox
  "#if-condition-string-operand-type": SelectBox
  "#if-condition-string-operation": SelectBox
  "#if-condition-type": SelectBox
  "#itemGetter-key": SelectBox
  "#itemGetter-type": SelectBox
  "#jumpTo-operation": SelectBox
  "#lightGetter-type": SelectBox
  "#loadImage-type": SelectBox
  "#loadScene-transfer": SelectBox
  "#loop-mode": SelectBox
  "#moveActor-mode": SelectBox
  "#moveActor-wait": SelectBox
  "#moveCamera-easingId": SelectBox
  "#moveCamera-mode": SelectBox
  "#moveCamera-wait": SelectBox
  "#moveElement-easingId": SelectBox
  "#moveElement-property-key": SelectBox
  "#moveElement-wait": SelectBox
  "#moveLight-easingId": SelectBox
  "#moveLight-property-key": SelectBox
  "#moveLight-wait": SelectBox
  "#object-attribute-boolean-value": SelectBox
  "#object-attribute-enum-value": SelectBox
  "#object-attribute-key": SelectBox
  "#particleLayer-area-type": SelectBox
  "#particleLayer-blend": SelectBox
  "#particleLayer-color-easingId": SelectBox
  "#particleLayer-color-mode": SelectBox
  "#particleLayer-sort": SelectBox
  "#playActorAnimation-wait": SelectBox
  "#playAnimation-mode": SelectBox
  "#playAnimation-motion": SelectBox
  "#playAnimation-wait": SelectBox
  "#playAudio-type": SelectBox
  "#positionGetter-type": SelectBox
  "#remapActorMotion-type": SelectBox
  "#restoreAudio-type": SelectBox
  "#saveAudio-type": SelectBox
  "#sceneActor-teamId": SelectBox
  "#sceneAnimation-motion": SelectBox
  "#sceneLight-blend": SelectBox
  "#sceneLight-type": SelectBox
  "#sceneParallax-blend": SelectBox
  "#sceneParallax-layer": SelectBox
  "#sceneParallax-light": SelectBox
  "#sceneTilemap-blend": SelectBox
  "#sceneTilemap-layer": SelectBox
  "#sceneTilemap-light": SelectBox
  "#setActive-active": SelectBox
  "#setAmbientLight-easingId": SelectBox
  "#setAmbientLight-wait": SelectBox
  "#setAngle-easingId": SelectBox
  "#setAngle-wait": SelectBox
  "#setBoolean-constant-value": SelectBox
  "#setBoolean-operand-type": SelectBox
  "#setBoolean-operation": SelectBox
  "#setCooldown-operation": SelectBox
  "#setDialogBox-property-blend": SelectBox
  "#setDialogBox-property-effect-type": SelectBox
  "#setDialogBox-property-key": SelectBox
  "#setElement-operation": SelectBox
  "#setEvent-choiceIndex": SelectBox
  "#setEvent-operation": SelectBox
  "#setGameSpeed-easingId": SelectBox
  "#setGameSpeed-wait": SelectBox
  "#setImage-property-blend": SelectBox
  "#setImage-property-display": SelectBox
  "#setImage-property-flip": SelectBox
  "#setImage-property-key": SelectBox
  "#setInventory-operation": SelectBox
  "#setItem-operation": SelectBox
  "#setList-boolean": SelectBox
  "#setList-operation": SelectBox
  "#setLoop-loop": SelectBox
  "#setLoop-type": SelectBox
  "#setMovementSpeed-property": SelectBox
  "#setNumber-operand-element-property": SelectBox
  "#setNumber-operand-math-method": SelectBox
  "#setNumber-operand-object-property": SelectBox
  "#setNumber-operand-operation": SelectBox
  "#setNumber-operand-other-data": SelectBox
  "#setNumber-operand-string-method": SelectBox
  "#setNumber-operand-type": SelectBox
  "#setNumber-operation": SelectBox
  "#setObject-operand-type": SelectBox
  "#setPan-easingId": SelectBox
  "#setPan-type": SelectBox
  "#setPan-wait": SelectBox
  "#setPartyMember-operation": SelectBox
  "#setProgressBar-property-blend": SelectBox
  "#setProgressBar-property-display": SelectBox
  "#setProgressBar-property-key": SelectBox
  "#setReverb-easingId": SelectBox
  "#setReverb-type": SelectBox
  "#setReverb-wait": SelectBox
  "#setShortcut-key": SelectBox
  "#setShortcut-operation": SelectBox
  "#setSkill-operation": SelectBox
  "#setState-operation": SelectBox
  "#setString-operand-element-property": SelectBox
  "#setString-operand-object-property": SelectBox
  "#setString-operand-other-data": SelectBox
  "#setString-operand-string-method": SelectBox
  "#setString-operand-type": SelectBox
  "#setString-operation": SelectBox
  "#setTeamRelation-relation": SelectBox
  "#setTeamRelation-teamId1": SelectBox
  "#setTeamRelation-teamId2": SelectBox
  "#setText-property-blend": SelectBox
  "#setText-property-effect-type": SelectBox
  "#setText-property-key": SelectBox
  "#setTextBox-property-key": SelectBox
  "#setTextBox-property-type": SelectBox
  "#setVolume-easingId": SelectBox
  "#setVolume-type": SelectBox
  "#setVolume-wait": SelectBox
  "#setZoomFactor-easingId": SelectBox
  "#setZoomFactor-wait": SelectBox
  "#skillGetter-key": SelectBox
  "#skillGetter-type": SelectBox
  "#stateGetter-type": SelectBox
  "#stopAudio-type": SelectBox
  "#switch-condition-boolean-value": SelectBox
  "#switch-condition-mouse-button": SelectBox
  "#switch-condition-type": SelectBox
  "#switchCollisionSystem-operation": SelectBox
  "#textEffect-type": SelectBox
  "#textPosition-axis": SelectBox
  "#textPosition-operation": SelectBox
  "#tintImage-easingId": SelectBox
  "#tintImage-mode": SelectBox
  "#tintImage-wait": SelectBox
  "#tintScreen-easingId": SelectBox
  "#tintScreen-wait": SelectBox
  "#translateActor-easingId": SelectBox
  "#translateActor-wait": SelectBox
  "#triggerGetter-type": SelectBox
  "#uiDialogBox-blend": SelectBox
  "#uiDialogBox-effect-type": SelectBox
  "#uiDialogBox-typeface": SelectBox
  "#uiImage-blend": SelectBox
  "#uiImage-display": SelectBox
  "#uiImage-flip": SelectBox
  "#uiProgressBar-blend": SelectBox
  "#uiProgressBar-colorMode": SelectBox
  "#uiProgressBar-display": SelectBox
  "#uiProgressBar-type": SelectBox
  "#uiText-blend": SelectBox
  "#uiText-direction": SelectBox
  "#uiText-effect-type": SelectBox
  "#uiText-overflow": SelectBox
  "#uiText-typeface": SelectBox
  "#uiTextBox-align": SelectBox
  "#uiTextBox-type": SelectBox
  "#uiVideo-blend": SelectBox
  "#uiVideo-flip": SelectBox
  "#uiVideo-loop": SelectBox
  "#uiWindow-layout": SelectBox
  "#uiWindow-overflow": SelectBox
  "#useItem-key": SelectBox
  "#useItem-mode": SelectBox
  "#useItem-wait": SelectBox
  "#variableGetter-preset-key": SelectBox
  "#variableGetter-type": SelectBox
}

interface SVGElementTagNameMap_ext {}

interface Window_ext {
  $: typeof document.querySelector
}

// ******************************** CSS选择器 ********************************

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
  interface Element extends Element_ext, Element_props {}

  // HTMLElement 扩展
  interface HTMLElement extends HTMLElement_ext, HTMLElement_object_ext, HTMLElement_scroll_ext, EventTarget_ext {}

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
  interface Event extends Event_ext, Event_props {}

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

  // Node 扩展
  interface Node extends Node_props {}

  // NodeList 扩展
  interface NodeList extends NodeList_ext {}

  // WebGL2RenderingContext 扩展
  interface WebGL2RenderingContext extends GL_ext {}

  // WebGLRenderingContext 扩展
  interface WebGLRenderingContext extends WebGLRenderingContext_ext, GL_ext {
    _bufferData(target: number, size: number, usage: number): void
    bufferData(...params: any[]): void
  }

  // CanvasRenderingContext2D 扩展
  interface CanvasRenderingContext2D extends CanvasRenderingContext2D_ext {}

  // WebGLProgram 扩展
  interface WebGLProgram extends WebGLProgram_ext {}

  // WebGLVertexArrayObject 扩展
  interface WebGLVertexArrayObject extends WebGLVertexArrayObject_ext {}

  // Document 扩展
  interface Document {
    // Creates an instance of the element for the specified tag
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]
    createElement(tagName: string, options?: ElementCreationOptions): HTMLElement

    // Returns the first element that is a descendant of node that matches selectors
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K]
    querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K]
    querySelector<E extends HTMLElement = HTMLElement>(selectors: string): E

    // Returns all element descendants of node that match selectors
    querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>
    querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>
    querySelectorAll<E extends HTMLElement = HTMLElement>(selectors: string): NodeListOf<E>
  }
}
