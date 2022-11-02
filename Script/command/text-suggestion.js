'use strict'

// ******************************** 文本提示框 ********************************

const TextSuggestion = {
  // properties
  list: $('#text-suggestions'),
  inserting: false,
  target: null,
  data: null,
  // methods
  initialize: null,
  listen: null,
  open: null,
  close: null,
  select: null,
  getRawData: null,
  createData: null,
  // events
  textBoxFocus: null,
  textBoxBlur: null,
  textBoxKeydown: null,
  textBoxInput: null,
  listPointerdown: null,
  listUpdate: null,
  listOpen: null,
}

export { TextSuggestion }
