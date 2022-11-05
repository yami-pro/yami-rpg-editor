'use strict'

import { Editor } from './editor.js'

// ******************************** 主函数 ********************************

!async function main () {
  // 设置Node.js工作目录
  process.chdir(__dirname)

  // 初始化并打开最近的项目
  Editor.initialize()
}()
