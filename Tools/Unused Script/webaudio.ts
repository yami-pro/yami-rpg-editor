/** ******************************** 单缓冲音频播放器 (Web Audio API) ******************************** */

class SingleBufferAudioPlayer {
  /** 音频缓冲源节点 */
  private source: AudioBufferSourceNode | null
  /** 音量增益节点 */
  public gain: GainNode
  /** 声像控制节点 */
  public panner: StereoPannerNode
  /** 混响节点 */
  public reverb: AudioReverb | null
  /** 当前播放的音频GUID */
  private guid: string
  /** 当前音量 */
  private volume: number
  /** 是否正在播放 */
  private playing: boolean
  /** 开始播放时间 */
  private startTime: number
  /** 暂停时的播放偏移秒数 */
  private pauseOffset: number
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
    this.source = null
    this.gain = context.createGain()
    this.panner = context.createStereoPanner()
    this.reverb = null
    this.guid = ''
    this.volume = 1
    this.playing = false
    this.startTime = 0
    this.pauseOffset = 0
    this.cache = null
    this.volumeTransition = null
    this.panTransition = null
    this.defaultLoop = loop

    // 连接节点
    this.gain.connect(this.panner)
    this.panner.connect(context.destination)
  }

  /**
   * 播放音频文件
   * @param guid 音频文件ID
   * @param volume 播放音量[0-1]
   */
  public async play(guid: string, volume: number = 1, offset: number = 0): Promise<void> {
    if (guid) {
      this.stop()
      this.guid = guid
      const buffer = await Loader.getAudioBuffer(guid)
      if (this.guid === guid) {
        const context = AudioManager.context
        const source = context.createBufferSource()
        source.buffer = buffer
        source.loop = this.defaultLoop
        source.connect(this.gain)
        this.gain.gain.value = volume
        this.volume = volume
        this.source = source
        this.startTime = context.currentTime - offset
        this.playing = true
        source.start(0, offset)
      }
    }
  }

  /** 停止播放 */
  public stop(): void {
    if (this.source) {
      try {
        this.source.stop()
      } catch {}
      this.source.disconnect()
      this.source = null
    }
    this.guid = ''
    this.pauseOffset = 0
    this.playing = false
  }

  /** 暂停播放 */
  public pause(): void {
    if (this.source && this.playing) {
      try {
        this.source.stop()
      } catch {}
      this.source.disconnect()
      this.source = null
      this.pauseOffset = AudioManager.context.currentTime - this.startTime
      this.playing = false
    }
  }

  /** 继续播放 */
  public async continue(): Promise<void> {
    if (!this.guid || this.playing) return
    await this.play(this.guid, this.volume, this.pauseOffset)
  }

  /** 保存当前的播放状态 */
  public save(): void {
    this.cache = {
      guid: this.guid,
      offset: this.playing
      ? AudioManager.context.currentTime - this.startTime
      : this.pauseOffset,
    }
  }

  /** 恢复保存的播放状态 */
  public async restore(): Promise<void> {
    const cache = this.cache
    if (cache !== null) {
      this.cache = null
      await this.play(cache.guid, this.volume, cache.offset)
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
    if (this.source) {
      this.source.loop = loop
    }
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

let Loader = new class FileLoader {
  /** {guid:音频缓冲区}缓存表 */
  private cachedAudioBuffers: HashMap<AudioBuffer | Promise<AudioBuffer>> = {}

  /**
   * 获取或加载解码后的音频缓冲区
   * @param guid 音频文件的GUID
   * @returns 音频缓冲区
   */
  public async getAudioBuffer(guid: string): Promise<AudioBuffer> {
    // 如果存在缓存则直接返回
    const audioBuffers = this.cachedAudioBuffers
    const audioBuffer = audioBuffers[guid]
    if (audioBuffer instanceof AudioBuffer) {
      return audioBuffer
    }
    if (audioBuffer instanceof Promise) {
      return await audioBuffer
    }

    // 否则加载并解码后缓存
    const promise = (async () => {
      const path = this.getPathByGUID(guid)
      const arrayBuffer = await this.get({path, type: 'arraybuffer'})
      const audioBuffer = await AudioManager.context.decodeAudioData(arrayBuffer)
      audioBuffers[guid] = audioBuffer
      return audioBuffer
    })()

    audioBuffers[guid] = promise
    return await promise
  }
}