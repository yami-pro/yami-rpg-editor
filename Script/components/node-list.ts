"use strict"

import {
  CommonList,
  Menu,
  TextBox,
  Timer,
  IFunction,
  IArray,
  IMath,
  IHTMLElement,
  IMouseKeyboardEvent
} from "../yami"

// ******************************** 树状列表 ********************************

class TreeList extends IHTMLElement {
  display: string
  keyword: string
  searchResults: IArray<IHTMLElement>
  creators: IArray<IHTMLElement>
  updaters: IArray<IHTMLElement>
  elements: IArray<IHTMLElement>
  root: any
  timer: Timer
  selections: IArray<IHTMLElement>
  dragging: IMouseKeyboardEvent
  padded: boolean
  removable: boolean
  renamable: boolean
  lockDirectory: boolean
  multipleSelect: boolean
  selectEventEnabled: boolean
  unselectEventEnabled: boolean
  recordEventEnabled: boolean
  popupEventEnabled: boolean
  openEventEnabled: boolean
  updateEventEnabled: boolean

  constructor() {
    super()

    // 创建重命名计时器
    const timer = new Timer({
      duration: 500,
      callback: timer => {
        const item = this.read()
        if (item instanceof Object) {
          const target = timer.target
          const element = item.element
          if (element.contains(target)) {
            this.rename(item)
          }
        }
        timer.target = null
        timer.running = false
      },
    })

    // 创建根节点
    const root = Object.defineProperty(
      {}, 'children', {get: () => this.data},
    )

    // 设置属性
    this.tabIndex = 0
    this.display = 'normal'
    this.keyword = null
    this.searchResults = []
    this.creators = []
    this.updaters = []
    this.elements = []
    this.elements.versionId = 0
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.elements.head = null
    this.elements.foot = null
    this.root = root
    this.timer = timer
    this.selections = []
    this.dragging = null
    this.padded = this.hasAttribute('padded')
    this.removable = false
    this.renamable = false
    // 锁定目录的功能现在用不到
    this.lockDirectory = false
    // 未实现多选功能
    this.multipleSelect = false
    this.selectEventEnabled = false
    this.recordEventEnabled = false
    this.popupEventEnabled = false
    this.openEventEnabled = false
    this.updateEventEnabled = false
    this.listenDraggingScrollbarEvent()

    // 侦听事件
    this.on('scroll', this.resize)
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
    this.on('pointerup', this.pointerup)
    this.on('doubleclick', this.doubleclick)
    this.on('dragstart', this.dragstart)
    this.on('dragend', this.dragend)
    this.on('change', this.dataChange)
  }

  // 绑定数据
  bind(getter) {
    return Object.defineProperty(
      this, 'data', {get: getter},
    )
  }

  // 读取数据
  read() {
    const {selections} = this
    return selections.length === 1 ? selections[0] : null
  }

  // 初始化
  initialize() {
    const {data} = this
    if (!data.initialized) {
      TreeList.createParents(this.data, this.root)
      Object.defineProperty(data, 'initialized', {
        configurable: true,
        value: true,
      })
    }
  }

  // 更新列表
  update() {
    const {elements} = this
    elements.start = -1
    elements.count = 0

    // 初始化数据
    this.initialize()

    // 创建列表项目
    switch (this.display) {
      case 'normal':
        if (this.data) {
          this.createIndentedItems(this.data, this.root, 0)
        }
        break
      case 'search':
        if (this.searchResults.length !== 0) {
          this.createFlatItems(this.searchResults)
        }
    }

    // 清除多余的元素
    this.clearElements(elements.count)

    // 发送更新事件
    if (this.updateEventEnabled) {
      this.dispatchUpdateEvent()
    }

    // 重新调整
    this.resize()
  }

