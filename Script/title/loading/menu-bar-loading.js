'use strict'

import { Menubar } from '../menu-bar.js'
import * as Yami from '../../yami.js'

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
    const open = Yami.Editor.state === 'open'
    const get = Yami.Local.createGetter('menuFile')
    Yami.Menu.popup({
      x: rect.left,
      y: rect.bottom,
      close: () => {
        target.removeClass('selected')
      },
    }, [{
      label: get('newProject'),
      accelerator: Yami.ctrl('N'),
      click: () => {
        Yami.Title.newProject()
      },
    }, {
      label: get('openProject'),
      accelerator: Yami.ctrl('O'),
      click: () => {
        Yami.Title.openProject()
      },
    }, {
      label: get('openRecent'),
      enabled: open,
      submenu: this.createRecentItems(),
    }, {
      label: get('saveProject'),
      accelerator: Yami.ctrl('S'),
      enabled: open,
      click: () => {
        Yami.File.save()
      },
    }, {
      label: get('closeProject'),
      enabled: open,
      click: () => {
        Yami.Title.closeProject()
      },
    }, {
      label: get('deployment'),
      enabled: open,
      click: () => {
        Yami.Title.deployment()
      },
    }, {
      type: 'separator',
    }, {
      label: get('exit'),
      click: () => {
        Yami.Title.closeClick()
      },
    }])
  }
}

