'use strict'

import { Deployment } from './deployment.js'
import { Timer } from '../util/timer.js'
import { FS, FSP } from '../file-system/file-system.js'
import { File } from '../file-system/file.js'
import { Path } from '../file-system/path.js'
import { Log } from '../log/log.js'
import { Window } from '../tools/window.js'
import { Data } from '../data/data.js'

// ******************************** 部署项目窗口加载 ********************************

// 初始化
Deployment.initialize = function () {
  // 创建平台选项
  $('#deployment-platform').loadItems([
    {name: 'Windows - Electron', value: 'windows-electron'},
    {name: 'Windows - NWJS', value: 'windows-nwjs'},
    {name: 'Web / Android / iOS', value: 'web'},
  ])

  // 侦听事件
  $('#deployment-folder').on('beforeinput', this.folderBeforeinput, {capture: true})
  $('#deployment-folder').on('input', this.folderInput)
  $('#deployment-location').on('input', this.locationInput)
  $('#deployment-choose').on('click', this.chooseClick)
  $('#deployment-confirm').on('click', this.confirm)
}

// 打开窗口
Deployment.open = function () {
  Window.open('deployment')
  const write = getElementWriter('deployment')
  const dialogs = Editor.config.dialogs
  const location = Path.normalize(dialogs.deploy)
  write('platform', 'windows-electron')
  write('folder', 'Output')
  write('location', location)
  $('#deployment-platform').getFocus()
  this.check()
}

// 检查路径
Deployment.check = function () {
  const folder = $('#deployment-folder').read()
  const location = $('#deployment-location').read()
  if (!folder) {
    if (this.state !== 'unnamed') {
      this.state = 'unnamed'
      $('#deployment-warning').textContent = '名称为空'
      $('#deployment-confirm').disable()
    }
  } else if (FS.existsSync(Path.resolve(location, folder))) {
    if (this.state !== 'existing') {
      this.state = 'existing'
      $('#deployment-warning').textContent = '项目已存在'
      $('#deployment-confirm').disable()
    }
  } else {
    if (this.state !== 'passed') {
      this.state = 'passed'
      $('#deployment-warning').textContent = ''
      $('#deployment-confirm').enable()
    }
  }
}

// 读取外壳文件列表
Deployment.readShellList = function IIFE() {
  let root
  const options = {withFileTypes: true}
  const read = (path, list) => {
    return FSP.readdir(
      `${root}${path}`,
      options,
    ).then(
      async files => {
        if (path) {
          path += '/'
        }
        const promises = []
        for (const file of files) {
          const newPath = `${path}${file.name}`
          const srcPath = `${root}${newPath}`
          if (file.isDirectory()) {
            list.push({
              folder: true,
              srcPath: srcPath,
              newPath: newPath,
            })
            promises.push(read(
              newPath, list,
            ))
          } else {
            list.push({
              srcPath: srcPath,
              newPath: newPath,
            })
          }
        }
        if (promises.length !== 0) {
          await Promise.all(promises)
        }
        return list
      }
    )
  }
  return function (rootDir) {
    root = rootDir
    return read('', [])
  }
}()

