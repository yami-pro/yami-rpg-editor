'use strict'

import { CustomCommand } from '../custom-command.js'
import * as Yami from '../../yami.js'

// ******************************** 自定义指令窗口加载 ********************************

// list methods
CustomCommand.list.insert = null
CustomCommand.list.toggle = null
CustomCommand.list.copy = null
CustomCommand.list.paste = null
CustomCommand.list.delete = Yami.PluginManager.list.delete
CustomCommand.list.saveSelection = null
CustomCommand.list.restoreSelection = null
CustomCommand.list.updateNodeElement = Yami.Easing.list.updateNodeElement
CustomCommand.list.addElementClass = Yami.PluginManager.list.addElementClass
CustomCommand.list.updateTextNode = Yami.PluginManager.list.updateTextNode
CustomCommand.list.updateToggleStyle = Yami.PluginManager.list.updateToggleStyle
CustomCommand.list.createEditIcon = Yami.PluginManager.list.createEditIcon

// 初始化
CustomCommand.initialize = function () {
  // 绑定指令列表
  const {list} = this
  list.removable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.creators.push(list.updateToggleStyle)
  list.updaters.push(list.updateTextNode)
  list.creators.push(list.createEditIcon)

  // 侦听事件
  $('#command').on('close', this.windowClose)
  $('#command').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('select', this.listSelect)
  list.on('unselect', this.listUnselect)
  list.on('change', this.listChange)
  list.on('popup', this.listPopup)
  list.on('open', this.listOpen)
  list.on('pointerdown', Yami.ScriptListInterface.listPointerdown)
  $('#command-alias, #command-keywords').on('input', this.paramInput)
  $('#command-confirm').on('click', this.confirm)
  $('#command-apply').on('click', this.apply)
}

// 打开窗口
CustomCommand.open = function () {
  Yami.Window.open('command')

  // 创建数据副本
  this.data = Object.clone(Yami.Data.commands)

  // 更新列表项目
  this.list.restoreSelection()

  // 列表获得焦点
  this.list.getFocus()

  // 侦听事件
  window.on('pointerdown', this.pointerdown)
  window.on('script-change', this.scriptChange)
}

// 加载指令
CustomCommand.load = async function (item) {
  const symbol = this.symbol = Symbol()
  const meta = await Yami.Data.scripts[item.id]
  if (this.symbol === symbol) {
    this.symbol = null
    this.meta = meta
    this.loadOverview()
    const data = this.list.read()
    if (data) {
      const write = Yami.getElementWriter('command', data)
      write('alias')
      write('keywords')
      this.settingsPane.show()
    }
  }
}

// 卸载指令
CustomCommand.unload = function () {
  this.meta = null
  this.symbol = null
  this.overview.clear()
  this.overviewPane.hide()
  this.settingsPane.hide()
}

// 加载概述内容
CustomCommand.loadOverview = function () {
  const {meta} = this
  if (!meta) return
  const elements = Yami.PluginManager.createOverview(meta, true)
  const overview = this.overview.clear()
  for (const element of elements) {
    overview.appendChild(element)
  }
  this.overviewPane.show()
}

// 创建数据
CustomCommand.createData = function (id) {
  return {
    id: id,
    enabled: true,
    alias: '',
    keywords: '',
  }
}

// 获取ID匹配的数据
CustomCommand.getItemById = Yami.Easing.getItemById

// 窗口 - 关闭事件
CustomCommand.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Yami.Local.createGetter('confirmation')
    Yami.Window.confirm({
      message: get('closeUnsavedCommands'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Yami.Window.close('command')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(CustomCommand)

// 窗口 - 已关闭事件
CustomCommand.windowClosed = function (event) {
  this.list.saveSelection()
  this.data = null
  this.list.clear()
  window.off('pointerdown', this.pointerdown)
  window.off('script-change', this.scriptChange)
}.bind(CustomCommand)

// 指针按下事件
CustomCommand.pointerdown = Yami.PluginManager.pointerdown

// 脚本元数据改变事件
CustomCommand.scriptChange = function (event) {
  if (CustomCommand.meta === event.changedMeta) {
    CustomCommand.loadOverview()
  }
}

// 列表 - 键盘按下事件
CustomCommand.listKeydown = function (event) {
  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyC':
        this.copy(item)
        break
      case 'KeyV':
        this.paste()
        break
    }
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'Insert':
        this.insert(item)
        break
      case 'Slash':
        this.toggle(item)
        break
      case 'Delete':
        this.delete(item)
        break
    }
  }
}

