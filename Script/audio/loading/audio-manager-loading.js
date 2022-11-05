'use strict'

import { AudioManager } from '../audio-manager.js'
import { SinglePlayer } from '../single-player.js'
import * as Yami from '../../yami.js'

// ******************************** 音频管理器加载 ********************************

// 初始化
AudioManager.initialize = function () {
  // 创建音频上下文
  this.context = new AudioContext()

  // 创建分析器
  this.analyser = this.context.createAnalyser()
  this.analyser.connect(this.context.destination)

  // 创建音频对象
  this.player = new Yami.SinglePlayer()
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
  const promise = waveforms[guid] = Yami.File.get({
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
