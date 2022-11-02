'use strict'

import { Menubar } from './menu-bar.js'
import { Scene } from '../scene/scene.js'
import { UI } from '../ui/ui.js'
import { Easing } from '../data/easing.js'

// ******************************** 菜单栏对象加载 ********************************

// 初始化
Menubar.initialize = function () {
  // 侦听事件
  window.on('keydown', this.keydown)
  $('#menu').on('pointerdown', this.pointerdown)
  $('#menu').on('pointerup', this.pointerup)
  $('#menu').on('pointerover', this.pointerover)
}

// 开关全屏模式
Menubar.toggleFullScreen = function () {
  require('electron')
  .ipcRenderer
  .send('toggle-full-screen')
}

// 弹出文件菜单
Menubar.popupFileMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const open = Editor.state === 'open'
    const get = Local.createGetter('menuFile')
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('newProject'),
      accelerator: ctrl('N'),
      click: () => {
        Title.newProject()
      },
    }, {
      label: get('openProject'),
      accelerator: ctrl('O'),
      click: () => {
        Title.openProject()
      },
    }, {
      label: get('openRecent'),
      enabled: open,
      submenu: this.createRecentItems(),
    }, {
      label: get('saveProject'),
      accelerator: ctrl('S'),
      enabled: open,
      click: () => {
        File.save()
      },
    }, {
      label: get('closeProject'),
      enabled: open,
      click: () => {
        Title.closeProject()
      },
    }, {
      label: get('deployment'),
      enabled: open,
      click: () => {
        Title.deployment()
      },
    }, {
      type: 'separator',
    }, {
      label: get('exit'),
      click: () => {
        Title.closeClick()
      },
    }])
  }
}

// 弹出编辑菜单
Menubar.popupEditMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const get = Local.createGetter('menuEdit')
    const items = {
      cut: {
        label: get('cut'),
        accelerator: ctrl('X'),
        enabled: false,
        click: null,
      },
      copy: {
        label: get('copy'),
        accelerator: ctrl('C'),
        enabled: false,
        click: null,
      },
      paste: {
        label: get('paste'),
        accelerator: ctrl('V'),
        enabled: false,
        click: null,
      },
      delete: {
        label: get('delete'),
        accelerator: 'Delete',
        enabled: false,
        click: null,
      },
      undo: {
        label: get('undo'),
        accelerator: ctrl('Z'),
        enabled: false,
        click: null,
      },
      redo: {
        label: get('redo'),
        accelerator: ctrl('Y'),
        enabled: false,
        click: null,
      },
    }
    // 提前触发检查器输入框的blur事件
    document.activeElement.blur()
    switch (Layout.manager.index) {
      case 'scene':
        if (Scene.state === 'open') {
          const selected = Scene.target instanceof Object
          const pastable = Clipboard.has('yami.scene.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = Scene.history.canUndo()
          items.redo.enabled = Scene.history.canRedo()
          items.cut.click = () => {Scene.copy(); Scene.delete()}
          items.copy.click = () => {Scene.copy()}
          items.paste.click = () => {Scene.paste()}
          items.delete.click = () => {Scene.delete()}
          items.undo.click = () => {Scene.undo()}
          items.redo.click = () => {Scene.redo()}
        }
        break
      case 'ui':
        if (UI.state === 'open') {
          const selected = UI.target instanceof Object
          const pastable = Clipboard.has('yami.ui.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = UI.history.canUndo()
          items.redo.enabled = UI.history.canRedo()
          items.cut.click = () => {UI.copy(); UI.delete()}
          items.copy.click = () => {UI.copy()}
          items.paste.click = () => {UI.paste()}
          items.delete.click = () => {UI.delete()}
          items.undo.click = () => {UI.undo()}
          items.redo.click = () => {UI.redo()}
        }
        break
      case 'animation':
        if (Animation.state === 'open') {
          const selected = Animation.motion instanceof Object
          const pastable = Clipboard.has('yami.animation.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = Animation.history.canUndo()
          items.redo.enabled = Animation.history.canRedo()
          items.cut.click = () => {Animation.copy(); Animation.delete()}
          items.copy.click = () => {Animation.copy()}
          items.paste.click = () => {Animation.paste()}
          items.delete.click = () => {Animation.delete()}
          items.undo.click = () => {Animation.undo()}
          items.redo.click = () => {Animation.redo()}
        }
        break
      case 'particle':
        if (Particle.state === 'open') {
          items.undo.enabled = Particle.history.canUndo()
          items.redo.enabled = Particle.history.canRedo()
          items.undo.click = () => {Particle.undo()}
          items.redo.click = () => {Particle.redo()}
        }
        break
    }
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [
      items.cut,
      items.copy,
      items.paste,
      items.delete,
      items.undo,
      items.redo,
    ])
  }
}

