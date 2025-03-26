/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@file animationId
@alias #animationId
@filter animation

@enum motion
@alias #motion

@number priority
@alias #priority
@clamp -4 4

@lang en
#plugin Map Marker
#desc
Play a marker animation at the specified position

Script Methods:
PluginManager.MapMarker.set(x, y)
#animationId Pointer Animation
#motion Motion
#priority Animation Priority

@lang ru
#plugin Маркер на карте
#desc
Воспроизведите анимацию маркера в указанном месте

Скриптовый метод:
PluginManager.MapMarker.set(x, y)
#animationId Анимация маркера
#motion Действие
#priority Приоритет

@lang zh
#plugin 地图标记
#desc
在指定位置播放一个标记动画

脚本方法:
PluginManager.MapMarker.set(x, y)
#animationId 标记动画
#motion 动作
#priority 动画优先级
*/

declare global {
  interface SceneAnimation {
    [VERSION]: number
  }
}

const VERSION: unique symbol = Symbol('MAP_MARKER_VERSION')

export default class MapMarker implements Script<Plugin> {
  // 接口属性
  animationId!: string
  motion?: Enumeration
  priority!: number

  // 脚本属性
  motionName!: string
  position!: Point
  animation!: SceneAnimation

  onStart(): void {
    this.motionName = this.motion?.value ?? ''
    const data = Data.animations[this.animationId]
    if (data) {
      this.position = {x: 0, y: 0}
      this.animation = new SceneAnimation(data)
      this.animation.setPosition(this.position)
      this.animation.priority = this.priority
      this.animation.destroy = Function.empty
      this.animation[VERSION] = 0
      this.animation.temporary = true
    }
  }

  /**
   * 设置位置
   * @param x 场景X
   * @param y 场景Y
   */
  set(x: number, y: number): void {
    const {animation} = this
    const manager = Scene.animation
    if (Scene.binding !== null &&
      animation instanceof SceneAnimation) {
      this.position.x = x
      this.position.y = y
      // 如果动画已经添加到管理器中
      animation.parent?.remove(animation)
      // 否则添加到场景中
      manager.append(animation)
      const version = ++animation[VERSION]
      if (animation.setMotion(this.motionName)) {
        animation.restart()
        animation.onFinish(() => {
          Callback.push(() => {
            if (animation[VERSION] === version) {
              manager.remove(animation)
            }
          })
        })
      }
    }
  }
}