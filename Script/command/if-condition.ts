'use strict'

import {
  Command,
  getElementReader,
  getElementWriter,
  Local,
  VariableGetter,
  Window
} from '../yami'

// ******************************** 条件分支 - 条件窗口 ********************************

const IfCondition = {
  // properties
  type: 'condition',
  target: null,
  // methods
  initialize: null,
  parseBooleanOperation: null,
  parseBooleanOperand: null,
  parseNumberOperation: null,
  parseNumberOperand: null,
  parseStringOperation: null,
  parseStringOperand: null,
  parseObjectOperation: null,
  parseObjectOperand: null,
  parseActorOperation: null,
  parseElementOperation: null,
  parseKeyboardState: null,
  parseMouseButton: null,
  parseMouseState: null,
  parseListOperation: null,
  parseOther: null,
  parse: null,
  open: null,
  save: null,
  // events
  confirm: null,
}

// ******************************** 条件分支 - 条件窗口加载 ********************************

// 初始化
IfCondition.initialize = function () {
  // 创建条件类型选项
  $('#if-condition-type').loadItems([
    {name: 'Boolean', value: 'boolean'},
    {name: 'Number', value: 'number'},
    {name: 'String', value: 'string'},
    {name: 'Object', value: 'object'},
    {name: 'Actor', value: 'actor'},
    {name: 'Element', value: 'element'},
    {name: 'Keyboard', value: 'keyboard'},
    {name: 'Mouse', value: 'mouse'},
    {name: 'List', value: 'list'},
    {name: 'Other', value: 'other'},
  ])

  // 设置条件类型关联元素
  $('#if-condition-type').enableHiddenMode().relate([
    {case: 'boolean', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-boolean-operation'),
      $('#if-condition-boolean-operand-type'),
    ]},
    {case: 'number', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-number-operation'),
      $('#if-condition-number-operand-type'),
    ]},
    {case: 'string', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-string-operation'),
      $('#if-condition-string-operand-type'),
    ]},
    {case: 'object', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-object-operation'),
    ]},
    {case: 'actor', targets: [
      $('#if-condition-common-actor'),
      $('#if-condition-actor-operation'),
    ]},
    {case: 'element', targets: [
      $('#if-condition-common-element'),
      $('#if-condition-element-operation'),
    ]},
    {case: 'keyboard', targets: [
      $('#if-condition-keyboard-keycode'),
      $('#if-condition-keyboard-state'),
    ]},
    {case: 'mouse', targets: [
      $('#if-condition-mouse-button'),
      $('#if-condition-mouse-state'),
    ]},
    {case: 'list', targets: [
      $('#if-condition-common-variable'),
      $('#if-condition-list-operation'),
      $('#if-condition-operand-variable'),
    ]},
    {case: 'other', targets: [
      $('#if-condition-other-key'),
    ]},
  ])

  // 设置类型写入事件，切换变量输入框的过滤器
  $('#if-condition-type').on('write', event => {
    let filter1 = 'all'
    let filter2 = 'all'
    switch (event.value) {
      case 'boolean':
        filter1 = filter2 = 'boolean'
        break
      case 'number':
        filter1 = filter2 = 'number'
        break
      case 'string':
        filter1 = filter2 = 'string'
        break
      case 'object':
        filter1 = filter2 = 'object'
        break
      case 'list':
        filter1 = 'object'
        filter2 = 'all'
        break
    }
    $('#if-condition-common-variable').filter = filter1
    $('#if-condition-operand-variable').filter = filter2
  })

  // 创建布尔值操作选项
  $('#if-condition-boolean-operation').loadItems([
    {name: '==', value: 'equal'},
    {name: '!=', value: 'unequal'},
  ])

  // 创建布尔值类型选项
  $('#if-condition-boolean-operand-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Constant', value: 'constant'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置布尔值类型关联元素
  $('#if-condition-boolean-operand-type').enableHiddenMode().relate([
    {case: 'constant', targets: [
      $('#if-condition-boolean-constant-value'),
    ]},
    {case: 'variable', targets: [
      $('#if-condition-operand-variable'),
    ]},
  ])

  // 创建布尔值常量选项
  $('#if-condition-boolean-constant-value').loadItems([
    {name: 'False', value: false},
    {name: 'True', value: true},
  ])

  // 创建数值操作选项
  $('#if-condition-number-operation').loadItems([
    {name: '==', value: 'equal'},
    {name: '!=', value: 'unequal'},
    {name: '>=', value: 'greater-or-equal'},
    {name: '<=', value: 'less-or-equal'},
    {name: '>', value: 'greater'},
    {name: '<', value: 'less'},
  ])

  // 创建数值类型选项
  $('#if-condition-number-operand-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Constant', value: 'constant'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置数值类型关联元素
  $('#if-condition-number-operand-type').enableHiddenMode().relate([
    {case: 'constant', targets: [
      $('#if-condition-number-constant-value'),
    ]},
    {case: 'variable', targets: [
      $('#if-condition-operand-variable'),
    ]},
  ])

  // 创建字符串操作选项
  $('#if-condition-string-operation').loadItems([
    {name: '==', value: 'equal'},
    {name: '!=', value: 'unequal'},
    {name: 'Include', value: 'include'},
    {name: 'Exclude', value: 'exclude'},
  ])

  // 创建字符串类型选项
  $('#if-condition-string-operand-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Constant', value: 'constant'},
    {name: 'Variable', value: 'variable'},
    {name: 'Enumeration', value: 'enum'},
  ])

  // 设置字符串类型关联元素
  $('#if-condition-string-operand-type').enableHiddenMode().relate([
    {case: 'constant', targets: [
      $('#if-condition-string-constant-value'),
    ]},
    {case: 'variable', targets: [
      $('#if-condition-operand-variable'),
    ]},
    {case: 'enum', targets: [
      $('#if-condition-string-enum-stringId'),
    ]},
  ])

  // 创建对象操作选项
  $('#if-condition-object-operation').loadItems([
    {name: '==', value: 'equal'},
    {name: '!=', value: 'unequal'},
    {name: 'Is Actor', value: 'is-actor'},
    {name: 'Is Skill', value: 'is-skill'},
    {name: 'Is State', value: 'is-state'},
    {name: 'Is Equipment', value: 'is-equipment'},
    {name: 'Is Item', value: 'is-item'},
    {name: 'Is Trigger', value: 'is-trigger'},
    {name: 'Is Light', value: 'is-light'},
    {name: 'Is Element', value: 'is-element'},
  ])

  // 设置对象操作关联元素
  $('#if-condition-object-operation').enableHiddenMode().relate([
    {case: ['equal', 'unequal'], targets: [
      $('#if-condition-object-operand-type'),
    ]},
  ])

  // 创建对象类型选项
  $('#if-condition-object-operand-type').loadItems([
    {name: 'None', value: 'none'},
    {name: 'Actor', value: 'actor'},
    {name: 'Skill', value: 'skill'},
    {name: 'State', value: 'state'},
    {name: 'Equipment', value: 'equipment'},
    {name: 'Item', value: 'item'},
    {name: 'Trigger', value: 'trigger'},
    {name: 'Light', value: 'light'},
    {name: 'Element', value: 'element'},
    {name: 'Variable', value: 'variable'},
  ])

  // 设置类型关联元素
  $('#if-condition-object-operand-type').enableHiddenMode().relate([
    {case: 'actor', targets: [
      $('#if-condition-common-actor'),
    ]},
    {case: 'skill', targets: [
      $('#if-condition-common-skill'),
    ]},
    {case: 'state', targets: [
      $('#if-condition-common-state'),
    ]},
    {case: 'equipment', targets: [
      $('#if-condition-common-equipment'),
    ]},
    {case: 'item', targets: [
      $('#if-condition-common-item'),
    ]},
    {case: 'trigger', targets: [
      $('#if-condition-common-trigger'),
    ]},
    {case: 'light', targets: [
      $('#if-condition-common-light'),
    ]},
    {case: 'element', targets: [
      $('#if-condition-common-element'),
    ]},
    {case: 'variable', targets: [
      $('#if-condition-operand-variable'),
    ]},
  ])

  // 创建角色操作选项
  $('#if-condition-actor-operation').loadItems([
    {name: 'Present and Active', value: 'present-active'},
    {name: 'Present', value: 'present'},
    {name: 'Absent', value: 'absent'},
    {name: 'active', value: 'active'},
    {name: 'inactive', value: 'inactive'},
    {name: 'Has Targets', value: 'has-targets'},
    {name: 'Has No Targets', value: 'has-no-targets'},
    {name: 'In Screen', value: 'in-screen'},
    {name: 'Is Player Actor', value: 'is-player'},
    {name: 'Is Party Member', value: 'is-member'},
    {name: 'Has Skill', value: 'has-skill'},
    {name: 'Has State', value: 'has-state'},
    {name: 'Has Items', value: 'has-items'},
    {name: 'Has Equipments', value: 'has-equipments'},
    {name: 'Equipped', value: 'equipped'},
  ])

  // 设置角色操作关联元素
  $('#if-condition-actor-operation').enableHiddenMode().relate([
    {case: 'has-skill', targets: [
      $('#if-condition-actor-skillId'),
    ]},
    {case: 'has-state', targets: [
      $('#if-condition-actor-stateId'),
    ]},
    {case: 'has-items', targets: [
      $('#if-condition-actor-itemId'),
      $('#if-condition-actor-quantity'),
    ]},
    {case: 'has-equipments', targets: [
      $('#if-condition-actor-equipmentId'),
      $('#if-condition-actor-quantity'),
    ]},
    {case: 'equipped', targets: [
      $('#if-condition-actor-equipmentId'),
    ]},
  ])

  // 创建元素操作选项
  $('#if-condition-element-operation').loadItems([
    {name: 'Present', value: 'present'},
    {name: 'Absent', value: 'absent'},
    {name: 'Visible', value: 'visible'},
    {name: 'Invisible', value: 'invisible'},
    {name: 'Dialog Box - is Paused', value: 'dialogbox-is-paused'},
    {name: 'Dialog Box - is Updating', value: 'dialogbox-is-updating'},
    {name: 'Dialog Box - is Waiting', value: 'dialogbox-is-waiting'},
    {name: 'Dialog Box - is Complete', value: 'dialogbox-is-complete'},
  ])

  // 创建键盘状态选项
  $('#if-condition-keyboard-state').loadItems([
    {name: 'Pressed', value: 'pressed'},
    {name: 'Released', value: 'released'},
  ])

  // 创建鼠标按键选项
  $('#if-condition-mouse-button').loadItems([
    {name: 'Left Button', value: 0},
    {name: 'Middle Button', value: 1},
    {name: 'Right Button', value: 2},
    {name: 'Back Button', value: 3},
    {name: 'Forward Button', value: 4},
  ])

  // 创建鼠标状态选项
  $('#if-condition-mouse-state').loadItems([
    {name: 'Pressed', value: 'pressed'},
    {name: 'Released', value: 'released'},
  ])

  // 创建列表操作选项
  $('#if-condition-list-operation').loadItems([
    {name: 'Include', value: 'include'},
    {name: 'Exclude', value: 'exclude'},
  ])

  // 创建其他条件选项
  $('#if-condition-other-key').loadItems([
    {name: 'Mouse has entered the window', value: 'mouse-entered'},
    {name: 'Mouse has left the window', value: 'mouse-left'},
  ])

  // 侦听事件
  $('#if-condition-confirm').on('click', this.confirm)
}

