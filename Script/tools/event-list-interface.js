'use strict'

import {
  Command,
  EventEditor,
  Inspector,
  Local,
  TreeList
} from '../yami.js'

// ******************************** 事件列表接口类 ********************************

class EventListInterface {
  target  //:element
  type    //:string
  filter  //:string
  editor  //:object
  owner   //:object

  constructor(editor, owner) {
    this.editor = editor ?? null
    this.owner = owner ?? null
  }

  // 初始化
  initialize(list) {
    this.filter = list.getAttribute('filter')
    this.type = `${this.filter}.event`
    this.editCallback = () => list.save()
    this.insertCallback = () => {
      if (list.inserting) {
        list.save()
        list.inserting = false
      } else {
        list.start--
        list.save()
        list.select(list.start + 1)
      }
    }

    // 创建参数历史操作
    const {editor, owner} = this
    if (editor && owner) {
      this.history = new Inspector.ParamHistory(editor, owner, list)
      this.history.save = EventListInterface.historySave
    }

    // 侦听事件
    window.on('localize', event => {
      if (list.data) list.update()
    })
  }

  // 解析
  parse(event) {
    const {type} = event
    if (EventListInterface.guidRegExp.test(type)) {
      Command.invalid = false
      const groupKey = this.filter + '-event'
      const eventType = Command.parseGroupEnumString(groupKey, type)
      const eventClass = Command.invalid ? 'invalid' : ''
      return {content: eventType, class: eventClass}
    }
    return Local.get('eventTypes.' + type)
  }

  // 更新
  update(list) {
    // 更新事件项目的有效性
    const elements = list.elements
    const items = list.read()
    const length = items.length
    if (length !== 0) {
      const flags = {}
      for (let i = length - 1; i >= 0; i--) {
        const {type} = items[i]
        if (flags[type]) {
          elements[i].addClass('weak')
        } else {
          flags[type] = true
        }
      }
    }

    // 更新宿主项目的事件图标
    const item = this.editor?.target
    if (item?.events === list.read()) {
      const element = item.element
      const list = element?.parentNode
      if (list instanceof TreeList) {
        list.updateEventIcon(item)
      }
    }
  }

  // 打开
  open(event) {
    const filter = this.filter
    let callback = this.editCallback
    if (event === undefined) {
      event = Inspector.fileEvent.create(filter)
      callback = this.insertCallback
      EventEditor.inserting = true
    }
    return EventEditor.open(filter, event, callback)
  }

  // 保存
  save() {
    return EventEditor.save()
  }

  // 自定义事件类型ID正则表达式
  static guidRegExp = /^[0-9a-f]{16}$/

  // 重写历史操作保存数据方法
  static historySave(data) {
    Inspector.ParamHistory.prototype.save.call(this, data)
    if (data.type === 'inspector-param-replace') {
      delete data.oldItem.commands.symbol
    }
  }
}

// ******************************** 事件列表接口类导出 ********************************

export { EventListInterface }
