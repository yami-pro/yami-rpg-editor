'use strict'

// ******************************** 日志窗口 ********************************

const Log = {
  // properties
  box: $('#log-message'),
  list: [],
  devmode: process.argv.includes('--debug-mode'),
  // methods
  initialize: null,
  throw: null,
  print: null,
  clear: null,
  update: null,
  tick: null,
  // events
  catchError: null,
  catchRejection: null,
  tscLog: null,
}

// 初始化
Log.initialize = function () {
  // 定期检查
  setInterval(this.tick, 1000)

  // 侦听事件
  window.on('error', this.catchError)
  window.on('unhandledrejection', this.catchRejection)
  require('electron').ipcRenderer.on('tsc-log', this.tscLog)
}

// 抛出错误
Log.throw = function (error) {
  if (this.devmode) {
    throw error
  } else {
    console.error(error)
  }
}

// 输出消息
Log.print = function (item) {
  if (this.list.length < 50) {
    this.list.push(item)
    this.update()
  }
}

// 清除消息
Log.clear = function () {
  this.list.length = 0
  this.update()
}

// 更新消息
Log.update = function () {
  const {box, list} = this
  box.clear()
  if (list.length !== 0) {
    for (const item of list) {
      const text = document.createElement('log-item')
      text.innerHTML = item.message
      text.addClass(item.type)
      box.appendChild(text)
      for (const path of box.querySelectorAll('log-path')) {
        path.onclick = () => {
          const LINE = path.nextElementSibling
          const COLUMN = LINE.nextElementSibling
          const file = File.route(path.textContent)
          const line = parseInt(LINE.textContent)
          const column = parseInt(COLUMN.textContent)
          require('electron').ipcRenderer
          .send('open-vscode', file, line, column)
        }
      }
    }
    box.addClass('open')
  } else {
    box.removeClass('open')
  }
}

// 定期检查
Log.tick = function () {
  let changed = false
  const list = Log.list
  let i = list.length
  while (--i >= 0) {
    const item = list[i]
    item.duration -= 1
    if (item.duration <= 0) {
      list.splice(i, 1)
      changed = true
    }
  }
  if (changed) {
    Log.update()
  }
}

// 捕获同步错误事件
Log.catchError = function (event) {
  if (Editor.state === 'open') {
    Log.print({
      type: 'error',
      message: event.message,
      duration: 6,
    })
  }
}

// 捕获异步错误事件
Log.catchRejection = function (event) {
  if (Editor.state === 'open') {
    Log.print({
      type: 'error',
      message: event.reason,
      duration: 6,
    })
  }
}

// TSC输出日志
Log.tscLog = function (event, tscMessage) {
  let duration = 6
  // 清除无效的终端输出格式字符
  let message = tscMessage.replace('[2J[3J[H', '').trim()
  if (message.includes('Starting')) {
    Log.clear()
    duration = 6
  } else if (message.includes('Found 0 errors')) {
    duration = 6
  } else if (message.includes('error TS')) {
    message = message.replace(/^([^\s]+\.ts)\((\d+),(\d+)\)/mg, (match, path, line, column) => {
      const index = path.lastIndexOf('/')
      if (index !== -1) {
        path = `${path.slice(0, index + 1)}<log-strong>${path.slice(index + 1)}</log-strong>`
      }
      return `<log-path>${path}</log-path>(<log-num>${line}</log-num>,<log-num>${column}</log-num>)`
    })
    message = message.replace(/(error TS\d+)/g, '<log-weak>$1</log-weak>')
    duration = Infinity
  } else if (message.includes('Watching for file changes')) {
    duration = Infinity
  }
  Log.print({
    type: 'log',
    message: message,
    duration: duration,
  })
}

// ******************************** 更新日志窗口 ********************************

const UpdateLog = {
  // properties
  content: $('#update-log-content'),
  // methods
  open: null,
  update: null,
  // events
  windowClosed: null,
}

