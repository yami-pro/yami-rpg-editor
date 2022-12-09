"use strict"

import {
  EventListInterface,
  getElementWriter,
  Inspector,
  ScriptListInterface,
  UI
} from "../yami"

// ******************************** 元素页面 ********************************

const UIElement = {
  // properties
  owner: UI,
  target: null,
  nameBox: $('#uiElement-name'),
  generalGroup: $('#uiElement-general-group'),
  transformGroup: $('#uiElement-transform-group'),
  eventsGroup: $('#uiElement-events-group'),
  scriptsGroup: $('#uiElement-scripts-group'),
  parameterPane: $('#uiElement-parameter-pane'),
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  write: null,
  update: null,
  // events
  pageSwitch: null,
  alignmentClick: null,
  paramInput: null,
}

// 初始化
UIElement.initialize = function () {
  // 绑定事件列表
  $('#uiElement-events').bind(new EventListInterface(this, UI))

  // 绑定脚本列表
  $('#uiElement-scripts').bind(new ScriptListInterface(this, UI))

  // 绑定脚本参数面板
  this.parameterPane.bind($('#uiElement-scripts'))

  // 移除以上群组元素
  // this.generalGroup.remove()
  // this.transformGroup.remove()
  // this.eventsGroup.remove()
  // this.scriptsGroup.remove()

  // 侦听事件
  Inspector.manager.on('switch', this.pageSwitch)
  const alignElements = document.querySelectorAll('.uiElement-transform-align')
  const otherElements = document.querySelectorAll(`#uiElement-name, #uiElement-transform-anchorX, #uiElement-transform-anchorY,
    #uiElement-transform-x, #uiElement-transform-x2, #uiElement-transform-y, #uiElement-transform-y2,
    #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
    #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
    #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`)
  alignElements.on('click', this.alignmentClick)
  otherElements.on('input', this.paramInput)
  otherElements.on('focus', Inspector.inputFocus)
  otherElements.on('blur', Inspector.inputBlur(this, UI))
  document.querySelectorAll('#uiElement-events, #uiElement-scripts').on('change', UI.listChange)
}

// 创建变换参数
UIElement.createTransform = function () {
  return {
    anchorX: 0,
    anchorY: 0,
    x: 0,
    x2: 0,
    y: 0,
    y2: 0,
    width: 0,
    width2: 0,
    height: 0,
    height2: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    opacity: 1,
  }
}

// 打开数据
UIElement.open = function (node) {
  if (this.target !== node) {
    this.target = node

    // 写入数据
    const write = getElementWriter('uiElement', node)
    write('name')
    write('transform-anchorX')
    write('transform-anchorY')
    write('transform-x')
    write('transform-x2')
    write('transform-y')
    write('transform-y2')
    write('transform-width')
    write('transform-width2')
    write('transform-height')
    write('transform-height2')
    write('transform-rotation')
    write('transform-scaleX')
    write('transform-scaleY')
    write('transform-skewX')
    write('transform-skewY')
    write('transform-opacity')
    write('events')
    write('scripts')
  }
}

// 关闭数据
UIElement.close = function () {
  if (this.target) {
    this.target = null
    $('#uiElement-events').clear()
    $('#uiElement-scripts').clear()
    $('#uiElement-parameter-pane').clear()
  }
}

// 写入数据
UIElement.write = function (options) {
  if (options.anchorX !== undefined) {
    $('#uiElement-transform-anchorX').write(options.anchorX)
  }
  if (options.anchorY !== undefined) {
    $('#uiElement-transform-anchorY').write(options.anchorY)
  }
  if (options.x !== undefined) {
    $('#uiElement-transform-x').write(options.x)
  }
  if (options.y !== undefined) {
    $('#uiElement-transform-y').write(options.y)
  }
  if (options.width !== undefined) {
    $('#uiElement-transform-width').write(options.width)
  }
  if (options.height !== undefined) {
    $('#uiElement-transform-height').write(options.height)
  }
  if (options.rotation !== undefined) {
    $('#uiElement-transform-rotation').write(options.rotation)
  }
}

