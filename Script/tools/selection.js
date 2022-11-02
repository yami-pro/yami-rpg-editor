'use strict'

// ******************************** 选取文本 ********************************

const Selection = {
  // properties
  target: null,
  inserting: null,
  regexps: {
    local: /<local:(.*?)>/,
    global: /<global:([0-9a-f]{16})?>/
  },
  // methods
  initialize: null,
  match: null,
  insert: null,
  edit: null,
  wrap: null,
  // events
  inputKeydown: null,
  inputKeyup: null,
  inputPointerdown: null,
  inputPointerup: null,
  // objects
  color: null,
  font: null,
  italic: null,
  bold: null,
  fontSize: null,
  textPosition: null,
  textEffect: null,
}

export { Selection }