// 初始化
UpdateLog.initialize = function () {
  // 侦听事件
  $('#update-log').on('closed', this.windowClosed)
}

// 关闭窗口

// 打开窗口
UpdateLog.open = function (items = null) {
  if (items instanceof Array) {
    Window.open('update-log')
    this.update(items)
  } else {
    Updater.updateIncrementalChanges(Editor.latestProjectVersion)
  }
}

// 更新内容
UpdateLog.update = function (items) {
  this.content.clear()
  for (const item of items) {
    if (item.title) {
      const title = document.createElement('text')
      title.textContent = item.title
      title.addClass('update-log-title')
      this.content.appendChild(title)
    }
    if (item.major) {
      const major = document.createElement('text')
      major.textContent = item.major
      major.addClass('update-log-major')
      this.content.appendChild(major)
    }
    if (item.minor) {
      const minor = document.createElement('text')
      minor.textContent = item.minor
      minor.addClass('update-log-minor')
      this.content.appendChild(minor)
    }
  }
}

// 窗口 - 已关闭事件
UpdateLog.windowClosed = function () {
  UpdateLog.content.clear()
}

// ******************************** 相关引用 ********************************

const Reference = {
  // properties
  keydownMap: new Map(),
  keyupMap: new Map(),
  pointerdownMap: new Map(),
  pointermoveMap: new Map(),
  // methods
  initialize: null,
  findAllGuids: null,
  filterUselessComments: null,
  findRelated: null,
  openRelated: null,
  findInvalid: null,
  openInvalid: null,
  findUnused: null,
  openUnused: null,
  openList: null,
  update: null,
  // events
  windowClosed: null,
  listSelect: null,
  getKeydownListener: null,
  getKeyupListener: null,
  getPointerdownListener: null,
  getPointermoveListener: null,
}

// 初始化
Reference.initialize = function () {
  // 侦听事件
  $('#reference').on('closed', this.windowClosed)
  $('#reference-list').on('popup', this.listPopup)
}

