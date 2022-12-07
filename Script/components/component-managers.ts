'use strict'

import { IHTMLElement } from "../util/element/html-element"
import { ScrollBar } from "./scroll-bar"

// ******************************** 组件管理类 ********************************

interface IScrollBar {
  addScrollbars(element: IHTMLElement): void
}

const ScrollBarManager = <IScrollBar>new Object()

// 添加滚动条
ScrollBarManager.addScrollbars = function (element: IHTMLElement) {
  const hBar = <ScrollBar>document.createElement('scroll-bar')
  const vBar = <ScrollBar>document.createElement('scroll-bar')
  const corner = <ScrollBar>document.createElement('scroll-corner')
  const parent = element.parentNode
  const next = element.nextSibling
  if (parent) {
    if (next) {
      parent.insertBefore(hBar, next)
      parent.insertBefore(vBar, next)
      parent.insertBefore(corner, next)
    } else {
      parent.appendChild(hBar)
      parent.appendChild(vBar)
      parent.appendChild(corner)
    }
  }
  hBar.bind(element, 'horizontal')
  vBar.bind(element, 'vertical')

  // 鼠标滚轮事件
  const wheel = (event: MouseEvent) => {
    element.dispatchEvent(
      new WheelEvent('wheel', event)
    )
  }
  hBar.on('wheel', wheel)
  vBar.on('wheel', wheel)
  corner.on('wheel', wheel)

  // 用户滚动事件
  // 使用自定义的userscroll代替内置的scroll有以下原因:
  // scroll是异步的, 触发时机是在Promise后Animation前
  // 如果在Animation中滚动会推迟到下一帧触发事件
  // userscroll由于手动调用可以避免不需要触发的情况
  const userscroll = new Event('userscroll')

  // 添加方法 - 开始滚动
  element.beginScrolling = function () {
    hBar.addClass('dragging')
    vBar.addClass('dragging')
  }

  // 添加方法 - 结束滚动
  element.endScrolling = function () {
    hBar.removeClass('dragging')
    vBar.removeClass('dragging')
  }

  // 添加方法 - 设置滚动条位置
  element.setScroll = function (left, top) {
    const sl = element.scrollLeft
    const st = element.scrollTop
    element.scroll(left, top)
    if (element.scrollLeft !== sl ||
      element.scrollTop !== st) {
      element.dispatchEvent(userscroll)
    }
  }

  // 添加方法 - 设置滚动条左侧位置
  element.setScrollLeft = function (left) {
    const sl = element.scrollLeft
    element.scrollLeft = left
    if (element.scrollLeft !== sl) {
      element.dispatchEvent(userscroll)
    }
  }

  // 添加方法 - 设置滚动条顶部位置
  element.setScrollTop = function (top) {
    const st = element.scrollTop
    element.scrollTop = top
    if (element.scrollTop !== st) {
      element.dispatchEvent(userscroll)
    }
  }

  // 添加方法 - 更新滚动条
  let withCorner = false
  element.updateScrollbars = function () {
    if (element.clientWidth < element.scrollWidth &&
      element.clientHeight < element.scrollHeight) {
      if (!withCorner) {
        withCorner = true
        hBar.addClass('with-corner')
        vBar.addClass('with-corner')
        corner.addClass('visible')
      }
    } else {
      if (withCorner) {
        withCorner = false
        hBar.removeClass('with-corner')
        vBar.removeClass('with-corner')
        corner.removeClass('visible')
      }
    }
    hBar.updateHorizontalBar()
    vBar.updateVerticalBar()
  }
}

export { ScrollBarManager }
