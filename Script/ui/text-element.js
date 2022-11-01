'use strict'

// ******************************** 文本元素 ********************************

class TextElement extends UI.Element {
  texture           //:object
  printer           //:object
  _direction        //:string
  _horizontalAlign  //:string
  _verticalAlign    //:string
  content           //:string
  _size             //:number
  _lineSpacing      //:number
  _letterSpacing    //:number
  _color            //:string
  _font             //:string
  style             //:string
  weight            //:string
  _typeface         //:string
  _effect           //:object
  wordWrap          //:boolean
  truncate          //:boolean
  _overflow         //:string
  textOuterX        //:number
  textOuterY        //:number
  textOuterWidth    //:number
  textOuterHeight   //:number
  blend             //:string

  constructor(data) {
    super(data)
    this.texture = null
    this.printer = null
    this.direction = data.direction
    this.horizontalAlign = data.horizontalAlign
    this.verticalAlign = data.verticalAlign
    this.content = data.content
    this.size = data.size
    this.lineSpacing = data.lineSpacing
    this.letterSpacing = data.letterSpacing
    this.color = data.color
    this.font = data.font
    this.style = null
    this.weight = null
    this.typeface = data.typeface
    this.effect = data.effect
    this.wordWrap = false
    this.truncate = false
    this.overflow = data.overflow
    this.textOuterX = 0
    this.textOuterY = 0
    this.textOuterWidth = 0
    this.textOuterHeight = 0
    this.blend = data.blend
  }

  // 读取方向
  get direction() {
    return this._direction
  }

  // 写入方向
  set direction(value) {
    if (this._direction !== value) {
      this._direction = value
      if (this.printer) {
        this.printer.reset()
        this.printer.direction = value
      }
    }
  }

  // 读取水平对齐
  get horizontalAlign() {
    return this._horizontalAlign
  }

  // 写入水平对齐
  set horizontalAlign(value) {
    if (this._horizontalAlign !== value) {
      switch (value) {
        case 'left':
        case 'center':
        case 'right':
          break
        default:
          return
      }
      this._horizontalAlign = value
      if (this.printer) {
        this.printer.reset()
        this.printer.horizontalAlign = value
      }
    }
  }

  // 读取垂直对齐
  get verticalAlign() {
    return this._verticalAlign
  }

  // 写入垂直对齐
  set verticalAlign(value) {
    if (this._verticalAlign !== value) {
      switch (value) {
        case 'top':
        case 'middle':
        case 'bottom':
          break
        default:
          return
      }
      this._verticalAlign = value
      if (this.printer) {
        this.printer.reset()
        this.printer.verticalAlign = value
      }
    }
  }

  // 读取字体大小
  get size() {
    return this._size
  }

  // 写入字体大小
  set size(value) {
    if (this._size !== value) {
      this._size = value
      if (this.printer) {
        this.printer.reset()
        this.printer.sizes[0] = value
      }
    }
  }

  // 读取行间距
  get lineSpacing() {
    return this._lineSpacing
  }

  // 写入行间距
  set lineSpacing(value) {
    if (this._lineSpacing !== value) {
      this._lineSpacing = value
      if (this.printer) {
        this.printer.reset()
        this.printer.lineSpacing = value
      }
    }
  }

  // 读取字间距
  get letterSpacing() {
    return this._letterSpacing
  }

  // 写入字间距
  set letterSpacing(value) {
    if (this._letterSpacing !== value) {
      this._letterSpacing = value
      if (this.printer) {
        this.printer.reset()
        this.printer.letterSpacing = value
      }
    }
  }

  // 读取颜色
  get color() {
    return this._color
  }

  // 写入颜色
  set color(value) {
    if (this._color !== value) {
      this._color = value
      if (this.printer) {
        this.printer.reset()
        this.printer.colors[0] = INTRGBA(value)
      }
    }
  }

  // 读取字体
  get font() {
    return this._font
  }

  // 写入字体
  set font(value) {
    if (this._font !== value) {
      this._font = value
      if (this.printer) {
        this.printer.reset()
        this.printer.fonts[0] = value || Printer.font
      }
    }
  }

  // 读取字型
  get typeface() {
    return this._typeface
  }