// 查找全部GUID
Reference.findAllGuids = function (targetGuid = '') {
  // 已使用的GUID
  const usedMap = {}
  // 预设对象的GUID
  const innerMap = {}
  // 外部对象的GUID
  const outerMap = {}
  const guidInText = /<(?:ref|image|global|global:):([0-9a-f]{16})>/g
  const guidInJSON = /"([0-9a-f]{16})\\?"|<(?:ref|image|global|global:):([0-9a-f]{16})>/g
  const guidInScript = /"[0-9a-f]{16}"|'[0-9a-f]{16}'/g
  const guidMap = Data.manifest.guidMap
  const {scenePresets, uiPresets} = Data
  const get = Local.createGetter('reference')
  let fileId = ''
  let order = 0
  const resetFileId = () => {
    fileId = ''
  }
  const pushComment = comment => {
    comment = '******************** ' + comment + ' ********************'
    usedMap['@' + order] = {
      type: 'comment',
      text: comment,
      order: order,
    }
    outerMap['@' + (order + 1)] = {
      type: 'comment',
      text: comment,
    }
    order += 2
  }
  let pushToUsedMap = (path, guid) => {
    if (guid) {
      const text = `${path} : #${guid}`
      const usedList = usedMap[guid] ??= []
      let existing = false
      for (const item of usedList) {
        if (item.text === text) {
          item.count++
          existing = true
          break
        }
      }
      if (!existing) {
        usedList.append({
          type: 'path',
          id: fileId,
          text: text,
          order: order++,
          count: 1,
        })
      }
      if (guid in scenePresets) {
        const id = scenePresets[guid].sceneId
        if (usedMap[id] === undefined) {
          usedMap[id] = []
        }
      }
      if (guid in uiPresets) {
        const id = uiPresets[guid].uiId
        if (usedMap[id] === undefined) {
          usedMap[id] = []
        }
      }
    }
  }
  const pushToUsedMap2 = (path, name, guid) => {
    if (guid) pushToUsedMap(`${path}/${name}`, guid)
  }
  let pushToInnerMap = (path, guid) => {
    if (guid) innerMap[guid] = true
  }
  let pushToOuterMap = (path, guid, fileGuid) => {
    if (guid) outerMap[guid] = {
      type: 'path',
      id: fileGuid ?? guid,
      text: path,
    }
  }
  if (targetGuid) {
    const _pushToUsedMap = pushToUsedMap
    pushToUsedMap = (path, guid) => {
      if (guid === targetGuid) {
        _pushToUsedMap(path, guid)
      }
    }
    pushToInnerMap = Function.empty
    pushToOuterMap = Function.empty
  }
  const getPathOfGuid = guid => {
    fileId = guid
    return guidMap[guid]?.file.aliasPath ?? 'unknown-path'
  }
  const searchLocalEvents = (events, dir) => {
    for (const event of events) {
      const path = `${dir}/events/${event.type}`
      const json = JSON.stringify(event)
      let match
      while (match = guidInJSON.exec(json)) {
        pushToUsedMap(path, match[1] ?? match[2])
      }
    }
  }
  const searchLocalScripts = (scripts, dir) => {
    for (const script of scripts) {
      const path = `${dir}/scripts/${script.id}`
      const json = JSON.stringify(script)
      let match
      while (match = guidInJSON.exec(json)) {
        pushToUsedMap(path, match[1] ?? match[2])
      }
    }
  }
  const searchText = (text, dir, name) => {
    let match
    while (match = guidInText.exec(text)) {
      pushToUsedMap2(dir, name, match[1])
    }
  }
  const searchList = (dataList, dir, name) => {
    if (dataList.length === 0) return
    const json = JSON.stringify(dataList)
    let match
    while (match = guidInJSON.exec(json)) {
      pushToUsedMap2(dir, name, match[1] ?? match[2])
    }
  }
  const searchData = (data, dir, name) => {
    const json = JSON.stringify(data)
    let match
    while (match = guidInJSON.exec(json)) {
      pushToUsedMap2(dir, name, match[1] ?? match[2])
    }
  }
  const searchEvents = () => {
    pushComment(get('event'))
    for (const event of Object.values(Data.events)) {
      const path = getPathOfGuid(event.guid)
      if (event.type === 'common') {
        pushToOuterMap(path, event.guid)
      } else {
        pushToInnerMap(path, event.guid)
      }
      const json = JSON.stringify(event)
      let match
      while (match = guidInJSON.exec(json)) {
        pushToUsedMap(path, match[1] ?? match[2])
      }
    }
  }
  const searchUIs = () => {
    pushComment(get('ui'))
    const searchUIElements = (nodes, dir) => {
      for (const node of nodes) {
        const path = `${dir}/${node.name}`
        pushToInnerMap(path, node.presetId)
        switch (node.class) {
          case 'text':
          case 'dialogbox':
            break
          case 'image':
          case 'progressbar':
            pushToUsedMap2(path, 'image', node.image)
            break
          case 'button':
            searchText(node.content, path, 'content')
            pushToUsedMap2(path, 'normalImage', node.normalImage)
            pushToUsedMap2(path, 'hoverImage', node.hoverImage)
            pushToUsedMap2(path, 'activeImage', node.activeImage)
            pushToUsedMap2(path, 'hoverSound', node.hoverSound)
            pushToUsedMap2(path, 'clickSound', node.clickSound)
            break
          case 'animation':
            pushToUsedMap2(path, 'animation', node.animation)
            pushToUsedMap2(path, 'motion', node.motion)
            break
          case 'video':
            pushToUsedMap2(path, 'video', node.video)
            break
          case 'reference':
            pushToUsedMap2(path, 'prefabId', node.prefabId)
            break
        }
        searchLocalEvents(node.events, path)
        searchLocalScripts(node.scripts, path)
        searchUIElements(node.children, path)
      }
    }
    for (const ui of Object.values(Data.ui)) {
      const path = getPathOfGuid(ui.guid)
      pushToOuterMap(path, ui.guid)
      searchUIElements(ui.nodes, path)
    }
  }
  const searchScenes = () => {
    pushComment(get('scene'))
    const searchSceneObjects = (nodes, dir) => {
      for (const node of nodes) {
        const path = `${dir}/${node.name}`
        switch (node.class) {
          case 'folder':
            searchSceneObjects(node.children, path)
            continue
          case 'actor':
            pushToUsedMap2(path, 'actorId', node.actorId)
            pushToUsedMap2(path, 'teamId', node.teamId)
            break
          case 'light':
            pushToUsedMap2(path, 'mask', node.mask)
            break
          case 'animation':
            pushToUsedMap2(path, 'animationId', node.animationId)
            pushToUsedMap2(path, 'motion', node.motion)
            break
          case 'particle':
            pushToUsedMap2(path, 'particleId', node.particleId)
            break
          case 'parallax':
            pushToUsedMap2(path, 'image', node.image)
            break
          case 'tilemap':
            searchData(node.tilesetMap, path, 'tilesetMap')
            break
        }
        pushToInnerMap(path, node.presetId)
        searchList(node.conditions, path, 'conditions')
        searchLocalEvents(node.events, path)
        searchLocalScripts(node.scripts, path)
      }
    }
    for (const scene of Object.values(Data.scenes)) {
      const path = getPathOfGuid(scene.guid)
      pushToOuterMap(path, scene.guid)
      searchLocalEvents(scene.events, path)
      searchLocalScripts(scene.scripts, path)
      searchSceneObjects(scene.objects, path)
    }
  }
  const searchActors = () => {
    pushComment(get('actor'))
    for (const actor of Object.values(Data.actors)) {
      const path = getPathOfGuid(actor.guid)
      pushToOuterMap(path, actor.guid)
      pushToUsedMap2(path, 'portrait', actor.portrait)
      pushToUsedMap2(path, 'animationId', actor.animationId)
      pushToUsedMap2(path, 'idleMotion', actor.idleMotion)
      pushToUsedMap2(path, 'moveMotion', actor.moveMotion)
      pushToUsedMap2(path, 'inherit', actor.inherit)
      searchList(actor.sprites, path, 'sprites')
      searchList(actor.attributes, path, 'attributes')
      searchList(actor.skills, path, 'skills')
      searchList(actor.equipments, path, 'equipments')
      searchList(actor.inventory, path, 'inventory')
      searchLocalEvents(actor.events, path)
      searchLocalScripts(actor.scripts, path)
    }
  }
  const searchSkills = () => {
    pushComment(get('skill'))
    for (const skill of Object.values(Data.skills)) {
      const path = getPathOfGuid(skill.guid)
      pushToOuterMap(path, skill.guid)
      pushToUsedMap2(path, 'inherit', skill.inherit)
      searchList(skill.attributes, path, 'attributes')
      searchLocalEvents(skill.events, path)
      searchLocalScripts(skill.scripts, path)
    }
  }
  const searchTriggers = () => {
    pushComment(get('trigger'))
    for (const trigger of Object.values(Data.triggers)) {
      const path = getPathOfGuid(trigger.guid)
      pushToOuterMap(path, trigger.guid)
      pushToUsedMap2(path, 'inherit', trigger.inherit)
      pushToUsedMap2(path, 'animationId', trigger.animationId)
      pushToUsedMap2(path, 'motion', trigger.motion)
      searchLocalEvents(trigger.events, path)
      searchLocalScripts(trigger.scripts, path)
    }
  }
  const searchItems = () => {
    pushComment(get('item'))
    for (const item of Object.values(Data.items)) {
      const path = getPathOfGuid(item.guid)
      pushToOuterMap(path, item.guid)
      pushToUsedMap2(path, 'inherit', item.inherit)
      searchList(item.attributes, path, 'attributes')
      searchLocalEvents(item.events, path)
      searchLocalScripts(item.scripts, path)
    }
  }
  const searchEquipments = () => {
    pushComment(get('equipment'))
    for (const equipment of Object.values(Data.equipments)) {
      const path = getPathOfGuid(equipment.guid)
      pushToOuterMap(path, equipment.guid)
      pushToUsedMap2(path, 'inherit', equipment.inherit)
      searchList(equipment.attributes, path, 'attributes')
      searchLocalEvents(equipment.events, path)
      searchLocalScripts(equipment.scripts, path)
    }
  }
  const searchStates = () => {
    pushComment(get('state'))
    for (const state of Object.values(Data.states)) {
      const path = getPathOfGuid(state.guid)
      pushToOuterMap(path, state.guid)
      pushToUsedMap2(path, 'inherit', state.inherit)
      searchList(state.attributes, path, 'attributes')
      searchLocalEvents(state.events, path)
      searchLocalScripts(state.scripts, path)
    }
  }
  const searchAnimations = () => {
    pushComment(get('animation'))
    const animations = Object.values(Data.animations)
    for (const animation of animations) {
      const path = getPathOfGuid(animation.guid)
      pushToOuterMap(path, animation.guid)
    }
    pushComment(get('motion'))
    for (const animation of animations) {
      const {motions} = animation
      const path = getPathOfGuid(animation.guid)
      for (let i = 0; i < motions.length; i++) {
        const path2 = `${path}/motions/${i}`
        const motion = motions[i]
        const json = JSON.stringify(motion)
        let match
        while (match = guidInJSON.exec(json)) {
          pushToUsedMap(path2, match[1] ?? match[2])
        }
      }
    }
    pushComment(get('sprite'))
    for (const animation of animations) {
      const {sprites} = animation
      const path = getPathOfGuid(animation.guid)
      for (let i = 0; i < sprites.length; i++) {
        const sprite = sprites[i]
        const path2 = `${path}/sprites/${i}:${sprite.name}`
        pushToOuterMap(path2, sprite.id, animation.guid)
        pushToUsedMap(path2, sprite.image)
      }
    }
  }
  const searchParticles = () => {
    pushComment(get('particle'))
    for (const particle of Object.values(Data.particles)) {
      const path = getPathOfGuid(particle.guid)
      pushToOuterMap(path, particle.guid)
      const {layers} = particle
      for (let i = 0; i < layers.length; i++) {
        const path2 = `${path}/layers/${i}`
        const motion = layers[i]
        const json = JSON.stringify(motion)
        let match
        while (match = guidInJSON.exec(json)) {
          pushToUsedMap(path2, match[1] ?? match[2])
        }
      }
    }
  }
  const searchTilesets = () => {
    pushComment(get('tileset'))
    const ignoreMap = {}
    for (const template of Data.autotiles) {
      ignoreMap[template.id] = true
    }
    for (const tileset of Object.values(Data.tilesets)) {
      const path = getPathOfGuid(tileset.guid)
      pushToOuterMap(path, tileset.guid)
      const json = JSON.stringify(tileset)
      let match
      while (match = guidInJSON.exec(json)) {
        const guid = match[1] ?? match[2]
        if (!ignoreMap[guid]) {
          pushToUsedMap(path, guid)
        }
      }
    }
  }
  const searchVariables = () => {
    resetFileId()
    pushComment(get('variable'))
    const dir = 'Data/variables.json'
    const searchItems = (items, dir) => {
      for (const item of items) {
        const path = `${dir}/${item.name}`
        if (item.class === 'folder') {
          searchItems(item.children, path)
          continue
        }
        pushToOuterMap(path, item.id)
        const text = item.name + ',' + item.value + ',' + item.note
        let match
        while (match = guidInText.exec(text)) {
          pushToUsedMap(path, match[1])
        }
      }
    }
    searchItems(Data.variables, dir)
  }
  const searchAttributes = () => {
    resetFileId()
    pushComment(get('attribute'))
    const dir = 'Data/attribute.json'
    const searchItems = (items, dir) => {
      for (const item of items) {
        const path = `${dir}/${item.name}`
        if (item.class === 'folder') {
          pushToInnerMap(path, item.id)
          searchItems(item.children, path)
          continue
        }
        pushToOuterMap(path, item.id)
        pushToUsedMap2(path, 'enum', item.enum)
        const text = item.name + ',' + item.key + ',' + item.note
        let match
        while (match = guidInText.exec(text)) {
          pushToUsedMap(path, match[1])
        }
      }
    }
    searchItems(Data.attribute.keys, dir)
  }
  const searchEnumerations = () => {
    resetFileId()
    pushComment(get('enumeration'))
    const dir = 'Data/enumeration.json'
    const searchItems = (items, dir) => {
      for (const item of items) {
        const path = `${dir}/${item.name}`
        if (item.class === 'folder') {
          pushToInnerMap(path, item.id)
          searchItems(item.children, path)
          continue
        }
        pushToOuterMap(path, item.id)
        const text = item.name + ',' + item.value + ',' + item.note
        let match
        while (match = guidInText.exec(text)) {
          pushToUsedMap(path, match[1])
        }
      }
    }
    searchItems(Data.enumeration.strings, dir)
  }
  const searchLocalization = () => {
    resetFileId()
    pushComment(get('localization'))
    const dir = 'Data/localization.json'
    const searchItems = (items, dir) => {
      for (const item of items) {
        const path = `${dir}/${item.name}`
        if (item.class === 'folder') {
          searchItems(item.children, path)
          continue
        }
        pushToOuterMap(path, item.id)
        const json = JSON.stringify(item.contents)
        let match
        while (match = guidInJSON.exec(json)) {
          pushToUsedMap(path, match[1] ?? match[2])
        }
      }
    }
    searchItems(Data.localization.list, dir)
  }
  const searchPlugins = () => {
    resetFileId()
    pushComment(get('plugin'))
    const dir = 'Data/plugins.json'
    const plugins = Data.plugins
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const json = JSON.stringify(plugin)
      const path = `${dir}/${i}`
      let match
      while (match = guidInJSON.exec(json)) {
        pushToUsedMap(path, match[1] ?? match[2])
      }
    }
  }
  const searchCommands = () => {
    resetFileId()
    pushComment(get('command'))
    const dir = 'Data/commands.json'
    const commands = Data.commands
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      const path = `${dir}/${i}`
      pushToUsedMap(path, command.id)
    }
  }
  const searchScripts = () => {
    pushComment(get('script'))
    for (const script of Object.values(Data.scripts)) {
      const path = getPathOfGuid(script.guid)
      pushToOuterMap(path, script.guid)
      if (script.guid in usedMap) {
        const code = script.code
        let match
        while (match = guidInScript.exec(code)) {
          pushToUsedMap(path, match[0].slice(1, -1))
        }
      }
    }
  }
  const searchConfig = () => {
    resetFileId()
    pushComment(get('config'))
    const path = 'Data/config.json'
    const copy = Object.clone(Data.config)
    pushToUsedMap2(path, 'startPosition.sceneId', copy.startPosition.sceneId)
    delete copy.gameId
    delete copy.save
    delete copy.startPosition
    const json = JSON.stringify(copy)
    let match
    while (match = guidInJSON.exec(json)) {
      pushToUsedMap(path, match[1] ?? match[2])
    }
  }
  const searchEasings = () => {
    resetFileId()
    const dir = 'Data/easings.json'
    const easings = Data.easings
    for (let i = 0; i < easings.length; i++) {
      const easing = easings[i]
      const path = `${dir}/${i}`
      pushToInnerMap(path, easing.id)
    }
  }
  const searchTeams = () => {
    resetFileId()
    const dir = 'Data/teams.json'
    const teams = Data.teams.list
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i]
      const path = `${dir}/${i}`
      pushToInnerMap(path, team.id)
    }
  }
  const searchOtherFiles = () => {
    resetFileId()
    const {images, audio, videos, fonts, others} = Data.manifest
    pushComment(get('image'))
    for (const meta of images) {
      pushToOuterMap(meta.file.aliasPath, meta.guid)
    }
    pushComment(get('audio'))
    for (const meta of audio) {
      pushToOuterMap(meta.file.aliasPath, meta.guid)
    }
    pushComment(get('video'))
    for (const meta of videos) {
      pushToOuterMap(meta.file.aliasPath, meta.guid)
    }
    pushComment(get('font'))
    for (const meta of fonts) {
      pushToOuterMap(meta.file.aliasPath, meta.guid)
    }
    pushComment(get('other'))
    for (const meta of others) {
      pushToOuterMap(meta.file.aliasPath, meta.guid)
    }
  }
  searchEvents()
  searchUIs()
  searchScenes()
  searchActors()
  searchSkills()
  searchTriggers()
  searchItems()
  searchEquipments()
  searchStates()
  searchAnimations()
  searchParticles()
  searchTilesets()
  searchVariables()
  searchAttributes()
  searchEnumerations()
  searchLocalization()
  searchPlugins()
  searchCommands()
  searchScripts()
  searchConfig()
  searchEasings()
  searchTeams()
  searchOtherFiles()
  return {usedMap, innerMap, outerMap}
}

