'use strict'

// ******************************** 项目浏览器 ********************************

const Browser = $('#project-browser')
// properties
Browser.page = $('#project')
Browser.searcher = null
// methods
Browser.initialize = null
Browser.unselect = null
Browser.updateHead = null
Browser.openScript = null
Browser.createFile = null
Browser.saveToProject = null
Browser.loadFromProject = null
// events
Browser.pageResize = null
Browser.bodyOpen = null
Browser.bodySelect = null
Browser.bodyUnselect = null
Browser.bodyPopup = null

// 初始化
Browser.initialize = function () {
  // 获取搜索框并添加按键过滤器
  this.searcher = this.links.head.searcher
  this.searcher.addKeydownFilter()

  // 侦听事件
  this.page.on('resize', this.pageResize)
  this.body.on('open', this.bodyOpen)
  this.body.on('select', this.bodySelect)
  this.body.on('unselect', this.bodyUnselect)
  this.body.on('popup', this.bodyPopup)
}

// 取消选择元数据匹配的项目
Browser.unselect = function (meta) {
  const body = this.body
  const files = body.selections
  if (files.length === 1 &&
    files[0].meta === meta) {
    body.unselect()
  }
}

// 更新头部位置
Browser.updateHead = function () {
  const {page, head} = this
  if (page.hasClass('visible')) {
    // 调整左边位置
    const {nav} = Layout.getGroupOfElement(head)
    const nRect = nav.rect()
    const iRect = nav.lastChild.rect()
    const left = iRect.right - nRect.left
    if (head.left !== left) {
      head.left = left
      head.style.left = `${left}px`
    }
    const bRect = this.body.rect()
    const padding = Math.max(bRect.left - iRect.right, 0)
    if (head.padding !== padding) {
      head.padding = padding
      head.style.paddingLeft = `${padding}px`
    }
  }
}

// 打开脚本文件
Browser.openScript = function (filePath) {
  const {mode, path} = Editor.config.scriptEditor
  switch (mode) {
    case 'by-file-extension':
      File.openPath(File.route(filePath))
      break
    case 'specified-application':
      if (path) {
        const args = [File.route(filePath)]
        require('child_process').spawn(path, args)
      }
      break
  }
}

// 创建文件
Browser.createFile = function (filename, data) {
  let guid
  do {guid = GUID.generate64bit()}
  while (Data.manifest.guidMap[guid])
  const {body} = this
  const [basename, extname] = filename.split('.')
  const fullname = `${basename}.${guid}.${extname}`
  const dirname = body.getDirName()
  const path = `${dirname}/${fullname}`
  const route = File.route(path)
  const json = data instanceof Object ? JSON.stringify(data, null, 2) : data
  Editor.protectPromise(
    FSP.writeFile(route, json).then(() => {
      return Directory.update()
    }).then(changed => {
      if (changed) {
        const folder = Directory.getFolder(dirname)
        if (folder.path === dirname) {
          this.nav.load(folder)
        }
        const file = Directory.getFile(path)
        if (file?.path === path) {
          body.select(file)
          body.rename(file)
        }
      }
      console.log(`写入文件:${path}`)
    }).catch(error => {
      console.warn(error)
    })
  )
}

// 保存状态到项目文件
Browser.saveToProject = function (project) {
  const {browser} = project
  const {viewIndex} = this.body
  const selections = this.nav.getSelections()
  const folders = selections.map(folder => folder.path)
  // 避免写入初始化错误造成的无效数据
  browser.view = viewIndex ?? browser.view
  if (folders.length !== 0) {
    browser.folders = folders
  }
}

// 从项目文件中加载状态
Browser.loadFromProject = function (project) {
  const {view, folders} = project.browser
  const selections = []
  for (const path of folders) {
    selections.append(Directory.getFolder(path))
  }
  if (selections.length === 0) {
    selections.append(Directory.assets)
  }
  this.directory = [Directory.assets]
  this.body.setViewIndex(view)
  this.nav.load(...selections)
}

