'use strict'

import { Animation } from '../animation.js'
import * as Yami from '../../yami.js'

// ******************************** 动画窗口加载 ********************************

// marquee methods
Animation.marquee.resize = null

// list properties
Animation.list.page = $('#animation-motion')
Animation.list.head = $('#animation-list-head')
// list methods
Animation.list.copy = null
Animation.list.paste = null
Animation.list.delete = null
Animation.list.cancelSearch = null
Animation.list.updateHead = null
Animation.list.createIcon = null
Animation.list.createText = null
Animation.list.updateText = null
Animation.list.createDirText = null
Animation.list.updateDirText = null
Animation.list.updateDirections = null
Animation.list.createLoopIcon = null
Animation.list.updateLoopIcon = null
Animation.list.onDelete = null

// layerList methods
Animation.layerList.update = null
Animation.layerList.create = null
Animation.layerList.copy = null
Animation.layerList.paste = null
Animation.layerList.delete = null
Animation.layerList.restoreMotion = null
Animation.layerList.restoreRecursiveStates = Yami.Scene.list.restoreRecursiveStates
Animation.layerList.setRecursiveStates = Yami.Scene.list.setRecursiveStates
Animation.layerList.createIcon = null
Animation.layerList.createVisibilityIcon = Yami.Scene.list.createVisibilityIcon
Animation.layerList.updateVisibilityIcon = Yami.Scene.list.updateVisibilityIcon
Animation.layerList.createLockIcon = Yami.Scene.list.createLockIcon
Animation.layerList.updateLockIcon = Yami.Scene.list.updateLockIcon
Animation.layerList.onDelete = null

// timeline properties
Animation.timeline.head = $('#animation-timeline-head')
// timeline methods
Animation.timeline.updateHead = null

// outerTimelineList properties
Animation.outerTimelineList.dragging = null
// outerTimelineList methods
Animation.outerTimelineList.restoreMotionAndLayer = null

// innerTimelineList properties
Animation.innerTimelineList.pointerevent = null

// timelineCursor properties
Animation.timelineCursor.pointerevent = null

// timelineMarquee properties
Animation.timelineMarquee.layer = null
Animation.timelineMarquee.x = -1
Animation.timelineMarquee.y = -1
Animation.timelineMarquee.length = -1
Animation.timelineMarquee.origin = -1
// timelineMarquee methods
Animation.timelineMarquee.isPointIn = null
Animation.timelineMarquee.isSelected = null
Animation.timelineMarquee.isExtendable = null
Animation.timelineMarquee.isShrinkable = null

// 初始化
Animation.initialize = function () {
  // 添加设置滚动方法
  this.screen.addSetScrollMethod()

  // 创建控制点
  const points = {
    jointRotate: {},
    rectRotate: {
      TL: {x: 0, y: 0, angle: 225},
      TR: {x: 0, y: 0, angle: 315},
      BL: {x: 0, y: 0, angle: 135},
      BR: {x: 0, y: 0, angle: 45},
    },
    rectResize: {
      T: {x: 0, y: 0, angle: 270},
      L: {x: 0, y: 0, angle: 180},
      R: {x: 0, y: 0, angle: 0},
      B: {x: 0, y: 0, angle: 90},
      TL: {x: 0, y: 0, angle: 225},
      TR: {x: 0, y: 0, angle: 315},
      BL: {x: 0, y: 0, angle: 135},
      BR: {x: 0, y: 0, angle: 45},
    },
    rectList: null,
  }
  // 控制点按优先级从低到高排序
  points.rectList = [
    // 旋转控制点
    points.rectRotate.TL,
    points.rectRotate.TR,
    points.rectRotate.BL,
    points.rectRotate.BR,
    // 调整控制点
    points.rectResize.T,
    points.rectResize.L,
    points.rectResize.R,
    points.rectResize.B,
    points.rectResize.TL,
    points.rectResize.TR,
    points.rectResize.BL,
    points.rectResize.BR,
  ]
  this.controlPoints = points

  // 创建位移计时器
  this.translationTimer = new Yami.Timer({
    duration: Infinity,
    update: timer => {
      if (this.state === 'open' &&
        this.dragging === null) {
        const key = this.translationKey
        const step = Timer.deltaTime * 1.5 / this.scale
        let x = 0
        let y = 0
        if (key & 0b0001) {x -= step}
        if (key & 0b0010) {y -= step}
        if (key & 0b0100) {x += step}
        if (key & 0b1000) {y += step}
        const screen = this.screen
        const sl = screen.scrollLeft
        const st = screen.scrollTop
        const cx = Math.roundTo(this.centerX + x, 4)
        const cy = Math.roundTo(this.centerY + y, 4)
        this.updateCamera(cx, cy)
        this.updateTransform()
        if (screen.scrollLeft !== sl ||
          screen.scrollTop !== st) {
          this.requestRendering()
          this.marquee.resize()
        }
      } else {
        return false
      }
    }
  })

  // 创建缩放计时器
  this.zoomTimer = new Yami.Timer({
    duration: 80,
    update: timer => {
      if (this.state === 'open') {
        const {elapsed, duration, start, end} = timer
        const time = elapsed / duration
        this.scale = start * (1 - time) + end * time
        this.resize()
        this.requestRendering()
      } else {
        this.scale = timer.end
        return false
      }
    }
  })

  // 设置舞台边距
  this.padding = 800

  // 创建变换矩阵
  this.matrix = new Yami.Matrix()

  // 设置检查器类型映射表
  this.inspectorTypeMap = {
    joint: 'animJointFrame',
    sprite: 'animSpriteFrame',
    particle: 'animParticleFrame',
  }

  // 设置列表搜索框按钮和过滤器
  this.searcher.addCloseButton()
  this.searcher.addKeydownFilter()

  // 绑定对象目录列表
  const {list} = this
  list.removable = true
  list.bind(() => this.motions)
  list.updaters.push(list.updateText)
  list.creators.push(list.createDirText)
  list.updaters.push(list.updateDirText)
  list.creators.push(list.createLoopIcon)
  list.creators.push(list.updateLoopIcon)

  // 绑定图层目录列表
  const {layerList} = this
  layerList.removable = true
  layerList.renamable = true
  layerList.bind(() => this.layers)
  layerList.creators.push(layerList.createVisibilityIcon)
  layerList.updaters.push(layerList.updateVisibilityIcon)
  layerList.creators.push(layerList.createLockIcon)
  layerList.updaters.push(layerList.updateLockIcon)

  // 设置历史操作处理器
  Yami.History.processors['animation-object-create'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
  }
  Yami.History.processors['animation-object-delete'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
  }
  Yami.History.processors['animation-object-remove'] = (operation, data) => {
    const {response} = data
    list.restore(operation, response)
  }
  Yami.History.processors['animation-motion-id-change'] = (operation, data) => {
    const {motion, id} = data
    data.id = motion.id
    motion.id = id
    list.update()
    list.select(motion)
    list.scrollToSelection()
    Animation.planToSave()
  }
  Yami.History.processors['animation-layer-rename'] = (operation, data) => {
    const {motion, response} = data
    layerList.restoreMotion(motion)
    layerList.restore(operation, response)
  }
  Yami.History.processors['animation-layer-create'] =
  Yami.History.processors['animation-layer-delete'] =
  Yami.History.processors['animation-layer-remove'] = (operation, data) => {
    const {motion, response} = data
    Animation.contextLoaded = false
    layerList.restoreMotion(motion)
    layerList.restore(operation, response)
  }
  Yami.History.processors['animation-layer-hidden'] = (operation, data) => {
    const {motion, item, oldValues, newValue} = data
    layerList.restoreMotion(motion)
    if (operation === 'undo') {
      layerList.restoreRecursiveStates(item, 'hidden', oldValues)
    } else {
      layerList.setRecursiveStates(item, 'hidden', newValue)
    }
    layerList.update()
    Animation.requestRendering()
    Animation.planToSave()
  }
  Yami.History.processors['animation-layer-locked'] = (operation, data) => {
    const {motion, item, oldValues, newValue} = data
    layerList.restoreMotion(motion)
    if (operation === 'undo') {
      layerList.restoreRecursiveStates(item, 'locked', oldValues)
    } else {
      layerList.setRecursiveStates(item, 'locked', newValue)
    }
    layerList.update()
    Animation.planToSave()
  }
  Yami.History.processors['animation-frames-change'] = (operation, data) => {
    const {motion, changes, sMarquee, dMarquee} = data
    for (const change of changes) {
      const {layer, frames} = change
      change.frames = layer.frames
      layer.frames = frames
    }
    const {layer, x, length} = operation === 'undo' ? sMarquee : dMarquee
    Animation.outerTimelineList.restoreMotionAndLayer(motion, layer)
    Animation.player.index = x
    // 取消选择选框来避免获取错误的窗口宽高
    Animation.unselectMarquee()
    Animation.updateTimeline()
    const y = Animation.getLayerIndex(layer)
    Animation.selectMarquee(x, y, length, x)
    Animation.scrollToMarquee(false)
    Animation.planToSave()
  }
  Yami.History.processors['animation-easing-change'] = (operation, data) => {
    const {motion, target, easingId} = data
    data.easingId = target.easingId
    target.easingId = easingId
    if (Yami.Curve.target === target) {
      Yami.Curve.list.write(easingId)
    }
    Yami.Curve.updateTimeline(target)
    Animation.setMotion(motion)
    Animation.selectFrame(target)
    Animation.updateFrameContexts()
    Animation.requestRendering()
    Animation.planToSave()
  }
  Yami.History.processors['animation-target-shift'] = (operation, data) => {
    const {editor, motion, target, x, y} = data
    data.x = target.x
    data.y = target.y
    target.x = x
    target.y = y
    if (editor.target === target) {
      editor.write({x, y})
    }
    Animation.setMotion(motion)
    Animation.selectFrame(target)
    Animation.updateFrameContexts()
    Animation.requestRendering()
    Animation.planToSave()
  }
  Yami.History.processors['animation-target-resize'] = (operation, data) => {
    const {editor, motion, target, scaleX, scaleY} = data
    data.scaleX = target.scaleX
    data.scaleY = target.scaleY
    target.scaleX = scaleX
    target.scaleY = scaleY
    if (editor.target === target) {
      editor.write({scaleX, scaleY})
    }
    Animation.setMotion(motion)
    Animation.selectFrame(target)
    Animation.updateFrameContexts()
    Animation.requestRendering()
    Animation.planToSave()
  }
  Yami.History.processors['animation-target-rotate'] = (operation, data) => {
    const {editor, motion, target, rotation} = data
    data.rotation = target.rotation
    target.rotation = rotation
    if (editor.target === target) {
      editor.write({rotation})
    }
    Animation.setMotion(motion)
    Animation.selectFrame(target)
    Animation.updateFrameContexts()
    Animation.requestRendering()
    Animation.planToSave()
  }
  Yami.History.processors['animation-target-index'] = (operation, data) => {
    const {editor, motion, target, hindex, vindex} = data
    data.hindex = target.spriteX
    data.vindex = target.spriteY
    target.spriteX = hindex
    target.spriteY = vindex
    Animation.setMotion(motion)
    Animation.selectFrame(target)
    Animation.requestRendering()
    if (Yami.Sprite.state !== 'closed') {
      Yami.Sprite.marquee.select(hindex, vindex, 1, 1)
      Yami.Sprite.updateTargetInfo()
    }
    Animation.planToSave()
  }

  // 侦听事件
  window.on('themechange', this.themechange)
  window.on('datachange', this.datachange)
  window.on('enumchange', this.enumchange)
  window.on('keydown', this.keydown)
  this.page.on('resize', this.windowResize)
  this.head.on('pointerdown', this.headPointerdown)
  Yami.GL.canvas.on('webglcontextrestored', this.webglRestored)
  $('#animation-head-start').on('pointerdown', this.switchPointerdown)
  $('#animation-speed').on('input', this.speedInput)
  $('#animation-zoom').on('focus', this.zoomFocus)
  $('#animation-zoom').on('input', this.zoomInput)
  this.screen.on('keydown', this.screenKeydown)
  this.screen.on('wheel', this.screenWheel)
  this.screen.on('userscroll', this.screenUserscroll)
  this.screen.on('blur', this.screenBlur)
  this.marquee.on('pointerdown', this.marqueePointerdown)
  this.marquee.on('pointermove', this.marqueePointermove)
  this.marquee.on('pointerleave', this.marqueePointerleave)
  this.marquee.on('doubleclick', this.marqueeDoubleclick)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  list.on('keydown', this.listKeydown)
  list.on('pointerdown', this.listPointerdown)
  list.on('select', this.listSelect)
  list.on('record', this.listRecord)
  list.on('update', this.listUpdate)
  list.on('open', this.listOpen)
  list.on('popup', this.listPopup)
  list.on('change', this.listChange)
  list.page.on('resize', this.listPageResize)
  this.timeline.on('resize', this.timelinePageResize)
  this.toolbar.on('pointerdown', this.timelineToolbarPointerdown)
  this.layerList.on('wheel', this.layerListWheel)
  this.layerList.on('scroll', this.layerListScroll)
  this.layerList.on('keydown', this.layerListKeydown, {capture: true})
  this.layerList.on('pointerdown', this.layerListPointerdown)
  this.layerList.on('select', this.layerListSelect)
  this.layerList.on('record', this.layerListRecord)
  this.layerList.on('popup', this.layerListPopup)
  this.layerList.on('change', this.layerListChange)
  this.outerTimelineList.on('keydown', this.outerTimelineListKeydown)
  this.outerTimelineList.on('wheel', this.outerTimelineListWheel)
  this.outerTimelineList.on('scroll', this.outerTimelineListScroll)
  this.outerTimelineList.on('blur', this.outerTimelineListBlur)
  this.outerTimelineList.on('pointerdown', this.outerTimelineListPointerdown)
  this.innerTimelineList.on('pointermove', this.innerTimelineListPointermove)
  this.innerTimelineList.on('pointerleave', this.innerTimelineListPointerleave)
  this.innerTimelineList.on('dblclick', this.innerTimelineListDblclick)

  // 初始化子对象
  Yami.Curve.initialize()
}

// 打开精灵
Animation.open = function (context) {
  if (this.context === context) {
    return
  }
  this.save()
  this.close()

  // 设置粒子元素舞台
  Yami.Particle.Element.stage = this

  // 首次加载动画
  const {meta} = context
  if (!context.animation) {
    context.animation = Yami.Data.animations[meta.guid]
  }
  if (context.animation) {
    this.state = 'open'
    this.context = context
    this.meta = meta
    this.body.show()
    this.load(context)
    this.resize()
    this.requestRendering()
  } else {
    Yami.Layout.manager.switch('directory')
    Yami.Window.confirm({
      message: `Failed to read file: ${meta.path}`,
    }, [{
      label: 'Confirm',
    }])
  }
}

// 加载动画
Animation.load = function (context) {
  const firstLoad = !context.editor
  if (firstLoad) {
    const data = {mode: '1-dir', sprites: [], motions: []}
    const player = new Animation.Player(data)
    player.onionskin = {prev: [], next: []}
    context.editor = {
      motion: null,
      target: null,
      player: player,
      history: new Yami.History(100),
      centerX: 0,
      centerY: 0,
      selectionX: 0,
      selectionLength: 0,
      listScrollTop: 0,
    }
  }
  const {animation, editor} = context

  // 加载动画属性
  this.mode = animation.mode
  this.sprites = animation.sprites
  this.motions = animation.motions

  // 加载编辑器属性
  this.player = editor.player
  this.history = editor.history
  this.centerX = editor.centerX
  this.centerY = editor.centerY

  // 重置动画矩阵
  Animation.Player.matrix.reset()

  // 初始化
  if (firstLoad) {
    // 加载精灵纹理
    this.loadTextures()
  }

  // 更新列表
  this.list.update()
  // this.list.scrollTop = editor.listScrollTop

  // 设置动作对象
  this.setMotion(editor.motion)

  // 设置目标对象
  if (editor.target) {
    this.selectFrame(
      editor.target,
      editor.selectionX,
      editor.selectionLength,
    )
  }
}

// 保存动画
Animation.save = function () {
  if (this.state === 'open') {
    const {animation, editor} = this.context

    // 保存动画属性
    animation.mode = this.mode
    animation.sprites = this.sprites
    animation.motions = this.motions

    // 保存编辑器属性
    editor.motion = this.motion
    editor.target = this.target
    editor.player = this.player
    editor.history = this.history
    editor.centerX = this.centerX
    editor.centerY = this.centerY
    editor.selectionX = this.timelineMarquee.x
    editor.selectionLength = this.timelineMarquee.length
    // editor.listScrollTop = this.list.scrollTop
  }
}

// 关闭精灵
Animation.close = function () {
  if (this.state !== 'closed') {
    this.screen.blur()
    this.setMotion(null)
    // 关闭检查器
    if (Yami.Inspector.type === 'fileAnimation') {
      Yami.Inspector.close()
    }
    this.state = 'closed'
    this.context = null
    this.meta = null
    this.player = null
    this.mode = null
    this.sprites = null
    this.motions = null
    this.history = null
    this.searcher.write('')
    this.list.clear()
    this.layerList.clear()
    this.innerTimelineList.clear()
    this.body.hide()
    this.stop()
    this.stopAnimation()
    this.stopRendering()
  }
}

// 销毁动画
Animation.destroy = function (context) {
  if (!context.editor) return
  if (this.context === context) {
    this.save()
    this.close()
  }
  context.editor.player.destroy()
}

// 播放动画
Animation.play = function () {
  if (this.playing) {
    return this.stop()
  }
  if (this.motion === null) return
  const range = this.getAnimationRange()
  const player = this.player
  // 使用animIndex属性来避免加载最后一帧时被取整的情况
  if (player.index < range.end - 1) {
    this.animIndex = player.index
  } else {
    this.animIndex = -1
  }
  this.playing = true
  this.requestAnimation()
  player.clearParticles()
  $('#animation-timeline-play').addClass('playing')
}

// 停止播放
Animation.stop = function () {
  if (this.playing) {
    this.playing = false
    this.loadFrames(Math.floor(this.animIndex))
    $('#animation-timeline-play').removeClass('playing')
  }
}

// 复制对象
Animation.copy = function () {
  if (this.state === 'open' &&
    this.motion !== null) {
    this.list.copy(this.motion)
  }
}

// 粘贴对象
Animation.paste = function () {
  if (this.state === 'open' &&
    this.dragging === null) {
    this.list.paste(null)
  }
}

// 删除对象
Animation.delete = function () {
  if (this.state === 'open' &&
    this.motion !== null &&
    this.dragging === null) {
    this.list.delete(this.motion)
  }
}

// 撤销操作
Animation.undo = function () {
  if (this.state === 'open' &&
    !this.dragging &&
    this.history.canUndo()) {
    this.history.restore('undo')
    this.marquee.resize()
  }
}

// 重做操作
Animation.redo = function () {
  if (this.state === 'open' &&
    !this.dragging &&
    this.history.canRedo()) {
    this.history.restore('redo')
    this.marquee.resize()
  }
}

