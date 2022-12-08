"use strict"

import {
  AttributeListInterface,
  Command,
  Data,
  File,
  getElementWriter,
  Inspector,
  Local,
  Selector,
  Title,
  Window,
  IObject
} from "../yami"

// ******************************** 项目设置窗口 ********************************

const Project = {
  // properties
  data: null,
  changed: false,
  importedFonts: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClose: null,
  windowClosed: null,
  dataChange: null,
  paramInput: null,
  confirm: null,
}

// ******************************** 项目设置窗口加载 ********************************

// 初始化
Project.initialize = function () {
  // 创建窗口显示模式选项
  $('#config-window-display').loadItems([
    {name: 'Window', value: 'window'},
    {name: 'Maximized', value: 'maximized'},
    {name: 'Fullscreen', value: 'fullscreen'},
  ])

  // 创建角色碰撞选项
  $('#config-collision-actor-enabled').loadItems([
    {name: 'Enabled', value: true},
    {name: 'Disabled', value: false},
  ])

  // 设置角色碰撞关联元素
  $('#config-collision-actor-enabled').enableHiddenMode().relate([
    {case: true, targets: [$('#config-collision-actor-ignoreTeamMember')]},
  ])

  // 创建忽略队友选项
  $('#config-collision-actor-ignoreTeamMember').loadItems([
    {name: 'Enabled', value: true},
    {name: 'Disabled', value: false},
  ])

  // 创建场景碰撞选项
  $('#config-collision-scene-enabled').loadItems([
    {name: 'Enabled', value: true},
    {name: 'Disabled', value: false},
  ])

  // 设置场景碰撞关联元素
  $('#config-collision-scene-enabled').enableHiddenMode().relate([
    {case: true, targets: [$('#config-collision-scene-actorSize')]},
  ])

  // 绑定导入字体列表
  $('#config-font-imports').bind(this.importedFonts)

  // 创建字体像素化渲染选项
  $('#config-font-pixelated').loadItems([
    {name: 'Enabled', value: true},
    {name: 'Disabled', value: false},
  ])

  // 设置字体像素化渲染关联元素
  $('#config-font-pixelated').enableHiddenMode().relate([
    {case: true, targets: [$('#config-font-threshold')]},
  ])

  // 创建队伍包裹模式选项
  $('#config-actor-partyInventory').loadItems([
    {name: 'Share the Player\'s Inventory', value: 'shared'},
    {name: 'Use Separate Inventorys', value: 'separate'},
  ])

  // 绑定角色临时属性列表
  $('#config-actor-tempAttributes').bind(new AttributeListInterface())


  // 创建脚本语言选项
  $('#config-script-language').loadItems([
    {name: 'JavaScript', value: 'javascript'},
    {name: 'TypeScript', value: 'typescript'},
  ])

  // 设置脚本语言关联元素
  $('#config-script-language').enableHiddenMode().relate([
    {case: 'typescript', targets: [$('#config-script-outDir')]},
  ])

  // 侦听事件
  $('#project-settings').on('close', this.windowClose)
  $('#project-settings').on('closed', this.windowClosed)
  $('#project-settings').on('change', this.dataChange)
  $('#project-confirm').on('click', this.confirm)
  $(`#config-window-title, #config-window-width, #config-window-height,
    #config-window-display, #config-resolution-width, #config-resolution-height,
    #config-scene-padding, #config-scene-animationInterval,
    #config-tileArea-expansionTop, #config-tileArea-expansionLeft,
    #config-tileArea-expansionRight, #config-tileArea-expansionBottom,
    #config-animationArea-expansionTop, #config-animationArea-expansionLeft,
    #config-animationArea-expansionRight, #config-animationArea-expansionBottom,
    #config-lightArea-expansionTop, #config-lightArea-expansionLeft,
    #config-lightArea-expansionRight, #config-lightArea-expansionBottom,
    #config-collision-actor-enabled, #config-collision-actor-ignoreTeamMember,
    #config-collision-scene-enabled, #config-collision-scene-actorSize,
    #config-font-default, #config-font-pixelated, #config-font-threshold,
    #config-event-startup, #config-event-loadGame, #config-event-initScene,
    #config-event-showText, #config-event-showChoices,
    #config-actor-playerTeam, #config-actor-playerActor,
    #config-actor-partyMembers-0, #config-actor-partyMembers-1,
    #config-actor-partyMembers-2, #config-actor-partyMembers-3,
    #config-actor-partyInventory,
    #config-animation-frameRate, #config-script-language, #config-script-outDir`
  ).on('input', this.paramInput)
}

