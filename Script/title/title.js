'use strict'

// ******************************** 标题栏对象 ********************************

const Title = {
  // properties
  target: $('#title'),
  tabBar: $('#title-tabBar'),
  theme: null,
  maximized: false,
  fullscreen: false,
  // methods
  initialize: null,
  newProject: null,
  openProject: null,
  closeProject: null,
  deployment: null,
  addRecentTab: null,
  getClosedTabMeta: null,
  openTab: null,
  reopenClosedTab: null,
  askWhetherToSave: null,
  updateTitleName: null,
  updateBodyClass: null,
  updateAppRegion: null,
  switchTheme: null,
  dispatchThemechangeEvent: null,
  playGame: null,
  saveToConfig: null,
  loadFromConfig: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  windowClose: null,
  windowMaximize: null,
  windowUnmaximize: null,
  windowEnterFullScreen: null,
  windowLeaveFullScreen: null,
  windowDrop: null,
  windowDirchange: null,
  windowLocalize: null,
  pointerenter: null,
  pointermove: null,
  tabBarPointerdown: null,
  tabBarSelect: null,
  tabBarClosed: null,
  tabBarPopup: null,
  playClick: null,
  minimizeClick: null,
  maximizeClick: null,
  closeClick: null,
}

export { Title }
