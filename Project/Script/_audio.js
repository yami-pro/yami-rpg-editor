'use strict'

// ******************************** 音频管理器 ********************************

const AudioManager = {
  // properties
  context: null,
  player: null,
  se: null,
  analyser: null,
  waveforms: {},
  // methods
  initialize: null,
  getWaveform: null,
  close: null,
}

// 初始化
AudioManager.initialize = function () {
  // 创建音频上下文
  this.context = new AudioContext()

  // 创建分析器
  this.analyser = this.context.createAnalyser()
  this.analyser.connect(this.context.destination)

  // 创建音频播放器
  this.player = new AudioPlayer()

  // 创建音效播放器
  this.se = new MultipleAudioPlayer()
}

// 获取波形图
AudioManager.getWaveform = function (guid) {
  const waveforms = this.waveforms
  const waveform = waveforms[guid]
  switch (typeof waveform) {
    case 'string':
      return Promise.resolve().then(() => waveform)
    case 'object':
      return waveform
  }
  const promise = waveforms[guid] = File.get({
    guid: guid,
    type: 'arraybuffer',
  }).then(
    response => {
      if (waveforms[guid] !== promise) {
        return
      }
      // 解码音频数据会阻塞线程
      // 可以通过取消操作来避免
      if (promise.canceled) {
        delete waveforms[guid]
        return
      }
      return this.context.decodeAudioData(response).then(buffer => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 160
        const context = canvas.getContext('2d')
        const channels = buffer.numberOfChannels
        const maxNodes = canvas.width * 8
        const amplitude = canvas.height / channels / 2
        let baseline = amplitude
        for (let i = 0; i < channels; i++) {
          const data = buffer.getChannelData(i)
          const nodes = Math.min(data.length, maxNodes)
          const step1 = data.length / nodes
          const step2 = canvas.width / nodes
          const floor = Math.floor
          context.beginPath()
          context.moveTo(0, baseline)
          for (let i = 0; i < nodes; i++) {
            const di = floor(i * step1)
            const wave = baseline + amplitude * data[di]
            context.lineTo(i * step2, wave)
          }
          context.strokeStyle = 'white'
          context.stroke()
          baseline += amplitude * 2
        }
        return waveforms[guid] = `url(${canvas.toDataURL()})`
      })
    }
  )
  return promise
}

// 关闭
AudioManager.close = function () {
  this.player.stop()
  this.waveforms = {}
}

// ******************************** 音频播放器类 ********************************

class AudioPlayer {
  audio   //:element
  source  //:object
  panner  //:object
  reverb  //:object

  constructor() {
    const {context} = AudioManager
    this.audio = new Audio()
    this.source = context.createMediaElementSource(this.audio)
    this.panner = context.createStereoPanner()
    this.reverb = null
    this.audio.path = ''

    // 连接节点
    this.source.connect(this.panner)
    this.panner.connect(AudioManager.analyser)
  }

  // 播放
  play(path) {
    if (path) {
      const audio = this.audio
      if (audio.path !== path ||
        audio.readyState !== 4 ||
        audio.ended === true) {
        audio.src = File.route(path)
        audio.path = path
        audio.play()
      }
    } else {
      this.stop()
    }
  }

  // 停止
  stop() {
    const audio = this.audio
    if (audio.path) {
      audio.pause()
      audio.currentTime = 0
      audio.path = ''
    }
  }

  // 设置音量
  setVolume(volume) {
    this.audio.volume = Math.clamp(volume, 0, 1)
  }

  // 设置声像
  setPan(pan) {
    this.panner.pan.value = Math.clamp(pan, -1, 1)
  }

  // 设置混响
  setReverb(dry, wet) {
    if (this.reverb === null && !(
      dry === 1 && wet === 0)) {
      new Reverb(this)
    }
    if (this.reverb !== null) {
      this.reverb.set(dry, wet)
    }
  }

  // 获取参数
  getParams() {
    return {
      volume: Math.roundTo(this.audio.volume, 2),
      pan: Math.roundTo(this.panner.pan.value, 2),
      dry: this.reverb ? Math.roundTo(this.reverb.dryGain.gain.value    , 2) : 1,
      wet: this.reverb ? Math.roundTo(this.reverb.wetGain.gain.value / 2, 2) : 0,
    }
  }
}

