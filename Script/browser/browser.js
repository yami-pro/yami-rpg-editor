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
Browser.updateNavVisibility = null
Browser.saveToProject = null
Browser.loadFromProject = null
// events
Browser.pageResize = null
Browser.bodyOpen = null
Browser.bodySelect = null
Browser.bodyUnselect = null
Browser.bodyPopup = null

export { Browser }
