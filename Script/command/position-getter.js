'use strict'

// ******************************** 位置访问器窗口 ********************************

const PositionGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
PositionGetter.initialize = function () {
  // 创建类型选项
  $('#positionGetter-type').loadItems([
    {name: 'Absolute Coordinates', value: 'absolute'},
    {name: 'Relative Coordinates', value: 'relative'},
    {name: 'Position of Actor', value: 'actor'},
    {name: 'Position of Trigger', value: 'trigger'},
    {name: 'Position of Light', value: 'light'},
    {name: 'Position of Region', value: 'region'},
  ])

  // 设置类型关联元素
  $('#positionGetter-type').enableHiddenMode().relate([
    {case: 'absolute', targets: [
      $('#positionGetter-common-x'),
      $('#positionGetter-common-y'),
    ]},
    {case: 'relative', targets: [
      $('#positionGetter-common-x'),
      $('#positionGetter-common-y'),
    ]},
    {case: 'actor', targets: [
      $('#positionGetter-actor'),
    ]},
    {case: 'trigger', targets: [
      $('#positionGetter-trigger'),
    ]},
    {case: 'light', targets: [
      $('#positionGetter-light'),
    ]},
    {case: 'region', targets: [
      $('#positionGetter-regionId'),
    ]},
  ])

  // 侦听事件
  $('#positionGetter-confirm').on('click', this.confirm)
}

// 打开窗口
PositionGetter.open = function (target) {
  this.target = target
  Window.open('positionGetter')

  let commonX = 0
  let commonY = 0
  let actor = {type: 'trigger'}
  let trigger = {type: 'trigger'}
  let light = {type: 'trigger'}
  let regionId = PresetObject.getDefaultPresetId('region')
  const position = target.dataValue
  switch (position.type) {
    case 'absolute':
      commonX = position.x
      commonY = position.y
      break
    case 'relative':
      commonX = position.x
      commonY = position.y
      break
    case 'actor':
      actor = position.actor
      break
    case 'trigger':
      trigger = position.trigger
      break
    case 'light':
      light = position.light
      break
    case 'region':
      regionId = position.regionId
      break
  }
  $('#positionGetter-type').write(position.type)
  $('#positionGetter-common-x').write(commonX)
  $('#positionGetter-common-y').write(commonY)
  $('#positionGetter-actor').write(actor)
  $('#positionGetter-trigger').write(trigger)
  $('#positionGetter-light').write(light)
  $('#positionGetter-regionId').write(regionId)
  $('#positionGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
PositionGetter.confirm = function (event) {
  const read = getElementReader('positionGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'absolute': {
      const x = read('common-x')
      const y = read('common-y')
      getter = {type, x, y}
      break
    }
    case 'relative': {
      const x = read('common-x')
      const y = read('common-y')
      getter = {type, x, y}
      break
    }
    case 'actor': {
      const actor = read('actor')
      getter = {type, actor}
      break
    }
    case 'trigger': {
      const trigger = read('trigger')
      getter = {type, trigger}
      break
    }
    case 'light': {
      const light = read('light')
      getter = {type, light}
      break
    }
    case 'region': {
      const regionId = read('regionId')
      if (regionId === '') {
        return $('#positionGetter-regionId').getFocus()
      }
      getter = {type, regionId}
      break
    }
  }
  this.target.input(getter)
  Window.close('positionGetter')
}.bind(PositionGetter)
