'use strict'

import { Timer } from '../util/timer.js'

// ******************************** 菜单列表 ********************************

class MenuList extends HTMLElement {
  state             //:string
  callback          //:function
  dataItems         //:array
  selection         //:element
  popupTimer        //:object
  closeTimer        //:object
  parent            //:element
  submenu           //:element
  buttonPressed     //:boolean
  minWidth          //:number
  parentMenuItem    //:element
  windowBlur        //:function
  windowKeydown     //:function
  windowPointerdown //:function
  windowPointerup   //:function
  windowPointerover //:function
  windowPointerout  //:function

  constructor() {
    super()

    // 设置属性
    this.state = 'closed'
    this.callback = null
    this.dataItems = null
    this.selection = null
    this.popupTimer = null
    this.closeTimer = null
    this.parent = null
    this.submenu = null
    this.buttonPressed = false
    this.minWidth = 0
    this.windowBlur = MenuList.windowBlur.bind(this)
    this.windowKeydown = MenuList.windowKeydown.bind(this)
    this.windowPointerdown = MenuList.windowPointerdown.bind(this)
    this.windowPointerup = MenuList.windowPointerup.bind(this)
    this.windowPointerover = MenuList.windowPointerover.bind(this)
    this.windowPointerout = MenuList.windowPointerout.bind(this)
  }

  // 弹出菜单
  popup(options, items) {
    this.close()
    this.state = 'open'
    this.dataItems = items
    this.callback = options.close ?? null
    this.parent = options.parent ?? null
    this.minWidth = options.minWidth ?? 180
    for (let i = 0; i < items.length; i++) {
      this.appendChild(this.createItem(items[i]))
    }

    document.body.appendChild(this)
    this.computeMenuWidth()
    const {width, height} = this.rect()
    const dpx = 1 / window.devicePixelRatio
    const right = window.innerWidth - width - dpx
    const bottom = window.innerHeight - height - dpx
    const x = options.x ?? 0
    const y = options.y ?? 0
    this.style.left = `${Math.min(x + dpx, right)}px`
    this.style.top = `${Math.min(y + dpx, bottom)}px`
    this.style.zIndex = Window.frames.length + 1

    // 侦听事件
    window.event?.stopPropagation()
    window.on('blur', this.windowBlur)
    window.on('pointerdown', this.windowPointerdown)
    window.on('pointerup', this.windowPointerup)
    window.on('pointerover', this.windowPointerover)
    window.on('pointerout', this.windowPointerout)
    window.on('keydown', this.windowKeydown, {capture: true})
    // window.on('keyup', this.windowKeyup, {capture: true})
    this.on('pointerenter', this.pointerenter)
  }

  // 计算菜单宽度
  computeMenuWidth() {
    let labelWidth = 0
    let acceleratorWidth = 0
    for (const li of this.childNodes) {
      const {label, accelerator} = li
      if (label !== undefined) {
        labelWidth = Math.max(
          labelWidth,
          label.offsetWidth,
        )
      }
      if (accelerator !== undefined) {
        acceleratorWidth = Math.max(
          acceleratorWidth,
          accelerator.offsetWidth,
        )
      }
    }
    let padding = 48
    if (labelWidth > 0 &&
      acceleratorWidth > 0) {
      padding += 10
    }
    const width = labelWidth + acceleratorWidth + padding
    this.style.width = `${Math.max(width, this.minWidth)}px`
  }

  // 关闭菜单
  close() {
    if (this.state === 'open') {
      this.state = 'closed'
      this.unselect()
      this.callback?.()
      this.callback = null
      this.submenu?.close()
      this.dataItems = null
      this.parent = null
      this.buttonPressed = false
      document.body.removeChild(this.clear())

      // 取消侦听事件
      window.off('blur', this.windowBlur)
      window.off('pointerdown', this.windowPointerdown)
      window.off('pointerup', this.windowPointerup)
      window.off('pointerover', this.windowPointerover)
      window.off('pointerout', this.windowPointerout)
      window.off('keydown', this.windowKeydown, {capture: true})
      // window.off('keyup', this.windowKeyup, {capture: true})
      this.off('pointerenter', this.pointerenter)
    }
  }

