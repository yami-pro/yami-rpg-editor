/** ******************************** 音频管理器 ******************************** */

let AudioManager = new class GameAudioManager {
  /** 音频上下文对象 */
  public context!: AudioContext
  /** BGM播放器 */
  public bgm!: SingleAudioPlayer
  /** BGS播放器 */
  public bgs!: SingleAudioPlayer
  /** CV播放器 */
  public cv!: SingleAudioPlayer
  /** SE播放器 */
  public se!: MultipleAudioPlayer
  /** SE衰减距离 */
  public attenDist!: number
  /** SE衰减过渡曲线ID */
  public attenEasingId!: string

  /** 初始化音频管理器 */
  public initialize(): void {
    // 创建音频上下文
    const context = new AudioContext()
    this.context = context

    // 创建播放器
    const bgm = new SingleAudioPlayer(true)
    const bgs = new SingleAudioPlayer(true)
    const cv = new SingleAudioPlayer(false)
    const se = new MultipleAudioPlayer()
    this.bgm = bgm
    this.bgs = bgs
    this.cv = cv
    this.se = se
    this.attenDist = Data.config.soundAttenuation.distance
    this.attenEasingId = Data.config.soundAttenuation.easingId

    Promise.resolve().then(() => {
      // 创建混响卷积器(比较消耗CPU，放到栈尾执行避免阻塞)
      AudioReverb.getConvolver()
    })

    // 移动设备：切出去的时候暂停播放
    if (Stats.isMobile()) {
      document.on('visibilitychange', () => {
        if (context.state === 'running') {
          if (document.hidden) {
            bgm.pause()
            bgs.pause()
            cv.pause()
            se.pause()
          } else {
            bgm.continue()
            bgs.continue()
            cv.continue()
            se.continue()
          }
        }
      })
    }

    // Web模式：按下键盘或鼠标时恢复音频上下文
    // 如果在用户发生交互操作前创建了音频上下文
    // 被Chrome浏览器默认暂停以避免打扰用户
    if (context.state === 'suspended') {
      const resume = (event: Event) => {
        if (context.state === 'suspended') {
          context.resume()
        }
      }
      const statechange = (event: Event) => {
        if (context.state === 'running') {
          bgm.audio.src &&
          bgm.audio.play()
          bgs.audio.src &&
          bgs.audio.play()
          cv.audio.src &&
          cv.audio.play()
          for (const audio of se.audios) {
            audio.src &&
            audio.play()
          }
          window.off('keydown', resume, {capture: true})
          window.off('mousedown', resume, {capture: true})
          window.off('touchend', resume, {capture: true})
          context.off('statechange', statechange)
        }
      }
      // 以下这些事件在Android测试后可以有效恢复音频上下文
      window.on('keydown', resume, {capture: true})
      window.on('mousedown', resume, {capture: true})
      window.on('touchend', resume, {capture: true})
      context.on('statechange', statechange)
    }
  }

  /** 重置所有音频播放器 */
  public reset(): void {
    this.bgm.reset()
    this.bgs.reset()
    this.cv.reset()
    this.se.reset()
  }

  /**
   * 更新音频
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    this.se.update(deltaTime)
  }
}

/** ******************************** 单源音频播放器 ******************************** */

class SingleAudioPlayer {
  /** HTML音频元素 */
  public audio: HTMLAudioPlayer
  /** 媒体元素音频源节点 */
  public source: MediaElementAudioSourceNode
  /** 音量增益节点 */
  public gain: GainNode
  /** 左右声道控制节点 */
  public panner: StereoPannerNode
  /** 混响节点 */
  public reverb: AudioReverb | null
  /** 音频保存状态缓存 */
  public cache: AudioSaveData | null
  /** 音频默认循环播放 */
  private defaultLoop: boolean
  /** 音量过渡计时器 */
  private volumeTransition: Timer | null
  /** 声像过渡计时器 */
  private panTransition: Timer | null

  /**
   * 单源音频播放器
   * @param loop 设置默认播放循环
   */
  constructor(loop: boolean) {
    const {context} = AudioManager
    this.audio = new Audio() as HTMLAudioPlayer
    this.source = context.createMediaElementSource(this.audio)
    this.gain = context.createGain()
    this.panner = context.createStereoPanner()
    this.reverb = null
    this.cache = null
    this.volumeTransition = null
    this.panTransition = null
    this.defaultLoop = loop
    this.audio.autoplay = true
    this.audio.loop = loop
    this.audio.guid = ''

    // 连接节点
    this.source.connect(this.gain)
    this.gain.connect(this.panner)
    this.panner.connect(context.destination)
  }

  /**
   * 播放音频文件
   * @param guid 音频文件ID
   * @param volume 播放音量[0-1]
   */
  public play(guid: string, volume: number = 1): void {
    if (guid) {
      const audio = this.audio
      if (audio.guid !== guid ||
        audio.readyState !== 4 ||
        audio.ended === true) {
        audio.src = Loader.getBlobOrRawUrl(guid)
        audio.guid = guid
        audio.volume = volume
      }
    }
  }

  /** 停止播放 */
  public stop(): void {
    const audio = this.audio
    audio.pause()
    audio.currentTime = 0
    audio.guid = ''
  }

  /** 暂停播放 */
  public pause(): void {
    const audio = this.audio
    if (audio.duration > 0 &&
      audio.ended === false &&
      audio.paused === false) {
      audio.pause()
    }
  }

  /** 继续播放 */
  public continue(): void {
    const audio = this.audio
    if (audio.duration > 0 &&
      audio.ended === false &&
      audio.paused === true) {
      audio.play()
    }
  }

  /** 保存当前的播放状态 */
  public save(): void {
    const audio = this.audio
    this.cache = {
      guid: audio.guid,
      offset: audio.currentTime,
    }
  }

  /** 恢复保存的播放状态 */
  public restore(): void {
    const cache = this.cache
    if (cache !== null) {
      const audio = this.audio
      audio.src = Loader.getBlobOrRawUrl(cache.guid)
      audio.guid = cache.guid
      audio.currentTime = cache.offset
      this.cache = null
    }
  }

  /**
   * 设置音量
   * @param volume 播放音量[0-1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setVolume(volume: number, easingId: string = '', duration: number = 0): void {
    // 如果上一次的音量过渡未结束，移除
    if (this.volumeTransition !== null) {
      this.volumeTransition.remove()
      this.volumeTransition = null
    }
    const {gain} = this.gain
    if (duration > 0) {
      const start = gain.value
      const end = volume
      const easing = Easing.get(easingId)
      // 创建音量过渡计时器
      this.volumeTransition = new Timer({
        duration: duration,
        update: timer => {
          const time = easing.get(timer.elapsed / timer.duration)
          gain.value = Math.clamp(start * (1 - time) + end * time, 0, 1)
        },
        callback: () => {
          this.volumeTransition = null
        },
      }).add()
    } else {
      // 直接设置音量
      gain.value = Math.clamp(volume, 0, 1)
    }
  }

  /**
   * 设置声像(左右声道音量)
   * @param pan 声像[-1~+1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setPan(pan: number, easingId: string = '', duration: number = 0): void {
    // 如果上一次的声像过渡未结束，移除
    if (this.panTransition !== null) {
      this.panTransition.remove()
      this.panTransition = null
    }
    const panner = this.panner.pan
    if (duration > 0) {
      const start = panner.value
      const end = pan
      const easing = Easing.get(easingId)
      // 创建声像过渡计时器
      this.panTransition = new Timer({
        duration: duration,
        update: timer => {
          const time = easing.get(timer.elapsed / timer.duration)
          panner.value = Math.clamp(start * (1 - time) + end * time, -1, 1)
        },
        callback: () => {
          this.panTransition = null
        },
      }).add()
    } else {
      // 直接设置声像
      panner.value = Math.clamp(pan, -1, 1)
    }
  }

  /**
   * 设置混响
   * @param dry 干声增益[0-1]
   * @param wet 湿声增益[0-1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setReverb(dry: number, wet: number, easingId: string = '', duration: number = 0): void {
    if (this.reverb === null && !(
      dry === 1 && wet === 0)) {
      // 满足条件时创建混响管理器
      new AudioReverb(this)
    }
    if (this.reverb !== null) {
      // 设置混响参数(混响管理器可能被删除)
      this.reverb.set(dry, wet, easingId, duration)
    }
  }

  /**
   * 设置循环
   * @param loop 循环播放
   */
  public setLoop(loop: boolean): void {
    this.audio.loop = loop
  }

  /** 重置音频播放器 */
  public reset(): void {
    this.stop()
    this.setVolume(1)
    this.setPan(0)
    this.setReverb(1, 0, '', 0)
    this.setLoop(this.defaultLoop)
    this.cache = null
  }
}

/** ******************************** 多源音频播放器 ******************************** */

class MultipleAudioPlayer {
  /** 备用的音频元素池 */
  private audioPool: Array<HTMLAudioPlayer2>
  /** 正在播放的音频元素列表 */
  public audios: Array<HTMLAudioPlayer2>
  /** 音量增益节点 */
  public gain: GainNode
  /** 左右声道控制节点 */
  public panner: StereoPannerNode
  /** 混响节点 */
  public reverb: AudioReverb | null
  /** 音量过渡计时器 */
  private volumeTransition: Timer | null
  /** 声像过渡计时器 */
  private panTransition: Timer | null

  /** 多源音频播放器 */
  constructor() {
    const {context} = AudioManager
    this.audioPool = []
    this.audios = []
    this.gain = context.createGain()
    this.panner = context.createStereoPanner()
    this.reverb = null
    this.volumeTransition = null
    this.panTransition = null

    // 连接节点
    this.gain.connect(this.panner)
    this.panner.connect(context.destination)
  }

  /**
   * 更新音频
   * @param deltaTime 增量时间(毫秒)
   */
  public update(deltaTime: number): void {
    for (const audio of this.audios) {
      audio.update(deltaTime)
    }
  }

  /** 获取音频元素 */
  private getAudio(): HTMLAudioPlayer2 {
    let audio = this.audioPool.pop()
    if (audio === undefined) {
      audio = new Audio() as HTMLAudioPlayer2
      const source = AudioManager.context.createMediaElementSource(audio)
      const onStop = () => {
        if (this.audios.remove(audio!)) {
          this.audioPool.push(audio!)
          audio!.update = Function.empty
          source.disconnect(this.gain)
        }
      }
      audio.onStop = onStop
      audio.autoplay = true
      audio.source = source
      audio.update = Function.empty
      audio.on('ended', onStop)
      audio.on('error', onStop)
    }
    this.audios.push(audio)
    audio.source.connect(this.gain)
    return audio
  }

  /**
   * 获取不久前的音频元素
   * @param guid 音频文件ID
   * @returns 音频元素
   */
  private getRecentlyAudio(guid: string): HTMLAudioPlayer2 | undefined {
    for (const audio of this.audios) {
      if (audio.guid === guid && audio.currentTime < 0.05) {
        return audio
      }
    }
    return undefined
  }

  /**
   * 播放音频文件
   * @param guid 音频文件ID
   * @param volume 播放音量[0-1]
   * @param playbackRate 播放速度
   */
  public play(guid: string, volume: number = 1, playbackRate: number = 1): HTMLAudioPlayer2 | undefined {
    if (guid) {
      const audio = this.getRecentlyAudio(guid)
      if (audio) {
        audio.volume = Math.max(audio.volume, volume)
        return audio
      } else {
        const audio = this.getAudio()
        audio.guid = guid
        audio.timestamp = Time.timestamp
        audio.src = Loader.getBlobOrRawUrl(guid)
        audio.volume = volume
        audio.playbackRate = playbackRate
        return audio
      }
    }
  }

  /**
   * 播放音频文件(距离衰减)
   * @param guid 音频文件ID
   * @param position 声音在场景中的位置
   * @param volume 播放音量[0-1]
   * @param playbackRate 播放速度
   */
   public playAt(guid: string, position: Point, volume: number = 1, playbackRate: number = 1): HTMLAudioPlayer2 | undefined {
    if (Math.dist(Camera.x, Camera.y, position.x, position.y) < AudioManager.attenDist) {
      const audio = this.play(guid, volume, playbackRate)
      if (audio) {
        audio.update = () => {
          audio.volume = volume * this.calcVolumeFactor(position, AudioManager.attenDist)
        }
        audio.update(0)
        return audio
      }
    }
  }

  /**
   * 计算衰减后的音量系数
   * @param position 音效位置
   * @param range 音量衰减范围
   * @returns 音量系数
   */
  public calcVolumeFactor(position: Point, range: number): number {
    const dist = Math.dist(Camera.x, Camera.y, position.x, position.y)
    const easing = Easing.get(AudioManager.attenEasingId)
    const attenuation = easing.get(dist / range)
    return 1 - attenuation
  }

  /** 停止播放 */
  public stop(): void {
    const {audios} = this
    let i = audios.length
    while (--i >= 0) {
      audios[i].src = ''
      audios[i].onStop()
    }
  }

  /** 暂停播放 */
  public pause(): void {
    for (const audio of this.audios) {
      if (audio.ended === false &&
        audio.paused === false) {
        audio.pause()
      }
    }
  }

  /** 继续播放 */
  public continue(): void {
    for (const audio of this.audios) {
      if (audio.ended === false &&
        audio.paused === true) {
        audio.play()
      }
    }
  }

  /**
   * 设置音量
   * @param volume 播放音量[0-1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setVolume(volume: number, easingId: string = '', duration: number = 0): void {
    // 如果上一次的音量过渡未结束，移除
    if (this.volumeTransition !== null) {
      this.volumeTransition.remove()
      this.volumeTransition = null
    }
    const {gain} = this.gain
    if (duration > 0) {
      const start = gain.value
      const end = volume
      const easing = Easing.get(easingId)
      // 创建音量过渡计时器
      this.volumeTransition = new Timer({
        duration: duration,
        update: timer => {
          const time = easing.get(timer.elapsed / timer.duration)
          gain.value = Math.clamp(start * (1 - time) + end * time, 0, 1)
        },
        callback: () => {
          this.volumeTransition = null
        },
      }).add()
    } else {
      // 直接设置音量
      gain.value = Math.clamp(volume, 0, 1)
    }
  }

  /**
   * 设置声像(左右声道音量)
   * @param pan 声像[-1~+1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setPan(pan: number, easingId: string = '', duration: number = 0): void {
    if (this.panTransition !== null) {
      this.panTransition.remove()
      this.panTransition = null
    }
    const panner = this.panner.pan
    if (duration > 0) {
      const start = panner.value
      const end = pan
      const easing = Easing.get(easingId)
      this.panTransition = new Timer({
        duration: duration,
        update: timer => {
          const time = easing.get(timer.elapsed / timer.duration)
          panner.value = Math.clamp(start * (1 - time) + end * time, -1, 1)
        },
        callback: () => {
          this.panTransition = null
        },
      }).add()
    } else {
      panner.value = Math.clamp(pan, -1, 1)
    }
  }

  /**
   * 设置混响
   * @param dry 干声增益[0-1]
   * @param wet 湿声增益[0-1]
   * @param easingId 过渡曲线ID
   * @param duration 持续时间(毫秒)
   */
  public setReverb(dry: number, wet: number, easingId: string = '', duration: number = 0): void {
    if (this.reverb === null && !(
      dry === 1 && wet === 0)) {
      new AudioReverb(this)
    }
    if (this.reverb !== null) {
      this.reverb.set(dry, wet, easingId, duration)
    }
  }

  /** 重置音频播放器 */
  public reset(): void {
    this.stop()
    this.setVolume(1)
    this.setPan(0)
    this.setReverb(1, 0, '', 0)
  }
}

/** ******************************** 音频混响 ******************************** */

class AudioReverb {
  /** 添加混响的音频播放器 */
  private player: SingleAudioPlayer | MultipleAudioPlayer
  /** 音频输入节点 */
  private input: StereoPannerNode
  /** 音频输出节点 */
  private output: AudioDestinationNode
  /** 干声增益节点 */
  private dryGain: GainNode
  /** 湿声增益节点 */
  private wetGain: GainNode
  /** 卷积器节点 */
  private convolver: ConvolverNode
  /** 干声音量[0-1] */
  private dry: number
  /** 湿声音量[0-1] */
  private wet: number
  /** 混响过渡计时器 */
  private transition: Timer | null

  /**
   * 音频混响
   * @param player 音频播放器实例
   */
  constructor(player: SingleAudioPlayer | MultipleAudioPlayer) {
    const {context} = AudioManager
    this.player = player
    this.input = player.panner
    this.output = context.destination
    this.dryGain = context.createGain()
    this.wetGain = context.createGain()
    this.convolver = AudioReverb.getConvolver()
    this.dry = -1
    this.wet = -1
    this.transition = null

    // 连接节点
    this.connect()
  }

  /** 连接节点 */
  private connect(): void {
    this.player.reverb = this
    this.input.disconnect(this.output)
    this.input.connect(this.dryGain)
    this.dryGain.connect(this.output)
    this.input.connect(this.wetGain)
    this.wetGain.connect(this.convolver)
  }

  /** 断开节点 */
  private disconnect(): void {
    this.player.reverb = null
    this.input.disconnect(this.dryGain)
    this.dryGain.disconnect(this.output)
    this.input.disconnect(this.wetGain)
    this.wetGain.disconnect(this.convolver)
    this.input.connect(this.output)
  }

  /**
   * 设置混响参数
   * @param dry 干声增益[0-1]
   * @param wet 湿声增益[0-1]
   * @param easingId 过渡曲线
   * @param duration 持续时间(毫秒)
   */
  public set(dry: number, wet: number, easingId: string = '', duration: number = 0): void {
    // 如果上一次的混响过渡未结束，移除
    if (this.transition !== null) {
      this.transition.remove()
      this.transition = null
    }
    if (duration > 0) {
      if (this.dry === null) {
        this.setDry(1)
        this.setWet(0)
      }
      const startDry = this.dry
      const startWet = this.wet
      const easing = Easing.get(easingId)
      // 创建混响过渡计时器
      this.transition = new Timer({
        duration: duration,
        update: timer => {
          const time = easing.get(timer.elapsed / timer.duration)
          this.setDry(startDry * (1 - time) + dry * time)
          this.setWet(startWet * (1 - time) + wet * time)
        },
        callback: () => {
          this.transition = null
          if (dry === 1 && wet === 0) {
            this.disconnect()
          }
        },
      }).add()
    } else {
      // 直接设置混响
      this.setDry(dry)
      this.setWet(wet)
      // 如果没有混响，断开连接
      if (dry === 1 && wet === 0) {
        this.disconnect()
      }
    }
  }

  /**
   * 设置干声
   * @param dry 干声增益[0-1]
   */
  private setDry(dry: number): void {
    if (this.dry !== dry) {
      this.dry = dry
      this.dryGain.gain.value = dry
    }
  }

  /**
   * 设置湿声
   * @param wet 湿声增益[0-1]
   */
  private setWet(wet: number): void {
    if (this.wet !== wet) {
      this.wet = wet
      this.wetGain.gain.value = wet * 2
    }
  }

  /**
   * 获取卷积器
   * @returns 卷积器节点
   */
  public static getConvolver(): ConvolverNode {
    if (!AudioReverb.convolver) {
      const PREDELAY = 0.1
      const DECAYTIME = 2
      const context = AudioManager.context
      const duration = PREDELAY + DECAYTIME
      const sampleRate = context.sampleRate
      const sampleCount = Math.round(sampleRate * duration)
      const convolver = context.createConvolver()
      const filter = context.createBiquadFilter()
      const buffer = context.createBuffer(2, sampleCount, sampleRate)
      const bufferLength = buffer.length
      const delayLength = Math.round(bufferLength * PREDELAY / duration)
      const decayLength = Math.round(bufferLength * DECAYTIME / duration)
      const random = Math.random
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const samples = buffer.getChannelData(i)
        for (let i = 0; i < delayLength; i++) {
          samples[i] = (random() * 2 - 1) * i / delayLength
        }
        for (let i = delayLength; i < bufferLength; i++) {
          const time = (bufferLength - i) / decayLength
          samples[i] = (random() * 2 - 1) * time
        }
      }
      convolver.buffer = buffer
      filter.type = 'lowpass'
      filter.frequency.value = 3000
      convolver.connect(filter)
      filter.connect(context.destination)
      AudioReverb.convolver = convolver
    }
    return AudioReverb.convolver
  }

  /** 共享卷积器 */
  private static convolver: ConvolverNode
}