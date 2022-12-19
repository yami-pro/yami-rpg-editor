"use strict"

import {
  Menu,
  SliderBox,
  TextBox,
  FolderItem,
  FileBodyPane,
  FileBrowser,
  FileNavPane
} from "../yami"

// ******************************** 文件头部面板 ********************************

namespace TypeMap {
  export type links = {
    body: FileBodyPane
    browser: FileBrowser
    head: FileHeadPane
    nav: FileNavPane
  }
}

class FileHeadPane extends HTMLElement {
  address: HTMLElement
  searcher: TextBox
  view: HTMLElement
  links: TypeMap.links

  constructor() {
    super()

    // 设置属性
    this.address = document.createElement('file-head-address')
    this.back = document.createElement('item')
    this.back.addClass('upper-level-directory')
    this.back.name = 'back'
    this.back.textContent = '\uf0a8'
    this.searcher = new TextBox()
    this.searcher.addCloseButton()
    this.searcher.addClass('file-head-searcher')
    this.searcher.name = 'search'
    this.view = new SliderBox()
    this.view.addClass('file-head-view')
    this.view.name = 'view'
    this.view.input.max = '4'
    this.view.activeWheel = true
    this.appendChild(this.address)
    this.appendChild(this.back)
    this.appendChild(this.searcher)
    this.appendChild(this.view)

    // 侦听事件
    this.on('pointerdown', this.pointerdown)
    this.address.on('pointerdown', this.addressPointerdown)
    this.back.on('click', this.backButtonClick)
    this.searcher.on('input', this.searcherInput)
    this.searcher.on('compositionend', this.searcherInput)
    this.view.on('focus', this.viewFocus)
    this.view.on('input', this.viewInput)
  }

  // 更新地址
  updateAddress() {
    const {browser, nav, body} = this.links
    const folders = nav.selections
    const address = this.address.clear()
    switch (browser.display) {
      case 'normal':
        if (folders.length === 1) {
          let folder = folders[0]
          const nodes = []
          while (true) {
            const elFolder = document.createElement('file-head-address-folder')
            elFolder.file = folder
            elFolder.textContent = folder.name
            nodes.push(elFolder)
            const {parent} = folder
            if (parent instanceof FolderItem) {
              const elArrow = document.createElement('file-head-address-arrow')
              elArrow.folders = parent.subfolders
              elArrow.target = folder
              nodes.push(elArrow)
              folder = parent
            } else {
              break
            }
          }
          nodes[0].disabled = true
          for (const node of nodes.reverse()) {
            address.appendChild(node)
          }
        } else if (folders.length > 1) {
          const length = folders.length
          for (let i = 0; i < length; i++) {
            const folder = folders[i]
            const elFolder = document.createElement('file-head-address-folder')
            elFolder.file = folder
            elFolder.textContent = folder.name
            address.appendChild(elFolder)
            if (folders[i + 1]) {
              const elLink = document.createElement('file-head-address-link')
              elLink.textContent = '&'
              address.appendChild(elLink)
            }
          }
        }
        break
      case 'search': {
        const elText = document.createElement('file-head-address-text')
        elText.textContent = `${body.elements.count} 个文件`
        address.appendChild(elText)
        break
      }
    }
  }

  // 指针按下事件
  pointerdown(event) {
    if (!(event.target instanceof HTMLInputElement)) {
      event.preventDefault()
      const {content} = this.links.body
      if (document.activeElement !== content) {
        content.focus()
      }
    }
  }

  // 地址栏 - 指针按下事件
  addressPointerdown(event) {
    switch (event.button) {
      case 0: {
        const element = event.target
        if (element.parentNode === this) {
          if (element.hasClass('active')) {
            return
          }
          window.on('pointerup', event => {
            if (event.button === 0 &&
              element === event.target) {
              const head = this.parentNode
              const nav = head.links.nav
              switch (element.tagName) {
                case 'FILE-HEAD-ADDRESS-FOLDER':
                  if (!element.disabled) {
                    nav.load(element.file)
                    nav.scrollToSelection('middle')
                  }
                  break
                case 'FILE-HEAD-ADDRESS-ARROW': {
                  const MAX_MENU_ITEMS = 32
                  const {folders, target} = element
                  const rect = element.rect()
                  const length = Math.min(folders.length, MAX_MENU_ITEMS)
                  const menuItems = new Array(length)
                  const click = function () {
                    nav.load(this.folder)
                    nav.scrollToSelection('middle')
                  }
                  for (let i = 0; i < length; i++) {
                    const folder = folders[i]
                    menuItems[i] = {
                      label: folder.name,
                      checked: folder === target,
                      folder: folder,
                      click: click,
                    }
                  }
                  if (folders.length > MAX_MENU_ITEMS) {
                    menuItems.push({
                      label: '...',
                      enabled: false,
                    })
                  }
                  element.addClass('active')
                  Menu.popup({
                    x: rect.left,
                    y: rect.bottom,
                    close: () => {
                      element.removeClass('active')
                    },
                  }, menuItems)
                  break
                }
              }
            }
          }, {once: true})
        }
        break
      }
    }
  }

  // 返回按钮 - 鼠标点击事件
  backButtonClick(event) {
    const head = this.parentNode
    const {browser} = head.links
    browser.backToParentFolder()
  }

  // 搜索框 - 输入事件
  searcherInput(event) {
    if (event.inputType !== 'insertCompositionText') {
      const head = this.parentNode
      const text = this.input.value
      head.links.browser.searchFiles(text)
    }
  }

  // 视图模式 - 获得焦点事件
  viewFocus(event) {
    const head = this.parentNode
    head.links.body.content.focus()
  }

  // 视图模式 - 输入事件
  viewInput(event) {
    const head = this.parentNode
    head.links.body.setViewIndex(this.read())
  }
}

customElements.define('file-head-pane', FileHeadPane)

interface JSXFileHeadPane { [attributes: string]: any }

// ******************************** 文件头部面板导出 ********************************

export {
  FileHeadPane,
  JSXFileHeadPane
}
