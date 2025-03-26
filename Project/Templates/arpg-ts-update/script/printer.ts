/** ******************************** 文字打印机 ******************************** */

class Printer {
  /** 打印机纹理 */
  public texture: Texture
  /** 图像列表 */
  public images: PrinterImageList
  /** 用来绘制文字的2D画布 */
  public canvas: HTMLCanvasElement
  /** 用来绘制文字的2D图形上下文 */
  public context: PrinterRenderingContext
  /** 打印的全部文本内容 */
  public content: string
  /** 打印的文本缓冲 */
  public buffer: string
  /** 当前打印位置X */
  public x: number
  /** 当前打印位置Y */
  public y: number
  /** 当前打印区域宽度 */
  public width: number
  /** 当前打印区域高度 */
  public height: number
  /** 当前打印的字符索引 */
  public index: number
  /** 换行包装的结束位置 */
  public wrapEnd: number
  /** 打印指令列表 */
  public commands: Array<PrinterCommand>
  /** 纹理边距(左) */
  public paddingLeft: number
  /** 纹理边距(上) */
  public paddingTop: number
  /** 纹理边距(右) */
  public paddingRight: number
  /** 纹理边距(下) */
  public paddingBottom: number
  /** 当前打印文本行的行高 */
  public lineHeight: number
  /** 当前打印文本行的行间距 */
  public lineSpacing: number
  /** 字间距 */
  public letterSpacing: number
  /** 是否可以换行 */
  public breakable: boolean
  /** 是否水平方向打印 */
  public horizontal: boolean
  /** 水平对齐系数 */
  public alignmentFactorX: number
  /** 垂直对齐系数 */
  public alignmentFactorY: number
  /** 是否自动换行 */
  public wordWrap: boolean
  /** 是否对溢出的文字进行截断 */
  public truncate: boolean
  /** 打印区域宽度 */
  public printWidth: number
  /** 打印区域高度 */
  public printHeight: number
  /** 打印字体列表 */
  public fonts: Array<string>
  /** 打印样式列表 */
  public styles: Array<string>
  /** 打印粗细列表 */
  public weights: Array<string>
  /** 打印字体大小列表 */
  public sizes: Array<number>
  /** 打印文字颜色列表 */
  public colors: Array<string>
  /** 打印文字效果列表 */
  public effects: Array<TextEffect>
  /** 文本方向 */
  private _direction: string = ''
  /** 水平对齐方式 */
  private _horizontalAlign: string = ''
  /** 垂直对齐方式 */
  private _verticalAlign: string = ''

  /**
   * 文字打印机对象
   * @param texture 打印机纹理
   */
  constructor(texture: Texture) {
    this.texture = texture
    this.images = new PrinterImageList()
    this.canvas = document.createElement('canvas')
    this.canvas.width = 0
    this.canvas.height = 0
    this.context = this.canvas.getContext('2d') as PrinterRenderingContext
    this.content = ''
    this.buffer = ''
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
    this.index = 0
    this.wrapEnd = 0
    this.commands = []
    this.paddingLeft = 0
    this.paddingTop = 0
    this.paddingRight = 0
    this.paddingBottom = 0
    this.lineHeight = 0
    this.lineSpacing = 0
    this.letterSpacing = 0
    this.breakable = false
    this.horizontal = true
    this.alignmentFactorX = 0
    this.alignmentFactorY = 0
    this.direction = 'horizontal-tb'
    this.horizontalAlign = 'left'
    this.verticalAlign = 'top'
    this.wordWrap = false
    this.truncate = false
    this.printWidth = Infinity
    this.printHeight = Infinity
    this.fonts = [Printer.font]
    this.styles = ['normal']
    this.weights = ['normal']
    this.sizes = [Printer.size]
    this.colors = [Printer.color]
    this.effects = [Printer.effect]
  }