// 打开图层
Animation.openLayer = function (layer) {
  this.layerList.selectWithNoEvent(layer)
  switch (layer.class) {
    case 'joint':
      Yami.Inspector.close()
      break
    case 'sprite':
      Yami.Inspector.open('animSpriteLayer', layer)
      break
    case 'particle':
      Yami.Inspector.open('animParticleLayer', layer)
      break
  }
}

// 跳到上一帧
Animation.previousFrame = function () {
  const {length} = this.player
  if (length <= 1) return
  const i = this.player.index
  const y = this.timelineMarquee.y
  const x = (i - 1 + length) % length
  if (y !== -1) {
    this.selectMarquee(x, y, 1, x)
    this.scrollToMarquee(false)
  }
  this.loadFrames(x)
}

// 跳到下一帧
Animation.nextFrame = function () {
  const {length} = this.player
  if (length <= 1) return
  const i = this.player.index
  const y = this.timelineMarquee.y
  const x = (i + 1) % length
  if (y !== -1) {
    this.selectMarquee(x, y, 1, x)
    this.scrollToMarquee(false)
  }
  this.loadFrames(x)
}

// 跳到上一个关键帧
Animation.previousKeyFrame = function () {
  if (this.player.length <= 1) return
  const contexts = this.player.contexts
  const index = this.player.index
  const y = this.timelineMarquee.y
  if (y !== -1) {
    let x = -1
    const {frames} = contexts[y].layer
    for (const frame of frames) {
      if (frame.start < index) {
        x = frame.start
      } else {
        break
      }
    }
    if (x === -1 && frames.length !== 0) {
      x = frames[frames.length - 1].start
    }
    if (x !== -1) {
      this.selectMarquee(x, y, 1, x)
      this.scrollToMarquee(false)
      this.loadFrames(x)
    }
  } else {
    let x = -Infinity
    const {count} = contexts
    for (let i = 0; i < count; i++) {
      const {frames} = contexts[i].layer
      for (const frame of frames) {
        if (frame.start < index) {
          x = Math.max(x, frame.start)
        } else {
          break
        }
      }
    }
    if (x === -Infinity) {
      for (let i = 0; i < count; i++) {
        const {frames} = contexts[i].layer
        if (frames.length !== 0) {
          x = Math.max(x, frames[frames.length - 1].start)
        }
      }
    }
    if (x !== -Infinity) {
      this.loadFrames(x)
    }
  }
}

// 跳到下一个关键帧
Animation.nextKeyFrame = function () {
  if (this.player.length <= 1) return
  const contexts = this.player.contexts
  const index = this.player.index
  const y = this.timelineMarquee.y
  if (y !== -1) {
    let x = -1
    const {frames} = contexts[y].layer
    for (const frame of frames) {
      if (frame.start > index) {
        x = frame.start
        break
      }
    }
    if (x === -1 && frames.length !== 0) {
      x = frames[0].start
    }
    if (x !== -1) {
      this.selectMarquee(x, y, 1, x)
      this.scrollToMarquee(false)
      this.loadFrames(x)
    }
  } else {
    let x = Infinity
    const {count} = contexts
    for (let i = 0; i < count; i++) {
      const {frames} = contexts[i].layer
      for (const frame of frames) {
        if (frame.start > index) {
          x = Math.min(x, frame.start)
          break
        }
      }
    }
    if (x === Infinity) {
      for (let i = 0; i < count; i++) {
        const {frames} = contexts[i].layer
        if (frames.length !== 0) {
          x = Math.min(x, frames[0].start)
        }
      }
    }
    if (x !== Infinity) {
      this.loadFrames(x)
    }
  }
}

// 设置速度
Animation.setSpeed = function IIFE() {
  const numberBox = $('#animation-speed')
  return function (speed) {
    this.speed = speed
    numberBox.write(speed)
  }
}()

// 设置缩放
Animation.setZoom = function IIFE() {
  const slider = $('#animation-zoom')
  return function (zoom) {
    if (this.zoom !== zoom) {
      let scale
      switch (zoom) {
        case 0: scale = 0.25; break
        case 1: scale = 0.5 ; break
        case 2: scale = 1   ; break
        case 3: scale = 2   ; break
        case 4: scale = 4   ; break
        default: return
      }
      this.zoom = zoom
      slider.write(zoom)
      if (this.state === 'open') {
        const timer = this.zoomTimer
        timer.start = this.scale
        timer.end = scale
        timer.elapsed = 0
        timer.add()
      } else {
        this.scale = scale
      }
    }
  }
}()

// 设置悬停对象
Animation.setHover = function (hover) {
  if (this.hover !== hover) {
    this.hover = hover
    this.requestRendering()
  }
}

// 设置动作对象
Animation.setMotion = function (motion) {
  if (this.motion !== motion) {
    this.motion = motion
    this.updateMotionItem()
    this.stop()
    this.stopAnimation()
    this.requestRendering()
    this.updatePlayerMotion()
    this.player.destroyUpdatingEmitters()
    if (motion) {
      this.layers = motion.layers
      this.contextLoaded = false
      this.timeline.show()
      this.timeline.updateHead()
      this.layerList.update()
      Yami.Inspector.open('animMotion', motion)
      Yami.Curve.open()
      // 标记动作对象为已加载状态 - 以便销毁元素
      if (motion.loaded === undefined) {
        Object.defineProperty(motion, 'loaded', {
          configurable: true,
          value: true,
        })
      }
    } else {
      this.layers = null
      this.timeline.hide()
      this.layerList.clear()
      this.innerTimelineList.clear()
      this.unselectMarquee()
      Yami.Inspector.close()
      Yami.Curve.close()
    }
  }
}

// 编辑动作对象
Animation.editMotion = function (motion) {
  const proxy = {
    read() {
      return motion.id
    },
    input(id) {
      if (motion.id !== id) {
        Animation.history.save({
          type: 'animation-motion-id-change',
          motion: motion,
          id: motion.id,
        })
        motion.id = id
        Animation.requestRefreshingList()
      }
    },
  }
  Yami.Enum.open(proxy, 'string')
}

// 获取新的动作ID
Animation.getNewMotionId = function (callback) {
  const proxy = {
    read() {return ''},
    input(id) {callback(id)},
  }
  Yami.Enum.open(proxy, 'string')
}

// 显示目标对象
Animation.revealTarget = function IIFE() {
  const timer = new Yami.Timer({
    duration: 200,
    update: timer => {
      const {target} = timer
      if (target === Yami.Animation.target) {
        const easing = Yami.Easing.EasingMap.easeInOut
        const time = easing.map(timer.elapsed / timer.duration)
        const x = timer.startX * (1 - time) + timer.endX * time
        const y = timer.startY * (1 - time) + timer.endY * time
        const screen = Animation.screen
        const sl = screen.scrollLeft
        const st = screen.scrollTop
        Animation.updateCamera(x, y)
        Animation.updateTransform()
        if (screen.scrollLeft !== sl ||
          screen.scrollTop !== st) {
          Animation.requestRendering()
          Animation.marquee.resize()
        }
      } else {
        timer.target = null
        return false
      }
    },
    callback: timer => {
      timer.target = null
    },
  })
  return function () {
    const target = this.target
    if (target && !timer.target) {
      const matrix = Yami.GL.matrix
        .reset()
        .multiply(this.targetContext.matrix)
      const x = matrix[6]
      const y = matrix[7]
      const toleranceX = 0.5 / this.scaleX
      const toleranceY = 0.5 / this.scaleY
      const {centerX, centerY} = this
      // 目标和摄像机的位置不一定相等
      if (Math.abs(x - centerX) > toleranceX ||
        Math.abs(y - centerY) > toleranceY) {
        timer.target = target
        timer.startX = centerX
        timer.startY = centerY
        timer.endX = x
        timer.endY = y
        timer.elapsed = 0
        timer.add()
      }
    }
  }
}()

// 转移目标对象
Animation.shiftTarget = function (x, y) {
  const context = this.targetContext
  const target = this.target
  if (context !== null && target !== null) {
    this.planToSave()
    const map = this.inspectorTypeMap
    const key = map[context.layer.class]
    const editor = Yami.Inspector[key]
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'animation-target-shift'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        motion: this.motion,
        target: target,
        x: target.x,
        y: target.y,
      })
    }
    target.x = x
    target.y = y
    this.updateFrameContexts()
    this.requestRendering()

    // 更新编辑器
    if (editor.target === target) {
      editor.write({x, y})
    }
  }
}

// 调整目标对象
Animation.resizeTarget = function (scaleX, scaleY) {
  const context = this.targetContext
  const target = this.target
  if (context !== null && target !== null) {
    this.planToSave()
    const map = this.inspectorTypeMap
    const key = map[context.layer.class]
    const editor = Yami.Inspector[key]
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'animation-target-resize'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        motion: this.motion,
        target: target,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
      })
    }
    if (scaleX !== undefined) {
      target.scaleX = scaleX
    }
    if (scaleY !== undefined) {
      target.scaleY = scaleY
    }
    this.updateFrameContexts()
    this.requestRendering()

    // 更新编辑器
    if (editor.target === target) {
      editor.write({scaleX, scaleY})
    }
  }
}

// 旋转目标对象
Animation.rotateTarget = function (rotation) {
  const context = this.targetContext
  const target = this.target
  if (context !== null && target !== null) {
    this.planToSave()
    const map = this.inspectorTypeMap
    const key = map[context.layer.class]
    const editor = Yami.Inspector[key]
    const history = this.history
    const index = history.index
    const length = history.length
    const record = history[index]
    const type = 'animation-target-rotate'
    if (index !== length - 1 ||
      record === undefined ||
      record.type !== type ||
      record.target !== target) {
      history.save({
        type: type,
        editor: editor,
        motion: this.motion,
        target: target,
        rotation: target.rotation,
      })
    }
    target.rotation = rotation
    this.updateFrameContexts()
    this.requestRendering()

    // 更新编辑器
    if (editor.target === target) {
      editor.write({rotation})
    }
  }
}

// 设置控制点
Animation.setControlPoint = function (point) {
  if (this.controlPointActive !== point) {
    this.controlPointActive = point
    const points = this.controlPoints
    let cursor
    switch (point) {
      case null:
        cursor = ''
        break
      case points.jointRotate:
      case points.rectRotate.TL:
      case points.rectRotate.TR:
      case points.rectRotate.BL:
      case points.rectRotate.BR:
        cursor = 'alias'
        break
      case points.rectResize.T:
      case points.rectResize.L:
      case points.rectResize.R:
      case points.rectResize.B:
      case points.rectResize.TL:
      case points.rectResize.TR:
      case points.rectResize.BL:
      case points.rectResize.BR: {
        const angle = Math.modDegrees(point.angle + this.controlPointRotation, 180)
        if (angle < 22.5 || angle >= 157.5) {
          cursor = 'ew-resize'
        } else if (angle < 67.5) {
          cursor = 'nwse-resize'
        } else if (angle < 112.5) {
          cursor = 'ns-resize'
        } else {
          cursor = 'nesw-resize'
        }
        // 水平镜像视图模式
        if (this.mirror) switch (cursor) {
          case 'nwse-resize':
            cursor = 'nesw-resize'
            break
          case 'nesw-resize':
            cursor = 'nwse-resize'
            break
        }
        break
      }
    }
    this.body.style.cursor = cursor
  }
}

// 更新动作对象
Animation.updateMotion = function () {
  const item = this.list.read()
  if (item !== this.motion) {
    this.setMotion(item)
  }
}

// 更新动作对象列表项
Animation.updateMotionItem = function () {
  const {motion} = this
  if (motion !== null) {
    const {list} = this
    if (list.read() !== motion) {
      list.selectWithNoEvent(motion)
    }
  }
}

// 更新目标对象
Animation.updateTarget = function () {
  if (this.target !== null) {
    const {layer} = this.timelineMarquee
    if (this.layerList.read() !== layer) {
      this.unselectMarquee()
    }
  }
}

// 更新目标对象的上下文
Animation.updateTargetContext = function () {
  const target = this.target
  if (target !== null) {
    const {contexts} = this.player
    const {count} = contexts
    for (let i = 0; i < count; i++) {
      const context = contexts[i]
      if (context.frame === target) {
        this.targetContext = context
        return
      }
    }
  }
  this.targetContext = null
}

// 更新播放器动作
Animation.updatePlayerMotion = function () {
  const {player, motion} = this
  if (player.motion !== motion) {
    player.motion = motion
  }
}

// 更新所有帧的上下文
Animation.updateFrameContexts = function () {
  const player = this.player
  const fi = player.index
  player.updateFrameParameters(player.contexts, fi)
  if (this.showOnionskin) {
    const {length} = player
    if (length <= 1) return
    let pi = fi - 1
    let ni = fi + 1
    if (this.loop) {
      pi += length
      pi %= length
      ni %= length
    }
    const {prev, next} = player.onionskin
    player.updateFrameParameters(prev, pi)
    player.updateFrameParameters(next, ni)
  }
}

// 更新控制点
Animation.updateControlPoints = function (context) {
  let L, T, R, B
  const {layer, frame} = context
  switch (layer.class) {
    case 'sprite': {
      const key = layer.sprite
      const texture = this.player.textures[key]
      if (texture instanceof Yami.ImageTexture) {
        L = texture.offsetX
        T = texture.offsetY
        R = L + texture.width
        B = T + texture.height
      }
      break
    }
    case 'particle': {
      const emitter = context.emitter
      if (emitter !== undefined) {
        emitter.hasArea = false
        emitter.outerWidth = 0
        emitter.outerHeight = 0
        for (const {area} of emitter.data.layers) {
          switch (area.type) {
            case 'point':
            case 'edge':
              continue
          }
          if (L === undefined) {
            L = T = R = B = 0
            emitter.hasArea = true
          }
          switch (area.type) {
            case 'rectangle':
              L = Math.min(L, area.width * -0.5)
              T = Math.min(T, area.height * -0.5)
              R = Math.max(R, area.width * +0.5)
              B = Math.max(B, area.height * +0.5)
              continue
            case 'circle':
              L = Math.min(L, -area.radius)
              T = Math.min(T, -area.radius)
              R = Math.max(R, +area.radius)
              B = Math.max(B, +area.radius)
              continue
          }
        }
        if (emitter.hasArea) {
          emitter.outerWidth = R - L
          emitter.outerHeight = B - T
        }
      }
      break
    }
  }
  if (L === undefined) {
    this.controlPointVisible = false
    return false
  }
  const POINT_RADIUS = 4 / this.scale
  const points = this.controlPoints
  const matrix = context.matrix
  const a = matrix[0]
  const b = matrix[1]
  const c = matrix[3]
  const d = matrix[4]
  const e = matrix[6]
  const f = matrix[7]
  const x1 = a * L + c * T + e
  const y1 = b * L + d * T + f
  const x2 = a * L + c * B + e
  const y2 = b * L + d * B + f
  const x3 = a * R + c * B + e
  const y3 = b * R + d * B + f
  const x4 = a * R + c * T + e
  const y4 = b * R + d * T + f
  const angle1 = Math.atan2(y1 - y2, x1 - x2)
  const angle2 = Math.atan2(y2 - y3, x2 - x3)
  const angle3 = Math.atan2(y3 - y4, x3 - x4)
  const angle4 = Math.atan2(y4 - y1, x4 - x1)
  const ox1 = -Math.cos(angle3) * POINT_RADIUS
  const oy1 = Math.sin(angle1) * POINT_RADIUS
  const ox2 = -Math.cos(angle4) * POINT_RADIUS
  const oy2 = Math.sin(angle2) * POINT_RADIUS
  const ox3 = Math.cos(angle3) * POINT_RADIUS
  const oy3 = Math.sin(angle3) * POINT_RADIUS
  const ox4 = Math.cos(angle4) * POINT_RADIUS
  const oy4 = Math.sin(angle4) * POINT_RADIUS

  // 旋转控制点: 左上|右上|左下|右下
  const {rectRotate} = points
  rectRotate.TL.x = x1 + (ox1 - ox4) * 3
  rectRotate.TL.y = y1 + (oy1 - oy4) * 3
  rectRotate.TR.x = x4 + (ox4 - ox3) * 3
  rectRotate.TR.y = y4 + (oy4 - oy3) * 3
  rectRotate.BL.x = x2 + (ox2 - ox1) * 3
  rectRotate.BL.y = y2 + (oy2 - oy1) * 3
  rectRotate.BR.x = x3 + (ox3 - ox2) * 3
  rectRotate.BR.y = y3 + (oy3 - oy2) * 3
  // 调整控制点: 上|左|右|下|左上|右上|左下|右下
  const {rectResize} = points
  rectResize.T.x = (x4 + x1) / 2 + ox1
  rectResize.T.y = (y4 + y1) / 2 + oy1
  rectResize.L.x = (x1 + x2) / 2 + ox2
  rectResize.L.y = (y1 + y2) / 2 + oy2
  rectResize.R.x = (x3 + x4) / 2 + ox4
  rectResize.R.y = (y3 + y4) / 2 + oy4
  rectResize.B.x = (x2 + x3) / 2 + ox3
  rectResize.B.y = (y2 + y3) / 2 + oy3
  rectResize.TL.x = x1 + ox1 - ox4
  rectResize.TL.y = y1 + oy1 - oy4
  rectResize.TR.x = x4 + ox4 - ox3
  rectResize.TR.y = y4 + oy4 - oy3
  rectResize.BL.x = x2 + ox2 - ox1
  rectResize.BL.y = y2 + oy2 - oy1
  rectResize.BR.x = x3 + ox3 - ox2
  rectResize.BR.y = y3 + oy3 - oy2
  let rotation = frame.rotation
  let node = context
  while (node = node.parent) {
    const frame = node.frame
    if (frame !== null) {
      rotation += frame.rotation
    }
  }
  this.controlPointRotation = rotation
  this.controlPointVisible = true
  return true
}

// 更新头部位置
Animation.updateHead = function () {
  const {page, head} = this
  if (page.clientWidth !== 0) {
    // 调整左边位置
    const {nav} = Yami.Layout.getGroupOfElement(head)
    const nRect = nav.rect()
    const iRect = nav.lastChild.rect()
    const left = iRect.right - nRect.left
    if (head.left !== left) {
      head.left = left
      head.style.left = `${left}px`
    }
    // 调整居中组件的位置
    const width = nRect.right - iRect.right
    if (head.width !== width) {
      head.width = width
      const [start, center, end] = head.children
      end.style.marginLeft = ''
      const sRect = start.rect()
      const cRect = center.rect()
      const eRect = end.rect()
      const spacing = eRect.left - sRect.right - cRect.width
      const difference = sRect.right - nRect.left - eRect.width
      const margin = Math.min(spacing, difference)
      end.style.marginLeft = `${margin}px`
    }
  }
}

