'use strict'

import {
  Browser,
  File,
  Inspector
} from '../yami'

// ******************************** 文件 - 图像页面 ********************************

{
const FileImage = {
  // properties
  target: null,
  meta: null,
  symbol: null,
  image: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  updateImage: null,
  // events
  windowResize: null,
}

// 初始化
FileImage.initialize = function () {
  // 获取图像元素
  this.image = $('#fileImage-image')

  // 侦听事件
  $('#fileImage').on('resize', this.windowResize)
  $('#fileImage-image-detail').on('toggle', this.windowResize)
}

// 打开数据
FileImage.open = function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileImage-name')
    const elSize = $('#fileImage-size')
    const elResolution = $('#fileImage-resolution')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)
    elResolution.textContent = ''

    // 加载图像
    const image = this.image.hide()
    const path = File.route(file.path)
    image.src = path

    // 更新图像信息
    const symbol = this.symbol = Symbol()
    new Promise((resolve, reject) => {
      const intervalIndex = setInterval(() => {
        if (image.naturalWidth !== 0) {
          clearInterval(intervalIndex)
          resolve()
        } else if (image.complete) {
          clearInterval(intervalIndex)
          reject()
        }
      })
    }).then(() => {
      if (this.symbol === symbol) {
        this.symbol = null
        this.updateImage()
        const width = image.naturalWidth
        const height = image.naturalHeight
        elResolution.textContent = `${width} x ${height}`
      }
    })
  }
}

// 关闭数据
FileImage.close = function () {
  if (this.target) {
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    this.symbol = null
    this.image.src = ''
  }
}

// 更新图像
FileImage.updateImage = function () {
  // 隐藏元素避免滚动条意外出现
  const image = this.image.hide()
  const frame = image.parentNode
  const frameBox = CSS.getDevicePixelContentBoxSize(frame)
  const cw = frameBox.width
  const ch = frameBox.height
  if (cw > 0 && ch > 0) {
    const nw = image.naturalWidth
    const nh = image.naturalHeight
    let dw
    let dh
    if (nw <= cw && nh <= ch) {
      dw = nw
      dh = nh
    } else {
      const scaleX = cw / nw
      const scaleY = ch / nh
      if (scaleX < scaleY) {
        dw = cw
        dh = Math.round(nh * scaleX)
      } else {
        dw = Math.round(nw * scaleY)
        dh = ch
      }
    }
    const dpr = window.devicePixelRatio
    image.style.left = `${(cw - dw >> 1) / dpr}px`
    image.style.top = `${(ch - dh >> 1) / dpr}px`
    image.style.width = `${dw / dpr}px`
    image.style.height = `${dh / dpr}px`
    image.show()
  }
}

// 窗口 - 调整大小事件
FileImage.windowResize = function (event) {
  if (FileImage.target !== null &&
    FileImage.symbol === null) {
    FileImage.updateImage()
  }
}

Inspector.fileImage = FileImage
}
