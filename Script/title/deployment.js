'use strict'

// ******************************** 部署项目窗口 ********************************

const Deployment = {
  // properties
  state: 'passed',
  timer: null,
  // methods
  initialize: null,
  open: null,
  check: null,
  readShellList: null,
  readFileList: null,
  copyFilesTo: null,
  // events
  folderBeforeinput: null,
  folderInput: null,
  locationInput: null,
  chooseClick: null,
  confirm: null,
}

export { Deployment }
