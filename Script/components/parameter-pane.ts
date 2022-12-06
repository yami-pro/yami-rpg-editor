'use strict'

import {
  Attribute,
  CheckBox,
  ColorBox,
  CustomBox,
  Data,
  DetailSummary,
  Enum,
  File,
  KeyboardBox,
  TreeList,
  NumberBox,
  ParamList,
  PluginManager,
  Select,
  SelectBox,
  TextBox
} from '../yami'

// ******************************** 脚本参数面板 ********************************

class ParameterPane extends HTMLElement {
  scriptList          //:element
  headPad             //:element
  metas               //:array
  wraps               //:array
  detailBoxes         //:array
  checkBoxes          //:array
  numberBoxes         //:array
  textBoxes           //:array
  selectBoxes         //:array
  keyboardBoxes       //:array
  colorBoxes          //:array
  customBoxes         //:array
  updateEventEnabled  //:boolean
  windowLocalize      //:function
  scriptChange        //:function

  constructor() {
    super()

    // 设置属性
    this.scriptList = null
    this.headPad = null
    this.metas = []
    this.wraps = []
    this.detailBoxes = []
    this.checkBoxes = []
    this.numberBoxes = []
    this.textBoxes = []
    this.selectBoxes = []
    this.keyboardBoxes = []
    this.colorBoxes = []
    this.customBoxes = []
    this.updateEventEnabled = false
    this.windowLocalize = ParameterPane.windowLocalize.bind(this)
    this.scriptChange = ParameterPane.scriptChange.bind(this)

    // 侦听事件
    window.on('localize', this.windowLocalize)
    this.on('change', this.componentChange)
  }

  // 绑定数据
  bind(scriptList) {
    this.scriptList = scriptList
    if (scriptList instanceof ParamList) {
      const {object} = scriptList
      const {update} = object
      this.getData = () => scriptList.data
      object.update = (...params) => {
        update.apply(object, params)
        this.update()
      }
    }
    if (scriptList instanceof TreeList) {
      this.getData = () => {
        const item = scriptList.read()
        return item ? [item] : []
      }
    }
  }

  // 重新写入
  rewrite(parameters, key) {
    for (const wrap of this.wraps) {
      const script = wrap.box.data
      const map = script.parameters
      if (map !== parameters) continue
      for (const {input} of wrap.children) {
        if (input.key === key) {
          input.write(parameters[key])
          this.scriptList?.dispatchChangeEvent()
          // 更新参数可见性
          if (input.branched) {
            PluginManager.reconstruct(script)
            this.updateParamDisplay(wrap.box)
            this.onResize?.()
          }
          return
        }
      }
    }
  }

  // 更新
  update() {
    this.clear()
    this.appendHeadPad()
    let changed = false
    const scripts = this.getData()
    const map = Data.manifest.guidMap
    for (const script of scripts) {
      const meta = map[script.id]
      if (!meta) continue
      this.metas.push(meta)
      if (PluginManager.reconstruct(script)) {
        changed = true
      }
      const paramList = meta.parameters
      if (!paramList.length) continue
      const langMap = meta.langMap.update()
      const parameters = script.parameters
      const detailWrap = this.createDetailBox()
      const {box, summary, grid, children} = detailWrap
      box.meta = meta
      box.data = script
      this.wraps.push(detailWrap)
      // 如果传递了细节概要元素则设置脚本名称
      if (summary instanceof DetailSummary) {
        summary.textContent =
        langMap.get(meta.overview.plugin) ||
        File.parseMetaName(meta)
      }
      for (const parameter of paramList) {
        const inputWrap = this.createParamInput(parameter)
        const {label, input} = inputWrap
        const key = parameter.key
        const name = langMap.get(parameter.alias) ?? key
        const desc = langMap.get(parameter.desc)
        const tip = desc ? `${name}\n${desc}` : ''
        this.updateParamInput(inputWrap, parameters[key])
        label.textContent = name
        input.setTooltip(tip)
        input.parameters = parameters
        input.key = key
        grid.appendChild(label)
        grid.appendChild(input)
        children.push(inputWrap)
      }
      this.updateParamDisplay(box)
      this.appendChild(box)
    }
    // 脚本列表 - 发送改变事件
    if (changed) {
      this.scriptList?.dispatchChangeEvent()
    }
    // 发送更新事件
    if (this.updateEventEnabled) {
      this.dispatchUpdateEvent()
    }
    this.onResize?.()
    // 侦听属性改变事件
    window.on('script-change', this.scriptChange)
  }

