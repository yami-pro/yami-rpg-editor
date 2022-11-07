'use strict'

import { getElementReader, getElementWriter } from '../util/index.js'
import * as Yami from '../yami.js'

const {
  Enum,
  Local,
  Window
} = Yami

// ******************************** 事件编辑器 ********************************

const EventEditor = {
  // properties
  list: $('#event-commands'),
  outerGutter: $('#event-commands-gutter-outer'),
  innerGutter: $('#event-commands-gutter-inner'),
  caches: [],
  types: null,
  inserting: false,
  changed: false,
  callback: null,
  // methods
  initialize: null,
  open: null,
  save: null,
  resizeGutter: null,
  updateGutter: null,
  appendCommandsToCaches: null,
  clearCommandBuffers: null,
  // events
  windowLocalize: null,
  windowClose: null,
  windowClosed: null,
  windowResize: null,
  dataChange: null,
  listUpdate: null,
  listScroll: null,
  confirm: null,
  apply: null,
}

// ******************************** 事件编辑器加载 ********************************

// 初始化
EventEditor.initialize = function () {
  // 创建事件类型选项
  const types = {
    common: {name: 'Common', value: 'common'},
    initialize: {name: 'Initialize', value: 'initialize'},
    autorun: {name: 'Autorun', value: 'autorun'},
    collision: {name: 'Collision', value: 'collision'},
    hittrigger: {name: 'HitTrigger', value: 'hittrigger'},
    hitactor: {name: 'HitActor', value: 'hitactor'},
    destroy: {name: 'Destroy', value: 'destroy'},
    actorenter: {name: 'ActorEnter', value: 'actorenter'},
    actorleave: {name: 'ActorLeave', value: 'actorleave'},
    skillcast: {name: 'SkillCast', value: 'skillcast'},
    skilladd: {name: 'SkillAdd', value: 'skilladd'},
    skillremove: {name: 'SkillRemove', value: 'skillremove'},
    stateadd: {name: 'StateAdd', value: 'stateadd'},
    stateremove: {name: 'StateRemove', value: 'stateremove'},
    equipmentadd: {name: 'EquipmentAdd', value: 'equipmentadd'},
    equipmentremove: {name: 'EquipmentRemove', value: 'equipmentremove'},
    itemuse: {name: 'ItemUse', value: 'itemuse'},
    keydown: {name: 'KeyDown', value: 'keydown'},
    keyup: {name: 'KeyUp', value: 'keyup'},
    mousedown: {name: 'MouseDown', value: 'mousedown'},
    mousedownLB: {name: 'MouseDown LB', value: 'mousedownLB'},
    mousedownRB: {name: 'MouseDown RB', value: 'mousedownRB'},
    mouseup: {name: 'MouseUp', value: 'mouseup'},
    mouseupLB: {name: 'MouseUp LB', value: 'mouseupLB'},
    mouseupRB: {name: 'MouseUp RB', value: 'mouseupRB'},
    mousemove: {name: 'MouseMove', value: 'mousemove'},
    mouseenter: {name: 'MouseEnter', value: 'mouseenter'},
    mouseleave: {name: 'MouseLeave', value: 'mouseleave'},
    click: {name: 'Click', value: 'click'},
    doubleclick: {name: 'DoubleClick', value: 'doubleclick'},
    wheel: {name: 'Wheel', value: 'wheel'},
    input: {name: 'Input', value: 'input'},
    focus: {name: 'Focus', value: 'focus'},
    blur: {name: 'Blur', value: 'blur'},
  }
  this.types = {
    all: Object.values(types),
    global: [
      types.common,
      types.keydown,
      types.keyup,
      types.mousedown,
      types.mouseup,
      types.mousemove,
      types.doubleclick,
      types.wheel,
    ],
    scene: [
      types.autorun,
    ],
    actor: [
      types.initialize,
      types.autorun,
      types.collision,
      types.hittrigger,
    ],
    skill: [
      types.skillcast,
      types.skilladd,
      types.skillremove,
    ],
    state: [
      types.stateadd,
      types.stateremove,
    ],
    equipment: [
      types.initialize,
      types.equipmentadd,
      types.equipmentremove,
    ],
    trigger: [
      types.hitactor,
      types.destroy,
    ],
    item: [
      types.itemuse,
    ],
    region: [
      types.autorun,
      types.actorenter,
      types.actorleave,
    ],
    light: [
      types.autorun,
    ],
    animation: [
      types.autorun,
    ],
    particle: [
      types.autorun,
    ],
    parallax: [
      types.autorun,
    ],
    tilemap: [
      types.autorun,
    ],
    element: [
      types.autorun,
      types.mousedown,
      types.mousedownLB,
      types.mousedownRB,
      types.mouseup,
      types.mouseupLB,
      types.mouseupRB,
      types.mousemove,
      types.mouseenter,
      types.mouseleave,
      types.click,
      types.doubleclick,
      types.wheel,
      types.input,
      types.focus,
      types.blur,
      types.destroy,
    ],
    relatedElements: [],
  }

  // 设置指令列表的内部高度
  const INNER_HEIGHT = 600
  Object.defineProperty(
    this.list, 'innerHeight', {
      configurable: true,
      value: INNER_HEIGHT,
    }
  )

  // 设置行号列表和指令列表的底部填充高度
  const PADDING_BOTTOM = INNER_HEIGHT - 20
  this.list.style.paddingBottom = `${PADDING_BOTTOM + 10}px`
  this.innerGutter.style.paddingBottom = `${PADDING_BOTTOM}px`

  // 侦听事件
  window.on('localize', this.windowLocalize)
  $('#event').on('close', this.windowClose)
  $('#event').on('closed', this.windowClosed)
  $('#event').on('resize', this.windowResize)
  $('#event').on('change', this.dataChange)
  this.list.on('update', this.listUpdate)
  this.list.on('scroll', this.listScroll)
  $('#event-confirm').on('click', this.confirm)
  $('#event-apply').on('click', this.apply)
}

