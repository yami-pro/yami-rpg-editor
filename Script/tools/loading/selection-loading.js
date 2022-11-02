'use strict'

import { Selection } from '../selection.js'
import { Window } from '../../tools/window.js'

// ******************************** 选取文本加载 ********************************

// 初始化
Selection.initialize = function () {
  // 侦听事件
  $('#font-confirm').on('click', this.font.confirm)
  $('#fontSize-confirm').on('click', this.fontSize.confirm)
  $('#textPosition-confirm').on('click', this.textPosition.confirm)
  $('#textEffect-confirm').on('click', this.textEffect.confirm)
  $('#localVariable-confirm').on('click', this.localVariable.confirm)

  // 侦听文本框事件
  const exclusions = {
    'color-hex': true,
    'command-searcher': true,
  }
  for (const textbox of $('text-box')) {
    if (exclusions[textbox.id]) {
      continue
    }
    const {input} = textbox
    input.on('keydown', this.inputKeydown)
    input.on('keyup', this.inputKeyup)
    input.on('pointerdown', this.inputPointerdown)
    input.on('pointerup', this.inputPointerup)
  }

  // 侦听文本区域事件
  for (const textarea of $('textarea')) {
    textarea.on('keydown', this.inputKeydown)
    textarea.on('keyup', this.inputKeyup)
    textarea.on('pointerdown', this.inputPointerdown)
    textarea.on('pointerup', this.inputPointerup)
  }

  // 初始化子对象
  this.textPosition.initialize()
  this.textEffect.initialize()
}

// 匹配标签
Selection.match = function () {
  const target = document.activeElement
  if (typeof target.selectionStart !== 'number') {
    return
  }

  // 设置目标
  this.target = target

  // 开始匹配
  const text = target.value
  const selectionStart = target.selectionStart
  const selectionEnd = target.selectionEnd
  if (selectionEnd === 0) {
    return
  }

  const regexps = Printer.regexps
  const start = text.lastIndexOf('<', selectionEnd - 1)
  const end = text.indexOf('>', selectionStart) + 1
  let tag
  let params
  if (start >= 0 &&
    end > 0 &&
    start < end &&
    start <= selectionStart &&
    end >= selectionEnd) {
    const string = text.slice(start, end)
    let match
    if (match = string.match(regexps.colorIndex)) {
      tag = 'color'
      params = {
        color: parseInt(match[1]),
      }
    } else if (match = string.match(regexps.color)) {
      tag = 'color'
      params = {
        color: `${match[1]}${match[2]}${match[3]}${match[4] || 'ff'}`,
      }
    } else if (match = string.match(regexps.font)) {
      tag = 'font'
      params = {
        font: match[1],
      }
    } else if (match = string.match(regexps.italic)) {
      tag = 'italic'
      params = null
    } else if (match = string.match(regexps.bold)) {
      tag = 'bold'
      params = null
    } else if (match = string.match(regexps.fontSize)) {
      tag = 'fontSize'
      params = {
        size: parseInt(match[1]),
      }
    } else if (match = string.match(regexps.textPosition)) {
      tag = 'textPosition'
      params = {
        axis: match[1],
        operation: match[2] || 'set',
        value: parseInt(match[3]),
      }
    } else if (match = string.match(regexps.textShadow)) {
      tag = 'textEffect'
      params = {
        type: 'shadow',
        shadowOffsetX: parseInt(match[1]),
        shadowOffsetY: parseInt(match[2]),
        color: `${match[3]}${match[4]}${match[5]}${match[6] || 'ff'}`,
      }
    } else if (match = string.match(regexps.textStroke)) {
      tag = 'textEffect'
      params = {
        type: 'stroke',
        strokeWidth: parseInt(match[1]),
        color: `${match[2]}${match[3]}${match[4]}${match[5] || 'ff'}`,
      }
    } else if (match = string.match(regexps.textOutline)) {
      tag = 'textEffect'
      params = {
        type: 'outline',
        color: `${match[1]}${match[2]}${match[3]}${match[4] || 'ff'}`,
      }
    } else {
      const wrap = target.parentNode
      switch (wrap.getAttribute('menu')) {
        case 'tag-variable':
          if (match = string.match(this.regexps.local)) {
            tag = 'localVariable'
            params = {
              key: match[1],
            }
          } else if (match = string.match(this.regexps.global)) {
            tag = 'globalVariable'
            params = {
              key: match[1] ?? '',
            }
          }
          break
      }
    }
  }
  if (tag) {
    target.selectionStart = start
    target.selectionEnd = end
    if (params) {
      return {tag, params}
    }
  }
}

