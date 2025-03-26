/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@number startXMean
@alias #startXMean
@desc #startXMean-desc
@clamp -100 100

@number startYMean
@alias #startYMean
@desc #startYMean-desc
@clamp -100 100

@number startXDev
@alias #startXDev
@desc #startXDev-desc
@clamp -100 100
@default 10

@number startYDev
@alias #startYDev
@desc #startYDev-desc
@clamp -100 100
@default 10

@number translationXMean
@alias #translationXMean
@desc #translationXMean-desc
@clamp -100 100
@default 12

@number translationYMean
@alias #translationYMean
@desc #translationYMean-desc
@clamp -100 100
@default -24

@number translationXDev
@alias #translationXDev
@desc #translationXDev-desc
@clamp -100 100
@default 10

@number translationYDev
@alias #translationYDev
@desc #translationYDev-desc
@clamp -100 100
@default 10

@number startScale
@alias #startScale
@desc #startScale-desc
@clamp 0 4
@default 1

@number endScale
@alias #endScale
@desc #endScale-desc
@clamp 0 4
@default 1

@number startOpacity
@alias #startOpacity
@desc #startOpacity-desc
@clamp 0 10
@default 1

@number endOpacity
@alias #endOpacity
@desc #endOpacity-desc
@clamp 0 10
@default 0.75

@easing xEasingId
@alias #xEasingId
@desc #xEasingId-desc

@easing yEasingId
@alias #yEasingId
@desc #yEasingId-desc

@easing scaleEasingId
@alias #scaleEasingId
@desc #scaleEasingId-desc

@easing opacityEasingId
@alias #opacityEasingId
@desc #opacityEasingId-desc

@number duration
@alias #duration
@desc #duration-desc
@clamp 100 10000
@default 800

@file numberImage0
@alias #numberImage0
@filter image
@desc #numberImage0-desc

@file numberImage1
@alias #numberImage1
@filter image
@desc #numberImage1-desc

@file numberImage2
@alias #numberImage2
@filter image
@desc #numberImage2-desc

@file numberImage3
@alias #numberImage3
@filter image
@desc #numberImage3-desc

@file numberImage4
@alias #numberImage4
@filter image
@desc #numberImage4-desc

@file numberImage5
@alias #numberImage5
@filter image
@desc #numberImage5-desc

@lang en
#plugin Damage Number
#desc
Pop up floating damage numbers
The sprite Image will be divided horizontally into 11 frames
Format: 0123456789+
The last frame is an optional sign

Script method:
PluginManager.DamageNumber.popup(target, style, value)
Target: An object with scene coordinates
Style: Numbers ​​0-5 correspond to sprites 0-5
Value: The damage value that pops up at the target location
#startXMean Start X
#startXMean-desc Horizontal position relative to target object
#startYMean Start Y
#startYMean-desc Vertical position relative to target object
#startXDev Start X Dev
#startXDev-desc Maximum random horizontal offset distance from start position
#startYDev Start Y Dev
#startYDev-desc Maximum random vertical offset distance from start position
#translationXMean Translation X
#translationXMean-desc Horizontal translation distance from start to end
#translationYMean Translation Y
#translationYMean-desc Vertical translation distance from start to end
#translationXDev Translation X Dev
#translationXDev-desc Maximum random horizontal offset distance for translation
#translationYDev Translation Y Dev
#translationYDev-desc Maximum random vertical offset distance for translation
#startScale Start Scale
#startScale-desc Scale of damage numbers at start
#endScale End Scale
#endScale-desc Scale of damage numbers at the end
#startOpacity Start Opacity
#startOpacity-desc Opacity of damage numbers at start
#endOpacity End Opacity
#endOpacity-desc Opacity of damage numbers at the end
#xEasingId X Easing
#xEasingId-desc Horizontal movement transition of damage numbers
#yEasingId Y Easing
#yEasingId-desc Vertical movement transition of damage numbers
#scaleEasingId Scale Easing
#scaleEasingId-desc Scaling transition of damage numbers
#opacityEasingId Opacity Easing
#opacityEasingId-desc Opacity transition of damage numbers
#duration Duration (ms)
#duration-desc The elapsed time between the numbers being popped and disappearing
#numberImage0 Sprite Image 0
#numberImage0-desc Used for damage numbers of style [0]
#numberImage1 Sprite Image 1
#numberImage1-desc Used for damage numbers of style [1]
#numberImage2 Sprite Image 2
#numberImage2-desc Used for damage numbers of style [2]
#numberImage3 Sprite Image 3
#numberImage3-desc Used for damage numbers of style [3]
#numberImage4 Sprite Image 4
#numberImage4-desc Used for damage numbers of style [4]
#numberImage5 Sprite Image 5
#numberImage5-desc Used for damage numbers of style [5]