// 弹出编辑菜单
Menubar.popupEditMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const get = Yami.Local.createGetter('menuEdit')
    const items = {
      cut: {
        label: get('cut'),
        accelerator: Yami.ctrl('X'),
        enabled: false,
        click: null,
      },
      copy: {
        label: get('copy'),
        accelerator: Yami.ctrl('C'),
        enabled: false,
        click: null,
      },
      paste: {
        label: get('paste'),
        accelerator: Yami.ctrl('V'),
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
        accelerator: Yami.ctrl('Z'),
        enabled: false,
        click: null,
      },
      redo: {
        label: get('redo'),
        accelerator: Yami.ctrl('Y'),
        enabled: false,
        click: null,
      },
    }
    // 提前触发检查器输入框的blur事件
    document.activeElement.blur()
    switch (Yami.Layout.manager.index) {
      case 'scene':
        if (Yami.Scene.state === 'open') {
          const selected = Yami.Scene.target instanceof Object
          const pastable = Clipboard.has('yami.scene.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = Yami.Scene.history.canUndo()
          items.redo.enabled = Yami.Scene.history.canRedo()
          items.cut.click = () => {Yami.Scene.copy(); Yami.Scene.delete()}
          items.copy.click = () => {Yami.Scene.copy()}
          items.paste.click = () => {Yami.Scene.paste()}
          items.delete.click = () => {Yami.Scene.delete()}
          items.undo.click = () => {Yami.Scene.undo()}
          items.redo.click = () => {Yami.Scene.redo()}
        }
        break
      case 'ui':
        if (Yami.UI.state === 'open') {
          const selected = Yami.UI.target instanceof Object
          const pastable = Clipboard.has('yami.ui.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = Yami.UI.history.canUndo()
          items.redo.enabled = Yami.UI.history.canRedo()
          items.cut.click = () => {Yami.UI.copy(); Yami.UI.delete()}
          items.copy.click = () => {Yami.UI.copy()}
          items.paste.click = () => {Yami.UI.paste()}
          items.delete.click = () => {Yami.UI.delete()}
          items.undo.click = () => {Yami.UI.undo()}
          items.redo.click = () => {Yami.UI.redo()}
        }
        break
      case 'animation':
        if (Yami.Animation.state === 'open') {
          const selected = Yami.Animation.motion instanceof Object
          const pastable = Clipboard.has('yami.animation.object')
          items.cut.enabled = selected
          items.copy.enabled = selected
          items.paste.enabled = pastable
          items.delete.enabled = selected
          items.undo.enabled = Yami.Animation.history.canUndo()
          items.redo.enabled = Yami.Animation.history.canRedo()
          items.cut.click = () => {Yami.Animation.copy(); Yami.Animation.delete()}
          items.copy.click = () => {Yami.Animation.copy()}
          items.paste.click = () => {Yami.Animation.paste()}
          items.delete.click = () => {Yami.Animation.delete()}
          items.undo.click = () => {Yami.Animation.undo()}
          items.redo.click = () => {Yami.Animation.redo()}
        }
        break
      case 'particle':
        if (Yami.Particle.state === 'open') {
          items.undo.enabled = Yami.Particle.history.canUndo()
          items.redo.enabled = Yami.Particle.history.canRedo()
          items.undo.click = () => {Yami.Particle.undo()}
          items.redo.click = () => {Yami.Particle.redo()}
        }
        break
    }
    Yami.Menu.popup({
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
    const open = Yami.Editor.state === 'open'
    const isFullScreen = Yami.Title.fullscreen
    const isGridOpen = Yami.Scene.showGrid
    const isLightOpen = Yami.Scene.showLight
    const isAnimationOpen = Yami.Scene.showAnimation
    const isDarkTheme = document.documentElement.hasClass('dark')
    const isLightTheme = !isDarkTheme
    const get = Yami.Local.createGetter('menuView')
    Yami.Menu.popup({
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
          Yami.Scene.switchGrid()
        },
      }, {
        label: get('scene.light'),
        checked: isLightOpen,
        click: () => {
          Yami.Scene.switchLight()
        },
      }, {
        label: get('scene.animation'),
        checked: isAnimationOpen,
        click: () => {
          Yami.Scene.switchAnimation()
        },
      }, {
        label: get('scene.background'),
        icon: this.createColorIcon(Yami.Scene.background.hex),
        click: () => {
          Yami.Color.open(Yami.Scene.background)
        },
      }],
    }, {
      label: get('ui'),
      enabled: open,
      submenu: [{
        label: get('ui.background'),
        icon: this.createColorIcon(Yami.UI.background.hex),
        click: () => {
          Yami.Color.open(Yami.UI.background)
        },
      }, {
        label: get('ui.foreground'),
        icon: this.createColorIcon(Yami.UI.foreground.hex),
        click: () => {
          Yami.Color.open(Yami.UI.foreground)
        },
      }],
    }, {
      label: get('animation'),
      enabled: open,
      submenu: [{
        label: get('animation.background'),
        icon: this.createColorIcon(Yami.Animation.background.hex),
        click: () => {
          Yami.Color.open(Yami.Animation.background)
        },
      }],
    }, {
      label: get('particle'),
      enabled: open,
      submenu: [{
        label: get('particle.background'),
        icon: this.createColorIcon(Yami.Particle.background.hex),
        click: () => {
          Yami.Color.open(Yami.Particle.background)
        },
      }],
    }, {
      label: get('layout'),
      enabled: open,
      submenu: [{
        label: get('layout.default'),
        click: () => {
          Yami.Layout.switchLayout(Yami.Layout.default)
        },
      }, {
        label: `${get('layout.zoom')}: ${Yami.Zoom.getFactor()}`,
        click: () => {
          Yami.Zoom.open()
        },
      }],
    }, {
      label: get('theme'),
      submenu: [{
        label: get('theme.light'),
        checked: isLightTheme,
        click: () => {
          Yami.Title.switchTheme('light')
        },
      }, {
        label: get('theme.dark'),
        checked: isDarkTheme,
        click: () => {
          Yami.Title.switchTheme('dark')
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
    const open = Yami.Editor.state === 'open'
    const get = Yami.Local.createGetter('menuWindow')
    Yami.Menu.popup({
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
        Yami.Project.open()
      },
    }, {
      label: get('variable'),
      accelerator: 'F3',
      enabled: open,
      click: () => {
        Yami.Variable.open()
      },
    }, {
      label: get('attribute'),
      accelerator: 'F6',
      enabled: open,
      click: () => {
        Yami.Attribute.open()
      },
    }, {
      label: get('enum'),
      accelerator: 'F7',
      enabled: open,
      click: () => {
        Yami.Enum.open()
      },
    }, {
      label: get('easing'),
      accelerator: 'F8',
      enabled: open,
      click: () => {
        Yami.Easing.open()
      },
    }, {
      label: get('team'),
      enabled: open,
      click: () => {
        Yami.Team.open()
      },
    }, {
      label: get('plugin'),
      accelerator: 'F9',
      enabled: open,
      click: () => {
        Yami.PluginManager.open()
      },
    }, {
      label: get('command'),
      accelerator: 'F10',
      enabled: open,
      click: () => {
        Yami.CustomCommand.open()
      },
    }, {
      label: get('run'),
      accelerator: 'F4',
      enabled: open,
      click: () => {
        Yami.Title.playGame()
      },
    }, {
      label: get('log'),
      enabled: open,
      click: () => {
        Yami.Window.open('log')
      },
    }])
  }
}

// 弹出帮助菜单
Menubar.popupHelpMenu = function (target) {
  if (!target.hasClass('selected')) {
    target.addClass('selected')
    const rect = target.rect()
    const get = Yami.Local.createGetter('menuHelp')
    Yami.Menu.popup({
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
        Yami.Window.open('about')
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
  if (Yami.Editor.state === 'closed') {
    return []
  }
  const {recentTabs} = Yami.Editor.project
  const items = []
  const get = Yami.Local.createGetter('menuFile')
  items.push({
    label: get('openRecent.reopenClosedFile'),
    enabled: !!Yami.Title.getClosedTabMeta(),
    accelerator: Yami.ctrl('Shift+T'),
    click: () => {
      Yami.Title.reopenClosedTab()
    },
  })
  // 添加最近的标签选项
  if (recentTabs.length !== 0) {
    const click = function () {
      Yami.Title.reopenClosedTab(this.meta)
    }
    items.push({type: 'separator'})
    const map = Yami.Data.manifest.guidMap
    for (const guid of recentTabs) {
      const meta = map[guid]
      if (meta !== undefined) {
        items.push({
          label: Yami.File.filterGUID(meta.path),
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
  const get = Yami.Local.createGetter('menuView.language')
  const autoChecked = Yami.Editor.config.language === ''
  const autoLabel = get('auto')
  const items = [{
    label: autoLabel,
    checked: autoChecked,
    click: () => {
      if (!autoChecked) {
        Yami.Local.setLanguage('')
      }
    },
  }]
  Yami.Local.readLanguageList().then(languages => {
    const active = Yami.Local.active
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
            Yami.Local.setLanguage(key)
          }
        },
      })
    }
    items.push({type: 'separator'})
    items.push({
      label: get('showInExplorer'),
      click: () => {
        Yami.File.openPath(Yami.Path.resolve(__dirname, 'locales'))
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
        Yami.Title.newProject()
        break
      case 'KeyO':
        Yami.Title.openProject()
        break
      case 'KeyS':
        Yami.File.save()
        break
      case 'KeyT':
        if (event.shiftKey) {
          Yami.Title.reopenClosedTab()
        }
        break
      case 'KeyW':
        Yami.Title.tabBar.close(Title.tabBar.read())
        break
      case 'KeyZ':
        Yami.Scene.undo()
        Yami.UI.undo()
        Yami.Animation.undo()
        Yami.Particle.undo()
        break
      case 'KeyY':
        Yami.Scene.redo()
        Yami.UI.redo()
        Yami.Animation.redo()
        Yami.Particle.redo()
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
        const elements = Yami.Title.tabBar.childNodes
        const index = parseInt(event.code.slice(-1)) - 1
        if (index < elements.length) {
          Yami.Title.tabBar.select(elements[index].item)
        }
        break
      }
    }
  } else {
    switch (event.code) {
      case 'F1':
        Yami.Project.open()
        break
      case 'F3':
        Yami.Variable.open()
        break
      case 'F6':
        Yami.Attribute.open()
        break
      case 'F7':
        Yami.Enum.open()
        break
      case 'F8':
        Yami.Easing.open()
        break
      case 'F9':
        Yami.PluginManager.open()
        break
      case 'F4':
        Yami.Title.playGame()
        break
      case 'F10':
        Yami.CustomCommand.open()
        break
      case 'KeyF':
        Palette.flipTiles()
        break
      case 'Pause':
        Yami.GL.WEBGL_lose_context.loseContext()
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
