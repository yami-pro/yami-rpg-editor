/*
@plugin #plugin
@version 1.4
@author
@link
@desc #desc

@option state {'enabled', 'disabled'}
@alias #state {#state-enabled, #state-disabled}
@desc #state-desc

@option display {'always', 'auto', 'auto-except-for-player-team', 'in-the-visible-range'}
@alias #display {#always, #auto, #auto-except-for-player-team, #in-the-visible-range}
@desc #display-desc
@default 'auto-except-for-player-team'

@number duration
@alias #duration
@desc #duration-desc
@clamp 1000 60000
@default 10000
@cond display {'auto', 'auto-except-for-player-team'}

@number range
@alias #range
@desc #range-desc
@clamp 0 100
@default 10
@cond display {'in-the-visible-range'}

@attribute health
@alias #health
@desc #health-desc
@filter actor
@default 'health'

@attribute maxHealth
@alias #maxHealth
@desc #maxHealth-desc
@filter actor
@default 'maxHealth'

@option specialBarEnabled {true, false}
@alias #specialBarEnabled {#specialBarEnabled-true, #specialBarEnabled-false}
@desc #specialBarEnabled-desc

@attribute specialAttr
@alias #specialAttr
@desc #specialAttr-desc
@filter actor
@cond specialBarEnabled {true}

@enum specialAttrValue
@alias #specialAttrValue
@desc #specialAttrValue-desc
@cond specialBarEnabled {true}

@file backgroundIdFriendly
@alias #backgroundIdFriendly
@filter image
@desc #backgroundIdFriendly-desc

@file foregroundIdFriendly
@alias #foregroundIdFriendly
@filter image
@desc #foregroundIdFriendly-desc

@file backgroundIdEnemy
@alias #backgroundIdEnemy
@filter image
@desc #backgroundIdEnemy-desc

@file foregroundIdEnemy
@alias #foregroundIdEnemy
@filter image
@desc #foregroundIdEnemy-desc

@file backgroundIdSpecial
@alias #backgroundIdSpecial
@filter image
@desc #backgroundIdSpecial-desc

@file foregroundIdSpecial
@alias #foregroundIdSpecial
@filter image
@desc #foregroundIdSpecial-desc

@number offsetY
@alias #offsetY
@desc #offsetY-desc
@default -48

@number scale
@alias #scale
@desc #scale-desc
@clamp 0.1 4
@default 1

@number opacity
@alias #opacity
@desc #opacity-desc
@clamp 0 1
@default 1

@lang en
#plugin Health Bar
#desc
Script methods:
PluginManager.HealthBar.enable()
PluginManager.HealthBar.disable()
PluginManager.HealthBar.switch()
#state Initial State
#state-enabled Enabled
#state-disabled Disabled
#state-desc This plugin can be switched later by script
#display Display
#always Always
#auto Auto
#auto-except-for-player-team Auto except for player team
#in-the-visible-range In the Visible Range
#display-desc Always show health bar, or after an attack
#duration Duration (ms)
#duration-desc The duration of the health bar displayed after being attacked
#range Visible Range
#range-desc If the distance from the actor to the center of the camera is in the visible range, display the health bar
#health Health Key
#health-desc The attribute name of the actor's health
#maxHealth Max Health Key
#maxHealth-desc The attribute name of the actor's max health
#specialBarEnabled Special Health Bar
#specialBarEnabled-true Enabled
#specialBarEnabled-false Disabled
#specialBarEnabled-desc Toggle special health bar
#specialAttr Special Attr
#specialAttr-desc The attribute name of the special actor
#specialAttrValue Special Attr Value
#specialAttrValue-desc Show a special health bar if the value of special attribute is in this list
#backgroundIdFriendly BG Image (friendly)
#backgroundIdFriendly-desc Background image for the friendly actor's health bar
#foregroundIdFriendly FG Image (friendly)
#foregroundIdFriendly-desc Foreground image for the friendly actor's health bar
#backgroundIdEnemy BG Image (enemy)
#backgroundIdEnemy-desc Background image for the enemy actor's health bar
#foregroundIdEnemy FG Image (enemy)
#foregroundIdEnemy-desc Foreground image for the enemy actor's health bar
#backgroundIdSpecial BG Image (special)
#backgroundIdSpecial-desc Background image for the special actor's health bar
#foregroundIdSpecial FG Image (special)
#foregroundIdSpecial-desc Foreground image for the special actor's health bar
#offsetY Offset Y
#offsetY-desc The vertical offset distance of the health bar
#scale Scale
#scale-desc The scale Factor of the health bar
#opacity Opacity
#opacity-desc The opacity of the health bar

@lang ru
#plugin Индикатор здоровья
#desc
Скриптовый метод:
PluginManager.HealthBar.enable()
PluginManager.HealthBar.disable()
PluginManager.HealthBar.switch()
#state Нач. состояние
#state-enabled Включить
#state-disabled Выключить
#state-desc Вы можете переключать плагины с помощью скриптов.
#display Отобразить
#always Всегда
#auto Автоматический
#auto-except-for-player-team Автомат. (кроме команд игроков)
#in-the-visible-range В пределах видимого диапазона
#display-desc Всегда показывайте индикатор жизни или показывайте его после нападения
#duration Продол-сть(ms)
#duration-desc Продолжительность шкалы здоровья после атаки
#range Видимый диапазон
#range-desc Если персонаж находится в зоне видимости от центра камеры, отображается полоска здоровья.
#health Атрибуты здоровья
#health-desc Название атрибута здоровья персонажа
#maxHealth Макс. атрибут здоровья
#maxHealth-desc Название максимального показателя здоровья персонажа
#specialBarEnabled Спец. полоска здоровья
#specialBarEnabled-true Показать
#specialBarEnabled-false Скрыть
#specialBarEnabled-desc Переключите специальную панель здоровья
#specialAttr Особые атрибуты
#specialAttr-desc Имя атрибута, которым обладает особая роль
#specialAttrValue Спец. атрибут
#specialAttrValue-desc Если значение специального атрибута персонажа является одним из них, отображается специальная панель здоровья
#backgroundIdFriendly Фоновое (друг)
#backgroundIdFriendly-desc Фоновое изображение полосы здоровья дружелюбного персонажа
#foregroundIdFriendly Перед. план (друг)
#foregroundIdFriendly-desc Изображение полосы здоровья дружелюбного персонажа на переднем плане
#backgroundIdEnemy Фон (враг)
#backgroundIdEnemy-desc Фоновое изображение полосы здоровья вражеского персонажа
#foregroundIdEnemy Перед. план (враг)
#foregroundIdEnemy-desc Отобразить на переднем плане шкалы здоровья вражеского персонажа
#backgroundIdSpecial Фон (особый)
#backgroundIdSpecial-desc Фоновое изображение полосы здоровья особого персонажа
#foregroundIdSpecial Пер. план(особый)
#foregroundIdSpecial-desc Отобразить на переднем плане шкалы здоровья особого персонажа
#offsetY Смещение Y
#offsetY-desc Расстояние вертикального смещения полосы здоровья
#scale Масштаб
#scale-desc Коэффициент масштабирования полосы здоровья
#opacity Непрозрачность
#opacity-desc Непрозрачность полосы здоровья

@lang zh
#plugin 生命值条
#desc
脚本方法:
PluginManager.HealthBar.enable()
PluginManager.HealthBar.disable()
PluginManager.HealthBar.switch()
#state 初始状态
#state-enabled 开启
#state-disabled 关闭
#state-desc 可以通过脚本方法开关插件
#display 显示模式
#always 总是显示
#auto 自动
#auto-except-for-player-team 自动(玩家队伍除外)
#in-the-visible-range 在可见范围内
#display-desc 总是显示生命条，或者在受到攻击后显示
#duration 持续时间(ms)
#duration-desc 受到攻击后显示生命条的持续时间
#range 可见范围
#range-desc 如果角色到摄像机中心的距离在可见范围内，则显示生命条
#health 生命值属性
#health-desc 角色的生命值属性名称
#maxHealth 最大生命值属性
#maxHealth-desc 角色的最大生命值属性名称
#specialBarEnabled 特殊生命值条
#specialBarEnabled-true 开启
#specialBarEnabled-false 关闭
#specialBarEnabled-desc 开关特殊生命值条
#specialAttr 特殊属性
#specialAttr-desc 特殊角色拥有的属性名称
#specialAttrValue 特殊属性值
#specialAttrValue-desc 如果角色特殊属性的值是其中一个，则显示特殊生命值条
#backgroundIdFriendly 背景图像(友好)
#backgroundIdFriendly-desc 友方角色的生命值条背景图像
#foregroundIdFriendly 前景图像(友好)
#foregroundIdFriendly-desc 友方角色的生命值条前景图像
#backgroundIdEnemy 背景图像(敌对)
#backgroundIdEnemy-desc 敌方角色的生命值条背景图像
#foregroundIdEnemy 前景图像(敌对)
#foregroundIdEnemy-desc 敌方角色的生命值条前景图像
#backgroundIdSpecial 背景图像(特殊)
#backgroundIdSpecial-desc 特殊角色的生命值条背景图像
#foregroundIdSpecial 前景图像(特殊)
#foregroundIdSpecial-desc 特殊角色的生命值条前景图像
#offsetY 偏移 Y
#offsetY-desc 生命值条的垂直偏移距离
#scale 缩放
#scale-desc 生命值条的缩放系数
#opacity 不透明度
#opacity-desc 生命值条的不透明度
*/

