"use strict"

import {
  Menu,
  CommonList,
  TextBox,
  Browser_links,
  Directory,
  File,
  FS,
  FSP,
  Path,
  Timer,
  FolderItem,
  FileItem
} from "../yami"

// ******************************** 文件导航面板 ********************************

class FileNavPane extends HTMLElement {
  timer: Timer
  elements: HTMLElement[]
  selections: (FolderItem | FileItem)[]
  pressing: ((event: any) => void) | null
  selectEventEnabled: boolean
  textBox: TextBox
  links: Browser_links

  constructor() {
    super()

    // 创建重命名计时器
    const timer = new Timer({
      duration: 500,
      callback: timer => {
        const files = this.selections
        if (files.length === 1) {
          const file = files[0]
          const target = timer.target
          const context = file.getContext(this)
          const element = context.element
          if (element.contains(target)) {
            this.rename(file)
          }
        }
        timer.target = null
        timer.running = false
      },
    })

    // 设置属性
    this.tabIndex = -1
    this.timer = timer
    this.elements = []
    this.elements.versionId = 0
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.elements.head = null
    this.elements.foot = null
    this.selections = []
    this.pressing = null
    this.selectEventEnabled = false
    this.textBox = FileNavPane.textBox
    this.listenDraggingScrollbarEvent()

    // 侦听事件
    this.on('scroll', this.resize)
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
    this.on('pointerup', this.pointerup)
    this.on('doubleclick', this.doubleclick)
    this.on('select', this.listSelect)
    window.on('dirchange', this.dirchange.bind(this))
  }

  // 加载文件夹
  load(...folders) {
    this.select(...folders)
    for (let folder of folders) {
      while (folder = folder.parent) {
        folder.getContext(this).expanded = true
      }
    }
    this.update()
  }

  // 更新列表
  update() {
    const {elements} = this
    elements.start = -1
    elements.count = 0

    // 创建列表项目
    const {directory} = this.parentNode
    if (directory) {
      this.createItems(directory, 0)
    }

    // 清除多余的元素
    this.clearElements(elements.count)

    // 重新调整
    this.resize()
  }

  // 重新调整
  resize() {
    return CommonList.resize(this)
  }

  // 更新头部和尾部元素
  updateHeadAndFoot() {
    return CommonList.updateHeadAndFoot(this)
  }

  // 在重新调整时更新
  updateOnResize(element) {
    if (element.changed) {
      element.changed = false
      this.updateFolderElement(element)
    }
  }

  // 创建项目
  createItems(dir, indent) {
    if (dir.sorted === undefined) {
      dir.sorted = true
      Directory.sortFiles(dir)
    }
    const elements = this.elements
    const length = dir.length
    for (let i = 0; i < length; i++) {
      const file = dir[i]
      elements[elements.count++] =
      this.createFolderElement(file, indent)
      const context = file.getContext(this)
      if (context.expanded &&
        file.subfolders) {
        this.createItems(
          file.subfolders,
          indent + 1,
        )
      }
    }
  }

  // 创建文件夹元素
  createFolderElement(file, indent) {
    const context = file.getContext(this)
    let element = context.element
    if (element === undefined) {
      // 创建文件夹
      element = document.createElement('file-nav-item')
      element.file = file
      element.context = context
      context.element = element

      // 激活选中状态
      const {selections} = this
      if (selections.length !== 0 &&
        selections.includes(file)) {
        element.addClass('selected')
      }
    }
    element.indent = indent
    element.changed = true
    return element
  }