// 调整大小
Animation.resize = function () {
  if (this.state === 'open' &&
    this.screen.clientWidth !== 0) {
    const scale = this.scale
    const screenBox = CSS.getDevicePixelContentBoxSize(this.screen)
    const screenWidth = screenBox.width
    const screenHeight = screenBox.height
    const stageWidth = screenWidth + this.padding
    const stageHeight = screenHeight + this.padding
    const innerWidth = Math.round(stageWidth * scale)
    const innerHeight = Math.round(stageHeight * scale)
    const outerWidth = Math.max(screenWidth, innerWidth)
    const outerHeight = Math.max(screenHeight, innerHeight)
    const dpr = window.devicePixelRatio
    this.outerWidth = outerWidth
    this.outerHeight = outerHeight
    this.centerOffsetX = screenWidth / 2
    this.centerOffsetY = screenHeight / 2
    this.scaleX = innerWidth / stageWidth
    this.scaleY = innerHeight / stageHeight
    this.marquee.style.width = `${outerWidth / dpr}px`
    this.marquee.style.height = `${outerHeight / dpr}px`
    Yami.GL.resize(screenWidth, screenHeight)
    this.updateCamera()
    this.updateTransform()
    this.marquee.resize()
  }
}

// 获取指针坐标
Animation.getPointerCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (event) {
    const coords = event.getRelativeCoords(this.marquee)
    const dpr = window.devicePixelRatio
    point.x = (coords.x * dpr - (this.outerWidth >> 1)) / this.scaleX
    point.y = (coords.y * dpr - (this.outerHeight >> 1)) / this.scaleY
    if (this.mirror) {
      point.x = -point.x
    }
    return point
  }
}()

// 获取帧坐标
Animation.getFrameCoords = function IIFE() {
  const point = {x: 0, y: 0}
  return function (event, clamp = false) {
    const list = this.outerTimelineList
    const coords = event.getRelativeCoords(list)
    let x = Math.floor(coords.x / 16)
    let y = Math.floor(coords.y / 20)
    // 限定在列表框内
    if (clamp) {
      const sl = list.scrollLeft / 16
      const st = list.scrollTop / 20
      const sr = list.clientWidth / 16 + sl
      const sb = list.clientHeight / 20 + st
      x = Math.clamp(x, Math.floor(sl), Math.ceil(sr) - 1)
      y = Math.clamp(y, Math.floor(st), Math.ceil(sb) - 1)
    }
    point.x = x
    point.y = y
    return point
  }
}()

// 获取关键帧对象
Animation.getKeyFrame = function (x, y) {
  if (this.timelineMarquee.isPointIn(x, y)) {
    const {layer, x: sx, length} = this.timelineMarquee
    const ex = sx + length
    for (const frame of layer.frames) {
      const start = frame.start
      const end = frame.end
      if (sx >= end) continue
      if (ex <= start) break
      // 如果指向第一个关键帧则返回有效帧
      return x === start ? frame : null
    }
  }
  return null
}

// 获取图层索引
Animation.getLayerIndex = function (layer) {
  const timelines = this.innerTimelineList.childNodes
  const length = timelines.length
  for (let i = 0; i < length; i++) {
    if (timelines[i].layer === layer) {
      return i
    }
  }
  return -1
}

// 获取动作列表选项
Animation.getMotionListItems = function (animationId) {
  const motions = Yami.Data.animations[animationId]?.motions
  if (!motions) return [{
    name: Yami.Local.get('common.none'),
    value: '',
  }]

  // 设置选项缓存
  if (!('listItems' in motions)) {
    Object.defineProperty(motions, 'listItems', {
      writable: true,
      value: undefined,
    })
  }
  const version = Yami.Data.enumeration.context.version
  let items = motions.listItems
  // 枚举数据版本变化时重新生成选项列表
  if (items && items.version !== version) {
    items = undefined
  }
  if (items === undefined) {
    const length = motions.length
    items = new Array(length)
    for (let i = 0; i < length; i++) {
      const enumId = motions[i].id
      const name = Yami.Enum.getString(enumId)?.name ?? Yami.Command.parseUnlinkedId(enumId)
      items[i] = {
        name: name,
        value: enumId,
      }
    }
    if (length === 0) {
      items.push({
        name: Yami.Local.get('common.none'),
        value: '',
      })
    }
    items.version = version
    motions.listItems = items
  }
  return items
}

// 获取精灵图列表选项
Animation.getSpriteListItems = function (animationId) {
  const sprites = Yami.Data.animations[animationId]?.sprites
  if (!sprites) return [{name: 'No Image', value: ''}]

  // 设置选项缓存
  if (!('listItems' in sprites)) {
    Object.defineProperty(sprites, 'listItems', {
      writable: true,
      value: undefined,
    })
  }
  let items = sprites.listItems
  if (items === undefined) {
    const length = sprites.length
    const digits = Number.computeIndexDigits(length)
    items = new Array(length + 1)
    items[0] = {name: 'No Image', value: ''}
    for (let i = 0; i < length; i++) {
      const index = i.toString().padStart(digits, '0')
      const sprite = sprites[i]
      items[i + 1] = {
        name: `${index}:${sprite.name}`,
        value: sprite.id,
      }
    }
    sprites.listItems = items
  }
  return items
}

// 更新摄像机位置
Animation.updateCamera = function (x = this.centerX, y = this.centerY) {
  const screen = this.screen
  const dpr = window.devicePixelRatio
  const scrollX = x * this.scaleX + this.outerWidth / 2
  const scrollY = y * this.scaleY + this.outerHeight / 2
  const toleranceForDPR = 0.0001
  screen.rawScrollLeft = Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - Yami.GL.width) / dpr
  screen.rawScrollTop = Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - Yami.GL.height) / dpr
  screen.scrollLeft = (scrollX - (Yami.GL.width >> 1) + toleranceForDPR) / dpr
  screen.scrollTop = (scrollY - (Yami.GL.height >> 1) + toleranceForDPR) / dpr
}

// 更新变换参数
Animation.updateTransform = function () {
  const screen = this.screen
  const dpr = window.devicePixelRatio
  const left = Math.roundTo(screen.scrollLeft * dpr - (this.outerWidth >> 1), 4)
  const top = Math.roundTo(screen.scrollTop * dpr - (this.outerHeight >> 1), 4)
  const right = left + Yami.GL.width
  const bottom = top + Yami.GL.height
  this.scrollLeft = left / this.scaleX
  this.scrollTop = top / this.scaleY
  this.scrollRight = right / this.scaleX
  this.scrollBottom = bottom / this.scaleY
  this.updateMatrix()
  const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX
  const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY
  this.centerX = Math.roundTo((scrollX - this.outerWidth / 2) / this.scaleX, 4)
  this.centerY = Math.roundTo((scrollY - this.outerHeight / 2) / this.scaleY, 4)
}

// 更新矩阵
Animation.updateMatrix = function () {
  const matrix = this.matrix.reset()
    .scale(this.scaleX, this.scaleY)
    .translate(-this.scrollLeft, -this.scrollTop)
  if (this.mirror) {
    matrix.mirrorh()
  }
}