// 解析布尔值操作
IfCondition.parseBooleanOperation = function ({operation}) {
  switch (operation) {
    case 'equal': return '=='
    case 'unequal': return '!='
  }
}

// 解析布尔值操作数
IfCondition.parseBooleanOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Local.get('common.none')
    case 'constant':
      return operand.value.toString()
    case 'variable':
      return Command.parseVariable(operand.variable)
  }
}

// 解析数值操作
IfCondition.parseNumberOperation = function ({operation}) {
  switch (operation) {
    case 'equal': return '=='
    case 'unequal': return '!='
    case 'greater-or-equal': return '>='
    case 'less-or-equal': return '<='
    case 'greater': return '>'
    case 'less': return '<'
  }
}

// 解析数值操作数
IfCondition.parseNumberOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Local.get('common.none')
    case 'constant':
      return operand.value.toString()
    case 'variable':
      return Command.parseVariable(operand.variable)
  }
}

// 解析字符串操作
IfCondition.parseStringOperation = function ({operation}) {
  switch (operation) {
    case 'equal': return '=='
    case 'unequal': return '!='
    default: return Local.get('command.if.string.' + operation)
  }
}

// 解析字符串操作数
IfCondition.parseStringOperand = function ({operand}) {
  switch (operand.type) {
    case 'none':
      return Local.get('common.none')
    case 'constant':
      return `"${Command.parseMultiLineString(operand.value)}"`
    case 'variable':
      return Command.parseVariable(operand.variable)
    case 'enum':
      return Command.parseEnumStringTag(operand.stringId)
  }
}