  // 写入字型
  set typeface(value) {
    if (this._typeface !== value) {
      switch (value) {
        case 'regular':
          this.style = 'normal'
          this.weight = 'normal'
          break
        case 'bold':
          this.style = 'normal'
          this.weight = 'bold'
          break
        case 'italic':
          this.style = 'italic'
          this.weight = 'normal'
          break
        case 'bold-italic':
          this.style = 'italic'
          this.weight = 'bold'
          break
        default:
          return
      }
      this._typeface = value
      if (this.printer) {
        this.printer.reset()
        this.printer.styles[0] = this.style
        this.printer.weights[0] = this.weight
      }
    }
  }

  // 读取文字效果
  get effect() {
    return this._effect
  }

  // 写入文字效果
  set effect(value) {
    this._effect = value
    if (this.printer) {
      this.printer.reset()
      this.printer.effects[0] = Printer.parseEffect(value)
    }
  }

  // 读取溢出模式
  get overflow() {
    return this._overflow
  }

  // 写入溢出模式
  set overflow(value) {
    if (this._overflow !== value) {
      this._overflow = value
      switch (value) {
        case 'visible':
          this.wordWrap = false
          this.truncate = false
          break
        case 'wrap':
          this.wordWrap = true
          this.truncate = false
          break
        case 'truncate':
          this.wordWrap = false
          this.truncate = true
          break
        case 'wrap-truncate':
          this.wordWrap = true
          this.truncate = true
          break
      }
      if (this.printer) {
        this.printer.reset()
        this.printer.wordWrap = this.wordWrap
        this.printer.truncate = this.truncate
      }
    }
  }

  // 更新文本
  update() {
    let printer = this.printer
    if (printer === null) {
      const texture = new Texture()
      printer = new Printer(texture)
      printer.direction = this.direction
      printer.horizontalAlign = this.horizontalAlign
      printer.verticalAlign = this.verticalAlign
      printer.sizes[0] = this.size
      printer.lineSpacing = this.lineSpacing
      printer.letterSpacing = this.letterSpacing
      printer.colors[0] = INTRGBA(this.color)
      printer.fonts[0] = this.font || Printer.font
      printer.styles[0] = this.style
      printer.weights[0] = this.weight
      printer.effects[0] = Printer.parseEffect(this.effect)
      printer.wordWrap = this.wordWrap
      printer.truncate = this.truncate
      this.texture = texture
      this.printer = printer
    }
    if (printer.content !== this.content ||
      printer.wordWrap && (printer.horizontal
      ? printer.printWidth !== this.width
      : printer.printHeight !== this.height) ||
      printer.truncate && (printer.horizontal
      ? printer.printHeight !== this.height
      : printer.printWidth !== this.width)) {
      if (printer.content) {
        printer.reset()
      }
      printer.printWidth = this.width
      printer.printHeight = this.height
      printer.draw(this.content)
      this.calculateTextPosition()
    }
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 更新文本
    this.update()

    // 绘制文本
    if (this.content) {
      GL.alpha = this.opacity
      GL.blend = this.blend
      GL.matrix.set(UI.matrix).multiply(this.matrix)
      GL.drawImage(this.texture, this.textOuterX, this.textOuterY, this.textOuterWidth, this.textOuterHeight)
    }

    // 绘制子元素
    this.drawChildren()
  }

  // 调整大小
  resize() {
    if (this.parent instanceof UI.Window) {
      return this.parent.requestResizing()
    }
    this.calculatePosition()
    this.calculateTextPosition()
    this.resizeChildren()
  }

  // 计算文本位置
  calculateTextPosition() {
    const printer = this.printer
    if (printer !== null) {
      const pl = printer.paddingLeft
      const pt = printer.paddingTop
      const pr = printer.paddingRight
      const pb = printer.paddingBottom
      const outerX = this.x - pl
      const outerY = this.y - pt
      const outerWidth = this.texture.width
      const outerHeight = this.texture.height
      const innerWidth = outerWidth - pl - pr
      const innerHeight = outerHeight - pt - pb
      const marginWidth = this.width - innerWidth
      const marginHeight = this.height - innerHeight
      const factorX = printer.alignmentFactorX
      const factorY = printer.alignmentFactorY
      const offsetX = marginWidth * factorX
      const offsetY = marginHeight * factorY
      this.textOuterX = outerX + offsetX
      this.textOuterY = outerY + offsetY
      this.textOuterWidth = outerWidth
      this.textOuterHeight = outerHeight
    }
  }

  // 销毁元素
  destroy() {
    this.texture?.destroy()
    this.destroyChildren()
    delete this.node.instance
  }
}

UI.Text = TextElement

export { TextElement }
