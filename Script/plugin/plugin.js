'use strict'

// ******************************** 插件窗口 ********************************

const PluginManager = {
  // properties
  list: $('#plugin-list'),
  overviewPane: $('#plugin-overview-detail').hide(),
  overview: $('#plugin-overview'),
  parameterPane: $('#plugin-parameter-pane').hide(),
  data: null,
  meta: null,
  symbol: null,
  detailed: false,
  changed: false,
  // methods
  initialize: null,
  open: null,
  load: null,
  unload: null,
  loadOverview: null,
  createOverview: null,
  createData: null,
  getItemById: null,
  switchOverviewMode: null,
  parseMeta: null,
  reconstruct: null,
  saveToProject: null,
  loadFromProject: null,
  // events
  windowClose: null,
  windowClosed: null,
  keydown: null,
  pointerdown: null,
  scriptChange: null,
  listKeydown: null,
  listSelect: null,
  listUnselect: null,
  listChange: null,
  listPopup: null,
  listOpen: null,
  overviewPointerdown: null,
  parameterPaneUpdate: null,
  confirm: null,
  apply: null,
}

export { PluginManager }
