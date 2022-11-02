'use strict'

// ******************************** 事件编辑器 ********************************

const EventEditor = {
  // properties
  list: $('#event-commands'),
  outerGutter: $('#event-commands-gutter-outer'),
  innerGutter: $('#event-commands-gutter-inner'),
  caches: [],
  types: null,
  inserting: false,
  changed: false,
  callback: null,
  // methods
  initialize: null,
  open: null,
  save: null,
  resizeGutter: null,
  updateGutter: null,
  appendCommandsToCaches: null,
  clearCommandBuffers: null,
  // events
  windowLocalize: null,
  windowClose: null,
  windowClosed: null,
  windowResize: null,
  dataChange: null,
  listUpdate: null,
  listScroll: null,
  confirm: null,
  apply: null,
}

export { EventEditor }
