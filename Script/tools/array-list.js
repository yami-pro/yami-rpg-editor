'use strict'

// ******************************** 数组窗口 ********************************

const ArrayList = {
  // properties
  list: $('#arrayList-list'),
  target: null,
  changed: false,
  interface: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClose: null,
  windowClosed: null,
  listChange: null,
  confirm: null,
}

// 初始化
ArrayList.initialize = function () {
  // 绑定数组列表
  this.list.bind(this.interface)

  // 侦听事件
  $('#arrayList').on('close', this.windowClose)
  $('#arrayList').on('closed', this.windowClosed)
  this.list.on('change', this.listChange)
  $('#arrayList-confirm').on('click', this.confirm)
}

// 打开窗口
ArrayList.open = function (target) {
  this.target = target
  const label = target.previousSibling
  const alias = label.textContent
  $('#arrayList').setTitle(alias)
  Window.open('arrayList')

  // 写入数据
  this.list.write(target.read().slice())
  this.list.getFocus()
}

// 窗口 - 关闭事件
ArrayList.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedData'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('arrayList')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(ArrayList)

// 窗口 - 已关闭事件
ArrayList.windowClosed = function (event) {
  ArrayList.target = null
  ArrayList.list.clear()
}

// 列表 - 改变事件
ArrayList.listChange = function (event) {
  ArrayList.changed = true
}

// 确定按钮 - 鼠标点击事件
ArrayList.confirm = function (event) {
  this.changed = false
  this.target.input(this.list.read())
  Window.close('arrayList')
}.bind(ArrayList)

// 数组列表接口
ArrayList.interface = {
  parsers: {
    number: number => number.toString(),
    string: string => Command.parseMultiLineString(string),
  },
  defaults: {
    number: 0,
    string: '',
  },
  windows: {
    number: 'arrayList-number',
    string: 'arrayList-string',
  },
  inputs: {
    number: $('#arrayList-number-value'),
    string: $('#arrayList-string-value'),
  },
  initialize: function (list) {
    $('#arrayList-number-confirm').on('click', () => list.save())
    $('#arrayList-string-confirm').on('click', () => list.save())
  },
  parse: function (value, data, index) {
    const {filter} = ArrayList.target
    // 创建索引文本
    const indexText = document.createElement('text')
    indexText.addClass('array-index')
    indexText.textContent = Number.padZero(index, data.length, ' ') + ':'

    // 创建值文本
    const valueText = document.createElement('text')
    valueText.addClass('array-value')
    valueText.textContent = this.parsers[filter](value)

    // 返回元素列表
    return [indexText, valueText]
  },
  open: function (value) {
    const {filter} = ArrayList.target
    value = value ?? this.defaults[filter]
    Window.open(this.windows[filter])
    const input = this.inputs[filter]
    input.write(value)
    input.getFocus('all')
  },
  save: function () {
    const {filter} = ArrayList.target
    const value = this.inputs[filter].read()
    Window.close(this.windows[filter])
    return value
  },
}

export { ArrayList }
