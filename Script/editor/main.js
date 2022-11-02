'use strict'

import '../util/index.js'
import '../components/index.js'

import { Editor } from './editor.js'

// ******************************** 主函数 ********************************

!async function main () {
  // 设置Node.js工作目录
  process.chdir(__dirname)

  // 初始化并打开最近的项目
  Editor.initialize()
}()

// setTimeout(() => {
//   // FSP.rename(File.route('Assets/BGM/zz4'), File.route('Assets/zz4'))
//   // FSP.mkdir(File.route('Assets/zz'), {recursive: true})
//   // FSP.readdir(
//   //   File.route('Assets'),
//   //   {withFileTypes: true},
//   // ).then(files => {
//   //   console.log(files)
//   // })
//   FSP.stat(
//     File.route('Assets/zz4')
//   ).then(
//     stats => {
//       console.log(stats)
//     }
//   )
// }, 1000)

// setTimeout(() => {
//   location.reload()
// }, 100)
