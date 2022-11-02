'use strict'

import { Inspector } from './inspector.js'

// ******************************** 文件 - 动画页面 ********************************

{
  const FileAnimation = {
    // properties
    button: $('#animation-switch-settings'),
    owner: null,
    target: null,
    sprites: null,
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    update: null,
    // events
    paramInput: null,
  }

  // 初始化
  FileAnimation.initialize = function () {
    // 创建所有者代理
    this.owner = {
      setTarget: target => {
        if (this.target !== target) {
          Inspector.open('fileAnimation', target)
        }
      },
      planToSave: () => {
        Animation.planToSave()
      },
      get history() {
        return Animation.history
      },
    }

    // 创建动画模式选项
    $('#fileAnimation-mode').loadItems([
      {name: '1 Directional', value: '1-dir'},
      {name: '2 Directional', value: '2-dir'},
      {name: '4 Directional', value: '4-dir'},
      {name: '8 Directional', value: '8-dir'},
      {name: '1 Directional - Mirror', value: '1-dir-mirror'},
      {name: '3 Directional - Mirror', value: '3-dir-mirror'},
      {name: '5 Directional - Mirror', value: '5-dir-mirror'},
    ])

    // 绑定精灵图列表
    $('#fileAnimation-sprites').bind(this.sprites)

    // 侦听事件
    const elements = $('#fileAnimation-mode')
    elements.on('input', this.paramInput)
    elements.on('focus', Inspector.inputFocus)
    elements.on('blur', Inspector.inputBlur(this, this.owner))
    $('#fileAnimation-sprites').on('change', Animation.listChange)
  }

  // 创建动画
  FileAnimation.create = function () {
    return {
      mode: '1-dir-mirror',
      sprites: [],
      motions: [],
    }
  }

  // 打开数据
  FileAnimation.open = function (animation) {
    if (this.target !== animation) {
      this.target = animation

      // 更新按钮样式
      this.button.addClass('selected')

      // 写入数据
      const write = getElementWriter('fileAnimation', animation)
      write('mode')
      write('sprites')
    }
  }

  // 关闭数据
  FileAnimation.close = function () {
    if (this.target) {
      this.target = null

      // 更新按钮样式
      this.button.removeClass('selected')
    }
  }

  // 更新数据
  FileAnimation.update = function (animation, key, value) {
    Animation.planToSave()
    switch (key) {
      case 'mode':
        if (animation.mode !== value) {
          animation.mode = value
          Animation.list.updateDirections(true)
          break
        }
    }
  }

  // 参数 - 输入事件
  FileAnimation.paramInput = function (event) {
    FileAnimation.update(
      FileAnimation.target,
      Inspector.getKey(this),
      this.read(),
    )
  }

  // 精灵图列表接口
  FileAnimation.sprites = {
    list: null,
    spriteId: '',
    initialize: function (list) {
      $('#fileAnimation-sprite-confirm').on('click', () => list.save())

      // 引用列表元素
      this.list = list

      // 创建参数历史操作
      this.history = new Inspector.ParamHistory(
        FileAnimation,
        FileAnimation.owner,
        list,
      )

      // 重载动画纹理 - 改变事件
      list.on('change', event => {
        if (Animation.sprites) {
          if (Animation.sprites.listItems) {
            Animation.sprites.listItems = undefined
          }
          Animation.loadTextures()
        }
      })
    },
    parse: function ({name, image, hframes, vframes}) {
      return [name, `${Command.parseFileName(image)} [${hframes}x${vframes}]`]
    },
    createSpriteId: function (exclusions = Object.empty) {
      let id
      do {id = GUID.generate64bit()}
      while (this.list.data.find(a => a.id === id) && exclusions[id])
      return id
    },
    open: function ({
      name    = '',
      id      = this.createSpriteId(),
      image   = '',
      hframes = 1,
      vframes = 1,
    } = {}) {
      Window.open('fileAnimation-sprite')
      const write = getElementWriter('fileAnimation-sprite')
      write('name', name)
      write('image', image)
      write('hframes', hframes)
      write('vframes', vframes)
      this.spriteId = id
      if (!name) {
        $('#fileAnimation-sprite-name').getFocus()
      } else {
        $('#fileAnimation-sprite-image').getFocus()
      }
    },
    save: function () {
      const read = getElementReader('fileAnimation-sprite')
      const name = read('name').trim()
      if (!name) {
        return $('#fileAnimation-sprite-name').getFocus()
      }
      const image = read('image')
      const hframes = read('hframes')
      const vframes = read('vframes')
      const id = this.spriteId
      Window.close('fileAnimation-sprite')
      return {name, id, image, hframes, vframes}
    },
    onPaste: function (list, copies) {
      const exclusions = {}
      for (const sprite of copies) {
        const id = this.createSpriteId(exclusions)
        sprite.id = id
        exclusions[id] = true
      }
    },
  }

  Inspector.fileAnimation = FileAnimation
}