// 更新刻度尺
Animation.updateRuler = function () {
  const {outerRuler, innerRuler} = this
  const width = outerRuler.clientWidth
  if (width !== 0) {
    const length = Math.ceil((width + 16) / 80) + 1
    const nodes = innerRuler.childNodes
    let i = nodes.length
    if (i !== length) {
      if (i < length) {
        const start = innerRuler.start ?? 0
        let number = (start + i) * 5
        while (i < length) {
          const node = document.createElement('box')
          node.addClass('timeline-number')
          node.textContent = number.toString()
          innerRuler.appendChild(node)
          number += 5
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

// 更新时间轴
Animation.updateTimeline = function () {
  // 创建时间轴
  Animation.createTimelines()

  // 更新时间轴长度
  Animation.updateTimelineLength()

  // 更新选框
  Animation.updateMarquee()

  // 更新指针区域高度
  Animation.updatePointerArea()

  // 加载帧数据
  Animation.loadFrames(Animation.player.index, true)
}

// 更新时间轴长度
Animation.updateTimelineLength = function () {
  this.player.computeLength()
  const end = this.player.length
  const max = Math.floor(end / 100 + 1) * 100
  if (this.frameMax !== max) {
    this.frameMax = max
    this.innerTimelineList.style.width =
    this.innerPointerArea.style.width = `${max * 16}px`
  }
}

// 更新指针区域高度
Animation.updatePointerArea = function () {
  const list = this.outerTimelineList
  const area = this.outerPointerArea
  if (list.clientWidth !== 0) {
    list.clientWidth < list.scrollWidth
    ? area.addClass('has-horiz-scrollbar')
    : area.removeClass('has-horiz-scrollbar')
    list.clientHeight < list.scrollHeight
    ? area.addClass('has-vert-scrollbar')
    : area.removeClass('has-vert-scrollbar')
  }
}

// 更新指针位置
Animation.updatePointer = function () {
  const x = Math.floor(this.player.index)
  const {pointer} = this
  if (pointer.x !== x) {
    pointer.x = x
    pointer.style.left = `${x * 16}px`
  }
}

// 更新光标
Animation.updateCursor = function (x, y) {
  const {timelineCursor} = this
  if (timelineCursor.x !== x ||
    timelineCursor.y !== y) {
    timelineCursor.x = x
    timelineCursor.y = y
    if (x !== -1) {
      timelineCursor.style.left = `${x * 16}px`
      timelineCursor.style.top = `${y * 20}px`
      timelineCursor.show()
    } else {
      timelineCursor.hide()
    }
  }
}

// 选择指定的帧
Animation.selectFrame = function (frame, fStart, fLength) {
  if (!frame) {
    return this.unselectMarquee()
  }
  let layer
  const {contexts} = this.player
  const {count} = contexts
  for (let i = 0; i < count; i++) {
    const sLayer = contexts[i].layer
    if (sLayer.frames.includes(frame)) {
      layer = sLayer
      break
    }
  }
  if (!layer) {
    return
  }
  this.layerList.expandToItem(layer)
  if (Yami.Inspector.animSpriteFrame.target !== frame) {
    const list = this.innerTimelineList
    const timelines = list.childNodes
    const length = timelines.length
    for (let y = 0; y < length; y++) {
      if (timelines[y].layer === layer) {
        const x = fStart ?? frame.start
        const w = fLength ?? 1
        const i = this.player.index
        this.selectMarquee(x, y, w, x)
        this.scrollToMarquee(false)
        if (i < x || i >= x + w) {
          this.loadFrames(x)
        }
      }
    }
  }
}

// 选择选框
Animation.selectMarquee = function (x, y, length, origin) {
  this.stop()
  const timelines = this.innerTimelineList.childNodes
  const ex = this.frameMax
  const ey = timelines.length
  if (x >= 0 && x + length <= ex && y >= 0 && y < ey) {
    // 更新选框
    const {layer} = timelines[y]
    const marquee = this.timelineMarquee
    if (marquee.layer !== layer ||
      marquee.x !== x ||
      marquee.length !== length) {
      marquee.layer = layer
      marquee.x = x
      marquee.length = length
      this.updateMarquee()

      // 打开帧数据
      this.openFrame()

      // 选择图层列表
      this.layerList.selectWithNoEvent(layer)
    }
    if (origin !== undefined) {
      marquee.origin = origin
    }
  }
}

// 取消选择选框
Animation.unselectMarquee = function (frame) {
  const marquee = this.timelineMarquee
  if (frame !== undefined
  ? this.target === frame
  : marquee.layer !== null) {
    marquee.layer = null
    if (this.target !== null) {
      this.target = null
      this.updateTargetContext()
      this.requestRendering()
      Yami.Inspector.close()
    }
    marquee.x = -1
    marquee.length = -1
    marquee.origin = -1
    this.updateMarquee()
  }
}

// 更新选框
Animation.updateMarquee = function () {
  const marquee = this.timelineMarquee
  const {layer} = marquee
  if (layer !== null) {
    const y = this.getLayerIndex(layer)
    if (y !== -1) {
      const {x, length} = marquee
      marquee.y = y
      marquee.style.left = `${x * 16}px`
      marquee.style.top = `${y * 20}px`
      marquee.style.width = `${length * 16}px`
      marquee.show()
      return
    }
  }
  marquee.y = -1
  marquee.hide()
}

// 滚动到选框的位置
Animation.scrollToMarquee = function (shiftKey) {
  const {x, y, length, origin} = this.timelineMarquee
  if (y !== -1) {
    const list = this.outerTimelineList
    const left = list.scrollLeft
    const min = x * 16 + length * 16 - list.clientWidth
    const max = x * 16
    const scrollLeft =
      shiftKey && x === origin && length > 1
    ? Math.max(Math.min(left, max), min)
    : Math.min(Math.max(left, min), max)
    const scrollTop = Math.clamp(
      list.scrollTop,
      y * 20 + 20 - list.clientHeight,
      y * 20,
    )
    if (list.scrollLeft !== scrollLeft) {
      list.scrollLeft = scrollLeft
    }
    if (list.scrollTop !== scrollTop) {
      list.scrollTop = scrollTop
    }
  }
}

// 更新转移选框
Animation.updateMarqueeShift = function (x, y, length) {
  const timelines = this.innerTimelineList.childNodes
  const marquee = this.timelineMarqueeShift
  marquee.layer = timelines[y]?.layer ?? null
  if (marquee.x !== x) {
    marquee.x = x
    marquee.style.left = `${x * 16}px`
  }
  if (marquee.y !== y) {
    marquee.y = y
    marquee.style.top = `${y * 20}px`
  }
  if (length !== undefined &&
    marquee.length !== length) {
    marquee.length = length
    marquee.style.width = `${length * 16}px`
  }
}

// 选择单个帧 - 相对位置
Animation.selectFrameRelative = function (direction) {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  let {x, y, length} = marquee
  switch (direction) {
    case 'left':
      x = length > 1 ? x : x - 1
      break
    case 'up':
      y = Math.max(y - 1, 0)
      break
    case 'right':
      x = length > 1 ? x + length - 1 : x + 1
      break
    case 'down': {
      const list = this.innerTimelineList
      const ey = list.childNodes.length
      y = Math.min(y + 1, ey - 1)
      break
    }
  }
  this.selectMarquee(x, y, 1, x)
  this.scrollToMarquee(false)
  this.loadFrames(x)
}

// 选择单个帧 - 在首尾
Animation.selectFrameAtHomeEnd = function (direction) {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  let {layer, x, y, length} = marquee
  const frames = layer.frames
  const fLength = frames.length
  switch (direction) {
    case 'home':
      if (fLength !== 0) {
        const head = frames[0].start
        x = x !== head || length !== 1 ? head : 0
      } else {
        x = 0
      }
      break
    case 'end':
      if (fLength !== 0) {
        const foot = frames[fLength - 1].end - 1
        x = x !== foot || length !== 1 ? foot : this.frameMax - 1
      } else {
        x = this.frameMax - 1
      }
      break
  }
  this.selectMarquee(x, y, 1, x)
  this.scrollToMarquee(false)
  this.loadFrames(x)
}

// 选择关键帧有关的所有帧
Animation.selectAllFramesOfKey = function () {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  const {layer, y, origin} = marquee
  for (const frame of layer.frames) {
    const start = frame.start
    const end = frame.end
    if (origin >= end) continue
    if (origin < start) break
    this.selectMarquee(start, y, end - start, origin)
    this.scrollToMarquee(false)
    return
  }
}

// 选择多个帧 - 相对位置
Animation.multiSelectFramesRelative = function (direction) {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  let {x, y, length, origin} = marquee
  const forward = x === origin
  switch (direction) {
    case 'left':
      if (forward && length > 1) {
        length--
      } else {
        x--
        length++
      }
      break
    case 'right':
      if (forward) {
        length++
      } else {
        x++
        length--
      }
      break
  }
  this.selectMarquee(x, y, length)
  this.scrollToMarquee(true)
  this.loadFrames(forward ? x + length - 1 : x)
}

// 选择多个帧 - 到首尾
Animation.multiSelectFramesToHomeEnd = function (direction) {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  let {layer, x, y, length, origin} = marquee
  const frames = layer.frames
  const fLength = frames.length
  switch (direction) {
    case 'home':
      if (fLength !== 0) {
        const head = frames[0].start
        x = x === origin ? x + length - 1 : x
        x = x !== head ? head : 0
      } else {
        x = 0
      }
      break
    case 'end':
      if (fLength !== 0) {
        const foot = frames[fLength - 1].end - 1
        x = x === origin ? x + length - 1 : x
        x = x !== foot ? foot : this.frameMax - 1
      } else {
        x = this.frameMax - 1
      }
      break
  }
  const mx = Math.min(x, origin)
  const mw = Math.abs(x - origin) + 1
  this.selectMarquee(mx, y, mw, origin)
  this.scrollToMarquee(true)
  this.loadFrames(x)
}

// 打开帧数据
Animation.openFrame = function () {
  const marquee = this.timelineMarquee
  const {layer, x} = marquee
  for (const frame of layer.frames) {
    const start = frame.start
    const end = frame.end
    if (x >= end) continue
    if (x < start) break
    if (this.target !== frame) {
      this.target = frame
      this.updateTargetContext()
      this.requestRendering()
      const map = this.inspectorTypeMap
      const key = map[layer.class]
      Yami.Inspector.open(key, frame)
    }
    return
  }
  if (this.target !== null) {
    this.target = null
    this.updateTargetContext()
    this.requestRendering()
    Yami.Inspector.close()
  }
}

// 加载精灵纹理
Animation.loadTextures = function () {
  if (this.state === 'closed') return
  const {floor, max} = Math
  const player = this.player
  const last = player.textures
  const textures = player.textures = {}
  for (const sprite of this.sprites) {
    const spriteId = sprite.id
    const imageId = sprite.image
    const texture = last[spriteId]
    const {hframes, vframes} = sprite
    if (texture instanceof Yami.ImageTexture &&
      texture.base.guid === imageId) {
      const {base} = texture
      const width = floor(max(base.width / hframes, 1))
      const height = floor(max(base.height / vframes, 1))
      texture.hframes = hframes
      texture.vframes = vframes
      texture.width = width
      texture.height = height
      texture.offsetX = -width / 2
      texture.offsetY = -height / 2
      textures[spriteId] = texture
      this.requestRendering()
      continue
    }
    if (imageId) {
      const texture = new Yami.ImageTexture(imageId)
      texture.on('load', () => {
        if (player.textures === textures) {
          const {base} = texture
          const width = floor(max(base.width / hframes, 1))
          const height = floor(max(base.height / vframes, 1))
          texture.hframes = hframes
          texture.vframes = vframes
          texture.width = width
          texture.height = height
          texture.offsetX = -width / 2
          texture.offsetY = -height / 2
          textures[spriteId] = texture
          this.requestRendering()
        } else {
          texture.destroy()
        }
      })
    }
  }
  // 销毁不再使用的图像纹理
  for (const spriteId of Object.keys(last)) {
    const texture = last[spriteId]
    if (texture !== textures[spriteId] &&
      texture instanceof Yami.ImageTexture) {
      texture.destroy()
    }
  }
}

// 加载帧数据
Animation.loadFrames = function (index, forceReload = false) {
  const player = this.player
  const fe = player.length
  const fi = Math.min(Math.max(index, 0), fe - 1)
  if (player.index !== fi || forceReload) {
    player.index = fi

    // 更新所有帧的上下文
    this.updateFrameContexts()

    // 更新目标对象的上下文
    this.updateTargetContext()

    // 更新指针位置
    this.updatePointer()

    // 请求绘制画面
    this.requestRendering()
  }
}

// 绘制背景
Animation.drawBackground = function () {
  const gl = Yami.GL
  gl.clearColor(...this.background.getGLRGBA())
  gl.clear(gl.COLOR_BUFFER_BIT)
}

// 绘制描图纸
Animation.drawOnionskins = function () {
  if (this.showOnionskin) {
    Yami.GL.alpha = 0.25
    const {prev, next} =
    this.player.onionskin
    this.drawSpriteLayers(prev)
    this.drawSpriteLayers(next)
    Yami.GL.alpha = 1
  }
}

// 绘制精灵图层
Animation.drawSpriteLayers = function (contexts = this.player.contexts) {
  const {player} = this
  const {count} = contexts
  const gl = Yami.GL
  let ready = false
  for (let i = 0; i < count; i++) {
    const context = contexts[i]
    const {layer, frame} = context
    if (layer.class === 'sprite' &&
      !layer.hidden &&
      frame !== null) {
      const key = layer.sprite
      const texture = player.textures[key]
      if (texture instanceof Yami.ImageTexture) {
        if (!ready) {
          ready = true
          const program = gl.spriteProgram.use()
          const matrix = gl.matrix.project(
            gl.flip,
            gl.width,
            gl.height,
          ).multiply(Animation.matrix)
          gl.batchRenderer.setAttrSize(8)
          gl.bindVertexArray(program.vao)
          gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
          gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
        }
        player.drawSprite(context, texture, 'raw')
      }
    }
  }
  gl.batchRenderer.draw()
}

// 绘制粒子发射器
Animation.drawEmitters = function () {
  if (!this.showMark) return
  const gl = Yami.GL
  const vertices = gl.arrays[0].float32
  const matrix = gl.matrix
  const {contexts} = this.player
  const {count} = contexts
  for (let i = 0; i < count; i++) {
    const context = contexts[i]
    const {layer, frame} = context
    if (layer.class === 'particle' &&
      !layer.hidden &&
      frame !== null) {
      matrix
      .set(Animation.matrix)
      .multiply(context.matrix)
      let vi = 0
      const x = matrix[6]
      const y = matrix[7]
      const scale = Math.min(this.scale, 1)
      const innerRadius = 6 * scale
      const outerRadius = 20 * scale
      const angleCount = 8
      const step = Math.PI * 2 / angleCount
      vertices[vi++] = x
      vertices[vi++] = y
      for (let i = 0; i < angleCount; i++) {
        const angle1 = i * step - Math.PI / 2
        const angle2 = angle1 + step / 2
        vertices[vi    ] = x + outerRadius * Math.cos(angle1)
        vertices[vi + 1] = y + outerRadius * Math.sin(angle1)
        vertices[vi + 2] = x + innerRadius * Math.cos(angle2)
        vertices[vi + 3] = y + innerRadius * Math.sin(angle2)
        vi += 4
      }
      vertices[vi++] = vertices[2]
      vertices[vi++] = vertices[3]
      const program = gl.graphicProgram.use()
      matrix.project(
        gl.flip,
        gl.width,
        gl.height,
      )
      gl.bindVertexArray(program.vao.a10)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      switch (frame) {
        case this.target:
          gl.vertexAttrib4f(program.a_Color, 0, 1, 1, 1)
          break
        case this.hover:
          gl.vertexAttrib4f(program.a_Color, 0.75, 1, 1, 1)
          break
        default:
          gl.vertexAttrib4f(program.a_Color, 0.75, 1, 0.75, 1)
          break
      }
      gl.drawArrays(gl.TRIANGLE_FAN, 0, vi / 2)
    }
  }
}

// 发射粒子
Animation.emitParticles = function (deltaTime) {
  const {player} = this
  const {contexts} = player
  const {count} = contexts
  for (let i = 0; i < count; i++) {
    const context = contexts[i]
    const {layer} = context
    if (layer.class === 'particle' && !layer.hidden) {
      const {frame, emitter} = context
      if (frame !== null &&
        emitter !== undefined) {
        switch (layer.angle) {
          case 'default':
            emitter.angle = 0
            break
          case 'inherit': {
            const {matrix} = context
            const a = matrix[0]
            const b = matrix[1]
            emitter.angle = Math.atan2(b, a)
            break
          }
        }
        emitter.emitParticles(deltaTime)
      }
    }
  }
}

// 更新粒子
Animation.updateParticles = function (deltaTime) {
  this.particleUpdating = false
  const {emitters} = this.player
  let i = emitters.length
  while (--i >= 0) {
    const emitter = emitters[i]
    const updating = emitter.updateParticles(deltaTime)
    if (updating === false) {
      if (emitter.disabled) {
        emitter.destroy()
        emitters.splice(i, 1)
      }
    }
    this.particleUpdating ||= updating
  }
}

// 绘制粒子
Animation.drawParticles = function () {
  if (this.particleUpdating) {
    const {emitters} = this.player
    for (const emitter of emitters) {
      emitter.draw()
    }
  }
}

// 绘制坐标轴
Animation.drawCoordinateAxes = function () {
  const gl = Yami.GL
  const vertices = gl.arrays[0].float32
  const matrix = gl.matrix.set(Animation.matrix)
  // 避免缩放时虚线抖动
  const L = -10000 / this.scaleX
  const T = -10000 / this.scaleY
  const R = 10000 / this.scaleX
  const B = 10000 / this.scaleY
  const a = matrix[0]
  const b = matrix[1]
  const c = matrix[3]
  const d = matrix[4]
  const e = matrix[6]
  const f = matrix[7]
  const x1 = a * L + e
  const y1 = b * L + f
  const x2 = a * R + e
  const y2 = b * R + f
  const x3 = c * T + e
  const y3 = d * T + f
  const x4 = c * B + e
  const y4 = d * B + f
  vertices[0] = x1
  vertices[1] = y1 + 0.5
  vertices[2] = 0
  vertices[3] = x2
  vertices[4] = y2 + 0.5
  vertices[5] = Math.dist(x1, y1, x2, y2)
  vertices[6] = x3 + 0.5
  vertices[7] = y3
  vertices[8] = 0
  vertices[9] = x4 + 0.5
  vertices[10] = y4
  vertices[11] = Math.dist(x3, y3, x4, y4)
  matrix.project(
    gl.flip,
    gl.width,
    gl.height,
  )
  gl.alpha = 1
  gl.blend = 'normal'
  const program = gl.dashedLineProgram.use()
  gl.bindVertexArray(program.vao)
  gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
  gl.uniform4f(program.u_Color, 0.5, 0, 1, 1)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12)
  gl.drawArrays(gl.LINES, 0, 4)
}

// 绘制关节节点
Animation.drawJointNodes = function () {
  if (!this.showMark) return
  const gl = Yami.GL
  const vertices = gl.arrays[0].float32
  const matrix = gl.matrix
  const {contexts} = this.player
  const {count} = contexts
  for (let i = 0; i < count; i++) {
    const context = contexts[i]
    const {layer, frame} = context
    if (layer.class === 'joint' &&
      !layer.hidden &&
      frame !== null) {
      matrix
      .set(Animation.matrix)
      .multiply(context.matrix)
      let vi = 0
      const x = matrix[6]
      const y = matrix[7]
      const scale = Math.min(this.scale, 1)
      const radius = 5.5 * scale
      const offset = 1.5 * scale
      const segments = 40
      const step = Math.PI * 2 / segments
      for (let i = 0, j = 1; i < segments; i++, j = -j) {
        const angle = i * step
        const or = j * offset
        vertices[vi    ] = x + (radius + or) * Math.cos(angle)
        vertices[vi + 1] = y + (radius + or) * Math.sin(angle)
        vi += 2
      }
      vertices[vi    ] = vertices[0]
      vertices[vi + 1] = vertices[1]
      vertices[vi + 2] = vertices[2]
      vertices[vi + 3] = vertices[3]
      vi += 4
      const program = gl.graphicProgram.use()
      matrix.project(
        gl.flip,
        gl.width,
        gl.height,
      )
      gl.bindVertexArray(program.vao.a10)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      switch (frame) {
        case this.target:
          gl.vertexAttrib4f(program.a_Color, 0, 1, 1, 1)
          break
        case this.hover:
          gl.vertexAttrib4f(program.a_Color, 0.75, 1, 1, 1)
          break
        default:
          gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1)
          break
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vi / 2)
    }
  }
}

// 绘制关节箭头
Animation.drawJointArrows = function () {
  if (!this.showMark) return
  const gl = Yami.GL
  const vertices = gl.arrays[0].float32
  const matrix = gl.matrix
  const {contexts} = this.player
  const {count} = contexts
  for (let i = 0; i < count; i++) {
    const context = contexts[i]
    const {layer, frame, parent} = context
    if (layer.class === 'joint' &&
      frame !== null &&
      parent !== null &&
      parent.frame !== null &&
      !parent.layer.hidden) {
      matrix
      .set(Animation.matrix)
      .multiply(parent.matrix)
      const sx = matrix[6]
      const sy = matrix[7]
      matrix
      .set(Animation.matrix)
      .multiply(context.matrix)
      const dx = matrix[6]
      const dy = matrix[7]
      if (sx === dx && sy === dy) {
        continue
      }
      let vi = 0
      const scale = Math.min(this.scale, 1)
      const jointRadius = 5.5 * scale
      const smallRadius = 0.5 * scale
      const largeRadius = 9 * scale
      const angle = Math.atan2(dy - sy, dx - sx)
      const sAngle1 = angle + Math.PI / 2
      const eAngle1 = angle - Math.PI / 2
      const sAngle2 = angle + Math.PI / 4
      const eAngle2 = angle - Math.PI / 4
      const x = sx + jointRadius * Math.cos(angle)
      const y = sy + jointRadius * Math.sin(angle)
      vertices[vi    ] = x
      vertices[vi + 1] = y
      vertices[vi + 2] = x + largeRadius * Math.cos(eAngle2)
      vertices[vi + 3] = y + largeRadius * Math.sin(eAngle2)
      vertices[vi + 4] = dx + smallRadius * Math.cos(eAngle1)
      vertices[vi + 5] = dy + smallRadius * Math.sin(eAngle1)
      vertices[vi + 6] = dx + smallRadius * Math.cos(sAngle1)
      vertices[vi + 7] = dy + smallRadius * Math.sin(sAngle1)
      vertices[vi + 8] = x + largeRadius * Math.cos(sAngle2)
      vertices[vi + 9] = y + largeRadius * Math.sin(sAngle2)
      vi += 10
      const program = gl.graphicProgram.use()
      matrix.project(
        gl.flip,
        gl.width,
        gl.height,
      )
      gl.bindVertexArray(program.vao.a10)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      switch (parent.frame) {
        case this.target:
          gl.vertexAttrib4f(program.a_Color, 0, 1, 1, 1)
          break
        case this.hover:
          gl.vertexAttrib4f(program.a_Color, 0.75, 1, 1, 1)
          break
        default:
          gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1)
          break
      }
      gl.drawArrays(gl.TRIANGLE_FAN, 0, vi / 2)
    }
  }
}

// 绘制关节旋转器
Animation.drawJointSpinner = function () {
  const context = this.targetContext
  const target = this.target
  if (target !== null &&
    context !== null &&
    context.layer.class === 'joint' &&
    !context.layer.hidden) {
    const gl = Yami.GL
    const vertices = gl.arrays[0].float32
    const matrix = gl.matrix
    .set(Animation.matrix)
    .multiply(context.matrix)
    let vi = 0
    const x = matrix[6]
    const y = matrix[7]
    const scale = Math.min(this.scale, 1)
    const radius = 12 * scale
    const offset = 2 * scale
    const segments = 40
    const step = Math.PI * 2 / segments
    for (let i = 0, j = 1; i < segments; i++, j = -j) {
      const angle = i * step
      const or = j * offset
      vertices[vi    ] = x + (radius + or) * Math.cos(angle)
      vertices[vi + 1] = y + (radius + or) * Math.sin(angle)
      vi += 2
    }
    vertices[vi    ] = vertices[0]
    vertices[vi + 1] = vertices[1]
    vertices[vi + 2] = vertices[2]
    vertices[vi + 3] = vertices[3]
    vi += 4
    const mi = vi
    const innerRadius = 16 * scale
    const outerRadius = 20 * scale
    let rotation = target.rotation
    let node = context
    while (node = node.parent) {
      const frame = node.frame
      if (frame !== null) {
        rotation += frame.rotation
      }
    }
    const angle = Math.radians(rotation)
    const sAngle = angle - Math.PI / 12
    const eAngle = angle + Math.PI / 12
    const arrowSegments = 5
    vertices[vi    ] = x + outerRadius * Math.cos(angle)
    vertices[vi + 1] = y + outerRadius * Math.sin(angle)
    vi += 2
    for (let i = 0; i <= arrowSegments; i++) {
      const ratio = i / arrowSegments
      const angle = sAngle * (1 - ratio) + eAngle * ratio
      vertices[vi    ] = x + innerRadius * Math.cos(angle)
      vertices[vi + 1] = y + innerRadius * Math.sin(angle)
      vi += 2
    }
    const program = gl.graphicProgram.use()
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.bindVertexArray(program.vao.a10)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, mi / 2)
    gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1)
    gl.drawArrays(gl.TRIANGLE_FAN, mi / 2, (vi - mi) / 2)
  }
}

// 绘制悬停图像线框
Animation.drawHoverWireframe = function () {
  const hover = this.hover
  if (hover !== null && hover !== this.target) {
    const {contexts} = this.player
    const {count} = contexts
    for (let i = 0; i < count; i++) {
      const context = contexts[i]
      if (context.frame === hover &&
        !context.layer.hidden) {
        switch (context.layer.class) {
          case 'joint':
            break
          case 'sprite':
            this.drawSpriteWireframe(context, 0xffffffff)
            break
          case 'particle':
            this.drawEmitterWireframe(context, 0xffffffff)
            break
        }
        return
      }
    }
  }
}

// 绘制目标图像线框
Animation.drawTargetWireframe = function () {
  const context = this.targetContext
  if (context !== null && this.target !== null) {
    switch (context.layer.class) {
      case 'joint':
        break
      case 'sprite':
        this.drawSpriteWireframe(context, 0xffc0ff00)
        break
      case 'particle':
        this.drawEmitterWireframe(context, 0xffc0ff00)
        break
    }
  }
}

// 绘制精灵线框
Animation.drawSpriteWireframe = function (context, color) {
  const key = context.layer.sprite
  const texture = this.player.textures[key]
  if (!texture) return
  const gl = Yami.GL
  const vertices = gl.arrays[0].float32
  const colors = gl.arrays[0].uint32
  const matrix = gl.matrix
  .set(Animation.matrix)
  .multiply(context.matrix)
  const L = texture.offsetX
  const T = texture.offsetY
  const R = L + texture.width
  const B = T + texture.height
  const a = matrix[0]
  const b = matrix[1]
  const c = matrix[3]
  const d = matrix[4]
  const e = matrix[6]
  const f = matrix[7]
  const x1 = a * L + c * T + e
  const y1 = b * L + d * T + f
  const x2 = a * L + c * B + e
  const y2 = b * L + d * B + f
  const x3 = a * R + c * B + e
  const y3 = b * R + d * B + f
  const x4 = a * R + c * T + e
  const y4 = b * R + d * T + f
  const angle1 = Math.atan2(y1 - y2, x1 - x2)
  const angle2 = Math.atan2(y2 - y3, x2 - x3)
  const angle3 = Math.atan2(y3 - y4, x3 - x4)
  const angle4 = Math.atan2(y4 - y1, x4 - x1)
  const ox1 = Math.cos(angle1) * 0.5
  const oy1 = Math.sin(angle1) * 0.5
  const ox2 = Math.cos(angle2) * 0.5
  const oy2 = Math.sin(angle2) * 0.5
  const ox3 = Math.cos(angle3) * 0.5
  const oy3 = Math.sin(angle3) * 0.5
  const ox4 = Math.cos(angle4) * 0.5
  const oy4 = Math.sin(angle4) * 0.5
  const bx1 = x1 + ox4 - ox1
  const by1 = y1 + oy4 - oy1
  const bx2 = x2 + ox1 - ox2
  const by2 = y2 + oy1 - oy2
  const bx3 = x3 + ox2 - ox3
  const by3 = y3 + oy2 - oy3
  const bx4 = x4 + ox3 - ox4
  const by4 = y4 + oy3 - oy4
  vertices[0] = bx1
  vertices[1] = by1
  colors  [2] = color
  vertices[3] = bx2
  vertices[4] = by2
  colors  [5] = color
  vertices[6] = bx3
  vertices[7] = by3
  colors  [8] = color
  vertices[9] = bx4
  vertices[10] = by4
  colors  [11] = color
  matrix.project(
    gl.flip,
    gl.width,
    gl.height,
  )
  gl.alpha = 1
  gl.blend = 'normal'
  const program = gl.graphicProgram.use()
  gl.bindVertexArray(program.vao)
  gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12)
  gl.drawArrays(gl.LINE_LOOP, 0, 4)
}

// 绘制粒子发射器线框
Animation.drawEmitterWireframe = function (context, color) {
  const emitter = context.emitter
  if (!emitter) return
  const gl = Yami.GL
  const vertices = gl.arrays[0].float32
  const colors = gl.arrays[0].uint32
  const matrix = gl.matrix
  .set(Animation.matrix)
  .multiply(context.matrix)
  const a = matrix[0]
  const b = matrix[1]
  const c = matrix[3]
  const d = matrix[4]
  const e = matrix[6]
  const f = matrix[7]
  for (const {area} of emitter.data.layers) {
    switch (area.type) {
      case 'point':
      case 'edge':
        continue
    }
    let vi = 0
    switch (area.type) {
      case 'rectangle': {
        const L = area.width * -0.5
        const T = area.height * -0.5
        const R = area.width * +0.5
        const B = area.height * +0.5
        const x1 = a * L + c * T + e
        const y1 = b * L + d * T + f
        const x2 = a * L + c * B + e
        const y2 = b * L + d * B + f
        const x3 = a * R + c * B + e
        const y3 = b * R + d * B + f
        const x4 = a * R + c * T + e
        const y4 = b * R + d * T + f
        const angle1 = Math.atan2(y1 - y2, x1 - x2)
        const angle2 = Math.atan2(y2 - y3, x2 - x3)
        const angle3 = Math.atan2(y3 - y4, x3 - x4)
        const angle4 = Math.atan2(y4 - y1, x4 - x1)
        const ox1 = Math.cos(angle1) * 0.5
        const oy1 = Math.sin(angle1) * 0.5
        const ox2 = Math.cos(angle2) * 0.5
        const oy2 = Math.sin(angle2) * 0.5
        const ox3 = Math.cos(angle3) * 0.5
        const oy3 = Math.sin(angle3) * 0.5
        const ox4 = Math.cos(angle4) * 0.5
        const oy4 = Math.sin(angle4) * 0.5
        const bx1 = x1 + ox4 - ox1
        const by1 = y1 + oy4 - oy1
        const bx2 = x2 + ox1 - ox2
        const by2 = y2 + oy1 - oy2
        const bx3 = x3 + ox2 - ox3
        const by3 = y3 + oy2 - oy3
        const bx4 = x4 + ox3 - ox4
        const by4 = y4 + oy3 - oy4
        vertices[0] = bx1
        vertices[1] = by1
        colors  [2] = color
        vertices[3] = bx2
        vertices[4] = by2
        colors  [5] = color
        vertices[6] = bx3
        vertices[7] = by3
        colors  [8] = color
        vertices[9] = bx4
        vertices[10] = by4
        colors  [11] = color
        vi = 12
        break
      }
      case 'circle': {
        const ar = area.radius
        const segments = 100
        const step = Math.PI * 2 / segments
        for (let i = 0; i < segments; i++) {
          const angle = i * step
          const x = ar * Math.cos(angle)
          const y = ar * Math.sin(angle)
          vertices[vi    ] = a * x + c * y + e
          vertices[vi + 1] = b * x + d * y + f
          colors  [vi + 2] = color
          vi += 3
        }
        break
      }
    }
    gl.alpha = 1
    gl.blend = 'normal'
    const program = gl.graphicProgram.use()
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.drawArrays(gl.LINE_LOOP, 0, vi / 3)
  }
}