  // 添加头部填充元素
  appendHeadPad() {
    let {headPad} = this
    if (headPad === null) {
      // 用填充元素占据首元素的位置
      // 从而改变首个summary的样式
      headPad = document.createElement('empty')
      headPad.style.display = 'none'
      this.headPad = headPad
    }
    this.appendChild(headPad)
  }

  // 创建细节框
  createDetailBox() {
    const {detailBoxes} = this
    if (detailBoxes.length !== 0) {
      return detailBoxes.pop()
    }
    const tag = 'detail-box'
    const box = document.createElement('detail-box')
    const summary = document.createElement('detail-summary')
    const grid = document.createElement('detail-grid')
    const wrap = {tag, box, summary, grid, children: []}
    box.setAttribute('open', '')
    box.appendChild(summary)
    box.appendChild(grid)
    box.wrap = wrap
    return wrap
  }

  // 创建参数输入框
  createParamInput(parameter) {
    const {type} = parameter
    switch (type) {
      case 'boolean':
        return this.createCheckBox()
      case 'number': {
        const wrap = this.createNumberBox()
        wrap.input.input.min = parameter.min.toString()
        wrap.input.input.max = parameter.max.toString()
        wrap.input.decimals = parameter.decimals
        return wrap
      }
      case 'string':
        return this.createTextBox()
      case 'option': {
        const wrap = this.createSelectBox()
        wrap.input.loadItems(parameter.dataItems)
        wrap.input.branched = !!parameter.wrap
        return wrap
      }
      case 'easing': {
        const wrap = this.createSelectBox()
        wrap.input.loadItems(Data.createEasingItems())
        return wrap
      }
      case 'team': {
        const wrap = this.createSelectBox()
        wrap.input.loadItems(Data.createTeamItems())
        return wrap
      }
      case 'variable': {
        const wrap = this.createCustomBox()
        wrap.input.type = 'global-variable'
        wrap.input.filter = ''
        return wrap
      }
      case 'attribute':
      case 'attribute-key':
        if (parameter.filter === 'any') {
          const wrap = this.createCustomBox()
          wrap.input.type = 'attribute'
          return wrap
        } else {
          const wrap = this.createSelectBox()
          wrap.input.loadItems(Attribute.getAttributeItems(parameter.filter, '', true))
          return wrap
        }
      case 'attribute-group': {
        const wrap = this.createCustomBox()
        wrap.input.type = 'attribute-group'
        return wrap
      }
      case 'enum':
      case 'enum-value':
        if (parameter.filter === 'any') {
          const wrap = this.createCustomBox()
          wrap.input.type = 'enum-string'
          return wrap
        } else {
          const wrap = this.createSelectBox()
          wrap.input.loadItems(Enum.getStringItems(parameter.filter, true))
          return wrap
        }
      case 'enum-group': {
        const wrap = this.createCustomBox()
        wrap.input.type = 'enum-group'
        return wrap
      }
      case 'actor':
      case 'region':
      case 'light':
      case 'animation':
      case 'particle':
      case 'parallax':
      case 'tilemap': {
        const wrap = this.createCustomBox()
        wrap.input.type = 'preset-object'
        wrap.input.filter = type
        return wrap
      }
      case 'element':
      case 'element-id': {
        const wrap = this.createCustomBox()
        wrap.input.type = 'preset-element'
        wrap.input.filter = ''
        return wrap
      }
      case 'file': {
        const wrap = this.createCustomBox()
        wrap.input.type = 'file'
        wrap.input.filter = parameter.filter
        return wrap
      }
      case 'number[]':
      case 'string[]': {
        const wrap = this.createCustomBox()
        wrap.input.type = 'array'
        wrap.input.filter = type.slice(0, -2)
        return wrap
      }
      case 'keycode':
        return this.createKeyboardBox()
      case 'color':
        return this.createColorBox()
    }
  }

