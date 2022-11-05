'use strict'

import * as Yami from '../yami.js'

// ******************************** 队伍窗口 ********************************

const Team = {
  // properties
  list: $('#team-list'),
  data: null,
  maximum: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  createId: null,
  createData: null,
  getItemById: null,
  unpackTeams: null,
  packTeams: null,
  // events
  windowClose: null,
  windowClosed: null,
  listKeydown: null,
  listPointerdown: null,
  listSelect: null,
  listChange: null,
  listPopup: null,
  confirm: null,
}

// ******************************** 队伍窗口加载 ********************************

// list methods
Team.list.insert = null
Team.list.copy = null
Team.list.paste = null
Team.list.delete = null
Team.list.saveSelection = null
Team.list.restoreSelection = null
Team.list.updateNodeElement = Yami.Easing.list.updateNodeElement
Team.list.createIcon = null
Team.list.updateIcon = null
Team.list.updateItemName = Yami.Easing.list.updateItemName
Team.list.addElementClass = Yami.Easing.list.addElementClass
Team.list.updateTextNode = Yami.Easing.list.updateTextNode
Team.list.createMark = null
Team.list.updateMark = null

// 初始化
Team.initialize = function () {
  // 设置最大数量
  this.maximum = 256

  // 绑定队伍列表
  const {list} = this
  list.removable = true
  list.renamable = true
  list.bind(() => this.data)
  list.creators.push(list.addElementClass)
  list.creators.push(list.createIcon)
  list.updaters.push(list.updateTextNode)
  list.creators.push(list.createMark)
  list.updaters.push(list.updateMark)

  // 侦听事件
  $('#team').on('close', this.windowClose)
  $('#team').on('closed', this.windowClosed)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('select', this.listSelect)
  list.on('change', this.listChange)
  list.on('popup', this.listPopup)
  $('#team-confirm').on('click', this.confirm)
}

// 打开窗口
Team.open = function (data) {
  Yami.Window.open('team')

  // 解包队伍数据
  this.unpackTeams()

  // 更新列表项目
  this.list.restoreSelection()

  // 列表获得焦点
  this.list.getFocus()
}

// 创建ID
Team.createId = function () {
  let id
  do {id = Yami.GUID.generate64bit()}
  while (this.getItemById(id))
  return id
}

// 创建数据
Team.createData = function () {
  const id = this.createId()
  const relations = {}
  const teams = this.data
  const length = teams.length
  for (let i = 0; i < length; i++) {
    relations[teams[i].id] = 0
  }
  relations[id] = 1
  return {
    id: id,
    name: '',
    color: '000000ff',
    relations: relations,
  }
}

// 获取ID匹配的数据
Team.getItemById = Yami.Easing.getItemById

// 解包队伍数据
Team.unpackTeams = function () {
  const code = Yami.Data.teams.relations
  const items = Yami.Data.teams.list
  const length = items.length
  const sRelations = Yami.Codec.decodeRelations(code, length)
  const copies = new Array(length)
  const a = length * 2
  for (let i = 0; i < length; i++) {
    const item = items[i]
    const dRelations = {}
    for (let j = 0; j < i; j++) {
      const ri = (a - j + 1) / 2 * j - j + i
      dRelations[items[j].id] = sRelations[ri]
    }
    const b = (a - i + 1) / 2 * i - i
    for (let j = i; j < length; j++) {
      const ri = b + j
      dRelations[items[j].id] = sRelations[ri]
    }
    copies[i] = {
      id: item.id,
      name: item.name,
      color: item.color,
      relations: dRelations,
    }
  }
  this.data = copies
}

// 打包队伍数据
Team.packTeams = function () {
  const items = this.data
  const length = items.length
  const copies = new Array(length)
  const dRelations = Yami.GL.arrays[0].uint8
  let ri = 0
  for (let i = 0; i < length; i++) {
    const item = items[i]
    const sRelations = item.relations
    for (let j = i; j < length; j++) {
      dRelations[ri++] = sRelations[items[j].id]
    }
    copies[i] = {
      id: item.id,
      name: item.name,
      color: item.color,
    }
  }
  const code = Yami.Codec.encodeRelations(
    new Uint8Array(dRelations.buffer, 0, ri)
  )
  Yami.Data.teams.list = copies
  Yami.Data.teams.relations = code
  Yami.Data.createTeamMap()
}

// 窗口 - 关闭事件
Team.windowClose = function (event) {
  if (Team.changed) {
    event.preventDefault()
    const get = Yami.Local.createGetter('confirmation')
    Yami.Window.confirm({
      message: get('closeUnsavedTeams'),
    }, [{
      label: get('yes'),
      click: () => {
        Team.changed = false
        Yami.Window.close('team')
      },
    }, {
      label: get('no'),
    }])
  }
}

// 窗口 - 已关闭事件
Team.windowClosed = function (event) {
  this.data = null
  this.list.clear()
}.bind(Team)

// 列表 - 键盘按下事件
Team.listKeydown = function (event) {
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
      case 'Delete':
        this.delete(item)
        break
    }
  }
}

// 列表 - 指针按下事件
Team.listPointerdown = function (event) {
  switch (event.button) {
    case 0:
      // 设置队伍颜色
      if (event.target.hasClass('team-icon')) {
        const element = event.target.parentNode
        const team = element.item
        return Yami.Color.open({
          read: () => {
            return team.color
          },
          input: color => {
            team.color = color
            this.updateIcon(team)
            Team.changed = true
          }
        })
      }
      // 设置队伍关系
      if (event.target.hasClass('team-mark')) {
        const element = event.target.parentNode
        const teamA = this.read()
        const teamB = element.item
        if (teamA !== teamB) {
          teamA.relations[teamB.id] ^= 1
          teamB.relations[teamA.id] ^= 1
          this.updateMark(teamB)
          Team.changed = true
        }
      }
      break
  }
}