  /** 文字打印方向 */
  public get direction(): string {
    return this._direction
  }
  public set direction(value: string) {
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

  /** 水平对齐模式 */
  public get horizontalAlign(): string {
    return this._horizontalAlign
  }
  public set horizontalAlign(value: string) {
    this._horizontalAlign = value
    // 更新水平对齐系数
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

  /** 垂直对齐模式 */
  public get verticalAlign(): string {
    return this._verticalAlign
  }
  public set verticalAlign(value: string) {
    this._verticalAlign = value
    // 更新垂直对齐系数
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

  /**
   * 重置打印机上下文
   * @returns 当前打印机
   */
  public reset(): this {
    this.destroy()
    this.content = ''
    this.x = 0
    this.y = 0
    this.width = 0
    this.height = 0
    this.index = 0
    this.wrapEnd = 0
    this.lineHeight = 0
    this.breakable = false
    const {fonts, styles, weights, sizes, colors, effects} = this
    if (fonts.length !== 1) this.fonts = [fonts[fonts.length - 1]]
    if (styles.length !== 1) this.styles = [styles[styles.length - 1]]
    if (weights.length !== 1) this.weights = [weights[weights.length - 1]]
    if (sizes.length !== 1) this.sizes = [sizes[sizes.length - 1]]
    if (colors.length !== 1) this.colors = [colors[colors.length - 1]]
    if (effects.length !== 1) this.effects = [effects[effects.length - 1]]
    return this
  }

  /** 销毁 */
  public destroy(): void {
    if (this.images.length !== 0) {
      for (const imageElement of this.images) {
        imageElement.destroy()
      }
      this.images.length = 0
      this.images.changed = true
    }
  }

  /**
   * 获取原生的水平位置
   * @returns 未经缩放的X
   */
  public getRawX(): number {
    return this.x / Printer.scale
  }

  /**
   * 获取原生的垂直位置
   * @returns 未经缩放的Y
   */
  public getRawY(): number {
    return this.y / Printer.scale
  }

  /**
   * 获取缩放后的字体大小
   * @returns 缩放后的字体大小
   */
  public getScaledSize(): number {
    return this.sizes[0] * Printer.scale * Printer.sizeScale
  }

  /**
   * 获取缩放后的行间距
   * @returns 缩放后的行间距
   */
  public getScaledLineSpacing(): number {
    return this.lineSpacing * Printer.scale
  }

  /**
   * 获取缩放后的字间距
   * @returns 缩放后的字间距
   */
  public getScaledLetterSpacing(): number {
    return this.letterSpacing * Printer.scale
  }

  /**
   * 获取缩放后的打印宽度
   * @returns 缩放后的打印宽度
   */
  public getScaledPrintWidth(): number {
    return this.printWidth * Printer.scale
  }

  /**
   * 获取缩放后的打印高度
   * @returns 缩放后的打印高度
   */
  public getScaledPrintHeight(): number {
    return this.printHeight * Printer.scale
  }

  /**
   * 设置打印区域
   * @param width 矩形宽度
   * @param height 矩形高度
   */
  public setPrintArea(width: number, height: number): void {
    this.printWidth = width
    this.printHeight = height
  }

  /**
   * 设置边距
   * @param pl 左边距
   * @param pt 上边距
   * @param pr 右边距
   * @param pb 下边距
   */
  public setPadding(pl: number, pt: number, pr: number, pb: number): void {
    this.paddingLeft = pl
    this.paddingTop = pt
    this.paddingRight = pr
    this.paddingBottom = pb
  }

  /** 更新打印机字体 */
  public updateFont(): void {
    const style = this.styles[0]
    const weight = this.weights[0]
    const size = this.getScaledSize()
    const family = this.fonts.join(', ')
    const context = this.context
    // 设置canvas2d上下文的字体，斜体字内边距，垂直内边距(一些字体可能垂直溢出)
    context.font = `${style} normal ${weight} ${size}px ${family}`
    context.paddingItalic = style === 'italic' ? Math.ceil(size / 4) : 0
    context.paddingVertical = Math.ceil(size / 5)
    context.size = size
  }

  /** 计算纹理内边距 */
  public calculatePadding(): void {
    const context = this.context
    const effect = this.effects[0]
    const {paddingItalic} = context
    const {paddingVertical} = context
    switch (effect.type) {
      case 'none':
        // 文字效果：无，负数x/y将会增加左/上的内边距
        this.paddingLeft = Math.max(paddingItalic / 4 - this.x, this.paddingLeft)
        this.paddingTop = Math.max(paddingVertical - this.y, this.paddingTop)
        this.paddingRight = Math.max(paddingItalic, this.paddingRight)
        this.paddingBottom = Math.max(paddingVertical, this.paddingBottom)
        break
      case 'shadow': {
        // 文字效果：阴影，根据阴影偏移方向来增加内边距
        const shadowOffsetX = effect.shadowOffsetX * Printer.scale
        const shadowOffsetY = effect.shadowOffsetY * Printer.scale
        const shadowOffsetLeft = Math.max(-shadowOffsetX, 0)
        const shadowOffsetTop = Math.max(-shadowOffsetY, 0)
        const shadowOffsetRight = Math.max(shadowOffsetX, 0)
        const shadowOffsetBottom = Math.max(shadowOffsetY, 0)
        this.paddingLeft = Math.max(shadowOffsetLeft + paddingItalic / 4 - this.x, this.paddingLeft)
        this.paddingTop = Math.max(shadowOffsetTop + paddingVertical - this.y, this.paddingTop)
        this.paddingRight = Math.max(shadowOffsetRight + paddingItalic, this.paddingRight)
        this.paddingBottom = Math.max(shadowOffsetBottom + paddingVertical, this.paddingBottom)
        break
      }
      case 'stroke': {
        // 文字效果：描边，上下左右增加描边宽度一半的内边距
        const halfWidth = Math.ceil(effect.strokeWidth / 2) * Printer.scale
        this.paddingLeft = Math.max(halfWidth + paddingItalic / 4 - this.x, this.paddingLeft)
        this.paddingTop = Math.max(halfWidth + paddingVertical - this.y, this.paddingTop)
        this.paddingRight = Math.max(halfWidth + paddingItalic, this.paddingRight)
        this.paddingBottom = Math.max(halfWidth + paddingVertical, this.paddingBottom)
        break
      }
      case 'outline': {
        // 文字效果：轮廓，上下左右增加1px的内边距
        const offset = Printer.scale
        this.paddingLeft = Math.max(offset + paddingItalic / 4 - this.x, this.paddingLeft)
        this.paddingTop = Math.max(offset + paddingVertical - this.y, this.paddingTop)
        this.paddingRight = Math.max(offset + paddingItalic, this.paddingRight)
        this.paddingBottom = Math.max(offset + paddingVertical, this.paddingBottom)
        break
      }
    }
  }

  /**
   * 测量字符串的像素宽度
   * @param text 目标字符串
   * @returns 字符串的像素宽度
   */
  public measureWidth(text: string): number {
    if (this.horizontal) {
      // 水平方向的文本返回字符串宽度
      return this.context.measureText(text).width
    } else {
      // 垂直方向的文本返回字符串长度 * 字体大小
      return this.getScaledSize() * text.length
    }
  }

  /**
   * 测量字符串的像素高度
   * @param text 目标字符串
   * @returns 字符串的像素高度
   */
  public measureHeight(text: string): number {
    if (this.horizontal) {
      // 水平方向返回字体大小
      return this.getScaledSize()
    } else {
      // 垂直方向返回最大的字符宽度
      let height = 0
      const context = this.context
      const length = text.length
      for (let i = 0; i < length; i++) {
        height = Math.max(height,
          context.measureText(text[i]).width,
        )
      }
      return height
    }
  }

  /** 绘制缓冲字符串 */
  public drawBuffer(): void {
    const string = this.buffer

    // 如果缓冲字符串为空，返回
    if (string === '') return

    // 计算内边距
    this.calculatePadding()

    // 设置绘制指令
    const context = this.context
    const color = this.colors[0]
    const effect = this.effects[0]
    const horizontal = this.horizontal
    let measureWidth = Printer.lineWidth
    if (measureWidth === 0) {
      // 如果不存在字间距和强制换行
      // 则不会提前测量出字符串宽度
      measureWidth = this.measureWidth(string)
    }
    const measureHeight = this.measureHeight(string)
    const commands = this.commands
    const command = Printer.fetchCommand()
    // 设置打印机指令
    commands.push(command)
    command.string = string
    command.x = this.x
    command.y = this.y
    command.font = context.font
    command.size = context.size
    command.color = color
    command.effect = effect
    command.horizontalWidth = horizontal ? measureWidth : measureHeight
    command.drawingMethod = Printer[Printer.drawingMethods[effect.type]]

    // 重置行宽
    Printer.lineWidth = 0

    // 重置属性(通用)
    this.buffer = ''
    this.breakable = true
    // 根据不同的文本方向，计算下一个位置、行高、文本区域宽度、文本区域高度
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

  /**
   * 加载图像
   * @param guid 图像GUID
   * @param clip 图像裁剪区域
   * @param width 图像显示宽度
   * @param height 图像显示高度
   */
  public loadImage(guid: string, clip: ImageClip | null, width: number, height: number): void {
    // 排除无效图像宽高
    if (width * height === 0) return

    // 换行模式：宽度溢出时强制换行(但至少绘制一个字符)
    const horizontal = this.horizontal
    const imageWidth = width * Printer.scale
    const imageHeight = height * Printer.scale
    const letterSpacing = this.getScaledLetterSpacing()
    if (this.wordWrap && this.breakable && (horizontal
    ? this.x + Printer.lineWidth + imageWidth > this.getScaledPrintWidth()
    : this.y + Printer.lineWidth + imageHeight > this.getScaledPrintHeight())) {
      this.newLine()
    }

    // 创建图像元素
    const imageElement = new ImageElement() as PrinterImageElement
    imageElement.startX = this.getRawX()
    imageElement.startY = this.getRawY()
    imageElement.image = guid
    imageElement.set({
      x: imageElement.startX,
      y: imageElement.startY,
      width: width,
      height: height,
    })
    if (clip) {
      imageElement.display = 'clip'
      Array.fill(imageElement.clip, clip)
    }
    this.images.push(imageElement)
    this.images.changed = true

    // 设置打印机指令
    const commands = this.commands
    const command = Printer.fetchCommand()
    commands.push(command)
    command.x = this.x
    command.y = this.y
    command.image = imageElement
    command.imageWidth = imageWidth
    command.imageHeight = imageHeight
    command.imageSpacing = (horizontal ? imageWidth : imageHeight) + letterSpacing
    command.drawingMethod = Function.empty

    // 重置属性(通用)
    this.breakable = true
    // 根据不同的文本方向，计算下一个位置、行高、文本区域宽度、文本区域高度
    if (horizontal) {
      this.x += imageWidth + letterSpacing
      this.lineHeight = Math.max(this.lineHeight, imageHeight)
      this.width = Math.max(this.width, this.x)
      this.height = Math.max(this.height, this.y + this.lineHeight)
    } else {
      this.y += imageHeight + letterSpacing
      this.lineHeight = Math.max(this.lineHeight, imageWidth)
      this.width = Math.max(this.width, this.x + this.lineHeight)
      this.height = Math.max(this.height, this.y)
    }
  }

  /** 计算文本位置 */
  private calculateTextPosition(): void {
    switch (this.direction) {
      case 'horizontal-tb':
      case 'vertical-lr':
        break
      case 'vertical-rl': {
        // 文本方向：垂直(从右到左)
        // 以下算法将文本排版(左右)翻转成(右左)
        const commands = this.commands
        const length = commands.length
        // 设置初始x为最右端位置
        let x = this.width
        let index = 0
        let lineX = Infinity
        let lineHeight = 0
        // 遍历所有打印机指令
        for (let i = 0; i < length; i++) {
          const command = commands[i]
          // 当文本的水平位置发生变化(换行)
          if (lineX !== command.x) {
            while (index < i) {
              // 上一行文本的位置 = 右侧位置 - 行高
              const command = commands[index++]
              command.x = x - lineHeight
              if (command.image) {
                command.image.startX = command.x / Printer.scale
                command.image.transform.x = command.image.startX
              }
            }
            if (lineX !== undefined) {
              // 右侧位置减去行高和行间距
              x -= command.x - lineX
            }
            // 设置上一次文本行X
            lineX = command.x
            lineHeight = 0
          }
          // 获取最大的水平宽度作为行高
          lineHeight = Math.max(lineHeight, command.horizontalWidth, command.imageWidth)
        }
        while (index < length) {
          // 最后一行文本的位置 = 右侧位置 - 行高
          const command = commands[index++]
          command.x = x - lineHeight
          if (command.image) {
            command.image.startX = command.x / Printer.scale
            command.image.transform.x = command.image.startX
          }
        }
        break
      }
    }
    if (this.horizontal) {
      // 对水平方向的文本进行水平对齐(不考虑垂直对齐)
      const factor = this.alignmentFactorX
      if (factor !== 0) {
        const commands = this.commands
        const letterSpacing = this.getScaledLetterSpacing()
        // 打印机文本区域宽度已经减去字间距调整过，加回去
        const lineWidth = this.width + letterSpacing
        let lineX = 0
        let lineY = Infinity
        // 逆序遍历打印机指令
        for (let i = commands.length - 1; i >= 0; i--) {
          const command = commands[i]
          // 当文本的垂直位置发生变化时(换行)
          // 计算当前行的水平偏移距离
          if (lineY !== command.y) {
            lineY = command.y
            lineX = factor * (
              lineWidth
            - command.x
            - command.imageSpacing
            - command.horizontalWidth
            )
          }
          command.x += lineX
          if (command.image) {
            command.image.startX += lineX / Printer.scale
            command.image.transform.x = command.image.startX
          }
        }
      }
    } else {
      // 对垂直方向的文本进行垂直对齐(不考虑水平对齐)
      const factor = this.alignmentFactorY
      if (factor !== 0) {
        const commands = this.commands
        const letterSpacing = this.getScaledLetterSpacing()
        // 打印机文本区域高度已经减去字间距调整过，加回去
        const lineWidth = this.height + letterSpacing
        let lineX = Infinity
        let lineY = 0
        // 逆序遍历打印机指令
        for (let i = commands.length - 1; i >= 0; i--) {
          const command = commands[i]
          // 当文本的水平位置发生变化时(换行)
          // 计算当前行的垂直偏移距离
          if (lineX !== command.x) {
            lineX = command.x
            lineY = factor * (
              lineWidth
            - command.y
            - command.imageSpacing
            - command.string.length
            * (command.size + letterSpacing)
            )
          }
          command.y += lineY
          if (command.image) {
            command.image.startY += lineY / Printer.scale
            command.image.transform.y = command.image.startY
          }
        }
      }
    }
  }

  /** 执行绘制指令 */
  public executeCommands(): void {
    const context = this.context
    const commands = this.commands
    const length = commands.length
    const horizontal = this.horizontal
    const paddingLeft = this.paddingLeft
    const paddingTop = this.paddingTop
    const letterSpacing = this.getScaledLetterSpacing()
    const charWidths = Printer.charWidths
    let charIndex = 0
    for (let i = 0; i < length; i++) {
      const command = commands[i]
      const string = command.string
      const drawingMethod = command.drawingMethod
      // 调整打印机指令的打印位置
      command.x += paddingLeft
      command.y += paddingTop
      if (horizontal) {
        // 打印水平方向的文字
        if (letterSpacing !== 0) {
          // 如果设置了字间距，逐个打印字符
          const length = string.length
          for (let i = 0; i < length; i++) {
            const charWidth = charWidths[charIndex++]
            drawingMethod(context, command, string[i])
            command.x += charWidth + letterSpacing
          }
        } else {
          // 如果没有设置字间距，一次性打印字符串
          drawingMethod(context, command, string)
        }
      } else {
        // 打印垂直方向的文字，逐个打印字符
        const size = command.size
        const length = string.length
        for (let i = 0; i < length; i++) {
          drawingMethod(context, command, string[i])
          command.y += size + letterSpacing
        }
      }
    }
    this.commands.length = 0
    this.texture.loadImage(this.canvas)

    // 重置指令池
    Printer.resetCommands()
  }

  /**
   * 检查包裹文本是否溢出
   * @returns 文本是否溢出
   */
  public isWrapOverflowing(): boolean {
    const {content} = this
    const {length} = content
    let string = ''
    let wrapEnd = length
    outer: for (let i = this.index; i < length; i++) {
      const char = content[i]
      switch (char) {
        case ' ': case '-': case '\n': case '<':
          // 跳过重复的字符
          while (++i < length && content[i] === char) {}
          wrapEnd = i
          break outer
      }
      string += char
    }
    this.wrapEnd = wrapEnd
    return string === ''
    ? false
    : this.horizontal
    ? this.x + Printer.lineWidth + this.measureWidth(string) > this.getScaledPrintWidth()
    : this.y + Printer.lineWidth + this.measureWidth(string) > this.getScaledPrintHeight()
  }

  /** 换行 */
  public newLine(): void {
    // 禁止头部换行和连续换行
    if (this.breakable) {
      this.breakable = false
      if (this.horizontal) {
        // 水平方向换行，垂直位置加上行高和行间距，重置水平位置、行高
        this.x = 0
        this.y += (this.lineHeight || this.getScaledSize()) + this.getScaledLineSpacing()
        this.lineHeight = 0
      } else {
        // 垂直方向换行，水平位置加上行高和行间距，重置垂直位置、行高
        this.x += (this.lineHeight || this.getScaledSize()) + this.getScaledLineSpacing()
        this.y = 0
        this.lineHeight = 0
      }
    }
  }

  /**
   * 绘制文本
   * @param content 文本内容
   */
  public draw(content: string): void {
    // 设置内容和重置索引
    this.content = content
    this.index = 0
    this.wrapEnd = 0

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
    const printWidth = this.getScaledPrintWidth()
    const printHeight = this.getScaledPrintHeight()
    const letterSpacing = this.getScaledLetterSpacing()
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

      // 包裹文本溢出
      if (wordWrap && Printer.wordWrap === 'keep' && this.index >= this.wrapEnd && this.isWrapOverflowing()) {
        this.drawBuffer()
        this.newLine()
        continue
      }

      // 截断模式：高度溢出时跳出循环
      if (truncate && (horizontal
      ? this.y + Math.max(this.lineHeight, this.measureHeight(char)) > printHeight
      : this.x + Math.max(this.lineHeight, this.measureHeight(char)) > printWidth)) {
        this.drawBuffer()
        break
      }

      // 换行模式：宽度溢出时强制换行(但至少绘制一个字符)
      if (wordWrap && (horizontal
      ? this.x + Printer.lineWidth + (charWidth = this.measureWidth(char)) > printWidth
      : this.y + Printer.lineWidth + (charWidth = this.measureWidth(char)) > printHeight) && (
        this.breakable || this.buffer.length !== 0)) {
        this.drawBuffer()
        this.newLine()
        continue
      }

      // 如果设置了字间距
      if (letterSpacing !== 0) {
        if (wordWrap === false) {
          charWidth = this.measureWidth(char)
        }
        // 记录字符宽度
        charWidths[charIndex++] = charWidth
        // 加上字间距
        Printer.lineWidth += letterSpacing
      }
      // 加上字符宽度(存在字间距或换行模式才会计算字符宽度)
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
    // 调整打印机纹理大小，限制尺寸(超过会报错)
    const width = Math.min(Math.ceil(this.width + this.paddingLeft + this.paddingRight), GL.maxTexSize)
    const height = Math.min(Math.ceil(this.height + this.paddingTop + this.paddingBottom), GL.maxTexSize)
    this.context.resize(width, height)

    // 计算文本位置
    this.calculateTextPosition()

    // 执行打印机指令进行绘制
    this.executeCommands()
  }

  /**
   * 匹配富文本标签
   * @returns 是否成功匹配标签
   */
  public matchTag(): boolean {
    const regexps = Printer.regexps
    const startIndex = this.index
    const endIndex = this.content.indexOf('>', startIndex + 1) + 1
    const string = this.content.slice(startIndex, endIndex)
    let match
    // 使用索引颜色
    if (match = string.match(regexps.colorIndex)) {
      const index = parseInt(match[1])
      const hex = Data.config.indexedColors[index].code
      const color = Color.parseCSSColor(hex)
      this.drawBuffer()
      this.colors.unshift(color)
      this.index += match[0].length
      return true
    }
    // 使用指定颜色
    if (match = string.match(regexps.color)) {
      const hex = match[1] + match[2] + match[3] + (match[4] ?? 'ff')
      const color = Color.parseCSSColor(hex)
      this.drawBuffer()
      this.colors.unshift(color)
      this.index += match[0].length
      return true
    }
    // 结束文字颜色
    if ((match = string.match(regexps.colorRestore)) && this.colors.length > 1) {
      this.drawBuffer()
      this.colors.shift()
      this.index += match[0].length
      return true
    }
    // 使用字体
    if (match = string.match(regexps.font)) {
      const font = `${match[1]}${match[2] ? `, ${match[2]}` : ''}`
      this.drawBuffer()
      this.fonts.unshift(font)
      this.updateFont()
      this.index += match[0].length
      return true
    }
    // 结束字体
    if ((match = string.match(regexps.fontRestore)) && this.fonts.length > 1) {
      this.drawBuffer()
      this.fonts.shift()
      this.updateFont()
      this.index += match[0].length
      return true
    }
    // 使用斜体样式
    if (match = string.match(regexps.italic)) {
      this.drawBuffer()
      this.styles.unshift('italic')
      this.updateFont()
      this.index += match[0].length
      return true
    }
    // 结束斜体样式
    if ((match = string.match(regexps.italicRestore)) && this.styles.length > 1) {
      this.drawBuffer()
      this.styles.shift()
      this.updateFont()
      this.index += match[0].length
      return true
    }
    // 使用粗体字
    if (match = string.match(regexps.bold)) {
      this.drawBuffer()
      this.weights.unshift('bold')
      this.updateFont()
      this.index += match[0].length
      return true
    }
    // 结束粗体字
    if ((match = string.match(regexps.boldRestore)) && this.weights.length > 1) {
      this.drawBuffer()
      this.weights.shift()
      this.updateFont()
      this.index += match[0].length
      return true
    }
    // 使用字体大小
    if (match = string.match(regexps.fontSize)) {
      const size = parseInt(match[1])
      this.drawBuffer()
      this.sizes.unshift(size)
      this.updateFont()
      this.index += match[0].length
      return true
    }
    // 结束字体大小
    if ((match = string.match(regexps.fontSizeRestore)) && this.sizes.length > 1) {
      this.drawBuffer()
      this.sizes.shift()
      this.updateFont()
      this.index += match[0].length
      return true
    }
    // 设置文字位置
    if (match = string.match(regexps.textPosition)) {
      const axis = match[1].toLowerCase() as 'x' | 'y'
      const operation = match[2] || 'set'
      const value = parseInt(match[3])
      this.drawBuffer()
      const position = (
        operation === 'set' ? value
      : operation === 'add' ? this[axis] + value
      : 0
      )
      this[axis] = Math.max(position, 0)
      this.index += match[0].length
      return true
    }
    // 使用阴影效果
    if (match = string.match(regexps.textShadow)) {
      const r = parseInt(match[3], 16)
      const g = parseInt(match[4], 16)
      const b = parseInt(match[5], 16)
      const a = parseInt(match[6] || 'ff', 16)
      const effect: TextEffectShadow = {
        type: 'shadow',
        shadowOffsetX: parseInt(match[1]),
        shadowOffsetY: parseInt(match[2]),
        color: `rgba(${r}, ${g}, ${b}, ${a})`,
      }
      this.drawBuffer()
      this.effects.unshift(effect)
      this.index += match[0].length
      return true
    }
    // 结束阴影效果
    if ((match = string.match(regexps.textShadowRestore)) && this.effects.length > 1 && this.effects[0].type === 'shadow') {
      this.drawBuffer()
      this.effects.shift()
      this.index += match[0].length
      return true
    }
    // 使用描边效果
    if (match = string.match(regexps.textStroke)) {
      const r = parseInt(match[2], 16)
      const g = parseInt(match[3], 16)
      const b = parseInt(match[4], 16)
      const a = parseInt(match[5] || 'ff', 16)
      const effect: TextEffectStroke = {
        type: 'stroke',
        strokeWidth: parseInt(match[1]),
        color: `rgba(${r}, ${g}, ${b}, ${a})`,
      }
      this.drawBuffer()
      this.effects.unshift(effect)
      this.index += match[0].length
      return true
    }
    // 结束描边效果
    if ((match = string.match(regexps.textStrokeRestore)) && this.effects.length > 1 && this.effects[0].type === 'stroke') {
      this.drawBuffer()
      this.effects.shift()
      this.index += match[0].length
      return true
    }
    // 使用轮廓效果
    if (match = string.match(regexps.textOutline)) {
      const r = parseInt(match[1], 16)
      const g = parseInt(match[2], 16)
      const b = parseInt(match[3], 16)
      const a = parseInt(match[4] || 'ff', 16)
      const effect: TextEffectOutline = {
        type: 'outline',
        color: `rgba(${r}, ${g}, ${b}, ${a})`,
      }
      this.drawBuffer()
      this.effects.unshift(effect)
      this.index += match[0].length
      return true
    }
    // 结束轮廓效果
    if ((match = string.match(regexps.textOutlineRestore)) && this.effects.length > 1 && this.effects[0].type === 'outline') {
      this.drawBuffer()
      this.effects.shift()
      this.index += match[0].length
      return true
    }
    // 使用指定图像
    if (match = string.match(regexps.image)) {
      const guid = match[1]
      let clip: ImageClip | null = null
      let width = 0
      let height = 0
      if (!match[2]) {
        // 存在1个参数
        width = this.sizes[0]
        height = this.sizes[0]
      } else if (!match[4]) {
        // 存在3个参数
        width = parseInt(match[2])
        height = parseInt(match[3])
      } else {
        // 存在5-7个参数
        clip = [
          parseInt(match[2]),
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5]),
        ]
        width = parseInt(match[6] ?? this.sizes[0])
        height = parseInt(match[7] ?? this.sizes[0])
      }
      this.drawBuffer()
      this.loadImage(guid, clip, width, height)
      this.index += match[0].length
      return true
    }
    return false
  }

  /** 纹理缩放系数 */
  public static scale: number = 1
  /** 字号缩放系数 */
  public static sizeScale: number = 1
  /** 本地化语言包字体 */
  public static languageFont: string
  /** 默认字体 */
  public static font: string
  /** 默认文字大小 */
  public static size: number
  /** 默认文字颜色 */
  public static color: string
  /** 默认文字效果 */
  public static effect: TextEffect
  /** 自动换行规则 */
  public static wordWrap: WordWrap = 'break'
  /** 开启高清渲染 */
  public static highDefinition: boolean
  /** 打印时累计行宽 */
  public static lineWidth: number = 0
  /** 字符宽度列表 */
  public static charWidths: Float64Array
  /** 打印机指令列表(公共) */
  public static commands: Array<PrinterCommand>
  /** 打印机指令计数 */
  public static commandCount: number = 0
  /** 打印机指令最大数量 */
  public static commandMaximum: number = 100
  /** 文字绘制方法映射表 */
  private static drawingMethods: PrinterDrawingMethods = {
    none: 'drawText',
    shadow: 'drawTextWithShadow',
    stroke: 'drawTextWithStroke',
    outline: 'drawTextWithOutline',
  }
  /** {ID:已加载字体}映射表 */
  public static fontFaces: HashMap<FontFace> = {}
  /** 已导入的字体名称列表 */
  public static imported: Array<string> = []
  /** 正在导入的字体名称列表 */
  public static importing: Array<string> = []

  /** 标签正则表达式 */
  public static regexps = {
    // 使用索引颜色: [1]:Index(0-15)
    colorIndex: /^<color:(\d|1[0-5])>$/i,
    // 使用指定颜色: [1]:R(00-ff), [2]:G(00-ff), [3]:B(00-ff), [4]:A(00-ff)(可选)
    color: /^<color:([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?>$/i,
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
    textShadow: /^<shadow:(0|-?[1-9]),(0|-?[1-9]),([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?>$/i,
    // 结束阴影效果
    textShadowRestore: /^<\/shadow>$/i,
    // 使用描边效果: [1]:描边宽度(1-20), [2]:R(00-ff), [3]:G(00-ff), [4]:B(00-ff), [5]:A(00-ff)(可选)
    textStroke: /^<stroke:([1-9]|1\d|20),([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?>$/i,
    // 结束描边效果
    textStrokeRestore: /^<\/stroke>$/i,
    // 使用轮廓效果: [1]:R(00-ff), [2]:G(00-ff), [3]:B(00-ff), [4]:A(00-ff)(可选)
    textOutline: /^<outline:([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?>$/i,
    // 结束轮廓效果
    textOutlineRestore: /^<\/outline>$/i,
    // 使用指定图像: [1]:GUID(16个字符), [2]:参数1(0-10000)(可选), [3]:参数2(0-10000)(可选), [4]:参数3(0-10000)(可选), [5]:参数4(0-10000)(可选), [6]:参数5(0-10000)(可选), [7]:参数6(0-10000)(可选)
    image: /^<image:([0-9a-f]{16})(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?>$/i,
  }

  /** 初始化打印机相关数据 */
  public static async initialize(): Promise<void> {
    // 设置字符宽度数组
    this.charWidths = new Float64Array(
      GL.arrays[1].uint32.buffer, 0,
      GL.arrays[1].uint32.length / 2,
    )

    // 创建打印机指令列表
    this.commands = new Array(this.commandMaximum)

    // 加载默认设置
    await this.loadDefault()
  }

  /** 加载默认设置 */
  private static async loadDefault(): Promise<void> {
    // 设置打印机默认上下文属性
    const text = Data.config.text
    this.updateFont()
    this.size = 16
    this.color = Color.parseCSSColor('ffffffff')
    this.effect = {type: 'none'}
    this.highDefinition = text.highDefinition

    // 导入字体
    await this.importFonts(text.importedFonts)
  }

  /**
   * 导入字体
   * @param imports 导入字体的文件ID列表
   */
  private static async importFonts(imports: Array<string>): Promise<void> {
    const imported = this.imported
    const importing = this.importing
    const fontFaces = this.fontFaces
    const regexp = /([^/]+)\.\S+\.\S+$/
    const promises = []
    for (const guid of imports) {
      const meta = Data.manifest.guidMap[guid] as FontFileMeta | undefined
      if (!meta) continue
      const path = meta.path
      const name = meta.name ?? path.match(regexp)?.[1]
      // 如果没有名字或已经加载，跳过
      if (!name || imported.includes(name)) {
        continue
      }
      imported.push(name)
      if (guid in fontFaces) {
        document.fonts.add(fontFaces[guid]!)
        continue
      }
      importing.push(name)
      promises.push(Loader.get({
        path: path,
        type: 'arraybuffer',
      }).then(
        buffer => {
          new FontFace(name, buffer).load().then(
            font => {
              fontFaces[guid] = font
              importing.remove(name)
              document.fonts.add(font)
              font.guid = guid
              font.name = name
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
    await Promise.all(promises)
  }

  /**
   * 解析文字效果的颜色
   * @param effect 文字效果数据对象
   * @returns 解析后的文字效果对象
   */
  public static parseEffect(effect: TextEffect): TextEffect {
    const copy = {...effect}
    if ('color' in copy) {
      copy.color = Color.parseCSSColor(copy.color)
    }
    return copy
  }

  /**
   * 获取打印机指令
   * @returns 打印机指令
   */
  private static fetchCommand(): PrinterCommand {
    const count = this.commandCount
    const command = this.commands[count]
    if (command !== undefined) {
      // 如果当前位置存在指令，返回
      this.commandCount++
      return command
    } else {
      // 创建新的打印机指令
      const command: PrinterCommand = {
        string: '',
        x: 0,
        y: 0,
        font: '',
        size: 0,
        color: '',
        effect: null,
        image: null,
        imageWidth: 0,
        imageHeight: 0,
        imageSpacing: 0,
        horizontalWidth: 0,
        drawingMethod: Function.empty,
      }
      // 如果缓存指令数量未满，添加到指令池
      if (count < this.commandMaximum) {
        this.commands[count] = command
        this.commandCount++
      }
      return command
    }
  }

  /** 重置打印机指令 */
  private static resetCommands(): void {
    const commands = this.commands
    const count = this.commandCount
    for (let i = 0; i < count; i++) {
      const command = commands[i]
      command.string = ''
      command.image = null
      command.imageWidth = 0
      command.imageHeight = 0
      command.imageSpacing = 0
      command.horizontalWidth = 0
    }
    this.commandCount = 0
  }

  /**
   * 绘制文字
   * @param context 2D上下文
   * @param command 打印机指令
   * @param text 文本内容
   */
  private static drawText(context: PrinterRenderingContext, command: PrinterCommand, text: string): void {
    const x = command.x
    const y = command.y + command.size * 0.85
    context.font = command.font
    context.fillStyle = command.color
    context.globalCompositeOperation = 'source-over'
    context.fillText(text, x, y)
  }

  /**
   * 绘制带阴影的文字
   * @param context 2D上下文
   * @param command 打印机指令
   * @param text 文本内容
   */
  private static drawTextWithShadow(context: PrinterRenderingContext, command: PrinterCommand, text: string): void {
    const x = command.x
    const y = command.y + command.size * 0.85
    const effect = command.effect as TextEffectShadow
    const shadowX = effect.shadowOffsetX * Printer.scale
    const shadowY = effect.shadowOffsetY * Printer.scale
    context.font = command.font
    context.fillStyle = effect.color
    context.globalCompositeOperation = 'destination-over'
    context.fillText(text, x + shadowX, y + shadowY)
    context.fillStyle = command.color
    context.globalCompositeOperation = 'source-over'
    context.fillText(text, x, y)
  }

  /**
   * 绘制描边的文字
   * @param context 2D上下文
   * @param command 打印机指令
   * @param text 文本内容
   */
  private static drawTextWithStroke(context: PrinterRenderingContext, command: PrinterCommand, text: string): void {
    const x = command.x
    const y = command.y + command.size * 0.85
    const effect = command.effect as TextEffectStroke
    context.font = command.font
    context.lineJoin = 'round'
    context.lineWidth = effect.strokeWidth * Printer.scale
    context.strokeStyle = effect.color
    context.globalCompositeOperation = 'destination-over'
    context.strokeText(text, x, y)
    context.fillStyle = command.color
    context.globalCompositeOperation = 'source-over'
    context.fillText(text, x, y)
  }

  /**
   * 绘制带轮廓线的文字
   * @param context 2D上下文
   * @param command 打印机指令
   * @param text 文本内容
   */
  private static drawTextWithOutline(context: PrinterRenderingContext, command: PrinterCommand, text: string): void {
    const x = command.x
    const y = command.y + command.size * 0.85
    const effect = command.effect as TextEffectOutline
    const offset = Printer.scale
    context.font = command.font
    context.fillStyle = effect.color
    context.fillText(text, x - offset, y)
    context.fillText(text, x + offset, y)
    context.fillText(text, x, y - offset)
    context.fillText(text, x, y + offset)
    context.fillStyle = command.color
    context.fillText(text, x, y)
  }

  /**
   * 设置本地化语言包字体
   * @param guid 字体文件ID
   */
  public static setLanguageFont(guid: string): void {
    if (this.languageFont !== guid) {
      this.deleteFont(this.languageFont)
      this.languageFont = guid
      this.updateFont()
    }
  }

  /** 更新字体 */
  private static async updateFont(): Promise<void> {
    let font = this.font ?? ''
    const fontFamily = Data.config.text.fontFamily || 'sans-serif'
    const guid = this.languageFont
    if (guid) {
      const meta = Data.manifest.guidMap[guid] as FontFileMeta | undefined
      if (!meta) return
      const name = meta.name ?? meta.path.match(/([^/]+)\.\S+\.\S+$/)?.[1]
      if (name) {
        await this.importFonts([guid])
        font = `${name}, ${fontFamily}`
      }
    } else {
      font = fontFamily
    }
    if (this.font !== font) {
      this.font = font
      this.updateAllPrinters()
    }
  }

  /**
   * 删除指定的字体
   * @param guid 字体文件ID
   */
  private static deleteFont(guid: string): void {
    const fonts = document.fonts
    for (const font of fonts) {
      if (font.guid === guid) {
        fonts.delete(font)
        this.imported.remove(font.name)
        break
      }
    }
  }

  /**
   * 生成字体家族
   * @param firstFont 主要字体的名称
   * @returns 字体家族字符串
   */
  public static generateFontFamily(firstFont: string): string {
    return firstFont ? `${firstFont}, ${this.font}` : this.font
  }

  /**
   * 设置文字缩放系数
   * @param scale 文字缩放系数
   */
  public static setSizeScale(scale: number): void {
    if (this.sizeScale !== scale) {
      this.sizeScale = scale
      this.updateAllPrinters()
    }
  }

  /** 更新缩放率 */
  public static updateScale(): void {
    const HD_SCALE = 4
    const MAX_SCALE = 4
    let scale = UI.scale
    if (this.highDefinition) {
      scale = Math.max(scale, HD_SCALE)
    }
    this.scale = Math.min(scale, MAX_SCALE)
    this.updateAllPrinters()
  }

  /**
   * 设置自动换行规则
   * @param wordWrap 自动换行规则
   */
  public static setWordWrap(wordWrap: WordWrap): void {
    if (this.wordWrap !== wordWrap) {
      this.wordWrap = wordWrap
      this.updateAllPrinters()
    }
  }

  /** 更新所有打印机 */
  private static updateAllPrinters(): void {
    const update = (elements: Array<UIElement>) => {
      for (const element of elements) {
        // 更新字体
        if ('font' in element) {
          element.font = element.font
        }
        element.updatePrinter?.()
        update(element.children)
      }
    }
    if (UI.root instanceof UIElement) {
      update(UI.root.children)
    }
    // 发送rescale事件
    window.dispatchEvent(new Event('rescale'))
  }
}

/** ******************************** 打印机图像列表 ******************************** */

class PrinterImageList extends Array<PrinterImageElement> {
  /** 是否已改变 */
  public changed: boolean = false
}