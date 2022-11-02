'use strict'

// ******************************** 队伍窗口 ********************************

const Team = {
  // properties
  list: $('#team-list'),
  data: null,
  maximum: null,
  changed: false,
  // methods
  initialize: null,
  open: null,
  createId: null,
  createData: null,
  getItemById: null,
  unpackTeams: null,
  packTeams: null,
  // events
  windowClose: null,
  windowClosed: null,
  listKeydown: null,
  listPointerdown: null,
  listSelect: null,
  listChange: null,
  listPopup: null,
  confirm: null,
}

export { Team }
