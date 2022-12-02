'use strict'

import {
  AudioManager,
  Browser,
  File,
  getElementReader,
  Inspector,
  TimerManager,
  ICSS
} from '../yami'

// ******************************** 文件 - 音频页面 ********************************

{
const FileAudio = {
  // properties
  target: null,
  meta: null,
  symbol: null,
  promise: null,
  progress: $('#fileAudio-progress'),
  progressFiller: $('#fileAudio-progress-filler'),
  pointer: $('#fileAudio-progress-pointer').hide(),
  currentTimeInfo: $('#fileAudio-currentTime'),
  pointerTimeInfo: $('#fileAudio-pointerTime'),
  canvas: $('#fileAudio-frequency-canvas'),
  context: null,
  dataArray: null,
  intervals: null,
  intensities: null,
  rotation: null,
  lineColor: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  play: null,
  writeParams: null,
  updateParams: null,
  updateParamInfos: null,
  updateCanvas: null,
  formatTime: null,
  requestAnimation: null,
  updateAnimation: null,
  stopAnimation: null,
  // events
  themechange: null,
  windowResize: null,
  paramInput: null,
  progressPointerdown: null,
  progressPointermove: null,
  progressPointerleave: null,
}

// 初始化
FileAudio.initialize = function () {
  // 获取画布上下文对象
  this.context = this.canvas.getContext('2d', {desynchronized: true})

  // 设置音频分析器
  const analyser = AudioManager.analyser
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0

  // 创建数据数组
  this.dataArray = new Uint8Array(
    analyser.frequencyBinCount
  )

  // 创建间隔数组
  this.intervals = new Float64Array(64)

  // 创建强度数组
  this.intensities = new Float64Array(64)
  this.intensities.index = 0

  // 侦听事件
  window.on('themechange', this.themechange)
  $('#fileAudio').on('resize', this.windowResize)
  $('#fileAudio-frequency-detail').on('toggle', this.windowResize)
  $('#fileAudio-volume').on('input', this.paramInput)
  $('#fileAudio-pan').on('input', this.paramInput)
  $('#fileAudio-dry').on('input', this.paramInput)
  $('#fileAudio-wet').on('input', this.paramInput)
  this.progress.on('pointerdown', this.progressPointerdown)
  this.progress.on('pointermove', this.progressPointermove)
  this.progress.on('pointerleave', this.progressPointerleave)
}

// 打开数据
FileAudio.open = function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileAudio-name')
    const elSize = $('#fileAudio-size')
    const elDuration = $('#fileAudio-duration')
    const elBitrate = $('#fileAudio-bitrate')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)
    elDuration.textContent = ''
    elBitrate.textContent = ''

    // 加载混合器参数
    this.writeParams(AudioManager.player.getParams())

    // 加载音频
    const audio = AudioManager.player.audio
    const path = file.path
    if (audio.path !== path) {
      audio.path = path
      audio.src = File.route(path)

      // 加载波形图
      this.progress.removeClass('visible')
      // 保留对返回的原始promise的引用
      // 以便可以取消解码音频数据的操作
      const promise = this.promise =
      AudioManager.getWaveform(meta.guid)
      promise.then(url => {
        if (this.promise === promise) {
          this.promise = null
          this.progress.style.webkitMaskImage = url
          this.progress.addClass('visible')
        }
      })
    }

    // 请求绘制分析器动画
    this.updateCanvas()
    this.requestAnimation()

    // 更新音频信息
    const symbol = this.symbol = Symbol()
    new Promise(resolve => {
      if (isNaN(audio.duration)) {
        audio.on('loadedmetadata', () => {
          resolve()
        }, {once: true})
      } else {
        resolve()
      }
    }).then(() => {
      if (this.symbol === symbol) {
        this.symbol = null
        const duration = audio.duration
        const bitrate = Math.round(size / 128 / duration)
        elDuration.textContent = this.formatTime(duration)
        elBitrate.textContent = `${bitrate}Kbps`
      }
    })
  }
}

// 关闭数据
FileAudio.close = function () {
  if (this.target) {
    if (this.promise) {
      this.promise.canceled = true
      this.promise = null
    }
    Browser.unselect(this.meta)
    this.stopAnimation()
    this.target = null
    this.meta = null
    this.symbol = null
  }
}

// 播放音频
FileAudio.play = function () {
  if (this.target !== null) {
    const {audio} = AudioManager.player
    if (audio.paused) {
      audio.play()
    } else {
      audio.currentTime = 0
    }
  }
}

