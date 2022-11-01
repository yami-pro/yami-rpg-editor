'use strict'

// ******************************** 文件身体面板 ********************************

class FileBodyPane extends HTMLElement {
  viewIndex             //:number
  viewMode              //:string
  timer                 //:object
  elements              //:array
  selections            //:array
  content               //:element
  pressing              //:function
  openEventEnabled      //:boolean
  selectEventEnabled    //:boolean
  unselectEventEnabled  //:boolean
  popupEventEnabled     //:boolean
  textBox               //:element

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
    this.viewIndex = null
    this.viewMode = null
    this.timer = timer
    this.elements = []
    this.elements.versionId = 0
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.selections = []
    this.content = document.createElement('file-body-content')
    this.content.tabIndex = 0
    this.content.range = new Uint32Array(2)
    this.pressing = null
    this.openEventEnabled = false
    this.selectEventEnabled = false
    this.unselectEventEnabled = false
    this.popupEventEnabled = false
    this.textBox = FileBodyPane.textBox
    this.listenDraggingScrollbarEvent()
    this.appendChild(this.content)

    // 设置内容元素属性访问器
    const {elements} = this
    Object.defineProperty(this.content, 'countPerLine', {
      get: function () {
        return elements.count < this.scrollCount
        ? this.normalCountPerLine
        : this.scrollCountPerLine
      }
    })