@lang ru
#plugin Кол-во урона
#desc
Всплывающие плавающие цифры урона
Карта спрайтов разделена по горизонтали на 11 фреймов
Формат：0123456789+
Последний кадр - это необязательный знак

Метод Скрипт：
PluginManager.DamageNumber.popup(target, style, value)
Target: Объект с координатами сцены
Style: Значение 0-5 соответствует рисунку спрайта 0-5
Value: Величина урона, которая отображается в целевом местоположении
#startXMean Старт X
#startXMean-desc Горизонтальное положение относительно целевого объекта
#startYMean Старт Y
#startYMean-desc Вертикальное положение относительно целевого объекта
#startXDev Нач.отклон. X
#startXDev-desc Максимальное случайное горизонтальное смещение начальной позиции
#startYDev Нач.отклон. Y
#startYDev-desc Максимальное случайное вертикальное смещение начальной позиции
#translationXMean Перемещ.X
#translationXMean-desc Расстояние перемещения по горизонтали от начала до конца
#translationYMean Перемещ.Y
#translationYMean-desc Расстояние перемещения по вертикали от начала до конца
#translationXDev Cмещения X
#translationXDev-desc Максимальное произвольное расстояние смещения по горизонтали
#translationYDev Cмещения Y
#translationYDev-desc Максимальное произвольное расстояние смещения по вертикали
#startScale Старт масшт.
#startScale-desc Шкала показателя урона на старте
#endScale Конец масшт.
#endScale-desc Шкала показателя урона в конце
#startOpacity Старт Мутность
#startOpacity-desc Прозрачность показателя урона на старте
#endOpacity Конец Мутность
#endOpacity-desc Прозрачность показателя урона в конце
#xEasingId ПлавностьX
#xEasingId-desc Горизонтальное перемещение - изменение количества повреждений
#yEasingId ПлавностьY
#yEasingId-desc Вертикальное перемещение - изменение количества повреждений
#scaleEasingId Масшт. ослабления
#scaleEasingId-desc Изменение масштаба количества повреждений
#opacityEasingId Прозрачность
#opacityEasingId-desc Переход чисел повреждений в непрозрачность
#duration Продолж-сть (мс)
#duration-desc Время, необходимое для появления и исчезновения числа.
#numberImage0 Изображение 0
#numberImage0-desc Используется для определения количества повреждений в определенном стиле[0]
#numberImage1 Изображение 1
#numberImage1-desc Используется для определения количества повреждений в определенном стиле[1]
#numberImage2 Изображение 2
#numberImage2-desc Используется для определения количества повреждений в определенном стиле[2]
#numberImage3 Изображение 3
#numberImage3-desc Используется для определения количества повреждений в определенном стиле[3]
#numberImage4 Изображение 4
#numberImage4-desc Используется для определения количества повреждений в определенном стиле[4]
#numberImage5 Изображение 5
#numberImage5-desc Используется для определения количества повреждений в определенном стиле[5]

@lang zh
#plugin 伤害数字
#desc
弹出浮动伤害数字
精灵图被水平划分为11帧
格式：0123456789+
最后一位是符号，可选