// 弹出视图菜单
Menubar.popupViewMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const open = Editor.state === 'open'
    const isFullScreen = Title.fullscreen
    const isGridOpen = Scene.showGrid
    const isLightOpen = Scene.showLight
    const isAnimationOpen = Scene.showAnimation
    const isDarkTheme = document.documentElement.hasClass('dark')
    const isLightTheme = !isDarkTheme
    const get = Local.createGetter('menuView')
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('fullscreen'),
      accelerator: 'F11',
      checked: isFullScreen,
      click: () => {
        Menubar.toggleFullScreen()
      },
    }, {
      label: get('scene'),
      enabled: open,
      submenu: [{
        label: get('scene.grid'),
        checked: isGridOpen,
        click: () => {
          Scene.switchGrid()
        },
      }, {
        label: get('scene.light'),
        checked: isLightOpen,
        click: () => {
          Scene.switchLight()
        },
      }, {
        label: get('scene.animation'),
        checked: isAnimationOpen,
        click: () => {
          Scene.switchAnimation()
        },
      }, {
        label: get('scene.background'),
        icon: this.createColorIcon(Scene.background.hex),
        click: () => {
          Color.open(Scene.background)
        },
      }],
    }, {
      label: get('ui'),
      enabled: open,
      submenu: [{
        label: get('ui.background'),
        icon: this.createColorIcon(UI.background.hex),
        click: () => {
          Color.open(UI.background)
        },
      }, {
        label: get('ui.foreground'),
        icon: this.createColorIcon(UI.foreground.hex),
        click: () => {
          Color.open(UI.foreground)
        },
      }],
    }, {
      label: get('animation'),
      enabled: open,
      submenu: [{
        label: get('animation.background'),
        icon: this.createColorIcon(Animation.background.hex),
        click: () => {
          Color.open(Animation.background)
        },
      }],
    }, {
      label: get('particle'),
      enabled: open,
      submenu: [{
        label: get('particle.background'),
        icon: this.createColorIcon(Particle.background.hex),
        click: () => {
          Color.open(Particle.background)
        },
      }],
    }, {
      label: get('layout'),
      enabled: open,
      submenu: [{
        label: get('layout.default'),
        click: () => {
          Layout.switchLayout(Layout.default)
        },
      }, {
        label: `${get('layout.zoom')}: ${Zoom.getFactor()}`,
        click: () => {
          Zoom.open()
        },
      }],
    }, {
      label: get('theme'),
      submenu: [{
        label: get('theme.light'),
        checked: isLightTheme,
        click: () => {
          Title.switchTheme('light')
        },
      }, {
        label: get('theme.dark'),
        checked: isDarkTheme,
        click: () => {
          Title.switchTheme('dark')
        },
      }],
    }, {
      label: get('language'),
      submenu: this.createLanguageItems(),
    }])
  }
}

// 弹出窗口菜单
Menubar.popupWindowMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const open = Editor.state === 'open'
    const get = Local.createGetter('menuWindow')
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('project'),
      accelerator: 'F1',
      enabled: open,
      click: () => {
        Project.open()
      },
    }, {
      label: get('variable'),
      accelerator: 'F3',
      enabled: open,
      click: () => {
        Variable.open()
      },
    }, {
      label: get('attribute'),
      accelerator: 'F6',
      enabled: open,
      click: () => {
        Attribute.open()
      },
    }, {
      label: get('enum'),
      accelerator: 'F7',
      enabled: open,
      click: () => {
        Enum.open()
      },
    }, {
      label: get('easing'),
      accelerator: 'F8',
      enabled: open,
      click: () => {
        Easing.open()
      },
    }, {
      label: get('team'),
      enabled: open,
      click: () => {
        Team.open()
      },
    }, {
      label: get('plugin'),
      accelerator: 'F9',
      enabled: open,
      click: () => {
        PluginManager.open()
      },
    }, {
      label: get('command'),
      accelerator: 'F10',
      enabled: open,
      click: () => {
        CustomCommand.open()
      },
    }, {
      label: get('run'),
      accelerator: 'F4',
      enabled: open,
      click: () => {
        Title.playGame()
      },
    }, {
      label: get('log'),
      enabled: open,
      click: () => {
        Window.open('log')
      },
    }])
  }
}

// 弹出帮助菜单
Menubar.popupHelpMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const get = Local.createGetter('menuHelp')
    Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('document'),
      click: () => {},
    }, {
      label: get('about'),
      click: () => {
        let osversion = ''
        const os = navigator.userAgent.match(/Windows NT [0-9.]+/)
        const bits = navigator.userAgent.match(/(?<!\w)x64|x86(?!\w)/)
        if (os) osversion += os
        if (os && bits) osversion += ' ' + bits
        if (!osversion) osversion = 'unknown'
        Window.open('about')
        $('#editor-version').textContent = '1.0.0'
        $('#electron-version').textContent = process.versions.electron
        $('#chrome-version').textContent = process.versions.chrome
        $('#node-version').textContent = process.versions.node
        $('#v8-version').textContent = process.versions.v8
        $('#os-version').textContent = osversion
      },
    }])
  }
}