    // 侦听事件
    this.on('scroll', this.resize)
    this.on('keydown', this.keydown)
    this.on('pointerdown', this.pointerdown)
    this.on('pointerup', this.pointerup)
    this.on('doubleclick', this.doubleclick)
    this.on('wheel', this.wheel)
    // this.on('scroll', this.scroll)
  }

  // 设置视图索引
  setViewIndex(viewIndex) {
    viewIndex = Math.clamp(viewIndex, 0, 4)
    if (this.viewIndex !== viewIndex) {
      const {head} = this.links
      this.viewIndex = viewIndex
      head.view.write(viewIndex)
      this.updateViewMode()
    }
  }

  // 更新视图模式
  updateViewMode() {
    let viewMode = null
    switch (this.viewIndex) {
      case 0: viewMode = 'list'   ; break
      case 1: viewMode = 'small'  ; break
      case 2: viewMode = 'medium' ; break
      case 3: viewMode = 'large'  ; break
      case 4: viewMode = 'huge'   ; break
    }
    if (this.viewMode !== viewMode) {
      viewMode === 'list'
      ? this.addClass('horizontal')
      : this.removeClass('horizontal')
      this.content.removeClass(this.viewMode)
      this.content.addClass(viewMode)
      this.resetContentStyle()
      this.viewMode = viewMode
      this.computeGridProperties()
      this.resize()
      this.updateContentOffset()
    }
  }

  // 获取文件
  getFiles() {
    const {browser, nav} = this.links
    const folders = nav.selections
    const filters = browser.filters
    if (!filters) {
      let length = 0
      for (const folder of folders) {
        length += folder.children.length
      }
      let i = 0
      const items = new Array(length)
      for (const folder of folders) {
        for (const item of folder.children) {
          items[i++] = item
        }
      }
      return items
    }
    const items = []
    for (const folder of folders) {
      for (const item of folder.children) {
        if (item instanceof FolderItem ||
          filters.includes(item.type)) {
          items.push(item)
        }
      }
    }
    return items
  }

  // 更新文件
  updateFiles() {
    const {elements} = this
    elements.start = -1
    elements.count = 0

    // 创建列表项目
    const {browser} = this.links
    switch (browser.display) {
      case 'normal':
        this.createFlatItems(this.getFiles())
        break
      case 'search':
        this.createFlatItems(browser.searchResults)
        break
    }

    // 清除多余的元素
    this.clearElements(elements.count)

    // 重新调整
    this.resize()
  }

  // 重新调整
  resize() {
    const ch = this.clientHeight
    const elements = this.elements
    if (ch === 0) {
      return
    }
    const [start, end] =
    this.computeStartAndEnd()
    this.updateContentSize()
    if (elements.start !== start ||
      elements.end !== end) {
      elements.start = start
      elements.end = end
      this.updateContentOffset()
      const versionId = elements.versionId++
      for (let i = start; i < end; i++) {
        const element = elements[i]
        element.versionId = versionId
        this.updateOnResize(element)
      }
      const content = this.content
      const nodes = content.childNodes
      const last = nodes.length - 1
      for (let i = last; i >= 0; i--) {
        const element = nodes[i]
        if (element.versionId !== versionId) {
          element.remove()
        }
      }
      // 保证尾部元素已经被添加
      const foot = elements[end - 1]
      if (foot && !foot.parentNode) {
        content.appendChild(foot)
      }
      for (let i = end - 2; i >= start; i--) {
        const element = elements[i]
        if (element.parentNode === null) {
          const next = elements[i + 1]
          content.insertBefore(element, next)
        }
      }
    }
  }

  // 计算网格属性
  computeGridProperties() {
    this.content.count = -1
    switch (this.viewMode) {
      case 'list':
        return this.computeListGridProperties()
      case 'small':
        return this.computeTileGridProperties(40, 72)
      case 'medium':
        return this.computeTileGridProperties(72, 104)
      case 'large':
        return this.computeTileGridProperties(136, 168)
      case 'huge':
        return this.computeTileGridProperties(264, 296)
    }
  }

  // 计算列表网格属性
  computeListGridProperties() {
    const {content} = this
    const WIDTH = 240
    const HEIGHT = 20
    const PADDING = 4
    const GAP = 2
    const SCROLLBAR_HEIGHT = 12
    const rect = this.rect()
    const cw = rect.width
    const ch = rect.height
    const ow = Math.max(cw - PADDING * 2 + GAP, 0)
    const oh = Math.max(ch - PADDING * 2, 0)
    const iw = WIDTH + GAP
    const ih = HEIGHT
    const visibleLines = Math.ceil((cw + GAP) / iw) + 1
    const normalCountPerLine = Math.max(Math.floor(oh / ih), 1)
    const scrollCountPerLine = Math.max(Math.floor((oh - SCROLLBAR_HEIGHT) / ih), 1)
    const scrollCount = Math.floor(ow / iw) * normalCountPerLine + 1
    content.itemSize = iw
    content.visibleLines = visibleLines
    content.normalCountPerLine = normalCountPerLine
    content.scrollCountPerLine = scrollCountPerLine
    content.scrollCount = scrollCount
  }

  // 计算平铺网格属性
  computeTileGridProperties(width, height) {
    const {content} = this
    const PADDING = 4
    const GAP = 2
    const SCROLLBAR_WIDTH = 12
    const rect = this.rect()
    const cw = rect.width
    const ch = rect.height
    const ow = Math.max(cw - PADDING * 2 + GAP, 0)
    const oh = Math.max(ch - PADDING * 2 + GAP, 0)
    const iw = width + GAP
    const ih = height + GAP
    const visibleLines = Math.ceil((ch + GAP) / ih) + 1
    const normalCountPerLine = Math.max(Math.floor(ow / iw), 1)
    const scrollCountPerLine = Math.max(Math.floor((ow - SCROLLBAR_WIDTH) / iw), 1)
    const scrollCount = Math.floor(oh / ih) * normalCountPerLine + 1
    content.itemSize = ih
    content.visibleLines = visibleLines
    content.normalCountPerLine = normalCountPerLine
    content.scrollCountPerLine = scrollCountPerLine
    content.scrollCount = scrollCount
  }

  // 计算开始和结束索引
  computeStartAndEnd() {
    const {range} = this.content
    const {count} = this.elements
    const scroll = this.viewMode === 'list'
    ? Math.max(this.scrollLeft - 4, 0)
    : Math.max(this.scrollTop - 4, 0)
    const {countPerLine, itemSize, visibleLines} = this.content
    const lines = Math.ceil(count / countPerLine)
    const sLine = Math.clamp(Math.floor(scroll / itemSize), 0, lines - 1)
    const start = countPerLine * sLine
    const length = countPerLine * visibleLines
    const end = Math.min(start + length, count)
    range[0] = start
    range[1] = end
    return range
  }

  // 更新内容元素的尺寸
  updateContentSize() {
    const {content} = this
    const {count} = this.elements
    if (this.clientHeight !== 0 &&
      content.count !== count) {
      content.count = count
      const PADDING = 4
      const GAP = 2
      const {style, countPerLine, itemSize} = content
      const lines = Math.ceil(count / countPerLine)
      const length = Math.max(lines * itemSize - GAP, 0) + PADDING * 2
      if (this.viewMode === 'list') {
        style.width = `${length}px`
      } else {
        style.height = `${length}px`
      }
    }
  }

  // 更新内容元素的偏移
  updateContentOffset() {
    const PADDING = 4
    const {start} = this.elements
    const {style, countPerLine, itemSize} = this.content
    const padding = start / countPerLine * itemSize + PADDING
    if (this.viewMode === 'list') {
      style.paddingLeft = `${padding}px`
    } else {
      style.paddingTop = `${padding}px`
    }
  }

  // 重置内容元素的样式
  resetContentStyle() {
    this.content.count = -1
    const {style} = this.content
    switch (this.viewMode) {
      case 'list':
        style.width = ''
        style.paddingLeft = ''
        break
      default:
        style.height = ''
        style.paddingTop = ''
        break
    }
  }

  // 在重新调整时更新
  updateOnResize(element) {
    if (element.changed) {
      element.changed = false
      const {file} = element
      if (file instanceof FileItem) {
        this.updateFileElement(element)
        return
      }
      if (file instanceof FolderItem) {
        this.updateFolderElement(element)
        return
      }
    }
  }

  // 创建扁平排列的项目
  createFlatItems(dir) {
    Directory.sortFiles(dir)
    const elements = this.elements
    const length = dir.length
    for (let i = 0; i < length; i++) {
      const file = dir[i]
      if (file instanceof FileItem) {
        elements[elements.count++] =
        this.createFileElement(file)
        continue
      }
      if (file instanceof FolderItem) {
        elements[elements.count++] =
        this.createFolderElement(file)
        continue
      }
    }
  }

  // 创建文件夹元素
  createFolderElement(file) {
    const context = file.getContext(this)
    let element = context.element
    if (element === undefined) {
      // 创建文件夹
      element = document.createElement('file-body-item')
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
    element.changed = true
    return element
  }

  // 更新文件夹元素
  updateFolderElement(element) {
    if (!element.nameBox) {
      // 创建文件夹图标
      const fileIcon = document.createElement('file-body-icon')
      fileIcon.addClass('icon-folder')
      element.appendChild(fileIcon)

      // 创建名字输入框
      const nameBox = document.createElement('file-body-name')
      nameBox.textContent = element.file.name
      element.appendChild(nameBox)

      // 设置元素属性
      element.draggable = true
      element.fileIcon = fileIcon
      element.nameBox = nameBox
    }
  }

  // 创建文件元素
  createFileElement(file) {
    const context = file.getContext(this)
    let element = context.element
    if (element === undefined) {
      // 创建文件
      element = document.createElement('file-body-item')
      element.file = file
      element.context = context
      context.element = element
    }
    element.changed = true
    return element
  }

  // 更新文件元素
  updateFileElement(element) {
    const {file} = element
    if (!element.nameBox) {
      // 创建文件图标
      const fileIcon = this.createIcon(file)
      element.appendChild(fileIcon)

      // 创建名字输入框
      const nameBox = document.createElement('file-body-name')
      nameBox.textContent = file.basename
      element.appendChild(nameBox)

      // 设置元素属性
      element.draggable = true
      element.fileIcon = fileIcon
      element.nameBox = nameBox

      // 激活选中状态
      const {selections} = this
      if (selections.length !== 0 &&
        selections.includes(file)) {
        element.addClass('selected')
      }
    }
    // 当图像改变时更新图标
    if (element.fileIcon.isImageChanged?.()) {
      this.updateIcon(file)
    }
  }

  // 创建图标
  createIcon(file) {
    const icon = document.createElement('file-body-icon')
    switch (file.type) {
      case 'actor': {
        const data = file.data
        if (!data?.portrait) {
          icon.addClass('icon-file-actor')
          break
        }
        const guidMap = Data.manifest.guidMap
        const meta = guidMap[data.portrait]
        if (!meta) {
          break
        }
        const version = meta.mtimeMs
        const path = `${File.getPath(data.portrait)}?ver=${version}`
        icon.style.backgroundImage = CSS.encodeURL(File.route(path))
        icon.isImageChanged = () => version !== meta.mtimeMs
        File.getImageResolution(path).then(({width, height}) => {
          if (width <= 128 && height <= 128) {
            icon.style.imageRendering = 'pixelated'
          }
        })
        break
      }
      case 'skill':
      case 'item':
      case 'equipment':
      case 'state': {
        const data = file.data
        if (!data?.icon) {
          icon.addClass('icon-file-cube')
          break
        }
        const meta = Data.manifest.guidMap[data.icon]
        const [cx, cy, cw, ch] = data.clip
        if (!meta || cw * ch === 0) break
        const version = meta.mtimeMs
        const path = `${File.getPath(data.icon)}?ver=${version}`
        icon.isImageChanged = () => version !== meta.mtimeMs
        this.setIconClip(icon, path, cx, cy, cw, ch)
        break
      }
      case 'trigger':
        icon.addClass('icon-file-trigger')
        break
      case 'event':
        icon.addClass('icon-file-event')
        icon.textContent = 'EV'
        if (!file.data.enabled) {
          icon.addClass('disabled')
        }
        break
      case 'scene':
        icon.addClass('icon-file-scene')
        break
      case 'tileset':
        icon.addClass('icon-file-tileset')
        break
      case 'ui':
        icon.addClass('icon-file-ui')
        break
      case 'animation':
        icon.addClass('icon-file-animation')
        break
      case 'particle':
        icon.addClass('icon-file-particle')
        break
      case 'image': {
        const version = file.stats.mtimeMs
        const path = `${file.path}?ver=${version}`
        icon.style.backgroundImage = CSS.encodeURL(File.route(path))
        File.getImageResolution(path).then(({width, height}) => {
          if (width <= 128 && height <= 128) {
            icon.style.imageRendering = 'pixelated'
          }
        })
        break
      }
      case 'audio':
        icon.addClass('icon-file-event')
        icon.addClass('icon-file-audio')
        icon.textContent = '\uf028'
        break
      case 'video':
        icon.addClass('icon-file-event')
        icon.addClass('icon-file-video')
        icon.textContent = '\uf008'
        break
      case 'font':
        icon.addClass('icon-file-font')
        break
      case 'script':
        icon.addClass('icon-file-event')
        icon.addClass('icon-file-script')
        switch (file.extname) {
          case '.js':
            icon.textContent = 'JS'
            break
          case '.ts':
            icon.textContent = 'TS'
            break
        }
        break
      default:
        icon.addClass('icon-file-other')
        icon.textContent = file.extname.slice(1)
        break
    }
    return icon
  }

  // 更新图标
  updateIcon(file) {
    const {element} = file.getContext(this)
    if (element?.fileIcon) {
      const icon = this.createIcon(file)
      element.replaceChild(icon, element.fileIcon)
      element.fileIcon = icon
    }
  }

  // 设置图标剪辑
  setIconClip(icon, path, cx, cy, cw, ch) {
    File.getImageResolution(path).then(({width, height}) => {
      // 当cw和ch为负数时为划分模式
      if (cw < 0) {
        cw = Math.floor(width / -cw)
        ch = Math.floor(height / -ch)
        if (cw * ch === 0) {
          return
        }
      }
      if (cw !== ch) {
        if (cw > ch) {
          const oy = (cw - ch) / 2
          const t = 100 * oy / cw
          const b = 100 - t
          cy -= oy
          icon.style.clipPath = `polygon(0 ${t}%, 100% ${t}%, 100% ${b}%, 0 ${b}%)`
        } else {
          const ox = (ch - cw) / 2
          const l = 100 * ox / ch
          const r = 100 - l
          cx -= ox
          icon.style.clipPath = `polygon(${l}% 0, ${r}% 0, ${r}% 100%, ${l}% 100%)`
        }
      }
      const size = Math.max(cw, ch)
      const sx = width / size
      const sy = height / size
      const px = sx !== 1 ? cx / size / (sx - 1) : 0
      const py = sy !== 1 ? cy / size / (sy - 1) : 0
      icon.style.backgroundImage = CSS.encodeURL(File.route(path))
      icon.style.backgroundPosition = `${px * 100}% ${py * 100}%`
      icon.style.backgroundSize = `${sx * 100}% ${sy * 100}%`
      if (size <= 128) {
        icon.style.imageRendering = 'pixelated'
      }
    })
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

  // 选择全部
  selectAll() {
    const {elements} = this
    const {count} = elements
    const files = new Array(count)
    for (let i = 0; i < count; i++) {
      files[i] = elements[i].file
    }
    this.select(...files)
  }

  // 取消选择
  unselect() {
    const files = this.selections
    if (files.length !== 0) {
      FileBodyPane.textBox.input.blur()
      for (const file of files) {
        const context = file.getContext(this)
        const element = context.element
        if (element !== undefined) {
          element.removeClass('selected')
        }
      }
      this.selections = []
      if (this.unselectEventEnabled) {
        const unselect = new Event('unselect')
        unselect.value = files
        this.dispatchEvent(unselect)
      }
    }
  }

  // 选择路径匹配的项目
  selectByPath(path) {
    for (let {file} of this.elements) {
      if (file.path === path) {
        return this.select(file)
      }
    }
    this.unselect()
  }

  // 选择默认项目
  selectDefault() {
    const {elements} = this
    const {count} = elements
    for (let i = 0; i < count; i++) {
      if (elements[i].hasClass('selected')) {
        return
      }
    }
    if (count !== 0) {
      this.select(elements[0].file)
    }
  }

  // 在网格列表中选择相对位置的项目
  selectRelativeInGridMode(direction) {
    const elements = this.elements
    const count = elements.count
    if (count > 0) {
      let index
      let start = Infinity
      let end = -Infinity
      const {selections} = this
      for (const file of selections) {
        const {element} = file.getContext(this)
        const index = elements.indexOf(element)
        if (index !== -1) {
          start = Math.min(start, index)
          end = Math.max(end, index)
        }
      }
      if (start === Infinity) {
        switch (direction) {
          case 'prev':
          case 'prev-line':
            index = count - 1
            break
          case 'next':
          case 'next-line':
            index = 0
            break
        }
      } else {
        const {countPerLine} = this.content
        switch (direction) {
          case 'prev':
            index = start - 1
            break
          case 'next':
            index = end + 1
            break
          case 'prev-line':
            index = start - countPerLine
            break
          case 'next-line':
            index = end + countPerLine
            if (index >= count) {
              const line = Math.floor(index / countPerLine)
              const head = line * countPerLine
              if (count > head) {
                index = count - 1
              }
            }
            break
        }
      }
      const file = elements[index]?.file
      if (file === undefined) return
      if (!(selections.length === 1 &&
        selections[0] === file)) {
        this.select(file)
      }
      this.scrollToSelectionInGridMode()
    }
  }

  // 在网格列表中滚动到选中项
  scrollToSelectionInGridMode(mode = 'active') {
    const {selections} = this
    if (selections.length === 1 && this.hasScrollBar()) {
      const selection = selections[0]
      const elements = this.elements
      const count = elements.count
      for (let i = 0; i < count; i++) {
        if (elements[i].file === selection) {
          const size = this.content.itemSize
          const apl = this.content.countPerLine
          const pos = Math.floor(i / apl) * size
          const PADDING = 4
          const GAP = 2
          let property
          let clientSize
          switch (this.viewMode) {
            case 'list':
              property = 'scrollLeft'
              clientSize = this.clientWidth
              break
            default:
              property = 'scrollTop'
              clientSize = this.clientHeight
              break
          }
          let scroll = this[property]
          switch (mode) {
            case 'active':
              scroll = Math.clamp(
                scroll,
                pos + size + PADDING * 2 - GAP - clientSize,
                pos,
              )
              break
            default:
              return
          }
          if (this[property] !== scroll) {
            this[property] = scroll
          }
          break
        }
      }
    }
  }

  // 获取目录名
  getDirName() {
    let dirname = ''
    const files = this.selections
    switch (files.length) {
      case 0: {
        const {nav} = this.links
        const folders = nav.selections
        if (folders.length === 1) {
          dirname = folders[0].path
        }
        break
      }
      case 1: {
        const file = files[0]
        dirname = file.path
        if (file instanceof FileItem) {
          dirname = Path.dirname(dirname)
        }
        break
      }
    }
    return dirname
  }

  // 创建文件夹
  createFolder() {
    const dirname = this.getDirName()
    if (dirname) {
      const {path, route} = File.getFileName(
        dirname, 'New Folder',
      )
      FSP.mkdir(
        route,
        {recursive: true},
      ).then(() => {
        return Directory.update()
      }).then(changed => {
        if (changed) {
          const folder = Directory.getFolder(path)
          if (folder.path === path) {
            this.links.nav.load(folder.parent)
            this.select(folder)
            this.rename(folder)
          }
        }
      })
    }
  }

  // 在资源管理器中显示
  showInExplorer() {
    let length = 0
    const elements = this.elements
    for (const file of this.selections) {
      const {element} = file.getContext(this)
      if (elements.includes(element)) {
        File.showInExplorer(
          File.route(file.path)
        )
        if (++length === 10) {
          break
        }
      }
    }
  }

  // 打开文件
  openFile(file) {
    if (file instanceof FolderItem) {
      const {nav} = this.links
      nav.load(file)
      nav.scrollToSelection('middle')
    }
    if (file instanceof FileItem &&
      this.openEventEnabled) {
      const open = new Event('open')
      open.value = file
      this.dispatchEvent(open)
    }
  }

  // 删除文件
  deleteFiles() {
    const files = []
    const {selections} = this
    if (!selections.includes(Directory.assets)) {
      const elements = this.elements
      for (const file of selections) {
        const {element} = file.getContext(this)
        if (elements.includes(element)) {
          files.push(file)
        }
      }
    }
    const {length} = files
    if (length === 0) {
      return
    }
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: length === 1
      ? get('deleteSingleFile').replace('<filename>', files[0].alias ?? files[0].name)
      : get('deleteMultipleFiles').replace('<number>', length),
    }, [{
      label: get('yes'),
      click: () => {
        Directory.deleteFiles(files).then(() => {
          return Directory.update()
        })
      },
    }, {
      label: get('no'),
    }])
  }

  // 重命名
  rename(file) {
    const {textBox} = FileBodyPane
    if (document.activeElement === this.content &&
      file !== Directory.assets &&
      !textBox.parentNode) {
      const context = file.getContext(this)
      const element = context.element
      if (element && element.parentNode) {
        element.nameBox.hide()
        element.appendChild(textBox)
        textBox.write(file.basename ?? file.name)
        textBox.getFocus('all')
        switch (this.viewMode) {
          case 'list':
            textBox.fitContent()
            break
          default:
            textBox.style.width = ''
            break
        }
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

  // 导入文件
  importFiles() {
    const {nav} = this.links
    const folders = nav.selections
    if (folders.length !== 1) {
      return
    }
    const folder = folders[0]
    const dialogs = Editor.config.dialogs
    const location = Path.normalize(dialogs.import)
    const images = ['png', 'jpg', 'jpeg', 'cur', 'webp']
    const audio = ['mp3', 'm4a', 'ogg', 'wav', 'flac']
    const videos = ['mp4', 'mkv', 'webm']
    const fonts = ['ttf', 'otf', 'woff', 'woff2']
    File.showOpenDialog({
      defaultPath: location,
      filters: [
        {name: 'Resources', extensions: [...images, ...audio, ...videos, ...fonts]},
        {name: 'Images', extensions: images},
        {name: 'Audio', extensions: audio},
        {name: 'Videos', extensions: videos},
        {name: 'Fonts', extensions: fonts},
      ],
      properties: ['multiSelections'],
    }).then(({filePaths}) => {
      if (filePaths.length !== 0) {
        const dir = folder.path
        const promises = []
        const length = filePaths.length
        for (let i = 0; i < length; i++) {
          const src = Path.slash(filePaths[i])
          const ext = Path.extname(src)
          const base = Path.basename(src, ext)
          const dst = File.getFileName(dir, base, ext).route
          promises.push(FSP.copyFile(src, dst))
        }
        Promise.all(promises).then(() => {
          return Directory.update()
        })/* .then(changed => {
          if (changed) {
            browser.dirchange()
          }
        }) */
        dialogs.import = Path.slash(
          Path.dirname(filePaths[0]),
        )
      }
    })
  }

  // 导出文件
  exportFile() {
    const files = this.selections
    const dialogs = Editor.config.dialogs

    if (files.length === 1 && files[0] instanceof FileItem) {
      // 导出单个文件
      const file = files[0]
      File.showSaveDialog({
        defaultPath: Path.resolve(dialogs.export, file.name),
      }).then(({filePath}) => {
        if (filePath) {
          dialogs.export = Path.slash(
            Path.dirname(filePath),
          )
          return FSP.copyFile(
            File.route(file.path),
            filePath,
          )
        }
      }).finally(() => {
        Directory.update()
      })
    } else {
      // 导出文件夹或多个文件
      File.showOpenDialog({
        defaultPath: Path.normalize(dialogs.export),
        properties: ['openDirectory'],
      }).then(({filePaths}) => {
        if (filePaths.length === 1) {
          const dirPath = filePaths[0]
          dialogs.export = Path.slash(dirPath)
          return Directory.readdir(files.map(
            file => File.route(file.path)
          )).then(dir => {
            return Directory.copyFiles(dirPath, dir)
          })
        }
      }).finally(() => {
        Directory.update()
      })
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
    this.content.textContent = ''
    this.clearElements(0)
    this.elements.count = 0
    this.elements.start = -1
    this.elements.end = -1
    this.resetContentStyle()
    return this
  }

  // 添加事件
  on(type, listener, options) {
    super.on(type, listener, options)
    switch (type) {
      case 'open':
        this.openEventEnabled = true
        break
      case 'select':
        this.selectEventEnabled = true
        break
      case 'unselect':
        this.unselectEventEnabled = true
        break
      case 'popup':
        this.popupEventEnabled = true
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
        case 'KeyA':
          this.selectAll()
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
          this.links.nav.focus()
          break
        case 'Enter':
        case 'NumpadEnter': {
          const files = this.selections
          if (files.length === 1) {
            const file = files[0]
            const {element} = file.getContext(this)
            if (this.elements.includes(element)) {
              this.openFile(file)
            }
          }
          break
        }
        case 'Delete':
          this.deleteFiles()
          break
        case 'Backspace': {
          const {browser} = this.links
          browser.backToParentFolder()
          break
        }
        case 'ArrowLeft':
          event.preventDefault()
          switch (this.viewMode) {
            case 'list':
              this.selectRelativeInGridMode('prev-line')
              break
            default:
              this.selectRelativeInGridMode('prev')
              break
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          switch (this.viewMode) {
            case 'list':
              this.selectRelativeInGridMode('next-line')
              break
            default:
              this.selectRelativeInGridMode('next')
              break
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          switch (this.viewMode) {
            case 'list':
              this.selectRelativeInGridMode('prev')
              break
            default:
              this.selectRelativeInGridMode('prev-line')
              break
          }
          break
        case 'ArrowDown':
          event.preventDefault()
          switch (this.viewMode) {
            case 'list':
              this.selectRelativeInGridMode('next')
              break
            default:
              this.selectRelativeInGridMode('next-line')
              break
          }
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
        if (element === this.content) {
          element = this
        }
        if (element === this) {
          if (this.contains(document.activeElement) &&
            this.isInContent(event)) {
            this.unselect()
          }
        } else {
          if (element.tagName === 'FILE-BODY-ICON' ||
            element.tagName === 'FILE-BODY-NAME') {
            element = element.parentNode
          }
          if (element.tagName === 'FILE-BODY-ITEM') {
            const selections = this.selections
            const length = selections.length
            if (event.cmdOrCtrlKey && length !== 0) {
              const elements = this.elements
              const files = Array.from(selections)
              for (let i = length - 1; i >= 0; i--) {
                const {element} = files[i].getContext(this)
                if (!elements.includes(element)) {
                  files.splice(i, 1)
                }
              }
              if (!selections.includes(element.file)) {
                files.append(element.file)
                this.select(...files)
              } else {
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
              for (let i = 0; i < length; i++) {
                const {element} = selections[i].getContext(this)
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
                document.activeElement === this.content && (
                event.target.tagName === 'FILE-BODY-NAME')) {
                this.timer.target = event.target
              }
            }
          }
        }
        if (event.target === this) {
          event.preventDefault()
          this.content.focus()
        }
        break
      }
      case 3: {
        const {browser} = this.links
        browser.backToParentFolder()
        break
      }
    }
  }

  // 指针弹起事件
  pointerup(event) {
    switch (event.button) {
      case 0:
        if (document.activeElement === this.content &&
          this.timer.target === event.target) {
          this.timer.running = true
          this.timer.elapsed = 0
          this.timer.add()
        }
        break
      case 2:
        if (document.activeElement === this.content &&
          this.popupEventEnabled) {
          const popup = new Event('popup')
          popup.raw = event
          popup.clientX = event.clientX
          popup.clientY = event.clientY
          this.dispatchEvent(popup)
        }
        break
    }
  }

  // 鼠标双击事件
  doubleclick(event) {
    let element = event.target
    if (element.tagName === 'FILE-BODY-ICON' ||
      element.tagName === 'FILE-BODY-NAME') {
      element = element.parentNode
    }
    if (element.tagName === 'FILE-BODY-ITEM') {
      // 阻止打开文件夹时目标元素消失导致列表失去焦点
      event.preventDefault()
      this.cancelRenaming()
      this.openFile(element.file)
    }
  }

  // 鼠标滚轮事件
  wheel(event) {
    const {deltaY} = event
    if (deltaY !== 0) {
      if (event.cmdOrCtrlKey) {
        event.preventDefault()
        const index = this.viewIndex
        const delta = Math.sign(-deltaY)
        return this.setViewIndex(index + delta)
      }
      if (this.viewMode === 'list' &&
        this.clientWidth < this.scrollWidth) {
        this.scrollLeft += deltaY < 0 ? -60 : 60
      }
    }
  }

  // 滚动事件
  // 有可能没必要
  // 切换视图模式的情况也要执行相同操作
  // scroll(event) {
  //   const {textBox} = this
  //   if (textBox.parentNode) {
  //     textBox.input.blur()
  //     this.focus()
  //   }
  // }

  // 静态 - 创建文本输入框
  static textBox = function IIFE() {
    const textBox = new TextBox()
    textBox.setMaxLength(64)
    textBox.addClass('file-body-text-box')
    textBox.input.addClass('file-body-text-box-input')

    // 键盘按下事件
    textBox.on('keydown', function (event) {
      event.stopPropagation()
      switch (event.code) {
        case 'Enter':
        case 'NumpadEnter':
        case 'Escape': {
          const item = this.parentNode
          const content = item.parentNode
          this.input.blur()
          content.focus()
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
      if (this.style.width !== '') {
        this.fitContent()
      }
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
      let filename = name
      this.remove()
      item.nameBox.show()
      if (!name) return
      if (file instanceof FileItem) {
        const guid = file.meta?.guid
        if (typeof guid === 'string') {
          filename += '.' + guid
        }
        filename += file.extname
      }
      if (filename !== file.name) {
        item.nameBox.textContent = name
        const dir = Path.dirname(file.path)
        const path = File.route(`${dir}/${filename}`)
        // 当目标文件不存在或就是自己时重命名
        FSP.stat(path, FolderItem.bigint).then(stats => {
          if (stats.ino === file.stats.ino) {
            throw new Error('same file')
          }
        }).catch(error => {
          return FSP.rename(
            File.route(file.path),
            path,
          ).then(() => {
            return Directory.update()
          })
        })
      }
    })

    return textBox
  }()
}

customElements.define('file-body-pane', FileBodyPane)