// 写入参数
FileAudio.writeParams = function (params) {
  $('#fileAudio-volume').write(params.volume)
  $('#fileAudio-pan').write(params.pan)
  $('#fileAudio-dry').write(params.dry)
  $('#fileAudio-wet').write(params.wet)
  this.updateParamInfos(params)
}

// 更新参数
FileAudio.updateParams = function (params) {
  AudioManager.player.setVolume(params.volume)
  AudioManager.player.setPan(params.pan)
  AudioManager.player.setReverb(params.dry, params.wet)
}

// 更新参数信息
FileAudio.updateParamInfos = function (params) {
  $('#fileAudio-volume-info').textContent = `${params.volume * 100}%`
  $('#fileAudio-pan-info').textContent = `${params.pan * 100}%`
  $('#fileAudio-dry-info').textContent = `${params.dry * 100}%`
  $('#fileAudio-wet-info').textContent = `${params.wet * 100}%`
}

// 更新画布
FileAudio.updateCanvas = function () {
  const manager = Inspector.manager
  const canvas = this.canvas
  const scrollTop = manager.scrollTop
  if (canvas.hasClass('hidden')) {
    if (canvas.width !== 0) {
      canvas.width = 0
    }
    if (canvas.height !== 0) {
      canvas.height = 0
    }
  } else {
    canvas.style.width = '100%'
    canvas.style.height = '0'
    const dpr = window.devicePixelRatio
    const height = ICSS.getDevicePixelContentBoxSize(canvas).width
    if (canvas.height !== height) {
      canvas.height = height
    }
    canvas.style.height = `${height / dpr}px`
    const width = ICSS.getDevicePixelContentBoxSize(canvas).width
    if (canvas.width !== width) {
      canvas.width = width
    }
    canvas.style.width = `${width / dpr}px`
  }
  if (manager.scrollTop !== scrollTop) {
    manager.scrollTop = scrollTop
  }
}

// 格式化时间
FileAudio.formatTime = function (time) {
  const pad = Number.padZero
  const length = Math.floor(time)
  const hours = Math.floor(length / 3600)
  const minutes = Math.floor(length / 60) % 60
  const seconds = length % 60
  return hours
  ? `${hours}:${pad(minutes, 60)}:${pad(seconds, 60)}`
  : `${minutes}:${pad(seconds, 60)}`
}

// 请求动画
FileAudio.requestAnimation = function () {
  if (this.target !== null) {
    TimerManager.appendUpdater('sharedAnimation', this.updateAnimation)
  }
}