// 插入标签
Selection.insert = function (tag) {
  const target = document.activeElement
  if (typeof target.selectionStart === 'number') {
    this.target = target
    this.inserting = true
    this[tag].open()
  }
}

// 编辑标签
Selection.edit = function () {
  const match = this.match()
  if (match) {
    const {tag, params} = match
    this.inserting = false
    this[tag].open(params)
  }
}

// 包装选中文本
Selection.wrap = function ({prefix, suffix}) {
  const input = this.target
  const start = input.selectionStart
  const end = input.selectionEnd
  input.focus()
  if (this.inserting && start !== end) {
    let string
    if (suffix) {
      const selection = input.value.slice(start, end)
      string = prefix + selection + suffix
    } else {
      string = prefix
      input.selectionEnd = input.selectionStart
    }
    input.parentNode.insert(string)
    input.selectionStart = start
  } else {
    input.parentNode.insert(prefix)
    input.selectionStart = start
  }
}

// 输入框 - 键盘按下事件
Selection.inputKeydown = function (event) {
  if (event.altKey) {
    switch (event.code) {
      case 'KeyE':
        this.match()
        break
    }
  }
}.bind(Selection)

// 输入框 - 键盘弹起事件
Selection.inputKeyup = function (event) {
  if (event.altKey) {
    switch (event.code) {
      case 'KeyE':
        this.edit()
        break
    }
  }
}.bind(Selection)

// 输入框 - 指针按下事件
Selection.inputPointerdown = function (event) {
  switch (event.button) {
    case 2:
      setTimeout(() => this.match())
      break
  }
}.bind(Selection)