// 读取文件列表
Deployment.readFileList = async function (platform) {
  let fileList
  // 读取外壳文件列表
  switch (platform) {
    case 'windows-electron':
      fileList = await this.readShellList('Templates/electron-win/')
      break
    case 'windows-nwjs': {
      const {window} = Data.config
      fileList = await this.readShellList('Templates/nwjs-win/')
      fileList.push({
        path: 'package.json',
        data: {
          name: window.title,
          main: 'index.html',
          window: {
            icon: 'Icon/icon.png',
            title: window.title,
            width: window.width,
            height: window.height,
            position: 'center',
            fullscreen: window.display === 'fullscreen'
          }
        }
      })
      break
    }
    case 'web':
      fileList = []
      break
  }
  // 添加文件夹列表
  fileList.push({
    folder: true,
    path: 'Assets',
  }, {
    folder: true,
    path: 'Icon',
  }, {
    folder: true,
    path: 'Data',
  }, {
    folder: true,
    path: 'Script',
  })
  // 打包初始化加载的数据
  const manifest = {
    deployed: true,
    actors: Data.actors,
    skills: {},
    items: {},
    equipments: {},
    triggers: Data.triggers,
    states: Data.states,
    events: Data.events,
    tilesets: Data.tilesets,
    ui: Data.ui,
    animations: Data.animations,
    particles: Data.particles,
    scenes: [],
    images: [],
    audio: [],
    videos: [],
    fonts: [],
    script: [],
    others: [],
  }
  // 获取技能|物品|装备的文件名(用来游戏中排序)
  const guidAndExt = /\.[0-9a-f]{16}\.\S+$/
  for (const key of ['skills', 'items', 'equipments']) {
    const dataGroup = Data[key]
    const manifestGroup = manifest[key]
    for (const {guid, path} of Data.manifest[key]) {
      const data = dataGroup[guid]
      if (data !== undefined) {
        manifestGroup[guid] = {...data,
          filename: Path.basename(path).replace(guidAndExt, ''),
        }
      }
    }
  }
  // 添加数据文件列表
  fileList.push({
    data: manifest,
    path: 'manifest.json',
  }, {
    data: Data.config,
    path: 'Data/config.json',
  }, {
    data: Data.easings,
    path: 'Data/easings.json',
  }, {
    data: Data.teams,
    path: 'Data/teams.json',
  }, {
    data: Data.autotiles,
    path: 'Data/autotiles.json',
  }, {
    data: Data.variables,
    path: 'Data/variables.json',
  }, {
    data: Data.attribute,
    path: 'Data/attribute.json',
  }, {
    data: Data.enumeration,
    path: 'Data/enumeration.json',
  }, {
    data: Data.plugins,
    path: 'Data/plugins.json',
  }, {
    data: Data.commands,
    path: 'Data/commands.json',
  })
  // 添加基础文件列表
  fileList.push(
    {path: 'index.html'},
    {path: 'Icon/icon.png'},
    {path: 'Script/util.js'},
    {path: 'Script/file.js'},
    {path: 'Script/codec.js'},
    {path: 'Script/webgl.js'},
    {path: 'Script/audio.js'},
    {path: 'Script/printer.js'},
    {path: 'Script/variable.js'},
    {path: 'Script/animation.js'},
    {path: 'Script/data.js'},
    {path: 'Script/stage.js'},
    {path: 'Script/camera.js'},
    {path: 'Script/scene.js'},
    {path: 'Script/actor.js'},
    {path: 'Script/trigger.js'},
    {path: 'Script/filter.js'},
    {path: 'Script/controller.js'},
    {path: 'Script/ui.js'},
    {path: 'Script/time.js'},
    {path: 'Script/event.js'},
    {path: 'Script/command.js'},
    {path: 'Script/main.js'},
  )
  // 重定向场景文件列表
  for (const {guid, path} of Data.manifest.scenes) {
    const newPath = `Assets/${guid}.json`
    manifest.scenes.push({
      path: newPath,
    })
    fileList.push({
      srcPath: File.route(path),
      newPath: newPath,
    })
  }
  // 重定向脚本文件列表
  const tsExtname = /\.ts$/
  const tsOutDir = Data.config.script.outDir.replace(/\/$/, '')
  for (let {guid, path, parameters} of Data.manifest.script) {
    // 重新映射TS脚本到输出目录的JS脚本
    if (tsExtname.test(path)) {
      path = path
      .replace('Assets', tsOutDir)
      .replace(tsExtname, '.js')
    }
    const newPath = `Assets/${guid}.js`
    manifest.script.push({
      path: newPath,
      parameters: parameters,
    })
    fileList.push({
      srcPath: File.route(path),
      newPath: newPath,
    })
  }
  // 重定向其他文件列表
  for (const key of [
    'images',
    'audio',
    'videos',
    'fonts',
    'others',
  ]) {
    const sMetaList = Data.manifest[key]
    const dMetaList = manifest[key]
    for (const {guid, path} of sMetaList) {
      const extname = Path.extname(path)
      const newPath = `Assets/${guid}${extname}`
      dMetaList.push({
        path: newPath,
      })
      fileList.push({
        srcPath: File.route(path),
        newPath: newPath,
      })
    }
  }
  return fileList
}

