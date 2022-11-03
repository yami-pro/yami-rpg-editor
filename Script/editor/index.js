'use strict'

import '../util/index.js'
import '../components/index.js'
import '../webgl/index.js'
import '../ui/index.js'

import '../animation/index.js'
import '../attribute/index.js'
import '../audio/index.js'
import '../browser/index.js'
import '../codec/codec.js'
import '../command/index.js'
import '../config/config-reading.js'
import '../data/index.js'
import '../enum/index.js'
import '../file-system/index.js'
import '../history/index.js'
import '../inspector/index.js'
import '../layout/index.js'
import '../log/index.js'
import '../palette/index.js'
import '../particle/index.js'
import '../plugin/index.js'
import '../printer/printer.js'
import '../scene/index.js'
import '../sprite/index.js'
import '../title/index.js'
import '../tools/index.js'
import '../variable/index.js'

import './loading/editor-loading.js'
import { Editor } from './editor.js'

// ******************************** 主函数 ********************************

!async function main () {
  // 设置Node.js工作目录
  process.chdir(__dirname)

  // 初始化并打开最近的项目
  Editor.initialize()
}()