// 过滤无用的注释
Reference.filterUselessComments = function (items) {
  const list = []
  const length = items.length
  for (let i = 0; i < length; i++) {
    if (items[i].type !== 'comment' || items[i + 1]?.type === 'path') {
      list.push(items[i])
    }
  }
  return list
}

// 查找引用GUID的对象
Reference.findRelated = function (guid) {
  const items = []
  const {usedMap} = this.findAllGuids(guid)
  for (const key of Object.keys(usedMap)) {
    const content = usedMap[key]
    if (Array.isArray(content)) {
      items.push(...content)
    } else {
      items.push(content)
    }
  }
  items.sort((a, b) => a.order - b.order)
  const filtered = Reference.filterUselessComments(items)
  filtered.isEmpty = filtered.length === 0
  if (filtered.isEmpty) {
    filtered.push({
      type: 'comment',
      text: Local.get('reference.no-related-found'),
    })
  }
  return filtered
}

// 打开引用GUID的对象
Reference.openRelated = function (guid) {
  Window.open('reference')
  this.openList(this.findRelated(guid))
}

// 查找无效引用
Reference.findInvalid = function () {
  const items = []
  const {usedMap, innerMap, outerMap} = this.findAllGuids()
  const validMap = Object.setPrototypeOf(outerMap, innerMap)
  for (const key of Object.keys(usedMap)) {
    if (validMap[key] === undefined) {
      const content = usedMap[key]
      if (Array.isArray(content)) {
        items.push(...content)
      } else {
        items.push(content)
      }
    }
  }
  items.sort((a, b) => a.order - b.order)
  const filtered = Reference.filterUselessComments(items)
  filtered.isEmpty = filtered.length === 0
  if (filtered.isEmpty) {
    filtered.push({
      type: 'comment',
      text: Local.get('reference.no-invalid-found'),
    })
  }
  return filtered
}

