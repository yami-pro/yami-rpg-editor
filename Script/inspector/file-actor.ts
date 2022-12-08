"use strict"

import {
  Animation,
  AttributeListInterface,
  Browser,
  Command,
  Data,
  Enum,
  EventListInterface,
  File,
  getElementReader,
  getElementWriter,
  Inspector,
  Scene,
  ScriptListInterface,
  Window
} from "../yami"

// ******************************** 文件 - 角色页面 ********************************

{
const FileActor = {
  // properties
  target: null,
  meta: null,
  sprites: null,
  skills: null,
  equipments: null,
  // methods
  initialize: null,
  create: null,
  open: null,
  close: null,
  update: null,
  // events
  animationIdWrite: null,
  paramInput: null,
  listChange: null,
}

// 初始化
FileActor.initialize = function () {
  // 绑定属性列表
  $('#fileActor-attributes').bind(new AttributeListInterface())

  // 绑定精灵图列表
  $('#fileActor-sprites').bind(this.sprites)

  // 绑定技能列表
  $('#fileActor-skills').bind(this.skills)

  // 绑定装备列表
  $('#fileActor-equipments').bind(this.equipments)

  // 绑定事件列表
  $('#fileActor-events').bind(new EventListInterface())

  // 绑定脚本列表
  $('#fileActor-scripts').bind(new ScriptListInterface())

  // 绑定脚本参数面板
  $('#fileActor-parameter-pane').bind($('#fileActor-scripts'))

  // 侦听事件
  $('#fileActor-animationId').on('write', this.animationIdWrite)
  $(`#fileActor-portrait, #fileActor-clip, #fileActor-animationId,
    #fileActor-idleMotion, #fileActor-moveMotion, #fileActor-speed,
    #fileActor-size, #fileActor-weight`).on('input', this.paramInput)
  $(`#fileActor-sprites, #fileActor-attributes, #fileActor-skills, #fileActor-equipments,
    #fileActor-events, #fileActor-scripts
  `).on('change', this.listChange)
}

// 创建角色
FileActor.create = function () {
  return {
    portrait: '',
    clip: [0, 0, 64, 64],
    animationId: '',
    idleMotion: '',
    moveMotion: '',
    speed: 4,
    size: 0.8,
    weight: 1,
    sprites: [],
    attributes: [],
    skills: [],
    equipments: [],
    events: [],
    scripts: [],
  }
}

// 打开数据
FileActor.open = function (actor, meta) {
  if (this.meta !== meta) {
    this.target = actor
    this.meta = meta

    // 写入数据
    const write = getElementWriter('fileActor', actor)
    write('portrait')
    write('clip')
    write('animationId')
    write('idleMotion')
    write('moveMotion')
    write('sprites')
    write('speed')
    write('size')
    write('weight')
    write('attributes')
    write('skills')
    write('equipments')
    write('events')
    write('scripts')
  }
}

// 关闭数据
FileActor.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    $('#fileActor-sprites').clear()
    $('#fileActor-attributes').clear()
    $('#fileActor-skills').clear()
    $('#fileActor-equipments').clear()
    $('#fileActor-events').clear()
    $('#fileActor-scripts').clear()
    $('#fileActor-parameter-pane').clear()
  }
}

// 更新数据
FileActor.update = function (actor, key, value) {
  File.planToSave(this.meta)
  switch (key) {
    case 'portrait':
    case 'clip':
      if (actor[key] !== value) {
        actor[key] = value
        Browser.body.updateIcon(this.meta.file)
      }
      break
    case 'animationId':
      if (actor.animationId !== value) {
        const id = actor.animationId
        actor.animationId = value
        if (Scene.actors instanceof Array) {
          const animation = Data.animations[id]
          for (const actor of Scene.actors) {
            if (actor.player?.data === animation) {
              Scene.destroyObjectContext(actor)
              Scene.loadActorContext(actor)
            }
          }
          Scene.requestRendering()
        }
      }
      break
    case 'idleMotion':
      if (actor[key] !== value) {
        actor[key] = value
        if (Scene.actors instanceof Array) {
          const id = actor.animationId
          const animation = Data.animations[id]
          for (const {player} of Scene.actors) {
            if (player?.data === animation) {
              player.reset()
              player.setMotion(value)
            }
          }
          Scene.requestRendering()
        }
      }
      break
    case 'moveMotion':
    case 'speed':
    case 'size':
    case 'weight':
      if (actor[key] !== value) {
        actor[key] = value
      }
      break
  }
}

// 动画ID - 写入事件
FileActor.animationIdWrite = function (event) {
  const elIdleMotion = $('#fileActor-idleMotion')
  const elMoveMotion = $('#fileActor-moveMotion')
  const items = Animation.getMotionListItems(event.value)
  elIdleMotion.loadItems(items)
  elMoveMotion.loadItems(items)
  elIdleMotion.write2(elIdleMotion.read())
  elMoveMotion.write2(elMoveMotion.read())
}

