'use strict'

// ******************************** 指令提示框 ********************************

const CommandSuggestion = {
  // properties
  widget: $('#command-widget'),
  searcher: $('#command-searcher'),
  list: $('#command-suggestions'),
  data: null,
  // methods
  initialize: null,
  open: null,
  select: null,
  // events
  windowLocalize: null,
  windowClose: null,
  pointerdown: null,
  searcherKeydown: null,
  searcherInput: null,
  listKeydown: null,
  listPointerdown: null,
  listUpdate: null,
  listOpen: null,
}
export { CommandSuggestion }