// 页面 - 调整大小事件
Browser.pageResize = function (event) {
  Browser.updateHead()
  Browser.nav.resize()
  Browser.body.computeGridProperties()
  Browser.body.resize()
  Browser.body.updateContentSize()
}

// 身体 - 打开文件
Browser.bodyOpen = function (event) {
  const file = event.value
  switch (file.type) {
    case 'scene':
    case 'ui':
    case 'animation':
    case 'particle':
      Title.openTab(file)
      break
    case 'event': {
      const item = file.data
      if (item === undefined) return
      EventEditor.open('global', item, () => {
        File.planToSave(file.meta)
        const event = EventEditor.save()
        if (item.type !== event.type) {
          item.type = event.type
          if (Inspector.fileEvent.target === item) {
            Inspector.fileEvent.write({type: item.type})
          }
        }
        item.commands = event.commands
      })
      break
    }
    case 'audio':
      Inspector.fileAudio.play()
      break
    case 'video':
      Inspector.fileVideo.play()
      break
    case 'script':
      Browser.openScript(file.path)
      break
    case 'other':
      File.openPath(File.route(file.path))
      break
  }
}

// 身体 - 选择事件
Browser.bodySelect = function (event) {
  const files = event.value
  if (files.length === 1 &&
    files[0] instanceof FileItem) {
    const file = files[0]
    const meta = file.meta
    const type = file.type
    if (!meta) return
    switch (type) {
      case 'scene':
        break
      case 'ui':
        break
      case 'animation':
        break
      case 'particle':
        break
      case 'tileset':
        Inspector.open('fileTileset', file.data, meta)
        break
      case 'actor':
        Inspector.open('fileActor', file.data, meta)
        break
      case 'skill':
        Inspector.open('fileSkill', file.data, meta)
        break
      case 'trigger':
        Inspector.open('fileTrigger', file.data, meta)
        break
      case 'item':
        Inspector.open('fileItem', file.data, meta)
        break
      case 'equipment':
        Inspector.open('fileEquipment', file.data, meta)
        break
      case 'state':
        Inspector.open('fileState', file.data, meta)
        break
      case 'event':
        Inspector.open('fileEvent', file.data, meta)
        break
      case 'image':
        Inspector.open('fileImage', file, meta)
        break
      case 'audio':
        Inspector.open('fileAudio', file, meta)
        break
      case 'video':
        Inspector.open('fileVideo', file, meta)
        break
      case 'font':
        Inspector.open('fileFont', file, meta)
        break
      case 'script':
        Inspector.open('fileScript', file, meta)
        break
    }
  }
}

// 身体 - 取消选择事件
Browser.bodyUnselect = function (event) {
  if (Inspector.meta !== null) {
    const meta = Inspector.meta
    const files = event.value
    // meta有可能从映射表中删除，因此对比路径
    if (files.length === 1 &&
      files[0].path === meta.path) {
      Inspector.close()
    }
  }
}

