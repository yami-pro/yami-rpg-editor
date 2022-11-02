'use strict'

// ******************************** 自定义指令窗口 ********************************

const CustomCommand = {
  // properties
  list: $('#command-list'),
  overviewPane: $('#command-overview-detail').hide(),
  overview: $('#command-overview'),
  settingsPane: $('#command-settings-detail').hide(),
  data: null,
  meta: null,
  symbol: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  load: null,
  unload: null,
  loadOverview: null,
  createData: null,
  getItemById: null,
  // events
  windowClose: null,
  windowClosed: null,
  pointerdown: null,
  scriptChange: null,
  listKeydown: null,
  listSelect: null,
  listUnselect: null,
  listChange: null,
  listPopup: null,
  listOpen: null,
  paramInput: null,
  confirm: null,
  apply: null,
}

export { CustomCommand }