// 解析对象操作
IfCondition.parseObjectOperation = function ({operation}) {
  switch (operation) {
    case 'equal': return '=='
    case 'unequal': return '!='
    default: return Local.get('command.if.object.' + operation)
  }
}

// 解析对象操作数
IfCondition.parseObjectOperand = function ({operand}) {
  if (!operand) return ''
  switch (operand.type) {
    case 'none':
      return Local.get('common.none')
    case 'actor':
      return Command.parseActor(operand.actor)
    case 'skill':
      return Command.parseSkill(operand.skill)
    case 'state':
      return Command.parseState(operand.state)
    case 'equipment':
      return Command.parseEquipment(operand.equipment)
    case 'item':
      return Command.parseItem(operand.item)
    case 'trigger':
      return Command.parseTrigger(operand.trigger)
    case 'light':
      return Command.parseLight(operand.light)
    case 'element':
      return Command.parseElement(operand.element)
    case 'variable':
      return Command.parseVariable(operand.variable)
  }
}

// 解析角色操作
IfCondition.parseActorOperation = function ({operation, itemId, equipmentId, skillId, stateId, quantity}) {
  const op = Local.get('command.if.actor.' + operation)
  switch (operation) {
    case 'has-skill':
      return `${op} ${Command.parseFileName(skillId)}`
    case 'has-state':
      return `${op} ${Command.parseFileName(stateId)}`
    case 'has-items': {
      const text = `${op} ${Command.parseFileName(itemId)}`
      return quantity === 1 ? text : `${text} x ${quantity}`
    }
    case 'has-equipments': {
      const text = `${op} ${Command.parseFileName(equipmentId)}`
      return quantity === 1 ? text : `${text} x ${quantity}`
    }
    case 'equipped':
      return `${op} ${Command.parseFileName(equipmentId)}`
    default:
      return op
  }
}

