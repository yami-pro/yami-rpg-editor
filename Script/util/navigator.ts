"use strict"

// ******************************** Navigator对象 ********************************

// Chromium系的浏览器支持
interface INavigator extends Navigator {
  userAgentData: { platform: string }
}

export { INavigator }
