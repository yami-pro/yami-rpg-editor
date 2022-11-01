'use strict'

// ******************************** 标签栏 ********************************

class TabBar extends HTMLElement {
  data                //:array
  dragging            //:event
  selectionIndex      //:number
  writeEventEnabled   //:boolean
  selectEventEnabled  //:boolean
  closedEventEnabled  //:boolean
  popupEventEnabled   //:boolean
  windowPointerup     //:function

  constructor() {
    super()

    // 设置属性
    this.data = null
    this.dragging = null
    this.selectionIndex = 0
    this.writeEventEnabled = false
    this.selectEventEnabled = false
    this.closedEventEnabled = false
    this.popupEventEnabled = false
    this.windowPointerup = TabBar.windowPointerup.bind(this)

    // 侦听事件
    this.on('pointerdown', this.pointerdown)
    this.on('dragstart', this.dragstart)
    this.on('dragend', this.dragend)
  }

  // 读取数据
  read() {
    const item = this.querySelector('.selected')
    return item ? item.item : undefined
  }

  // 写入数据
  write(value) {
    const items = this.childNodes
    const length = items.length
    if (length !== 0) {
      this.unselect()
      let target
      for (let i = 0; i < length; i++) {
        if (items[i].item === value) {
          this.selectionIndex = i
          target = items[i]
          break
        }
      }
      if (target !== undefined) {
        target.addClass('selected')
      }
      if (this.writeEventEnabled) {
        const write = new Event('write')
        write.value = target ? value : undefined
        this.dispatchEvent(write)
      }
    }
  }

  // 更新标签列表
  update() {
    super.clear()
    for (const item of this.data) {
      let tab = item.tab
      if (tab === undefined) {
        tab = item.tab = document.createElement('tab-item')
        const text = document.createElement('tab-text')
        text.textContent = this.parseTabName(item)
        tab.draggable = true
        tab.item = item
        tab.text = text
        tab.appendChild(text)
        // 给目录以外的标签添加关闭按钮
        if (item.type !== 'directory') {
          const mark = document.createElement('tab-close')
          mark.textContent = '\u2716'
          tab.appendChild(mark)
        }
      }
      this.appendChild(tab)
    }
  }

  // 解析标签名称
  parseTabName(item) {
    return `${item.icon} ${item.name}`
  }

  // 选择项目
  select(item) {
    if (this.read() !== item) {
      this.write(item)
      if (this.selectEventEnabled) {
        const select = new Event('select')
        select.value = item
        this.dispatchEvent(select)
      }
    }
  }

  // 取消选择
  unselect() {
    const item = this.querySelector('.selected')
    if (item) {
      item.removeClass('selected')
    }
  }

  // 插入项目
  insert(item) {
    if (!this.data.includes(item)) {
      // 索引超过长度时会加入到末尾
      this.data.splice(this.selectionIndex + 1, 0, item)
      this.update()
    }
  }

  // 关闭项目
  close(item) {
    if (item === this.dirItem) return
    const value = this.read()
    if (this.data.remove(item)) {
      this.update()
      if (this.closedEventEnabled) {
        const closed = new Event('closed')
        closed.closedItems = [item]
        closed.lastValue = value
        this.dispatchEvent(closed)
      }
    }
  }

  // 关闭属性匹配的项目
  closeByProperty(key, value) {
    for (const context of this.data) {
      if (context[key] === value) {
        this.close(context)
        return
      }
    }
  }

  // 关闭其他项目
  closeOtherTabs(item) {
    const value = this.read()
    const items = this.data
    let i = items.length
    if (i <= 1) return
    const closedItems = []
    while (--i >= 0) {
      const tab = items[i]
      if (tab === item) continue
      if (tab === this.dirItem) continue
      items.splice(i, 1)
      closedItems.push(tab)
    }
    if (closedItems.length !== 0) {
      this.update()
      if (this.closedEventEnabled) {
        const closed = new Event('closed')
        closed.closedItems = closedItems
        closed.lastValue = value
        this.dispatchEvent(closed)
      }
    }
  }

  // 关闭右侧项目
  closeTabsToTheRight(item) {
    const value = this.read()
    const items = this.data
    const index = items.indexOf(item)
    if (index === -1) return
    const closedItems = []
    let i = items.length
    while (--i > index) {
      const tab = items[i]
      if (tab === this.dirItem) continue
      items.splice(i, 1)
      closedItems.push(tab)
    }
    if (closedItems.length !== 0) {
      this.update()
      if (this.closedEventEnabled) {
        const closed = new Event('closed')
        closed.closedItems = closedItems
        closed.lastValue = value
        this.dispatchEvent(closed)
      }
    }
  }

  // 查找项目
  find(meta) {
    for (const {item} of this.childNodes) {
      if (item.meta === meta) {
        return item
      }
    }
    return undefined
  }

  // 添加事件
  on(type, listener, options) {
    super.on(type, listener, options)
    switch (type) {
      case 'write':
        this.writeEventEnabled = true
        break
      case 'select':
        this.selectEventEnabled = true
        break
      case 'closed':
        this.closedEventEnabled = true
        break
      case 'popup':
        this.popupEventEnabled = true
        break
    }
  }

