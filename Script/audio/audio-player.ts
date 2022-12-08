"use strict"

import {
  AudioManager,
  File,
  Reverb,
  IMath
} from "../yami"

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
    this.audio.volume = IMath.clamp(volume, 0, 1)
  }

  // 设置声像
  setPan(pan) {
    this.panner.pan.value = IMath.clamp(pan, -1, 1)
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
      volume: IMath.roundTo(this.audio.volume, 2),
      pan: IMath.roundTo(this.panner.pan.value, 2),
      dry: this.reverb ? IMath.roundTo(this.reverb.dryGain.gain.value    , 2) : 1,
      wet: this.reverb ? IMath.roundTo(this.reverb.wetGain.gain.value / 2, 2) : 0,
    }
  }
}

// ******************************** 音频播放器类导出 ********************************

export { AudioPlayer }