// 打开无效引用
Reference.openInvalid = function (guid) {
  Window.open('reference')
  this.openList(this.findInvalid(guid))
}

// 查找未使用的对象
Reference.findUnused = function () {
  const items = []
  const {usedMap, outerMap} = this.findAllGuids()
  for (const key of Object.keys(outerMap)) {
    if (usedMap[key] === undefined) {
      items.push(outerMap[key])
    }
  }
  const filtered = Reference.filterUselessComments(items)
  filtered.isEmpty = filtered.length === 0
  if (filtered.isEmpty) {
    filtered.push({
      type: 'comment',
      text: Local.get('reference.no-unused-found'),
    })
  }
  return filtered
}

// 打开未使用的对象
Reference.openUnused = function (guid) {
  Window.open('reference')
  this.openList(this.findUnused(guid))
}

// 显示窗口并打开列表
Reference.openList = function (items) {
  Window.open('reference')
  Reference.update(items)
}

// 更新日志列表
Reference.update = function (items) {
  const list = $('#reference-list').reload()
  for (const item of items) {
    const li = document.createElement('common-item')
    li.dataValue = item
    li.textContent = item.text
    // 注释
    if (item.type === 'comment') {
      li.addClass('reference-comment')
    }
    // 引用计数
    if ('count' in item && item.count > 1) {
      const counter = document.createElement('text')
      counter.addClass('reference-count')
      counter.textContent = item.count.toString()
      li.appendChild(counter)
    }
    list.appendElement(li)
  }
  list.update()
}

