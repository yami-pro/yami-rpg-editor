'use strict'

// ******************************** 设置数值 - 操作数窗口 ********************************

const NumberOperand = {
  // properties
  target: null,
  // methods
  initialize: null,
  parseMathMethod: null,
  parseStringMethod: null,
  parseObjectProperty: null,
  parseElementProperty: null,
  parseOther: null,
  parseOperand: null,
  parse: null,
  open: null,
  save: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
NumberOperand.initialize = function () {
  // 创建头部操作选项
  $('#setNumber-operation').loadItems([
    {name: 'Set', value: 'set'},
    {name: 'Add', value: 'add'},
    {name: 'Sub', value: 'sub'},
    {name: 'Mul', value: 'mul'},
    {name: 'Div', value: 'div'},
    {name: 'Mod', value: 'mod'},
  ])

  // 创建操作选项
  $('#setNumber-operand-operation').loadItems([
    {name: 'Add', value: 'add'},
    {name: 'Sub', value: 'sub'},
    {name: 'Mul', value: 'mul'},
    {name: 'Div', value: 'div'},
    {name: 'Mod', value: 'mod'},
    {name: '(Add)', value: 'add()'},
    {name: '(Sub)', value: 'sub()'},
    {name: '(Mul)', value: 'mul()'},
    {name: '(Div)', value: 'div()'},
    {name: '(Mod)', value: 'mod()'},
  ])

  // 创建类型选项
  $('#setNumber-operand-type').loadItems([
    {name: 'Constant', value: 'constant'},
    {name: 'Variable', value: 'variable'},
    {name: 'Math', value: 'math'},
    {name: 'String', value: 'string'},
    {name: 'Object', value: 'object'},
    {name: 'Element', value: 'element'},
    {name: 'List', value: 'list'},
    {name: 'Parameter', value: 'parameter'},
    {name: 'Other', value: 'other'},
  ])

  // 设置类型关联元素
  $('#setNumber-operand-type').enableHiddenMode().relate([
    {case: 'constant', targets: [
      $('#setNumber-operand-constant-value'),
    ]},
    {case: 'variable', targets: [
      $('#setNumber-operand-common-variable'),
    ]},
    {case: 'math', targets: [
      $('#setNumber-operand-math-method'),
    ]},
    {case: 'string', targets: [
      $('#setNumber-operand-string-method'),
      $('#setNumber-operand-common-variable'),
    ]},
    {case: 'object', targets: [
      $('#setNumber-operand-object-property'),
    ]},
    {case: 'element', targets: [
      $('#setNumber-operand-element-property'),
      $('#setNumber-operand-element-element'),
    ]},
    {case: 'list', targets: [
      $('#setNumber-operand-common-variable'),
      $('#setNumber-operand-list-index'),
    ]},
    {case: 'parameter', targets: [
      $('#setNumber-operand-common-variable'),
      $('#setNumber-operand-parameter-paramName'),
    ]},
    {case: 'other', targets: [
      $('#setNumber-operand-other-data'),
    ]},
  ])

  // 创建数学方法选项
  $('#setNumber-operand-math-method').loadItems([
    {name: 'Round', value: 'round'},
    {name: 'Floor', value: 'floor'},
    {name: 'Ceil', value: 'ceil'},
    {name: 'Sqrt', value: 'sqrt'},
    {name: 'Abs', value: 'abs'},
    {name: 'Cos(radians)', value: 'cos'},
    {name: 'Sin(radians)', value: 'sin'},
    {name: 'Tan(radians)', value: 'tan'},
    {name: 'Random[0,1)', value: 'random'},
    {name: 'Random Int', value: 'random-int'},
    {name: 'Distance', value: 'distance'},
    {name: 'Horizontal Distance', value: 'distance-x'},
    {name: 'Vertical Distance', value: 'distance-y'},
    {name: 'Relative Angle', value: 'relative-angle'},
  ])

  // 设置数学方法关联元素
  $('#setNumber-operand-math-method').enableHiddenMode().relate([
    {case: 'round', targets: [
      $('#setNumber-operand-common-variable'),
      $('#setNumber-operand-math-decimals'),
    ]},
    {case: ['floor', 'ceil', 'sqrt', 'abs', 'cos', 'sin', 'tan'], targets: [
      $('#setNumber-operand-common-variable'),
    ]},
    {case: 'random-int', targets: [
      $('#setNumber-operand-math-min'),
      $('#setNumber-operand-math-max'),
    ]},
    {case: ['distance', 'distance-x', 'distance-y', 'relative-angle'], targets: [
      $('#setNumber-operand-math-startPosition'),
      $('#setNumber-operand-math-endPosition'),
    ]},
  ])

  // 创建字符串方法选项
  $('#setNumber-operand-string-method').loadItems([
    {name: 'Get Length', value: 'length'},
    {name: 'Parse Number', value: 'parse'},
    {name: 'Get Index of Substring', value: 'search'},
  ])

  // 设置字符串方法关联元素
  $('#setNumber-operand-string-method').enableHiddenMode().relate([
    {case: ['length', 'parse'], targets: [
      $('#setNumber-operand-common-variable'),
    ]},
    {case: 'search', targets: [
      $('#setNumber-operand-common-variable'),
      $('#setNumber-operand-string-search'),
    ]},
  ])

  // 创建对象属性选项
  $('#setNumber-operand-object-property').loadItems([
    {name: 'Actor - X', value: 'actor-x'},
    {name: 'Actor - Y', value: 'actor-y'},
    {name: 'Actor - Screen X', value: 'actor-screen-x'},
    {name: 'Actor - Screen Y', value: 'actor-screen-y'},
    {name: 'Actor - Angle', value: 'actor-angle'},
    {name: 'Actor - Direction Angle', value: 'actor-direction'},
    {name: 'Actor - Movement Speed', value: 'actor-movement-speed'},
    {name: 'Actor - Collision Size', value: 'actor-collision-size'},
    {name: 'Actor - Collision Weight', value: 'actor-collision-weight'},
    {name: 'Actor - Item Quantity', value: 'actor-bag-item-quantity'},
    {name: 'Actor - Equipment Quantity', value: 'actor-bag-equipment-quantity'},
    {name: 'Actor - Bag Money', value: 'actor-bag-money'},
    {name: 'Actor - Bag Used Space', value: 'actor-bag-used-space'},
    {name: 'Actor - Bag Version', value: 'actor-bag-version'},
    {name: 'Actor - Skill Version', value: 'actor-skill-version'},
    {name: 'Actor - State Version', value: 'actor-state-version'},
    {name: 'Actor - Equipment Version', value: 'actor-equipment-version'},
    {name: 'Actor - Anim Current Time', value: 'actor-animation-current-time'},
    {name: 'Actor - Anim Duration', value: 'actor-animation-duration'},
    {name: 'Actor - Anim Progress', value: 'actor-animation-progress'},
    {name: 'Actor - Cooldown Time', value: 'actor-cooldown-time'},
    {name: 'Actor - Cooldown Duration', value: 'actor-cooldown-duration'},
    {name: 'Actor - Cooldown Progress', value: 'actor-cooldown-progress'},
    {name: 'Skill - Cooldown Time', value: 'skill-cooldown-time'},
    {name: 'Skill - Cooldown Duration', value: 'skill-cooldown-duration'},
    {name: 'Skill - Cooldown Progress', value: 'skill-cooldown-progress'},
    {name: 'State - Current Time', value: 'state-current-time'},
    {name: 'State - Duration', value: 'state-duration'},
    {name: 'State - Progress', value: 'state-progress'},
    {name: 'Equipment - Index', value: 'equipment-index'},
    {name: 'Item - Index', value: 'item-index'},
    {name: 'Item - Quantity', value: 'item-quantity'},
    {name: 'Trigger - Speed', value: 'trigger-speed'},
    {name: 'Trigger - Angle', value: 'trigger-angle'},
    {name: 'List - Length', value: 'list-length'},
  ])

  // 设置对象属性关联元素
  $('#setNumber-operand-object-property').enableHiddenMode().relate([
    {case: [
      'actor-x',
      'actor-y',
      'actor-screen-x',
      'actor-screen-y',
      'actor-angle',
      'actor-direction',
      'actor-movement-speed',
      'actor-collision-size',
      'actor-collision-weight',
      'actor-bag-money',
      'actor-bag-used-space',
      'actor-bag-version',
      'actor-skill-version',
      'actor-state-version',
      'actor-equipment-version',
      'actor-animation-current-time',
      'actor-animation-duration',
      'actor-animation-progress'], targets: [
      $('#setNumber-operand-common-actor'),
    ]},
    {case: 'actor-bag-item-quantity', targets: [
      $('#setNumber-operand-common-actor'),
      $('#setNumber-operand-object-itemId'),
    ]},
    {case: 'actor-bag-equipment-quantity', targets: [
      $('#setNumber-operand-common-actor'),
      $('#setNumber-operand-object-equipmentId'),
    ]},
    {case: ['actor-cooldown-time', 'actor-cooldown-duration', 'actor-cooldown-progress'], targets: [
      $('#setNumber-operand-common-actor'),
      $('#setNumber-operand-cooldown-key'),
    ]},
    {case: ['skill-cooldown-time', 'skill-cooldown-duration', 'skill-cooldown-progress'], targets: [
      $('#setNumber-operand-common-skill'),
    ]},
    {case: ['state-current-time', 'state-duration', 'state-progress'], targets: [
      $('#setNumber-operand-common-state'),
    ]},
    {case: 'equipment-index', targets: [
      $('#setNumber-operand-common-equipment'),
    ]},
    {case: ['item-index', 'item-quantity'], targets: [
      $('#setNumber-operand-common-item'),
    ]},
    {case: ['trigger-speed', 'trigger-angle'], targets: [
      $('#setNumber-operand-common-trigger'),
    ]},
    {case: 'list-length', targets: [
      $('#setNumber-operand-common-variable'),
    ]},
  ])

  // 创建元素属性选项
  $('#setNumber-operand-element-property').loadItems([
    {name: 'Element - Number of Children', value: 'element-children-count'},
    {name: 'Transform - Anchor X', value: 'transform-anchorX'},
    {name: 'Transform - Anchor Y', value: 'transform-anchorY'},
    {name: 'Transform - X', value: 'transform-x'},
    {name: 'Transform - X2', value: 'transform-x2'},
    {name: 'Transform - Y', value: 'transform-y'},
    {name: 'Transform - Y2', value: 'transform-y2'},
    {name: 'Transform - Width', value: 'transform-width'},
    {name: 'Transform - Width2', value: 'transform-width2'},
    {name: 'Transform - Height', value: 'transform-height'},
    {name: 'Transform - Height2', value: 'transform-height2'},
    {name: 'Transform - Rotation', value: 'transform-rotation'},
    {name: 'Transform - Scale X', value: 'transform-scaleX'},
    {name: 'Transform - Scale Y', value: 'transform-scaleY'},
    {name: 'Transform - Skew X', value: 'transform-skewX'},
    {name: 'Transform - Skew Y', value: 'transform-skewY'},
    {name: 'Transform - Opacity', value: 'transform-opacity'},
    {name: 'Text - Text Width', value: 'text-textWidth'},
    {name: 'Text - Text Height', value: 'text-textHeight'},
    {name: 'Text Box - Number', value: 'textBox-number'},
    {name: 'Dialog Box - Print End X', value: 'dialogBox-printEndX'},
    {name: 'Dialog Box - Print End Y', value: 'dialogBox-printEndY'},
  ])

  // 创建其他数据选项
  $('#setNumber-operand-other-data').loadItems([
    {name: 'Event Trigger Button', value: 'trigger-button'},
    {name: 'Event Trigger Wheel Delta X', value: 'trigger-wheel-x'},
    {name: 'Event Trigger Wheel Delta Y', value: 'trigger-wheel-y'},
    {name: 'Mouse Screen X', value: 'mouse-screen-x'},
    {name: 'Mouse Screen Y', value: 'mouse-screen-y'},
    {name: 'Mouse Scene X', value: 'mouse-scene-x'},
    {name: 'Mouse Scene Y', value: 'mouse-scene-y'},
    {name: 'Start Position X', value: 'start-position-x'},
    {name: 'Start Position Y', value: 'start-position-y'},
    {name: 'Camera X', value: 'camera-x'},
    {name: 'Camera Y', value: 'camera-y'},
    {name: 'Camera Zoom', value: 'camera-zoom'},
    {name: 'Screen Width', value: 'screen-width'},
    {name: 'Screen Height', value: 'screen-height'},
    {name: 'Scene Width', value: 'scene-width'},
    {name: 'Scene Height', value: 'scene-height'},
    {name: 'Play Time', value: 'play-time'},
    {name: 'Elapsed Time', value: 'elapsed-time'},
    {name: 'Delta Time', value: 'delta-time'},
    {name: 'Raw Delta Time', value: 'raw-delta-time'},
    {name: 'Get Timestamp', value: 'timestamp'},
  ])

  // 侦听事件
  $('#setNumber-operand').on('closed', this.windowClosed)
  $('#setNumber-operand-confirm').on('click', this.confirm)
}

// 解析数学方法
NumberOperand.parseMathMethod = function (operand) {
  const method = operand.method
  const label = Local.get('command.setNumber.math.' + method)
  switch (method) {
    case 'round': {
      const varName = Command.parseVariable(operand.variable)
      const decimals = operand.decimals
      return `${label}(${varName}${decimals ? `, ${decimals}` : ''})`
    }
    case 'floor':
    case 'ceil':
    case 'sqrt':
    case 'abs':
    case 'cos':
    case 'sin':
    case 'tan': {
      const varName = Command.parseVariable(operand.variable)
      return `${label}(${varName})`
    }
    case 'random':
      return `${label}[0,1)`
    case 'random-int': {
      const min = Command.parseVariableNumber(operand.min)
      const max = Command.parseVariableNumber(operand.max)
      return `${label}[${min},${max}]`
    }
    case 'distance':
    case 'distance-x':
    case 'distance-y':
    case 'relative-angle': {
      const start = Command.parsePosition(operand.start)
      const end = Command.parsePosition(operand.end)
      return `${label}(${start}, ${end})`
    }
  }
}

// 解析字符串方法
NumberOperand.parseStringMethod = function (operand) {
  const method = operand.method
  const methodName = Local.get('command.setNumber.string.' + method)
  switch (method) {
    case 'length':
    case 'parse': {
      const variable = operand.variable
      const varName = Command.parseVariable(variable)
      return `${methodName}(${varName})`
    }
    case 'search': {
      const {variable, search} = operand
      const varName = Command.parseVariable(variable)
      const searchName = Command.parseVariableString(search)
      return `${methodName}(${varName}, ${searchName})`
    }
  }
}

// 解析对象属性
NumberOperand.parseObjectProperty = function (operand) {
  const property = Local.get('command.setNumber.object.' + operand.property)
  switch (operand.property) {
    case 'actor-x':
    case 'actor-y':
    case 'actor-screen-x':
    case 'actor-screen-y':
    case 'actor-angle':
    case 'actor-direction':
    case 'actor-movement-speed':
    case 'actor-collision-size':
    case 'actor-collision-weight':
    case 'actor-bag-money':
    case 'actor-bag-used-space':
    case 'actor-bag-version':
    case 'actor-skill-version':
    case 'actor-state-version':
    case 'actor-equipment-version':
    case 'actor-animation-current-time':
    case 'actor-animation-duration':
    case 'actor-animation-progress':
      return `${Command.parseActor(operand.actor)} -> ${property}`
    case 'actor-bag-item-quantity':
      return `${Command.parseActor(operand.actor)} -> ${Command.parseFileName(operand.itemId)}.${property}`
    case 'actor-bag-equipment-quantity':
      return `${Command.parseActor(operand.actor)} -> ${Command.parseFileName(operand.equipmentId)}.${property}`
    case 'actor-cooldown-time':
    case 'actor-cooldown-duration':
    case 'actor-cooldown-progress': {
      const key = Command.parseVariableString(operand.key)
      return `${Command.parseActor(operand.actor)} -> ${property}(${key})`
    }
    case 'skill-cooldown-time':
    case 'skill-cooldown-duration':
    case 'skill-cooldown-progress':
      return `${Command.parseSkill(operand.skill)} -> ${property}`
    case 'state-current-time':
    case 'state-duration':
    case 'state-progress':
      return `${Command.parseState(operand.state)} -> ${property}`
    case 'equipment-index':
      return `${Command.parseEquipment(operand.equipment)} -> ${property}`
    case 'item-index':
    case 'item-quantity':
      return `${Command.parseItem(operand.item)} -> ${property}`
    case 'trigger-speed':
    case 'trigger-angle':
      return `${Command.parseTrigger(operand.trigger)} -> ${property}`
    case 'list-length':
      return `${Command.parseVariable(operand.variable)} -> ${property}`
  }
}

// 解析元素属性
NumberOperand.parseElementProperty = function (operand) {
  const element = Command.parseElement(operand.element)
  const property = Local.get('command.setNumber.element.' + operand.property)
  return `${element} -> ${property}`
}

// 解析其他数据
NumberOperand.parseOther = function (operand) {
  return Local.get('command.setNumber.other.' + operand.data)
}

// 解析操作数
NumberOperand.parseOperand = function (operand) {
  switch (operand.type) {
    case 'constant':
      return operand.value.toString()
    case 'variable':
      return Command.parseVariable(operand.variable)
    case 'math':
      return this.parseMathMethod(operand)
    case 'string':
      return this.parseStringMethod(operand)
    case 'object':
      return this.parseObjectProperty(operand)
    case 'element':
      return this.parseElementProperty(operand)
    case 'list':
      return Command.parseListItem(operand.variable, operand.index)
    case 'parameter':
      return Command.parseParameter(operand.variable, operand.paramName)
    case 'other':
      return this.parseOther(operand)
  }
}

// 解析项目
NumberOperand.parse = function (operand, data, index) {
  let operation
  let operator
  if (index === 0) {
    operation = $('#setNumber-operation').read()
    switch (operation) {
      case 'set': operator = '= '; break
      case 'add': operator = '+= '; break
      case 'sub': operator = '-= '; break
      case 'mul': operator = '*= '; break
      case 'div': operator = '/= '; break
      case 'mod': operator = '%= '; break
    }
  } else {
    operation = operand.operation
    switch (operation.replace('()', '')) {
      case 'add': operator = '+ '; break
      case 'sub': operator = '- '; break
      case 'mul': operator = '* '; break
      case 'div': operator = '/ '; break
      case 'mod': operator = '% '; break
    }
  }
  let operandName = this.parseOperand(operand, false)
  const currentPriority = operation.includes('()')
  const nextPriority = data[index + 1]?.operation.includes('()')
  if (!currentPriority && nextPriority) {
    operandName = '(' + operandName
  }
  if (currentPriority && !nextPriority) {
    operandName = operandName + ')'
  }
  return operator + operandName
}

// 打开数据
NumberOperand.open = function (operand = {
  operation: 'add',
  type: 'constant',
  value: 0,
}) {
  Window.open('setNumber-operand')

  // 切换操作选择框
  if (this.target.start === 0) {
    $('#setNumber-operation').save()
    $('#setNumber-operation').show()
    $('#setNumber-operation').getFocus()
    $('#setNumber-operand-operation').hide()
  } else {
    $('#setNumber-operation').hide()
    $('#setNumber-operand-operation').show()
    $('#setNumber-operand-operation').getFocus()
  }

  // 写入数据
  const write = getElementWriter('setNumber-operand')
  let constantValue = 0
  let mathMethod = 'round'
  let mathDecimals = 0
  let mathMin = 0
  let mathMax = 1
  let mathStartPosition = {type: 'actor', actor: {type: 'trigger'}}
  let mathEndPosition = {type: 'actor', actor: {type: 'trigger'}}
  let stringMethod = 'length'
  let stringSearch = ''
  let commonVariable = {type: 'local', key: ''}
  let objectProperty = 'actor-x'
  let objectItemId = ''
  let objectEquipmentId = ''
  let elementProperty = 'element-children-count'
  let elementElement = {type: 'trigger'}
  let commonActor = {type: 'trigger'}
  let commonSkill = {type: 'trigger'}
  let commonState = {type: 'trigger'}
  let commonEquipment = {type: 'trigger'}
  let commonItem = {type: 'trigger'}
  let commonTrigger = {type: 'trigger'}
  let cooldownKey = ''
  let listIndex = 0
  let parameterParamName = ''
  let otherData = 'trigger-button'
  switch (operand.type) {
    case 'constant':
      constantValue = operand.value
      break
    case 'variable':
      commonVariable = operand.variable
      break
    case 'math':
      mathMethod = operand.method
      commonVariable = operand.variable ?? commonVariable
      mathDecimals = operand.decimals ?? mathDecimals
      mathMin = operand.min ?? mathMin
      mathMax = operand.max ?? mathMax
      mathStartPosition = operand.start ?? mathStartPosition
      mathEndPosition = operand.end ?? mathEndPosition
      break
    case 'string':
      stringMethod = operand.method
      commonVariable = operand.variable
      stringSearch = operand.search ?? stringSearch
      break
    case 'object':
      objectProperty = operand.property
      objectItemId = operand.itemId ?? objectItemId
      objectEquipmentId = operand.equipmentId ?? objectEquipmentId
      commonActor = operand.actor ?? commonActor
      commonSkill = operand.skill ?? commonSkill
      commonState = operand.state ?? commonState
      commonEquipment = operand.equipment ?? commonEquipment
      commonItem = operand.item ?? commonItem
      commonTrigger = operand.trigger ?? commonTrigger
      cooldownKey = operand.key ?? cooldownKey
      commonVariable = operand.variable ?? commonVariable
      break
    case 'element':
      elementProperty = operand.property
      elementElement = operand.element
      break
    case 'list':
      commonVariable = operand.variable
      listIndex = operand.index
      break
    case 'parameter':
      commonVariable = operand.variable
      parameterParamName = operand.paramName
      break
    case 'other':
      otherData = operand.data
      break
  }
  write('operation', operand.operation)
  write('type', operand.type)
  write('constant-value', constantValue)
  write('math-method', mathMethod)
  write('string-method', stringMethod)
  write('object-property', objectProperty)
  write('object-itemId', objectItemId)
  write('object-equipmentId', objectEquipmentId)
  write('element-property', elementProperty)
  write('element-element', elementElement)
  write('common-variable', commonVariable)
  write('common-actor', commonActor)
  write('common-skill', commonSkill)
  write('common-state', commonState)
  write('common-equipment', commonEquipment)
  write('common-item', commonItem)
  write('common-trigger', commonTrigger)
  write('string-search', stringSearch)
  write('math-decimals', mathDecimals)
  write('math-min', mathMin)
  write('math-max', mathMax)
  write('math-startPosition', mathStartPosition)
  write('math-endPosition', mathEndPosition)
  write('cooldown-key', cooldownKey)
  write('list-index', listIndex)
  write('parameter-paramName', parameterParamName)
  write('other-data', otherData)
}

// 保存数据
NumberOperand.save = function () {
  const read = getElementReader('setNumber-operand')
  const operation = read('operation')
  const type = read('type')
  let operand
  switch (type) {
    case 'constant': {
      const value = read('constant-value')
      operand = {operation, type, value}
      break
    }
    case 'variable': {
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#setNumber-operand-common-variable').getFocus()
      }
      operand = {operation, type, variable}
      break
    }
    case 'math': {
      const method = read('math-method')
      switch (method) {
        case 'round': {
          const variable = read('common-variable')
          if (VariableGetter.isNone(variable)) {
            return $('#setNumber-operand-common-variable').getFocus()
          }
          const decimals = read('math-decimals')
          operand = {operation, type, method, variable, decimals}
          break
        }
        case 'floor':
        case 'ceil':
        case 'sqrt':
        case 'abs':
        case 'cos':
        case 'sin':
        case 'tan': {
          const variable = read('common-variable')
          if (VariableGetter.isNone(variable)) {
            return $('#setNumber-operand-common-variable').getFocus()
          }
          operand = {operation, type, method, variable}
          break
        }
        case 'random':
          operand = {operation, type, method}
          break
        case 'random-int': {
          const min = read('math-min')
          const max = read('math-max')
          operand = {operation, type, method, min, max}
          break
        }
        case 'distance':
        case 'distance-x':
        case 'distance-y':
        case 'relative-angle': {
          const start = read('math-startPosition')
          const end = read('math-endPosition')
          operand = {operation, type, method, start, end}
          break
        }
      }
      break
    }
    case 'string': {
      const method = read('string-method')
      const variable = read('common-variable')
      if (VariableGetter.isNone(variable)) {
        return $('#setNumber-operand-common-variable').getFocus()
      }
      switch (method) {
        case 'length':
        case 'parse':
          operand = {operation, type, method, variable}
          break
        case 'search': {
          const search = read('string-search')
          if (search === '') {
            return $('#setNumber-operand-string-search').getFocus()
          }
          operand = {operation, type, method, variable, search}
          break
        }
      }
      break
    }
    case 'object': {
      const property = read('object-property')
      switch (property) {
        case 'actor-x':
        case 'actor-y':
        case 'actor-screen-x':
        case 'actor-screen-y':
        case 'actor-angle':
        case 'actor-direction':
        case 'actor-movement-speed':
        case 'actor-collision-size':
        case 'actor-collision-weight':
        case 'actor-bag-money':
        case 'actor-bag-used-space':
        case 'actor-bag-version':
        case 'actor-skill-version':
        case 'actor-state-version':
        case 'actor-equipment-version':
        case 'actor-animation-current-time':
        case 'actor-animation-duration':
        case 'actor-animation-progress': {
          const actor = read('common-actor')
          operand = {operation, type, property, actor}
          break
        }
        case 'actor-bag-item-quantity': {
          const actor = read('common-actor')
          const itemId = read('object-itemId')
          if (itemId === '') {
            return $('#setNumber-operand-object-itemId').getFocus()
          }
          operand = {operation, type, property, actor, itemId}
          break
        }
        case 'actor-bag-equipment-quantity': {
          const actor = read('common-actor')
          const equipmentId = read('object-equipmentId')
          if (equipmentId === '') {
            return $('#setNumber-operand-object-equipmentId').getFocus()
          }
          operand = {operation, type, property, actor, equipmentId}
          break
        }
        case 'actor-cooldown-time':
        case 'actor-cooldown-duration':
        case 'actor-cooldown-progress': {
          const actor = read('common-actor')
          const key = read('cooldown-key')
          if (key === '') {
            return $('#setNumber-operand-cooldown-key').getFocus()
          }
          operand = {operation, type, property, actor, key}
          break
        }
        case 'skill-cooldown-time':
        case 'skill-cooldown-duration':
        case 'skill-cooldown-progress': {
          const skill = read('common-skill')
          operand = {operation, type, property, skill}
          break
        }
        case 'state-current-time':
        case 'state-duration':
        case 'state-progress': {
          const state = read('common-state')
          operand = {operation, type, property, state}
          break
        }
        case 'equipment-index': {
          const equipment = read('common-equipment')
          operand = {operation, type, property, equipment}
          break
        }
        case 'item-index':
        case 'item-quantity': {
          const item = read('common-item')
          operand = {operation, type, property, item}
          break
        }
        case 'trigger-speed':
        case 'trigger-angle': {
          const trigger = read('common-trigger')
          operand = {operation, type, property, trigger}
          break
        }
        case 'list-length': {
          const variable = read('common-variable')
          if (VariableGetter.isNone(variable)) {
            return $('#setNumber-operand-common-variable').getFocus()
          }
          operand = {operation, type, property, variable}
          break
        }
      }
      break
    }
    case 'element': {
      const property = read('element-property')
      const element = read('element-element')
      operand = {operation, type, property, element}
      break
    }
    case 'list': {
      const variable = read('common-variable')
      const index = read('list-index')
      if (VariableGetter.isNone(variable)) {
        return $('#setNumber-operand-common-variable').getFocus()
      }
      operand = {operation, type, variable, index}
      break
    }
    case 'parameter': {
      const variable = read('common-variable')
      const paramName = read('parameter-paramName')
      if (VariableGetter.isNone(variable)) {
        return $('#setNumber-operand-common-variable').getFocus()
      }
      if (paramName === '') {
        return $('#setNumber-operand-parameter-paramName').getFocus()
      }
      operand = {operation, type, variable, paramName}
      break
    }
    case 'other': {
      const data = read('other-data')
      operand = {operation, type, data}
      break
    }
  }
  $('#setNumber-operation').save()
  Window.close('setNumber-operand')
  return operand
}

// 窗口 - 已关闭事件
NumberOperand.windowClosed = function (event) {
  $('#setNumber-operation').restore()
}

// 确定按钮 - 鼠标点击事件
NumberOperand.confirm = function (event) {
  return NumberOperand.target.save()
}

export { NumberOperand }
