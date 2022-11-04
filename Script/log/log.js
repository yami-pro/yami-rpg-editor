'use strict'

// ******************************** 日志窗口 ********************************

const Log = {
  // properties
  data: [],
  devmode: false,
  beep: false,
  beepdate: 0,
  // methods
  initialize: null,
  throw: null,
  error: null,
  update: null,
  message: null,
  // events
  windowOpen: null,
  windowClosed: null,
  catchError: null,
}

export { Log }