// 绘制目标精灵锚点
Animation.drawTargetAnchor = function () {
  const context = this.targetContext
  if (context !== null && this.target !== null) {
    const gl = Yami.GL
    const vertices = gl.arrays[0].float32
    const colors = gl.arrays[0].uint32
    const matrix = gl.matrix
    .set(Animation.matrix)
    .multiply(context.matrix)
    const x = matrix[6]
    const y = matrix[7]
    const crossColor = 0xff0000ff
    vertices[0] = x + 0.5 - 8
    vertices[1] = y + 0.5
    colors  [2] = crossColor
    vertices[3] = x + 0.5 + 9
    vertices[4] = y + 0.5
    colors  [5] = crossColor
    vertices[6] = x + 0.5
    vertices[7] = y + 0.5 - 8
    colors  [8] = crossColor
    vertices[9] = x + 0.5
    vertices[10] = y + 0.5 + 9
    colors  [11] = crossColor
    matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    )
    gl.alpha = 1
    gl.blend = 'normal'
    const program = gl.graphicProgram.use()
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12)
    gl.drawArrays(gl.LINES, 0, 4)
  }
}

// 绘制精灵控制点
Animation.drawSpriteControlPoints = function () {
  const context = this.targetContext
  const target = this.target
  const texture = Yami.UI.controlPointTexture
  if (!context || !target || !texture) return
  if (this.updateControlPoints(context)) {
    const POINT_RADIUS = 4 / this.scale
    const gl = Yami.GL
    const vertices = gl.arrays[0].float32
    let vi = 0
    const {rectList} = this.controlPoints
    const length = rectList.length
    for (let i = 4; i < length; i++) {
      const {x, y} = rectList[i]
      const dl = x - POINT_RADIUS
      const dt = y - POINT_RADIUS
      const dr = x + POINT_RADIUS
      const db = y + POINT_RADIUS
      vertices[vi    ] = dl
      vertices[vi + 1] = dt
      vertices[vi + 2] = 0
      vertices[vi + 3] = 0
      vertices[vi + 4] = dl
      vertices[vi + 5] = db
      vertices[vi + 6] = 0
      vertices[vi + 7] = 1
      vertices[vi + 8] = dr
      vertices[vi + 9] = db
      vertices[vi + 10] = 1
      vertices[vi + 11] = 1
      vertices[vi + 12] = dr
      vertices[vi + 13] = dt
      vertices[vi + 14] = 1
      vertices[vi + 15] = 0
      vi += 16
    }
    gl.blend = 'normal'
    const program = gl.imageProgram.use()
    const matrix = gl.matrix.project(
      gl.flip,
      gl.width,
      gl.height,
    ).multiply(Animation.matrix)
    gl.bindVertexArray(program.vao)
    gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
    gl.uniform1i(program.u_LightMode, 0)
    gl.uniform1i(program.u_ColorMode, 0)
    gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
    gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
    gl.drawElements(gl.TRIANGLES, vi / 16 * 6, gl.UNSIGNED_INT, 0)
  }
}

// 创建时间轴
Animation.createTimelines = function IIFE() {
  const createTimelines = layers => {
    for (const layer of layers) {
      let {timeline} = layer
      if (timeline === undefined) {
        timeline = document.createElement('box')
        timeline.addClass('timeline-frames')
        timeline.layer = layer
        Object.defineProperty(layer, 'timeline', {
          configurable: true,
          value: timeline,
        })
      }
      Animation.innerTimelineList.appendChild(timeline.clear())
      const frames = layer.frames
      const count = frames.length
      for (let i = 0; i < count; i++) {
        const frame = frames[i]
        const start = frame.start
        const length = frame.end - start
        const easing = frame.easingId !== ''
        let {key} = frame
        if (key === undefined) {
          key = document.createElement('box')
          key.addClass('timeline-key')
          Object.defineProperty(frame, 'key', {
            configurable: true,
            value: key,
          })
        }
        if (key.start !== start) {
          key.start = start
          key.style.left = `${start * 16}px`
        }
        if (key.length !== length) {
          key.length = length
          if (length !== 1) {
            key.addClass('long')
            key.style.width = `${length * 16}px`
          } else {
            key.removeClass('long')
            key.style.width = '16px'
          }
        }
        if (key.easing !== easing) {
          key.easing = easing
          if (easing) {
            key.addClass('easing')
          } else {
            key.removeClass('easing')
          }
        }
        timeline.appendChild(key)
      }
      if (layer.expanded) {
        createTimelines(layer.children)
      }
    }
  }
  return function () {
    this.innerTimelineList.clear()
    createTimelines(this.layers)
  }
}()

// 获取指定位置的关键帧
Animation.getFrame = function (frames, x) {
  const length = frames.length
  for (let i = 0; i < length; i++) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (x >= end) continue
    if (x < start) break
    return frame
  }
  return null
}

// 排序关键帧
Animation.sortFrames = function (frames) {
  let end = 0
  const length = frames.length
  for (let i = 0; i < length; i++) {
    let frame = frames[i]
    const start = frame.start
    if (start < end) {
      frame = this.cloneFrame(frames, i)
      frame.start = end
      frame.end += end - start
    }
    end = frame.end
  }
}

// 移动指定位置后面的帧
Animation.shiftFrames = function (frames, start, offset) {
  const length = frames.length
  for (let i = start; i < length; i++) {
    const frame = this.cloneFrame(frames, i)
    frame.start += offset
    frame.end += offset
  }
}

// 保存关键帧列表
Animation.saveFrames = function (layers, sMarquee, dMarquee = sMarquee) {
  const changes = []
  for (const layer of layers) {
    const frames = layer.frames.slice()
    changes.push({layer, frames})
  }
  this.planToSave()
  this.history.save({
    type: 'animation-frames-change',
    motion: Animation.motion,
    changes: changes,
    sMarquee: sMarquee,
    dMarquee: dMarquee,
  })
}

// 克隆关键帧
Animation.cloneFrame = function (frames, index) {
  const frame = frames[index]
  const clone = frames[index] = Object.clone(frame)
  return Object.defineProperty(clone, 'key', {
    configurable: true,
    value: frame.key,
  })
}

// 插入关键帧
Animation.insertFrame = function () {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  const {layer, x, length} = marquee
  const ex = x + length
  const frames = layer.frames
  const fLength = frames.length
  this.saveFrames([layer], {layer, x, length})
  for (let i = 0; i < fLength; i++) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (x >= end) continue
    if (x > start) {
      // 插入到关键帧中间
      const insert = Object.clone(frame)
      // const next = frames[i + 1]
      // if (next && ex > next.start) {
      //   this.shiftFrames(frames, i + 1, ex - next.start)
      // }
      insert.start = x
      insert.end = Math.max(ex, end)
      this.cloneFrame(frames, i).end = x
      frames.splice(i + 1, 0, insert)
    } else if (x === start) {
      // 插入到关键帧之前
      const proto = frames[i - 1] ?? frame
      const insert = Object.clone(proto)
      // this.shiftFrames(frames, i, length)
      insert.start = x
      insert.end = ex
      frames.splice(i, 0, insert)
    } else {
      // 插入到空白帧
      if (i !== 0) {
        this.cloneFrame(frames, i - 1).end = x
      }
      const insert = Object.clone(frame)
      // if (ex > start) {
      //   this.shiftFrames(frames, i, ex - start)
      // }
      insert.start = x
      insert.end = ex
      frames.splice(i, 0, insert)
    }
    this.sortFrames(frames)
    this.updateTimeline()
    this.openFrame()
    return
  }
  // 追加到尾部
  const last = frames[fLength - 1]
  let insert = last
  if (last) {
    insert = Object.clone(last)
  } else {
    const map = this.inspectorTypeMap
    const key = map[layer.class]
    insert = Yami.Inspector[key].create()
  }
  if (last && last.end !== x) {
    this.cloneFrame(frames, fLength - 1).end = x
  }
  insert.start = x
  insert.end = ex
  frames.push(insert)
  this.updateTimeline()
  this.loadFrames(x)
  this.openFrame()
}

// 延长帧
Animation.extendFrame = function () {
  const marquee = this.timelineMarquee
  if(marquee.y === -1 || !marquee.isExtendable()) {
    return
  }
  const {layer, x, y, length} = marquee
  const ex = x + length
  const frames = layer.frames
  const fLength = frames.length
  this.saveFrames([layer], {layer, x, length})
  for (let i = 0; i < fLength; i++) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (x >= end) continue
    if (x >= start) {
      // 插入到关键帧之前或中间
      this.cloneFrame(frames, i).end += length
      // const next = frames[i + 1]
      // if (next && frame.end > next.start) {
      //   this.shiftFrames(frames, i + 1, frame.end - next.start)
      // }
    } else {
      // 插入到空白帧
      if (i === 0) return
      this.cloneFrame(frames, i - 1).end = ex
      // if (ex > start) {
      //   this.shiftFrames(frames, i, ex - start)
      // }
    }
    this.sortFrames(frames)
    this.updateTimeline()
    this.openFrame()
    return
  }
  // 追加到尾部
  if (fLength !== 0) {
    this.cloneFrame(frames, fLength - 1).end = ex
    this.updateTimeline()
    this.openFrame()
  }
}

// 删除帧
Animation.deleteFrame = function (shrink = false) {
  const marquee = this.timelineMarquee
  if (marquee.y === -1 || !shrink && !marquee.isSelected()) {
    return
  }
  const {layer, x, length} = marquee
  const ex = x + length
  const frames = layer.frames
  let i = frames.length
  this.saveFrames([layer], {layer, x, length})
  if (shrink) block: {
    while (--i >= 0) {
      const frame = frames[i]
      const start = frame.start
      if (ex > start) {
        if (x <= start) {
          // 计算删除关键帧后的偏移值
          const end = frame.end
          const extra = Math.max(end - ex, 0)
          this.shiftFrames(frames, ++i, -length - extra)
        } else {
          // 直接偏移
          this.shiftFrames(frames, ++i, -length)
        }
        break block
      }
    }
    this.shiftFrames(frames, 0, -length)
  }
  while (--i >= 0) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (ex <= start) continue
    if (x >= end) break
    if (x <= start) {
      // 选中关键帧头部则删除整个关键帧
      frames.splice(i, 1)
    } else {
      // 裁剪关键帧
      this.cloneFrame(frames, i).end = x + Math.max(end - ex, 0)
    }
  }
  this.updateTimeline()
  this.openFrame()
}

// 复制帧
Animation.copyFrame = function (returnData = false) {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  let {layer, x, length} = marquee
  const copies = []
  const ex = x + length
  const frames = layer.frames
  const fLength = frames.length
  for (let i = 0; i < fLength; i++) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (x >= end) continue
    if (ex <= start) break
    copies.push(Object.clone(frame))
  }
  if (copies.length !== 0) {
    // 重置关键帧位置
    for (const frame of copies) {
      frame.start -= x
      frame.end -= x
    }
    // 选中关键帧头部则必要时扩展选框长度
    // 否则裁剪尾部关键帧
    const last = copies[copies.length - 1]
    if (last.start >= 0) {
      length = Math.max(last.end, length)
    } else {
      last.end = Math.min(last.end, length)
    }
    // 裁剪头部关键帧
    const first = copies[0]
    if (first.start < 0) {
      first.start = 0
    }
    const data = {copies, length}
    if (returnData) {
      return data
    }
    Clipboard.write(`yami.animFrame.${layer.class}`, data)
  }
}

// 粘贴帧
Animation.pasteFrame = function (data, destination) {
  const {layer, x, y, length: sLength} =
  destination ?? this.timelineMarquee
  if (!data) data = Clipboard.read(`yami.animFrame.${layer.class}`)
  if (!data || y === -1) {
    return
  }
  const {copies, length: dLength} = data
  this.selectMarquee(x, y, dLength, x)
  this.saveFrames([layer],
    {layer, x, length: sLength},
    {layer, x, length: dLength},
  )
  for (const frame of copies) {
    frame.start += x
    frame.end += x
  }
  // const ex = x + dLength
  const frames = layer.frames
  const fLength = frames.length
  for (let i = 0; i < fLength; i++) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (x >= end) continue
    if (x > start) {
      // 插入到关键帧中间
      // const next = frames[i + 1]
      // if (next && ex > next.start) {
      //   this.shiftFrames(frames, i + 1, ex - next.start)
      // }
      if (x < end) {
        this.cloneFrame(frames, i).end = x
      }
      frames.splice(i + 1, 0, ...copies)
    } else if (x === start) {
      // 插入到关键帧之前
      // this.shiftFrames(frames, i, dLength)
      frames.splice(i, 0, ...copies)
    } else {
      // 插入到空白帧
      // if (ex > start) {
      //   this.shiftFrames(frames, i, ex - start)
      // }
      frames.splice(i, 0, ...copies)
    }
    this.sortFrames(frames)
    this.updateTimeline()
    this.openFrame()
    return
  }
  // 追加到尾部
  frames.push(...copies)
  this.updateTimeline()
  this.loadFrames(x)
  this.openFrame()
}

// 选择所有帧
Animation.selectAllFrames = function () {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  const {layer, y} = marquee
  const {frames} = layer
  const {length} = frames
  if (length !== 0) {
    const start = frames[0].start
    const end = frames[length - 1].end
    this.selectMarquee(start, y, end - start, start)
  }
}

// 拖放帧
Animation.dragAndDropFrame = function () {
  const {layer: sLayer, x: sx, y: sy, length} = this.timelineMarquee
  const {layer: dLayer, x: dx, y: dy} = this.timelineMarqueeShift
  if (sx !== dx || sy !== dy && sLayer.class === dLayer.class) {
    const data = this.copyFrame(true)
    if (data) {
      const {updateTimeline, openFrame, saveFrames} = this
      const sMarquee = {layer: sLayer, x: sx, length: length}
      const dMarquee = {layer: dLayer, x: dx, length: 0}
      const layers = [sLayer]
      layers.append(dLayer)
      this.saveFrames(layers, sMarquee, dMarquee)
      this.updateTimeline = Function.empty
      this.openFrame = Function.empty
      this.saveFrames = Function.empty
      this.deleteFrame()
      this.pasteFrame(data, this.timelineMarqueeShift)
      this.updateTimeline = updateTimeline
      this.openFrame = openFrame
      this.saveFrames = saveFrames
      this.player.index = dx
      this.updateTimeline()
      this.openFrame()
      dMarquee.length = this.timelineMarquee.length
    }
  }
}

// 调整选框
Animation.adjustMarquee = function () {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  let {layer, x, y, length} = marquee
  let changed = false
  const ex = x + length
  const frames = layer.frames
  const fLength = frames.length
  // 调整选框头部
  for (let i = 0; i < fLength; i++) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (x >= end) continue
    if (ex <= start) break
    if (x !== start) {
      length += x - start
      x = start
      changed = true
    }
    break
  }
  // 调整选框尾部
  for (let i = fLength - 1; i >= 0; i--) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (ex <= start) continue
    if (x >= end) break
    if (ex > end) {
      length -= ex - end
      changed = true
    }
    break
  }
  // 重新选择选框
  if (changed) {
    this.selectMarquee(x, y, length, x)
  }
}

// 移动选中的帧
Animation.shiftSelectedFrames = function (mode) {
  const marquee = this.timelineMarquee
  if (marquee.y === -1) {
    return
  }
  this.adjustMarquee()
  const {layer: sLayer, x: sx, y: sy, length} = marquee
  const timelines = this.innerTimelineList.childNodes
  const ex = this.frameMax
  const ey = timelines.length
  let dx = sx
  let dy = sy
  switch (mode) {
    case 'left': {
      const frames = sLayer.frames
      const frame = this.getFrame(frames, dx - 1)
      dx = frame ? frame.start : dx - 1
      break
    }
    case 'up':
      while (--dy >= 0) {
        const dLayer = timelines[dy].layer
        if (dLayer.class === sLayer.class) {
          break
        }
      }
      break
    case 'right':
      dx++
      break
    case 'down':
      while (++dy < ey) {
        const dLayer = timelines[dy].layer
        if (dLayer.class === sLayer.class) {
          break
        }
      }
      break
  }
  if (dx >= 0 && dx < ex && dy >= 0 && dy < ey) {
    const data = this.copyFrame(true)
    if (data) {
      const {updateTimeline, openFrame, saveFrames} = this
      const dLayer = timelines[dy].layer
      const destination = {layer: dLayer, x: dx, y: dy}
      const sMarquee = {layer: sLayer, x: sx, length: length}
      const dMarquee = {layer: dLayer, x: dx, length: 0}
      const layers = [sLayer]
      layers.append(dLayer)
      this.saveFrames(layers, sMarquee, dMarquee)
      this.updateTimeline = Function.empty
      this.openFrame = Function.empty
      this.saveFrames = Function.empty
      this.deleteFrame()
      this.pasteFrame(data, destination)
      this.updateTimeline = updateTimeline
      this.openFrame = openFrame
      this.saveFrames = saveFrames
      this.player.index = dx
      this.updateTimeline()
      this.openFrame()
      this.scrollToMarquee(false)
      dMarquee.length = this.timelineMarquee.length
    }
  }
}