  // 创建项目
  createItem(item) {
    switch (item.type) {
      case 'separator':
        return document.createElement('menu-separator')
      default: {
        // 创建列表项
        const li = document.createElement('menu-item')
        li.dataValue = item

        // 禁用列表项
        if (item.enabled === false) {
          li.addClass('disabled')
        }

        // 创建勾选标记
        if (item.checked === true) {
          const mark = document.createElement('menu-checked')
          mark.textContent = '✓'
          li.appendChild(mark)
        }

        // 添加图标元素
        if (item.icon !== undefined) {
          li.appendChild(item.icon)
        }

        // 创建标签元素
        if (item.label !== undefined) {
          const label = document.createElement('menu-label')
          label.textContent = item.label
          li.label = label
          li.appendChild(label)
        }

        // 创建快捷键元素
        if (item.accelerator !== undefined) {
          const accelerator = document.createElement('menu-accelerator')
          accelerator.textContent = item.accelerator
          li.accelerator = accelerator
          li.appendChild(accelerator)
        }

        // 设置样式
        if (item.style !== undefined) {
          li.addClass(item.style)
        }

        // 创建子菜单标记
        if (item.submenu !== undefined) {
          const accelerator = document.createElement('menu-sub-mark')
          accelerator.textContent = '>'
          li.appendChild(accelerator)
        }
        return li
      }
    }
  }

  // 选择选项
  select(element) {
    if (this.selection !== element) {
      this.unselect()
      this.selection = element
      this.selection.addClass('selected')
    }
  }

  // 取消选择
  unselect() {
    if (this.selection) {
      this.selection.removeClass('selected')
      this.selection = null
      if (this.popupTimer) {
        this.popupTimer.remove()
        this.popupTimer = null
      }
    }
  }

  // 重新选择
  reselect(offset) {
    const elements = []
    for (const element of this.childNodes) {
      if (element.tagName === 'MENU-ITEM' &&
        !element.hasClass('disabled')) {
        elements.push(element)
      }
    }
    const length = elements.length
    if (length === 0) {
      return
    }
    if (this.selection) {
      const last = elements.indexOf(this.selection)
      const index = (last + offset + length) % length
      this.select(elements[index])
    } else {
      switch (offset) {
        case 1:
          this.select(elements[0])
          break
        case -1:
          this.select(elements[length - 1])
          break
      }
    }
  }

  // 弹出子菜单
  popupSubmenu(delay) {
    const element = this.selection
    if (element instanceof HTMLElement &&
      element !== this.submenu?.parentMenuItem) {
      const node = element.dataValue
      if (node.submenu) {
        if (!this.popupTimer) {
          this.popupTimer = new Timer({
            duration: delay,
            callback: () => {
              this.popupTimer = null
              if (element === this.selection) {
                const rect = element.rect()
                let x = rect.right
                let y = rect.top - 5
                let width = rect.width + 2
                if (x + width > window.innerWidth) {
                  x = rect.left - width
                }
                this.submenu?.close()
                this.submenu = new MenuList()
                this.submenu.parentMenuItem = element
                this.submenu.popup({
                  x: x,
                  y: y,
                  parent: this,
                  close: () => {
                    this.submenu = null
                  },
                }, node.submenu)
              }
            }
          }).add()
        }
        if (delay === 0) {
          this.popupTimer.finish()
        }
      }
    }
  }

