'use strict'

// ******************************** 窗口对象 ********************************

const Window = {
  // properties
  ambient: $('#window-ambient'),
  frames: [],
  positionMode: 'center',
  absolutePos: {x: 0, y: 0},
  overlapRoot: null,
  activeElement: null,
  // methods
  initialize: null,
  open: null,
  close: null,
  closeAll: null,
  isWindowOpen: null,
  getTopWindow: null,
  setPositionMode: null,
  saveActiveElement: null,
  restoreActiveElement: null,
  refocus: null,
  confirm: null,
  // events
  keydown: null,
  cancel: null,
}

// 初始化
Window.initialize = function () {
  // 侦听取消按钮事件
  const buttons = document.getElementsByName('cancel')
  const length = buttons.length
  for (let i = 0; i < length; i++) {
    buttons[i].on('click', this.cancel)
  }
}

// 打开窗口
Window.open = function (id) {
  const frames = this.frames
  const element = document.getElementById(id)
  if (!element) {
    return
  }

  // 打开窗口
  const {activeElement} = document
  if (!frames.includes(element)) {
    if (frames.length > 0) {
      frames[frames.length - 1].blur()
    } else {
      Title.pointermove({target: null})
      Window.saveActiveElement()
      Layout.disableFocusableElements()
      document.body.style.pointerEvents = 'none'
      document.activeElement.blur()
      window.off('keydown', Menubar.keydown)
      window.off('keydown', Scene.keydown)
      window.off('keydown', UI.keydown)
      window.off('keydown', Animation.keydown)
      window.off('keydown', Particle.keydown)
      window.on('keydown', Window.keydown)
    }

    // 解决失去焦点后还能使用键盘滚动的问题
    // 延时获得焦点是为了解决鼠标按下瞬间焦点切换被阻止的问题
    Title.target.tabIndex = -1
    Title.target.focus()
    setTimeout(() => {
      const active = document.activeElement
      if (active === activeElement &&
        frames[frames.length - 1] === element) {
        Title.target.focus()
      }
    })
    element.open()
  }
}

// 关闭窗口
Window.close = function (id = null) {
  const frames = this.frames
  if (!frames.length) {
    return
  }

  // 获取窗口
  const element = frames[frames.length - 1]
  if (id && id !== element.id) {
    return
  }

  // 关闭窗口
  if (element.close()) {
    if (frames.length > 0) {
      frames[frames.length - 1].focus()
    } else {
      Title.pointerenter()
      Window.restoreActiveElement()
      Layout.enableFocusableElements()
      document.body.style.pointerEvents = 'inherit'
      window.on('keydown', Menubar.keydown)
      window.on('keydown', Scene.keydown)
      window.on('keydown', UI.keydown)
      window.on('keydown', Animation.keydown)
      window.on('keydown', Particle.keydown)
      window.off('keydown', Window.keydown)
    }
    // 关闭堆叠位置模式
    if (this.overlapRoot === element) {
      this.setPositionMode('center')
    }
  }
}

// 关闭所有窗口
Window.closeAll = function () {
  const frames = this.frames
  let i = frames.length
  while (--i >= 0) {
    const frame = frames[i]
    const enabled = frame.closeEventEnabled
    frame.closeEventEnabled = false
    this.close(frame.id)
    frame.closeEventEnabled = enabled
  }
}

// 判断窗口是否已打开
Window.isWindowOpen = function (id) {
  for (const frame of this.frames) {
    if (frame.id === id) return true
  }
  return false
}

// 获取顶部的窗口
Window.getTopWindow = function () {
  const {frames} = this
  if (frames.length !== 0) {
    return frames[frames.length - 1]
  }
  return undefined
}

// 设置位置模式
Window.setPositionMode = function (mode) {
  if (this.positionMode !== mode) {
    if (this.overlapRoot) {
      this.overlapRoot = null
    }
    switch (mode) {
      case 'center':
        break
      case 'absolute':
        break
      case 'overlap': {
        const {frames} = this
        const {length} = frames
        if (length === 0) return
        this.overlapRoot = frames[length - 1]
        break
      }
    }
    this.positionMode = mode
  }
}

// 保存激活元素
Window.saveActiveElement = function () {
  const {activeElement} = document
  if (activeElement !== document.body) {
    this.activeElement = activeElement
    this.activeElement.blur()
  }
}

// 恢复激活元素
Window.restoreActiveElement = function () {
  if (this.activeElement) {
    this.activeElement.focus()
    this.activeElement = null
  }
}

// 重新聚焦
Window.refocus = function () {
  const active = document.activeElement
  if (active !== document.body) {
    active.blur()
    active.focus()
  }
}

// 弹出确认框
Window.confirm = function IIFE() {
  const elWindow = $('#confirmation')
  const elMessage = $('#confirmation-message')
  const buttons = [
    $('#confirmation-button-0'),
    $('#confirmation-button-1'),
    $('#confirmation-button-2'),
  ]
  return function (options, items) {
    const message = options.message ?? ''
    const click = function (event) {
      Window.close('confirmation')
      const index = buttons.indexOf(this)
      const item = items[index]
      item.click?.()
    }
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const item = items[i]
      if (item) {
        button.textContent = item.label
        button.on('click', click)
        button.show()
      } else {
        button.hide()
      }
    }
    if (items.length > 0) {
      buttons[0].getFocus()
    }
    elMessage.textContent = message
    elWindow.on('closed', event => {
      for (const button of buttons) {
        button.off('click', click)
      }
      options.close?.()
    }, {once: true})

    // 计算窗口的大小
    const measure = measureText(message)
    const textWidth = measure.width
    const textHeight = measure.lines * 20
    const buttonWidth = items.length * 98 - 10
    const contentWidth = Math.max(textWidth, buttonWidth) + 20
    const contentHeight = textHeight + 50
    elWindow.style.width = `${contentWidth}px`
    elWindow.style.height = `${contentHeight + 24}px`
    Window.open('confirmation')
  }
}()

// 键盘按下事件
Window.keydown = function (event) {
  if (event.altKey) {
    switch (event.code) {
      case 'F4':
        event.preventDefault()
        Window.refocus()
        Window.close()
        break
    }
  } else {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter': {
        const active = document.activeElement
        if (active instanceof HTMLButtonElement &&
          !event.cmdOrCtrlKey) {
          return
        }
        const frames = Window.frames
        const frame = frames[frames.length - 1]
        const selector = `#${frame.id} > content-frame > button[name=confirm]`
        const button = document.querySelector(selector)
        if (button instanceof HTMLButtonElement) {
          event.preventDefault()
          if (active !== document.body) {
            active.blur()
          }
          button.click()
        }
        break
      }
      case 'KeyS': {
        if (!event.cmdOrCtrlKey) return
        const frames = Window.frames
        const frame = frames[frames.length - 1]
        const selector = `#${frame.id} > content-frame > button[name=apply]`
        const button = document.querySelector(selector)
        if (button instanceof HTMLButtonElement) {
          const active = document.activeElement
          if (active !== document.body) {
            // 调用blur来触发change事件
            active.blur()
            active.focus()
          }
          button.click()
        }
        break
      }
      case 'Escape':
        Window.refocus()
        Window.close()
        break
    }
  }
}

// 取消按钮 - 鼠标点击事件
Window.cancel = function (event) {
  let element = event.target.parentNode
  while (element) {
    if (element.tagName === 'WINDOW-FRAME') {
      return Window.close(element.id)
    } else {
      element = element.parentNode
    }
  }
}

// 添加窗口环境元素方法 - 更新
Window.ambient.update = function () {
  const frames = Window.frames
  let i = frames.length
  while (--i >= 0) {
    const frame = frames[i]
    if (frame.enableAmbient) {
      this.addClass('open')
      this.style.zIndex = i + 1
      return
    }
  }
  this.removeClass('open')
}

// ******************************** 本地化对象 ********************************

const Local = {
  // properties
  active: null,
  dirname: '',
  language: null,
  languages: null,
  properties: {},
  saveItems: {},
  saveTagExp: /^#(\S+)$/,
  titleTagExp: /\$([\S ]+)(?=\n|$)/g,
  // methods
  initialize: null,
  update: null,
  readLanguageList: null,
  setLanguage: null,
  setProperties: null,
  setElement: null,
  parseTip: null,
  createGetter: null,
  get: null,
  showInExplorer: null,
}

// 初始化
Local.initialize = function () {
  // 设置确定按钮的快捷键
  for (const button of document.getElementsByName('confirm')) {
    button.setAttribute('hotkey', 'Ctrl+Enter')
  }
  // 设置取消按钮的快捷键
  for (const button of document.getElementsByName('cancel')) {
    button.setAttribute('hotkey', 'Escape')
  }
  // 获取语言包目录
  this.dirname = Path.resolve(__dirname, 'Locales')
  // 读取语言包后显示菜单栏
  this.readLanguageList().then(() => {
    return this.setLanguage(Editor.config.language)
  }).then(() => {
    $('#menu').addClass('visible')
  })
}

// 读取语言列表
Local.readLanguageList = function () {
  const languages = this.languages = []
  return FSP.readdir(this.dirname, {withFileTypes: true}).then(files => {
    const regexp = /\.(.+)$/
    for (const file of files) {
      if (file.isDirectory()) {
        continue
      }
      const name = file.name
      const extname = Path.extname(name)
      if (extname.toLowerCase() !== '.json') {
        continue
      }
      const basename = Path.basename(name, extname)
      const match = basename.match(regexp)
      if (match) {
        languages.push({
          key: basename.slice(0, match.index),
          alias: match[1],
          filename: name,
        })
      } else {
        languages.push({
          key: basename,
          alias: basename,
          filename: name,
        })
      }
    }
    return languages
  }).catch(error => {
    Log.throw(error)
    return languages
  })
}

// 设置语言
Local.setLanguage = async function (language) {
  Editor.config.language = language
  if (language === '') {
    language = 'en-US'
    let matchedWeight = 0
    const sKeys = navigator.language.split('-')
    for (const {key} of this.languages) {
      const dKeys = key.split('-')
      if (sKeys[0] === dKeys[0]) {
        let weight = 0
        for (let sKey of sKeys) {
          if (dKeys.includes(sKey)) {
            weight++
          }
        }
        if (matchedWeight < weight) {
          matchedWeight = weight
          language = key
        }
      }
    }
  }
  for (const {key, filename} of this.languages) {
    if (key !== language) continue
    if (this.active !== filename) {
      try {
        const path = Path.resolve(this.dirname, filename)
        this.update(await File.get({local: path, type: 'json'}))
        this.active = filename
        this.language = language
        window.dispatchEvent(new Event('localize'))
      } catch (error) {
        console.error(new Error('Failed to load language pack'))
        Log.throw(error)
      }
    }
    return
  }
  // 找不到语言包时切换到自动模式
  if (Editor.config.language) {
    return this.setLanguage('')
  }
}

// 更新数据
Local.update = function IIFE() {
  // 延时100ms可以输出所有错误并触发系统音效
  const throwError = message => {
    if (Log.devmode) {
      setTimeout(() => {
        Log.throw(new Error(`Localizing Error: ${message}`))
      }, 100)
    }
  }
  return function (data) {
    this.setProperties(data.properties)
    const setElement = this.setElement
    const entries = Object.entries(data.components)
    const length = entries.length
    for (let i = 0; i < length; i++) {
      const [key, item] = entries[i]
      if (key[0] === '[') {
        if (key === '[comment]') continue
        const elements = key[1] === '.'
        ? document.getElementsByClassName(key.slice(2, -1))
        : document.getElementsByName(key.slice(1, -1))
        const length = elements.length
        if (length !== 0) {
          for (let i = 0; i < length; i++) {
            setElement(elements[i], item)
          }
        } else {
          throwError(`key '${key}' is invalid`)
        }
      } else {
        const element = document.getElementById(key)
        if (element !== null) {
          setElement(element, item)
        } else {
          throwError(`key '${key}' is invalid`)
        }
      }
    }
    this.saveItems = {}
  }
}()

