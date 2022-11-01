'use strict'

// ******************************** 导航栏 ********************************

class NavBar extends HTMLElement {
  writeEventEnabled   //:boolean
  selectEventEnabled  //:boolean

  constructor() {
    super()

    // 处理子元素
    const elements = this.childNodes
    if (elements.length > 0) {
      let i = elements.length
      while (--i >= 0) {
        const element = elements[i]
        if (element.tagName === 'NAV-ITEM') {
          const string = element.getAttribute('value')
          const isNumber = RegExp.number.test(string)
          element.dataValue = isNumber ? parseFloat(string) : string
        } else {
          this.removeChild(element)
        }
      }
    }

    // 设置属性
    this.writeEventEnabled = false
    this.selectEventEnabled = false

    // 侦听事件
    this.on('pointerdown', this.pointerdown)
  }

  // 读取数据
  read() {
    const item = this.querySelector('.selected')
    return item ? item.dataValue : undefined
  }

  // 写入数据
  write(value) {
    const items = this.childNodes
    const length = items.length
    if (length !== 0) {
      this.unselect()
      let target
      for (let i = 0; i < length; i++) {
        if (items[i].dataValue === value) {
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

  // 取消选择
  unselect() {
    const item = this.querySelector('.selected')
    if (item) {
      item.removeClass('selected')
    }
  }

  // 加载选项
  // loadItems(items) {
  //   this.textContent = ''
  //   for (const item of items) {
  //     const li = document.createElement('nav-item')
  //     li.dataValue = item.value
  //     li.textContent = item.name
  //     this.appendChild(li)
  //   }
  // }

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
    }
  }

  // 指针按下事件
  pointerdown(event) {
    switch (event.button) {
      case 0: {
        const element = event.target
        if (element.tagName === 'NAV-ITEM' &&
          !element.hasClass('selected')) {
          this.write(element.dataValue)
          if (this.selectEventEnabled) {
            const select = new Event('select')
            select.value = element.dataValue
            this.dispatchEvent(select)
          }
        }
        break
      }
    }
  }
}

customElements.define('nav-bar', NavBar)

export { NavBar }
