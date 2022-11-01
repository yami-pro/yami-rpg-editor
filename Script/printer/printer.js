'use strict'

// ******************************** 打印机类 ********************************

class Printer {
  texture           //:object
  context           //:object
  content           //:string
  buffer            //:string
  x                 //:number
  y                 //:number
  width             //:number
  height            //:number
  index             //:number
  commands          //:array
  paddingLeft       //:number
  paddingTop        //:number
  paddingRight      //:number
  paddingBottom     //:number
  lineHeight        //:number
  lineSpacing       //:number
  letterSpacing     //:number
  breakable         //:boolean
  _direction        //:string
  _horizontalAlign  //:string
  _verticalAlign    //:string
  horizontal        //:boolean
  alignmentFactorX  //:number
  alignmentFactorY  //:number
  wordWrap          //:boolean
  truncate          //:boolean
  printWidth        //:number
  printHeight       //:number
  fonts             //:array
  styles            //:array
  weights           //:array
  sizes             //:array
  colors            //:array
  effects           //:array

  constructor(texture) {
    texture.base.printer = this
    texture.base.onRestore = Printer.restoreTexture
    this.texture = texture
    this.context = GL.context2d
    this.content = ''
    this.buffer = ''
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
    this.index = 0
    this.commands = null
    this.paddingLeft = 0
    this.paddingTop = 0
    this.paddingRight = 0
    this.paddingBottom = 0
    this.lineHeight = 0
    this.lineSpacing = 0
    this.letterSpacing = 0
    this.breakable = false
    this.direction = 'horizontal-tb'
    this.horizontalAlign = 'left'
    this.verticalAlign = 'top'
    this.wordWrap = false
    this.truncate = false
    this.printWidth = null
    this.printHeight = null
    this.fonts = [Printer.font]
    this.styles = ['normal']
    this.weights = ['normal']
    this.sizes = [Printer.size]
    this.colors = [Printer.color]
    this.effects = [Printer.effect]
  }

  // 读取方向
  get direction() {
    return this._direction
  }

  // 写入方向
  set direction(value) {
    this._direction = value
    switch (value) {
      case 'horizontal-tb':
        this.horizontal = true
        break
      case 'vertical-lr':
      case 'vertical-rl':
        this.horizontal = false
        break
    }
  }

  // 读取水平对齐
  get horizontalAlign() {
    return this._horizontalAlign
  }

  // 写入水平对齐
  set horizontalAlign(value) {
    this._horizontalAlign = value
    switch (value) {
      case 'left':
        this.alignmentFactorX = 0
        break
      case 'center':
        this.alignmentFactorX = 0.5
        break
      case 'right':
        this.alignmentFactorX = 1
        break
    }
  }

  // 读取垂直对齐
  get verticalAlign() {
    return this._verticalAlign
  }

  // 写入垂直对齐
  set verticalAlign(value) {
    this._verticalAlign = value
    switch (value) {
      case 'top':
        this.alignmentFactorY = 0
        break
      case 'middle':
        this.alignmentFactorY = 0.5
        break
      case 'bottom':
        this.alignmentFactorY = 1
        break
    }
  }

  // 重置
  reset() {
    this.content = ''
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
    this.index = 0
    this.lineHeight = 0
    this.breakable = false
    const fonts = this.fonts
    const styles = this.styles
    const weights = this.weights
    const sizes = this.sizes
    const colors = this.colors
    const effects = this.effects
    if (fonts.length !== 1) {
      this.fonts = [fonts[fonts.length - 1]]
    }
    if (styles.length !== 1) {
      this.styles = [styles[styles.length - 1]]
    }
    if (weights.length !== 1) {
      this.weights = [weights[weights.length - 1]]
    }
    if (sizes.length !== 1) {
      this.sizes = [sizes[sizes.length - 1]]
    }
    if (colors.length !== 1) {
      this.colors = [colors[colors.length - 1]]
    }
    if (effects.length !== 1) {
      this.effects = [effects[effects.length - 1]]
    }
    return this
  }