// 设置属性
Local.setProperties = function IIFE() {
  const setProperty = (map, path, value) => {
    map[path] = value
    if (value instanceof Object) {
      for (const key of Object.keys(value)) {
        setProperty(map, path + '.' + key, value[key])
      }
    }
  }
  return function (data) {
    const map = this.properties
    if (data instanceof Object) {
      for (const key of Object.keys(data)) {
        setProperty(map, key, data[key])
      }
    }
  }
}()

// 设置元素
Local.setElement = function IIFE() {
  const throwError = (element, message) => {
    if (Log.devmode) {
      let symbol
      if (element.id) {
        symbol = `element[#${element.id}]`
      } else if (element.name) {
        symbol = `element[@${element.name}]`
      } else {
        symbol = 'element[unknown]'
      }
      setTimeout(() => {
        Log.throw(new Error(`Localizing Error: ${message.replace('@element', symbol)}`))
      }, 100)
    }
  }
  return function (element, item) {
    if (item.save !== undefined) {
      Local.saveItems[item.save] = item
    }
    if (item.content !== undefined) {
      element.textContent = item.content
    }
    if (item.title !== undefined) {
      if (element instanceof WindowFrame) {
        element.setTitle(item.title)
      } else {
        throwError(element, 'typeof @element is not window-frame')
      }
    }
    if (item.label !== undefined) {
      const prev = element.previousElementSibling
      if (prev instanceof HTMLElement) {
        prev.textContent = item.label
      } else {
        throwError(element, 'there is no label of @element')
      }
    }
    if (item.tip !== undefined) {
      element.setTooltip(Local.parseTip(
        item.tip,
        item.label ?? item.content,
      ))
    }
    if (item.placeholder !== undefined) {
      if (element instanceof TextBox) {
        element.setPlaceholder(item.placeholder)
      } else {
        throwError(element, 'typeof @element is not text-box')
      }
    }
    if (item.options !== undefined) {
      if (element instanceof SelectBox) {
        element.setItemNames(item.options)
      } else {
        throwError(element, 'typeof @element is not select-box')
      }
    }
  }
}()

// 解析工具提示
Local.parseTip = function (tip, title) {
  const match = this.saveTagExp.exec(tip)
  let string = match ? this.saveItems[match[1]].tip : tip
  if (title && tip[0] !== '$') {
    string = `<b>${title}</b>\n${string}`
  }
  return string.replace(this.titleTagExp, '<b>$1</b>')
}

// 创建访问器
Local.createGetter = function (path) {
  const prefix = path + '.'
  return key => this.get(prefix + key)
}

// 获取属性
Local.get = function (key) {
  const property = this.properties[key]
  if (property === undefined) {
    const index = key.lastIndexOf('.')
    if (index !== -1) {
      key = key.slice(index + 1)
    }
    const remap = 'common.' + key
    return this.properties[remap] ?? ''
  }
  return property
}

// 返回在资源管理器中显示的字符串
Local.showInExplorer = function () {
  switch (process.platform) {
    case 'win32':
      return 'showInExplorer'
    case 'darwin':
      return 'showInFinder'
  }
}

// ******************************** 图像剪辑窗口 ********************************

const ImageClip = {
  // properties
  window: $('#imageClip'),
  screen: $('#imageClip-screen'),
  image: $('#imageClip-image').hide(),
  marquee: $('#imageClip-marquee').hide(),
  target: null,
  symbol: null,
  dragging: null,
  // methods
  initialize: null,
  open: null,
  loadImage: null,
  updateImage: null,
  updateTitle: null,
  updateMarquee: null,
  shiftMarquee: null,
  scrollToMarquee: null,
  startDragging: null,
  // events
  dprchange: null,
  windowClosed: null,
  windowResize: null,
  screenKeydown: null,
  marqueePointerdown: null,
  marqueeDoubleclick: null,
  pointerup: null,
  pointermove: null,
  paramInput: null,
  confirm: null,
}

// 初始化
ImageClip.initialize = function () {
  // 侦听事件
  window.on('dprchange', this.dprchange)
  this.window.on('closed', this.windowClosed)
  this.window.on('resize', this.windowResize)
  this.screen.on('keydown', this.screenKeydown)
  this.marquee.on('pointerdown', this.marqueePointerdown)
  this.marquee.on('doubleclick', this.marqueeDoubleclick)
  $('#imageClip-x, #imageClip-y, #imageClip-width, #imageClip-height').on('input', this.paramInput)
  $('#imageClip-confirm').on('click', this.confirm)
}

// 打开窗口
ImageClip.open = async function (target) {
  this.target = target
  Window.open('imageClip')

  // 写入数据
  const write = getElementWriter('imageClip')
  const [x, y, width, height] = target.read()
  write('x', x)
  write('y', y)
  write('width', width)
  write('height', height)

  // 加载图像
  this.loadImage()
}

// 加载图像
ImageClip.loadImage = function () {
  this.window.setTitle('')

  // 这里假设图像输入框就在剪辑输入框前面第二个位置
  const id = this.target.getAttribute('image')
  const guid = $('#' + id).read()
  const path = File.getPath(guid)
  if (path) {
    const image = this.image
    image.src = File.route(path)

    // 更新图像和信息
    const symbol = this.symbol = Symbol()
    new Promise(resolve => {
      const intervalIndex = setInterval(() => {
        if (image.naturalWidth !== 0) {
          if (this.symbol === symbol) {
            this.updateImage()
            this.updateMarquee()
            this.scrollToMarquee('center')
          }
          clearInterval(intervalIndex)
          resolve(image)
        } else if (image.complete) {
          clearInterval(intervalIndex)
          resolve(null)
        }
      })
    }).then(image => {
      if (this.symbol === symbol) {
        this.symbol = null
        this.updateTitle(path, image)
      }
    })
  } else {
    this.updateTitle()
  }
}

// 更新图像
ImageClip.updateImage = function () {
  // 隐藏内部元素避免滚动条意外出现
  const screen = this.screen
  const image = this.image.hide()
  const marquee = this.marquee.hide()

  // 计算图像的居中位置
  const dpr = window.devicePixelRatio
  const width = image.naturalWidth
  const height = image.naturalHeight
  const left = Math.max(screen.clientWidth * dpr - width >> 1, 0)
  const top = Math.max(screen.clientHeight * dpr - height >> 1, 0)
  image.style.left = `${left / dpr}px`
  image.style.top = `${top / dpr}px`
  image.style.width = `${width / dpr}px`
  image.style.height = `${height / dpr}px`
  image.show()
  marquee.scaleX = 1 / dpr
  marquee.scaleY = 1 / dpr
  marquee.style.left = `${left / dpr}px`
  marquee.style.top = `${top / dpr}px`
  marquee.style.width = `${width / dpr}px`
  marquee.style.height = `${height / dpr}px`
  marquee.show()
}

// 更新标题
ImageClip.updateTitle = function (path, image) {
  let info
  if (path && image) {
    const name = Path.basename(path)
    const alias = File.filterGUID(name)
    const width = image.naturalWidth
    const height = image.naturalHeight
    info = `${alias} - ${width}x${height}`
  } else {
    info = Local.get('common.none')
  }
  this.window.setTitle(info)
}

// 更新选框
ImageClip.updateMarquee = function () {
  const read = getElementReader('imageClip')
  const x = read('x')
  const y = read('y')
  const width = read('width')
  const height = read('height')
  this.marquee.select(x, y, width, height)
}

// 移动选框
ImageClip.shiftMarquee = function (ox, oy) {
  const image = this.image
  const iw = image.naturalWidth
  const ih = image.naturalHeight
  if (iw * ih === 0) return
  const read = getElementReader('imageClip')
  const write = getElementWriter('imageClip')
  const sx = read('x')
  const sy = read('y')
  const sw = read('width')
  const sh = read('height')
  const dx = Math.clamp(sx + ox * sw, 0, iw - sw)
  const dy = Math.clamp(sy + oy * sh, 0, ih - sh)
  if (sx !== dx) write('x', dx)
  if (sy !== dy) write('y', dy)
  this.updateMarquee()
  this.scrollToMarquee('active')
}

// 滚动到选框位置
ImageClip.scrollToMarquee = function (mode) {
  const screen = this.screen
  const marquee = this.marquee
  const dpr = window.devicePixelRatio
  const mx = marquee.x
  const my = marquee.y
  const mw = marquee.width
  const mh = marquee.height
  const sw = screen.clientWidth * dpr
  const sh = screen.clientHeight * dpr
  switch (mode) {
    case 'active': {
      const minSL = (mx + mw - sw) / dpr
      const maxSL = mx / dpr
      const minST = (my + mh - sh) / dpr
      const maxST = my / dpr
      screen.scrollLeft = Math.clamp(screen.scrollLeft, minSL, maxSL)
      screen.scrollTop = Math.clamp(screen.scrollTop, minST, maxST)
      break
    }
    case 'center': {
      const x = mx + mw / 2
      const y = my + mh / 2
      const sl = x - (sw >> 1)
      const st = y - (sh >> 1)
      screen.scrollLeft = Math.round(sl / dpr)
      screen.scrollTop = Math.round(st / dpr)
      break
    }
  }
}

// 开始拖拽
ImageClip.startDragging = function (event) {
  Cursor.open('cursor-grab')
  this.dragging = event
  event.mode = 'scroll'
  event.scrollLeft = this.screen.scrollLeft
  event.scrollTop = this.screen.scrollTop
  window.on('pointerup', this.pointerup)
  window.on('pointermove', this.pointermove)
}

// 设备像素比改变事件
ImageClip.dprchange = function (event) {
  if (!this.image.hasClass('hidden')) {
    this.updateImage()
    this.updateMarquee()
  }
}.bind(ImageClip)

// 窗口 - 已关闭事件
ImageClip.windowClosed = function (event) {
  if (this.dragging) {
    this.pointerup(this.dragging)
  }
  this.target = null
  this.symbol = null
  this.image.src = ''
  this.image.hide()
  this.marquee.hide()
}.bind(ImageClip)

// 窗口 - 调整大小事件
ImageClip.windowResize = function (event) {
  if (!this.image.hasClass('hidden')) {
    this.updateImage()
  }
}.bind(ImageClip)

// 屏幕 - 键盘按下事件
ImageClip.screenKeydown = function (event) {
  if (this.dragging) {
    return
  }
  if (event.cmdOrCtrlKey) {
    return
  } else if (event.altKey) {
    return
  } else {
    switch (event.code) {
      case 'ArrowLeft':
        event.preventDefault()
        this.shiftMarquee(-1, 0)
        break
      case 'ArrowUp':
        event.preventDefault()
        this.shiftMarquee(0, -1)
        break
      case 'ArrowRight':
        event.preventDefault()
        this.shiftMarquee(1, 0)
        break
      case 'ArrowDown':
        event.preventDefault()
        this.shiftMarquee(0, 1)
        break
    }
  }
}.bind(ImageClip)

// 选框区域 - 指针按下事件
ImageClip.marqueePointerdown = function (event) {
  if (this.dragging) {
    return
  }
  switch (event.button) {
    case 0: {
      if (event.altKey) {
        return this.startDragging(event)
      }
      const marquee = this.marquee
      const coords = event.getRelativeCoords(marquee)
      const read = getElementReader('imageClip')
      const write = getElementWriter('imageClip')
      const x = coords.x / marquee.scaleX
      const y = coords.y / marquee.scaleY
      const cw = Math.max(read('width'), 1)
      const ch = Math.max(read('height'), 1)
      const cx = Math.floor(x / cw) * cw
      const cy = Math.floor(y / ch) * ch
      write('x', cx)
      write('y', cy)
      this.updateMarquee()
      break
    }
    case 2:
      this.startDragging(event)
      break
  }
}.bind(ImageClip)

// 选框区域 - 鼠标双击事件
ImageClip.marqueeDoubleclick = function (event) {
  if (!event.altKey) {
    this.confirm(event)
  }
}.bind(ImageClip)

// 指针弹起事件
ImageClip.pointerup = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'scroll':
        Cursor.close('cursor-grab')
        break
    }
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(ImageClip)