// 列表 - 选择事件
CustomCommand.listSelect = function (event) {
  CustomCommand.load(event.value)
}

// 列表 - 取消选择事件
CustomCommand.listUnselect = function (event) {
  CustomCommand.unload()
}

// 列表 - 改变事件
CustomCommand.listChange = function (event) {
  CustomCommand.changed = true
}

// 列表 - 菜单弹出事件
CustomCommand.listPopup = function (event) {
  const item = event.value
  const selected = !!item
  const pastable = Yami.Clipboard.has('yami.data.customCommand')
  const deletable = selected
  const get = Yami.Local.createGetter('menuCustomCommandList')
  Yami.Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('edit'),
    accelerator: 'Enter',
    enabled: selected,
    click: () => {
      this.edit(item)
    },
  }, {
    label: get('insert'),
    accelerator: 'Insert',
    click: () => {
      this.insert(item)
    },
  }, {
    label: get('toggle'),
    accelerator: '/',
    enabled: selected,
    click: () => {
      this.toggle(item)
    },
  }, {
    label: get('copy'),
    accelerator: Yami.ctrl('C'),
    enabled: selected,
    click: () => {
      this.copy(item)
    },
  }, {
    label: get('paste'),
    accelerator: Yami.ctrl('V'),
    enabled: pastable,
    click: () => {
      this.paste(item)
    },
  }, {
    label: get('delete'),
    accelerator: 'Delete',
    enabled: deletable,
    click: () => {
      this.delete(item)
    },
  }])
}

// 列表 - 打开事件
CustomCommand.listOpen = function (event) {
  this.edit(event.value)
}

// 参数 - 输入事件
CustomCommand.paramInput = function (event) {
  CustomCommand.changed = true
  const data = CustomCommand.list.read()
  switch (this.id) {
    case 'command-alias':
      data.alias = this.read()
      break
    case 'command-keywords':
      data.keywords = this.read()
      break
  }
}

// 确定按钮 - 鼠标点击事件
CustomCommand.confirm = function (event) {
  this.apply()
  Yami.Window.close('command')
}.bind(CustomCommand)

// 应用按钮 - 鼠标点击事件
CustomCommand.apply = function (event) {
  if (this.changed) {
    this.changed = false

    // 保存变量数据
    let commands = this.data
    if (event instanceof Event) {
      commands = Object.clone(commands)
    } else {
      Yami.NodeList.deleteCaches(commands)
    }
    Yami.Data.commands = commands
    Yami.File.planToSave(Yami.Data.manifest.project.commands)
    Yami.Command.custom.loadCommandList()
  }
}.bind(CustomCommand)

// 列表 - 编辑
CustomCommand.list.edit = function (item) {
  Yami.Selector.open({
    filter: 'script',
    read: () => item.id,
    input: id => {
      if (item.id !== id) {
        item.id = id
        item.parameters = {}
        CustomCommand.changed = true
        // CustomCommand.parameterPane.update()
      }
      // 可能修改了文件名
      this.update()
    }
  }, false)
}

// 列表 - 插入
CustomCommand.list.insert = function (dItem) {
  Yami.Selector.open({
    filter: 'script',
    read: () => '',
    input: id => {
      this.addNodeTo(CustomCommand.createData(id), dItem)
    }
  }, false)
}

// 列表 - 开关
CustomCommand.list.toggle = function (item) {
  if (item) {
    item.enabled = !item.enabled
    this.updateToggleStyle(item)
    CustomCommand.changed = true
  }
}

// 列表 - 复制
CustomCommand.list.copy = function (item) {
  if (item) {
    Yami.Clipboard.write('yami.data.customCommand', item)
  }
}

// 列表 - 粘贴
CustomCommand.list.paste = function (dItem) {
  const copy = Yami.Clipboard.read('yami.data.customCommand')
  if (copy) {
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 保存选项状态
CustomCommand.list.saveSelection = function () {
  const {commands} = Yami.Data
  // 将数据保存在外部可以切换项目后重置
  if (commands.selection === undefined) {
    Object.defineProperty(commands, 'selection', {
      writable: true,
      value: '',
    })
  }
  const selection = this.read()
  if (selection) {
    commands.selection = selection.id
  }
}

// 列表 - 恢复选项状态
CustomCommand.list.restoreSelection = function () {
  const id = Yami.Data.commands.selection
  const item = CustomCommand.getItemById(id) ?? this.data[0]
  this.select(item)
  this.update()
  this.scrollToSelection()
}
