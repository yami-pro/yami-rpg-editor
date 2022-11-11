'use strict'

import {
  AudioManager,
  Browser,
  File,
  Inspector
} from '../yami.js'

// ******************************** 文件 - 视频页面 ********************************

{
const FileVideo = {
  // properties
  target: null,
  meta: null,
  symbol: null,
  video: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  play: null,
  // events
  windowError: null,
}

// 初始化
FileVideo.initialize = function () {
  // 获取视频播放器
  this.video = $('#fileVideo-video')

  // 侦听事件
  window.on('error', this.windowError)
}

// 打开数据
FileVideo.open = function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileVideo-name')
    const elSize = $('#fileVideo-size')
    const elDuration = $('#fileVideo-duration')
    const elResolution = $('#fileVideo-resolution')
    const elBitrate = $('#fileVideo-bitrate')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)
    elDuration.textContent = ''
    elResolution.textContent = ''
    elBitrate.textContent = ''

    // 加载视频
    const video = this.video
    const path = file.path
    video.src = File.route(path)

    // 更新视频信息
    const symbol = this.symbol = Symbol()
    new Promise(resolve => {
      video.on('loadedmetadata', () => {
        resolve(video)
      }, {once: true})
    }).then(() => {
      if (this.symbol === symbol) {
        this.symbol = null
        const duration = video.duration
        const width = video.videoWidth
        const height = video.videoHeight
        const bitrate = Math.round(size / 128 / duration)
        const formatTime = Inspector.fileAudio.formatTime
        elDuration.textContent = formatTime(duration)
        elResolution.textContent = `${width} x ${height}`
        elBitrate.textContent = `${bitrate}Kbps`
      }
    })
  }
}

// 关闭数据
FileVideo.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    this.symbol = null
    this.video.src = ''
  }
}

// 播放视频
FileVideo.play = function () {
  if (this.target !== null) {
    AudioManager.player.stop()
    const {video} = this
    if (video.paused) {
      video.play()
    } else {
      video.currentTime = 0
    }
  }
}

// 窗口 - 错误事件
// 过滤视频窗口全屏切换时的报错事件
FileVideo.windowError = function (event) {
  if (event.message === 'ResizeObserver loop limit exceeded') {
    event.stopImmediatePropagation()
  }
}

Inspector.fileVideo = FileVideo
}