// 列表 - 选择事件
Team.listSelect = function (event) {
  // 更新队伍关系
  for (const team of this.data) {
    const element = team.element
    if (element !== undefined) {
      element.changed = true
      if (element.parentNode) {
        this.updateMark(team)
      }
    }
  }
}

// 列表 - 改变事件
Team.listChange = function (event) {
  Team.changed = true
}

// 列表 - 菜单弹出事件
Team.listPopup = function (event) {
  const item = event.value
  const length = Team.data.length
  const selected = !!item
  const insertable = length < Team.maximum
  const pastable = insertable && Clipboard.has('yami.data.team')
  const deletable = selected && length > 1
  const get = Yami.Local.createGetter('menuTeamList')
  Yami.Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('insert'),
    accelerator: 'Insert',
    enabled: insertable,
    click: () => {
      this.insert(item)
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
  }, {
    label: get('rename'),
    accelerator: 'F2',
    enabled: selected,
    click: () => {
      this.rename(item)
    },
  }])
}

// 确定按钮 - 鼠标点击事件
Team.confirm = function (event) {
  if (this.changed) {
    this.changed = false
    this.packTeams()
    Yami.File.planToSave(Yami.Data.manifest.project.teams)
    const datachange = new Event('datachange')
    datachange.key = 'teams'
    window.dispatchEvent(datachange)
  }
  Yami.Window.close('team')
}.bind(Team)

// 列表 - 插入
Team.list.insert = function (dItem) {
  if (this.data.length < Team.maximum) {
    const team = Team.createData()
    const id = team.id
    for (const item of this.data) {
      item.relations[id] = 0
    }
    this.addNodeTo(team, dItem)
  }
}

// 列表 - 复制
Team.list.copy = function (item) {
  if (item) {
    Clipboard.write('yami.data.team', item)
  }
}

// 列表 - 粘贴
Team.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.data.team')
  if (copy) {
    const dId = Team.createId()
    const cRelations = copy.relations
    const dRelations = {}
    for (const item of this.data) {
      const sId = item.id
      const sRelations = item.relations
      const code = cRelations[sId] ?? 0
      sRelations[dId] = code
      dRelations[sId] = code
    }
    dRelations[dId] = 1
    copy.name += ' - Copy'
    copy.id = dId
    copy.relations = dRelations
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
Team.list.delete = function (item) {
  const items = this.data
  if (items.length > 1) {
    const get = Yami.Local.createGetter('confirmation')
    Yami.Window.confirm({
      message: get('deleteSingleFile').replace('<filename>', item.name),
    }, [{
      label: get('yes'),
      click: () => {
        const id = item.id
        for (const item of items) {
          delete item.relations[id]
        }
        const index = items.indexOf(item)
        this.deleteNode(item)
        const last = items.length - 1
        this.select(items[Math.min(index, last)])
      },
    }, {
      label: get('no'),
    }])
  }
}

// 列表 - 保存选项状态
Team.list.saveSelection = function () {
  const {teams} = Yami.Data
  // 将数据保存在外部可以切换项目后重置
  if (teams.selection === undefined) {
    Object.defineProperty(teams, 'selection', {
      writable: true,
      value: '',
    })
  }
  const selection = this.read()
  if (selection) {
    teams.selection = selection.id
  }
}

// 列表 - 恢复选项状态
Team.list.restoreSelection = function () {
  const id = Yami.Data.teams.selection
  const item = Team.getItemById(id) ?? this.data[0]
  this.select(item)
  this.update()
  this.scrollToSelection()
}

// 列表 - 重写创建图标方法
Team.list.createIcon = function (item) {
  const {element} = item
  const icon = document.createElement('node-icon')
  icon.addClass('team-icon')
  element.nodeIcon = icon
  element.insertBefore(icon, element.textNode)
  Team.list.updateIcon(item)
}

// 列表 - 更新图标
Team.list.updateIcon = function (item) {
  const icon = item.element.nodeIcon
  const color = item.color
  if (icon.color !== color) {
    icon.color = color
    const r = parseInt(color.slice(0, 2), 16)
    const g = parseInt(color.slice(2, 4), 16)
    const b = parseInt(color.slice(4, 6), 16)
    const a = parseInt(color.slice(6, 8), 16) / 255
    icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`
  }
}

// 列表 - 创建标记
Team.list.createMark = function (item) {
  const {element} = item
  const mark = document.createElement('text')
  mark.addClass('team-mark')
  element.mark = mark
  element.appendChild(mark)
}

// 列表 - 更新标记
Team.list.updateMark = function (item) {
  const selection = Team.list.read()
  if (selection === null) return
  const mark = item.element.mark
  const relations = selection.relations
  const relation = relations[item.id]
  if (mark.relation !== relation) {
    mark.relation = relation
    switch (relation) {
      case 0:
        mark.removeClass('friend')
        mark.addClass('enemy')
        mark.textContent = '\uf119'
        break
      case 1:
        mark.removeClass('enemy')
        mark.addClass('friend')
        mark.textContent = '\uf118'
        break
    }
  }
}

// ******************************** 队伍窗口导出 ********************************

export { Team }