  // 更新参数输入框
  updateParamInput(wrap, value) {
    // if (value === undefined) {
    //   return
    // }
    switch (wrap.tag) {
      case 'check-box':
      case 'text-box':
        wrap.input.read() !== value &&
        wrap.input.write(value)
        break
      case 'number-box':
        // 读取值与内部值不一定相同
        if (wrap.input.read() !== value) {
          wrap.input.write(value)
        } else {
          wrap.input.input.value = value.toString()
        }
        break
      case 'keyboard-box':
      case 'color-box':
        wrap.input.read() !== value &&
        wrap.input.write(value)
        break
      case 'select-box':
      case 'custom-box':
        // 由于选择框和自定义框选项内容不固定
        // 在数据值相等时还要更新一下显示信息
        if (wrap.input.read() !== value) {
          wrap.input.write(value)
        } else {
          wrap.input.update()
        }
        break
    }
  }

  // 更新参数可见性
  updateParamDisplay(detailBox) {
    const {states} = detailBox.meta.manager
    for (const wrap of detailBox.wrap.children) {
      switch (states[wrap.input.key]) {
        case false:
          wrap.label.hide()
          wrap.input.hide()
          continue
        default:
          wrap.label.show()
          wrap.input.show()
          continue
      }
    }
  }

  // 创建复选框
  createCheckBox() {
    const {checkBoxes} = this
    if (checkBoxes.length !== 0) {
      return checkBoxes.pop()
    }
    const tag = 'check-box'
    const label = document.createElement('text')
    const input = new CheckBox(true)
    input.inputEventEnabled = true
    input.addClass('standard')
    input.addClass('large')
    return {tag, label, input}
  }

  // 创建数字框
  createNumberBox() {
    const {numberBoxes} = this
    if (numberBoxes.length !== 0) {
      return numberBoxes.pop()
    }
    const tag = 'number-box'
    const label = document.createElement('text')
    const input = new NumberBox()
    input.decimals = 10
    return {tag, label, input}
  }

  // 创建文本框
  createTextBox() {
    const {textBoxes} = this
    if (textBoxes.length !== 0) {
      return textBoxes.pop()
    }
    const tag = 'text-box'
    const label = document.createElement('text')
    const input = new TextBox()
    return {tag, label, input}
  }

  // 创建选择框
  createSelectBox() {
    const {selectBoxes} = this
    if (selectBoxes.length !== 0) {
      return selectBoxes.pop()
    }
    const tag = 'select-box'
    const label = document.createElement('text')
    const input = new SelectBox()
    return {tag, label, input}
  }

  // 创建按键框
  createKeyboardBox() {
    const {keyboardBoxes} = this
    if (keyboardBoxes.length !== 0) {
      return keyboardBoxes.pop()
    }
    const tag = 'keyboard-box'
    const label = document.createElement('text')
    const input = new KeyboardBox()
    return {tag, label, input}
  }

  // 创建颜色框
  createColorBox() {
    const {colorBoxes} = this
    if (colorBoxes.length !== 0) {
      return colorBoxes.pop()
    }
    const tag = 'color-box'
    const label = document.createElement('text')
    const input = new ColorBox()
    return {tag, label, input}
  }

  // 创建自定义框
  createCustomBox() {
    const {customBoxes} = this
    if (customBoxes.length !== 0) {
      return customBoxes.pop()
    }
    const tag = 'custom-box'
    const label = document.createElement('text')
    const input = new CustomBox()
    return {tag, label, input}
  }