// 打开数据
EventEditor.open = function (filter, event, callback) {
  this.callback = callback ?? Function.empty
  Window.open('event')

  // 创建类型选项
  $('#event-type').loadItems(
    Enum.getMergedItems(
      this.types[filter],
      filter + '-event',
  ))

  // 初始化指令数据标记
  const commands = event.commands
  if (!commands.symbol) {
    Object.defineProperty(commands, 'symbol', {
      configurable: true,
      value: Symbol(),
    })
  }

  // 获取指令数据缓存
  const symbol = commands.symbol
  let commandsClone = this.caches.find(target => {
    return target.symbol === symbol
  })

  // 克隆指令数据
  if (!commandsClone) {
    commandsClone = Object.clone(commands)
    Object.defineProperty(commandsClone, 'symbol', {
      configurable: true,
      value: symbol,
    })
  }

  // 写入数据
  const write = getElementWriter('event')
  write('commands', commandsClone)
  write('type', event.type)
  // 当第一行是大块指令时focus效果不佳
  // this.list.getFocus()
}

// 保存数据
EventEditor.save = function () {
  const read = getElementReader('event')
  const commands = read('commands')
  const commandsClone = Object.clone(commands)
  Object.defineProperty(commandsClone, 'symbol', {
    configurable: true,
    value: commands.symbol,
  })
  return {
    type: read('type'),
    commands: commandsClone,
  }
}

// 调整行号列表
EventEditor.resizeGutter = function () {
  const {outerGutter, innerGutter} = this
  const height = outerGutter.clientHeight
  if (height !== 0) {
    const length = Math.ceil(height / 20) + 1
    const nodes = innerGutter.childNodes
    let i = nodes.length
    if (i !== length) {
      if (i < length) {
        while (i < length) {
          const node = document.createElement('box')
          node.addClass('event-commands-line-number')
          node.number = -1
          innerGutter.appendChild(node)
          i++
        }
      } else {
        while (--i >= length) {
          nodes[i].remove()
        }
      }
    }
  }
}

// 更新行号列表
EventEditor.updateGutter = function (force) {
  const {list} = this
  const {scrollTop} = list
  const {outerGutter, innerGutter} = EventEditor
  const start = Math.floor(scrollTop / 20) + 1
  const end = list.elements.count + 1
  if (innerGutter.start !== start || force) {
    innerGutter.start = start
    const nodes = innerGutter.childNodes
    const length = nodes.length
    for (let i = 0; i < length; i++) {
      const node = nodes[i]
      const number = start + i
      if (number < end) {
        if (node.number !== number) {
          node.number = number
          node.textContent = number.toString()
        }
      } else {
        if (node.number !== -1) {
          node.number = -1
          node.textContent = ''
        } else {
          break
        }
      }
    }
  }
  // 通过容差来消除非1:1时的抖动
  const tolerance = 0.0001
  outerGutter.scrollTop = (scrollTop + tolerance) % 20
}