// 指针移动事件
ImageClip.pointermove = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'scroll':
        this.screen.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX
        this.screen.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY
        break
    }
  }
}.bind(ImageClip)

// 选取矩形 - 参数输入事件
ImageClip.paramInput = function (event) {
  ImageClip.updateMarquee()
}

// 确定按钮 - 鼠标点击事件
ImageClip.confirm = function (event) {
  const read = getElementReader('imageClip')
  this.target.input([
    read('x'),
    read('y'),
    read('width'),
    read('height'),
  ])
  Window.close('imageClip')
}.bind(ImageClip)

// ******************************** 拾色器窗口 ********************************

const Color = {
  // properties
  target: null,
  dragging: null,
  paletteX: null,
  paletteY: null,
  pillarY: null,
  indexEnabled: null,
  // methods
  initialize: null,
  open: null,
  drawPalette: null,
  drawPillar: null,
  drawViewer: null,
  setPaletteCursor: null,
  setPillarCursor: null,
  getRGBFromPalette: null,
  getRGBFromPillar: null,
  getRGBAFromHex: null,
  getHexFromRGBA: null,
  getCSSColorFromRGBA: null,
  writeRGBAToInputs: null,
  readRGBAFromInputs: null,
  loadIndexedColors: null,
  simplifyHexColor: null,
  // events
  windowClosed: null,
  palettePointerdown: null,
  pillarPointerdown: null,
  indexedColorInput: null,
  indexedColorPointerdown: null,
  pointerup: null,
  pointermove: null,
  hexBeforeinput: null,
  hexInput: null,
  rgbaInput: null,
  confirm: null,
}

// 初始化
Color.initialize = function () {
  // 设置十六进制的最大长度
  $('#color-hex').setMaxLength(8)

  // 设置颜色索引单选框为可取消
  $('#color-index').cancelable = true

  // 侦听事件
  $('#color').on('closed', this.windowClosed)
  $('#color-palette-frame').on('pointerdown', this.palettePointerdown)
  $('#color-pillar-frame').on('pointerdown', this.pillarPointerdown)
  $('#color-index').on('input', this.indexedColorInput)
  $('[name="color-index"]').on('pointerdown', this.indexedColorPointerdown)
  $('#color-r, #color-g, #color-b, #color-a').on('input', this.rgbaInput)
  $('#color-hex').on('beforeinput', this.hexBeforeinput, {capture: true})
  $('#color-hex').on('input', this.hexInput)
  $('#color-confirm').on('click', this.confirm)
}

// 打开窗口
Color.open = function (target, indexEnabled = false) {
  this.target = target
  this.indexEnabled = indexEnabled
  Window.open('color')
  let color = target.read()
  switch (typeof color) {
    case 'string':
      break
    case 'number':
      $('#color-index').write(color)
      color = Data.config.indexedColors[color].code
      break
  }
  const rgba = this.getRGBAFromHex(color)
  this.drawPalette()
  this.drawPillar(rgba)
  this.setPillarCursor(0)
  this.writeRGBAToInputs(rgba)
  this.drawViewer(rgba)
  this.loadIndexedColors()
  $('#color-hex').getFocus('all')
}

// 绘制调色板
Color.drawPalette = function () {
  const canvas = $('#color-palette-canvas')
  if (!canvas.initialized) {
    canvas.initialized = true

    // 绘制水平渐变色带
    const context = canvas.getContext('2d')
    const gradient = context.createLinearGradient(0.5, 0, 255.5, 0)
    gradient.addColorStop(0, '#ff0000')
    gradient.addColorStop(1 / 6, '#ffff00')
    gradient.addColorStop(2 / 6, '#00ff00')
    gradient.addColorStop(3 / 6, '#00ffff')
    gradient.addColorStop(4 / 6, '#0000ff')
    gradient.addColorStop(5 / 6, '#ff00ff')
    gradient.addColorStop(1, '#ff0000')
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 194)

    // 绘制7根纯色线条
    context.fillStyle = '#ff0000'
    context.fillRect(0, 0, 1, 194)
    context.fillStyle = '#ffff00'
    context.fillRect(43, 0, 1, 194)
    context.fillStyle = '#00ff00'
    context.fillRect(85, 0, 1, 194)
    context.fillStyle = '#00ffff'
    context.fillRect(128, 0, 1, 194)
    context.fillStyle = '#0000ff'
    context.fillRect(170, 0, 1, 194)
    context.fillStyle = '#ff00ff'
    context.fillRect(213, 0, 1, 194)
    context.fillStyle = '#ff0000'
    context.fillRect(255, 0, 1, 194)

    // 绘制垂直渐变色带
    const upperGradient = context.createLinearGradient(0, 0.5, 0, 96.5)
    upperGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    upperGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = upperGradient
    context.fillRect(0, 0, 256, 97)
    const lowerGradient = context.createLinearGradient(0, 97.5, 0, 193.5)
    lowerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    lowerGradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
    context.fillStyle = lowerGradient
    context.fillRect(0, 97, 256, 97)

    // 设置指针初始位置
    this.setPaletteCursor(0, 193)
  }
}

// 绘制色柱
Color.drawPillar = function ([r, g, b]) {
  const canvas = $('#color-pillar-canvas')
  const context = canvas.getContext('2d')
  const gradient = context.createLinearGradient(0, 0.5, 0, 255.5)
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b})`)
  gradient.addColorStop(1, `rgba(255, 255, 255)`)
  context.fillStyle = gradient
  context.fillRect(0, 0, 20, 256)
}

// 绘制查看器
Color.drawViewer = function ([r, g, b, a]) {
  $('#color-viewer').style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`
}

// 设置调色板指针
Color.setPaletteCursor = function (x, y) {
  const cursor = $('#color-palette-cursor')
  this.paletteX = x
  this.paletteY = y
  cursor.style.left = `${x - 5}px`
  cursor.style.top = `${y - 5}px`
}

// 设置色柱指针
Color.setPillarCursor = function (y) {
  const cursor = $('#color-pillar-cursor')
  this.pillarY = y
  cursor.style.top = `${y}px`
}

// 从调色板中获取颜色分量
Color.getRGBFromPalette = function () {
  const x = Math.round(this.paletteX)
  const y = Math.round(this.paletteY)
  const canvas = $('#color-palette-canvas')
  const context = canvas.getContext('2d')
  const [r, g, b, a] = context.getImageData(x, y, 1, 1).data
  return [r, g, b]
}

// 从色柱中获取颜色分量
Color.getRGBFromPillar = function () {
  const y = Math.round(this.pillarY)
  const canvas = $('#color-pillar-canvas')
  const context = canvas.getContext('2d')
  const [r, g, b, a] = context.getImageData(0, y, 1, 1).data
  return [r, g, b]
}

// 从十六进制中获取颜色分量
Color.getRGBAFromHex = function (hex) {
  const r = parseInt(hex.slice(0, 2) || '00', 16)
  const g = parseInt(hex.slice(2, 4) || '00', 16)
  const b = parseInt(hex.slice(4, 6) || '00', 16)
  const a = parseInt(hex.slice(6, 8) || 'ff', 16)
  return [r, g, b, a]
}

// 从颜色分量中获取十六进制
Color.getHexFromRGBA = function (rgba) {
  const r = rgba[0].toString(16).padStart(2, '0')
  const g = rgba[1].toString(16).padStart(2, '0')
  const b = rgba[2].toString(16).padStart(2, '0')
  const a = rgba[3].toString(16).padStart(2, '0')
  return `${r}${g}${b}${a}`
}

