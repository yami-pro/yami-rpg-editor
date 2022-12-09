"use strict"

import {
  Browser,
  File,
  Inspector,
  ICSS
} from "../yami"

// ******************************** 文件 - 字体页面 ********************************

{
const FileFont = {
  // properties
  target: null,
  meta: null,
  symbol: null,
  font: null,
  input: null,
  previews: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  // events
  windowResize: null,
  textInput: null,
}

// 初始化
FileFont.initialize = function () {
  // 获取预览文本元素
  this.previews = document.querySelectorAll('.fileFont-preview')

  // 获取输入框并设置内容
  this.input = $('#fileFont-content')
  this.input.write('Yami RPG Editor')
  this.textInput({target: this.input.input})

  // 侦听事件
  $('#fileFont').on('resize', this.windowResize)
  this.input.on('input', this.textInput)
}

// 打开数据
FileFont.open = function (file, meta) {
  if (this.target !== file) {
    this.target = file
    this.meta = meta

    // 加载元数据
    const elName = $('#fileFont-name')
    const elSize = $('#fileFont-size')
    const size = Number(file.stats.size)
    elName.textContent = file.basename + file.extname
    elSize.textContent = File.parseFileSize(size)

    // 加载字体
    const previews = this.previews
    const path = File.route(file.path)
    const url = ICSS.encodeURL(path)
    const font = new FontFace('preview', url)
    for (const preview of previews) {
      preview.hide()
    }
    if (this.font instanceof FontFace) {
      document.fonts.delete(this.font)
    }
    const symbol = this.symbol = Symbol()
    font.load().then(() => {
      if (this.symbol === symbol) {
        this.symbol = null
        this.font = font
        document.fonts.add(font)
        for (const preview of previews) {
          preview.show()
        }
      }
    })
  }
}

// 关闭数据
FileFont.close = function () {
  if (this.target) {
    if (this.font instanceof FontFace) {
      document.fonts.delete(this.font)
    }
    Browser.unselect(this.meta)
    this.target = null
    this.meta = null
    this.symbol = null
    this.font = null
  }
}

// 窗口 - 调整大小事件
FileFont.windowResize = function (event) {
  const previews = FileFont.previews
  const dpr = window.devicePixelRatio
  if (previews.dpr !== dpr) {
    previews.dpr = dpr
    $('#fileFont-font-grid').style.fontSize = `${12 / dpr}px`
  }
}

// 文本框 - 输入事件
FileFont.textInput = function (event) {
  const text = event.target.value
  for (const element of FileFont.previews) {
    element.textContent = text
  }
}

Inspector.fileFont = FileFont
}
