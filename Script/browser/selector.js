'use strict'

// ******************************** 资源选择器 ********************************

const Selector = $('#selector-browser')
// properties
Selector.target = null
Selector.allowNone = true
// methods
Selector.initialize = null
Selector.open = null
Selector.saveToProject = null
Selector.loadFromProject = null
// events
Selector.windowClosed = null
Selector.windowResize = null
Selector.searcherKeydown = null
Selector.bodyOpen = null
Selector.bodyPopup = null
Selector.confirm = null

export { Selector }