// 输入框 - 指针弹起事件
Selection.inputPointerup = function (event) {
  switch (event.button) {
    case 2:
      navigator.clipboard.readText().then(clipText => {
        const element = event.target
        if (document.activeElement === element) {
          const start = element.selectionStart
          const end = element.selectionEnd
          const editable = !!this.match()
          const selected = start !== end
          const pastable = !!clipText
          const undoable = element.history.canUndo()
          const redoable = element.history.canRedo()
          const get = Local.createGetter('menuTextBox')
          const wrap = element.parentNode
          const menu = wrap.getAttribute('menu') ?? 'tag'
          const tagItems = []
          if (menu === 'tag' || menu === 'tag-variable') {
            tagItems.push({
              label: get('tag.color'),
              click: () => {
                Selection.insert('color')
              },
            }, {
              label: get('tag.font'),
              click: () => {
                Selection.insert('font')
              },
            }, {
              label: get('tag.italic'),
              click: () => {
                Selection.insert('italic')
              },
            }, {
              label: get('tag.bold'),
              click: () => {
                Selection.insert('bold')
              },
            }, {
              label: get('tag.size'),
              click: () => {
                Selection.insert('fontSize')
              },
            }, {
              label: get('tag.position'),
              click: () => {
                Selection.insert('textPosition')
              },
            }, {
              label: get('tag.effect'),
              click: () => {
                Selection.insert('textEffect')
              },
            })
          }
          if (menu === 'tag-variable') {
            tagItems.push({
              label: get('tag.localVariable'),
              click: () => {
                Selection.insert('localVariable')
              }
            }, {
              label: get('tag.globalVariable'),
              click: () => {
                Selection.insert('globalVariable')
              }
            })
          }
          Menu.popup({
            x: event.clientX,
            y: event.clientY,
          }, [{
            label: get('edit'),
            accelerator: 'Alt+E',
            enabled: editable,
            click: () => {
              Selection.edit()
            },
          }, {
            label: get('tag'),
            submenu: tagItems,
          }, {
            type: 'separator',
          }, {
            label: get('cut'),
            accelerator: ctrl('X'),
            enabled: selected,
            click: () => {
              element.dispatchEvent(
                new InputEvent('beforeinput', {
                  inputType: 'deleteByCut',
                  bubbles: true,
              }))
              document.execCommand('cut')
            },
          }, {
            label: get('copy'),
            accelerator: ctrl('C'),
            enabled: selected,
            click: () => {
              document.execCommand('copy')
            }
          }, {
            label: get('paste'),
            accelerator: ctrl('V'),
            enabled: pastable,
            click: () => {
              element.dispatchEvent(
                new InputEvent('beforeinput', {
                  inputType: 'insertFromPaste',
                  data: clipText,
                  bubbles: true,
              }))
              document.execCommand('paste')
            }
          }, {
            label: get('delete'),
            accelerator: 'Delete',
            enabled: selected,
            click: () => {
              element.dispatchEvent(
                new InputEvent('beforeinput', {
                  inputType: 'deleteContentForward',
                  bubbles: true,
              }))
              document.execCommand('delete')
            }
          }, {
            label: get('undo'),
            accelerator: ctrl('Z'),
            enabled: undoable,
            click: () => {
              element.history.restore('undo')
            }
          }, {
            label: get('redo'),
            accelerator: ctrl('Y'),
            enabled: redoable,
            click: () => {
              element.history.restore('redo')
            }
          }])
        }
      })
      break
  }
}.bind(Selection)

// 颜色
Selection.color = {
  open: function ({color = '000000ff'} = {}) {
    this.proxy.color = color
    Color.open(this.proxy, true)
  },
  proxy: {
    color: null,
    read: function () {
      return this.color
    },
    input: function (color) {
      if (typeof color === 'string') {
        color = Color.simplifyHexColor(color)
      }
      Selection.wrap({
        prefix: `<color:${color}>`,
        suffix: '</color>',
      })
    }
  }
}

// 字体
Selection.font = {
  open: function ({font = 'sans-serif'} = {}) {
    Window.open('font')
    $('#font-font').write(font)
    $('#font-font').getFocus('all')
  },
  confirm: function (event) {
    const font = $('#font-font').read()
    if (!font) {
      return $('#font-font').getFocus('all')
    }
    Selection.wrap({
      prefix: `<font:${font}>`,
      suffix: '</font>',
    })
    Window.close('font')
  }
}

// 倾斜
Selection.italic = {
  open: function () {
    Selection.wrap({
      prefix: '<italic>',
      suffix: '</italic>',
    })
  }
}

// 加粗
Selection.bold = {
  open: function () {
    Selection.wrap({
      prefix: '<bold>',
      suffix: '</bold>',
    })
  }
}

// 字体大小
Selection.fontSize = {
  open: function ({size = 12} = {}) {
    Window.open('fontSize')
    $('#fontSize-size').write(size)
    $('#fontSize-size').getFocus('all')
  },
  confirm: function (event) {
    const size = $('#fontSize-size').read()
    Selection.wrap({
      prefix: `<size:${size}>`,
      suffix: '</size>',
    })
    Window.close('fontSize')
  }
}