// 身体 - 菜单弹出事件
Browser.bodyPopup = function (event) {
  const items = []
  const {target} = event.raw
  const get = Local.createGetter('menuFileBrowser')
  let creatable = false
  if (target.seek('file-body-pane') === this) {
    const {browser, nav} = this.links
    const folders = nav.selections
    if (browser.display === 'normal' && folders.length === 1) {
      creatable = true
      items.push({
        label: get('showInExplorer'),
        click: () => {
          File.openPath(
            File.route(folders[0].path)
          )
        },
      }, {
        label: get('import'),
        click: () => {
          this.importFiles()
        },
      })
    }
  } else {
    const element = target.seek('file-body-item', 2)
    if (element.tagName === 'FILE-BODY-ITEM' &&
      element.hasClass('selected')) {
      const {selections} = this
      const {file} = element
      const single = selections.length === 1
      if (single && selections[0] instanceof FolderItem) {
        creatable = true
      }
      items.push({
        label: get('showInExplorer'),
        click: () => {
          this.showInExplorer()
        },
      }, {
        label: get('open'),
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
      switch (file.type) {
        case 'event':
          items.push({
            label: get('toggle'),
            click: () => {
              const {data} = file
              data.enabled = !data.enabled
              this.updateIcon(file)
              File.planToSave(file.meta)
            },
          })
          break
        case 'script': {
          const {scriptEditor} = Editor.config
          let {mode, path} = scriptEditor
          if (path) path = Path.normalize(path)
          items.push({
            label: get('settings'),
            submenu: [{
              label: get('openByFileExtension'),
              checked: mode === 'by-file-extension',
              click: () => {
                if (mode !== 'by-file-extension') {
                  scriptEditor.mode = 'by-file-extension'
                  scriptEditor.path = ''
                }
              },
            }, {
              label: path ? path : get('specifyTheScriptEditor'),
              checked: mode === 'specified-application',
              click: () => {
                File.showOpenDialog({
                  title: 'Browse for application',
                  defaultPath: path ? path : undefined,
                  filters: [{
                    name: 'Script Editor',
                    extensions: ['exe'],
                  }],
                }).then(({filePaths}) => {
                  if (filePaths.length === 1) {
                    scriptEditor.mode = 'specified-application'
                    scriptEditor.path = Path.slash(filePaths[0])
                  }
                })
              },
            }],
          })
          break
        }
      }
    }
  }
  if (items.length !== 0) {
    if (creatable) {
      items.unshift({
        label: get('create'),
        submenu: [{
          label: get('create.folder'),
          click: () => {
            this.createFolder()
          },
        }, {
          label: get('create.actor'),
          click: () => {
            Browser.createFile('Actor.actor', Inspector.fileActor.create())
          },
        }, {
          label: get('create.skill'),
          click: () => {
            Browser.createFile('Skill.skill', Inspector.fileSkill.create())
          },
        }, {
          label: get('create.trigger'),
          click: () => {
            Browser.createFile('Trigger.trigger', Inspector.fileTrigger.create())
          },
        }, {
          label: get('create.item'),
          click: () => {
            Browser.createFile('Item.item', Inspector.fileItem.create())
          },
        }, {
          label: get('create.equipment'),
          click: () => {
            Browser.createFile('Equipment.equip', Inspector.fileEquipment.create())
          },
        }, {
          label: get('create.state'),
          click: () => {
            Browser.createFile('State.state', Inspector.fileState.create())
          },
        }, {
          label: get('create.event'),
          click: () => {
            Browser.createFile('Event.event', Inspector.fileEvent.create('global'))
          },
        }, {
          label: get('create.script'),
          click: () => {
            const extname = Data.config.script.language === 'javascript' ? 'js' : 'ts'
            Browser.createFile('Script.' + extname, Inspector.fileScript.create())
          },
        }, {
          label: get('create.scene'),
          click: () => {
            Browser.createFile('Scene.scene', Inspector.fileScene.create())
          },
        }, {
          label: get('create.ui'),
          click: () => {
            Browser.createFile('UI.ui', Inspector.fileUI.create())
          },
        }, {
          label: get('create.animation'),
          click: () => {
            Browser.createFile('Animation.anim', Inspector.fileAnimation.create())
          },
        }, {
          label: get('create.particle'),
          click: () => {
            Browser.createFile('Particle.particle', Inspector.fileParticle.create())
          },
        }, {
          label: get('create.normalTileset'),
          click: () => {
            Browser.createFile('Tileset.tile', Inspector.fileTileset.create('normal'))
          },
        }, {
          label: get('create.autoTileset'),
          click: () => {
            Browser.createFile('Tileset.tile', Inspector.fileTileset.create('auto'))
          },
        }],
      })
    }
    Menu.popup({
      x: event.clientX,
      y: event.clientY,
    }, items)
  }
}

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