// 打开窗口
Project.open = function () {
  Window.open('project-settings')

  // 创建数据副本
  this.data = IObject.clone(Data.config)

  // 创建队伍选项
  const items = Data.createTeamItems()
  $('#config-actor-playerTeam').loadItems(items)

  // 写入数据
  const write = getElementWriter('config', this.data)
  write('window-title')
  write('window-width')
  write('window-height')
  write('window-display')
  write('resolution-width')
  write('resolution-height')
  write('scene-padding')
  write('scene-animationInterval')
  write('tileArea-expansionTop')
  write('tileArea-expansionLeft')
  write('tileArea-expansionRight')
  write('tileArea-expansionBottom')
  write('animationArea-expansionTop')
  write('animationArea-expansionLeft')
  write('animationArea-expansionRight')
  write('animationArea-expansionBottom')
  write('lightArea-expansionTop')
  write('lightArea-expansionLeft')
  write('lightArea-expansionRight')
  write('lightArea-expansionBottom')
  write('collision-actor-enabled')
  write('collision-actor-ignoreTeamMember')
  write('collision-scene-enabled')
  write('collision-scene-actorSize')
  write('font-imports')
  write('font-default')
  write('font-pixelated')
  write('font-threshold')
  write('event-startup')
  write('event-loadGame')
  write('event-initScene')
  write('event-showText')
  write('event-showChoices')
  write('actor-playerTeam')
  write('actor-playerActor')
  write('actor-partyMembers-0')
  write('actor-partyMembers-1')
  write('actor-partyMembers-2')
  write('actor-partyMembers-3')
  write('actor-partyInventory')
  write('actor-tempAttributes')
  write('animation-frameRate')
  write('script-language')
  write('script-outDir')
}

// 窗口 - 关闭事件
Project.windowClose = function (event) {
  if (Project.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedProjectSettings'),
    }, [{
      label: get('yes'),
      click: () => {
        Project.changed = false
        Window.close('project-settings')
      },
    }, {
      label: get('no'),
    }])
  }
}

// 窗口 - 已关闭事件
Project.windowClosed = function (event) {
  Project.data = null
}

// 数据 - 改变事件
Project.dataChange = function (event) {
  this.changed = true
  console.log(event)
}.bind(Project)

// 参数 - 输入事件
Project.paramInput = function (event) {
  const key = Inspector.getKey(this)
  const value = this.read()
  const keys = key.split('-')
  const end = keys.length - 1
  let node = Project.data
  for (let i = 0; i < end; i++) {
    node = node[keys[i]]
  }
  const property = keys[end]
  if (node[property] !== value) {
    node[property] = value
  }
}

// 确定按钮 - 鼠标点击事件
Project.confirm = function (event) {
  if (this.changed) {
    this.changed = false
    const last = Data.config
    const title1 = Data.config.window.title
    const title2 = this.data.window.title
    Data.config = this.data
    File.planToSave(Data.manifest.project.config)
    // 更新标题名称
    if (title1 !== title2) {
      Title.updateTitleName()
    }
    const datachange = new Event('datachange')
    datachange.key = 'config'
    datachange.last = last
    window.dispatchEvent(datachange)
  }
  Window.close('project-settings')
}.bind(Project)

// 导入字体列表接口
Project.importedFonts = {
  fontId: null,
  filter: 'font',
  initialize: function () {},
  parse: function (fontId) {
    return Command.parseFileName(fontId)
  },
  open: function (fontId = '') {
    this.fontId = fontId
    Selector.open(this, false)
  },
  save: function () {
    return this.fontId
  },
  read: function () {
    return this.fontId
  },
  input: function (fontId) {
    this.fontId = fontId
    this.target.save()
  },
}

// ******************************** 项目设置窗口导出 ********************************

export { Project }
