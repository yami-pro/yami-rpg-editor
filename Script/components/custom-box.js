'use strict'

// ******************************** 自定义框 ********************************

class CustomBox extends HTMLElement {
  info              //:element
  dataValue         //:any
  writeEventEnabled //:boolean
  inputEventEnabled //:boolean

  constructor() {
    super()

    // 创建文本
    const text = document.createElement('text')
    text.addClass('custom-box-text')
    this.appendChild(text)

    // 设置属性
    this.tabIndex = 0
    this.info = text
    this.dataValue = null
    this.writeEventEnabled = false
    this.inputEventEnabled = false

    // 侦听事件
    this.on('keydown', this.keydown)
    this.on('click', this.click)
  }

  // 获取类型属性
  get type() {
    return this.getAttribute('type')
  }

  // 获取过滤属性
  get filter() {
    return this.getAttribute('filter')
  }

  // 读取数据
  read() {
    return this.dataValue
  }

  // 写入数据
  write(value) {
    this.dataValue = value
    this.update()
    if (this.writeEventEnabled) {
      const write = new Event('write')
      write.value = this.dataValue
      this.dispatchEvent(write)
    }
  }

  // 输入数据
  input(value) {
    if (this.dataValue !== value) {
      this.write(value)
      if (this.inputEventEnabled) {
        const input = new Event('input')
        input.value = this.dataValue
        this.dispatchEvent(input)
      }
      this.dispatchChangeEvent()
    } else {
      if (this.type === 'file') {
        this.update()
      }
    }
  }

  // 更新信息
  update() {
    const value = this.dataValue
    switch (this.type) {
      case 'file':
        return this.updateFile(value)
      case 'clip':
        return this.updateClip(value)
      case 'variable':
        return this.updateVariable(value)
      case 'global-variable':
        return this.updateGlobalVariable(value)
      case 'actor':
        return this.updateActor(value)
      case 'skill':
        return this.updateSkill(value)
      case 'state':
        return this.updateState(value)
      case 'equipment':
        return this.updateEquipment(value)
      case 'item':
        return this.updateItem(value)
      case 'position':
        return this.updatePosition(value)
      case 'angle':
        return this.updateAngle(value)
      case 'trigger':
        return this.updateTrigger(value)
      case 'light':
        return this.updateLight(value)
      case 'element':
      case 'ancestor-element':
        return this.updateElement(value)
      case 'preset-object':
        return this.updatePresetObject(value)
      case 'preset-element':
        return this.updatePresetElement(value)
      case 'array':
        return this.updateArray(value)
      case 'attribute-group':
        return this.updateAttributeGroup(value)
      case 'enum-group':
        return this.updateEnumGroup(value)
      case 'enum-string':
        return this.updateEnumString(value)
    }
  }

  // 更新文件信息
  updateFile(guid) {
    Command.invalid = false
    this.info.textContent = Command.parseFileName(guid)
    Command.invalid
    ? this.info.addClass('invalid')
    : this.info.removeClass('invalid')
  }

  // 更新图像剪辑信息
  updateClip(clip) {
    this.info.textContent = clip.join(', ')
  }

  // 更新变量信息
  updateVariable(variable) {
    this.info.textContent = variable.key
    ? Command.parseVariable(variable)
    : Local.get('common.none')
  }

  // 更新全局变量信息
  updateGlobalVariable(id) {
    this.info.textContent = Command.parseGlobalVariable(id)
  }

  // 更新角色信息
  updateActor(actor) {
    this.info.textContent = Command.parseActor(actor)
  }

  // 更新技能信息
  updateSkill(skill) {
    this.info.textContent = Command.parseSkill(skill)
  }

  // 更新状态信息
  updateState(state) {
    this.info.textContent = Command.parseState(state)
  }

  // 更新装备信息
  updateEquipment(equipment) {
    this.info.textContent = Command.parseEquipment(equipment)
  }

  // 更新物品信息
  updateItem(item) {
    this.info.textContent = Command.parseItem(item)
  }

  // 更新位置信息
  updatePosition(point) {
    this.info.textContent = Command.parsePosition(point)
  }

  // 更新角度信息
  updateAngle(angle) {
    this.info.textContent = Command.parseAngle(angle)
  }

