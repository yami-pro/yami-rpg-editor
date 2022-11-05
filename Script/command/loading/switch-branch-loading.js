'use strict'

import { SwitchBranch } from '../switch-branch.js'
import * as Yami from '../../yami.js'

// ******************************** 匹配 - 分支窗口加载 ********************************

// 初始化
SwitchBranch.initialize = function () {
  // 侦听事件
  $('#switch-branch').on('closed', this.windowClosed)
  $('#switch-branch-confirm').on('click', this.confirm)
}

// 解析项目
SwitchBranch.parse = function (branch) {
  const words = Yami.Command.words
  for (const condition of branch.conditions) {
    words.push(Yami.SwitchCondition.parse(condition))
  }
  return words.join()
}

// 打开数据
SwitchBranch.open = function (branch) {
  if (this.target.inserting) {
    SwitchCondition.target = this.target
    SwitchCondition.open()
  } else {
    Yami.Window.open('switch-branch')
    $('#switch-branch-conditions').write(branch.conditions.slice())
    $('#switch-branch-conditions').getFocus()
    this.commands = branch.commands
  }
}
// 保存数据
SwitchBranch.save = function () {
  if (this.target.inserting) {
    const condition = SwitchCondition.save()
    if (condition !== undefined) {
      const conditions = [condition]
      const commands = []
      return {conditions, commands}
    }
  } else {
    const element = $('#switch-branch-conditions')
    const conditions = element.read()
    if (conditions.length === 0) {
      return element.getFocus()
    }
    const commands = this.commands
    Yami.Window.close('switch-branch')
    return {conditions, commands}
  }
}

// 窗口 - 已关闭事件
SwitchBranch.windowClosed = function (event) {
  SwitchBranch.commands = null
  $('#switch-branch-conditions').clear()
}

// 确定按钮 - 鼠标点击事件
SwitchBranch.confirm = function (event) {
  return SwitchBranch.target.save()
}