  // 刷新列表
  refresh() {
    this.deleteNodeElements(this.data)
    this.update()
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
      this.updateNodeElement(element)
    }
  }

  // 创建扁平排列的项目
  createFlatItems(data) {
    const elements = this.elements
    const length = data.length
    for (let i = 0; i < length; i++) {
      const item = data[i]
      elements[elements.count++] =
      this.createNodeElement(item, 0)
    }
  }

  // 创建缩进排列的项目
  createIndentedItems(data, parent, indent) {
    const elements = this.elements
    const length = data.length
    for (let i = 0; i < length; i++) {
      const item = data[i]
      elements[elements.count++] =
      this.createNodeElement(item, indent)
      if (item.parent === undefined) {
        throw new Error('No parent!')
      }
      item.parent = parent
      if (item.expanded &&
        item.children.length !== 0) {
        this.createIndentedItems(
          item.children,
          item,
          indent + 1,
        )
      }
    }
  }

  // 搜索节点: regexp or string
  searchNodes(keyword) {
    const {data} = this
    if (!data) return
    if (keyword instanceof RegExp || keyword.length !== 0) {
      if (this.display === 'normal') {
        this.display = 'search'
      }
      if (typeof keyword === 'string') {
        keyword = keyword.replace(/[(){}\\^$*+?.|[\]]/g, '\\$&')
        keyword = new RegExp(keyword, 'i')
      }
      this.searchNodesAlgorithm(
        data,
        this.keyword = keyword,
        this.searchResults = [],
      )
    } else {
      if (this.display === 'search') {
        this.display = 'normal'
        this.keyword = null
        this.searchResults = []
      }
    }
    this.update()
  }

  // 搜索节点算法
  searchNodesAlgorithm(data, keyword, list) {
    const length = data.length
    for (let i = 0; i < length; i++) {
      const item = data[i]
      if (keyword.test(item.name)) {
        list.push(item)
      }
      const children = item.children
      if (children instanceof Array) {
        this.searchNodesAlgorithm(children, keyword, list)
      }
    }
  }

  // 创建节点元素
  createNodeElement(item, indent) {
    let element = item.element
    if (element === undefined) {
      // 创建列表项
      element = document.createElement('node-item')
      element.item = item
      Object.defineProperty(
        item, 'element', {
          configurable: true,
          value: element,
        }
      )

      // 激活选中状态
      if (this.selections.includes(item)) {
        element.addClass('selected')
      }
    }
    element.indent = indent
    element.changed = true
    return element
  }

  // 更新节点元素
  updateNodeElement(element) {
    const {item} = element
    if (!element.textNode) {
      // 创建折叠标记
      let folderMark = null
      let markVisible = false
      let markIndent = 16
      if (item.children instanceof Array) {
        folderMark = document.createElement('folder-mark')
        markVisible = true
        markIndent = 0
        element.appendChild(folderMark)
      }

      // 创建节点图标
      const nodeIcon = this.createIcon(item)
      element.appendChild(nodeIcon)

      // 创建文本节点
      const textNode = this.createText(item)
      element.appendChild(textNode)

      // 设置元素属性
      element.draggable = true
      element.expanded = false
      element.markVisible = markVisible
      element.markIndent = markIndent
      element.textIndent = 0
      element.folderMark = folderMark
      element.nodeIcon = nodeIcon
      element.textNode = textNode

      // 调用组件创建器
      for (const creator of this.creators) {
        creator(item)
      }
    }

    if (item.expanded !== undefined) {
      // 开关折叠标记
      const markVisible = item.children.length !== 0
      if (element.markVisible !== markVisible) {
        element.markVisible = markVisible
        element.folderMark.style.visibility =
        markVisible ? 'inherit' : 'hidden'
      }

      // 设置折叠标记
      const expanded = markVisible && item.expanded
      if (item.class === 'folder') {
        if (element.expanded !== expanded) {
          element.expanded = expanded
          switch (expanded) {
            case true:
              element.folderMark.addClass('expanded')
              element.nodeIcon.addClass('expanded')
              break
            case false:
              element.folderMark.removeClass('expanded')
              element.nodeIcon.removeClass('expanded')
              break
          }
        }
      } else {
        if (element.expanded !== expanded) {
          element.expanded = expanded
          switch (expanded) {
            case true:
              element.folderMark.addClass('expanded')
              break
            case false:
              element.folderMark.removeClass('expanded')
              break
          }
        }
      }
    }

    // 设置文本缩进
    const textIndent = element.markIndent + element.indent * 12
    if (element.textIndent !== textIndent) {
      element.textIndent = textIndent
      element.style.textIndent = `${textIndent}px`
    }

    // 调用组件更新器
    for (const updater of this.updaters) {
      updater(item)
    }
  }

  // 删除绑定的节点元素
  deleteNodeElements(data) {
    const length = data.length
    for (let i = 0; i < length; i++) {
      const item = data[i]
      if (item.element !== undefined) {
        delete item.element
      }
      const {children} = item
      if (children?.length > 0) {
        this.deleteNodeElements(children)
      }
    }
  }

  // 创建图标
  createIcon(item) {
    const icon = document.createElement('node-icon')
    switch (item.class) {
      case 'folder':
        icon.addClass('icon-folder')
        break
      default:
        icon.addClass('icon-file')
        break
    }
    return icon
  }

  // 创建文本
  createText(item) {
    return document.createTextNode(item.name)
  }

  // 更新项目名称
  updateItemName(item) {
    if (item?.element?.textNode) {
      const element = item.element
      const text = element.textNode
      const last = text.nodeValue
      text.nodeValue = item.name
      if (this.display === 'search') {
        const keyword = this.keyword
        if (keyword.test(last) ||
          keyword.test(item.name)) {
          this.searchNodes(this.keyword)
        }
      }
    }
  }

  // 获取属性匹配的项目
  getItemByProperties(properties) {
    const entries = Object.entries(properties)

    // 递归查找
    const find = items => {
      const length = items.length
      for (let i = 0; i < length; i++) {
        const item = items[i]
        let flag = true
        for (const [key, value] of entries) {
          if (item[key] !== value) {
            flag = false
            break
          }
        }
        if (flag) {
          return item
        }
        if (item.children) {
          const result = find(item.children)
          if (result !== undefined) {
            return result
          }
        }
      }
      return undefined
    }
    return find(this.data)
  }

  // 判断节点包含关系
  contain(node, target) {
    while (target instanceof Object) {
      if (target === node) {
        return true
      }
      target = target.parent
    }
    return false
  }

  // 添加节点
  addNodeTo(sItem, dItem) {
    if (!sItem) {
      return
    }

    let dList
    let dIndex

    // 设置默认位置
    const {data} = this
    if (!dItem) {
      dItem = data
    }
    // 添加到根目录
    if (dItem === data) {
      dList = data
      dIndex = dList.length
    // 添加到节点
    } else if (dItem.children) {
      dList = dItem.children
      dIndex = dList.length
    // 插入到节点前
    } else {
      dList = dItem.parent.children
      if (dList instanceof Array) {
        dIndex = dList.indexOf(dItem)
      }
    }
    if (dList) {
      dList.splice(dIndex, 0, sItem)
      this.unselect()

      // 创建父对象引用属性
      if (sItem.parent === undefined) {
        TreeList.createParents([sItem], null)
      }

      // 展开所在目录
      let item = dItem
      while (item.parent !== undefined) {
        if (item.expanded === false) {
          item.expanded = true
        }
        item = item.parent
      }

      // 发送记录事件
      if (this.recordEventEnabled) {
        const record = new Event('record')
        const response = {
          type: 'create',
          sItem: sItem,
          dItem: dItem,
        }
        record.value = response
        this.dispatchEvent(record)
      }

      // 更新目录列表
      !sItem.parent &&
      this.onCreate?.(sItem)
      this.update()
      this.select(sItem)
      this.scrollToSelection()
      this.dispatchChangeEvent()
    }
  }

  // 删除节点
  deleteNode(item) {
    const items = item.parent.children
    if (items instanceof Array) {
      const index = items.indexOf(item)
      items.splice(index, 1)

      // 发送记录事件
      if (this.recordEventEnabled) {
        const record = new Event('record')
        const response = {
          type: 'delete',
          items: items,
          index: index,
          item: item,
        }
        record.value = response
        this.dispatchEvent(record)
      }

      // 更新目录列表
      this.unselectIn(item)
      this.onDelete?.(item)
      this.update()
      this.dispatchChangeEvent()
    }
  }

  // 迁移项目
  removeItemTo(sItem, dItem) {
    if (sItem === dItem || this.lockDirectory && dItem === this.root) {
      return
    }
    const sParent = sItem.parent
    if (sParent && dItem) {
      const sList = sParent.children
      const dList = dItem.children
      const sIndex = sList.indexOf(sItem)
      sList.splice(sIndex, 1)
      const dIndex = dList.length
      dList.splice(dIndex, 0, sItem)
      if (sList === dList &&
        sIndex === dIndex) {
        return
      }
      if (dItem.expanded === false) {
        dItem.expanded = true
      }

      // 发送记录事件
      if (this.recordEventEnabled) {
        const record = new Event('record')
        const response = {
          type: 'remove',
          item: sItem,
          source: {
            parent: sParent,
            index: sIndex,
          },
          destination: {
            parent: dItem,
            index: dIndex,
          },
        }
        record.value = response
        this.dispatchEvent(record)
      }

      // 更新目录列表
      this.insertPaddingAndClear()
      this.update()
      this.onRemove?.(sItem)
      this.scrollToSelection()
      this.dispatchChangeEvent()
    }
  }

  // 迁移项目插入到目标前
  removeItemToInsert(sItem, dItem) {
    if (sItem === dItem || this.lockDirectory && dItem.parent === this.root) {
      return
    }
    const sParent = sItem.parent
    const dParent = dItem.parent
    if (sParent && dParent) {
      const sList = sParent.children
      const dList = dParent.children
      const sIndex = sList.indexOf(sItem)
      sList.splice(sIndex, 1)
      const dIndex = dList.indexOf(dItem)
      dList.splice(dIndex, 0, sItem)
      if (sList === dList &&
        sIndex === dIndex) {
        return
      }

      // 发送记录事件
      if (this.recordEventEnabled) {
        const record = new Event('record')
        const response = {
          type: 'remove',
          item: sItem,
          source: {
            parent: sParent,
            index: sIndex,
          },
          destination: {
            parent: dParent,
            index: dIndex,
          },
        }
        record.value = response
        this.dispatchEvent(record)
      }

      // 更新目录列表
      this.insertPaddingAndClear()
      this.update()
      this.onRemove?.(sItem)
      this.scrollToSelection()
      this.dispatchChangeEvent()
    }
  }

  // 恢复数据 - 遵循:
  // 取消选择已删除数据 > 更新列表 > 选择新插入数据
  // 的顺序来触发事件
  restore(operation, response) {
    // 处于搜索模式则清空搜索结果
    // 避免重复更新和选项位置错乱
    if (this.display === 'search') {
      this.searchResults = IArray.empty()
    }
    switch (response.type) {
      case 'rename': {
        const {item, oldValue, newValue} = response
        if (operation === 'undo') {
          item.name = oldValue
        } else {
          item.name = newValue
        }
        this.updateItemName(item)
        this.expandToItem(item)
        if (!this.textContent) {
          this.update()
        }
        this.select(item)
        this.scrollToSelection()
        this.dispatchChangeEvent()
        break
      }
      case 'create': {
        const {sItem, dItem} = response
        if (operation === 'undo') {
          const enabled = this.recordEventEnabled
          this.recordEventEnabled = false
          this.deleteNode(sItem)
          this.recordEventEnabled = enabled
        } else {
          const enabled = this.recordEventEnabled
          this.recordEventEnabled = false
          this.addNodeTo(sItem, dItem)
          this.recordEventEnabled = enabled
          this.onResume?.(sItem)
        }
        break
      }
      case 'delete': {
        const {items, index, item} = response
        if (operation === 'undo') {
          if (index <= items.length) {
            items.splice(index, 0, item)
            this.unselect()
            this.expandToItem(item, false)
            this.onResume?.(item)
          }
        } else {
          if (index < items.length) {
            items.splice(index, 1)
            this.unselectIn(item)
            this.onDelete?.(item)
          }
        }

        // 更新目录列表
        this.update()
        operation === 'undo' &&
        this.select(item)
        this.scrollToSelection()
        this.dispatchChangeEvent()
        break
      }
      case 'remove': {
        const {item, source, destination} = response
        const {parent: sParent, index: sIndex} = source
        const {parent: dParent, index: dIndex} = destination
        const sList = sParent.children
        const dList = dParent.children
        if (operation === 'undo') {
          if (item.parent !== undefined) {
            item.parent = sParent
          }
          if (sIndex <= sList.length &&
            dIndex < dList.length) {
            dList.splice(dIndex, 1)
            sList.splice(sIndex, 0, item)
            this.expandToItem(item, false)
          }
        } else {
          if (item.parent !== undefined) {
            item.parent = dParent
          }
          if (dIndex <= dList.length &&
            sIndex < sList.length) {
            sList.splice(sIndex, 1)
            dList.splice(dIndex, 0, item)
            this.expandToItem(item, false)
          }
        }

        // 更新目录列表
        this.insertPaddingAndClear()
        this.update()
        this.select(item)
        this.onRemove?.(item)
        this.scrollToSelection()
        this.dispatchChangeEvent()
        break
      }
    }
  }

  // 打开项目
  open(item) {
    if (item && this.openEventEnabled) {
      const open = new Event('open')
      open.value = item
      this.dispatchEvent(open)
    }
  }

  // 选择项目
  select(item) {
    if (item instanceof Object &&
      this.read() !== item) {
      this.unselect()
      this.selections.push(item)
      if (item.element !== undefined) {
        item.element.addClass('selected')
      }
      if (this.selectEventEnabled) {
        const select = new Event('select')
        select.value = this.read()
        this.dispatchEvent(select)
      }
    }
  }

  // 选择项目 - 不触发事件
  selectWithNoEvent(item) {
    const enabled = this.selectEventEnabled
    this.selectEventEnabled = false
    this.select(item)
    this.selectEventEnabled = enabled
  }

  // 取消选择
  unselect(item) {
    let selections = IArray.empty()
    if (item === undefined) {
      selections = this.selections
    } if (this.selections.includes(item)) {
      selections = [item]
    }
    if (selections.length !== 0) {
      // 提高blur事件的触发优先级
      TreeList.textBox.input.blur()
      for (const item of selections) {
        const {element} = item
        if (element !== undefined) {
          element.removeClass('selected')
        }
      }
      if (this.unselectEventEnabled) {
        const select = new Event('unselect')
        select.value = selections
        this.dispatchEvent(select)
      }
      this.selections = []
    }
  }

  // 取消范围内的选择 - 已修改未测试
  unselectIn(item) {
    const targets = []
    for (let target of this.selections) {
      let node = target
      while (node) {
        if (node === item) {
          targets.push(target)
          break
        }
        node = node.parent
      }
    }
    for (const target of targets) {
      this.unselect(target)
    }
  }

  // 选择相对位置的项目
  selectRelative(direction) {
    const elements = this.elements
    const count = elements.count
    if (count > 0) {
      let index = -1
      const last = count - 1
      const selection = this.read()
      if (selection) {
        index = elements.indexOf(selection.element)
      }
      switch (direction) {
        case 'up':
          if (index !== -1) {
            index = IMath.max(index - 1, 0)
          } else {
            index = last
          }
          break
        case 'down':
          if (index !== -1) {
            index = IMath.min(index + 1, last)
          } else {
            index = 0
          }
          break
      }
      this.select(elements[index]?.item)
      this.scrollToSelection()
    }
  }

  // 展开选中项
  expandSelection() {
    const item = this.read()
    if (item !== null &&
      item.expanded !== undefined &&
      item.element !== undefined) {
      item.expanded = !item.expanded
      this.update()
      this.dispatchChangeEvent()
    }
  }

  // 展开到选中项
  expandToSelection(update = true) {
    const item = this.read()
    if (item !== null) {
      this.expandToItem(item, update)
    }
  }

  // 展开到指定项目
  expandToItem(item, update = true) {
    item = item.parent
    if (!item) return
    let changed = false
    while (item.expanded !== undefined) {
      if (!item.expanded) {
        item.expanded = true
        changed = true
      }
      item = item.parent
    }
    if (changed && update) {
      this.update()
      this.dispatchChangeEvent()
    }
  }

  // 滚动到选中项
  scrollToSelection(mode = 'active') {
    const selection = this.read()
    if (selection && this.hasScrollBar()) {
      const elements = this.elements
      const count = elements.count
      for (let i = 0; i < count; i++) {
        const {item} = elements[i]
        if (item === selection) {
          let scrollTop
          switch (mode) {
            case 'active':
              scrollTop = IMath.clamp(
                this.scrollTop,
                i * 20 + 20 - this.innerHeight,
                i * 20,
              )
              break
            case 'middle':
              scrollTop = IMath.round((
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

  // 列表扩展方法 - 滚动到头部
  scrollToHome() {
    const element = this.elements[0]
    if (element instanceof HTMLElement) {
      this.select(element.item)
    }
    this.scroll(0, 0)
  }

  // 列表扩展方法 - 滚动到尾部
  scrollToEnd() {
    const elements = this.elements
    const index = elements.count - 1
    const element = elements[index]
    if (element instanceof HTMLElement) {
      this.select(element.item)
    }
    this.scroll(0, this.scrollHeight)
  }

  // 列表扩展方法 - 向上翻页
  pageUp(select) {
    const scrollLines = IMath.floor(this.clientHeight / 20) - 1
    if (select) {
      const bottom = this.scrollTop + this.clientHeight
      const bottomIndex = IMath.floor(bottom / 20) - 1
      let index = this.getElementIndexOfSelection(Infinity)
      index = IMath.min(index, bottomIndex) - scrollLines
      index = IMath.max(index, 0)
      this.select(this.elements[index]?.item)
    }
    this.scrollBy(0, -scrollLines * 20)
  }

  // 列表扩展方法 - 向下翻页
  pageDown(select) {
    const scrollLines = IMath.floor(this.clientHeight / 20) - 1
    if (select) {
      const count = this.elements.count
      const topIndex = IMath.floor(this.scrollTop / 20)
      let index = this.getElementIndexOfSelection(0)
      index = IMath.max(index, topIndex) + scrollLines
      index = IMath.min(index, count - 1)
      this.select(this.elements[index]?.item)
    }
    this.scrollBy(0, +scrollLines * 20)
  }

  // 列表扩展方法 - 获取选中项的元素索引
  getElementIndexOfSelection(defIndex) {
    const item = this.read()
    return item ? this.elements.indexOf(item.element) : defIndex
  }

  // 重命名
  rename(item) {
    if (this.renamable) {
      const {element} = item
      const {textBox} = TreeList
      if (document.activeElement === this &&
        !textBox.parentNode &&
        element.parentNode) {
        const nodes = []
        const {folderMark, nodeIcon} = element
        for (const node of element.childNodes) {
          if (node instanceof HTMLElement &&
            node !== folderMark &&
            node !== nodeIcon &&
            node.addClass('hidden')) {
            nodes.push(node)
          }
        }
        textBox.lastText = element.textNode.nodeValue
        element.textNode.nodeValue = ''
        element.appendChild(textBox)
        textBox.hiddenNodes = nodes
        textBox.write(item.name)
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

  // 插入填充元素并且清除其他元素
  insertPaddingAndClear() {
    const padding = TreeList.padding
    let count = this.elements.count
    if (this.padded) count++
    if (padding.count !== count) {
      padding.count = count
      padding.style.height = `${count * 20}px`
    }
    // 临时插入填充元素用来保存垂直滚动位置
    // 兼容列表不存在元素的情况
    const head = this.childNodes[0]
    this.insertBefore(padding, head)
    // 清除其他元素
    const {childNodes} = this
    const {length} = childNodes
    for (let i = length - 1; i > 0; i--) {
      childNodes[i].remove()
    }
  }

  // 清除元素
  clearElements(start) {
    return CommonList.clearElements(this, start)
  }

  // 清除列表
  clear() {
    if (this.display === 'search') {
      this.display = 'normal'
      this.keyword = null
      this.searchResults = []
    }
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
      case 'unselect':
        this.unselectEventEnabled = true
        break
      case 'record':
        this.recordEventEnabled = true
        break
      case 'popup':
        this.popupEventEnabled = true
        break
      case 'open':
        this.openEventEnabled = true
        break
      case 'update':
        this.updateEventEnabled = true
        break
    }
  }

  // 键盘按下事件
  keydown(event) {
    if (!this.data) {
      return
    }
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
        case 'Enter':
        case 'NumpadEnter': {
          const item = this.read()
          if (item) {
            // 阻止默认事件是因为：
            // 插入全局变量标签时默认接着输入换行符
            event.preventDefault()
            event.stopPropagation()
            this.open(item)
          }
          break
        }
        case 'Space':
          event.preventDefault()
          return
        case 'ArrowRight':
          event.preventDefault()
          this.expandSelection()
          break
        case 'ArrowUp':
          event.preventDefault()
          this.selectRelative('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          this.selectRelative('down')
          break
        case 'F2': {
          const item = this.read()
          if (item) {
            this.cancelRenaming()
            this.rename(item)
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
    // 拖拽列表项进行滚动时释放拖拽状态
    // 可能在列表项动态刷新时不触发dragend事件
    this.dragend()
    this.cancelRenaming()
    switch (event.button) {
      case 0: {
        const element = event.target
        if (element.tagName === 'FOLDER-MARK') {
          // 阻止拖拽开始事件
          event.preventDefault()
          const {item} = element.parentNode
          item.expanded = !item.expanded
          this.update()
          this.dispatchChangeEvent()
        } else {
          if (element.tagName === 'NODE-ITEM') {
            if (!element.hasClass('selected')) {
              this.select(element.item)
            } else if (
              this.renamable &&
              Menu.state === 'closed' &&
              document.activeElement === this &&
              event.clientX >
              (element.nodeIcon?.rect().right ?? 0)) {
              this.timer.target = event.target
            }
          }
        }
        break
      }
      case 2: {
        const element = event.target.seek('node-item')
        if (element.tagName === 'NODE-ITEM' &&
          !element.hasClass('selected')) {
          this.select(element.item)
        }
        break
      }
    }
  }

  // 指针弹起事件
  pointerup(event) {
    if (this.dragging || !this.data) {
      return
    }
    switch (event.button) {
      case 0:
        if (document.activeElement === this &&
          this.timer.target === event.target) {
          this.timer.running = true
          this.timer.elapsed = 0
          this.timer.add()
        }
        break
      case 2:
        if (this.popupEventEnabled &&
          document.activeElement === this) {
          const element = event.target.seek('node-item')
          if (element.tagName === 'NODE-ITEM' &&
            element.hasClass('selected')) {
            const popup = new Event('popup')
            popup.value = element.item
            popup.clientX = event.clientX
            popup.clientY = event.clientY
            this.dispatchEvent(popup)
          } else {
            const popup = new Event('popup')
            popup.value = null
            popup.clientX = event.clientX
            popup.clientY = event.clientY
            this.dispatchEvent(popup)
          }
        }
        break
    }
  }

  // 鼠标双击事件
  doubleclick(event) {
    const element = event.target
    if (element.tagName === 'NODE-ITEM') {
      this.cancelRenaming()
      const item = element.item
      if (item.class === 'folder') {
        item.expanded = !item.expanded
        this.update()
        this.dispatchChangeEvent()
      } else {
        this.open(item)
      }
    }
  }

  // 拖拽开始事件
  dragstart(event) {
    if (this.removable &&
      !this.dragging &&
      this.display === 'normal' &&
      this.read() !== null &&
      !TreeList.textBox.parentNode && (
        this.lockDirectory === false ||
        this.read().class !== 'folder'
      )) {
      this.dragging = event
      Object.defineProperty(event, 'offsetY', {writable: true})
      event.preventDefault = IFunction.empty
      event.dataTransfer.hideDragImage()
      event.hint = document.createElement('drag-and-drop-hint')
      event.hint.addClass('for-list')
      this.parentNode.insertBefore(event.hint.hide(), this)
      this.addClass('dragging')
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
      this.dragging.hint.target?.removeClass('hint')
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
      this.dragging.offsetY = -1
      this.dragging.hint.hide()
    }
  }

  // 拖拽悬停事件
  dragover(event) {
    const {dragging} = this
    if (dragging) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      if (dragging.offsetY === event.offsetY) {
        return
      }
      dragging.offsetY = event.offsetY
      const element = event.target.seek('node-item')
      // hint在文件夹上拖拽滚动时可能溢出显示
      const hint = dragging.hint.show()
      if (element.tagName === 'NODE-ITEM') {
        const sItem = dragging.target.item
        const dItem = element.item
        if (this.contain(sItem, dItem)) {
          return hint.hide()
        }
        const offsetY = event.offsetY
        const position = dItem.children
        ? offsetY < 4  ? 'before'
        : offsetY < 16 ? 'into'   : 'after'
        : offsetY < 10 ? 'before' : 'after'
        switch (position) {
          case 'into':
            if (hint.target !== element ||
              hint.position !== position) {
              const rect = hint.measure(element)
              hint.target?.removeClass('hint')
              hint.target = element
              hint.position = position
              hint.moveDown().set(rect)
              element.addClass('hint')
            }
            break
          case 'before':
            if (hint.target !== element ||
              hint.position !== position) {
              const rect = hint.measure(element)
              rect.top -= 1
              rect.height = 2
              hint.target?.removeClass('hint')
              hint.target = element
              hint.position = position
              hint.moveUp().set(rect)
            }
            break
          case 'after':
            if (hint.target !== element ||
              hint.position !== position) {
              const rect = hint.measure(element)
              rect.top += rect.height - 1
              rect.height = 2
              hint.target?.removeClass('hint')
              hint.target = element
              hint.position = position
              hint.moveUp().set(rect)
            }
            break
        }
      } else {
        const elements = this.elements
        const index = elements.count - 1
        const element = elements[index]
        if (element !== undefined &&
          (hint.target !== element ||
          hint.position !== 'append')) {
          const rect = hint.measure(element)
          rect.top += rect.height - 1
          rect.height = 2
          hint.target?.removeClass('hint')
          hint.target = element
          hint.position = 'append'
          hint.moveUp().set(rect)
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
      const sItem = dragging.target.item
      const dItem = hint.target.item
      if (hint.position !== 'append' &&
        this.contain(sItem, dItem)) {
        return
      }
      switch (hint.position) {
        case 'into':
          this.removeItemTo(sItem, dItem)
          break
        case 'before':
          this.removeItemToInsert(sItem, dItem)
          break
        case 'after':
        case 'append': {
          const elements = this.elements
          const index = elements.indexOf(hint.target)
          const next = elements[index + 1]?.item
          if (next) {
            this.removeItemToInsert(sItem, next)
          } else {
            this.removeItemTo(sItem, this.root)
          }
          break
        }
      }
    }

    // 创建项目后不能触发拖拽结束事件
    this.dragend()
  }

  // 数据改变事件
  dataChange(event) {
    if (this.display === 'search') {
      this.searchNodes(this.keyword)
    }
  }

  // 静态 - 列表填充元素
  static padding = function IIFE() {
    const padding = document.createElement('box')
    padding.style.display = 'block'
    padding.style.width = '1px'
    return padding
  }()

  // 静态 - 创建节点父对象
  static createParents = function IIFE() {
    const descriptor = {
      configurable: true,
      writable: true,
      value: null,
    }
    const createParents = (items, parent) => {
      const length = items.length
      for (let i = 0; i < length; i++) {
        const item = items[i]
        if (item.parent === undefined) {
          Object.defineProperty(
            item, 'parent', descriptor,
          )
        }
        item.parent = parent
        const {children} = item
        if (children?.length > 0) {
          createParents(children, item)
        }
      }
    }
    return function (items, parent) {
      createParents(items, parent)
    }
  }()

  // 静态 - 删除数据缓存
  static deleteCaches = function IIFE() {
    const uninstall = items => {
      for (const item of items) {
        delete item.element
        delete item.parent
        if (item.children !== undefined) {
          uninstall(item.children)
        }
      }
    }
    return function (data) {
      uninstall(data)
      delete data.initialized
    }
  }()

  // 静态 - 文本输入框
  static textBox = function IIFE() {
    const textBox = new TextBox()
    textBox.addClass('node-list-text-box')
    textBox.input.addClass('node-list-text-box-input')

    // 键盘按下事件
    textBox.on('keydown', function (event) {
      event.stopPropagation()
      switch (event.code) {
        case 'Enter':
        case 'NumpadEnter':
        case 'Escape': {
          const item = this.parentNode
          const list = item.parentNode
          this.input.blur()
          list.focus()
          break
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

    // 改变事件
    textBox.on('change', function (event) {
      event.stopPropagation()
    })

    // 失去焦点事件
    textBox.on('blur', function (event) {
      const element = this.parentNode
      const list = element.parentNode
      const item = element.item
      const name = this.read().trim()
      for (const node of this.hiddenNodes) {
        node.removeClass('hidden')
      }
      this.hiddenNodes = null
      this.remove()
      const last = item.name
      if (last !== name) {
        item.name = name
        list.updateItemName(item)
        if (list.recordEventEnabled) {
          const record = new Event('record')
          const response = {
            type: 'rename',
            item: item,
            oldValue: last,
            newValue: name,
          }
          record.value = response
          list.dispatchEvent(record)
        }
        list.dispatchChangeEvent()
      } else {
        element.textNode.nodeValue = this.lastText
      }
    })

    return textBox
  }()
}

customElements.define('node-list', TreeList)

interface JSXTreeList { [attributes: string]: any }

// ******************************** 树状列表导出 ********************************

export {
  TreeList,
  JSXTreeList
}
