'use strict'

import {
  ConditionListInterface,
  EventListInterface,
  getElementWriter,
  Inspector,
  Scene,
  ScriptListInterface
} from '../yami'

// ******************************** 场景 - 区域页面 ********************************

{
const SceneRegion = {
  // properties
  owner: Scene,
  target: null,
  nameBox: $('#sceneRegion-name'),
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  paramInput: null,
}

// 初始化
SceneRegion.initialize = function () {
  // 绑定条件列表
  $('#sceneRegion-conditions').bind(new ConditionListInterface(this, Scene))

  // 绑定事件列表
  $('#sceneRegion-events').bind(new EventListInterface(this, Scene))

  // 绑定脚本列表
  $('#sceneRegion-scripts').bind(new ScriptListInterface(this, Scene))

  // 绑定脚本参数面板
  $('#sceneRegion-parameter-pane').bind($('#sceneRegion-scripts'))

  // 侦听事件
  const elements = $(`#sceneRegion-name, #sceneRegion-color,
    #sceneRegion-x, #sceneRegion-y, #sceneRegion-width, #sceneRegion-height`)
  elements.on('input', this.paramInput)
  elements.on('focus', Inspector.inputFocus)
  elements.on('blur', Inspector.inputBlur(this, Scene))
  $('#sceneRegion-conditions, #sceneRegion-events, #sceneRegion-scripts').on('change', Scene.listChange)
}

// 创建区域
SceneRegion.create = function () {
  return {
    class: 'region',
    name: 'Region',
    hidden: false,
    locked: false,
    presetId: '',
    color: '00000080',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    conditions: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
SceneRegion.open = function (region) {
  if (this.target !== region) {
    this.target = region

    // 写入数据
    const write = getElementWriter('sceneRegion', region)
    write('name')
    write('color')
    write('x')
    write('y')
    write('width')
    write('height')
    write('conditions')
    write('events')
    write('scripts')
  }
}

// 关闭数据
SceneRegion.close = function () {
  if (this.target) {
    Scene.list.unselect(this.target)
    Scene.updateTarget()
    this.target = null
    $('#sceneRegion-conditions').clear()
    $('#sceneRegion-events').clear()
    $('#sceneRegion-scripts').clear()
    $('#sceneRegion-parameter-pane').clear()
  }
}

// 写入数据
SceneRegion.write = function (options) {
  if (options.x !== undefined) {
    $('#sceneRegion-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#sceneRegion-y').write(options.y)
  }
}

// 更新数据
SceneRegion.update = function (region, key, value) {
  Scene.planToSave()
  switch (key) {
    case 'name':
      if (region.name !== value) {
        region.name = value
        Scene.updateTargetInfo()
        Scene.list.updateItemName(region)
      }
      break
    case 'x':
    case 'y':
    case 'width':
    case 'height':
      if (region[key] !== value) {
        region[key] = value
      }
      break
    case 'color':
      if (region.color !== value) {
        region.color = value
        Scene.list.updateIcon(region)
      }
      break
  }
  Scene.requestRendering()
}

// 参数 - 输入事件
SceneRegion.paramInput = function (event) {
  SceneRegion.update(
    SceneRegion.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.sceneRegion = SceneRegion
}
