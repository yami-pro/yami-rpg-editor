'use strict'

// ******************************** 变量访问器窗口 ********************************

const VariableGetter = {
  // properties
  keyBox: $('#variableGetter-preset-key'),
  target: null,
  filter: null,
  types: null,
  // methods
  initialize: null,
  open: null,
  isNone: null,
  loadPresetKeys: null,
  // events
  typeWrite: null,
  typeInput: null,
  confirm: null,
}

// 初始化
VariableGetter.initialize = function () {
  // 设置变量类型集合
  const types = {
    'local': {name: 'Local', value: 'local'},
    'global': {name: 'Global', value: 'global'},
    'actor': {name: 'Actor Attribute', value: 'actor'},
    'skill': {name: 'Skill Attribute', value: 'skill'},
    'state': {name: 'State Attribute', value: 'state'},
    'equipment': {name: 'Equipment Attribute', value: 'equipment'},
    'item': {name: 'Item Attribute', value: 'item'},
    'element': {name: 'Element Attribute', value: 'element'},
  }
  const allTypes = Object.values(types)
  const writableTypes = allTypes.filter(
    item => item.value !== 'item'
  )
  const deletableTypes = writableTypes.filter(
    item => item.value !== 'global'
  )
  const objectTypes = [
    types['local'],
    types['global'],
  ]
  this.types = {
    all: allTypes,
    object: objectTypes,
    writable: writableTypes,
    deletable: deletableTypes,
  }

  // 设置变量类型关联元素
  const actor = $('#variableGetter-actor')
  const skill = $('#variableGetter-skill')
  const state = $('#variableGetter-state')
  const equipment = $('#variableGetter-equipment')
  const item = $('#variableGetter-item')
  const element = $('#variableGetter-element')
  const commonKey = $('#variableGetter-common-key')
  const presetKey = $('#variableGetter-preset-key')
  const globalKey = $('#variableGetter-global-key')
  $('#variableGetter-type').enableHiddenMode().relate([
    {case: 'local', targets: [commonKey]},
    {case: 'global', targets: [globalKey]},
    {case: 'actor', targets: [actor, presetKey]},
    {case: 'skill', targets: [skill, presetKey]},
    {case: 'state', targets: [state, presetKey]},
    {case: 'equipment', targets: [equipment, presetKey]},
    {case: 'item', targets: [item, presetKey]},
    {case: 'element', targets: [element, presetKey]},
  ])

  // 变量类型 - 重写设置选项名字方法
  $('#variableGetter-type').setItemNames = function (options) {
    const backup = this.dataItems
    this.dataItems = allTypes
    SelectBox.prototype.setItemNames.call(this, options)
    this.dataItems = backup
  }

  // 侦听事件
  $('#variableGetter-type').on('write', this.typeWrite)
  $('#variableGetter-type').on('input', this.typeInput)
  $('#variableGetter-confirm').on('click', this.confirm)
}

// 打开窗口
VariableGetter.open = function (target) {
  // 创建变量类型选项
  const types = this.types
  const filter = target.filter
  this.filter = filter
  switch (filter) {
    case 'all':
    case 'boolean':
    case 'number':
    case 'string':
      $('#variableGetter-type').loadItems(types.all)
      $('#variableGetter-global-key').setAttribute('filter', filter)
      break
    case 'object':
      $('#variableGetter-type').loadItems(types.object)
      $('#variableGetter-global-key').setAttribute('filter', filter)
      break
    case 'writable-boolean':
    case 'writable-number':
    case 'writable-string':
      $('#variableGetter-type').loadItems(types.writable)
      $('#variableGetter-global-key').setAttribute('filter', filter.slice(9))
      break
    case 'deletable':
      $('#variableGetter-type').loadItems(types.deletable)
      break
  }

  this.target = target
  Window.open('variableGetter')
  const variable = target.dataValue
  const type = variable.type
  const key = variable.key
  let commonKey = ''
  let presetKey = ''
  let globalKey = ''
  let actor = {type: 'trigger'}
  let skill = {type: 'trigger'}
  let state = {type: 'trigger'}
  let equipment = {type: 'trigger'}
  let item = {type: 'trigger'}
  let element = {type: 'trigger'}
  switch (type.replace('[]', '')) {
    case 'actor':
      this.loadPresetKeys(type)
      actor = variable.actor
      presetKey = key
      break
    case 'skill':
      this.loadPresetKeys(type)
      skill = variable.skill
      presetKey = key
      break
    case 'state':
      this.loadPresetKeys(type)
      state = variable.state
      presetKey = key
      break
    case 'equipment':
      this.loadPresetKeys(type)
      equipment = variable.equipment
      presetKey = key
      break
    case 'item':
      this.loadPresetKeys(type)
      item = variable.item
      presetKey = key
      break
    case 'element':
      this.loadPresetKeys(type)
      element = variable.element
      presetKey = key
      break
    case 'global':
      globalKey = key
      break
    default:
      commonKey = key
      break
  }
  const write = getElementWriter('variableGetter')
  this.keyBox.loadItems(Attribute.getAttributeItems('none'))
  write('type', type)
  write('actor', actor)
  write('skill', skill)
  write('state', state)
  write('equipment', equipment)
  write('item', item)
  write('element', element)
  write('common-key', commonKey)
  write('preset-key', presetKey)
  write('global-key', globalKey)
  $('#variableGetter-type').getFocus()
}

