'use strict'

// ******************************** 文本框元素 ********************************

class TextBoxElement extends UI.Element {
  focusing              //:boolean
  texture               //:object
  _type                 //:string
  _align                //:string
  content               //:string
  text                  //:string
  maxLength             //:number
  number                //:number
  min                   //:number
  max                   //:number
  decimals              //:number
  _padding              //:number
  _size                 //:number
  _font                 //:string
  _color                //:string
  _colorInt             //:number
  textX                 //:number
  textY                 //:number
  textShiftY            //:number
  innerWidth            //:number
  innerHeight           //:number
  selectionY            //:number
  selectionWidth        //:number
  selectionHeight       //:number
  _selectionColor       //:string
  _selectionColorInt    //:number
  _selectionBgColor     //:string
  _selectionBgColorInt  //:number
  printer               //:object

  constructor(data) {
    super(data)
    this.focusing = false
    this.texture = null
    this.align = data.align
    this.text = data.text
    this.maxLength = data.maxLength
    this.number = data.number
    this.min = data.min
    this.max = data.max
    this.decimals = data.decimals
    this.type = data.type
    this.padding = data.padding
    this.size = data.size
    this.font = data.font
    this.color = data.color
    this.textX = null
    this.textY = null
    this.textShiftY = null
    this.innerWidth = null
    this.innerHeight = null
    this.selectionY = null
    this.selectionWidth = null
    this.selectionHeight = null
    this.selectionColor = data.selectionColor
    this.selectionBgColor = data.selectionBgColor
    this.printer = null
  }

  // 读取类型
  get type() {
    return this._type
  }

  // 写入类型
  set type(value) {
    if (this._type !== value) {
      this._type = value
      switch (value) {
        case 'text':
          this.content = this.text
          break
        case 'number':
          this.content = this.number.toString()
          break
      }
    }
  }

  // 读取对齐方式
  get align() {
    return this._align
  }

  // 写入对齐方式
  set align(value) {
    this._align = value
    if (this.connected) {
      this.calculateTextPosition()
    }
  }

  // 读取内边距
  get padding() {
    return this._padding
  }

  // 写入内边距
  set padding(value) {
    if (this._padding !== value) {
      this._padding = value
      if (this.connected) {
        this.calculateTextPosition()
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

  // 读取颜色
  get color() {
    return this._color
  }

  // 写入颜色
  set color(value) {
    if (this._color !== value) {
      this._color = value
      this._colorInt = INTRGBA(value)
    }
  }

  // 读取选中颜色
  get selectionColor() {
    return this._selectionColor
  }

  // 写入选中颜色
  set selectionColor(value) {
    if (this._selectionColor !== value) {
      this._selectionColor = value
      this._selectionColorInt = INTRGBA(value)
    }
  }

  // 读取选中背景颜色
  get selectionBgColor() {
    return this._selectionBgColor
  }

  // 写入选中背景颜色
  set selectionBgColor(value) {
    if (this._selectionBgColor !== value) {
      this._selectionBgColor = value
      this._selectionBgColorInt = INTRGBA(value)
    }
  }

  // 更新数据
  update() {
    // 打印文本
    let printer = this.printer
    if (printer === null) {
      const texture = new Texture()
      printer = new Printer(texture)
      printer.matchTag = Function.empty
      printer.sizes[0] = this.size
      printer.fonts[0] = this.font || Printer.font
      printer.colors[0] = 0xffffffff
      printer.effects[0] = {type: 'none'}
      this.texture = texture
      this.printer = printer
    }
    if (printer.content !== this.content) {
      if (printer.content) {
        printer.reset()
      }
      printer.draw(this.content)
      if (this.connected) {
        this.calculateTextPosition()
      }
    }
  }

  // 绘制图像
  draw() {
    if (this.visible === false) {
      return this.drawChildren()
    }

    // 更新数据
    this.update()

    // 设置上下文属性
    GL.alpha = this.opacity
    GL.blend = 'normal'
    GL.matrix.set(UI.matrix).multiply(this.matrix)

    // 绘制文字纹理
    const texture = this.texture
    if (texture !== null) {
      const base = texture.base
      if (UI.hover === this.node) {
        // 绘制选中背景
        const dx = this.textX
        const dy = this.selectionY
        const dw = this.selectionWidth
        const dh = this.selectionHeight
        GL.fillRect(dx, dy, dw, dh, this._selectionBgColorInt)
        // 绘制普通文本
        const sy = this.textShiftY
        const sw = Math.min(base.width, this.innerWidth)
        const sh = this.innerHeight
        GL.drawText(texture.clip(0, sy, sw, sh), this.textX, this.textY, texture.width, texture.height, this._selectionColorInt)
      } else {
        // 绘制普通文本
        if (this.content) {
          const sy = this.textShiftY
          const sw = Math.min(base.width, this.innerWidth)
          const sh = this.innerHeight
          GL.drawText(texture.clip(0, sy, sw, sh), this.textX, this.textY, texture.width, texture.height, this._colorInt)
        }
      }
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
    if (this.texture) {
      const printer = this.printer
      const size = printer.sizes[0]
      const vpadding = (this.height - size) / 2
      const paddingTop = printer.paddingTop
      const base = this.texture.base
      this.textX = this.x + this.padding
      this.textY = this.y + Math.max(vpadding - paddingTop, 0)
      this.textShiftY = Math.max(paddingTop - vpadding, 0)
      this.innerWidth = Math.max(this.width - this.padding * 2, 0)
      this.innerHeight = Math.min(this.height + this.y - this.textY, base.height)
      this.selectionY = this.y + Math.max(vpadding, 0)
      this.selectionWidth = Math.min(this.innerWidth, printer.width)
      this.selectionHeight = Math.min(this.height, size)
      switch (this.align) {
        case 'center':
          if (base.width < this.innerWidth) {
            this.textX += (this.innerWidth - base.width) / 2
          }
          break
        case 'right':
          if (base.width < this.innerWidth) {
            this.textX += this.innerWidth - base.width + 1
          }
          break
      }
      // 绘制文本时像素对齐
      const scaleX = Math.max(this.transform.scaleX, 1)
      const scaleY = Math.max(this.transform.scaleY, 1)
      this.textX = Math.round(this.textX * scaleX) / scaleX
      this.textY = Math.round(this.textY * scaleY) / scaleY
    }
  }

  // 销毁元素
  destroy() {
    this.texture?.destroy()
    this.destroyChildren()
    delete this.node.instance
  }
}

UI.TextBox = TextBoxElement

export { TextBoxElement }
