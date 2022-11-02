'use strict'

// ******************************** 枚举窗口 ********************************

const Enum = {
  // properties
  list: $('#enum-list'),
  panel: $('#enum-properties-flex').hide(),
  searcher: $('#enum-searcher'),
  inputs: {
    name: $('#enum-name'),
    value: $('#enum-value'),
    note: $('#enum-note'),
  },
  mode: null,
  target: null,
  data: null,
  idList: null,
  settings: null,
  settingKeys: null,
  history: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  undo: null,
  redo: null,
  createId: null,
  getItemById: null,
  setFolderGroup: null,
  getEnumGroup: null,
  getString: null,
  getGroupString: null,
  getDefStringId: null,
  getStringItems: null,
  getMergedItems: null,
  openPropertyPanel: null,
  closePropertyPanel: null,
  unpackEnumeration: null,
  packEnumeration: null,
  saveHistory: null,
  // events
  windowClose: null,
  windowClosed: null,
  keydown: null,
  listKeydown: null,
  listPointerdown: null,
  listDoubleclick: null,
  listSelect: null,
  listRecord: null,
  listOpen: null,
  listPopup: null,
  nameInput: null,
  valueInput: null,
  noteInput: null,
  panelKeydown: null,
  searcherInput: null,
  confirm: null,
  apply: null,
}

export { Enum }
