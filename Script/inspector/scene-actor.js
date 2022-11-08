'use strict'

import {
  ConditionListInterface,
  Data,
  EventListInterface,
  getElementWriter,
  Inspector,
  Scene,
  ScriptListInterface
} from '../yami.js'

// ******************************** 场景 - 角色页面 ********************************

{
  const SceneActor = {
    // properties
    owner: Scene,
    target: null,
    nameBox: $('#sceneActor-name'),
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    write: null,
    update: null,
    // events
    datachange: null,
    paramInput: null,
  }

  // 初始化
  SceneActor.initialize = function () {
    // 绑定条件列表
    $('#sceneActor-conditions').bind(new ConditionListInterface(this, Scene))

    // 绑定事件列表
    $('#sceneActor-events').bind(new EventListInterface(this, Scene))

    // 绑定脚本列表
    $('#sceneActor-scripts').bind(new ScriptListInterface(this, Scene))

    // 绑定脚本参数面板
    $('#sceneActor-parameter-pane').bind($('#sceneActor-scripts'))

    // 侦听事件
    window.on('datachange', this.datachange)
    const elements = $(`#sceneActor-name, #sceneActor-actorId,
      #sceneActor-teamId, #sceneActor-x, #sceneActor-y, #sceneActor-angle`)
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, Scene))
    $('#sceneActor-conditions, #sceneActor-events, #sceneActor-scripts').on('change', Scene.listChange)
  }

  // 创建角色
  SceneActor.create = function () {
    return {
      class: 'actor',
      name: 'Actor',
      hidden: false,
      locked: false,
      presetId: '',
      actorId: '',
      teamId: Data.teams.list[0].id,
      x: 0,
      y: 0,
      angle: 0,
      conditions: [],
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  SceneActor.open = function (actor) {
    if (this.target !== actor) {
      this.target = actor

      // 创建队伍选项
      const elTeamId = $('#sceneActor-teamId')
      elTeamId.loadItems(Data.createTeamItems())

      // 写入数据
      const write = getElementWriter('sceneActor', actor)
      write('name')
      write('actorId')
      write('teamId')
      write('x')
      write('y')
      write('angle')
      write('conditions')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  SceneActor.close = function () {
    if (this.target) {
      Scene.list.unselect(this.target)
      Scene.updateTarget()
      this.target = null
      $('#sceneActor-conditions').clear()
      $('#sceneActor-events').clear()
      $('#sceneActor-scripts').clear()
      $('#sceneActor-parameter-pane').clear()
    }
  }

  // 写入数据
  SceneActor.write = function (options) {
    if (options.x !== undefined) {
      $('#sceneActor-x').write(options.x)
    }
    if (options.y !== undefined) {
      $('#sceneActor-y').write(options.y)
    }
    if (options.angle !== undefined) {
      $('#sceneActor-angle').write(options.angle)
    }
  }

  // 更新数据
  SceneActor.update = function (actor, key, value) {
    Scene.planToSave()
    switch (key) {
      case 'name':
        if (actor.name !== value) {
          actor.name = value
          Scene.updateTargetInfo()
          Scene.list.updateItemName(actor)
        }
        break
      case 'x':
      case 'y':
        if (actor[key] !== value) {
          actor[key] = value
        }
        break
      case 'actorId':
        if (actor.actorId !== value) {
          actor.actorId = value
          actor.player.destroy()
          delete actor.data
          delete actor.player
          Scene.loadActorContext(actor)
        }
        break
      case 'teamId':
        if (actor.teamId !== value) {
          actor.teamId = value
          Scene.list.updateIcon(actor)
        }
        break
      case 'angle':
        if (actor.angle !== value) {
          actor.angle = value
          if (actor.player) {
            const params = actor.player.getDirParamsByAngle(value)
            actor.player.switch(actor.data.idleMotion, params.suffix)
            actor.player.mirror = params.mirror
          }
        }
        break
    }
    Scene.requestRendering()
  }

  // 数据改变事件
  SceneActor.datachange = function (event) {
    if (this.target && event.key === 'teams') {
      const elTeamId = $('#sceneActor-teamId')
      elTeamId.loadItems(Data.createTeamItems())
      this.target.teamId = ''
      elTeamId.update()
      elTeamId.dispatchEvent(new Event('input'))
    }
  }.bind(SceneActor)

  // 参数 - 输入事件
  SceneActor.paramInput = function (event) {
    SceneActor.update(
      SceneActor.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  Inspector.sceneActor = SceneActor
}