  // 更新文件夹元素
  updateFolderElement(element) {
    const {file, context} = element
    if (!element.textNode) {
      // 创建折叠标记
      const folderMark = document.createElement('folder-mark')
      element.appendChild(folderMark)

      // 创建文件夹图标
      const fileIcon = document.createElement('file-nav-icon')
      fileIcon.addClass('icon-folder')
      element.appendChild(fileIcon)

      // 创建文本节点
      const textNode = document.createTextNode(file.name)
      element.appendChild(textNode)

      // 设置元素属性
      element.draggable = true
      element.expanded = false
      element.markVisible = true
      element.textIndent = 0
      element.folderMark = folderMark
      element.fileIcon = fileIcon
      element.textNode = textNode
    }

    // 开关折叠标记
    const markVisible = file.subfolders.length !== 0
    if (element.markVisible !== markVisible) {
      element.markVisible = markVisible
      element.folderMark.style.visibility =
      markVisible ? 'inherit' : 'hidden'
    }

    // 设置折叠标记
    const expanded = markVisible && context.expanded
    if (element.expanded !== expanded) {
      element.expanded = expanded
      switch (expanded) {
        case true:
          element.folderMark.addClass('expanded')
          element.fileIcon.addClass('expanded')
          break
        case false:
          element.folderMark.removeClass('expanded')
          element.fileIcon.removeClass('expanded')
          break
      }
    }

    // 设置文本缩进
    const textIndent = element.indent * 12
    if (element.textIndent !== textIndent) {
      element.textIndent = textIndent
      element.style.textIndent = `${textIndent}px`
    }
  }

  // 选择项目
  select(...files) {
    this.unselect()
    this.selections = files
    for (const file of files) {
      const context = file.getContext(this)
      const element = context.element
      if (element !== undefined) {
        element.addClass('selected')
      }
    }
    if (this.selectEventEnabled) {
      const select = new Event('select')
      select.value = files
      this.dispatchEvent(select)
    }
  }

  // 取消选择
  unselect() {
    const files = this.selections
    if (files.length !== 0) {
      FileNavPane.textBox.input.blur()
      for (const file of files) {
        const context = file.getContext(this)
        const element = context.element
        if (element !== undefined) {
          element.removeClass('selected')
        }
      }
      this.selections = []
    }
  }

  // 选择相对位置的项目
  selectRelative(direction) {
    const elements = this.elements
    const count = elements.count
    if (count > 0) {
      let index
      let start = Infinity
      let end = -Infinity
      const last = count - 1
      const {selections} = this
      for (const file of selections) {
        const {element} = file.getContext(this)
        const index = elements.indexOf(element)
        if (index !== -1) {
          start = Math.min(start, index)
          end = Math.max(end, index)
        }
      }
      switch (direction) {
        case 'up':
          index = Math.clamp(start - 1, 0, last)
          break
        case 'down':
          index = Math.clamp(end + 1, 0, last)
          break
      }
      const file = elements[index]?.file
      if (!(selections.length === 1 &&
        selections[0] === file)) {
        this.select(file)
      }
      this.scrollToSelection()
    }
  }

  // 滚动到选中项
  scrollToSelection(mode = 'active') {
    const {selections} = this
    if (selections.length === 1 && this.hasScrollBar()) {
      const selection = selections[0]
      const elements = this.elements
      const count = elements.count
      for (let i = 0; i < count; i++) {
        if (elements[i].file === selection) {
          let scrollTop
          switch (mode) {
            case 'active':
              scrollTop = Math.clamp(
                this.scrollTop,
                i * 20 + 20 - this.innerHeight,
                i * 20,
              )
              break
            case 'middle':
              scrollTop = Math.round((
                i * 20 + 10
              - this.innerHeight / 2)
              / 20) * 20
              break
            default:
              return
          }
          if (this.scrollTop !== scrollTop) {
            this.scrollTop = scrollTop
          }
          break
        }
      }
    }
  }

  // 获取选项
  getSelections() {
    const {browser} = this.links
    switch (browser.display) {
      case 'normal':
        return this.selections
      case 'search':
        return browser.backupFolders
    }
  }

  // 重命名
  rename(file) {
    const {textBox} = FileNavPane
    if (document.activeElement === this &&
      file !== Directory.assets &&
      !textBox.parentNode) {
      const context = file.getContext(this)
      const element = context.element
      if (element && element.parentNode) {
        element.textNode.nodeValue = ''
        element.appendChild(textBox)
        textBox.write(file.name)
        textBox.getFocus('all')
        textBox.fitContent()
      }
    }
  }