// 参数 - 输入事件
FileActor.paramInput = function (event) {
  FileActor.update(
    FileActor.target,
    Inspector.getKey(this),
    this.read(),
  )
}

// 列表 - 改变事件
FileActor.listChange = function (event) {
  File.planToSave(FileActor.meta)
}

// 精灵图列表接口
FileActor.sprites = {
  initialize: function (list) {
    $('#fileActor-sprite-confirm').on('click', () => list.save())

    // 重载场景角色动画 - 改变事件
    list.on('change', event => {
      const guid = FileActor.meta.guid
      if (Scene.actors instanceof Array) {
        for (const actor of Scene.actors) {
          if (actor.actorId === guid) {
            Scene.destroyObjectContext(actor)
            Scene.loadActorContext(actor)
          }
        }
      }
    })
  },
  parse: function ({id, image}) {
    Command.invalid = false
    const animationId = FileActor.target.animationId
    const spriteName = Command.parseSpriteName(animationId, id)
    const spriteClass = Command.invalid ? 'invalid' : ''
    Command.invalid = false
    const fileName = Command.parseFileName(image)
    const fileClass = Command.invalid ? 'invalid' : ''
    return [
      {content: spriteName, class: spriteClass},
      {content: fileName, class: fileClass},
    ]
  },
  open: function ({id = '', image = ''} = {}) {
    Window.open('fileActor-sprite')
    const animationId = FileActor.target.animationId
    const items = Animation.getSpriteListItems(animationId)
    $('#fileActor-sprite-id').loadItems(items)
    const write = getElementWriter('fileActor-sprite')
    write('id', id)
    write('image', image)
    if (!id) {
      $('#fileActor-sprite-id').getFocus()
    } else {
      $('#fileActor-sprite-image').getFocus()
    }
  },
  save: function () {
    const read = getElementReader('fileActor-sprite')
    const id = read('id')
    if (!id) {
      return $('#fileActor-sprite-id').getFocus()
    }
    const image = read('image')
    Window.close('fileActor-sprite')
    return {id, image}
  },
}

// 技能列表接口
FileActor.skills = {
  initialize: function (list) {
    $('#fileActor-skill-confirm').on('click', () => list.save())
  },
  parse: function ({id, key}) {
    Command.invalid = false
    const skillName = Command.parseFileName(id)
    const skillClass = Command.invalid ? 'invalid' : ''
    Command.invalid = false
    const shortcutKey = key ? Command.parseGroupEnumString('shortcut-key', key) : ''
    const shortcutClass = Command.invalid ? 'invalid' : 'weak'
    return [
      {content: skillName, class: skillClass},
      {content: shortcutKey, class: shortcutClass},
    ]
  },
  open: function ({id = '', key = ''} = {}) {
    Window.open('fileActor-skill')
    const elSkillId = $('#fileActor-skill-id')
    const elSkillKey = $('#fileActor-skill-key')
    const items = Enum.getStringItems('shortcut-key', true)
    elSkillKey.loadItems(items)
    elSkillId.write(id)
    elSkillKey.write(key)
    elSkillId.getFocus()
  },
  save: function () {
    const elSkillId = $('#fileActor-skill-id')
    const elSkillKey = $('#fileActor-skill-key')
    const id = elSkillId.read()
    if (!id) {
      return elSkillId.getFocus()
    }
    const key = elSkillKey.read()
    Window.close('fileActor-skill')
    return {id, key}
  },
}

// 装备列表接口
FileActor.equipments = {
  initialize: function (list) {
    $('#fileActor-equipment-confirm').on('click', () => list.save())
  },
  parse: function ({id, slot}) {
    Command.invalid = false
    const equipmentName = Command.parseFileName(id)
    const equipmentClass = Command.invalid ? 'invalid' : ''
    Command.invalid = false
    const shortcutKey = slot ? Command.parseGroupEnumString('equipment-slot', slot) : ''
    const shortcutClass = Command.invalid ? 'invalid' : 'weak'
    return [
      {content: equipmentName, class: equipmentClass},
      {content: shortcutKey, class: shortcutClass},
    ]
  },
  open: function ({id = '', slot = Enum.getDefStringId('equipment-slot')} = {}) {
    Window.open('fileActor-equipment')
    const elEquipmentId = $('#fileActor-equipment-id')
    const elEquipmentKey = $('#fileActor-equipment-slot')
    const items = Enum.getStringItems('equipment-slot')
    elEquipmentKey.loadItems(items)
    elEquipmentId.write(id)
    elEquipmentKey.write(slot)
    elEquipmentId.getFocus()
  },
  save: function () {
    const elEquipmentId = $('#fileActor-equipment-id')
    const elKey = $('#fileActor-equipment-slot')
    const id = elEquipmentId.read()
    if (!id) {
      return elEquipmentId.getFocus()
    }
    const slot = elKey.read()
    if (!slot) {
      return elKey.getFocus()
    }
    Window.close('fileActor-equipment')
    return {id, slot}
  },
}

Inspector.fileActor = FileActor
}
