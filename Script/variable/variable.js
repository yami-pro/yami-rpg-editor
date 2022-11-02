'use strict'

// ******************************** 变量窗口 ********************************

const Variable = {
  // properties
  list: $('#variable-list'),
  panel: $('#variable-properties-flex').hide(),
  manager: $('#variable-value-manager'),
  searcher: $('#variable-searcher'),
  inputs: {
    name: $('#variable-name'),
    sort: $('#variable-sort'),
    type: $('#variable-type'),
    value: $('#variable-value-box'),
    boolean: $('#variable-value-boolean'),
    number: $('#variable-value-number'),
    string: $('#variable-value-string'),
    note: $('#variable-note'),
  },
  target: null,
  data: null,
  idList: null,
  history: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  undo: null,
  redo: null,
  createId: null,
  getVariableById: null,
  openPropertyPanel: null,
  closePropertyPanel: null,
  unpackVariables: null,
  packVariables: null,
  saveHistory: null,
  // events
  windowClose: null,
  windowClosed: null,
  keydown: null,
  listKeydown: null,
  listPointerdown: null,
  listSelect: null,
  listRecord: null,
  listPopup: null,
  listOpen: null,
  nameInput: null,
  sortWrite: null,
  sortInput: null,
  typeWrite: null,
  typeInput: null,
  valueInput: null,
  noteInput: null,
  panelKeydown: null,
  searcherInput: null,
  confirm: null,
  apply: null,
}

export { Variable }