// 从颜色分量中获取 CSS 颜色
Color.getCSSColorFromRGBA = function (rgba) {
  const [r, g, b, a] = rgba
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`
}

// 写入颜色分量到输入框
Color.writeRGBAToInputs = function ([r, g, b, a]) {
  const write = getElementWriter('color')
  const hex = this.getHexFromRGBA([r, g, b, a])
  write('hex', this.simplifyHexColor(hex))
  write('r', r)
  write('g', g)
  write('b', b)
  write('a', a)
}

// 读取颜色分量从输入框
Color.readRGBAFromInputs = function () {
  const read = getElementReader('color')
  const r = read('r')
  const g = read('g')
  const b = read('b')
  const a = read('a')
  return [r, g, b, a]
}

// 加载索引颜色
Color.loadIndexedColors = function () {
  const radios = document.getElementsByName('color-index')
  const colors = Data.config.indexedColors
  const length = colors.length
  for (let i = 0; i < length; i++) {
    const radio = radios[i]
    const color = colors[i]
    const rgba = this.getRGBAFromHex(color.code)
    const csscolor = this.getCSSColorFromRGBA(rgba)
    radio.style.backgroundColor = csscolor
    radio.setTooltip(color.name)
  }
}

// 简化十六进制颜色代码
Color.simplifyHexColor = function IIFE() {
  const regexp = /^([0-9a-f]{6})ff$/i
  return function (hex) {
    return hex.replace(regexp, '$1')
  }
}()

// 窗口 - 已关闭事件
Color.windowClosed = function (event) {
  $('#color-index').reset()
  if (this.dragging) {
    this.pointerup(this.dragging)
  }
}.bind(Color)

// 调色板 - 指针按下事件
Color.palettePointerdown = function (event) {
  switch (event.button) {
    case 0: case -1: {
      if (!this.dragging) {
        this.dragging = event
        event.mode = 'palette'
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      const canvas = $('#color-palette-canvas')
      const coords = event.getRelativeCoords(canvas)
      const x = Math.clamp(coords.x, 0, 255)
      const y = Math.clamp(coords.y, 0, 193)
      this.setPaletteCursor(x, y)

      const rgb = this.getRGBFromPalette()
      const a = $('#color-a').read()
      const rgba = [...rgb, a]
      this.drawPillar(rgb)
      this.setPillarCursor(0)
      this.writeRGBAToInputs(rgba)
      this.drawViewer(rgba)
      $('#color-index').reset()
      break
    }
  }
}.bind(Color)

// 色柱 - 指针按下事件
Color.pillarPointerdown = function (event) {
  switch (event.button) {
    case 0: case -1: {
      if (!this.dragging) {
        this.dragging = event
        event.mode = 'pillar'
        window.on('pointerup', this.pointerup)
        window.on('pointermove', this.pointermove)
      }
      const canvas = $('#color-pillar-canvas')
      const coords = event.getRelativeCoords(canvas)
      const y = Math.clamp(coords.y, 0, 255)
      this.setPillarCursor(y)

      const rgb = this.getRGBFromPillar()
      const a = $('#color-a').read()
      const rgba = [...rgb, a]
      this.writeRGBAToInputs(rgba)
      this.drawViewer(rgba)
      $('#color-index').reset()
      break
    }
  }
}.bind(Color)

// 索引颜色 - 输入事件
Color.indexedColorInput = function (event) {
  const index = event.value
  const hex = Data.config.indexedColors[index].code
  const rgba = this.getRGBAFromHex(hex)
  this.drawPillar(rgba)
  this.setPillarCursor(0)
  this.writeRGBAToInputs(rgba)
  this.drawViewer(rgba)
  if (!this.indexEnabled) {
    event.target.reset()
  }
}.bind(Color)

// 索引颜色 - 指针按下事件
Color.indexedColorPointerdown = function (event) {
  switch (event.button) {
    case 2: {
      const element = event.target
      const index = element.dataValue
      const indexedColor = Data.config.indexedColors[index]
      const get = Local.createGetter('menuIndexedColor')
      Menu.popup({
        x: event.clientX,
        y: event.clientY,
      }, [{
        label: get('saveColor'),
        click: () => {
          const rgba = this.readRGBAFromInputs()
          const hex = this.getHexFromRGBA(rgba)
          const csscolor = this.getCSSColorFromRGBA(rgba)
          if (indexedColor.code !== hex) {
            indexedColor.code = hex
            element.style.backgroundColor = csscolor
            UI.updateIndexedColor(index)
            File.planToSave(Data.manifest.project.config)
          }
        },
      }, {
        label: get('rename'),
        click: () => {
          Rename.open(indexedColor.name, name => {
            indexedColor.name = name
            element.setTooltip(name)
            File.planToSave(Data.manifest.project.config)
          })
        },
      }])
      break
    }
  }
}.bind(Color)

// 指针弹起事件
Color.pointerup = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    this.dragging = null
    window.off('pointerup', this.pointerup)
    window.off('pointermove', this.pointermove)
  }
}.bind(Color)

// 指针移动事件
Color.pointermove = function (event) {
  const {dragging} = this
  if (dragging.relate(event)) {
    switch (dragging.mode) {
      case 'palette':
        return this.palettePointerdown(event)
      case 'pillar':
        return this.pillarPointerdown(event)
    }
  }
}.bind(Color)

// 十六进制 - 输入前事件
Color.hexBeforeinput = function (event) {
  if (event.inputType === 'insertText' &&
    typeof event.data === 'string') {
    const regexp = /[^0-9a-f]/i
    if (regexp.test(event.data)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
}

// 十六进制 - 输入事件
Color.hexInput = function (event) {
  const read = getElementReader('color')
  const write = getElementWriter('color')
  const oldHex = read('hex')
  const newHex = oldHex.replace(/[^0-9a-f]/gi, '')
  const [r, g, b, a] = this.getRGBAFromHex(newHex)
  if (oldHex !== newHex) {
    write('hex', newHex)
  }
  write('r', r)
  write('g', g)
  write('b', b)
  write('a', a)
  this.drawPillar([r, g, b])
  this.setPillarCursor(0)
  this.drawViewer([r, g, b, a])
  $('#color-index').reset()
}.bind(Color)

// 颜色分量 - 输入事件
Color.rgbaInput = function (event) {
  const read = getElementReader('color')
  const write = getElementWriter('color')
  const r = read('r')
  const g = read('g')
  const b = read('b')
  const a = read('a')
  const hex = this.getHexFromRGBA([r, g, b, a])
  write('hex', this.simplifyHexColor(hex))
  this.drawPillar([r, g, b])
  this.setPillarCursor(0)
  this.drawViewer([r, g, b, a])
  $('#color-index').reset()
}.bind(Color)

// 保存颜色 - 鼠标点击事件
Color.confirm = function (event) {
  const index = $('#color-index').read()
  if (this.indexEnabled && index !== null) {
    this.target.input(index)
  } else {
    const rgba = this.readRGBAFromInputs()
    const hex = this.getHexFromRGBA(rgba)
    this.target.input(hex)
  }
  Window.close('color')
}.bind(Color)

// ******************************** 选取文本 ********************************

const Selection = {
  // properties
  target: null,
  inserting: false,
  context: null,
  regexps: {
    local: /<local:(.*?)>/,
    global: /<global:([0-9a-f]{16})?>/,
    dynamicGlobal: /<global::([0-9a-f]{16})?>/,
    ref: /<ref:([0-9a-f]{16})?>/,
  },
  // methods
  initialize: null,
  saveContext: null,
  restoreContext: null,
  addEventListeners: null,
  match: null,
  insert: null,
  edit: null,
  wrap: null,
  // events
  inputKeydown: null,
  inputKeyup: null,
  inputPointerdown: null,
  inputPointerup: null,
  // objects
  color: null,
  font: null,
  italic: null,
  bold: null,
  fontSize: null,
  textPosition: null,
  textEffect: null,
  image: null,
  localVariable: null,
  globalVariable: null,
  dynamicGlobalVariable: null,
  localization: null,
}

// 初始化
Selection.initialize = function () {
  // 侦听事件
  $('#font-confirm').on('click', this.font.confirm)
  $('#fontSize-confirm').on('click', this.fontSize.confirm)
  $('#textPosition-confirm').on('click', this.textPosition.confirm)
  $('#textEffect-confirm').on('click', this.textEffect.confirm)
  $('#insertImage-confirm').on('click', this.image.confirm)
  $('#localVariable-confirm').on('click', this.localVariable.confirm)

  // 侦听文本框事件
  const exclusions = {
    'color-hex': true,
    'command-searcher': true,
  }

  // 侦听文本框事件
  for (const textbox of $('text-box')) {
    if (!exclusions[textbox.id]) {
      this.addEventListeners(textbox.input)
    }
  }

  // 侦听文本区域变量事件
  for (const textbox of $('text-area-var')) {
    this.addEventListeners(textbox.strBox)
  }

  // 侦听文本区域事件
  for (const textarea of $('textarea')) {
    this.addEventListeners(textarea)
  }

  // 初始化子对象
  this.textPosition.initialize()
  this.textEffect.initialize()
  this.image.initialize()
  this.localVariable.initialize()
}

// 保存上下文
Selection.saveContext = function () {
  this.context = {
    target: this.target,
    inserting: this.inserting,
  }
}

// 恢复上下文
Selection.restoreContext = function () {
  if (this.context) {
    this.target = this.context.target
    this.inserting = this.context.inserting
  }
}

// 添加事件侦听器
Selection.addEventListeners = function (element) {
  element.on('keydown', this.inputKeydown)
  element.on('keyup', this.inputKeyup)
  element.on('pointerdown', this.inputPointerdown)
  element.on('pointerup', this.inputPointerup)
}

// 匹配标签
Selection.match = function () {
  const target = document.activeElement
  if (typeof target.selectionStart !== 'number') {
    return
  }

  // 设置目标
  this.target = target

  // 开始匹配
  const text = target.value
  const selectionStart = target.selectionStart
  const selectionEnd = target.selectionEnd
  if (selectionEnd === 0) {
    return
  }

  const regexps = Printer.regexps
  const start = text.lastIndexOf('<', selectionEnd - 1)
  const end = text.indexOf('>', selectionStart) + 1
  let tag
  let params
  if (start >= 0 &&
    end > 0 &&
    start < end &&
    start <= selectionStart &&
    end >= selectionEnd) {
    const string = text.slice(start, end)
    let match
    if (match = string.match(regexps.colorIndex)) {
      tag = 'color'
      params = {
        color: parseInt(match[1]),
      }
    } else if (match = string.match(regexps.color)) {
      tag = 'color'
      params = {
        color: `${match[1]}${match[2]}${match[3]}${match[4] || 'ff'}`,
      }
    } else if (match = string.match(regexps.font)) {
      tag = 'font'
      params = {
        font: match[1],
      }
    } else if (match = string.match(regexps.italic)) {
      tag = 'italic'
      params = null
    } else if (match = string.match(regexps.bold)) {
      tag = 'bold'
      params = null
    } else if (match = string.match(regexps.fontSize)) {
      tag = 'fontSize'
      params = {
        size: parseInt(match[1]),
      }
    } else if (match = string.match(regexps.textPosition)) {
      tag = 'textPosition'
      params = {
        axis: match[1],
        operation: match[2] || 'set',
        value: parseInt(match[3]),
      }
    } else if (match = string.match(regexps.textShadow)) {
      tag = 'textEffect'
      params = {
        type: 'shadow',
        shadowOffsetX: parseInt(match[1]),
        shadowOffsetY: parseInt(match[2]),
        color: `${match[3]}${match[4]}${match[5]}${match[6] || 'ff'}`,
      }
    } else if (match = string.match(regexps.textStroke)) {
      tag = 'textEffect'
      params = {
        type: 'stroke',
        strokeWidth: parseInt(match[1]),
        color: `${match[2]}${match[3]}${match[4]}${match[5] || 'ff'}`,
      }
    } else if (match = string.match(regexps.textOutline)) {
      tag = 'textEffect'
      params = {
        type: 'outline',
        color: `${match[1]}${match[2]}${match[3]}${match[4] || 'ff'}`,
      }
    } else if (match = string.match(regexps.image)) {
      let image = match[1]
      let mode
      let clip
      let width
      let height
      if (match[7]) {
        mode = 'image-clip-size'
        clip = [
          parseInt(match[2]),
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5]),
        ]
        width = parseInt(match[6] ?? this.sizes[0])
        height = parseInt(match[7] ?? this.sizes[0])
      } else if (match[5]) {
        mode = 'image-clip'
        clip = [
          parseInt(match[2]),
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5]),
        ]
      } else if (match[3]) {
        mode = 'image-size'
        width = parseInt(match[2])
        height = parseInt(match[3])
      } else {
        mode = 'image'
      }
      tag = 'image'
      params = {mode, image, clip, width, height}
    } else {
      const wrap = target.parentNode
      const menu = wrap.getAttribute('menu')
      if (menu?.includes('tag-local-var')) {
        if (match = string.match(this.regexps.local)) {
          tag = 'localVariable'
          params = {
            key: match[1],
          }
        }
      }
      if (menu?.includes('tag-global')) {
        if (match = string.match(this.regexps.global)) {
          tag = 'globalVariable'
          params = {
            key: match[1] ?? '',
          }
        }
      }
      if (menu?.includes('tag-dynamic-global')) {
        if (match = string.match(this.regexps.dynamicGlobal)) {
          tag = 'dynamicGlobalVariable'
          params = {
            key: match[1] ?? '',
          }
        }
      }
      if (menu?.includes('tag-localization')) {
        if (match = string.match(this.regexps.ref)) {
          tag = 'localization'
          params = {
            key: match[1] ?? '',
          }
        }
      }
    }
  }
  if (tag) {
    target.selectionStart = start
    target.selectionEnd = end
    if (params) {
      return {tag, params}
    }
  }
}

// 插入标签
Selection.insert = function (tag) {
  const target = document.activeElement
  if (typeof target.selectionStart === 'number') {
    this.target = target
    this.inserting = true
    this[tag].open()
  }
}

// 编辑标签
Selection.edit = function () {
  const match = this.match()
  if (match) {
    const {tag, params} = match
    this.inserting = false
    this[tag].open(params)
  }
}

// 包装选中文本
Selection.wrap = function ({prefix, suffix}) {
  const input = this.target
  const start = input.selectionStart
  const end = input.selectionEnd
  input.focus()
  if (this.inserting && start !== end) {
    let string
    if (suffix) {
      const selection = input.value.slice(start, end)
      string = prefix + selection + suffix
    } else {
      string = prefix
      input.selectionEnd = input.selectionStart
    }
    input.parentNode.insert(string)
    input.selectionStart = start
  } else {
    input.parentNode.insert(prefix)
    input.selectionStart = start
  }
}

// 输入框 - 键盘按下事件
Selection.inputKeydown = function (event) {
  if (event.altKey) {
    switch (event.code) {
      case 'KeyE':
        this.match()
        break
    }
  }
}.bind(Selection)

// 输入框 - 键盘弹起事件
Selection.inputKeyup = function (event) {
  if (event.altKey) {
    switch (event.code) {
      case 'KeyE':
        this.edit()
        break
    }
  }
}.bind(Selection)

// 输入框 - 指针按下事件
Selection.inputPointerdown = function (event) {
  switch (event.button) {
    case 2:
      setTimeout(() => this.match())
      break
  }
}.bind(Selection)

// 输入框 - 指针弹起事件
Selection.inputPointerup = function (event) {
  switch (event.button) {
    case 2:
      navigator.clipboard.readText().then(clipText => {
        const element = event.target
        if (document.activeElement === element) {
          const start = element.selectionStart
          const end = element.selectionEnd
          const editable = !!this.match()
          const selected = start !== end
          const pastable = !!clipText
          const undoable = element.history.canUndo()
          const redoable = element.history.canRedo()
          const get = Local.createGetter('menuTextBox')
          const wrap = element.parentNode
          const menu = wrap.getAttribute('menu') ?? 'tag'
          const tagItems = []
          tagItems.push({
            label: get('tag.color'),
            click: () => {
              Selection.insert('color')
            },
          }, {
            label: get('tag.font'),
            click: () => {
              Selection.insert('font')
            },
          }, {
            label: get('tag.italic'),
            click: () => {
              Selection.insert('italic')
            },
          }, {
            label: get('tag.bold'),
            click: () => {
              Selection.insert('bold')
            },
          }, {
            label: get('tag.size'),
            click: () => {
              Selection.insert('fontSize')
            },
          }, {
            label: get('tag.position'),
            click: () => {
              Selection.insert('textPosition')
            },
          }, {
            label: get('tag.effect'),
            click: () => {
              Selection.insert('textEffect')
            },
          }, {
            label: get('tag.image'),
            click: () => {
              Selection.insert('image')
            },
          })
          if (menu.includes('tag-local-var')) {
            tagItems.push({
              label: get('tag.localVariable'),
              click: () => {
                Selection.insert('localVariable')
              }
            })
          }
          if (menu.includes('tag-global')) {
            tagItems.push({
              label: get('tag.globalVariable'),
              click: () => {
                Selection.insert('globalVariable')
              }
            })
          }
          if (menu.includes('tag-dynamic-global')) {
            tagItems.push({
              label: get('tag.dynamicGlobalVariable'),
              click: () => {
                Selection.insert('dynamicGlobalVariable')
              }
            })
          }
          if (menu.includes('tag-localization')) {
            tagItems.push({
              label: get('tag.localization'),
              click: () => {
                Selection.insert('localization')
              }
            })
          }
          Menu.popup({
            x: event.clientX,
            y: event.clientY,
          }, [{
            label: get('edit'),
            accelerator: 'Alt+E',
            enabled: editable,
            click: () => {
              Selection.edit()
            },
          }, {
            label: get('tag'),
            submenu: tagItems,
          }, {
            type: 'separator',
          }, {
            label: get('cut'),
            accelerator: ctrl('X'),
            enabled: selected,
            click: () => {
              element.dispatchEvent(
                new InputEvent('beforeinput', {
                  inputType: 'deleteByCut',
                  bubbles: true,
              }))
              document.execCommand('cut')
            },
          }, {
            label: get('copy'),
            accelerator: ctrl('C'),
            enabled: selected,
            click: () => {
              document.execCommand('copy')
            }
          }, {
            label: get('paste'),
            accelerator: ctrl('V'),
            enabled: pastable,
            click: () => {
              element.dispatchEvent(
                new InputEvent('beforeinput', {
                  inputType: 'insertFromPaste',
                  data: clipText,
                  bubbles: true,
              }))
              document.execCommand('paste')
            }
          }, {
            label: get('delete'),
            accelerator: 'Delete',
            enabled: selected,
            click: () => {
              element.dispatchEvent(
                new InputEvent('beforeinput', {
                  inputType: 'deleteContentForward',
                  bubbles: true,
              }))
              document.execCommand('delete')
            }
          }, {
            label: get('undo'),
            accelerator: ctrl('Z'),
            enabled: undoable,
            click: () => {
              element.history.restore('undo')
            }
          }, {
            label: get('redo'),
            accelerator: ctrl('Y'),
            enabled: redoable,
            click: () => {
              element.history.restore('redo')
            }
          }])
        }
      })
      break
  }
}.bind(Selection)

// 颜色
Selection.color = {
  open: function ({color = '000000ff'} = {}) {
    this.proxy.color = color
    Color.open(this.proxy, true)
  },
  proxy: {
    color: null,
    read: function () {
      return this.color
    },
    input: function (color) {
      if (typeof color === 'string') {
        color = Color.simplifyHexColor(color)
      }
      Selection.wrap({
        prefix: `<color:${color}>`,
        suffix: '</color>',
      })
    }
  }
}

// 字体
Selection.font = {
  open: function ({font = 'sans-serif'} = {}) {
    Window.open('font')
    $('#font-font').write(font)
    $('#font-font').getFocus('all')
  },
  confirm: function (event) {
    const font = $('#font-font').read()
    if (!font) {
      return $('#font-font').getFocus('all')
    }
    Selection.wrap({
      prefix: `<font:${font}>`,
      suffix: '</font>',
    })
    Window.close('font')
  }
}

// 倾斜
Selection.italic = {
  open: function () {
    Selection.wrap({
      prefix: '<italic>',
      suffix: '</italic>',
    })
  }
}

// 加粗
Selection.bold = {
  open: function () {
    Selection.wrap({
      prefix: '<bold>',
      suffix: '</bold>',
    })
  }
}

// 字体大小
Selection.fontSize = {
  open: function ({size = 12} = {}) {
    Window.open('fontSize')
    $('#fontSize-size').write(size)
    $('#fontSize-size').getFocus('all')
  },
  confirm: function (event) {
    const size = $('#fontSize-size').read()
    Selection.wrap({
      prefix: `<size:${size}>`,
      suffix: '</size>',
    })
    Window.close('fontSize')
  }
}

// 文字位置
Selection.textPosition = {
  initialize: function () {
    // 创建坐标轴选项
    $('#textPosition-axis').loadItems([
      {name: 'X', value: 'x'},
      {name: 'Y', value: 'y'},
    ])
    // 创建操作选项
    $('#textPosition-operation').loadItems([
      {name: 'Set', value: 'set'},
      {name: 'Add', value: 'add'},
    ])
  },
  open: function ({axis = 'x', operation = 'set', value = 0} = {}) {
    Window.open('textPosition')
    $('#textPosition-axis').write(axis)
    $('#textPosition-operation').write(operation)
    $('#textPosition-value').write(value)
  },
  confirm: function (event) {
    const axis = $('#textPosition-axis').read()
    const operation = $('#textPosition-operation').read()
    const value = $('#textPosition-value').read()
    let string
    switch (operation) {
      case 'set':
        string = `${value}`
        break
      case 'add':
        string = `${operation},${value}`
        break
    }
    Selection.wrap({
      prefix: `<${axis}:${string}>`,
      suffix: '',
    })
    Window.close('textPosition')
  }
}

// 文字效果
Selection.textEffect = {
  initialize: function () {
    // 创建文字效果类型选项
    $('#textEffect-type').loadItems([
      {name: 'Shadow', value: 'shadow'},
      {name: 'Stroke', value: 'stroke'},
      {name: 'Outline', value: 'outline'},
    ])
    // 设置文字效果类型关联元素
    $('#textEffect-type').enableHiddenMode().relate([
      {case: 'shadow', targets: [
        $('#textEffect-shadowOffsetX'),
        $('#textEffect-shadowOffsetY'),
        $('#textEffect-color'),
      ]},
      {case: 'stroke', targets: [
        $('#textEffect-strokeWidth'),
        $('#textEffect-color'),
      ]},
      {case: 'outline', targets: [
        $('#textEffect-color'),
      ]},
    ])
  },
  open: function ({type = 'shadow', shadowOffsetX = 1, shadowOffsetY = 1, strokeWidth = 1, color = '000000ff'} = {}) {
    Window.open('textEffect')
    $('#textEffect-type').write(type)
    $('#textEffect-shadowOffsetX').write(shadowOffsetX)
    $('#textEffect-shadowOffsetY').write(shadowOffsetY)
    $('#textEffect-strokeWidth').write(strokeWidth)
    $('#textEffect-color').write(color)
  },
  confirm: function (event) {
    const type = $('#textEffect-type').read()
    const color = Color.simplifyHexColor($('#textEffect-color').read())
    let string
    switch (type) {
      case 'shadow': {
        const shadowOffsetX = $('#textEffect-shadowOffsetX').read()
        const shadowOffsetY = $('#textEffect-shadowOffsetY').read()
        string = `${shadowOffsetX},${shadowOffsetY},${color}`
        break
      }
      case 'stroke': {
        const strokeWidth = $('#textEffect-strokeWidth').read()
        string = `${strokeWidth},${color}`
        break
      }
      case 'outline':
        string = `${color}`
        break
    }
    Selection.wrap({
      prefix: `<${type}:${string}>`,
      suffix: `</${type}>`,
    })
    Window.close('textEffect')
  }
}

// 插入图像
Selection.image = {
  initialize: function () {
    // 创建插入图像模式选项
    $('#insertImage-mode').loadItems([
      {name: 'Image', value: 'image'},
      {name: 'Image - Size', value: 'image-size'},
      {name: 'Image - Clip', value: 'image-clip'},
      {name: 'Image - Clip - Size', value: 'image-clip-size'},
    ])
    // 设置插入图像模式关联元素
    $('#insertImage-mode').enableHiddenMode().relate([
      {case: 'image', targets: [
        $('#insertImage-image'),
      ]},
      {case: 'image-size', targets: [
        $('#insertImage-image'),
        $('#insertImage-width'),
        $('#insertImage-height'),
      ]},
      {case: 'image-clip', targets: [
        $('#insertImage-image'),
        $('#insertImage-clip'),
      ]},
      {case: 'image-clip-size', targets: [
        $('#insertImage-image'),
        $('#insertImage-clip'),
        $('#insertImage-width'),
        $('#insertImage-height'),
      ]},
    ])
  },
  open: function ({mode = 'image', image = '', clip = [0, 0, 64, 64], width = 64, height = 64} = {}) {
    Window.open('insertImage')
    $('#insertImage-mode').write(mode)
    $('#insertImage-image').write(image)
    $('#insertImage-clip').write(clip)
    $('#insertImage-width').write(width)
    $('#insertImage-height').write(height)
  },
  confirm: function (event) {
    const mode = $('#insertImage-mode').read()
    const image = $('#insertImage-image').read()
    if (image === '') return $('#insertImage-image').getFocus()
    let string
    switch (mode) {
      case 'image':
        string = image
        break
      case 'image-size': {
        const width = $('#insertImage-width').read()
        const height = $('#insertImage-height').read()
        string = `${image},${width},${height}`
        break
      }
      case 'image-clip': {
        const clip = $('#insertImage-clip').read()
        string = `${image},${clip[0]},${clip[1]},${clip[2]},${clip[3]}`
        break
      }
      case 'image-clip-size': {
        const clip = $('#insertImage-clip').read()
        const width = $('#insertImage-width').read()
        const height = $('#insertImage-height').read()
        string = `${image},${clip[0]},${clip[1]},${clip[2]},${clip[3]},${width},${height}`
        break
      }
    }
    Selection.wrap({
      prefix: `<image:${string}>`,
      suffix: '',
    })
    Window.close('insertImage')
  }
}

// 本地变量
Selection.localVariable = {
  filter: 'all',
  initialize: function () {
    TextSuggestion.listen($('#localVariable-key'), VariableGetter.createVarListGenerator(this))
  },
  open: function ({key = ''} = {}) {
    Window.open('localVariable')
    $('#localVariable-key').write(key)
    $('#localVariable-key').getFocus('all')
  },
  confirm: function (event) {
    const key = $('#localVariable-key').read()
    if (!key) {
      return $('#localVariable-key').getFocus('all')
    }
    Selection.wrap({
      prefix: `<local:${key}>`,
      suffix: '',
    })
    Window.close('localVariable')
  }
}

// 全局变量
Selection.globalVariable = {
  open: function ({key = ''} = {}) {
    this.proxy.key = key
    this.proxy.element = Selection.target
    Variable.open(this.proxy)
  },
  proxy: {
    key: '',
    filter: '',
    element: null,
    read: function () {
      return this.key
    },
    input: function (key) {
      Selection.wrap({
        prefix: `<global:${key}>`,
        suffix: '',
      })
    },
    getFocus: function () {
      return this.element.getFocus?.()
    }
  }
}

// 动态全局变量
Selection.dynamicGlobalVariable = {
  open: function ({key = ''} = {}) {
    this.proxy.key = key
    this.proxy.element = Selection.target
    Variable.open(this.proxy)
  },
  proxy: {
    key: '',
    filter: '',
    element: null,
    read: function () {
      return this.key
    },
    input: function (key) {
      Selection.wrap({
        prefix: `<global::${key}>`,
        suffix: '',
      })
    },
    getFocus: function () {
      return this.element.getFocus?.()
    }
  }
}

// 本地化文本
Selection.localization = {
  open: function ({key = ''} = {}) {
    this.proxy.key = key
    Selection.saveContext()
    Localization.open(this.proxy)
  },
  proxy: {
    key: '',
    read: function () {
      return this.key
    },
    input: function (key) {
      Selection.wrap({
        prefix: `<ref:${key}>`,
        suffix: '',
      })
    }
  }
}

// ******************************** 缩放窗口 ********************************

const Zoom = {
  // methods
  initialize: null,
  getFactor: null,
  open: null,
  // events
  confirm: null,
}

// 初始化
Zoom.initialize = function () {
  // 侦听事件
  $('#zoom-confirm').on('click', this.confirm)
}

// 打开窗口
Zoom.open = function () {
  Window.open('zoom')
  $('#zoom-factor').write(this.getFactor())
  $('#zoom-factor').getFocus('all')
}

// 获取缩放系数
Zoom.getFactor = function () {
  return require('electron').webFrame.getZoomFactor()
}

// 确定按钮 - 鼠标点击事件
Zoom.confirm = function (event) {
  Window.close('zoom')
  require('electron').webFrame.setZoomFactor(
    Editor.config.zoom = $('#zoom-factor').read()
  )
}

// ******************************** 重命名窗口 ********************************

const Rename = {
  // properties
  callback: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
Rename.initialize = function () {
  // 侦听事件
  $('#rename').on('closed', this.windowClosed)
  $('#rename-confirm').on('click', this.confirm)
}

// 打开窗口
Rename.open = function (name, callback) {
  this.callback = callback
  Window.open('rename')
  $('#rename-name').write(name)
  $('#rename-name').getFocus('all')
}

// 窗口 - 已关闭事件
Rename.windowClosed = function (event) {
  this.callback = null
}.bind(Rename)

// 确定按钮 - 鼠标点击事件
Rename.confirm = function (event) {
  this.callback($('#rename-name').read())
  Window.close('rename')
}.bind(Rename)

// ******************************** 设置键窗口 ********************************

const SetKey = {
  // properties
  callback: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
SetKey.initialize = function () {
  // 侦听事件
  $('#setKey').on('closed', this.windowClosed)
  $('#setKey-confirm').on('click', this.confirm)
}

// 打开窗口
SetKey.open = function (key, callback) {
  this.callback = callback
  Window.open('setKey')
  $('#setKey-key').write(key)
  $('#setKey-key').getFocus('all')
}

// 窗口 - 已关闭事件
SetKey.windowClosed = function (event) {
  this.callback = null
}.bind(SetKey)

// 确定按钮 - 鼠标点击事件
SetKey.confirm = function (event) {
  this.callback($('#setKey-key').read())
  Window.close('setKey')
}.bind(SetKey)

// ******************************** 设置数量窗口 ********************************

const SetQuantity = {
  // properties
  callback: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClosed: null,
  confirm: null,
}

// 初始化
SetQuantity.initialize = function () {
  // 侦听事件
  $('#setQuantity').on('closed', this.windowClosed)
  $('#setQuantity-confirm').on('click', this.confirm)
}

// 打开窗口
SetQuantity.open = function (quantity, maximum, callback) {
  this.callback = callback
  Window.open('setQuantity')
  $('#setQuantity-quantity').input.max = maximum
  $('#setQuantity-quantity').write(quantity)
  $('#setQuantity-quantity').getFocus('all')
}

// 窗口 - 已关闭事件
SetQuantity.windowClosed = function (event) {
  this.callback = null
}.bind(SetQuantity)

// 确定按钮 - 鼠标点击事件
SetQuantity.confirm = function (event) {
  this.callback($('#setQuantity-quantity').read())
  Window.close('setQuantity')
}.bind(SetQuantity)

// ******************************** 指针对象 ********************************
// 使用 #cursor-region 来改变指针样式
// 可以避免更新所有子元素继承到指针属性, 从而提高性能
// 同时解决了一些元素无法继承指针样式的问题

const Cursor = {
  // properties
  region: $('#cursor-region'),
  // methods
  open: null,
  close: null,
}

// 打开指针样式
Cursor.open = function (className) {
  this.region.addClass(className)
}

// 关闭指针样式
Cursor.close = function (className) {
  this.region.removeClass(className)
}

// ******************************** 操作历史类 ********************************

class History extends Array {
  index     //:number
  capacity  //:number
  onSave    //:function
  onRestore //:function

  constructor(capacity) {
    super()
    this.index = -1
    this.capacity = capacity
    this.onSave = null
    this.onRestore = null
  }

  // 重置记录
  reset() {
    if (this.length !== 0) {
      this.length = 0
      this.index = -1
    }
  }

  // 保存数据
  save(data) {
    // 删除多余的栈
    const length = this.index + 1
    if (length < this.length) {
      this.length = length
    }

    // 堆栈上限判断
    if (this.length < this.capacity) {
      this.index++
      this.push(data)
    } else {
      this.shift()
      this.push(data)
    }

    // 回调自定义方法
    this.onSave?.(data)
  }

  // 恢复数据
  restore(operation) {
    const index = (
      operation === 'undo' ? this.index
    : operation === 'redo' ? this.index + 1
    :                        null
    )

    if (index >= 0 && index < this.length) {
      const data = this[index]
      const processors = History.processors
      const processor = processors[data.type]
      if (processor) {
        processor(operation, data)

        // 改变指针
        switch (operation) {
          case 'undo': this.index--; break
          case 'redo': this.index++; break
        }

        // 回调自定义方法
        this.onRestore?.(data)
      }
    }
  }

  // 撤销条件判断
  canUndo() {
    return this !== null && this.index >= 0
  }

  // 重做条件判断
  canRedo() {
    return this !== null && this.index + 1 < this.length
  }

  // 操作历史处理器集合
  static processors = {}
}

// ******************************** 属性列表接口 ********************************

class AttributeListInterface {
  target  //:element
  type    //:string
  history //:object
  editor  //:object
  owner   //:object

  constructor(editor, owner) {
    this.editor = editor ?? null
    this.owner = owner ?? null
  }

  // 初始化
  initialize(list) {
    this.target = null
    this.type = 'object-attribute'
    this.group = list.getAttribute('group')

    // 创建参数历史操作
    const {editor, owner} = this
    if (editor && owner) {
      this.history = new Inspector.ParamHistory(editor, owner, list)
    }
  }

  // 解析项目
  parse(item) {
    if (item instanceof Object) {
      let {key, value} = item
      if (typeof value === 'string') {
        value = Command.parseMultiLineString(value)
      }
      const attr = Attribute.getGroupAttribute(this.group, key)
      let attrName = ''
      let attrClass = ''
      let valueClass = ''
      switch (attr?.type) {
        case 'boolean':
        case 'number':
        case 'string':
          attrName = attr.name
          if (typeof value !== attr.type) {
            valueClass = 'invalid'
          }
          if (typeof value === 'string') {
            value = GameLocal.replace(value)
          }
          break
        case 'enum': {
          attrName = attr.name
          const item = Enum.getGroupString(attr.enum, value)
          if (item) {
            value = item.name
          } else {
            value = Command.parseUnlinkedId(value)
            valueClass = 'invalid'
          }
          break
        }
        case undefined:
          attrName = Command.parseUnlinkedId(key)
          attrClass = 'invalid'
          break
      }
      attrName = GameLocal.replace(attrName)
      return [
        {content: attrName, class: attrClass},
        {content: value, class: valueClass},
      ]
    }
    return item
  }

  // 打开窗口
  open(item = {key: '', value: 0}) {
    Window.open('object-attribute')
    AttributeListInterface.target = this.target
    const isNew = item.key === ''
    if (isNew) {
      // 新建属性数据
      item.key = Attribute.getDefAttributeId(this.group)
      switch (Attribute.getGroupAttribute(this.group, item.key)?.type) {
        case 'boolean': item.value = false; break
        case 'number':  item.value = 0    ; break
        case 'string':  item.value = ''   ; break
        case 'enum':    item.value = ''   ; break
      }
    }
    const key = item.key
    const type = Attribute.getGroupAttribute(this.group, key)?.type ?? typeof item.value
    const booleanValue = type === 'boolean' ? item.value : false
    const numberValue  = type === 'number'  ? item.value : 0
    const stringValue  = type === 'string'  ? item.value : ''
    const enumValue    = type === 'enum'    ? item.value : ''
    const keyBox = $('#object-attribute-key')
    keyBox.loadItems(Attribute.getAttributeItems(this.group, 'boolean number string'))
    const invalid = !Attribute.getGroupAttribute(this.group, key)
    if (invalid) AttributeListInterface.typeBox.write(type)
    const write = getElementWriter('object-attribute')
    write('key', key)
    write('boolean-value', booleanValue)
    write('number-value', numberValue)
    write('string-value', stringValue)
    if (enumValue) {
      write('enum-value', enumValue)
    }
    if (isNew || invalid) {
      return $('#object-attribute-key').getFocus()
    }
    switch (type) {
      case 'boolean':
        return $('#object-attribute-boolean-value').getFocus()
      case 'number':
        return $('#object-attribute-number-value').getFocus('all')
      case 'string':
        return $('#object-attribute-string-value').getFocus('all')
      case 'enum':
        return $('#object-attribute-enum-value').getFocus()
    }
  }

  // 保存数据
  save() {
    const read = getElementReader('object-attribute')
    const type = AttributeListInterface.typeBox.read()
    const key = read('key')
    if (key === '') {
      return $('#object-attribute-key').getFocus()
    }
    let value
    switch (type) {
      case 'boolean':
        value = read('boolean-value')
        break
      case 'number':
        value = read('number-value')
        break
      case 'string':
        value = read('string-value')
        break
      case 'enum':
        value = read('enum-value')
        if (value === '') {
          return $('#object-attribute-enum-value').getFocus()
        }
        break
    }
    Window.close('object-attribute')
    return {key, value}
  }

  // 静态 - 正在编辑中的数据所在的列表
  static target = null

  // 静态 - 初始化
  static initialize() {
    // 创建类型选项
    this.typeBox.loadItems([
      {name: 'Boolean', value: 'boolean'},
      {name: 'Number', value: 'number'},
      {name: 'String', value: 'string'},
      {name: 'Enum', value: 'enum'},
    ])

    // 设置类型关联元素
    this.typeBox.enableHiddenMode().relate([
      {case: 'boolean', targets: [
        $('#object-attribute-boolean-value'),
      ]},
      {case: 'number', targets: [
        $('#object-attribute-number-value'),
      ]},
      {case: 'string', targets: [
        $('#object-attribute-string-value'),
      ]},
      {case: 'enum', targets: [
        $('#object-attribute-enum-value'),
      ]},
    ])

    // 创建布尔值常量选项
    $('#object-attribute-boolean-value').loadItems([
      {name: 'False', value: false},
      {name: 'True', value: true},
    ])

    // 侦听事件
    $('#object-attribute-key').on('write', this.keyWrite)
    $('#object-attribute-confirm').on('click', event => {
      AttributeListInterface.target.save()
    })
  }

  // 类型选择框(隐藏)
  static typeBox = new SelectBox()

  // 属性键写入事件
  static keyWrite(event) {
    const group = AttributeListInterface.target.getAttribute('group')
    const attr = Attribute.getGroupAttribute(group, event.value)
    if (attr) {
      AttributeListInterface.typeBox.write(attr.type)
      if (attr.type === 'enum') {
        const enumBox = $('#object-attribute-enum-value')
        enumBox.loadItems(Enum.getStringItems(attr.enum))
        enumBox.write(Enum.getDefStringId(attr.enum))
      }
    }
  }
}

// ******************************** 条件列表接口类 ********************************

class ConditionListInterface {
  target  //:element
  type    //:string
  history //:object
  editor  //:object
  owner   //:object

  constructor(editor, owner) {
    this.editor = editor ?? null
    this.owner = owner ?? null
  }

  // 初始化
  initialize(list) {
    this.target = null
    this.type = 'condition'

    // 创建参数历史操作
    const {editor, owner} = this
    if (editor && owner) {
      this.history = new Inspector.ParamHistory(editor, owner, list)
    }
  }

  // 解析变量
  parseVariable(condition) {
    switch (condition.type) {
      case 'global-boolean':
      case 'global-number':
      case 'global-string':
        return Command.parseGlobalVariable(condition.key)
      case 'self-boolean':
      case 'self-number':
      case 'self-string':
        return Local.get('variable.self')
    }
  }

  // 解析项目
  parse(condition) {
    const variable = this.parseVariable(condition)
    switch (condition.type) {
      case 'global-boolean':
      case 'self-boolean': {
        const operator = Command.removeTextTags(IfCondition.parseBooleanOperation(condition))
        const value = condition.value.toString()
        return `${variable} ${operator} ${value}`
      }
      case 'global-number':
      case 'self-number': {
        const operator = Command.removeTextTags(IfCondition.parseNumberOperation(condition))
        const value = condition.value.toString()
        return `${variable} ${operator} ${value}`
      }
      case 'global-string':
      case 'self-string': {
        const operator = Command.removeTextTags(IfCondition.parseStringOperation(condition))
        const value = `"${Command.parseMultiLineString(condition.value)}"`
        return `${variable} ${operator} ${value}`
      }
    }
  }

  // 更新
  update(list) {
    // 更新宿主项目的条件图标
    const item = this.editor?.target
    if (item?.conditions === list.read()) {
      const element = item.element
      const list = element?.parentNode
      if (list instanceof TreeList) {
        list.updateConditionIcon(item)
      }
    }
  }

  // 打开窗口
  open(condition = {
    type: 'global-boolean',
    key: '',
    operation: 'equal',
    value: true,
  }) {
    Window.open('condition')
    ConditionListInterface.target = this.target
    const write = getElementWriter('condition')
    let booleanOperation = 'equal'
    let booleanValue = true
    let numberOperation = 'equal'
    let numberValue = 0
    let stringOperation = 'equal'
    let stringValue = ''
    switch (condition.type) {
      case 'global-boolean':
      case 'self-boolean':
        booleanOperation = condition.operation
        booleanValue = condition.value
        break
      case 'global-number':
      case 'self-number':
        numberOperation = condition.operation
        numberValue = condition.value
        break
      case 'global-string':
      case 'self-string':
        stringOperation = condition.operation
        stringValue = condition.value
        break
    }
    write('type', condition.type)
    write('key', condition.key ?? '')
    write('boolean-operation', booleanOperation)
    write('boolean-value', booleanValue)
    write('number-operation', numberOperation)
    write('number-value', numberValue)
    write('string-operation', stringOperation)
    write('string-value', stringValue)
    $('#condition-type').getFocus()
  }

  // 保存数据
  save() {
    const read = getElementReader('condition')
    const type = read('type')
    const [varScope, varType] = type.split('-')
    let key
    let operation
    let value
    let condition
    // 读取变量键
    switch (varScope) {
      case 'global':
        key = read('key')
        if (key === '') {
          return $('#condition-key').getFocus()
        }
        break
    }
    // 读取操作和变量值
    switch (varType) {
      case 'boolean':
        operation = read('boolean-operation')
        value = read('boolean-value')
        break
      case 'number':
        operation = read('number-operation')
        value = read('number-value')
        break
      case 'string':
        operation = read('string-operation')
        value = read('string-value')
        break
    }
    // 生成条件
    switch (varScope) {
      case 'global':
        condition = {type, key, operation, value}
        break
      case 'self':
        condition = {type, operation, value}
        break
    }
    Window.close('condition')
    return condition
  }

  // 静态 - 正在编辑中的数据所在的列表
  static target = null

  // 静态 - 初始化
  static initialize() {
    // 创建条件类型选项
    $('#condition-type').loadItems([
      {name: 'Global - Boolean', value: 'global-boolean'},
      {name: 'Global - Number', value: 'global-number'},
      {name: 'Global - String', value: 'global-string'},
      {name: 'Self - Boolean', value: 'self-boolean'},
      {name: 'Self - Number', value: 'self-number'},
      {name: 'Self - String', value: 'self-string'},
    ])

    // 设置条件类型关联元素
    $('#condition-type').enableHiddenMode().relate([
      {case: 'global-boolean', targets: [
        $('#condition-key'),
        $('#condition-boolean-operation'),
        $('#condition-boolean-value'),
      ]},
      {case: 'global-number', targets: [
        $('#condition-key'),
        $('#condition-number-operation'),
        $('#condition-number-value'),
      ]},
      {case: 'global-string', targets: [
        $('#condition-key'),
        $('#condition-string-operation'),
        $('#condition-string-value'),
      ]},
      {case: 'self-boolean', targets: [
        $('#condition-boolean-operation'),
        $('#condition-boolean-value'),
      ]},
      {case: 'self-number', targets: [
        $('#condition-number-operation'),
        $('#condition-number-value'),
      ]},
      {case: 'self-string', targets: [
        $('#condition-string-operation'),
        $('#condition-string-value'),
      ]},
    ])

    // 创建布尔值操作选项
    $('#condition-boolean-operation').loadItems([
      {name: '==', value: 'equal'},
      {name: '!=', value: 'unequal'},
    ])

    // 创建布尔值常量选项
    $('#condition-boolean-value').loadItems([
      {name: 'False', value: false},
      {name: 'True', value: true},
    ])

    // 创建数值操作选项
    $('#condition-number-operation').loadItems([
      {name: '==', value: 'equal'},
      {name: '!=', value: 'unequal'},
      {name: '>=', value: 'greater-or-equal'},
      {name: '<=', value: 'less-or-equal'},
      {name: '>', value: 'greater'},
      {name: '<', value: 'less'},
    ])

    // 创建字符串操作选项
    $('#condition-string-operation').loadItems([
      {name: '==', value: 'equal'},
      {name: '!=', value: 'unequal'},
    ])

    // 条件类型写入事件
    $('#condition-type').on('write', event => {
      const type = event.value
      switch (type) {
        case 'global-boolean':
        case 'global-number':
        case 'global-string':
          // 设置全局变量类型过滤器
          $('#condition-key').filter = type.slice(7)
          break
      }
    })

    // 确定按钮 - 鼠标点击事件
    $('#condition-confirm').on('click', event => {
      ConditionListInterface.target.save()
    })
  }
}

// ******************************** 事件列表接口类 ********************************

class EventListInterface {
  target    //:element
  type      //:string
  filter    //:string
  editor    //:object
  owner     //:object
  eventItem //:object

  constructor(editor, owner) {
    this.editor = editor ?? null
    this.owner = owner ?? null
  }

  // 初始化
  initialize(list) {
    list.togglable = true
    this.filter = list.getAttribute('filter')
    this.type = `${this.filter}.event`
    this.editCallback = () => list.save()
    this.insertCallback = () => {
      if (list.inserting) {
        list.save()
        list.inserting = false
      } else {
        list.start--
        list.save()
        list.select(list.start + 1)
      }
    }

    // 创建参数历史操作
    const {editor, owner} = this
    if (editor && owner) {
      this.history = new Inspector.ParamHistory(editor, owner, list)
      this.history.save = EventListInterface.historySave
    }

    // 侦听事件
    window.on('localize', event => {
      if (list.data) list.update()
    })
  }

  // 解析
  parse(event) {
    const {type} = event
    if (EventListInterface.guidRegExp.test(type)) {
      Command.invalid = false
      const groupKey = this.filter + '-event'
      const eventType = Command.parseGroupEnumString(groupKey, type)
      const eventClass = Command.invalid ? 'invalid' : event.enabled ? '' : 'weak'
      return {content: Command.removeTextTags(eventType), class: eventClass}
    }
    return {content: Local.get('eventTypes.' + type), class: event.enabled ? '' : 'weak'}
  }

  // 更新
  update(list) {
    // 更新事件项目的有效性
    const elements = list.elements
    const items = list.read()
    const length = items.length
    if (length !== 0) {
      const flags = {}
      for (let i = length - 1; i >= 0; i--) {
        const {type} = items[i]
        if (flags[type]) {
          elements[i].addClass('weak')
        } else {
          flags[type] = true
        }
      }
    }

    // 更新宿主项目的事件图标
    const item = this.editor?.target
    if (item?.events === list.read()) {
      const element = item.element
      const list = element?.parentNode
      if (list instanceof TreeList) {
        list.updateEventIcon(item)
      }
    }
  }

  // 打开
  open(event) {
    const filter = this.filter
    let callback = this.editCallback
    let inserting = false
    if (event === undefined) {
      event = Inspector.fileEvent.create(filter)
      callback = this.insertCallback
      inserting = true
    }
    const target = this.editor.target
    if (target.guid) {
      // 对象文件
      const id = target.guid
      const fileName = Data.manifest.guidMap[id]?.file.basename
      this.eventItem = EventEditor.openLocalEvent(inserting, filter, fileName, event, callback)
    } else if (target.presetId) {
      // 场景或界面的预设对象
      const id = target.presetId
      const preset = Data.scenePresets[id] ?? Data.uiPresets[id]
      if (preset) {
        const rootId = preset.sceneId ?? preset.uiId
        const rootName = Data.manifest.guidMap[rootId]?.file.basename
        const eventName = `${rootName}.${preset.data.name}`
        this.eventItem = EventEditor.openLocalEvent(inserting, filter, eventName, event, callback)
      }
    }
  }

  // 保存
  save() {
    return EventEditor.save(this.eventItem)
  }

  // 自定义事件类型ID正则表达式
  static guidRegExp = /^[0-9a-f]{16}$/

  // 重写历史操作保存数据方法
  static historySave(data) {
    Inspector.ParamHistory.prototype.save.call(this, data)
    if (data.type === 'inspector-param-replace') {
      delete data.swap.commands.symbol
    }
  }
}

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
    list.togglable = true
    this.target = null
    this.script = null
    this.filter = 'script'
    this.type = 'script'

    // 创建参数历史操作
    const {editor, owner} = this
    if (editor && owner) {
      this.history = new Inspector.ParamHistory(editor, owner, list)
    }

    // 侦听事件
    list.on('pointerdown', ScriptListInterface.listPointerdown)
    list.on('dragenter', ScriptListInterface.listDragenter)
    list.on('dragleave', ScriptListInterface.listDragleave)
    list.on('dragover', ScriptListInterface.listDragover)
    list.on('drop', ScriptListInterface.listDrop)
  }

  // 解析
  parse(script) {
    const box = document.createElement('box')
    box.textContent = '\uf044'
    box.addClass('script-edit-button')
    Command.invalid = false
    const scriptName = Command.parseFileName(script.id)
    const scriptClass = Command.invalid ? 'invalid' : script.enabled ? '' : 'weak'
    return [{content: Command.removeTextTags(scriptName), class: scriptClass}, box]
  }

  // 更新
  update(list) {
    // 更新事件项目的有效性
    const elements = list.elements
    const items = list.read()
    const length = items.length
    if (length !== 0) {
      const flags = {}
      for (let i = length - 1; i >= 0; i--) {
        const {id} = items[i]
        if (flags[id]) {
          elements[i].addClass('weak')
        } else {
          flags[id] = true
        }
      }
    }

    // 更新宿主项目的脚本图标
    const item = this.editor?.target
    if (item?.scripts === list.read()) {
      const element = item.element
      const list = element?.parentNode
      if (list instanceof TreeList) {
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
        // 临时兼容ParamList和TreeList
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

  // 列表 - 拖拽进入事件
  static listDragenter(event) {
    return ScriptListInterface.listDragover.call(this, event)
  }

  // 列表 - 拖拽离开事件
  static listDragleave(event) {
    if (!this.contains(event.relatedTarget)) {
      this.removeClass('dragover')
    }
  }

  // 列表 - 拖拽悬停事件
  static listDragover(event) {
    if (Browser.dragging) {
      const file = Browser.body.activeFile
      if (file instanceof FileItem && file.type === 'script') {
        event.dataTransfer.dropEffect = 'move'
        event.preventDefault()
        this.addClass('dragover')
      }
    }
  }

  // 列表 - 拖拽释放事件
  static listDrop(event) {
    const file = Browser.body.activeFile
    if (file instanceof FileItem) {
      const script = PluginManager.createData()
      script.id = file.meta.guid
      this.object.script = script
      this.inserting = true
      this.focus()
      this.select(Infinity)
      this.save()
      this.removeClass('dragover')
    }
  }
}

// ******************************** 场景预设对象窗口 ********************************

const PresetObject = {
  // properties
  scene: $('#presetObject-sceneId'),
  list: $('#presetObject-list'),
  searcher: $('#presetObject-searcher'),
  target: null,
  nodes: null,
  // methods
  initialize: null,
  open: null,
  buildNodes: null,
  getDefaultPresetId: null,
  // events
  windowClosed: null,
  sceneIdWrite: null,
  listOpen: null,
  searcherKeydown: null,
  searcherInput: null,
  confirm: null,
}

// list methods
PresetObject.list.createIcon = null

// 初始化
PresetObject.initialize = function () {
  // 绑定对象目录列表
  this.list.bind(() => this.nodes)

  // 列表 - 重写创建图标方法
  this.list.createIcon = Scene.list.createIcon

  // 设置列表搜索框按钮
  this.searcher.addCloseButton()

  // 侦听事件
  this.scene.on('write', this.sceneIdWrite)
  this.list.on('open', this.listOpen)
  this.searcher.on('keydown', this.searcherKeydown)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  $('#presetObject').on('closed', this.windowClosed)
  $('#presetObject-confirm').on('click', this.confirm)
}

// 打开窗口
PresetObject.open = function (target) {
  this.target = target
  Window.open('presetObject')

  // 写入数据
  const {scene, list} = this
  const presetId = target.read() || (Scene.target?.presetId ?? '')
  const sceneId = Data.scenePresets[presetId]?.sceneId ?? Scene.meta?.guid ?? ''
  scene.write(sceneId)
  scene.getFocus()
  const item = list.getItemByProperties({presetId})
  if (item) {
    list.select(item)
    list.expandToSelection()
    list.scrollToSelection('middle')
  }
}

// 构造简化的对象节点(避免影响对象数据)
PresetObject.buildNodes = function IIFE() {
  const build = (nodes, className) => {
    const list = []
    for (const node of nodes) {
      if (node.class === 'folder') {
        list.push({
          class: node.class,
          name: node.name,
          expanded: node.expanded,
          children: build(node.children, className),
        })
        continue
      }
      if (className === 'any' || node.class === className) {
        list.push({
          class: node.class,
          name: node.name,
          presetId: node.presetId,
          teamId: node.teamId ?? '',
          color: node.color ?? '',
          red: node.red ?? 0,
          green: node.green ?? 0,
          blue: node.blue ?? 0,
          image: node.image ?? '',
        })
      }
    }
    return list
  }
  return function (nodes, className) {
    return build(nodes, className)
  }
}()

// 获取默认的场景预设对象ID
PresetObject.getDefaultPresetId = function (className = 'any') {
  if (Scene.target && (className === 'any' || Scene.target.class === className)) {
    return Scene.target.presetId
  }
  return ''
}

// 窗口 - 已关闭事件
PresetObject.windowClosed = function (event) {
  PresetObject.target = null
  PresetObject.nodes = null
  PresetObject.searcher.write('')
  PresetObject.list.clear()
}

// 场景ID - 写入事件
PresetObject.sceneIdWrite = function (event) {
  const scene = Data.scenes[event.value]
  const filter = PresetObject.target.filter
  const nodes = scene ? PresetObject.buildNodes(scene.objects, filter) : Array.empty
  PresetObject.nodes = nodes
  PresetObject.list.update()
  if (nodes.length !== 0) {
    PresetObject.list.select(nodes[0])
    PresetObject.list.scrollTop = 0
  } else {
    PresetObject.list.unselect()
  }
}

// 列表 - 打开事件
PresetObject.listOpen = function (event) {
  PresetObject.confirm()
}

// 搜索框 - 键盘按下事件
PresetObject.searcherKeydown = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault()
      PresetObject.list.selectRelative(
        event.code.slice(5).toLowerCase()
      )
      break
    case 'PageUp':
      PresetObject.list.pageUp(true)
      break
    case 'PageDown':
      PresetObject.list.pageDown(true)
      break
  }
}

// 搜索框 - 输入事件
PresetObject.searcherInput = function (event) {
  if (event.inputType === 'insertCompositionText') {
    return
  }
  const text = this.input.value
  const list = PresetObject.list
  list.searchNodes(text)
  const elements = list.elements
  for (let i = 0; i < elements.count; i++) {
    const {item} = elements[i]
    if (item.class !== 'folder') {
      list.select(item)
      break
    }
  }
}

// 确定按钮 - 鼠标点击事件
PresetObject.confirm = function (event) {
  const node = this.list.read()
  const presetId = node?.presetId
  if (!presetId) {
    return this.list.getFocus()
  }
  this.target.input(presetId)
  Window.close('presetObject')
}.bind(PresetObject)

// ******************************** 预设元素窗口 ********************************

const PresetElement = {
  // properties
  ui: $('#presetElement-uiId'),
  list: $('#presetElement-list'),
  searcher: $('#presetElement-searcher'),
  target: null,
  nodes: null,
  // methods
  initialize: null,
  open: null,
  buildNodes: null,
  getDefaultPresetId: null,
  // events
  windowClosed: null,
  uiIdWrite: null,
  listOpen: null,
  searcherKeydown: null,
  searcherInput: null,
  confirm: null,
}

// list methods
PresetElement.list.createIcon = null

// 初始化
PresetElement.initialize = function () {
  // 绑定对象目录列表
  this.list.bind(() => this.nodes)

  // 列表 - 重写创建图标方法
  this.list.createIcon = UI.list.createIcon

  // 侦听事件
  this.ui.on('write', this.uiIdWrite)
  this.list.on('open', this.listOpen)
  this.searcher.on('keydown', this.searcherKeydown)
  this.searcher.on('input', this.searcherInput)
  this.searcher.on('compositionend', this.searcherInput)
  $('#presetElement').on('closed', this.windowClosed)
  $('#presetElement-confirm').on('click', this.confirm)
}

// 打开窗口
PresetElement.open = function (target) {
  this.target = target
  Window.open('presetElement')

  // 写入数据
  const {ui, list} = this
  const presetId = target.read() || (UI.target?.presetId ?? '')
  const uiId = Data.uiPresets[presetId]?.uiId ?? UI.meta?.guid ?? ''
  ui.write(uiId)
  ui.getFocus()
  const item = list.getItemByProperties({presetId})
  if (item) {
    list.select(item)
    list.expandToSelection()
    list.scrollToSelection('middle')
  }
}

// 构造简化的元素节点(避免影响元素数据)
PresetElement.buildNodes = function IIFE() {
  const build = nodes => {
    const length = nodes.length
    const list = new Array(length)
    for (let i = 0; i < length; i++) {
      const node = nodes[i]
      list[i] = {
        class: node.class,
        name: node.name,
        expanded: node.expanded,
        presetId: node.presetId,
        children: build(node.children),
      }
    }
    return list
  }
  return function (nodes) {
    return build(nodes)
  }
}()

// 获取默认的预设元素ID
PresetElement.getDefaultPresetId = function () {
  return UI.target?.presetId ?? ''
}

// 窗口 - 已关闭事件
PresetElement.windowClosed = function (event) {
  PresetElement.target = null
  PresetElement.nodes = null
  PresetElement.list.clear()
}

// 界面ID - 写入事件
PresetElement.uiIdWrite = function (event) {
  const ui = Data.ui[event.value]
  const nodes = ui ? PresetElement.buildNodes(ui.nodes) : Array.empty
  PresetElement.nodes = nodes
  PresetElement.list.update()
  if (nodes.length !== 0) {
    PresetElement.list.select(nodes[0])
    PresetElement.list.scrollTop = 0
  } else {
    PresetElement.list.unselect()
  }
}

// 列表 - 打开事件
PresetElement.listOpen = function (event) {
  PresetElement.confirm()
}

// 搜索框 - 键盘按下事件
PresetElement.searcherKeydown = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault()
      PresetElement.list.selectRelative(
        event.code.slice(5).toLowerCase()
      )
      break
    case 'PageUp':
      PresetElement.list.pageUp(true)
      break
    case 'PageDown':
      PresetElement.list.pageDown(true)
      break
  }
}

// 搜索框 - 输入事件
PresetElement.searcherInput = function (event) {
  if (event.inputType === 'insertCompositionText') {
    return
  }
  const text = this.input.value
  const list = PresetElement.list
  list.searchNodes(text)
  const elements = list.elements
  for (let i = 0; i < elements.count; i++) {
    const {item} = elements[i]
    if (item.class !== 'folder') {
      list.select(item)
      break
    }
  }
}

// 确定按钮 - 鼠标点击事件
PresetElement.confirm = function (event) {
  const uiId = this.ui.read()
  if (!uiId) {
    return this.ui.getFocus()
  }
  const node = this.list.read()
  const presetId = node?.presetId
  if (!presetId) {
    return this.list.getFocus()
  }
  this.target.input(presetId)
  Window.close('presetElement')
}.bind(PresetElement)

// ******************************** 数组窗口 ********************************

const ArrayList = {
  // properties
  list: $('#arrayList-list'),
  target: null,
  changed: false,
  interface: null,
  // methods
  initialize: null,
  open: null,
  // events
  windowClose: null,
  windowClosed: null,
  listChange: null,
  confirm: null,
}

// 初始化
ArrayList.initialize = function () {
  // 绑定数组列表
  this.list.bind(this.interface)

  // 侦听事件
  $('#arrayList').on('close', this.windowClose)
  $('#arrayList').on('closed', this.windowClosed)
  this.list.on('change', this.listChange)
  $('#arrayList-confirm').on('click', this.confirm)
}

// 打开窗口
ArrayList.open = function (target) {
  this.target = target
  const label = target.previousSibling
  const alias = label.textContent
  $('#arrayList').setTitle(alias)
  Window.open('arrayList')

  // 写入数据
  this.list.write(target.read().slice())
  this.list.getFocus()
}

// 窗口 - 关闭事件
ArrayList.windowClose = function (event) {
  if (this.changed) {
    event.preventDefault()
    const get = Local.createGetter('confirmation')
    Window.confirm({
      message: get('closeUnsavedData'),
    }, [{
      label: get('yes'),
      click: () => {
        this.changed = false
        Window.close('arrayList')
      },
    }, {
      label: get('no'),
    }])
  }
}.bind(ArrayList)

// 窗口 - 已关闭事件
ArrayList.windowClosed = function (event) {
  ArrayList.target = null
  ArrayList.list.clear()
}

// 列表 - 改变事件
ArrayList.listChange = function (event) {
  ArrayList.changed = true
}

// 确定按钮 - 鼠标点击事件
ArrayList.confirm = function (event) {
  this.changed = false
  this.target.input(this.list.read())
  Window.close('arrayList')
}.bind(ArrayList)

// 数组列表接口
ArrayList.interface = {
  parsers: {
    number: number => number.toString(),
    string: string => Command.parseMultiLineString(string),
  },
  defaults: {
    number: 0,
    string: '',
  },
  windows: {
    number: 'arrayList-number',
    string: 'arrayList-string',
  },
  inputs: {
    number: $('#arrayList-number-value'),
    string: $('#arrayList-string-value'),
  },
  initialize: function (list) {
    $('#arrayList-number-confirm').on('click', () => list.save())
    $('#arrayList-string-confirm').on('click', () => list.save())
  },
  parse: function (value, data, index) {
    const {filter} = ArrayList.target
    // 创建索引文本
    const indexText = document.createElement('text')
    indexText.addClass('array-index')
    indexText.textContent = Number.padZero(index, data.length, ' ') + ':'

    // 创建值文本
    const valueText = document.createElement('text')
    valueText.addClass('array-value')
    valueText.textContent = this.parsers[filter](value)

    // 返回元素列表
    return [indexText, valueText]
  },
  open: function (value) {
    const {filter} = ArrayList.target
    value = value ?? this.defaults[filter]
    Window.open(this.windows[filter])
    const input = this.inputs[filter]
    input.write(value)
    input.getFocus('all')
  },
  save: function () {
    const {filter} = ArrayList.target
    const value = this.inputs[filter].read()
    Window.close(this.windows[filter])
    return value
  },
}