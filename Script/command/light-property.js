'use strict'

// ******************************** 移动光源 - 属性窗口 ********************************

const LightProperty = {
  // properties
  target: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// 初始化
LightProperty.initialize = function () {
  // 创建属性选项
  $('#moveLight-property-key').loadItems([
    {name: 'X', value: 'x'},
    {name: 'Y', value: 'y'},
    {name: 'Range', value: 'range'},
    {name: 'intensity', value: 'intensity'},
    {name: 'Anchor X', value: 'anchorX'},
    {name: 'Anchor Y', value: 'anchorY'},
    {name: 'Width', value: 'width'},
    {name: 'Height', value: 'height'},
    {name: 'Angle', value: 'angle'},
    {name: 'Red', value: 'red'},
    {name: 'Green', value: 'green'},
    {name: 'Blue', value: 'blue'},
  ])

  // 设置属性关联元素
  $('#moveLight-property-key').enableHiddenMode().relate([
    {case: 'x', targets: [
      $('#moveLight-property-x'),
    ]},
    {case: 'y', targets: [
      $('#moveLight-property-y'),
    ]},
    {case: 'range', targets: [
      $('#moveLight-property-range'),
    ]},
    {case: 'intensity', targets: [
      $('#moveLight-property-intensity'),
    ]},
    {case: 'anchorX', targets: [
      $('#moveLight-property-anchorX'),
    ]},
    {case: 'anchorY', targets: [
      $('#moveLight-property-anchorY'),
    ]},
    {case: 'width', targets: [
      $('#moveLight-property-width'),
    ]},
    {case: 'height', targets: [
      $('#moveLight-property-height'),
    ]},
    {case: 'angle', targets: [
      $('#moveLight-property-angle'),
    ]},
    {case: 'red', targets: [
      $('#moveLight-property-red'),
    ]},
    {case: 'green', targets: [
      $('#moveLight-property-green'),
    ]},
    {case: 'blue', targets: [
      $('#moveLight-property-blue'),
    ]},
  ])

  // 侦听事件
  $('#moveLight-property-confirm').on('click', this.confirm)
}

// 解析属性
LightProperty.parse = function ({key, value}) {
  switch (key) {
    case 'x':
    case 'y':
    case 'range':
    case 'intensity':
    case 'anchorX':
    case 'anchorY':
    case 'width':
    case 'height':
    case 'angle':
    case 'red':
    case 'green':
    case 'blue': {
      const number = Command.parseVariableNumber(value)
      return `${Local.get('command.moveLight.' + key)}(${number})`
    }
  }
}

// 打开数据
LightProperty.open = function ({key = 'x', value = 0} = {}) {
  Window.open('moveLight-property')
  const write = getElementWriter('moveLight-property')
  let x = 0
  let y = 0
  let range = 1
  let intensity = 0.5
  let anchorX = 0.5
  let anchorY = 0.5
  let width = 1
  let height = 1
  let angle = 0
  let red = 0
  let green = 0
  let blue = 0
  switch (key) {
    case 'x':
      x = value
      break
    case 'y':
      y = value
      break
    case 'range':
      range = value
      break
    case 'intensity':
      intensity = value
      break
    case 'anchorX':
      anchorX = value
      break
    case 'anchorY':
      anchorY = value
      break
    case 'width':
      width = value
      break
    case 'height':
      height = value
      break
    case 'angle':
      angle = value
      break
    case 'red':
      red = value
      break
    case 'green':
      green = value
      break
    case 'blue':
      blue = value
      break
  }
  write('key', key)
  write('x', x)
  write('y', y)
  write('range', range)
  write('intensity', intensity)
  write('anchorX', anchorX)
  write('anchorY', anchorY)
  write('width', width)
  write('height', height)
  write('angle', angle)
  write('red', red)
  write('green', green)
  write('blue', blue)
  $('#moveLight-property-key').getFocus()
}

// 保存数据
LightProperty.save = function () {
  const read = getElementReader('moveLight-property')
  const key = read('key')
  let value
  switch (key) {
    case 'x':
      value = read('x')
      break
    case 'y':
      value = read('y')
      break
    case 'range':
      value = read('range')
      break
    case 'intensity':
      value = read('intensity')
      break
    case 'anchorX':
      value = read('anchorX')
      break
    case 'anchorY':
      value = read('anchorY')
      break
    case 'width':
      value = read('width')
      break
    case 'height':
      value = read('height')
      break
    case 'angle':
      value = read('angle')
      break
    case 'red':
      value = read('red')
      break
    case 'green':
      value = read('green')
      break
    case 'blue':
      value = read('blue')
      break
  }
  Window.close('moveLight-property')
  return {key, value}
}

// 确定按钮 - 鼠标点击事件
LightProperty.confirm = function (event) {
  return LightProperty.target.save()
}

export { LightProperty }
