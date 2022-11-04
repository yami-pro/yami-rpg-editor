'use strict'

import { EquipmentGetter } from '../equipment-getter.js'
import * as Yami from '../../yami.js'

// ******************************** 装备访问器窗口加载 ********************************

// 初始化
EquipmentGetter.initialize = function () {
  // 创建访问器类型选项
  $('#equipmentGetter-type').loadItems([
    {name: 'Event Trigger Equipment', value: 'trigger'},
    {name: 'Latest Equipment', value: 'latest'},
    {name: 'Select By Slot', value: 'by-slot'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置类型关联元素
  $('#equipmentGetter-type').enableHiddenMode().relate([
    {case: 'by-slot', targets: [
      $('#equipmentGetter-actor'),
      $('#equipmentGetter-slot'),
    ]},
    {case: 'variable', targets: [
      $('#equipmentGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#equipmentGetter-confirm').on('click', this.confirm)
}

// 打开窗口
EquipmentGetter.open = function (target) {
  this.target = target
  Yami.Window.open('equipmentGetter')
  // 加载快捷键选项
  $('#equipmentGetter-slot').loadItems(
    Yami.Enum.getStringItems('equipment-slot')
  )

  let actor = {type: 'trigger'}
  let slot = Yami.Enum.getDefStringId('equipment-slot')
  let variable = {type: 'local', slot: ''}
  const equipment = target.dataValue
  switch (equipment.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-slot':
      actor = equipment.actor
      slot = equipment.slot
      break
    case 'variable':
      variable = equipment.variable
      break
  }
  $('#equipmentGetter-type').write(equipment.type)
  $('#equipmentGetter-actor').write(actor)
  $('#equipmentGetter-slot').write(slot)
  $('#equipmentGetter-variable').write(variable)
  $('#equipmentGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
EquipmentGetter.confirm = function (event) {
  const read = Yami.getElementReader('equipmentGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'latest':
      getter = {type}
      break
    case 'by-slot': {
      const actor = read('actor')
      const slot = read('slot')
      if (slot === '') {
        return $('#equipmentGetter-slot').getFocus()
      }
      getter = {type, actor, slot}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#equipmentGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Yami.Window.close('equipmentGetter')
}.bind(EquipmentGetter)