  // 更新字体
  updateFont() {
    const style = this.styles[0]
    const weight = this.weights[0]
    const size = this.sizes[0]
    const family = this.fonts.join(', ')
    const context = this.context
    context.font = `${style} normal ${weight} ${size}px ${family}`
    context.paddingItalic = style === 'italic' ? Math.ceil(size / 4) : 0
    context.paddingVertical = Math.ceil(size / 10)
    context.size = size
  }

  // 计算内边距
  calculatePadding() {
    const context = this.context
    const effect = this.effects[0]
    const {paddingItalic} = context
    const {paddingVertical} = context
    switch (effect.type) {
      case 'none':
        this.paddingLeft = Math.max(-this.x, this.paddingLeft)
        this.paddingTop = Math.max(paddingVertical - this.y, this.paddingTop)
        this.paddingRight = Math.max(paddingItalic, this.paddingRight)
        this.paddingBottom = Math.max(paddingVertical, this.paddingBottom)
        break
      case 'shadow': {
        const {shadowOffsetX, shadowOffsetY} = effect
        const shadowOffsetLeft = Math.max(-shadowOffsetX, 0)
        const shadowOffsetTop = Math.max(-shadowOffsetY, 0)
        const shadowOffsetRight = Math.max(shadowOffsetX, 0)
        const shadowOffsetBottom = Math.max(shadowOffsetY, 0)
        this.paddingLeft = Math.max(shadowOffsetLeft - this.x, this.paddingLeft)
        this.paddingTop = Math.max(shadowOffsetTop + paddingVertical - this.y, this.paddingTop)
        this.paddingRight = Math.max(shadowOffsetRight + paddingItalic, this.paddingRight)
        this.paddingBottom = Math.max(shadowOffsetBottom + paddingVertical, this.paddingBottom)
        break
      }
      case 'stroke': {
        const halfWidth = Math.ceil(effect.strokeWidth / 2)
        this.paddingLeft = Math.max(halfWidth - this.x, this.paddingLeft)
        this.paddingTop = Math.max(halfWidth + paddingVertical - this.y, this.paddingTop)
        this.paddingRight = Math.max(halfWidth + paddingItalic, this.paddingRight)
        this.paddingBottom = Math.max(halfWidth + paddingVertical, this.paddingBottom)
        break
      }
      case 'outline':
        this.paddingLeft = Math.max(1 - this.x, this.paddingLeft)
        this.paddingTop = Math.max(1 + paddingVertical - this.y, this.paddingTop)
        this.paddingRight = Math.max(1 + paddingItalic, this.paddingRight)
        this.paddingBottom = Math.max(1 + paddingVertical, this.paddingBottom)
        break
    }
  }

  // 测量宽度
  measureWidth(string) {
    if (this.horizontal) {
      return this.context.measureText(string).width
    } else {
      return this.sizes[0] * string.length
    }
  }

  // 测量高度
  measureHeight(string) {
    if (this.horizontal) {
      return this.sizes[0]
    } else {
      let height = 0
      const context = this.context
      const length = string.length
      for (let i = 0; i < length; i++) {
        height = Math.max(height,
          context.measureText(string[i]).width,
        )
      }
      return height
    }
  }