  // 取消重命名
  cancelRenaming() {
    const {timer} = this
    if (timer.target) {
      timer.target = null
    }
    if (timer.running) {
      timer.running = false
      timer.remove()
    }
  }

  // 清除元素
  clearElements(start) {
    // 有条件地调整缓存大小
    const {elements} = this
    if (elements.length > 256 &&
      elements.length !== start) {
      elements.length = start
    }
    let i = start
    while (elements[i] !== undefined) {
      elements[i++] = undefined
    }
  }

  // 清除列表
  clear() {
    this.unselect()
    this.textContent = ''
    this.clearElements(0)
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.updateHeadAndFoot()
    return this
  }

  // 添加事件
  on(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    super.on(type, listener, options)
    switch (type) {
      case 'select':
        this.selectEventEnabled = true
        break
    }
  }

  // 键盘按下事件
  keydown(event) {
    if (event.cmdOrCtrlKey) {
      switch (event.code) {
        case 'ArrowUp':
          this.scrollTop -= 20
          break
        case 'ArrowDown':
          this.scrollTop += 20
          break
        default:
          return
      }
      event.stopImmediatePropagation()
    } else if (event.altKey) {
      return
    } else {
      switch (event.code) {
        case 'Space':
          event.preventDefault()
          this.links.body.content.focus()
          break
        case 'ArrowRight': {
          event.preventDefault()
          const files = this.selections
          if (files.length === 1) {
            const file = files[0]
            if (file.subfolders.length !== 0) {
              const context = file.getContext(this)
              context.expanded = !context.expanded
              this.update()
            }
          }
          break
        }
        // case 'Enter':
        // case 'NumpadEnter': {
        //   const item = this.selection
        //   if (!item || item.children) {
        //     event.stopPropagation()
        //   }
        //   break
        // }
        case 'ArrowUp':
          event.preventDefault()
          this.selectRelative('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          this.selectRelative('down')
          break
        case 'F2': {
          const files = this.selections
          if (files.length === 1) {
            this.cancelRenaming()
            this.rename(files[0])
          }
          break
        }
        default:
          return
      }
      event.stopImmediatePropagation()
    }
  }

  // 指针按下事件
  pointerdown(event) {
    this.cancelRenaming()
    switch (event.button) {
      case 0: case 2: {
        let element = event.target
        if (element.tagName === 'FOLDER-MARK') {
          // 阻止拖拽开始事件
          event.preventDefault()
          if (event.button === 0) {
            const file = element.parentNode.file
            const context = file.getContext(this)
            context.expanded = !context.expanded
            this.update()
          }
        } else {
          if (element.tagName === 'FILE-NAV-ICON') {
            element = element.parentNode
          }
          if (element.tagName === 'FILE-NAV-ITEM') {
            const selections = this.selections
            const length = selections.length
            if (event.cmdOrCtrlKey && length !== 0) {
              const files = Array.from(selections)
              if (!selections.includes(element.file)) {
                files.append(element.file)
                this.select(...files)
              } else if (length > 1) {
                files.remove(element.file)
                const pointerup = event => {
                  if (this.pressing === pointerup) {
                    this.pressing = null
                    if (element.contains(event.target)) {
                      this.select(...files)
                    }
                  }
                }
                this.pressing = pointerup
                window.on('pointerup', pointerup, {once: true})
              }
              return
            }
            if (event.shiftKey && length !== 0) {
              const elements = this.elements
              let start = elements.indexOf(element)
              let end = start
              for (const file of selections) {
                const {element} = file.getContext(this)
                const index = elements.indexOf(element)
                if (index !== -1) {
                  start = Math.min(start, index)
                  end = Math.max(end, index)
                }
              }
              if (start !== -1) {
                const slice = elements.slice(start, end + 1)
                this.select(...slice.map(element => element.file))
                return
              }
            }
            if (!element.hasClass('selected')) {
              this.select(element.file)
            } else if (event.button === 0) {
              if (length > 1) {
                const pointerup = event => {
                  if (this.pressing === pointerup) {
                    this.pressing = null
                    if (element.contains(event.target)) {
                      this.select(element.file)
                    }
                  }
                }
                this.pressing = pointerup
                window.on('pointerup', pointerup, {once: true})
              } else if (Menu.state === 'closed' &&
                document.activeElement === this &&
                event.clientX > element.fileIcon.rect().right) {
                this.timer.target = event.target
              }
            }
          }
        }
        break
      }
      // case 2: {
      //   const element = event.target.seek('file-nav-item')
      //   if (element.tagName === 'DIR-ITEM' &&
      //     !element.hasClass('selected')) {
      //     this.select(element.file)
      //   }
      //   break
      // }
    }
  }

  // 指针弹起事件
  pointerup(event) {
    switch (event.button) {
      case 0:
        if (document.activeElement === this &&
          this.timer.target === event.target) {
          this.timer.running = true
          this.timer.elapsed = 0
          this.timer.add()
        }
        break
    }
  }

  // 鼠标双击事件
  doubleclick(event) {
    let element = event.target
    if (element.tagName === 'FILE-NAV-ICON') {
      element = element.parentNode
    }
    if (element.tagName === 'FILE-NAV-ITEM') {
      this.cancelRenaming()
      const folder = element.file
      if (folder.subfolders.length !== 0) {
        const context = folder.getContext(this)
        context.expanded = !context.expanded
        this.update()
      }
    }
  }

  // 选择事件
  listSelect(event) {
    const {browser} = this.links
    browser.restoreDisplay()
    browser.update()
  }

  // 目录改变事件
  dirchange(event) {
    const folders = []
    const {inoMap} = Directory
    for (const folder of this.getSelections()) {
      const {ino} = folder.stats
      const {path} = inoMap[ino] || folder
      folders.append(Directory.getFolder(path))
    }
    const {browser} = this.links
    switch (browser.display) {
      case 'normal':
        this.unselect()
        this.load(...folders)
        break
      case 'search':
        this.update()
        break
    }
  }

  // 静态 - 创建文本输入框
  static textBox = function IIFE() {
    const textBox = new TextBox()
    textBox.setMaxLength(64)
    textBox.addClass('file-nav-text-box')
    textBox.input.addClass('file-nav-text-box-input')

    // 键盘按下事件
    textBox.on('keydown', function (event) {
      event.stopPropagation()
      switch (event.code) {
        case 'Enter':
        case 'NumpadEnter':
        case 'Escape': {
          const item = this.parentNode
          const nav = item.parentNode
          this.input.blur()
          nav.focus()
          break
        }
      }
    })

    // 输入前事件
    textBox.on('beforeinput', function (event) {
      if (event.inputType === 'insertText' &&
        typeof event.data === 'string') {
        const regexp = /[\\/:*?"<>|"]/
        if (regexp.test(event.data)) {
          event.preventDefault()
          event.stopPropagation()
        }
      }
    })

    // 输入事件
    textBox.on('input', function (event) {
      this.fitContent()
    })

    // 选择事件
    textBox.on('select', function (event) {
      event.stopPropagation()
    })

    // 失去焦点事件
    textBox.on('blur', function (event) {
      const item = this.parentNode
      const file = item.file
      const name = this.read().trim()
      this.remove()
      if (name && name !== file.name) {
        const dir = Path.dirname(file.path)
        const path = File.route(`${dir}/${name}`)
        if (!FS.existsSync(path)) {
          return FSP.rename(
            File.route(file.path),
            path,
          ).then(() => {
            return Directory.update()
          }).then(changed => {
            if (!changed) {
              throw new Error()
            }
          }).catch(error => {
            item.textNode.nodeValue = file.name
          })
        }
      }
      item.textNode.nodeValue = file.name
    })

    return textBox
  }()
}

customElements.define('file-nav-pane', FileNavPane)

interface JSXFileNavPane { [attributes: string]: any }

// ******************************** 文件导航面板导出 ********************************

export {
  FileNavPane,
  JSXFileNavPane
}