// 判断变量是否为空
VariableGetter.isNone = function (variable) {
  return variable.key === ''
}

// 加载预设属性键
VariableGetter.loadPresetKeys = function (group) {
  let type = undefined
  switch (this.filter) {
    case 'boolean':
    case 'number':
    case 'string':
      type = this.filter
      break
    case 'writable-boolean':
    case 'writable-number':
    case 'writable-string':
      type = this.filter.split('-')[1]
      break
  }
  this.keyBox.loadItems(Attribute.getAttributeItems(group, type))
}

// 类型写入事件
VariableGetter.typeWrite = function (event) {
  const type = event.value
  switch (type) {
    case 'actor':
    case 'skill':
    case 'state':
    case 'item':
    case 'equipment':
    case 'element':
      VariableGetter.loadPresetKeys(type)
      break
  }
}

// 类型输入事件
VariableGetter.typeInput = function (event) {
  const type = event.value
  switch (type) {
    case 'actor':
    case 'skill':
    case 'state':
    case 'item':
    case 'equipment':
    case 'element': {
      // 重新写入属性键
      const {keyBox} = VariableGetter
      const attrName = keyBox.textContent
      keyBox.write(keyBox.read())
      if (keyBox.invalid) {
        // 如果是无效数据，则写入同名属性或第一项作为默认值
        let defValue = keyBox.dataItems[0]?.value
        for (const item of keyBox.dataItems) {
          if (item.name === attrName) {
            defValue = item.value
            break
          }
        }
        if (defValue !== undefined) {
          keyBox.write(defValue)
        }
      }
      break
    }
  }
}

// 确定按钮 - 鼠标点击事件
VariableGetter.confirm = function (event) {
  const read = getElementReader('variableGetter')
  const type = read('type')
  let getter
  let key
  switch (type) {
    case 'global': {
      key = read('global-key')
      const variable = Data.variables.map[key]
      const filter = this.target.filter
      switch (filter) {
        case 'boolean':
        case 'number':
        case 'string':
          if (typeof variable?.value !== filter) {
            return $('#variableGetter-global-key').getFocus()
          }
          break
      }
      break
    }
    case 'actor':
    case 'skill':
    case 'state':
    case 'item':
    case 'equipment':
    case 'element':
      key = read('preset-key')
      if (key === '') {
        return $('#variableGetter-preset-key').getFocus()
      }
      break
    default:
      key = read('common-key').trim()
      if (key === '') {
        return $('#variableGetter-common-key').getFocus()
      }
      break
  }
  switch (type.replace('[]', '')) {
    case 'local':
    case 'global':
      getter = {type, key}
      break
    case 'actor': {
      const actor = read('actor')
      getter = {type, actor, key}
      break
    }
    case 'skill': {
      const skill = read('skill')
      getter = {type, skill, key}
      break
    }
    case 'state': {
      const state = read('state')
      getter = {type, state, key}
      break
    }
    case 'equipment': {
      const equipment = read('equipment')
      getter = {type, equipment, key}
      break
    }
    case 'item': {
      const item = read('item')
      getter = {type, item, key}
      break
    }
    case 'element': {
      const element = read('element')
      getter = {type, element, key}
      break
    }
  }
  this.target.input(getter)
  Window.close('variableGetter')
}.bind(VariableGetter)

export { VariableGetter }
