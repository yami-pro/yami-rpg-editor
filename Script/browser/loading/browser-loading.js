'use strict'

import { Browser } from '../browser.js'
import * as Yami from '../../yami.js'

// ******************************** 项目浏览器加载 ********************************

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
    const {nav} = Yami.Layout.getGroupOfElement(head)
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
  const {mode, path} = Yami.Editor.config.scriptEditor
  switch (mode) {
    case 'by-file-extension':
      Yami.File.openPath(Yami.File.route(filePath))
      break
    case 'specified-application':
      if (path) {
        const args = [Yami.File.route(filePath)]
        require('child_process').spawn(path, args)
      }
      break
  }
}

// 创建文件
Browser.createFile = function (filename, data) {
  let guid
  do {guid = Yami.GUID.generate64bit()}
  while (Yami.Data.manifest.guidMap[guid])
  const {body} = this
  const [basename, extname] = filename.split('.')
  const fullname = `${basename}.${guid}.${extname}`
  const dirname = body.getDirName()
  const path = `${dirname}/${fullname}`
  const route = Yami.File.route(path)
  const json = data instanceof Object ? JSON.stringify(data, null, 2) : data
  Yami.Editor.protectPromise(
    Yami.FSP.writeFile(route, json).then(() => {
      return Yami.Directory.update()
    }).then(changed => {
      if (changed) {
        const folder = Yami.Directory.getFolder(dirname)
        if (folder.path === dirname) {
          this.nav.load(folder)
        }
        const file = Yami.Directory.getFile(path)
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

// 更新左侧栏的可见性
Browser.updateNavVisibility = function () {
  if (this.page.hasClass('visible')) {
    if (Browser.clientWidth >= 500) {
      if (this.removeClass('hide-nav-pane')) {
        this.nav.update()
      }
    } else {
      this.addClass('hide-nav-pane')
    }
  }
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
    selections.append(Yami.Directory.getFolder(path))
  }
  if (selections.length === 0) {
    selections.append(Yami.Directory.assets)
  }
  this.directory = [Yami.Directory.assets]
  this.body.setViewIndex(view)
  this.nav.load(...selections)
}

// 页面 - 调整大小事件
Browser.pageResize = function (event) {
  Browser.updateNavVisibility()
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
      Yami.Title.openTab(file)
      break
    case 'event': {
      const item = file.data
      if (item === undefined) return
      Yami.EventEditor.open('global', item, () => {
        Yami.File.planToSave(file.meta)
        const event = Yami.EventEditor.save()
        if (item.type !== event.type) {
          item.type = event.type
          if (Yami.Inspector.fileEvent.target === item) {
            Yami.Inspector.fileEvent.write({type: item.type})
          }
        }
        item.commands = event.commands
      })
      break
    }
    case 'audio':
      Yami.Inspector.fileAudio.play()
      break
    case 'video':
      Yami.Inspector.fileVideo.play()
      break
    case 'script':
      Browser.openScript(file.path)
      break
    case 'other':
      Yami.File.openPath(Yami.File.route(file.path))
      break
  }
}

// 身体 - 选择事件
Browser.bodySelect = function (event) {
  const files = event.value
  if (files.length === 1 &&
    files[0] instanceof Yami.FileItem) {
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
        Yami.Inspector.open('fileTileset', file.data, meta)
        break
      case 'actor':
        Yami.Inspector.open('fileActor', file.data, meta)
        break
      case 'skill':
        Yami.Inspector.open('fileSkill', file.data, meta)
        break
      case 'trigger':
        Yami.Inspector.open('fileTrigger', file.data, meta)
        break
      case 'item':
        Yami.Inspector.open('fileItem', file.data, meta)
        break
      case 'equipment':
        Yami.Inspector.open('fileEquipment', file.data, meta)
        break
      case 'state':
        Yami.Inspector.open('fileState', file.data, meta)
        break
      case 'event':
        Yami.Inspector.open('fileEvent', file.data, meta)
        break
      case 'image':
        Yami.Inspector.open('fileImage', file, meta)
        break
      case 'audio':
        Yami.Inspector.open('fileAudio', file, meta)
        break
      case 'video':
        Yami.Inspector.open('fileVideo', file, meta)
        break
      case 'font':
        Yami.Inspector.open('fileFont', file, meta)
        break
      case 'script':
        Yami.Inspector.open('fileScript', file, meta)
        break
    }
  }
}

// 身体 - 取消选择事件
Browser.bodyUnselect = function (event) {
  if (Yami.Inspector.meta !== null) {
    const meta = Yami.Inspector.meta
    const files = event.value
    // meta有可能从映射表中删除，因此对比路径
    if (files.length === 1 &&
      files[0].path === meta.path) {
      Yami.Inspector.close()
    }
  }
}

// 身体 - 菜单弹出事件
Browser.bodyPopup = function (event) {
  const items = []
  const {target} = event.raw
  const get = Yami.Local.createGetter('menuFileBrowser')
  let creatable = false
  if (target.seek('file-body-pane') === this) {
    const {browser, nav} = this.links
    const folders = nav.selections
    if (browser.display === 'normal' && folders.length === 1) {
      creatable = true
      items.push({
        label: get('showInExplorer'),
        click: () => {
          Yami.File.openPath(
            Yami.File.route(folders[0].path)
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
      if (single && selections[0] instanceof Yami.FolderItem) {
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
        enabled: !selections.includes(Yami.Directory.assets),
        click: () => {
          this.deleteFiles()
        },
      }, {
        label: get('rename'),
        accelerator: 'F2',
        enabled: single && file !== Yami.Directory.assets,
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
              Yami.File.planToSave(file.meta)
            },
          })
          break
        case 'script': {
          const {scriptEditor} = Yami.Editor.config
          let {mode, path} = scriptEditor
          if (path) path = Yami.Path.normalize(path)
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
                Yami.File.showOpenDialog({
                  title: 'Browse for application',
                  defaultPath: path ? path : undefined,
                  filters: [{
                    name: 'Script Editor',
                    extensions: ['exe'],
                  }],
                }).then(({filePaths}) => {
                  if (filePaths.length === 1) {
                    scriptEditor.mode = 'specified-application'
                    scriptEditor.path = Yami.Path.slash(filePaths[0])
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
            Browser.createFile('Actor.actor', Yami.Inspector.fileActor.create())
          },
        }, {
          label: get('create.skill'),
          click: () => {
            Browser.createFile('Skill.skill', Yami.Inspector.fileSkill.create())
          },
        }, {
          label: get('create.trigger'),
          click: () => {
            Browser.createFile('Trigger.trigger', Yami.Inspector.fileTrigger.create())
          },
        }, {
          label: get('create.item'),
          click: () => {
            Browser.createFile('Item.item', Yami.Inspector.fileItem.create())
          },
        }, {
          label: get('create.equipment'),
          click: () => {
            Browser.createFile('Equipment.equip', Yami.Inspector.fileEquipment.create())
          },
        }, {
          label: get('create.state'),
          click: () => {
            Browser.createFile('State.state', Yami.Inspector.fileState.create())
          },
        }, {
          label: get('create.event'),
          click: () => {
            Browser.createFile('Event.event', Yami.Inspector.fileEvent.create('global'))
          },
        }, {
          label: get('create.script'),
          click: () => {
            const extname = Yami.Data.config.script.language === 'javascript' ? 'js' : 'ts'
            Browser.createFile('Script.' + extname, Yami.Inspector.fileScript.create())
          },
        }, {
          label: get('create.scene'),
          click: () => {
            Browser.createFile('Scene.scene', Yami.Inspector.fileScene.create())
          },
        }, {
          label: get('create.ui'),
          click: () => {
            Browser.createFile('UI.ui', Yami.Inspector.fileUI.create())
          },
        }, {
          label: get('create.animation'),
          click: () => {
            Browser.createFile('Animation.anim', Yami.Inspector.fileAnimation.create())
          },
        }, {
          label: get('create.particle'),
          click: () => {
            Browser.createFile('Particle.particle', Yami.Inspector.fileParticle.create())
          },
        }, {
          label: get('create.normalTileset'),
          click: () => {
            Browser.createFile('Tileset.tile', Yami.Inspector.fileTileset.create('normal'))
          },
        }, {
          label: get('create.autoTileset'),
          click: () => {
            Browser.createFile('Tileset.tile', Yami.Inspector.fileTileset.create('auto'))
          },
        }],
      })
    }
    Yami.Menu.popup({
      x: event.clientX,
      y: event.clientY,
    }, items)
  }
}
