'use strict'

// ******************************** 条件列表接口类 ********************************

class ConditionListInterface {
  target  //:element
  type    //:string
  history //:object
  editor  //:object
  owner   //:object

  constructor(editor, owner) {
    this.editor = editor ?? null
    this.owner = owner ?? null
  }

  // 初始化
  initialize(list) {
    this.target = null
    this.type = 'condition'

    // 创建参数历史操作
    const {editor, owner} = this
    if (editor && owner) {
      this.history = new Inspector.ParamHistory(editor, owner, list)
    }

    // 侦听事件
    window.on('localize', event => {
      if (list.data) list.update()
    })
  }

  // 解析变量
  parseVariable(condition) {
    switch (condition.type) {
      case 'boolean':
      case 'number':
      case 'string':
        return Command.parseGlobalVariable(condition.key)
    }
  }

  // 解析项目
  parse(condition) {
    const variable = this.parseVariable(condition)
    switch (condition.type) {
      case 'boolean': {
        const operator = IfCondition.parseBooleanOperation(condition)
        const value = condition.value.toString()
        return `${variable} ${operator} ${value}`
      }
      case 'number': {
        const operator = IfCondition.parseNumberOperation(condition)
        const value = condition.value.toString()
        return `${variable} ${operator} ${value}`
      }
      case 'string': {
        const operator = IfCondition.parseStringOperation(condition)
        const value = `"${Command.parseMultiLineString(condition.value)}"`
        return `${variable} ${operator} ${value}`
      }
      case 'absent':
        return Local.get('condition.absent')
    }
  }

  // 更新
  update(list) {
    // 更新宿主项目的条件图标
    const item = this.editor?.target
    if (item?.conditions === list.read()) {
      const element = item.element
      const list = element?.parentNode
      if (list instanceof NodeList) {
        list.updateConditionIcon(item)
      }
    }
  }

  // 打开窗口
  open(condition = {
    type: 'boolean',
    key: '',
    operation: 'equal',
    value: true,
  }) {
    Window.open('condition')
    ConditionListInterface.target = this.target
    const write = getElementWriter('condition')
    let booleanOperation = 'equal'
    let booleanValue = true
    let numberOperation = 'equal'
    let numberValue = 0
    let stringOperation = 'equal'
    let stringValue = ''
    switch (condition.type) {
      case 'boolean':
        booleanOperation = condition.operation
        booleanValue = condition.value
        break
      case 'number':
        numberOperation = condition.operation
        numberValue = condition.value
        break
      case 'string':
        stringOperation = condition.operation
        stringValue = condition.value
        break
    }
    write('type', condition.type)
    write('key', condition.key ?? '')
    write('boolean-operation', booleanOperation)
    write('boolean-value', booleanValue)
    write('number-operation', numberOperation)
    write('number-value', numberValue)
    write('string-operation', stringOperation)
    write('string-value', stringValue)
    $('#condition-type').getFocus()
  }

  // 保存数据
  save() {
    const read = getElementReader('condition')
    const type = read('type')
    let condition
    switch (type) {
      case 'boolean': {
        const operation = read('boolean-operation')
        const key = read('key')
        if (key === '') {
          return $('#condition-key').getFocus()
        }
        const value = read('boolean-value')
        condition = {type, key, operation, value}
        break
      }
      case 'number': {
        const operation = read('number-operation')
        const key = read('key')
        if (key === '') {
          return $('#condition-key').getFocus()
        }
        const value = read('number-value')
        condition = {type, key, operation, value}
        break
      }
      case 'string': {
        const operation = read('string-operation')
        const key = read('key')
        if (key === '') {
          return $('#condition-key').getFocus()
        }
        const value = read('string-value')
        condition = {type, key, operation, value}
        break
      }
      case 'absent':
        condition = {type}
        break
    }
    Window.close('condition')
    return condition
  }

  // 静态 - 正在编辑中的数据所在的列表
  static target = null

  // 静态 - 初始化
  static initialize() {
    // 创建条件类型选项
    $('#condition-type').loadItems([
      {name: 'Boolean', value: 'boolean'},
      {name: 'Number', value: 'number'},
      {name: 'String', value: 'string'},
      {name: 'Absent', value: 'absent'},
    ])

    // 创建布尔值操作选项
    $('#condition-boolean-operation').loadItems([
      {name: '==', value: 'equal'},
      {name: '!=', value: 'unequal'},
    ])

    // 创建布尔值常量选项
    $('#condition-boolean-value').loadItems([
      {name: 'False', value: false},
      {name: 'True', value: true},
    ])

    // 创建数值操作选项
    $('#condition-number-operation').loadItems([
      {name: '==', value: 'equal'},
      {name: '!=', value: 'unequal'},
      {name: '>=', value: 'greater-or-equal'},
      {name: '<=', value: 'less-or-equal'},
      {name: '>', value: 'greater'},
      {name: '<', value: 'less'},
    ])

    // 创建字符串操作选项
    $('#condition-string-operation').loadItems([
      {name: '==', value: 'equal'},
      {name: '!=', value: 'unequal'},
    ])

    // 设置条件类型关联元素
    $('#condition-type').enableHiddenMode().relate([
      {case: 'boolean', targets: [
        $('#condition-key'),
        $('#condition-boolean-operation'),
        $('#condition-boolean-value'),
      ]},
      {case: 'number', targets: [
        $('#condition-key'),
        $('#condition-number-operation'),
        $('#condition-number-value'),
      ]},
      {case: 'string', targets: [
        $('#condition-key'),
        $('#condition-string-operation'),
        $('#condition-string-value'),
      ]},
    ])

    // 条件类型写入事件
    $('#condition-type').on('write', event => {
      const type = event.value
      switch (type) {
        case 'boolean':
        case 'number':
        case 'string':
          // 设置全局变量类型过滤器
          $('#condition-key').setAttribute('filter', type)
          break
      }
    })

    // 确定按钮 - 鼠标点击事件
    $('#condition-confirm').on('click', event => {
      ConditionListInterface.target.save()
    })
  }
}