// 解析元素操作
IfCondition.parseElementOperation = function ({operation}) {
  return Local.get('command.if.element.' + operation)
}

// 解析键盘按键状态
IfCondition.parseKeyboardState = function (state) {
  return Local.get('command.if.keyboard.' + state)
}

// 解析鼠标按键
IfCondition.parseMouseButton = function (button) {
  return Local.get('command.if.mouse.button.' + button)
}

// 解析鼠标按键状态
IfCondition.parseMouseState = function (state) {
  return Local.get('command.if.mouse.' + state)
}

// 解析列表操作
IfCondition.parseListOperation = function ({operation}) {
  return Local.get('command.if.list.' + operation)
}

// 解析其他
IfCondition.parseOther = function ({key}) {
  return Local.get('command.if.other.' + key)
}

// 解析条件
IfCondition.parse = function (condition) {
  switch (condition.type) {
    case 'boolean': {
      const variable = Command.parseVariable(condition.variable)
      const operator = this.parseBooleanOperation(condition)
      const value = this.parseBooleanOperand(condition)
      return `${variable} ${operator} ${value}`
    }
    case 'number': {
      const variable = Command.parseVariable(condition.variable)
      const operator = this.parseNumberOperation(condition)
      const value = this.parseNumberOperand(condition)
      return `${variable} ${operator} ${value}`
    }
    case 'string': {
      const variable = Command.parseVariable(condition.variable)
      const operator = this.parseStringOperation(condition)
      const value = this.parseStringOperand(condition)
      return `${variable} ${operator} ${value}`
    }
    case 'object': {
      const variable = Command.parseVariable(condition.variable)
      const operator = this.parseObjectOperation(condition)
      const value = this.parseObjectOperand(condition)
      return `${variable} ${operator} ${value}`
    }
    case 'actor': {
      const actor = Command.parseActor(condition.actor)
      const operation = this.parseActorOperation(condition)
      return `${actor} ${operation}`
    }
    case 'element': {
      const element = Command.parseElement(condition.element)
      const operation = this.parseElementOperation(condition)
      return `${element} ${operation}`
    }
    case 'keyboard': {
      const key = condition.keycode
      const keyboard = Local.get('command.if.keyboard')
      const state = this.parseKeyboardState(condition.state)
      return `${keyboard}["${key}"] ${state}`
    }
    case 'mouse': {
      const button = this.parseMouseButton(condition.button)
      const mouse = Local.get('command.if.mouse')
      const state = this.parseMouseState(condition.state)
      return `${mouse}[${button}] ${state}`
    }
    case 'list': {
      const list = Command.parseVariable(condition.list)
      const operation = this.parseListOperation(condition)
      const target = Command.parseVariable(condition.target)
      return `${list} ${operation} ${target}`
    }
    case 'other':
      return this.parseOther(condition)
  }
}