interface Sprite {
  width: number
  height: number
  offsetX: number
  offsetY: number
  right: number
  top: number
  bottom: number
}

// 没有实现GL崩溃时纹理恢复功能
export default class HealthBar implements Script<Plugin> {
  // 接口属性
  state!: 'enabled' | 'disabled'
  display!: 'always' | 'auto' | 'auto-except-for-player-team' | 'in-the-visible-range'
  duration!: number
  range!: number
  health?: Attribute
  maxHealth?: Attribute
  specialBarEnabled!: boolean
  specialAttr?: Attribute
  specialAttrValue?: Enumeration
  backgroundIdFriendly!: string
  foregroundIdFriendly!: string
  backgroundIdEnemy!: string
  foregroundIdEnemy!: string
  backgroundIdSpecial!: string
  foregroundIdSpecial!: string
  offsetY!: number
  scale!: number
  opacity!: number

  // 脚本属性
  enabled: boolean = true
  texture!: Texture
  sprites: Array<Sprite | null> = new Array(6).fill(null)
  healthKey!: string
  maxHealthKey!: string
  isHidden!: (actor: Actor) => boolean
  switcher!: (actor: Actor) => number

  async onStart(): Promise<void> {
    // 设置初始状态
    switch (this.state) {
      case 'disabled':
        this.disable()
        break
    }

    // 设置属性键
    this.healthKey = this.health?.key ?? ''
    this.maxHealthKey = this.maxHealth?.key ?? ''

    // 侦听事件
    Scene.on('load', scene => {
      scene.renderers.push(this)
    })

    // 创建精灵列表和纹理
    const sprites = this.sprites
    const texture = new Texture()
    this.texture = texture

    // 创建图像列表
    const images: Array<HTMLImageElement | Promise<any> | string> = [
      this.backgroundIdFriendly,
      this.foregroundIdFriendly,
      this.backgroundIdEnemy,
      this.foregroundIdEnemy,
      this.backgroundIdSpecial,
      this.foregroundIdSpecial,
    ]

    // 创建隐藏状态检查器
    const {duration} = this
    switch (this.display) {
      case 'always':
        this.isHidden = () => false
        break
      case 'auto':
        this.isHidden = actor => {
          return Time.elapsed - actor.hitTimestamp > duration
        }
        break
      case 'auto-except-for-player-team':
        this.isHidden = actor => {
          if (actor.teamId === Party.player?.teamId) return false
          return Time.elapsed - actor.hitTimestamp > duration
        }
        break
      case 'in-the-visible-range': {
        const rangeSquared = this.range ** 2
        this.isHidden = actor => {
          return (Camera.x - actor.x) ** 2 + (Camera.y - actor.y) ** 2 > rangeSquared
        }
        break
      }
    }

    // 创建精灵索引切换器
    const {specialBarEnabled, specialAttr, specialAttrValue} = this
    if (specialBarEnabled && specialAttr && specialAttrValue) {
      const specialKey = specialAttr.key
      const specialValue = specialAttrValue.value
      // 创建完整版的切换器
      this.switcher = (actor: Actor) => {
        if (actor.attributes[specialKey] === specialValue) return 4
        if (actor === Party.player || !Party.player) return 0
        return (Team.getRelationByIndexes(Party.player.teamIndex, actor.teamIndex) ^ 1) << 1
      }
    } else {
      delete images[4]
      delete images[5]
      // 创建简化版的切换器
      this.switcher = (actor: Actor) => {
        if (actor === Party.player || !Party.player) return 0
        return (Team.getRelationByIndexes(Party.player.teamIndex, actor.teamIndex) ^ 1) << 1
      }
    }

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
      const sprite = {
        width: width,
        height: height,
        offsetX: -width >> 1,
        offsetY: -height >> 1,
        right: 0,
        top: 0,
        bottom: 0,
      }
      sprites[i] = sprite
      fullWidth = Math.max(fullWidth, width)
      fullHeight += height
    }