// 复制文件到指定目录
Deployment.copyFilesTo = function (dirPath) {
  Window.open('copyProgress')
  const platform = $('#deployment-platform').read()
  const progressBar = $('#copyProgress-bar')
  const progressInfo = $('#copyProgress-info')
  progressBar.style.width = '0'
  progressInfo.textContent = ''
  return this.readFileList(platform).then(list => {
    let total = 0
    let count = 0
    let info = ''
    const dPath = `${dirPath}/`
    const promises = []
    const length = list.length
    for (let i = 0; i < length; i++) {
      const item = list[i]
      const srcPath = item.srcPath ?? File.route(item.path)
      const newPath = item.newPath ?? item.path
      const dstPath = dPath + newPath
      switch (item.folder) {
        case true:
          // 创建文件夹(同步)
          FS.mkdirSync(dstPath)
          continue
        default:
          if (item.data) {
            // 写入数据到文件
            const json = JSON.stringify(item.data)
            promises.push(FSP.writeFile(
              dstPath,
              json,
            ).then(() => {
              count++
              info = newPath
            }))
          } else {
            // 复制文件
            promises.push(FSP.copyFile(
              srcPath,
              dstPath,
            ).then(() => {
              count++
              info = newPath
            }))
          }
          total++
          continue
      }
    }
    this.timer = new Timer({
      duration: Infinity,
      update: timer => {
        const percent = Math.round(count / total * 100)
        progressBar.style.width = `${percent}%`
        progressInfo.textContent = info
      }
    }).add()
    return Promise.all(promises)
  })
}

// 文件夹输入框 - 输入前事件
Deployment.folderBeforeinput = function (event) {
  if (event.inputType === 'insertText' &&
    typeof event.data === 'string') {
    const regexp = /[\\/:*?"<>|"]/
    if (regexp.test(event.data)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
}

// 文件夹输入框 - 输入事件
Deployment.folderInput = function (event) {
  const regexp = /[\\/:*?"<>|"]/g
  const oldName = this.read()
  const newName = oldName.replace(regexp, '')
  if (oldName !== newName) {
    this.write(newName)
  }
  Deployment.check()
}

// 位置输入框 - 输入事件
Deployment.locationInput = function (event) {
  Deployment.check()
}

// 选择按钮 - 鼠标点击事件
Deployment.chooseClick = function (event) {
  const input = $('#deployment-location')
  File.showOpenDialog({
    defaultPath: input.read(),
    properties: ['openDirectory'],
  }).then(({filePaths}) => {
    if (filePaths.length === 1) {
      input.write(filePaths[0])
      Deployment.check()
    }
  })
}

// 确定按钮 - 鼠标点击事件
Deployment.confirm = function (event) {
  const location = $('#deployment-location').read()
  const folder = $('#deployment-folder').read()
  const path = Path.resolve(location, folder)
  Window.close('deployment')
  return FSP.mkdir(path, {recursive: true}).then(done => {
    return Deployment.copyFilesTo(path)
  }).finally(() => {
    Window.close('copyProgress')
    if (Deployment.timer) {
      Deployment.timer.remove()
      Deployment.timer = null
    }
  }).then(() => {
    Editor.config.dialogs.deploy =
    Path.slash(Path.resolve(location))
  }).catch(error => {
    Log.throw(error)
    Window.confirm({
      message: 'Failed to deploy project:\n' + error.message,
    }, [{
      label: 'Confirm',
    }])
  })
}