// 添加指令数据到缓存列表
EventEditor.appendCommandsToCaches = function (commands) {
  const {caches} = this
  if (caches.append(commands) &&
    caches.length > 10) {
    caches.shift()
  }
}

// 清除指令缓存元素
EventEditor.clearCommandBuffers = function () {
  const {list} = this
  for (const commands of this.caches) {
    list.deleteCommandBuffers(commands)
    const {stack} = commands.history
    const {length} = stack
    for (let i = 0; i < length; i++) {
      const {commands} = stack[i]
      list.deleteCommandBuffers(commands)
    }
  }
}

// 窗口 - 本地化事件
EventEditor.windowLocalize = function (event) {
  // 更新事件类型选项名称
  const types = EventEditor.types
  const get = Local.createGetter('eventTypes')
  for (const item of types.all) {
    const key = item.value
    const name = get(key)
    if (name !== '') {
      item.name = name
    }
  }
  // 更新事件类型相关元素
  for (const selectBox of types.relatedElements) {
    if (selectBox.read()) selectBox.update()
  }
}

// 窗口 - 关闭事件
EventEditor.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedEvent'),
    }, [{
      label: get('yes'),
      click: () => {
        // 尝试恢复指令数据
        // 成功则添加到缓存
        // 失败则从缓存中移除
        const commands = this.list.read()
        if (commands.history.restoreState()) {
          this.appendCommandsToCaches(commands)
        } else {
          this.caches.remove(commands)
        }
        this.changed = false
        Window.close('event')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(EventEditor)

// 窗口 - 已关闭事件
EventEditor.windowClosed = function (event) {
  this.inserting = false
  this.callback = null
  this.list.clear()
  this.clearCommandBuffers()
}.bind(EventEditor)

// 窗口 - 调整大小事件
EventEditor.windowResize = function (event) {
  // 设置指令列表的内部高度
  const {list} = EventEditor
  const parent = list.parentNode
  const outerHeight = parent.clientHeight
  const innerHeight = Math.max(outerHeight - 20, 0)
  Object.defineProperty(
    list, 'innerHeight', {
      configurable: true,
      value: innerHeight,
    }
  )

  // 设置行号列表和指令列表的底部填充高度
  const {innerGutter} = EventEditor
  const paddingBottom = innerHeight - 20
  list.style.paddingBottom = `${paddingBottom + 10}px`
  innerGutter.style.paddingBottom = `${paddingBottom}px`

  // 调整指令列表
  list.resize()

  // 当使用快捷键滚动到底部并且溢出时再最大化窗口
  // 会触发BUG: 插入指令resize刷新时增加scrollTop
  // 重置scrollTop可以避免这个现象
  // 由于scroll是异步事件因此不会重复触发
  const st = list.scrollTop
  list.scrollTop = 0
  list.scrollTop = st

  // 调整行号列表
  EventEditor.resizeGutter()
  EventEditor.updateGutter(true)
}

// 数据 - 改变事件
EventEditor.dataChange = function (event) {
  EventEditor.changed = true
}

// 指令列表 - 更新事件
EventEditor.listUpdate = function (event) {
  EventEditor.resizeGutter()
  EventEditor.updateGutter(true)
}

// 指令列表 - 滚动事件
EventEditor.listScroll = function (event) {
  EventEditor.updateGutter(false)
}

// 确定按钮 - 鼠标点击事件
EventEditor.confirm = function (event) {
  this.apply()
  Window.close('event')
}.bind(EventEditor)

// 应用按钮 - 鼠标点击事件
EventEditor.apply = function (event) {
  if (this.changed) {
    const commands = this.list.read()
    commands.history.saveState()
    this.appendCommandsToCaches(commands)
  }
  if (this.changed || this.inserting) {
    this.changed = false
    this.inserting = false
    this.callback()
  }
}.bind(EventEditor)

// ******************************** 事件编辑器导出 ********************************

export { EventEditor }
