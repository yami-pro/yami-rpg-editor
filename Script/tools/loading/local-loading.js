'use strict'

import { Local } from '../local.js'
import { Path } from '../../file-system/path.js'
import { FSP } from '../../file-system/file-system.js'
import { Editor } from '../../editor/editor.js'
import { Log } from '../../log/log.js'

// ******************************** 本地化对象加载 ********************************

// 初始化
Local.initialize = function () {
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
  const dir = Path.resolve(__dirname, 'locales')
  return FSP.readdir(dir, {withFileTypes: true}).then(files => {
    const regexp = /\.(.+)$/
    for (const file of files) {
      if (file.isDirectory()) {
        continue
      }
      const name = file.name
      const extname = Path.extname(name)
      if (extname !== '.json') {
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
        const path = `Locales/${filename}`
        this.update(await File.get({local: path, type: 'json'}))
        this.active = filename
        this.language = language
        window.dispatchEvent(new Event('localize'))
      } catch (error) {
        Log.throw(new Error('Failed to load language pack'))
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
    this.setFontSize(data.fontSize)
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
  }
}()

// 设置字体大小
Local.setFontSize = function (fontSize) {
  switch (fontSize) {
    case 'large':
      document.documentElement.addClass('font-size-large')
      break
    default:
      document.documentElement.removeClass('font-size-large')
      break
  }
}

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
      element.setTooltip(item.tip)
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

// 创建访问器
Local.createGetter = function (path) {
  const prefix = path + '.'
  return key => this.get(prefix + key)
}

// 获取属性
Local.get = function (key) {
  return this.properties[key] ?? ''
}
