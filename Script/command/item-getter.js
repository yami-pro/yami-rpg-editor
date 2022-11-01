'use strict'

// ******************************** 物品访问器窗口 ********************************

const ItemGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
ItemGetter.initialize = function () {
  // 创建访问器类型选项
  $('#itemGetter-type').loadItems([
    {name: 'Event Trigger Item', value: 'trigger'},
    {name: 'Latest Item', value: 'latest'},
    {name: 'Select By Shortcut Key', value: 'by-key'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置类型关联元素
  $('#itemGetter-type').enableHiddenMode().relate([
    {case: 'by-key', targets: [
      $('#itemGetter-actor'),
      $('#itemGetter-key'),
    ]},
    {case: 'variable', targets: [
      $('#itemGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#itemGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ItemGetter.open = function (target) {
  this.target = target
  Window.open('itemGetter')

  // 加载快捷键选项
  $('#itemGetter-key').loadItems(
    Enum.getStringItems('shortcut-key')
  )

  let actor = {type: 'trigger'}
  let key = Enum.getDefStringId('shortcut-key')
  let variable = {type: 'local', key: ''}
  const item = target.dataValue
  switch (item.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-key':
      actor = item.actor
      key = item.key
      break
    case 'variable':
      variable = item.variable
      break
  }
  $('#itemGetter-type').write(item.type)
  $('#itemGetter-actor').write(actor)
  $('#itemGetter-key').write(key)
  $('#itemGetter-variable').write(variable)
  $('#itemGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
ItemGetter.confirm = function (event) {
  const read = getElementReader('itemGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-key': {
      const actor = read('actor')
      const key = read('key')
      if (key === '') {
        return $('#itemGetter-key').getFocus()
      }
      getter = {type, actor, key}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#itemGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('itemGetter')
}.bind(ItemGetter)

export { ItemGetter }