  // 绘制缓冲字符串
  drawBuffer() {
    const string = this.buffer
    if (string === '') return
    this.calculatePadding()

    // 设置绘制指令
    const context = this.context
    const color = this.colors[0]
    const effect = this.effects[0]
    const horizontal = this.horizontal
    let measureWidth = Printer.lineWidth
    if (measureWidth === 0) {
      measureWidth = this.measureWidth(string)
    }
    const measureHeight = this.measureHeight(string)
    const commands = this.commands
    const command = Printer.fetchCommand()
    commands.push(command)
    command.string = string
    command.x = this.x
    command.y = this.y
    command.font = context.font
    command.size = context.size
    command.color = color
    command.effect = effect
    command.paddingItalic = context.paddingItalic
    command.paddingVertical = context.paddingVertical
    command.horizontalWidth = horizontal ? measureWidth : measureHeight
    command.drawingMethod = Printer[Printer.drawingMethods[effect.type]]

    // 重置行宽
    Printer.lineWidth = 0

    // 计算新的位置
    this.buffer = ''
    this.breakable = true
    if (horizontal) {
      this.x += measureWidth
      this.lineHeight = Math.max(this.lineHeight, measureHeight)
      this.width = Math.max(this.width, this.x)
      this.height = Math.max(this.height, this.y + this.lineHeight)
    } else {
      this.y += measureWidth
      this.lineHeight = Math.max(this.lineHeight, measureHeight)
      this.width = Math.max(this.width, this.x + this.lineHeight)
      this.height = Math.max(this.height, this.y)
    }
  }

  // 计算文本位置
  computeTextPosition() {
    switch (this.direction) {
      case 'horizontal-tb':
      case 'vertical-lr':
        break
      case 'vertical-rl': {
        const commands = this.commands
        const length = commands.length
        let x = this.width
        let index = 0
        let lineX
        let lineHeight
        for (let i = 0; i < length; i++) {
          const command = commands[i]
          if (lineX !== command.x) {
            while (index < i) {
              commands[index++].x = x - lineHeight
            }
            if (lineX !== undefined) {
              x -= command.x - lineX
            }
            lineX = command.x
            lineHeight = 0
          }
          lineHeight = Math.max(lineHeight, command.horizontalWidth)
        }
        while (index < length) {
          commands[index++].x = x - lineHeight
        }
        break
      }
    }
    if (this.horizontal) {
      const factor = this.alignmentFactorX
      if (factor !== 0) {
        const commands = this.commands
        const letterSpacing = this.letterSpacing
        const lineWidth = this.width + letterSpacing
        let lineX
        let lineY
        for (let i = commands.length - 1; i >= 0; i--) {
          const command = commands[i]
          if (lineY !== command.y) {
            lineY = command.y
            lineX = factor * (
              lineWidth
            - command.x
            - command.horizontalWidth
            )
          }
          command.x += lineX
        }
      }
    } else {
      const factor = this.alignmentFactorY
      if (factor !== 0) {
        const commands = this.commands
        const letterSpacing = this.letterSpacing
        const lineWidth = this.height + letterSpacing
        let lineX
        let lineY
        for (let i = commands.length - 1; i >= 0; i--) {
          const command = commands[i]
          if (lineX !== command.x) {
            lineX = command.x
            lineY = factor * (
              lineWidth
            - command.y
            - command.string.length
            * (command.size + letterSpacing)
            )
          }
          command.y += lineY
        }
      }
    }
  }

  // 执行绘制指令
  executeCommands() {
    // 绑定纹理到帧缓冲区
    const gl = GL
    const texture = this.texture
    const base = texture.base
    gl.bindFBO(gl.frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, base.glTexture, 0)
    gl.setViewport(0, 0, base.width, base.height)
    gl.reset()

    const commands = this.commands
    const length = commands.length
    const horizontal = this.horizontal
    const paddingLeft = this.paddingLeft
    const paddingTop = this.paddingTop
    const letterSpacing = this.letterSpacing
    const charWidths = Printer.charWidths
    let charIndex = 0
    for (let i = 0; i < length; i++) {
      const command = commands[i]
      const string = command.string
      const drawingMethod = command.drawingMethod
      command.x += paddingLeft
      command.y += paddingTop
      if (horizontal) {
        if (letterSpacing !== 0) {
          const length = string.length
          for (let i = 0; i < length; i++) {
            const charWidth = charWidths[charIndex++]
            command.horizontalWidth = charWidth
            drawingMethod(command, string[i])
            command.x += charWidth + letterSpacing
          }
        } else {
          drawingMethod(command, string)
        }
      } else {
        const size = command.size
        const length = string.length
        for (let i = 0; i < length; i++) {
          drawingMethod(command, string[i])
          command.y += size + letterSpacing
        }
      }
    }
    this.commands = null

    // 解除帧缓冲绑定
    gl.unbindFBO()
    gl.resetViewport()

    // 重置指令池
    Printer.resetCommands()
  }

