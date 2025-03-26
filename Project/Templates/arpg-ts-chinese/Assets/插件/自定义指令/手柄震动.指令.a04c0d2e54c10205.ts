/*
@plugin #plugin
@version 1.0
@author
@link
@desc #desc

@number startDelay
@alias #startDelay
@desc #startDelay-desc
@clamp 0 60000

@number duration
@alias #duration
@desc #duration-desc
@clamp 0 60000
@default 1000

@number weakMagnitude
@alias #weakMagnitude
@desc #weakMagnitude-desc
@decimals 4
@clamp 0 1
@default 1

@number strongMagnitude
@alias #strongMagnitude
@desc #strongMagnitude-desc
@decimals 4
@clamp 0 1
@default 1

@lang en
#plugin Gamepad Vibration
#desc This is an experimental technology that currently only works in the Chromium browser
#startDelay Start Delay
#startDelay-desc The delay in milliseconds before the effect is started.
#duration Duration
#duration-desc The duration of the effect in milliseconds.
#weakMagnitude Weak Magnitude
#weakMagnitude-desc Rumble intensity of the high-frequency (weak) rumble motors, normalized to the range between 0.0 and 1.0.
#strongMagnitude Strong Magnitude
#strongMagnitude-desc Rumble intensity of the low-frequency (strong) rumble motors, normalized to the range between 0.0 and 1.0.

@lang ru
#plugin Вибрация геймпада
#desc Это экспериментальная технология, и в настоящее время она работает только в браузере Chromium
#startDelay Нач. задержка
#startDelay-desc Задержка (в миллисекундах) перед началом действия вибрации.
#duration Продолж-сть
#duration-desc Продолж-сть вибрации в (ms).
#weakMagnitude Слабая амплитуда
#weakMagnitude-desc Сила высокочастотного (слабого) гула двигателя, нормализованная в диапазоне от 0,0 до 1,0.
#strongMagnitude Сильная амплитуда 
#strongMagnitude-desc Сила низкочастотного (сильного) гула двигателя, нормализованная в диапазоне от 0,0 до 1,0.

@lang zh
#plugin 手柄震动
#desc 这是一项实验性技术，目前只能在Chromium浏览器中工作
#startDelay 初始延时
#startDelay-desc 效果开始前的延迟（以毫秒为单位）。
#duration 持续时间
#duration-desc 效果的持续时间（以毫秒为单位）。
#weakMagnitude 弱震动幅度
#weakMagnitude-desc 高频（弱）隆隆声电机的强度，归一化为 0.0 到 1.0 之间的范围。
#strongMagnitude 强震动幅度
#strongMagnitude-desc 低频（强）隆隆声电机的强度，归一化为 0.0 到 1.0 之间的范围。
*/

// ******************************** 游戏手柄 ********************************

export default class GamepadVibration implements Script<Command> {
  // 接口属性
  startDelay!: number
  duration!: number
  weakMagnitude!: number
  strongMagnitude!: number

  onStart(): void {
    Game.on('quit', () => this.resetEffect())
  }

  call(): void {
    return this.playEffect()
  }

  /** 获取游戏手柄 */
  getGamepad(): Gamepad | null {
    const pads = navigator.getGamepads()
    for (const pad of pads) {
      if (pad) return pad
    }
    return null
  }

  /** 播放震动效果 */
  playEffect(): void {
    const pad = this.getGamepad()
    if (pad === null) return
    // @ts-ignore
    if (pad.vibrationActuator?.type === 'dual-rumble') {
      pad.vibrationActuator.playEffect('dual-rumble', {
        startDelay: this.startDelay,
        duration: this.duration,
        weakMagnitude: this.weakMagnitude,
        strongMagnitude: this.strongMagnitude,
      })
    }
  }

  /** 重置震动效果 */
  resetEffect(): void {
    const pad = this.getGamepad()
    if (pad === null) return
    // @ts-ignore
    if (pad.vibrationActuator?.type === 'dual-rumble') {
      pad.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 0,
        weakMagnitude: 0,
        strongMagnitude: 0,
      })
    }
  }
}