  // 关闭子菜单
  closeSubmenu(delay) {
    const {submenu, selection} = this
    if (submenu?.parentMenuItem === selection) {
      if (!this.closeTimer) {
        this.closeTimer = new Timer({
          duration: delay,
          callback: () => {
            this.closeTimer = null
            if (submenu === this.submenu &&
              selection !== this.selection) {
              submenu.close()
            }
          }
        }).add()
      }
    }
  }

  // 指针进入事件
  pointerenter(event) {
    this.parent?.select(this.parentMenuItem)
  }

  // 窗口 - 失去焦点事件
  static windowBlur(event) {
    this.close()
  }

  // 窗口 - 键盘按下事件
  static windowKeydown(event) {
    if (!this.submenu) {
      event.preventDefault()
      event.stopPropagation()
      switch (event.code) {
        case 'Escape':
          this.close()
          break
        case 'Enter':
        case 'NumpadEnter':
          if (this.selection) {
            const node = this.selection.dataValue
            if (node.submenu) {
              this.popupSubmenu(0)
              this.submenu &&
              this.submenu.reselect(1)
            } else {
              node.click &&
              node.click()
              let menu = this
              while (menu.parent) {
                menu = menu.parent
              }
              menu.close()
            }
          }
          break
        case 'ArrowUp':
          this.reselect(-1)
          break
        case 'ArrowDown':
          this.reselect(1)
          break
        case 'ArrowLeft':
          if (this.parent) {
            this.close()
          }
          break
        case 'ArrowRight':
          this.popupSubmenu(0)
          this.submenu &&
          this.submenu.reselect(1)
          break
      }
    }
  }

  // 窗口 - 键盘弹起事件
  // static windowKeyup(event) {
  //   event.preventDefault()
  //   event.stopPropagation()
  // }

  // 窗口 - 指针按下事件
  static windowPointerdown(event) {
    // 阻止 activeElement blur 行为
    const element = event.target.seek('menu-list')
    if (element instanceof MenuList || (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement) &&
      document.activeElement !== event.target && !(
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault()
    }
    switch (event.button) {
      case 0:
        if (element.tagName !== 'MENU-LIST') {
          this.close()
        } else if (element === this) {
          this.buttonPressed = true
        }
        break
      case 2:
        if (element.tagName !== 'MENU-LIST') {
          this.close()
        }
        break
    }
  }

  // 窗口 - 指针弹起事件
  static windowPointerup(event) {
    switch (event.button) {
      case 0: {
        const element = event.target
        switch (element.tagName) {
          case 'MENU-ITEM':
            if (this.buttonPressed) {
              this.buttonPressed = false
              if (!element.hasClass('disabled')) {
                const node = element.dataValue
                if (node.submenu) {
                  this.popupSubmenu(0)
                } else if (node.click) {
                  let root = this
                  while (root.parent) {
                    root = root.parent
                  }
                  node.click()
                  root.close()
                }
              }
            }
            break
          case 'MENU-LIST':
            break
          default:
            this.close()
            break
        }
        break
      }
    }
  }

  // 窗口 - 指针进入事件
  static windowPointerover(event) {
    const element = event.target
    if (element !== this.selection &&
      element.parentNode === this &&
      element.tagName === 'MENU-ITEM' &&
      !element.hasClass('disabled')) {
      // 取消关闭子菜单的计时器
      if (this.closeTimer &&
        this.submenu?.parentMenuItem === element) {
        this.closeTimer.remove()
        this.closeTimer = null
      }
      // 因为逆序更新计时器
      // 弹出比关闭先执行
      this.closeSubmenu(400)
      this.select(element)
      this.popupSubmenu(400)
    }
  }

  // 窗口 - 指针离开事件
  static windowPointerout(event) {
    const element = event.target
    if (this.selection === element) {
      if (this.submenu !== null) {
        this.closeSubmenu(400)
      }
      this.unselect()
    }
  }
}

customElements.define('menu-list', MenuList)

// 创建菜单列表实例
const Menu = new MenuList()

export {
  // class
  MenuList,
  // variable
  Menu
}