脚本方法：
PluginManager.DamageNumber.popup(目标, 样式, 数值)
目标：具有场景坐标的对象
样式：数值0-5对应精灵图0-5
数值：在目标位置弹出的伤害数值
#startXMean 开始X
#startXMean-desc 相对于目标对象的水平位置
#startYMean 开始Y
#startYMean-desc 相对于目标对象的垂直位置
#startXDev 开始X偏差
#startXDev-desc 开始位置的最大随机水平偏移距离
#startYDev 开始Y偏差
#startYDev-desc 开始位置的最大随机垂直偏移距离
#translationXMean 平移X
#translationXMean-desc 从开始到结束的水平位移距离
#translationYMean 平移Y
#translationYMean-desc 从开始到结束的垂直位移距离
#translationXDev 平移X偏差
#translationXDev-desc 位移的最大随机水平偏移距离
#translationYDev 平移Y偏差
#translationYDev-desc 位移的最大随机垂直偏移距离
#startScale 开始缩放系数
#startScale-desc 开始时伤害数字的缩放倍数
#endScale 结束缩放系数
#endScale-desc 结束时伤害数字的缩放倍数
#startOpacity 开始不透明度
#startOpacity-desc 开始时伤害数字的不透明度
#endOpacity 结束不透明度
#endOpacity-desc 结束时伤害数字的不透明度
#xEasingId X过渡方式
#xEasingId-desc 伤害数字水平位移的过渡方式
#yEasingId Y过渡方式
#yEasingId-desc 伤害数字垂直位移的过渡方式
#scaleEasingId 缩放系数过渡方式
#scaleEasingId-desc 数字缩放倍数的过渡方式
#opacityEasingId 不透明度过渡方式
#opacityEasingId-desc 数字不透明度的过渡方式
#duration 持续时间(毫秒)
#duration-desc 数字从弹出到消失经过的时间
#numberImage0 数字精灵图0
#numberImage0-desc 样式[0]的伤害数字使用的精灵图
#numberImage1 数字精灵图1
#numberImage1-desc 样式[1]的伤害数字使用的精灵图
#numberImage2 数字精灵图2
#numberImage2-desc 样式[2]的伤害数字使用的精灵图
#numberImage3 数字精灵图3
#numberImage3-desc 样式[3]的伤害数字使用的精灵图
#numberImage4 数字精灵图4
#numberImage4-desc 样式[4]的伤害数字使用的精灵图
#numberImage5 数字精灵图5
#numberImage5-desc 样式[5]的伤害数字使用的精灵图
*/

declare global {
  interface SceneContext {
    [KEY]: FloatingList
  }
}

interface FontSprite {
  width: number
  height: number
  fWidth: number
  fWidthRatio: number
  top: number
  bottom: number
  signed: boolean
}

let StartXMean: number = 0
let StartYMean: number = 0
let StartXDev: number = 0
let StartYDev: number = 0
let TranslationXMean: number = 0
let TranslationYMean: number = 0
let TranslationXDev: number = 0
let TranslationYDev: number = 0
let StartScale: number = 0
let TranslationScale: number = 0
let StartOpacity: number = 0
let TranslationOpacity: number = 0
let XEasing: EasingMap
let YEasing: EasingMap
let ScaleEasing: EasingMap
let OpacityEasing: EasingMap
let Duration: number = 0
const Fonts: Array<FontSprite | null> = new Array(6).fill(null)
const Numbers: Uint8Array = new Uint8Array(16)
const KEY: unique symbol = Symbol('FLOATINGS')
let FontTex: Texture

// 浮动数字缓存
const Caches: Array<FloatingNumber> = []
const CacheMax: number = 500
let CacheCount: number = 0

/** 获取浮动数字实例 */
const FetchFloatingNumber = (): FloatingNumber => {
  return CacheCount !== 0
  ? Caches[--CacheCount]
  : new FloatingNumber()
}

/**
 * 回收浮动数字实例
 * @param instance 实例对象
 */
const RecycleFloatingNumber = (instance: FloatingNumber): void => {
  if (CacheCount < CacheMax) {
    Caches[CacheCount++] = instance
  }
}

