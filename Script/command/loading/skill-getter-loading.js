'use strict'

import { SkillGetter } from '../skill-getter.js'
import { Window } from '../../tools/window.js'

// ******************************** 技能访问器窗口加载 ********************************

// 初始化
SkillGetter.initialize = function () {
  // 创建访问器类型选项
  $('#skillGetter-type').loadItems([
    {name: 'Event Trigger Skill', value: 'trigger'},
    {name: 'Latest Skill', value: 'latest'},
    {name: 'Select By Shortcut Key', value: 'by-key'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#skillGetter-type').enableHiddenMode().relate([
    {case: 'by-key', targets: [
      $('#skillGetter-actor'),
      $('#skillGetter-key'),
    ]},
    {case: 'variable', targets: [
      $('#skillGetter-variable'),
    ]},
  ])

  // 侦听事件
  $('#skillGetter-confirm').on('click', this.confirm)
}

// 打开窗口
SkillGetter.open = function (target) {
  this.target = target
  Window.open('skillGetter')

  // 加载快捷键选项
  $('#skillGetter-key').loadItems(
    Enum.getStringItems('shortcut-key')
  )

  let actor = {type: 'trigger'}
  let key = Enum.getDefStringId('shortcut-key')
  let variable = {type: 'local', key: ''}
  const skill = target.dataValue
  switch (skill.type) {
    case 'trigger':
    case 'latest':
      break
    case 'by-key':
      actor = skill.actor
      key = skill.key
      break
    case 'variable':
      variable = skill.variable
      break
  }
  $('#skillGetter-type').write(skill.type)
  $('#skillGetter-actor').write(actor)
  $('#skillGetter-key').write(key)
  $('#skillGetter-variable').write(variable)
  $('#skillGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
SkillGetter.confirm = function (event) {
  const read = getElementReader('skillGetter')
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
        return $('#skillGetter-key').getFocus()
      }
      getter = {type, actor, key}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (VariableGetter.isNone(variable)) {
        return $('#skillGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Window.close('skillGetter')
}.bind(SkillGetter)