  // 换行
  newLine() {
    if (this.breakable) {
      this.breakable = false
      if (this.horizontal) {
        this.x = 0
        this.y += (this.lineHeight || this.sizes[0]) + this.lineSpacing
        this.lineHeight = 0
      } else {
        this.x += (this.lineHeight || this.sizes[0]) + this.lineSpacing
        this.y = 0
        this.lineHeight = 0
      }
    }
  }

  // 绘制文本
  draw(content) {
    // 设置内容和重置索引
    this.content = content
    this.index = 0

    // 创建指令列表
    this.commands = []

    // 重置内边距
    this.paddingLeft = 0
    this.paddingTop = 0
    this.paddingRight = 0
    this.paddingBottom = 0

    // 更新字体
    this.updateFont()

    const wordWrap = this.wordWrap
    const truncate = this.truncate
    const horizontal = this.horizontal
    const printWidth = this.printWidth
    const printHeight = this.printHeight
    const letterSpacing = this.letterSpacing
    const charWidths = Printer.charWidths
    const length = content.length
    let charIndex = 0
    let charWidth = 0

    // 按顺序检查字符
    while (this.index < length) {
      // 匹配标签
      const char = content[this.index]
      if (char === '<' && this.matchTag()) {
        continue
      }

      // 换行符
      if (char === '\n') {
        this.drawBuffer()
        this.newLine()
        this.index += 1
        continue
      }

      // 跳出循环
      if (truncate && (horizontal
      ? this.y + Math.max(this.lineHeight, this.measureHeight(char)) > printHeight
      : this.x + Math.max(this.lineHeight, this.measureHeight(char)) > printWidth)) {
        this.drawBuffer()
        break
      }

      // 强制换行
      if (wordWrap && (horizontal
      ? this.x + Printer.lineWidth + (charWidth = this.measureWidth(char)) > printWidth
      : this.y + Printer.lineWidth + (charWidth = this.measureWidth(char)) > printHeight) && (
        this.breakable || this.buffer.length !== 0)) {
        this.drawBuffer()
        this.newLine()
        continue
      }

      // 计算字间距相关数据
      if (letterSpacing !== 0) {
        if (wordWrap === false) {
          charWidth = this.measureWidth(char)
        }
        charWidths[charIndex++] = charWidth
        Printer.lineWidth += letterSpacing
      }
      Printer.lineWidth += charWidth

      // 放入缓冲字符串
      this.buffer += char
      this.index += 1
    }

    // 绘制缓冲字符串
    this.drawBuffer()

    // 调整文本区域大小(减去字间距)
    if (horizontal) {
      this.width = Math.max(this.width - letterSpacing, 0)
    } else {
      this.height = Math.max(this.height - letterSpacing, 0)
    }
    // 调整打印机纹理大小，限制最大宽高为16384(超过会报错)
    const width = Math.ceil(this.width + this.paddingLeft + this.paddingRight)
    const height = Math.ceil(this.height + this.paddingTop + this.paddingBottom)
    this.texture.resize(Math.min(width, 16384), Math.min(height, 16384))

    // 计算文本位置
    this.computeTextPosition()

    // 执行打印机指令进行绘制
    this.executeCommands()
  }