  // 更新触发器信息
  updateTrigger(trigger) {
    this.info.textContent = Command.parseTrigger(trigger)
  }

  // 更新光源信息
  updateLight(light) {
    this.info.textContent = Command.parseLight(light)
  }

  // 更新元素信息
  updateElement(element) {
    this.info.textContent = Command.parseElement(element)
  }

  // 更新预设对象信息
  updatePresetObject(preset) {
    this.info.textContent = Command.parsePresetObject(preset)
  }

  // 更新预设元素信息
  updatePresetElement(preset) {
    this.info.textContent = Command.parsePresetElement(preset)
  }

  // 更新数组信息
  updateArray(array) {
    this.info.textContent = array.length !== 0
    ? Command.parseMultiLineString(array.join(', '))
    : Local.get('common.empty')
  }

  // 更新属性群组信息
  updateAttributeGroup(groupId) {
    if (groupId === '') {
      this.info.textContent = Local.get('common.none')
      this.info.removeClass('invalid')
      return
    }
    const group = Attribute.getGroup(groupId)
    if (group) {
      this.info.textContent = group.groupName
      this.info.removeClass('invalid')
    } else {
      this.info.textContent = Command.parseUnlinkedId(groupId)
      this.info.addClass('invalid')
    }
  }

  // 更新枚举群组信息
  updateEnumGroup(groupId) {
    if (groupId === '') {
      this.info.textContent = Local.get('common.none')
      this.info.removeClass('invalid')
      return
    }
    const group = Enum.getEnumGroup(groupId)
    if (group) {
      this.info.textContent = group.groupName
      this.info.removeClass('invalid')
    } else {
      this.info.textContent = Command.parseUnlinkedId(groupId)
      this.info.addClass('invalid')
    }
  }

  // 更新枚举字符串信息
  updateEnumString(stringId) {
    if (stringId === '') {
      this.info.textContent = Local.get('common.none')
      this.info.removeClass('invalid')
      return
    }
    const string = Enum.getString(stringId)
    if (string) {
      this.info.textContent = string.name
      this.info.removeClass('invalid')
    } else {
      this.info.textContent = Command.parseUnlinkedId(stringId)
      this.info.addClass('invalid')
    }
  }

  // 启用元素
  enable() {
    if (this.removeClass('disabled')) {
      this.tabIndex += 1
      this.showChildNodes()
    }
  }

  // 禁用元素
  disable() {
    if (this.addClass('disabled')) {
      this.tabIndex -= 1
      this.hideChildNodes()
    }
  }

  // 添加事件
  on(type, listener, options) {
    super.on(type, listener, options)
    switch (type) {
      case 'write':
        this.writeEventEnabled = true
        break
      case 'input':
        this.inputEventEnabled = true
        break
    }
  }

  // 键盘按下事件
  keydown(event) {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        if (!event.cmdOrCtrlKey) {
          event.stopPropagation()
          this.click(event)
        }
        break
    }
  }

  // 鼠标点击事件
  click(event) {
    switch (this.type) {
      case 'file':
        return Selector.open(this)
      case 'clip':
        return ImageClip.open(this)
      case 'variable':
        return VariableGetter.open(this)
      case 'global-variable':
        return Variable.open(this)
      case 'actor':
        return ActorGetter.open(this)
      case 'skill':
        return SkillGetter.open(this)
      case 'state':
        return StateGetter.open(this)
      case 'equipment':
        return EquipmentGetter.open(this)
      case 'item':
        return ItemGetter.open(this)
      case 'position':
        return PositionGetter.open(this)
      case 'angle':
        return AngleGetter.open(this)
      case 'trigger':
        return TriggerGetter.open(this)
      case 'light':
        return LightGetter.open(this)
      case 'element':
        return ElementGetter.open(this)
      case 'ancestor-element':
        return AncestorGetter.open(this)
      case 'preset-object':
        return PresetObject.open(this)
      case 'preset-element':
        return PresetElement.open(this)
      case 'array':
        return ArrayList.open(this)
      case 'attribute-group':
        return Attribute.open(this, 'group')
      case 'enum-group':
        return Enum.open(this, 'group')
      case 'enum-string':
        return Enum.open(this, 'string')
    }
  }
}

customElements.define('custom-box', CustomBox)

export { CustomBox }
