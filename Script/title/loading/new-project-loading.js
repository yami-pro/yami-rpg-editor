'use strict'

import { NewProject } from '../new-project.js'

import { Timer } from '../../util/timer.js'
import { FS, FSP } from '../../file-system/file-system.js'
import { File } from '../../file-system/file.js'
import { Path } from '../../file-system/path.js'
import { Window } from '../../tools/window.js'

// ******************************** 新建项目窗口加载 ********************************

// 初始化
NewProject.initialize = function () {
  // 侦听事件
  $('#newProject-folder').on('beforeinput', this.folderBeforeinput, {capture: true})
  $('#newProject-folder').on('input', this.folderInput)
  $('#newProject-location').on('input', this.locationInput)
  $('#newProject-choose').on('click', this.chooseClick)
  $('#newProject-confirm').on('click', this.confirm)
}

// 打开窗口
NewProject.open = function () {
  Window.open('newProject')
  const write = getElementWriter('newProject')
  const dialogs = Editor.config.dialogs
  const location = Path.normalize(dialogs.new)
  const folder = this.getNewFolder(location)
  write('folder', folder)
  write('location', location)
  $('#newProject-folder').getFocus('all')
  this.check()
}

// 检查路径
NewProject.check = function () {
  const folder = $('#newProject-folder').read()
  const location = $('#newProject-location').read()
  if (!folder) {
    if (this.state !== 'unnamed') {
      this.state = 'unnamed'
      $('#newProject-warning').textContent = '名称为空'
      $('#newProject-confirm').disable()
    }
  } else if (FS.existsSync(Path.resolve(location, folder))) {
    if (this.state !== 'existing') {
      this.state = 'existing'
      $('#newProject-warning').textContent = '项目已存在'
      $('#newProject-confirm').disable()
    }
  } else {
    if (this.state !== 'passed') {
      this.state = 'passed'
      $('#newProject-warning').textContent = ''
      $('#newProject-confirm').enable()
    }
  }
}

// 读取文件列表
NewProject.readFileList = function IIFE() {
  const options = {withFileTypes: true}
  const read = (path, list) => {
    return FSP.readdir(
      `Templates/project/${path}`,
      options,
    ).then(
      async files => {
        if (path) {
          path += '/'
        }
        const promises = []
        for (const file of files) {
          const newPath = `${path}${file.name}`
          if (file.isDirectory()) {
            list.push({
              folder: true,
              path: newPath,
            })
            promises.push(read(
              newPath, list,
            ))
          } else {
            list.push({
              path: newPath,
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
  return function () {
    return read('', [])
  }
}()

// 复制文件到指定目录
NewProject.copyFilesTo = function (dirPath) {
  Window.open('copyProgress')
  const progressBar = $('#copyProgress-bar')
  const progressInfo = $('#copyProgress-info')
  progressBar.style.width = '0'
  progressInfo.textContent = ''
  return this.readFileList().then(list => {
    let total = 0
    let count = 0
    let info = ''
    const sPath = 'Templates/project/'
    const dPath = `${dirPath}/`
    const promises = []
    const length = list.length
    for (let i = 0; i < length; i++) {
      const item = list[i]
      const path = item.path
      switch (item.folder) {
        case true:
          // 创建文件夹(同步)
          FS.mkdirSync(dPath + path)
          continue
        default:
          // 复制文件
          promises.push(FSP.copyFile(
            sPath + path,
            dPath + path,
          ).then(() => {
            count++
            info = path
          }))
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

// 写入数据
NewProject.writeData = function (dirPath) {
  const path = `${dirPath}/data/config.json`
  return FSP.readFile(path, 'utf8').then(data => {
    const config = JSON.parse(data)
    config.gameId = GUID.generate64bit()
    const json = JSON.stringify(config, null, 2)
    return FSP.writeFile(path, json)
  })
}

// 获取新的文件夹名称
NewProject.getNewFolder = function (location) {
  for (let i = 1; true; i++) {
    const folder = `Project${i}`
    if (!FS.existsSync(Path.resolve(location, folder))) {
      return folder
    }
  }
}

// 文件夹输入框 - 输入前事件
NewProject.folderBeforeinput = function (event) {
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
NewProject.folderInput = function (event) {
  const regexp = /[\\/:*?"<>|"]/g
  const oldName = this.read()
  const newName = oldName.replace(regexp, '')
  if (oldName !== newName) {
    this.write(newName)
  }
  NewProject.check()
}

// 位置输入框 - 输入事件
NewProject.locationInput = function (event) {
  NewProject.check()
}

// 选择按钮 - 鼠标点击事件
NewProject.chooseClick = function (event) {
  const input = $('#newProject-location')
  File.showOpenDialog({
    defaultPath: input.read(),
    properties: ['openDirectory'],
  }).then(({filePaths}) => {
    if (filePaths.length === 1) {
      input.write(filePaths[0])
      NewProject.check()
    }
  })
}

// 确定按钮 - 鼠标点击事件
NewProject.confirm = function (event) {
  const location = $('#newProject-location').read()
  const folder = $('#newProject-folder').read()
  const path = Path.resolve(location, folder)
  Window.close('newProject')
  Editor.close().then(() => {
    return FSP.mkdir(path, {recursive: true})
  }).then(done => {
    return NewProject.copyFilesTo(path)
  }).then(done => {
    return NewProject.writeData(path)
  }).finally(() => {
    Window.close('copyProgress')
    if (NewProject.timer) {
      NewProject.timer.remove()
      NewProject.timer = null
    }
  }).then(() => {
    Editor.open(`${path}/game.yamirpg`)
    Editor.config.dialogs.new =
    Path.slash(Path.resolve(location))
  }).catch(error => {
    Log.throw(error)
    Window.confirm({
      message: 'Failed to create project',
      close: () => {
        Layout.manager.switch('home')
      },
    }, [{
      label: 'Confirm',
    }])
  })
}