// ******************************** 多源音频播放器类 ********************************

class MultipleAudioPlayer {
  /**
   * 备用的音频元素池
   * @type {Array<HTMLAudioElement>}
   */ audioPool

  /**
   * 正在播放的音频元素列表
   * @type {Array<HTMLAudioElement>}
   */ audios

  /** 多源音频播放器 */
  constructor() {
    this.audioPool = []
    this.audios = []
  }

  /** 获取音频元素 */
  getAudio() {
    let audio = this.audioPool.pop()
    if (audio === undefined) {
      audio = new Audio()
      const source = AudioManager.context.createMediaElementSource(audio)
      const onStop = () => {
        if (this.audios.remove(audio)) {
          this.audioPool.push(audio)
          source.disconnect(AudioManager.context.destination)
        }
      }
      audio.onStop = onStop
      audio.autoplay = true
      audio.source = source
      audio.on('ended', onStop)
      audio.on('error', onStop)
    }
    this.audios.push(audio)
    audio.source.connect(AudioManager.context.destination)
    return audio
  }

  /**
   * 获取不久前的音频元素
   * @param {string} guid 音频文件ID
   * @returns {audio|undefined}
   */
  getRecentlyAudio(guid) {
    for (const audio of this.audios) {
      if (audio.guid === guid && audio.currentTime < 0.05) {
        return audio
      }
    }
    return undefined
  }

  /**
   * 播放音频文件
   * @param {string} guid 音频文件ID
   * @param {number} [volume = 1] 播放音量[0-1]
   */
  play(guid, volume = 1) {
    if (guid) {
      const audio = this.getRecentlyAudio(guid)
      if (audio) {
        audio.volume = Math.max(audio.volume, volume)
      } else {
        const audio = this.getAudio()
        audio.guid = guid
        audio.src = File.route(File.getPath(guid))
        audio.volume = volume
      }
    }
  }

  /** 停止播放 */
  stop() {
    const {audios} = this
    let i = audios.length
    while (--i >= 0) {
      audios[i].src = ''
      audios[i].onStop()
    }
  }
}

// ******************************** 混响类 ********************************

class Reverb {
  player    //:object
  input     //:object
  output    //:object
  dryGain   //:object
  wetGain   //:object
  convolver //:object
  dry       //:number
  wet       //:number

  constructor(player) {
    const {context} = AudioManager
    this.player = player
    this.input = player.panner
    this.output = AudioManager.analyser
    this.dryGain = context.createGain()
    this.wetGain = context.createGain()
    this.convolver = this.getConvolver()
    this.dry = -1
    this.wet = -1

    // 连接节点
    this.connect()
  }

  // 连接节点
  connect() {
    this.player.reverb = this
    this.input.disconnect(this.output)
    this.input.connect(this.dryGain)
    this.dryGain.connect(this.output)
    this.input.connect(this.wetGain)
    this.wetGain.connect(this.convolver)
  }

  // 断开节点
  disconnect() {
    this.player.reverb = null
    this.input.disconnect(this.dryGain)
    this.dryGain.disconnect(this.output)
    this.input.disconnect(this.wetGain)
    this.wetGain.disconnect(this.convolver)
    this.input.connect(this.output)
  }

  // 设置参数
  set(dry, wet) {
    this.setDry(dry)
    this.setWet(wet)
    if (dry === 1 && wet === 0) {
      this.disconnect()
    }
  }

  // 设置干声
  setDry(dry) {
    if (this.dry !== dry) {
      this.dry = dry
      this.dryGain.gain.value = dry
    }
  }

  // 设置湿声
  setWet(wet) {
    if (this.wet !== wet) {
      this.wet = wet
      this.wetGain.gain.value = wet * 2
    }
  }

  // 获取卷积器
  getConvolver() {
    if (!Reverb.convolver) {
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
          const rate = (bufferLength - i) / decayLength
          samples[i] = (random() * 2 - 1) * rate
        }
      }
      convolver.buffer = buffer
      filter.type = 'lowpass'
      filter.frequency.value = 3000
      convolver.connect(filter)
      filter.connect(AudioManager.analyser)
      Reverb.convolver = convolver
    }
    return Reverb.convolver
  }

  // 共享卷机器
  static convolver = null
}