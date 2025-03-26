/*
@plugin #plugin
@version 1.0
@author
@link

@number minRed
@alias #minRed
@clamp -255 255

@number maxRed
@alias #maxRed
@clamp -255 255

@number minGreen
@alias #minGreen
@clamp -255 255

@number maxGreen
@alias #maxGreen
@clamp -255 255

@number minBlue
@alias #minBlue
@clamp -255 255

@number maxBlue
@alias #maxBlue
@clamp -255 255

@number minGray
@alias #minGray
@clamp 0 255

@number maxGray
@alias #maxGray
@clamp 0 255

@lang en
#plugin Trigger - Animation Tint
#minRed Min Red
#maxRed Max Red
#minGreen Min Green
#maxGreen Max Green
#minBlue Min Blue
#maxBlue Max Blue
#minGray Min Gray
#maxGray Max Gray

@lang ru
#plugin Триггер - Анимация тона
#minRed Мин Красный
#maxRed Мак Красный
#minGreen Мин Зеленый
#maxGreen Мак Зеленый
#minBlue Мин Синий
#maxBlue Мак Синий
#minGray Мин Серый
#maxGray Мак Серый

@lang zh
#plugin 触发器 - 动画色调
#minRed 红色(最小值)
#maxRed 红色(最大值)
#minGreen 绿色(最小值)
#maxGreen 绿色(最大值)
#minBlue 蓝色(最小值)
#maxBlue 蓝色(最大值)
#minGray 灰度(最小值)
#maxGray 灰度(最大值)
*/

export default class Trigger_Tint implements Script<Trigger> {
  // 接口属性
  minRed!: number
  maxRed!: number
  minGreen!: number
  maxGreen!: number
  minBlue!: number
  maxBlue!: number
  minGray!: number
  maxGray!: number

  // 脚本属性
  trigger: Trigger

  constructor(trigger: Trigger) {
    this.trigger = trigger
  }

  onStart(): void {
    const {animation} = this.trigger
    if (animation !== null) {
      const tint = new Int16Array(4) as unknown as ImageTint
      tint[0] = Math.randomInt(this.minRed, this.maxRed)
      tint[1] = Math.randomInt(this.minGreen, this.maxGreen)
      tint[2] = Math.randomInt(this.minBlue, this.maxBlue)
      tint[3] = Math.randomInt(this.minGray, this.maxGray)
      animation.tints.push(tint)
    }
  }
}