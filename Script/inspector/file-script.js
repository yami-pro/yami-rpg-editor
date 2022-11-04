'use strict'

import * as Yami from '../yami.js'

// import { Inspector } from './inspector.js'
// import { File } from '../file-system/file.js'
// import { Data } from '../data/data.js'

// ******************************** 文件 - 脚本页面 ********************************

{
  const FileScript = {
    // properties
    target: null,
    meta: null,
    overview: null,
    // methods
    initialize: null,
    create: null,
    open: null,
    close: null,
    // events
    windowLocalize: null,
  }

  // 初始化
  FileScript.initialize = function () {
    // 获取概述元素
    this.overview = $('#fileScript-overview')

    // 侦听事件
    window.on('localize', this.windowLocalize)
  }

  // 创建脚本
  FileScript.create = function () {
  return `/*
  @plugin
  @version
  @author
  @link
  @desc
  */

  export default class Plugin {
    onStart() {}
  }`
  }

  // 打开数据
  FileScript.open = async function (file, meta) {
    if (this.target !== file) {
      this.target = file
      this.meta = meta

      // 加载元数据
      const elName = $('#fileScript-name')
      const elSize = $('#fileScript-size')
      const size = Number(file.stats.size)
      elName.textContent = file.basename + file.extname
      elSize.textContent = File.parseFileSize(size)

      // 加载脚本概述
      await Data.scripts[meta.guid]
      const elements = PluginManager.createOverview(meta, true)
      const overview = this.overview.clear()
      for (const element of elements) {
        overview.appendChild(element)
      }
    }
  }

  // 关闭数据
  FileScript.close = function () {
    if (this.target) {
      Browser.unselect(this.meta)
      this.target = null
      this.meta = null
      this.overview.clear()
    }
  }

  // 窗口 - 本地化事件
  FileScript.windowLocalize = function (event) {
    if (FileScript.target) {
      const {target, meta} = FileScript
      FileScript.target = null
      FileScript.open(target, meta)
    }
  }

  Inspector.fileScript = FileScript
}