// 选择控制点
Animation.selectControlPoint = function (x, y) {
  const target = this.target
  const context = this.targetContext
  if (target !== null && context !== null) {
    const points = this.controlPoints
    switch (context.layer.class) {
      case 'joint': {
        const radius = 10 / Math.max(this.scale, 1)
        if (target === this.selectObject(x, y)) {
          const ox = context.matrix[6]
          const oy = context.matrix[7]
          if (Math.dist(ox, oy, x, y) > radius) {
            return points.jointRotate
          }
        }
        break
      }
      case 'particle': {
        const emitter = context.emitter
        if (!emitter?.hasArea) return null
        // 符合条件则执行下面的内容
      }
      case 'sprite':
        if (this.controlPointVisible) {
          const radius = 6 / this.scale
          const {rectList} = points
          for (let i = rectList.length - 1; i >= 0; i--) {
            const point = rectList[i]
            const sx = point.x - radius
            const ex = point.x + radius
            const sy = point.y - radius
            const ey = point.y + radius
            if (x >= sx && x < ex && y >= sy && y < ey) {
              return point
            }
          }
        }
        break
    }
  }
  return null
}

// 选择对象
Animation.selectObject = function (x, y) {
  const {contexts} = this.player
  const last = contexts.count - 1
  let target = null
  let weight = 0

  // 选择关节对象 - 节点
  if (this.showMark && target === null) {
    const active = this.targetContext
    const scale = Math.max(this.scale, 1)
    const jointRadius = 16 / scale
    for (let i = last; i >= 0; i--) {
      const context = contexts[i]
      const frame = context.frame
      const layer = context.layer
      if (frame !== null &&
        layer.class === 'joint' &&
        !layer.hidden &&
        !layer.locked) {
        const ox = context.matrix[6]
        const oy = context.matrix[7]
        const dist = Math.dist(ox, oy, x, y)
        if (dist <= jointRadius) {
          // 选中时提高优先级来激活控制点
          const w = active === context
          ? Infinity
          : jointRadius - dist
          if (target === null || weight < w) {
            target = frame
            weight = w
          }
        }
      }
    }
  }

  // 选择粒子发射器对象 - 锚点
  if (this.showMark && target === null) {
    const scale = Math.max(this.scale, 1)
    const anchorRadius = 32 / scale
    for (let i = last; i >= 0; i--) {
      const context = contexts[i]
      const frame = context.frame
      const layer = context.layer
      if (frame !== null &&
        layer.class === 'particle' &&
        !layer.hidden &&
        !layer.locked) {
        const ox = context.matrix[6]
        const oy = context.matrix[7]
        const dist = Math.dist(ox, oy, x, y)
        if (dist <= anchorRadius) {
          const w = anchorRadius - dist
          if (target === null || weight < w) {
            target = frame
            weight = w
          }
        }
      }
    }
  }

  // 选择关节对象 - 手臂
  if (this.showMark && target === null) {
    const active = this.targetContext
    const scale = Math.max(this.scale, 1)
    const armWidth = 12 / scale
    for (let i = last; i >= 0; i--) {
      const context = contexts[i]
      const frame = context.frame
      if (frame !== null) {
        let {parent} = context
        while (parent !== null) {
          if (parent.frame !== null) {
            if (parent.layer.hidden ||
              parent.layer.locked) {
              parent = null
            }
            break
          }
          parent = parent.parent
        }
        if (parent === null) continue
        const sx = parent.matrix[6]
        const sy = parent.matrix[7]
        const dx = context.matrix[6]
        const dy = context.matrix[7]
        const dist = Math.dist(sx, sy, dx, dy)
        if (dist > 4) {
          const angle = Math.atan2(dy - sy, dx - sx)
          const cos = Math.cos(-angle)
          const sin = Math.sin(-angle)
          const rx = x - sx
          const ry = y - sy
          const px = rx * cos - ry * sin
          const py = rx * sin + ry * cos
          const offset = Math.abs(py)
          const tolerance = armWidth / 2
          if (px >= 0 && px < dist && offset <= tolerance) {
            const w = active === parent
            ? Infinity
            : (tolerance - offset) * (1 - px / dist) + i
            if (target === null || weight < w) {
              target = parent.frame
              weight = w
            }
          }
        }
      }
    }
  }

  // 选择图像对象
  if (target === null) {
    for (let i = last; i >= 0; i--) {
      const context = contexts[i]
      const frame = context.frame
      const layer = context.layer
      if (frame !== null &&
        !layer.hidden &&
        !layer.locked &&
        this.isPointInFrame(context, x, y)) {
        target = frame
        break
      }
    }
  }

  return target
}

// 判断点是否在关键帧区域内
Animation.isPointInFrame = function (context, x, y) {
  const key = context.layer.sprite
  const texture = this.player.textures[key]
  if (!texture) return false
  const matrix = Yami.GL.matrix
  .set(context.matrix)
  const L = texture.offsetX
  const T = texture.offsetY
  const R = L + texture.width
  const B = T + texture.height
  const a = matrix[0]
  const b = matrix[1]
  const c = matrix[3]
  const d = matrix[4]
  const e = matrix[6]
  const f = matrix[7]
  const x1 = a * L + c * T + e - x
  const y1 = b * L + d * T + f - y
  const x2 = a * L + c * B + e - x
  const y2 = b * L + d * B + f - y
  const x3 = a * R + c * B + e - x
  const y3 = b * R + d * B + f - y
  const x4 = a * R + c * T + e - x
  const y4 = b * R + d * T + f - y
  const cross1 = x1 * y2 - y1 * x2
  const cross2 = x2 * y3 - y2 * x3
  const cross3 = x3 * y4 - y3 * x4
  const cross4 = x4 * y1 - y4 * x1
  return (
    cross1 * cross2 >= 0 &&
    cross2 * cross3 >= 0 &&
    cross3 * cross4 >= 0 &&
    cross4 * cross1 >= 0
  )
}

// 获取动画范围
Animation.getAnimationRange = function IIFE() {
  const marquee = Animation.timelineMarquee
  const range = {start: 0, end: 0}
  return function () {
    const end = this.player.length
    if (marquee.y !== -1) {
      const {x, length} = marquee
      range.start = x < end - 1 ? x : 0
      range.end = length === 1 ? end
      : Math.min(x + length, end)
    } else {
      range.start = 0
      range.end = end
    }
    return range
  }
}()

// 请求刷新列表
Animation.requestRefreshingList = function () {
  if (this.state === 'open') {
    const list = this.list
    if (!list.refreshing) {
      list.refreshing = true
      Promise.resolve().then(() => {
        list.refreshing = false
        list.refresh()
      })
    }
  }
}

// 请求更新动画
Animation.requestAnimation = function () {
  if (this.state === 'open') {
    Yami.Timer.appendUpdater('stageAnimation', this.updateAnimation)
  }
}

// 更新动画帧
Animation.updateAnimation = function (deltaTime) {
  deltaTime *= Animation.speed
  // 更新动画帧
  if (Animation.playing) {
    const {start, end} = Animation.getAnimationRange()
    const offset = deltaTime / Animation.Player.step
    let index = Math.max(Animation.animIndex + offset, start)
    if (index >= end) {
      if (Animation.loop) {
        do {index += start - end}
        while (index >= end)
      } else {
        Animation.animIndex = index
        Animation.stop()
        return
      }
    }
    Animation.animIndex = index
    Animation.loadFrames(index)
    Animation.emitParticles(deltaTime)
  }
  // 更新粒子
  Animation.updateParticles(deltaTime)
  // 不能保证加载帧的时候一定会请求渲染(尾帧截止)
  // 所以在播放状态时再次请求渲染
  if (Animation.playing ||
    Animation.particleUpdating) {
    Animation.requestRendering()
  } else {
    Animation.stopAnimation()
  }
}

// 停止更新动画
Animation.stopAnimation = function () {
  Yami.Timer.removeUpdater('stageAnimation', this.updateAnimation)
}

// 请求渲染
Animation.requestRendering = function () {
  if (this.state === 'open') {
    Yami.Timer.appendUpdater('stageRendering', this.renderingFunction)
  }
}

// 渲染函数
Animation.renderingFunction = function () {
  if (Yami.GL.width * Yami.GL.height !== 0) {
    Animation.drawBackground()
    if (Animation.layers !== null) {
      Animation.drawOnionskins()
      Animation.drawSpriteLayers()
      Animation.drawParticles()
      Animation.drawCoordinateAxes()
      Animation.drawEmitters()
      Animation.drawJointNodes()
      Animation.drawJointArrows()
      Animation.drawJointSpinner()
      Animation.drawHoverWireframe()
      Animation.drawTargetWireframe()
      Animation.drawTargetAnchor()
      Animation.drawSpriteControlPoints()
    }
  }
}

// 停止渲染
Animation.stopRendering = function () {
  Yami.Timer.removeUpdater('stageRendering', this.renderingFunction)
}

// 开关标记
Animation.switchMark = function IIFE() {
  const item = $('#animation-switch-mark')
  return function (enabled = !this.showMark) {
    if (enabled) {
      item.addClass('selected')
    } else {
      item.removeClass('selected')
    }
    this.showMark = enabled
    this.requestRendering()
  }
}()

// 开关描图纸
Animation.switchOnionskin = function IIFE() {
  const item = $('#animation-switch-onionskin')
  return function (enabled = !this.showOnionskin) {
    this.showOnionskin = enabled
    this.requestRendering()
    if (enabled) {
      item.addClass('selected')
      // 加载描图纸上下文并计算参数
      if (this.state === 'open') {
        const player = this.player
        const {prev, next} = player.onionskin
        player.loadContexts(prev)
        player.loadContexts(next)
        this.updateFrameContexts()
      }
    } else {
      item.removeClass('selected')
    }
  }
}()

// 开关镜像
Animation.switchMirror = function IIFE() {
  const item = $('#animation-switch-mirror')
  return function (enabled = !this.mirror) {
    if (enabled) {
      item.addClass('selected')
    } else {
      item.removeClass('selected')
    }
    this.mirror = enabled
    this.requestRendering()
    if (this.state === 'open') {
      this.updateMatrix()
    }
  }
}()

// 开关设置
Animation.switchSettings = function () {
  if (!Yami.Inspector.fileAnimation.button.hasClass('selected')) {
    Yami.Inspector.open('fileAnimation', Animation)
  } else {
    Yami.Inspector.close()
  }
}

// 开关循环
Animation.switchLoop = function IIFE() {
  const item = $('#animation-timeline-loop')
  return function (enabled = !this.loop) {
    if (enabled) {
      item.addClass('selected')
    } else {
      item.removeClass('selected')
    }
    this.loop = enabled
    // 在开启残影的情况下应该刷新
    if (this.showOnionskin &&
      this.state === 'open') {
      this.updateFrameContexts()
      this.requestRendering()
    }
  }
}()

// 计划保存
Animation.planToSave = function () {
  Yami.File.planToSave(this.meta)
}

// 保存状态到配置文件
Animation.saveToConfig = function (config) {
  config.colors.animationBackground = this.background.hex
}

// 从配置文件中加载状态
Animation.loadFromConfig = function (config) {
  this.background = new Yami.StageColor(
    config.colors.animationBackground,
    () => this.requestRendering(),
  )
}

// 保存状态到项目文件
Animation.saveToProject = function (project) {
  const {animation} = project
  animation.mark = this.showMark ?? animation.mark
  animation.onionskin = this.showOnionskin ?? animation.onionskin
  animation.mirror = this.mirror ?? animation.mirror
  animation.loop = this.loop ?? animation.loop
  animation.speed = this.speed ?? animation.speed
  animation.zoom = this.zoom ?? animation.zoom
}

// 从项目文件中加载状态
Animation.loadFromProject = function (project) {
  const {animation} = project
  this.switchMark(animation.mark)
  this.switchOnionskin(animation.onionskin)
  this.switchMirror(animation.mirror)
  this.switchLoop(animation.loop)
  this.setSpeed(animation.speed)
  this.setZoom(animation.zoom)
}

// WebGL - 上下文恢复事件
Animation.webglRestored = function (event) {
  if (Animation.state === 'open') {
    Animation.requestRendering()
  }
}

// 窗口 - 调整大小事件
Animation.windowResize = function (event) {
  this.updateHead()
  if (this.state === 'open') {
    this.resize()
    this.updateCamera()
    this.requestRendering()
  }
}.bind(Animation)

// 主题改变事件
Animation.themechange = function (event) {
  this.requestRendering()
}.bind(Animation)

// 数据改变事件
Animation.datachange = function (event) {
  switch (event.key) {
    case 'config':
      this.Player.updateStep()
      break
  }
}.bind(Animation)

// 枚举改变事件
Animation.enumchange = function (event) {
  this.requestRefreshingList()
}.bind(Animation)

// 键盘按下事件
Animation.keydown = function (event) {
  if (Animation.state === 'open' &&
    Animation.dragging === null) {
    if (event.altKey) {
      switch (event.code) {
        case 'KeyS':
          Animation.switchSettings()
          break
      }
    }
    if (!Animation.motion) return
    if (event.cmdOrCtrlKey) {
      return
    } else if (event.altKey) {
      return
    } else {
      switch (event.code) {
        case 'KeyQ':
          Animation.previousFrame()
          break
        case 'KeyE':
          Animation.nextFrame()
          break
        case 'KeyZ':
          Animation.previousKeyFrame()
          break
        case 'KeyX':
          Animation.nextKeyFrame()
          break
        case 'KeyC':
          Animation.switchMirror()
          break
        case 'Space':
          Animation.play()
          break
      }
    }
  }
}

// 头部 - 指针按下事件
Animation.headPointerdown = function (event) {
  if (!(event.target instanceof HTMLInputElement)) {
    event.preventDefault()
    if (document.activeElement !== Animation.screen) {
      Animation.screen.focus()
    }
  }
}

// 开关 - 指针按下事件
Animation.switchPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'ITEM') {
        switch (element.getAttribute('value')) {
          case 'mark':
            return Animation.switchMark()
          case 'onionskin':
            return Animation.switchOnionskin()
          case 'mirror':
            return Animation.switchMirror()
          case 'settings':
            return Animation.switchSettings()
        }
      }
      break
    }
  }
}

// 速度 - 输入事件
Animation.speedInput = function (event) {
  Animation.speed = this.read()
}

// 缩放 - 获得焦点事件
Animation.zoomFocus = function (event) {
  Animation.screen.focus()
}

// 缩放 - 输入事件
Animation.zoomInput = function (event) {
  Animation.setZoom(this.read())
}

// 屏幕 - 键盘按下事件
Animation.screenKeydown = function (event) {
  if (this.state === 'open' &&
    this.motion !== null &&
    this.dragging === null) {
    if (event.cmdOrCtrlKey) {
      switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
          break
        default:
          return
      }
    }
    if (event.altKey) {
      return
    }
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        this.revealTarget()
        break
      case 'Escape':
        this.unselectMarquee()
        break
      case 'KeyA':
        if ((this.translationKey & 0b0001) === 0) {
          this.translationKey |= 0b0001
          this.translationTimer.add()
          window.on('keyup', this.translationKeyup)
        }
        break
      case 'KeyW':
        if ((this.translationKey & 0b0010) === 0) {
          this.translationKey |= 0b0010
          this.translationTimer.add()
          window.on('keyup', this.translationKeyup)
        }
        break
      case 'KeyD':
        if ((this.translationKey & 0b0100) === 0) {
          this.translationKey |= 0b0100
          this.translationTimer.add()
          window.on('keyup', this.translationKeyup)
        }
        break
      case 'KeyS':
        if ((this.translationKey & 0b1000) === 0) {
          this.translationKey |= 0b1000
          this.translationTimer.add()
          window.on('keyup', this.translationKeyup)
        }
        break
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
        if (this.target !== null) {
          event.preventDefault()
          const target = this.target
          let offsetX = 0
          let offsetY = 0
          switch (event.code) {
            case 'ArrowLeft':  offsetX = -1; break
            case 'ArrowUp':    offsetY = -1; break
            case 'ArrowRight': offsetX = +1; break
            case 'ArrowDown':  offsetY = +1; break
          }
          if (event.shiftKey) {
            offsetX *= 10
            offsetY *= 10
          }
          const x = Math.roundTo(target.x + offsetX, 4)
          const y = Math.roundTo(target.y + offsetY, 4)
          this.shiftTarget(x, y)
        }
        break
      case 'Minus':
      case 'NumpadSubtract':
        this.setZoom(this.zoom - 1)
        break
      case 'Equal':
      case 'NumpadAdd':
        this.setZoom(this.zoom + 1)
        break
      case 'Digit0':
      case 'Numpad0':
        this.setZoom(2)
        break
    }
  }
}.bind(Animation)

// 位移键弹起事件
Animation.translationKeyup = function (event) {
  if (this.translationKey === 0b0000) {
    return
  }
  if (event === undefined) {
    this.translationKey = 0b0000
  } else {
    switch (event.code) {
      case 'KeyA':
        this.translationKey &= 0b1110
        break
      case 'KeyW':
        this.translationKey &= 0b1101
        break
      case 'KeyD':
        this.translationKey &= 0b1011
        break
      case 'KeyS':
        this.translationKey &= 0b0111
        break
    }
  }
  if (this.translationKey === 0b0000) {
    this.translationTimer.remove()
    window.off('keyup', this.translationKeyup)
  }
}.bind(Animation)

// 屏幕 - 鼠标滚轮事件
Animation.screenWheel = function (event) {
  if (this.state === 'open' &&
    this.dragging === null) {
    event.preventDefault()
    if (event.deltaY !== 0) {
      const step = event.deltaY > 0 ? -1 : 1
      this.setZoom(this.zoom + step)
    }
  }
}.bind(Animation)

// 屏幕 - 用户滚动事件
Animation.screenUserscroll = function (event) {
  if (this.state === 'open') {
    this.screen.rawScrollLeft = this.screen.scrollLeft
    this.screen.rawScrollTop = this.screen.scrollTop
    this.updateTransform()
    this.requestRendering()
  }
}.bind(Animation)

// 屏幕 - 失去焦点事件
Animation.screenBlur = function (event) {
  this.translationKeyup()
  this.pointerup()
  // this.marqueePointerleave()
}.bind(Animation)

