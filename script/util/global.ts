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
  // SelectBox
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
  // ParamList
  "#arrayList-list": ParamList
  "#config-actor-tempAttributes": ParamList
  "#config-font-imports": ParamList
  "#fileActor-attributes": ParamList
  "#fileActor-equipments": ParamList
  "#fileActor-events": ParamList
  "#fileActor-scripts": ParamList
  "#fileActor-skills": ParamList
  "#fileActor-sprites": ParamList
  "#fileAnimation-sprites": ParamList
  "#fileEquipment-attributes": ParamList
  "#fileEquipment-events": ParamList
  "#fileEquipment-scripts": ParamList
  "#fileItem-attributes": ParamList
  "#fileItem-events": ParamList
  "#fileItem-scripts": ParamList
  "#fileScene-events": ParamList
  "#fileScene-scripts": ParamList
  "#fileSkill-attributes": ParamList
  "#fileSkill-events": ParamList
  "#fileSkill-scripts": ParamList
  "#fileState-attributes": ParamList
  "#fileState-events": ParamList
  "#fileState-scripts": ParamList
  "#fileTrigger-events": ParamList
  "#fileTrigger-scripts": ParamList
  "#if-branch-conditions": ParamList
  "#if-branches": ParamList
  "#loop-conditions": ParamList
  "#moveElement-properties": ParamList
  "#moveLight-properties": ParamList
  "#sceneActor-conditions": ParamList
  "#sceneActor-events": ParamList
  "#sceneActor-scripts": ParamList
  "#sceneAnimation-conditions": ParamList
  "#sceneAnimation-events": ParamList
  "#sceneAnimation-scripts": ParamList
  "#sceneLight-conditions": ParamList
  "#sceneLight-events": ParamList
  "#sceneLight-scripts": ParamList
  "#sceneParallax-conditions": ParamList
  "#sceneParallax-events": ParamList
  "#sceneParallax-scripts": ParamList
  "#sceneParticle-conditions": ParamList
  "#sceneParticle-events": ParamList
  "#sceneParticle-scripts": ParamList
  "#sceneRegion-conditions": ParamList
  "#sceneRegion-events": ParamList
  "#sceneRegion-scripts": ParamList
  "#sceneTilemap-conditions": ParamList
  "#sceneTilemap-events": ParamList
  "#sceneTilemap-scripts": ParamList
  "#setDialogBox-properties": ParamList
  "#setImage-properties": ParamList
  "#setNumber-operands": ParamList
  "#setProgressBar-properties": ParamList
  "#setText-properties": ParamList
  "#setTextBox-properties": ParamList
  "#switch-branch-conditions": ParamList
  "#switch-branches": ParamList
  "#uiElement-events": ParamList
  "#uiElement-scripts": ParamList
  // TreeList
  "#animation-layer-list": TreeList
  "#animation-list": TreeList
  "#attribute-list": TreeList
  "#autoTile-templates": TreeList
  "#command-list": TreeList
  "#command-suggestions": TreeList
  "#easing-list": TreeList
  "#enum-list": TreeList
  "#particle-list": TreeList
  "#plugin-list": TreeList
  "#presetElement-list": TreeList
  "#presetObject-list": TreeList
  "#scene-list": TreeList
  "#team-list": TreeList
  "#ui-list": TreeList
  "#variable-list": TreeList
  // NumberBox
  "#animation-speed": NumberBox
  "#animJointFrame-opacity": NumberBox
  "#animJointFrame-rotation": NumberBox
  "#animJointFrame-scaleX": NumberBox
  "#animJointFrame-scaleY": NumberBox
  "#animJointFrame-x": NumberBox
  "#animJointFrame-y": NumberBox
  "#animMotion-loopStart": NumberBox
  "#animParticleFrame-opacity": NumberBox
  "#animParticleFrame-rotation": NumberBox
  "#animParticleFrame-scale": NumberBox
  "#animParticleFrame-scaleX": NumberBox
  "#animParticleFrame-scaleY": NumberBox
  "#animParticleFrame-speed": NumberBox
  "#animParticleFrame-x": NumberBox
  "#animParticleFrame-y": NumberBox
  "#animSpriteFrame-opacity": NumberBox
  "#animSpriteFrame-rotation": NumberBox
  "#animSpriteFrame-scaleX": NumberBox
  "#animSpriteFrame-scaleY": NumberBox
  "#animSpriteFrame-tint-0": NumberBox
  "#animSpriteFrame-tint-1": NumberBox
  "#animSpriteFrame-tint-2": NumberBox
  "#animSpriteFrame-tint-3": NumberBox
  "#animSpriteFrame-x": NumberBox
  "#animSpriteFrame-y": NumberBox
  "#arrayList-number-value": NumberBox
  "#autoTile-generateFrames-count": NumberBox
  "#autoTile-generateFrames-strideX": NumberBox
  "#autoTile-generateFrames-strideY": NumberBox
  "#autoTile-x": NumberBox
  "#autoTile-y": NumberBox
  "#color-a": NumberBox
  "#color-b": NumberBox
  "#color-g": NumberBox
  "#color-r": NumberBox
  "#condition-number-value": NumberBox
  "#config-animation-frameRate": NumberBox
  "#config-animationArea-expansionBottom": NumberBox
  "#config-animationArea-expansionLeft": NumberBox
  "#config-animationArea-expansionRight": NumberBox
  "#config-animationArea-expansionTop": NumberBox
  "#config-collision-scene-actorSize": NumberBox
  "#config-font-threshold": NumberBox
  "#config-lightArea-expansionBottom": NumberBox
  "#config-lightArea-expansionLeft": NumberBox
  "#config-lightArea-expansionRight": NumberBox
  "#config-lightArea-expansionTop": NumberBox
  "#config-resolution-height": NumberBox
  "#config-resolution-width": NumberBox
  "#config-scene-animationInterval": NumberBox
  "#config-scene-padding": NumberBox
  "#config-tileArea-expansionBottom": NumberBox
  "#config-tileArea-expansionLeft": NumberBox
  "#config-tileArea-expansionRight": NumberBox
  "#config-tileArea-expansionTop": NumberBox
  "#config-window-height": NumberBox
  "#config-window-width": NumberBox
  "#detectTargets-distance": NumberBox
  "#discardTargets-distance": NumberBox
  "#easing-points-0-x": NumberBox
  "#easing-points-0-y": NumberBox
  "#easing-points-1-x": NumberBox
  "#easing-points-1-y": NumberBox
  "#easing-points-2-x": NumberBox
  "#easing-points-2-y": NumberBox
  "#easing-points-3-x": NumberBox
  "#easing-points-3-y": NumberBox
  "#easing-points-4-x": NumberBox
  "#easing-points-4-y": NumberBox
  "#easing-points-5-x": NumberBox
  "#easing-points-5-y": NumberBox
  "#easing-points-6-x": NumberBox
  "#easing-points-6-y": NumberBox
  "#easing-points-7-x": NumberBox
  "#easing-points-7-y": NumberBox
  "#easing-preview-delay": NumberBox
  "#easing-preview-duration": NumberBox
  "#fileActor-size": NumberBox
  "#fileActor-speed": NumberBox
  "#fileActor-weight": NumberBox
  "#fileAnimation-sprite-hframes": NumberBox
  "#fileAnimation-sprite-vframes": NumberBox
  "#fileScene-ambient-blue": NumberBox
  "#fileScene-ambient-green": NumberBox
  "#fileScene-ambient-red": NumberBox
  "#fileScene-contrast": NumberBox
  "#fileScene-height": NumberBox
  "#fileScene-tileHeight": NumberBox
  "#fileScene-tileWidth": NumberBox
  "#fileScene-width": NumberBox
  "#fileTileset-globalOffsetX": NumberBox
  "#fileTileset-globalOffsetY": NumberBox
  "#fileTileset-globalPriority": NumberBox
  "#fileTileset-height": NumberBox
  "#fileTileset-tileHeight": NumberBox
  "#fileTileset-tileWidth": NumberBox
  "#fileTileset-width": NumberBox
  "#fileTrigger-duration": NumberBox
  "#fileTrigger-effectiveTime": NumberBox
  "#fileTrigger-hitInterval": NumberBox
  "#fileTrigger-initialDelay": NumberBox
  "#fileTrigger-offsetY": NumberBox
  "#fileTrigger-priority": NumberBox
  "#fileTrigger-shape-anchor": NumberBox
  "#fileTrigger-shape-centralAngle": NumberBox
  "#fileTrigger-shape-height": NumberBox
  "#fileTrigger-shape-radius": NumberBox
  "#fileTrigger-shape-width": NumberBox
  "#fileTrigger-speed": NumberBox
  "#fileUI-height": NumberBox
  "#fileUI-width": NumberBox
  "#followActor-maxDist": NumberBox
  "#followActor-minDist": NumberBox
  "#followActor-offset": NumberBox
  "#followActor-vertDist": NumberBox
  "#fontSize-size": NumberBox
  "#if-condition-actor-quantity": NumberBox
  "#if-condition-number-constant-value": NumberBox
  "#imageClip-height": NumberBox
  "#imageClip-width": NumberBox
  "#imageClip-x": NumberBox
  "#imageClip-y": NumberBox
  "#moveCamera-duration": NumberBox
  "#moveElement-duration": NumberBox
  "#moveLight-duration": NumberBox
  "#object-attribute-number-value": NumberBox
  "#particle-duration": NumberBox
  "#particle-speed": NumberBox
  "#particleLayer-anchor-x-0": NumberBox
  "#particleLayer-anchor-x-1": NumberBox
  "#particleLayer-anchor-y-0": NumberBox
  "#particleLayer-anchor-y-1": NumberBox
  "#particleLayer-area-height": NumberBox
  "#particleLayer-area-radius": NumberBox
  "#particleLayer-area-width": NumberBox
  "#particleLayer-area-x": NumberBox
  "#particleLayer-area-y": NumberBox
  "#particleLayer-color-endMax-0": NumberBox
  "#particleLayer-color-endMax-1": NumberBox
  "#particleLayer-color-endMax-2": NumberBox
  "#particleLayer-color-endMax-3": NumberBox
  "#particleLayer-color-endMin-0": NumberBox
  "#particleLayer-color-endMin-1": NumberBox
  "#particleLayer-color-endMin-2": NumberBox
  "#particleLayer-color-endMin-3": NumberBox
  "#particleLayer-color-max-0": NumberBox
  "#particleLayer-color-max-1": NumberBox
  "#particleLayer-color-max-2": NumberBox
  "#particleLayer-color-max-3": NumberBox
  "#particleLayer-color-min-0": NumberBox
  "#particleLayer-color-min-1": NumberBox
  "#particleLayer-color-min-2": NumberBox
  "#particleLayer-color-min-3": NumberBox
  "#particleLayer-color-rgba-0": NumberBox
  "#particleLayer-color-rgba-1": NumberBox
  "#particleLayer-color-rgba-2": NumberBox
  "#particleLayer-color-rgba-3": NumberBox
  "#particleLayer-color-startMax-0": NumberBox
  "#particleLayer-color-startMax-1": NumberBox
  "#particleLayer-color-startMax-2": NumberBox
  "#particleLayer-color-startMax-3": NumberBox
  "#particleLayer-color-startMin-0": NumberBox
  "#particleLayer-color-startMin-1": NumberBox
  "#particleLayer-color-startMin-2": NumberBox
  "#particleLayer-color-startMin-3": NumberBox
  "#particleLayer-color-tint-0": NumberBox
  "#particleLayer-color-tint-1": NumberBox
  "#particleLayer-color-tint-2": NumberBox
  "#particleLayer-color-tint-3": NumberBox
  "#particleLayer-count": NumberBox
  "#particleLayer-delay": NumberBox
  "#particleLayer-fadeout": NumberBox
  "#particleLayer-hframes": NumberBox
  "#particleLayer-interval": NumberBox
  "#particleLayer-lifetime": NumberBox
  "#particleLayer-lifetimeDev": NumberBox
  "#particleLayer-maximum": NumberBox
  "#particleLayer-movement-accel-0": NumberBox
  "#particleLayer-movement-accel-1": NumberBox
  "#particleLayer-movement-accelAngle-0": NumberBox
  "#particleLayer-movement-accelAngle-1": NumberBox
  "#particleLayer-movement-angle-0": NumberBox
  "#particleLayer-movement-angle-1": NumberBox
  "#particleLayer-movement-speed-0": NumberBox
  "#particleLayer-movement-speed-1": NumberBox
  "#particleLayer-rotation-accel-0": NumberBox
  "#particleLayer-rotation-accel-1": NumberBox
  "#particleLayer-rotation-angle-0": NumberBox
  "#particleLayer-rotation-angle-1": NumberBox
  "#particleLayer-rotation-speed-0": NumberBox
  "#particleLayer-rotation-speed-1": NumberBox
  "#particleLayer-scale-accel-0": NumberBox
  "#particleLayer-scale-accel-1": NumberBox
  "#particleLayer-scale-factor-0": NumberBox
  "#particleLayer-scale-factor-1": NumberBox
  "#particleLayer-scale-speed-0": NumberBox
  "#particleLayer-scale-speed-1": NumberBox
  "#particleLayer-vframes": NumberBox
  "#playAnimation-offsetY": NumberBox
  "#playAnimation-priority": NumberBox
  "#playAudio-volume": NumberBox
  "#scene-shift-x": NumberBox
  "#scene-shift-y": NumberBox
  "#sceneActor-angle": NumberBox
  "#sceneActor-x": NumberBox
  "#sceneActor-y": NumberBox
  "#sceneAnimation-angle": NumberBox
  "#sceneAnimation-x": NumberBox
  "#sceneAnimation-y": NumberBox
  "#sceneLight-anchorX": NumberBox
  "#sceneLight-anchorY": NumberBox
  "#sceneLight-angle": NumberBox
  "#sceneLight-blue": NumberBox
  "#sceneLight-green": NumberBox
  "#sceneLight-height": NumberBox
  "#sceneLight-intensity": NumberBox
  "#sceneLight-range": NumberBox
  "#sceneLight-red": NumberBox
  "#sceneLight-width": NumberBox
  "#sceneLight-x": NumberBox
  "#sceneLight-y": NumberBox
  "#sceneParallax-anchorX": NumberBox
  "#sceneParallax-anchorY": NumberBox
  "#sceneParallax-offsetX": NumberBox
  "#sceneParallax-offsetY": NumberBox
  "#sceneParallax-opacity": NumberBox
  "#sceneParallax-order": NumberBox
  "#sceneParallax-parallaxFactorX": NumberBox
  "#sceneParallax-parallaxFactorY": NumberBox
  "#sceneParallax-repeatX": NumberBox
  "#sceneParallax-repeatY": NumberBox
  "#sceneParallax-scaleX": NumberBox
  "#sceneParallax-scaleY": NumberBox
  "#sceneParallax-shiftSpeedX": NumberBox
  "#sceneParallax-shiftSpeedY": NumberBox
  "#sceneParallax-tint-0": NumberBox
  "#sceneParallax-tint-1": NumberBox
  "#sceneParallax-tint-2": NumberBox
  "#sceneParallax-tint-3": NumberBox
  "#sceneParallax-x": NumberBox
  "#sceneParallax-y": NumberBox
  "#sceneParticle-angle": NumberBox
  "#sceneParticle-scale": NumberBox
  "#sceneParticle-speed": NumberBox
  "#sceneParticle-x": NumberBox
  "#sceneParticle-y": NumberBox
  "#sceneRegion-height": NumberBox
  "#sceneRegion-width": NumberBox
  "#sceneRegion-x": NumberBox
  "#sceneRegion-y": NumberBox
  "#sceneTilemap-anchorX": NumberBox
  "#sceneTilemap-anchorY": NumberBox
  "#sceneTilemap-height": NumberBox
  "#sceneTilemap-offsetX": NumberBox
  "#sceneTilemap-offsetY": NumberBox
  "#sceneTilemap-opacity": NumberBox
  "#sceneTilemap-order": NumberBox
  "#sceneTilemap-parallaxFactorX": NumberBox
  "#sceneTilemap-parallaxFactorY": NumberBox
  "#sceneTilemap-width": NumberBox
  "#sceneTilemap-x": NumberBox
  "#sceneTilemap-y": NumberBox
  "#setDialogBox-property-effect-shadowOffsetX": NumberBox
  "#setDialogBox-property-effect-shadowOffsetY": NumberBox
  "#setDialogBox-property-effect-strokeWidth": NumberBox
  "#setDialogBox-property-interval": NumberBox
  "#setDialogBox-property-letterSpacing": NumberBox
  "#setDialogBox-property-lineSpacing": NumberBox
  "#setDialogBox-property-size": NumberBox
  "#setList-number": NumberBox
  "#setNumber-operand-constant-value": NumberBox
  "#setNumber-operand-math-decimals": NumberBox
  "#setPan-duration": NumberBox
  "#setQuantity-quantity": NumberBox
  "#setReverb-duration": NumberBox
  "#setString-operand-string-pad-start-length": NumberBox
  "#setText-property-effect-shadowOffsetX": NumberBox
  "#setText-property-effect-shadowOffsetY": NumberBox
  "#setText-property-effect-strokeWidth": NumberBox
  "#setText-property-letterSpacing": NumberBox
  "#setText-property-lineSpacing": NumberBox
  "#setText-property-size": NumberBox
  "#setTextBox-property-decimals": NumberBox
  "#setVolume-duration": NumberBox
  "#switch-condition-number-value": NumberBox
  "#textEffect-shadowOffsetX": NumberBox
  "#textEffect-shadowOffsetY": NumberBox
  "#textEffect-strokeWidth": NumberBox
  "#textPosition-value": NumberBox
  "#tintImage-duration": NumberBox
  "#tintImage-tint-0": NumberBox
  "#tintImage-tint-1": NumberBox
  "#tintImage-tint-2": NumberBox
  "#tintImage-tint-3": NumberBox
  "#tintScreen-duration": NumberBox
  "#tintScreen-tint-0": NumberBox
  "#tintScreen-tint-1": NumberBox
  "#tintScreen-tint-2": NumberBox
  "#tintScreen-tint-3": NumberBox
  "#uiDialogBox-effect-shadowOffsetX": NumberBox
  "#uiDialogBox-effect-shadowOffsetY": NumberBox
  "#uiDialogBox-effect-strokeWidth": NumberBox
  "#uiDialogBox-interval": NumberBox
  "#uiDialogBox-letterSpacing": NumberBox
  "#uiDialogBox-lineSpacing": NumberBox
  "#uiDialogBox-size": NumberBox
  "#uiElement-transform-anchorX": NumberBox
  "#uiElement-transform-anchorY": NumberBox
  "#uiElement-transform-height": NumberBox
  "#uiElement-transform-height2": NumberBox
  "#uiElement-transform-opacity": NumberBox
  "#uiElement-transform-rotation": NumberBox
  "#uiElement-transform-scaleX": NumberBox
  "#uiElement-transform-scaleY": NumberBox
  "#uiElement-transform-skewX": NumberBox
  "#uiElement-transform-skewY": NumberBox
  "#uiElement-transform-width": NumberBox
  "#uiElement-transform-width2": NumberBox
  "#uiElement-transform-x": NumberBox
  "#uiElement-transform-x2": NumberBox
  "#uiElement-transform-y": NumberBox
  "#uiElement-transform-y2": NumberBox
  "#uiImage-border": NumberBox
  "#uiImage-shiftX": NumberBox
  "#uiImage-shiftY": NumberBox
  "#uiImage-tint-0": NumberBox
  "#uiImage-tint-1": NumberBox
  "#uiImage-tint-2": NumberBox
  "#uiImage-tint-3": NumberBox
  "#uiProgressBar-centerX": NumberBox
  "#uiProgressBar-centerY": NumberBox
  "#uiProgressBar-centralAngle": NumberBox
  "#uiProgressBar-color-0": NumberBox
  "#uiProgressBar-color-1": NumberBox
  "#uiProgressBar-color-2": NumberBox
  "#uiProgressBar-color-3": NumberBox
  "#uiProgressBar-progress": NumberBox
  "#uiProgressBar-startAngle": NumberBox
  "#uiProgressBar-step": NumberBox
  "#uiText-effect-shadowOffsetX": NumberBox
  "#uiText-effect-shadowOffsetY": NumberBox
  "#uiText-effect-strokeWidth": NumberBox
  "#uiText-letterSpacing": NumberBox
  "#uiText-lineSpacing": NumberBox
  "#uiText-size": NumberBox
  "#uiTextBox-decimals": NumberBox
  "#uiTextBox-max": NumberBox
  "#uiTextBox-maxLength": NumberBox
  "#uiTextBox-min": NumberBox
  "#uiTextBox-number": NumberBox
  "#uiTextBox-padding": NumberBox
  "#uiTextBox-size": NumberBox
  "#uiWindow-gridGapX": NumberBox
  "#uiWindow-gridGapY": NumberBox
  "#uiWindow-gridHeight": NumberBox
  "#uiWindow-gridWidth": NumberBox
  "#uiWindow-paddingX": NumberBox
  "#uiWindow-paddingY": NumberBox
  "#uiWindow-scrollX": NumberBox
  "#uiWindow-scrollY": NumberBox
  "#variable-value-number": NumberBox
  "#zoom-factor": NumberBox
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
      "legend": JSXHTMLElement
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
