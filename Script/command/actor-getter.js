'use strict'

import * as Yami from '../yami.js'

// ******************************** 角色访问器窗口 ********************************

const ActorGetter = {
  // properties
  target: null,
  // methods
  initialize: null,
  open: null,
  // events
  confirm: null,
}

// ******************************** 角色访问器窗口加载 ********************************

// 初始化
ActorGetter.initialize = function () {
  // 创建访问器类型选项
  $('#actorGetter-type').loadItems([
    {name: 'Event Trigger Actor', value: 'trigger'},
    {name: 'Skill Caster', value: 'caster'},
    {name: 'Latest Actor', value: 'latest'},
    {name: 'Player Actor', value: 'player'},
    {name: 'Party Member', value: 'member'},
    {name: 'Global Actor', value: 'global'},
    {name: 'Select By ID', value: 'by-id'},
    {name: 'Select By Name', value: 'by-name'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置关联元素
  $('#actorGetter-type').enableHiddenMode().relate([
    {case: 'member', targets: [
      $('#actorGetter-memberId'),
    ]},
    {case: 'global', targets: [
      $('#actorGetter-actorId'),
    ]},
    {case: 'by-id', targets: [
      $('#actorGetter-presetId'),
    ]},
    {case: 'by-name', targets: [
      $('#actorGetter-name'),
    ]},
    {case: 'variable', targets: [
      $('#actorGetter-variable'),
    ]},
  ])

  // 创建队伍成员编号选项
  $('#actorGetter-memberId').loadItems([
    {name: 'Member #1', value: 0},
    {name: 'Member #2', value: 1},
    {name: 'Member #3', value: 2},
    {name: 'Member #4', value: 3},
  ])

  // 侦听事件
  $('#actorGetter-confirm').on('click', this.confirm)
  Yami.TextSuggestion.listen($('#actorGetter-name'), 'actor')
}

// 打开窗口
ActorGetter.open = function (target) {
  this.target = target
  Yami.Window.open('actorGetter')

  let name = ''
  let memberId = 0
  let actorId = ''
  let presetId = Yami.PresetObject.getDefaultPresetId('actor')
  let variable = {type: 'local', key: ''}
  const actor = target.dataValue
  switch (actor.type) {
    case 'trigger':
    case 'caster':
    case 'latest':
    case 'player':
      break
    case 'member':
      memberId = actor.memberId
      break
    case 'global':
      actorId = actor.actorId
      break
    case 'by-id':
      presetId = actor.presetId
      break
    case 'by-name':
      name = actor.name
      break
    case 'variable':
      variable = actor.variable
      break
  }
  $('#actorGetter-type').write(actor.type)
  $('#actorGetter-memberId').write(memberId)
  $('#actorGetter-actorId').write(actorId)
  $('#actorGetter-presetId').write(presetId)
  $('#actorGetter-name').write(name)
  $('#actorGetter-variable').write(variable)
  $('#actorGetter-type').getFocus()
}

// 确定按钮 - 鼠标点击事件
ActorGetter.confirm = function (event) {
  const read = Yami.getElementReader('actorGetter')
  const type = read('type')
  let getter
  switch (type) {
    case 'trigger':
    case 'caster':
    case 'latest':
    case 'player':
      getter = {type}
      break
    case 'member': {
      const memberId = read('memberId')
      getter = {type, memberId}
      break
    }
    case 'global': {
      const actorId = read('actorId')
      if (actorId === '') {
        return $('#actorGetter-actorId').getFocus()
      }
      getter = {type, actorId}
      break
    }
    case 'by-id': {
      const presetId = read('presetId')
      if (presetId === '') {
        return $('#actorGetter-presetId').getFocus()
      }
      getter = {type, presetId}
      break
    }
    case 'by-name': {
      const name = read('name')
      if (name === '') {
        return $('#actorGetter-name').getFocus()
      }
      getter = {type, name}
      break
    }
    case 'variable': {
      const variable = read('variable')
      if (Yami.VariableGetter.isNone(variable)) {
        return $('#actorGetter-variable').getFocus()
      }
      getter = {type, variable}
      break
    }
  }
  this.target.input(getter)
  Yami.Window.close('actorGetter')
}.bind(ActorGetter)

// ******************************** 角色访问器窗口导出 ********************************

export { ActorGetter }