/**
 * 计算离散率
 * @param variance 离散度
 * @returns 随机离散值(-variance ~ + variance)
 */
const vary = (variance: number): number => {
  return variance === 0 ? 0 : variance * (Math.random() - Math.random())
}

// 伤害数字类
class DamageNumber implements Script<Plugin> {
  // 接口属性
  startXMean!: number
  startYMean!: number
  startXDev!: number
  startYDev!: number
  translationXMean!: number
  translationYMean!: number
  translationXDev!: number
  translationYDev!: number
  startScale!: number
  endScale!: number
  startOpacity!: number
  endOpacity!: number
  xEasingId!: string
  yEasingId!: string
  scaleEasingId!: string
  opacityEasingId!: string
  duration!: number
  numberImage0!: string
  numberImage1!: string
  numberImage2!: string
  numberImage3!: string
  numberImage4!: string
  numberImage5!: string

  async onStart(): Promise<void> {
    // 侦听事件
    Scene.on('load', scene => {
      const floatings = new FloatingList()
      scene.updaters.push(floatings)
      scene.renderers.push(floatings)
      scene[KEY] = floatings
    })

    // 创建字体纹理
    FontTex = new Texture()

    // 创建图像列表
    const images: Array<string | Promise<any> | HTMLImageElement> = [
      this.numberImage0,
      this.numberImage1,
      this.numberImage2,
      this.numberImage3,
      this.numberImage4,
      this.numberImage5,
    ]

    // 加载图像
    const {length} = images
    for (let i = 0; i < length; i++) {
      if (!images[i]) continue
      images[i] = Loader.get({
        guid: images[i] as string,
        type: 'image',
      })
    }

    // 等待图像加载完毕
    for (let i = 0; i < length; i++) {
      images[i] = await images[i]
    }

    // 创建精灵对象并计算纹理大小
    let fullWidth = 0
    let fullHeight = 0
    for (let i = 0; i < length; i++) {
      const image = images[i] as HTMLImageElement
      if (!image) continue
      const width = image.naturalWidth
      const height = image.naturalHeight
      const frames = 11
      const sprite = {
        width: width,
        height: height,
        fWidth: Math.floor(width / frames),
        fWidthRatio: 0,
        top: 0,
        bottom: 0,
        signed: false,
      }
      Fonts[i] = sprite
      fullWidth = Math.max(fullWidth, width)
      fullHeight += height
    }

    // 上传图像数据到纹理
    FontTex.resize(fullWidth, fullHeight)
    for (let i = 0, y = 0; i < length; i++) {
      const sprite = Fonts[i]
      if (!sprite) continue
      const {fWidth, width, height} = sprite
      GL.texSubImage2D(GL.TEXTURE_2D, 0, 0, y, width, height, GL.RGBA, GL.UNSIGNED_BYTE, images[i] as HTMLImageElement)
      sprite.fWidthRatio = fWidth / fullWidth
      sprite.top = y / fullHeight
      sprite.bottom = (y += height) / fullHeight
    }

    // 等待上传完毕后读取像素检查符号(减少阻塞)
    for (let i = 0, y = 0; i < length; i++) {
      const sprite = Fonts[i]
      if (!sprite) continue
      const {fWidth, height} = sprite
      const {data} = FontTex.getImageData(10 * fWidth, y, fWidth, height)!
      const {length} = data
      for (let i = 3; i < length; i += 4) {
        if (data[i] !== 0) {
          sprite.signed = true
          break
        }
      }
      y += height
    }

    // 设置参数到外部变量
    StartXMean = this.startXMean
    StartYMean = this.startYMean
    StartXDev = this.startXDev
    StartYDev = this.startYDev
    TranslationXMean = this.translationXMean
    TranslationYMean = this.translationYMean
    TranslationXDev = this.translationXDev
    TranslationYDev = this.translationYDev
    StartScale = this.startScale
    TranslationScale = this.endScale - this.startScale
    StartOpacity = this.startOpacity
    TranslationOpacity = this.endOpacity - this.startOpacity
    XEasing = Easing.get(this.xEasingId)
    YEasing = Easing.get(this.yEasingId)
    ScaleEasing = Easing.get(this.scaleEasingId)
    OpacityEasing = Easing.get(this.opacityEasingId)
    Duration = this.duration
  }