    // 上传图像数据到纹理
    texture.resize(fullWidth, fullHeight)
    for (let i = 0, y = 0; i < length; i++) {
      const sprite = sprites[i]
      if (!sprite) continue
      const {width, height} = sprite
      GL.texSubImage2D(GL.TEXTURE_2D, 0, 0, y, width, height, GL.RGBA, GL.UNSIGNED_BYTE, images[i] as HTMLImageElement)
      sprite.right = width / fullWidth
      sprite.top = y / fullHeight
      sprite.bottom = (y += height) / fullHeight
    }

    // 缩放参数
    const scale = this.scale
    for (const sprite of sprites) {
      if (sprite) {
        sprite.width *= scale
        sprite.height *= scale
        sprite.offsetX *= scale
        sprite.offsetY *= scale
      }
    }
  }

  /** 启用 */
  enable(): void {
    if (!this.enabled) {
      this.enabled = true
      // @ts-ignore
      delete this.render
    }
  }

  /** 禁用 */
  disable(): void {
    if (this.enabled) {
      this.enabled = false
      this.render = Function.empty
    }
  }

  /** 开关 */
  switch(): void {
    switch (this.enabled) {
      case false: return this.enable()
      case true: return this.disable()
    }
  }

  /** 渲染 */
  render(): void {
    const gl = GL
    const vertices = gl.arrays[0].float32
    const {healthKey, maxHealthKey, sprites, offsetY, isHidden, switcher} = this
    const {clamp} = Math
    let vi = 0

    // 计算可见角色的生命值条数据
    const convert = Scene.convert
    const actors = Scene.visibleActors
    const count = actors.count
    for (let i = 0; i < count; i++) {
      const actor = actors[i]!
      if (!actor.active || isHidden(actor)) {
        continue
      }
      const attributes = actor.attributes
      const health = attributes[healthKey]
      const maxHealth = attributes[maxHealthKey]
      if (typeof health !== 'number' ||
        typeof maxHealth !== 'number') {
        continue
      }
      const si = switcher(actor)
      const back = sprites[si]
      const fore = sprites[si + 1]
      const point = convert(actor)
      const animY = actor.animation?.offsetY ?? 0
      const x = point.x
      const y = point.y + offsetY + animY
      if (back !== null) {
        const dl = x + back.offsetX
        const dt = y + back.offsetY
        const dr = dl + back.width
        const db = dt + back.height
        const sr = back.right
        const st = back.top
        const sb = back.bottom
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = 0
        vertices[vi + 3] = st
        vertices[vi + 4] = dl
        vertices[vi + 5] = db
        vertices[vi + 6] = 0
        vertices[vi + 7] = sb
        vertices[vi + 8] = dr
        vertices[vi + 9] = db
        vertices[vi + 10] = sr
        vertices[vi + 11] = sb
        vertices[vi + 12] = dr
        vertices[vi + 13] = dt
        vertices[vi + 14] = sr
        vertices[vi + 15] = st
        vi += 16
      }
      if (fore !== null) {
        // 避免零除以零返回NaN
        const progress = health === 0 ? 0
        : clamp(health / maxHealth, 0, 1)
        const dl = x + fore.offsetX
        const dt = y + fore.offsetY
        const dr = dl + fore.width * progress
        const db = dt + fore.height
        const sr = fore.right * progress
        const st = fore.top
        const sb = fore.bottom
        vertices[vi    ] = dl
        vertices[vi + 1] = dt
        vertices[vi + 2] = 0
        vertices[vi + 3] = st
        vertices[vi + 4] = dl
        vertices[vi + 5] = db
        vertices[vi + 6] = 0
        vertices[vi + 7] = sb
        vertices[vi + 8] = dr
        vertices[vi + 9] = db
        vertices[vi + 10] = sr
        vertices[vi + 11] = sb
        vertices[vi + 12] = dr
        vertices[vi + 13] = dt
        vertices[vi + 14] = sr
        vertices[vi + 15] = st
        vi += 16
      }
    }

    // 绘制图像
    if (vi !== 0) {
      gl.alpha = this.opacity
      const program = gl.imageProgram.use()
      const matrix = Matrix.instance.project(
        gl.flip,
        Camera.width,
        Camera.height,
      ).translate(-Camera.scrollLeft, -Camera.scrollTop)
      gl.bindVertexArray(program.vao.a110)
      gl.vertexAttrib1f(program.a_Opacity, 1)
      gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
      gl.uniform1i(program.u_LightMode, 0)
      gl.uniform1i(program.u_ColorMode, 0)
      gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
      gl.bindTexture(gl.TEXTURE_2D, this.texture.base.glTexture)
      gl.drawElements(gl.TRIANGLES, vi / 16 * 6, gl.UNSIGNED_INT, 0)
    }
  }
}