'use strict'

import {
  Browser,
  Command,
  File,
  Inspector,
  NodeList,
  PluginManager,
  Selector
} from '../yami.js'

// ******************************** 脚本列表接口 ********************************

class ScriptListInterface {
  target  //:element
  type    //:string
  filter  //:string
  script  //:object
  editor  //:object
  owner   //:object

  constructor(editor, owner) {
    this.editor = editor ?? null
    this.owner = owner ?? null
  }

  // 初始化
  initialize(list) {
    this.target = null
    this.script = null
    this.filter = 'script'
    this.type = 'script'
    list.toggleable = true

    // 创建参数历史操作
    const {editor, owner} = this
    if (editor && owner) {
      this.history = new Inspector.ParamHistory(editor, owner, list)
    }

    // 侦听事件
    list.on('pointerdown', ScriptListInterface.listPointerdown)
  }

  // 解析
  parse(script) {
    const box = document.createElement('box')
    box.textContent = '\uf044'
    box.addClass('script-edit-button')
    Command.invalid = false
    const scriptName = Command.parseFileName(script.id)
    const scriptClass = Command.invalid ? 'invalid' : script.enabled ? '' : 'weak'
    return [{content: scriptName, class: scriptClass}, box]
  }

  // 更新
  update(list) {
    // 更新宿主项目的脚本图标
    const item = this.editor?.target
    if (item?.scripts === list.read()) {
      const element = item.element
      const list = element?.parentNode
      if (list instanceof NodeList) {
        list.updateScriptIcon(item)
      }
    }
  }

  // 打开
  open(script = PluginManager.createData()) {
    this.script = script
    Selector.open(this, false)
  }

  // 保存
  save() {
    return this.script
  }

  // 模拟读取
  read() {
    return this.script.id
  }

  // 模拟输入
  input(scriptId) {
    this.script.id = scriptId
    this.target.save()
  }

  // 列表 - 指针按下事件
  static listPointerdown = function IIFE() {
    let element = null
    const once = {once: true}
    const pointerup = event => {
      if (element.contains(event.target)) {
        const el = element.parentNode
        // 临时兼容ParamList和NodeList
        // 应该统一这个属性的命名
        const item = el.dataItem ?? el.item
        const path = File.getPath(item.id)
        if (path) Browser.openScript(path)
      }
      element = null
    }
    return function (event) {
      if (event.button === 0 &&
        event.target.tagName === 'BOX') {
        element = event.target
        // 自动过滤重复侦听器，无需额外检查
        window.on('pointerup', pointerup, once)
      }
    }
  }()
}

// ******************************** 脚本列表接口导出 ********************************

export { ScriptListInterface }