// 窗口 - 已关闭事件
Reference.windowClosed = function (event) {
  $('#reference-list').clear()
}

// 列表 - 弹出菜单事件
Reference.listPopup = function (event) {
  const item = event.value
  if (item?.id) {
    Menu.popup({
      x: event.clientX,
      y: event.clientY,
    }, [{
      label: `ID: ${item.id}`,
      style: 'id',
      click: () => {
        navigator.clipboard.writeText(item.id)
      },
    }])
  }
}

// 获取键盘按下事件侦听器
Reference.getKeydownListener = function (list, winId = '') {
  let listener = this.keydownMap.get(list)
  if (listener === undefined) {
    listener = event => {
      if (event.altKey) {
        switch (event.code) {
          case 'AltLeft':
            if (winId ? Window.getTopWindow()?.id === winId : !Window.getTopWindow()) {
              list.addClass('alt')
              window.on('keyup', this.getKeyupListener(list))
              window.on('pointermove', this.getPointermoveListener(list))
            }
            break
        }
      }
    }
  }
  return listener
}

// 获取键盘弹起事件侦听器
Reference.getKeyupListener = function (list) {
  let listener = this.keyupMap.get(list)
  if (listener === undefined) {
    listener = event => {
      if (!event.altKey) {
        switch (event.code) {
          case 'AltLeft':
            list.removeClass('alt')
            window.off('keyup', listener)
            window.off('pointermove', this.getPointermoveListener(list))
            break
        }
      }
    }
  }
  return listener
}

// 获取列表指针按下侦听器
Reference.getPointerdownListener = function (list) {
  let listener = this.pointerdownMap.get(list)
  if (listener === undefined) {
    listener = event => {
      // 查找引用(必须是捕获阶段事件)
      if (event.altKey && event.button === 0) {
        const element = event.target
        if (element.tagName === 'NODE-ITEM') {
          const item = element.item
          const guid = item.id ?? item.presetId
          if (guid) {
            // 阻止focus后快捷键不被禁用的情况
            event.preventDefault()
            event.stopImmediatePropagation()
            Reference.openRelated(guid)
          }
        }
      }
    }
  }
  return listener
}

// 获取指针移动事件侦听器
// ctrl组合快捷键导致blur无法触发按键弹起事件，补救方法
Reference.getPointermoveListener = function (list) {
  let listener = this.pointermoveMap.get(list)
  if (listener === undefined) {
    listener = event => {
      if (!event.altKey) {
        list.removeClass('alt')
        window.off('keyup', this.getKeyupListener(list))
        window.off('pointermove', listener)
      }
    }
  }
  return listener
}