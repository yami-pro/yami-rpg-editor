'use strict'

import { Inspector } from './inspector.js'

// ******************************** 文件 - 触发器页面 ********************************

{
  const FileTrigger = {
    // properties
    target: null,
    meta: null,
    motions: null,
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
  FileTrigger.initialize = function () {
    // 创建选择器选项
    $('#fileTrigger-selector').loadItems([
      {name: 'Enemy', value: 'enemy'},
      {name: 'Friend', value: 'friend'},
      {name: 'Team Member', value: 'team'},
      {name: 'Team Member Except Self', value: 'team-except-self'},
      {name: 'Any Except Self', value: 'any-except-self'},
      {name: 'Any', value: 'any'},
    ])

    // 创建墙体碰撞选项
    $('#fileTrigger-onHitWalls').loadItems([
      {name: 'Through', value: 'through'},
      {name: 'Destroy', value: 'destroy'},
    ])

    // 创建角色碰撞选项
    $('#fileTrigger-onHitActors').loadItems([
      {name: 'Through', value: 'through'},
      {name: 'Destroy', value: 'destroy'},
    ])

    // 创建形状类型选项
    $('#fileTrigger-shape-type').loadItems([
      {name: 'Rectangle', value: 'rectangle'},
      {name: 'Circle', value: 'circle'},
      {name: 'Sector', value: 'sector'},
    ])

    // 设置形状类型关联元素
    $('#fileTrigger-shape-type').enableHiddenMode().relate([
      {case: 'rectangle', targets: [
        $('#fileTrigger-shape-width'),
        $('#fileTrigger-shape-height'),
      ]},
      {case: 'circle', targets: [
        $('#fileTrigger-shape-radius'),
      ]},
      {case: 'sector', targets: [
        $('#fileTrigger-shape-radius'),
        $('#fileTrigger-shape-centralAngle'),
      ]},
    ])

    // 创建触发模式选项
    $('#fileTrigger-hitMode').loadItems([
      {name: 'Once', value: 'once'},
      {name: 'Once On Overlap', value: 'once-on-overlap'},
      {name: 'Repeat', value: 'repeat'},
    ])

    // 设置触发模式关联元素
    $('#fileTrigger-hitMode').enableHiddenMode().relate([
      {case: 'repeat', targets: [
        $('#fileTrigger-hitInterval'),
      ]},
    ])

    // 创建动画旋转选项
    $('#fileTrigger-rotatable').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 创建动画方向映射选项
    $('#fileTrigger-mappable').loadItems([
      {name: 'Yes', value: true},
      {name: 'No', value: false},
    ])

    // 绑定事件列表
    $('#fileTrigger-events').bind(new EventListInterface())

    // 绑定脚本列表
    $('#fileTrigger-scripts').bind(new ScriptListInterface())

    // 绑定脚本参数面板
    $('#fileTrigger-parameter-pane').bind($('#fileTrigger-scripts'))

    // 侦听事件
    $('#fileTrigger-animationId').on('write', this.animationIdWrite)
    $(`#fileTrigger-selector, #fileTrigger-onHitWalls, #fileTrigger-onHitActors,
      #fileTrigger-shape-type, #fileTrigger-shape-width, #fileTrigger-shape-height,
      #fileTrigger-shape-radius, #fileTrigger-shape-centralAngle, #fileTrigger-speed,
      #fileTrigger-hitMode, #fileTrigger-hitInterval,
      #fileTrigger-initialDelay, #fileTrigger-effectiveTime, #fileTrigger-duration,
      #fileTrigger-animationId, #fileTrigger-motion,
      #fileTrigger-priority, #fileTrigger-offsetY, #fileTrigger-rotatable,
      #fileTrigger-mappable`).on('input', this.paramInput)
    $('#fileTrigger-events, #fileTrigger-scripts').on('change', this.listChange)
  }

  // 创建技能
  FileTrigger.create = function () {
    return {
      selector: 'enemy',
      onHitWalls: 'through',
      onHitActors: 'through',
      shape: {
        type: 'circle',
        radius: 0.25,
      },
      speed: 0,
      hitMode: 'once',
      hitInterval: 0,
      initialDelay: 0,
      effectiveTime: 0,
      duration: 0,
      animationId: '',
      motion: '',
      priority: 0,
      offsetY: 0,
      rotatable: true,
      mappable: false,
      events: [],
      scripts: [],
    }
  }

  // 打开数据
  FileTrigger.open = function (trigger, meta) {
    if (this.meta !== meta) {
      this.target = trigger
      this.meta = meta

      // 写入数据
      const write = getElementWriter('fileTrigger', trigger)
      const shape = trigger.shape
      write('selector')
      write('onHitWalls')
      write('onHitActors')
      write('shape-type')
      write('shape-width', shape.width ?? 1)
      write('shape-height', shape.height ?? 1)
      write('shape-radius', shape.radius ?? 0.5)
      write('shape-centralAngle', shape.centralAngle ?? 90)
      write('speed')
      write('hitMode')
      write('hitInterval')
      write('initialDelay')
      write('effectiveTime')
      write('duration')
      write('animationId')
      write('motion')
      write('priority')
      write('offsetY')
      write('rotatable')
      write('mappable')
      write('events')
      write('scripts')
    }
  }

  // 关闭数据
  FileTrigger.close = function () {
    if (this.target) {
      Browser.unselect(this.meta)
      this.target = null
      this.meta = null
      this.motions = null
      $('#fileTrigger-events').clear()
      $('#fileTrigger-scripts').clear()
      $('#fileTrigger-parameter-pane').clear()
    }
  }

  // 更新数据
  FileTrigger.update = function (trigger, key, value) {
    File.planToSave(this.meta)
    switch (key) {
      case 'selector':
      case 'onHitWalls':
      case 'onHitActors':
      case 'speed':
      case 'hitMode':
      case 'hitInterval':
      case 'initialDelay':
      case 'effectiveTime':
      case 'duration':
        if (trigger[key] !== value) {
          trigger[key] = value
        }
        break
      case 'shape-type':
        if (trigger.shape.type !== value) {
          const read = getElementReader('fileTrigger-shape')
          switch (value) {
            case 'rectangle':
              trigger.shape = {
                type: 'rectangle',
                width: read('width'),
                height: read('height'),
              }
              break
            case 'circle':
              trigger.shape = {
                type: 'circle',
                radius: read('radius'),
              }
              break
            case 'sector':
              trigger.shape = {
                type: 'sector',
                radius: read('radius'),
                centralAngle: read('centralAngle'),
              }
              break
          }
        }
        break
      case 'shape-width':
      case 'shape-height':
      case 'shape-radius':
      case 'shape-centralAngle': {
        const index = key.indexOf('-') + 1
        const property = key.slice(index)
        if (trigger.shape[property] !== value) {
          trigger.shape[property] = value
        }
        break
      }
      case 'animationId':
        if (trigger.animationId !== value) {
          trigger.animationId = value
          FileTrigger.motions = null
        }
        break
      case 'motion':
      case 'priority':
      case 'offsetY':
      case 'rotatable':
      case 'mappable':
        if (trigger[key] !== value) {
          trigger[key] = value
        }
        break
    }
  }

  // 动画ID - 写入事件
  FileTrigger.animationIdWrite = function (event) {
    const elMotion = $('#fileTrigger-motion')
    elMotion.loadItems(Animation.getMotionListItems(event.value))
    elMotion.write2(elMotion.read())
  }

  // 参数 - 输入事件
  FileTrigger.paramInput = function (event) {
    FileTrigger.update(
      FileTrigger.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  // 列表 - 改变事件
  FileTrigger.listChange = function (event) {
    File.planToSave(FileTrigger.meta)
  }

  Inspector.fileTrigger = FileTrigger
}