// 打开数据
IfCondition.open = function (condition = {
  type: 'number',
  variable: {type: 'local', key: ''},
  operation: 'equal',
  operand: {type: 'constant', value: 0},
}) {
  Window.open('if-condition')
  const write = getElementWriter('if-condition')
  const defaultVariable = {type: 'local', key: ''}
  let commonVariable = defaultVariable
  let booleanOperation = 'equal'
  let booleanOperandType = 'constant'
  let booleanConstantValue = true
  let numberOperation = 'equal'
  let numberOperandType = 'constant'
  let numberConstantValue = 0
  let stringOperation = 'equal'
  let stringOperandType = 'constant'
  let stringConstantValue = ''
  let stringEnumStringId = ''
  let objectOperation = 'equal'
  let objectOperandType = 'none'
  let operandVariable = defaultVariable
  let commonActor = {type: 'trigger'}
  let commonSkill = {type: 'trigger'}
  let commonState = {type: 'trigger'}
  let commonEquipment = {type: 'trigger'}
  let commonItem = {type: 'trigger'}
  let commonTrigger = {type: 'trigger'}
  let commonLight = {type: 'trigger'}
  let commonElement = {type: 'trigger'}
  let actorOperation = 'present-active'
  let actorSkillId = ''
  let actorStateId = ''
  let actorItemId = ''
  let actorEquipmentId = ''
  let actorQuantity = 1
  let elementOperation = 'present'
  let keyboardKeycode = ''
  let keyboardState = 'pressed'
  let mouseButton = 0
  let mouseState = 'pressed'
  let listOperation = 'include'
  let otherKey = 'mouse-entered'
  switch (condition.type) {
    case 'boolean':
      commonVariable = condition.variable
      booleanOperation = condition.operation
      booleanOperandType = condition.operand.type
      booleanConstantValue = condition.operand.value ?? booleanConstantValue
      operandVariable = condition.operand.variable ?? operandVariable
      break
    case 'number':
      commonVariable = condition.variable
      numberOperation = condition.operation
      numberOperandType = condition.operand.type
      numberConstantValue = condition.operand.value ?? numberConstantValue
      operandVariable = condition.operand.variable ?? operandVariable
      break
    case 'string':
      commonVariable = condition.variable
      stringOperation = condition.operation
      stringOperandType = condition.operand.type
      stringConstantValue = condition.operand.value ?? stringConstantValue
      stringEnumStringId = condition.operand.stringId ?? stringEnumStringId
      operandVariable = condition.operand.variable ?? operandVariable
      break
    case 'object':
      commonVariable = condition.variable
      objectOperation = condition.operation
      objectOperandType = condition.operand?.type ?? objectOperandType
      operandVariable = condition.operand?.variable ?? operandVariable
      commonActor = condition.operand?.actor ?? commonActor
      commonSkill = condition.operand?.skill ?? commonSkill
      commonState = condition.operand?.state ?? commonState
      commonEquipment = condition.operand?.equipment ?? commonEquipment
      commonItem = condition.operand?.item ?? commonItem
      commonTrigger = condition.operand?.trigger ?? commonTrigger
      commonLight = condition.operand?.light ?? commonLight
      commonElement = condition.operand?.element ?? commonElement
      break
    case 'actor':
      commonActor = condition.actor
      actorOperation = condition.operation
      actorSkillId = condition.skillId ?? actorSkillId
      actorStateId = condition.stateId ?? actorStateId
      actorItemId = condition.itemId ?? actorItemId
      actorEquipmentId = condition.equipmentId ?? actorEquipmentId
      actorQuantity = condition.quantity ?? actorQuantity
      break
    case 'element':
      commonElement = condition.element
      elementOperation = condition.operation
      break
    case 'keyboard':
      keyboardKeycode = condition.keycode
      keyboardState = condition.state
      break
    case 'mouse':
      mouseButton = condition.button
      mouseState = condition.state
      break
    case 'list':
      commonVariable = condition.list
      listOperation = condition.operation
      operandVariable = condition.target
      break
    case 'other':
      otherKey = condition.key
      break
  }
  write('type', condition.type)
  write('common-variable', commonVariable)
  write('boolean-operation', booleanOperation)
  write('boolean-operand-type', booleanOperandType)
  write('boolean-constant-value', booleanConstantValue)
  write('number-operation', numberOperation)
  write('number-operand-type', numberOperandType)
  write('number-constant-value', numberConstantValue)
  write('string-operation', stringOperation)
  write('string-operand-type', stringOperandType)
  write('string-constant-value', stringConstantValue)
  write('string-enum-stringId', stringEnumStringId)
  write('object-operation', objectOperation)
  write('object-operand-type', objectOperandType)
  write('list-operation', listOperation)
  write('operand-variable', operandVariable)
  write('common-actor', commonActor)
  write('common-skill', commonSkill)
  write('common-state', commonState)
  write('common-equipment', commonEquipment)
  write('common-item', commonItem)
  write('common-trigger', commonTrigger)
  write('common-light', commonLight)
  write('common-element', commonElement)
  write('actor-operation', actorOperation)
  write('actor-skillId', actorSkillId)
  write('actor-stateId', actorStateId)
  write('actor-itemId', actorItemId)
  write('actor-equipmentId', actorEquipmentId)
  write('actor-quantity', actorQuantity)
  write('element-operation', elementOperation)
  write('keyboard-keycode', keyboardKeycode)
  write('keyboard-state', keyboardState)
  write('mouse-button', mouseButton)
  write('mouse-state', mouseState)
  write('other-key', otherKey)
  $('#if-condition-type').getFocus()
}

