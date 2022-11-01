'use strict'

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