// 选框 - 指针按下事件
Animation.marqueePointerdown = function (event) {
  if (this.dragging || !this.motion) {
    return
  }
  switch (event.button) {
    case 0: {
      if (event.altKey) {
        this.dragging = event
        event.mode = 'scroll'
        event.scrollLeft = this.screen.scrollLeft
        event.scrollTop = this.screen.scrollTop
        Yami.Cursor.open('cursor-grab')
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        return
      }
      if (this.controlPointActive && this.target) {
        const context = this.targetContext
        const target = this.target
        const points = this.controlPoints
        this.dragging = event
        switch (this.controlPointActive) {
          case points.jointRotate:
          case points.rectRotate.TL:
          case points.rectRotate.TR:
          case points.rectRotate.BL:
          case points.rectRotate.BR: {
            const rotation = target.rotation
            const matrix = Yami.GL.matrix
            .set(Animation.matrix)
            .multiply(context.matrix)
            const aax = matrix[6]
            const aay = matrix[7]
            const {x, y} = event.getRelativeCoords(Yami.GL.canvas)
            event.mode = 'object-rotate'
            event.absoluteAnchorX = aax
            event.absoluteAnchorY = aay
            event.lastAngle = Math.atan2(y - aay, x - aax)
            event.rotationRadians = 0
            event.startRotation = rotation
            break
          }
          case points.rectResize.T:
          case points.rectResize.L:
          case points.rectResize.R:
          case points.rectResize.B:
          case points.rectResize.TL:
          case points.rectResize.TR:
          case points.rectResize.BL:
          case points.rectResize.BR: {
            const layer = context.layer
            event.mode = 'object-resize'
            event.startScaleX = target.scaleX
            event.startScaleY = target.scaleY
            switch (context.layer.class) {
              case 'sprite': {
                const key = layer.sprite
                const texture = this.player.textures[key]
                event.startWidth = texture.width
                event.startHeight = texture.height
                break
              }
              case 'particle': {
                const emitter = context.emitter
                if (emitter.hasArea) {
                  event.startWidth = emitter.outerWidth
                  event.startHeight = emitter.outerHeight
                }
                break
              }
            }
            break
          }
        }
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
        return
      }
      const {x, y} = this.getPointerCoords(event)
      const object = this.selectObject(x, y)
      if (object) {
        this.dragging = event
        event.mode = 'object-move'
        event.enabled = false
        event.startX = object.x
        event.startY = object.y
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      this.selectFrame(object)
      break
    }
    case 2:
      this.dragging = event
      event.mode = 'ready-to-scroll'
      event.scrollLeft = this.screen.scrollLeft
      event.scrollTop = this.screen.scrollTop
      window.on('pointerup', this.pointerup)
      window.on('pointermove', this.pointermove)
      break
  }
}.bind(Animation)

// 选框 - 指针移动事件
Animation.marqueePointermove = function (event) {
  if (!this.dragging && this.motion) {
    this.marquee.pointerevent = event
    const {x, y} = this.getPointerCoords(event)
    if (this.target) {
      const point = this.selectControlPoint(x, y)
      if (point) {
        this.setHover(null)
        this.setControlPoint(point)
        return
      }
    }
    if (this.controlPointActive) {
      this.setControlPoint(null)
    }
    const object = this.selectObject(x, y)
    this.setHover(object)
  }
}.bind(Animation)

// 选框 - 指针离开事件
Animation.marqueePointerleave = function (event) {
  if (this.marquee.pointerevent) {
    this.marquee.pointerevent = null
    this.setHover(null)
  }
}.bind(Animation)

// 选框 - 鼠标双击事件
Animation.marqueeDoubleclick = function (event) {
  if (this.target) {
    this.screenBlur()
    this.revealTarget()
  }
}.bind(Animation)

// 指针弹起事件
Animation.pointerup = function (event) {
  const {dragging} = Animation
  if (dragging === null) {
    return
  }
  if (event === undefined) {
    event = dragging
  }
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'object-rotate':
      case 'object-resize':
      case 'object-move':
        break
      case 'ready-to-scroll':
        break
      case 'scroll':
        Yami.Cursor.close('cursor-grab')
        break
    }
    Animation.dragging = null
    window.off('pointerup', Animation.pointerup)
    window.off('pointermove', Animation.pointermove)
  }
}

// 指针移动事件
Animation.pointermove = function (event) {
  const {dragging} = Animation
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'object-rotate':
        if (Animation.target) {
          const {x, y} = event.getRelativeCoords(Yami.GL.canvas)
          const distX = x - dragging.absoluteAnchorX
          const distY = y - dragging.absoluteAnchorY
          const currentAngle = Math.atan2(distY, distX)
          const angle = Math.modRadians(currentAngle - dragging.lastAngle)
          const increment = angle < Math.PI ? angle : angle - Math.PI * 2
          dragging.rotationRadians += Animation.mirror ? -increment : increment
          let rotation = Math.round(dragging.startRotation + Math.degrees(dragging.rotationRadians))
          if (event.shiftKey) {
            rotation = Math.round(rotation / 15) * 15
          }
          if (Animation.target.rotation !== rotation) {
            Animation.rotateTarget(rotation)
          }
          dragging.lastAngle = currentAngle
        }
        break
      case 'object-resize':
        if (Animation.target) {
          const points = Animation.controlPoints
          const point = Animation.controlPointActive
          const angle = Math.radians(point.angle + Animation.controlPointRotation)
          const distX = (event.clientX - dragging.clientX) / Animation.scaleX
          const distY = (event.clientY - dragging.clientY) / Animation.scaleY
          const dist = Math.sqrt(distX ** 2 + distY ** 2)
          const distAngle = Math.atan2(distY, Animation.mirror ? -distX : distX)
          let width = undefined
          let height = undefined
          switch (point) {
            case points.rectResize.T:
            case points.rectResize.L:
            case points.rectResize.R:
            case points.rectResize.B: {
              const offset = dist * Math.cos(distAngle - angle)
              switch (point) {
                case points.rectResize.T:
                case points.rectResize.B:
                  height = offset
                  break
                case points.rectResize.L:
                case points.rectResize.R: {
                  width = offset
                  break
                }
              }
              break
            }
            case points.rectResize.TL:
            case points.rectResize.TR:
            case points.rectResize.BL:
            case points.rectResize.BR:
              if (event.shiftKey) {
                const rectWidth = dragging.startWidth * dragging.startScaleX
                const rectHeight = dragging.startHeight * dragging.startScaleY
                const aspectAngle = Math.atan2(rectHeight, rectWidth)
                let startAngle
                switch (point) {
                  case points.rectResize.TL:
                  case points.rectResize.BR:
                    startAngle = angle - Math.PI / 4 + aspectAngle
                    break
                  case points.rectResize.TR:
                  case points.rectResize.BL:
                    startAngle = angle + Math.PI / 4 - aspectAngle
                    break
                }
                const includedAngle = distAngle - startAngle
                const offset = dist * Math.cos(includedAngle)
                const offsetX = offset * Math.cos(aspectAngle)
                const offsetY = offset * Math.sin(aspectAngle)
                width = offsetX
                height = offsetY
              } else {
                const startAngle = angle - Math.PI / 4
                const includedAngle = distAngle - startAngle
                const offsetX = dist * Math.cos(includedAngle)
                const offsetY = dist * Math.sin(includedAngle)
                switch (point) {
                  case points.rectResize.TL:
                  case points.rectResize.BR:
                    width = offsetX
                    height = offsetY
                    break
                  case points.rectResize.TR:
                  case points.rectResize.BL:
                    width = offsetY
                    height = offsetX
                    break
                }
              }
              break
          }
          let scaleX = undefined
          let scaleY = undefined
          if (width !== undefined) {
            scaleX = width / dragging.startWidth
            scaleX = Math.roundTo(dragging.startScaleX + scaleX, 2)
          }
          if (height !== undefined) {
            scaleY = height / dragging.startHeight
            scaleY = Math.roundTo(dragging.startScaleY + scaleY, 2)
          }
          if (scaleX !== undefined && Animation.target.scaleX !== scaleX ||
            scaleY !== undefined && Animation.target.scaleY !== scaleY) {
            Animation.resizeTarget(scaleX, scaleY)
          }
        }
        break
      case 'object-move':
        if (!dragging.enabled) {
          const distX = event.clientX - dragging.clientX
          const distY = event.clientY - dragging.clientY
          if (Math.sqrt(distX ** 2 + distY ** 2) > 4 ||
            event.timeStamp - dragging.timeStamp >= 500) {
            dragging.enabled = true
          } else {
            break
          }
        }
        if (Animation.target) {
          const target = Animation.target
          const mirrorX = Animation.mirror ? -1 : 1
          const distX = (event.clientX - dragging.clientX) / Animation.scaleX * mirrorX
          const distY = (event.clientY - dragging.clientY) / Animation.scaleY
          let x
          let y
          if (event.shiftKey) {
            const angle = Math.atan2(distY, distX)
            const directions = 4
            const proportion = Math.modRadians(angle) / (Math.PI * 2)
            const section = (proportion * directions + 0.5) % directions
            switch (Math.floor(section)) {
              case 0: case 2:
                x = Math.round(dragging.startX + distX)
                y = dragging.startY
                break
              case 1: case 3:
                x = dragging.startX
                y = Math.round(dragging.startY + distY)
                break
            }
          } else {
            x = Math.round(dragging.startX + distX)
            y = Math.round(dragging.startY + distY)
          }
          if (target.x !== x || target.y !== y) {
            Animation.shiftTarget(x, y)
          }
        }
        break
      case 'ready-to-scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        Animation.screen.setScroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
          dragging.mode = 'scroll'
          Yami.Cursor.open('cursor-grab')
        }
        break
      }
      case 'scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        Animation.screen.setScroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        break
      }
    }
  }
}

// 搜索框 - 输入事件
Animation.searcherInput = function (event) {
  if (event.inputType !== 'insertCompositionText') {
    const text = this.input.value
    Animation.list.searchNodes(text)
  }
}

// 列表 - 键盘按下事件
Animation.listKeydown = function (event) {
  if (!this.data) {
    return
  }

  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyX':
        if (item) {
          this.copy(item)
          this.delete(item)
        }
        break
      case 'KeyC':
        this.copy(item)
        break
      case 'KeyV':
        this.paste(null)
        break
    }
  } else {
    switch (event.code) {
      case 'Delete':
        this.delete(item)
        break
      case 'Backspace':
        this.cancelSearch()
        break
      // case 'Escape':
      //   Animation.setMotion(null)
      //   break
    }
  }
}

// 列表 - 指针按下事件
Animation.listPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'NODE-ITEM' &&
        element.hasClass('selected')) {
        Yami.Inspector.open('animMotion', element.item)
      }
      break
    }
    case 3:
      this.cancelSearch()
      break
  }
}

// 列表 - 选择事件
Animation.listSelect = function (event) {
  Animation.setMotion(event.value)
}

// 列表 - 记录事件
Animation.listRecord = function (event) {
  const response = event.value
  const {type} = response
  switch (type) {
    case 'create':
    case 'delete':
    case 'remove':
      Animation.history.save({
        type: `animation-object-${type}`,
        response: response,
      })
      break
  }
}

// 列表 - 更新事件
Animation.listUpdate = function (event) {
  this.updateDirections()
}

// 列表 - 打开事件
Animation.listOpen = function (event) {
  Animation.editMotion(event.value)
}

// 列表 - 菜单弹出事件
Animation.listPopup = function (event) {
  const item = event.value
  const get = Yami.Local.createGetter('menuAnimationList')
  let copyable
  let pastable
  let deletable
  if (item) {
    copyable = true
    pastable = Clipboard.has('yami.animation.object')
    deletable = true
  } else {
    copyable = false
    pastable = Clipboard.has('yami.animation.object')
    deletable = false
  }
  let headItems = Array.empty
  if (item) {
    headItems = [{
      label: get('edit'),
      accelerator: 'Enter',
      click: () => {
        Animation.editMotion(item)
      },
    }]
  }
  Yami.Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [...headItems, {
    label: get('insert'),
    click: () => {
      Animation.getNewMotionId(motionId => {
        this.addNodeTo(Yami.Inspector.animMotion.create(motionId), item)
      })
    },
  }, {
    type: 'separator',
  }, {
    label: get('cut'),
    accelerator: Yami.ctrl('X'),
    enabled: copyable,
    click: () => {
      this.copy(item)
      this.delete(item)
    },
  }, {
    label: get('copy'),
    accelerator: Yami.ctrl('C'),
    enabled: copyable,
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

// 列表 - 改变事件
Animation.listChange = function (event) {
  Animation.planToSave()
}

// 列表页面 - 调整大小事件
Animation.listPageResize = function (event) {
  Animation.list.updateHead()
  Animation.list.resize()
}

// 时间轴页面 - 调整大小事件
Animation.timelinePageResize = function (event) {
  Animation.updatePointerArea()
  Animation.timeline.updateHead()
  Animation.layerList.resize()
}

// 时间轴工具栏 - 鼠标按下事件
Animation.timelineToolbarPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      if (element.tagName === 'ITEM') {
        switch (element.getAttribute('value')) {
          case 'previousKey':
            return Animation.previousKeyFrame()
          case 'previous':
            return Animation.previousFrame()
          case 'play':
            return Animation.play()
          case 'next':
            return Animation.nextFrame()
          case 'nextKey':
            return Animation.nextKeyFrame()
          case 'loop':
            return Animation.switchLoop()
        }
      }
      break
    }
  }
}

// 图层列表 - 鼠标滚轮事件
Animation.layerListWheel = function (event) {
  event.preventDefault()
  if (event.deltaY !== 0) {
    this.scrollTop += event.deltaY > 0 ? 20 : -20
  }
}

// 图层列表 - 滚动事件
Animation.layerListScroll = function (event) {
  const {outerTimelineList} = Animation
  const {scrollTop} = this
  this.lastScrollTop = scrollTop
  if (outerTimelineList.lastScrollTop !== scrollTop) {
    outerTimelineList.scrollTop = scrollTop
  }
}

// 图层列表 - 键盘按下事件
Animation.layerListKeydown = function (event) {
  // 避免重命名输入框键盘按下事件
  if (event.target !== this || !this.data) {
    return
  }

  const item = this.read()
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyX':
        if (item) {
          this.copy(item)
          this.delete(item)
        }
        break
      case 'KeyC':
        this.copy(item)
        break
      case 'KeyV':
        this.paste(null)
        break
    }
  } else if (event.shiftKey) {
    return
  } else {
    switch (event.code) {
      case 'Delete':
        this.delete(item)
        break
    }
  }
}

// 图层列表 - 指针按下事件
Animation.layerListPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const element = event.target
      switch (element.tagName) {
        case 'NODE-ITEM':
          if (element.hasClass('selected')) {
            Animation.openLayer(element.item)
          }
          break
        case 'VISIBILITY-ICON': {
          const {item} = element.parentNode
          const {hidden} = item
          const backups = this.setRecursiveStates(item, 'hidden', !hidden)
          this.update()
          this.dispatchChangeEvent()
          Animation.requestRendering()
          Animation.history.save({
            type: 'animation-layer-hidden',
            motion: Animation.motion,
            item: item,
            oldValues: backups,
            newValue: !hidden,
          })
          break
        }
        case 'LOCK-ICON': {
          const {item} = element.parentNode
          const {locked} = item
          const backups = this.setRecursiveStates(item, 'locked', !locked)
          this.update()
          this.dispatchChangeEvent()
          Animation.history.save({
            type: 'animation-layer-locked',
            motion: Animation.motion,
            item: item,
            oldValues: backups,
            newValue: !locked,
          })
          break
        }
      }
      break
    }
  }
}

// 图层列表 - 选择事件
Animation.layerListSelect = function (event) {
  Animation.openLayer(event.value)
}

// 图层列表 - 记录事件
Animation.layerListRecord = function (event) {
  const response = event.value
  const {type} = response
  switch (type) {
    case 'rename':
    case 'create':
    case 'delete':
    case 'remove':
      Animation.contextLoaded = false
      Animation.history.save({
        type: `animation-layer-${type}`,
        motion: Animation.motion,
        response: response,
      })
      break
  }
}

// 图层列表 - 菜单弹出事件
Animation.layerListPopup = function (event) {
  const item = event.value
  const get = Yami.Local.createGetter('menuAnimationLayerList')
  let copyable
  let pastable
  let deletable
  let renamable
  if (item) {
    copyable = true
    pastable = Clipboard.has('yami.animation.layer')
    deletable = true
    renamable = true
  } else {
    copyable = false
    pastable = Clipboard.has('yami.animation.layer')
    deletable = false
    renamable = false
  }
  Yami.Menu.popup({
    x: event.clientX,
    y: event.clientY,
  }, [{
    label: get('create'),
    submenu: [{
      label: get('create.joint'),
      click: () => {
        this.create(item, 'joint')
      },
    }, {
      label: get('create.sprite'),
      click: () => {
        this.create(item, 'sprite')
      },
    }, {
      label: get('create.particleEmitter'),
      click: () => {
        this.create(item, 'particle')
      },
    }],
  }, {
    type: 'separator',
  }, {
    label: get('cut'),
    accelerator: Yami.ctrl('X'),
    enabled: copyable,
    click: () => {
      this.copy(item)
      this.delete(item)
    },
  }, {
    label: get('copy'),
    accelerator: Yami.ctrl('C'),
    enabled: copyable,
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
    enabled: renamable,
    click: () => {
      this.rename(item)
    },
  }])
}

// 图层列表 - 改变事件
Animation.layerListChange = function (event) {
  Animation.planToSave()
}

// 时间轴列表 - 键盘按下事件
Animation.outerTimelineListKeydown = function (event) {
  if (this.dragging !== null) return
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyA':
        Animation.selectAllFrames()
        break
      case 'KeyX':
        Animation.copyFrame()
        Animation.deleteFrame()
        break
      case 'KeyC':
        Animation.copyFrame()
        break
      case 'KeyV':
        Animation.pasteFrame()
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        Animation.shiftSelectedFrames(
          event.code.slice(5).toLowerCase()
        )
        break
    }
  } else if (event.shiftKey) {
    switch (event.code) {
      case 'Delete':
        Animation.deleteFrame(true)
        break
      case 'ArrowUp':
      case 'ArrowDown':
        Animation.selectAllFramesOfKey()
        break
      case 'ArrowLeft':
      case 'ArrowRight':
        Animation.multiSelectFramesRelative(
          event.code.slice(5).toLowerCase()
        )
        break
      case 'Home':
      case 'End':
        Animation.multiSelectFramesToHomeEnd(
          event.code.toLowerCase()
        )
        break
    }
  } else {
    switch (event.code) {
      case 'Space':
        event.preventDefault()
        break
      case 'Escape':
        Animation.unselectMarquee()
        break
      case 'KeyF':
        Animation.insertFrame()
        break
      case 'KeyG':
        Animation.extendFrame()
        break
      case 'Delete':
        Animation.deleteFrame()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        Animation.selectFrameRelative(
          event.code.slice(5).toLowerCase()
        )
        break
      case 'Home':
      case 'End':
        event.preventDefault()
        Animation.selectFrameAtHomeEnd(
          event.code.toLowerCase()
        )
        break
      case 'PageUp':
        event.preventDefault()
        break
      case 'PageDown':
        event.preventDefault()
        break
    }
  }
}

// 时间轴列表 - 鼠标滚轮事件
Animation.outerTimelineListWheel = function (event) {
  event.preventDefault()
  if (event.deltaY !== 0) {
    this.scrollTop += event.deltaY > 0 ? 20 : -20
  }
}