  /**
   * 弹出伤害文本
   * @param actor 目标角色
   * @param type 伤害数字类型
   * @param value 数值
   */
  popup(actor: Actor, type: 0 | 1 | 2 | 3 | 4 | 5, value: number): void {
    if (Scene.binding === null) return
    const {x, y} = Scene.convert(actor)
    if (x >= Camera.scrollLeft &&
      y >= Camera.scrollTop &&
      x < Camera.scrollRight &&
      y < Camera.scrollBottom &&
      Fonts[type] !== null) {
      Scene.binding[KEY].push(
        FetchFloatingNumber().set(
          x, y, Fonts[type]!, value,
      ))
    }
  }
}

// 漂浮文本列表类
class FloatingList extends Array {
  /**
   * 更新浮动文本
   * @param deltaTime 增量时间
   */
  update(deltaTime: number): void {
    let i = this.length
    while (--i >= 0) {
      const floatingNumber = this[i]
      if (floatingNumber.elapsed === Duration) {
        RecycleFloatingNumber(floatingNumber)
        this.splice(i, 1)
        continue
      }
      floatingNumber.update(deltaTime)
    }
  }

  /** 渲染图像 */
  render(): void {
    if (this.length === 0) {
      return
    }

    const gl = GL
    const vertices = gl.arrays[0].float32
    const sl = Camera.scrollLeft
    const st = Camera.scrollTop
    const sr = Camera.scrollRight
    const sb = Camera.scrollBottom
    const length = this.length
    let vi = 0
    for (let i = 0; i < length; i++) {
      const floating = this[i]
      const mw = floating.width
      const mh = floating.height
      const ml = floating.x - mw / 2
      const mt = floating.y - mh / 2
      const mr = ml + mw
      const mb = mt + mh
      if (ml < sr && mt < sb && mr > sl && mb > st) {
        vi = floating.draw(vertices, vi)
      }
    }
    if (vi !== 0) {
      const program = gl.imageProgram.use()
      const matrix = Matrix.instance.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-sl, -st)
      gl.bindVertexArray(program.vao)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.uniform1i(program.u_LightMode, 0)
      gl.uniform1i(program.u_ColorMode, 0)
      gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.bindTexture(gl.TEXTURE_2D, FontTex.base.glTexture)
      gl.drawElements(gl.TRIANGLES, vi / 20 * 6, gl.UNSIGNED_INT, 0)
    }
  }
}

// 数字数组
class NumberArray extends Uint8Array {
  digits: number = 0
}

// 浮动数字类
class FloatingNumber {
  numbers: NumberArray
  font!: FontSprite
  x!: number
  y!: number
  scale!: number
  opacity!: number
  width!: number
  height!: number
  startX!: number
  startY!: number
  translationX!: number
  translationY!: number
  naturalWidth!: number
  naturalHeight!: number
  elapsed!: number

  constructor() {
    this.numbers = new NumberArray(16)
  }

  /**
   * 设置浮动数字
   * @param x 水平位置
   * @param y 垂直位置
   * @param font 字体精灵
   * @param value 数值
   * @returns 当前实例
   */
  set(x: number, y: number, font: FontSprite, value: number): this {
    const {numbers} = this
    let count = 0
    // 无视浮点数值
    if (value > 0) {
      while (value > 0) {
        const number = value % 10
        Numbers[count++] = number
        value = (value - number) / 10
      }
      for (let i = 0; i < count; i++) {
        numbers[i] = Numbers[count - 1 - i]
      }
      numbers.digits = count
    } else {
      numbers[0] = 0
      numbers.digits = 1
    }
    const sx = x + StartXMean + vary(StartXDev)
    const sy = y + StartYMean + vary(StartYDev)
    const tx = TranslationXMean + vary(TranslationXDev)
    const ty = TranslationYMean + vary(TranslationYDev)
    const nw = font.fWidth * count
    const nh = font.height
    this.font = font
    this.x = sx
    this.y = sy
    this.scale = StartScale
    this.opacity = StartOpacity
    this.width = nw * StartScale
    this.height = nh * StartScale
    this.startX = sx
    this.startY = sy
    this.translationX = tx
    this.translationY = ty
    this.naturalWidth = nw
    this.naturalHeight = nh
    this.elapsed = 0
    return this
  }

