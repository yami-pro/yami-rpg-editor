'use strict'

import * as Yami from '../yami.js'

const {
  Command,
  IfCondition,
  Window
} = Yami

// ******************************** 条件分支 - 分支窗口 ********************************

const IfBranch = {
  // properties
  target: null,
  commands: null,
  // methods
  initialize: null,
  parse: null,
  open: null,
  save: null,
  // events
  windowClosed: null,
  confirm: null,
}

// ******************************** 条件分支 - 分支窗口加载 ********************************

// 初始化
IfBranch.initialize = function () {
  // 创建模式选项
  $('#if-branch-mode').loadItems([
    {name: 'Meet All', value: 'all'},
    {name: 'Meet Any', value: 'any'},
  ])

  // 侦听事件
  $('#if-branch').on('closed', this.windowClosed)
  $('#if-branch-confirm').on('click', this.confirm)
}

// 解析项目
IfBranch.parse = function (branch) {
  const words = Command.words
  let joint
  switch (branch.mode) {
    case 'all': joint = ' && '; break
    case 'any': joint = ' || '; break
  }
  for (const condition of branch.conditions) {
    words.push(IfCondition.parse(condition))
  }
  return words.join(joint)
}

// 打开数据
IfBranch.open = function (branch) {
  if (this.target.inserting) {
    IfCondition.target = this.target
    IfCondition.open()
  } else {
    Window.open('if-branch')
    $('#if-branch-mode').write(branch.mode)
    $('#if-branch-conditions').write(branch.conditions.slice())
    $('#if-branch-conditions').getFocus()
    this.commands = branch.commands
  }
}

// 保存数据
IfBranch.save = function () {
  if (this.target.inserting) {
    const condition = IfCondition.save()
    if (condition !== undefined) {
      const mode = 'all'
      const conditions = [condition]
      const commands = []
      return {mode, conditions, commands}
    }
  } else {
    const mode = $('#if-branch-mode').read()
    const element = $('#if-branch-conditions')
    const conditions = element.read()
    if (conditions.length === 0) {
      return element.getFocus()
    }
    const commands = this.commands
    Window.close('if-branch')
    return {mode, conditions, commands}
  }
}

// 窗口 - 已关闭事件
IfBranch.windowClosed = function (event) {
  IfBranch.commands = null
  $('#if-branch-conditions').clear()
}

// 确定按钮 - 鼠标点击事件
IfBranch.confirm = function (event) {
  return IfBranch.target.save()
}

// ******************************** 条件分支 - 分支窗口导出 ********************************

export { IfBranch }