// 创建最近的文件项目
Menubar.createRecentItems = function () {
  if (Editor.state === 'closed') {
    return []
  }
  const {recentTabs} = Editor.project
  const items = []
  const get = Local.createGetter('menuFile')
  items.push({
    label: get('openRecent.reopenClosedFile'),
    enabled: !!Title.getClosedTabMeta(),
    accelerator: ctrl('Shift+T'),
    click: () => {
      Title.reopenClosedTab()
    },
  })
  // 添加最近的标签选项
  if (recentTabs.length !== 0) {
    const click = function () {
      Title.reopenClosedTab(this.meta)
    }
    items.push({type: 'separator'})
    const map = Data.manifest.guidMap
    for (const guid of recentTabs) {
      const meta = map[guid]
      if (meta !== undefined) {
        items.push({
          label: File.filterGUID(meta.path),
          meta: meta,
          click: click,
        })
      }
    }
  }
  items.push({type: 'separator'})
  items.push({
    label: get('openRecent.clearItems'),
    enabled: recentTabs.length !== 0,
    click: () => {
      recentTabs.length = 0
    },
  })
  return items
}

// 创建语言项目
Menubar.createLanguageItems = function () {
  const get = Local.createGetter('menuView.language')
  const autoChecked = Editor.config.language === ''
  const autoLabel = get('auto')
  const items = [{
    label: autoLabel,
    checked: autoChecked,
    click: () => {
      if (!autoChecked) {
        Local.setLanguage('')
      }
    },
  }]
  Local.readLanguageList().then(languages => {
    const active = Local.active
    if (languages.length !== 0) {
      items.push({type: 'separator'})
    }
    for (const {key, alias, filename} of languages) {
      let checked = filename === active
      if (checked && autoChecked) {
        checked = false
        items[0].label = `${autoLabel} - ${alias}`
      }
      items.push({
        label: alias,
        checked: checked,
        click: () => {
          if (!checked) {
            Local.setLanguage(key)
          }
        },
      })
    }
    items.push({type: 'separator'})
    items.push({
      label: get('showInExplorer'),
      click: () => {
        File.openPath(Path.resolve(__dirname, 'locales'))
      },
    })
  })
  return items
}

// 创建颜色图标
Menubar.createColorIcon = function (color) {
  const icon = document.createElement('menu-icon')
  const r = parseInt(color.slice(0, 2), 16)
  const g = parseInt(color.slice(2, 4), 16)
  const b = parseInt(color.slice(4, 6), 16)
  const a = parseInt(color.slice(6, 8), 16) / 255
  icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`
  icon.addClass('color-icon')
  if (a === 0) {
    icon.addClass('transparent')
  }
  return icon
}

// 键盘按下事件
Menubar.keydown = function (event) {
  if (event.cmdOrCtrlKey) {
    switch (event.code) {
      case 'KeyN':
        Title.newProject()
        break
      case 'KeyO':
        Title.openProject()
        break
      case 'KeyS':
        File.save()
        break
      case 'KeyT':
        if (event.shiftKey) {
          Title.reopenClosedTab()
        }
        break
      case 'KeyW':
        Title.tabBar.close(Title.tabBar.read())
        break
      case 'KeyZ':
        Scene.undo()
        UI.undo()
        Animation.undo()
        Particle.undo()
        break
      case 'KeyY':
        Scene.redo()
        UI.redo()
        Animation.redo()
        Particle.redo()
        break
    }
  } else if (event.altKey) {
    switch (event.code) {
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9': {
        const elements = Title.tabBar.childNodes
        const index = parseInt(event.code.slice(-1)) - 1
        if (index < elements.length) {
          Title.tabBar.select(elements[index].item)
        }
        break
      }
    }
  } else {
    switch (event.code) {
      case 'F1':
        Project.open()
        break
      case 'F3':
        Variable.open()
        break
      case 'F6':
        Attribute.open()
        break
      case 'F7':
        Enum.open()
        break
      case 'F8':
        Easing.open()
        break
      case 'F9':
        PluginManager.open()
        break
      case 'F4':
        Title.playGame()
        break
      case 'F10':
        CustomCommand.open()
        break
      case 'KeyF':
        Palette.flipTiles()
        break
      case 'Pause':
        GL.WEBGL_lose_context.loseContext()
        break
    }
  }
}

// 指针按下事件
Menubar.pointerdown = function (event) {
  switch (event.button) {
    case 0: case -1: {
      const target = event.target
      if (target.tagName === 'ITEM' &&
        !target.hasClass('selected')) {
        switch (target.getAttribute('value')) {
          case 'file':
            return Menubar.popupFileMenu(target)
          case 'edit':
            return Menubar.popupEditMenu(target)
          case 'view':
            return Menubar.popupViewMenu(target)
          case 'window':
            return Menubar.popupWindowMenu(target)
          case 'help':
            return Menubar.popupHelpMenu(target)
        }
      }
      break
    }
  }
}

// 指针弹起事件
Menubar.pointerup = function (event) {
  switch (event.button) {
    case 0: {
      const target = event.target
      if (target.tagName === 'ITEM' &&
        target.hasClass('selected')) {
        event.stopPropagation()
      }
      break
    }
  }
}

// 指针进入事件
Menubar.pointerover = function (event) {
  const element = event.target
  if (element.tagName === 'ITEM') {
    const parent = element.parentNode
    const selected = parent.querySelector('.selected')
    if (selected !== null && selected !== element) {
      Menubar.pointerdown(event)
    }
  }
}