  /**
   * 更新文本位置
   * @param deltaTime 增量时间
   */
  update(deltaTime: number): void {
    this.elapsed = Math.min(this.elapsed + deltaTime, Duration)
    const time = this.elapsed / Duration
    const index = Math.round(time * EasingMap.scale)
    if (this.translationX !== 0) {
      const ratio = XEasing[index]
      this.x = this.startX + this.translationX * ratio
    }
    if (this.translationY !== 0) {
      const ratio = YEasing[index]
      this.y = this.startY + this.translationY * ratio
    }
    if (TranslationScale !== 0) {
      const ratio = ScaleEasing[index]
      this.scale = StartScale + TranslationScale * ratio
      this.width = this.naturalWidth * this.scale
      this.height = this.naturalHeight * this.scale
    }
    if (TranslationOpacity !== 0) {
      const ratio = OpacityEasing[index]
      this.opacity = Math.clamp(StartOpacity + TranslationOpacity * ratio, 0, 1)
    }
  }

  /**
   * 绘制文本图像
   * @param vertices 顶点数组
   * @param vi 起始索引
   * @returns 结束索引
   */
  draw(vertices: Float32Array, vi: number): number {
    const font = this.font
    const ml = this.x - this.width / 2
    const mt = this.y - this.height / 2
    const dw = font.fWidth * this.scale
    const dh = font.height * this.scale
    const dt = mt
    const db = mt + dh
    const st = font.top
    const sb = font.bottom
    const sw = font.fWidthRatio
    const opacity = this.opacity
    if (font.signed) {
      const dl = ml - dw
      const dr = ml
      const sl = 10 * sw
      const sr = sl + sw
      vertices[vi    ] = dl
      vertices[vi + 1] = dt
      vertices[vi + 2] = sl
      vertices[vi + 3] = st
      vertices[vi + 4] = opacity
      vertices[vi + 5] = dl
      vertices[vi + 6] = db
      vertices[vi + 7] = sl
      vertices[vi + 8] = sb
      vertices[vi + 9] = opacity
      vertices[vi + 10] = dr
      vertices[vi + 11] = db
      vertices[vi + 12] = sr
      vertices[vi + 13] = sb
      vertices[vi + 14] = opacity
      vertices[vi + 15] = dr
      vertices[vi + 16] = dt
      vertices[vi + 17] = sr
      vertices[vi + 18] = st
      vertices[vi + 19] = opacity
      vi += 20
    }
    const numbers = this.numbers
    const length = numbers.digits
    for (let i = 0; i < length; i++) {
      const number = numbers[i]
      const dl = ml + i * dw
      const dr = dl + dw
      const sl = number * sw
      const sr = sl + sw
      vertices[vi    ] = dl
      vertices[vi + 1] = dt
      vertices[vi + 2] = sl
      vertices[vi + 3] = st
      vertices[vi + 4] = opacity
      vertices[vi + 5] = dl
      vertices[vi + 6] = db
      vertices[vi + 7] = sl
      vertices[vi + 8] = sb
      vertices[vi + 9] = opacity
      vertices[vi + 10] = dr
      vertices[vi + 11] = db
      vertices[vi + 12] = sr
      vertices[vi + 13] = sb
      vertices[vi + 14] = opacity
      vertices[vi + 15] = dr
      vertices[vi + 16] = dt
      vertices[vi + 17] = sr
      vertices[vi + 18] = st
      vertices[vi + 19] = opacity
      vi += 20
    }
    return vi
  }
}

export default DamageNumber