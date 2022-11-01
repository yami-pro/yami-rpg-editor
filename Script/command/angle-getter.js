'use strict'

// ******************************** 角度访问器窗口 ********************************

const AngleGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
AngleGetter.initialize = function () {
  // 创建访问器类型选项
  $('#angleGetter-type').loadItems([
    {name: 'Towards Position', value: 'position'},
    {name: 'Absolute Angle', value: 'absolute'},
    {name: 'Relative Angle', value: 'relative'},
    {name: 'Direction Angle', value: 'direction'},
    {name: 'Random Angle', value: 'random'},
  ])

  // 设置关联元素
  $('#angleGetter-type').enableHiddenMode().relate([
    {case: 'position', targets: [
      $('#angleGetter-position-position'),
    ]},
    {case: ['absolute', 'relative', 'direction'], targets: [
      $('#angleGetter-common-degrees'),
    ]},
  ])

  // 侦听事件
  $('#angleGetter-confirm').on('click', this.confirm)
}

// 打开窗口
AngleGetter.open = function (target) {
  this.target = target
  Window.open('angleGetter')

  let positionPosition = {type: 'actor', actor: {type: 'trigger'}}
  let commonDegrees = 0
  const angle = target.dataValue
  switch (angle.type) {
    case 'position':
      positionPosition = angle.position
      break
    case 'absolute':
    case 'relative':
    case 'direction':
      commonDegrees = angle.degrees
      break
    case 'random':
      break
  }
  $('#angleGetter-type').write(angle.type)
  $('#angleGetter-position-position').write(positionPosition)
  $('#angleGetter-common-degrees').write(commonDegrees)
  $('#angleGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
AngleGetter.confirm = function (event) {
  const read = getElementReader('angleGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'position': {
      const position = read('position-position')
      getter = {type, position}
      break
    }
    case 'absolute':
    case 'relative':
    case 'direction': {
      const degrees = read('common-degrees')
      getter = {type, degrees}
      break
    }
    case 'random':
      getter = {type}
      break
  }
  this.target.input(getter)
  Window.close('angleGetter')
}.bind(AngleGetter)