// 保存数据
IfCondition.save = function () {
  const read = getElementReader('if-condition')
  const type = read('type')
  let condition
  switch (type) {
    case 'boolean': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('boolean-operation')
      let operand
      switch (read('boolean-operand-type')) {
        case 'none':
          operand = {
            type: 'none',
          }
          break
        case 'constant':
          operand = {
            type: 'constant',
            value: read('boolean-constant-value'),
          }
          break
        case 'variable':
          operand = {
            type: 'variable',
            variable: read('operand-variable'),
          }
          if (VariableGetter.isNone(operand.variable)) {
            return $('#if-condition-operand-variable').getFocus()
          }
          break
      }
      condition = {type, variable, operation, operand}
      break
    }
    case 'number': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('number-operation')
      let operand
      switch (read('number-operand-type')) {
        case 'none':
          operand = {
            type: 'none',
          }
          break
        case 'constant':
          operand = {
            type: 'constant',
            value: read('number-constant-value'),
          }
          break
        case 'variable':
          operand = {
            type: 'variable',
            variable: read('operand-variable'),
          }
          if (VariableGetter.isNone(operand.variable)) {
            return $('#if-condition-operand-variable').getFocus()
          }
          break
      }
      condition = {type, variable, operation, operand}
      break
    }
    case 'string': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('string-operation')
      let operand
      switch (read('string-operand-type')) {
        case 'none':
          operand = {
            type: 'none',
          }
          break
        case 'constant':
          operand = {
            type: 'constant',
            value: read('string-constant-value'),
          }
          break
        case 'variable':
          operand = {
            type: 'variable',
            variable: read('operand-variable'),
          }
          if (VariableGetter.isNone(operand.variable)) {
            return $('#if-condition-operand-variable').getFocus()
          }
          break
        case 'enum':
          operand = {
            type: 'enum',
            stringId: read('string-enum-stringId'),
          }
          if (operand.stringId === '') {
            return $('#if-condition-string-enum-stringId').getFocus()
          }
          break
      }
      condition = {type, variable, operation, operand}
      break
    }
    case 'object': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('object-operation')
      switch (operation) {
        case 'equal':
        case 'unequal': {
          let operand
          switch (read('object-operand-type')) {
            case 'none':
              operand = {
                type: 'none',
              }
              break
            case 'actor':
              operand = {
                type: 'actor',
                actor: read('common-actor'),
              }
              break
            case 'skill':
              operand = {
                type: 'skill',
                skill: read('common-skill'),
              }
              break
            case 'state':
              operand = {
                type: 'state',
                state: read('common-state'),
              }
              break
            case 'equipment':
              operand = {
                type: 'equipment',
                equipment: read('common-equipment'),
              }
              break
            case 'item':
              operand = {
                type: 'item',
                item: read('common-item'),
              }
              break
            case 'trigger':
              operand = {
                type: 'trigger',
                trigger: read('common-trigger'),
              }
              break
            case 'light':
              operand = {
                type: 'light',
                light: read('common-light'),
              }
              break
            case 'element':
              operand = {
                type: 'element',
                element: read('common-element'),
              }
              break
            case 'variable':
              operand = {
                type: 'variable',
                variable: read('operand-variable'),
              }
              if (VariableGetter.isNone(operand.variable)) {
                return $('#if-condition-operand-variable').getFocus()
              }
              break
          }
          condition = {type, variable, operation, operand}
          break
        }
        default:
          condition = {type, variable, operation}
          break
      }
      break
    }
    case 'actor': {
      const actor = read('common-actor')
      const operation = read('actor-operation')
      switch (operation) {
        case 'has-skill': {
          const skillId = read('actor-skillId')
          if (skillId === '') {
            return $('#if-condition-actor-skillId').getFocus()
          }
          condition = {type, actor, operation, skillId}
          break
        }
        case 'has-state': {
          const stateId = read('actor-stateId')
          if (stateId === '') {
            return $('#if-condition-actor-stateId').getFocus()
          }
          condition = {type, actor, operation, stateId}
          break
        }
        case 'has-items': {
          const itemId = read('actor-itemId')
          if (itemId === '') {
            return $('#if-condition-actor-itemId').getFocus()
          }
          const quantity = read('actor-quantity')
          condition = {type, actor, operation, itemId, quantity}
          break
        }
        case 'has-equipments': {
          const equipmentId = read('actor-equipmentId')
          if (equipmentId === '') {
            return $('#if-condition-actor-equipmentId').getFocus()
          }
          const quantity = read('actor-quantity')
          condition = {type, actor, operation, equipmentId, quantity}
          break
        }
        case 'equipped': {
          const equipmentId = read('actor-equipmentId')
          if (equipmentId === '') {
            return $('#if-condition-actor-equipmentId').getFocus()
          }
          condition = {type, actor, operation, equipmentId}
          break
        }
        default:
          condition = {type, actor, operation}
          break
      }
      break
    }
    case 'element': {
      const element = read('common-element')
      const operation = read('element-operation')
      condition = {type, element, operation}
      break
    }
    case 'keyboard': {
      const keycode = read('keyboard-keycode')
      const state = read('keyboard-state')
      if (keycode === '') {
        return $('#if-condition-keyboard-keycode').getFocus()
      }
      condition = {type, keycode, state}
      break
    }
    case 'mouse': {
      const button = read('mouse-button')
      const state = read('mouse-state')
      condition = {type, button, state}
      break
    }
    case 'list': {
      const list = read('common-variable')
      if (VariableGetter.isNone(list)) {
        return $('#if-condition-common-variable').getFocus()
      }
      const operation = read('list-operation')
      const target = read('operand-variable')
      if (VariableGetter.isNone(target)) {
        return $('#if-condition-operand-variable').getFocus()
      }
      condition = {type, list, operation, target}
      break
    }
    case 'other': {
      const key = read('other-key')
      condition = {type, key}
      break
    }
  }
  Window.close('if-condition')
  return condition
}

// 确定按钮 - 鼠标点击事件
IfCondition.confirm = function (event) {
  return IfCondition.target.save()
}

// ******************************** 条件分支 - 条件窗口导出 ********************************

export { IfCondition }
