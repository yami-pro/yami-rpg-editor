'use strict'

import { File } from '../file-system/file.js'
import { FolderItem } from '../file-system/folder-item.js'
import { Window } from '../tools/window.js'
import { Data } from '../data/data.js'

// ******************************** 资源选择器 ********************************

const Selector = $('#selector-browser')
// properties
Selector.target = null
Selector.allowNone = true
// methods
Selector.initialize = null
Selector.open = null
Selector.saveToProject = null
Selector.loadFromProject = null
// events
Selector.windowClosed = null
Selector.windowResize = null
Selector.searcherKeydown = null
Selector.bodyOpen = null
Selector.bodyPopup = null
Selector.confirm = null

// 初始化
Selector.initialize = function () {
  // 侦听事件
  this.body.on('open', this.bodyOpen)
  this.body.on('popup', this.bodyPopup)
  this.head.searcher.on('keydown', this.searcherKeydown)
  $('#selector').on('closed', this.windowClosed)
  $('#selector').on('resize', this.windowResize)
  $('#selector-confirm').on('click', this.confirm)
}

// 打开窗口
Selector.open = function (target, allowNone = true) {
  this.target = target
  this.allowNone = allowNone
  Window.open('selector')

  const {nav, head, body} = this
  const guid = target.read()
  const meta = Data.manifest.guidMap[guid]
  const filter = target.filter
  this.filters = filter ? filter.split('|') : null
  body.computeGridProperties()
  if (meta !== undefined) {
    const path = meta.path
    nav.load(Directory.getFolder(path))
    body.selectByPath(path)
  } else {
    nav.load(Directory.assets)
  }
  head.searcher.getFocus()
}

// 保存状态到项目文件
Selector.saveToProject = function (project) {
  const {selector} = project
  const {viewIndex} = this.body
  selector.view = viewIndex ?? selector.view
}

// 从项目文件中加载状态
Selector.loadFromProject = function (project) {
  const {view} = project.selector
  this.directory = [Directory.assets]
  this.body.setViewIndex(view)
}

// 窗口 - 已关闭事件
Selector.windowClosed = function (event) {
  Selector.target = null
  Selector.restoreDisplay()
  Selector.nav.clear()
  Selector.head.address.clear()
  Selector.body.clear()
}

// 窗口 - 调整大小事件
Selector.windowResize = function (event) {
  Selector.nav.resize()
  Selector.body.computeGridProperties()
  Selector.body.resize()
  Selector.body.updateContentSize()
}

// 搜索框 - 键盘按下事件
Selector.searcherKeydown = function (event) {
  if (event.cmdOrCtrlKey) {
    return
  } else if (event.altKey) {
    return
  } else if (event.shiftKey) {
    return
  } else {
    switch (event.code) {
      case 'Tab':
        Selector.body.selectDefault()
        break
      case 'Enter':
      case 'NumpadEnter':
        if (this.read()) {
          event.stopImmediatePropagation()
          const {body} = Selector
          const {elements} = body
          if (elements.count === 1) {
            const {file} = elements[0]
            if (file instanceof FileItem) {
              body.select(file)
              Selector.confirm(event)
            }
          }
        }
        break
    }
  }
}

// 身体 - 打开事件
Selector.bodyOpen = function (event) {
  return Selector.confirm(event)
}

// 身体 - 菜单弹出事件
Selector.bodyPopup = function (event) {
  const items = []
  const {target} = event.raw
  const get = Local.createGetter('menuFileBrowser')
  if (target.seek('file-body-pane') === this) {
    const {browser, nav} = this.links
    const folders = nav.selections
    if (!(browser.display === 'normal' && folders.length === 1)) {
      return
    }
    items.push({
      label: get('showInExplorer'),
      click: () => {
        File.openPath(
          File.route(folders[0].path)
        )
      },
    })
  } else {
    const element = target.seek('file-body-item', 2)
    if (element.tagName === 'FILE-BODY-ITEM' &&
      element.hasClass('selected')) {
      const {selections} = this
      const {file} = element
      const single = selections.length === 1
      items.push({
        label: get('showInExplorer'),
        click: () => {
          this.showInExplorer()
        },
      }, {
        label: get(file instanceof FolderItem ? 'open' : 'select'),
        accelerator: 'Enter',
        enabled: single,
        click: () => {
          this.openFile(file)
        },
      }, {
        label: get('delete'),
        accelerator: 'Delete',
        enabled: !selections.includes(Directory.assets),
        click: () => {
          this.deleteFiles()
        },
      }, {
        label: get('rename'),
        accelerator: 'F2',
        enabled: single && file !== Directory.assets,
        click: () => {
          this.rename(file)
        },
      }, {
        label: get('export'),
        click: () => {
          this.exportFile()
        },
      })
    }
  }
  if (items.length !== 0) {
    Menu.popup({
      x: event.clientX,
      y: event.clientY,
    }, items)
  }
}

// 确定按钮 - 鼠标点击事件
Selector.confirm = function (event) {
  if (Selector.dragging) {
    return
  }
  const files = Selector.body.selections
  switch (files.length) {
    case 1:
      if (files[0] instanceof FileItem) {
        const file = files[0]
        const meta = file.meta
        if (meta !== undefined) {
          Selector.target.input(meta.guid)
          Window.close('selector')
        }
      }
      break
    case 0:
      if (Selector.allowNone) {
        Selector.target.input('')
        Window.close('selector')
      }
      break
  }
}

export { Selector }