  // 指针按下事件
  pointerdown(event) {
    this.dragend()
    switch (event.button) {
      case 0: {
        const element = event.target
        if (element.tagName === 'TAB-CLOSE') {
          // 阻止拖拽开始事件
          event.preventDefault()
          this.dragging = event
          event.mode = 'close'
          window.on('pointerup', this.windowPointerup)
          return
        }
        if (element.tagName === 'TAB-ITEM' &&
          !element.hasClass('selected')) {
          this.select(element.item)
        }
        break
      }
      case 2:
        if (this.popupEventEnabled) {
          switch (event.target.tagName) {
            case 'TAB-ITEM':
            case 'TAB-BAR':
              this.dragging = event
              event.mode = 'popup'
              window.on('pointerup', this.windowPointerup)
              break
          }
        }
        break
    }
  }

  // 拖拽开始事件
  dragstart(event) {
    if (!this.dragging) {
      this.dragging = event
      Object.defineProperty(event, 'offsetX', {writable: true})
      event.preventDefault = Function.empty
      event.dataTransfer.hideDragImage()
      event.hint = document.createElement('drag-and-drop-hint')
      event.hint.addClass('for-tab')
      this.parentNode.insertBefore(event.hint.hide(), this)
      this.addClass('dragging')
      Title.updateAppRegion()
      this.on('dragenter', this.dragenter)
      this.on('dragleave', this.dragleave)
      this.on('dragover', this.dragover)
      this.on('drop', this.drop)
    }
  }

  // 拖拽结束事件
  dragend(event) {
    if (this.dragging) {
      this.removeClass('dragging')
      this.parentNode.removeChild(this.dragging.hint)
      this.dragging = null
      this.off('dragenter', this.dragenter)
      this.off('dragleave', this.dragleave)
      this.off('dragover', this.dragover)
      this.off('drop', this.drop)
    }
  }

  // 拖拽进入事件
  dragenter(event) {
    if (this.dragging) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }
  }

  // 拖拽离开事件
  dragleave(event) {
    if (this.dragging &&
      !this.contains(event.relatedTarget)) {
      this.dragging.offsetX = -1
      this.dragging.hint.hide()
    }
  }

  // 拖拽悬停事件
  dragover(event) {
    const {dragging} = this
    if (dragging) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      if (dragging.offsetX === event.offsetX) {
        return
      }
      dragging.offsetX = event.offsetX
      const element = event.target.seek('tab-item')
      const hint = dragging.hint.show()
      if (element.tagName === 'TAB-ITEM') {
        const sItem = dragging.target.item
        const dItem = element.item
        if (sItem === dItem) {
          return hint.hide()
        }
        // 避免使用event.offsetX
        // 这样当指针落在关闭按钮上也能计算位置
        const rect = element.rect()
        const middle = rect.width / 2
        const offsetX = event.clientX - rect.left
        const position = offsetX < middle ? 'before' : 'after'
        switch (position) {
          case 'before':
            if (hint.target !== element ||
              hint.position !== position) {
              if (element.previousSibling === dragging.target) {
                return hint.hide()
              }
              const rect = hint.measure(element)
              rect.left -= 1
              rect.width = 2
              hint.target = element
              hint.position = position
              hint.set(rect)
            }
            break
          case 'after':
            if (hint.target !== element ||
              hint.position !== position) {
              if (element.nextSibling === dragging.target) {
                return hint.hide()
              }
              const rect = hint.measure(element)
              rect.left += rect.width - 1
              rect.width = 2
              hint.target = element
              hint.position = position
              hint.set(rect)
            }
            break
        }
      } else {
        const elements = this.childNodes
        const index = elements.length - 1
        const element = elements[index]
        if (element === dragging.target) {
          return hint.hide()
        }
        if (element !== undefined &&
          (hint.target !== element ||
          hint.position !== 'after')) {
          const rect = hint.measure(element)
          rect.left += rect.width - 1
          rect.width = 2
          hint.target = element
          hint.position = 'after'
          hint.set(rect)
        }
      }
    }
  }

  // 拖拽释放事件
  drop(event) {
    const {dragging} = this
    if (!dragging) {
      return
    }
    event.stopPropagation()
    const hint = dragging.hint
    if (!hint.hasClass('hidden')) {
      const items = this.data
      const sItem = dragging.target.item
      const dItem = hint.target.item
      if (items.remove(sItem)) {
        let dIndex = items.indexOf(dItem)
        if (hint.position === 'after') {
          dIndex++
        }
        items.splice(dIndex, 0, sItem)
        this.selectionIndex = dIndex
        this.update()
      }
    }

    // 创建项目后不能触发拖拽结束事件
    this.dragend()
  }

  // 窗口 - 指针弹起事件
  static windowPointerup(event) {
    const {dragging} = this
    if (dragging.relate(event)) {
      switch (dragging.mode) {
        case 'close':
          if (dragging.target === event.target) {
            this.close(event.target.parentNode.item)
          }
          break
        case 'popup':
          if (dragging.target === event.target) {
            const popup = new Event('popup')
            const item = event.target.item
            popup.value = item ?? null
            popup.clientX = event.clientX
            popup.clientY = event.clientY
            this.dispatchEvent(popup)
          }
          break
      }
      this.dragging = null
      window.off('pointerup', this.windowPointerup)
    }
  }
}

customElements.define('tab-bar', TabBar)

export { TabBar }