// 文字位置
Selection.textPosition = {
  initialize: function () {
    // 创建坐标轴选项
    $('#textPosition-axis').loadItems([
      {name: 'X', value: 'x'},
      {name: 'Y', value: 'y'},
    ])
    // 创建操作选项
    $('#textPosition-operation').loadItems([
      {name: 'Set', value: 'set'},
      {name: 'Add', value: 'add'},
    ])
  },
  open: function ({axis = 'x', operation = 'set', value = 0} = {}) {
    Window.open('textPosition')
    $('#textPosition-axis').write(axis)
    $('#textPosition-operation').write(operation)
    $('#textPosition-value').write(value)
  },
  confirm: function (event) {
    const axis = $('#textPosition-axis').read()
    const operation = $('#textPosition-operation').read()
    const value = $('#textPosition-value').read()
    let string
    switch (operation) {
      case 'set':
        string = `${value}`
        break
      case 'add':
        string = `${operation},${value}`
        break
    }
    Selection.wrap({
      prefix: `<${axis}:${string}>`,
      suffix: '',
    })
    Window.close('textPosition')
  }
}

// 文字效果
Selection.textEffect = {
  initialize: function () {
    // 创建文字效果类型选项
    $('#textEffect-type').loadItems([
      {name: 'Shadow', value: 'shadow'},
      {name: 'Stroke', value: 'stroke'},
      {name: 'Outline', value: 'outline'},
    ])
    // 设置文字效果类型关联元素
    $('#textEffect-type').enableHiddenMode().relate([
      {case: 'shadow', targets: [
        $('#textEffect-shadowOffsetX'),
        $('#textEffect-shadowOffsetY'),
        $('#textEffect-color'),
      ]},
      {case: 'stroke', targets: [
        $('#textEffect-strokeWidth'),
        $('#textEffect-color'),
      ]},
      {case: 'outline', targets: [
        $('#textEffect-color'),
      ]},
    ])
  },
  open: function ({type = 'shadow', shadowOffsetX = 1, shadowOffsetY = 1, strokeWidth = 1, color = '000000ff'} = {}) {
    Window.open('textEffect')
    $('#textEffect-type').write(type)
    $('#textEffect-shadowOffsetX').write(shadowOffsetX)
    $('#textEffect-shadowOffsetY').write(shadowOffsetY)
    $('#textEffect-strokeWidth').write(strokeWidth)
    $('#textEffect-color').write(color)
  },
  confirm: function (event) {
    const type = $('#textEffect-type').read()
    const color = Color.simplifyHexColor($('#textEffect-color').read())
    let string
    switch (type) {
      case 'shadow': {
        const shadowOffsetX = $('#textEffect-shadowOffsetX').read()
        const shadowOffsetY = $('#textEffect-shadowOffsetY').read()
        string = `${shadowOffsetX},${shadowOffsetY},${color}`
        break
      }
      case 'stroke': {
        const strokeWidth = $('#textEffect-strokeWidth').read()
        string = `${strokeWidth},${color}`
        break
      }
      case 'outline':
        string = `${color}`
        break
    }
    Selection.wrap({
      prefix: `<${type}:${string}>`,
      suffix: `</${type}>`,
    })
    Window.close('textEffect')
  }
}

// 本地变量
Selection.localVariable = {
  open: function ({key = ''} = {}) {
    Window.open('localVariable')
    $('#localVariable-key').write(key)
    $('#localVariable-key').getFocus('all')
  },
  confirm: function (event) {
    const key = $('#localVariable-key').read()
    if (!key) {
      return $('#localVariable-key').getFocus('all')
    }
    Selection.wrap({
      prefix: `<local:${key}>`,
      suffix: '',
    })
    Window.close('localVariable')
  }
}

// 全局变量
Selection.globalVariable = {
  open: function ({key = ''} = {}) {
    this.proxy.key = key
    Variable.open(this.proxy)
  },
  proxy: {
    key: '',
    filter: '',
    read: function () {
      return this.key
    },
    input: function (key) {
      Selection.wrap({
        prefix: `<global:${key}>`,
        suffix: '',
      })
    }
  }
}
