'use strict'

import * as Yami from '../yami.js'

// ******************************** 读取配置文件 ********************************

if (window.process) {
  // 提前读取配置文件以减少等待时间
  // promise.then的执行顺序在main.js之后
  const path = require('path').resolve(__dirname, 'config.json')
  window.config = require('fs').promises.readFile(path, 'utf8')
  .then(json => JSON.parse(json))
  .catch(error => {
    // 如果不存在配置文件或加载出错
    return Yami.File.get({
      local: 'default.json',
      type: 'json',
    }).then(config => {
      // 设置默认配置属性
      config.theme = 'dark'
      config.language = ''
      config.project = ''
      config.recent = []
      config.scriptEditor = {
        mode: 'by-file-extension',
        path: '',
      }
      return require('electron').ipcRenderer
      .invoke('get-documents-path')
      .catch(error => 'C:')
      .then(path => {
        const dirname = `${path}/Games`
        for (const key of Object.keys(config.dialogs)) {
          config.dialogs[key] = Yami.Path.slash(dirname)
        }
        return config
      })
    })
  })
}