  // 匹配标签
  matchTag() {
    const regexps = Printer.regexps
    const startIndex = this.index
    const endIndex = this.content.indexOf('>', startIndex + 1) + 1
    const string = this.content.slice(startIndex, endIndex)
    let match
    if (match = string.match(regexps.colorIndex)) {
      const index = parseInt(match[1])
      const hex = Data.config.indexedColors[index].code
      const color = INTRGBA(hex)
      this.drawBuffer()
      this.colors.unshift(color)
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.color)) {
      const r = parseInt(match[1], 16)
      const g = parseInt(match[2], 16)
      const b = parseInt(match[3], 16)
      const a = parseInt(match[4] || 'ff', 16)
      const color = r + (g + (b + a * 256) * 256) * 256
      this.drawBuffer()
      this.colors.unshift(color)
      this.index += match[0].length
      return true
    }
    if ((match = string.match(regexps.colorRestore)) && this.colors.length > 1) {
      this.drawBuffer()
      this.colors.shift()
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.font)) {
      const font = `${match[1]}${match[2] ? `, ${match[2]}` : ''}`
      this.drawBuffer()
      this.fonts.unshift(font)
      this.updateFont()
      this.index += match[0].length
      return true
    }
    if ((match = string.match(regexps.fontRestore)) && this.fonts.length > 1) {
      this.drawBuffer()
      this.fonts.shift()
      this.updateFont()
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.italic)) {
      this.drawBuffer()
      this.styles.unshift('italic')
      this.updateFont()
      this.index += match[0].length
      return true
    }
    if ((match = string.match(regexps.italicRestore)) && this.styles.length > 1) {
      this.drawBuffer()
      this.styles.shift()
      this.updateFont()
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.bold)) {
      this.drawBuffer()
      this.weights.unshift('bold')
      this.updateFont()
      this.index += match[0].length
      return true
    }
    if ((match = string.match(regexps.boldRestore)) && this.weights.length > 1) {
      this.drawBuffer()
      this.weights.shift()
      this.updateFont()
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.fontSize)) {
      const size = parseInt(match[1])
      this.drawBuffer()
      this.sizes.unshift(size)
      this.updateFont()
      this.index += match[0].length
      return true
    }
    if ((match = string.match(regexps.fontSizeRestore)) && this.sizes.length > 1) {
      this.drawBuffer()
      this.sizes.shift()
      this.updateFont()
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.textPosition)) {
      const axis = match[1].toLowerCase()
      const operation = match[2] || 'set'
      const value = parseInt(match[3])
      this.drawBuffer()
      const position = (
        operation === 'set' ? value
      : operation === 'add' ? this[axis] + value
      :                       null
      )
      this[axis] = Math.max(position, 0)
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.textShadow)) {
      const r = parseInt(match[3], 16)
      const g = parseInt(match[4], 16)
      const b = parseInt(match[5], 16)
      const a = parseInt(match[6] || 'ff', 16)
      const effect = {
        type: 'shadow',
        shadowOffsetX: parseInt(match[1]),
        shadowOffsetY: parseInt(match[2]),
        color: r + (g + (b + a * 256) * 256) * 256,
      }
      this.drawBuffer()
      this.effects.unshift(effect)
      this.index += match[0].length
      return true
    }
    if ((match = string.match(regexps.textShadowRestore)) && this.effects.length > 1 && this.effects[0].type === 'shadow') {
      this.drawBuffer()
      this.effects.shift()
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.textStroke)) {
      const r = parseInt(match[2], 16)
      const g = parseInt(match[3], 16)
      const b = parseInt(match[4], 16)
      const a = parseInt(match[5] || 'ff', 16)
      const effect = {
        type: 'stroke',
        strokeWidth: parseInt(match[1]),
        color: r + (g + (b + a * 256) * 256) * 256,
      }
      this.drawBuffer()
      this.effects.unshift(effect)
      this.index += match[0].length
      return true
    }
    if ((match = string.match(regexps.textStrokeRestore)) && this.effects.length > 1 && this.effects[0].type === 'stroke') {
      this.drawBuffer()
      this.effects.shift()
      this.index += match[0].length
      return true
    }
    if (match = string.match(regexps.textOutline)) {
      const r = parseInt(match[1], 16)
      const g = parseInt(match[2], 16)
      const b = parseInt(match[3], 16)
      const a = parseInt(match[4] || 'ff', 16)
      const effect = {
        type: 'outline',
        color: r + (g + (b + a * 256) * 256) * 256,
      }
      this.drawBuffer()
      this.effects.unshift(effect)
      this.index += match[0].length
      return true
    }
    if ((match = string.match(regexps.textOutlineRestore)) && this.effects.length > 1 && this.effects[0].type === 'outline') {
      this.drawBuffer()
      this.effects.shift()
      this.index += match[0].length
      return true
    }
    return false
  }

  // 静态属性
  static font = null
  static size = null
  static color = null
  static effect = null
  static lineWidth = 0
  static charWidths = null
  static regexps = null
  static commands = null
  static commandCount = null
  static commandMaximum = null
  static drawingMethods = null
  static imported = []
  static importing = []

  // 标签正则表达式
  static regexps = {
    // 使用索引颜色: [1]:Index(0-15)
    colorIndex: /^<color:(\d|1[0-5])>$/i,
    // 使用指定颜色: [1]:R(00-ff), [2]:G(00-ff), [3]:B(00-ff), [4]:A(00-ff)(可选)
    color: /^<color:([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?>$/i,
    // 结束文字颜色
    colorRestore: /^<\/color>$/i,
    // 使用字体: [1]:字体族群
    font: /^<font:([\S ]+)>$/i,
    // 结束字体
    fontRestore: /^<\/font>$/i,
    // 使用斜体样式
    italic: /^<italic>$/i,
    // 结束斜体样式
    italicRestore: /^<\/italic>$/i,
    // 使用粗体字
    bold: /^<bold>$/i,
    // 结束粗体字
    boldRestore: /^<\/bold>$/i,
    // 使用字体大小: [1]:字体大小(10-400)
    fontSize: /^<size:([1-9]\d|[1-3]\d\d|400)>$/i,
    // 结束字体大小
    fontSizeRestore: /^<\/size>$/i,
    // 设置文字位置: [1]:坐标轴(x|y), [2]操作(add|undefined), [3]:数值(-1000-1000)
    textPosition: /^<(x|y):(?:(add),)?(-?(?:\d|[1-9]\d|[1-9]\d\d|1000))>$/i,
    // 使用阴影效果: [1]:水平偏移(-9-9), [2]:垂直偏移(-9-9), [3]:R(00-ff), [4]:G(00-ff), [5]:B(00-ff), [6]:A(00-ff)(可选)
    textShadow: /^<shadow:(0|-?[1-9]),(0|-?[1-9]),([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?>$/i,
    // 结束阴影效果
    textShadowRestore: /^<\/shadow>$/i,
    // 使用描边效果: [1]:描边宽度(1-20), [2]:R(00-ff), [3]:G(00-ff), [4]:B(00-ff), [5]:A(00-ff)(可选)
    textStroke: /^<stroke:([1-9]|1\d|20),([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?>$/i,
    // 结束描边效果
    textStrokeRestore: /^<\/stroke>$/i,
    // 使用轮廓效果: [1]:R(00-ff), [2]:G(00-ff), [3]:B(00-ff), [4]:A(00-ff)(可选)
    textOutline: /^<outline:([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?>$/i,
    // 结束轮廓效果
    textOutlineRestore: /^<\/outline>$/i,
  }

  // 初始化
  static initialize() {
    // 设置字符宽度数组
    this.charWidths = new Float64Array(
      GL.arrays[1].uint32.buffer, 0,
      GL.arrays[1].uint32.length / 2,
    )

    // 创建打印机指令列表
    this.commandCount = 0
    this.commandMaximum = 100
    this.commands = new Array(this.commandMaximum)

    // 设置绘制方法映射表
    this.drawingMethods = {
      none: 'drawText',
      shadow: 'drawTextWithShadow',
      stroke: 'drawTextWithStroke',
      outline: 'drawTextWithOutline',
    }

    // 侦听事件
    window.on('datachange', this.datachange)
  }

  // 加载默认设置
  static loadDefault() {
    // 设置默认上下文属性
    const {font} = Data.config
    this.font = font.default || 'sans-serif'
    this.size = 16
    this.color = INTRGBA('ffffffff')
    this.effect = {type: 'none'}

    // 导入字体
    const {imports} = font
    this.imported.signature = imports.join()
    return this.importFonts(imports)
  }

  // 导入字体
  static importFonts(imports) {
    const imported = this.imported
    const importing = this.importing
    const regexp = /([^/]+)\.\S+\.\S+$/
    const promises = []
    for (const guid of imports) {
      const path = File.getPath(guid)
      const name = path.match(regexp)?.[1]
      if (!name || imported.includes(name)) {
        continue
      }
      imported.push(name)
      importing.push(name)
      promises.push(File.get({
        path: path,
        type: 'arraybuffer',
      }).then(
        buffer => {
          new FontFace(name, buffer).load().then(
            font => {
              if (importing.remove(name)) {
                document.fonts.add(font)
                font.imported = true
              }
            },
            error => {
              importing.remove(name)
            },
          )
        },
        error => {
          importing.remove(name)
        },
      ))
    }
    return Promise.all(promises).then(() => {
      UI.updateElementFont()
    })
  }

  // 清除字体
  static clearFonts() {
    const fonts = document.fonts
    for (const font of fonts) {
      if (font.imported) {
        fonts.delete(font)
      }
    }
    this.imported.length = 0
    this.importing.length = 0
  }

  // 解析文字效果
  static parseEffect(effect) {
    const copy = Object.clone(effect)
    if (copy.color !== undefined) {
      copy.color = INTRGBA(copy.color)
    }
    return copy
  }

  // 获取打印机指令
  static fetchCommand() {
    const count = this.commandCount
    const command = this.commands[count]
    if (command !== undefined) {
      this.commandCount++
      return command
    } else {
      const command = {
        string: '',
        x: 0,
        y: 0,
        font: '',
        size: 0,
        color: 0,
        effect: null,
        paddingItalic: 0,
        paddingVertical: 0,
        horizontalWidth: 0,
        drawingMethod: '',
      }
      if (count < this.commandMaximum) {
        this.commands[count] = command
        this.commandCount++
      }
      return command
    }
  }

  // 重置打印机指令
  static resetCommands() {
    const commands = this.commands
    const count = this.commandCount
    for (let i = 0; i < count; i++) {
      const command = commands[i]
      command.string = ''
    }
    this.commandCount = 0
  }

  // 恢复打印机纹理
  static restoreTexture(base) {
    base.restoreNormalTexture()
    Promise.resolve().then(() => {
      const {content} = base.printer
      base.printer.reset()
      base.printer.draw(content)
    })
  }

  // 绘制文字
  static drawText(command, text) {
    const {x, y, font, size, color} = command
    const {paddingItalic, paddingVertical, horizontalWidth} = command
    const gl = GL
    const context = gl.context2d
    const padding = paddingVertical
    const left = Math.floor(x)
    const top = y - padding
    const ox = x - left
    const oy = padding + size * 0.85
    const height = size + padding * 2
    const width = Math.min(16384, Math.ceil(
      horizontalWidth + paddingItalic + ox
    ))
    context.resize(width, height)
    context.font = font
    context.fillStyle = '#ffffff'
    context.fillText(text, ox, oy)
    const texture = gl.stencilTexture.fromImage(context.canvas)
    const blend = gl.blend
    gl.blend = 'upper'
    gl.drawText(texture, left, top, width, height, color)
    gl.blend = blend
  }

  // 绘制带阴影的文字
  static drawTextWithShadow(command, text) {
    const {x, y, font, size, color, effect} = command
    const {paddingItalic, paddingVertical, horizontalWidth} = command
    const shadowOffsetX = effect.shadowOffsetX
    const shadowOffsetY = effect.shadowOffsetY
    const shadowColor = effect.color
    const gl = GL
    const context = gl.context2d
    const padding = paddingVertical
    const left = Math.floor(x)
    const top = y - padding
    const ox = x - left
    const oy = padding + size * 0.85
    const height = size + padding * 2
    const width = Math.min(16384, Math.ceil(
      horizontalWidth + paddingItalic + ox
    ))
    context.resize(width, height)
    context.font = font
    context.fillStyle = '#ffffff'
    context.fillText(text, ox, oy)
    const texture = gl.stencilTexture.fromImage(context.canvas)
    const blend = gl.blend
    gl.blend = 'lower'
    gl.drawText(texture, left + shadowOffsetX, top + shadowOffsetY, width, height, shadowColor)
    gl.blend = 'upper'
    gl.drawText(texture, left, top, width, height, color)
    gl.blend = blend
  }

  // 绘制描边的文字
  static drawTextWithStroke(command, text) {
    const {x, y, font, size, effect} = command
    const {paddingItalic, paddingVertical, horizontalWidth} = command
    const strokeColor = effect.color
    const strokeWidth = effect.strokeWidth
    const halfWidth = Math.ceil(strokeWidth / 2)
    const gl = GL
    const context = gl.context2d
    const padding = paddingVertical + halfWidth
    const left = Math.floor(x - halfWidth)
    const top = y - padding
    const ox = x - left
    const oy = padding + size * 0.85
    const height = size + padding * 2
    const width = Math.min(16384, Math.ceil(
      horizontalWidth + paddingItalic + halfWidth + ox
    ))
    context.resize(width, height)
    context.font = font
    context.lineWidth = strokeWidth
    context.strokeStyle = '#ffffff'
    context.strokeText(text, ox, oy)
    const texture = gl.stencilTexture.fromImage(context.canvas)
    const blend = gl.blend
    gl.blend = 'lower'
    gl.drawText(texture, left, top, width, height, strokeColor)
    gl.blend = blend

    // 绘制文字
    Printer.drawText(command, text)
  }

  // 绘制带轮廓线的文字
  static drawTextWithOutline(command, text) {
    const {x, y, font, size, color, effect} = command
    const {paddingItalic, paddingVertical, horizontalWidth} = command
    const outlineColor = effect.color
    const gl = GL
    const context = gl.context2d
    const padding = paddingVertical
    const left = Math.floor(x)
    const top = y - padding
    const ox = x - left
    const oy = padding + size * 0.85
    const height = size + padding * 2
    const width = Math.min(16384, Math.ceil(
      horizontalWidth + paddingItalic + ox
    ))
    context.resize(width, height)
    context.font = font
    context.fillStyle = '#ffffff'
    context.fillText(text, ox, oy)
    const texture = gl.stencilTexture.fromImage(context.canvas)
    const blend = gl.blend
    gl.blend = 'lower'
    gl.drawText(texture, left - 1, top, width, height, outlineColor)
    gl.drawText(texture, left + 1, top, width, height, outlineColor)
    gl.drawText(texture, left, top - 1, width, height, outlineColor)
    gl.drawText(texture, left, top + 1, width, height, outlineColor)
    gl.blend = 'upper'
    gl.drawText(texture, left, top, width, height, color)
    gl.blend = blend
  }

  // 数据改变事件
  static datachange(event) {
    if (event.key === 'config') {
      // 设置默认上下文属性
      const font = Data.config.font.default || 'sans-serif'
      if (Printer.font !== font) {
        Printer.font = font
        for (const context of Title.tabBar.data) {
          if (context.type === 'ui') {
            context.fontChanged = true
          }
        }
        UI.updateElementFont()
      }

      // 加载字体
      const {imports} = Data.config.font
      const signature = imports.join()
      if (Printer.imported.signature !== signature) {
        Printer.imported.signature = signature
        Printer.clearFonts()
        Printer.importFonts(imports)
      }
    }
  }
}