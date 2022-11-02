'use strict'

// ******************************** 音频管理器 ********************************

const AudioManager = {
  // properties
  context: null,
  player: null,
  analyser: null,
  waveforms: {},
  // methods
  initialize: null,
  getWaveform: null,
  close: null,
}

export { AudioManager }