// 更新数据
UIElement.update = function (node, key, value) {
  UI.planToSave()
  const element = node.instance
  const transform = node.transform
  switch (key) {
    case 'name':
      if (node.name !== value) {
        node.name = value
        UI.list.updateItemName(node)
      }
      break
    case 'transform-anchorX':
    case 'transform-anchorY':
    case 'transform-x':
    case 'transform-x2':
    case 'transform-y':
    case 'transform-y2':
    case 'transform-width':
    case 'transform-width2':
    case 'transform-height':
    case 'transform-height2':
    case 'transform-rotation':
    case 'transform-scaleX':
    case 'transform-scaleY':
    case 'transform-skewX':
    case 'transform-skewY':
    case 'transform-opacity': {
      const index = key.indexOf('-') + 1
      const property = key.slice(index)
      if (transform[property] !== value) {
        transform[property] = value
        element.resize()
      }
      break
    }
  }
  UI.requestRendering()
}

// 页面 - 切换事件
UIElement.pageSwitch = function (event) {
  switch (event.value) {
    case 'uiImage':
    case 'uiText':
    case 'uiTextBox':
    case 'uiDialogBox':
    case 'uiProgressBar':
    case 'uiVideo':
    case 'uiWindow':
    case 'uiContainer': {
      const page = Inspector.manager.active
      page.insertBefore(this.transformGroup, page.firstChild)
      page.insertBefore(this.generalGroup, page.firstChild)
      page.appendChild(this.eventsGroup)
      page.appendChild(this.scriptsGroup)
      page.appendChild(this.parameterPane)
      break
    }
  }
}.bind(UIElement)

// 对齐 - 鼠标点击事件
UIElement.alignmentClick = function (event) {
  let x
  let y
  switch (this.getAttribute('value')) {
    case 'left':    x = 0   ; break
    case 'center':  x = 0.5 ; break
    case 'right':   x = 1   ; break
    case 'top':     y = 0   ; break
    case 'middle':  y = 0.5 ; break
    case 'bottom':  y = 1   ; break
  }
  const node = UIElement.target
  const element = node.instance
  const transform = node.transform
  const changes = []
  if (x !== undefined) {
    if (transform.anchorX !== x) {
      const input = $('#uiElement-transform-anchorX')
      changes.push({
        input: input,
        oldValue: transform.anchorX,
        newValue: x,
      })
      transform.anchorX = x
      input.write(x)
    }
    if (transform.x !== 0) {
      const input = $('#uiElement-transform-x')
      changes.push({
        input: input,
        oldValue: transform.x,
        newValue: 0,
      })
      transform.x = 0
      input.write(0)
    }
    if (transform.x2 !== x) {
      const input = $('#uiElement-transform-x2')
      changes.push({
        input: input,
        oldValue: transform.x2,
        newValue: x,
      })
      transform.x2 = x
      input.write(x)
    }
  }
  if (y !== undefined) {
    if (transform.anchorY !== y) {
      const input = $('#uiElement-transform-anchorY')
      changes.push({
        input: input,
        oldValue: transform.anchorY,
        newValue: y,
      })
      transform.anchorY = y
      input.write(y)
    }
    if (transform.y !== 0) {
      const input = $('#uiElement-transform-y')
      changes.push({
        input: input,
        oldValue: transform.y,
        newValue: 0,
      })
      transform.y = 0
      input.write(0)
    }
    if (transform.y2 !== y) {
      const input = $('#uiElement-transform-y2')
      changes.push({
        input: input,
        oldValue: transform.y2,
        newValue: y,
      })
      transform.y2 = y
      input.write(y)
    }
  }
  if (changes.length !== 0) {
    element.resize()
    UI.planToSave()
    UI.requestRendering()
    UI.history.save({
      type: 'inspector-change',
      editor: UIElement,
      target: UIElement.target,
      changes: changes,
    })
  }
}

// 参数 - 输入事件
UIElement.paramInput = function (event) {
  UIElement.update(
    UIElement.target,
    Inspector.getKey(this),
    this.read(),
  )
}

Inspector.uiElement = UIElement

// ******************************** 元素页面导出 ********************************

export { UIElement }