// 时间轴列表 - 滚动事件
Animation.outerTimelineListScroll = function (event) {
  const {scrollLeft, scrollTop} = this
  if (this.lastScrollLeft !== scrollLeft) {
    this.lastScrollLeft = scrollLeft
    const {outerRuler, innerRuler, outerPointerArea} = Animation
    const start = Math.floor(scrollLeft / 80)
    if (innerRuler.start !== start) {
      innerRuler.start = start
      let number = start * 5
      for (const node of innerRuler.childNodes) {
        node.textContent = number.toString()
        number += 5
      }
    }
    // 通过容差来消除非1:1时的抖动
    const tolerance = 0.0001
    outerRuler.scrollLeft = (scrollLeft + tolerance) % 80
    outerPointerArea.scrollLeft = scrollLeft
  }
  if (this.lastScrollTop !== scrollTop) {
    this.lastScrollTop = scrollTop
    const {layerList} = Animation
    if (layerList.lastScrollTop !== scrollTop) {
      layerList.scrollTop = scrollTop
    }
  }
  const {pointerevent} = Animation.timelineCursor
  if (pointerevent !== null) {
    Animation.innerTimelineListPointermove(pointerevent)
  }
}

// 时间轴列表 - 失去焦点事件
Animation.outerTimelineListBlur = function (event) {
  Animation.outerTimelineListPointerup()
}

// 时间轴列表 - 指针按下事件
Animation.outerTimelineListPointerdown = function (event) {
  if (Animation.dragging) {
    return
  }
  switch (event.button) {
    case 0: {
      if (event.altKey) {
        this.dragging = event
        event.mode = 'scroll'
        event.scrollLeft = this.scrollLeft
        event.scrollTop = this.scrollTop
        Yami.Cursor.open('cursor-grab')
        window.on('pointerup', Animation.outerTimelineListPointerup)
        window.on('pointermove', Animation.outerTimelineListPointermove)
        return
      }
      if (event.target === Yami.Animation.innerTimelineList) {
        const marquee = Animation.timelineMarquee
        let {x, y} = Animation.getFrameCoords(event)
        let length = 1
        let origin = x
        if (event.shiftKey) {
          const {y: my, origin: mo} = marquee
          if (y === my) {
            length = Math.abs(x - mo) + 1
            x = Math.min(x, mo)
            origin = mo
          }
        } else {
          const frame = Animation.getKeyFrame(x, y)
          if (frame !== null) {
            Animation.adjustMarquee()
            const {layer, length} = marquee
            Animation.updateMarqueeShift(x, y, length)
            Animation.timelineMarqueeShift.show()
            Animation.loadFrames(x)
            this.dragging = event
            event.mode = 'shift'
            event.layer = layer
            event.pointerdownX = x
            event.pointerdownY = y
            event.enableDblclickEvent = true
            window.on('pointerup', Animation.outerTimelineListPointerup)
            window.on('pointermove', Animation.outerTimelineListPointermove)
            this.addScrollListener('both', 1, true, () => {
              Animation.outerTimelineListPointermove(event.latest)
            })
            return
          }
        }
        Animation.selectMarquee(x, y, length, origin)
        Animation.scrollToMarquee(false)
        Animation.loadFrames(x)
        this.dragging = event
        event.mode = 'select'
        event.pointerdownX = origin
        event.pointerdownY = y
        event.enableDblclickEvent = true
        window.on('pointerup', Animation.outerTimelineListPointerup)
        window.on('pointermove', Animation.outerTimelineListPointermove)
        this.addScrollListener('horizontal', 1, true, () => {
          Animation.outerTimelineListPointermove(event.latest)
        })
      }
      break
    }
    case 2:
      this.dragging = event
      event.mode = 'ready-to-scroll'
      event.scrollLeft = this.scrollLeft
      event.scrollTop = this.scrollTop
      window.on('pointerup', Animation.outerTimelineListPointerup)
      window.on('pointermove', Animation.outerTimelineListPointermove)
      break
  }
}

// 时间轴列表 - 指针弹起事件
Animation.outerTimelineListPointerup = function (event) {
  const {dragging} = Animation.outerTimelineList
  if (dragging === null) {
    return
  }
  if (event === undefined) {
    event = dragging
  }
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'select':
        Animation.outerTimelineList.removeScrollListener()
        break
      case 'shift': {
        const marquee = Animation.timelineMarqueeShift
        if (!marquee.hasClass('disabled')) {
          Animation.dragAndDropFrame()
        }
        marquee.hide()
        marquee.layer = null
        marquee.removeClass('disabled')
        Animation.outerTimelineList.removeScrollListener()
        break
      }
      case 'ready-to-scroll':
        if (event.target === Yami.Animation.innerTimelineList) {
          const {x, y} = Animation.getFrameCoords(event)
          const marquee = Animation.timelineMarquee
          if (!marquee.isPointIn(x, y)) {
            Animation.selectMarquee(x, y, 1, x)
            Animation.scrollToMarquee(false)
            Animation.loadFrames(x)
          }
          if (marquee.isPointIn(x, y)) {
            const key = marquee.layer.class
            const selected = marquee.isSelected()
            const pastable = Clipboard.has(`yami.animFrame.${key}`)
            const extendable = selected || marquee.isExtendable()
            const shrinkable = selected || marquee.isShrinkable()
            const get = Yami.Local.createGetter('menuAnimationTimeline')
            Yami.Menu.popup({
              x: event.clientX,
              y: event.clientY,
            }, [{
              label: get('insert'),
              accelerator: 'F',
              click: () => {
                Animation.insertFrame()
              },
            }, {
              label: get('extend'),
              accelerator: 'G',
              enabled: extendable,
              click: () => {
                Animation.extendFrame()
              },
            }, {
              label: get('cut'),
              accelerator: Yami.ctrl('X'),
              enabled: selected,
              click: () => {
                Animation.copyFrame()
                Animation.deleteFrame()
              },
            }, {
              label: get('copy'),
              accelerator: Yami.ctrl('C'),
              enabled: selected,
              click: () => {
                Animation.copyFrame()
              },
            }, {
              label: get('paste'),
              enabled: pastable,
              accelerator: Yami.ctrl('V'),
              click: () => {
                Animation.pasteFrame()
              },
            }, {
              label: get('delete'),
              accelerator: 'Delete',
              enabled: selected,
              click: () => {
                Animation.deleteFrame()
              },
            }, {
              label: get('deleteAndShift'),
              accelerator: 'Shift+Del',
              enabled: shrinkable,
              click: () => {
                Animation.deleteFrame(true)
              },
            }, {
              label: get('selectAll'),
              accelerator: Yami.ctrl('A'),
              enabled: marquee.layer.frames.length !== 0,
              click: () => {
                Animation.selectAllFrames()
              },
            }])
          }
        }
        break
      case 'scroll':
        Yami.Cursor.close('cursor-grab')
        break
    }
    Animation.innerTimelineList.pointerevent = dragging
    Animation.outerTimelineList.dragging = null
    window.off('pointerup', Animation.outerTimelineListPointerup)
    window.off('pointermove', Animation.outerTimelineListPointermove)
  }
}

// 时间轴列表 - 指针移动事件
Animation.outerTimelineListPointermove = function (event) {
  const {dragging} = Animation.outerTimelineList
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'select': {
        dragging.latest = event
        if (dragging.enableDblclickEvent) {
          const distX = event.clientX - dragging.clientX
          const distY = event.clientY - dragging.clientY
          if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
            dragging.enableDblclickEvent = false
          }
        }
        const coords = Animation.getFrameCoords(event, true)
        const x = Math.clamp(coords.x, 0, Animation.frameMax - 1)
        const mx = Math.min(x, dragging.pointerdownX)
        const mw = Math.abs(x - dragging.pointerdownX) + 1
        Animation.selectMarquee(mx, dragging.pointerdownY, mw)
        Animation.loadFrames(x)
        break
      }
      case 'shift': {
        dragging.latest = event
        if (dragging.enableDblclickEvent) {
          const distX = event.clientX - dragging.clientX
          const distY = event.clientY - dragging.clientY
          if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
            dragging.enableDblclickEvent = false
          }
        }
        const coords = Animation.getFrameCoords(event, true)
        const marquee = Animation.timelineMarqueeShift
        const right = Animation.frameMax - marquee.length
        const bottom = Animation.innerTimelineList.childNodes.length - 1
        const x = Math.clamp(coords.x, 0, right)
        const y = Math.clamp(coords.y, 0, bottom)
        Animation.updateMarqueeShift(x, y)
        // 更新转移选框的样式
        dragging.layer.class === marquee.layer?.class
        ? marquee.removeClass('disabled')
        : marquee.addClass('disabled')
        break
      }
      case 'ready-to-scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        Animation.outerTimelineList.scroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
          dragging.mode = 'scroll'
          Yami.Cursor.open('cursor-grab')
        }
        break
      }
      case 'scroll': {
        const distX = event.clientX - dragging.clientX
        const distY = event.clientY - dragging.clientY
        Animation.outerTimelineList.scroll(
          dragging.scrollLeft - distX,
          dragging.scrollTop - distY,
        )
        break
      }
    }
  }
}

// 时间轴列表 - 指针移动事件
Animation.innerTimelineListPointermove = function (event) {
  // 本事件可能被直接调用
  // 因此不使用this来获取元素
  const {x, y} = Animation.getFrameCoords(event)
  const list = Animation.innerTimelineList
  const ex = Animation.frameMax
  const ey = list.childNodes.length
  x >= 0 && x < ex && y >= 0 && y < ey
  ? Animation.updateCursor(x, y)
  : Animation.updateCursor(-1, -1)
  Animation.timelineCursor.pointerevent = event
}

// 时间轴列表 - 指针离开事件
Animation.innerTimelineListPointerleave = function (event) {
  Animation.timelineCursor.pointerevent = null
  Animation.updateCursor(-1, -1)
}

// 时间轴列表 - 鼠标双击事件
Animation.innerTimelineListDblclick = function (event) {
  if (this.pointerevent.enableDblclickEvent) {
    const {x, y} = Animation.getFrameCoords(event)
    const timelines = Animation.innerTimelineList.childNodes
    const layer = timelines[y]?.layer
    if (layer !== undefined) {
      for (const frame of layer.frames) {
        const start = frame.start
        const end = frame.end
        if (x >= end) continue
        if (x < start) break
        Animation.selectMarquee(start, y, end - start, x)
        Animation.scrollToMarquee(false)
        return
      }
    }
  }
}

// 选框 - 调整目标
Animation.marquee.resize = function () {
  if (this.pointerevent) {
    Animation.marqueePointermove(this.pointerevent)
  }
}

// 列表 - 复制
Animation.list.copy = function (item) {
  if (item) {
    Clipboard.write('yami.animation.object', item)
  }
}

// 列表 - 粘贴
Animation.list.paste = function (dItem) {
  const copy = Clipboard.read('yami.animation.object')
  if (copy && this.data) {
    this.addNodeTo(copy, dItem)
  }
}

// 列表 - 删除
Animation.list.delete = function (item) {
  if (item) {
    this.deleteNode(item)
  }
}

// 列表 - 取消搜索
Animation.list.cancelSearch = function () {
  if (this.display === 'search') {
    const active = document.activeElement
    Animation.searcher.deleteInputContent()
    this.expandToSelection()
    this.scrollToSelection()
    active.focus()
  }
}

// 列表 - 更新头部位置
Animation.list.updateHead = function () {
  const {page, head} = this
  if (page.clientWidth !== 0) {
    // 调整左边位置
    const {nav} = Yami.Layout.getGroupOfElement(head)
    const nRect = nav.rect()
    const iRect = nav.lastChild.rect()
    const left = iRect.right - nRect.left
    if (head.left !== left) {
      head.left = left
      head.style.left = `${left}px`
    }
  }
}

// 列表 - 重写创建图标方法
Animation.list.createIcon = function () {
  const icon = document.createElement('node-icon')
  icon.addClass('icon-string')
  return icon
}

// 列表 - 重写创建文本方法
Animation.list.createText = function (item) {
  const textNode = document.createElement('text')
  textNode.style.pointerEvents = 'none'
  return textNode
}

// 列表 - 更新文本
Animation.list.updateText = function (item) {
  const {element} = item
  if (element.enumId !== item.id) {
    element.enumId = item.id
    const enumString = Yami.Enum.getString(item.id)
    element.textNode.textContent = enumString
    ? enumString.name
    : Yami.Command.parseUnlinkedId(item.id)
  }
}

// 列表 - 创建动作方向文本
Animation.list.createDirText = function (item) {
  const dirText = document.createElement('text')
  dirText.addClass('animation-motion-direction')
  item.element.appendChild(dirText)
  item.element.dirText = dirText
}

// 列表 - 更新动作方向文本
Animation.list.updateDirText = function (item) {
  const {direction, dirText} = item.element
  if (direction !== undefined) {
    dirText.textContent = direction
  }
}

// 列表 - 更新所有动作方向
Animation.list.updateDirections = function (replace = false) {
  let dirMap
  switch (Animation.mode) {
    case '1-dir':
    case '1-dir-mirror':
      dirMap = {0: ''}
      break
    case '2-dir':
      dirMap = {0: ' ←', 1: ' →'}
      break
    case '3-dir-mirror':
      dirMap = {0: ' ↓', 1: ' →', 2: ' ↑'}
      break
    case '4-dir':
      dirMap = {0: ' ↓', 1: ' ←', 2: ' →', 3: ' ↑'}
      break
    case '5-dir-mirror':
      dirMap = {0: ' ↓', 1: ' →', 2: ' ↑', 3: ' ↘', 4: ' ↗'}
      break
    case '8-dir':
      dirMap = {0: ' ↓', 1: ' ←', 2: ' →', 3: ' ↑', 4: ' ↙', 5: ' ↘', 6: ' ↖', 7: ' ↗'}
      break
  }
  const dirCounters = {}
  for (const item of this.data) {
    const {id, element} = item
    if (dirCounters[id] === undefined) {
      dirCounters[id] = 0
    }
    element.direction = dirMap[dirCounters[id]++] ?? ''
    if (replace && element.dirText?.parentNode) {
      element.dirText.textContent = element.direction
    }
  }
}

// 列表 - 创建循环图标
Animation.list.createLoopIcon = function (item) {
  const {element} = item
  const loopIcon = document.createElement('node-icon')
  loopIcon.addClass('icon-loop')
  loopIcon.textContent = '\uf112'
  element.appendChild(loopIcon)
  element.loopIcon = loopIcon
  element.loop = null
}

// 列表 - 更新循环图标
Animation.list.updateLoopIcon = function (item) {
  const {element} = item
  if (element.loopIcon !== undefined) {
    const loop = item.loop
    if (element.loop !== loop) {
      element.loop = loop
      loop
      ? element.loopIcon.show()
      : element.loopIcon.hide()
    }
  }
}

// 列表 - 在删除数据时回调
Animation.list.onDelete = function () {
  Animation.updateMotion()
}

// 图层列表 - 重写更新方法
Animation.layerList.update = function () {
  Yami.NodeList.prototype.update.call(this)
  if (!Animation.contextLoaded) {
    Animation.contextLoaded = true
    const {player} = Animation
    const {contexts} = player
    player.destroyContextEmitters()
    player.loadContexts(contexts)
    if (Animation.showOnionskin) {
      const {prev, next} = player.onionskin
      player.loadContexts(prev)
      player.loadContexts(next)
    }
  }
  Animation.updateTarget()
  Animation.updateTimeline()
}

// 图层列表 - 创建图层
Animation.layerList.create = function (dItem, type) {
  let data
  switch (type) {
    case 'joint':
      data = Yami.Inspector.animJointLayer.create()
      break
    case 'sprite':
      data = Yami.Inspector.animSpriteLayer.create()
      break
    case 'particle':
      data = Yami.Inspector.animParticleLayer.create()
      break
  }
  this.addNodeTo(data, dItem)
}

// 图层列表 - 复制
Animation.layerList.copy = function (item) {
  if (item) {
    Clipboard.write('yami.animation.layer', item)
  }
}

// 图层列表 - 粘贴
Animation.layerList.paste = function (dItem) {
  const copy = Clipboard.read('yami.animation.layer')
  if (copy && this.data) {
    this.addNodeTo(copy, dItem)
  }
}

// 图层列表 - 删除
Animation.layerList.delete = function (item) {
  if (item) {
    this.deleteNode(item)
  }
}

// 图层列表 - 恢复动作对象
Animation.layerList.restoreMotion = function (motion) {
  if (Animation.motion !== motion) {
    const {update} = this
    this.update = Function.empty
    Animation.setMotion(motion)
    this.update = update
  }
}

// 图层列表 - 重写创建图标方法
Animation.layerList.createIcon = function IIFE() {
  // 图标创建函数集合
  const iconCreators = {
    joint: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('anim-layer-joint')
      return icon
    },
    sprite: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('anim-layer-sprite')
      return icon
    },
    particle: () => {
      const icon = document.createElement('node-icon')
      icon.addClass('anim-layer-particle')
      return icon
    },
  }
  return function (item) {
    return iconCreators[item.class]()
  }
}()

// 图层列表 - 在删除数据时回调
Animation.layerList.onDelete = function (item) {
  const editor = Yami.Inspector[Yami.Inspector.type]
  if (editor?.target === item) {
    Yami.Inspector.close()
  }
}

// 时间轴 - 更新头部位置
Animation.timeline.updateHead = function () {
  const {head} = this
  if (this.clientWidth !== 0) {
    // 调整左边位置
    const {nav} = Yami.Layout.getGroupOfElement(head)
    const nRect = nav.rect()
    const iRect = nav.lastChild.rect()
    const left = iRect.right - nRect.left
    if (head.left !== left) {
      head.left = left
      head.style.left = `${left}px`
    }
    const bRect = Animation.outerTimelineList.rect()
    const padding = Math.max(bRect.left - iRect.right, 0)
    if (head.padding !== padding) {
      head.padding = padding
      Animation.toolbar.style.width = `${padding}px`
      Animation.outerRuler.style.left = `${padding}px`
    }
    // 更新刻度尺
    Animation.updateRuler()
  }
}

// 时间轴列表 - 恢复动作和图层对象
Animation.outerTimelineList.restoreMotionAndLayer = function (motion, layer) {
  const {updateTimeline} = Animation
  Animation.updateTimeline = Function.empty
  Animation.setMotion(motion)
  Animation.layerList.expandToItem(layer)
  Animation.updateTimeline = updateTimeline
}

// 时间轴选框 - 判断点是否在选框区域内
Animation.timelineMarquee.isPointIn = function (x, y) {
  return x >= this.x && x < this.x + this.length && y === this.y
}

// 时间轴选框 - 判断帧是否已选中
Animation.timelineMarquee.isSelected = function () {
  const {layer, x, length} = this
  const ex = x + length
  const frames = layer.frames
  const fLength = frames.length
  for (let i = 0; i < fLength; i++) {
    const frame = frames[i]
    const start = frame.start
    const end = frame.end
    if (x >= end) continue
    if (ex <= start) break
    return true
  }
  return false
}

// 时间轴选框 - 判断是否可延长
Animation.timelineMarquee.isExtendable = function () {
  const frames = this.layer.frames
  const frame = frames[0]
  return frame ? this.x >= frame.start : false
}

// 时间轴选框 - 判断是否可收缩
Animation.timelineMarquee.isShrinkable = function () {
  const frames = this.layer.frames
  const frame = frames[frames.length - 1]
  return frame ? this.x < frame.end : false
}

Animation.Player = Yami.AnimationPlayer