// 更新动画帧
FileAudio.updateAnimation = function (deltaTime) {
  // 更新播放进度
  const audio = AudioManager.player.audio
  const currentTime = audio.currentTime
  const duration = audio.duration || Infinity
  const cw = Inspector.manager.clientWidth
  const pw = Math.round(cw * currentTime / duration)
  const pp = Math.roundTo(pw / cw * 100, 6)
  const {progress, progressFiller} = FileAudio
  if (progress.percent !== pp) {
    progress.percent = pp
    progressFiller.style.width = `${pp}%`
  }

  // 更新当前时间
  const time = FileAudio.formatTime(currentTime)
  const currentTimeInfo = FileAudio.currentTimeInfo
  if (currentTimeInfo.textContent !== time) {
    currentTimeInfo.textContent = time
  }

  const canvas = FileAudio.canvas
  const context = FileAudio.context
  const width = canvas.width
  const height = canvas.height
  if (width * height === 0) {
    return
  }
  // 计算当前帧的强度以及平均值
  // 单独提前计算可以减少延时
  const analyser = AudioManager.analyser
  const array = FileAudio.dataArray
  const aLength = array.length
  const start = Math.floor(aLength * 0.1)
  const end = Math.floor(aLength * 0.85)
  const step = Math.PI * 2 / (end - start)
  const intervals = FileAudio.intervals
  const intensities = FileAudio.intensities
  const length = intensities.length
  const index = intensities.index
  let intensity = 0
  let samples = 0
  analyser.getByteFrequencyData(array)
  for (let i = start; i < end; i++) {
    const freq = array[i]
    if (freq !== 0) {
      intensity += freq
      samples++
    }
  }
  if (intensity !== 0) {
    intensity = intensity / samples / 255 * 2
  }
  intervals[index] = deltaTime
  intensities[index] = intensity
  intensities.index = (index + 1) % length
  let intervalSum = 0
  let intensityAverage = 0
  let intensityCount = 0
  let i = index + length
  while (i > index) {
    const j = i-- % length
    intervalSum += intervals[j]
    intensityAverage += intensities[j]
    intensityCount++
    // 取最近150ms的强度平均值(平滑过渡)
    if (intervalSum >= 150) {
      break
    }
  }
  intensityAverage /= intensityCount

  // 绘制频率
  const centerX = height / 2
  const centerY = height / 2
  const size = height * (0.8 + intensityAverage * 0.2)
  const padding = height * 0.04
  const amplitude = height * 0.1
  const lineWidth = size * 0.005
  const halfWidth = lineWidth / 2
  const fRadius = size / 2 - padding - amplitude
  const rotation = FileAudio.rotation - start * step
  const MathCos = Math.cos
  const MathSin = Math.sin
  context.clearRect(0, 0, width, height)
  context.lineWidth = lineWidth
  context.strokeStyle = FileAudio.lineColor
  context.beginPath()
  for (let i = start; i < end; i++) {
    const freq = array[i]
    if (freq !== 0) {
      const angle = i * step + rotation
      const cos = MathCos(angle)
      const sin = MathSin(angle)
      const af = (freq / 255) ** 2.5
      const am = amplitude * af + halfWidth
      const br = fRadius - am
      const er = fRadius + am
      const bx = centerX + br * cos
      const by = centerY + br * sin
      const ex = centerX + er * cos
      const ey = centerY + er * sin
      context.moveTo(bx, by)
      context.lineTo(ex, ey)
    }
  }
  context.globalAlpha = 1
  context.stroke()
  context.beginPath()
  for (let i = start; i < end; i++) {
    const freq = array[i]
    if (freq === 0) {
      const angle = i * step + rotation
      const cos = MathCos(angle)
      const sin = MathSin(angle)
      const br = fRadius - halfWidth
      const er = fRadius + halfWidth
      const bx = centerX + br * cos
      const by = centerY + br * sin
      const ex = centerX + er * cos
      const ey = centerY + er * sin
      context.moveTo(bx, by)
      context.lineTo(ex, ey)
    }
  }
  context.globalAlpha = 0.25
  context.stroke()

  // 更新旋转角度
  FileAudio.rotation -= Math.PI * deltaTime / 15000
}

// 停止更新动画
FileAudio.stopAnimation = function () {
  TimerManager.removeUpdater('sharedAnimation', this.updateAnimation)
}

// 主题改变事件
FileAudio.themechange = function (event) {
  switch (event.value) {
    case 'light':
      this.lineColor = '#000000'
      break
    case 'dark':
      this.lineColor = '#ffffff'
      break
  }
}.bind(FileAudio)

// 窗口 - 调整大小事件
FileAudio.windowResize = function (event) {
  if (FileAudio.target !== null &&
    FileAudio.symbol === null) {
    FileAudio.updateCanvas()
  }
}

// 参数 - 输入事件
FileAudio.paramInput = function (event) {
  const read = getElementReader('fileAudio')
  const params = {
    volume: read('volume'),
    pan: read('pan'),
    dry: read('dry'),
    wet: read('wet'),
  }
  this.updateParams(params)
  this.updateParamInfos(params)
}.bind(FileAudio)

// 进度条 - 指针按下事件
FileAudio.progressPointerdown = function (event) {
  switch (event.button) {
    case 0: {
      const {audio} = AudioManager.player
      const {time} = FileAudio.pointer
      if (time !== -1) {
        audio.currentTime = time
      }
      break
    }
  }
}

// 进度条 - 指针移动事件
FileAudio.progressPointermove = function (event) {
  const {pointer, pointerTimeInfo} = FileAudio
  const {duration} = AudioManager.player.audio
  if (!isNaN(duration)) {
    const pointerX = event.offsetX
    const boxWidth = this.clientWidth
    const ratio = pointerX / Math.max(boxWidth - 1, 1)
    const time = ratio * duration
    pointer.time = time
    pointer.style.left = `${pointerX}px`
    pointer.show()
    pointerTimeInfo.textContent = FileAudio.formatTime(time)
    pointerTimeInfo.show()
    const infoWidth = pointerTimeInfo.clientWidth + 16
    const infoX = Math.min(pointerX, boxWidth - infoWidth)
    pointerTimeInfo.style.left = `${infoX}px`
  }
}

// 进度条 - 指针离开事件
FileAudio.progressPointerleave = function (event) {
  const {pointer, pointerTimeInfo} = FileAudio
  if (pointer.time !== -1) {
    pointer.time = -1
    pointer.hide()
    pointerTimeInfo.hide()
  }
}

Inspector.fileAudio = FileAudio
}