  // 回收组件
  recycle(wrap) {
    switch (wrap.tag) {
      case 'detail-box': {
        const {children} = wrap
        let i = children.length
        while (--i >= 0) {
          this.recycle(children[i])
        }
        children.length = 0
        wrap.box.meta = null
        wrap.box.data = null
        this.detailBoxes.push(wrap)
        break
      }
      case 'check-box':
        wrap.label.remove()
        wrap.input.remove()
        wrap.input.parameters = null
        wrap.input.key = null
        this.checkBoxes.push(wrap)
        break
      case 'number-box':
        wrap.label.remove()
        wrap.input.remove()
        wrap.input.parameters = null
        wrap.input.key = null
        this.numberBoxes.push(wrap)
        break
      case 'text-box':
        wrap.label.remove()
        wrap.input.remove()
        wrap.input.parameters = null
        wrap.input.key = null
        this.textBoxes.push(wrap)
        break
      case 'select-box':
        wrap.label.remove()
        wrap.input.remove()
        wrap.input.parameters = null
        wrap.input.key = null
        wrap.input.clear()
        this.selectBoxes.push(wrap)
        break
      case 'keyboard-box':
        wrap.label.remove()
        wrap.input.remove()
        wrap.input.parameters = null
        wrap.input.key = null
        this.keyboardBoxes.push(wrap)
        break
      case 'color-box':
        wrap.label.remove()
        wrap.input.remove()
        wrap.input.parameters = null
        wrap.input.key = null
        if (wrap.input.tabIndex === 0) {
          this.colorBoxes.push(wrap)
        }
        break
      case 'custom-box':
        wrap.label.remove()
        wrap.input.remove()
        wrap.input.parameters = null
        wrap.input.key = null
        // 禁止获取焦点的自定义框可能正被打开
        // 应该丢弃它避免接收过期的数据
        // 此时父元素change事件发挥了作用
        if (wrap.input.tabIndex === 0) {
          this.customBoxes.push(wrap)
        }
        break
    }
  }

  // 清除内容
  clear() {
    this.metas = []
    const {wraps} = this
    let i = wraps.length
    if (i !== 0) {
      while (--i >= 0) {
        this.recycle(wraps[i])
      }
      wraps.length = 0
      super.clear()
    }
    if (!this.scriptList?.data) {
      window.off('script-change', this.scriptChange)
    }
  }

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'update':
        this.updateEventEnabled = true
        break
    }
  }

  // 组件 - 改变事件
  componentChange(event) {
    let element = event.target
    if (element.tagName === 'INPUT') {
      element = element.parentNode
    }
    const {parameters, key} = element
    const {scriptList} = this
    if (scriptList instanceof ParamList) {
      const {history} = scriptList
      const {editor} = history
      if (editor) {
        history.save({
          type: 'script-parameter-change',
          editor: editor,
          target: editor.target,
          meta: editor.meta,
          list: this,
          parameters: parameters,
          key: key,
          value: parameters[key],
        })
      }
    }
    parameters[key] = element.read()
    scriptList?.dispatchChangeEvent(1)
    // 更新参数可见性
    if (element.branched) {
      const grid = element.parentNode
      const detail = grid.parentNode
      PluginManager.reconstruct(detail.data)
      this.updateParamDisplay(detail)
      this.onResize?.()
    }
  }

  // 窗口 - 本地化事件
  static windowLocalize(event) {
    for (const {langMap} of this.metas) {
      const oldMap = langMap.active
      const newMap = langMap.update().active
      // 更新语言包后如果发生变化则重载脚本组件
      if (oldMap !== newMap) {
        return this.update()
      }
    }
  }

  // 脚本元数据改变事件
  static scriptChange(event) {
    for (const meta of this.metas) {
      if (meta === event.changedMeta) {
        if (this.contains(Select.target)) {
          Select.close()
        }
        this.update()
        return
      }
    }
  }
}

customElements.define('parameter-pane', ParameterPane)

// ******************************** 脚本参数面板导出 ********************************

export { ParameterPane }
